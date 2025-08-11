import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { 
  ListToolsRequestSchema, 
  CallToolRequestSchema,
  ErrorCode,
  McpError 
} from '@modelcontextprotocol/sdk/types.js';
import winston from 'winston';
import dotenv from 'dotenv';
import Joi from 'joi';
import { glob } from 'glob';
import fs from 'fs/promises';
import path from 'path';
import matter from 'gray-matter';
import NodeCache from 'node-cache';
import { v4 as uuidv4 } from 'uuid';
import PQueue from 'p-queue';
import { EventEmitter } from 'eventemitter3';

// Load environment variables
dotenv.config();

// Configure logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.simple()
    }),
    new winston.transports.File({ 
      filename: 'divine-assembly-error.log', 
      level: 'error' 
    }),
    new winston.transports.File({ 
      filename: 'divine-assembly.log' 
    })
  ]
});

// Expert agent interface
interface ExpertAgent {
  id: string;
  name: string;
  role: string;
  department: string;
  competencies: string[];
  description: string;
  filepath: string;
  content: string;
  expertise: string[];
  responsibilities: string[];
  seniority: string;
  tools: string[];
}

// Summon request interface
interface SummonRequest {
  expert_name: string;
  task_prompt: string;
  context?: any;
  priority?: 'low' | 'normal' | 'high' | 'critical';
  timeout?: number;
}

// Expert session interface
interface ExpertSession {
  id: string;
  expertName: string;
  taskPrompt: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  result?: any;
  error?: string;
  startTime: Date;
  endTime?: Date;
  context?: any;
}

// Input validation schemas
const schemas = {
  summonExpert: Joi.object({
    expert_name: Joi.string().required(),
    task_prompt: Joi.string().required(),
    context: Joi.object().optional(),
    priority: Joi.string().valid('low', 'normal', 'high', 'critical').default('normal'),
    timeout: Joi.number().min(1000).max(300000).default(60000)
  }),
  listExperts: Joi.object({
    department: Joi.string().optional(),
    competency: Joi.string().optional(),
    search: Joi.string().optional()
  }),
  getExpertInfo: Joi.object({
    expert_name: Joi.string().required()
  }),
  orchestrateExperts: Joi.object({
    experts: Joi.array().items(Joi.object({
      name: Joi.string().required(),
      task: Joi.string().required(),
      dependencies: Joi.array().items(Joi.string()).optional()
    })).required(),
    parallel: Joi.boolean().default(false),
    context: Joi.object().optional()
  }),
  getSessionStatus: Joi.object({
    session_id: Joi.string().uuid().required()
  })
};

class DivineAssemblyManager {
  private server: Server;
  private expertRegistry: Map<string, ExpertAgent>;
  private sessions: Map<string, ExpertSession>;
  private cache: NodeCache;
  private queue: PQueue;
  private eventBus: EventEmitter;
  private assemblyPath: string;

  constructor() {
    this.server = new Server(
      {
        name: 'divine-assembly-manager',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    // Initialize components
    this.expertRegistry = new Map();
    this.sessions = new Map();
    this.cache = new NodeCache({ stdTTL: 1800, checkperiod: 300 });
    this.queue = new PQueue({ concurrency: 5 });
    this.eventBus = new EventEmitter();
    this.assemblyPath = process.env.DIVINE_ASSEMBLY_PATH || './.claude/experts';

    // Load expert agents
    this.loadExperts();

    // Setup tool handlers
    this.setupToolHandlers();

    // Setup event handlers
    this.setupEventHandlers();
  }

  private async loadExperts() {
    try {
      logger.info(`Loading experts from ${this.assemblyPath}`);
      
      // Find all .md files in the divine_assembly directory
      const files = await glob(`${this.assemblyPath}/**/*.md`);
      
      for (const file of files) {
        try {
          const content = await fs.readFile(file, 'utf-8');
          const parsed = matter(content);
          
          // Extract metadata from frontmatter
          const name = path.basename(file, '.md').replace(/-/g, '_');
          const expert: ExpertAgent = {
            id: uuidv4(),
            name: name,
            role: parsed.data.role || name,
            department: parsed.data.department || this.inferDepartment(file),
            competencies: parsed.data.competencies || [],
            description: parsed.data.description || '',
            filepath: file,
            content: parsed.content,
            expertise: parsed.data.expertise || parsed.data.competencies || [],
            responsibilities: parsed.data.responsibilities || [],
            seniority: parsed.data.seniority || 'mid',
            tools: parsed.data.tools || []
          };
          
          this.expertRegistry.set(name, expert);
          logger.info(`Loaded expert: ${name} (${expert.department})`);
        } catch (error) {
          logger.error(`Failed to load expert from ${file}:`, error);
        }
      }
      
      logger.info(`Loaded ${this.expertRegistry.size} experts`);
    } catch (error) {
      logger.error('Failed to load expert agents:', error);
    }
  }

  private inferDepartment(filepath: string): string {
    // Infer department from directory structure
    const parts = filepath.split(path.sep);
    const departments = ['engineering', 'product', 'data_science', 'management', 'specialized'];
    
    for (const dept of departments) {
      if (parts.some(part => part.includes(dept))) {
        return dept;
      }
    }
    
    return 'general';
  }

  private setupToolHandlers() {
    // Register Divine Assembly tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: 'summon_expert',
          description: 'Summons a specialized expert from the Divine Assembly to perform a task',
          inputSchema: {
            type: 'object',
            properties: {
              expert_name: { 
                type: 'string', 
                description: 'Name of the expert to summon (e.g., senior_software_engineer)' 
              },
              task_prompt: { 
                type: 'string', 
                description: 'Detailed task description and requirements for the expert' 
              },
              context: { 
                type: 'object', 
                description: 'Optional context to pass to the expert' 
              },
              priority: { 
                type: 'string', 
                enum: ['low', 'normal', 'high', 'critical'],
                description: 'Task priority level',
                default: 'normal'
              },
              timeout: {
                type: 'number',
                description: 'Timeout in milliseconds (default: 60000)',
                default: 60000
              }
            },
            required: ['expert_name', 'task_prompt']
          }
        },
        {
          name: 'list_experts',
          description: 'Lists available experts in the Divine Assembly',
          inputSchema: {
            type: 'object',
            properties: {
              department: { 
                type: 'string', 
                description: 'Filter by department (engineering, product, etc.)' 
              },
              competency: { 
                type: 'string', 
                description: 'Filter by specific competency' 
              },
              search: { 
                type: 'string', 
                description: 'Search term for expert names or descriptions' 
              }
            }
          }
        },
        {
          name: 'get_expert_info',
          description: 'Get detailed information about a specific expert',
          inputSchema: {
            type: 'object',
            properties: {
              expert_name: { 
                type: 'string', 
                description: 'Name of the expert' 
              }
            },
            required: ['expert_name']
          }
        },
        {
          name: 'orchestrate_experts',
          description: 'Orchestrate multiple experts to work on related tasks',
          inputSchema: {
            type: 'object',
            properties: {
              experts: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    name: { type: 'string' },
                    task: { type: 'string' },
                    dependencies: { 
                      type: 'array', 
                      items: { type: 'string' } 
                    }
                  },
                  required: ['name', 'task']
                },
                description: 'List of experts and their tasks'
              },
              parallel: {
                type: 'boolean',
                description: 'Execute tasks in parallel where possible',
                default: false
              },
              context: {
                type: 'object',
                description: 'Shared context for all experts'
              }
            },
            required: ['experts']
          }
        },
        {
          name: 'get_session_status',
          description: 'Get the status of an expert summon session',
          inputSchema: {
            type: 'object',
            properties: {
              session_id: {
                type: 'string',
                description: 'UUID of the session'
              }
            },
            required: ['session_id']
          }
        }
      ]
    }));

    // Handle tool execution
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;
      
      try {
        // Validate inputs
        const validatedArgs = await this.validateInput(name, args);
        
        switch (name) {
          case 'summon_expert':
            return await this.handleSummonExpert(validatedArgs);
          case 'list_experts':
            return await this.handleListExperts(validatedArgs);
          case 'get_expert_info':
            return await this.handleGetExpertInfo(validatedArgs);
          case 'orchestrate_experts':
            return await this.handleOrchestrateExperts(validatedArgs);
          case 'get_session_status':
            return await this.handleGetSessionStatus(validatedArgs);
          default:
            throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${name}`);
        }
      } catch (error: any) {
        logger.error(`Error executing ${name}:`, error);
        return {
          content: [{
            type: 'text',
            text: JSON.stringify({
              error: true,
              message: error.message || 'An unexpected error occurred',
              tool: name
            })
          }]
        };
      }
    });
  }

  private async validateInput(toolName: string, args: any): Promise<any> {
    const schemaMap: Record<string, Joi.Schema> = {
      'summon_expert': schemas.summonExpert,
      'list_experts': schemas.listExperts,
      'get_expert_info': schemas.getExpertInfo,
      'orchestrate_experts': schemas.orchestrateExperts,
      'get_session_status': schemas.getSessionStatus
    };

    const schema = schemaMap[toolName];
    if (!schema) {
      throw new Error(`No validation schema for tool: ${toolName}`);
    }

    const { error, value } = schema.validate(args);
    if (error) {
      throw new Error(`Validation error: ${error.details?.[0]?.message || error.message}`);
    }

    return value;
  }

  private async handleSummonExpert(args: SummonRequest) {
    const { expert_name, task_prompt, context, priority, timeout } = args;
    
    // Check if expert exists
    const expert = this.expertRegistry.get(expert_name);
    if (!expert) {
      throw new Error(`Expert not found: ${expert_name}`);
    }

    // Create session
    const session: ExpertSession = {
      id: uuidv4(),
      expertName: expert_name,
      taskPrompt: task_prompt,
      status: 'pending',
      startTime: new Date(),
      context
    };
    
    this.sessions.set(session.id, session);
    
    // Add to queue based on priority
    const queuePriority = this.getPriorityValue(priority || 'normal');
    
    this.queue.add(
      async () => {
        try {
          // Update session status
          session.status = 'in_progress';
          this.eventBus.emit('session:started', session);
          
          // Simulate expert execution (in real implementation, this would call Claude)
          const result = await this.executeExpert(expert, task_prompt, context, timeout);
          
          // Update session with result
          session.status = 'completed';
          session.result = result;
          session.endTime = new Date();
          
          this.eventBus.emit('session:completed', session);
          
          return result;
        } catch (error: any) {
          session.status = 'failed';
          session.error = error.message;
          session.endTime = new Date();
          
          this.eventBus.emit('session:failed', session);
          
          throw error;
        }
      },
      { priority: queuePriority }
    );

    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          session_id: session.id,
          expert: expert_name,
          status: 'queued',
          message: `Expert ${expert_name} has been summoned and will begin work shortly`,
          estimated_completion: new Date(Date.now() + (timeout || 60000)).toISOString()
        })
      }]
    };
  }

  private async handleListExperts(args: any) {
    const { department, competency, search } = args;
    
    let experts = Array.from(this.expertRegistry.values());
    
    // Apply filters
    if (department) {
      experts = experts.filter(e => e.department === department);
    }
    
    if (competency) {
      experts = experts.filter(e => 
        e.competencies.some(c => c.toLowerCase().includes(competency.toLowerCase()))
      );
    }
    
    if (search) {
      const searchLower = search.toLowerCase();
      experts = experts.filter(e => 
        e.name.toLowerCase().includes(searchLower) ||
        e.role.toLowerCase().includes(searchLower) ||
        e.description.toLowerCase().includes(searchLower)
      );
    }
    
    // Group by department
    const grouped = experts.reduce((acc, expert) => {
      if (!acc[expert.department]) {
        acc[expert.department] = [];
      }
      acc[expert.department]!.push({
        name: expert.name,
        role: expert.role,
        competencies: expert.competencies.slice(0, 3) // Show top 3
      });
      return acc;
    }, {} as Record<string, any[]>);
    
    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          total: experts.length,
          departments: Object.keys(grouped),
          experts: grouped
        }, null, 2)
      }]
    };
  }

  private async handleGetExpertInfo(args: any) {
    const { expert_name } = args;
    
    const expert = this.expertRegistry.get(expert_name);
    if (!expert) {
      throw new Error(`Expert not found: ${expert_name}`);
    }
    
    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          name: expert.name,
          role: expert.role,
          department: expert.department,
          competencies: expert.competencies,
          description: expert.description,
          availability: 'ready',
          recent_sessions: this.getRecentSessions(expert_name, 5)
        }, null, 2)
      }]
    };
  }

  private async handleOrchestrateExperts(args: any) {
    const { experts, parallel, context } = args;
    
    // Create orchestration plan
    const plan = this.createOrchestrationPlan(experts);
    
    // Execute based on strategy
    if (parallel) {
      return await this.executeParallelOrchestration(plan, context);
    } else {
      return await this.executeSequentialOrchestration(plan, context);
    }
  }

  private async handleGetSessionStatus(args: any) {
    const { session_id } = args;
    
    const session = this.sessions.get(session_id);
    if (!session) {
      throw new Error(`Session not found: ${session_id}`);
    }
    
    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          id: session.id,
          expert: session.expertName,
          status: session.status,
          startTime: session.startTime,
          endTime: session.endTime,
          duration: session.endTime ? 
            (session.endTime.getTime() - session.startTime.getTime()) / 1000 : null,
          result: session.result,
          error: session.error
        }, null, 2)
      }]
    };
  }

  private async executeExpert(
    expert: ExpertAgent, 
    taskPrompt: string, 
    context: any, 
    _timeout?: number
  ): Promise<any> {
    // Construct a comprehensive prompt combining expert role and task
    // const systemPrompt = this.constructExpertSystemPrompt(expert);
    // const userPrompt = this.constructTaskPrompt(taskPrompt, context);
    
    try {
      // Since this is an MCP server, we return structured guidance
      // The actual Claude API call would be made by the client
      const analysis = this.analyzeTaskRequirements(expert, taskPrompt, context);
      const recommendations = this.generateExpertRecommendations(expert, taskPrompt, context);
      const implementation = this.generateImplementationPlan(expert, taskPrompt, context);
      
      return {
        expert: expert.name,
        role: expert.role,
        department: expert.department,
        task: taskPrompt,
        analysis: analysis,
        recommendations: recommendations,
        implementation: implementation,
        technicalDetails: this.generateTechnicalDetails(expert, taskPrompt, context),
        bestPractices: this.extractBestPractices(expert),
        risks: this.identifyRisks(expert, taskPrompt),
        dependencies: this.identifyDependencies(taskPrompt, context),
        estimatedEffort: this.estimateEffort(taskPrompt),
        confidence: this.calculateConfidence(expert, taskPrompt),
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      logger.error(`Expert execution failed for ${expert.name}:`, error);
      throw new Error(`Failed to execute expert ${expert.name}: ${error}`);
    }
  }

  // private constructExpertSystemPrompt(expert: ExpertAgent): string {
  //   return `You are ${expert.role} with expertise in ${expert.expertise.join(', ')}. 
  // Your responsibilities include: ${expert.responsibilities.join(', ')}.
  // Department: ${expert.department}
  // Seniority: ${expert.seniority}
  // Tools available: ${expert.tools.join(', ')}`;
  // }

  // private constructTaskPrompt(taskPrompt: string, context: any): string {
  //   let prompt = taskPrompt;
  //   if (context) {
  //     if (context.projectType) prompt += `\nProject Type: ${context.projectType}`;
  //     if (context.techStack) prompt += `\nTech Stack: ${context.techStack.join(', ')}`;
  //     if (context.constraints) prompt += `\nConstraints: ${context.constraints.join(', ')}`;
  //     if (context.requirements) prompt += `\nRequirements: ${context.requirements.join(', ')}`;
  //   }
  //   return prompt;
  // }

  private analyzeTaskRequirements(expert: ExpertAgent, taskPrompt: string, context: any): string {
    const analysis = [];
    
    // Analyze based on expert's perspective
    analysis.push(`As ${expert.role}, I analyze this task with focus on ${expert.expertise[0]}.`);
    
    // Break down the task
    if (taskPrompt.includes('implement')) {
      analysis.push('This is an implementation task requiring hands-on development.');
    } else if (taskPrompt.includes('design')) {
      analysis.push('This is a design task requiring architectural planning.');
    } else if (taskPrompt.includes('review')) {
      analysis.push('This is a review task requiring quality assessment.');
    } else if (taskPrompt.includes('optimize')) {
      analysis.push('This is an optimization task requiring performance analysis.');
    }
    
    // Add context-specific analysis
    if (context?.projectType) {
      analysis.push(`For a ${context.projectType} project, special considerations apply.`);
    }
    
    // Add expertise-specific insights
    expert.expertise.forEach((skill: string) => {
      if (taskPrompt.toLowerCase().includes(skill.toLowerCase())) {
        analysis.push(`This task directly leverages my ${skill} expertise.`);
      }
    });
    
    return analysis.join(' ');
  }

  private generateExpertRecommendations(expert: ExpertAgent, taskPrompt: string, _context: any): string[] {
    const recommendations = [];
    
    // Generate role-specific recommendations
    if (expert.seniority === 'senior' || expert.seniority === 'principal') {
      recommendations.push('Start with a comprehensive architectural review');
      recommendations.push('Consider long-term maintainability and scalability');
    }
    
    // Department-specific recommendations
    switch (expert.department) {
      case 'engineering':
        recommendations.push('Follow SOLID principles and design patterns');
        recommendations.push('Implement comprehensive testing strategy');
        recommendations.push('Ensure code is well-documented and maintainable');
        break;
      case 'product':
        recommendations.push('Validate requirements with stakeholders');
        recommendations.push('Consider user experience and accessibility');
        recommendations.push('Define clear success metrics');
        break;
      case 'data_science':
        recommendations.push('Ensure data quality and preprocessing');
        recommendations.push('Implement proper model validation');
        recommendations.push('Consider scalability of data pipeline');
        break;
    }
    
    // Task-specific recommendations
    if (taskPrompt.includes('API')) {
      recommendations.push('Design RESTful endpoints following OpenAPI spec');
      recommendations.push('Implement proper authentication and rate limiting');
    }
    
    if (taskPrompt.includes('database')) {
      recommendations.push('Optimize queries and add appropriate indexes');
      recommendations.push('Implement proper data validation and constraints');
    }
    
    return recommendations;
  }

  private generateImplementationPlan(expert: ExpertAgent, taskPrompt: string, context: any): any {
    const plan: {
      phases: Array<{phase: number; name: string; duration: string}>;
      milestones: Array<{name: string; criteria: string}>;
      deliverables: string[];
    } = {
      phases: [],
      milestones: [],
      deliverables: []
    };
    
    // Generate phases based on task complexity
    if (taskPrompt.length > 100 || context?.requirements?.length > 3) {
      plan.phases = [
        { phase: 1, name: 'Planning & Design', duration: '2-3 days' },
        { phase: 2, name: 'Implementation', duration: '5-7 days' },
        { phase: 3, name: 'Testing & Validation', duration: '2-3 days' },
        { phase: 4, name: 'Deployment & Documentation', duration: '1-2 days' }
      ];
    } else {
      plan.phases = [
        { phase: 1, name: 'Implementation', duration: '2-3 days' },
        { phase: 2, name: 'Testing & Documentation', duration: '1 day' }
      ];
    }
    
    // Define milestones
    plan.milestones = plan.phases.map(phase => ({
      name: `Complete ${phase.name}`,
      criteria: `All ${phase.name.toLowerCase()} tasks completed and reviewed`
    }));
    
    // Define deliverables based on expert type
    if (expert.department === 'engineering') {
      plan.deliverables.push(
        'Source code implementation',
        'Unit and integration tests',
        'Technical documentation',
        'Deployment configuration'
      );
    } else if (expert.department === 'product') {
      plan.deliverables.push(
        'Product requirements document',
        'User stories and acceptance criteria',
        'Wireframes or mockups',
        'Success metrics definition'
      );
    }
    
    return plan;
  }

  private generateTechnicalDetails(expert: ExpertAgent, taskPrompt: string, context: any): any {
    return {
      architecture: this.suggestArchitecture(taskPrompt, context),
      technologies: this.suggestTechnologies(expert, taskPrompt, context),
      patterns: this.suggestPatterns(taskPrompt),
      security: this.identifySecurityConsiderations(taskPrompt),
      performance: this.identifyPerformanceConsiderations(taskPrompt)
    };
  }

  private suggestArchitecture(taskPrompt: string, context: any): string {
    if (taskPrompt.includes('microservice')) return 'Microservices architecture with API gateway';
    if (taskPrompt.includes('real-time')) return 'Event-driven architecture with WebSockets';
    if (taskPrompt.includes('batch')) return 'Batch processing with queue-based architecture';
    if (context?.projectType === 'web') return 'Three-tier architecture (presentation, business, data)';
    return 'Modular monolithic architecture';
  }

  private suggestTechnologies(_expert: ExpertAgent, taskPrompt: string, context: any): string[] {
    const technologies = [];
    
    // Add from context if available
    if (context?.techStack) {
      technologies.push(...context.techStack);
    }
    
    // Add based on task requirements
    if (taskPrompt.includes('frontend')) {
      technologies.push('React/Vue/Angular', 'TypeScript', 'Tailwind CSS');
    }
    if (taskPrompt.includes('backend')) {
      technologies.push('Node.js/Python/Go', 'PostgreSQL/MongoDB', 'Redis');
    }
    if (taskPrompt.includes('AI') || taskPrompt.includes('ML')) {
      technologies.push('Python', 'TensorFlow/PyTorch', 'Jupyter');
    }
    
    return [...new Set(technologies)]; // Remove duplicates
  }

  private suggestPatterns(taskPrompt: string): string[] {
    const patterns = [];
    
    if (taskPrompt.includes('API')) patterns.push('Repository pattern', 'DTO pattern');
    if (taskPrompt.includes('frontend')) patterns.push('Component pattern', 'State management');
    if (taskPrompt.includes('microservice')) patterns.push('Circuit breaker', 'Service mesh');
    if (taskPrompt.includes('database')) patterns.push('Unit of Work', 'CQRS');
    
    return patterns.length > 0 ? patterns : ['MVC', 'Dependency Injection'];
  }

  private extractBestPractices(expert: ExpertAgent): string[] {
    const practices = [
      'Follow coding standards and style guides',
      'Write self-documenting code',
      'Implement error handling and logging'
    ];
    
    if (expert.seniority === 'senior' || expert.seniority === 'principal') {
      practices.push(
        'Design for scalability from the start',
        'Consider non-functional requirements',
        'Plan for monitoring and observability'
      );
    }
    
    if (expert.department === 'engineering') {
      practices.push(
        'Write comprehensive tests (unit, integration, e2e)',
        'Use version control effectively',
        'Automate repetitive tasks'
      );
    }
    
    return practices;
  }

  private identifyRisks(_expert: ExpertAgent, taskPrompt: string): string[] {
    const risks = [];
    
    // Technical risks
    if (taskPrompt.includes('migration')) {
      risks.push('Data loss during migration');
      risks.push('Downtime during transition');
    }
    
    if (taskPrompt.includes('integration')) {
      risks.push('API compatibility issues');
      risks.push('Performance degradation');
    }
    
    if (taskPrompt.includes('security')) {
      risks.push('Potential security vulnerabilities');
      risks.push('Compliance requirements');
    }
    
    // General risks
    risks.push('Scope creep without proper requirements');
    risks.push('Technical debt if rushed');
    
    return risks;
  }

  private identifyDependencies(taskPrompt: string, context: any): string[] {
    const dependencies = [];
    
    if (context?.dependencies) {
      dependencies.push(...context.dependencies);
    }
    
    // Identify from task
    if (taskPrompt.includes('API')) {
      dependencies.push('API documentation', 'Authentication service');
    }
    
    if (taskPrompt.includes('database')) {
      dependencies.push('Database schema', 'Migration tools');
    }
    
    if (taskPrompt.includes('frontend')) {
      dependencies.push('Design system', 'API endpoints');
    }
    
    return dependencies;
  }

  private identifySecurityConsiderations(taskPrompt: string): string[] {
    const security = [];
    
    if (taskPrompt.includes('API') || taskPrompt.includes('endpoint')) {
      security.push('Implement authentication and authorization');
      security.push('Validate and sanitize all inputs');
      security.push('Use HTTPS for all communications');
    }
    
    if (taskPrompt.includes('database') || taskPrompt.includes('data')) {
      security.push('Encrypt sensitive data at rest and in transit');
      security.push('Implement proper access controls');
      security.push('Regular security audits and updates');
    }
    
    if (taskPrompt.includes('user') || taskPrompt.includes('auth')) {
      security.push('Implement secure password policies');
      security.push('Use secure session management');
      security.push('Implement rate limiting');
    }
    
    return security.length > 0 ? security : ['Follow OWASP security guidelines'];
  }

  private identifyPerformanceConsiderations(taskPrompt: string): string[] {
    const performance = [];
    
    if (taskPrompt.includes('API')) {
      performance.push('Implement caching strategies');
      performance.push('Optimize database queries');
      performance.push('Use pagination for large datasets');
    }
    
    if (taskPrompt.includes('frontend')) {
      performance.push('Lazy loading for resources');
      performance.push('Code splitting and bundling');
      performance.push('Image optimization');
    }
    
    if (taskPrompt.includes('database')) {
      performance.push('Proper indexing strategy');
      performance.push('Query optimization');
      performance.push('Connection pooling');
    }
    
    return performance.length > 0 ? performance : ['Monitor and optimize bottlenecks'];
  }

  private estimateEffort(taskPrompt: string): string {
    const complexity = taskPrompt.length;
    
    if (complexity < 50) return 'Small (1-2 days)';
    if (complexity < 150) return 'Medium (3-5 days)';
    if (complexity < 300) return 'Large (1-2 weeks)';
    return 'Extra Large (2-4 weeks)';
  }

  private calculateConfidence(expert: ExpertAgent, taskPrompt: string): number {
    let confidence = 0.7; // Base confidence
    
    // Increase confidence based on expertise match
    expert.expertise.forEach((skill: string) => {
      if (taskPrompt.toLowerCase().includes(skill.toLowerCase())) {
        confidence += 0.05;
      }
    });
    
    // Adjust based on seniority
    if (expert.seniority === 'principal') confidence += 0.1;
    if (expert.seniority === 'senior') confidence += 0.05;
    
    // Cap at 0.95
    return Math.min(confidence, 0.95);
  }

  private createOrchestrationPlan(experts: any[]): any {
    // Create dependency graph and execution plan
    const plan: {
      stages: any[][];
      dependencies: Map<any, any>;
    } = {
      stages: [],
      dependencies: new Map()
    };
    
    // Group experts by dependencies
    const noDeps = experts.filter(e => !e.dependencies || e.dependencies.length === 0);
    const withDeps = experts.filter(e => e.dependencies && e.dependencies.length > 0);
    
    // Stage 1: No dependencies
    if (noDeps.length > 0) {
      plan.stages.push(noDeps);
    }
    
    // Additional stages based on dependencies
    // (Simplified - in real implementation would do topological sort)
    if (withDeps.length > 0) {
      plan.stages.push(withDeps);
    }
    
    return plan;
  }

  private async executeParallelOrchestration(plan: any, context: any) {
    const results = [];
    
    for (const stage of plan.stages) {
      const stagePromises = stage.map((expert: any) => 
        this.handleSummonExpert({
          expert_name: expert.name,
          task_prompt: expert.task,
          context,
          priority: 'high'
        })
      );
      
      const stageResults = await Promise.all(stagePromises);
      results.push(...stageResults);
    }
    
    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          orchestration: 'parallel',
          stages: plan.stages.length,
          experts: results.length,
          results
        }, null, 2)
      }]
    };
  }

  private async executeSequentialOrchestration(plan: any, context: any) {
    const results = [];
    let accumulatedContext = { ...context };
    
    for (const stage of plan.stages) {
      for (const expert of stage) {
        const result = await this.handleSummonExpert({
          expert_name: expert.name,
          task_prompt: expert.task,
          context: accumulatedContext,
          priority: 'high'
        });
        
        results.push(result);
        
        // Accumulate context from each expert's output
        if (result.content && result.content[0]) {
          const parsed = JSON.parse(result.content[0].text);
          accumulatedContext = { ...accumulatedContext, ...parsed };
        }
      }
    }
    
    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          orchestration: 'sequential',
          stages: plan.stages.length,
          experts: results.length,
          results
        }, null, 2)
      }]
    };
  }

  private getPriorityValue(priority: string): number {
    const priorities = {
      'critical': 0,
      'high': 1,
      'normal': 2,
      'low': 3
    };
    return priorities[priority as keyof typeof priorities] || 2;
  }

  private getRecentSessions(expertName: string, limit: number): any[] {
    const expertSessions = Array.from(this.sessions.values())
      .filter(s => s.expertName === expertName && s.status === 'completed')
      .sort((a, b) => b.startTime.getTime() - a.startTime.getTime())
      .slice(0, limit)
      .map(s => ({
        id: s.id,
        task: s.taskPrompt.substring(0, 50) + '...',
        completedAt: s.endTime
      }));
    
    return expertSessions;
  }

  private setupEventHandlers() {
    this.eventBus.on('session:started', (session: ExpertSession) => {
      logger.info(`Session ${session.id} started for expert ${session.expertName}`);
    });
    
    this.eventBus.on('session:completed', (session: ExpertSession) => {
      logger.info(`Session ${session.id} completed successfully`);
      // Cache successful results
      const cacheKey = `${session.expertName}:${session.taskPrompt.substring(0, 50)}`;
      this.cache.set(cacheKey, session.result);
    });
    
    this.eventBus.on('session:failed', (session: ExpertSession) => {
      logger.error(`Session ${session.id} failed: ${session.error}`);
    });
  }

  async start() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    logger.info('Divine Assembly Manager MCP server running on stdio');
    logger.info(`Managing ${this.expertRegistry.size} expert agents`);
  }
}

// Start the server
const manager = new DivineAssemblyManager();
manager.start().catch(error => {
  logger.error('Failed to start Divine Assembly Manager:', error);
  process.exit(1);
});