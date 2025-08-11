#!/usr/bin/env node

/**
 * Sacred Scrolls MCP Server
 * 
 * Manages context preservation through Sacred Scrolls - inspired by BMAD's story files.
 * Provides tools for creating, updating, retrieving, and transforming scrolls
 * between planning and execution phases.
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';
import * as fs from 'fs/promises';
import * as path from 'path';
import { createHash } from 'crypto';
import { XMLParser, XMLBuilder } from 'fast-xml-parser';
import NodeCache from 'node-cache';
import winston from 'winston';

// Configure logging
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'sacred-scrolls.log' }),
    new winston.transports.Console({ format: winston.format.simple() })
  ]
});

// Initialize cache (1 hour TTL)
const scrollCache = new NodeCache({ stdTTL: 3600 });

// Configuration
const CONFIG = {
  scrollsPath: process.env.SACRED_SCROLLS_PATH || './.pantheon/scrolls',
  maxScrollSize: 1048576, // 1MB max per scroll
  backupPath: process.env.SACRED_SCROLLS_BACKUP || './.pantheon/scrolls/backup',
  version: '1.0.0'
};

// XML Parser/Builder configuration
const xmlParser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
  textNodeName: '#text'
});

const xmlBuilder = new XMLBuilder({
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
  textNodeName: '#text',
  format: true,
  indentBy: '  '
});

// Types
interface SacredScroll {
  id: string;
  created: string;
  modified: string;
  phase: 'planning' | 'execution' | 'complete';
  metadata: {
    project: string;
    gods_invoked: string[];
    version: number;
  };
  planning_phase?: {
    requirements: any;
    architecture: any;
    decisions: any;
    scope: any;
  };
  execution_phase?: {
    stories: any;
    code: any;
    validations: any;
    documentation: any;
  };
  context_chain: Array<{
    timestamp: string;
    god: string;
    action: string;
    content: any;
  }>;
}

class SacredScrollsManager {
  private scrollsPath: string;
  private backupPath: string;

  constructor() {
    this.scrollsPath = CONFIG.scrollsPath;
    this.backupPath = CONFIG.backupPath;
  }

  async initialize(): Promise<void> {
    // Ensure directories exist
    await fs.mkdir(this.scrollsPath, { recursive: true });
    await fs.mkdir(this.backupPath, { recursive: true });
    logger.info('Sacred Scrolls Manager initialized');
  }

  /**
   * Create a new Sacred Scroll
   */
  async createScroll(project: string, phase: 'planning' | 'execution' = 'planning'): Promise<string> {
    const scrollId = this.generateScrollId(project);
    const timestamp = new Date().toISOString();
    
    const scroll: SacredScroll = {
      id: scrollId,
      created: timestamp,
      modified: timestamp,
      phase,
      metadata: {
        project,
        gods_invoked: [],
        version: 1
      },
      context_chain: [{
        timestamp,
        god: 'mnemosyne',
        action: 'create_scroll',
        content: { project, phase }
      }]
    };

    if (phase === 'planning') {
      scroll.planning_phase = {
        requirements: {},
        architecture: {},
        decisions: {},
        scope: {}
      };
    } else {
      scroll.execution_phase = {
        stories: {},
        code: {},
        validations: {},
        documentation: {}
      };
    }

    await this.saveScroll(scroll);
    logger.info(`Created Sacred Scroll: ${scrollId} for project: ${project}`);
    
    return scrollId;
  }

  /**
   * Update an existing scroll with new context
   */
  async updateScroll(
    scrollId: string, 
    god: string, 
    action: string, 
    content: any,
    section?: string
  ): Promise<void> {
    const scroll = await this.loadScroll(scrollId);
    
    if (!scroll) {
      throw new Error(`Scroll not found: ${scrollId}`);
    }

    // Update context chain
    scroll.context_chain.push({
      timestamp: new Date().toISOString(),
      god,
      action,
      content
    });

    // Update gods invoked
    if (!scroll.metadata.gods_invoked.includes(god)) {
      scroll.metadata.gods_invoked.push(god);
    }

    // Update specific section if provided
    if (section) {
      const [phase, subsection] = section.split('.');
      if (phase === 'planning' && scroll.planning_phase) {
        (scroll.planning_phase as any)[subsection] = content;
      } else if (phase === 'execution' && scroll.execution_phase) {
        (scroll.execution_phase as any)[subsection] = content;
      }
    }

    // Update metadata
    scroll.modified = new Date().toISOString();
    scroll.metadata.version++;

    await this.saveScroll(scroll);
    
    // Invalidate cache
    scrollCache.del(scrollId);
    
    logger.info(`Updated scroll ${scrollId} by ${god}: ${action}`);
  }

  /**
   * Transform a planning scroll into an execution scroll
   */
  async transformToExecution(scrollId: string): Promise<string> {
    const planningScroll = await this.loadScroll(scrollId);
    
    if (!planningScroll) {
      throw new Error(`Scroll not found: ${scrollId}`);
    }

    if (planningScroll.phase !== 'planning') {
      throw new Error(`Scroll ${scrollId} is not in planning phase`);
    }

    // Create new execution scroll
    const execScrollId = `${scrollId}-exec`;
    const timestamp = new Date().toISOString();
    
    const execScroll: SacredScroll = {
      id: execScrollId,
      created: timestamp,
      modified: timestamp,
      phase: 'execution',
      metadata: {
        project: planningScroll.metadata.project,
        gods_invoked: ['chronos', 'mnemosyne'],
        version: 1
      },
      execution_phase: {
        stories: this.generateStories(planningScroll.planning_phase),
        code: {},
        validations: {},
        documentation: {}
      },
      context_chain: [
        ...planningScroll.context_chain,
        {
          timestamp,
          god: 'chronos',
          action: 'phase_transition',
          content: {
            from: 'planning',
            to: 'execution',
            source_scroll: scrollId
          }
        }
      ]
    };

    await this.saveScroll(execScroll);
    logger.info(`Transformed scroll ${scrollId} to execution phase: ${execScrollId}`);
    
    return execScrollId;
  }

  /**
   * Retrieve a scroll by ID
   */
  async retrieveScroll(scrollId: string): Promise<SacredScroll | null> {
    // Check cache first
    const cached = scrollCache.get<SacredScroll>(scrollId);
    if (cached) {
      logger.debug(`Retrieved scroll ${scrollId} from cache`);
      return cached;
    }

    const scroll = await this.loadScroll(scrollId);
    if (scroll) {
      scrollCache.set(scrollId, scroll);
    }
    
    return scroll;
  }

  /**
   * List all scrolls for a project
   */
  async listScrolls(project?: string): Promise<Array<{id: string, project: string, phase: string, modified: string}>> {
    const files = await fs.readdir(this.scrollsPath);
    const scrolls = [];

    for (const file of files) {
      if (file.endsWith('.xml')) {
        const scrollId = file.replace('.xml', '');
        const scroll = await this.loadScroll(scrollId);
        
        if (scroll && (!project || scroll.metadata.project === project)) {
          scrolls.push({
            id: scroll.id,
            project: scroll.metadata.project,
            phase: scroll.phase,
            modified: scroll.modified
          });
        }
      }
    }

    return scrolls.sort((a, b) => 
      new Date(b.modified).getTime() - new Date(a.modified).getTime()
    );
  }

  /**
   * Validate a scroll's completeness for phase transition
   */
  async validateScrollForTransition(scrollId: string): Promise<{valid: boolean, missing: string[]}> {
    const scroll = await this.loadScroll(scrollId);
    
    if (!scroll) {
      return { valid: false, missing: ['scroll_not_found'] };
    }

    const missing: string[] = [];

    if (scroll.phase === 'planning' && scroll.planning_phase) {
      // Check planning phase completeness
      if (!scroll.planning_phase.requirements || Object.keys(scroll.planning_phase.requirements).length === 0) {
        missing.push('requirements');
      }
      if (!scroll.planning_phase.architecture || Object.keys(scroll.planning_phase.architecture).length === 0) {
        missing.push('architecture');
      }
      if (!scroll.planning_phase.decisions || Object.keys(scroll.planning_phase.decisions).length === 0) {
        missing.push('decisions');
      }
      if (!scroll.planning_phase.scope || Object.keys(scroll.planning_phase.scope).length === 0) {
        missing.push('scope');
      }
    }

    return {
      valid: missing.length === 0,
      missing
    };
  }

  /**
   * Archive a completed scroll
   */
  async archiveScroll(scrollId: string): Promise<void> {
    const scroll = await this.loadScroll(scrollId);
    
    if (!scroll) {
      throw new Error(`Scroll not found: ${scrollId}`);
    }

    // Update phase to complete
    scroll.phase = 'complete';
    scroll.modified = new Date().toISOString();

    // Save to backup location
    const backupFile = path.join(this.backupPath, `${scrollId}-${Date.now()}.xml`);
    const xmlContent = xmlBuilder.build({ 'sacred-scroll': scroll });
    await fs.writeFile(backupFile, xmlContent);

    // Update main scroll
    await this.saveScroll(scroll);
    
    logger.info(`Archived scroll: ${scrollId}`);
  }

  // Private helper methods
  private generateScrollId(project: string): string {
    const timestamp = Date.now();
    const hash = createHash('sha256')
      .update(`${project}-${timestamp}`)
      .digest('hex')
      .substring(0, 8);
    return `scroll-${hash}-${timestamp}`;
  }

  private async saveScroll(scroll: SacredScroll): Promise<void> {
    const filePath = path.join(this.scrollsPath, `${scroll.id}.xml`);
    const xmlContent = xmlBuilder.build({ 'sacred-scroll': scroll });
    await fs.writeFile(filePath, xmlContent);
  }

  private async loadScroll(scrollId: string): Promise<SacredScroll | null> {
    try {
      const filePath = path.join(this.scrollsPath, `${scrollId}.xml`);
      const xmlContent = await fs.readFile(filePath, 'utf-8');
      const parsed = xmlParser.parse(xmlContent);
      return parsed['sacred-scroll'] as SacredScroll;
    } catch (error) {
      logger.error(`Failed to load scroll ${scrollId}:`, error);
      return null;
    }
  }

  private generateStories(planningPhase: any): any {
    const stories: any = {};
    
    // Extract requirements and create stories for each major feature
    if (planningPhase.requirements) {
      const requirements = this.parseRequirements(planningPhase.requirements);
      
      requirements.forEach((req: any, index: number) => {
        const storyKey = this.generateStoryKey(req);
        stories[storyKey] = {
          id: `story-${index + 1}`,
          title: req.title || this.generateStoryTitle(req),
          priority: req.priority || this.determinePriority(req),
          context: {
            requirement: req,
            original_text: req.description || req.text || JSON.stringify(req)
          },
          architecture: this.extractRelevantArchitecture(planningPhase.architecture, req),
          decisions: this.extractRelevantDecisions(planningPhase.decisions, req),
          scope: this.extractRelevantScope(planningPhase.scope, req),
          implementation_guide: this.generateImplementationGuide(req, planningPhase),
          acceptance_criteria: this.generateAcceptanceCriteria(req),
          technical_notes: this.generateTechnicalNotes(req, planningPhase),
          dependencies: this.identifyDependencies(req, requirements),
          estimated_effort: this.estimateEffort(req)
        };
      });
    }
    
    // If no requirements parsed, create stories from architecture components
    if (Object.keys(stories).length === 0 && planningPhase.architecture) {
      const components = this.parseArchitectureComponents(planningPhase.architecture);
      
      components.forEach((comp: any, index: number) => {
        const storyKey = this.generateComponentKey(comp);
        stories[storyKey] = {
          id: `component-story-${index + 1}`,
          title: `Implement ${comp.name || comp.type || 'Component'}`,
          priority: comp.priority || 'medium',
          context: {
            component: comp,
            type: 'architecture-driven'
          },
          architecture: comp,
          decisions: planningPhase.decisions || {},
          scope: planningPhase.scope || {},
          implementation_guide: this.generateComponentImplementationGuide(comp),
          acceptance_criteria: this.generateComponentAcceptanceCriteria(comp),
          technical_notes: this.generateComponentTechnicalNotes(comp),
          dependencies: comp.dependencies || [],
          estimated_effort: this.estimateComponentEffort(comp)
        };
      });
    }
    
    // Add metadata story for tracking
    stories._metadata = {
      generated_at: new Date().toISOString(),
      total_stories: Object.keys(stories).length - 1,
      source: 'planning_phase_transformation',
      planning_summary: {
        has_requirements: !!planningPhase.requirements,
        has_architecture: !!planningPhase.architecture,
        has_decisions: !!planningPhase.decisions,
        has_scope: !!planningPhase.scope
      }
    };
    
    return stories;
  }
  
  private parseRequirements(requirements: any): any[] {
    if (Array.isArray(requirements)) {
      return requirements;
    }
    
    if (typeof requirements === 'object') {
      // Handle nested requirement objects
      const parsed: any[] = [];
      
      Object.keys(requirements).forEach(key => {
        const req = requirements[key];
        if (typeof req === 'object') {
          parsed.push({
            key,
            title: req.title || key,
            ...req
          });
        } else {
          parsed.push({
            key,
            title: key,
            description: req
          });
        }
      });
      
      return parsed;
    }
    
    // Handle string requirements
    if (typeof requirements === 'string') {
      const lines = requirements.split('\n').filter(line => line.trim());
      return lines.map((line, index) => ({
        key: `req-${index}`,
        title: line.substring(0, 50),
        description: line
      }));
    }
    
    return [];
  }
  
  private generateStoryKey(req: any): string {
    if (req.key) return req.key;
    if (req.id) return req.id;
    if (req.title) return req.title.toLowerCase().replace(/\s+/g, '_').substring(0, 30);
    return `story_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  }
  
  private generateStoryTitle(req: any): string {
    if (req.title) return req.title;
    if (req.name) return `Implement ${req.name}`;
    if (req.feature) return `${req.feature} Feature`;
    if (req.description) {
      const desc = req.description.toString();
      return desc.length > 50 ? desc.substring(0, 47) + '...' : desc;
    }
    return 'User Story';
  }
  
  private determinePriority(req: any): string {
    if (req.priority) return req.priority;
    
    const urgentKeywords = ['critical', 'urgent', 'immediate', 'blocker', 'security'];
    const highKeywords = ['important', 'core', 'essential', 'primary', 'main'];
    const lowKeywords = ['optional', 'nice-to-have', 'future', 'enhancement'];
    
    const text = JSON.stringify(req).toLowerCase();
    
    if (urgentKeywords.some(keyword => text.includes(keyword))) return 'critical';
    if (highKeywords.some(keyword => text.includes(keyword))) return 'high';
    if (lowKeywords.some(keyword => text.includes(keyword))) return 'low';
    
    return 'medium';
  }
  
  private extractRelevantArchitecture(architecture: any, req: any): any {
    if (!architecture) return {};
    
    const relevant: any = {};
    const reqText = JSON.stringify(req).toLowerCase();
    
    Object.keys(architecture).forEach(key => {
      const archText = JSON.stringify(architecture[key]).toLowerCase();
      
      // Check if architecture component is relevant to requirement
      if (reqText.includes(key.toLowerCase()) || 
          this.hasCommonKeywords(reqText, archText)) {
        relevant[key] = architecture[key];
      }
    });
    
    return Object.keys(relevant).length > 0 ? relevant : architecture;
  }
  
  private extractRelevantDecisions(decisions: any, req: any): any {
    if (!decisions) return {};
    
    const relevant: any = {};
    const reqText = JSON.stringify(req).toLowerCase();
    
    if (Array.isArray(decisions)) {
      return decisions.filter((decision: any) => {
        const decText = JSON.stringify(decision).toLowerCase();
        return this.hasCommonKeywords(reqText, decText);
      });
    }
    
    Object.keys(decisions).forEach(key => {
      const decText = JSON.stringify(decisions[key]).toLowerCase();
      if (this.hasCommonKeywords(reqText, decText)) {
        relevant[key] = decisions[key];
      }
    });
    
    return Object.keys(relevant).length > 0 ? relevant : decisions;
  }
  
  private extractRelevantScope(scope: any, req: any): any {
    if (!scope) return {};
    
    // For scope, usually return all as it defines boundaries
    return scope;
  }
  
  private generateImplementationGuide(req: any, planningPhase: any): string {
    const guides: string[] = [];
    
    guides.push('Implementation Steps:');
    guides.push('1. Review the requirement and acceptance criteria');
    
    if (planningPhase.architecture) {
      guides.push('2. Follow the architectural patterns defined in the planning phase');
    }
    
    if (planningPhase.decisions) {
      guides.push('3. Adhere to technical decisions and constraints');
    }
    
    // Add specific guidance based on requirement type
    const reqText = JSON.stringify(req).toLowerCase();
    
    if (reqText.includes('api')) {
      guides.push('4. Implement RESTful endpoints following OpenAPI specification');
      guides.push('5. Add proper error handling and validation');
    }
    
    if (reqText.includes('database') || reqText.includes('data')) {
      guides.push('4. Design database schema with proper constraints');
      guides.push('5. Implement data access layer with repository pattern');
    }
    
    if (reqText.includes('ui') || reqText.includes('interface')) {
      guides.push('4. Create responsive UI components');
      guides.push('5. Ensure accessibility standards are met');
    }
    
    if (reqText.includes('auth') || reqText.includes('security')) {
      guides.push('4. Implement secure authentication flow');
      guides.push('5. Add proper authorization checks');
      guides.push('6. Follow OWASP security guidelines');
    }
    
    guides.push(`${guides.length + 1}. Write comprehensive tests`);
    guides.push(`${guides.length + 2}. Update documentation`);
    
    return guides.join('\n');
  }
  
  private generateAcceptanceCriteria(req: any): string[] {
    const criteria: string[] = [];
    
    if (req.acceptance_criteria) {
      if (Array.isArray(req.acceptance_criteria)) {
        return req.acceptance_criteria;
      }
      if (typeof req.acceptance_criteria === 'string') {
        return req.acceptance_criteria.split('\n').filter((c: string) => c.trim());
      }
    }
    
    // Generate based on requirement type
    const reqText = JSON.stringify(req).toLowerCase();
    
    criteria.push('GIVEN the feature is implemented');
    
    if (reqText.includes('user')) {
      criteria.push('WHEN a user interacts with the feature');
      criteria.push('THEN the expected behavior occurs');
    }
    
    if (reqText.includes('api')) {
      criteria.push('WHEN API endpoint is called with valid data');
      criteria.push('THEN appropriate response is returned');
      criteria.push('AND status codes are correct');
    }
    
    if (reqText.includes('performance')) {
      criteria.push('WHEN system is under normal load');
      criteria.push('THEN response time is under 200ms');
      criteria.push('AND system remains stable');
    }
    
    criteria.push('AND all tests pass');
    criteria.push('AND documentation is updated');
    
    return criteria;
  }
  
  private generateTechnicalNotes(req: any, planningPhase: any): string {
    const notes: string[] = [];
    
    if (planningPhase.decisions) {
      notes.push('Technical Decisions:');
      if (typeof planningPhase.decisions === 'object') {
        Object.keys(planningPhase.decisions).forEach(key => {
          notes.push(`- ${key}: ${JSON.stringify(planningPhase.decisions[key]).substring(0, 100)}`);
        });
      }
    }
    
    // Add requirement-specific notes
    const reqText = JSON.stringify(req).toLowerCase();
    
    if (reqText.includes('performance')) {
      notes.push('Performance Considerations:');
      notes.push('- Implement caching where appropriate');
      notes.push('- Use pagination for large datasets');
      notes.push('- Optimize database queries');
    }
    
    if (reqText.includes('scale') || reqText.includes('scalab')) {
      notes.push('Scalability Considerations:');
      notes.push('- Design for horizontal scaling');
      notes.push('- Use stateless components');
      notes.push('- Consider load balancing needs');
    }
    
    return notes.join('\n');
  }
  
  private identifyDependencies(req: any, allRequirements: any[]): string[] {
    const dependencies: string[] = [];
    const reqText = JSON.stringify(req).toLowerCase();
    
    allRequirements.forEach(otherReq => {
      if (otherReq === req) return;
      
      const otherText = JSON.stringify(otherReq).toLowerCase();
      
      // Check for explicit dependencies
      if (req.dependencies && Array.isArray(req.dependencies)) {
        dependencies.push(...req.dependencies);
      }
      
      // Identify implicit dependencies
      if (reqText.includes('authentication') && otherText.includes('user')) {
        dependencies.push(otherReq.key || otherReq.title || 'User Management');
      }
      
      if (reqText.includes('api') && otherText.includes('database')) {
        dependencies.push(otherReq.key || otherReq.title || 'Database Setup');
      }
    });
    
    return [...new Set(dependencies)]; // Remove duplicates
  }
  
  private estimateEffort(req: any): string {
    const reqText = JSON.stringify(req).toLowerCase();
    let points = 3; // Base effort
    
    // Adjust based on complexity indicators
    if (reqText.includes('complex') || reqText.includes('complicated')) points += 5;
    if (reqText.includes('simple') || reqText.includes('basic')) points -= 1;
    if (reqText.includes('integration')) points += 3;
    if (reqText.includes('migration')) points += 5;
    if (reqText.includes('refactor')) points += 3;
    if (reqText.includes('ui') || reqText.includes('frontend')) points += 2;
    if (reqText.includes('api')) points += 2;
    if (reqText.includes('database')) points += 3;
    if (reqText.includes('security')) points += 3;
    if (reqText.includes('performance')) points += 3;
    
    // Cap the points
    points = Math.max(1, Math.min(13, points));
    
    // Convert to time estimate
    if (points <= 2) return 'Small (0.5-1 day)';
    if (points <= 5) return 'Medium (2-3 days)';
    if (points <= 8) return 'Large (3-5 days)';
    return 'Extra Large (1-2 weeks)';
  }
  
  private hasCommonKeywords(text1: string, text2: string): boolean {
    const keywords1 = this.extractKeywords(text1);
    const keywords2 = this.extractKeywords(text2);
    
    const commonCount = keywords1.filter(k => keywords2.includes(k)).length;
    return commonCount >= 2; // At least 2 common keywords
  }
  
  private extractKeywords(text: string): string[] {
    const stopWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for'];
    const words = text.toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 3 && !stopWords.includes(word));
    
    return [...new Set(words)];
  }
  
  private parseArchitectureComponents(architecture: any): any[] {
    if (Array.isArray(architecture)) {
      return architecture;
    }
    
    if (typeof architecture === 'object') {
      const components: any[] = [];
      
      Object.keys(architecture).forEach(key => {
        const comp = architecture[key];
        if (typeof comp === 'object') {
          components.push({
            key,
            name: comp.name || key,
            type: comp.type || 'component',
            ...comp
          });
        } else {
          components.push({
            key,
            name: key,
            description: comp
          });
        }
      });
      
      return components;
    }
    
    return [];
  }
  
  private generateComponentKey(comp: any): string {
    if (comp.key) return comp.key;
    if (comp.id) return comp.id;
    if (comp.name) return comp.name.toLowerCase().replace(/\s+/g, '_');
    return `component_${Date.now()}`;
  }
  
  private generateComponentImplementationGuide(comp: any): string {
    const guides: string[] = [];
    
    guides.push(`Implementation Guide for ${comp.name || 'Component'}:`);
    guides.push('1. Create component structure');
    guides.push('2. Implement core functionality');
    guides.push('3. Add error handling');
    guides.push('4. Write unit tests');
    guides.push('5. Integration with other components');
    guides.push('6. Document API/interface');
    
    if (comp.type === 'service') {
      guides.push('7. Implement service interface');
      guides.push('8. Add dependency injection');
    }
    
    if (comp.type === 'controller' || comp.type === 'api') {
      guides.push('7. Define routes/endpoints');
      guides.push('8. Add request validation');
    }
    
    return guides.join('\n');
  }
  
  private generateComponentAcceptanceCriteria(comp: any): string[] {
    return [
      `GIVEN the ${comp.name || 'component'} is implemented`,
      'WHEN the component is integrated',
      'THEN it functions as specified',
      'AND all interfaces are properly exposed',
      'AND error handling is in place',
      'AND tests provide adequate coverage',
      'AND documentation is complete'
    ];
  }
  
  private generateComponentTechnicalNotes(comp: any): string {
    const notes: string[] = [];
    
    notes.push(`Component: ${comp.name || 'Unknown'}`);
    notes.push(`Type: ${comp.type || 'standard'}`);
    
    if (comp.technology) {
      notes.push(`Technology: ${comp.technology}`);
    }
    
    if (comp.dependencies) {
      notes.push('Dependencies:');
      if (Array.isArray(comp.dependencies)) {
        comp.dependencies.forEach((dep: any) => {
          notes.push(`- ${dep}`);
        });
      }
    }
    
    if (comp.interfaces) {
      notes.push('Interfaces:');
      if (Array.isArray(comp.interfaces)) {
        comp.interfaces.forEach((intf: any) => {
          notes.push(`- ${intf}`);
        });
      }
    }
    
    return notes.join('\n');
  }
  
  private estimateComponentEffort(comp: any): string {
    const compText = JSON.stringify(comp).toLowerCase();
    let complexity = 3; // Base complexity
    
    if (comp.type === 'service') complexity += 2;
    if (comp.type === 'controller') complexity += 1;
    if (comp.type === 'repository') complexity += 2;
    if (comp.type === 'middleware') complexity += 1;
    
    if (compText.includes('complex')) complexity += 3;
    if (compText.includes('simple')) complexity -= 1;
    
    if (comp.dependencies && Array.isArray(comp.dependencies)) {
      complexity += comp.dependencies.length;
    }
    
    complexity = Math.max(1, Math.min(13, complexity));
    
    if (complexity <= 3) return 'Small (1-2 days)';
    if (complexity <= 6) return 'Medium (3-4 days)';
    if (complexity <= 9) return 'Large (5-7 days)';
    return 'Extra Large (1-2 weeks)';
  }
}

// MCP Server Setup
const scrollsManager = new SacredScrollsManager();

class SacredScrollsServer {
  private server: Server;

  constructor() {
    this.server = new Server(
      {
        name: 'sacred-scrolls',
        version: CONFIG.version,
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupToolHandlers();
    this.setupRequestHandlers();
  }

  private setupRequestHandlers(): void {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: 'create_sacred_scroll',
          description: 'Create a new Sacred Scroll for context preservation',
          inputSchema: {
            type: 'object',
            properties: {
              project: {
                type: 'string',
                description: 'Project name or identifier'
              },
              phase: {
                type: 'string',
                enum: ['planning', 'execution'],
                description: 'Initial phase for the scroll'
              }
            },
            required: ['project']
          }
        },
        {
          name: 'update_sacred_scroll',
          description: 'Update a Sacred Scroll with new context',
          inputSchema: {
            type: 'object',
            properties: {
              scroll_id: {
                type: 'string',
                description: 'Sacred Scroll ID'
              },
              god: {
                type: 'string',
                description: 'Name of the god making the update'
              },
              action: {
                type: 'string',
                description: 'Action being performed'
              },
              content: {
                type: 'object',
                description: 'Content to add to the scroll'
              },
              section: {
                type: 'string',
                description: 'Optional: Specific section to update (e.g., planning.requirements)'
              }
            },
            required: ['scroll_id', 'god', 'action', 'content']
          }
        },
        {
          name: 'retrieve_sacred_scroll',
          description: 'Retrieve a Sacred Scroll by ID',
          inputSchema: {
            type: 'object',
            properties: {
              scroll_id: {
                type: 'string',
                description: 'Sacred Scroll ID'
              }
            },
            required: ['scroll_id']
          }
        },
        {
          name: 'transform_scroll_to_execution',
          description: 'Transform a planning scroll into an execution scroll',
          inputSchema: {
            type: 'object',
            properties: {
              scroll_id: {
                type: 'string',
                description: 'Planning scroll ID'
              }
            },
            required: ['scroll_id']
          }
        },
        {
          name: 'list_sacred_scrolls',
          description: 'List all Sacred Scrolls for a project',
          inputSchema: {
            type: 'object',
            properties: {
              project: {
                type: 'string',
                description: 'Optional: Filter by project name'
              }
            }
          }
        },
        {
          name: 'validate_scroll_transition',
          description: 'Validate if a scroll is ready for phase transition',
          inputSchema: {
            type: 'object',
            properties: {
              scroll_id: {
                type: 'string',
                description: 'Sacred Scroll ID'
              }
            },
            required: ['scroll_id']
          }
        },
        {
          name: 'archive_sacred_scroll',
          description: 'Archive a completed Sacred Scroll',
          inputSchema: {
            type: 'object',
            properties: {
              scroll_id: {
                type: 'string',
                description: 'Sacred Scroll ID'
              }
            },
            required: ['scroll_id']
          }
        }
      ]
    }));
  }

  private setupToolHandlers(): void {
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      try {
        const { name, arguments: args } = request.params;

        switch (name) {
          case 'create_sacred_scroll':
            return await this.handleCreateScroll(args);
          
          case 'update_sacred_scroll':
            return await this.handleUpdateScroll(args);
          
          case 'retrieve_sacred_scroll':
            return await this.handleRetrieveScroll(args);
          
          case 'transform_scroll_to_execution':
            return await this.handleTransformScroll(args);
          
          case 'list_sacred_scrolls':
            return await this.handleListScrolls(args);
          
          case 'validate_scroll_transition':
            return await this.handleValidateTransition(args);
          
          case 'archive_sacred_scroll':
            return await this.handleArchiveScroll(args);
          
          default:
            throw new McpError(
              ErrorCode.MethodNotFound,
              `Unknown tool: ${name}`
            );
        }
      } catch (error) {
        logger.error('Tool execution error:', error);
        throw new McpError(
          ErrorCode.InternalError,
          `Tool execution failed: ${(error as Error).message}`
        );
      }
    });
  }

  private async handleCreateScroll(args: any) {
    const { project, phase = 'planning' } = args;
    const scrollId = await scrollsManager.createScroll(project, phase);
    
    return {
      content: [
        {
          type: 'text',
          text: `Created Sacred Scroll: ${scrollId}\nProject: ${project}\nPhase: ${phase}\n\nUse this ID to update and retrieve the scroll.`
        }
      ]
    };
  }

  private async handleUpdateScroll(args: any) {
    const { scroll_id, god, action, content, section } = args;
    await scrollsManager.updateScroll(scroll_id, god, action, content, section);
    
    return {
      content: [
        {
          type: 'text',
          text: `Updated Sacred Scroll: ${scroll_id}\nGod: ${god}\nAction: ${action}\n${section ? `Section: ${section}` : ''}`
        }
      ]
    };
  }

  private async handleRetrieveScroll(args: any) {
    const { scroll_id } = args;
    const scroll = await scrollsManager.retrieveScroll(scroll_id);
    
    if (!scroll) {
      throw new Error(`Scroll not found: ${scroll_id}`);
    }

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(scroll, null, 2)
        }
      ]
    };
  }

  private async handleTransformScroll(args: any) {
    const { scroll_id } = args;
    const newScrollId = await scrollsManager.transformToExecution(scroll_id);
    
    return {
      content: [
        {
          type: 'text',
          text: `Transformed planning scroll to execution phase\nOriginal: ${scroll_id}\nExecution: ${newScrollId}`
        }
      ]
    };
  }

  private async handleListScrolls(args: any) {
    const { project } = args;
    const scrolls = await scrollsManager.listScrolls(project);
    
    const scrollList = scrolls.map(s => 
      `- ${s.id}\n  Project: ${s.project}\n  Phase: ${s.phase}\n  Modified: ${s.modified}`
    ).join('\n\n');

    return {
      content: [
        {
          type: 'text',
          text: `Sacred Scrolls${project ? ` for ${project}` : ''}:\n\n${scrollList || 'No scrolls found'}`
        }
      ]
    };
  }

  private async handleValidateTransition(args: any) {
    const { scroll_id } = args;
    const validation = await scrollsManager.validateScrollForTransition(scroll_id);
    
    return {
      content: [
        {
          type: 'text',
          text: `Validation for ${scroll_id}:\nValid: ${validation.valid}\n${
            validation.missing.length > 0 
              ? `Missing: ${validation.missing.join(', ')}` 
              : 'Ready for phase transition'
          }`
        }
      ]
    };
  }

  private async handleArchiveScroll(args: any) {
    const { scroll_id } = args;
    await scrollsManager.archiveScroll(scroll_id);
    
    return {
      content: [
        {
          type: 'text',
          text: `Archived Sacred Scroll: ${scroll_id}\nThe scroll has been marked as complete and backed up.`
        }
      ]
    };
  }

  async run(): Promise<void> {
    await scrollsManager.initialize();
    
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    
    logger.info('Sacred Scrolls MCP Server running');
  }
}

// Main execution
const server = new SacredScrollsServer();
server.run().catch((error) => {
  logger.error('Failed to start Sacred Scrolls server:', error as Error);
  process.exit(1);
});