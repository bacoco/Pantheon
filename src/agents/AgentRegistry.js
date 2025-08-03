import { EventEmitter } from 'eventemitter3';
import winston from 'winston';
import fs from 'fs/promises';
import path from 'path';
import { ClaudeArchitect } from './creators/ClaudeArchitect.js';
import { ClaudeBuilder } from './creators/ClaudeBuilder.js';
import { GeminiAdvisor } from './validators/GeminiAdvisor.js';

/**
 * Agent Registry - Central management system for all agents
 * Handles agent lifecycle, registration, discovery, and coordination
 */
export class AgentRegistry extends EventEmitter {
  constructor() {
    super();
    
    // Agent storage
    this.agents = new Map();
    this.agentTypes = new Map();
    this.agentsByModel = new Map();
    this.agentsByRole = new Map();
    
    // Statistics
    this.stats = {
      totalAgentsCreated: 0,
      activeAgents: 0,
      totalTasksExecuted: 0,
      totalValidations: 0
    };
    
    // Configuration
    this.maxAgentsPerType = 5;
    this.maxTotalAgents = 20;
    
    // Logger
    this.logger = this.setupLogger();
    
    // Initialize
    this.initialize();
  }
  
  /**
   * Setup logger
   */
  setupLogger() {
    return winston.createLogger({
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
      defaultMeta: { service: 'agent-registry' },
      transports: [
        new winston.transports.File({ 
          filename: '.claude/logs/agent-registry.log',
          maxsize: 5242880,
          maxFiles: 5
        }),
        new winston.transports.Console({
          format: winston.format.simple()
        })
      ]
    });
  }
  
  /**
   * Initialize registry
   */
  async initialize() {
    // Register core agent types
    this.registerAgentType('claude-architect', ClaudeArchitect);
    this.registerAgentType('claude-builder', ClaudeBuilder);
    this.registerAgentType('gemini-advisor', GeminiAdvisor);
    
    // Load additional agent types from configuration
    await this.loadAgentTypes();
    
    this.logger.info('Agent Registry initialized', {
      registeredTypes: Array.from(this.agentTypes.keys())
    });
  }
  
  /**
   * Register an agent type
   */
  registerAgentType(name, AgentClass) {
    if (this.agentTypes.has(name)) {
      throw new Error(`Agent type ${name} already registered`);
    }
    
    this.agentTypes.set(name, AgentClass);
    this.logger.info('Agent type registered', { type: name });
  }
  
  /**
   * Load agent types from configuration
   */
  async loadAgentTypes() {
    try {
      const agentDir = '.claude/agents';
      const categories = ['creation', 'validation', 'synthesis', 'management', 'specialized'];
      
      for (const category of categories) {
        const categoryPath = path.join(agentDir, category);
        
        try {
          const files = await fs.readdir(categoryPath);
          
          for (const file of files) {
            if (file.endsWith('.md')) {
              // Agent definition files would be parsed here
              // For now, we'll just log them
              this.logger.debug('Found agent definition', { 
                category, 
                file: file.replace('.md', '') 
              });
            }
          }
        } catch (error) {
          // Directory might not exist yet
          this.logger.debug(`Category directory not found: ${category}`);
        }
      }
    } catch (error) {
      this.logger.error('Failed to load agent types', { error: error.message });
    }
  }
  
  /**
   * Create and register an agent
   */
  async createAgent(type, config = {}) {
    // Check limits
    if (this.agents.size >= this.maxTotalAgents) {
      throw new Error(`Maximum number of agents (${this.maxTotalAgents}) reached`);
    }
    
    const agentsOfType = this.getAgentsByType(type);
    if (agentsOfType.length >= this.maxAgentsPerType) {
      throw new Error(`Maximum number of ${type} agents (${this.maxAgentsPerType}) reached`);
    }
    
    // Get agent class
    const AgentClass = this.agentTypes.get(type);
    if (!AgentClass) {
      throw new Error(`Unknown agent type: ${type}`);
    }
    
    // Create agent instance
    const agent = new AgentClass(config);
    
    // Register agent
    this.registerAgent(agent);
    
    // Setup event listeners
    this.setupAgentListeners(agent);
    
    this.stats.totalAgentsCreated++;
    this.stats.activeAgents++;
    
    this.logger.info('Agent created', {
      type,
      id: agent.id,
      name: agent.name,
      model: agent.model
    });
    
    this.emit('agentCreated', { agent });
    
    return agent;
  }
  
  /**
   * Register an agent instance
   */
  registerAgent(agent) {
    // Add to main registry
    this.agents.set(agent.id, agent);
    
    // Index by model
    if (!this.agentsByModel.has(agent.model)) {
      this.agentsByModel.set(agent.model, new Set());
    }
    this.agentsByModel.get(agent.model).add(agent.id);
    
    // Index by role
    if (!this.agentsByRole.has(agent.collaborationMode)) {
      this.agentsByRole.set(agent.collaborationMode, new Set());
    }
    this.agentsByRole.get(agent.collaborationMode).add(agent.id);
  }
  
  /**
   * Setup event listeners for an agent
   */
  setupAgentListeners(agent) {
    // Listen for validation requests
    agent.on('validationRequired', async (data) => {
      await this.handleValidationRequest(agent, data);
    });
    
    // Listen for task completion
    agent.on('taskCompleted', (data) => {
      this.stats.totalTasksExecuted++;
      this.emit('taskCompleted', { agent, ...data });
    });
    
    // Listen for errors
    agent.on('error', (data) => {
      this.logger.error('Agent error', { 
        agent: agent.name, 
        error: data.error.message 
      });
      this.emit('agentError', { agent, ...data });
    });
    
    // Listen for termination
    agent.on('terminated', () => {
      this.unregisterAgent(agent);
    });
  }
  
  /**
   * Handle validation request from an agent
   */
  async handleValidationRequest(requestingAgent, data) {
    this.logger.info('Validation requested', {
      from: requestingAgent.name,
      type: data.type,
      validator: data.validator
    });
    
    // Find appropriate validator
    const validator = await this.findValidator(data.validator || 'gemini-advisor');
    
    if (!validator) {
      this.logger.error('No validator available', { requested: data.validator });
      return;
    }
    
    // Execute validation
    try {
      const validationResult = await validator.execute({
        type: `validate_${data.type}`,
        data: data.data,
        requestedBy: requestingAgent.name
      });
      
      this.stats.totalValidations++;
      
      // Send result back to requesting agent
      if (validationResult.requiresRefinement) {
        await requestingAgent.refine(data.data, validationResult.feedback);
      }
      
      this.emit('validationCompleted', {
        requestingAgent,
        validator,
        result: validationResult
      });
      
    } catch (error) {
      this.logger.error('Validation failed', { 
        error: error.message,
        validator: validator.name 
      });
    }
  }
  
  /**
   * Find a validator agent
   */
  async findValidator(preferredValidator) {
    // Try to find preferred validator
    let validator = this.getAgentByName(preferredValidator);
    
    // If not found, create it
    if (!validator && this.agentTypes.has(preferredValidator)) {
      validator = await this.createAgent(preferredValidator);
    }
    
    // If still not found, find any validator
    if (!validator) {
      const validators = this.getAgentsByRole('advisor');
      if (validators.length > 0) {
        validator = validators[0];
      }
    }
    
    return validator;
  }
  
  /**
   * Get agent by ID
   */
  getAgent(id) {
    return this.agents.get(id);
  }
  
  /**
   * Get agent by name
   */
  getAgentByName(name) {
    for (const agent of this.agents.values()) {
      if (agent.name === name) {
        return agent;
      }
    }
    return null;
  }
  
  /**
   * Get agents by type
   */
  getAgentsByType(type) {
    const agents = [];
    for (const agent of this.agents.values()) {
      if (agent.name === type) {
        agents.push(agent);
      }
    }
    return agents;
  }
  
  /**
   * Get agents by model
   */
  getAgentsByModel(model) {
    const agentIds = this.agentsByModel.get(model) || new Set();
    return Array.from(agentIds).map(id => this.agents.get(id)).filter(Boolean);
  }
  
  /**
   * Get agents by role
   */
  getAgentsByRole(role) {
    const agentIds = this.agentsByRole.get(role) || new Set();
    return Array.from(agentIds).map(id => this.agents.get(id)).filter(Boolean);
  }
  
  /**
   * Get all active agents
   */
  getAllAgents() {
    return Array.from(this.agents.values());
  }
  
  /**
   * Get agents that can perform a specific task
   */
  getAgentsForTask(taskType) {
    const capableAgents = [];
    
    for (const agent of this.agents.values()) {
      // Check if agent can handle this task type
      if (this.canAgentHandleTask(agent, taskType)) {
        capableAgents.push(agent);
      }
    }
    
    // Sort by priority or load
    return this.prioritizeAgents(capableAgents);
  }
  
  /**
   * Check if agent can handle a task
   */
  canAgentHandleTask(agent, taskType) {
    // Claude agents can create/implement
    if (taskType.includes('create') || taskType.includes('implement') || taskType.includes('design')) {
      return agent.model.includes('claude') && agent.codeWriting === 'ALLOWED';
    }
    
    // Gemini agents can validate/review
    if (taskType.includes('validate') || taskType.includes('review') || taskType.includes('analyze')) {
      return agent.model.includes('gemini') && agent.codeWriting === 'FORBIDDEN';
    }
    
    // Check specialization
    if (agent.specialization) {
      return taskType.toLowerCase().includes(agent.specialization.toLowerCase());
    }
    
    return false;
  }
  
  /**
   * Prioritize agents for task assignment
   */
  prioritizeAgents(agents) {
    return agents.sort((a, b) => {
      // Prefer ready agents
      if (a.state === 'ready' && b.state !== 'ready') return -1;
      if (b.state === 'ready' && a.state !== 'ready') return 1;
      
      // Then by last activity (least recently used)
      return a.lastActivity - b.lastActivity;
    });
  }
  
  /**
   * Unregister an agent
   */
  unregisterAgent(agent) {
    // Remove from main registry
    this.agents.delete(agent.id);
    
    // Remove from indexes
    const modelAgents = this.agentsByModel.get(agent.model);
    if (modelAgents) {
      modelAgents.delete(agent.id);
    }
    
    const roleAgents = this.agentsByRole.get(agent.collaborationMode);
    if (roleAgents) {
      roleAgents.delete(agent.id);
    }
    
    this.stats.activeAgents--;
    
    this.logger.info('Agent unregistered', { 
      id: agent.id, 
      name: agent.name 
    });
    
    this.emit('agentUnregistered', { agent });
  }
  
  /**
   * Terminate an agent
   */
  async terminateAgent(id) {
    const agent = this.getAgent(id);
    if (!agent) {
      throw new Error(`Agent ${id} not found`);
    }
    
    await agent.terminate();
  }
  
  /**
   * Terminate all agents
   */
  async terminateAll() {
    const agents = this.getAllAgents();
    
    for (const agent of agents) {
      await agent.terminate();
    }
    
    this.logger.info('All agents terminated');
  }
  
  /**
   * Get registry statistics
   */
  getStatistics() {
    return {
      ...this.stats,
      agentsByModel: Object.fromEntries(
        Array.from(this.agentsByModel.entries()).map(([model, ids]) => [model, ids.size])
      ),
      agentsByRole: Object.fromEntries(
        Array.from(this.agentsByRole.entries()).map(([role, ids]) => [role, ids.size])
      ),
      agentStates: this.getAgentStates()
    };
  }
  
  /**
   * Get agent states summary
   */
  getAgentStates() {
    const states = {};
    
    for (const agent of this.agents.values()) {
      states[agent.state] = (states[agent.state] || 0) + 1;
    }
    
    return states;
  }
  
  /**
   * Health check
   */
  async healthCheck() {
    const health = {
      healthy: true,
      agents: [],
      issues: []
    };
    
    for (const agent of this.agents.values()) {
      const agentHealth = {
        id: agent.id,
        name: agent.name,
        state: agent.state,
        healthy: agent.state === 'ready' || agent.state === 'executing'
      };
      
      if (!agentHealth.healthy) {
        health.healthy = false;
        health.issues.push(`Agent ${agent.name} is in ${agent.state} state`);
      }
      
      health.agents.push(agentHealth);
    }
    
    return health;
  }
}

// Singleton instance
let registryInstance = null;

/**
 * Get or create the singleton registry instance
 */
export function getRegistry() {
  if (!registryInstance) {
    registryInstance = new AgentRegistry();
  }
  return registryInstance;
}

export default AgentRegistry;