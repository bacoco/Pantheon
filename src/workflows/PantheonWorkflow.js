import { EventEmitter } from 'eventemitter3';
import { v4 as uuidv4 } from 'uuid';
import winston from 'winston';
import fs from 'fs/promises';
import path from 'path';
import yaml from 'yaml';
import { getRegistry } from '../agents/AgentRegistry.js';
import { getIntegratedRouter } from '../router/index.js';

/**
 * Pantheon Workflow - Orchestrates complex multi-agent workflows
 */
export class PantheonWorkflow extends EventEmitter {
  constructor(definition, config = {}) {
    super();
    
    // Workflow definition
    this.id = uuidv4();
    this.name = definition.name;
    this.version = definition.version || '1.0.0';
    this.description = definition.description;
    this.stages = definition.stages || {};
    this.triggers = definition.triggers || ['manual'];
    this.parameters = definition.parameters || [];
    this.globalSettings = definition.global_settings || {};
    this.errorHandling = definition.error_handling || {};
    
    // Configuration
    this.config = {
      maxParallelStages: this.globalSettings.max_parallel_stages || 3,
      totalTimeout: this.parseTimeout(this.globalSettings.total_timeout) || 3600000, // 1 hour default
      validationMode: this.globalSettings.validation_mode || 'strict',
      costLimit: this.globalSettings.cost_limit || null,
      notificationChannels: this.globalSettings.notification_channels || ['console'],
      ...config
    };
    
    // State management
    this.state = 'initialized';
    this.startTime = null;
    this.endTime = null;
    this.currentStage = null;
    this.completedStages = new Set();
    this.failedStages = new Set();
    this.stageResults = new Map();
    this.stageMetrics = new Map();
    
    // Execution control
    this.executionContext = {};
    this.parallelExecutions = new Map();
    this.pendingDependencies = new Map();
    this.retryCount = new Map();
    
    // Services
    this.agentRegistry = getRegistry();
    this.router = getIntegratedRouter();
    
    // Metrics
    this.metrics = {
      totalStages: Object.keys(this.stages).length,
      completedStages: 0,
      failedStages: 0,
      totalDuration: 0,
      stageDurations: {},
      totalCost: 0,
      validations: {
        total: 0,
        passed: 0,
        failed: 0
      }
    };
    
    // Logger
    this.logger = this.setupLogger();
    
    // Validate workflow definition
    this.validateDefinition();
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
      defaultMeta: { 
        service: 'pantheon-workflow',
        workflowId: this.id,
        workflowName: this.name
      },
      transports: [
        new winston.transports.File({ 
          filename: `.claude/logs/workflow-${this.name}.log`,
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
   * Validate workflow definition
   */
  validateDefinition() {
    // Check for circular dependencies
    for (const [stageName, stage] of Object.entries(this.stages)) {
      if (stage.depends_on) {
        this.checkCircularDependency(stageName, stage.depends_on, new Set());
      }
    }
    
    // Validate agent assignments
    for (const [stageName, stage] of Object.entries(this.stages)) {
      if (!stage.agent) {
        throw new Error(`Stage ${stageName} missing required 'agent' field`);
      }
    }
    
    this.logger.info('Workflow definition validated', {
      stages: Object.keys(this.stages).length,
      hasParallel: this.hasParallelStages()
    });
  }
  
  /**
   * Check for circular dependencies
   */
  checkCircularDependency(stageName, dependencies, visited) {
    if (visited.has(stageName)) {
      throw new Error(`Circular dependency detected involving stage: ${stageName}`);
    }
    
    visited.add(stageName);
    
    for (const dep of dependencies) {
      const depStage = this.stages[dep];
      if (depStage && depStage.depends_on) {
        this.checkCircularDependency(dep, depStage.depends_on, new Set(visited));
      }
    }
  }
  
  /**
   * Execute workflow
   */
  async execute(params = {}) {
    if (this.state === 'running') {
      throw new Error('Workflow already running');
    }
    
    this.logger.info('Starting workflow execution', { params });
    
    try {
      // Initialize execution
      this.state = 'running';
      this.startTime = new Date();
      this.executionContext = { ...params };
      
      // Emit start event
      this.emit('workflowStarted', {
        workflow: this.name,
        id: this.id,
        params: params
      });
      
      // Set global timeout
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => {
          reject(new Error(`Workflow timeout after ${this.config.totalTimeout}ms`));
        }, this.config.totalTimeout);
      });
      
      // Execute workflow with timeout
      const result = await Promise.race([
        this.executeStages(),
        timeoutPromise
      ]);
      
      // Complete workflow
      this.state = 'completed';
      this.endTime = new Date();
      this.metrics.totalDuration = this.endTime - this.startTime;
      
      this.logger.info('Workflow completed successfully', {
        duration: this.metrics.totalDuration,
        completedStages: this.metrics.completedStages
      });
      
      this.emit('workflowCompleted', {
        workflow: this.name,
        id: this.id,
        result: result,
        metrics: this.metrics
      });
      
      return {
        success: true,
        workflowId: this.id,
        results: this.stageResults,
        metrics: this.metrics
      };
      
    } catch (error) {
      // Handle workflow failure
      this.state = 'failed';
      this.endTime = new Date();
      
      this.logger.error('Workflow failed', { error: error.message });
      
      this.emit('workflowFailed', {
        workflow: this.name,
        id: this.id,
        error: error,
        completedStages: Array.from(this.completedStages),
        failedStages: Array.from(this.failedStages)
      });
      
      // Handle error based on configuration
      await this.handleWorkflowError(error);
      
      throw error;
    }
  }
  
  /**
   * Execute workflow stages
   */
  async executeStages() {
    // Identify initial stages (no dependencies)
    const initialStages = this.getInitialStages();
    
    // Execute stages
    const executionQueue = [...initialStages];
    const executing = new Map();
    
    while (executionQueue.length > 0 || executing.size > 0) {
      // Start parallel executions up to limit
      while (executionQueue.length > 0 && executing.size < this.config.maxParallelStages) {
        const stageName = executionQueue.shift();
        
        // Check if dependencies are met
        if (this.areDependenciesMet(stageName)) {
          const execution = this.executeStage(stageName);
          executing.set(stageName, execution);
          
          // Handle completion
          execution.then(() => {
            executing.delete(stageName);
            
            // Add dependent stages to queue
            const dependents = this.getDependentStages(stageName);
            for (const dep of dependents) {
              if (!executionQueue.includes(dep) && !this.completedStages.has(dep)) {
                executionQueue.push(dep);
              }
            }
          }).catch(error => {
            executing.delete(stageName);
            
            // Handle stage failure
            this.handleStageFailure(stageName, error);
          });
        } else {
          // Put back in queue if dependencies not met
          executionQueue.push(stageName);
        }
      }
      
      // Wait for at least one execution to complete
      if (executing.size > 0) {
        await Promise.race(Array.from(executing.values()));
      }
    }
    
    // Check if all stages completed
    if (this.completedStages.size !== Object.keys(this.stages).length) {
      throw new Error('Not all stages completed successfully');
    }
    
    return this.aggregateResults();
  }
  
  /**
   * Execute a single stage
   */
  async executeStage(stageName) {
    const stage = this.stages[stageName];
    const stageStartTime = Date.now();
    
    this.logger.info(`Executing stage: ${stageName}`, {
      agent: stage.agent,
      dependencies: stage.depends_on
    });
    
    this.currentStage = stageName;
    
    this.emit('stageStarted', {
      workflow: this.name,
      stage: stageName,
      agent: stage.agent
    });
    
    try {
      // Get or create agent
      const agent = await this.getAgent(stage.agent);
      
      // Prepare task
      const task = {
        type: this.getTaskType(stage),
        data: {
          ...this.executionContext,
          stage: stageName,
          task: stage.task,
          previousResults: this.getPreviousResults(stage.depends_on),
          workflowContext: {
            workflowId: this.id,
            workflowName: this.name,
            stageName: stageName
          }
        }
      };
      
      // Apply timeout if specified
      let executionPromise = agent.execute(task);
      
      if (stage.timeout) {
        const timeout = this.parseTimeout(stage.timeout);
        executionPromise = Promise.race([
          executionPromise,
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error(`Stage timeout: ${stageName}`)), timeout)
          )
        ]);
      }
      
      // Execute stage
      const result = await executionPromise;
      
      // Check gates if specified
      if (stage.gates) {
        await this.checkGates(stageName, stage.gates, result);
      }
      
      // Check success criteria
      if (stage.success_criteria) {
        this.checkSuccessCriteria(stageName, stage.success_criteria, result);
      }
      
      // Handle validation if required
      if (stage.validation_required || this.config.validationMode === 'strict') {
        await this.validateStageResult(stageName, result);
      }
      
      // Store results
      this.stageResults.set(stageName, result);
      this.completedStages.add(stageName);
      
      // Record metrics
      const stageDuration = Date.now() - stageStartTime;
      this.stageMetrics.set(stageName, {
        duration: stageDuration,
        success: true,
        agent: stage.agent
      });
      
      this.metrics.completedStages++;
      this.metrics.stageDurations[stageName] = stageDuration;
      
      this.logger.info(`Stage completed: ${stageName}`, {
        duration: stageDuration,
        success: true
      });
      
      this.emit('stageCompleted', {
        workflow: this.name,
        stage: stageName,
        result: result,
        duration: stageDuration
      });
      
      return result;
      
    } catch (error) {
      // Handle stage failure
      const stageDuration = Date.now() - stageStartTime;
      
      this.stageMetrics.set(stageName, {
        duration: stageDuration,
        success: false,
        error: error.message,
        agent: stage.agent
      });
      
      this.failedStages.add(stageName);
      this.metrics.failedStages++;
      
      this.logger.error(`Stage failed: ${stageName}`, {
        error: error.message,
        duration: stageDuration
      });
      
      this.emit('stageFailed', {
        workflow: this.name,
        stage: stageName,
        error: error,
        duration: stageDuration
      });
      
      // Check retry policy
      if (await this.shouldRetryStage(stageName, stage, error)) {
        return await this.retryStage(stageName);
      }
      
      // Check on_failure action
      if (stage.on_failure === 'continue') {
        // Mark as completed with error
        this.completedStages.add(stageName);
        this.stageResults.set(stageName, { error: error.message });
        return null;
      } else if (stage.on_failure === 'skip') {
        // Skip this stage
        this.completedStages.add(stageName);
        return null;
      } else if (stage.on_failure === 'fallback' && stage.fallback_agent) {
        // Try fallback agent
        return await this.executeFallbackStage(stageName, stage);
      }
      
      throw error;
    }
  }
  
  /**
   * Get agent for stage execution
   */
  async getAgent(agentName) {
    let agent = this.agentRegistry.getAgentByName(agentName);
    
    if (!agent) {
      // Create agent if it doesn't exist
      agent = await this.agentRegistry.createAgent(agentName);
    }
    
    return agent;
  }
  
  /**
   * Get initial stages (no dependencies)
   */
  getInitialStages() {
    const initial = [];
    
    for (const [stageName, stage] of Object.entries(this.stages)) {
      if (!stage.depends_on || stage.depends_on.length === 0) {
        initial.push(stageName);
      }
    }
    
    return initial;
  }
  
  /**
   * Check if stage dependencies are met
   */
  areDependenciesMet(stageName) {
    const stage = this.stages[stageName];
    
    if (!stage.depends_on || stage.depends_on.length === 0) {
      return true;
    }
    
    for (const dep of stage.depends_on) {
      if (!this.completedStages.has(dep)) {
        return false;
      }
    }
    
    return true;
  }
  
  /**
   * Get stages that depend on a given stage
   */
  getDependentStages(completedStage) {
    const dependents = [];
    
    for (const [stageName, stage] of Object.entries(this.stages)) {
      if (stage.depends_on && stage.depends_on.includes(completedStage)) {
        dependents.push(stageName);
      }
    }
    
    return dependents;
  }
  
  /**
   * Get previous results for dependencies
   */
  getPreviousResults(dependencies) {
    if (!dependencies || dependencies.length === 0) {
      return {};
    }
    
    const results = {};
    
    for (const dep of dependencies) {
      if (this.stageResults.has(dep)) {
        results[dep] = this.stageResults.get(dep);
      }
    }
    
    return results;
  }
  
  /**
   * Check gates for stage
   */
  async checkGates(stageName, gates, result) {
    for (const gate of gates) {
      // Parse gate condition
      const passed = await this.evaluateGate(gate, result);
      
      if (!passed) {
        throw new Error(`Stage ${stageName} failed gate: ${gate}`);
      }
    }
  }
  
  /**
   * Evaluate a gate condition
   */
  async evaluateGate(gate, result) {
    // Simple gate evaluation (would be more complex in production)
    if (gate === 'no_critical_issues') {
      return !result.criticalIssues || result.criticalIssues.length === 0;
    }
    
    if (gate.startsWith('severity <')) {
      const threshold = parseInt(gate.split('<')[1].trim());
      return result.severity < threshold;
    }
    
    // Default to passed
    return true;
  }
  
  /**
   * Check success criteria
   */
  checkSuccessCriteria(stageName, criteria, result) {
    for (const [key, value] of Object.entries(criteria)) {
      if (key === 'coverage' && result.coverage < value) {
        throw new Error(`Stage ${stageName} failed success criteria: coverage < ${value}`);
      }
      
      if (key === 'all_tests_pass' && value && !result.allTestsPass) {
        throw new Error(`Stage ${stageName} failed success criteria: not all tests passed`);
      }
    }
  }
  
  /**
   * Validate stage result
   */
  async validateStageResult(stageName, result) {
    this.metrics.validations.total++;
    
    // Trigger validation through agent system
    const validationResult = await this.agentRegistry.handleValidationRequest(
      { name: stageName },
      {
        type: 'stage_result',
        data: result,
        validator: 'gemini-advisor'
      }
    );
    
    if (validationResult && validationResult.passed) {
      this.metrics.validations.passed++;
    } else {
      this.metrics.validations.failed++;
      
      if (this.config.validationMode === 'strict') {
        throw new Error(`Stage ${stageName} failed validation`);
      }
    }
    
    return validationResult;
  }
  
  /**
   * Should retry stage
   */
  async shouldRetryStage(stageName, stage, error) {
    const retryPolicy = stage.retry_policy || {};
    const maxRetries = retryPolicy.max_retries || 0;
    
    const currentRetries = this.retryCount.get(stageName) || 0;
    
    if (currentRetries >= maxRetries) {
      return false;
    }
    
    // Check if error is retryable
    const retryableErrors = ['timeout', 'rate_limit', 'temporary_failure'];
    const isRetryable = retryableErrors.some(e => 
      error.message.toLowerCase().includes(e)
    );
    
    return isRetryable;
  }
  
  /**
   * Retry stage execution
   */
  async retryStage(stageName) {
    const currentRetries = this.retryCount.get(stageName) || 0;
    this.retryCount.set(stageName, currentRetries + 1);
    
    this.logger.info(`Retrying stage: ${stageName} (attempt ${currentRetries + 1})`);
    
    // Exponential backoff
    const delay = Math.min(1000 * Math.pow(2, currentRetries), 30000);
    await new Promise(resolve => setTimeout(resolve, delay));
    
    return await this.executeStage(stageName);
  }
  
  /**
   * Execute fallback stage
   */
  async executeFallbackStage(stageName, stage) {
    this.logger.info(`Executing fallback for stage: ${stageName}`, {
      fallbackAgent: stage.fallback_agent
    });
    
    const originalAgent = stage.agent;
    stage.agent = stage.fallback_agent;
    
    try {
      return await this.executeStage(stageName);
    } finally {
      stage.agent = originalAgent;
    }
  }
  
  /**
   * Handle stage failure
   */
  handleStageFailure(stageName, error) {
    const stage = this.stages[stageName];
    
    if (stage.on_failure === 'fail' || !stage.on_failure) {
      // Default behavior - fail the workflow
      throw error;
    }
    
    // Other failure modes handled in executeStage
  }
  
  /**
   * Handle workflow error
   */
  async handleWorkflowError(error) {
    const errorHandling = this.errorHandling;
    
    switch (errorHandling.on_stage_failure) {
      case 'rollback':
        await this.rollback();
        break;
      case 'notify':
        await this.notifyError(error);
        break;
      case 'continue':
        // Allow partial completion
        break;
      default:
        // Abort is default
        break;
    }
  }
  
  /**
   * Rollback completed stages
   */
  async rollback() {
    this.logger.info('Rolling back workflow');
    
    // Execute rollback in reverse order
    const completed = Array.from(this.completedStages).reverse();
    
    for (const stageName of completed) {
      const stage = this.stages[stageName];
      
      if (stage.rollback) {
        try {
          await this.executeRollback(stageName, stage);
        } catch (error) {
          this.logger.error(`Rollback failed for stage: ${stageName}`, {
            error: error.message
          });
        }
      }
    }
  }
  
  /**
   * Notify error through configured channels
   */
  async notifyError(error) {
    for (const channel of this.config.notificationChannels) {
      switch (channel) {
        case 'console':
          console.error(`Workflow error: ${error.message}`);
          break;
        case 'webhook':
          // Would send webhook notification
          break;
        case 'email':
          // Would send email notification
          break;
      }
    }
  }
  
  /**
   * Aggregate results from all stages
   */
  aggregateResults() {
    const results = {};
    
    for (const [stageName, result] of this.stageResults) {
      results[stageName] = result;
    }
    
    return results;
  }
  
  /**
   * Get task type from stage
   */
  getTaskType(stage) {
    if (stage.task_type) {
      return stage.task_type;
    }
    
    // Infer from task description
    const task = stage.task || '';
    
    if (task.includes('validate') || task.includes('review')) {
      return 'validation';
    }
    if (task.includes('implement') || task.includes('create')) {
      return 'creation';
    }
    if (task.includes('design') || task.includes('architect')) {
      return 'architecture';
    }
    
    return 'generic';
  }
  
  /**
   * Parse timeout string
   */
  parseTimeout(timeoutStr) {
    if (!timeoutStr) return null;
    
    const match = timeoutStr.match(/^(\d+)([smh])$/);
    if (!match) return null;
    
    const value = parseInt(match[1]);
    const unit = match[2];
    
    switch (unit) {
      case 's': return value * 1000;
      case 'm': return value * 60 * 1000;
      case 'h': return value * 60 * 60 * 1000;
      default: return null;
    }
  }
  
  /**
   * Check if workflow has parallel stages
   */
  hasParallelStages() {
    const dependencyCounts = new Map();
    
    for (const [stageName, stage] of Object.entries(this.stages)) {
      if (stage.depends_on) {
        for (const dep of stage.depends_on) {
          dependencyCounts.set(dep, (dependencyCounts.get(dep) || 0) + 1);
        }
      }
    }
    
    // If any stage has multiple dependents, there's potential parallelism
    return Array.from(dependencyCounts.values()).some(count => count > 1);
  }
  
  /**
   * Get workflow status
   */
  getStatus() {
    return {
      id: this.id,
      name: this.name,
      state: this.state,
      progress: {
        total: this.metrics.totalStages,
        completed: this.metrics.completedStages,
        failed: this.metrics.failedStages,
        percentage: (this.metrics.completedStages / this.metrics.totalStages) * 100
      },
      currentStage: this.currentStage,
      completedStages: Array.from(this.completedStages),
      failedStages: Array.from(this.failedStages),
      duration: this.endTime ? this.endTime - this.startTime : Date.now() - this.startTime,
      metrics: this.metrics
    };
  }
  
  /**
   * Pause workflow execution
   */
  pause() {
    if (this.state !== 'running') {
      throw new Error('Workflow is not running');
    }
    
    this.state = 'paused';
    this.emit('workflowPaused', { workflow: this.name, id: this.id });
  }
  
  /**
   * Resume workflow execution
   */
  resume() {
    if (this.state !== 'paused') {
      throw new Error('Workflow is not paused');
    }
    
    this.state = 'running';
    this.emit('workflowResumed', { workflow: this.name, id: this.id });
  }
  
  /**
   * Cancel workflow execution
   */
  cancel() {
    this.state = 'cancelled';
    this.endTime = new Date();
    
    this.emit('workflowCancelled', {
      workflow: this.name,
      id: this.id,
      completedStages: Array.from(this.completedStages)
    });
  }
}

export default PantheonWorkflow;