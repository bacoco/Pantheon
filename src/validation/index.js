/**
 * Validation Module - Export all validation components
 */

export { ValidationOrchestrator } from './ValidationOrchestrator.js';
export { ValidationTriggers } from './ValidationTriggers.js';
export { FeedbackProcessor } from './FeedbackProcessor.js';
export { ValidationReporter } from './ValidationReporter.js';
export { ValidationPipeline } from './ValidationPipeline.js';

import { ValidationOrchestrator } from './ValidationOrchestrator.js';
import { ValidationTriggers } from './ValidationTriggers.js';
import { FeedbackProcessor } from './FeedbackProcessor.js';
import { ValidationReporter } from './ValidationReporter.js';
import { ValidationPipeline as NewValidationPipeline } from './ValidationPipeline.js';

// Create singleton instances
let orchestrator = null;
let triggers = null;
let feedbackProcessor = null;
let reporter = null;

/**
 * Get validation orchestrator instance
 */
export function getValidationOrchestrator() {
  if (!orchestrator) {
    orchestrator = new ValidationOrchestrator();
  }
  return orchestrator;
}

/**
 * Get validation triggers instance
 */
export function getValidationTriggers() {
  if (!triggers) {
    triggers = new ValidationTriggers();
    
    // Connect to orchestrator
    triggers.orchestrator = getValidationOrchestrator();
  }
  return triggers;
}

/**
 * Get feedback processor instance
 */
export function getFeedbackProcessor() {
  if (!feedbackProcessor) {
    feedbackProcessor = new FeedbackProcessor();
  }
  return feedbackProcessor;
}

/**
 * Get validation reporter instance
 */
export function getValidationReporter() {
  if (!reporter) {
    reporter = new ValidationReporter();
  }
  return reporter;
}

/**
 * Integrated validation pipeline
 */
export class ValidationPipeline {
  constructor() {
    this.orchestrator = getValidationOrchestrator();
    this.triggers = getValidationTriggers();
    this.feedbackProcessor = getFeedbackProcessor();
    this.reporter = getValidationReporter();
    
    this.setupIntegration();
  }
  
  /**
   * Setup component integration
   */
  setupIntegration() {
    // Connect orchestrator to feedback processor
    this.orchestrator.on('validationCompleted', async (data) => {
      if (!data.passed) {
        const feedback = await this.feedbackProcessor.processFeedback(data);
        
        if (feedback.requiresRefinement) {
          this.emit('refinementNeeded', feedback);
        }
      }
    });
    
    // Connect triggers to orchestrator
    this.triggers.on('validationTriggered', async (data) => {
      // Generate report for triggered validations
      if (data.result) {
        await this.reporter.generateReport(data.result, {
          title: `Automated Validation - ${data.trigger}`,
          includeMetrics: true
        });
      }
    });
    
    // Connect feedback processor to reporter
    this.feedbackProcessor.on('refinementCompleted', async (data) => {
      // Generate refinement report
      const report = {
        id: data.id,
        profile: 'refinement',
        passed: data.success,
        analysis: {
          issues: [],
          suggestions: [`Refinement completed with improvement score: ${data.improvementScore}`]
        },
        duration: data.duration
      };
      
      await this.reporter.generateReport(report, {
        title: 'Refinement Report',
        formats: ['markdown']
      });
    });
  }
  
  /**
   * Validate with full pipeline
   */
  async validate(target, profile = 'code_quality', options = {}) {
    // Run validation
    const result = await this.orchestrator.validate({
      profile: profile,
      target: target,
      ...options
    });
    
    // Process feedback if failed
    if (!result.passed) {
      const feedback = await this.feedbackProcessor.processFeedback(result, {
        autoRefine: options.autoRefine
      });
      
      result.feedback = feedback;
    }
    
    // Generate report
    const report = await this.reporter.generateReport(result, {
      title: `Validation Report - ${profile}`,
      includeMetrics: true,
      formats: options.reportFormats || ['html', 'markdown']
    });
    
    result.report = report;
    
    return result;
  }
  
  /**
   * Enable automatic validation
   */
  enableAutoValidation(checkpoints = {}) {
    this.triggers.setEnabled(true);
    
    if (checkpoints) {
      this.triggers.updateCheckpoints(checkpoints);
    }
  }
  
  /**
   * Disable automatic validation
   */
  disableAutoValidation() {
    this.triggers.setEnabled(false);
  }
  
  /**
   * Get pipeline statistics
   */
  getStatistics() {
    return {
      orchestrator: this.orchestrator.getMetrics(),
      triggers: this.triggers.getStatistics(),
      feedbackProcessor: this.feedbackProcessor.getStatistics(),
      reporter: this.reporter.getAggregatedMetrics()
    };
  }
}

// Create singleton pipeline
let pipeline = null;

/**
 * Get validation pipeline instance
 */
export function getValidationPipeline() {
  if (!pipeline) {
    pipeline = new ValidationPipeline();
  }
  return pipeline;
}

// Export default validation system
export default {
  ValidationOrchestrator,
  ValidationTriggers,
  FeedbackProcessor,
  ValidationReporter,
  ValidationPipeline,
  getValidationOrchestrator,
  getValidationTriggers,
  getFeedbackProcessor,
  getValidationReporter,
  getValidationPipeline
};