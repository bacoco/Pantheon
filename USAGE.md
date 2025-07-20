# BACO Command Executor

This file demonstrates how to use BACO commands in Claude Code.

## New: Simplified Workflow with baco.md

BACO now supports a simplified workflow using `baco.md` files for project configuration:

### Quick Start with baco.md
```
# 1. Create a baco.md file with your project requirements
/baco init

# 2. Generate a development plan
/baco plan

# 3. Execute the plan
/baco execute
```

See the `examples/` directory for complete examples:
- `fastapi-task-manager.baco.md` - Full-featured web API
- `react-dashboard.baco.md` - Interactive frontend dashboard
- `cli-tool.baco.md` - Command-line automation tool

## Usage

Simply type any of the following commands in Claude:

### Analyze Task Complexity
```
/analyze Build a real-time notification system with WebSocket support
```

### Orchestrate Multi-Agent Analysis
```
/orchestrate Design a microservices architecture for an e-commerce platform
```

### Generate Implementation Guide (PRP)
```
/generate-prp Create a REST API for user authentication with JWT
```

### Get Help
```
/help
```

### New BACO Commands
```
# Initialize a new baco.md file
/baco init

# Validate your baco.md file
/baco validate

# Generate a plan from baco.md
/baco plan

# Execute the development plan
/baco execute
```

## The baco.md File Format

The `baco.md` file is a structured way to define your project requirements:

```yaml
---
version: 1.0
project_type: "FastAPI Web Service"
author: "Your Name"
---

## FEATURE: User Authentication
Description of the authentication feature...

## FEATURE: Task Management
Description of task management feature...
Dependencies: User Authentication

## EXAMPLES:
- `./examples/auth_pattern.py`: Authentication example
- `./examples/crud_pattern.py`: CRUD operations example

## DOCUMENTATION:
- `https://fastapi.tiangolo.com/`: FastAPI documentation

## CONSTRAINTS:
- Must use PostgreSQL
- JWT tokens required
- Response time < 200ms

## OTHER CONSIDERATIONS:
Additional context and requirements...
```

## How It Works

1. When you type a command, Claude reads the corresponding file in `.claude/commands/`
2. For orchestration, Claude embodies the agent personas in `.claude/agents/`
3. All processing happens within Claude - no external APIs needed

## Quick Start Example

Try this sequence:

1. First, analyze a task:
   ```
   /analyze Build a chat application with real-time messaging
   ```

2. Based on complexity, orchestrate agents:
   ```
   /orchestrate Build a chat application with real-time messaging
   ```

3. Generate implementation guide:
   ```
   /generate-prp Build a chat application with real-time messaging
   ```

## Benefits

- **No API Costs**: Everything runs in Claude Code
- **Transparent**: See all reasoning and analysis
- **Customizable**: Modify prompts and agents as needed
- **Comprehensive**: From analysis to implementation guide

## Integration: baco.md with Existing Commands

When a `baco.md` file is present, existing commands can leverage it:

- **`/analyze`** - Considers all features and constraints from baco.md
- **`/orchestrate`** - Uses recommended team composition from baco.md analysis
- **`/generate-prp`** - Incorporates all baco.md content into the PRP

### Workflow Comparison

**Traditional CLI Workflow:**
```
/analyze "Build a task management API"
/orchestrate "Build a task management API"
/generate-prp "Build a task management API with auth"
```

**New baco.md Workflow:**
```
/baco init          # Create template
# Edit baco.md with your requirements
/baco plan          # Analyze and plan
/baco execute       # Run orchestration and generation
```

## Extending BACO

To add new commands:
1. Create a new file in `.claude/commands/`
2. Follow the existing command structure
3. Document the command in `/help`

To add new agents:
1. Create a new file in `.claude/agents/`
2. Define the persona and expertise
3. Update orchestration logic to include the agent

## Tips

- Be specific in your task descriptions
- Use orchestration for complex, multi-faceted tasks
- Record successful patterns to build knowledge
- Review existing patterns before starting new tasks