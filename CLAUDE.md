# CLAUDE.md

Claude Code project configuration for Pantheon Multi-AI System.

## Project Overview
Pantheon is a multi-AI orchestration system using Claude Code's Task tool to coordinate specialized sub-agents (gods) for collaborative development.

## Core Architecture
- **Gods**: Specialized sub-agents defined in `.claude/agents/`
- **Task Tool**: `Task("god-name", "request")` spawns sub-agents
- **Quality Gates**: Oracle god enforces standards at checkpoints
- **Sacred Scrolls**: Project state persists in `.pantheon/` folders

## Key Workflow
```javascript
Task("zeus", "Plan project");       // Orchestration
Task("athena", "Design system");    // Architecture  
Task("oracle", "Review design");    // Quality gate
Task("hephaestus", "Build it");     // Implementation
```

## Available Gods
- **zeus**: Project orchestration
- **athena**: Architecture design
- **hephaestus**: Implementation
- **apollo**: Quality testing
- **oracle**: Quality gates
- **hermes**: Communication
- **divine-council**: Full workflow orchestration

See `.claude/agents/` for complete god definitions.

## Usage
Just use natural language:
- "Zeus, help me build X"
- "Divine council, create an app"
- "Oracle, are we ready to deploy?"
