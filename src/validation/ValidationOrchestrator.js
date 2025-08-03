import { EventEmitter } from 'eventemitter3';
import { v4 as uuidv4 } from 'uuid';
import winston from 'winston';
import { getRegistry } from '../agents/AgentRegistry.js';

/**
 * Validation Orchestrator - Manages comprehensive validation workflows
 * Ensures Gemini models are used for validation without code generation
 */
export class ValidationOrchestrator extends EventEmitter {
  constructor(config = {}) {
    super();
    
    // Configuration
    this.config = {
      strictMode: config.strictMode !== false,
      autoTrigger: config.autoTrigger !== false,
      maxRetries: config.maxRetries || 3,
      timeout: config.timeout || 30000,
      severityThresholds: {
        critical: 0,
        high: 3,
        medium: 5,
        low: 10
      },
      ...config
    };
    
    // Validation profiles
    this.validationProfiles = {
      code_quality: {
        validators: ['gemini-advisor'],
        checks: ['syntax', 'style', 'complexity', 'maintainability'],
        severity: 'medium'
      },
      security: {
        validators: ['gemini-advisor'],
        checks: ['vulnerabilities', 'authentication', 'authorization', 'injection'],
        severity: 'critical'
      },
      performance: {
        validators: ['gemini-advisor'],
        checks: ['time_complexity', 'space_complexity', 'bottlenecks', 'optimization'],
        severity: 'high'
      },
      architecture: {
        validators: ['gemini-advisor'],
        checks: ['patterns', 'dependencies', 'coupling', 'cohesion'],
        severity: 'high'
      },
      testing: {
        validators: ['gemini-advisor'],
        checks: ['coverage', 'edge_cases', 'mocking', 'assertions'],
        severity: 'medium'
      },
      documentation: {
        validators: ['gemini-advisor'],
        checks: ['completeness', 'clarity', 'examples', 'api_docs'],
        severity: 'low'
      },
      compliance: {
        validators: ['gemini-advisor'],
        checks: ['licenses', 'standards', 'regulations', 'policies'],
        severity: 'critical'
      },
      accessibility: {
        validators: ['gemini-advisor'],
        checks: ['wcag', 'aria', 'keyboard', 'screen_reader'],
        severity: 'high'
      }
    };
    
    // Validation state
    this.activeValidations = new Map();
    this.validationHistory = [];
    this.validationMetrics = {
      total: 0,
      passed: 0,
      failed: 0,
      criticalIssues: 0,
      averageDuration: 0
    };
    
    // Gemini safeguards
    this.geminiSafeguards = {
      enforceReadOnly: true,
      blockCodeGeneration: true,
      restrictedTools: ['Read', 'Grep', 'Glob'],
      maxContextSize: 100000,
      responseFormat: 'analysis_only'
    };
    
    // Agent registry
    this.agentRegistry = getRegistry();
    
    // Logger
    this.logger = this.setupLogger();
    
    // Initialize validation triggers
    this.setupValidationTriggers();
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
      defaultMeta: { service: 'validation-orchestrator' },
      transports: [
        new winston.transports.File({ 
          filename: '.claude/logs/validation.log',
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
   * Setup automatic validation triggers
   */
  setupValidationTriggers() {
    if (!this.config.autoTrigger) return;
    
    // Listen for events that should trigger validation
    this.on('code_created', (data) => this.triggerValidation('code_quality', data));
    this.on('api_created', (data) => this.triggerValidation('security', data));
    this.on('architecture_changed', (data) => this.triggerValidation('architecture', data));
    this.on('tests_written', (data) => this.triggerValidation('testing', data));
    this.on('deployment_ready', (data) => this.triggerValidation('compliance', data));
  }
  
  /**
   * Trigger validation based on event
   */
  async triggerValidation(profileName, data) {
    this.logger.info(`Validation triggered: ${profileName}`, { data });
    
    const profile = this.validationProfiles[profileName];
    if (!profile) {
      this.logger.warn(`Unknown validation profile: ${profileName}`);
      return;
    }
    
    return await this.validate({
      profile: profileName,
      target: data,
      automatic: true
    });
  }
  
  /**
   * Main validation entry point
   */
  async validate(request) {
    const validationId = uuidv4();
    const startTime = Date.now();
    
    this.logger.info(`Starting validation: ${validationId}`, { request });
    
    // Create validation context
    const context = {
      id: validationId,
      profile: request.profile || 'code_quality',
      target: request.target,
      startTime: startTime,
      automatic: request.automatic || false,
      results: [],
      issues: [],
      metrics: {}
    };
    
    this.activeValidations.set(validationId, context);
    this.validationMetrics.total++;
    
    this.emit('validationStarted', {
      id: validationId,
      profile: context.profile,
      automatic: context.automatic
    });
    
    try {
      // Get validation profile
      const profile = this.validationProfiles[context.profile];
      
      // Ensure Gemini validator with safeguards
      const validator = await this.getGeminiValidator(profile.validators[0]);
      
      // Apply Gemini safeguards
      this.applyGeminiSafeguards(validator);
      
      // Perform validation checks
      const results = await this.performValidationChecks(
        validator,
        profile,
        request.target
      );
      
      // Analyze results
      const analysis = this.analyzeResults(results, profile);
      
      // Process feedback if issues found
      if (analysis.issues.length > 0) {
        context.feedback = await this.processFeedback(analysis.issues);
      }
      
      // Calculate metrics
      const duration = Date.now() - startTime;
      context.duration = duration;
      context.results = results;
      context.analysis = analysis;
      context.passed = analysis.passed;
      
      // Update metrics
      if (analysis.passed) {
        this.validationMetrics.passed++;
      } else {
        this.validationMetrics.failed++;
      }
      
      this.validationMetrics.criticalIssues += analysis.criticalCount;
      this.updateAverageDuration(duration);
      
      // Store in history
      this.validationHistory.push({
        id: validationId,
        timestamp: new Date(),
        profile: context.profile,
        passed: analysis.passed,
        duration: duration,
        issueCount: analysis.issues.length
      });
      
      // Emit completion
      this.emit('validationCompleted', {
        id: validationId,
        passed: analysis.passed,
        issues: analysis.issues,
        duration: duration
      });
      
      this.logger.info(`Validation completed: ${validationId}`, {
        passed: analysis.passed,
        duration: duration
      });
      
      return {
        id: validationId,
        passed: analysis.passed,
        profile: context.profile,
        results: results,
        analysis: analysis,
        feedback: context.feedback,
        duration: duration
      };
      
    } catch (error) {
      this.logger.error(`Validation failed: ${validationId}`, { error: error.message });
      
      this.emit('validationFailed', {
        id: validationId,
        error: error.message
      });
      
      throw error;
      
    } finally {
      this.activeValidations.delete(validationId);
    }
  }
  
  /**
   * Get Gemini validator with strict safeguards
   */
  async getGeminiValidator(validatorName) {
    let validator = this.agentRegistry.getAgentByName(validatorName);
    
    if (!validator) {
      // Create Gemini validator if not exists
      validator = await this.agentRegistry.createAgent(validatorName, {
        model: 'gemini-advisor',
        type: 'validator',
        tools: ['Read', 'Grep', 'Glob'], // Read-only tools
        permissions: {
          canWriteCode: false,
          canModifyFiles: false,
          canExecuteCommands: false
        }
      });
    }
    
    // Verify it's a Gemini model
    if (!validator.model?.includes('gemini')) {
      throw new Error(`Validator ${validatorName} must use Gemini model for validation`);
    }
    
    return validator;
  }
  
  /**
   * Apply strict Gemini safeguards
   */
  applyGeminiSafeguards(validator) {
    // Override any write capabilities
    validator.tools = this.geminiSafeguards.restrictedTools;
    validator.canWriteCode = false;
    validator.canModifyFiles = false;
    validator.canExecuteCommands = false;
    
    // Enforce response format
    validator.responseFormat = this.geminiSafeguards.responseFormat;
    
    // Add validation-specific instructions
    validator.instructions = `
      You are a validation specialist. Your role is to:
      1. Analyze code and provide feedback
      2. Identify issues and suggest improvements
      3. Check compliance with standards
      
      CRITICAL RESTRICTIONS:
      - You MUST NOT generate or write any code
      - You MUST NOT modify any files
      - You MUST NOT execute any commands
      - You can ONLY read and analyze existing code
      - Provide feedback in structured JSON format
    `;
    
    this.logger.info('Gemini safeguards applied', {
      validator: validator.name,
      tools: validator.tools
    });
  }
  
  /**
   * Perform validation checks
   */
  async performValidationChecks(validator, profile, target) {
    const results = [];
    
    for (const checkType of profile.checks) {
      this.emit('checkStarted', {
        type: checkType,
        validator: validator.name
      });
      
      try {
        const checkResult = await this.performSingleCheck(
          validator,
          checkType,
          target
        );
        
        results.push({
          type: checkType,
          status: checkResult.status,
          issues: checkResult.issues || [],
          suggestions: checkResult.suggestions || [],
          metrics: checkResult.metrics || {}
        });
        
        this.emit('checkCompleted', {
          type: checkType,
          status: checkResult.status
        });
        
      } catch (error) {
        this.logger.error(`Check failed: ${checkType}`, { error: error.message });
        
        results.push({
          type: checkType,
          status: 'error',
          error: error.message
        });
      }
    }
    
    return results;
  }
  
  /**
   * Perform a single validation check
   */
  async performSingleCheck(validator, checkType, target) {
    const checkStrategies = {
      // Code quality checks
      syntax: {
        prompt: 'Analyze code syntax and identify any errors or issues',
        focus: ['syntax_errors', 'typos', 'missing_brackets']
      },
      style: {
        prompt: 'Check code style and formatting consistency',
        focus: ['indentation', 'naming_conventions', 'formatting']
      },
      complexity: {
        prompt: 'Analyze code complexity and identify overly complex sections',
        focus: ['cyclomatic_complexity', 'nesting_depth', 'function_length']
      },
      maintainability: {
        prompt: 'Assess code maintainability and readability',
        focus: ['clarity', 'documentation', 'modularity']
      },
      
      // Security checks
      vulnerabilities: {
        prompt: 'Identify security vulnerabilities and risks',
        focus: ['injection', 'xss', 'csrf', 'exposure']
      },
      authentication: {
        prompt: 'Review authentication implementation and security',
        focus: ['password_handling', 'session_management', 'tokens']
      },
      authorization: {
        prompt: 'Check authorization and access control',
        focus: ['permissions', 'roles', 'access_control']
      },
      injection: {
        prompt: 'Check for injection vulnerabilities',
        focus: ['sql_injection', 'command_injection', 'ldap_injection']
      },
      
      // Performance checks
      time_complexity: {
        prompt: 'Analyze time complexity of algorithms',
        focus: ['big_o', 'nested_loops', 'recursion']
      },
      space_complexity: {
        prompt: 'Analyze space complexity and memory usage',
        focus: ['memory_leaks', 'large_allocations', 'caching']
      },
      bottlenecks: {
        prompt: 'Identify performance bottlenecks',
        focus: ['slow_operations', 'blocking_calls', 'inefficient_queries']
      },
      optimization: {
        prompt: 'Suggest performance optimizations',
        focus: ['caching', 'lazy_loading', 'batch_processing']
      },
      
      // Architecture checks
      patterns: {
        prompt: 'Review design patterns and architectural decisions',
        focus: ['design_patterns', 'anti_patterns', 'best_practices']
      },
      dependencies: {
        prompt: 'Analyze dependencies and coupling',
        focus: ['circular_dependencies', 'version_conflicts', 'unused_dependencies']
      },
      coupling: {
        prompt: 'Check coupling between components',
        focus: ['tight_coupling', 'loose_coupling', 'interfaces']
      },
      cohesion: {
        prompt: 'Assess component cohesion',
        focus: ['single_responsibility', 'module_cohesion', 'class_cohesion']
      },
      
      // Testing checks
      coverage: {
        prompt: 'Review test coverage and completeness',
        focus: ['line_coverage', 'branch_coverage', 'untested_code']
      },
      edge_cases: {
        prompt: 'Identify missing edge case tests',
        focus: ['boundary_conditions', 'error_cases', 'null_checks']
      },
      mocking: {
        prompt: 'Review mocking and test isolation',
        focus: ['mock_usage', 'test_isolation', 'dependencies']
      },
      assertions: {
        prompt: 'Check test assertions and expectations',
        focus: ['assertion_quality', 'meaningful_tests', 'false_positives']
      }
    };
    
    const strategy = checkStrategies[checkType];
    if (!strategy) {
      throw new Error(`Unknown check type: ${checkType}`);
    }
    
    // Prepare validation task
    const task = {
      type: 'validation',
      data: {
        target: target,
        checkType: checkType,
        prompt: strategy.prompt,
        focus: strategy.focus,
        responseFormat: 'json',
        restrictions: {
          noCodeGeneration: true,
          analysisOnly: true
        }
      }
    };
    
    // Execute validation
    const result = await validator.execute(task);
    
    // Parse and structure result
    return this.parseValidationResult(result, checkType);
  }
  
  /**
   * Parse validation result
   */
  parseValidationResult(result, checkType) {
    // Ensure result is properly structured
    const structured = {
      status: 'completed',
      issues: [],
      suggestions: [],
      metrics: {}
    };
    
    if (result.issues && Array.isArray(result.issues)) {
      structured.issues = result.issues.map(issue => ({
        type: checkType,
        severity: issue.severity || 'medium',
        message: issue.message,
        location: issue.location,
        suggestion: issue.suggestion
      }));
    }
    
    if (result.suggestions && Array.isArray(result.suggestions)) {
      structured.suggestions = result.suggestions;
    }
    
    if (result.metrics && typeof result.metrics === 'object') {
      structured.metrics = result.metrics;
    }
    
    // Determine status based on issues
    const hasCritical = structured.issues.some(i => i.severity === 'critical');
    const hasHigh = structured.issues.some(i => i.severity === 'high');
    
    if (hasCritical) {
      structured.status = 'failed';
    } else if (hasHigh) {
      structured.status = 'warning';
    } else if (structured.issues.length > 0) {
      structured.status = 'passed_with_warnings';
    } else {
      structured.status = 'passed';
    }
    
    return structured;
  }
  
  /**
   * Analyze validation results
   */
  analyzeResults(results, profile) {
    const analysis = {
      passed: true,
      issues: [],
      criticalCount: 0,
      highCount: 0,
      mediumCount: 0,
      lowCount: 0,
      suggestions: [],
      metrics: {}
    };
    
    // Aggregate all issues
    for (const result of results) {
      if (result.issues && result.issues.length > 0) {
        analysis.issues.push(...result.issues);
        
        // Count by severity
        for (const issue of result.issues) {
          switch (issue.severity) {
            case 'critical':
              analysis.criticalCount++;
              break;
            case 'high':
              analysis.highCount++;
              break;
            case 'medium':
              analysis.mediumCount++;
              break;
            case 'low':
              analysis.lowCount++;
              break;
          }
        }
      }
      
      if (result.suggestions && result.suggestions.length > 0) {
        analysis.suggestions.push(...result.suggestions);
      }
      
      if (result.metrics) {
        Object.assign(analysis.metrics, result.metrics);
      }
    }
    
    // Determine if validation passed based on severity thresholds
    const thresholds = this.config.severityThresholds;
    
    if (analysis.criticalCount > thresholds.critical) {
      analysis.passed = false;
      analysis.reason = `Critical issues exceed threshold (${analysis.criticalCount} > ${thresholds.critical})`;
    } else if (analysis.highCount > thresholds.high) {
      analysis.passed = false;
      analysis.reason = `High severity issues exceed threshold (${analysis.highCount} > ${thresholds.high})`;
    } else if (analysis.mediumCount > thresholds.medium && this.config.strictMode) {
      analysis.passed = false;
      analysis.reason = `Medium severity issues exceed threshold (${analysis.mediumCount} > ${thresholds.medium})`;
    }
    
    // Sort issues by severity
    analysis.issues.sort((a, b) => {
      const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      return severityOrder[a.severity] - severityOrder[b.severity];
    });
    
    return analysis;
  }
  
  /**
   * Process feedback for issues
   */
  async processFeedback(issues) {
    const feedback = {
      requiresRefinement: false,
      refinementTasks: [],
      priorities: [],
      estimatedEffort: 0
    };
    
    // Group issues by type
    const issueGroups = {};
    for (const issue of issues) {
      if (!issueGroups[issue.type]) {
        issueGroups[issue.type] = [];
      }
      issueGroups[issue.type].push(issue);
    }
    
    // Generate refinement tasks
    for (const [type, groupIssues] of Object.entries(issueGroups)) {
      const critical = groupIssues.filter(i => i.severity === 'critical');
      const high = groupIssues.filter(i => i.severity === 'high');
      
      if (critical.length > 0 || high.length > 0) {
        feedback.requiresRefinement = true;
        
        feedback.refinementTasks.push({
          type: type,
          priority: critical.length > 0 ? 'critical' : 'high',
          issues: groupIssues,
          estimatedEffort: this.estimateEffort(groupIssues)
        });
      }
    }
    
    // Sort tasks by priority
    feedback.refinementTasks.sort((a, b) => {
      const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
    
    // Calculate total effort
    feedback.estimatedEffort = feedback.refinementTasks.reduce(
      (total, task) => total + task.estimatedEffort,
      0
    );
    
    return feedback;
  }
  
  /**
   * Estimate effort for fixing issues
   */
  estimateEffort(issues) {
    const effortMap = {
      critical: 60, // minutes
      high: 30,
      medium: 15,
      low: 5
    };
    
    return issues.reduce((total, issue) => {
      return total + (effortMap[issue.severity] || 10);
    }, 0);
  }
  
  /**
   * Create validation report
   */
  async createValidationReport(validationId) {
    const validation = this.validationHistory.find(v => v.id === validationId);
    if (!validation) {
      throw new Error(`Validation ${validationId} not found`);
    }
    
    const report = {
      id: validationId,
      timestamp: validation.timestamp,
      profile: validation.profile,
      passed: validation.passed,
      duration: validation.duration,
      summary: {
        totalChecks: validation.results?.length || 0,
        passedChecks: validation.results?.filter(r => r.status === 'passed').length || 0,
        failedChecks: validation.results?.filter(r => r.status === 'failed').length || 0,
        totalIssues: validation.issueCount || 0
      },
      issues: validation.analysis?.issues || [],
      suggestions: validation.analysis?.suggestions || [],
      metrics: validation.analysis?.metrics || {},
      feedback: validation.feedback || null
    };
    
    return report;
  }
  
  /**
   * Get validation metrics
   */
  getMetrics() {
    return {
      ...this.validationMetrics,
      activeValidations: this.activeValidations.size,
      historySize: this.validationHistory.length,
      successRate: this.validationMetrics.total > 0
        ? (this.validationMetrics.passed / this.validationMetrics.total) * 100
        : 0
    };
  }
  
  /**
   * Update average duration
   */
  updateAverageDuration(duration) {
    const total = this.validationMetrics.passed + this.validationMetrics.failed;
    this.validationMetrics.averageDuration = 
      (this.validationMetrics.averageDuration * (total - 1) + duration) / total;
  }
  
  /**
   * Clear validation history
   */
  clearHistory() {
    this.validationHistory = [];
    this.logger.info('Validation history cleared');
  }
}

export default ValidationOrchestrator;