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
        scroll.planning_phase[subsection] = content;
      } else if (phase === 'execution' && scroll.execution_phase) {
        scroll.execution_phase[subsection] = content;
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
    // Transform planning artifacts into execution stories
    return {
      authentication: {
        title: 'User Authentication Implementation',
        context: planningPhase.requirements,
        architecture: planningPhase.architecture,
        decisions: planningPhase.decisions,
        scope: planningPhase.scope,
        implementation_guide: 'Generated from planning phase artifacts'
      }
    };
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
          `Tool execution failed: ${error.message}`
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
  logger.error('Failed to start Sacred Scrolls server:', error);
  process.exit(1);
});