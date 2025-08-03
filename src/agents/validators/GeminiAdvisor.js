import { PantheonAgent } from '../PantheonAgent.js';

/**
 * Gemini Advisor - Primary validation specialist
 * CRITICAL: This agent NEVER writes code, only validates and advises
 */
export class GeminiAdvisor extends PantheonAgent {
  constructor(config = {}) {
    super({
      name: 'gemini-advisor',
      description: 'Primary validation specialist using Gemini Pro - NEVER writes code',
      model: config.model || 'gemini-2.5-pro',
      tools: ['Read', 'Grep', 'Glob'], // NO Edit, Write, or Bash tools
      collaboration_mode: 'advisor',
      code_writing: 'FORBIDDEN',
      file_modification: 'FORBIDDEN',
      command_execution: 'FORBIDDEN',
      validation_required: false, // Validators don't need validation
      auto_validation: false,
      specialization: 'validation_and_advisory',
      ...config
    });
    
    // Validation patterns and best practices
    this.validationPatterns = this.loadValidationPatterns();
    this.bestPractices = this.loadBestPractices();
    this.securityPatterns = this.loadSecurityPatterns();
    this.performancePatterns = this.loadPerformancePatterns();
    
    // Enforce read-only at multiple levels
    this.enforceReadOnly();
  }
  
  /**
   * CRITICAL: Enforce read-only operations
   */
  enforceReadOnly() {
    // Override any attempt to get write tools
    this.tools.getAvailableTools = () => ['Read', 'Grep', 'Glob'];
    
    // Log warning if configuration attempts to enable writing
    if (this.codeWriting !== 'FORBIDDEN' || 
        this.fileModification !== 'FORBIDDEN' || 
        this.commandExecution !== 'FORBIDDEN') {
      this.logger.error('SECURITY: Attempt to enable write permissions for Gemini Advisor blocked');
      
      // Force correct permissions
      this.codeWriting = 'FORBIDDEN';
      this.fileModification = 'FORBIDDEN';
      this.commandExecution = 'FORBIDDEN';
    }
  }
  
  /**
   * Load validation patterns
   */
  loadValidationPatterns() {
    return {
      architecture: {
        checks: [
          'separation_of_concerns',
          'single_responsibility',
          'dependency_direction',
          'coupling_cohesion',
          'scalability_considerations',
          'security_boundaries',
          'error_handling_strategy',
          'monitoring_observability'
        ],
        severity_weights: {
          'separation_of_concerns': 8,
          'security_boundaries': 10,
          'error_handling_strategy': 7,
          'scalability_considerations': 6
        }
      },
      code_quality: {
        checks: [
          'naming_conventions',
          'code_duplication',
          'complexity_metrics',
          'test_coverage',
          'documentation_completeness',
          'error_handling',
          'input_validation',
          'resource_management'
        ],
        severity_weights: {
          'input_validation': 9,
          'error_handling': 8,
          'resource_management': 7,
          'test_coverage': 6
        }
      },
      security: {
        checks: [
          'authentication_implementation',
          'authorization_checks',
          'input_sanitization',
          'sql_injection_prevention',
          'xss_prevention',
          'csrf_protection',
          'secure_communication',
          'secrets_management',
          'dependency_vulnerabilities'
        ],
        severity_weights: {
          'sql_injection_prevention': 10,
          'xss_prevention': 10,
          'authentication_implementation': 9,
          'secrets_management': 10
        }
      }
    };
  }
  
  /**
   * Load best practices
   */
  loadBestPractices() {
    return {
      architecture: [
        'Use clear separation between layers',
        'Implement proper error boundaries',
        'Design for testability',
        'Consider scalability from the start',
        'Implement proper logging and monitoring',
        'Use dependency injection',
        'Follow SOLID principles'
      ],
      implementation: [
        'Write self-documenting code',
        'Handle errors gracefully',
        'Validate all inputs',
        'Use consistent naming conventions',
        'Implement proper logging',
        'Write comprehensive tests',
        'Avoid premature optimization'
      ],
      security: [
        'Never trust user input',
        'Use parameterized queries',
        'Implement proper authentication',
        'Use HTTPS for all communications',
        'Store secrets securely',
        'Keep dependencies updated',
        'Implement rate limiting'
      ]
    };
  }
  
  /**
   * Load security patterns
   */
  loadSecurityPatterns() {
    return {
      vulnerabilities: {
        sql_injection: {
          patterns: ['SELECT.*FROM.*WHERE.*\\+', 'INSERT.*VALUES.*\\+', '\\.query\\([^?]*\\+'],
          severity: 10,
          recommendation: 'Use parameterized queries or prepared statements'
        },
        xss: {
          patterns: ['innerHTML\\s*=', 'document\\.write', 'eval\\(', '\\.html\\([^\\)]*\\+'],
          severity: 10,
          recommendation: 'Sanitize all user input and use proper encoding'
        },
        path_traversal: {
          patterns: ['\\.\\.\/', '\\.\\.\\\\', 'path\\.join\\([^,]*\\+'],
          severity: 8,
          recommendation: 'Validate and sanitize file paths'
        },
        hardcoded_secrets: {
          patterns: ['api[_-]?key\\s*=\\s*["\']', 'password\\s*=\\s*["\']', 'secret\\s*=\\s*["\']'],
          severity: 9,
          recommendation: 'Use environment variables or secure vaults for secrets'
        }
      }
    };
  }
  
  /**
   * Load performance patterns
   */
  loadPerformancePatterns() {
    return {
      antipatterns: {
        n_plus_one: {
          description: 'Multiple database queries in a loop',
          severity: 7,
          recommendation: 'Use eager loading or batch queries'
        },
        synchronous_io_in_loop: {
          description: 'Synchronous I/O operations in loops',
          severity: 6,
          recommendation: 'Use async/await with Promise.all for parallel execution'
        },
        large_memory_allocation: {
          description: 'Large arrays or objects in memory',
          severity: 5,
          recommendation: 'Use streaming or pagination for large datasets'
        },
        missing_indexes: {
          description: 'Database queries without proper indexes',
          severity: 7,
          recommendation: 'Add appropriate database indexes'
        }
      }
    };
  }
  
  /**
   * Main task execution - VALIDATION ONLY
   */
  async performTask(task) {
    this.logger.info('Advisor performing validation', { taskType: task.type });
    
    // CRITICAL: Never write code, only validate
    if (task.type.includes('create') || task.type.includes('implement') || task.type.includes('write')) {
      throw new Error('FORBIDDEN: Gemini Advisor cannot write or create code. Redirect to Claude agents.');
    }
    
    switch (task.type) {
      case 'validate_architecture':
        return await this.validateArchitecture(task);
      case 'validate_implementation':
        return await this.validateImplementation(task);
      case 'validate_security':
        return await this.validateSecurity(task);
      case 'validate_performance':
        return await this.validatePerformance(task);
      case 'review_code':
        return await this.reviewCode(task);
      case 'suggest_improvements':
        return await this.suggestImprovements(task);
      case 'analyze_risks':
        return await this.analyzeRisks(task);
      default:
        return await this.genericValidation(task);
    }
  }
  
  /**
   * Validate architecture design
   */
  async validateArchitecture(task) {
    const { architecture } = task.data;
    
    this.logger.info('Validating architecture', { pattern: architecture.pattern });
    
    const validation = {
      passed: true,
      issues: [],
      suggestions: [],
      alternatives: [],
      strengths: [],
      risks: []
    };
    
    // Check architecture patterns
    for (const check of this.validationPatterns.architecture.checks) {
      const result = await this.performArchitectureCheck(check, architecture);
      
      if (!result.passed) {
        validation.passed = false;
        validation.issues.push({
          check: check,
          severity: this.validationPatterns.architecture.severity_weights[check] || 5,
          issue: result.issue,
          location: result.location
        });
      }
      
      if (result.suggestion) {
        validation.suggestions.push(result.suggestion);
      }
    }
    
    // Identify strengths
    validation.strengths = this.identifyArchitectureStrengths(architecture);
    
    // Suggest alternatives
    validation.alternatives = this.suggestArchitectureAlternatives(architecture);
    
    // Risk assessment
    validation.risks = this.assessArchitectureRisks(architecture);
    
    // Calculate overall score
    validation.score = this.calculateValidationScore(validation);
    
    // Determine if refinement is needed
    validation.requiresRefinement = validation.score < 70 || 
      validation.issues.some(i => i.severity >= 8);
    
    // Format feedback
    validation.feedback = this.formatValidationFeedback(validation);
    
    return {
      success: true,
      validationType: 'architecture',
      validation: validation,
      recommendations: this.prioritizeRecommendations(validation),
      nextSteps: this.suggestNextSteps(validation)
    };
  }
  
  /**
   * Validate implementation code
   */
  async validateImplementation(task) {
    const { implementation, files } = task.data;
    
    this.logger.info('Validating implementation', { component: implementation.component });
    
    const validation = {
      passed: true,
      codeQualityIssues: [],
      securityIssues: [],
      performanceIssues: [],
      suggestions: [],
      bestPracticeViolations: []
    };
    
    // Read and analyze each file (READ ONLY)
    for (const file of files || []) {
      // Use Read tool to examine file
      const content = await this.readFile(file.path);
      
      // Code quality checks
      const qualityIssues = await this.checkCodeQuality(content, file);
      validation.codeQualityIssues.push(...qualityIssues);
      
      // Security checks
      const securityIssues = await this.checkSecurity(content, file);
      validation.securityIssues.push(...securityIssues);
      
      // Performance checks
      const performanceIssues = await this.checkPerformance(content, file);
      validation.performanceIssues.push(...performanceIssues);
      
      // Best practices
      const practiceViolations = await this.checkBestPractices(content, file);
      validation.bestPracticeViolations.push(...practiceViolations);
    }
    
    // Determine overall pass/fail
    validation.passed = validation.securityIssues.filter(i => i.severity >= 8).length === 0;
    
    // Generate suggestions (NOT code, just advice)
    validation.suggestions = this.generateImplementationSuggestions(validation);
    
    // Calculate metrics
    validation.metrics = {
      totalIssues: validation.codeQualityIssues.length + 
                   validation.securityIssues.length + 
                   validation.performanceIssues.length,
      criticalIssues: [...validation.securityIssues, ...validation.codeQualityIssues]
                      .filter(i => i.severity >= 8).length,
      codeQualityScore: this.calculateCodeQualityScore(validation),
      securityScore: this.calculateSecurityScore(validation)
    };
    
    return {
      success: true,
      validationType: 'implementation',
      validation: validation,
      requiresRefinement: !validation.passed || validation.metrics.criticalIssues > 0,
      feedback: this.formatImplementationFeedback(validation)
    };
  }
  
  /**
   * Check code quality (READ ONLY)
   */
  async checkCodeQuality(content, file) {
    const issues = [];
    
    // Check for code duplication
    const duplication = this.detectCodeDuplication(content);
    if (duplication.found) {
      issues.push({
        type: 'duplication',
        severity: 4,
        file: file.path,
        line: duplication.line,
        issue: 'Code duplication detected',
        suggestion: 'Extract common code into reusable functions'
      });
    }
    
    // Check complexity
    const complexity = this.calculateComplexity(content);
    if (complexity > 10) {
      issues.push({
        type: 'complexity',
        severity: 5,
        file: file.path,
        issue: `High cyclomatic complexity: ${complexity}`,
        suggestion: 'Break down complex functions into smaller, focused functions'
      });
    }
    
    // Check naming conventions
    const namingIssues = this.checkNamingConventions(content);
    issues.push(...namingIssues);
    
    return issues;
  }
  
  /**
   * Check security issues (READ ONLY)
   */
  async checkSecurity(content, file) {
    const issues = [];
    
    // Check for security vulnerabilities
    for (const [vulnType, vuln] of Object.entries(this.securityPatterns.vulnerabilities)) {
      for (const pattern of vuln.patterns) {
        const regex = new RegExp(pattern, 'gi');
        const matches = content.match(regex);
        
        if (matches) {
          issues.push({
            type: vulnType,
            severity: vuln.severity,
            file: file.path,
            issue: `Potential ${vulnType.replace('_', ' ')} vulnerability`,
            matches: matches.length,
            recommendation: vuln.recommendation
          });
        }
      }
    }
    
    return issues;
  }
  
  /**
   * Check performance issues (READ ONLY)
   */
  async checkPerformance(content, file) {
    const issues = [];
    
    // Check for performance antipatterns
    if (content.includes('forEach') && content.includes('await')) {
      issues.push({
        type: 'async_in_loop',
        severity: 6,
        file: file.path,
        issue: 'Potential async operation in forEach loop',
        suggestion: 'Use for...of loop or Promise.all for async operations'
      });
    }
    
    if (content.match(/SELECT.*FROM.*for/i)) {
      issues.push({
        type: 'n_plus_one',
        severity: 7,
        file: file.path,
        issue: 'Potential N+1 query problem',
        suggestion: 'Use eager loading or batch queries'
      });
    }
    
    return issues;
  }
  
  /**
   * Helper: Read file (simulated - would use Read tool)
   */
  async readFile(path) {
    // In real implementation, would use this.tools.read(path)
    this.logger.info('Reading file for validation', { path });
    return '// File content would be read here';
  }
  
  /**
   * Format validation feedback
   */
  formatValidationFeedback(validation) {
    const feedback = {
      summary: validation.passed ? 'Validation passed with suggestions' : 'Validation failed - refinement required',
      strengths: validation.strengths,
      criticalIssues: validation.issues.filter(i => i.severity >= 8),
      suggestions: validation.suggestions,
      alternatives: validation.alternatives,
      risks: validation.risks
    };
    
    return feedback;
  }
  
  /**
   * CRITICAL: Override any method that might write code
   */
  async writeCode() {
    throw new Error('FORBIDDEN: Gemini Advisor cannot write code. This is a validation-only agent.');
  }
  
  async createFile() {
    throw new Error('FORBIDDEN: Gemini Advisor cannot create files. This is a read-only agent.');
  }
  
  async editFile() {
    throw new Error('FORBIDDEN: Gemini Advisor cannot edit files. This is a read-only agent.');
  }
  
  async executeCommand() {
    throw new Error('FORBIDDEN: Gemini Advisor cannot execute commands. This is a read-only agent.');
  }
}