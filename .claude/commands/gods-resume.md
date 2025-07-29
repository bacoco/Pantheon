# /gods resume - Resume Previous Session

Continue working on a paused Pantheon project.

## ACTIVATION

When the user types `/gods resume`, help them continue a previous project session.

## Purpose

Enable seamless continuation of work by:
- Listing available projects
- Loading project state
- Showing current progress
- Providing next steps
- Restoring context

## Resume Process

### 1. Check for Projects
```javascript
const projectsDir = ".claude/memory/projects";
const projectFiles = listFiles(projectsDir, "*.json");

if (projectFiles.length === 0) {
  showNoProjectsMessage();
  return;
}
```

### 2. List Available Projects

```markdown
🔄 **Available Pantheon Projects**

Found [N] project(s) to resume:

1. **AI Chat Application** 
   📁 Path: `/projects/ai-chat-app/`
   📅 Last modified: 2 hours ago
   📊 Status: Phase 3 - Implementation
   ✅ Progress: 65% complete

2. **Recipe API Service**
   📁 Path: `/projects/recipe-api/`
   📅 Last modified: 3 days ago
   📊 Status: Phase 2 - Planning Complete
   ⏸️ Progress: 30% complete

3. **Task Manager CLI**
   📁 Path: `/projects/task-cli/`
   📅 Last modified: 1 week ago
   📊 Status: Phase 1 - Initialized
   🆕 Progress: 10% complete

Which project would you like to resume? (1-3): [await input]
```

### 3. Load Selected Project

```javascript
const selection = getUserSelection();
const projectState = loadProjectState(selection);

// Extract project info
const {
  projectName,
  projectPath,
  projectType,
  currentPhase,
  completedPhases,
  lastModified,
  githubRepo
} = projectState;
```

### 4. Show Project Status

```markdown
📂 **Resuming: [Project Name]**

Loading project state...

## Project Overview
- **Type**: [Project Type]
- **Location**: `/projects/[name]/`
- **Git**: ✅ Initialized
- **GitHub**: [URL or "Not connected"]
- **Last Activity**: [Time ago]

## Current Status
**Phase**: [Current Phase]
**Completed**:
  ✅ Project initialization
  ✅ Development planning
  ⏳ Implementation (in progress)
  ⬜ Testing & validation
  ⬜ Deployment setup

## Recent Activity
- [Last action performed]
- [Previous action]
- [Earlier action]

## Available Documents
- 📋 `pantheon.md` - Project definition
- 📄 `chatrooms/PRD.md` - Requirements document
- 🏗️ `chatrooms/architecture-decisions.md` - Technical decisions
- 📝 `chatrooms/PRP.md` - Implementation blueprint
```

### 5. Analyze Next Steps

```javascript
function determineNextSteps(projectState) {
  const nextSteps = [];
  
  if (!projectState.prdGenerated) {
    nextSteps.push({
      command: "/gods plan",
      description: "Generate development plan"
    });
  } else if (!projectState.prpGenerated) {
    nextSteps.push({
      command: "/gods execute",
      description: "Create implementation blueprint"
    });
  } else if (!projectState.implemented) {
    nextSteps.push({
      command: "/execute-prp chatrooms/PRP.md",
      description: "Implement the project"
    });
  } else if (!projectState.validated) {
    nextSteps.push({
      command: "/gods validate",
      description: "Validate project quality"
    });
  }
  
  return nextSteps;
}
```

### 6. Provide Actionable Guidance

```markdown
## 🎯 Recommended Next Steps

Based on your progress, here's what to do next:

1. **Continue Implementation** (Recommended)
   ```
   /execute-prp chatrooms/PRP.md
   ```
   This will continue from Phase 3 where you left off.

2. **Review Current Code**
   ```
   /preview
   ```
   Launch dev server to see current state.

3. **Check Git Status**
   ```
   git status
   ```
   See uncommitted changes since last session.

4. **View Recent Work**
   ```
   cat chatrooms/implementation-progress.md
   ```
   Review what was completed last session.

## 🔧 Quick Actions

- **Continue coding**: Press 'c' 
- **View project**: Press 'v'
- **Run tests**: Press 't'
- **Different project**: Press 'r'
- **Exit**: Press 'q'

Action: [await input]
```

### 7. Handle Quick Actions

```javascript
switch(userAction) {
  case 'c':
    // Continue implementation
    executeCommand("/execute-prp chatrooms/PRP.md");
    break;
    
  case 'v':
    // View project
    executeCommand("/preview");
    break;
    
  case 't':
    // Run tests
    bash("npm test");
    break;
    
  case 'r':
    // Show project list again
    showProjectList();
    break;
    
  case 'q':
    // Exit
    showMessage("Session resumed. You can continue manually.");
    break;
}
```

### 8. Context Restoration

When resuming implementation:

```markdown
🔄 **Restoring Context**

Loading previous session...
- Last file edited: `src/components/ChatWindow.jsx`
- Last test run: All passing (12/12)
- Last commit: "feat: add message threading"

Picking up where you left off...

Current task: Implementing user authentication
Next component: Login form

Ready to continue? (y/n): [await input]
```

### 9. Git Sync Check

```javascript
// Check if behind remote
const gitStatus = bash("git status -sb");
if (gitStatus.includes("behind")) {
  showWarning(`
    ⚠️ Your local branch is behind remote!
    
    Run 'git pull' to sync latest changes.
  `);
}
```

## Special Resume Scenarios

### Interrupted Council Session

If a divine council was in progress:

```markdown
🏛️ **Interrupted Council Session Detected**

The divine council was discussing your project.
Last topic: Architecture decisions

Would you like to:
1. Resume council session
2. View council notes
3. Start fresh
4. Continue without council

Choice (1-4): [await input]
```

### Failed Implementation

If previous implementation failed:

```markdown
⚠️ **Previous Implementation Issue Detected**

Last session ended with an error:
- Error: [Error message]
- Location: [File:line]

Would you like to:
1. View error details
2. Attempt fix and continue
3. Rollback changes
4. Start fresh

Choice (1-4): [await input]
```

## Error Handling

### No Projects Found
```markdown
📭 **No Projects to Resume**

You haven't created any Pantheon projects yet.

To start a new project:
```
/gods init
```

Or navigate to an existing project directory and run:
```
/gods plan
```
```

### Corrupted State
```markdown
❌ **Project State Error**

The project state file appears corrupted.

Would you like to:
1. Rebuild state from git history
2. Start fresh (keeps code)
3. Cancel

Choice (1-3): [await input]
```

### Missing Project Directory
```markdown
⚠️ **Project Directory Not Found**

Expected: `/projects/[name]/`
Status: Directory missing

This might happen if:
- Directory was moved/deleted
- Working from different machine
- Permissions changed

Would you like to:
1. Search for project in other locations
2. Recreate from git repository  
3. Remove from project list
4. Cancel

Choice (1-4): [await input]
```

## State Management

### Project State Structure
```json
{
  "projectName": "ai-chat-app",
  "projectPath": "/projects/ai-chat-app",
  "projectType": "Web Application",
  "createdAt": "2024-01-29T10:00:00Z",
  "lastModified": "2024-01-29T14:30:00Z",
  "currentPhase": "implementation",
  "completedPhases": ["init", "planning"],
  "files": {
    "pantheon": true,
    "prd": true,
    "prp": true,
    "implemented": ["src/App.js", "src/components/Header.js"]
  },
  "git": {
    "initialized": true,
    "lastCommit": "abc123",
    "branch": "main"
  },
  "github": {
    "repo": "https://github.com/user/ai-chat-app",
    "visibility": "private"
  },
  "progress": {
    "percentage": 65,
    "tasksCompleted": 15,
    "tasksTotal": 23
  }
}
```

### State Updates
Update state after significant actions:
- Phase transitions
- File creations
- Git commits
- Test runs

## Best Practices

1. **Show clear status** - User should know exactly where they left off
2. **Provide context** - Show recent activity and changes
3. **Offer smart suggestions** - Recommend logical next steps
4. **Handle edge cases** - Missing dirs, corrupted state, etc.
5. **Quick actions** - Enable fast continuation
6. **Check git status** - Warn about sync issues

## Integration Points

### With Other Commands
- Seamlessly transition to `/gods plan`, `/gods execute`, etc.
- Maintain context across commands
- Update state consistently

### With Git
- Check for uncommitted changes
- Show last few commits
- Warn about branch divergence

### With Divine Council
- Resume interrupted sessions
- Show council notes
- Continue discussions

## Example Usage

```
User: /gods resume

System: Found 3 projects to resume:
        1. AI Chat Application (65% complete)
        2. Recipe API Service (30% complete)  
        3. Task Manager CLI (10% complete)
        
        Which project? (1-3): 

User: 1

System: Resuming: AI Chat Application
        Phase: Implementation (in progress)
        Last activity: 2 hours ago
        
        Recommended: Continue implementation
        Command: /execute-prp chatrooms/PRP.md
        
        Quick actions: [c]ontinue, [v]iew, [t]est
        
User: c

[Continues implementation from last point]
```