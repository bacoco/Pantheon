/**
 * Workflow Templates - Pre-built workflows for common development scenarios
 */

// Feature Development Workflow
export const featureDevelopmentWorkflow = {
  name: 'feature-development',
  version: '1.0.0',
  description: 'Complete feature development workflow with validation',
  
  parameters: [
    { name: 'feature_name', required: true, type: 'string' },
    { name: 'requirements', required: true, type: 'object' },
    { name: 'priority', required: false, type: 'string', default: 'medium' }
  ],
  
  global_settings: {
    max_parallel_stages: 3,
    total_timeout: '2h',
    validation_mode: 'strict',
    notification_channels: ['console', 'webhook']
  },
  
  stages: {
    requirements_analysis: {
      agent: 'claude-architect',
      task: 'Analyze feature requirements and create technical specification',
      timeout: '10m',
      validation_required: true,
      success_criteria: {
        completeness: true,
        clarity: true
      }
    },
    
    architecture_design: {
      agent: 'claude-architect',
      task: 'Design system architecture and component interfaces',
      depends_on: ['requirements_analysis'],
      timeout: '15m',
      validation_required: true,
      gates: ['no_critical_issues']
    },
    
    validation_architecture: {
      agent: 'gemini-advisor',
      task: 'Validate architecture design for scalability and best practices',
      depends_on: ['architecture_design'],
      timeout: '5m',
      on_failure: 'fail'
    },
    
    implementation_planning: {
      agent: 'claude-architect',
      task: 'Create detailed implementation plan with tasks and dependencies',
      depends_on: ['validation_architecture'],
      timeout: '10m'
    },
    
    code_implementation: {
      agent: 'claude-builder',
      task: 'Implement feature code according to specifications',
      depends_on: ['implementation_planning'],
      timeout: '30m',
      validation_required: true,
      retry_policy: {
        max_retries: 2,
        backoff: 'exponential'
      }
    },
    
    unit_tests: {
      agent: 'claude-builder',
      task: 'Write comprehensive unit tests for implemented code',
      depends_on: ['code_implementation'],
      timeout: '15m',
      success_criteria: {
        coverage: 80,
        all_tests_pass: true
      }
    },
    
    integration_tests: {
      agent: 'claude-builder',
      task: 'Create integration tests for feature interactions',
      depends_on: ['unit_tests'],
      timeout: '15m'
    },
    
    code_review: {
      agent: 'gemini-advisor',
      task: 'Review code for quality, security, and best practices',
      depends_on: ['code_implementation', 'unit_tests'],
      timeout: '10m',
      gates: ['severity < 3']
    },
    
    documentation: {
      agent: 'claude-documenter',
      task: 'Generate API documentation and usage examples',
      depends_on: ['code_implementation'],
      timeout: '10m',
      on_failure: 'continue'
    },
    
    performance_validation: {
      agent: 'gemini-advisor',
      task: 'Validate performance characteristics and optimization opportunities',
      depends_on: ['code_implementation'],
      timeout: '5m',
      on_failure: 'continue'
    },
    
    final_validation: {
      agent: 'gemini-advisor',
      task: 'Final validation of complete feature implementation',
      depends_on: ['code_review', 'integration_tests'],
      timeout: '5m',
      on_failure: 'fail'
    },
    
    deployment_preparation: {
      agent: 'claude-builder',
      task: 'Prepare deployment scripts and configuration',
      depends_on: ['final_validation'],
      timeout: '10m',
      on_failure: 'skip'
    }
  },
  
  error_handling: {
    on_stage_failure: 'notify',
    on_validation_failure: 'rollback',
    max_retries: 2,
    notification_channels: ['console', 'webhook']
  },
  
  triggers: ['manual', 'api', 'github_issue']
};

// Bug Fix Workflow
export const bugFixWorkflow = {
  name: 'bug-fix',
  version: '1.0.0',
  description: 'Systematic bug investigation and fix workflow',
  
  parameters: [
    { name: 'bug_id', required: true, type: 'string' },
    { name: 'description', required: true, type: 'string' },
    { name: 'severity', required: true, type: 'string', enum: ['critical', 'high', 'medium', 'low'] },
    { name: 'affected_components', required: false, type: 'array' }
  ],
  
  global_settings: {
    max_parallel_stages: 2,
    total_timeout: '1h',
    validation_mode: 'strict',
    cost_limit: 10
  },
  
  stages: {
    bug_analysis: {
      agent: 'claude-architect',
      task: 'Analyze bug report and identify root cause',
      timeout: '10m',
      validation_required: true
    },
    
    impact_assessment: {
      agent: 'gemini-advisor',
      task: 'Assess impact and potential side effects',
      depends_on: ['bug_analysis'],
      timeout: '5m'
    },
    
    reproduction_setup: {
      agent: 'claude-builder',
      task: 'Create minimal reproduction case',
      depends_on: ['bug_analysis'],
      timeout: '10m',
      on_failure: 'continue'
    },
    
    fix_implementation: {
      agent: 'claude-builder',
      task: 'Implement bug fix with minimal changes',
      depends_on: ['reproduction_setup', 'impact_assessment'],
      timeout: '20m',
      validation_required: true,
      retry_policy: {
        max_retries: 3,
        backoff: 'linear'
      }
    },
    
    regression_tests: {
      agent: 'claude-builder',
      task: 'Write regression tests to prevent recurrence',
      depends_on: ['fix_implementation'],
      timeout: '10m',
      success_criteria: {
        all_tests_pass: true
      }
    },
    
    fix_validation: {
      agent: 'gemini-advisor',
      task: 'Validate fix correctness and completeness',
      depends_on: ['fix_implementation', 'regression_tests'],
      timeout: '5m',
      gates: ['no_critical_issues'],
      on_failure: 'fail'
    },
    
    side_effect_check: {
      agent: 'gemini-advisor',
      task: 'Check for unintended side effects',
      depends_on: ['fix_implementation'],
      timeout: '5m'
    },
    
    documentation_update: {
      agent: 'claude-documenter',
      task: 'Update documentation with fix details',
      depends_on: ['fix_validation'],
      timeout: '5m',
      on_failure: 'continue'
    }
  },
  
  error_handling: {
    on_stage_failure: 'rollback',
    on_validation_failure: 'abort',
    notification_channels: ['console']
  },
  
  triggers: ['manual', 'github_issue', 'monitoring_alert']
};

// Architecture Review Workflow
export const architectureReviewWorkflow = {
  name: 'architecture-review',
  version: '1.0.0',
  description: 'Comprehensive architecture review and validation workflow',
  
  parameters: [
    { name: 'component', required: true, type: 'string' },
    { name: 'review_type', required: true, type: 'string', enum: ['full', 'security', 'performance', 'scalability'] },
    { name: 'include_recommendations', required: false, type: 'boolean', default: true }
  ],
  
  global_settings: {
    max_parallel_stages: 4,
    total_timeout: '30m',
    validation_mode: 'advisory'
  },
  
  stages: {
    codebase_analysis: {
      agent: 'gemini-advisor',
      task: 'Analyze current codebase structure and patterns',
      timeout: '5m'
    },
    
    dependency_review: {
      agent: 'gemini-advisor',
      task: 'Review dependencies and version compatibility',
      timeout: '5m'
    },
    
    security_assessment: {
      agent: 'gemini-advisor',
      task: 'Assess security vulnerabilities and practices',
      timeout: '5m',
      gates: ['severity < 4']
    },
    
    performance_analysis: {
      agent: 'gemini-advisor',
      task: 'Analyze performance characteristics and bottlenecks',
      timeout: '5m'
    },
    
    scalability_review: {
      agent: 'gemini-advisor',
      task: 'Review scalability patterns and limitations',
      depends_on: ['codebase_analysis'],
      timeout: '5m'
    },
    
    best_practices_check: {
      agent: 'gemini-advisor',
      task: 'Verify adherence to best practices and standards',
      depends_on: ['codebase_analysis'],
      timeout: '5m'
    },
    
    technical_debt_assessment: {
      agent: 'gemini-advisor',
      task: 'Identify and quantify technical debt',
      depends_on: ['codebase_analysis'],
      timeout: '5m'
    },
    
    recommendations_generation: {
      agent: 'claude-architect',
      task: 'Generate improvement recommendations based on review findings',
      depends_on: [
        'security_assessment',
        'performance_analysis',
        'scalability_review',
        'best_practices_check',
        'technical_debt_assessment'
      ],
      timeout: '10m',
      condition: 'include_recommendations === true'
    },
    
    report_compilation: {
      agent: 'claude-documenter',
      task: 'Compile comprehensive review report',
      depends_on: ['recommendations_generation'],
      timeout: '5m',
      fallback_agent: 'gemini-advisor'
    }
  },
  
  error_handling: {
    on_stage_failure: 'continue',
    on_validation_failure: 'notify'
  },
  
  triggers: ['manual', 'scheduled', 'api']
};

// API Development Workflow
export const apiDevelopmentWorkflow = {
  name: 'api-development',
  version: '1.0.0',
  description: 'RESTful API development with OpenAPI specification',
  
  parameters: [
    { name: 'api_name', required: true, type: 'string' },
    { name: 'endpoints', required: true, type: 'array' },
    { name: 'authentication', required: false, type: 'string', default: 'jwt' }
  ],
  
  global_settings: {
    max_parallel_stages: 3,
    total_timeout: '90m',
    validation_mode: 'strict'
  },
  
  stages: {
    api_design: {
      agent: 'claude-architect',
      task: 'Design RESTful API with OpenAPI specification',
      timeout: '15m',
      validation_required: true
    },
    
    schema_validation: {
      agent: 'gemini-advisor',
      task: 'Validate API schema and design patterns',
      depends_on: ['api_design'],
      timeout: '5m'
    },
    
    endpoint_implementation: {
      agent: 'claude-builder',
      task: 'Implement API endpoints with proper error handling',
      depends_on: ['schema_validation'],
      timeout: '30m',
      validation_required: true
    },
    
    authentication_setup: {
      agent: 'claude-builder',
      task: 'Implement authentication and authorization',
      depends_on: ['endpoint_implementation'],
      timeout: '15m'
    },
    
    validation_middleware: {
      agent: 'claude-builder',
      task: 'Create request/response validation middleware',
      depends_on: ['endpoint_implementation'],
      timeout: '10m'
    },
    
    api_tests: {
      agent: 'claude-builder',
      task: 'Write API integration tests',
      depends_on: ['endpoint_implementation', 'authentication_setup'],
      timeout: '15m',
      success_criteria: {
        coverage: 85,
        all_tests_pass: true
      }
    },
    
    api_documentation: {
      agent: 'claude-documenter',
      task: 'Generate API documentation with examples',
      depends_on: ['endpoint_implementation'],
      timeout: '10m'
    },
    
    security_review: {
      agent: 'gemini-advisor',
      task: 'Review API security and OWASP compliance',
      depends_on: ['authentication_setup', 'validation_middleware'],
      timeout: '5m',
      gates: ['no_critical_issues']
    },
    
    performance_testing: {
      agent: 'gemini-advisor',
      task: 'Validate API performance and response times',
      depends_on: ['api_tests'],
      timeout: '5m'
    }
  },
  
  error_handling: {
    on_stage_failure: 'rollback',
    on_validation_failure: 'abort'
  },
  
  triggers: ['manual', 'api']
};

// Database Migration Workflow
export const databaseMigrationWorkflow = {
  name: 'database-migration',
  version: '1.0.0',
  description: 'Safe database migration with rollback support',
  
  parameters: [
    { name: 'migration_type', required: true, type: 'string', enum: ['schema', 'data', 'both'] },
    { name: 'target_version', required: true, type: 'string' },
    { name: 'dry_run', required: false, type: 'boolean', default: true }
  ],
  
  global_settings: {
    max_parallel_stages: 1,
    total_timeout: '30m',
    validation_mode: 'strict'
  },
  
  stages: {
    backup_creation: {
      agent: 'claude-builder',
      task: 'Create database backup before migration',
      timeout: '5m',
      on_failure: 'fail'
    },
    
    migration_analysis: {
      agent: 'claude-architect',
      task: 'Analyze migration requirements and risks',
      depends_on: ['backup_creation'],
      timeout: '5m'
    },
    
    migration_script: {
      agent: 'claude-builder',
      task: 'Generate migration and rollback scripts',
      depends_on: ['migration_analysis'],
      timeout: '10m',
      validation_required: true
    },
    
    script_validation: {
      agent: 'gemini-advisor',
      task: 'Validate migration scripts for safety',
      depends_on: ['migration_script'],
      timeout: '5m',
      gates: ['no_destructive_operations']
    },
    
    dry_run_execution: {
      agent: 'claude-builder',
      task: 'Execute migration in dry-run mode',
      depends_on: ['script_validation'],
      timeout: '5m',
      condition: 'dry_run === true'
    },
    
    migration_execution: {
      agent: 'claude-builder',
      task: 'Execute actual migration',
      depends_on: ['dry_run_execution'],
      timeout: '10m',
      condition: 'dry_run === false',
      rollback: {
        agent: 'claude-builder',
        task: 'Rollback migration using backup'
      }
    },
    
    data_validation: {
      agent: 'gemini-advisor',
      task: 'Validate data integrity post-migration',
      depends_on: ['migration_execution'],
      timeout: '5m',
      on_failure: 'rollback'
    },
    
    performance_check: {
      agent: 'gemini-advisor',
      task: 'Check database performance post-migration',
      depends_on: ['migration_execution'],
      timeout: '5m'
    }
  },
  
  error_handling: {
    on_stage_failure: 'rollback',
    on_validation_failure: 'rollback',
    notification_channels: ['console', 'email']
  },
  
  triggers: ['manual']
};

// Quick Validation Workflow
export const quickValidationWorkflow = {
  name: 'quick-validation',
  version: '1.0.0',
  description: 'Fast validation workflow for code changes',
  
  parameters: [
    { name: 'files', required: true, type: 'array' },
    { name: 'validation_level', required: false, type: 'string', default: 'standard' }
  ],
  
  global_settings: {
    max_parallel_stages: 5,
    total_timeout: '10m',
    validation_mode: 'advisory'
  },
  
  stages: {
    syntax_check: {
      agent: 'gemini-advisor',
      task: 'Check syntax and basic errors',
      timeout: '2m'
    },
    
    style_check: {
      agent: 'gemini-advisor',
      task: 'Verify code style and formatting',
      timeout: '2m'
    },
    
    security_scan: {
      agent: 'gemini-advisor',
      task: 'Quick security vulnerability scan',
      timeout: '3m'
    },
    
    complexity_analysis: {
      agent: 'gemini-advisor',
      task: 'Analyze code complexity',
      timeout: '2m'
    },
    
    best_practices: {
      agent: 'gemini-advisor',
      task: 'Check adherence to best practices',
      timeout: '2m'
    },
    
    summary_report: {
      agent: 'gemini-advisor',
      task: 'Generate validation summary',
      depends_on: ['syntax_check', 'style_check', 'security_scan', 'complexity_analysis', 'best_practices'],
      timeout: '2m'
    }
  },
  
  error_handling: {
    on_stage_failure: 'continue',
    on_validation_failure: 'continue'
  },
  
  triggers: ['manual', 'pre-commit', 'api']
};

// Workflow Template Registry
export const workflowTemplates = {
  'feature-development': featureDevelopmentWorkflow,
  'bug-fix': bugFixWorkflow,
  'architecture-review': architectureReviewWorkflow,
  'api-development': apiDevelopmentWorkflow,
  'database-migration': databaseMigrationWorkflow,
  'quick-validation': quickValidationWorkflow
};

// Helper function to get workflow template
export function getWorkflowTemplate(name) {
  const template = workflowTemplates[name];
  
  if (!template) {
    throw new Error(`Unknown workflow template: ${name}`);
  }
  
  // Return a deep copy to prevent modifications
  return JSON.parse(JSON.stringify(template));
}

// Helper function to customize workflow template
export function customizeWorkflow(templateName, customizations = {}) {
  const template = getWorkflowTemplate(templateName);
  
  // Merge customizations
  if (customizations.stages) {
    Object.assign(template.stages, customizations.stages);
  }
  
  if (customizations.global_settings) {
    Object.assign(template.global_settings, customizations.global_settings);
  }
  
  if (customizations.error_handling) {
    Object.assign(template.error_handling, customizations.error_handling);
  }
  
  if (customizations.parameters) {
    template.parameters = [...template.parameters, ...customizations.parameters];
  }
  
  return template;
}

// Helper function to validate workflow template
export function validateWorkflowTemplate(template) {
  const errors = [];
  
  // Check required fields
  if (!template.name) {
    errors.push('Workflow name is required');
  }
  
  if (!template.stages || Object.keys(template.stages).length === 0) {
    errors.push('Workflow must have at least one stage');
  }
  
  // Check stage dependencies
  for (const [stageName, stage] of Object.entries(template.stages || {})) {
    if (stage.depends_on) {
      for (const dep of stage.depends_on) {
        if (!template.stages[dep]) {
          errors.push(`Stage '${stageName}' depends on unknown stage '${dep}'`);
        }
      }
    }
    
    if (!stage.agent) {
      errors.push(`Stage '${stageName}' missing required 'agent' field`);
    }
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

export default workflowTemplates;