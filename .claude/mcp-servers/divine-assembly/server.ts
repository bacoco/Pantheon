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
            content: parsed.content
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
      throw new Error(`Validation error: ${error.details[0].message}`);
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
      acc[expert.department].push({
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
    timeout?: number
  ): Promise<any> {
    // In a real implementation, this would:
    // 1. Construct a prompt combining expert role and task
    // 2. Call Claude API with the expert's persona
    // 3. Return the result
    
    // For now, return a simulated response
    return {
      expert: expert.name,
      task: taskPrompt,
      analysis: `As ${expert.role}, I would approach this task by...`,
      recommendations: [
        'Recommendation 1 based on expertise',
        'Recommendation 2 based on best practices',
        'Recommendation 3 based on experience'
      ],
      code: context?.includeCode ? '// Code implementation here' : null,
      confidence: 0.85,
      timestamp: new Date().toISOString()
    };
  }

  private createOrchestrationPlan(experts: any[]): any {
    // Create dependency graph and execution plan
    const plan = {
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