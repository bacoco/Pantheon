# 🏛️ Pantheon Technical Architecture - Pure Claude Code Implementation

## Executive Summary

Pantheon is a multi-agent orchestration system that runs entirely within Claude Code using the Task() tool to spawn specialized sub-agents (gods). Each god is a different personality/role of Claude, configured through markdown files.

## Core Technical Components

### 1. The Task Tool - Heart of the System

```javascript
Task(subagent_type, prompt, description)
```

The Task tool is Claude Code's built-in mechanism for spawning sub-agents:

- **subagent_type**: Maps to agent name in `.claude/agents/[name].md`
- **prompt**: The instruction passed to the sub-agent
- **description**: Optional task description
- **Returns**: Text output from the sub-agent

#### How Task() Actually Works

1. **Spawning**: Creates new Claude instance with limited context window
2. **Configuration**: Loads agent definition from `.claude/agents/[name].md`
3. **Execution**: Sub-agent runs with specified tools and prompt
4. **Return**: Results passed back to main Claude instance
5. **Limitation**: Sub-agents cannot spawn other sub-agents (no recursion)

### 2. Agent Definition Structure

Each god is defined in `.claude/agents/[name].md`:

```yaml
---
name: zeus                    # Identifier for Task() calls
description: King of Gods     # Role description
tools: Read, Write, Task      # Available Claude Code tools
---

# System Prompt Section
You are Zeus, master orchestrator...
[Rest of personality and instructions]
```

### 3. Invocation Flow

```
User Input
    ↓
Claude Main Instance (recognizes patterns)
    ↓
Task("zeus", prompt) invoked
    ↓
Sub-agent spawned with zeus.md config
    ↓
Sub-agent executes with tools
    ↓
Results returned to main
    ↓
Output shown to user
```

## Directory Architecture

### Essential Directories

```
.claude/
├── agents/                 # God definitions (13 files)
│   ├── zeus.md            # Orchestrator
│   ├── athena.md          # Architect
│   ├── oracle.md          # Quality reviewer
│   ├── hephaestus.md      # Builder
│   └── ...                # Other specialized gods
│
└── templates/             
    └── project-memory/    # Sacred Scrolls templates
        ├── vision-template.md
        ├── architecture-template.md
        ├── standards-template.md
        └── progress-template.md
```

### Supporting Directories

```
.claude/
├── commands/              # Command patterns (documentation)
├── lib/                   # Conceptual patterns (not executable)
├── workflows/             # Orchestration sequences
└── configs/               # Configuration files
```

## The Sacred Scrolls (Project Memory)

Project state persists in `.pantheon/` directories:

```
project-root/
└── .pantheon/
    ├── vision.md          # Project requirements
    ├── architecture.md    # Technical decisions
    ├── standards.md       # Code standards
    ├── progress.md        # Development status
    └── reviews/           # Oracle review history
```

### Memory Operations

```javascript
// Writing memory
Write(".pantheon/vision.md", projectVision);

// Reading memory
const vision = Read(".pantheon/vision.md");

// Checking existence
if (Bash("test -d .pantheon && echo exists")) {
  // Load existing project
}
```

## Oracle Quality Gate System

Oracle implements blocking checkpoints:

```javascript
// Oracle review flow
function requestOracleReview(phase, content) {
  // Save for review
  Write(".pantheon/pending-review.md", content);
  
  // Invoke Oracle
  const result = Task("oracle", 
    `Review ${phase} in .pantheon/pending-review.md`
  );
  
  // Check approval
  if (result.includes("APPROVED")) {
    return { approved: true };
  }
  return { blocked: true, issues: parseIssues(result) };
}
```

### Quality Gate Workflow

```
Requirements → [Oracle Review] → Design → [Oracle Review] → Implementation
     ↑              ↓              ↑           ↓                ↓
     └── Fix ← Rejected           └── Fix ← Rejected        Approved
```

## Multi-God Orchestration

### Sequential Orchestration

```javascript
// Phase-based execution
await Task("zeus", "Start project planning");
await Task("athena", "Design architecture");
await Task("oracle", "Review architecture");
await Task("hephaestus", "Implement design");
```

### Parallel Possibilities

While Task() is synchronous, gods can plan parallel work:

```javascript
// Zeus delegates parallel tasks
Task("zeus", "Plan parallel implementation of:
  - Frontend (delegate to Apollo)
  - Backend (delegate to Hephaestus)
  - Database (delegate to Daedalus)
");
```

## Natural Language Processing

Claude recognizes god invocations through patterns:

### Direct Invocation
- "Zeus, help me build..." → `Task("zeus", "help me build...")`
- "Oracle, review this" → `Task("oracle", "review this")`

### Command Recognition
- "/gods plan" → Reads `.claude/commands/gods.md` → Executes pattern
- "Divine council, assemble" → Maps to `divine-council.md`

## Template System Implementation

Templates use placeholder replacement:

```javascript
// Template content
const template = Read(".claude/templates/project-memory/vision-template.md");
// Contains: "Project: {{PROJECT_NAME}}"

// Fill template
const filled = template
  .replace("{{PROJECT_NAME}}", actualName)
  .replace("{{TARGET_USERS}}", users);

// Save filled template
Write(".pantheon/vision.md", filled);
```

## File-Based State Management

### Why Files?
1. **Persistence**: Survives session restarts
2. **Visibility**: User can inspect/edit
3. **Simplicity**: No database needed
4. **Debugging**: Easy to trace execution
5. **Version Control**: Git trackable

### State Operations

```javascript
// Progress tracking
function updateProgress(phase, status) {
  const log = Read(".pantheon/progress.md") || "";
  const entry = `\n## ${Date.now()}\nPhase: ${phase}\nStatus: ${status}\n`;
  Write(".pantheon/progress.md", log + entry);
}

// Decision logging
function logDecision(decision, rationale) {
  const decisions = Read(".pantheon/decisions.log") || "";
  Write(".pantheon/decisions.log", 
    decisions + `\n${decision}: ${rationale}`);
}
```

## God Capabilities Matrix

| God | Primary Role | Key Tools | Summons Others |
|-----|-------------|-----------|----------------|
| zeus | Orchestration | Task, TodoWrite | Yes - all gods |
| divine-council | Full workflow | All tools | Yes - all gods |
| athena | Architecture | Read, Write | No |
| oracle | Quality review | Read, Grep | No |
| hephaestus | Implementation | Write, Edit | No |
| hermes | Communication | Read, Task | Yes - for updates |
| apollo | Testing | Read, Bash | No |
| argus | Security | Grep, Read | No |
| themis | Compliance | Read, Grep | No |
| calliope | Documentation | Write | No |
| iris | UI/UX | Read, Write | No |
| daedalus | Engineering | Write, Edit | No |
| aegis | Security arch | Read, Write | No |

## Performance Characteristics

### Task() Overhead
- **Spawn time**: ~1-2 seconds per sub-agent
- **Context size**: Limited to sub-agent window
- **Return size**: Text only, no structured data

### Optimization Strategies
1. **Batch operations**: Combine related work in single Task()
2. **Selective summoning**: Only invoke necessary gods
3. **Memory caching**: Read files once, pass to multiple gods
4. **Progress tracking**: Avoid re-doing completed work

## Security & Isolation

### Sub-agent Isolation
- Cannot access main Claude's full context
- Cannot modify system outside allowed tools
- Cannot spawn recursive sub-agents
- Returns only text (no code execution)

### File System Safety
- All operations within project directory
- No system file modifications
- User-visible file changes
- Git-trackable modifications

## Extensibility

### Adding New Gods
1. Create `.claude/agents/newgod.md`
2. Define name, description, tools
3. Write system prompt
4. Ready to use: `Task("newgod", prompt)`

### Creating Workflows
1. Define sequence in `.claude/workflows/`
2. Document Task() invocation order
3. Specify data flow between gods
4. Include Oracle checkpoints

## Common Patterns

### Project Initialization
```javascript
Bash("mkdir -p .pantheon");
Write(".pantheon/vision.md", visionTemplate);
Write(".pantheon/progress.md", "Project started");
```

### God Summoning Chain
```javascript
Task("zeus", "coordinate");
Task("athena", "design");
Task("oracle", "review");
if (approved) Task("hephaestus", "build");
```

### Memory Check
```javascript
if (Bash("test -f .pantheon/vision.md && echo 1")) {
  const vision = Read(".pantheon/vision.md");
  // Continue with existing project
}
```

## Limitations

1. **No true parallelism**: Task() calls are sequential
2. **No structured data**: Only text passed between agents
3. **Context limits**: Sub-agents have smaller context windows
4. **No recursion**: Sub-agents can't spawn sub-agents
5. **No external APIs**: Pure Claude Code environment

## Best Practices

1. **Use Sacred Scrolls**: Always persist state to `.pantheon/`
2. **Oracle gates**: Review before phase transitions
3. **Clear prompts**: Be specific in Task() calls
4. **Progress tracking**: Update `.pantheon/progress.md`
5. **Error handling**: Check file existence before reading

## Conclusion

Pantheon is elegantly simple:
- **One tool** (Task) orchestrates everything
- **Multiple personalities** via agent configs
- **File persistence** for state management
- **Quality gates** ensure standards
- **Natural language** interface

The system's genius lies not in complexity but in leveraging Claude Code's Task() tool to create a multi-personality orchestration system with persistent memory and quality controls.

---

*Pure Claude Code implementation - No external dependencies, APIs, or multi-model complexity*