import { EventEmitter } from 'eventemitter3';
import { v4 as uuidv4 } from 'uuid';
import { getRegistry } from '../agents/AgentRegistry.js';
import { CircuitBreaker } from '../utils/CircuitBreaker.js';
import { RetryPattern } from '../utils/RetryPattern.js';

/**
 * Validation Pipeline - Automated validation with triggers
 * Integrates Circuit Breaker and Retry patterns for resilience
 */
export class ValidationPipeline extends EventEmitter {
  constructor(config = {}) {
    super();
    
    // Configuration
    this.config = {
      autoValidation: config.autoValidation !== false,
      maxValidationRetries: config.maxValidationRetries || 2,
      validationTimeout: config.validationTimeout || 30000,
      parallelValidations: config.parallelValidations || 3,
      cacheValidations: config.cacheValidations !== false,
      cacheTTL: config.cacheTTL || 3600000, // 1 hour
      ...config
    };
    
    // Validation triggers
    this.triggers = new Map();
    this.activeTriggers = new Set();
    
    // Pipeline stages
    this.stages = [];
    this.stageHandlers = new Map();
    
    // Validation cache
    this.validationCache = new Map();
    
    // Circuit breaker for external validations
    this.circuitBreaker = new CircuitBreaker({
      name: 'validation-pipeline',
      failureThreshold: 3,
      timeout: 60000,
      resetTimeout: 30000
    });
    
    // Retry pattern for failed validations
    this.retryPattern = new RetryPattern({
      maxRetries: this.config.maxValidationRetries,
      initialDelay: 1000,
      strategy: 'exponential'
    });
    
    // Statistics
    this.statistics = {
      totalValidations: 0,
      successfulValidations: 0,
      failedValidations: 0,
      triggeredValidations: 0,
      cachedValidations: 0,
      averageValidationTime: 0
    };
    
    // Agent registry
    this.agentRegistry = getRegistry();
    
    // Initialize default triggers
    this.initializeDefaultTriggers();
    
    // Initialize default pipeline stages
    this.initializeDefaultStages();
  }
  
  /**
   * Initialize default triggers
   */
  initializeDefaultTriggers() {
    // Event-based triggers
    this.addTrigger('event', {
      name: 'task-completed',
      event: 'taskCompleted',
      condition: (data) => data.requiresValidation !== false,
      priority: 'high'
    });
    
    this.addTrigger('event', {
      name: 'code-modified',
      event: 'codeModified',
      condition: (data) => data.changes > 10,
      priority: 'medium'
    });
    
    this.addTrigger('event', {
      name: 'deployment-ready',
      event: 'deploymentReady',
      condition: () => true,
      priority: 'critical'
    });
    
    // Threshold-based triggers
    this.addTrigger('threshold', {
      name: 'error-rate',
      metric: 'errorRate',
      threshold: 0.05,
      operator: '>',
      priority: 'high'
    });
    
    this.addTrigger('threshold', {
      name: 'complexity',
      metric: 'codeComplexity',
      threshold: 10,
      operator: '>',
      priority: 'medium'
    });
    
    // Schedule-based triggers
    this.addTrigger('schedule', {
      name: 'daily-validation',
      cron: '0 0 * * *', // Daily at midnight
      priority: 'low'
    });
    
    // Manual triggers
    this.addTrigger('manual', {
      name: 'user-requested',
      priority: 'high'
    });
  }
  
  /**
   * Initialize default pipeline stages
   */
  initializeDefaultStages() {
    // Stage 1: Pre-validation
    this.addStage('pre-validation', {
      order: 1,
      required: true,
      handler: this.preValidationStage.bind(this)
    });
    
    // Stage 2: Syntax validation
    this.addStage('syntax', {
      order: 2,
      required: true,
      handler: this.syntaxValidationStage.bind(this)
    });
    
    // Stage 3: Security validation
    this.addStage('security', {
      order: 3,
      required: true,
      handler: this.securityValidationStage.bind(this)
    });
    
    // Stage 4: Logic validation
    this.addStage('logic', {
      order: 4,
      required: false,
      handler: this.logicValidationStage.bind(this)
    });
    
    // Stage 5: Performance validation
    this.addStage('performance', {
      order: 5,
      required: false,
      handler: this.performanceValidationStage.bind(this)
    });
    
    // Stage 6: Post-validation
    this.addStage('post-validation', {
      order: 6,
      required: true,
      handler: this.postValidationStage.bind(this)
    });
  }
  
  /**
   * Add a validation trigger
   */
  addTrigger(type, config) {
    const triggerId = uuidv4();
    const trigger = {
      id: triggerId,
      type,
      config,
      active: true,
      lastTriggered: null,
      triggerCount: 0
    };
    
    this.triggers.set(triggerId, trigger);
    
    // Set up trigger based on type
    switch (type) {
      case 'event':
        this.setupEventTrigger(trigger);
        break;
      case 'threshold':
        this.setupThresholdTrigger(trigger);
        break;
      case 'schedule':
        this.setupScheduleTrigger(trigger);
        break;
      case 'manual':
        // Manual triggers are handled on-demand
        break;
    }
    
    this.emit('triggerAdded', {
      id: triggerId,
      type,
      name: config.name
    });
    
    return triggerId;
  }
  
  /**
   * Setup event-based trigger
   */
  setupEventTrigger(trigger) {
    const handler = async (data) => {
      if (!trigger.active) return;
      
      // Check condition
      if (trigger.config.condition && !trigger.config.condition(data)) {
        return;
      }
      
      // Trigger validation
      await this.triggerValidation({
        triggerId: trigger.id,
        triggerType: 'event',
        triggerName: trigger.config.name,
        priority: trigger.config.priority,
        data
      });
    };
    
    // Listen for the event
    this.on(trigger.config.event, handler);
    
    // Store handler for cleanup
    trigger.handler = handler;
  }
  
  /**
   * Setup threshold-based trigger
   */
  setupThresholdTrigger(trigger) {
    // Poll metric at intervals
    const interval = trigger.config.interval || 60000; // Default 1 minute
    
    trigger.intervalId = setInterval(async () => {
      if (!trigger.active) return;
      
      // Get current metric value
      const value = await this.getMetricValue(trigger.config.metric);
      
      // Check threshold
      const exceeded = this.checkThreshold(
        value,
        trigger.config.threshold,
        trigger.config.operator
      );
      
      if (exceeded) {
        await this.triggerValidation({
          triggerId: trigger.id,
          triggerType: 'threshold',
          triggerName: trigger.config.name,
          priority: trigger.config.priority,
          data: {
            metric: trigger.config.metric,
            value,
            threshold: trigger.config.threshold
          }
        });
      }
    }, interval);
  }
  
  /**
   * Setup schedule-based trigger
   */
  setupScheduleTrigger(trigger) {
    // Simple interval-based scheduling (would use node-cron in production)
    const interval = this.parseSchedule(trigger.config.cron);
    
    trigger.intervalId = setInterval(async () => {
      if (!trigger.active) return;
      
      await this.triggerValidation({
        triggerId: trigger.id,
        triggerType: 'schedule',
        triggerName: trigger.config.name,
        priority: trigger.config.priority,
        data: {
          scheduledTime: new Date()
        }
      });
    }, interval);
  }
  
  /**
   * Trigger validation
   */
  async triggerValidation(context) {
    const trigger = this.triggers.get(context.triggerId);
    if (!trigger) return;
    
    trigger.lastTriggered = new Date();
    trigger.triggerCount++;
    
    this.statistics.triggeredValidations++;
    
    this.emit('validationTriggered', {
      triggerId: context.triggerId,
      triggerType: context.triggerType,
      triggerName: context.triggerName,
      priority: context.priority
    });
    
    // Execute validation pipeline
    const result = await this.execute(context.data, {
      trigger: context,
      priority: context.priority
    });
    
    return result;
  }
  
  /**
   * Execute validation pipeline
   */
  async execute(data, options = {}) {
    const pipelineId = uuidv4();
    const startTime = Date.now();
    
    this.statistics.totalValidations++;
    
    // Check cache
    if (this.config.cacheValidations && !options.skipCache) {
      const cacheKey = this.getCacheKey(data);
      const cached = this.getFromCache(cacheKey);
      
      if (cached) {
        this.statistics.cachedValidations++;
        
        this.emit('validationCached', {
          pipelineId,
          cacheKey
        });
        
        return cached;
      }
    }
    
    this.emit('pipelineStarted', {
      pipelineId,
      stageCount: this.stages.length,
      priority: options.priority
    });
    
    const results = {
      pipelineId,
      timestamp: new Date(),
      stages: {},
      passed: true,
      issues: [],
      duration: 0
    };
    
    try {
      // Execute with circuit breaker protection
      const pipelineResult = await this.circuitBreaker.execute(
        async () => {
          // Execute with retry pattern
          return await this.retryPattern.execute(
            async () => {
              // Sort stages by order
              const sortedStages = [...this.stages].sort((a, b) => a.order - b.order);
              
              // Execute each stage
              for (const stage of sortedStages) {
                const stageResult = await this.executeStage(stage, data, results, options);
                
                results.stages[stage.name] = stageResult;
                
                // Check if stage failed and is required
                if (!stageResult.passed && stage.required) {
                  results.passed = false;
                  
                  if (options.failFast) {
                    throw new Error(`Required stage '${stage.name}' failed`);
                  }
                }
                
                // Collect issues
                if (stageResult.issues) {
                  results.issues.push(...stageResult.issues);
                }
              }
              
              return results;
            }
          );
        },
        async () => {
          // Fallback: Return minimal validation
          return {
            ...results,
            fallback: true,
            passed: false,
            issues: [{
              severity: 'high',
              message: 'Validation circuit breaker open - using fallback'
            }]
          };
        }
      );
      
      results.duration = Date.now() - startTime;
      
      // Update statistics
      if (results.passed) {
        this.statistics.successfulValidations++;
      } else {
        this.statistics.failedValidations++;
      }
      
      this.updateAverageTime(results.duration);
      
      // Cache result
      if (this.config.cacheValidations) {
        const cacheKey = this.getCacheKey(data);
        this.cacheResult(cacheKey, results);
      }
      
      this.emit('pipelineCompleted', {
        pipelineId,
        passed: results.passed,
        duration: results.duration,
        issueCount: results.issues.length
      });
      
      return results;
      
    } catch (error) {
      this.statistics.failedValidations++;
      
      this.emit('pipelineFailed', {
        pipelineId,
        error: error.message
      });
      
      throw error;
    }
  }
  
  /**
   * Execute a single stage
   */
  async executeStage(stage, data, pipelineResults, options) {
    const stageStartTime = Date.now();
    
    this.emit('stageStarted', {
      pipelineId: pipelineResults.pipelineId,
      stageName: stage.name
    });
    
    try {
      const handler = this.stageHandlers.get(stage.name) || stage.handler;
      
      if (!handler) {
        throw new Error(`No handler found for stage '${stage.name}'`);
      }
      
      const stageResult = await handler(data, pipelineResults, options);
      
      stageResult.duration = Date.now() - stageStartTime;
      
      this.emit('stageCompleted', {
        pipelineId: pipelineResults.pipelineId,
        stageName: stage.name,
        passed: stageResult.passed,
        duration: stageResult.duration
      });
      
      return stageResult;
      
    } catch (error) {
      this.emit('stageFailed', {
        pipelineId: pipelineResults.pipelineId,
        stageName: stage.name,
        error: error.message
      });
      
      return {
        passed: false,
        error: error.message,
        duration: Date.now() - stageStartTime
      };
    }
  }
  
  /**
   * Pre-validation stage
   */
  async preValidationStage(data, pipelineResults, options) {
    const result = {
      passed: true,
      issues: [],
      checks: {}
    };
    
    // Check data structure
    if (!data || typeof data !== 'object') {
      result.passed = false;
      result.issues.push({
        severity: 'critical',
        type: 'data_structure',
        message: 'Invalid data structure for validation'
      });
    }
    
    // Check required fields
    const requiredFields = options.requiredFields || [];
    for (const field of requiredFields) {
      if (!data[field]) {
        result.passed = false;
        result.issues.push({
          severity: 'high',
          type: 'missing_field',
          message: `Required field '${field}' is missing`
        });
      }
    }
    
    result.checks.dataStructure = result.passed;
    
    return result;
  }
  
  /**
   * Syntax validation stage
   */
  async syntaxValidationStage(data, pipelineResults, options) {
    const result = {
      passed: true,
      issues: [],
      checks: {}
    };
    
    // Get Gemini validator for syntax checking
    const validator = await this.agentRegistry.getAgentByType('validator');
    
    if (!validator) {
      result.checks.validatorAvailable = false;
      return result;
    }
    
    try {
      const syntaxValidation = await validator.execute({
        type: 'syntax_validation',
        data: data
      });
      
      if (syntaxValidation.issues) {
        result.issues.push(...syntaxValidation.issues);
        result.passed = syntaxValidation.passed !== false;
      }
      
      result.checks.syntax = result.passed;
      
    } catch (error) {
      result.passed = false;
      result.issues.push({
        severity: 'high',
        type: 'syntax_error',
        message: `Syntax validation failed: ${error.message}`
      });
    }
    
    return result;
  }
  
  /**
   * Security validation stage
   */
  async securityValidationStage(data, pipelineResults, options) {
    const result = {
      passed: true,
      issues: [],
      checks: {}
    };
    
    // Security checks
    const securityPatterns = [
      { pattern: /api[_-]?key/i, type: 'api_key_exposure' },
      { pattern: /password\s*=\s*["'].*["']/i, type: 'hardcoded_password' },
      { pattern: /eval\s*\(/i, type: 'dangerous_eval' },
      { pattern: /innerHTML\s*=/i, type: 'xss_vulnerability' },
      { pattern: /\$\{.*\}/g, type: 'template_injection' }
    ];
    
    const codeString = JSON.stringify(data);
    
    for (const { pattern, type } of securityPatterns) {
      if (pattern.test(codeString)) {
        result.passed = false;
        result.issues.push({
          severity: 'critical',
          type: 'security',
          subtype: type,
          message: `Security issue detected: ${type.replace(/_/g, ' ')}`
        });
      }
    }
    
    result.checks.security = result.passed;
    
    return result;
  }
  
  /**
   * Logic validation stage
   */
  async logicValidationStage(data, pipelineResults, options) {
    const result = {
      passed: true,
      issues: [],
      checks: {}
    };
    
    // Get Gemini advisor for logic validation
    const advisor = await this.agentRegistry.getAgentByName('gemini-advisor');
    
    if (!advisor) {
      result.checks.advisorAvailable = false;
      return result;
    }
    
    try {
      const logicValidation = await advisor.execute({
        type: 'logic_validation',
        data: data
      });
      
      if (logicValidation.analysis?.issues) {
        for (const issue of logicValidation.analysis.issues) {
          if (issue.severity === 'critical' || issue.severity === 'high') {
            result.passed = false;
          }
          result.issues.push(issue);
        }
      }
      
      result.checks.logic = result.passed;
      
    } catch (error) {
      // Logic validation is optional, don't fail
      result.checks.logic = null;
    }
    
    return result;
  }
  
  /**
   * Performance validation stage
   */
  async performanceValidationStage(data, pipelineResults, options) {
    const result = {
      passed: true,
      issues: [],
      checks: {},
      metrics: {}
    };
    
    // Performance checks
    if (data.code) {
      // Check for performance anti-patterns
      const antiPatterns = [
        { pattern: /for.*for.*for/s, issue: 'Triple nested loops detected' },
        { pattern: /\.\*\.\*/g, issue: 'Greedy regex pattern detected' },
        { pattern: /document\.write/g, issue: 'document.write usage detected' },
        { pattern: /setTimeout.*0/g, issue: 'Zero timeout detected' }
      ];
      
      for (const { pattern, issue } of antiPatterns) {
        if (pattern.test(data.code)) {
          result.issues.push({
            severity: 'medium',
            type: 'performance',
            message: issue
          });
        }
      }
    }
    
    // Calculate complexity metrics
    if (data.metrics) {
      result.metrics = {
        cyclomaticComplexity: data.metrics.complexity || 0,
        linesOfCode: data.metrics.loc || 0,
        dependencies: data.metrics.dependencies || 0
      };
      
      // Check thresholds
      if (result.metrics.cyclomaticComplexity > 10) {
        result.issues.push({
          severity: 'medium',
          type: 'complexity',
          message: `High cyclomatic complexity: ${result.metrics.cyclomaticComplexity}`
        });
      }
    }
    
    result.checks.performance = result.issues.length === 0;
    
    return result;
  }
  
  /**
   * Post-validation stage
   */
  async postValidationStage(data, pipelineResults, options) {
    const result = {
      passed: true,
      summary: {},
      recommendations: []
    };
    
    // Summarize issues
    const issueCounts = {
      critical: 0,
      high: 0,
      medium: 0,
      low: 0
    };
    
    for (const issue of pipelineResults.issues) {
      issueCounts[issue.severity] = (issueCounts[issue.severity] || 0) + 1;
    }
    
    result.summary.issueCounts = issueCounts;
    result.summary.totalIssues = pipelineResults.issues.length;
    
    // Generate recommendations
    if (issueCounts.critical > 0) {
      result.recommendations.push({
        priority: 'critical',
        action: 'Address critical issues immediately before proceeding'
      });
    }
    
    if (issueCounts.high > 2) {
      result.recommendations.push({
        priority: 'high',
        action: 'Review and fix high-severity issues'
      });
    }
    
    if (pipelineResults.issues.length > 10) {
      result.recommendations.push({
        priority: 'medium',
        action: 'Consider refactoring to reduce overall issue count'
      });
    }
    
    // Determine if validation passed
    result.passed = issueCounts.critical === 0 && issueCounts.high < 3;
    
    return result;
  }
  
  /**
   * Add a pipeline stage
   */
  addStage(name, config) {
    const stage = {
      name,
      order: config.order || this.stages.length + 1,
      required: config.required !== false,
      handler: config.handler
    };
    
    this.stages.push(stage);
    
    if (config.handler) {
      this.stageHandlers.set(name, config.handler);
    }
    
    this.emit('stageAdded', {
      name,
      order: stage.order,
      required: stage.required
    });
    
    return stage;
  }
  
  /**
   * Remove a trigger
   */
  removeTrigger(triggerId) {
    const trigger = this.triggers.get(triggerId);
    if (!trigger) return false;
    
    // Clean up based on type
    if (trigger.intervalId) {
      clearInterval(trigger.intervalId);
    }
    
    if (trigger.handler && trigger.config.event) {
      this.off(trigger.config.event, trigger.handler);
    }
    
    this.triggers.delete(triggerId);
    
    this.emit('triggerRemoved', {
      id: triggerId,
      name: trigger.config.name
    });
    
    return true;
  }
  
  /**
   * Enable/disable trigger
   */
  setTriggerState(triggerId, active) {
    const trigger = this.triggers.get(triggerId);
    if (!trigger) return false;
    
    trigger.active = active;
    
    this.emit('triggerStateChanged', {
      id: triggerId,
      active
    });
    
    return true;
  }
  
  /**
   * Manual trigger
   */
  async manualTrigger(name, data = {}) {
    const trigger = Array.from(this.triggers.values())
      .find(t => t.config.name === name && t.type === 'manual');
    
    if (!trigger) {
      throw new Error(`Manual trigger '${name}' not found`);
    }
    
    return await this.triggerValidation({
      triggerId: trigger.id,
      triggerType: 'manual',
      triggerName: name,
      priority: trigger.config.priority || 'medium',
      data
    });
  }
  
  /**
   * Get metric value
   */
  async getMetricValue(metric) {
    // This would connect to actual metrics system
    // For now, return mock values
    const mockMetrics = {
      errorRate: 0.02,
      codeComplexity: 8,
      testCoverage: 0.75,
      performance: 0.95
    };
    
    return mockMetrics[metric] || 0;
  }
  
  /**
   * Check threshold
   */
  checkThreshold(value, threshold, operator) {
    switch (operator) {
      case '>': return value > threshold;
      case '>=': return value >= threshold;
      case '<': return value < threshold;
      case '<=': return value <= threshold;
      case '==': return value === threshold;
      case '!=': return value !== threshold;
      default: return false;
    }
  }
  
  /**
   * Parse schedule (simplified)
   */
  parseSchedule(cron) {
    // Simplified cron parsing - returns milliseconds
    if (cron === '0 0 * * *') return 24 * 60 * 60 * 1000; // Daily
    if (cron === '0 * * * *') return 60 * 60 * 1000; // Hourly
    return 60 * 60 * 1000; // Default to hourly
  }
  
  /**
   * Get cache key
   */
  getCacheKey(data) {
    return JSON.stringify(data);
  }
  
  /**
   * Get from cache
   */
  getFromCache(key) {
    const cached = this.validationCache.get(key);
    
    if (!cached) return null;
    
    // Check TTL
    if (Date.now() - cached.timestamp > this.config.cacheTTL) {
      this.validationCache.delete(key);
      return null;
    }
    
    return cached.result;
  }
  
  /**
   * Cache result
   */
  cacheResult(key, result) {
    this.validationCache.set(key, {
      timestamp: Date.now(),
      result
    });
    
    // Clean old cache entries
    if (this.validationCache.size > 100) {
      const oldestKey = this.validationCache.keys().next().value;
      this.validationCache.delete(oldestKey);
    }
  }
  
  /**
   * Update average time
   */
  updateAverageTime(duration) {
    const total = this.statistics.successfulValidations + this.statistics.failedValidations;
    this.statistics.averageValidationTime = 
      (this.statistics.averageValidationTime * (total - 1) + duration) / total;
  }
  
  /**
   * Get statistics
   */
  getStatistics() {
    return {
      ...this.statistics,
      triggers: {
        total: this.triggers.size,
        active: Array.from(this.triggers.values()).filter(t => t.active).length,
        byType: this.getTriggerStatsByType()
      },
      stages: {
        total: this.stages.length,
        required: this.stages.filter(s => s.required).length
      },
      cache: {
        size: this.validationCache.size,
        hitRate: this.statistics.cachedValidations / this.statistics.totalValidations
      },
      circuitBreaker: this.circuitBreaker.getStatus()
    };
  }
  
  /**
   * Get trigger stats by type
   */
  getTriggerStatsByType() {
    const stats = {};
    
    for (const trigger of this.triggers.values()) {
      if (!stats[trigger.type]) {
        stats[trigger.type] = {
          count: 0,
          active: 0,
          triggered: 0
        };
      }
      
      stats[trigger.type].count++;
      if (trigger.active) stats[trigger.type].active++;
      stats[trigger.type].triggered += trigger.triggerCount;
    }
    
    return stats;
  }
  
  /**
   * Export configuration
   */
  exportConfiguration() {
    return {
      config: this.config,
      triggers: Array.from(this.triggers.values()).map(t => ({
        type: t.type,
        config: t.config,
        active: t.active
      })),
      stages: this.stages.map(s => ({
        name: s.name,
        order: s.order,
        required: s.required
      }))
    };
  }
}

export default ValidationPipeline;