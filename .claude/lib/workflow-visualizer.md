# Workflow Visualizer for BACO

This library provides visual representation and progress tracking for multi-agent workflows.

## Overview

The workflow visualizer creates clear, ASCII-based visualizations of workflow progress, agent activities, and artifact creation.

## Visual Components

### Workflow Header
```typescript
function renderWorkflowHeader(workflow: Workflow): string {
  const icon = getWorkflowIcon(workflow.id);
  const line = '━'.repeat(40);
  
  return `
${icon} ${workflow.name}
${line}

${workflow.description}

Agents involved: ${workflow.agents.join(' → ')}
Estimated duration: ${workflow.estimatedDuration}
`;
}

function getWorkflowIcon(workflowId: string): string {
  const icons = {
    'product-planning': '📝',
    'implementation': '🏗️',
    'ui-feature': '🎨',
    'security-review': '🔒',
    'custom': '🔧'
  };
  return icons[workflowId] || '🔄';
}
```

### Progress Visualization

#### Linear Progress Bar
```typescript
function renderProgressBar(current: number, total: number, width: number = 20): string {
  const percentage = Math.round((current / total) * 100);
  const filled = Math.round((current / total) * width);
  const empty = width - filled;
  
  const bar = '█'.repeat(filled) + '░'.repeat(empty);
  return `${bar} ${percentage}%`;
}
```

#### Step Progress Tracker
```typescript
function renderStepProgress(workflow: Workflow): string {
  const lines: string[] = [];
  
  workflow.steps.forEach((step, index) => {
    const status = getStepStatus(step, workflow.state);
    const icon = getStatusIcon(status);
    const time = getStepTime(step, workflow.state);
    
    lines.push(`${icon} ${step.id.padEnd(25)} ${time}`);
  });
  
  const overall = calculateOverallProgress(workflow);
  lines.push('');
  lines.push(`Overall: ${renderProgressBar(overall.current, overall.total)}`);
  lines.push(`Elapsed: ${formatDuration(overall.elapsed)} | Est. remaining: ${formatDuration(overall.remaining)}`);
  
  return lines.join('\n');
}

function getStatusIcon(status: StepStatus): string {
  const icons = {
    completed: '✅',
    running: '🔄',
    waiting: '⏸️',
    failed: '❌',
    skipped: '⏭️'
  };
  return icons[status] || '❓';
}
```

### Parallel Execution Visualization
```typescript
function renderParallelSteps(steps: WorkflowStep[], state: WorkflowState): string {
  if (steps.length === 1) {
    return renderSingleStep(steps[0], state);
  }
  
  const lines: string[] = [];
  lines.push('⚙️ Parallel Execution:');
  
  steps.forEach(step => {
    const progress = getStepProgress(step, state);
    const agent = step.agent;
    const action = step.action;
    
    lines.push(`${agent}: ${renderProgressBar(progress.current, progress.total, 15)} ${action}`);
  });
  
  return lines.join('\n');
}
```

### Agent Activity Display
```typescript
function renderAgentActivity(agent: string, action: string, status: 'starting' | 'working' | 'completed'): string {
  const statusMessages = {
    starting: `✨ ${agent}: Starting ${action}`,
    working: `⚡ ${agent}: Working on ${action}...`,
    completed: `✅ ${agent}: Completed ${action}`
  };
  
  return statusMessages[status];
}
```

### Artifact Creation Notifications
```typescript
function renderArtifactCreated(artifact: Artifact): string {
  const icon = getArtifactIcon(artifact.type);
  return `${icon} Created: ${artifact.path}`;
}

function getArtifactIcon(type: string): string {
  const icons = {
    document: '📄',
    code: '💻',
    test: '🧪',
    design: '🎨',
    security: '🔒',
    config: '⚙️'
  };
  return icons[type] || '📄';
}
```

## Complete Workflow Visualization

### Product Planning Example
```
📝 Product Planning Workflow
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Transform product vision into sprint-ready stories

Agents involved: John → Sarah → Bob
Estimated duration: 30-45 minutes

Required inputs:
• Product Vision: AI-powered task management app
• Market Research: Growing demand for productivity tools
• Team Capacity: 40 story points

🚀 Starting workflow...

✅ Create PRD                (2 min)
✅ Create Roadmap           (1 min)
🔄 Create User Stories      (in progress...)
⏸️ Validate Stories         (waiting)
⏸️ AI-Ready Stories         (waiting)
⏸️ Sprint Planning          (waiting)

Overall: ████████░░░░░░░░░░░░ 40%
Elapsed: 5 minutes | Est. remaining: 7 minutes

✨ Sarah (PO): Starting generateUserStories
   Processing PRD and roadmap to create detailed user stories...
   
📄 Created: docs/stories/user-authentication.md
📄 Created: docs/stories/task-creation.md
📄 Created: docs/stories/ai-suggestions.md
```

### Implementation with Parallel Steps
```
🏗️ Implementation Workflow
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Architecture to tested implementation

⚙️ Parallel Execution:
Winston: ████████████░░░ 75% generateSystemDesign
Marcus:  ██████░░░░░░░░░ 40% securityAssessment
Elena:   ████████████████ 100% createTestPlan

✅ Elena (QA): Completed createTestPlan
📄 Created: docs/test/test-plan.md

Waiting for Winston and Marcus to complete...
```

## Interactive Elements

### Decision Points
```typescript
function renderDecision(decision: WorkflowDecision): string {
  const lines = [
    '🤔 Decision Required',
    '━━━━━━━━━━━━━━━━━━━',
    '',
    decision.question,
    ''
  ];
  
  decision.options.forEach((option, index) => {
    lines.push(`${index + 1}. ${option.label}`);
    if (option.description) {
      lines.push(`   ${option.description}`);
    }
  });
  
  lines.push('');
  lines.push('Select option (1-' + decision.options.length + '): ');
  
  return lines.join('\n');
}
```

### Error Display
```typescript
function renderError(error: WorkflowError, step: WorkflowStep): string {
  return `
⚠️ Step Failed: ${step.id}
━━━━━━━━━━━━━━━━━━━━━━━━

Agent: ${step.agent}
Action: ${step.action}
Error: ${error.message}

Options:
1. Retry step with ${step.agent}
2. Skip this step (may affect subsequent steps)
3. Pause workflow for manual intervention
4. Abort workflow

Choice (1-4): `;
}
```

## Workflow Summary

### Completion Summary
```typescript
function renderWorkflowSummary(workflow: Workflow, result: WorkflowResult): string {
  const icon = result.success ? '✅' : '⚠️';
  const status = result.success ? 'Complete' : 'Completed with warnings';
  
  const artifacts = Array.from(result.artifacts.entries());
  const metrics = calculateQualityMetrics(workflow, result);
  
  return `
${icon} Workflow ${status}: ${workflow.name}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Duration: ${formatDuration(result.duration)}
Steps completed: ${result.completedSteps}/${workflow.steps.length}
Artifacts created: ${artifacts.length}

Key Deliverables:
${artifacts.map(([name, artifact]) => 
  `${getArtifactIcon(artifact.type)} ${name}: ${artifact.path}`
).join('\n')}

Quality Metrics:
${metrics.map(metric => 
  `${metric.passed ? '✓' : '✗'} ${metric.name}: ${metric.value}`
).join('\n')}

Next Steps:
${workflow.nextSteps.map((step, i) => 
  `${i + 1}. ${step}`
).join('\n')}
`;
}
```

## Animation Effects

### Spinner for Active Steps
```typescript
const spinnerFrames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];

function renderSpinner(frame: number): string {
  return spinnerFrames[frame % spinnerFrames.length];
}
```

### Pulsing Effect for Current Step
```typescript
function renderCurrentStep(step: WorkflowStep, pulseFrame: number): string {
  const pulse = pulseFrame % 4 < 2 ? '▶' : '▷';
  return `${pulse} Currently executing: ${step.agent} - ${step.action}`;
}
```

## Usage in Workflow Command

```typescript
// In workflow command implementation
const visualizer = new WorkflowVisualizer();

// Show workflow header
console.log(visualizer.renderHeader(workflow));

// During execution
engine.on('step:started', ({ workflow, step }) => {
  console.log(visualizer.renderAgentActivity(step.agent, step.action, 'starting'));
});

engine.on('step:progress', ({ workflow, step, progress }) => {
  console.log(visualizer.renderStepProgress(workflow));
});

engine.on('artifact:created', ({ artifact }) => {
  console.log(visualizer.renderArtifactCreated(artifact));
});

engine.on('workflow:completed', ({ workflow, result }) => {
  console.log(visualizer.renderWorkflowSummary(workflow, result));
});
```

## Color Support (Optional)

While BACO primarily uses ASCII art, it can detect terminal color support:

```typescript
function withColor(text: string, color: 'green' | 'yellow' | 'red' | 'blue'): string {
  if (!supportsColor()) return text;
  
  const colors = {
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    red: '\x1b[31m',
    blue: '\x1b[34m',
    reset: '\x1b[0m'
  };
  
  return `${colors[color]}${text}${colors.reset}`;
}
```

## Best Practices

1. **Keep It Simple**: ASCII art should enhance, not distract
2. **Be Informative**: Every visual element should convey useful information
3. **Stay Responsive**: Update visualizations in real-time
4. **Handle Edge Cases**: Long names, many parallel steps, etc.
5. **Accessibility**: Ensure output is screen-reader friendly with clear text

The visualizer makes workflows engaging and easy to follow, turning complex multi-agent orchestration into a clear, visual experience.