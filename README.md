# 🏛️ Enhanced Pantheon Multi-AI System

**Divine AI Orchestration with Project Memory & Quality Gates - NO API KEYS NEEDED!**

## ✨ What's New in Enhanced Pantheon
- 🧠 **Project Memory**: Zeus remembers your project between sessions
- ⚖️ **Quality Reviews**: Oracle reviews work before moving to next step
- 📋 **Structured Workflow**: Requirements → Design → Code (no more chaos!)
- 🏛️ **Sacred Scrolls**: Persistent project state in .pantheon/ folders

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
- **[docs/usage-guide.md](docs/usage-guide.md)** - Natural language patterns
- **[CLAUDE.md](CLAUDE.md)** - Claude Code configuration

## 🏛️ The Gods

All gods work natively in Claude Code using the Task() tool:

| God | Purpose | Role | Say This |
|-----|---------|------|----------|
| **divine-council** | Full orchestration | Master coordinator | "Divine council, build a complete app" |
| **zeus** | Project coordination | Strategic oversight | "Zeus, coordinate this project" |
| **oracle** | Quality review | Standards enforcer | "Oracle, review requirements" |
| **athena** | Architecture | System designer | "Athena, design the system" |
| **hephaestus** | Building | Master builder | "Hephaestus, implement this feature" |
| **apollo** | Quality testing | Test specialist | "Apollo, review the code" |
| **argus** | Security | Security scanner | "Argus, scan for vulnerabilities" |
| **themis** | Compliance | Standards checker | "Themis, check standards" |
| **hermes** | Communication | Quick messenger | "Hermes, what tools are available?" |
| **calliope** | Documentation | Documentation writer | "Calliope, write docs" |
| **iris** | UI/UX | Interface designer | "Iris, improve the interface" |

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

## ✅ What Works

- ✅ All gods respond to natural language
- ✅ Interactive dialogue with users
- ✅ Project memory persists between sessions
- ✅ Oracle reviews prevent bad decisions
- ✅ Structured workflow (Requirements → Design → Code)
- ✅ Multi-agent orchestration via Task() tool
- ✅ Chatroom generation for tracking
- ✅ Tool discovery and guidance
- ✅ NO external APIs needed
- ✅ NO configuration required

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