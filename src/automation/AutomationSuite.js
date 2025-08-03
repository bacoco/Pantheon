import { EventEmitter } from 'eventemitter3';
import { v4 as uuidv4 } from 'uuid';
import { WorkflowOrchestrator } from '../orchestration/WorkflowOrchestrator.js';
import { ValidationPipeline } from '../validation/ValidationPipeline.js';
import { EventSystem, getEventSystem } from '../events/EventSystem.js';
import { getRegistry } from '../agents/AgentRegistry.js';
import { getOptimizer } from '../router/CostOptimizer.js';

/**
 * Automation Suite - Complete automation framework for Pantheon
 * Integrates all components for end-to-end automation
 */
export class AutomationSuite extends EventEmitter {
  constructor(config = {}) {
    super();
    
    // Configuration
    this.config = {
      autoMode: config.autoMode !== false,
      learningEnabled: config.learningEnabled !== false,
      adaptiveOptimization: config.adaptiveOptimization !== false,
      maxConcurrentAutomations: config.maxConcurrentAutomations || 5,
      defaultPriority: config.defaultPriority || 'medium',
      ...config
    };
    
    // Core components
    this.workflowOrchestrator = new WorkflowOrchestrator(config.workflow);
    this.validationPipeline = new ValidationPipeline(config.validation);
    this.eventSystem = getEventSystem();
    this.agentRegistry = getRegistry();
    this.costOptimizer = getOptimizer();
    
    // Automation management
    this.automations = new Map();
    this.activeAutomations = new Map();
    this.automationTemplates = new Map();
    this.automationRules = new Map();
    
    // Learning and adaptation
    this.learningData = new Map();
    this.optimizationHistory = [];
    
    // Statistics
    this.statistics = {
      totalAutomations: 0,
      successfulAutomations: 0,
      failedAutomations: 0,
      activeAutomations: 0,
      rulesTriggered: 0,
      optimizationsSaved: 0,
      totalCostSaved: 0
    };
    
    // Initialize default automation templates
    this.initializeDefaultTemplates();
    
    // Initialize automation rules
    this.initializeAutomationRules();
    
    // Setup event listeners
    this.setupEventListeners();
    
    // Start automation engine
    if (this.config.autoMode) {
      this.startAutomationEngine();
    }
  }
  
  /**
   * Initialize default automation templates
   */
  initializeDefaultTemplates() {
    // CI/CD Automation
    this.registerTemplate('cicd', {
      name: 'CI/CD Pipeline',
      description: 'Automated continuous integration and deployment',
      triggers: ['code.push', 'pull_request.opened', 'release.tag'],
      workflow: 'deployment',
      validations: ['syntax', 'security', 'tests'],
      stages: [
        { type: 'validate', profile: 'ci' },
        { type: 'build', agent: 'claude-builder' },
        { type: 'test', agent: 'claude-builder' },
        { type: 'security-scan', agent: 'gemini-advisor' },
        { type: 'deploy', agent: 'claude-builder', condition: 'tests.passed' },
        { type: 'smoke-test', agent: 'gemini-advisor' },
        { type: 'notify', channel: 'deployments' }
      ],
      rollback: true,
      notifications: true
    });
    
    // Code Review Automation
    this.registerTemplate('code-review', {
      name: 'Automated Code Review',
      description: 'AI-powered code review and suggestions',
      triggers: ['pull_request.opened', 'pull_request.updated'],
      workflow: 'research',
      validations: ['code_quality', 'security', 'performance'],
      stages: [
        { type: 'analyze', agent: 'gemini-advisor' },
        { type: 'validate', profile: 'code_quality' },
        { type: 'suggest', agent: 'claude-architect' },
        { type: 'report', format: 'markdown' }
      ],
      autoMerge: false,
      requireApproval: true
    });
    
    // Performance Optimization
    this.registerTemplate('performance', {
      name: 'Performance Optimization',
      description: 'Automated performance analysis and optimization',
      triggers: ['metrics.threshold', 'schedule.daily'],
      workflow: 'development',
      stages: [
        { type: 'profile', agent: 'claude-architect' },
        { type: 'analyze', agent: 'gemini-advisor' },
        { type: 'optimize', agent: 'claude-builder' },
        { type: 'validate', profile: 'performance' },
        { type: 'deploy', condition: 'improvements > 10%' }
      ],
      learningEnabled: true,
      adaptiveThresholds: true
    });
    
    // Security Automation
    this.registerTemplate('security', {
      name: 'Security Automation',
      description: 'Automated security scanning and patching',
      triggers: ['schedule.hourly', 'security.alert'],
      workflow: 'sequential',
      priority: 'critical',
      stages: [
        { type: 'scan', agent: 'gemini-advisor' },
        { type: 'analyze', agent: 'claude-architect' },
        { type: 'patch', agent: 'claude-builder', requireApproval: true },
        { type: 'validate', profile: 'security' },
        { type: 'report', channel: 'security' }
      ],
      immediateAction: true,
      notifyOnFailure: true
    });
    
    // Documentation Generation
    this.registerTemplate('documentation', {
      name: 'Documentation Generation',
      description: 'Automated documentation updates',
      triggers: ['code.merged', 'api.changed'],
      workflow: 'sequential',
      stages: [
        { type: 'analyze', agent: 'claude-architect' },
        { type: 'generate', agent: 'claude-documenter' },
        { type: 'validate', profile: 'documentation' },
        { type: 'publish', destination: 'docs/' }
      ],
      autoCommit: true
    });
  }
  
  /**
   * Initialize automation rules
   */
  initializeAutomationRules() {
    // Cost optimization rule
    this.addRule('cost-optimization', {
      condition: (event) => {
        const stats = this.costOptimizer.getStatistics();
        return stats.budgetUsedPercent > 70;
      },
      action: async (event) => {
        await this.switchToEconomyMode();
      },
      priority: 'high'
    });
    
    // Error recovery rule
    this.addRule('error-recovery', {
      condition: (event) => event.name === 'workflow.failed',
      action: async (event) => {
        await this.attemptRecovery(event.data.workflowId);
      },
      priority: 'critical'
    });
    
    // Scale optimization rule
    this.addRule('scale-optimization', {
      condition: (event) => {
        return this.activeAutomations.size > this.config.maxConcurrentAutomations * 0.8;
      },
      action: async (event) => {
        await this.optimizeResourceAllocation();
      },
      priority: 'medium'
    });
    
    // Learning trigger rule
    this.addRule('learning-trigger', {
      condition: (event) => {
        return event.name === 'automation.completed' && this.config.learningEnabled;
      },
      action: async (event) => {
        await this.updateLearning(event.data);
      },
      priority: 'low'
    });
  }
  
  /**
   * Register automation template
   */
  registerTemplate(name, template) {
    const templateId = uuidv4();
    
    this.automationTemplates.set(name, {
      id: templateId,
      ...template,
      createdAt: new Date()
    });
    
    this.emit('templateRegistered', {
      name,
      id: templateId
    });
  }
  
  /**
   * Create automation
   */
  async createAutomation(templateName, context = {}) {
    const template = this.automationTemplates.get(templateName);
    
    if (!template) {
      throw new Error(`Template '${templateName}' not found`);
    }
    
    const automationId = uuidv4();
    
    const automation = {
      id: automationId,
      template: templateName,
      name: template.name,
      description: template.description,
      triggers: template.triggers,
      workflow: null,
      stages: [...template.stages],
      context: context,
      status: 'created',
      priority: template.priority || this.config.defaultPriority,
      createdAt: new Date(),
      startedAt: null,
      completedAt: null,
      results: [],
      metrics: {}
    };
    
    // Create associated workflow
    automation.workflow = this.workflowOrchestrator.createWorkflow(
      template.workflow,
      context
    );
    
    // Set up triggers
    for (const trigger of template.triggers) {
      await this.setupTrigger(automationId, trigger);
    }
    
    this.automations.set(automationId, automation);
    
    this.emit('automationCreated', {
      id: automationId,
      template: templateName
    });
    
    return automation;
  }
  
  /**
   * Execute automation
   */
  async executeAutomation(automationId, input = {}) {
    const automation = this.automations.get(automationId);
    
    if (!automation) {
      throw new Error(`Automation '${automationId}' not found`);
    }
    
    if (this.activeAutomations.size >= this.config.maxConcurrentAutomations) {
      // Queue automation
      await this.queueAutomation(automationId, input);
      return;
    }
    
    const startTime = Date.now();
    
    automation.status = 'running';
    automation.startedAt = new Date();
    this.activeAutomations.set(automationId, automation);
    this.statistics.totalAutomations++;
    this.statistics.activeAutomations++;
    
    this.emit('automationStarted', {
      id: automationId,
      name: automation.name
    });
    
    try {
      // Pre-automation validation
      const validationResult = await this.validateAutomation(automation, input);
      
      if (!validationResult.passed && automation.priority !== 'critical') {
        throw new Error(`Pre-automation validation failed: ${validationResult.issues.join(', ')}`);
      }
      
      // Execute stages
      const stageResults = [];
      
      for (const stage of automation.stages) {
        const stageResult = await this.executeStage(stage, input, automation.context);
        stageResults.push(stageResult);
        
        // Check conditions
        if (stage.condition && !this.evaluateCondition(stage.condition, stageResult)) {
          break;
        }
        
        // Update input for next stage
        input = { ...input, ...stageResult };
      }
      
      // Execute workflow if defined
      let workflowResult = null;
      if (automation.workflow) {
        workflowResult = await this.workflowOrchestrator.execute(
          automation.workflow.id,
          input
        );
      }
      
      // Calculate metrics
      const duration = Date.now() - startTime;
      const costSaved = this.calculateCostSavings(automation, stageResults);
      
      automation.status = 'completed';
      automation.completedAt = new Date();
      automation.results = {
        stages: stageResults,
        workflow: workflowResult
      };
      automation.metrics = {
        duration,
        costSaved,
        efficiency: this.calculateEfficiency(automation, duration)
      };
      
      // Update statistics
      this.statistics.successfulAutomations++;
      this.statistics.totalCostSaved += costSaved;
      
      // Learn from execution
      if (this.config.learningEnabled) {
        await this.updateLearning(automation);
      }
      
      this.emit('automationCompleted', {
        id: automationId,
        name: automation.name,
        duration,
        costSaved
      });
      
      return {
        success: true,
        automationId,
        results: automation.results,
        metrics: automation.metrics
      };
      
    } catch (error) {
      automation.status = 'failed';
      automation.completedAt = new Date();
      automation.error = error.message;
      
      this.statistics.failedAutomations++;
      
      this.emit('automationFailed', {
        id: automationId,
        name: automation.name,
        error: error.message
      });
      
      // Attempt recovery
      if (automation.priority === 'critical') {
        await this.attemptRecovery(automationId);
      }
      
      throw error;
      
    } finally {
      this.activeAutomations.delete(automationId);
      this.statistics.activeAutomations--;
      
      // Process queue
      await this.processQueue();
    }
  }
  
  /**
   * Execute stage
   */
  async executeStage(stage, input, context) {
    const stageId = uuidv4();
    
    this.emit('stageStarted', {
      id: stageId,
      type: stage.type,
      name: stage.name
    });
    
    try {
      let result;
      
      switch (stage.type) {
        case 'validate':
          result = await this.validationPipeline.execute(input, {
            profile: stage.profile
          });
          break;
          
        case 'analyze':
        case 'build':
        case 'test':
        case 'deploy':
        case 'optimize':
          const agent = await this.agentRegistry.getAgentByName(stage.agent);
          result = await agent.execute({
            type: stage.type,
            ...input,
            context
          });
          break;
          
        case 'notify':
          result = await this.sendNotification(stage.channel, input);
          break;
          
        case 'report':
          result = await this.generateReport(stage.format, input);
          break;
          
        default:
          result = { type: stage.type, input };
      }
      
      this.emit('stageCompleted', {
        id: stageId,
        type: stage.type,
        success: true
      });
      
      return result;
      
    } catch (error) {
      this.emit('stageFailed', {
        id: stageId,
        type: stage.type,
        error: error.message
      });
      
      throw error;
    }
  }
  
  /**
   * Setup trigger
   */
  async setupTrigger(automationId, triggerPattern) {
    const triggerId = this.eventSystem.subscribe(triggerPattern, async (data) => {
      // Check if automation should run
      if (await this.shouldRunAutomation(automationId, data)) {
        await this.executeAutomation(automationId, data);
      }
    }, {
      channel: 'automation'
    });
    
    // Store trigger association
    const automation = this.automations.get(automationId);
    if (automation) {
      if (!automation.triggerIds) {
        automation.triggerIds = [];
      }
      automation.triggerIds.push(triggerId);
    }
  }
  
  /**
   * Should run automation
   */
  async shouldRunAutomation(automationId, data) {
    const automation = this.automations.get(automationId);
    
    if (!automation) return false;
    if (automation.status === 'running') return false;
    
    // Check learning data for optimization
    if (this.config.learningEnabled) {
      const learningKey = `${automation.template}-${JSON.stringify(data)}`;
      const learning = this.learningData.get(learningKey);
      
      if (learning && learning.skipProbability > 0.8) {
        this.emit('automationSkipped', {
          id: automationId,
          reason: 'Learning optimization'
        });
        return false;
      }
    }
    
    return true;
  }
  
  /**
   * Validate automation
   */
  async validateAutomation(automation, input) {
    return await this.validationPipeline.execute({
      automation: automation.name,
      input,
      stages: automation.stages
    }, {
      profile: 'automation'
    });
  }
  
  /**
   * Add rule
   */
  addRule(name, rule) {
    const ruleId = uuidv4();
    
    this.automationRules.set(name, {
      id: ruleId,
      name,
      ...rule,
      active: true,
      triggerCount: 0
    });
    
    // Subscribe to all events for rule evaluation
    this.eventSystem.subscribe('*', async (data, event) => {
      await this.evaluateRule(name, event);
    }, {
      channel: 'rules'
    });
    
    this.emit('ruleAdded', {
      name,
      id: ruleId
    });
  }
  
  /**
   * Evaluate rule
   */
  async evaluateRule(ruleName, event) {
    const rule = this.automationRules.get(ruleName);
    
    if (!rule || !rule.active) return;
    
    try {
      if (await rule.condition(event)) {
        rule.triggerCount++;
        this.statistics.rulesTriggered++;
        
        this.emit('ruleTriggered', {
          name: ruleName,
          event: event.name
        });
        
        await rule.action(event);
      }
    } catch (error) {
      this.emit('ruleError', {
        name: ruleName,
        error: error.message
      });
    }
  }
  
  /**
   * Switch to economy mode
   */
  async switchToEconomyMode() {
    this.emit('economyModeActivated');
    
    // Adjust all active automations
    for (const automation of this.activeAutomations.values()) {
      automation.priority = 'low';
    }
    
    // Use cost-optimized agents
    this.workflowOrchestrator.config.enableCostOptimization = true;
  }
  
  /**
   * Attempt recovery
   */
  async attemptRecovery(automationId) {
    const automation = this.automations.get(automationId);
    
    if (!automation) return;
    
    this.emit('recoveryAttempted', {
      id: automationId,
      name: automation.name
    });
    
    try {
      // Reset status
      automation.status = 'recovering';
      
      // Retry with fallback agents
      const fallbackContext = {
        ...automation.context,
        useFallback: true
      };
      
      await this.executeAutomation(automationId, fallbackContext);
      
      this.emit('recoverySucceeded', {
        id: automationId
      });
      
    } catch (error) {
      this.emit('recoveryFailed', {
        id: automationId,
        error: error.message
      });
    }
  }
  
  /**
   * Update learning
   */
  async updateLearning(automation) {
    const learningKey = `${automation.template}-${automation.context}`;
    
    if (!this.learningData.has(learningKey)) {
      this.learningData.set(learningKey, {
        executions: 0,
        successes: 0,
        failures: 0,
        averageDuration: 0,
        averageCost: 0,
        skipProbability: 0
      });
    }
    
    const learning = this.learningData.get(learningKey);
    
    learning.executions++;
    if (automation.status === 'completed') {
      learning.successes++;
    } else {
      learning.failures++;
    }
    
    // Update averages
    if (automation.metrics) {
      learning.averageDuration = 
        (learning.averageDuration * (learning.executions - 1) + automation.metrics.duration) / 
        learning.executions;
    }
    
    // Calculate skip probability based on failure rate
    if (learning.failures > learning.successes * 2) {
      learning.skipProbability = Math.min(0.9, learning.failures / learning.executions);
    }
    
    // Adaptive optimization
    if (this.config.adaptiveOptimization) {
      await this.applyOptimizations(automation, learning);
    }
  }
  
  /**
   * Apply optimizations
   */
  async applyOptimizations(automation, learning) {
    const optimizations = [];
    
    // Optimize stage order based on success patterns
    if (learning.successes > 10) {
      optimizations.push({
        type: 'reorder_stages',
        confidence: 0.8
      });
    }
    
    // Skip unnecessary validations
    if (learning.successes > 20 && learning.failures === 0) {
      optimizations.push({
        type: 'skip_validations',
        confidence: 0.9
      });
    }
    
    // Use faster agents for stable automations
    if (learning.averageDuration > 60000 && learning.successes > 5) {
      optimizations.push({
        type: 'optimize_agents',
        confidence: 0.7
      });
    }
    
    this.optimizationHistory.push({
      automationId: automation.id,
      optimizations,
      timestamp: new Date()
    });
    
    this.statistics.optimizationsSaved += optimizations.length;
  }
  
  /**
   * Calculate cost savings
   */
  calculateCostSavings(automation, results) {
    // Mock calculation
    const manualCost = automation.stages.length * 10; // $10 per manual stage
    const automationCost = automation.metrics?.duration ? 
      (automation.metrics.duration / 1000) * 0.01 : 0; // $0.01 per second
    
    return Math.max(0, manualCost - automationCost);
  }
  
  /**
   * Calculate efficiency
   */
  calculateEfficiency(automation, duration) {
    const expectedDuration = automation.stages.length * 10000; // 10s per stage expected
    return Math.min(100, (expectedDuration / duration) * 100);
  }
  
  /**
   * Send notification
   */
  async sendNotification(channel, data) {
    this.eventSystem.publish(`notification.${channel}`, data, {
      channel: 'notifications'
    });
    
    return {
      sent: true,
      channel,
      timestamp: new Date()
    };
  }
  
  /**
   * Generate report
   */
  async generateReport(format, data) {
    const report = {
      format,
      data,
      generatedAt: new Date()
    };
    
    this.emit('reportGenerated', report);
    
    return report;
  }
  
  /**
   * Evaluate condition
   */
  evaluateCondition(condition, context) {
    if (typeof condition === 'string') {
      // Simple property check
      return !!context[condition];
    }
    
    if (typeof condition === 'function') {
      return condition(context);
    }
    
    return true;
  }
  
  /**
   * Queue automation
   */
  async queueAutomation(automationId, input) {
    // Implementation would include proper queue management
    this.emit('automationQueued', {
      id: automationId,
      queueSize: this.activeAutomations.size
    });
  }
  
  /**
   * Process queue
   */
  async processQueue() {
    // Implementation would process queued automations
  }
  
  /**
   * Setup event listeners
   */
  setupEventListeners() {
    // Listen for system events
    this.eventSystem.subscribe('system.*', async (data) => {
      await this.handleSystemEvent(data);
    });
    
    // Listen for workflow events
    this.workflowOrchestrator.on('workflowCompleted', (data) => {
      this.eventSystem.publish('workflow.completed', data);
    });
    
    // Listen for validation events
    this.validationPipeline.on('validationTriggered', (data) => {
      this.eventSystem.publish('validation.triggered', data);
    });
  }
  
  /**
   * Handle system event
   */
  async handleSystemEvent(event) {
    // Process system events
  }
  
  /**
   * Start automation engine
   */
  startAutomationEngine() {
    this.emit('engineStarted', {
      timestamp: new Date()
    });
    
    // Start monitoring
    setInterval(() => {
      this.monitorAutomations();
    }, 30000); // Every 30 seconds
  }
  
  /**
   * Monitor automations
   */
  monitorAutomations() {
    const stats = this.getStatistics();
    
    this.eventSystem.publish('automation.metrics', stats, {
      channel: 'metrics'
    });
    
    // Check for stuck automations
    for (const automation of this.activeAutomations.values()) {
      const runtime = Date.now() - automation.startedAt;
      
      if (runtime > 300000) { // 5 minutes
        this.emit('automationStuck', {
          id: automation.id,
          runtime
        });
      }
    }
  }
  
  /**
   * Get statistics
   */
  getStatistics() {
    return {
      ...this.statistics,
      templates: this.automationTemplates.size,
      rules: this.automationRules.size,
      activeAutomations: Array.from(this.activeAutomations.values()).map(a => ({
        id: a.id,
        name: a.name,
        status: a.status,
        runtime: Date.now() - a.startedAt
      })),
      learningInsights: this.getLearningInsights(),
      optimizationHistory: this.optimizationHistory.slice(-10)
    };
  }
  
  /**
   * Get learning insights
   */
  getLearningInsights() {
    const insights = [];
    
    for (const [key, data] of this.learningData.entries()) {
      if (data.executions > 5) {
        insights.push({
          pattern: key,
          successRate: (data.successes / data.executions) * 100,
          averageDuration: data.averageDuration,
          recommendation: data.skipProbability > 0.5 ? 'Consider disabling' : 'Keep active'
        });
      }
    }
    
    return insights;
  }
}

export default AutomationSuite;