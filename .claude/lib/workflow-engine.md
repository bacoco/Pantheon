# Multi-Agent Workflow Engine for BACO

This library enables orchestrated multi-agent workflows where agents collaborate to complete complex tasks.

## Overview

The workflow engine coordinates multiple agents working together, managing handoffs, context preservation, and parallel execution when possible.

## Workflow Architecture

### Core Components

```typescript
interface Workflow {
  id: string;
  name: string;
  description: string;
  agents: AgentRole[];
  steps: WorkflowStep[];
  context: WorkflowContext;
  state: WorkflowState;
}

interface WorkflowStep {
  id: string;
  agent: AgentId;
  action: string;
  inputs: StepInput[];
  outputs: StepOutput[];
  dependencies: string[]; // Step IDs this depends on
  parallel?: boolean; // Can run in parallel with siblings
  condition?: StepCondition;
}

interface WorkflowContext {
  project: ProjectInfo;
  artifacts: Map<string, Artifact>;
  decisions: Decision[];
  constraints: Constraint[];
  sharedMemory: Map<string, any>;
}

interface WorkflowState {
  status: 'pending' | 'running' | 'completed' | 'failed' | 'paused';
  currentSteps: string[];
  completedSteps: string[];
  errors: WorkflowError[];
  startTime?: Date;
  endTime?: Date;
}
```

## Pre-Defined Workflows

### 1. Product Planning Workflow (PM → PO → SM)

```typescript
const productPlanningWorkflow: Workflow = {
  id: 'product-planning',
  name: 'Product Planning Workflow',
  description: 'From product vision to sprint-ready stories',
  agents: ['john', 'sarah', 'bob'],
  steps: [
    {
      id: 'create-prd',
      agent: 'john',
      action: 'generatePRD',
      inputs: [
        { type: 'user-input', name: 'productVision' },
        { type: 'user-input', name: 'marketResearch' }
      ],
      outputs: [
        { type: 'artifact', name: 'prd', path: 'docs/product/prd.md' }
      ],
      dependencies: []
    },
    {
      id: 'create-roadmap',
      agent: 'john',
      action: 'generateRoadmap',
      inputs: [
        { type: 'artifact', name: 'prd', from: 'create-prd' }
      ],
      outputs: [
        { type: 'artifact', name: 'roadmap', path: 'docs/product/roadmap.md' }
      ],
      dependencies: ['create-prd']
    },
    {
      id: 'create-user-stories',
      agent: 'sarah',
      action: 'generateUserStories',
      inputs: [
        { type: 'artifact', name: 'prd', from: 'create-prd' },
        { type: 'artifact', name: 'roadmap', from: 'create-roadmap' }
      ],
      outputs: [
        { type: 'artifacts', name: 'userStories', path: 'docs/stories/*.md' }
      ],
      dependencies: ['create-roadmap']
    },
    {
      id: 'validate-stories',
      agent: 'sarah',
      action: 'validateStories',
      inputs: [
        { type: 'artifacts', name: 'userStories', from: 'create-user-stories' }
      ],
      outputs: [
        { type: 'artifact', name: 'validationReport', path: 'docs/validation/report.md' }
      ],
      dependencies: ['create-user-stories']
    },
    {
      id: 'prepare-ai-stories',
      agent: 'bob',
      action: 'createAIReadyStories',
      inputs: [
        { type: 'artifacts', name: 'userStories', from: 'create-user-stories' },
        { type: 'artifact', name: 'validationReport', from: 'validate-stories' }
      ],
      outputs: [
        { type: 'artifacts', name: 'aiStories', path: 'docs/stories/ai-ready/*.md' }
      ],
      dependencies: ['validate-stories']
    },
    {
      id: 'create-sprint-plan',
      agent: 'bob',
      action: 'generateSprintPlan',
      inputs: [
        { type: 'artifacts', name: 'aiStories', from: 'prepare-ai-stories' },
        { type: 'user-input', name: 'teamCapacity' }
      ],
      outputs: [
        { type: 'artifact', name: 'sprintPlan', path: 'docs/sprints/sprint-plan.md' }
      ],
      dependencies: ['prepare-ai-stories']
    }
  ],
  context: {
    project: {},
    artifacts: new Map(),
    decisions: [],
    constraints: [],
    sharedMemory: new Map()
  },
  state: {
    status: 'pending',
    currentSteps: [],
    completedSteps: [],
    errors: []
  }
};
```

### 2. Implementation Workflow (Architect → Developer → QA)

```typescript
const implementationWorkflow: Workflow = {
  id: 'implementation',
  name: 'Implementation Workflow',
  description: 'From architecture to tested implementation',
  agents: ['winston', 'james', 'elena'],
  steps: [
    {
      id: 'design-architecture',
      agent: 'winston',
      action: 'generateSystemDesign',
      inputs: [
        { type: 'artifact', name: 'requirements', path: 'docs/requirements.md' },
        { type: 'user-input', name: 'technicalConstraints' }
      ],
      outputs: [
        { type: 'artifact', name: 'systemDesign', path: 'docs/architecture/system-design.md' },
        { type: 'artifact', name: 'adr', path: 'docs/architecture/decisions/*.md' }
      ],
      dependencies: []
    },
    {
      id: 'security-review',
      agent: 'marcus',
      action: 'securityAssessment',
      inputs: [
        { type: 'artifact', name: 'systemDesign', from: 'design-architecture' }
      ],
      outputs: [
        { type: 'artifact', name: 'threatModel', path: 'docs/security/threat-model.md' }
      ],
      dependencies: ['design-architecture'],
      parallel: true
    },
    {
      id: 'implement-feature',
      agent: 'james',
      action: 'implementFeature',
      inputs: [
        { type: 'artifact', name: 'systemDesign', from: 'design-architecture' },
        { type: 'artifact', name: 'aiStory', path: 'docs/stories/ai-ready/current.md' }
      ],
      outputs: [
        { type: 'code', name: 'implementation', path: 'src/features/*' }
      ],
      dependencies: ['design-architecture']
    },
    {
      id: 'apply-security',
      agent: 'marcus',
      action: 'implementSecurityMeasures',
      inputs: [
        { type: 'code', name: 'implementation', from: 'implement-feature' },
        { type: 'artifact', name: 'threatModel', from: 'security-review' }
      ],
      outputs: [
        { type: 'code', name: 'secureImplementation', path: 'src/features/*' }
      ],
      dependencies: ['implement-feature', 'security-review']
    },
    {
      id: 'create-test-plan',
      agent: 'elena',
      action: 'generateTestPlan',
      inputs: [
        { type: 'artifact', name: 'systemDesign', from: 'design-architecture' },
        { type: 'artifact', name: 'aiStory', path: 'docs/stories/ai-ready/current.md' }
      ],
      outputs: [
        { type: 'artifact', name: 'testPlan', path: 'docs/test/test-plan.md' }
      ],
      dependencies: ['design-architecture'],
      parallel: true
    },
    {
      id: 'implement-tests',
      agent: 'elena',
      action: 'generateTests',
      inputs: [
        { type: 'code', name: 'secureImplementation', from: 'apply-security' },
        { type: 'artifact', name: 'testPlan', from: 'create-test-plan' }
      ],
      outputs: [
        { type: 'code', name: 'tests', path: 'src/__tests__/*' },
        { type: 'artifact', name: 'testReport', path: 'docs/test/report.md' }
      ],
      dependencies: ['apply-security', 'create-test-plan']
    }
  ],
  context: {
    project: {},
    artifacts: new Map(),
    decisions: [],
    constraints: [],
    sharedMemory: new Map()
  },
  state: {
    status: 'pending',
    currentSteps: [],
    completedSteps: [],
    errors: []
  }
};
```

### 3. UI Feature Workflow (UX → Developer → QA)

```typescript
const uiFeatureWorkflow: Workflow = {
  id: 'ui-feature',
  name: 'UI Feature Workflow',
  description: 'From design to implemented UI component',
  agents: ['sally', 'james', 'elena'],
  steps: [
    {
      id: 'design-component',
      agent: 'sally',
      action: 'generateComponentSpec',
      inputs: [
        { type: 'artifact', name: 'userStory', path: 'docs/stories/current.md' },
        { type: 'user-input', name: 'designRequirements' }
      ],
      outputs: [
        { type: 'artifact', name: 'componentSpec', path: 'docs/design/components/*.md' },
        { type: 'artifact', name: 'designTokens', path: 'docs/design/tokens.md' }
      ],
      dependencies: []
    },
    {
      id: 'create-design-system',
      agent: 'sally',
      action: 'updateDesignSystem',
      inputs: [
        { type: 'artifact', name: 'componentSpec', from: 'design-component' }
      ],
      outputs: [
        { type: 'artifact', name: 'designSystem', path: 'docs/design-system/*.md' }
      ],
      dependencies: ['design-component']
    },
    {
      id: 'implement-component',
      agent: 'james',
      action: 'implementUIComponent',
      inputs: [
        { type: 'artifact', name: 'componentSpec', from: 'design-component' },
        { type: 'artifact', name: 'designTokens', from: 'design-component' }
      ],
      outputs: [
        { type: 'code', name: 'component', path: 'src/components/*' },
        { type: 'code', name: 'styles', path: 'src/styles/*' }
      ],
      dependencies: ['design-component']
    },
    {
      id: 'accessibility-review',
      agent: 'sally',
      action: 'accessibilityAudit',
      inputs: [
        { type: 'code', name: 'component', from: 'implement-component' }
      ],
      outputs: [
        { type: 'artifact', name: 'a11yReport', path: 'docs/accessibility/report.md' }
      ],
      dependencies: ['implement-component'],
      parallel: true
    },
    {
      id: 'create-ui-tests',
      agent: 'elena',
      action: 'generateUITests',
      inputs: [
        { type: 'code', name: 'component', from: 'implement-component' },
        { type: 'artifact', name: 'componentSpec', from: 'design-component' }
      ],
      outputs: [
        { type: 'code', name: 'componentTests', path: 'src/__tests__/components/*' },
        { type: 'code', name: 'e2eTests', path: 'cypress/e2e/*' }
      ],
      dependencies: ['implement-component']
    },
    {
      id: 'visual-regression',
      agent: 'elena',
      action: 'visualRegressionTests',
      inputs: [
        { type: 'code', name: 'component', from: 'implement-component' },
        { type: 'artifact', name: 'componentSpec', from: 'design-component' }
      ],
      outputs: [
        { type: 'artifact', name: 'visualReport', path: 'docs/test/visual-report.md' }
      ],
      dependencies: ['implement-component'],
      parallel: true
    }
  ],
  context: {
    project: {},
    artifacts: new Map(),
    decisions: [],
    constraints: [],
    sharedMemory: new Map()
  },
  state: {
    status: 'pending',
    currentSteps: [],
    completedSteps: [],
    errors: []
  }
};
```

### 4. Security-First Development Workflow (Security → Developer)

```typescript
const securityDevelopmentWorkflow: Workflow = {
  id: 'security-development',
  name: 'Security-First Development Workflow',
  description: 'Implement features with security built-in from the start',
  agents: ['marcus', 'james'],
  steps: [
    {
      id: 'threat-modeling',
      agent: 'marcus',
      action: 'threatModeling',
      inputs: [
        { type: 'artifact', name: 'requirements', path: 'docs/requirements.md' },
        { type: 'user-input', name: 'attackVectors' }
      ],
      outputs: [
        { type: 'artifact', name: 'threatModel', path: 'docs/security/threat-model.md' },
        { type: 'artifact', name: 'securityRequirements', path: 'docs/security/requirements.md' }
      ],
      dependencies: []
    },
    {
      id: 'security-architecture',
      agent: 'marcus',
      action: 'securityArchitecture',
      inputs: [
        { type: 'artifact', name: 'threatModel', from: 'threat-modeling' }
      ],
      outputs: [
        { type: 'artifact', name: 'securityArchitecture', path: 'docs/security/architecture.md' },
        { type: 'artifact', name: 'securityControls', path: 'docs/security/controls.md' }
      ],
      dependencies: ['threat-modeling']
    },
    {
      id: 'secure-implementation-guide',
      agent: 'marcus',
      action: 'createSecureImplementationGuide',
      inputs: [
        { type: 'artifact', name: 'securityArchitecture', from: 'security-architecture' },
        { type: 'artifact', name: 'requirements', path: 'docs/requirements.md' }
      ],
      outputs: [
        { type: 'artifact', name: 'implementationGuide', path: 'docs/security/implementation-guide.md' },
        { type: 'artifact', name: 'securityChecklist', path: 'docs/security/checklist.md' }
      ],
      dependencies: ['security-architecture']
    },
    {
      id: 'implement-with-security',
      agent: 'james',
      action: 'implementSecureFeature',
      inputs: [
        { type: 'artifact', name: 'implementationGuide', from: 'secure-implementation-guide' },
        { type: 'artifact', name: 'securityControls', from: 'security-architecture' },
        { type: 'artifact', name: 'requirements', path: 'docs/requirements.md' }
      ],
      outputs: [
        { type: 'code', name: 'secureImplementation', path: 'src/features/*' },
        { type: 'artifact', name: 'implementationNotes', path: 'docs/implementation-notes.md' }
      ],
      dependencies: ['secure-implementation-guide']
    },
    {
      id: 'security-validation',
      agent: 'marcus',
      action: 'validateSecureImplementation',
      inputs: [
        { type: 'code', name: 'secureImplementation', from: 'implement-with-security' },
        { type: 'artifact', name: 'securityChecklist', from: 'secure-implementation-guide' }
      ],
      outputs: [
        { type: 'artifact', name: 'securityValidation', path: 'docs/security/validation-report.md' },
        { type: 'artifact', name: 'remediationTasks', path: 'docs/security/remediation.md' }
      ],
      dependencies: ['implement-with-security']
    },
    {
      id: 'apply-remediations',
      agent: 'james',
      action: 'applySecurityRemediations',
      inputs: [
        { type: 'artifact', name: 'remediationTasks', from: 'security-validation' },
        { type: 'code', name: 'secureImplementation', from: 'implement-with-security' }
      ],
      outputs: [
        { type: 'code', name: 'finalImplementation', path: 'src/features/*' },
        { type: 'artifact', name: 'completionReport', path: 'docs/security/completion-report.md' }
      ],
      dependencies: ['security-validation'],
      condition: {
        type: 'if-exists',
        check: 'remediationTasks'
      }
    }
  ],
  context: {
    project: {},
    artifacts: new Map(),
    decisions: [],
    constraints: [],
    sharedMemory: new Map()
  },
  state: {
    status: 'pending',
    currentSteps: [],
    completedSteps: [],
    errors: []
  }
};
```

## Workflow Execution Engine

### Core Execution Logic

```typescript
export class WorkflowEngine {
  private workflows: Map<string, Workflow> = new Map();
  private agents: Map<string, Agent> = new Map();
  private eventEmitter: EventEmitter = new EventEmitter();

  constructor(private storage: WorkflowStorage) {
    this.initializeWorkflows();
    this.loadAgents();
  }

  async executeWorkflow(
    workflowId: string,
    inputs: WorkflowInputs
  ): Promise<WorkflowResult> {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) {
      throw new Error(`Workflow ${workflowId} not found`);
    }

    // Initialize workflow state
    workflow.state.status = 'running';
    workflow.state.startTime = new Date();
    
    // Set initial inputs
    this.initializeContext(workflow, inputs);

    try {
      // Execute workflow steps
      await this.executeSteps(workflow);
      
      // Mark as completed
      workflow.state.status = 'completed';
      workflow.state.endTime = new Date();
      
      return {
        success: true,
        artifacts: workflow.context.artifacts,
        duration: workflow.state.endTime.getTime() - workflow.state.startTime.getTime()
      };
    } catch (error) {
      workflow.state.status = 'failed';
      workflow.state.errors.push({
        step: workflow.state.currentSteps[0],
        error: error.message,
        timestamp: new Date()
      });
      
      throw error;
    }
  }

  private async executeSteps(workflow: Workflow): Promise<void> {
    const executionPlan = this.createExecutionPlan(workflow);
    
    for (const phase of executionPlan) {
      // Execute parallel steps
      if (phase.length > 1) {
        await this.executeParallelSteps(workflow, phase);
      } else {
        await this.executeStep(workflow, phase[0]);
      }
    }
  }

  private async executeStep(
    workflow: Workflow,
    stepId: string
  ): Promise<void> {
    const step = workflow.steps.find(s => s.id === stepId);
    if (!step) throw new Error(`Step ${stepId} not found`);

    // Update current step
    workflow.state.currentSteps = [stepId];
    
    // Emit step started event
    this.eventEmitter.emit('step:started', { workflow, step });

    // Get agent
    const agent = this.agents.get(step.agent);
    if (!agent) throw new Error(`Agent ${step.agent} not found`);

    // Prepare inputs
    const inputs = await this.prepareStepInputs(workflow, step);

    // Execute agent action
    const outputs = await this.executeAgentAction(
      agent,
      step.action,
      inputs,
      workflow.context
    );

    // Store outputs
    await this.storeStepOutputs(workflow, step, outputs);

    // Mark step completed
    workflow.state.completedSteps.push(stepId);
    workflow.state.currentSteps = [];

    // Emit step completed event
    this.eventEmitter.emit('step:completed', { workflow, step, outputs });
  }

  private async executeParallelSteps(
    workflow: Workflow,
    stepIds: string[]
  ): Promise<void> {
    workflow.state.currentSteps = stepIds;

    const promises = stepIds.map(stepId => 
      this.executeStep(workflow, stepId)
    );

    await Promise.all(promises);
  }

  private createExecutionPlan(workflow: Workflow): string[][] {
    const plan: string[][] = [];
    const completed = new Set<string>();
    const remaining = new Set(workflow.steps.map(s => s.id));

    while (remaining.size > 0) {
      const phase: string[] = [];

      for (const stepId of remaining) {
        const step = workflow.steps.find(s => s.id === stepId)!;
        
        // Check if all dependencies are completed
        const ready = step.dependencies.every(dep => completed.has(dep));
        
        if (ready) {
          phase.push(stepId);
        }
      }

      if (phase.length === 0) {
        throw new Error('Circular dependency detected in workflow');
      }

      // Remove from remaining and add to completed
      phase.forEach(id => {
        remaining.delete(id);
        completed.add(id);
      });

      plan.push(phase);
    }

    return plan;
  }

  private async executeAgentAction(
    agent: Agent,
    action: string,
    inputs: any,
    context: WorkflowContext
  ): Promise<any> {
    // Load agent with context
    const agentContext = {
      ...context,
      inputs,
      action
    };

    // Transform to agent persona
    await this.activateAgent(agent, agentContext);

    // Execute the specific action
    const result = await agent.execute(action, inputs);

    return result;
  }
}
```

## Workflow Context Management

### Context Sharing Between Agents

```typescript
export class WorkflowContextManager {
  private contexts: Map<string, WorkflowContext> = new Map();

  preserveContext(
    fromStep: WorkflowStep,
    toStep: WorkflowStep,
    context: WorkflowContext
  ): void {
    // Extract relevant context for handoff
    const handoff: AgentHandoff = {
      fromAgent: fromStep.agent,
      toAgent: toStep.agent,
      artifacts: this.filterRelevantArtifacts(context.artifacts, toStep),
      decisions: this.filterRelevantDecisions(context.decisions, toStep),
      sharedMemory: new Map(context.sharedMemory),
      summary: this.generateHandoffSummary(fromStep, toStep, context)
    };

    // Store in context for next agent
    context.sharedMemory.set(`handoff_${toStep.id}`, handoff);
  }

  private generateHandoffSummary(
    fromStep: WorkflowStep,
    toStep: WorkflowStep,
    context: WorkflowContext
  ): string {
    return `
## Handoff from ${fromStep.agent} to ${toStep.agent}

### Completed Work
${this.summarizeStepOutputs(fromStep, context)}

### Key Decisions
${this.summarizeDecisions(context.decisions)}

### Constraints for Next Step
${this.summarizeConstraints(context.constraints)}

### Action Required
${this.describeNextAction(toStep)}
    `;
  }
}
```

## Workflow State Management

### State Persistence

```typescript
export class WorkflowStateManager {
  constructor(private storage: StateStorage) {}

  async saveState(workflow: Workflow): Promise<void> {
    const state = {
      id: workflow.id,
      state: workflow.state,
      context: this.serializeContext(workflow.context),
      timestamp: new Date()
    };

    await this.storage.save(`workflow_${workflow.id}`, state);
  }

  async loadState(workflowId: string): Promise<WorkflowState | null> {
    const saved = await this.storage.load(`workflow_${workflowId}`);
    if (!saved) return null;

    return {
      ...saved.state,
      context: this.deserializeContext(saved.context)
    };
  }

  async pauseWorkflow(workflow: Workflow): Promise<void> {
    workflow.state.status = 'paused';
    await this.saveState(workflow);
  }

  async resumeWorkflow(workflowId: string): Promise<Workflow> {
    const saved = await this.loadState(workflowId);
    if (!saved) throw new Error('No saved state found');

    const workflow = this.workflows.get(workflowId);
    workflow.state = saved.state;
    workflow.context = saved.context;
    workflow.state.status = 'running';

    return workflow;
  }
}
```

## Usage in BACO Commands

### Workflow Execution Command

```typescript
// In /orchestrate or /workflow command
async function executeWorkflow(workflowName: string, inputs: any) {
  const engine = new WorkflowEngine(storage);
  
  // Start workflow
  console.log(`Starting ${workflowName} workflow...`);
  
  // Subscribe to events
  engine.on('step:started', ({ step }) => {
    console.log(`✨ ${step.agent}: Starting ${step.action}`);
  });
  
  engine.on('step:completed', ({ step }) => {
    console.log(`✅ ${step.agent}: Completed ${step.action}`);
  });
  
  try {
    const result = await engine.executeWorkflow(workflowName, inputs);
    
    console.log(`\n✅ Workflow completed successfully!`);
    console.log(`Duration: ${result.duration}ms`);
    console.log(`Artifacts created: ${result.artifacts.size}`);
    
    // List created artifacts
    for (const [name, artifact] of result.artifacts) {
      console.log(`  - ${name}: ${artifact.path}`);
    }
  } catch (error) {
    console.error(`❌ Workflow failed: ${error.message}`);
  }
}
```

### Interactive Workflow Builder

```typescript
// Allow users to create custom workflows
async function buildCustomWorkflow() {
  const workflow = {
    id: 'custom-workflow',
    name: await prompt('Workflow name:'),
    description: await prompt('Description:'),
    steps: []
  };
  
  while (true) {
    const addMore = await confirm('Add a step?');
    if (!addMore) break;
    
    const step = {
      id: await prompt('Step ID:'),
      agent: await select('Select agent:', availableAgents),
      action: await prompt('Action to perform:'),
      dependencies: await multiSelect('Dependencies:', workflow.steps.map(s => s.id))
    };
    
    workflow.steps.push(step);
  }
  
  return workflow;
}
```

## Best Practices

1. **Clear Handoffs**: Always provide comprehensive context when passing work between agents
2. **Parallel When Possible**: Identify independent steps that can run concurrently
3. **Error Recovery**: Design workflows with failure points and recovery strategies
4. **State Persistence**: Enable pause/resume for long-running workflows
5. **Progress Visibility**: Emit events for UI updates and monitoring
6. **Artifact Management**: Track all created artifacts for easy access
7. **Decision Tracking**: Record all decisions made during workflow execution