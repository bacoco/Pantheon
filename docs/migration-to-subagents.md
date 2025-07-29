# Migration Guide: Pantheon's New Collaborative Sub-Agent System

## Overview

Pantheon has evolved to use Anthropic's native sub-agent system, creating a more natural and powerful collaborative experience. Instead of complex command parsing, gods now work together in transparent council sessions.

## What's Changed

### Old System (Command-Based)
- Single context window for all operations
- Complex `/gods init`, `/gods plan`, `/gods execute` flow
- File-based communication
- Manual orchestration logic

### New System (Sub-Agent Based)
- Each god has their own context and expertise
- Simple `/gods council` starts collaborative planning
- Transparent chatroom-based discussions
- Natural collaboration between specialists

## New Commands

### Starting a Council Session
```bash
# Old way
/gods init
/gods plan
/gods execute

# New way - everything in one collaborative session
/gods council
```

### Direct God Invocation
```bash
# Summon a specific god for focused help
/gods summon apollo    # UI/UX assistance
/gods summon daedalus  # Architecture help
/gods summon hephaestus # Implementation guidance
```

### List Available Gods
```bash
/gods list
```

## How It Works

### 1. Divine Council Sessions

When you run `/gods council`, you enter a collaborative planning session:

```
User: /gods council

Council: ⚡ Welcome to the Divine Council of Olympus!

Tell me about your project vision, and I'll convene the appropriate gods...

User: I need a real-time collaborative document editor

Council: Excellent! For a real-time collaborative platform, I'll need to assemble several gods.

*Summoning Zeus to orchestrate our session*

[Zeus joins and begins facilitating]

Zeus: Let me invite Daedalus to design the architecture...

*Thunder rumbles as Daedalus is summoned*

[Multiple gods contribute their expertise transparently]
```

### 2. Transparent Collaboration

You see when and why each god is invited:
- Clear announcements when specialists join
- Each god's contributions are visible
- Natural conversation flow
- Collaborative document building

### 3. Chatroom Documentation

All discussions are documented in `/chatrooms/`:
- `discovery-session.md` - Initial planning
- `architecture-council.md` - Technical design
- `ux-design-council.md` - User experience
- `final-prd.md` - Comprehensive requirements
- `final-prp.md` - Implementation blueprint

## Benefits of the New System

### 1. **Better Collaboration**
Gods build on each other's ideas naturally, creating richer solutions.

### 2. **Transparent Process**
You see the reasoning behind every decision and recommendation.

### 3. **Simpler Commands**
No need to remember complex command sequences.

### 4. **Isolated Contexts**
Each god maintains their own expertise without context pollution.

### 5. **Higher Quality Output**
Multi-perspective planning produces more comprehensive PRDs and PRPs.

## Migration Tips

### For Existing Users

1. **Project Initialization** is now part of the council session - no separate init step
2. **Planning and Execution** happen collaboratively - no separate commands
3. **Validation** occurs naturally during discussions
4. **Results** are richer with multiple perspectives

### Command Mapping

| Old Command | New Approach |
|-------------|--------------|
| `/gods init` | Part of `/gods council` |
| `/gods plan` | Happens during council |
| `/gods execute` | PRD/PRP generated in council |
| `/gods validate` | Validation during discussion |

## Example: Building a Task Management System

### Old Way
```bash
/gods init
# Answer questions about project
/gods plan
# Review generated plan
/gods execute
# Get PRP for implementation
```

### New Way
```bash
/gods council

# Natural conversation about your project
# Gods join as needed
# Collaborative PRD/PRP generation
# Everything in one session
```

## Advanced Usage

### Direct Specialist Access
When you need specific expertise:
```bash
/gods summon apollo
# Get focused UI/UX help

/gods summon aegis
# Security-specific consultation
```

### Review Council Artifacts
All session outputs are saved:
```bash
# Check chatroom files
ls /chatrooms/
- discovery-session.md
- architecture-council.md
- final-prd.md
- final-prp.md
```

## Troubleshooting

### Q: Where's the init command?
A: Project initialization is now part of the council session. Just start with `/gods council`.

### Q: How do I validate my requirements?
A: Validation happens naturally during the council discussion as gods review each other's contributions.

### Q: Can I still use the old commands?
A: The system will guide you to use the new collaborative approach for better results.

### Q: How do I see what each god contributed?
A: Check the chatroom files - all discussions are documented with clear attribution.

## Next Steps

1. Try `/gods council` to experience the new collaborative flow
2. Use `/gods list` to see available specialists
3. Review generated chatroom documentation
4. Enjoy richer, more comprehensive project planning!

The gods of Olympus are ready to collaborate on your next project. May your code be bug-free and your deployments smooth!

---

*For more details, see the [Architecture Documentation](./architecture/pantheon-subagent-architecture.md)*