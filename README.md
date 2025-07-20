# 🎭 BACO - Basic Adaptive Context Orchestrator

> An intelligent orchestration system for Claude Code that adapts complexity to match your needs

[![Claude Code](https://img.shields.io/badge/Claude%20Code-Ready-blue)](https://claude.ai)
[![No API Required](https://img.shields.io/badge/API-Not%20Required-green)](https://github.com/bacoco/BACO)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 🌟 What is BACO?

BACO transforms Claude Code into an intelligent development assistant that can:
- 📊 **Analyze** task complexity across multiple dimensions
- 🎭 **Transform** into specialist agents with unique capabilities
- 🔄 **Orchestrate** multi-agent workflows for complex tasks
- 📝 **Generate** structured documents using templates
- ✅ **Validate** work with comprehensive checklists
- 🧠 **Learn** from successful patterns for future use

All without any external APIs - everything runs within Claude Code!

## ✨ New Features (v3.0)

### 🆕 Simplified Workflow with baco.md
- **Structured Project Definition**: Define all requirements in a single `baco.md` file
- **Automatic Convention Detection**: BACO learns from your examples
- **Smart Team Composition**: Dynamic agent selection based on requirements
- **Comprehensive Planning**: Multi-phase implementation plans with dependencies

### v2.0 Features
- **Dynamic Agent System**: Agents can transform on-demand with `*agent` commands
- **Task Automation**: Executable workflows in `.claude/tasks/`
- **Template Engine**: Structured document generation with validation
- **Command System**: All agent commands use `*` prefix for clarity
- **Resource Loading**: Efficient on-demand loading of tasks, templates, and data

## 🚀 Quick Start

### Option 1: New Simplified Workflow (Recommended)

1. **Clone the repository**
   ```bash
   git clone https://github.com/bacoco/BACO.git
   cd BACO
   ```

2. **Create your project definition:**
   ```
   /baco init
   ```
   Copy the template to a file named `baco.md` and customize it.

3. **Generate your development plan:**
   ```
   /baco plan
   ```

4. **Execute the plan:**
   ```
   /baco execute
   ```

### Option 2: Direct Commands

Use BACO commands directly for quick tasks:
```
/analyze Build a real-time chat application

/orchestrate Design a payment processing system

/generate-prp Create user authentication with JWT
```

That's it! No API keys, no setup, just intelligent assistance.

## 📚 How It Works

BACO uses a **prompt-based architecture** inspired by BMAD-METHOD where Claude itself becomes the orchestrator:

```
┌─────────────────────────────────────────┐
│           Claude Code                   │
│  ┌─────────────────────────────────┐   │
│  │        BACO Commands            │   │
│  │  /analyze → complexity.md       │   │
│  │  /orchestrate → agents/         │   │
│  │  /generate-prp → templates/     │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │      Specialist Agents          │   │
│  │  🏗️ Winston (Architect)         │   │
│  │  💻 James (Developer)           │   │
│  │  ✅ Elena (QA)                  │   │
│  │  🔒 Marcus (Security)           │   │
│  └─────────────────────────────────┘   │
└─────────────────────────────────────────┘
```

## 📄 The baco.md File Format

The `baco.md` file provides a structured way to define your project requirements:

```yaml
---
version: 1.0
project_type: "FastAPI Web Service"
author: "Your Name"
---

## FEATURE: User Authentication
Comprehensive authentication system with JWT tokens...

## FEATURE: Task Management
CRUD operations for user tasks...
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

See examples in the `examples/` directory:
- `fastapi-task-manager.baco.md` - Web API with authentication
- `react-dashboard.baco.md` - Frontend dashboard application
- `cli-tool.baco.md` - Command-line tool

## 🛠️ Available Commands

### 📄 `/baco` - Simplified Workflow (NEW)
Manage projects using structured `baco.md` files:
- `/baco init` - Create a template baco.md file
- `/baco validate` - Validate your baco.md syntax
- `/baco plan` - Generate a comprehensive development plan
- `/baco execute` - Execute the plan and generate PRP

**Example:**
```
/baco plan

🎯 BACO DEVELOPMENT PLAN
========================
📋 Project Type: FastAPI Web Service
👥 Recommended Team: Winston, James, Marcus
🚀 Implementation Phases: 3 phases identified
```

### `/orchestrate [task]`
Activates the BACO Orchestrator for intelligent coordination:
- Dynamic agent transformation capabilities
- Multi-agent workflow management
- Pattern-based recommendations
- Interactive command system

**Example:**
```
/orchestrate Build a payment processing system

BACO Orchestrator: Welcome! I can help coordinate this complex task.
Use *help to see all my capabilities, or *analyze to assess complexity.
```

### `/agent [name]`
Transform directly into a specialist agent:
- `architect` or `winston` - System architecture specialist
- `developer` or `james` - Implementation expert
- `qa` or `elena` - Quality assurance specialist
- `security` or `marcus` - Security expert

**Example:**
```
/agent architect

Winston: Hello! I'm Winston, your Master System Architect.
Type *help to see my commands or describe your architectural challenge.
```

### `/analyze <task>`
Performs multi-dimensional complexity analysis:
- Technical complexity
- Domain complexity
- Scale requirements
- Team coordination needs
- Timeline considerations

**Example:**
```
/analyze Build a distributed event processing system

Output:
- Overall Complexity: Complex (8.5/10)
- Key Drivers: Distributed architecture, event ordering, fault tolerance
- Recommended Agents: Architect, Developer, QA
```

### `/generate-prp <task>`
Creates comprehensive Product Requirements Prompts:
- Clear goals and success criteria
- Task breakdown with validation
- Technical implementation details
- Risk mitigation strategies
- Complete testing approach

**Example:**
```
/generate-prp Implement OAuth2 authentication

Output:
- Complete implementation guide
- Step-by-step task breakdown
- Security considerations
- Testing strategy
- Deployment checklist
```

## 🎭 Meet the Specialists

### Winston - The Architect 🏗️
*"Architecture is not about the perfect design, but the right design for the context."*
- System design and scalability
- Technology selection
- Integration patterns

### James - The Developer 💻
*"The best code is code that works, is understood by the team, and can be changed without fear."*
- Pragmatic implementation
- Clean code practices
- Performance optimization

### Elena - The QA Lead ✅
*"Quality is not about finding bugs; it's about ensuring delightful user experiences."*
- User-centric testing
- Quality strategies
- Risk identification

### Marcus - The Security Expert 🔒
*"Security is not a feature; it's a fundamental property of well-designed systems."*
- Threat modeling
- Security controls
- Compliance guidance

## 🎮 Enhanced Agent System

### Agent Commands
Once transformed into an agent, use `*` prefix for commands:
- `*help` - Show agent-specific commands
- `*analyze` - Perform specialized analysis
- `*create-architecture` - Generate architecture doc (Architect)
- `*implement` - Create implementation plan (Developer)
- `*test-strategy` - Design test approach (QA)
- `*threat-model` - Security assessment (Security)
- `*exit` - Return to base Claude

### Workflow Example
```
1. /orchestrate                    # Start orchestrator
2. *analyze payment processing     # Analyze complexity
3. *agent architect               # Transform to architect
4. *create-architecture           # Generate architecture doc
5. *exit                         # Return to base
6. /agent developer              # Transform to developer
7. *implement                    # Create implementation plan
```

## 📁 Directory Structure

```
BACO/
├── .claude/
│   ├── config.yaml            # Core configuration
│   ├── CLAUDE.md              # Main instructions
│   ├── commands/              # Command definitions
│   │   ├── analyze.md
│   │   ├── baco.md            # NEW: Simplified workflow
│   │   ├── orchestrate.md
│   │   ├── agent.md
│   │   ├── generate-prp.md
│   │   └── help.md
│   ├── utils/                 # NEW: Utility instructions
│   │   ├── baco-parser.md     # baco.md parsing logic
│   │   └── example-analyzer.md # Convention detection
│   ├── schemas/               # NEW: File format schemas
│   │   └── baco-md-schema.yaml
│   ├── agents/                # Enhanced agent definitions
│   │   ├── baco-orchestrator.md
│   │   ├── architect.md
│   │   ├── developer.md
│   │   ├── qa.md
│   │   └── security.md
│   ├── tasks/                 # Executable workflows
│   │   ├── analyze-complexity.md
│   │   ├── create-doc.md
│   │   └── README.md
│   ├── templates/             # Document templates
│   │   ├── architecture-doc.yaml
│   │   └── README.md
│   ├── checklists/           # Validation checklists
│   │   ├── architecture-review.md
│   │   └── README.md
│   ├── workflows/            # Multi-agent workflows
│   │   └── README.md
│   ├── data/                 # Knowledge base
│   │   └── README.md
│   └── memory/               # Pattern storage
│       └── patterns.json
├── examples/                 # Example baco.md files
│   ├── fastapi-task-manager.baco.md
│   ├── react-dashboard.baco.md
│   └── cli-tool.baco.md
├── USAGE.md                  # Command reference and examples
├── implementation-summary.md # NEW: Implementation details
└── README.md                 # This file
```

## 💡 Why BACO?

### For Developers
- **No API costs** - Runs entirely in Claude Code
- **Immediate insights** - No setup or configuration
- **Comprehensive analysis** - Multiple expert perspectives
- **Learning system** - Improves with use

### For Teams
- **Consistent approach** - Standardized analysis framework
- **Knowledge retention** - Pattern memory across projects
- **Reduced complexity** - Right-sized solutions
- **Better planning** - Detailed implementation guides

### For Organizations
- **Cost effective** - No external API dependencies
- **Secure** - All processing stays in Claude
- **Customizable** - Modify agents and commands
- **Scalable knowledge** - Build organizational patterns

## 🔧 Customization

### Adding New Commands
1. Create a new file in `.claude/commands/`
2. Define activation trigger and process
3. Update help documentation

### Adding New Agents
1. Create persona in `.claude/agents/`
2. Define expertise and approach
3. Update orchestration logic

### Modifying Patterns
Edit `.claude/memory/patterns.json` to add or modify stored patterns

## 🚦 Best Practices

1. **Use baco.md for Complex Projects** - Structure beats memory
2. **Start with Analysis** - Always understand complexity first
3. **Use Orchestration for Complex Tasks** - Multiple perspectives prevent blind spots
4. **Generate PRPs for Implementation** - Clear guides reduce ambiguity
5. **Record Successful Patterns** - Build institutional knowledge
6. **Provide Examples** - Help BACO match your coding style

## 🤝 Contributing

BACO welcomes contributions! Whether it's:
- New command types
- Additional specialist agents
- Pattern contributions
- Documentation improvements

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## 📈 Roadmap

- [x] Simplified workflow with baco.md files
- [ ] Visual complexity analysis
- [ ] Team collaboration features
- [ ] Pattern recommendation engine
- [ ] Integration with development tools
- [ ] Custom agent creation wizard

## 📋 Changelog

### v3.0 (Latest)
- **NEW**: Simplified workflow with `baco.md` files
- **NEW**: `/baco` command suite (init, validate, plan, execute)
- **NEW**: Automatic convention detection from examples
- **NEW**: Smart team composition based on requirements
- **NEW**: Multi-feature support with dependencies
- **ENHANCED**: Better error messages and validation

### v2.0
- Dynamic agent system with `*` commands
- Task automation and workflows
- Template engine for document generation
- Enhanced resource loading

### v1.0
- Initial release with core commands
- Basic agent orchestration
- Pattern memory system

## 📄 License

MIT License - see [LICENSE](LICENSE) for details

## 🙏 Acknowledgments

Inspired by:
- [BMAD-METHOD](https://github.com/bmadcode/BMAD-METHOD) for agent orchestration patterns
- [Context Engineering](https://github.com/coleam00/context-engineering-intro) for PRP structure
- Gemini's technical analysis for the "simpler steering wheel" concept
- The Claude Code community for feedback and ideas

Special thanks to the v3.0 enhancement based on `gemini-technical-analysis.md` which introduced the structured `baco.md` workflow.

---

<div align="center">

**Ready to orchestrate your development?**

[Get Started](#-quick-start) • [Read Docs](docs/) • [Report Issues](https://github.com/bacoco/BACO/issues)

*Built with 🧠 for Claude Code*

</div>