# Session State Manager

## Overview
This system manages persistent state between Claude and Gemini interactions, ensuring context continuity across manual CLI workflows.

## Session Structure

```json
{
  "session_id": "UUID",
  "created_at": "ISO-8601 timestamp",
  "updated_at": "ISO-8601 timestamp",
  "workflow_type": "feature-development|bug-fix|architecture-review",
  "current_phase": "planning|creation|validation|refinement|integration",
  "models_used": {
    "claude": ["interactions"],
    "gemini": ["interactions"]
  },
  "context": {
    "project_name": "string",
    "current_task": "string",
    "artifacts": ["file_paths"],
    "validation_results": [],
    "decisions": []
  },
  "cost_tracking": {
    "claude_tokens": 0,
    "gemini_tokens": 0,
    "estimated_cost": 0.00
  },
  "status": "active|paused|completed"
}
```

## Commands

### Start New Session
```bash
/session start --type feature-development --project "auth-system"
```
Creates: `.claude/state/sessions/[session-id].json`

### Resume Session
```bash
/session resume [session-id]
```
Loads previous context and continues workflow

### Save Validation Result
```bash
/session save-validation --result "Apollo validation: ..."
```
Appends to current session's validation_results

### Export Session
```bash
/session export --format json|markdown
```
Exports complete session history for documentation

### List Sessions
```bash
/session list --status active|all
```
Shows all available sessions with summary

## Integration with Gods

Each god agent checks for active session and:
1. Loads relevant context
2. Updates session with their actions
3. Saves artifacts and decisions
4. Tracks token usage

## Session Files Location

```
.claude/state/
├── sessions/
│   ├── [session-id].json    # Individual session files
│   └── index.json           # Session registry
├── templates/
│   ├── feature-dev.json     # Template for feature development
│   ├── bug-fix.json        # Template for bug fixes
│   └── architecture.json   # Template for architecture review
└── archives/
    └── [date]/             # Completed sessions by date
```

## Automatic Context Loading

When a session is active, agents automatically:
- Reference previous decisions
- Continue from last phase
- Maintain consistent approach
- Track cumulative costs

## Manual Workflow Integration

For Gemini validation commands:
```bash
# Claude generates with session context
"Run: gemini 'Validate [context from session-id]: ...'"

# After manual execution, save result
/session save-validation --gemini-output "[paste result]"
```

This ensures full context preservation across the manual boundary.