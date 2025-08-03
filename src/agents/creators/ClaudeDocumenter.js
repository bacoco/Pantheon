import PantheonAgent from '../PantheonAgent.js';

/**
 * Claude Documenter - Specialized in creating comprehensive documentation
 * A creator agent that generates high-quality technical documentation
 */
export class ClaudeDocumenter extends PantheonAgent {
  constructor(config = {}) {
    super({
      name: 'claude-documenter',
      model: 'claude-haiku',
      role: 'creator',
      specialty: 'documentation',
      tools: ['Read', 'Write', 'Edit', 'Grep', 'Glob'],
      ...config
    });
    
    // Documentation-specific configuration
    this.documentationConfig = {
      formats: ['markdown', 'jsdoc', 'html', 'api-reference'],
      autoGenerate: config.autoGenerate !== false,
      includeExamples: config.includeExamples !== false,
      includeTests: config.includeTests !== false,
      diagramGeneration: config.diagramGeneration !== false
    };
    
    // Templates for different documentation types
    this.templates = {
      readme: this.getReadmeTemplate(),
      api: this.getApiTemplate(),
      guide: this.getGuideTemplate(),
      architecture: this.getArchitectureTemplate()
    };
  }
  
  /**
   * Execute documentation task
   */
  async performTask(task) {
    const docType = task.data?.documentationType || 'general';
    
    switch (docType) {
      case 'readme':
        return await this.generateReadme(task.data);
      case 'api':
        return await this.generateApiDocs(task.data);
      case 'guide':
        return await this.generateUserGuide(task.data);
      case 'architecture':
        return await this.generateArchitectureDocs(task.data);
      case 'inline':
        return await this.generateInlineComments(task.data);
      default:
        return await this.generateGeneralDocs(task.data);
    }
  }
  
  /**
   * Generate README documentation
   */
  async generateReadme(data) {
    const template = this.templates.readme;
    
    const readme = {
      title: data.projectName || 'Project',
      description: data.description || '',
      sections: [
        { name: 'Installation', content: this.generateInstallation(data) },
        { name: 'Usage', content: this.generateUsage(data) },
        { name: 'API Reference', content: this.generateApiSummary(data) },
        { name: 'Configuration', content: this.generateConfiguration(data) },
        { name: 'Examples', content: this.generateExamples(data) },
        { name: 'Contributing', content: this.generateContributing(data) },
        { name: 'License', content: this.generateLicense(data) }
      ]
    };
    
    if (this.documentationConfig.includeTests) {
      readme.sections.push({
        name: 'Testing',
        content: this.generateTestingDocs(data)
      });
    }
    
    return {
      success: true,
      documentType: 'readme',
      content: this.formatReadme(readme),
      metadata: {
        sections: readme.sections.length,
        format: 'markdown'
      }
    };
  }
  
  /**
   * Generate API documentation
   */
  async generateApiDocs(data) {
    const apis = data.apis || [];
    const documentation = {
      title: `${data.projectName} API Reference`,
      version: data.version || '1.0.0',
      baseUrl: data.baseUrl || 'http://localhost:3000',
      endpoints: []
    };
    
    for (const api of apis) {
      documentation.endpoints.push({
        method: api.method,
        path: api.path,
        description: api.description,
        parameters: this.documentParameters(api.parameters),
        requestBody: this.documentRequestBody(api.requestBody),
        responses: this.documentResponses(api.responses),
        examples: this.generateApiExamples(api)
      });
    }
    
    return {
      success: true,
      documentType: 'api',
      content: this.formatApiDocs(documentation),
      metadata: {
        endpoints: documentation.endpoints.length,
        format: 'openapi'
      }
    };
  }
  
  /**
   * Generate user guide
   */
  async generateUserGuide(data) {
    const guide = {
      title: `${data.projectName} User Guide`,
      introduction: data.introduction || 'Welcome to the user guide.',
      chapters: []
    };
    
    // Generate chapters based on features
    if (data.features) {
      for (const feature of data.features) {
        guide.chapters.push({
          title: feature.name,
          content: this.generateFeatureGuide(feature),
          screenshots: feature.screenshots || [],
          tips: this.generateTips(feature)
        });
      }
    }
    
    return {
      success: true,
      documentType: 'guide',
      content: this.formatUserGuide(guide),
      metadata: {
        chapters: guide.chapters.length,
        format: 'markdown'
      }
    };
  }
  
  /**
   * Generate architecture documentation
   */
  async generateArchitectureDocs(data) {
    const architecture = {
      title: `${data.projectName} Architecture`,
      overview: data.overview || '',
      components: [],
      patterns: [],
      decisions: []
    };
    
    // Document components
    if (data.components) {
      for (const component of data.components) {
        architecture.components.push({
          name: component.name,
          responsibility: component.responsibility,
          dependencies: component.dependencies || [],
          interfaces: component.interfaces || [],
          implementation: component.implementation || ''
        });
      }
    }
    
    // Document patterns
    if (data.patterns) {
      architecture.patterns = data.patterns.map(pattern => ({
        name: pattern.name,
        description: pattern.description,
        usage: pattern.usage,
        benefits: pattern.benefits
      }));
    }
    
    // Document architectural decisions
    if (data.decisions) {
      architecture.decisions = data.decisions.map((decision, index) => ({
        id: `ADR-${String(index + 1).padStart(4, '0')}`,
        title: decision.title,
        status: decision.status || 'accepted',
        context: decision.context,
        decision: decision.decision,
        consequences: decision.consequences
      }));
    }
    
    if (this.documentationConfig.diagramGeneration) {
      architecture.diagrams = this.generateDiagrams(data);
    }
    
    return {
      success: true,
      documentType: 'architecture',
      content: this.formatArchitectureDocs(architecture),
      metadata: {
        components: architecture.components.length,
        patterns: architecture.patterns.length,
        decisions: architecture.decisions.length,
        format: 'markdown'
      }
    };
  }
  
  /**
   * Generate inline code comments
   */
  async generateInlineComments(data) {
    const code = data.code || '';
    const language = data.language || 'javascript';
    
    // Parse code and identify structures to document
    const structures = this.parseCodeStructures(code, language);
    
    // Generate appropriate comments
    const documentedCode = this.addInlineComments(code, structures, language);
    
    return {
      success: true,
      documentType: 'inline',
      content: documentedCode,
      metadata: {
        language,
        commentsAdded: structures.length
      }
    };
  }
  
  /**
   * Generate general documentation
   */
  async generateGeneralDocs(data) {
    const doc = {
      title: data.title || 'Documentation',
      sections: []
    };
    
    // Analyze content and generate appropriate documentation
    if (data.content) {
      doc.sections = this.analyzeAndDocument(data.content);
    }
    
    return {
      success: true,
      documentType: 'general',
      content: this.formatGeneralDocs(doc),
      metadata: {
        sections: doc.sections.length,
        format: 'markdown'
      }
    };
  }
  
  /**
   * Helper methods for documentation generation
   */
  
  generateInstallation(data) {
    const steps = [];
    
    if (data.packageManager === 'npm') {
      steps.push('```bash\nnpm install\n```');
    } else if (data.packageManager === 'yarn') {
      steps.push('```bash\nyarn install\n```');
    }
    
    if (data.dependencies) {
      steps.push(`### Dependencies\n\n${data.dependencies.join('\n- ')}`);
    }
    
    return steps.join('\n\n');
  }
  
  generateUsage(data) {
    const examples = [];
    
    if (data.quickStart) {
      examples.push(`### Quick Start\n\n${data.quickStart}`);
    }
    
    if (data.usageExamples) {
      data.usageExamples.forEach(example => {
        examples.push(`### ${example.title}\n\n\`\`\`${example.language || 'javascript'}\n${example.code}\n\`\`\``);
      });
    }
    
    return examples.join('\n\n');
  }
  
  generateApiSummary(data) {
    if (!data.apis || data.apis.length === 0) {
      return 'API documentation coming soon.';
    }
    
    const summary = ['### Available Endpoints\n'];
    
    data.apis.forEach(api => {
      summary.push(`- \`${api.method} ${api.path}\` - ${api.description}`);
    });
    
    return summary.join('\n');
  }
  
  generateConfiguration(data) {
    if (!data.configuration) {
      return 'No configuration required.';
    }
    
    const config = ['### Configuration Options\n'];
    
    Object.entries(data.configuration).forEach(([key, value]) => {
      config.push(`- \`${key}\`: ${value.description} (default: \`${value.default}\`)`);
    });
    
    return config.join('\n');
  }
  
  generateExamples(data) {
    if (!this.documentationConfig.includeExamples || !data.examples) {
      return 'See usage section for examples.';
    }
    
    return data.examples.map(ex => 
      `### ${ex.title}\n\n${ex.description}\n\n\`\`\`${ex.language || 'javascript'}\n${ex.code}\n\`\`\``
    ).join('\n\n');
  }
  
  generateContributing(data) {
    return data.contributing || `
### Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create your feature branch (\`git checkout -b feature/amazing-feature\`)
3. Commit your changes (\`git commit -m 'Add amazing feature'\`)
4. Push to the branch (\`git push origin feature/amazing-feature\`)
5. Open a Pull Request
`;
  }
  
  generateLicense(data) {
    return `This project is licensed under the ${data.license || 'MIT'} License.`;
  }
  
  generateTestingDocs(data) {
    const testing = ['### Running Tests\n'];
    
    testing.push('```bash\nnpm test\n```');
    
    if (data.testCoverage) {
      testing.push('\n### Test Coverage\n\n```bash\nnpm run test:coverage\n```');
    }
    
    return testing.join('\n');
  }
  
  /**
   * Format documentation output
   */
  
  formatReadme(readme) {
    const output = [`# ${readme.title}\n\n${readme.description}\n`];
    
    readme.sections.forEach(section => {
      output.push(`## ${section.name}\n\n${section.content}`);
    });
    
    return output.join('\n\n');
  }
  
  formatApiDocs(documentation) {
    const output = [`# ${documentation.title}\n\nVersion: ${documentation.version}\nBase URL: ${documentation.baseUrl}\n`];
    
    documentation.endpoints.forEach(endpoint => {
      output.push(`## ${endpoint.method} ${endpoint.path}\n\n${endpoint.description}`);
      
      if (endpoint.parameters.length > 0) {
        output.push('\n### Parameters\n');
        endpoint.parameters.forEach(param => {
          output.push(`- \`${param.name}\` (${param.type}) - ${param.description}`);
        });
      }
      
      if (endpoint.examples.length > 0) {
        output.push('\n### Example\n\n```json\n' + JSON.stringify(endpoint.examples[0], null, 2) + '\n```');
      }
    });
    
    return output.join('\n\n');
  }
  
  formatUserGuide(guide) {
    const output = [`# ${guide.title}\n\n${guide.introduction}\n`];
    
    guide.chapters.forEach((chapter, index) => {
      output.push(`## Chapter ${index + 1}: ${chapter.title}\n\n${chapter.content}`);
      
      if (chapter.tips && chapter.tips.length > 0) {
        output.push('\n### Tips\n');
        chapter.tips.forEach(tip => {
          output.push(`- ${tip}`);
        });
      }
    });
    
    return output.join('\n\n');
  }
  
  formatArchitectureDocs(architecture) {
    const output = [`# ${architecture.title}\n\n${architecture.overview}\n`];
    
    if (architecture.components.length > 0) {
      output.push('## Components\n');
      architecture.components.forEach(comp => {
        output.push(`### ${comp.name}\n\n${comp.responsibility}`);
        if (comp.dependencies.length > 0) {
          output.push(`\n**Dependencies:** ${comp.dependencies.join(', ')}`);
        }
      });
    }
    
    if (architecture.patterns.length > 0) {
      output.push('\n## Design Patterns\n');
      architecture.patterns.forEach(pattern => {
        output.push(`### ${pattern.name}\n\n${pattern.description}`);
      });
    }
    
    if (architecture.decisions.length > 0) {
      output.push('\n## Architectural Decision Records\n');
      architecture.decisions.forEach(adr => {
        output.push(`### ${adr.id}: ${adr.title}\n\n**Status:** ${adr.status}\n\n**Context:** ${adr.context}\n\n**Decision:** ${adr.decision}`);
      });
    }
    
    return output.join('\n\n');
  }
  
  formatGeneralDocs(doc) {
    const output = [`# ${doc.title}\n`];
    
    doc.sections.forEach(section => {
      output.push(`## ${section.title}\n\n${section.content}`);
    });
    
    return output.join('\n\n');
  }
  
  /**
   * Template getters
   */
  
  getReadmeTemplate() {
    return {
      structure: ['title', 'badges', 'description', 'toc', 'installation', 'usage', 'api', 'contributing', 'license'],
      required: ['title', 'description', 'installation', 'usage'],
      optional: ['badges', 'toc', 'api', 'contributing', 'license']
    };
  }
  
  getApiTemplate() {
    return {
      structure: ['title', 'version', 'baseUrl', 'authentication', 'endpoints', 'errors', 'examples'],
      required: ['title', 'endpoints'],
      optional: ['version', 'baseUrl', 'authentication', 'errors', 'examples']
    };
  }
  
  getGuideTemplate() {
    return {
      structure: ['title', 'introduction', 'prerequisites', 'chapters', 'troubleshooting', 'faq'],
      required: ['title', 'introduction', 'chapters'],
      optional: ['prerequisites', 'troubleshooting', 'faq']
    };
  }
  
  getArchitectureTemplate() {
    return {
      structure: ['title', 'overview', 'principles', 'components', 'patterns', 'decisions', 'diagrams'],
      required: ['title', 'overview', 'components'],
      optional: ['principles', 'patterns', 'decisions', 'diagrams']
    };
  }
  
  /**
   * Helper utilities
   */
  
  documentParameters(parameters = []) {
    return parameters.map(param => ({
      name: param.name,
      type: param.type || 'string',
      required: param.required || false,
      description: param.description || '',
      example: param.example
    }));
  }
  
  documentRequestBody(requestBody) {
    if (!requestBody) return null;
    
    return {
      contentType: requestBody.contentType || 'application/json',
      schema: requestBody.schema,
      example: requestBody.example
    };
  }
  
  documentResponses(responses = {}) {
    const documented = {};
    
    Object.entries(responses).forEach(([code, response]) => {
      documented[code] = {
        description: response.description,
        schema: response.schema,
        example: response.example
      };
    });
    
    return documented;
  }
  
  generateApiExamples(api) {
    const examples = [];
    
    if (api.example) {
      examples.push(api.example);
    }
    
    return examples;
  }
  
  generateFeatureGuide(feature) {
    return `
### Overview
${feature.description || 'Feature description'}

### How to Use
${feature.usage || 'Usage instructions'}

### Best Practices
${feature.bestPractices || 'Follow general best practices'}
`;
  }
  
  generateTips(feature) {
    return feature.tips || [
      'Read the documentation thoroughly',
      'Start with simple examples',
      'Check the FAQ for common issues'
    ];
  }
  
  parseCodeStructures(code, language) {
    // Simplified parser - in production would use proper AST
    const structures = [];
    
    if (language === 'javascript' || language === 'typescript') {
      // Find functions
      const functionMatches = code.match(/function\s+(\w+)|(\w+)\s*:\s*function|\s(\w+)\s*\(/g) || [];
      structures.push(...functionMatches.map(match => ({ type: 'function', match })));
      
      // Find classes
      const classMatches = code.match(/class\s+(\w+)/g) || [];
      structures.push(...classMatches.map(match => ({ type: 'class', match })));
    }
    
    return structures;
  }
  
  addInlineComments(code, structures, language) {
    let documentedCode = code;
    
    // Add comments based on language
    const commentStyle = language === 'python' ? '#' : '//';
    const blockCommentStart = language === 'python' ? '"""' : '/**';
    const blockCommentEnd = language === 'python' ? '"""' : ' */';
    
    // This is simplified - in production would properly parse and insert comments
    structures.forEach(structure => {
      if (structure.type === 'function') {
        const comment = `${blockCommentStart}\n * Function documentation\n * @param {*} params - Function parameters\n * @returns {*} Return value\n${blockCommentEnd}\n`;
        // Would insert comment at appropriate location
      }
    });
    
    return documentedCode;
  }
  
  analyzeAndDocument(content) {
    // Analyze content and generate sections
    const sections = [];
    
    if (typeof content === 'string') {
      sections.push({
        title: 'Content',
        content: content
      });
    } else if (typeof content === 'object') {
      Object.entries(content).forEach(([key, value]) => {
        sections.push({
          title: key.charAt(0).toUpperCase() + key.slice(1),
          content: typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value)
        });
      });
    }
    
    return sections;
  }
  
  generateDiagrams(data) {
    // Generate diagram descriptions (would integrate with actual diagram tools)
    const diagrams = [];
    
    if (data.components && data.components.length > 0) {
      diagrams.push({
        type: 'component',
        title: 'Component Diagram',
        description: 'Shows the high-level components and their relationships'
      });
    }
    
    if (data.dataFlow) {
      diagrams.push({
        type: 'dataflow',
        title: 'Data Flow Diagram',
        description: 'Illustrates how data moves through the system'
      });
    }
    
    return diagrams;
  }
}

export default ClaudeDocumenter;