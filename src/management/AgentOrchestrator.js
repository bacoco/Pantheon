import { EventEmitter } from 'eventemitter3';
import { v4 as uuidv4 } from 'uuid';
import winston from 'winston';
import PQueue from 'p-queue';
import { AgentRegistry } from '../agents/AgentRegistry.js';
import { SmartRouter } from '../router/SmartRouter.js';
import { ValidationOrchestrator } from '../validation/ValidationOrchestrator.js';
import { WorkflowMonitor } from '../workflows/WorkflowMonitor.js';

/**
 * AgentOrchestrator manages the lifecycle and coordination of multiple AI agents
 * Provides intelligent task distribution, load balancing, and agent health monitoring
 */
export class AgentOrchestrator extends EventEmitter {
  constructor(config = {}) {
    super();
    
    this.id = uuidv4();
    this.maxConcurrentAgents = config.maxConcurrentAgents || 5;
    this.maxQueueSize = config.maxQueueSize || 100;
    this.healthCheckInterval = config.healthCheckInterval || 30000; // 30 seconds
    this.autoScaling = config.autoScaling || false;
    
    // Core components
    this.agentRegistry = new AgentRegistry();
    this.router = new SmartRouter();
    this.validator = new ValidationOrchestrator();
    this.workflowMonitor = new WorkflowMonitor();
    
    // Agent management
    this.activeAgents = new Map();
    this.agentPools = new Map();
    this.taskQueue = new PQueue({
      concurrency: this.maxConcurrentAgents,
      timeout: 300000, // 5 minutes
      throwOnTimeout: true
    });
    
    // Health monitoring
    this.healthChecks = new Map();
    this.agentMetrics = new Map();
    this.systemStatus = 'initializing';
    
    // Performance tracking
    this.startTime = Date.now();
    this.totalTasksProcessed = 0;
    this.totalErrors = 0;
    this.averageResponseTime = 0;
    
    // Logging
    this.logger = winston.createLogger({
      level: process.env.PANTHEON_LOG_LEVEL || 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json()
      ),
      defaultMeta: { 
        component: 'AgentOrchestrator',
        orchestratorId: this.id
      },
      transports: [
        new winston.transports.File({
          filename: '.claude/logs/orchestrator.log',
          maxsize: 10485760, // 10MB
          maxFiles: 10
        }),
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple()
          )
        })
      ]
    });
    
    this.initialize();
  }
  
  /**
   * Initialize the orchestrator
   */
  async initialize() {
    try {
      this.logger.info('Initializing Agent Orchestrator');
      
      // Setup agent pools
      await this.setupAgentPools();
      
      // Start health monitoring
      this.startHealthMonitoring();
      
      // Setup event listeners
      this.setupEventListeners();
      
      this.systemStatus = 'ready';
      this.logger.info('Agent Orchestrator initialized successfully');
      this.emit('initialized', { orchestrator: this });
      
    } catch (error) {
      this.systemStatus = 'error';
      this.logger.error('Failed to initialize orchestrator', { error: error.message });
      throw error;
    }
  }
  
  /**
   * Setup agent pools for different task types
   */
  async setupAgentPools() {
    const pools = {
      'creator': {
        maxSize: 3,
        agentType: 'claude-builder',
        priority: 'high'
      },
      'validator': {
        maxSize: 2,
        agentType: 'gemini-advisor',
        priority: 'medium'
      },
      'architect': {
        maxSize: 1,
        agentType: 'claude-architect',
        priority: 'high'
      },
      'specialist': {
        maxSize: 2,
        agentType: 'auto',
        priority: 'medium'
      }
    };
    
    for (const [poolName, config] of Object.entries(pools)) {
      this.agentPools.set(poolName, {
        ...config,
        agents: new Set(),
        waitingTasks: [],
        activeJobs: 0
      });
      
      this.logger.debug(`Created agent pool: ${poolName}`, config);
    }
  }
  
  /**
   * Execute task with optimal agent assignment
   */
  async executeTask(task) {
    const taskId = task.id || uuidv4();
    const startTime = Date.now();
    
    try {
      this.logger.info('Executing task', { taskId, taskType: task.type });
      
      // Validate task
      await this.validateTask(task);
      
      // Route to appropriate agent
      const agent = await this.selectAgent(task);
      if (!agent) {
        throw new Error('No suitable agent available');
      }
      
      // Execute with monitoring
      const result = await this.taskQueue.add(async () => {
        return await this.executeWithAgent(agent, { ...task, id: taskId });
      }, {
        priority: this.getTaskPriority(task)
      });
      
      // Update metrics
      this.updateMetrics(taskId, startTime, true);
      
      // Post-execution validation if required
      if (task.validationRequired) {
        await this.validator.validateResult(result, task);
      }
      
      this.emit('taskCompleted', { taskId, result, agent: agent.name });
      return result;
      
    } catch (error) {
      this.updateMetrics(taskId, startTime, false, error);
      this.logger.error('Task execution failed', { taskId, error: error.message });
      this.emit('taskFailed', { taskId, error, task });
      throw error;
    }
  }
  
  /**
   * Execute multiple tasks in parallel with coordination
   */
  async executeParallelTasks(tasks, options = {}) {
    const { maxConcurrency = 3, coordinationRequired = false } = options;
    const taskId = uuidv4();
    
    this.logger.info('Executing parallel tasks', { 
      taskId, 
      taskCount: tasks.length,
      maxConcurrency 
    });
    
    if (coordinationRequired) {
      return await this.executeCoordinatedTasks(tasks, taskId);
    }
    
    // Simple parallel execution
    const queue = new PQueue({ concurrency: maxConcurrency });
    const results = await Promise.allSettled(
      tasks.map(task => queue.add(() => this.executeTask(task)))
    );
    
    const successful = results.filter(r => r.status === 'fulfilled').map(r => r.value);
    const failed = results.filter(r => r.status === 'rejected').map(r => r.reason);
    
    this.logger.info('Parallel tasks completed', {
      taskId,
      successful: successful.length,
      failed: failed.length
    });
    
    return { successful, failed, totalTasks: tasks.length };
  }
  
  /**
   * Execute tasks with coordination between agents
   */
  async executeCoordinatedTasks(tasks, coordinationId) {
    const coordinator = new TaskCoordinator(coordinationId, this);
    
    // Group tasks by dependencies
    const taskGroups = coordinator.groupTasksByDependencies(tasks);
    const results = new Map();
    
    for (const group of taskGroups) {
      const groupResults = await Promise.allSettled(
        group.map(async task => {
          // Wait for dependencies
          await coordinator.waitForDependencies(task, results);
          
          const result = await this.executeTask(task);
          results.set(task.id, result);
          
          // Notify dependents
          coordinator.notifyDependents(task.id, result);
          
          return result;
        })
      );
      
      // Check for group failures
      const failures = groupResults.filter(r => r.status === 'rejected');
      if (failures.length > 0) {
        coordinator.handleGroupFailure(group, failures);
      }
    }
    
    return Array.from(results.values());
  }
  
  /**
   * Select optimal agent for task
   */
  async selectAgent(task) {
    // Get routing decision
    const route = await this.router.route({
      type: task.type,
      context: task.context,
      urgency: task.urgency,
      estimatedComplexity: task.complexity
    });
    
    // Find available agent or create new one
    let agent = await this.findAvailableAgent(route.agentType);
    
    if (!agent && this.canCreateNewAgent()) {
      agent = await this.createAgent(route.agentType, task);
    }
    
    if (!agent) {
      // Try fallback agents
      const fallbackRoute = await this.router.getFallbackRoute(task);
      agent = await this.findAvailableAgent(fallbackRoute.agentType);
    }
    
    if (agent) {
      this.logger.debug('Agent selected', { 
        agent: agent.name, 
        task: task.type,
        route: route.agentType
      });
    }
    
    return agent;
  }
  
  /**
   * Find available agent of specified type
   */
  async findAvailableAgent(agentType) {
    // Check active agents first
    for (const [agentId, agent] of this.activeAgents) {
      if (agent.model.includes(agentType) && agent.state === 'ready') {
        return agent;
      }
    }
    
    // Check agent pools
    for (const [poolName, pool] of this.agentPools) {
      if (pool.agentType === agentType || pool.agentType === 'auto') {
        for (const agent of pool.agents) {
          if (agent.state === 'ready') {
            return agent;
          }
        }
      }
    }
    
    return null;
  }
  
  /**
   * Create new agent instance
   */
  async createAgent(agentType, task = null) {
    if (!this.canCreateNewAgent()) {
      this.logger.warn('Cannot create new agent - limit reached');
      return null;
    }
    
    try {
      const agent = await this.agentRegistry.createAgent({
        type: agentType,
        context: task ? `Task: ${task.type}` : 'General purpose',
        temporary: true
      });
      
      this.activeAgents.set(agent.id, agent);
      this.setupAgentMonitoring(agent);
      
      this.logger.info('Created new agent', { 
        agentId: agent.id, 
        type: agentType,
        totalActive: this.activeAgents.size
      });
      
      this.emit('agentCreated', { agent });
      return agent;
      
    } catch (error) {
      this.logger.error('Failed to create agent', { agentType, error: error.message });
      return null;
    }
  }
  
  /**
   * Execute task with specific agent
   */
  async executeWithAgent(agent, task) {
    const agentMetrics = this.agentMetrics.get(agent.id) || this.createAgentMetrics(agent.id);
    
    try {
      // Update agent status
      this.updateAgentStatus(agent.id, 'executing', task);
      
      // Execute with timeout
      const result = await Promise.race([
        agent.execute(task),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Agent execution timeout')), 
          task.timeout || 300000)
        )
      ]);
      
      // Update metrics
      agentMetrics.tasksCompleted++;
      agentMetrics.totalExecutionTime += result.executionTime || 0;
      
      // Update agent status
      this.updateAgentStatus(agent.id, 'ready');
      
      return result;
      
    } catch (error) {
      agentMetrics.tasksFailures++;
      this.updateAgentStatus(agent.id, 'error', null, error);
      
      // Consider agent replacement if too many failures
      if (agentMetrics.tasksFailures / agentMetrics.tasksCompleted > 0.3) {
        await this.considerAgentReplacement(agent.id);
      }
      
      throw error;
    }
  }
  
  /**
   * Validate task before execution
   */
  async validateTask(task) {
    if (!task.type) {
      throw new Error('Task type is required');
    }
    
    if (this.taskQueue.size >= this.maxQueueSize) {
      throw new Error('Task queue is full');
    }
    
    // Additional task validation
    const validation = await this.validator.preValidateTask(task);
    if (!validation.valid) {
      throw new Error(`Task validation failed: ${validation.reason}`);
    }
  }
  
  /**
   * Start health monitoring for all agents
   */
  startHealthMonitoring() {
    setInterval(async () => {
      await this.performHealthChecks();
    }, this.healthCheckInterval);
    
    this.logger.debug('Health monitoring started');
  }
  
  /**
   * Perform health checks on all active agents
   */
  async performHealthChecks() {
    const checks = [];
    
    for (const [agentId, agent] of this.activeAgents) {
      checks.push(this.checkAgentHealth(agentId, agent));
    }
    
    const results = await Promise.allSettled(checks);
    const unhealthyAgents = results
      .filter(r => r.status === 'fulfilled' && !r.value.healthy)
      .map(r => r.value.agentId);
    
    if (unhealthyAgents.length > 0) {
      this.logger.warn('Unhealthy agents detected', { unhealthyAgents });
      await this.handleUnhealthyAgents(unhealthyAgents);
    }
  }
  
  /**
   * Check individual agent health
   */
  async checkAgentHealth(agentId, agent) {
    try {
      const status = agent.getStatus();
      const metrics = this.agentMetrics.get(agentId);
      
      const isHealthy = status.state !== 'error' && 
                       status.state !== 'terminated' &&
                       (Date.now() - status.lastActivity) < 300000; // 5 minutes
      
      this.healthChecks.set(agentId, {
        timestamp: Date.now(),
        healthy: isHealthy,
        status: status.state,
        lastActivity: status.lastActivity,
        metrics
      });
      
      return { agentId, healthy: isHealthy, status };
      
    } catch (error) {
      this.logger.error('Health check failed', { agentId, error: error.message });
      return { agentId, healthy: false, error: error.message };
    }
  }
  
  /**
   * Handle unhealthy agents
   */
  async handleUnhealthyAgents(unhealthyAgentIds) {
    for (const agentId of unhealthyAgentIds) {
      const agent = this.activeAgents.get(agentId);
      if (!agent) continue;
      
      try {
        // Attempt recovery
        if (agent.state === 'error') {
          await agent.resume();
          this.logger.info('Agent recovered', { agentId });
          continue;
        }
        
        // Replace if recovery fails
        await this.replaceAgent(agentId);
        
      } catch (error) {
        this.logger.error('Failed to handle unhealthy agent', { 
          agentId, 
          error: error.message 
        });
      }
    }
  }
  
  /**
   * Replace an unhealthy agent
   */
  async replaceAgent(agentId) {
    const oldAgent = this.activeAgents.get(agentId);
    if (!oldAgent) return;
    
    try {
      // Create replacement
      const newAgent = await this.createAgent(oldAgent.model);
      if (!newAgent) {
        throw new Error('Failed to create replacement agent');
      }
      
      // Terminate old agent
      await oldAgent.terminate();
      this.activeAgents.delete(agentId);
      this.agentMetrics.delete(agentId);
      
      this.logger.info('Agent replaced', { 
        oldAgentId: agentId, 
        newAgentId: newAgent.id 
      });
      
      this.emit('agentReplaced', { oldAgentId: agentId, newAgent });
      
    } catch (error) {
      this.logger.error('Agent replacement failed', { agentId, error: error.message });
    }
  }
  
  /**
   * Setup event listeners
   */
  setupEventListeners() {
    // Task queue events
    this.taskQueue.on('add', () => {
      this.emit('queueUpdated', { size: this.taskQueue.size, pending: this.taskQueue.pending });
    });
    
    this.taskQueue.on('next', () => {
      this.emit('queueUpdated', { size: this.taskQueue.size, pending: this.taskQueue.pending });
    });
    
    // System events
    process.on('SIGTERM', () => this.gracefulShutdown());
    process.on('SIGINT', () => this.gracefulShutdown());
  }
  
  /**
   * Update agent metrics
   */
  updateMetrics(taskId, startTime, success, error = null) {
    const duration = Date.now() - startTime;
    this.totalTasksProcessed++;
    this.averageResponseTime = (this.averageResponseTime + duration) / this.totalTasksProcessed;
    
    if (!success) {
      this.totalErrors++;
    }
    
    this.emit('metricsUpdated', {
      taskId,
      duration,
      success,
      error,
      totalTasks: this.totalTasksProcessed,
      totalErrors: this.totalErrors,
      averageResponseTime: this.averageResponseTime
    });
  }
  
  /**
   * Get comprehensive system status
   */
  getSystemStatus() {
    const uptime = Date.now() - this.startTime;
    const successRate = this.totalTasksProcessed > 0 
      ? (this.totalTasksProcessed - this.totalErrors) / this.totalTasksProcessed 
      : 1;
    
    return {
      orchestratorId: this.id,
      status: this.systemStatus,
      uptime,
      activeAgents: this.activeAgents.size,
      queueSize: this.taskQueue.size,
      queuePending: this.taskQueue.pending,
      totalTasksProcessed: this.totalTasksProcessed,
      totalErrors: this.totalErrors,
      successRate,
      averageResponseTime: this.averageResponseTime,
      agentPools: Object.fromEntries(
        Array.from(this.agentPools.entries()).map(([name, pool]) => [
          name,
          {
            maxSize: pool.maxSize,
            currentSize: pool.agents.size,
            activeJobs: pool.activeJobs
          }
        ])
      ),
      healthChecks: Object.fromEntries(this.healthChecks)
    };
  }
  
  /**
   * Graceful shutdown
   */
  async gracefulShutdown() {
    this.logger.info('Initiating graceful shutdown');
    this.systemStatus = 'shutting_down';
    
    try {
      // Stop accepting new tasks
      this.taskQueue.pause();
      
      // Wait for current tasks to complete (with timeout)
      await Promise.race([
        this.taskQueue.onIdle(),
        new Promise(resolve => setTimeout(resolve, 30000)) // 30 second timeout
      ]);
      
      // Terminate all agents
      const terminationPromises = Array.from(this.activeAgents.values())
        .map(agent => agent.terminate().catch(err => 
          this.logger.error('Agent termination failed', { agentId: agent.id, error: err.message })
        ));
      
      await Promise.allSettled(terminationPromises);
      
      this.systemStatus = 'terminated';
      this.logger.info('Graceful shutdown completed');
      
    } catch (error) {
      this.logger.error('Shutdown error', { error: error.message });
    }
  }
  
  // Helper methods
  canCreateNewAgent() {
    return this.activeAgents.size < this.maxConcurrentAgents;
  }
  
  getTaskPriority(task) {
    const priorityMap = {
      'critical': 10,
      'high': 7,
      'medium': 5,
      'low': 3,
      'background': 1
    };
    return priorityMap[task.priority] || 5;
  }
  
  createAgentMetrics(agentId) {
    const metrics = {
      agentId,
      createdAt: Date.now(),
      tasksCompleted: 0,
      tasksFailures: 0,
      totalExecutionTime: 0,
      averageExecutionTime: 0
    };
    this.agentMetrics.set(agentId, metrics);
    return metrics;
  }
  
  updateAgentStatus(agentId, status, task = null, error = null) {
    const agent = this.activeAgents.get(agentId);
    if (agent) {
      agent.state = status;
      if (task) agent.currentTask = task;
      if (error) agent.lastError = error;
      agent.lastActivity = Date.now();
    }
  }
  
  async considerAgentReplacement(agentId) {
    const metrics = this.agentMetrics.get(agentId);
    if (metrics && metrics.tasksFailures > 3) {
      this.logger.warn('Agent marked for replacement due to failures', { agentId, metrics });
      await this.replaceAgent(agentId);
    }
  }
}

/**
 * Task coordination helper class
 */
class TaskCoordinator {
  constructor(coordinationId, orchestrator) {
    this.coordinationId = coordinationId;
    this.orchestrator = orchestrator;
    this.dependencyMap = new Map();
    this.completionEvents = new EventEmitter();
  }
  
  groupTasksByDependencies(tasks) {
    // Build dependency graph
    const graph = new Map();
    const inDegree = new Map();
    
    tasks.forEach(task => {
      graph.set(task.id, []);
      inDegree.set(task.id, 0);
    });
    
    tasks.forEach(task => {
      if (task.dependencies) {
        task.dependencies.forEach(depId => {
          if (graph.has(depId)) {
            graph.get(depId).push(task.id);
            inDegree.set(task.id, inDegree.get(task.id) + 1);
          }
        });
      }
    });
    
    // Topological sort to get execution groups
    const groups = [];
    const queue = tasks.filter(task => inDegree.get(task.id) === 0);
    
    while (queue.length > 0) {
      const currentGroup = [...queue];
      groups.push(currentGroup);
      queue.length = 0;
      
      currentGroup.forEach(task => {
        graph.get(task.id).forEach(dependentId => {
          inDegree.set(dependentId, inDegree.get(dependentId) - 1);
          if (inDegree.get(dependentId) === 0) {
            queue.push(tasks.find(t => t.id === dependentId));
          }
        });
      });
    }
    
    return groups;
  }
  
  async waitForDependencies(task, results) {
    if (!task.dependencies) return;
    
    const waitPromises = task.dependencies.map(depId => {
      if (results.has(depId)) {
        return Promise.resolve(results.get(depId));
      }
      
      return new Promise((resolve) => {
        this.completionEvents.once(`completed:${depId}`, resolve);
      });
    });
    
    await Promise.all(waitPromises);
  }
  
  notifyDependents(taskId, result) {
    this.completionEvents.emit(`completed:${taskId}`, result);
  }
  
  handleGroupFailure(group, failures) {
    this.orchestrator.logger.error('Task group failure', {
      coordinationId: this.coordinationId,
      group: group.map(t => t.id),
      failures: failures.map(f => f.reason?.message || f.reason)
    });
  }
}

export default AgentOrchestrator;