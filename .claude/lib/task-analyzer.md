# Task Analyzer Library

This library analyzes user task requests to extract domains, technologies, complexity, and required capabilities for intelligent routing.

## ACTIVATION

When this library is invoked, you are performing natural language analysis to understand task requirements for optimal agent selection.

## Core Purpose

The Task Analyzer:
1. Parses natural language task descriptions
2. Identifies relevant domains and technologies
3. Estimates task complexity and scope
4. Extracts required capabilities
5. Classifies task types

## Analysis Functions

### 1. Domain Detection

```javascript
function detectDomains(request) {
  const domains = [];
  
  // Comprehensive domain patterns
  const domainPatterns = {
    architecture: {
      patterns: [
        /architect|design|structure|pattern|scalab/i,
        /system\s+design|high.?level|blueprint/i,
        /microservice|monolith|distributed/i,
        /technical\s+decision|adr/i
      ],
      weight: 1.0
    },
    
    implementation: {
      patterns: [
        /implement|build|create|develop|code/i,
        /feature|function|component|module/i,
        /api|endpoint|service|integration/i,
        /frontend|backend|full.?stack/i
      ],
      weight: 0.9
    },
    
    testing: {
      patterns: [
        /test|qa|quality|validation|verify/i,
        /automated|regression|unit|integration/i,
        /bug|defect|issue|problem/i,
        /coverage|assertion|mock|stub/i
      ],
      weight: 0.9
    },
    
    security: {
      patterns: [
        /security|vulnerab|threat|attack/i,
        /compliance|audit|penetration|pentest/i,
        /auth|encrypt|certificate|ssl|tls/i,
        /owasp|gdpr|pci|hipaa|sox/i
      ],
      weight: 1.0
    },
    
    ui: {
      patterns: [
        /ui|ux|design|interface|mockup/i,
        /visual|layout|styling|css|component/i,
        /user\s+experience|usability|accessibility/i,
        /responsive|mobile|desktop|adaptive/i
      ],
      weight: 0.8
    },
    
    planning: {
      patterns: [
        /plan|roadmap|strategy|requirement/i,
        /story|epic|feature|backlog/i,
        /priorit|timeline|milestone|sprint/i,
        /specification|criteria|scope/i
      ],
      weight: 0.8
    },
    
    devops: {
      patterns: [
        /deploy|ci|cd|pipeline|infrastructure/i,
        /docker|kubernetes|container|k8s/i,
        /cloud|aws|azure|gcp|serverless/i,
        /monitor|log|metric|observability/i
      ],
      weight: 0.9
    },
    
    performance: {
      patterns: [
        /performance|speed|optimize|latency/i,
        /scale|load|stress|benchmark/i,
        /memory|cpu|resource|efficiency/i,
        /cache|index|query|bottleneck/i
      ],
      weight: 0.8
    },
    
    data: {
      patterns: [
        /database|sql|nosql|query|schema/i,
        /migration|etl|pipeline|warehouse/i,
        /analytics|report|dashboard|visualization/i,
        /data\s+model|relationship|normalization/i
      ],
      weight: 0.8
    }
  };
  
  // Score each domain based on pattern matches
  const domainScores = {};
  
  for (const [domain, config] of Object.entries(domainPatterns)) {
    let score = 0;
    let matches = 0;
    
    for (const pattern of config.patterns) {
      if (pattern.test(request)) {
        matches++;
        score += config.weight;
      }
    }
    
    if (matches > 0) {
      domainScores[domain] = score / matches;
    }
  }
  
  // Select domains with score > threshold
  const threshold = 0.5;
  for (const [domain, score] of Object.entries(domainScores)) {
    if (score >= threshold) {
      domains.push(domain);
    }
  }
  
  // Sort by score (highest first)
  domains.sort((a, b) => domainScores[b] - domainScores[a]);
  
  return domains;
}
```

### 2. Technology Detection

```javascript
function detectTechnologies(request) {
  const technologies = [];
  
  // Technology patterns with contextual hints
  const techPatterns = {
    // Frontend Technologies
    react: {
      patterns: [/react|jsx|hooks|component|useState|useEffect/i],
      context: ['frontend', 'ui', 'component']
    },
    vue: {
      patterns: [/vue|vuex|composition\s+api|v-model/i],
      context: ['frontend', 'ui']
    },
    angular: {
      patterns: [/angular|typescript|rxjs|directive/i],
      context: ['frontend', 'ui']
    },
    
    // Backend Technologies
    nodejs: {
      patterns: [/node|express|npm|javascript|js\s+backend/i],
      context: ['backend', 'server', 'api']
    },
    python: {
      patterns: [/python|django|flask|fastapi|pip/i],
      context: ['backend', 'api', 'script']
    },
    java: {
      patterns: [/java|spring|maven|gradle|jvm/i],
      context: ['backend', 'enterprise']
    },
    
    // Cloud & Infrastructure
    aws: {
      patterns: [/aws|s3|lambda|ec2|dynamodb|cloudformation/i],
      context: ['cloud', 'infrastructure']
    },
    docker: {
      patterns: [/docker|container|dockerfile|compose/i],
      context: ['devops', 'deployment']
    },
    kubernetes: {
      patterns: [/kubernetes|k8s|kubectl|helm|pod/i],
      context: ['devops', 'orchestration']
    },
    
    // Databases
    postgresql: {
      patterns: [/postgres|postgresql|psql/i],
      context: ['database', 'sql']
    },
    mongodb: {
      patterns: [/mongo|mongodb|mongoose|nosql/i],
      context: ['database', 'nosql']
    },
    redis: {
      patterns: [/redis|cache|pub.?sub/i],
      context: ['cache', 'performance']
    },
    
    // Other Technologies
    graphql: {
      patterns: [/graphql|apollo|resolver|schema/i],
      context: ['api', 'query']
    },
    rest: {
      patterns: [/rest|restful|crud|http\s+methods/i],
      context: ['api', 'web']
    },
    typescript: {
      patterns: [/typescript|ts|type\s+safety|interface/i],
      context: ['type-safety', 'development']
    }
  };
  
  // Detect technologies
  for (const [tech, config] of Object.entries(techPatterns)) {
    for (const pattern of config.patterns) {
      if (pattern.test(request)) {
        technologies.push(tech);
        break; // Only add once per technology
      }
    }
  }
  
  return [...new Set(technologies)]; // Remove duplicates
}
```

### 3. Complexity Analysis

```javascript
function analyzeComplexity(request, domains, technologies) {
  let complexity = 5; // Base complexity
  
  // Length factor (longer requests tend to be more complex)
  const wordCount = request.split(/\s+/).length;
  if (wordCount > 50) complexity += 1;
  if (wordCount > 100) complexity += 1;
  if (wordCount > 200) complexity += 1;
  
  // Domain complexity (multiple domains increase complexity)
  complexity += domains.length * 0.5;
  
  // Technology complexity (multiple technologies increase complexity)
  complexity += technologies.length * 0.3;
  
  // Complexity keywords
  const complexityIndicators = {
    high: [
      /enterprise|large.?scale|distributed|complex/i,
      /mission.?critical|high.?availability|fault.?tolerant/i,
      /migration|refactor|redesign|rewrite/i,
      /integration|orchestrat|coordinate|synchroniz/i,
      /multi.?tenant|globalization|localization/i,
      /real.?time|concurrent|parallel|async/i
    ],
    medium: [
      /feature|function|component|module/i,
      /api|service|endpoint|interface/i,
      /optimize|improve|enhance|update/i,
      /test|validate|verify|ensure/i
    ],
    low: [
      /simple|basic|straightforward|trivial/i,
      /small|minor|quick|easy/i,
      /fix|patch|typo|correction/i,
      /example|demo|prototype|poc/i
    ]
  };
  
  // Apply complexity modifiers
  for (const pattern of complexityIndicators.high) {
    if (pattern.test(request)) complexity += 0.8;
  }
  
  for (const pattern of complexityIndicators.medium) {
    if (pattern.test(request)) complexity += 0.3;
  }
  
  for (const pattern of complexityIndicators.low) {
    if (pattern.test(request)) complexity -= 0.5;
  }
  
  // Special cases
  if (/from\s+scratch|greenfield|new\s+project/i.test(request)) {
    complexity += 1;
  }
  
  if (/proof\s+of\s+concept|mvp|prototype/i.test(request)) {
    complexity -= 1;
  }
  
  // Normalize to 1-10 scale
  return Math.max(1, Math.min(10, Math.round(complexity)));
}
```

### 4. Capability Extraction

```javascript
function extractCapabilities(domains, technologies, taskType) {
  const capabilities = new Set();
  
  // Domain to capability mapping
  const domainCapabilities = {
    architecture: [
      'system-design', 'architecture-patterns', 'scalability-planning',
      'technical-decisions', 'pattern-recognition'
    ],
    implementation: [
      'coding', 'debugging', 'refactoring', 'development',
      'code-quality', 'implementation'
    ],
    testing: [
      'test-design', 'qa-automation', 'test-strategy',
      'quality-assurance', 'defect-prevention'
    ],
    security: [
      'security-audit', 'threat-modeling', 'compliance',
      'vulnerability-assessment', 'security-architecture'
    ],
    ui: [
      'ux-design', 'ui-patterns', 'visual-design',
      'user-research', 'accessibility'
    ],
    planning: [
      'requirements-analysis', 'roadmapping', 'prioritization',
      'project-planning', 'stakeholder-management'
    ],
    devops: [
      'ci-cd', 'infrastructure', 'deployment',
      'containerization', 'cloud-architecture'
    ],
    performance: [
      'performance-optimization', 'scalability', 'monitoring',
      'profiling', 'resource-management'
    ],
    data: [
      'data-modeling', 'query-optimization', 'database-design',
      'data-architecture', 'analytics'
    ]
  };
  
  // Technology to capability mapping
  const techCapabilities = {
    react: ['frontend-development', 'component-design', 'spa-development'],
    nodejs: ['backend-development', 'api-design', 'server-side'],
    python: ['scripting', 'data-processing', 'automation'],
    aws: ['cloud-architecture', 'serverless', 'infrastructure-as-code'],
    docker: ['containerization', 'microservices', 'deployment'],
    kubernetes: ['orchestration', 'scaling', 'container-management'],
    postgresql: ['sql', 'relational-design', 'data-integrity'],
    mongodb: ['nosql', 'document-modeling', 'flexible-schema']
  };
  
  // Task type to capability mapping
  const taskCapabilities = {
    design: ['system-design', 'solution-architecture', 'planning'],
    implementation: ['coding', 'development', 'integration'],
    testing: ['test-strategy', 'quality-assurance', 'validation'],
    review: ['code-review', 'analysis', 'evaluation'],
    planning: ['project-planning', 'requirements-analysis', 'roadmapping'],
    analysis: ['research', 'evaluation', 'assessment']
  };
  
  // Add capabilities from domains
  for (const domain of domains) {
    const caps = domainCapabilities[domain] || [];
    caps.forEach(cap => capabilities.add(cap));
  }
  
  // Add capabilities from technologies
  for (const tech of technologies) {
    const caps = techCapabilities[tech] || [];
    caps.forEach(cap => capabilities.add(cap));
  }
  
  // Add capabilities from task type
  const taskCaps = taskCapabilities[taskType] || [];
  taskCaps.forEach(cap => capabilities.add(cap));
  
  return Array.from(capabilities);
}
```

### 5. Duration Estimation

```javascript
function estimateDuration(complexity, taskType, domains) {
  // Base duration matrix
  const durationMatrix = {
    design: {
      1: 'hours', 2: 'hours', 3: 'days',
      4: 'days', 5: 'days', 6: 'weeks',
      7: 'weeks', 8: 'weeks', 9: 'weeks',
      10: 'weeks'
    },
    implementation: {
      1: 'hours', 2: 'hours', 3: 'days',
      4: 'days', 5: 'days', 6: 'days',
      7: 'weeks', 8: 'weeks', 9: 'weeks',
      10: 'weeks'
    },
    testing: {
      1: 'minutes', 2: 'hours', 3: 'hours',
      4: 'hours', 5: 'days', 6: 'days',
      7: 'days', 8: 'weeks', 9: 'weeks',
      10: 'weeks'
    },
    review: {
      1: 'minutes', 2: 'minutes', 3: 'hours',
      4: 'hours', 5: 'hours', 6: 'days',
      7: 'days', 8: 'days', 9: 'days',
      10: 'weeks'
    },
    planning: {
      1: 'hours', 2: 'hours', 3: 'hours',
      4: 'days', 5: 'days', 6: 'days',
      7: 'days', 8: 'weeks', 9: 'weeks',
      10: 'weeks'
    },
    analysis: {
      1: 'hours', 2: 'hours', 3: 'days',
      4: 'days', 5: 'days', 6: 'days',
      7: 'weeks', 8: 'weeks', 9: 'weeks',
      10: 'weeks'
    }
  };
  
  const durations = durationMatrix[taskType] || durationMatrix.implementation;
  return durations[complexity] || 'days';
}
```

### 6. Complete Task Analysis

```javascript
function analyzeTask(request) {
  // Normalize request
  const normalizedRequest = request.trim().toLowerCase();
  
  // Extract all components
  const domains = detectDomains(request);
  const technologies = detectTechnologies(request);
  const taskType = classifyTaskType(request); // From smart-router-helpers
  const complexity = analyzeComplexity(request, domains, technologies);
  const capabilities = extractCapabilities(domains, technologies, taskType);
  const duration = estimateDuration(complexity, taskType, domains);
  
  // Build task analysis
  const analysis = {
    domains,
    technologies,
    complexity,
    requiredCapabilities: capabilities,
    estimatedDuration: duration,
    taskType,
    originalRequest: request
  };
  
  // Add metadata
  analysis.metadata = {
    wordCount: request.split(/\s+/).length,
    hasCodeBlocks: /```/.test(request),
    hasUrls: /https?:\/\//.test(request),
    hasPriority: /urgent|asap|critical|high\s+priority/i.test(request),
    isQuestion: /\?|how|what|when|where|why|can|should/i.test(request)
  };
  
  return analysis;
}
```

## Contextual Understanding

### Intent Recognition

```javascript
function recognizeIntent(request) {
  const intents = {
    create: /create|build|implement|develop|make|construct/i,
    fix: /fix|repair|debug|resolve|patch|correct/i,
    improve: /improve|optimize|enhance|refactor|upgrade/i,
    analyze: /analyze|review|evaluate|assess|examine/i,
    plan: /plan|design|architect|strategize|roadmap/i,
    test: /test|verify|validate|check|ensure/i,
    document: /document|write|describe|explain|detail/i,
    integrate: /integrate|connect|combine|merge|unify/i
  };
  
  for (const [intent, pattern] of Object.entries(intents)) {
    if (pattern.test(request)) {
      return intent;
    }
  }
  
  return 'general';
}
```

### Context Clues

```javascript
function extractContextClues(request) {
  const clues = {
    isNewProject: /new\s+project|from\s+scratch|greenfield/i.test(request),
    isExistingProject: /existing|current|legacy|migrate/i.test(request),
    hasDeadline: /by|before|deadline|due|asap/i.test(request),
    needsResearch: /research|investigate|explore|compare/i.test(request),
    isProofOfConcept: /poc|proof\s+of\s+concept|prototype|demo/i.test(request),
    requiresCollaboration: /team|collaborate|together|coordinate/i.test(request),
    hasConstraints: /must|require|constraint|limitation|restriction/i.test(request),
    needsDocumentation: /document|readme|guide|tutorial|explain/i.test(request)
  };
  
  const activeClues = [];
  for (const [clue, pattern] of Object.entries(clues)) {
    if (pattern.test(request)) {
      activeClues.push(clue);
    }
  }
  
  return activeClues;
}
```

## Usage Example

```javascript
// Complete task analysis flow
const request = "Design and implement a secure REST API with JWT authentication for our e-commerce platform using Node.js and PostgreSQL";

const analysis = analyzeTask(request);
console.log(JSON.stringify(analysis, null, 2));

/* Output:
{
  "domains": ["architecture", "implementation", "security"],
  "technologies": ["nodejs", "postgresql", "rest"],
  "complexity": 7,
  "requiredCapabilities": [
    "system-design", "api-design", "security-architecture",
    "backend-development", "authentication-design"
  ],
  "estimatedDuration": "weeks",
  "taskType": "design",
  "originalRequest": "Design and implement...",
  "metadata": {
    "wordCount": 17,
    "hasCodeBlocks": false,
    "hasUrls": false,
    "hasPriority": false,
    "isQuestion": false
  }
}
*/
```

## Integration with Smart Router

This Task Analyzer integrates seamlessly with the Smart Router:

1. User provides task request
2. Task Analyzer extracts all relevant information
3. Smart Router uses analysis to match agents
4. Routing decision is made based on capabilities

The analyzer provides rich context that enables intelligent, capability-based routing decisions.