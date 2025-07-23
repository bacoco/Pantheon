# Workflow Engine - Smart Routing Integration

This extension adds Smart Routing capabilities to the Workflow Engine, enabling dynamic agent selection based on task requirements.

## ACTIVATION

When this integration is active, workflows can use smart routing to dynamically select the best agents for each step instead of hardcoding agent assignments.

## Integration Points

### 1. Workflow Step Enhancement

```typescript
interface SmartRoutingStep extends WorkflowStep {
  agent: AgentId | 'auto-route'; // Allow 'auto-route' as special value
  routingHint?: {
    taskDescription?: string;
    preferredDomains?: string[];
    requiredCapabilities?: string[];
    complexity?: number;
  };
  routingDecision?: RoutingDecision; // Populated after routing
}
```

### 2. Workflow Creation with Smart Routing

```javascript
async function createWorkflowWithRouting(name: string): Promise<Workflow> {
  const { isFeatureEnabled } = require('./feature-flags');
  const useSmartRouting = isFeatureEnabled('SMART_ROUTING');
  
  console.log(`Creating workflow: ${name}`);
  if (useSmartRouting) {
    console.log("✨ Smart Routing is enabled - agents can be auto-selected");
  }
  
  const workflow = {
    id: generateId(),
    name,
    steps: []
  };
  
  while (true) {
    const stepType = await select('Step type:', [
      'manual-agent-selection',
      useSmartRouting ? 'auto-route-agent' : null,
      'done'
    ].filter(Boolean));
    
    if (stepType === 'done') break;
    
    if (stepType === 'auto-route-agent') {
      const step = await createAutoRoutedStep();
      workflow.steps.push(step);
    } else {
      const step = await createManualStep();
      workflow.steps.push(step);
    }
  }
  
  return workflow;
}
```

### 3. Auto-Routed Step Creation

```javascript
async function createAutoRoutedStep(): Promise<SmartRoutingStep> {
  const taskDescription = await prompt('Describe the task for this step:');
  const complexity = await select('Task complexity:', [
    { label: 'Simple (1-3)', value: 2 },
    { label: 'Moderate (4-6)', value: 5 },
    { label: 'Complex (7-8)', value: 7 },
    { label: 'Very Complex (9-10)', value: 9 }
  ]);
  
  // Perform routing analysis
  const { analyzeTask } = require('./task-analyzer');
  const { matchAgents } = require('./smart-router');
  
  const analysis = analyzeTask(taskDescription);
  analysis.complexity = complexity;
  
  const routingDecision = matchAgents(analysis);
  
  // Show routing preview
  console.log('\n🎯 Smart Routing Analysis:');
  console.log(`Primary Agent: ${routingDecision.primaryAgent.name} (${Math.round(routingDecision.confidence * 100)}% confidence)`);
  
  if (routingDecision.supportingAgents.length > 0) {
    console.log('Supporting Agents:', routingDecision.supportingAgents.map(a => a.name).join(', '));
  }
  
  const acceptRouting = await confirm('Accept this routing?');
  
  if (!acceptRouting) {
    // Fall back to manual selection
    return createManualStep();
  }
  
  return {
    id: generateId(),
    agent: routingDecision.primaryAgent.name,
    action: await prompt('Action name:'),
    routingHint: {
      taskDescription,
      preferredDomains: analysis.domains,
      requiredCapabilities: analysis.requiredCapabilities,
      complexity
    },
    routingDecision,
    dependencies: []
  };
}
```

### 4. Runtime Agent Resolution

```javascript
class SmartRoutingWorkflowEngine extends WorkflowEngine {
  
  async resolveAgent(step: SmartRoutingStep, context: WorkflowContext): Promise<AgentId> {
    // If agent is already specified, use it
    if (step.agent !== 'auto-route') {
      return step.agent;
    }
    
    // Check if routing is enabled
    const { isFeatureEnabled, getFeatureConfig } = require('./feature-flags');
    if (!isFeatureEnabled('SMART_ROUTING')) {
      console.warn('Smart Routing disabled, using default agent');
      return 'baco-master';
    }
    
    const config = getFeatureConfig('SMART_ROUTING');
    
    // Build task description from step context
    const taskDescription = step.routingHint?.taskDescription || 
                          `${step.action} for ${context.project.name}`;
    
    // Analyze and route
    const { analyzeTask } = require('./task-analyzer');
    const { matchAgents } = require('./smart-router');
    
    const analysis = analyzeTask(taskDescription);
    
    // Override with hints if provided
    if (step.routingHint) {
      if (step.routingHint.complexity) {
        analysis.complexity = step.routingHint.complexity;
      }
      if (step.routingHint.preferredDomains) {
        analysis.domains = [...new Set([...analysis.domains, ...step.routingHint.preferredDomains])];
      }
      if (step.routingHint.requiredCapabilities) {
        analysis.requiredCapabilities = [...new Set([...analysis.requiredCapabilities, ...step.routingHint.requiredCapabilities])];
      }
    }
    
    const routingDecision = matchAgents(analysis);
    
    // Store routing decision for audit
    step.routingDecision = routingDecision;
    
    // Log routing decision
    console.log(`\n🎯 Auto-routing step "${step.id}" to ${routingDecision.primaryAgent.name}`);
    console.log(`Confidence: ${Math.round(routingDecision.confidence * 100)}%`);
    console.log(`Reasoning: ${routingDecision.reasoning}`);
    
    // Check if we should auto-accept
    if (config.AUTO_ROUTE_THRESHOLD && routingDecision.confidence >= config.AUTO_ROUTE_THRESHOLD) {
      return routingDecision.primaryAgent.name;
    }
    
    // Otherwise, ask for confirmation
    if (!config.ROUTING_PREVIEW_MODE) {
      const accept = await confirm(`Route to ${routingDecision.primaryAgent.name}?`);
      if (!accept) {
        // Allow manual override
        const agents = ['winston', 'james', 'elena', 'marcus', 'john', 'sarah', 'bob', 'sally', 'baco-master'];
        return await select('Select agent manually:', agents);
      }
    }
    
    return routingDecision.primaryAgent.name;
  }
  
  async executeStep(step: SmartRoutingStep, context: WorkflowContext): Promise<StepResult> {
    // Resolve agent if needed
    const agentId = await this.resolveAgent(step, context);
    
    // Update step with resolved agent
    const resolvedStep = { ...step, agent: agentId };
    
    // Execute with resolved agent
    return super.executeStep(resolvedStep, context);
  }
}
```

### 5. Pre-defined Workflows with Smart Routing

```javascript
const smartRoutingWorkflows = {
  'adaptive-feature-development': {
    name: 'Adaptive Feature Development',
    description: 'Feature development with dynamic agent selection based on requirements',
    steps: [
      {
        id: 'analyze-requirements',
        agent: 'auto-route',
        action: 'analyzeRequirements',
        routingHint: {
          taskDescription: 'Analyze and break down feature requirements',
          preferredDomains: ['planning', 'analysis']
        },
        inputs: [{ type: 'user-input', name: 'featureDescription' }],
        outputs: [{ type: 'artifact', name: 'requirements', path: 'docs/requirements.md' }]
      },
      {
        id: 'design-solution',
        agent: 'auto-route',
        action: 'designSolution',
        routingHint: {
          taskDescription: 'Design technical solution based on requirements',
          preferredDomains: ['architecture', 'design']
        },
        inputs: [{ type: 'artifact', name: 'requirements', from: 'analyze-requirements' }],
        outputs: [{ type: 'artifact', name: 'design', path: 'docs/design.md' }],
        dependencies: ['analyze-requirements']
      },
      {
        id: 'implement-solution',
        agent: 'auto-route',
        action: 'implementSolution',
        routingHint: {
          taskDescription: 'Implement the designed solution',
          preferredDomains: ['implementation']
        },
        inputs: [
          { type: 'artifact', name: 'design', from: 'design-solution' },
          { type: 'artifact', name: 'requirements', from: 'analyze-requirements' }
        ],
        outputs: [{ type: 'code', name: 'implementation', path: 'src/*' }],
        dependencies: ['design-solution']
      },
      {
        id: 'test-solution',
        agent: 'auto-route',
        action: 'testSolution',
        routingHint: {
          taskDescription: 'Create and execute comprehensive tests',
          preferredDomains: ['testing', 'quality_assurance']
        },
        inputs: [
          { type: 'code', name: 'implementation', from: 'implement-solution' },
          { type: 'artifact', name: 'requirements', from: 'analyze-requirements' }
        ],
        outputs: [
          { type: 'code', name: 'tests', path: 'tests/*' },
          { type: 'artifact', name: 'testReport', path: 'docs/test-report.md' }
        ],
        dependencies: ['implement-solution']
      }
    ]
  },
  
  'security-first-development': {
    name: 'Security-First Development',
    description: 'Development workflow that adapts based on security requirements',
    steps: [
      {
        id: 'security-assessment',
        agent: 'auto-route',
        action: 'assessSecurityRequirements',
        routingHint: {
          taskDescription: 'Assess security requirements and threat landscape',
          requiredCapabilities: ['security-audit', 'threat-modeling'],
          complexity: 7
        },
        inputs: [{ type: 'user-input', name: 'applicationDescription' }],
        outputs: [{ type: 'artifact', name: 'securityAssessment', path: 'docs/security/assessment.md' }]
      },
      {
        id: 'secure-architecture',
        agent: 'auto-route',
        action: 'designSecureArchitecture',
        routingHint: {
          taskDescription: 'Design architecture with security controls',
          preferredDomains: ['architecture', 'security'],
          complexity: 8
        },
        inputs: [{ type: 'artifact', name: 'securityAssessment', from: 'security-assessment' }],
        outputs: [{ type: 'artifact', name: 'secureArchitecture', path: 'docs/architecture/secure-design.md' }],
        dependencies: ['security-assessment']
      }
    ]
  }
};
```

### 6. Workflow Execution with Analytics

```javascript
class AnalyticsAwareWorkflowEngine extends SmartRoutingWorkflowEngine {
  
  async executeStep(step: SmartRoutingStep, context: WorkflowContext): Promise<StepResult> {
    const startTime = Date.now();
    
    // Execute step with smart routing
    const result = await super.executeStep(step, context);
    
    const endTime = Date.now();
    
    // Collect analytics if routing was used
    if (step.routingDecision) {
      const analytics = {
        workflowId: context.workflow.id,
        stepId: step.id,
        timestamp: new Date().toISOString(),
        routingUsed: true,
        selectedAgent: step.agent,
        confidence: step.routingDecision.confidence,
        executionTime: endTime - startTime,
        success: result.status === 'success',
        alternativeAgents: step.routingDecision.alternativeRoutes.map(r => r.agent)
      };
      
      // Log analytics (in practice, save to analytics service)
      console.log('📊 Routing Analytics:', analytics);
    }
    
    return result;
  }
}
```

### 7. Interactive Workflow Builder

```javascript
async function buildAdaptiveWorkflow(): Promise<Workflow> {
  console.log('\n🔧 Adaptive Workflow Builder');
  console.log('This builder uses Smart Routing to select the best agents for each task.\n');
  
  const workflowName = await prompt('Workflow name:');
  const workflowGoal = await prompt('What is the workflow trying to achieve?');
  
  const workflow = {
    id: generateId(),
    name: workflowName,
    description: workflowGoal,
    steps: []
  };
  
  console.log('\nDescribe each step of your workflow. Smart Routing will select appropriate agents.\n');
  
  let stepCount = 1;
  while (true) {
    console.log(`\nStep ${stepCount}:`);
    
    const addStep = await confirm('Add another step?');
    if (!addStep) break;
    
    const stepDescription = await prompt('What should this step accomplish?');
    
    // Analyze the step
    const { analyzeTask } = require('./task-analyzer');
    const { matchAgents } = require('./smart-router');
    
    const analysis = analyzeTask(stepDescription);
    const routing = matchAgents(analysis);
    
    console.log(`\n📊 Analysis: ${analysis.domains.join(', ')} | Complexity: ${analysis.complexity}/10`);
    console.log(`🎯 Recommended: ${routing.primaryAgent.name} (${Math.round(routing.confidence * 100)}%)`);
    
    const useRecommendation = await confirm('Use recommended agent?');
    
    const step = {
      id: `step-${stepCount}`,
      agent: useRecommendation ? routing.primaryAgent.name : 'auto-route',
      action: await prompt('Action name:'),
      routingHint: {
        taskDescription: stepDescription,
        preferredDomains: analysis.domains,
        complexity: analysis.complexity
      },
      dependencies: workflow.steps.length > 0 ? 
        await multiSelect('Dependencies:', workflow.steps.map(s => s.id)) : []
    };
    
    workflow.steps.push(step);
    stepCount++;
  }
  
  return workflow;
}
```

## Usage Examples

### 1. Creating an Adaptive Workflow

```javascript
// Start the adaptive workflow builder
const workflow = await buildAdaptiveWorkflow();

// Example interaction:
// > Workflow name: Feature Development
// > What is the workflow trying to achieve? Build a new user dashboard with real-time updates
// 
// > Step 1:
// > What should this step accomplish? Design the dashboard architecture
// > Analysis: architecture, ui | Complexity: 7/10
// > Recommended: Winston (85%)
// > Use recommended agent? Yes
// > Action name: designDashboardArchitecture
```

### 2. Executing with Smart Routing

```javascript
const engine = new AnalyticsAwareWorkflowEngine();
const context = createWorkflowContext(project);

// Execute workflow - agents are selected dynamically
await engine.executeWorkflow(adaptiveWorkflow, context);
```

### 3. Monitoring Routing Decisions

```javascript
// View routing decisions for a workflow execution
const routingReport = engine.getRoutingReport(workflowId);

console.log('Routing Decisions:');
routingReport.forEach(decision => {
  console.log(`Step: ${decision.stepId}`);
  console.log(`  Selected: ${decision.selectedAgent} (${decision.confidence}%)`);
  console.log(`  Alternatives: ${decision.alternatives.join(', ')}`);
  console.log(`  Execution Time: ${decision.executionTime}ms`);
});
```

## Configuration Options

```javascript
const ROUTING_CONFIG = {
  // Enable smart routing in workflows
  ENABLE_WORKFLOW_ROUTING: true,
  
  // Confidence threshold for auto-acceptance
  WORKFLOW_ROUTE_THRESHOLD: 0.75,
  
  // Allow manual override during execution
  ALLOW_EXECUTION_OVERRIDE: true,
  
  // Collect routing analytics
  WORKFLOW_ANALYTICS_ENABLED: true,
  
  // Cache routing decisions for similar steps
  CACHE_ROUTING_DECISIONS: true,
  
  // Maximum cache age (ms)
  ROUTING_CACHE_TTL: 3600000 // 1 hour
};
```

## Benefits

1. **Dynamic Adaptation**: Workflows adapt to changing requirements
2. **Optimal Agent Selection**: Always use the best agent for each task
3. **Reduced Configuration**: Less hardcoding of agent assignments
4. **Learning Opportunity**: Analytics help improve routing over time
5. **Flexibility**: Mix manual and automatic agent selection

## Migration Guide

To migrate existing workflows to use smart routing:

1. Identify steps that could benefit from dynamic routing
2. Replace hardcoded agent assignments with 'auto-route'
3. Add routing hints to guide the selection
4. Test with preview mode enabled
5. Monitor analytics to verify improvements

This integration enables workflows to be more intelligent and adaptive while maintaining full control and transparency in agent selection.