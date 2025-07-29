<div align="center">
  <img src="docs/images/pantheon.jpeg" alt="Pantheon" width="300" style="border-radius: 8px;">
</div>

<br>

<div align="center">
<b>P</b>rincipled <b>A</b>gent <b>N</b>exus for <b>T</b>eam <b>H</b>armonization and <b>E</b>ngineering <b>O</b>rchestration <b>N</b>etwork
</div>

<br>
<br>

A central hub (Nexus) where specialized agents follow clear principles to work together in perfect harmony. This harmonized team is then orchestrated by the platform to manage and execute every facet of the software engineering lifecycle, from design to deployment.

> Transform your ideas into production-ready applications with a pantheon of AI-powered development deities.

## 📚 Quick Links
- **[User Guide](USER-GUIDE.md)** - Complete guide for Claude Code users
- **[One-Command Install](#quick-start---one-command-installation)** - Get started in seconds
- **[Docker Setup](docs/docker/DOCKER-COMPLETE-GUIDE.md)** - Web UI with VS Code


## 🚀 From Idea to Implementation in Minutes

Imagine describing your app idea in plain English and watching as a pantheon of specialized AI gods brings it to life. Pantheon makes this possible by orchestrating Claude Code's capabilities through an intuitive interface.

### Your Development Journey:

1. **Describe Your Vision** → `gods create "task management app"`
2. **Pantheon Understands** → Analyzes complexity, suggests architecture, identifies requirements  
3. **AI Team Assembles** → Architect, Developer, QA, and UX specialists collaborate
4. **Watch It Build** → Real-time progress as your app takes shape
5. **Preview & Iterate** → Instant live preview with hot-reload

### Quick Start - One Command Installation

```bash
# In Claude Code, run this single command:
curl -sSL https://raw.githubusercontent.com/bacoco/Pantheon/main/install-pantheon.sh | bash

# Then start with collaborative divine council
/gods council
```

> **That's it!** No configuration needed. MCP tools are automatically enabled.

📚 **[See the complete User Guide →](USER-GUIDE.md)**

## 🖥️ Choose Your Interface

### Web UI with Docker (New Pantheon UI!)
Full VS Code experience in your browser with integrated Claude:

```bash
# One-command setup with VS Code Server
./start-docker.sh
```

Access at **http://localhost:8080** - includes:
- 🖥️ Full VS Code IDE in your browser
- 🤖 Pre-installed Claude Code extension
- 🔐 Integrated authentication wizard
- 🚀 Live preview server on ports 3000, 5173, 8000
- 🏛️ All Pantheon `gods` commands (integrated with Claude)
- 📦 Node.js, Python, Git pre-installed
- 💾 Persistent storage for your projects

[**Quick Start with Docker →**](docs/docker/DOCKER-COMPLETE-GUIDE.md)

### CLI Mode (Direct Integration)
For terminal enthusiasts and Claude Code users:

```bash
# Start a collaborative planning session
/gods council

# The divine council will guide you through project planning
# with transparent collaboration between specialist gods
```

## 🏛️ NEW: Collaborative Divine Council System

Pantheon now uses Anthropic's native sub-agent system for transparent, multi-perspective planning:

- **Natural Collaboration**: Gods work together in council sessions, building on each other's ideas
- **Transparent Process**: See when and why each specialist is summoned
- **Richer Solutions**: Multiple perspectives create comprehensive PRDs and PRPs
- **Chatroom Documentation**: All discussions preserved for reference

### Example Council Session
```
User: /gods council

Council: ⚡ Welcome to the Divine Council of Olympus!
        Tell me about your project vision...

User: I need a real-time collaboration platform

Council: *Summoning Zeus to orchestrate*
        *Zeus invites Daedalus for architecture*
        *Apollo joins for UX design*
        
[Collaborative discussion creates comprehensive plan]
```

## ✨ What Makes Pantheon Different?

- **Web-Based IDE**: Full VS Code experience in your browser with Docker setup
- **Divine Council System**: Gods collaborate transparently to plan your project
- **AI Team Collaboration**: 15 specialized agents work together on your project
- **Smart Context Management**: Never lose track of requirements across sessions
- **UI Quality Scoring**: AI-driven design improvements with measurable results
- **Live Development**: See changes instantly with integrated preview server
- **Production-Ready Output**: Clean, tested, documented code following best practices

## 🔧 MCP (Model Context Protocol) Integration

Pantheon uses MCP tools to enhance the gods' capabilities:

- **Project-Local Configuration**: All MCP servers defined in `.mcp.json` - no global settings needed
- **Automatic Approval**: MCP servers are automatically enabled via `.claude/settings.json` - no manual approval required
- **Enhanced Capabilities**: Gods use specialized tools like claude-flow for orchestration, playwright for testing, and browsermcp for UI design
- **First-Time Downloads**: MCP tools are downloaded automatically on first use (cached for future use)

## 🎯 Quick Start

### Option 1: Docker with Web UI (Recommended)

```bash
git clone https://github.com/bacoco/Pantheon.git
cd Pantheon
./start-docker.sh
```

Then open **http://localhost:8080** and start building immediately:

```bash
# Start a collaborative divine council session
/gods council

# Or summon specific gods for help
/gods summon apollo      # UI/UX design
/gods summon daedalus    # System architecture
/gods summon hephaestus  # Implementation

# See all available gods
/gods list
```

**Note**: The terminal will show the Pantheon prompt: `⚡ [coder@pantheon projects]$ `

**Note**: The `gods` command automatically integrates with Claude to provide the full Pantheon experience.

### Option 2: CLI in Claude Code (Recommended for Claude Users)

**One-command installation:**
```bash
curl -sSL https://raw.githubusercontent.com/bacoco/Pantheon/main/install-pantheon.sh | bash
```

**Start using immediately:**
```bash
# Start collaborative planning
/gods council

# Or summon specific gods
/gods summon apollo      # UI/UX design
/gods summon daedalus    # Architecture
/gods summon hephaestus  # Implementation
```

📖 **[Complete User Guide](USER-GUIDE.md)** - Everything you need to know

## 📦 Installation & Prerequisites

### For Docker Setup (Recommended)
- Docker Desktop installed and running
- Git
- Web browser
- 5 minutes

### For CLI Mode
- Claude Code (claude.ai/code)
- Git
- Node.js 18+ (for MCP tools)

## 📝 How Pantheon Works

Pantheon uses a collaborative divine council where specialist gods work together to understand and plan your project:

**Example Divine Council Session:**
```
User: /gods council

Council: ⚡ Welcome to the Divine Council of Olympus!
         I am the voice of the Divine Council. Tell me about your project vision.

You: I need a task management API with FastAPI

Council: Excellent! A task management system requires expertise from several gods.
         
         *Summoning Zeus to orchestrate our session*
         
Zeus: I'll coordinate our planning. Let me invite Daedalus for the architecture.

         *Thunder rumbles as Daedalus arrives*

Daedalus: For a FastAPI task management system, I recommend:
          - RESTful API with clear resource boundaries
          - PostgreSQL for reliable data storage
          - JWT authentication for security
          
Zeus: Let me also summon Apollo for the API design...

Apollo: I'll ensure the API is intuitive. Key endpoints:
        - POST /tasks - Create with clear validation
        - GET /tasks - Filterable, paginated lists
        - PUT /tasks/{id} - Full updates
        - DELETE /tasks/{id} - Soft deletes

[Gods continue collaborating, building comprehensive plan]

Council: Based on our divine wisdom, I'm now creating your PRD and PRP...
```

The council creates comprehensive documentation in `/chatrooms/` including your PRD and implementation blueprint.

```yaml
---
version: 1.0
project_type: "Web Application"
author: "Your Name"
---

## FEATURE: User Authentication
Secure login system with email/password...

## EXAMPLES:
- `./auth-example.js`: Our authentication pattern

## CONSTRAINTS:
- Must use PostgreSQL
- Response time < 200ms
```

## 🆕 What's New: Collaborative Divine Council

Pantheon now features a revolutionary collaborative planning system using Anthropic's native sub-agent technology:

- **Transparent Collaboration**: Watch as gods discuss and build on each other's ideas
- **Natural Conversations**: No complex command sequences - just describe your vision
- **Comprehensive Documentation**: All council discussions saved in `/chatrooms/`
- **Multi-Perspective Solutions**: Each god contributes their specialized expertise

[**See Migration Guide →**](docs/migration-to-subagents.md)

## 📋 Features Overview

### 🤖 Intelligent Multi-Agent System
**15 Specialized AI Agents** collaborate on your project:

| Team | Agent | Role | Mythological Identity | Specialization |
|------|--------------|------|------------------------|-----------------|
| **Core Development** | **Daedalus** | Lead Architect | Master craftsman who built the Labyrinth | System design, scalability, best practices |
| | **Hephaestus** | Senior Developer | Divine forger of the gods' weapons | Implementation, code quality, performance |
| | **Themis** | QA Engineer | Titaness of divine order and justice | Testing strategies, quality assurance |
| | **Aegis** | Security Expert | Impenetrable shield of Zeus and Athena | Security audits, compliance, threat modeling |
| **Product Management** | **Prometheus** | Product Manager | Titan who gave fire to humanity | Product strategy, roadmap planning, prioritization |
| | **Athena** | Product Owner | Goddess of wisdom and strategic warfare | Requirements validation, user stories, acceptance criteria |
| | **Hermes** | Scrum Master | Messenger god bridging all realms | Agile processes, sprint planning, team coordination |
| **UX & Design** | **Apollo** | UX Designer | God of music, harmony, and arts | User experience, accessibility, design systems |
| **UI Enhancement** | **Oracle** | Style Guide Expert | Divine source of prophetic wisdom | Design tokens, visual consistency, brand identity |
| | **Harmonia** | Design Optimizer | Goddess of harmony and concord | Audience-specific UI, psychology-based design |
| | **Iris** | Animation Specialist | Rainbow messenger, swift as light | Micro-interactions, transitions, 60fps performance |
| | **Calliope** | Microcopy Expert | Muse of epic poetry and eloquence | UI text, tone consistency, user communication |
| | **Argus** | UI Quality Guardian | Hundred-eyed giant who sees all flaws | UI quality assessment, visual regression detection |
| **Orchestration** | **Zeus** | Supreme Orchestrator | King of gods ruling from Mount Olympus | System-wide orchestration, agent summoning |
| | **Janus** | Meta-Orchestrator | Two-faced god seeing past and future | Cross-agent coordination, workflow optimization |

### 🎨 AI-Driven UI Enhancement
Transform your interfaces with intelligent design optimization:

- **UI Quality Scoring**: Get instant feedback on design quality (0-10 scale)
- **Automatic Improvements**: AI fixes accessibility issues, adds animations, optimizes layouts
- **Design Token Extraction**: Generate consistent design systems from any screenshot
- **Performance Optimization**: All animations guaranteed 60fps

### 🚀 Modern Development Features

#
#### Smart Code Generation
- Production-ready code with tests
- Follows industry best practices
- Automatic documentation
- Git integration
- Live preview server

#### Incremental Development
- Add features to existing projects
- Smart dependency management
- Conflict resolution
- Breaking change detection

### 3. Generate Development Plan

```
/gods plan
```

Pantheon analyzes your requirements and provides:
- Recommended architecture
- Implementation phases
- Technology suggestions
- Team composition (which specialist agents to consult)

### 4. Execute Implementation

```
/gods execute
```

Generates a comprehensive Product Requirements Prompt (PRP) to guide implementation.

## 🛠️ How It Works

### 1. Define Your Project
Use natural language to describe what you want to build. Pantheon's AI understands context and asks clarifying questions.

### 2. AI Team Assembly  
Based on your project's needs, Pantheon assembles the right team of AI specialists - architects for system design, developers for implementation, QA for testing, and more.

### 3. Collaborative Development
Watch as the AI team works together:
- **Architect** designs the system architecture
- **Developer** implements features with best practices
- **QA Engineer** ensures quality with comprehensive tests
- **UX Designer** optimizes the user experience

### 4. Real-Time Progress
Track progress through the web UI or CLI, with live previews and instant feedback.

### 5. Production-Ready Output
Get clean, documented, tested code that follows industry standards.

## 🏗️ Architecture Deep Dive

### How Agents Collaborate

Pantheon's agents work in specialized teams with clear responsibilities:

#### Core Development & Management Team (Phase 4)
The primary team responsible for the software development lifecycle:
- **Daedalus** designs system architecture and creates ADRs
- **Hephaestus** implements features and handles code quality
- **Themis** creates test plans and ensures quality standards
- **Aegis** performs security audits and creates policies
- **Prometheus** manages product strategy and roadmaps
- **Athena** owns the backlog and writes user stories
- **Hermes** facilitates agile processes and prepares work
- **Apollo** defines UX and creates design specifications

#### UI Enhancement Team (Advanced)
A specialized team for dramatic UI improvements:
- **Oracle** analyzes visual inspiration and extracts design tokens
- **Harmonia** optimizes designs for target audiences
- **Iris** adds performance-conscious animations
- **Calliope** ensures consistent brand communication
- **Argus** maintains vigilant watch over UI quality with hundred eyes

#### Orchestration Layer
- **Janus** coordinates all agents and generates dynamic workflows
- **Smart Routing Engine** analyzes complexity and routes tasks appropriately

Each agent has dedicated tools (MCPs), templates, and integration points throughout the system.

## 🆕 Interactive Workflow with Code Generation

Pantheon now features a **fully interactive experience** that guides you seamlessly from project definition to **actual working code**:

### Complete Development Flow
```
/gods init → Interactive setup → Auto-plan → Auto-execute → Real code + Git + Preview
```

**Pantheon now generates actual code files with professional features:**
- Creates real project structures with tests
- Implements error handling automatically
- Manages dependencies intelligently
- Validates code and fixes errors
- Commits to Git at each phase
- Launches live preview when done

Real-time progress with enhanced features:
```
Creating Next.js project structure...
✅ Project initialized with TypeScript and Tailwind
🔄 Git repository initialized

Creating components...
✅ Created src/components/PromptInput.tsx (52 lines)
✅ Created src/components/ImageGrid.tsx (87 lines)  
✅ Created src/__tests__/PromptInput.test.tsx (35 lines)

Installing dependencies...
📦 Analyzing imports...
✅ Installed 15 dependencies

Running validation...
✅ TypeScript: No errors
✅ Tests: 12 passing
✅ Build: Successful

📝 Committing: "Complete UI components phase"

Phase 1 Complete! (Created 12 files, 1,245 lines of code)
Ready to proceed with Phase 2: Core Logic? (y/n): 
```

See the [Interactive Pantheon Guide](docs/core/interactive-pantheon-guide.md) and [Code Generation Guide](docs/core/code-generation-guide.md) for details.

## 📚 Project Templates

Pantheon includes templates for common project types:

### Web Applications
- **E-commerce**: Shopping cart, payments, inventory
- **SaaS Dashboard**: Multi-tenant, subscriptions, analytics
- **CMS**: Content management with API

### APIs & Backend
- **REST API**: CRUD operations, authentication, validation
- **GraphQL**: Schema-first development, resolvers
- **Microservices**: Service mesh, API gateway

### Real-time & Mobile
- **Chat App**: WebSocket, presence, history
- **Mobile Backend**: Push notifications, offline sync
- **Live Streaming**: Video delivery, CDN integration

Browse all templates in the `examples/` directory.

## Core Commands

### Quick Commands (No Init Required!)
- `gods create "app description"` - Create a new app instantly
- `gods generate "code description"` - Generate code from natural language
- `gods build` - Build your project automatically
- `gods plan "project idea"` - Create a development plan
- `gods execute` - Execute the development plan

### Project Commands
- `/gods init` - Initialize a new project with full setup (optional)
- `/gods init --template` - Request a sacred scroll template
- `/gods validate` - Have the gods verify your sacred scrolls

### UI Enhancement Commands
- `/ui-improve` - Run comprehensive UI enhancement pipeline
- `/ui-score` - Get detailed UI quality assessment

### Traditional Commands
- `/analyze [task]` - Analyze task complexity
- `/orchestrate [task]` - Get multi-agent perspectives
- `/generate-prp [task]` - Generate implementation guide

## The pantheon.md Format

```yaml
---
version: 1.0
project_type: "Your Project Type"
author: "Your Name"
---

## FEATURE: Feature Name
Description of what this feature does...

## EXAMPLES:
- `./path/to/example.js`: Description

## DOCUMENTATION:
- `https://relevant-docs.com`: Framework documentation

## CONSTRAINTS:
- Technical requirements
- Performance targets
- Compliance needs

## OTHER CONSIDERATIONS:
Additional context...
```

## 🎓 Resources & Support

### Documentation
- [Docker Complete Guide](docs/docker/DOCKER-COMPLETE-GUIDE.md) - Get started with Docker in 2 minutes
- [Docker Architecture](docs/docker/DOCKER-ARCHITECTURE.md) - Detailed Docker architecture
- [Technical Architecture](docs/core/TECHNICAL.md) - How Pantheon works internally
- [Examples](examples/) - Real-world project templates

### Community
- [GitHub Discussions](https://github.com/bacoco/Pantheon/discussions) - Ask questions, share ideas
- [Issue Tracker](https://github.com/bacoco/Pantheon/issues) - Report bugs, request features

### Getting Started
- [Docker Complete Guide](docs/docker/DOCKER-COMPLETE-GUIDE.md) - Web UI setup
- [Interactive Pantheon Guide](docs/core/interactive-pantheon-guide.md)
- [Code Generation Guide](docs/core/code-generation-guide.md)

## When to Use Pantheon

Pantheon is most valuable for:
- ✅ New project planning and architecture
- ✅ Complex features requiring multiple components
- ✅ Projects with specific technical constraints
- ✅ Team collaboration on requirements
- ✅ Maintaining consistency across a codebase
- ✅ Rapid prototyping and MVPs
- ✅ Modernizing legacy systems
- ✅ Creating design systems

## Known Issues & Solutions

### VS Code Welcome Page
The default Microsoft welcome page may appear instead of the custom Pantheon welcome. 

**Solution**: 
- Click on `WELCOME.html` in the file explorer to view the Pantheon welcome
- Or use this URL: http://localhost:8080/?open=/home/coder/projects/WELCOME.html

### Terminal Directory
If terminal doesn't start in `/projects`:
- Close all terminals and open a new one with `Ctrl+` ` (or `Cmd+` ` on Mac)
- The prompt should show: `⚡ [coder@pantheon projects]$ `

## License

MIT License - see [LICENSE](LICENSE) for details.

## Contributing

Contributions are welcome. See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## 📚 Documentation

### Setup Guides
- [Docker Complete Guide](docs/docker/DOCKER-COMPLETE-GUIDE.md) - Web UI setup and full reference
- [Docker Architecture](docs/docker/DOCKER-ARCHITECTURE.md) - Technical architecture details

### Reference
- [Technical Architecture](docs/core/TECHNICAL.md) - Implementation details
- [Examples](examples/) - Sample project definitions

---


## 🚀 Get Started Now

Ready to transform how you build software?

### Web UI (Recommended)
```bash
./start-docker.sh  # Full setup in one command
```
Then visit **http://localhost:8080** and use `gods init` in the terminal

### CLI Mode
In Claude Code (claude.ai/code), use slash commands like `/gods init`

**Learn More**: 
- [Docker Complete Guide](docs/docker/DOCKER-COMPLETE-GUIDE.md)
- [Full Documentation](docs/)
- [Docker Architecture](docs/docker/DOCKER-ARCHITECTURE.md)

Join the future of AI-powered development with Pantheon!

---

For support and discussions: [github.com/bacoco/Pantheon](https://github.com/bacoco/Pantheon)