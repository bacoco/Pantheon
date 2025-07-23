# Task Orchestration Tool (claude-task-master MCP)

This tool provides advanced task orchestration and workflow management capabilities for complex multi-agent operations.

## ACTIVATION

When agents need to coordinate complex workflows, manage multi-step processes, or orchestrate team activities, use this tool.

## Capabilities

- **Workflow orchestration**: Define and execute complex workflows
- **Task dependencies**: Manage task relationships and sequencing  
- **Parallel execution**: Run independent tasks concurrently
- **State management**: Track workflow progress and state
- **Event handling**: React to workflow events and conditions
- **Resource allocation**: Manage agent and resource assignment
- **Monitoring**: Real-time workflow visibility and metrics

## Configuration

```yaml
tool:
  name: claude-task-master
  type: mcp_server
  config:
    command: "npx"
    args: ["-y", "eyaltoledano/claude-task-master"]
    
capabilities:
  orchestration:
    modes: ["sequential", "parallel", "hybrid", "adaptive"]
    max_concurrent_tasks: 10
    max_workflow_depth: 5
    
  monitoring:
    real_time: true
    metrics: ["duration", "success_rate", "resource_usage"]
    alerts: ["failure", "timeout", "resource_exhaustion"]
```

## Usage Patterns

### Basic Workflow Orchestration

```javascript
// Define a simple workflow
const workflow = await mcp.taskmaster.createWorkflow({
  name: "Feature Development",
  description: "Complete feature development cycle",
  tasks: [
    {
      id: "design",
      type: "design_mockup",
      assignee: "sally",
      inputs: { requirements: "..." }
    },
    {
      id: "implement", 
      type: "code_implementation",
      assignee: "james",
      dependencies: ["design"],
      inputs: { mockup: "{{design.output}}" }
    },
    {
      id: "test",
      type: "quality_assurance",
      assignee: "elena",
      dependencies: ["implement"],
      inputs: { code: "{{implement.output}}" }
    }
  ]
});

// Execute workflow
const execution = await mcp.taskmaster.execute({
  workflow: workflow.id,
  mode: "sequential",
  monitoring: true
});
```

### Parallel Task Execution

```javascript
// Execute independent tasks in parallel
const parallelWorkflow = await mcp.taskmaster.createWorkflow({
  name: "Parallel Analysis",
  tasks: [
    {
      id: "security_scan",
      type: "security_analysis",
      assignee: "marcus"
    },
    {
      id: "performance_test",
      type: "performance_analysis", 
      assignee: "james"
    },
    {
      id: "ux_review",
      type: "ux_evaluation",
      assignee: "sally"
    },
    {
      id: "aggregate_results",
      type: "result_aggregation",
      assignee: "baco-master",
      dependencies: ["security_scan", "performance_test", "ux_review"],
      inputs: {
        security: "{{security_scan.output}}",
        performance: "{{performance_test.output}}",
        ux: "{{ux_review.output}}"
      }
    }
  ],
  execution: {
    mode: "parallel",
    maxConcurrent: 3
  }
});
```

### Conditional Workflows

```javascript
// Workflow with conditional branching
const conditionalWorkflow = await mcp.taskmaster.createWorkflow({
  name: "Adaptive Development",
  tasks: [
    {
      id: "complexity_analysis",
      type: "analyze_complexity",
      assignee: "winston"
    },
    {
      id: "route_decision",
      type: "decision",
      conditions: [
        {
          if: "{{complexity_analysis.output.score}} > 8",
          then: "complex_path"
        },
        {
          if: "{{complexity_analysis.output.score}} <= 8",
          then: "simple_path"
        }
      ]
    },
    {
      id: "complex_path",
      type: "workflow",
      workflow: "detailed_architecture_workflow",
      conditional: true
    },
    {
      id: "simple_path", 
      type: "direct_implementation",
      assignee: "james",
      conditional: true
    }
  ]
});
```

## Agent-Specific Usage

### BMad Master (Meta-Orchestrator)

```javascript
// Orchestrate cross-functional team workflow
async function orchestrateCrossTeamProject(project) {
  // Create master workflow
  const masterWorkflow = await mcp.taskmaster.createWorkflow({
    name: `Master: ${project.name}`,
    description: project.description,
    phases: [
      {
        name: "Discovery",
        parallel: true,
        tasks: [
          { type: "market_research", assignee: "john" },
          { type: "technical_feasibility", assignee: "winston" },
          { type: "ux_research", assignee: "sally" }
        ]
      },
      {
        name: "Planning",
        sequential: true,
        tasks: [
          { type: "roadmap_creation", assignee: "john" },
          { type: "architecture_design", assignee: "winston" },
          { type: "story_creation", assignee: "sarah" }
        ]
      },
      {
        name: "Execution",
        hybrid: true,
        sprints: generateSprints(project)
      }
    ]
  });
  
  // Set up monitoring
  const monitor = await mcp.taskmaster.monitor({
    workflow: masterWorkflow.id,
    metrics: ["progress", "velocity", "blockers"],
    alerts: {
      onBlocked: notifyStakeholders,
      onDelayed: escalateToManagement,
      onCompleted: celebrateSuccess
    }
  });
  
  // Execute with adaptive management
  return await mcp.taskmaster.executeAdaptive({
    workflow: masterWorkflow.id,
    adaptations: {
      onBottleneck: reallocateResources,
      onFailure: implementContingency,
      onAhead: accelerateNextPhase
    }
  });
}
```

### John (PM) 

```javascript
// Orchestrate product roadmap execution
async function executeRoadmap(roadmap) {
  // Convert roadmap to workflow
  const workflow = await mcp.taskmaster.createWorkflow({
    name: `Roadmap: ${roadmap.quarter}`,
    milestones: roadmap.milestones.map(milestone => ({
      id: milestone.id,
      name: milestone.name,
      deadline: milestone.deadline,
      tasks: milestone.features.map(feature => ({
        id: `feature_${feature.id}`,
        type: "feature_delivery",
        priority: feature.priority,
        estimation: feature.points,
        dependencies: feature.dependencies
      }))
    }))
  });
  
  // Track progress
  const tracker = await mcp.taskmaster.trackProgress({
    workflow: workflow.id,
    reporting: {
      frequency: "daily",
      metrics: ["burndown", "velocity", "risks"],
      distribution: ["stakeholders", "team"]
    }
  });
  
  return tracker;
}

// Manage resource allocation
async function optimizeResourceAllocation(teams, workload) {
  const optimization = await mcp.taskmaster.optimizeResources({
    resources: teams.map(team => ({
      id: team.id,
      capacity: team.capacity,
      skills: team.skills,
      availability: team.availability
    })),
    tasks: workload.tasks,
    constraints: {
      deadlines: workload.deadlines,
      dependencies: workload.dependencies,
      priorities: workload.priorities
    },
    objectives: ["minimize_time", "balance_load", "match_skills"]
  });
  
  return optimization.assignments;
}
```

### Bob (SM)

```javascript
// Orchestrate sprint ceremonies
async function orchestrateSprint(sprint) {
  const sprintWorkflow = await mcp.taskmaster.createWorkflow({
    name: `Sprint ${sprint.number}`,
    ceremonies: [
      {
        id: "planning",
        type: "sprint_planning",
        duration: "4h",
        participants: ["team", "po"],
        outputs: ["sprint_backlog", "sprint_goal"]
      },
      {
        id: "daily_standups",
        type: "recurring",
        frequency: "daily",
        duration: "15m",
        template: "standup_template"
      },
      {
        id: "review",
        type: "sprint_review",
        dependencies: ["development_complete"],
        participants: ["team", "po", "stakeholders"],
        outputs: ["demo", "feedback"]
      },
      {
        id: "retrospective",
        type: "sprint_retrospective",
        dependencies: ["review"],
        participants: ["team", "sm"],
        outputs: ["improvements", "action_items"]
      }
    ],
    development: {
      tasks: sprint.stories.map(story => ({
        id: story.id,
        type: "story_implementation",
        assignee: story.assignee,
        points: story.points,
        subtasks: generateSubtasks(story)
      })),
      mode: "kanban",
      limits: {
        wip: 3,
        blocked: 2
      }
    }
  });
  
  // Monitor sprint health
  const health = await mcp.taskmaster.monitorHealth({
    workflow: sprintWorkflow.id,
    indicators: [
      "velocity_trend",
      "burndown_rate", 
      "blocker_count",
      "team_morale"
    ],
    interventions: {
      low_velocity: adjustScope,
      high_blockers: escalateBlockers,
      low_morale: scheduleTeamBuilding
    }
  });
  
  return { workflow: sprintWorkflow, health };
}
```

### Sarah (PO)

```javascript
// Orchestrate backlog refinement
async function orchestrateRefinement(backlog) {
  const refinementWorkflow = await mcp.taskmaster.createWorkflow({
    name: "Backlog Refinement",
    iterative: true,
    tasks: [
      {
        id: "prioritization",
        type: "prioritize_stories",
        inputs: {
          stories: backlog.stories,
          criteria: ["business_value", "effort", "dependencies", "risks"]
        },
        outputs: ["prioritized_backlog"]
      },
      {
        id: "estimation",
        type: "team_estimation",
        parallel: true,
        subtasks: backlog.stories.map(story => ({
          id: `estimate_${story.id}`,
          type: "planning_poker",
          story: story,
          participants: ["dev_team"]
        }))
      },
      {
        id: "ready_check",
        type: "definition_of_ready",
        validation: {
          criteria: [
            "clear_acceptance_criteria",
            "estimated",
            "no_blockers",
            "testable"
          ]
        }
      }
    ]
  });
  
  return await mcp.taskmaster.execute({
    workflow: refinementWorkflow.id,
    mode: "iterative",
    stopCondition: "all_stories_ready"
  });
}
```

## Advanced Orchestration Features

### Dynamic Workflow Adaptation

```javascript
// Adapt workflow based on runtime conditions
async function adaptiveWorkflow(initialPlan) {
  const adaptive = await mcp.taskmaster.createAdaptiveWorkflow({
    base: initialPlan,
    adaptations: [
      {
        trigger: "task_failure",
        action: async (context) => {
          if (context.task.critical) {
            return {
              action: "retry_with_escalation",
              assignee: "senior_" + context.task.assignee
            };
          } else {
            return {
              action: "skip_with_note",
              note: "Non-critical task failed"
            };
          }
        }
      },
      {
        trigger: "performance_degradation",
        action: async (context) => {
          return {
            action: "scale_resources",
            scale: Math.ceil(context.required_capacity / context.current_capacity)
          };
        }
      }
    ]
  });
  
  return adaptive;
}
```

### Workflow Composition

```javascript
// Compose complex workflows from smaller ones
async function composeWorkflows(components) {
  const composed = await mcp.taskmaster.compose({
    name: "Composite Workflow",
    components: components.map(comp => ({
      workflow: comp.id,
      condition: comp.when,
      inputs: comp.inputs,
      outputs: comp.outputs
    })),
    connections: [
      { from: "component1.output", to: "component2.input" },
      { from: "component2.status", to: "component3.trigger" }
    ],
    errorHandling: {
      strategy: "compensate",
      fallback: "rollback_workflow"
    }
  });
  
  return composed;
}
```

### Event-Driven Orchestration

```javascript
// Create event-driven workflow
async function eventDrivenWorkflow(events) {
  const eventWorkflow = await mcp.taskmaster.createEventDriven({
    name: "Event Orchestration",
    events: [
      {
        type: "pull_request_opened",
        handler: async (event) => {
          return {
            workflow: "pr_validation_workflow",
            inputs: { pr: event.data }
          };
        }
      },
      {
        type: "deployment_failed",
        handler: async (event) => {
          return {
            workflow: "rollback_workflow",
            priority: "critical",
            inputs: { deployment: event.data }
          };
        }
      },
      {
        type: "customer_feedback",
        handler: async (event) => {
          if (event.data.sentiment < 0.5) {
            return {
              workflow: "issue_resolution_workflow",
              inputs: { feedback: event.data }
            };
          }
        }
      }
    ]
  });
  
  // Subscribe to events
  await mcp.taskmaster.subscribe({
    workflow: eventWorkflow.id,
    sources: ["github", "monitoring", "feedback_system"]
  });
  
  return eventWorkflow;
}
```

### Resource Optimization

```javascript
// Optimize resource utilization across workflows
async function optimizeResources(workflows, resources) {
  const optimization = await mcp.taskmaster.globalOptimization({
    workflows: workflows,
    resources: resources,
    constraints: {
      max_concurrent_per_resource: 2,
      skill_matching: true,
      time_windows: resources.map(r => r.availability)
    },
    objectives: {
      primary: "minimize_total_duration",
      secondary: ["balance_workload", "maximize_skill_match"]
    },
    algorithm: "genetic_algorithm",
    iterations: 1000
  });
  
  // Apply optimization
  await mcp.taskmaster.applyOptimization({
    plan: optimization.result,
    mode: "gradual", // Apply changes gradually
    monitoring: true
  });
  
  return optimization;
}
```

## Monitoring and Analytics

```javascript
// Comprehensive workflow analytics
async function analyzeWorkflowPerformance(timeframe) {
  const analytics = await mcp.taskmaster.analyze({
    timeframe: timeframe,
    metrics: [
      "completion_rate",
      "average_duration",
      "bottleneck_analysis",
      "resource_utilization",
      "failure_patterns"
    ],
    groupBy: ["workflow_type", "team", "complexity"],
    insights: {
      anomaly_detection: true,
      trend_analysis: true,
      predictive_modeling: true
    }
  });
  
  // Generate recommendations
  const recommendations = await mcp.taskmaster.recommend({
    based_on: analytics,
    optimize_for: ["efficiency", "reliability", "cost"],
    constraints: {
      team_size: "current",
      budget: "current"
    }
  });
  
  return {
    analytics,
    recommendations,
    dashboard_url: analytics.dashboard_url
  };
}
```

## Error Handling and Recovery

```javascript
// Comprehensive error handling
async function robustWorkflowExecution(workflow) {
  const execution = await mcp.taskmaster.executeWithRecovery({
    workflow: workflow,
    recovery: {
      task_failure: {
        strategy: "retry_with_backoff",
        max_retries: 3,
        backoff: "exponential"
      },
      workflow_failure: {
        strategy: "checkpoint_recovery",
        checkpoint_frequency: "after_each_phase"
      },
      resource_failure: {
        strategy: "reassign",
        escalation: "notify_manager"
      },
      timeout: {
        strategy: "graceful_degradation",
        partial_results: true
      }
    },
    monitoring: {
      alerts: ["email", "slack"],
      dashboard: true,
      logs: "verbose"
    }
  });
  
  return execution;
}
```

## Best Practices

1. **Design idempotent tasks** for safe retries
2. **Use checkpointing** for long-running workflows
3. **Implement proper error handling** at task level
4. **Monitor resource utilization** to prevent bottlenecks
5. **Version workflows** for rollback capability
6. **Use event-driven patterns** for reactive workflows
7. **Implement circuit breakers** for external dependencies
8. **Maintain workflow documentation** for team understanding

This tool provides powerful orchestration capabilities for managing complex multi-agent workflows and processes.