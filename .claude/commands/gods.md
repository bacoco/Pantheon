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
- `/gods council` - Start a collaborative planning session
- `/gods summon <god>` - Invoke a specific god directly
- `/gods list` - Show available gods and their specialties

Which would you like to do?
```

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
1. Welcome the user to the Divine Council
2. Understand their project vision
3. Transparently summon appropriate gods
4. Generate comprehensive PRD and PRP
5. Create chatroom documentation

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