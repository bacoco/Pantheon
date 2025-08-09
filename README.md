# 🏛️ Pantheon Multi-AI System with MCP Integration

**Divine AI Orchestration Enhanced with MCP (Model Context Protocol) Tools**

## ✨ What's New: MCP-Enhanced Divine Powers
- ⚡ **Task-Master**: Zeus orchestrates complex workflows intelligently
- 🔮 **Serena**: Athena & Oracle perform deep code analysis
- 🎨 **Shadcn-UI**: Hephaestus forges beautiful UI components instantly
- 🧠 **Sequential-Thinking**: Strategic reasoning for all gods
- 📜 **Basic-Memory**: Cross-session persistence beyond files
- 🔍 **Web-Search**: Hermes gathers information from across the web
- 🏛️ **Sacred Scrolls**: Persistent project state in .pantheon/ folders
- ⚖️ **Quality Gates**: Oracle enforces standards with deep analysis

## 🚀 Quick Start

Just type these in Claude Code:

```
"Zeus, help me build a web app"
"Divine council, create a complete application"
"Hermes, what tools can I use?"
"Athena, design a database architecture"
"Apollo, review my code"
```

**That's it. No setup. No API keys. Just talk to the gods.**

## 📖 Documentation

- **[START-HERE.md](START-HERE.md)** - Simple examples to try right now
- **[PANTHEON-MCP-INTEGRATION.md](PANTHEON-MCP-INTEGRATION.md)** - Complete MCP integration guide
- **[PANTHEON-MCP-COMMANDS.md](PANTHEON-MCP-COMMANDS.md)** - MCP command reference
- **[CLAUDE.md](CLAUDE.md)** - Claude Code configuration
- **[install-divine-tools.sh](install-divine-tools.sh)** - MCP server installation script

## 🏛️ The Gods with MCP Powers

All gods now wield powerful MCP servers as divine tools:

| God | Purpose | MCP Tools | Say This |
|-----|---------|-----------|----------|
| **divine-council** | Full orchestration | task-master, basic-memory | "/gods" or "Divine council, build my app" |
| **zeus** ⚡ | Project coordination | task-master, basic-memory, sequential-thinking | "Zeus, orchestrate with your divine tools" |
| **athena** 🦉 | Architecture | serena, sequential-thinking, filesystem | "Athena, analyze the architecture with Serena" |
| **hephaestus** 🔨 | Building | shadcn-ui, filesystem, github | "Hephaestus, forge a UI with shadcn" |
| **daedalus** 🏗️ | Master engineering | serena, filesystem | "Daedalus, engineer the solution" |
| **githeus** 🔱 | Version Control | github (automatic) | AUTO - commits after each god task |
| **apollo** ☀️ | Quality testing | serena, sequential-thinking, filesystem | "Apollo, validate with deep analysis" |
| **oracle** 🔮 | Quality gates | serena, sequential-thinking, basic-memory | "Oracle, perform quality gates" |
| **hermes** 👟 | Communication | basic-memory, web-search, youtube-transcript | "Hermes, search for best practices" |
| **argus** 👁️ | Security scanning | serena (security mode) | "Argus, scan with Serena" |
| **aegis** 🛡️ | Security architecture | serena, sequential-thinking | "Aegis, design security architecture" |
| **themis** ⚖️ | Compliance | serena (compliance mode) | "Themis, check standards" |
| **calliope** 📜 | Documentation | filesystem, basic-memory | "Calliope, organize docs" |
| **iris** 🌈 | UI/UX design | shadcn-ui (design mode) | "Iris, design with shadcn" |

## 🔧 Special Features

### Hermes - Tool Discovery God
Hermes knows ALL available tools in Claude Code and can tell other gods what to use:
- Ask "Hermes, what tools can I use?"
- Get guidance on which tool for which task
- Coordinates communication between gods

### Divine Council - Interactive Orchestration
The divine council provides interactive dialogue:
- Asks clarifying questions
- Creates project structure
- Generates chatrooms with progress tracking
- Coordinates multiple gods automatically

## ⚡ MCP-Enhanced Capabilities

### 🔱 NEW: Automatic GitHub with Githeus
- **Auto Repo Creation**: GitHub repo created when you start `/gods`
- **Auto Commits**: Every god's work is automatically committed
- **Smart Messages**: Meaningful commit messages based on what was done
- **Auto Push**: Pushes to GitHub every 3 commits or at phase completion
- **Living Documentation**: README auto-updates with project progress

### New Powers with MCP
- ⚡ **10x Faster Development**: Shadcn-ui generates complete UIs instantly
- 🔮 **Deep Code Analysis**: Serena reveals patterns, smells, and vulnerabilities
- 🧠 **Strategic Reasoning**: Sequential-thinking for complex decisions
- 📜 **Perfect Memory**: Basic-memory persists across all sessions
- 🔍 **Web Intelligence**: Search and extract knowledge from anywhere
- 🔧 **GitHub Integration**: Automated workflows and PR management

### Installation
```bash
# Install all MCP servers with one command
./install-divine-tools.sh

# Then restart Claude Code to activate divine tools
```

### What Works
- ✅ All gods respond to natural language
- ✅ MCP tools extend god capabilities dramatically
- ✅ Deep code analysis beyond basic grep
- ✅ Instant UI generation with shadcn-ui
- ✅ Cross-session memory with basic-memory
- ✅ Parallel task orchestration with task-master
- ✅ Web search and knowledge extraction
- ✅ GitHub automation and workflows

## 🔄 Enhanced Workflow

1. **Requirements Phase**
   - Zeus asks about your vision
   - Creates `.pantheon/vision.md`
   - Oracle reviews → Must approve

2. **Design Phase**  
   - Athena designs architecture
   - Creates `.pantheon/architecture.md`
   - Oracle reviews → Must approve

3. **Implementation Phase**
   - Hephaestus builds according to design
   - Oracle validates before deployment
   - All decisions saved in Sacred Scrolls

## 📁 Project Structure

```
pantheon-multi-ai/
├── README.md           # This file
├── START-HERE.md       # Quick examples
├── CLAUDE.md           # Configuration info
├── .claude/            
│   ├── agents/         # All god definitions
│   │   ├── divine-council.md  # Main orchestrator
│   │   ├── zeus.md     # Structured workflow coordinator
│   │   ├── oracle.md   # Quality review agent
│   │   ├── athena.md
│   │   ├── hephaestus.md
│   │   ├── apollo.md
│   │   ├── hermes.md   # Tool discovery god
│   │   └── ...more gods
│   ├── templates/      # Project templates
│   │   ├── project-memory/  # Sacred Scrolls templates
│   │   └── requirements-template.md
│   └── configs/        # Model routing configuration
│       └── model-routing.json
└── docs/               
    └── usage-guide.md  # Detailed usage patterns
```

## 📜 Sacred Scrolls (Project Memory)

When you start a project, Pantheon creates `.pantheon/` folder with:

```
your-project/
└── .pantheon/          # Sacred Scrolls - Project Memory
    ├── vision.md       # What you're building and why
    ├── architecture.md # Technical decisions made
    ├── standards.md    # Code style rules
    └── progress.md     # What's been done
```

**Zeus remembers everything between sessions!**

## 🎯 Example Conversations

### Building Something
```
You: "Divine council, help me build a todo app"
Council: "Welcome! Let me gather the gods..."
[Interactive dialogue begins]
```

### Tool Discovery
```
You: "Hermes, what tools can Zeus use?"
Hermes: "Lord Zeus can use: Task (summon gods), TodoWrite (track tasks), Read/Write (files), Bash (commands)..."
```

### Code Review
```
You: "Apollo, review this function"
Apollo: "Let me examine the code for quality issues..."
```

---

**Just open Claude Code and start talking to the gods!** ⚡🏛️