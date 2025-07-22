# Smart Router Library

You are working with BACO's Smart Router, which intelligently routes tasks to the most appropriate agents based on capabilities and task requirements.

## ACTIVATION

When this library is invoked, you are analyzing tasks and making intelligent routing decisions.

## Core Purpose

The Smart Router:
1. Analyzes incoming task requests
2. Matches task requirements with agent capabilities
3. Provides transparent routing decisions with confidence scores
4. Enables manual override when needed

## Data Structures

### TaskAnalysis Interface

```typescript
interface TaskAnalysis {
  // Identified domains (e.g., ["architecture", "security", "frontend"])
  domains: string[];
  
  // Technologies mentioned (e.g., ["react", "aws", "docker"])
  technologies: string[];
  
  // Complexity score (1-10 scale)
  complexity: number;
  
  // Required capabilities (e.g., ["system-design", "cloud-patterns"])
  requiredCapabilities: string[];
  
  // Estimated effort
  estimatedDuration: "minutes" | "hours" | "days" | "weeks";
  
  // Task type classification
  taskType: "design" | "implementation" | "testing" | "review" | "planning" | "analysis";
  
  // Original request for reference
  originalRequest: string;
}
```

### RoutingDecision Interface

```typescript
interface RoutingDecision {
  // Primary agent recommendation
  primaryAgent: {
    name: string;
    matchScore: number; // 0-1
    capabilities: string[];
  };
  
  // Supporting agents for collaboration
  supportingAgents: Array<{
    name: string;
    role: string;
    matchScore: number;
  }>;
  
  // Overall confidence in routing (0-1)
  confidence: number;
  
  // Human-readable explanation
  reasoning: string;
  
  // Alternative routing options
  alternativeRoutes: Array<{
    agent: string;
    confidence: number;
    tradeoffs: string;
  }>;
  
  // Feature flags status
  flags: {
    autoRoute: boolean;
    allowOverride: boolean;
  };
}
```

### Agent Capability Structure

```typescript
interface AgentCapability {
  domain: string;
  level: "novice" | "intermediate" | "advanced" | "expert";
  keywords: string[];
  preferredTasks: string[];
}
```

## Routing Algorithm

### 1. Task Analysis Phase

The task analysis phase uses the comprehensive Task Analyzer library:

```javascript
// Import from task-analyzer.md
const { analyzeTask } = require('./task-analyzer');

// The analyzeTask function from task-analyzer.md provides:
// - Advanced domain detection with weighted patterns
// - Comprehensive technology recognition
// - Sophisticated complexity analysis
// - Capability extraction based on domains/tech/task type
// - Duration estimation
// - Metadata extraction (word count, priority, etc.)
```

### 2. Agent Matching Phase

```javascript
function matchAgents(analysis: TaskAnalysis): RoutingDecision {
  const registry = loadAgentCapabilities();
  const scores = new Map<string, number>();
  
  // Score each agent based on capability match
  for (const [agentId, metadata] of Object.entries(registry)) {
    if (!metadata) continue;
    
    let score = 0;
    let factors = [];
    
    // Domain matching (40% weight)
    let domainScore = 0;
    for (const domain of analysis.domains) {
      if (metadata.domains.includes(domain)) {
        domainScore += 0.4;
        factors.push(`domain:${domain}`);
      }
    }
    if (analysis.domains.length > 0) {
      score += domainScore / analysis.domains.length;
    }
    
    // Capability matching (30% weight)
    let capabilityScore = 0;
    let capMatches = 0;
    for (const requiredCap of analysis.requiredCapabilities) {
      for (const agentCap of metadata.capabilities) {
        const [capName, level] = agentCap.split(':');
        if (capName === requiredCap) {
          capabilityScore += getCapabilityScore(level) * 0.3;
          capMatches++;
          factors.push(`capability:${capName}:${level}`);
          break;
        }
      }
    }
    if (capMatches > 0) {
      score += capabilityScore / capMatches;
    }
    
    // Pattern matching (15% weight)
    let patternScore = 0;
    for (const pattern of metadata.strongPatterns) {
      if (analysis.originalRequest.toLowerCase().includes(pattern.toLowerCase())) {
        patternScore = 0.15;
        factors.push(`pattern:${pattern}`);
        break;
      }
    }
    score += patternScore;
    
    // Complexity handling (15% weight)
    const [minComplexity, maxComplexity] = metadata.complexityRange;
    if (analysis.complexity >= minComplexity && analysis.complexity <= maxComplexity) {
      score += 0.15;
      factors.push(`complexity:in-range`);
    } else if (analysis.complexity < minComplexity) {
      // Can handle simpler tasks
      score += 0.1;
      factors.push(`complexity:below-range`);
    } else {
      // Complexity too high
      score += 0.0;
      factors.push(`complexity:above-range`);
    }
    
    // Store score with metadata
    if (score > 0) {
      scores.set(agentId, {
        score,
        factors,
        metadata
      });
    }
  }
  
  // Generate routing decision
  return generateRoutingDecision(scores, analysis);
}
```

### 3. Decision Generation

```javascript
function generateRoutingDecision(
  scores: Map<string, any>, 
  analysis: TaskAnalysis
): RoutingDecision {
  // Sort agents by score
  const sortedAgents = Array.from(scores.entries())
    .sort((a, b) => b[1].score - a[1].score);
  
  // Select primary agent
  const [primaryId, primaryData] = sortedAgents[0] || ["bmad-master", { score: 0.5, metadata: getAgentMetadata('bmad-master') }];
  
  // Select supporting agents (score > 0.4 and complementary skills)
  const supporting = [];
  const primaryDomains = new Set(primaryData.metadata.domains);
  
  for (let i = 1; i < sortedAgents.length && supporting.length < 2; i++) {
    const [agentId, agentData] = sortedAgents[i];
    
    // Check for complementary skills
    const hasComplementarySkills = agentData.metadata.domains.some(d => !primaryDomains.has(d));
    
    if (agentData.score > 0.4 && hasComplementarySkills) {
      supporting.push({
        name: agentId,
        role: determineRole(agentId, analysis),
        matchScore: agentData.score,
        reason: `Brings ${agentData.metadata.domains.filter(d => !primaryDomains.has(d)).join(', ')} expertise`
      });
    }
  }
  
  // Calculate overall confidence
  const confidence = calculateConfidence(primaryData.score, supporting.length);
  
  // Generate detailed reasoning
  const reasoning = generateDetailedReasoning(primaryId, primaryData, analysis);
  
  // Find alternatives
  const alternatives = sortedAgents
    .slice(1, 4)
    .map(([agentId, agentData]) => ({
      agent: agentId,
      confidence: agentData.score,
      tradeoffs: generateTradeoffs(agentId, primaryId, analysis),
      strengths: agentData.factors.filter(f => f.startsWith('domain:') || f.startsWith('capability:')).join(', ')
    }));
  
  return {
    primaryAgent: {
      name: primaryId,
      matchScore: primaryData.score,
      capabilities: primaryData.metadata.capabilities.map(c => c.split(':')[0]),
      matchFactors: primaryData.factors
    },
    supportingAgents: supporting,
    confidence,
    reasoning,
    alternativeRoutes: alternatives,
    flags: {
      autoRoute: confidence > 0.7,
      allowOverride: true
    },
    analysisDetails: {
      domains: analysis.domains,
      technologies: analysis.technologies,
      complexity: analysis.complexity,
      taskType: analysis.taskType
    }
  };
}

function generateDetailedReasoning(agentId, agentData, analysis) {
  const metadata = agentData.metadata;
  const factors = agentData.factors;
  
  let reasoning = `${metadata.name} (${metadata.role}) is the best choice with ${Math.round(agentData.score * 100)}% match. `;
  
  // Add domain matches
  const domainMatches = factors.filter(f => f.startsWith('domain:')).map(f => f.split(':')[1]);
  if (domainMatches.length > 0) {
    reasoning += `Strong domain expertise in ${domainMatches.join(', ')}. `;
  }
  
  // Add capability matches
  const capMatches = factors.filter(f => f.startsWith('capability:'));
  if (capMatches.length > 0) {
    reasoning += `Has ${capMatches.length} matching capabilities at expert/advanced level. `;
  }
  
  // Add complexity assessment
  if (factors.includes('complexity:in-range')) {
    reasoning += `Task complexity (${analysis.complexity}/10) is within optimal range. `;
  }
  
  // Add pattern matches
  const patternMatches = factors.filter(f => f.startsWith('pattern:'));
  if (patternMatches.length > 0) {
    reasoning += `Request matches known patterns for this agent. `;
  }
  
  return reasoning;
}
```

## Helper Functions

### Capability Scoring

```javascript
function getCapabilityScore(level: string): number {
  const scores = {
    expert: 1.0,
    advanced: 0.8,
    intermediate: 0.6,
    novice: 0.4
  };
  return scores[level] || 0.5;
}
```

### Complexity Handling

```javascript
function canHandleComplexity(agent: string, complexity: number): boolean {
  const complexityThresholds = {
    "bmad-master": 10,
    winston: 9,
    james: 8,
    elena: 7,
    marcus: 8,
    john: 7,
    sarah: 6,
    bob: 6,
    sally: 7,
    pixel: 6
  };
  return complexity <= (complexityThresholds[agent] || 5);
}
```

### Helper Function Updates

```javascript
// Import helper functions from smart-router-helpers.md
const { 
  calculateConfidence,
  generateTradeoffs,
  determineRole,
  countComplexityKeywords,
  estimateDuration
} = require('./smart-router-helpers');

// Additional helper for getting agent capabilities in simple format
function getAgentTopCapabilities(agentId) {
  const metadata = getAgentMetadata(agentId);
  if (!metadata) return ['general-support'];
  
  return metadata.capabilities
    .filter(cap => cap.includes(':expert') || cap.includes(':advanced'))
    .map(cap => cap.split(':')[0])
    .slice(0, 3);
}
```

## Usage Example

```javascript
// Analyze a task request
const request = "Design a scalable microservices architecture for our e-commerce platform using AWS";
const analysis = analyzeTask(request);

// Get routing decision
const decision = matchAgents(analysis);

// Output routing decision
console.log(`
Routing Decision:
- Primary Agent: ${decision.primaryAgent.name} (${Math.round(decision.confidence * 100)}% confidence)
- Supporting: ${decision.supportingAgents.map(a => a.name).join(", ")}
- Reasoning: ${decision.reasoning}
`);
```

## Feature Flag Integration

The Smart Router uses the centralized feature flag system from `.claude/lib/feature-flags.md`:

```javascript
// Import feature flag functions
const { isFeatureEnabled, getFeatureConfig } = require('./feature-flags');

// Check if smart routing is enabled
function isSmartRoutingEnabled() {
  return isFeatureEnabled('SMART_ROUTING');
}

// Get routing configuration
function getRoutingConfig() {
  return getFeatureConfig('SMART_ROUTING');
}

// Example usage in routing logic
function performRouting(request) {
  if (!isSmartRoutingEnabled()) {
    console.log("Smart routing is disabled. Using default routing.");
    return getDefaultRouting();
  }
  
  const config = getRoutingConfig();
  
  if (config.ROUTING_PREVIEW_MODE) {
    console.log("PREVIEW MODE: Showing routing decision without executing");
  }
  
  // Continue with smart routing...
  const analysis = analyzeTask(request);
  const decision = matchAgents(analysis);
  
  if (config.ALLOW_MANUAL_OVERRIDE) {
    decision.flags.allowOverride = true;
  }
  
  if (decision.confidence >= config.AUTO_ROUTE_THRESHOLD) {
    decision.flags.autoRoute = true;
  }
  
  return decision;
}
```

## Agent Registry

The router dynamically loads agent capabilities from their metadata:

```javascript
function loadAgentCapabilities() {
  const agents = [
    'winston', 'james', 'elena', 'marcus', 'john', 
    'sarah', 'bob', 'sally', 'pixel', 'bmad-master'
  ];
  
  const registry = {};
  
  for (const agentId of agents) {
    // In practice, this would load from the agent's capability_metadata
    // For now, we'll use a structured representation
    registry[agentId] = getAgentMetadata(agentId);
  }
  
  return registry;
}

function getAgentMetadata(agentId) {
  // This maps to the capability_metadata we added to each agent
  const metadata = {
    winston: {
      name: "Winston",
      role: "System Architect",
      domains: ['architecture', 'system_design', 'scalability', 'devops'],
      capabilities: [
        'architecture-design:expert', 'system-design:expert',
        'scalability-planning:expert', 'pattern-recognition:expert'
      ],
      complexityRange: [6, 10],
      strongPatterns: ['system architecture', 'design pattern', 'scalability']
    },
    james: {
      name: "James",
      role: "Senior Developer",
      domains: ['implementation', 'debugging', 'frontend', 'backend'],
      capabilities: [
        'implementation:expert', 'code-quality:expert',
        'refactoring:expert', 'debugging:expert'
      ],
      complexityRange: [3, 8],
      strongPatterns: ['implement feature', 'build component', 'fix bug']
    },
    elena: {
      name: "Elena",
      role: "QA Lead",
      domains: ['testing', 'quality_assurance', 'automation'],
      capabilities: [
        'testing-strategy:expert', 'qa-automation:expert',
        'user-validation:expert', 'defect-prevention:advanced'
      ],
      complexityRange: [3, 8],
      strongPatterns: ['test strategy', 'quality assurance', 'automated testing']
    },
    marcus: {
      name: "Marcus",
      role: "Security Expert",
      domains: ['security', 'compliance', 'authentication'],
      capabilities: [
        'security-audit:expert', 'compliance:expert',
        'threat-modeling:expert', 'vulnerability-assessment:expert'
      ],
      complexityRange: [5, 9],
      strongPatterns: ['security audit', 'vulnerability', 'compliance check']
    },
    john: {
      name: "John",
      role: "Product Manager",
      domains: ['planning', 'product_management', 'requirements'],
      capabilities: [
        'product-planning:expert', 'requirements-analysis:expert',
        'roadmapping:expert', 'stakeholder-management:expert'
      ],
      complexityRange: [4, 8],
      strongPatterns: ['product roadmap', 'feature planning', 'requirements']
    },
    sarah: {
      name: "Sarah",
      role: "Product Owner",
      domains: ['product_ownership', 'user_stories', 'prioritization'],
      capabilities: [
        'user-stories:expert', 'prioritization:expert',
        'validation:expert', 'backlog-management:expert'
      ],
      complexityRange: [3, 7],
      strongPatterns: ['user story', 'acceptance criteria', 'sprint planning']
    },
    bob: {
      name: "Bob",
      role: "Scrum Master",
      domains: ['scrum', 'process_facilitation', 'task_breakdown'],
      capabilities: [
        'scrum-process:expert', 'task-breakdown:expert',
        'team-coordination:expert', 'sprint-planning:expert'
      ],
      complexityRange: [3, 7],
      strongPatterns: ['sprint planning', 'task breakdown', 'scrum process']
    },
    sally: {
      name: "Sally",
      role: "UX Designer",
      domains: ['ui', 'user_experience', 'design_systems'],
      capabilities: [
        'ux-design:expert', 'ui-patterns:expert',
        'user-research:expert', 'visual-design:advanced'
      ],
      complexityRange: [4, 8],
      strongPatterns: ['ui design', 'user experience', 'mockup', 'design system']
    },
    pixel: {
      name: "Pixel",
      role: "UI Healer",
      domains: ['ui_quality', 'visual_testing', 'ui_healing'],
      capabilities: [
        'ui-quality:expert', 'visual-testing:expert',
        'style-compliance:expert', 'ui-healing:expert'
      ],
      complexityRange: [3, 7],
      strongPatterns: ['ui quality', 'visual testing', 'pixel perfect']
    },
    'bmad-master': {
      name: "BMad Master",
      role: "Meta-Orchestrator",
      domains: ['orchestration', 'meta_analysis', 'workflow_design'],
      capabilities: [
        'orchestration:expert', 'meta-analysis:expert',
        'workflow-design:expert', 'cross-domain-execution:expert'
      ],
      complexityRange: [5, 10],
      strongPatterns: ['orchestrate workflow', 'complex task', 'coordinate agents']
    }
  };
  
  return metadata[agentId] || null;
}
```

## Error Handling

```javascript
function safeRoute(request: string): RoutingDecision {
  try {
    if (!isSmartRoutingEnabled()) {
      return getDefaultRouting();
    }
    
    const config = getRoutingConfig();
    const analysis = analyzeTask(request);
    const decision = matchAgents(analysis);
    
    // Validate decision
    if (!decision.primaryAgent.name) {
      throw new Error("No suitable agent found");
    }
    
    // Apply feature flag configurations
    if (config.ALLOW_MANUAL_OVERRIDE) {
      decision.flags.allowOverride = true;
    }
    
    if (decision.confidence >= config.AUTO_ROUTE_THRESHOLD) {
      decision.flags.autoRoute = true;
    }
    
    return decision;
  } catch (error) {
    console.error("Routing error:", error);
    return getFallbackRouting();
  }
}
```

## Integration Points

This router integrates with:
1. **Command System**: Via `/baco route` command
2. **Workflow Engine**: For automatic task distribution
3. **Analytics System**: For tracking routing effectiveness
4. **Agent System**: For capability updates

## Best Practices

1. **Keep It Simple**: Start with basic matching, enhance over time
2. **Explain Decisions**: Always provide clear reasoning
3. **Allow Override**: Users should always have final say
4. **Track Success**: Monitor if routed agents complete tasks successfully
5. **Update Capabilities**: Keep agent capabilities current with their growth

This Smart Router enables intelligent, transparent task distribution while maintaining user control and system flexibility.