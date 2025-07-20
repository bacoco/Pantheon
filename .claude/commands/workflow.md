# /workflow Command - Multi-Agent Workflow Execution

ACTIVATION: When user types `/workflow` or `/workflow <name>`, manage multi-agent workflows.

## Command Overview

The `/workflow` command enables execution of predefined multi-agent workflows that coordinate multiple specialists through complex processes with handoffs, decision points, and artifact management.

## Usage Patterns

### List Available Workflows
```
/workflow
```
Shows all available workflows with descriptions.

### Start Specific Workflow
```
/workflow analysis-to-implementation
/workflow security-review
/workflow architecture-evolution
```
Initiates the specified workflow.

### Get Workflow Guidance
```
/workflow-guidance
```
Interactive help to select the right workflow for your needs.

## Implementation

When this command is invoked:

1. **Parse the command**:
   - No argument: List available workflows or show active workflow status
   - With argument: Start or resume specified workflow
   - Special cases: 
     - `workflow-guidance` for interactive selection
     - `workflow-status` to check current workflow
     - `workflow-resume` to continue paused workflow

2. **Check for Active Workflow**:
   ```
   # Load .claude/memory/workflow-state.json
   If active/paused workflow exists:
     Show current status and offer to resume
   ```

3. **For listing workflows**:
   ```yaml
   Available BACO Workflows:
   
   analysis-to-implementation:
     Description: Complete flow from requirements analysis to implementation
     Agents: Orchestrator → Architect → Developer → QA
     Duration: Comprehensive (2-4 hours)
     Best for: New features or systems
   
   security-review:
     Description: Comprehensive security assessment and remediation
     Agents: Security → Architect → Developer
     Duration: Focused (1-2 hours)
     Best for: Security audits or sensitive features
   
   architecture-evolution:
     Description: System architecture review and update
     Agents: Architect → Developer → QA → Security
     Duration: Strategic (2-3 hours)
     Best for: Major refactoring or scaling
   
   rapid-prototype:
     Description: Quick implementation with minimal overhead
     Agents: Developer → QA
     Duration: Fast (30-60 minutes)
     Best for: Proofs of concept or small features
   
   Usage: /workflow <name> to start
   ```

3. **For workflow execution**:
   - Load workflow definition from `.claude/workflows/{name}.yaml`
   - Initialize workflow state tracking
   - Execute first step with appropriate agent
   - Manage handoffs between agents
   - Track artifacts and decisions

## Workflow Structure

Each workflow YAML contains:

```yaml
workflow:
  id: workflow-name
  name: Human Readable Name
  description: What this workflow accomplishes
  agents_involved: [architect, developer, qa, security]
  estimated_duration: 2-3 hours
  
sequence:
  - agent: architect
    task: analyze-architecture
    creates: architecture-analysis.md
    decision_point:
      question: "Does this require major redesign?"
      yes: goto step 3
      no: continue
    
  - agent: developer
    task: implement-changes
    requires: architecture-analysis.md
    creates: implementation-plan.md
    
  - agent: qa
    task: test-strategy
    requires: implementation-plan.md
    creates: test-plan.md

handoff_messages:
  architect_to_developer: "Architecture analysis complete. Key points: {summary}"
  developer_to_qa: "Implementation ready. Focus areas: {highlights}"
```

## Workflow Execution Flow

### 1. Initialization
```
Starting workflow: analysis-to-implementation

This workflow will:
1. Analyze requirements with Architect
2. Create implementation plan with Developer
3. Design test strategy with QA
4. Review security implications

Estimated time: 2-3 hours

Ready to begin? (y/n)
```

**State Initialization**:
- Create session ID
- Initialize workflow state file
- Set up artifacts directory
- Record start time

### 2. Agent Activation
```
=== Step 1 of 4 ===
Activating Winston (Architect) for requirements analysis...

[Agent loads and performs task]
```

### 3. Handoff Management
```
=== Handoff ===
Winston has completed architecture analysis.

Key artifacts created:
- architecture-analysis.md
- technology-recommendations.md

Next: James (Developer) will create implementation plan

Continue? (y/n)
```

### 4. Decision Points
```
=== Decision Required ===
Based on the analysis, this appears to be a complex change.

Options:
1. Continue with full implementation workflow
2. Switch to rapid prototype first
3. Add security review before proceeding
4. Pause for team discussion

Select option (1-4):
```

### 5. Workflow Completion
```
=== Workflow Complete ===

Summary:
- Architecture analyzed by Winston
- Implementation planned by James
- Test strategy created by Elena
- Security reviewed by Marcus

Artifacts created:
- docs/baco/workflows/{session-id}/architecture-analysis.md
- docs/baco/workflows/{session-id}/implementation-plan.md
- docs/baco/workflows/{session-id}/test-strategy.md
- docs/baco/workflows/{session-id}/security-assessment.md

Total time: 2.5 hours

Next recommended steps:
1. Review all artifacts with team
2. Begin implementation
3. Schedule follow-up review

Archive workflow? (y/n)
```

**Completion Actions**:
- Mark workflow as complete in state
- Archive or clear state file
- Move artifacts if requested
- Generate completion report

## Workflow State Management

### State File Location
`.claude/memory/workflow-state.json`

### Commands During Workflow

While a workflow is active, these commands are available:

- `*workflow-status` - Show current progress
- `*workflow-pause` - Pause and save state  
- `*workflow-skip` - Skip current step (requires confirmation)
- `*workflow-abort` - Cancel workflow (requires confirmation)

### Resume Capabilities

**Resume Paused Workflow**:
```
/workflow-resume

Found paused workflow: analysis-to-implementation
Started: 2 hours ago
Progress: Step 3 of 5 (60% complete)

Completed:
✓ Complexity analysis
✓ Architecture design

Ready to continue with: Implementation planning

Resume? (y/n)
```

**State Recovery**:
- Restore workflow context
- Load completed artifacts
- Transform to required agent
- Continue from saved step

## Example Workflows

### Analysis to Implementation
1. **Complexity Analysis** (Orchestrator)
2. **Architecture Design** (Architect)
3. **Implementation Planning** (Developer)
4. **Test Strategy** (QA)
5. **Security Review** (Security) - if needed

### Security Review
1. **Threat Modeling** (Security)
2. **Architecture Hardening** (Architect)
3. **Secure Implementation** (Developer)
4. **Security Testing** (QA)

### Architecture Evolution
1. **Current State Analysis** (Architect)
2. **Evolution Planning** (Architect)
3. **Implementation Impact** (Developer)
4. **Migration Strategy** (Developer)
5. **Risk Assessment** (Security)

## Workflow State Management

Track workflow progress:
- Current step
- Completed steps
- Created artifacts
- Decision history
- Time tracking

Allow workflow operations:
- Pause/Resume
- Skip step (with confirmation)
- Restart from checkpoint
- Abort workflow

## Error Handling

- **Agent not found**: Graceful degradation
- **Task failure**: Option to retry or skip
- **User interruption**: Save state for resume
- **Invalid workflow**: Show available options

## Integration with Orchestrator

Workflows can also be initiated from within the orchestrator:
- Use `*workflow` command in orchestrator mode
- Orchestrator provides workflow recommendations
- Seamless transition between modes

## Best Practices

1. **Choose the right workflow** for your task complexity
2. **Review artifacts** between agent handoffs
3. **Use decision points** to adapt the workflow
4. **Save important artifacts** outside workflow directory
5. **Document deviations** from standard workflow