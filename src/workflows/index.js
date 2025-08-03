/**
 * Workflows Module - Export all workflow components
 */

export { PantheonWorkflow } from './PantheonWorkflow.js';
export { ExecutionPatterns } from './ExecutionPatterns.js';
export { WorkflowMonitor } from './WorkflowMonitor.js';
export { 
  workflowTemplates, 
  getWorkflowTemplate, 
  customizeWorkflow, 
  validateWorkflowTemplate 
} from './WorkflowTemplates.js';

import { PantheonWorkflow } from './PantheonWorkflow.js';
import { ExecutionPatterns } from './ExecutionPatterns.js';
import { WorkflowMonitor } from './WorkflowMonitor.js';
import { getWorkflowTemplate } from './WorkflowTemplates.js';

// Create singleton instances
let executionPatterns = null;
let workflowMonitor = null;

/**
 * Get execution patterns instance
 */
export function getExecutionPatterns() {
  if (!executionPatterns) {
    executionPatterns = new ExecutionPatterns();
  }
  return executionPatterns;
}

/**
 * Get workflow monitor instance
 */
export function getWorkflowMonitor() {
  if (!workflowMonitor) {
    workflowMonitor = new WorkflowMonitor();
  }
  return workflowMonitor;
}

/**
 * Create and execute a workflow from template
 */
export async function executeWorkflowTemplate(templateName, params = {}, options = {}) {
  // Get template
  const template = getWorkflowTemplate(templateName);
  
  // Customize if needed
  if (options.customizations) {
    Object.assign(template, options.customizations);
  }
  
  // Create workflow instance
  const workflow = new PantheonWorkflow(template, options);
  
  // Start monitoring if enabled
  if (options.monitoring !== false) {
    const monitor = getWorkflowMonitor();
    monitor.startWorkflow(workflow);
  }
  
  // Execute workflow
  return await workflow.execute(params);
}

/**
 * Create a custom workflow
 */
export function createWorkflow(definition, config = {}) {
  return new PantheonWorkflow(definition, config);
}

/**
 * Execute a pattern
 */
export async function executePattern(patternName, ...args) {
  const patterns = getExecutionPatterns();
  const executor = patterns.createExecutor(patternName);
  return await executor(...args);
}

// Export default workflow manager
export default {
  PantheonWorkflow,
  ExecutionPatterns,
  WorkflowMonitor,
  workflowTemplates,
  getExecutionPatterns,
  getWorkflowMonitor,
  executeWorkflowTemplate,
  createWorkflow,
  executePattern
};