import { PantheonAgent } from '../PantheonAgent.js';

/**
 * Claude Architect - Primary system architect and designer
 * Creates architectures and designs that are then validated by Gemini
 */
export class ClaudeArchitect extends PantheonAgent {
  constructor(config = {}) {
    super({
      name: 'claude-architect',
      description: 'Primary system architect using Claude Sonnet for design and planning',
      model: config.model || 'claude-sonnet',
      tools: ['Edit', 'Read', 'Bash', 'Grep', 'Glob', 'Write'],
      collaboration_mode: 'creator',
      code_writing: 'ALLOWED',
      file_modification: 'ALLOWED',
      command_execution: 'ALLOWED',
      validation_required: true,
      auto_validation: true,
      specialization: 'system_architecture',
      ...config
    });
    
    this.architecturePatterns = this.loadArchitecturePatterns();
    this.designPrinciples = this.loadDesignPrinciples();
  }
  
  /**
   * Load architecture patterns
   */
  loadArchitecturePatterns() {
    return {
      microservices: {
        description: 'Distributed microservices architecture',
        components: ['API Gateway', 'Service Registry', 'Config Server', 'Services'],
        useCases: ['scalability', 'team_independence', 'technology_diversity']
      },
      layered: {
        description: 'Traditional layered architecture',
        components: ['Presentation', 'Business', 'Data Access', 'Database'],
        useCases: ['enterprise', 'clear_separation', 'traditional_apps']
      },
      eventDriven: {
        description: 'Event-driven architecture with message queues',
        components: ['Event Bus', 'Producers', 'Consumers', 'Event Store'],
        useCases: ['real_time', 'decoupling', 'async_processing']
      },
      hexagonal: {
        description: 'Hexagonal/Ports and Adapters architecture',
        components: ['Domain', 'Ports', 'Adapters', 'Infrastructure'],
        useCases: ['testability', 'flexibility', 'domain_focus']
      }
    };
  }
  
  /**
   * Load design principles
   */
  loadDesignPrinciples() {
    return {
      solid: ['Single Responsibility', 'Open/Closed', 'Liskov Substitution', 'Interface Segregation', 'Dependency Inversion'],
      dry: 'Don\'t Repeat Yourself',
      kiss: 'Keep It Simple, Stupid',
      yagni: 'You Aren\'t Gonna Need It',
      separation_of_concerns: 'Separate different concerns into distinct sections'
    };
  }
  
  /**
   * Main task execution
   */
  async performTask(task) {
    this.logger.info('Architect performing task', { taskType: task.type });
    
    switch (task.type) {
      case 'design_system':
        return await this.designSystem(task);
      case 'design_component':
        return await this.designComponent(task);
      case 'review_architecture':
        return await this.reviewArchitecture(task);
      case 'plan_migration':
        return await this.planMigration(task);
      case 'design_api':
        return await this.designAPI(task);
      default:
        return await this.genericDesign(task);
    }
  }
  
  /**
   * Design complete system architecture
   */
  async designSystem(task) {
    const { requirements, constraints, preferences } = task.data;
    
    this.logger.info('Designing system architecture', { requirements });
    
    // Analyze requirements
    const analysis = await this.analyzeRequirements(requirements);
    
    // Select appropriate pattern
    const pattern = this.selectArchitecturePattern(analysis);
    
    // Design components
    const components = await this.designComponents(pattern, requirements);
    
    // Design data flow
    const dataFlow = await this.designDataFlow(components);
    
    // Design interfaces
    const interfaces = await this.designInterfaces(components);
    
    // Create architecture document
    const architecture = {
      pattern: pattern.name,
      overview: this.generateOverview(pattern, requirements),
      components: components,
      dataFlow: dataFlow,
      interfaces: interfaces,
      technologies: this.selectTechnologies(components, constraints),
      scalability: this.planScalability(components),
      security: this.planSecurity(components),
      deployment: this.planDeployment(components, constraints),
      monitoring: this.planMonitoring(components),
      decisions: this.documentDecisions(analysis, pattern, components),
      tradeoffs: this.documentTradeoffs(pattern, components),
      validationRequired: true,
      createdBy: this.name,
      createdAt: new Date()
    };
    
    // Write architecture document
    await this.writeArchitectureDocument(architecture);
    
    // Trigger validation
    if (this.autoValidation) {
      this.emit('validationRequired', {
        type: 'architecture',
        data: architecture,
        validator: 'gemini-advisor'
      });
    }
    
    return {
      success: true,
      architecture: architecture,
      pattern: pattern.name,
      componentsCount: components.length,
      validationPending: this.autoValidation
    };
  }
  
  /**
   * Analyze requirements to determine architecture needs
   */
  async analyzeRequirements(requirements) {
    return {
      scalabilityNeeds: this.assessScalabilityNeeds(requirements),
      performanceNeeds: this.assessPerformanceNeeds(requirements),
      securityNeeds: this.assessSecurityNeeds(requirements),
      integrationNeeds: this.assessIntegrationNeeds(requirements),
      teamStructure: this.assessTeamStructure(requirements),
      complexity: this.assessComplexity(requirements)
    };
  }
  
  /**
   * Select appropriate architecture pattern
   */
  selectArchitecturePattern(analysis) {
    // Score each pattern based on analysis
    const scores = {};
    
    for (const [name, pattern] of Object.entries(this.architecturePatterns)) {
      let score = 0;
      
      // Check if use cases match
      for (const useCase of pattern.useCases) {
        if (this.matchesNeed(useCase, analysis)) {
          score += 10;
        }
      }
      
      // Penalize for complexity mismatch
      if (name === 'microservices' && analysis.complexity < 5) {
        score -= 5;
      }
      
      scores[name] = score;
    }
    
    // Select highest scoring pattern
    const selectedPattern = Object.entries(scores)
      .sort(([,a], [,b]) => b - a)[0][0];
    
    return {
      name: selectedPattern,
      ...this.architecturePatterns[selectedPattern],
      score: scores[selectedPattern]
    };
  }
  
  /**
   * Design individual components
   */
  async designComponents(pattern, requirements) {
    const components = [];
    
    for (const componentType of pattern.components) {
      const component = {
        name: this.generateComponentName(componentType, requirements),
        type: componentType,
        responsibilities: this.defineResponsibilities(componentType, requirements),
        interfaces: this.defineComponentInterfaces(componentType),
        dependencies: this.defineDependencies(componentType, pattern),
        technology: this.selectComponentTechnology(componentType),
        scalability: this.defineScalabilityStrategy(componentType),
        configuration: this.defineConfiguration(componentType)
      };
      
      components.push(component);
    }
    
    return components;
  }
  
  /**
   * Design data flow between components
   */
  async designDataFlow(components) {
    const flows = [];
    
    for (const source of components) {
      for (const target of components) {
        if (source !== target && this.shouldConnect(source, target)) {
          flows.push({
            source: source.name,
            target: target.name,
            protocol: this.selectProtocol(source, target),
            dataFormat: this.selectDataFormat(source, target),
            pattern: this.selectCommunicationPattern(source, target),
            security: this.defineCommunicationSecurity(source, target)
          });
        }
      }
    }
    
    return flows;
  }
  
  /**
   * Write architecture document to file
   */
  async writeArchitectureDocument(architecture) {
    const content = this.formatArchitectureDocument(architecture);
    const filename = `architecture-${Date.now()}.md`;
    const filepath = `.claude/architectures/${filename}`;
    
    // This would use the Write tool in real implementation
    this.logger.info('Writing architecture document', { filepath });
    
    return filepath;
  }
  
  /**
   * Format architecture document as markdown
   */
  formatArchitectureDocument(architecture) {
    return `# System Architecture

## Overview
${architecture.overview}

## Architecture Pattern
**Pattern**: ${architecture.pattern}

## Components
${architecture.components.map(c => `
### ${c.name}
- **Type**: ${c.type}
- **Responsibilities**: ${c.responsibilities.join(', ')}
- **Technology**: ${c.technology}
- **Scalability**: ${c.scalability}
`).join('\n')}

## Data Flow
${architecture.dataFlow.map(f => `
- ${f.source} → ${f.target} (${f.protocol}, ${f.pattern})
`).join('\n')}

## Technologies
${Object.entries(architecture.technologies).map(([k, v]) => `- **${k}**: ${v}`).join('\n')}

## Security
${JSON.stringify(architecture.security, null, 2)}

## Deployment
${JSON.stringify(architecture.deployment, null, 2)}

## Architecture Decisions
${architecture.decisions.map(d => `- ${d}`).join('\n')}

## Trade-offs
${architecture.tradeoffs.map(t => `- ${t}`).join('\n')}

---
*Generated by ${architecture.createdBy} at ${architecture.createdAt}*
*Validation required by Gemini Advisor*
`;
  }
  
  /**
   * Helper methods
   */
  assessScalabilityNeeds(requirements) {
    // Analyze requirements for scalability indicators
    const indicators = ['users', 'traffic', 'growth', 'scale', 'load'];
    let score = 0;
    
    for (const indicator of indicators) {
      if (JSON.stringify(requirements).toLowerCase().includes(indicator)) {
        score += 2;
      }
    }
    
    return score;
  }
  
  assessPerformanceNeeds(requirements) {
    const indicators = ['performance', 'speed', 'latency', 'response time', 'throughput'];
    let score = 0;
    
    for (const indicator of indicators) {
      if (JSON.stringify(requirements).toLowerCase().includes(indicator)) {
        score += 2;
      }
    }
    
    return score;
  }
  
  assessSecurityNeeds(requirements) {
    const indicators = ['security', 'authentication', 'authorization', 'encryption', 'compliance'];
    let score = 0;
    
    for (const indicator of indicators) {
      if (JSON.stringify(requirements).toLowerCase().includes(indicator)) {
        score += 2;
      }
    }
    
    return score;
  }
  
  assessIntegrationNeeds(requirements) {
    const indicators = ['integration', 'api', 'third-party', 'external', 'webhook'];
    let score = 0;
    
    for (const indicator of indicators) {
      if (JSON.stringify(requirements).toLowerCase().includes(indicator)) {
        score += 2;
      }
    }
    
    return score;
  }
  
  assessTeamStructure(requirements) {
    // Default team structure assessment
    return {
      size: 'medium',
      distribution: 'co-located',
      expertise: 'mixed'
    };
  }
  
  assessComplexity(requirements) {
    // Simple complexity assessment
    const reqString = JSON.stringify(requirements);
    return Math.min(10, Math.floor(reqString.length / 100));
  }
  
  matchesNeed(useCase, analysis) {
    // Simple matching logic
    const needsMap = {
      'scalability': analysis.scalabilityNeeds > 5,
      'team_independence': analysis.teamStructure.size === 'large',
      'technology_diversity': analysis.integrationNeeds > 5,
      'real_time': analysis.performanceNeeds > 7,
      'testability': true, // Always good
      'domain_focus': analysis.complexity > 6
    };
    
    return needsMap[useCase] || false;
  }
  
  // Additional helper methods would be implemented here...
  generateComponentName(type, requirements) {
    return `${type.toLowerCase().replace(' ', '-')}-service`;
  }
  
  defineResponsibilities(componentType, requirements) {
    const responsibilityMap = {
      'API Gateway': ['Route requests', 'Authentication', 'Rate limiting', 'Load balancing'],
      'Service Registry': ['Service discovery', 'Health checking', 'Configuration management'],
      'Services': ['Business logic', 'Data processing', 'Integration'],
      'Event Bus': ['Message routing', 'Event storage', 'Subscription management']
    };
    
    return responsibilityMap[componentType] || ['Process requests', 'Return responses'];
  }
  
  selectTechnologies(components, constraints) {
    return {
      language: 'JavaScript/Node.js',
      framework: 'Express.js',
      database: 'PostgreSQL',
      cache: 'Redis',
      messageQueue: 'RabbitMQ',
      monitoring: 'Prometheus + Grafana'
    };
  }
  
  /**
   * Refine architecture based on validation feedback
   */
  async refine(result, feedback) {
    this.logger.info('Refining architecture based on feedback');
    
    // Apply feedback to architecture
    const refinedArchitecture = {
      ...result.architecture,
      refined: true,
      refinements: feedback.suggestions || [],
      alternativeConsiderations: feedback.alternatives || [],
      riskMitigations: feedback.risks || [],
      refinedAt: new Date()
    };
    
    // Rewrite architecture document
    await this.writeArchitectureDocument(refinedArchitecture);
    
    return {
      ...result,
      architecture: refinedArchitecture,
      refined: true
    };
  }
}