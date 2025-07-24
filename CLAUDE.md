# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

Pantheon is a composite repository containing three integrated systems:

1. **Pantheon** - Where Gods Build Software (prompt-based orchestration for Claude Code)
2. **BMAD-METHOD** - Agent framework for AI-driven development  
3. **Context Engineering** - Templates and patterns for AI coding assistants

## Build and Development Commands

### BMAD-METHOD (in BMAD-METHOD/ directory)
```bash
# Build commands
npm run build              # Build the entire project
npm run build:agents       # Build agents only
npm run build:teams        # Build teams only
npm run validate           # Validate configurations
npm run install:bmad       # Install BMAD into a project

# Version management
npm run version:patch      # Bump patch version (x.x.N)
npm run version:minor      # Bump minor version (x.N.x)
npm run version:major      # Bump major version (N.x.x)

# Formatting
npm run format             # Format markdown files with Prettier
```

### MCP Server (in context-engineering-intro/use-cases/mcp-server/)
```bash
# Development
npm run dev               # Start development server
npm test                  # Run Vitest tests
npm run test:ui           # Run tests with Vitest UI
npm run test:run          # Run tests once (CI mode)
npm run type-check        # Run TypeScript type checking
npm run deploy            # Deploy to Cloudflare Workers
```

## Architecture and Key Workflows

### Pantheon Command Architecture
Pantheon operates through slash commands that trigger specific behaviors:

1. **Command Flow**: `/command` → reads `.claude/commands/{command}.md` → executes instructions
2. **Agent Orchestration**: Commands can activate specialist agents from `.claude/agents/`
3. **Pattern Memory**: Successful patterns stored in `.claude/memory/patterns.json`

### BMAD-METHOD Agent System
Two-phase development approach:

1. **Planning Phase**: 
   - Analyst creates PRD
   - PM refines requirements
   - Architect designs system

2. **Development Phase**:
   - Scrum Master creates context-rich stories
   - Developer implements with full context
   - QA validates quality

### Integration Pattern
```
User Request → Pantheon analyzes complexity → Selects appropriate approach:
    ├── Simple: Direct implementation guidance
    ├── Moderate: Agent orchestration (2-3 specialists)
    └── Complex: Full BMAD workflow with all agents
```

## Pantheon Commands Reference

### Core Commands
- `/analyze <task>` - Perform multi-dimensional complexity analysis
- `/orchestrate <task>` - Coordinate specialist agents for insights
- `/generate-prp <task>` - Generate Product Requirements Prompt
- `/execute-prp <file>` - Execute a Product Requirements Prompt
- `/help` - Show available commands

### Agent & Team Commands
- `/agent [name]` - Transform into specialist agent directly
- `/team [name]` - Activate pre-configured agent teams
- `/workflow [name]` - Execute multi-agent workflows with state tracking

### Available Agents
- **Daedalus** (Architect) - System design and architecture
- **Hephaestus** (Developer) - Implementation and coding
- **Themis** (QA) - Testing and quality assurance
- **Aegis** (Security) - Security and compliance
- **Prometheus** (PM) - Product management and strategy
- **Athena** (PO) - Product ownership and validation
- **Hermes** (SM) - Scrum mastery and story preparation
- **Apollo** (UX) - User experience and design
- **Janus** (Meta-Orchestrator) - Universal executor and meta-orchestrator

## Enhanced Features from BMAD Integration

### Dynamic Agent System
- **Self-contained YAML agents** with complete configuration
- **Command-based interactions** using * prefix (e.g., *help, *analyze)
- **Dynamic resource loading** - only loads what's needed
- **Advanced elicitation** with contextual methods

### Team Coordination
- **Pre-configured teams** for common scenarios (product, security, agile)
- **Team workflows** with defined roles and handoffs
- **State management** for complex multi-phase operations

### Knowledge Base
- **Structured knowledge** organized by domains and patterns
- **Searchable entries** with metadata and tags
- **Real examples** including React patterns, authentication, testing
- **Knowledge queries** integrated into agent capabilities

### Advanced Templates
- **Architecture templates** for fullstack, frontend, brownfield
- **Interactive templates** with validation and guidance
- **Domain-specific** configurations and best practices

### Workflow Management
- **State persistence** for pauseable/resumable workflows
- **Decision points** with branching logic
- **Artifact tracking** across workflow phases
- **Progress monitoring** and recovery options

## Key Development Patterns

### When working on Pantheon commands:
1. Commands are defined in `.claude/commands/`
2. Follow the ACTIVATION pattern in command files
3. Use structured output formats (YAML blocks for data)

### When working on BMAD agents:
1. Agents are defined in `BMAD-METHOD/bmad-core/agents/`
2. Each agent has dependencies, instructions, and actions
3. Templates are in `bmad-core/templates/`

### When working on Context Engineering:
1. PRP templates follow specific structure (Goals, Context, Tasks, etc.)
2. MCP server uses TypeScript with Cloudflare Workers
3. OAuth flow implemented for external integrations

## File Structure Guidelines

- **Pantheon-specific**: `.claude/` directory contains all Claude Code integrations
- **BMAD agents**: `BMAD-METHOD/bmad-core/` contains agent definitions and workflows
- **Context templates**: `context-engineering-intro/` contains PRP and example structures
- **Documentation**: Each system has its own docs/ directory

## Testing Approach

- BMAD validation: Use `npm run validate` to check agent/workflow configurations
- MCP server: Run `npm test` for unit tests, check OAuth flows
- Pantheon commands: Test by invoking commands directly in Claude Code

## Important Notes

- Pantheon runs entirely within Claude Code - no external APIs needed
- BMAD can be used in both IDE and Web UI environments  
- All three systems can work independently or together

### After BMAD Integration
- **Agent commands use * prefix** when transformed (e.g., *help, not /help)
- **YAML-based configuration** for agents, teams, and workflows
- **Knowledge base queries** available to all agents for expertise
- **State persistence** enables complex multi-session workflows
- **Elicitation patterns** for interactive user engagement
- **The BMAD-METHOD directory can be removed** after integration