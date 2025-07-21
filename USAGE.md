# BACO Command Executor

This file demonstrates how to use BACO commands in Claude Code.

## New: Simplified Workflow with baco.md

BACO now supports a simplified workflow using `baco.md` files for project configuration:

### Quick Start with baco.md
```
# 1. Create a baco.md file through interactive conversation
/baco init

# Or use the template for manual editing
/baco init --template

# 2. Generate a development plan
/baco plan

# 3. Execute the plan
/baco execute
```

See the `examples/` directory for complete examples across various domains:
- **E-commerce**: `ecommerce-platform.baco.md`
- **SaaS**: `saas-dashboard.baco.md`
- **Mobile**: `mobile-backend.baco.md`
- **Real-time**: `chat-messaging.baco.md`, `video-streaming.baco.md`
- **Developer Tools**: `developer-tools.baco.md`, `api-gateway.baco.md`
- **Data/ML**: `analytics-platform.baco.md`, `ml-api-service.baco.md`
- **Content**: `cms-platform.baco.md`
- And more...

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
# Start interactive project setup (recommended)
/baco init

# Create a basic template for manual editing
/baco init --template

# Validate your baco.md file
/baco validate

# Generate a plan from baco.md
/baco plan

# Execute the development plan
/baco execute
```

### Multi-Agent Workflow Commands
```
# Execute pre-defined workflows
/workflow product-planning    # PM → PO → SM workflow
/workflow implementation     # Architect → Developer → QA workflow  
/workflow ui-feature        # UX → Developer → QA workflow
/workflow security-first    # Marcus → Developer workflow

# View available workflows
/workflow list

# Create custom workflow
/workflow custom
```

### Git Integration Commands
```
# Git helper commands
/git init                   # Initialize repository
/git commit <message>       # Commit changes
/git branch <name>          # Create/switch branch
/git pr                     # Create pull request
/git status                 # Check git status
```

### Live Preview Commands
```
# Start development server with live preview
/preview                    # Auto-detect and start server
/preview --port 3000       # Specify port
/preview --mobile          # Show QR code for mobile
/preview stop              # Stop preview server
```

### Incremental Update Commands
```
# Add features to existing projects
/add-feature auth-jwt      # Add JWT authentication
/add-feature api-graphql   # Add GraphQL endpoint
/add-feature ui-dashboard  # Add admin dashboard
/add-feature test-e2e      # Add E2E testing

# Update dependencies safely
/update-deps               # Interactive update process
/update-deps check        # Check for updates only
/update-deps security     # Security updates only
/update-deps [package]    # Update specific package
```

The interactive `/baco init` will:
- Guide you through project requirements with intelligent questions
- Analyze documentation and code examples you provide
- Detect patterns and conventions from your examples
- Generate a customized baco.md file based on the conversation
- Suggest features and best practices for your project type

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
3. Multi-agent workflows coordinate specialist agents with context preservation
4. Git integration manages version control throughout development
5. Live preview provides instant feedback with hot reload
6. All processing happens within Claude - no external APIs needed

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
4. Add to workflow integration if applicable

To add new agents:
1. Create a new file in `.claude/agents/`
2. Define the persona and expertise
3. Update orchestration logic to include the agent
4. Create agent-specific templates in `.claude/templates/`
5. Add to workflow definitions

To add new workflows:
1. Define workflow in `.claude/lib/workflow-engine.md`
2. Add workflow command option
3. Test agent handoffs and context preservation

## Tips

- Be specific in your task descriptions
- Use orchestration for complex, multi-faceted tasks
- Record successful patterns to build knowledge
- Review existing patterns before starting new tasks
- Use workflows for structured multi-agent collaboration
- Enable git integration for version control
- Use live preview for instant feedback during development
- Leverage incremental updates for safe project modifications