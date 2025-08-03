import { EventEmitter } from 'eventemitter3';
import { v4 as uuidv4 } from 'uuid';
import winston from 'winston';
import Joi from 'joi';
import fs from 'fs/promises';
import path from 'path';
import { MetricsCollector } from '../utils/metrics.js';
import { ToolManager } from '../utils/tools.js';
import { ValidationTrigger } from '../validation/ValidationTrigger.js';

/**
 * Base class for all Pantheon agents
 * Provides core functionality for agent lifecycle, validation, and execution
 */
export class PantheonAgent extends EventEmitter {
  constructor(config) {
    super();
    
    // Validate configuration
    this.validateConfig(config);
    
    // Core properties
    this.id = uuidv4();
    this.name = config.name;
    this.description = config.description;
    this.model = config.model;
    this.collaborationMode = config.collaboration_mode;
    this.specialization = config.specialization;
    
    // State management
    this.state = 'initialized';
    this.createdAt = new Date();
    this.lastActivity = new Date();
    
    // Tool management
    this.tools = new ToolManager(config.tools, this.getToolRestrictions());
    
    // Validation configuration
    this.validationRequired = config.validation_required || false;
    this.autoValidation = config.auto_validation || false;
    this.validationTrigger = this.validationRequired 
      ? new ValidationTrigger(this, config.validation_config)
      : null;
    
    // Permissions
    this.codeWriting = config.code_writing || 'ALLOWED';
    this.fileModification = config.file_modification || 'ALLOWED';
    this.commandExecution = config.command_execution || 'ALLOWED';
    
    // Performance
    this.maxTokens = config.max_tokens || 4096;
    this.timeoutMs = config.timeout_ms || 30000;
    this.retryPolicy = config.retry_policy || {
      max_retries: 3,
      backoff_multiplier: 2,
      initial_delay_ms: 1000
    };
    
    // Metrics
    this.metrics = new MetricsCollector(this);
    
    // Logging
    this.logger = this.setupLogger();
    
    // Initialize
    this.initialize();
  }
  
  /**
   * Validate agent configuration against schema
   */
  validateConfig(config) {
    const schema = Joi.object({
      name: Joi.string().pattern(/^[a-z][a-z0-9-]*$/).required(),
      description: Joi.string().required(),
      model: Joi.string().valid(
        'auto', 'claude-sonnet', 'claude-haiku', 'claude-opus',
        'gemini-2.5-pro', 'gemini-2.5-flash', 'gemini-pro', 'gemini-flash'
      ).required(),
      tools: Joi.array().items(Joi.string()).required(),
      collaboration_mode: Joi.string().valid(
        'creator', 'advisor', 'designer', 'manager', 'specialist', 'validator'
      ).required(),
      code_writing: Joi.string().valid('ALLOWED', 'FORBIDDEN').optional(),
      file_modification: Joi.string().valid('ALLOWED', 'FORBIDDEN').optional(),
      command_execution: Joi.string().valid('ALLOWED', 'FORBIDDEN').optional(),
      validation_required: Joi.boolean().optional(),
      auto_validation: Joi.boolean().optional(),
      specialization: Joi.string().optional(),
      max_tokens: Joi.number().min(100).max(100000).optional(),
      timeout_ms: Joi.number().min(1000).max(600000).optional(),
      retry_policy: Joi.object({
        max_retries: Joi.number().min(0).max(10),
        backoff_multiplier: Joi.number().min(1).max(5),
        initial_delay_ms: Joi.number().min(100).max(10000)
      }).optional(),
      validation_config: Joi.object().optional()
    });
    
    const { error } = schema.validate(config);
    if (error) {
      throw new Error(`Invalid agent configuration: ${error.message}`);
    }
  }
  
  /**
   * Get tool restrictions based on agent type and model
   */
  getToolRestrictions() {
    const restrictions = [];
    
    // Gemini models never write code
    if (this.model.includes('gemini')) {
      restrictions.push('no_edit', 'no_write', 'no_execute');
      this.codeWriting = 'FORBIDDEN';
      this.fileModification = 'FORBIDDEN';
      this.commandExecution = 'FORBIDDEN';
    }
    
    // Validation agents are read-only
    if (this.collaborationMode === 'validator') {
      restrictions.push('no_edit', 'no_write', 'no_execute', 'no_create', 'no_delete');
    }
    
    // Apply specific restrictions
    if (this.codeWriting === 'FORBIDDEN') {
      restrictions.push('no_edit', 'no_write');
    }
    
    if (this.fileModification === 'FORBIDDEN') {
      restrictions.push('no_file_modification');
    }
    
    if (this.commandExecution === 'FORBIDDEN') {
      restrictions.push('no_bash', 'no_execute');
    }
    
    return [...new Set(restrictions)]; // Remove duplicates
  }
  
  /**
   * Setup Winston logger for this agent
   */
  setupLogger() {
    return winston.createLogger({
      level: process.env.PANTHEON_LOG_LEVEL || 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json()
      ),
      defaultMeta: { 
        agent: this.name,
        agentId: this.id,
        model: this.model
      },
      transports: [
        new winston.transports.File({
          filename: path.join('.claude', 'logs', `${this.name}.log`),
          maxsize: 5242880, // 5MB
          maxFiles: 5
        }),
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple()
          )
        })
      ]
    });
  }
  
  /**
   * Initialize the agent
   */
  async initialize() {
    this.logger.info('Agent initializing', {
      name: this.name,
      model: this.model,
      tools: this.tools.getAvailableTools(),
      restrictions: this.getToolRestrictions()
    });
    
    this.state = 'ready';
    this.emit('initialized', { agent: this });
  }
  
  /**
   * Main execution method - must be overridden by subclasses
   */
  async execute(task) {
    this.state = 'executing';
    this.lastActivity = new Date();
    const startTime = Date.now();
    
    try {
      this.logger.info('Executing task', { task: task.type, taskId: task.id });
      
      // Pre-execution validation
      if (this.validationRequired && this.autoValidation) {
        await this.preExecutionValidation(task);
      }
      
      // Execute with monitoring
      const result = await this.withTimeout(
        this.performTask(task),
        this.timeoutMs
      );
      
      // Post-execution validation
      if (this.validationRequired && this.autoValidation) {
        const validationResult = await this.postExecutionValidation(result);
        if (validationResult.requiresRefinement) {
          return await this.refine(result, validationResult.feedback);
        }
      }
      
      // Record metrics
      this.metrics.record({
        task: task.type,
        duration: Date.now() - startTime,
        success: true,
        tokensUsed: result.tokensUsed || 0
      });
      
      this.state = 'ready';
      this.emit('taskCompleted', { task, result });
      
      return result;
      
    } catch (error) {
      this.state = 'error';
      this.logger.error('Task execution failed', { error: error.message, task });
      
      // Record failure metrics
      this.metrics.record({
        task: task.type,
        duration: Date.now() - startTime,
        success: false,
        error: error.message
      });
      
      // Attempt retry if configured
      if (await this.shouldRetry(error, task)) {
        return await this.retryExecution(task);
      }
      
      this.emit('taskFailed', { task, error });
      throw error;
    }
  }
  
  /**
   * Perform the actual task - must be overridden by subclasses
   */
  async performTask(task) {
    throw new Error('performTask must be implemented by subclass');
  }
  
  /**
   * Pre-execution validation
   */
  async preExecutionValidation(task) {
    if (!this.validationTrigger) return;
    
    const validation = await this.validationTrigger.validate('pre-execution', {
      agent: this.name,
      task: task,
      model: this.model
    });
    
    if (!validation.passed) {
      throw new Error(`Pre-execution validation failed: ${validation.reason}`);
    }
    
    return validation;
  }
  
  /**
   * Post-execution validation
   */
  async postExecutionValidation(result) {
    if (!this.validationTrigger) return { requiresRefinement: false };
    
    const validation = await this.validationTrigger.validate('post-execution', {
      agent: this.name,
      result: result,
      model: this.model
    });
    
    this.logger.info('Post-execution validation', { 
      passed: validation.passed,
      requiresRefinement: validation.requiresRefinement 
    });
    
    return validation;
  }
  
  /**
   * Refine result based on validation feedback
   */
  async refine(result, feedback) {
    this.logger.info('Refining result based on feedback', { feedback });
    
    // Default refinement - subclasses should override
    return {
      ...result,
      refined: true,
      refinementFeedback: feedback,
      refinedAt: new Date()
    };
  }
  
  /**
   * Execute with timeout
   */
  async withTimeout(promise, timeoutMs) {
    return Promise.race([
      promise,
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error(`Operation timed out after ${timeoutMs}ms`)), timeoutMs)
      )
    ]);
  }
  
  /**
   * Determine if task should be retried
   */
  async shouldRetry(error, task) {
    const retryCount = task.retryCount || 0;
    
    if (retryCount >= this.retryPolicy.max_retries) {
      return false;
    }
    
    // Don't retry validation failures
    if (error.message.includes('validation failed')) {
      return false;
    }
    
    // Retry on timeout or transient errors
    const retriableErrors = ['timeout', 'ECONNRESET', 'ETIMEDOUT', 'rate_limit'];
    return retriableErrors.some(e => error.message.toLowerCase().includes(e));
  }
  
  /**
   * Retry task execution with exponential backoff
   */
  async retryExecution(task) {
    const retryCount = (task.retryCount || 0) + 1;
    const delay = this.retryPolicy.initial_delay_ms * 
                  Math.pow(this.retryPolicy.backoff_multiplier, retryCount - 1);
    
    this.logger.info(`Retrying task (attempt ${retryCount})`, { task, delay });
    
    await new Promise(resolve => setTimeout(resolve, delay));
    
    return this.execute({ ...task, retryCount });
  }
  
  /**
   * Get agent status
   */
  getStatus() {
    return {
      id: this.id,
      name: this.name,
      model: this.model,
      state: this.state,
      collaborationMode: this.collaborationMode,
      createdAt: this.createdAt,
      lastActivity: this.lastActivity,
      metrics: this.metrics.getSummary(),
      tools: this.tools.getAvailableTools(),
      restrictions: this.getToolRestrictions()
    };
  }
  
  /**
   * Pause agent execution
   */
  pause() {
    this.state = 'paused';
    this.emit('paused', { agent: this });
    this.logger.info('Agent paused');
  }
  
  /**
   * Resume agent execution
   */
  resume() {
    this.state = 'ready';
    this.emit('resumed', { agent: this });
    this.logger.info('Agent resumed');
  }
  
  /**
   * Terminate agent
   */
  async terminate() {
    this.state = 'terminated';
    this.emit('terminated', { agent: this });
    this.logger.info('Agent terminated');
    
    // Cleanup resources
    await this.metrics.flush();
    this.removeAllListeners();
  }
  
  /**
   * Handle errors
   */
  handleError(error) {
    this.logger.error('Agent error', { error: error.message, stack: error.stack });
    this.emit('error', { agent: this, error });
  }
}