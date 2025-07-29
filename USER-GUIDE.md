# Pantheon User Guide for Claude Code

Welcome to Pantheon - Where Gods Build Software Together! This guide will help you get started with Pantheon in Claude Code.

## Table of Contents
- [Installation](#installation)
- [Getting Started](#getting-started)
- [The Divine Council](#the-divine-council)
- [Meet the Gods](#meet-the-gods)
- [Common Workflows](#common-workflows)
- [Tips & Tricks](#tips--tricks)
- [Troubleshooting](#troubleshooting)

## Installation

### Quick Setup

1. **Open Claude Code** (Web or Desktop)

2. **Clone and install Pantheon**:
   ```bash
   git clone https://github.com/bacoco/Pantheon.git
   cd Pantheon
   ./install-pantheon.sh
   ```

3. **That's it!** Pantheon is ready to use.

The installation script:
- ✅ Checks prerequisites (Node.js, npm, git)
- ✅ Clones the Pantheon repository
- ✅ Verifies the installation
- ✅ Shows you how to get started

### What Gets Installed

- **`.mcp.json`** - MCP server configurations (auto-approved)
- **`.claude/`** - All Pantheon commands and agents
- **No global changes** - Everything is project-local

## Getting Started

### Your First Command

Start with a collaborative planning session:

```bash
/gods council
```

This summons the Divine Council where gods work together to understand your project and create a comprehensive plan.

### Basic Commands

| Command | Description |
|---------|-------------|
| `/gods init` | Initialize a new project with git/GitHub |
| `/gods plan` | Generate development plan from requirements |
| `/gods execute` | Create implementation blueprint (and optionally build) |
| `/gods validate` | Validate project quality and completeness |
| `/gods resume` | Continue a previous project session |
| `/gods council` | Start collaborative planning session (all-in-one) |
| `/gods summon <name>` | Summon a specific god |
| `/gods list` | See all available gods |
| `/gods status` | Check current session status |
| `/help` | Show all Pantheon commands |

## The Divine Council

The Divine Council is Pantheon's collaborative planning system where gods work together transparently.

### How It Works

1. **You describe your project**
   ```
   User: I need a real-time chat application
   ```

2. **Gods collaborate to plan**
   - Zeus orchestrates the session
   - Daedalus designs the architecture
   - Apollo creates the UX design
   - Hephaestus plans implementation
   - Each god builds on others' ideas

3. **You receive comprehensive documentation**
   - Product Requirements Document (PRD)
   - Product Requirements Prompt (PRP)
   - All saved in `/chatrooms/`

### Example Council Session

```
/gods council

Council: ⚡ Welcome to the Divine Council of Olympus!
         Tell me about your project vision...

You: I want to build a task management API with FastAPI

Council: Excellent! Let me assemble the appropriate gods...
         *Summoning Zeus to orchestrate*
         *Zeus invites Daedalus for architecture*
         
[Collaborative discussion ensues]

Council: Based on our divine wisdom, here's your plan...
         [Creates comprehensive PRD and PRP]
```

## Meet the Gods

### Core Development Gods

#### ⚡ Zeus - King of Gods
- **Role**: Supreme orchestrator and strategist
- **Expertise**: Project coordination, workflow management
- **Summon**: `/gods summon zeus`
- **MCP Tools**: Task orchestration, swarm management

#### 🏗️ Daedalus - Master Architect
- **Role**: System architecture and design
- **Expertise**: Technical architecture, scalability, technology selection
- **Summon**: `/gods summon daedalus`
- **MCP Tools**: Code analysis, performance reports

#### 🎨 Apollo - God of Arts
- **Role**: UI/UX design and user experience
- **Expertise**: Interface design, user flows, design systems
- **Summon**: `/gods summon apollo`
- **MCP Tools**: Browser preview, UI scoring

#### 🔨 Hephaestus - Divine Forger
- **Role**: Implementation and coding
- **Expertise**: Code development, best practices, frameworks
- **Summon**: `/gods summon hephaestus`
- **MCP Tools**: Git management, code improvement

#### ⚖️ Themis - Guardian of Quality
- **Role**: Quality assurance and testing
- **Expertise**: Test strategies, quality metrics, validation
- **Summon**: `/gods summon themis`
- **MCP Tools**: Playwright testing, quality assessment

#### 🛡️ Aegis - Divine Shield
- **Role**: Security and compliance
- **Expertise**: Security architecture, threat modeling, compliance
- **Summon**: `/gods summon aegis`
- **MCP Tools**: Security scanning, fault tolerance

## Common Workflows

### 1. Starting a New Project (Step-by-Step)

```bash
# Step 1: Initialize project
/gods init
> Project name: blog-api
> Project type: 2 (REST API)
> Initialize git? y
> Create GitHub repo? private

# Step 2: Generate development plan
/gods plan
# Creates PRD with architecture decisions

# Step 3: Create implementation blueprint
/gods execute
# Generates PRP and offers to build
> Implement now? y
# Creates working application!
```

### 1b. Starting a New Project (All-in-One)

```bash
# Use the council for everything
/gods council
> Project name: blog-api
> Project type: 2 (REST API)
> Initialize git? y
> Create GitHub repo? private

# Describe your project
"I need a REST API for managing blog posts with authentication"

# Gods collaborate and create everything
# PRD, PRP, and optional implementation
```

### 2. Getting Architecture Help

```bash
# Summon the architect directly
/gods summon daedalus

# Ask specific questions
"What's the best database for a real-time chat app?"
```

### 3. UI/UX Design

```bash
# Summon the designer
/gods summon apollo

# Get design help
"Design a user-friendly login flow"
```

### 4. Implementation Guidance

```bash
# Summon the developer
/gods summon hephaestus

# Get coding help
"How do I implement JWT authentication in FastAPI?"
```

### 5. Quality Assurance

```bash
# Summon the QA specialist
/gods summon themis

# Plan testing strategy
"What tests should I write for my API?"
```

### 6. Security Review

```bash
# Summon the security expert
/gods summon aegis

# Get security guidance
"Review my authentication implementation for vulnerabilities"
```

## Tips & Tricks

### 1. Use the Council for Complex Projects
The Divine Council (`/gods council`) is best for:
- New projects that need comprehensive planning
- Complex features requiring multiple perspectives
- When you're not sure where to start

### 2. Direct Summoning for Specific Help
Summon individual gods when you need:
- Quick answers to specific questions
- Expert advice in one domain
- Focused help on a particular aspect

### 3. Check the Chatrooms
All council discussions are saved in `/projects/[name]/chatrooms/`:
- `council-progress.md` - Real-time progress tracking
- `discovery-session.md` - Initial project exploration
- `architecture-council.md` - Technical design discussions
- `mcp-usage-log.md` - MCP tool usage and results
- `clarifications-needed.md` - Questions from gods
- `final-prd.md` - Complete requirements document
- `final-prp.md` - Implementation blueprint

**Monitor progress in real-time:**
```bash
tail -f /projects/[name]/chatrooms/council-progress.md
```

### 4. Leverage MCP Tools
The gods use MCP tools automatically:
- First use downloads the tool (one-time)
- Tools are cached for future use
- No manual configuration needed

### 5. Iterate and Refine
- Start with the council for overall planning
- Use individual gods to refine specific aspects
- Review chatroom documents for context

## Troubleshooting

### MCP Tools Not Working

1. **Check Node.js is installed**:
   ```bash
   node --version  # Should be 18+
   ```

2. **Verify MCP configuration**:
   ```bash
   cat .mcp.json
   cat .claude/settings.json
   ```

3. **Restart Claude Code** if needed

### Commands Not Recognized

1. **Ensure you're in the Pantheon directory**:
   ```bash
   ls -la .claude/
   ```

2. **Check installation**:
   ```bash
   ./install-pantheon.sh
   ```

### First-Time Tool Downloads

When using a god for the first time, you might see:
```
Downloading claude-flow...
```
This is normal - tools download once and are cached.

### Getting Help

- **In Claude Code**: `/help`
- **Documentation**: Check `.claude/docs/`
- **Resume Work**: `/gods resume` to see all projects
- **Check Status**: `/gods status` for active sessions
- **GitHub Issues**: Report bugs at [github.com/bacoco/Pantheon](https://github.com/bacoco/Pantheon/issues)

## Advanced Usage

### Understanding MCP Tools

Each god has specialized MCP tools:
- **Zeus**: `claude-flow` for orchestration
- **Apollo**: `playwright` for UI testing (browsermcp removed)
- **Daedalus**: `web_search` and `github_repo_analyze`
- **Themis**: `playwright` for testing
- **All gods**: Access to relevant specialized tools

### Project Organization

Pantheon creates organized project structures:
```
/projects/
├── my-web-app/
│   ├── chatrooms/         # All documentation
│   ├── src/              # Source code
│   ├── pantheon.md       # Project definition
│   └── .git/             # Git repository
├── my-api/
└── my-cli-tool/
```

### Git Integration

Pantheon automatically:
- Initializes git repositories
- Creates GitHub repos (if requested)
- Commits after each phase
- Uses smart commit messages

### Workflow Automation

Create custom workflows by combining gods:
```bash
# Architecture → Implementation → Testing
/gods summon daedalus  # Design
/gods summon hephaestus # Build
/gods summon themis     # Test
```

### Knowledge Persistence

- All planning documents are saved
- Gods can reference previous discussions
- Context is maintained across sessions

## Best Practices

1. **Start with the Council** for new projects
2. **Be specific** in your requests
3. **Review generated documents** in `/chatrooms/`
4. **Iterate** - refine plans with individual gods
5. **Trust the process** - let gods collaborate

## Conclusion

Pantheon brings the wisdom of gods to your development process. Whether you're building a simple API or a complex system, the gods are here to help you succeed.

Start your divine development journey:
```bash
/gods council
```

*May the gods guide your code to greatness!* ⚡

---

**Quick Reference Card**

```bash
# Project Commands
/gods init             # Create new project with git/GitHub
/gods plan             # Generate development plan
/gods execute          # Create PRP and optionally build
/gods validate         # Check project quality
/gods resume           # Continue previous project

# Council & Gods
/gods council          # All-in-one planning session
/gods summon <name>    # Summon specific god
/gods list            # List all gods
/gods status          # Check session status
/help                 # Show all commands

# Common Gods
zeus       # Orchestration
daedalus   # Architecture
apollo     # UI/UX Design
hephaestus # Implementation
themis     # Quality Assurance
aegis      # Security

# Pro Tips
- Projects go in /projects/[name]/
- Monitor progress: tail -f chatrooms/council-progress.md
- Git commits happen automatically
- MCP tools are used for research
- Everything is project-local
```