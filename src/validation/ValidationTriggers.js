import { EventEmitter } from 'eventemitter3';
import path from 'path';
import { ValidationOrchestrator } from './ValidationOrchestrator.js';

/**
 * Validation Triggers - Automatic validation at checkpoints
 */
export class ValidationTriggers extends EventEmitter {
  constructor(config = {}) {
    super();
    
    // Configuration
    this.config = {
      enabled: config.enabled !== false,
      debounceDelay: config.debounceDelay || 500,
      batchSize: config.batchSize || 5,
      checkpoints: {
        pre_commit: true,
        post_creation: true,
        pre_deployment: true,
        architecture_change: true,
        dependency_update: true,
        security_critical: true,
        ...config.checkpoints
      },
      rules: config.rules || this.getDefaultRules()
    };
    
    // State
    this.pendingValidations = new Map();
    this.validationQueue = [];
    this.processing = false;
    this.debounceTimers = new Map();
    
    // Validation orchestrator
    this.orchestrator = new ValidationOrchestrator(config.orchestratorConfig);
    
    // Statistics
    this.statistics = {
      totalTriggers: 0,
      automaticValidations: 0,
      manualValidations: 0,
      skippedValidations: 0,
      failedValidations: 0
    };
    
    // Initialize triggers
    if (this.config.enabled) {
      this.setupTriggers();
    }
  }
  
  /**
   * Get default validation rules
   */
  getDefaultRules() {
    return [
      {
        name: 'code_creation',
        pattern: /\.(js|ts|jsx|tsx|py|java|go|rust)$/,
        event: 'file_created',
        profile: 'code_quality',
        priority: 'medium'
      },
      {
        name: 'api_endpoint',
        pattern: /\/(routes|controllers|api)\//,
        event: 'file_modified',
        profile: 'security',
        priority: 'high'
      },
      {
        name: 'database_change',
        pattern: /\/(models|schemas|migrations)\//,
        event: 'file_modified',
        profile: 'architecture',
        priority: 'high'
      },
      {
        name: 'test_creation',
        pattern: /\.(test|spec)\.(js|ts|jsx|tsx)$/,
        event: 'file_created',
        profile: 'testing',
        priority: 'medium'
      },
      {
        name: 'config_change',
        pattern: /\.(json|yaml|yml|env|config)$/,
        event: 'file_modified',
        profile: 'compliance',
        priority: 'critical'
      },
      {
        name: 'authentication',
        pattern: /(auth|login|session|token)/i,
        event: 'code_modified',
        profile: 'security',
        priority: 'critical'
      },
      {
        name: 'deployment_files',
        pattern: /(Dockerfile|docker-compose|k8s|deploy)/,
        event: 'file_modified',
        profile: 'compliance',
        priority: 'high'
      },
      {
        name: 'ui_components',
        pattern: /\/(components|views|pages)\//,
        event: 'file_created',
        profile: 'accessibility',
        priority: 'medium'
      }
    ];
  }
  
  /**
   * Setup automatic triggers
   */
  setupTriggers() {
    // File system triggers
    this.on('file_created', (data) => this.handleFileEvent('file_created', data));
    this.on('file_modified', (data) => this.handleFileEvent('file_modified', data));
    this.on('file_deleted', (data) => this.handleFileEvent('file_deleted', data));
    
    // Code event triggers
    this.on('code_created', (data) => this.handleCodeEvent('code_created', data));
    this.on('code_modified', (data) => this.handleCodeEvent('code_modified', data));
    
    // Workflow triggers
    this.on('stage_completed', (data) => this.handleStageCompleted(data));
    this.on('workflow_checkpoint', (data) => this.handleCheckpoint(data));
    
    // Git triggers
    this.on('pre_commit', (data) => this.handlePreCommit(data));
    this.on('pre_push', (data) => this.handlePrePush(data));
    
    // Deployment triggers
    this.on('pre_deployment', (data) => this.handlePreDeployment(data));
    this.on('post_deployment', (data) => this.handlePostDeployment(data));
  }
  
  /**
   * Handle file events
   */
  handleFileEvent(eventType, data) {
    if (!this.config.enabled) return;
    
    const filePath = data.path || data.file;
    if (!filePath) return;
    
    // Find matching rules
    const matchingRules = this.config.rules.filter(rule => {
      if (rule.event !== eventType) return false;
      
      if (rule.pattern instanceof RegExp) {
        return rule.pattern.test(filePath);
      }
      
      return filePath.includes(rule.pattern);
    });
    
    if (matchingRules.length === 0) return;
    
    // Get highest priority rule
    const rule = matchingRules.reduce((highest, current) => {
      const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      return priorityOrder[current.priority] < priorityOrder[highest.priority] 
        ? current 
        : highest;
    });
    
    this.triggerValidation({
      trigger: eventType,
      rule: rule.name,
      profile: rule.profile,
      priority: rule.priority,
      target: {
        type: 'file',
        path: filePath,
        content: data.content
      }
    });
  }
  
  /**
   * Handle code events
   */
  handleCodeEvent(eventType, data) {
    if (!this.config.enabled) return;
    
    // Find matching rules for code events
    const matchingRules = this.config.rules.filter(rule => {
      if (rule.event !== eventType) return false;
      
      if (rule.pattern instanceof RegExp && data.code) {
        return rule.pattern.test(data.code);
      }
      
      if (data.description) {
        return data.description.toLowerCase().includes(rule.pattern);
      }
      
      return false;
    });
    
    if (matchingRules.length === 0) return;
    
    const rule = matchingRules[0];
    
    this.triggerValidation({
      trigger: eventType,
      rule: rule.name,
      profile: rule.profile,
      priority: rule.priority,
      target: {
        type: 'code',
        code: data.code,
        context: data.context
      }
    });
  }
  
  /**
   * Handle stage completed
   */
  handleStageCompleted(data) {
    if (!this.config.checkpoints.post_creation) return;
    
    // Validate stage output if it's a creation stage
    if (data.stage?.includes('implementation') || 
        data.stage?.includes('code') ||
        data.stage?.includes('build')) {
      
      this.triggerValidation({
        trigger: 'stage_completed',
        profile: 'code_quality',
        priority: 'medium',
        target: {
          type: 'stage_output',
          stage: data.stage,
          output: data.result
        }
      });
    }
  }
  
  /**
   * Handle workflow checkpoint
   */
  handleCheckpoint(data) {
    const checkpointProfiles = {
      architecture: 'architecture',
      security: 'security',
      performance: 'performance',
      testing: 'testing',
      deployment: 'compliance'
    };
    
    const profile = checkpointProfiles[data.checkpointType] || 'code_quality';
    
    this.triggerValidation({
      trigger: 'checkpoint',
      checkpoint: data.checkpointType,
      profile: profile,
      priority: 'high',
      target: data.target
    });
  }
  
  /**
   * Handle pre-commit validation
   */
  async handlePreCommit(data) {
    if (!this.config.checkpoints.pre_commit) return;
    
    const files = data.files || [];
    const validations = [];
    
    // Group files by type for batch validation
    const codeFiles = files.filter(f => /\.(js|ts|jsx|tsx|py|java)$/.test(f));
    const configFiles = files.filter(f => /\.(json|yaml|yml|env)$/.test(f));
    const testFiles = files.filter(f => /\.(test|spec)\.(js|ts)$/.test(f));
    
    if (codeFiles.length > 0) {
      validations.push({
        profile: 'code_quality',
        target: { type: 'files', files: codeFiles }
      });
    }
    
    if (configFiles.length > 0) {
      validations.push({
        profile: 'compliance',
        target: { type: 'files', files: configFiles }
      });
    }
    
    if (testFiles.length > 0) {
      validations.push({
        profile: 'testing',
        target: { type: 'files', files: testFiles }
      });
    }
    
    // Run validations
    const results = await Promise.all(
      validations.map(v => this.triggerValidation({
        trigger: 'pre_commit',
        ...v,
        priority: 'critical',
        blocking: true
      }))
    );
    
    // Check if any validation failed
    const failed = results.some(r => !r.passed);
    
    if (failed) {
      this.emit('commitBlocked', {
        reason: 'Validation failed',
        results: results
      });
      
      throw new Error('Pre-commit validation failed');
    }
    
    return results;
  }
  
  /**
   * Handle pre-push validation
   */
  async handlePrePush(data) {
    // More comprehensive validation before push
    const validations = [
      { profile: 'security', priority: 'critical' },
      { profile: 'testing', priority: 'high' },
      { profile: 'compliance', priority: 'high' }
    ];
    
    const results = await Promise.all(
      validations.map(v => this.triggerValidation({
        trigger: 'pre_push',
        ...v,
        target: data.target,
        blocking: true
      }))
    );
    
    const failed = results.some(r => !r.passed);
    
    if (failed) {
      this.emit('pushBlocked', {
        reason: 'Validation failed',
        results: results
      });
      
      throw new Error('Pre-push validation failed');
    }
    
    return results;
  }
  
  /**
   * Handle pre-deployment validation
   */
  async handlePreDeployment(data) {
    if (!this.config.checkpoints.pre_deployment) return;
    
    // Comprehensive pre-deployment validation
    const validations = [
      { profile: 'security', priority: 'critical' },
      { profile: 'compliance', priority: 'critical' },
      { profile: 'performance', priority: 'high' },
      { profile: 'testing', priority: 'high' }
    ];
    
    const results = await Promise.all(
      validations.map(v => this.triggerValidation({
        trigger: 'pre_deployment',
        ...v,
        target: data.target,
        blocking: true
      }))
    );
    
    const failed = results.some(r => !r.passed);
    
    if (failed) {
      this.emit('deploymentBlocked', {
        reason: 'Validation failed',
        results: results,
        environment: data.environment
      });
      
      throw new Error('Pre-deployment validation failed');
    }
    
    return results;
  }
  
  /**
   * Handle post-deployment validation
   */
  async handlePostDeployment(data) {
    // Verify deployment success
    const validation = await this.triggerValidation({
      trigger: 'post_deployment',
      profile: 'compliance',
      priority: 'high',
      target: {
        type: 'deployment',
        environment: data.environment,
        version: data.version
      }
    });
    
    if (!validation.passed) {
      this.emit('deploymentIssue', {
        environment: data.environment,
        validation: validation
      });
    }
    
    return validation;
  }
  
  /**
   * Trigger validation
   */
  async triggerValidation(request) {
    this.statistics.totalTriggers++;
    
    // Check if should skip
    if (this.shouldSkipValidation(request)) {
      this.statistics.skippedValidations++;
      return null;
    }
    
    // Debounce if needed
    if (!request.blocking && this.config.debounceDelay > 0) {
      return this.debouncedValidation(request);
    }
    
    // Add to queue or execute immediately
    if (request.blocking || request.priority === 'critical') {
      return await this.executeValidation(request);
    } else {
      this.queueValidation(request);
      return { queued: true, position: this.validationQueue.length };
    }
  }
  
  /**
   * Should skip validation
   */
  shouldSkipValidation(request) {
    // Skip if disabled
    if (!this.config.enabled) return true;
    
    // Skip if checkpoint is disabled
    if (request.checkpoint && !this.config.checkpoints[request.checkpoint]) {
      return true;
    }
    
    // Skip if duplicate validation is pending
    const key = this.getValidationKey(request);
    if (this.pendingValidations.has(key)) {
      const pending = this.pendingValidations.get(key);
      if (Date.now() - pending.timestamp < 5000) {
        return true; // Skip if same validation within 5 seconds
      }
    }
    
    return false;
  }
  
  /**
   * Debounced validation
   */
  debouncedValidation(request) {
    const key = this.getValidationKey(request);
    
    // Clear existing timer
    if (this.debounceTimers.has(key)) {
      clearTimeout(this.debounceTimers.get(key));
    }
    
    // Set new timer
    const timer = setTimeout(() => {
      this.debounceTimers.delete(key);
      this.executeValidation(request);
    }, this.config.debounceDelay);
    
    this.debounceTimers.set(key, timer);
    
    return { debounced: true, delay: this.config.debounceDelay };
  }
  
  /**
   * Queue validation
   */
  queueValidation(request) {
    this.validationQueue.push({
      ...request,
      queuedAt: Date.now()
    });
    
    // Process queue if not already processing
    if (!this.processing) {
      this.processQueue();
    }
  }
  
  /**
   * Process validation queue
   */
  async processQueue() {
    if (this.processing || this.validationQueue.length === 0) return;
    
    this.processing = true;
    
    while (this.validationQueue.length > 0) {
      // Process batch
      const batch = this.validationQueue.splice(0, this.config.batchSize);
      
      await Promise.all(
        batch.map(request => this.executeValidation(request))
      );
      
      // Small delay between batches
      if (this.validationQueue.length > 0) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
    
    this.processing = false;
  }
  
  /**
   * Execute validation
   */
  async executeValidation(request) {
    const key = this.getValidationKey(request);
    
    // Mark as pending
    this.pendingValidations.set(key, {
      request: request,
      timestamp: Date.now()
    });
    
    try {
      // Execute validation through orchestrator
      const result = await this.orchestrator.validate({
        profile: request.profile,
        target: request.target,
        automatic: true,
        metadata: {
          trigger: request.trigger,
          rule: request.rule,
          priority: request.priority
        }
      });
      
      this.statistics.automaticValidations++;
      
      // Emit result
      this.emit('validationTriggered', {
        trigger: request.trigger,
        profile: request.profile,
        result: result
      });
      
      return result;
      
    } catch (error) {
      this.statistics.failedValidations++;
      
      this.emit('validationError', {
        trigger: request.trigger,
        error: error.message
      });
      
      throw error;
      
    } finally {
      this.pendingValidations.delete(key);
    }
  }
  
  /**
   * Get validation key for deduplication
   */
  getValidationKey(request) {
    return `${request.profile}_${request.trigger}_${JSON.stringify(request.target)}`;
  }
  
  /**
   * Manual validation trigger
   */
  async validateManually(profile, target) {
    this.statistics.manualValidations++;
    
    return await this.orchestrator.validate({
      profile: profile,
      target: target,
      automatic: false
    });
  }
  
  /**
   * Enable/disable triggers
   */
  setEnabled(enabled) {
    this.config.enabled = enabled;
    
    this.emit('triggersUpdated', {
      enabled: enabled
    });
  }
  
  /**
   * Update checkpoint settings
   */
  updateCheckpoints(checkpoints) {
    Object.assign(this.config.checkpoints, checkpoints);
    
    this.emit('checkpointsUpdated', {
      checkpoints: this.config.checkpoints
    });
  }
  
  /**
   * Add validation rule
   */
  addRule(rule) {
    this.config.rules.push(rule);
    
    this.emit('ruleAdded', { rule });
  }
  
  /**
   * Remove validation rule
   */
  removeRule(ruleName) {
    this.config.rules = this.config.rules.filter(r => r.name !== ruleName);
    
    this.emit('ruleRemoved', { ruleName });
  }
  
  /**
   * Get statistics
   */
  getStatistics() {
    return {
      ...this.statistics,
      queueLength: this.validationQueue.length,
      pendingValidations: this.pendingValidations.size,
      processing: this.processing,
      orchestratorMetrics: this.orchestrator.getMetrics()
    };
  }
  
  /**
   * Clear queue
   */
  clearQueue() {
    this.validationQueue = [];
    this.pendingValidations.clear();
    
    // Clear debounce timers
    for (const timer of this.debounceTimers.values()) {
      clearTimeout(timer);
    }
    this.debounceTimers.clear();
    
    this.emit('queueCleared');
  }
}

export default ValidationTriggers;