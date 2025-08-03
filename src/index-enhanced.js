/**
 * Pantheon Multi-AI Ecosystem - Enhanced Edition
 * Complete orchestration framework with resilience patterns
 */

// Core Components
export { PantheonAgent } from './agents/PantheonAgent.js';
export { AgentRegistry, getRegistry } from './agents/AgentRegistry.js';
export { ClaudeArchitect } from './agents/creators/ClaudeArchitect.js';
export { ClaudeBuilder } from './agents/creators/ClaudeBuilder.js';
export { GeminiAdvisor } from './agents/validators/GeminiAdvisor.js';

// Resilience Patterns
export { CircuitBreaker, CircuitBreakerFactory, circuitBreakerFactory } from './utils/CircuitBreaker.js';
export { RetryPattern, BulkRetry, SmartRetry } from './utils/RetryPattern.js';

// Validation System
export { ValidationOrchestrator } from './validation/ValidationOrchestrator.js';
export { ValidationPipeline } from './validation/ValidationPipeline.js';
export { FeedbackProcessor } from './validation/FeedbackProcessor.js';
export { ValidationReporter } from './validation/ValidationReporter.js';

// Workflow System
export { PantheonWorkflow } from './workflows/PantheonWorkflow.js';
export { ExecutionPatterns } from './workflows/ExecutionPatterns.js';
export { WorkflowMonitor } from './workflows/WorkflowMonitor.js';

// Orchestration
export { WorkflowOrchestrator } from './orchestration/WorkflowOrchestrator.js';

// Event System
export { EventSystem, getEventSystem } from './events/EventSystem.js';

// Routing & Optimization
export { SmartRouter } from './router/SmartRouter.js';
export { CostOptimizer, getOptimizer } from './router/CostOptimizer.js';
export { UsageTracker } from './router/UsageTracker.js';
export { FallbackHandler } from './router/FallbackHandler.js';

// Automation
export { AutomationSuite } from './automation/AutomationSuite.js';

// Management
export { ModelManager } from './management/ModelManager.js';
export { AgentOrchestrator } from './management/AgentOrchestrator.js';
export { CostController } from './management/CostController.js';
export { MetricsDashboard } from './management/MetricsDashboard.js';

// Utilities
import { ValidationOrchestrator } from './validation/ValidationOrchestrator.js';
import { ValidationPipeline } from './validation/ValidationPipeline.js';
import { FeedbackProcessor } from './validation/FeedbackProcessor.js';
import { WorkflowOrchestrator } from './orchestration/WorkflowOrchestrator.js';
import { EventSystem } from './events/EventSystem.js';
import { AutomationSuite } from './automation/AutomationSuite.js';
import { getRegistry } from './agents/AgentRegistry.js';
import { getOptimizer } from './router/CostOptimizer.js';

/**
 * Initialize Enhanced Pantheon System
 */
export async function initializePantheon(config = {}) {
  console.log('🚀 Initializing Enhanced Pantheon Multi-AI Ecosystem...');
  
  // Initialize core components
  const agentRegistry = getRegistry();
  const costOptimizer = getOptimizer();
  
  // Initialize event system
  const eventSystem = new EventSystem(config.events);
  
  // Initialize validation system
  const validationOrchestrator = new ValidationOrchestrator(config.validation);
  const validationPipeline = new ValidationPipeline(config.validationPipeline);
  const feedbackProcessor = new FeedbackProcessor(config.feedback);
  
  // Initialize workflow orchestrator
  const workflowOrchestrator = new WorkflowOrchestrator(config.workflow);
  
  // Initialize automation suite
  const automationSuite = new AutomationSuite(config.automation);
  
  // Register default agents
  await agentRegistry.initialize();
  
  // Connect components
  setupComponentIntegration({
    eventSystem,
    validationOrchestrator,
    validationPipeline,
    feedbackProcessor,
    workflowOrchestrator,
    automationSuite,
    costOptimizer
  });
  
  console.log('✅ Enhanced Pantheon System initialized successfully');
  
  return {
    // Core systems
    agents: agentRegistry,
    events: eventSystem,
    validation: {
      orchestrator: validationOrchestrator,
      pipeline: validationPipeline,
      feedback: feedbackProcessor
    },
    workflows: workflowOrchestrator,
    automation: automationSuite,
    optimization: costOptimizer,
    
    // API methods
    async executeWorkflow(template, context) {
      const workflow = workflowOrchestrator.createWorkflow(template, context);
      return await workflowOrchestrator.execute(workflow.id);
    },
    
    async createAutomation(template, context) {
      return await automationSuite.createAutomation(template, context);
    },
    
    async validate(data, profile) {
      return await validationPipeline.execute(data, { profile });
    },
    
    async optimizeRoute(request) {
      return costOptimizer.getOptimizationRecommendation(
        request.taskType,
        request.contextSize
      );
    },
    
    getStatistics() {
      return {
        agents: agentRegistry.getStatistics(),
        events: eventSystem.getStatistics(),
        workflows: workflowOrchestrator.getStatistics(),
        automation: automationSuite.getStatistics(),
        optimization: costOptimizer.getStatistics()
      };
    },
    
    // Shutdown method
    async shutdown() {
      console.log('🛑 Shutting down Pantheon System...');
      eventSystem.stopAsyncProcessor();
      await agentRegistry.shutdown();
      console.log('✅ Pantheon System shut down successfully');
    }
  };
}

/**
 * Setup component integration
 */
function setupComponentIntegration(components) {
  const {
    eventSystem,
    validationOrchestrator,
    validationPipeline,
    feedbackProcessor,
    workflowOrchestrator,
    automationSuite,
    costOptimizer
  } = components;
  
  // Validation events
  validationOrchestrator.on('validationCompleted', (result) => {
    eventSystem.publish('validation.completed', result, {
      channel: 'validation'
    });
  });
  
  validationPipeline.on('validationTriggered', (event) => {
    eventSystem.publish('validation.triggered', event, {
      channel: 'validation'
    });
  });
  
  // Workflow events
  workflowOrchestrator.on('workflowCompleted', (result) => {
    eventSystem.publish('workflow.completed', result, {
      channel: 'workflows'
    });
  });
  
  workflowOrchestrator.on('workflowFailed', (error) => {
    eventSystem.publish('workflow.failed', error, {
      channel: 'errors'
    });
  });
  
  // Automation events
  automationSuite.on('automationCompleted', (result) => {
    eventSystem.publish('automation.completed', result, {
      channel: 'automation'
    });
  });
  
  // Cost optimization events
  costOptimizer.on('costAlert', (alert) => {
    eventSystem.publish('cost.alert', alert, {
      channel: 'metrics'
    });
    
    // Trigger cost-saving automation
    if (alert.level === 'critical') {
      automationSuite.switchToEconomyMode();
    }
  });
  
  // Feedback loop
  feedbackProcessor.on('refinementCompleted', async (refinement) => {
    eventSystem.publish('refinement.completed', refinement, {
      channel: 'validation'
    });
    
    // Trigger re-validation
    if (refinement.success) {
      await validationPipeline.manualTrigger('post-refinement', {
        refinementId: refinement.id
      });
    }
  });
  
  // System monitoring
  eventSystem.subscribe('system.error', async (error) => {
    // Log critical errors
    console.error('System Error:', error);
    
    // Trigger recovery automation
    if (error.severity === 'critical') {
      await automationSuite.executeAutomation('error-recovery', error);
    }
  });
  
  console.log('✅ Component integration established');
}

/**
 * Create default configuration
 */
export function createDefaultConfig() {
  return {
    events: {
      enableEventSourcing: true,
      enableAsyncProcessing: true,
      maxListeners: 100
    },
    validation: {
      profiles: ['syntax', 'security', 'performance', 'code_quality'],
      autoValidation: true
    },
    validationPipeline: {
      autoValidation: true,
      validateBeforeExecution: true,
      validateAfterExecution: true
    },
    feedback: {
      autoRefine: true,
      maxRefinementCycles: 3
    },
    workflow: {
      maxConcurrentWorkflows: 10,
      validateBeforeExecution: true,
      enableCostOptimization: true,
      enableCircuitBreakers: true,
      enableRetryLogic: true
    },
    automation: {
      autoMode: true,
      learningEnabled: true,
      adaptiveOptimization: true,
      maxConcurrentAutomations: 5
    }
  };
}

// Export default initialization
export default {
  initializePantheon,
  createDefaultConfig
};