# Workflow Management Task

## Purpose

Manage multi-agent workflows with state tracking, resumption capabilities, and artifact management. This enables complex processes to be paused, resumed, and tracked across multiple agent transformations.

## Core Concepts

### Workflow State
- Current step in workflow
- Completed steps
- Created artifacts
- Decision history
- Agent transformations
- Time tracking

### Workflow Operations
- Start workflow
- Pause workflow
- Resume workflow
- Skip step
- Restart from checkpoint
- Abort workflow

## Task Instructions

### 1. Initialize Workflow

When starting a workflow:

**Load Workflow Definition**:
```yaml
# From .claude/workflows/{workflow-name}.yaml
workflow:
  id: workflow-name
  name: Human Readable Name
  agents_involved: [list]
  estimated_duration: X hours
```

**Create State File**:
```yaml
# Store in .claude/memory/workflow-state.json
{
  "workflow_id": "workflow-name",
  "session_id": "unique-session-id",
  "started_at": "timestamp",
  "current_step": 1,
  "status": "active",
  "completed_steps": [],
  "artifacts": {},
  "decisions": {},
  "agent_history": []
}
```

### 2. Execute Workflow Steps

For each step in sequence:

**Pre-Step Checks**:
- Verify requirements met
- Check decision conditions
- Confirm agent availability

**Step Execution**:
1. Transform to required agent
2. Execute specified action
3. Capture created artifacts
4. Record completion status
5. Handle any decision points

**Post-Step Actions**:
- Update state file
- Store artifacts
- Record metrics
- Present handoff message

### 3. Handle Decision Points

When encountering decisions:

**Present Options**:
```
=== Decision Required ===
{decision.description}

Options:
1. {option_1}
2. {option_2}
3. {option_3}

Select option (1-3):
```

**Record Decision**:
- Store choice in state
- Update workflow path
- Document reasoning

### 4. Manage Handoffs

Between agents:

**Handoff Process**:
1. Summarize completed work
2. List created artifacts
3. Provide context for next agent
4. Transform to next agent
5. Brief on remaining work

**Handoff Template**:
```
=== Handoff: {from_agent} → {to_agent} ===

Completed:
- {completed_task_1}
- {completed_task_2}

Artifacts Created:
- {artifact_1}: {description}
- {artifact_2}: {description}

Next Steps:
{next_agent_instructions}

Continue? (y/n)
```

### 5. State Persistence

**Save State After**:
- Each step completion
- Each decision
- Each artifact creation
- User pause request

**State File Structure**:
```json
{
  "workflow_id": "analysis-to-implementation",
  "session_id": "session-123",
  "started_at": "2024-01-15T10:00:00Z",
  "current_step": 3,
  "status": "paused",
  "completed_steps": [
    {
      "step": 1,
      "agent": "orchestrator",
      "action": "analyze-complexity",
      "completed_at": "2024-01-15T10:15:00Z",
      "artifacts": ["complexity-analysis.md"]
    },
    {
      "step": 2,
      "agent": "architect",
      "action": "design-architecture",
      "completed_at": "2024-01-15T10:45:00Z",
      "artifacts": ["architecture-design.md", "tech-decisions.md"]
    }
  ],
  "artifacts": {
    "complexity-analysis.md": "docs/pantheon/workflows/session-123/complexity-analysis.md",
    "architecture-design.md": "docs/pantheon/workflows/session-123/architecture-design.md"
  },
  "decisions": {
    "include_security": true,
    "architecture_complexity": "moderate"
  },
  "agent_history": ["orchestrator", "architect"]
}
```

### 6. Resume Workflow

When resuming:

**Load State**:
1. Read workflow state file
2. Verify workflow definition unchanged
3. Identify current position

**Restore Context**:
```
=== Resuming Workflow ===
Workflow: {workflow_name}
Started: {started_at}
Progress: Step {current} of {total}

Completed Steps:
{list_completed_steps}

Ready to continue with: {next_step}
```

**Continue Execution**:
- Transform to required agent
- Provide context from state
- Resume from current step

### 7. Workflow Commands

Available during workflow:

- `*status` - Show workflow progress
- `*pause` - Pause and save state
- `*skip` - Skip current step (with confirmation)
- `*restart` - Restart from checkpoint
- `*abort` - Cancel workflow

### 8. Error Handling

**On Step Failure**:
1. Record error in state
2. Offer recovery options:
   - Retry step
   - Skip step
   - Abort workflow
   - Get help

**Recovery Options**:
```
Step failed: {error_message}

Options:
1. Retry this step
2. Skip to next step
3. Pause workflow for manual intervention
4. Abort workflow

Select option (1-4):
```

### 9. Completion

When workflow completes:

**Summary Report**:
```
=== Workflow Complete ===

Workflow: {name}
Duration: {total_time}
Steps Completed: {completed}/{total}

Artifacts Created:
{list_all_artifacts}

Key Decisions:
{list_decisions}

Final Status: {success/partial/failed}
```

**Cleanup Options**:
1. Archive workflow state
2. Move artifacts to permanent location
3. Clear temporary files
4. Save completion report

## Integration with Agents

Agents must support workflow operations:

**Agent Awareness**:
- Check if in workflow context
- Access workflow state
- Update state on actions
- Support handoff protocol

**Workflow Context**:
```yaml
workflow_context:
  active: true
  workflow_id: "analysis-to-implementation"
  current_step: 3
  artifacts_path: "docs/pantheon/workflows/session-123/"
```

## Success Criteria

- [ ] State persisted reliably
- [ ] Workflows can be paused/resumed
- [ ] Handoffs include all context
- [ ] Decisions recorded properly
- [ ] Artifacts tracked accurately
- [ ] Error recovery works
- [ ] Progress visible to user