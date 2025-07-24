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


## 🚀 From Idea to Implementation in Minutes

Imagine describing your app idea in plain English and watching as a pantheon of specialized AI gods brings it to life. Pantheon makes this possible by orchestrating Claude Code's capabilities through an intuitive interface.

### Your Development Journey:

1. **Describe Your Vision** → "I need a task management app for small teams"
2. **Pantheon Understands** → Analyzes complexity, suggests architecture, identifies requirements  
3. **AI Team Assembles** → Architect, Developer, QA, and UX specialists collaborate
4. **Watch It Build** → Real-time progress as your app takes shape
5. **Preview & Iterate** → Instant live preview with hot-reload

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

[**Quick Start with Docker →**](QUICKSTART-DOCKER.md)

### CLI Mode (Direct Integration)
For terminal enthusiasts and Claude Code users:

```bash
# Summon the gods directly in Claude Code
/gods init
```

## ✨ What Makes Pantheon Different?

- **Web-Based IDE**: Full VS Code experience in your browser with Docker setup
- **AI Team Collaboration**: 15 specialized agents work together on your project
- **Smart Context Management**: Never lose track of requirements across sessions
- **UI Quality Scoring**: AI-driven design improvements with measurable results
- **Live Development**: See changes instantly with integrated preview server
- **Production-Ready Output**: Clean, tested, documented code following best practices


## 🎯 Quick Start

### Option 1: Docker with Web UI (Recommended)

```bash
git clone https://github.com/bacoco/Pantheon.git
cd Pantheon
./start-docker.sh
```

Then open **http://localhost:8080** and run `gods init` in the VS Code terminal.

**Note**: The `gods` command automatically integrates with Claude to provide the full Pantheon experience.

### Option 2: CLI in Claude Code

```bash
git clone https://github.com/bacoco/Pantheon.git
cd Pantheon
```

Then:
- **In Claude Code (Web/Desktop)**: Use slash command `/gods init`
- **In Docker Terminal**: Use regular command `gods init` (automatically calls Claude)

## 📦 Installation & Prerequisites

### For Docker Setup (Recommended)
- Docker Desktop installed and running
- Git
- Web browser
- 5 minutes

### For CLI Mode
- Claude Code (claude.ai/code)
- Git

## 📝 How Pantheon Works

Pantheon starts an interactive conversation to help you define your project:

**Example conversation:**
```
Pantheon: What type of application are you building?
You: A REST API with FastAPI

Pantheon: Great choice! Loading FastAPI best practices...
      What's the main purpose of your API?
You: Task management for teams

Pantheon: Perfect! Who are your target users?
You: Small businesses, 5-50 people per team

Pantheon: Let's explore features. What are the core features?
You: User auth, create/edit tasks, assign to team members

Pantheon: I'll organize these as:
      ✅ User Authentication (JWT-based)
      ✅ Task Management (CRUD operations)
      ✅ Team Collaboration
      
      Would you like me to suggest related features?
You: Yes

Pantheon: Based on task management apps, consider:
      - Real-time updates
      - Search and filters
      - Analytics dashboard
      - Notifications
      
[... continues gathering requirements ...]

Pantheon: Generating your customized pantheon.md file...
```

For a quick template instead, use: `/gods init --template`

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

See the [Interactive Pantheon Guide](docs/interactive-pantheon-guide.md) and [Code Generation Guide](docs/code-generation-guide.md) for details.

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

### Project Commands
- `/gods init` - Summon the pantheon to bless a new project
- `/gods init --template` - Request a sacred scroll template
- `/gods validate` - Have the gods verify your sacred scrolls
- `/gods plan` - The gods devise your divine development plan
- `/gods execute` - The gods manifest your vision into reality

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
- [Docker Quick Start](QUICKSTART-DOCKER.md) - Get started with Docker in 2 minutes
- [Docker Setup Guide](docker/README.md) - Detailed Docker configuration
- [CLI Reference](USAGE.md) - Command line documentation  
- [Technical Architecture](TECHNICAL.md) - How Pantheon works internally
- [Examples](examples/) - Real-world project templates
- [Claude Authentication](docs/CLAUDE_AUTH_DOCKER.md) - Docker authentication guide

### Community
- [GitHub Discussions](https://github.com/bacoco/Pantheon/discussions) - Ask questions, share ideas
- [Issue Tracker](https://github.com/bacoco/Pantheon/issues) - Report bugs, request features

### Getting Started
- [Docker Quick Start](QUICKSTART-DOCKER.md) - Web UI setup
- [Interactive Pantheon Guide](docs/interactive-pantheon-guide.md)
- [Code Generation Guide](docs/code-generation-guide.md)

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

## License

MIT License - see [LICENSE](LICENSE) for details.

## Contributing

Contributions are welcome. See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## 📚 Documentation

### Setup Guides
- [Docker Quick Start](QUICKSTART-DOCKER.md) - Web UI setup in 2 minutes
- [Docker Details](docker/README.md) - Advanced Docker configuration
- [Claude Authentication](docs/CLAUDE_AUTH_DOCKER.md) - Auth troubleshooting

### Reference
- [Usage Guide](USAGE.md) - Detailed command reference
- [Technical Architecture](TECHNICAL.md) - Implementation details
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
- [Docker Quick Start Guide](QUICKSTART-DOCKER.md)
- [Full Documentation](docs/)
- [Docker Setup Details](docker/README.md)

Join the future of AI-powered development with Pantheon!

---

For support and discussions: [github.com/bacoco/Pantheon](https://github.com/bacoco/Pantheon)