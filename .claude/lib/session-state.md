# Session State Management for BACO

This document defines how BACO manages session state to enable continuous, interruptible workflows.

## Overview

Session state allows BACO to:
- Track progress through multi-step workflows
- Resume interrupted sessions
- Maintain context between command invocations
- Provide progress indicators
- Handle graceful interruptions

## State Storage Location

- **Active session**: `.claude/memory/session-state.json`
- **Project-specific state**: `.claude/memory/projects/{project-name}-state.json`
- **Completed sessions**: `.claude/memory/session-history.json`

Project state files track:
- Project location
- All created files
- Session history for that project
- Project-specific settings

## Session State Structure

```json
{
  "active_session": {
    "id": "baco-20250120-143052",
    "command": "/baco execute",
    "project_name": "ai-image-gen",
    "project_directory": "./ai-image-gen",
    "started_at": "2025-01-20T14:30:52Z",
    "last_updated": "2025-01-20T14:45:23Z",
    "status": "in_progress",
    "current_phase": 2,
    "total_phases": 4,
    "phase_details": {
      "1": {
        "name": "Foundation Setup",
        "status": "completed",
        "completed_at": "2025-01-20T14:40:15Z",
        "artifacts": ["package.json", "tsconfig.json", "src/app/layout.tsx"]
      },
      "2": {
        "name": "Core Logic",
        "status": "in_progress",
        "progress_percentage": 60,
        "current_task": "Implementing prompt enhancement API"
      }
    },
    "artifacts": {
      "baco_md": "ai-image-gen/baco.md",
      "prp_file": "ai-image-gen/baco-prp-20250120.md",
      "created_files": [
        "ai-image-gen/package.json",
        "ai-image-gen/tsconfig.json",
        "ai-image-gen/src/app/layout.tsx",
        "ai-image-gen/src/components/PromptInput.tsx"
      ],
      "modified_files": []
    },
    "context": {
      "project_type": "Mobile AI Image Generator",
      "tech_stack": ["Next.js", "TypeScript", "Tailwind", "Replicate API"],
      "key_features": ["Prompt input", "4-way enhancement", "Image generation", "Selection grid"]
    },
    "can_resume": true,
    "resume_point": "prompt_enhancement_api"
  },
  "session_history": [
    {
      "id": "baco-20250119-091523",
      "command": "/baco init",
      "completed_at": "2025-01-19T09:45:00Z",
      "status": "completed",
      "artifacts": ["baco.md"]
    }
  ]
}
```

## State Management Operations

### 1. Creating a New Session
When starting an interactive workflow:
```
- Generate unique session ID: baco-{YYYYMMDD}-{HHMMSS}
- Initialize session structure
- Set status to "in_progress"
- Store initial context
- Record project_name and project_directory
- Create project-specific state file
- Initialize artifacts tracking
```

### 2. Updating Progress
After each significant action:
```
- Update last_updated timestamp
- Update current_phase if transitioning
- Add completed artifacts to lists
- Update progress_percentage
- Save current_task description
```

### 3. Marking Completion
When workflow completes:
```
- Set status to "completed"
- Move session to session_history
- Clear active_session
- Preserve artifacts list for reference
```

### 4. Handling Interruption
When user pauses or system interrupts:
```
- Set can_resume to true
- Store resume_point with enough context
- Keep active_session intact
- Show resume instructions
```

### 5. Resuming Sessions
When checking for resumable sessions:
```
If active_session exists and can_resume is true:
  - Show session summary
  - Offer to resume or start fresh
  - If resume: Load context and continue from resume_point
  - If fresh: Archive current session and start new
```

## Integration Examples

### In `/baco execute`:
```markdown
# Before starting execution
Check for active_session
If exists:
  Show: "Found in-progress session from [time]. Resume? (y/n)"
  
# During execution
After each phase completion:
  Update session state with completed phase
  Save artifacts created
  Update progress percentage
  
# On user pause
User: "pause"
Claude: 
  - Save current state with resume_point
  - Show: "Session saved. Resume anytime with '/baco resume'"
```

### Resume Flow:
```markdown
User: /baco resume
Claude: 
  Found paused session: Mobile AI Image Generator
  Project: ai-image-gen/
  Started: 1 hour ago
  Progress: Phase 2 of 4 (60% complete)
  
  Last completed:
  ✓ Project setup
  ✓ Layout components
  
  Files created: 12
  Location: ./ai-image-gen/
  
  Ready to continue with: Implementing prompt enhancement API
  
  Resume? (y/n): y
  
  Resuming implementation in ai-image-gen/...
  [Continues from exact pause point]
```

## State File Management

### Automatic Cleanup
- Remove completed sessions older than 7 days
- Archive important artifacts before cleanup
- Keep last 10 completed sessions for reference

### Manual Operations
Users can manage state with:
- `/baco status` - Show current session status
- `/baco resume` - Resume paused session
- `/baco reset` - Clear all session state (with confirmation)

## Best Practices

1. **Save Early, Save Often**: Update state after each meaningful action
2. **Preserve Context**: Store enough information to resume intelligently
3. **Handle Errors**: Don't corrupt state on failures
4. **User-Friendly**: Make resume process seamless
5. **Clean Up**: Don't leave stale sessions indefinitely

## Error Recovery

If session state becomes corrupted:
1. Attempt to recover partial state
2. Offer to start fresh while preserving created artifacts
3. Log corruption details for debugging
4. Never lose user's work

## Example State Transitions

### Normal Flow:
```
[No Session] → [Active: Phase 1] → [Active: Phase 2] → ... → [Completed] → [Archived]
```

### Interrupted Flow:
```
[Active: Phase 2] → [Paused] → [Resume Check] → [Active: Phase 2] → [Completed]
```

### Error Flow:
```
[Active: Phase 3] → [Error] → [Recovery Options] → [Active: Phase 3 Retry] or [New Session]
```