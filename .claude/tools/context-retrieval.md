# Context Retrieval Tool (Context7 MCP)

This tool provides intelligent code context retrieval for finding patterns, implementations, and best practices.

## ACTIVATION

When agents need to find code patterns, similar implementations, or development context, use this tool.

## Capabilities

- **Pattern search**: Find similar code patterns across codebases
- **Implementation examples**: Retrieve working implementations
- **Best practices**: Access proven solutions
- **Context awareness**: Understand code relationships
- **Version tracking**: Find latest patterns

## Configuration

```yaml
tool:
  name: context7
  type: mcp_server
  config:
    command: "npx"
    args: ["-y", "@upstash/context7-mcp"]
    
capabilities:
  search:
    languages: ["javascript", "typescript", "python", "java", "go", "rust"]
    frameworks: ["react", "vue", "angular", "express", "fastapi", "spring"]
    depth: ["shallow", "moderate", "comprehensive"]
    
  retrieval:
    max_results: 10
    include_metadata: true
    include_dependencies: true
    include_tests: true
```

## Usage Patterns

### Basic Pattern Search

```javascript
// Find authentication implementations
const authPatterns = await mcp.context7.search({
  query: "JWT authentication middleware",
  language: "javascript",
  framework: "express",
  limit: 5
});

// Find React hook patterns
const hookPatterns = await mcp.context7.search({
  query: "custom React hook for data fetching",
  language: "typescript",
  features: ["error-handling", "loading-state", "caching"]
});
```

### Deep Context Retrieval

```javascript
// Get comprehensive implementation context
const context = await mcp.context7.getContext({
  feature: "user authentication system",
  depth: "comprehensive",
  include: {
    models: true,
    routes: true,
    middleware: true,
    tests: true,
    documentation: true
  }
});

// Returns structured context:
// {
//   models: { User, Session, Token },
//   routes: { auth, users, profile },
//   middleware: { authenticate, authorize },
//   tests: { unit, integration, e2e },
//   docs: { API, setup, security }
// }
```

### Framework-Specific Patterns

```javascript
// Find Next.js patterns
const nextPatterns = await mcp.context7.findPatterns({
  framework: "nextjs",
  patterns: [
    "server-side-rendering",
    "api-routes",
    "dynamic-routing",
    "middleware"
  ],
  version: "14.x"
});

// Find Spring Boot patterns
const springPatterns = await mcp.context7.findPatterns({
  framework: "spring-boot",
  patterns: [
    "rest-controller",
    "service-layer",
    "repository-pattern",
    "exception-handling"
  ],
  includeConfig: true
});
```

## Agent-Specific Usage

### Winston (Architect)

```javascript
// Find architectural patterns
async function findArchitecturalPatterns(requirements) {
  // Search for similar architectures
  const architectures = await mcp.context7.searchArchitectures({
    scale: requirements.scale,
    type: requirements.type,
    constraints: requirements.constraints
  });
  
  // Analyze patterns
  const patterns = [];
  for (const arch of architectures) {
    const analysis = await mcp.context7.analyzePattern({
      pattern: arch,
      criteria: [
        "scalability",
        "maintainability",
        "performance",
        "complexity"
      ]
    });
    
    patterns.push({
      name: arch.name,
      score: analysis.score,
      pros: analysis.pros,
      cons: analysis.cons,
      implementation: arch.implementation
    });
  }
  
  // Get best practices
  const bestPractices = await mcp.context7.getBestPractices({
    architecture: patterns[0].name,
    context: requirements.domain
  });
  
  return {
    recommendations: patterns,
    bestPractices: bestPractices
  };
}
```

### James (Developer)

```javascript
// Find implementation examples
async function findImplementation(feature) {
  // Search for similar features
  const implementations = await mcp.context7.findImplementations({
    feature: feature.description,
    language: feature.language,
    framework: feature.framework,
    complexity: feature.complexity
  });
  
  // Get the most relevant implementation
  const bestMatch = implementations[0];
  
  // Get full context
  const fullContext = await mcp.context7.getFullContext({
    implementation: bestMatch.id,
    include: {
      code: true,
      tests: true,
      dependencies: true,
      setup: true
    }
  });
  
  // Adapt to current project
  const adapted = await adaptImplementation(fullContext, feature.project);
  
  return adapted;
}

// Find code optimization patterns
async function findOptimizations(code) {
  const optimizations = await mcp.context7.findOptimizations({
    code: code,
    focus: ["performance", "memory", "readability"],
    language: detectLanguage(code)
  });
  
  return optimizations.map(opt => ({
    type: opt.type,
    description: opt.description,
    before: opt.original,
    after: opt.optimized,
    impact: opt.expectedImprovement
  }));
}
```

### Elena (QA)

```javascript
// Find test patterns
async function findTestPatterns(component) {
  // Search for test examples
  const testPatterns = await mcp.context7.findTests({
    component: component.type,
    framework: component.framework,
    testTypes: ["unit", "integration", "e2e"]
  });
  
  // Get testing strategies
  const strategies = await mcp.context7.getTestingStrategies({
    componentType: component.type,
    complexity: component.complexity,
    dependencies: component.dependencies
  });
  
  // Generate test plan
  const testPlan = {
    patterns: testPatterns,
    strategies: strategies,
    coverage: calculateCoverage(testPatterns, component),
    priority: prioritizeTests(strategies, component)
  };
  
  return testPlan;
}
```

### Bob (SM)

```javascript
// Find agile ceremony patterns
async function findCeremonyPatterns(team) {
  // Search for ceremony templates
  const ceremonies = await mcp.context7.findPatterns({
    type: "agile-ceremonies",
    teamSize: team.size,
    methodology: team.methodology,
    remote: team.isRemote
  });
  
  // Get facilitation guides
  const guides = await mcp.context7.getFacilitationGuides({
    ceremonies: ceremonies.map(c => c.type),
    context: {
      teamMaturity: team.maturity,
      projectPhase: team.currentPhase
    }
  });
  
  return {
    ceremonies: ceremonies,
    guides: guides,
    schedule: generateSchedule(ceremonies, team)
  };
}
```

### Marcus (Security)

```javascript
// Find security patterns
async function findSecurityPatterns(feature) {
  // Search for security implementations
  const securityPatterns = await mcp.context7.searchSecurity({
    feature: feature.type,
    threats: feature.potentialThreats,
    compliance: feature.complianceRequirements
  });
  
  // Get vulnerability patterns
  const vulnerabilities = await mcp.context7.getVulnerabilities({
    technology: feature.stack,
    version: feature.versions,
    context: feature.implementation
  });
  
  // Find mitigation strategies
  const mitigations = await mcp.context7.getMitigations({
    vulnerabilities: vulnerabilities,
    constraints: feature.constraints
  });
  
  return {
    patterns: securityPatterns,
    vulnerabilities: vulnerabilities,
    mitigations: mitigations,
    checklist: generateSecurityChecklist(feature, mitigations)
  };
}
```

## Advanced Features

### Contextual Learning

```javascript
// Learn from project patterns
async function learnProjectPatterns(projectPath) {
  const analysis = await mcp.context7.analyzeProject({
    path: projectPath,
    depth: "comprehensive"
  });
  
  // Extract patterns
  const patterns = await mcp.context7.extractPatterns({
    codebase: analysis,
    categories: [
      "architecture",
      "coding-style",
      "testing",
      "error-handling",
      "naming-conventions"
    ]
  });
  
  // Create project profile
  const profile = await mcp.context7.createProfile({
    patterns: patterns,
    preferences: detectPreferences(patterns),
    constraints: detectConstraints(analysis)
  });
  
  return profile;
}
```

### Similarity Search

```javascript
// Find similar code blocks
async function findSimilarCode(codeBlock) {
  const similar = await mcp.context7.findSimilar({
    code: codeBlock,
    threshold: 0.8,
    scope: ["syntax", "semantic", "functional"]
  });
  
  return similar.map(match => ({
    code: match.code,
    similarity: match.score,
    differences: match.differences,
    improvements: match.suggestedImprovements,
    source: match.source
  }));
}
```

### Pattern Evolution

```javascript
// Track pattern evolution over time
async function trackPatternEvolution(pattern) {
  const evolution = await mcp.context7.getEvolution({
    pattern: pattern,
    timeframe: "last-2-years",
    includeReasons: true
  });
  
  return {
    timeline: evolution.timeline,
    changes: evolution.significantChanges,
    current: evolution.currentBestPractice,
    future: evolution.emergingTrends,
    migration: evolution.migrationGuide
  };
}
```

## Caching Strategy

```javascript
// Implement intelligent caching
class ContextCache {
  constructor() {
    this.cache = new Map();
    this.ttl = 3600000; // 1 hour
  }
  
  async get(query, fetcher) {
    const key = this.generateKey(query);
    const cached = this.cache.get(key);
    
    if (cached && cached.expires > Date.now()) {
      return cached.data;
    }
    
    const data = await fetcher();
    
    this.cache.set(key, {
      data: data,
      expires: Date.now() + this.ttl,
      query: query
    });
    
    return data;
  }
  
  generateKey(query) {
    return JSON.stringify(query);
  }
  
  invalidate(pattern) {
    for (const [key, value] of this.cache) {
      if (pattern.test(value.query)) {
        this.cache.delete(key);
      }
    }
  }
}

const contextCache = new ContextCache();

// Use with caching
async function cachedSearch(query) {
  return await contextCache.get(query, async () => {
    return await mcp.context7.search(query);
  });
}
```

## Performance Optimization

```javascript
// Batch context retrieval
async function batchContextRetrieval(features) {
  const batchSize = 5;
  const results = [];
  
  for (let i = 0; i < features.length; i += batchSize) {
    const batch = features.slice(i, i + batchSize);
    
    const batchResults = await Promise.all(
      batch.map(feature => 
        mcp.context7.getContext({
          feature: feature,
          depth: "moderate"
        })
      )
    );
    
    results.push(...batchResults);
  }
  
  return results;
}

// Prioritized retrieval
async function prioritizedRetrieval(queries) {
  // Sort by priority
  const sorted = queries.sort((a, b) => b.priority - a.priority);
  
  // Get high priority immediately
  const highPriority = sorted.filter(q => q.priority > 8);
  const highResults = await Promise.all(
    highPriority.map(q => mcp.context7.search(q))
  );
  
  // Queue lower priority
  const lowPriority = sorted.filter(q => q.priority <= 8);
  const lowResults = await batchContextRetrieval(lowPriority);
  
  return [...highResults, ...lowResults];
}
```

## Best Practices

1. **Cache frequently used patterns** to reduce API calls
2. **Use specific queries** for better results
3. **Include framework/language** in searches
4. **Batch similar requests** for efficiency
5. **Set appropriate depth** based on needs
6. **Version-lock patterns** for stability
7. **Validate retrieved patterns** before use
8. **Keep context focused** to avoid information overload

This tool provides intelligent context retrieval capabilities that help Pantheon agents find and apply proven patterns and implementations.