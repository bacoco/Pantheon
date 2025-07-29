# /gods - Summon the Divine Development Council

Harness the collaborative wisdom of Olympus through divine council sessions.

## ACTIVATION
When the user runs `/gods` or any `/gods [subcommand]`, follow these instructions using the new sub-agent system.

## Command Overview

The `/gods` command orchestrates collaborative planning sessions where specialist gods contribute their expertise to create comprehensive PRDs and PRPs.

## Available Subcommands

### `/gods` (no subcommand)
Display available options:
```
⚡ **The Divine Council of Olympus**

Available commands:
- `/gods init` - Initialize a new project with divine guidance
- `/gods plan` - Generate development plan from requirements
- `/gods execute` - Create implementation blueprint (and optionally build)
- `/gods validate` - Validate project quality and completeness
- `/gods resume` - Continue a previous project session
- `/gods council` - Start a collaborative planning session
- `/gods summon <god>` - Invoke a specific god directly
- `/gods list` - Show available gods and their specialties
- `/gods status` - Check current session status

Which would you like to do?
```

### `/gods init`
Initialize a new project with interactive setup:

```javascript
// Execute the gods-init command
executeCommand("/gods-init");
```

This will:
1. Ask for project name and create directory
2. Set up project type
3. Initialize git repository
4. Create GitHub repo (optional)
5. Generate initial pantheon.md

### `/gods plan`
Generate development plan from requirements:

```javascript
// Execute the gods-plan command
executeCommand("/gods-plan");
```

This will:
1. Read project requirements from pantheon.md
2. Summon planning gods
3. Generate development phases
4. Create architecture decisions
5. Produce comprehensive PRD

### `/gods execute`
Create implementation blueprint and optionally build:

```javascript
// Execute the gods-execute command
executeCommand("/gods-execute");
```

This will:
1. Generate detailed PRP from plan
2. Create code templates
3. Define testing strategy
4. Offer to implement immediately
5. Launch preview if built

### `/gods validate`
Validate project quality:

```javascript
// Execute the gods-validate command
executeCommand("/gods-validate");
```

This will:
1. Check project structure
2. Validate code quality
3. Assess test coverage
4. Review documentation
5. Generate improvement tasks

### `/gods resume`
Continue previous project:

```javascript
// Execute the gods-resume command
executeCommand("/gods-resume");
```

This will:
1. List available projects
2. Load project state
3. Show current progress
4. Provide next steps
5. Restore context

### `/gods council`
Invoke the divine-council sub-agent to start a collaborative planning session:

```javascript
Task(
  description="Start divine council planning session",
  prompt="Begin a collaborative planning session for the user's project",
  subagent_type="divine-council"
)
```

This will:
1. Set up project directory and git
2. Welcome the user to the Divine Council
3. Understand their project vision
4. Transparently summon appropriate gods
5. Generate comprehensive PRD and PRP
6. Create chatroom documentation with real-time progress

### `/gods summon <god>`
Directly invoke a specific god for focused assistance:

```javascript
// Parse the god name from the command
const godName = extractGodName(command);

// Map user-friendly names to sub-agent names
const godMapping = {
  'zeus': 'zeus-council',
  'daedalus': 'daedalus-architect', 
  'apollo': 'apollo-ux',
  'hephaestus': 'hephaestus-dev',
  'themis': 'themis-qa',
  'aegis': 'aegis-security',
  'prometheus': 'prometheus-pm',
  'athena': 'athena-po',
  'hermes': 'hermes-sm'
};

const subagentName = godMapping[godName.toLowerCase()];

if (subagentName) {
  Task(
    description=`Summon ${godName} for assistance`,
    prompt=`Help the user with ${context}`,
    subagent_type=subagentName
  );
} else {
  showError(`Unknown god: ${godName}. Use '/gods list' to see available gods.`);
}
```

### `/gods status`
Check current divine council session status:

```javascript
// Execute the gods-status command
executeCommand("/gods-status");
```

This will:
1. Check for active sessions
2. Show last activity time
3. Display current phase
4. List summoned gods
5. Provide file paths for monitoring

### `/gods list`
Display the pantheon of available gods:

```
⚡ **The Pantheon of Olympus**

**Council Orchestrators:**
- 🌩️ **Zeus** - Supreme orchestrator, leads planning sessions
- 🏛️ **Divine Council** - Multi-god collaborative sessions

**Specialist Gods:**
- 🏗️ **Daedalus** - System architecture and technical design
- 🎨 **Apollo** - User experience and interface design
- 💻 **Hephaestus** - Implementation and code craftsmanship
- ⚖️ **Themis** - Quality assurance and testing
- 🛡️ **Aegis** - Security and compliance
- 📋 **Prometheus** - Product management and strategy
- 🦉 **Athena** - Product ownership and validation
- 🌍 **Hermes** - Agile processes and team coordination

Use `/gods summon <name>` to invoke a specific god, or `/gods council` for collaborative planning.
```

## Integration with Chatrooms

When gods are summoned, they should:
1. Create appropriate chatroom files in `/chatrooms/`
2. Document their contributions
3. Reference other gods' insights
4. Build comprehensive artifacts

## Key Differences from Old System

### Old Approach (Prompt-Based)
- Complex command parsing
- File-based PRP generation
- Manual orchestration logic
- Single context window

### New Approach (Sub-Agent Based)
- Native sub-agent invocation
- Separate contexts per god
- Transparent collaboration
- Cleaner architecture

## Example Usage

### Starting a Council Session
```
User: /gods council

[System invokes divine-council sub-agent]

Divine Council: ⚡ Welcome to the Divine Council of Olympus!

I am the voice of the Divine Council, where gods collaborate to forge your vision into reality.

Tell me about your project vision, and I'll convene the appropriate gods...
```

### Summoning a Specific God
```
User: /gods summon apollo

[System invokes apollo-ux sub-agent]

Apollo: *enters with artistic grace*

Greetings! I am Apollo, designer of divine experiences. How may I help you create interfaces that delight?
```

## Error Handling

If the user tries old commands:
- `/gods init` → "The new council system starts with `/gods council`"
- `/gods plan` → "Planning now happens collaboratively in `/gods council`"
- `/gods execute` → "Execution planning is part of the council session"

## Benefits of the New System

1. **Cleaner Separation**: Each god has their own context
2. **Better Collaboration**: Natural handoffs between specialists
3. **Transparent Process**: Users see when/why gods are summoned
4. **Richer Outputs**: Multi-perspective PRDs and PRPs
5. **Simpler Commands**: Less complex command structure

## Migration Notes

Users familiar with the old system should know:
- Project initialization is now part of the council session
- No separate validation/plan/execute steps
- Everything happens through collaborative discussion
- Results in better, more comprehensive outputs

Remember: The power of Olympus lies not in commands, but in divine collaboration!