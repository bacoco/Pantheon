# Pantheon Command Executor

This file demonstrates how to use Pantheon commands in different environments.

## Environment-Specific Usage

### In Claude Code (claude.ai/code)
Use slash commands directly: `/gods init`, `/gods plan`, `/gods execute`

### In Docker Terminal (VS Code Server)  
Use regular commands: `gods init`, `gods plan`, `gods execute`
- These automatically call `claude chat` with the appropriate slash commands
- Requires Claude CLI authentication: run `claude-auth-docker.sh` first

## New: Simplified Workflow with pantheon.md

Pantheon now supports a simplified workflow using `pantheon.md` files for project configuration:

### Quick Start with pantheon.md
```bash
# In Claude Code (use slash commands):
/gods init              # Interactive setup
/gods init --template   # Manual template
/gods plan             # Generate plan
/gods execute          # Execute plan

# In Docker Terminal (same experience via wrapper):
gods init              # Calls: claude chat "/gods init"
gods init --template   # Calls: claude chat "/gods init --template"
gods plan             # Calls: claude chat "/gods plan"
gods execute          # Calls: claude chat "/gods execute"
```

See the `examples/` directory for complete examples across various domains:
- **E-commerce**: `ecommerce-platform.pantheon.md`
- **SaaS**: `saas-dashboard.pantheon.md`
- **Mobile**: `mobile-backend.pantheon.md`
- **Real-time**: `chat-messaging.pantheon.md`, `video-streaming.pantheon.md`
- **Developer Tools**: `developer-tools.pantheon.md`, `api-gateway.pantheon.md`
- **Data/ML**: `analytics-platform.pantheon.md`, `ml-api-service.pantheon.md`
- **Content**: `cms-platform.pantheon.md`
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

### New Pantheon Commands
```
# Start interactive project setup (recommended)
/gods init

# Create a basic template for manual editing
/gods init --template

# Validate your pantheon.md file
/gods validate

# Generate a plan from pantheon.md
/gods plan

# Execute the development plan
/gods execute
```

### Multi-Agent Workflow Commands
```
# Execute pre-defined workflows
/workflow product-planning    # PM → PO → SM workflow
/workflow implementation     # Architect → Developer → QA workflow  
/workflow ui-feature        # UX → Developer → QA workflow
/workflow security-first    # Aegis → Developer workflow

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

The interactive `/gods init` will:
- Guide you through project requirements with intelligent questions
- Analyze documentation and code examples you provide
- Detect patterns and conventions from your examples
- Generate a customized pantheon.md file based on the conversation
- Suggest features and best practices for your project type

## The pantheon.md File Format

The `pantheon.md` file is a structured way to define your project requirements:

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

### In Claude Code:
1. When you type a slash command, Claude reads the corresponding file in `.claude/commands/`
2. For orchestration, Claude embodies the agent personas in `.claude/agents/`
3. All processing happens directly within Claude

### In Docker Terminal:
1. The `gods` command is a bash wrapper that checks Claude authentication
2. It transforms your command into the appropriate slash command format
3. Passes it to `claude chat` which then processes it as in Claude Code
4. Provides the exact same Pantheon experience

### Both Environments:
- Multi-agent workflows coordinate specialist agents with context preservation
- Git integration manages version control throughout development
- Live preview provides instant feedback with hot reload
- No external APIs needed beyond Claude itself

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

## Integration: pantheon.md with Existing Commands

When a `pantheon.md` file is present, existing commands can leverage it:

- **`/analyze`** - Considers all features and constraints from pantheon.md
- **`/orchestrate`** - Uses recommended team composition from pantheon.md analysis
- **`/generate-prp`** - Incorporates all pantheon.md content into the PRP

### Workflow Comparison

**Traditional CLI Workflow:**
```
/analyze "Build a task management API"
/orchestrate "Build a task management API"
/generate-prp "Build a task management API with auth"
```

**New pantheon.md Workflow:**
```
/gods init          # Create template
# Edit pantheon.md with your requirements
/gods plan          # Analyze and plan
/gods execute       # Run orchestration and generation
```

## Extending Pantheon

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
- Use `/agent` to get specialized expertise for specific tasks
- Use `/team` for coordinated multi-agent collaboration
- Create personas early to ensure user-centric development
- Agents now have real tool access through MCP integration