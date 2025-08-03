import { EventEmitter } from 'eventemitter3';
import { v4 as uuidv4 } from 'uuid';
import { ExecutionPatterns } from '../workflows/ExecutionPatterns.js';
import { CircuitBreaker, circuitBreakerFactory } from '../utils/CircuitBreaker.js';
import { RetryPattern, SmartRetry } from '../utils/RetryPattern.js';
import { ValidationPipeline } from '../validation/ValidationPipeline.js';
import { getOptimizer } from '../router/CostOptimizer.js';
import { getRegistry } from '../agents/AgentRegistry.js';

/**
 * Workflow Orchestrator - Enhanced orchestration with resilience patterns
 * Integrates Circuit Breaker, Retry, Validation, and Cost Optimization
 */
export class WorkflowOrchestrator extends EventEmitter {
  constructor(config = {}) {
    super();
    
    // Configuration
    this.config = {
      maxConcurrentWorkflows: config.maxConcurrentWorkflows || 10,
      defaultTimeout: config.defaultTimeout || 300000, // 5 minutes
      validateBeforeExecution: config.validateBeforeExecution !== false,
      validateAfterExecution: config.validateAfterExecution !== false,
      enableCostOptimization: config.enableCostOptimization !== false,
      enableCircuitBreakers: config.enableCircuitBreakers !== false,
      enableRetryLogic: config.enableRetryLogic !== false,
      ...config
    };
    
    // Core components
    this.executionPatterns = new ExecutionPatterns();
    this.validationPipeline = new ValidationPipeline(config.validation);
    this.costOptimizer = getOptimizer();
    this.agentRegistry = getRegistry();
    
    // Workflow management
    this.workflows = new Map();
    this.activeWorkflows = new Map();
    this.workflowHistory = [];
    this.workflowTemplates = new Map();
    
    // Circuit breakers per workflow type
    this.circuitBreakers = new Map();
    
    // Retry patterns per workflow type
    this.retryPatterns = new Map();
    
    // Statistics
    this.statistics = {
      totalWorkflows: 0,
      successfulWorkflows: 0,
      failedWorkflows: 0,
      activeWorkflows: 0,
      averageExecutionTime: 0,
      costSaved: 0
    };
    
    // Initialize default templates
    this.initializeDefaultTemplates();
    
    // Set up event handlers
    this.setupEventHandlers();
  }
  
  /**
   * Initialize default workflow templates
   */
  initializeDefaultTemplates() {
    // Development workflow
    this.registerTemplate('development', {
      name: 'Development Workflow',
      description: 'Standard development workflow with validation',
      stages: [
        { type: 'validate', name: 'pre-validation', profile: 'syntax' },
        { type: 'execute', name: 'implementation', agent: 'claude-builder' },
        { type: 'validate', name: 'post-validation', profile: 'code_quality' },
        { type: 'test', name: 'testing', agent: 'claude-builder' },
        { type: 'validate', name: 'final-validation', profile: 'deployment' }
      ],
      pattern: 'sequential',
      resilience: {
        retry: true,
        circuitBreaker: true,
        fallback: 'gemini-advisor'
      }
    });
    
    // Research workflow
    this.registerTemplate('research', {
      name: 'Research Workflow',
      description: 'Parallel research with aggregation',
      stages: [
        { type: 'execute', name: 'research-1', agent: 'claude-architect' },
        { type: 'execute', name: 'research-2', agent: 'gemini-advisor' },
        { type: 'aggregate', name: 'synthesis' }
      ],
      pattern: 'fanIn',
      resilience: {
        retry: false,
        circuitBreaker: false
      }
    });
    
    // Deployment workflow
    this.registerTemplate('deployment', {
      name: 'Deployment Workflow',
      description: 'Safe deployment with rollback',
      stages: [
        { type: 'validate', name: 'pre-deployment', profile: 'deployment' },
        { type: 'execute', name: 'backup', agent: 'claude-builder' },
        { type: 'execute', name: 'deploy', agent: 'claude-builder' },
        { type: 'validate', name: 'smoke-test', profile: 'production' },
        { type: 'conditional', name: 'rollback-check' }
      ],
      pattern: 'saga',
      resilience: {
        retry: true,
        circuitBreaker: true,
        compensation: true
      }
    });
  }
  
  /**
   * Setup event handlers
   */
  setupEventHandlers() {
    // Validation events
    this.validationPipeline.on('validationTriggered', (event) => {
      this.emit('workflowValidationTriggered', event);
    });
    
    // Cost optimizer events
    this.costOptimizer.on('costAlert', (alert) => {
      this.emit('costAlert', alert);
      
      // Switch to cost-saving mode
      if (alert.level === 'critical') {
        this.enterCostSavingMode();
      }
    });
    
    // Execution pattern events
    this.executionPatterns.on('patternCompleted', (result) => {
      this.emit('patternExecuted', result);
    });
  }
  
  /**
   * Register workflow template
   */
  registerTemplate(name, template) {
    this.workflowTemplates.set(name, {
      ...template,
      id: uuidv4(),
      createdAt: new Date()
    });
    
    this.emit('templateRegistered', {
      name,
      template: template.name
    });
  }
  
  /**
   * Create workflow from template
   */
  createWorkflow(templateName, context = {}) {
    const template = this.workflowTemplates.get(templateName);
    
    if (!template) {
      throw new Error(`Template '${templateName}' not found`);
    }
    
    const workflowId = uuidv4();
    
    const workflow = {
      id: workflowId,
      template: templateName,
      name: template.name,
      description: template.description,
      stages: [...template.stages],
      pattern: template.pattern,
      resilience: { ...template.resilience },
      context: context,
      status: 'created',
      createdAt: new Date(),
      startedAt: null,
      completedAt: null,
      results: [],
      metrics: {}
    };
    
    this.workflows.set(workflowId, workflow);
    
    this.emit('workflowCreated', {
      id: workflowId,
      template: templateName
    });
    
    return workflow;
  }
  
  /**
   * Execute workflow
   */
  async execute(workflowId, input = {}) {
    const workflow = this.workflows.get(workflowId);
    
    if (!workflow) {
      throw new Error(`Workflow '${workflowId}' not found`);
    }
    
    if (this.activeWorkflows.size >= this.config.maxConcurrentWorkflows) {
      throw new Error('Maximum concurrent workflows reached');
    }
    
    const startTime = Date.now();
    
    workflow.status = 'running';
    workflow.startedAt = new Date();
    this.activeWorkflows.set(workflowId, workflow);
    this.statistics.totalWorkflows++;
    this.statistics.activeWorkflows++;
    
    this.emit('workflowStarted', {
      id: workflowId,
      name: workflow.name
    });
    
    try {
      // Pre-execution validation
      if (this.config.validateBeforeExecution) {
        const validationResult = await this.validateWorkflow(workflow, input);
        
        if (!validationResult.passed) {
          throw new Error(`Pre-execution validation failed: ${validationResult.issues.join(', ')}`);
        }
      }
      
      // Get circuit breaker for this workflow type
      const circuitBreaker = this.getCircuitBreaker(workflow.template);
      
      // Get retry pattern for this workflow type
      const retryPattern = this.getRetryPattern(workflow.template);
      
      // Execute with resilience patterns
      let result;
      
      if (this.config.enableCircuitBreakers && workflow.resilience.circuitBreaker) {
        result = await circuitBreaker.execute(
          async () => {
            if (this.config.enableRetryLogic && workflow.resilience.retry) {
              return await retryPattern.execute(
                async () => await this.executeWorkflowPattern(workflow, input)
              );
            } else {
              return await this.executeWorkflowPattern(workflow, input);
            }
          },
          workflow.resilience.fallback ? 
            async () => await this.executeFallback(workflow, input) : 
            null
        );
      } else if (this.config.enableRetryLogic && workflow.resilience.retry) {
        result = await retryPattern.execute(
          async () => await this.executeWorkflowPattern(workflow, input)
        );
      } else {
        result = await this.executeWorkflowPattern(workflow, input);
      }
      
      // Post-execution validation
      if (this.config.validateAfterExecution) {
        const validationResult = await this.validateWorkflow(workflow, result);
        
        if (!validationResult.passed) {
          workflow.validationIssues = validationResult.issues;
        }
      }
      
      // Update workflow
      workflow.status = 'completed';
      workflow.completedAt = new Date();
      workflow.results = result;
      workflow.metrics = {
        duration: Date.now() - startTime,
        cost: this.calculateWorkflowCost(workflow, result)
      };
      
      // Update statistics
      this.statistics.successfulWorkflows++;
      this.updateAverageExecutionTime(workflow.metrics.duration);
      
      // Add to history
      this.addToHistory(workflow);
      
      this.emit('workflowCompleted', {
        id: workflowId,
        name: workflow.name,
        duration: workflow.metrics.duration,
        cost: workflow.metrics.cost
      });
      
      return {
        success: true,
        workflowId,
        results: result,
        metrics: workflow.metrics
      };
      
    } catch (error) {
      workflow.status = 'failed';
      workflow.completedAt = new Date();
      workflow.error = error.message;
      
      this.statistics.failedWorkflows++;
      
      // Execute compensation if saga pattern
      if (workflow.pattern === 'saga' && workflow.resilience.compensation) {
        await this.executeCompensation(workflow, error);
      }
      
      this.emit('workflowFailed', {
        id: workflowId,
        name: workflow.name,
        error: error.message
      });
      
      throw error;
      
    } finally {
      this.activeWorkflows.delete(workflowId);
      this.statistics.activeWorkflows--;
    }
  }
  
  /**
   * Execute workflow pattern
   */
  async executeWorkflowPattern(workflow, input) {
    const pattern = this.executionPatterns.patterns[workflow.pattern];
    
    if (!pattern) {
      throw new Error(`Unknown pattern '${workflow.pattern}'`);
    }
    
    // Prepare stages for execution
    const executableStages = await this.prepareStages(workflow.stages, workflow.context);
    
    // Execute based on pattern
    switch (workflow.pattern) {
      case 'sequential':
        return await this.executionPatterns.sequentialPattern(executableStages, input);
        
      case 'parallel':
        return await this.executionPatterns.parallelPattern(executableStages, input, {
          maxConcurrency: 5,
          failFast: false
        });
        
      case 'pipeline':
        return await this.executionPatterns.pipelinePattern(executableStages, input, workflow.context);
        
      case 'fanIn':
        return await this.executionPatterns.fanInPattern(
          executableStages,
          async (results) => this.aggregateResults(results),
          input
        );
        
      case 'fanOut':
        return await this.executionPatterns.fanOutPattern(
          async (data) => this.distributeWork(data, executableStages.length),
          executableStages,
          input,
          workflow.context
        );
        
      case 'saga':
        return await this.executionPatterns.sagaPattern(executableStages, input);
        
      default:
        return await this.executionPatterns.sequentialPattern(executableStages, input);
    }
  }
  
  /**
   * Prepare stages for execution
   */
  async prepareStages(stages, context) {
    const executableStages = [];
    
    for (const stage of stages) {
      const executableStage = {
        name: stage.name,
        type: stage.type
      };
      
      switch (stage.type) {
        case 'execute':
          executableStage.execute = async (input) => {
            const agent = await this.getOptimalAgent(stage.agent, input);
            return await agent.execute({
              ...input,
              stageName: stage.name,
              context
            });
          };
          break;
          
        case 'validate':
          executableStage.execute = async (input) => {
            return await this.validationPipeline.execute(input, {
              profile: stage.profile
            });
          };
          break;
          
        case 'test':
          executableStage.execute = async (input) => {
            const agent = await this.getOptimalAgent(stage.agent || 'claude-builder', input);
            return await agent.execute({
              type: 'testing',
              ...input
            });
          };
          break;
          
        case 'aggregate':
          executableStage.execute = async (input) => {
            return await this.aggregateResults(input);
          };
          break;
          
        case 'conditional':
          executableStage.execute = async (input) => {
            return await this.evaluateCondition(stage.condition, input);
          };
          break;
          
        default:
          executableStage.execute = async (input) => input;
      }
      
      // Add compensation for saga pattern
      if (stage.compensation) {
        executableStage.compensation = {
          execute: async (input) => {
            const agent = await this.getOptimalAgent(stage.compensation.agent, input);
            return await agent.execute({
              type: 'compensation',
              ...input
            });
          }
        };
      }
      
      executableStages.push(executableStage);
    }
    
    return executableStages;
  }
  
  /**
   * Get optimal agent based on cost optimization
   */
  async getOptimalAgent(preferredAgent, context) {
    if (!this.config.enableCostOptimization) {
      return await this.agentRegistry.getAgentByName(preferredAgent);
    }
    
    const recommendation = this.costOptimizer.getOptimizationRecommendation(
      context.type || 'general',
      JSON.stringify(context).length
    );
    
    // Try to get recommended agent
    const recommendedAgent = await this.agentRegistry.getAgentByName(
      `${recommendation.provider}-${recommendation.model}`
    );
    
    if (recommendedAgent) {
      this.emit('agentOptimized', {
        preferred: preferredAgent,
        selected: recommendedAgent.name,
        reason: recommendation.reason
      });
      
      return recommendedAgent;
    }
    
    // Fallback to preferred agent
    return await this.agentRegistry.getAgentByName(preferredAgent);
  }
  
  /**
   * Validate workflow
   */
  async validateWorkflow(workflow, data) {
    const validationResult = await this.validationPipeline.execute({
      workflow: workflow.name,
      stages: workflow.stages,
      data: data
    }, {
      profile: 'workflow'
    });
    
    return {
      passed: validationResult.passed,
      issues: validationResult.issues.map(i => i.message)
    };
  }
  
  /**
   * Execute fallback
   */
  async executeFallback(workflow, input) {
    const fallbackAgent = await this.agentRegistry.getAgentByName(workflow.resilience.fallback);
    
    if (!fallbackAgent) {
      throw new Error(`Fallback agent '${workflow.resilience.fallback}' not found`);
    }
    
    this.emit('fallbackExecuted', {
      workflowId: workflow.id,
      fallbackAgent: workflow.resilience.fallback
    });
    
    return await fallbackAgent.execute({
      type: 'fallback',
      originalWorkflow: workflow.name,
      ...input
    });
  }
  
  /**
   * Execute compensation
   */
  async executeCompensation(workflow, error) {
    this.emit('compensationStarted', {
      workflowId: workflow.id,
      error: error.message
    });
    
    try {
      // Execute compensation stages in reverse order
      const compensationStages = workflow.stages
        .filter(s => s.compensation)
        .reverse();
      
      for (const stage of compensationStages) {
        const agent = await this.agentRegistry.getAgentByName(stage.compensation.agent);
        
        if (agent) {
          await agent.execute({
            type: 'compensation',
            stage: stage.name,
            error: error.message,
            context: workflow.context
          });
        }
      }
      
      this.emit('compensationCompleted', {
        workflowId: workflow.id
      });
      
    } catch (compensationError) {
      this.emit('compensationFailed', {
        workflowId: workflow.id,
        error: compensationError.message
      });
    }
  }
  
  /**
   * Get circuit breaker for workflow type
   */
  getCircuitBreaker(workflowType) {
    if (!this.circuitBreakers.has(workflowType)) {
      this.circuitBreakers.set(workflowType, 
        circuitBreakerFactory.get(`workflow-${workflowType}`, {
          failureThreshold: 3,
          timeout: 60000,
          resetTimeout: 30000
        })
      );
    }
    
    return this.circuitBreakers.get(workflowType);
  }
  
  /**
   * Get retry pattern for workflow type
   */
  getRetryPattern(workflowType) {
    if (!this.retryPatterns.has(workflowType)) {
      this.retryPatterns.set(workflowType, new SmartRetry({
        maxRetries: 2,
        initialDelay: 1000,
        strategy: 'exponential',
        adaptiveBackoff: true
      }));
    }
    
    return this.retryPatterns.get(workflowType);
  }
  
  /**
   * Aggregate results
   */
  async aggregateResults(results) {
    return {
      aggregated: true,
      sources: results.length,
      data: results,
      summary: this.generateSummary(results)
    };
  }
  
  /**
   * Distribute work
   */
  async distributeWork(data, workerCount) {
    const chunks = [];
    const chunkSize = Math.ceil(data.length / workerCount);
    
    for (let i = 0; i < data.length; i += chunkSize) {
      chunks.push(data.slice(i, i + chunkSize));
    }
    
    return chunks;
  }
  
  /**
   * Evaluate condition
   */
  async evaluateCondition(condition, context) {
    if (typeof condition === 'function') {
      return await condition(context);
    }
    
    return !!condition;
  }
  
  /**
   * Generate summary
   */
  generateSummary(results) {
    return {
      totalResults: results.length,
      successful: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length
    };
  }
  
  /**
   * Calculate workflow cost
   */
  calculateWorkflowCost(workflow, results) {
    // Mock cost calculation
    const baseCost = workflow.stages.length * 0.01;
    const executionCost = (workflow.metrics.duration / 1000) * 0.001;
    
    return baseCost + executionCost;
  }
  
  /**
   * Update average execution time
   */
  updateAverageExecutionTime(duration) {
    const total = this.statistics.successfulWorkflows;
    this.statistics.averageExecutionTime = 
      (this.statistics.averageExecutionTime * (total - 1) + duration) / total;
  }
  
  /**
   * Add to history
   */
  addToHistory(workflow) {
    this.workflowHistory.push({
      id: workflow.id,
      name: workflow.name,
      template: workflow.template,
      status: workflow.status,
      startedAt: workflow.startedAt,
      completedAt: workflow.completedAt,
      duration: workflow.metrics.duration,
      cost: workflow.metrics.cost
    });
    
    // Keep only last 100 workflows
    if (this.workflowHistory.length > 100) {
      this.workflowHistory.shift();
    }
  }
  
  /**
   * Enter cost-saving mode
   */
  enterCostSavingMode() {
    this.config.enableCostOptimization = true;
    
    this.emit('costSavingModeActivated', {
      timestamp: new Date()
    });
    
    // Adjust all active workflows
    for (const workflow of this.activeWorkflows.values()) {
      workflow.resilience.fallback = 'gemini-advisor';
    }
  }
  
  /**
   * Get workflow status
   */
  getWorkflowStatus(workflowId) {
    const workflow = this.workflows.get(workflowId);
    
    if (!workflow) {
      return null;
    }
    
    return {
      id: workflow.id,
      name: workflow.name,
      status: workflow.status,
      progress: this.calculateProgress(workflow),
      startedAt: workflow.startedAt,
      duration: workflow.completedAt ? 
        workflow.completedAt - workflow.startedAt : 
        Date.now() - workflow.startedAt
    };
  }
  
  /**
   * Calculate workflow progress
   */
  calculateProgress(workflow) {
    if (workflow.status === 'created') return 0;
    if (workflow.status === 'completed') return 100;
    if (workflow.status === 'failed') return -1;
    
    // Estimate based on stages
    const completedStages = workflow.results?.length || 0;
    const totalStages = workflow.stages.length;
    
    return Math.round((completedStages / totalStages) * 100);
  }
  
  /**
   * Get statistics
   */
  getStatistics() {
    return {
      ...this.statistics,
      templates: this.workflowTemplates.size,
      activeWorkflows: Array.from(this.activeWorkflows.values()).map(w => ({
        id: w.id,
        name: w.name,
        status: w.status,
        progress: this.calculateProgress(w)
      })),
      circuitBreakers: circuitBreakerFactory.getStatus(),
      costOptimization: this.costOptimizer.getStatistics()
    };
  }
  
  /**
   * Export workflow definition
   */
  exportWorkflow(workflowId) {
    const workflow = this.workflows.get(workflowId);
    
    if (!workflow) {
      return null;
    }
    
    return {
      id: workflow.id,
      template: workflow.template,
      name: workflow.name,
      description: workflow.description,
      stages: workflow.stages,
      pattern: workflow.pattern,
      resilience: workflow.resilience,
      metrics: workflow.metrics
    };
  }
}

export default WorkflowOrchestrator;