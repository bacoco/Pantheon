# Smart Router Helper Functions

This library provides helper functions for the Smart Router's task analysis and decision-making processes.

## ACTIVATION

These helpers are used by the Smart Router to analyze tasks, calculate complexity, and generate routing decisions.

## Complexity Calculation

```javascript
function calculateComplexity(request: string, analysis: TaskAnalysis): number {
  let complexity = 5; // Base complexity
  
  // Factors that increase complexity
  const complexityFactors = {
    // Length indicates more detailed requirements
    lengthFactor: Math.min(request.length / 100, 2), // +0 to +2
    
    // Multiple domains increase complexity
    domainFactor: analysis.domains.length * 0.5, // +0.5 per domain
    
    // Multiple technologies increase complexity
    techFactor: analysis.technologies.length * 0.3, // +0.3 per tech
    
    // Certain keywords indicate complexity
    keywordFactor: countComplexityKeywords(request) * 0.5
  };
  
  // Keywords that indicate high complexity
  const highComplexityPatterns = [
    /enterprise|large.?scale|distributed/i,
    /migration|refactor|redesign/i,
    /integration|orchestrat|coordinate/i,
    /security|compliance|audit/i,
    /performance|optimiz|scale/i
  ];
  
  for (const pattern of highComplexityPatterns) {
    if (pattern.test(request)) {
      complexity += 0.5;
    }
  }
  
  // Keywords that indicate lower complexity
  const lowComplexityPatterns = [
    /simple|basic|straightforward/i,
    /small|minor|quick/i,
    /example|demo|prototype/i,
    /fix|bug|typo/i
  ];
  
  for (const pattern of lowComplexityPatterns) {
    if (pattern.test(request)) {
      complexity -= 0.5;
    }
  }
  
  // Add up all factors
  complexity += Object.values(complexityFactors).reduce((a, b) => a + b, 0);
  
  // Ensure complexity is within bounds (1-10)
  return Math.max(1, Math.min(10, Math.round(complexity)));
}
```

## Task Type Classification

```javascript
function classifyTaskType(request: string): TaskType {
  const taskPatterns = {
    design: [
      /design|architect|structure|pattern/i,
      /plan|model|diagram|blueprint/i,
      /system|solution|approach/i
    ],
    implementation: [
      /implement|build|create|develop/i,
      /code|program|write|construct/i,
      /feature|function|component/i
    ],
    testing: [
      /test|verify|validate|check/i,
      /qa|quality|assurance|ensure/i,
      /debug|fix|troubleshoot/i
    ],
    review: [
      /review|analyze|evaluate|assess/i,
      /audit|inspect|examine/i,
      /feedback|critique|improve/i
    ],
    planning: [
      /plan|roadmap|strategy|timeline/i,
      /requirement|specification|story/i,
      /prioritize|organize|schedule/i
    ],
    analysis: [
      /analyze|research|investigate|explore/i,
      /compare|evaluate|study/i,
      /understand|learn|discover/i
    ]
  };
  
  let maxMatches = 0;
  let detectedType: TaskType = "implementation"; // default
  
  for (const [type, patterns] of Object.entries(taskPatterns)) {
    let matches = 0;
    for (const pattern of patterns) {
      if (pattern.test(request)) {
        matches++;
      }
    }
    if (matches > maxMatches) {
      maxMatches = matches;
      detectedType = type as TaskType;
    }
  }
  
  return detectedType;
}
```

## Capability Extraction

```javascript
function extractRequiredCapabilities(analysis: TaskAnalysis): string[] {
  const capabilities = new Set<string>();
  
  // Map domains to capabilities
  const domainCapabilityMap = {
    architecture: ["system-design", "architecture-patterns", "scalability"],
    implementation: ["coding", "debugging", "refactoring"],
    testing: ["test-design", "qa-automation", "test-strategy"],
    security: ["security-audit", "threat-modeling", "compliance"],
    ui: ["ux-design", "ui-patterns", "visual-design"],
    planning: ["requirements-analysis", "roadmapping", "prioritization"],
    devops: ["ci-cd", "infrastructure", "deployment"]
  };
  
  // Map technologies to capabilities
  const techCapabilityMap = {
    react: ["frontend-development", "component-design"],
    nodejs: ["backend-development", "api-design"],
    python: ["scripting", "data-processing"],
    aws: ["cloud-architecture", "serverless"],
    docker: ["containerization", "microservices"],
    database: ["data-modeling", "query-optimization"]
  };
  
  // Add capabilities based on domains
  for (const domain of analysis.domains) {
    const domainCaps = domainCapabilityMap[domain] || [];
    domainCaps.forEach(cap => capabilities.add(cap));
  }
  
  // Add capabilities based on technologies
  for (const tech of analysis.technologies) {
    const techCaps = techCapabilityMap[tech] || [];
    techCaps.forEach(cap => capabilities.add(cap));
  }
  
  // Add capabilities based on task type
  const taskTypeCapabilities = {
    design: ["system-design", "solution-architecture"],
    implementation: ["coding", "development"],
    testing: ["test-strategy", "quality-assurance"],
    review: ["code-review", "analysis"],
    planning: ["project-planning", "requirements-analysis"],
    analysis: ["research", "evaluation"]
  };
  
  const taskCaps = taskTypeCapabilities[analysis.taskType] || [];
  taskCaps.forEach(cap => capabilities.add(cap));
  
  return Array.from(capabilities);
}
```

## Agent Capability Helpers

```javascript
function getAgentTopCapabilities(agentName: string): string[] {
  const agentCapabilities = {
    daedalus: ["architecture-design", "system-design", "scalability-planning"],
    hephaestus: ["implementation", "code-quality", "refactoring"],
    themis: ["testing-strategy", "qa-automation", "user-validation"],
    aegis: ["security-audit", "compliance", "threat-analysis"],
    prometheus: ["product-planning", "requirements", "roadmapping"],
    athena: ["user-stories", "prioritization", "validation"],
    hermes: ["scrum-process", "task-breakdown", "team-coordination"],
    apollo: ["ux-design", "ui-patterns", "user-research"],
    pixel: ["ui-quality", "visual-testing", "style-compliance"],
    "baco-master": ["orchestration", "meta-analysis", "workflow-design"]
  };
  
  return agentCapabilities[agentName] || ["general-support"];
}

function determineRole(agentName: string, analysis: TaskAnalysis): string {
  const roleMap = {
    daedalus: "Technical Architecture Advisor",
    hephaestus: "Implementation Partner",
    themis: "Quality Assurance Lead",
    aegis: "Security Consultant",
    prometheus: "Product Strategy Advisor",
    athena: "User Story Validator",
    hermes: "Process Facilitator",
    apollo: "Design Consultant",
    pixel: "UI Quality Checker",
    "baco-master": "Workflow Orchestrator"
  };
  
  // Customize role based on task
  if (analysis.taskType === "review" && agentName === "aegis") {
    return "Security Reviewer";
  }
  if (analysis.taskType === "testing" && agentName === "themis") {
    return "Test Strategy Lead";
  }
  
  return roleMap[agentName] || "Collaborator";
}
```

## Confidence Calculation

```javascript
function calculateConfidence(primaryScore: number, supportingCount: number): number {
  // Base confidence from primary agent score
  let confidence = primaryScore;
  
  // Boost confidence if we have supporting agents
  if (supportingCount > 0) {
    confidence += 0.1 * Math.min(supportingCount, 2);
  }
  
  // Apply confidence bands
  if (primaryScore > 0.9) {
    confidence = Math.min(0.95, confidence); // Never 100% certain
  } else if (primaryScore < 0.3) {
    confidence = Math.max(0.25, confidence); // Minimum threshold
  }
  
  return Math.round(confidence * 100) / 100;
}
```

## Tradeoff Generation

```javascript
function generateTradeoffs(
  alternativeAgent: string, 
  primaryAgent: string, 
  analysis: TaskAnalysis
): string {
  const tradeoffTemplates = {
    "daedalus-vs-hephaestus": "More theoretical, less hands-on implementation",
    "hephaestus-vs-daedalus": "More practical, less architectural overview",
    "themis-vs-hephaestus": "Focus on testing rather than implementation",
    "aegis-vs-daedalus": "Security-first approach vs. general architecture",
    "apollo-vs-hephaestus": "Design-driven vs. code-first approach"
  };
  
  const key = `${alternativeAgent}-vs-${primaryAgent}`;
  const reverseKey = `${primaryAgent}-vs-${alternativeAgent}`;
  
  if (tradeoffTemplates[key]) {
    return tradeoffTemplates[key];
  } else if (tradeoffTemplates[reverseKey]) {
    return "Inverse: " + tradeoffTemplates[reverseKey];
  }
  
  // Generic tradeoff based on agent specialties
  return `Different perspective: ${alternativeAgent} brings ${getAgentSpecialty(alternativeAgent)} expertise`;
}

function getAgentSpecialty(agentName: string): string {
  const specialties = {
    daedalus: "architectural",
    hephaestus: "implementation",
    themis: "quality assurance",
    aegis: "security",
    prometheus: "product management",
    athena: "user-focused",
    hermes: "process",
    apollo: "design",
    pixel: "visual quality",
    "baco-master": "orchestration"
  };
  
  return specialties[agentName] || "general";
}
```

## Keyword Analysis

```javascript
function countComplexityKeywords(request: string): number {
  const complexityKeywords = [
    "enterprise", "large-scale", "distributed", "microservices",
    "high-availability", "fault-tolerant", "real-time", "concurrent",
    "multi-tenant", "globalization", "localization", "accessibility",
    "performance", "optimization", "scalability", "reliability",
    "integration", "migration", "refactoring", "modernization"
  ];
  
  let count = 0;
  const lowerRequest = request.toLowerCase();
  
  for (const keyword of complexityKeywords) {
    if (lowerRequest.includes(keyword)) {
      count++;
    }
  }
  
  return count;
}
```

## Duration Estimation

```javascript
function estimateDuration(complexity: number, taskType: string): Duration {
  // Base duration by task type
  const baseDurations = {
    design: { 1: "hours", 4: "days", 7: "weeks", 9: "weeks" },
    implementation: { 1: "hours", 3: "days", 6: "weeks", 9: "weeks" },
    testing: { 1: "minutes", 3: "hours", 6: "days", 8: "weeks" },
    review: { 1: "minutes", 3: "hours", 5: "days", 8: "days" },
    planning: { 1: "hours", 4: "days", 7: "days", 9: "weeks" },
    analysis: { 1: "hours", 3: "days", 6: "days", 8: "weeks" }
  };
  
  const durations = baseDurations[taskType] || baseDurations.implementation;
  
  // Find the appropriate duration based on complexity
  if (complexity <= 2) return durations[1];
  if (complexity <= 5) return durations[3] || durations[4];
  if (complexity <= 8) return durations[6] || durations[7];
  return durations[9] || "weeks";
}
```

## Fallback Routing

```javascript
function getDefaultRouting(): RoutingDecision {
  return {
    primaryAgent: {
      name: "baco-master",
      matchScore: 0.5,
      capabilities: ["orchestration", "meta-analysis"]
    },
    supportingAgents: [],
    confidence: 0.5,
    reasoning: "Using BMad Master as the default orchestrator for complex routing decisions",
    alternativeRoutes: [],
    flags: {
      autoRoute: false,
      allowOverride: true
    }
  };
}

function getFallbackRouting(): RoutingDecision {
  return {
    primaryAgent: {
      name: "hephaestus",
      matchScore: 0.6,
      capabilities: ["implementation", "general-development"]
    },
    supportingAgents: [{
      name: "daedalus",
      role: "Architecture Advisor",
      matchScore: 0.5
    }],
    confidence: 0.6,
    reasoning: "Falling back to Hephaestus (Developer) with Daedalus (Architect) support as a safe default",
    alternativeRoutes: [],
    flags: {
      autoRoute: false,
      allowOverride: true
    }
  };
}
```

These helper functions provide the Smart Router with sophisticated analysis capabilities while maintaining clarity and extensibility.