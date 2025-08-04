# 🏛️ Pantheon Usage Guide

## How to Use Pantheon in Claude Code

Simply type natural language commands in Claude Code. The gods will respond!

## 🔧 Tool Discovery with Hermes

Hermes is your guide to all available tools:

```
"Hermes, what tools are available?"
"Hermes, what tools can Zeus use for orchestration?"
"Hermes, how do I search for patterns in files?"
"Hermes, which tool should I use to edit files?"
```

### Available Tools in Claude Code

**File Operations:**
- `Read` - Read file contents
- `Write` - Create or overwrite files
- `Edit` - Make precise edits
- `MultiEdit` - Multiple edits at once

**Search & Discovery:**
- `Grep` - Search patterns in files
- `Glob` - Find files by name pattern
- `LS` - List directory contents

**Execution & Web:**
- `Bash` - Run shell commands
- `WebSearch` - Search the internet
- `WebFetch` - Fetch and analyze web pages

**Coordination:**
- `TodoWrite` - Track tasks and progress
- `Task` - Invoke other gods/agents

## 🏛️ The Divine Council

The most powerful orchestration system with interactive dialogue:

```
"Divine council, help me build a web application"
"Divine council, create a REST API with authentication"
"Divine council, plan a microservices architecture"
```

### What the Divine Council Does:

1. **Interactive Setup**
   - Asks for project name
   - Asks for project type
   - Creates project directories
   - Sets up git repository (optional)

2. **Chatroom Generation**
   Creates detailed logs in `/projects/[name]/chatrooms/`:
   - `council-progress.md` - Real-time updates
   - `architecture-council.md` - Design discussions
   - `tool-usage-log.md` - What tools were used
   - `final-prd.md` - Product requirements
   - `final-prp.md` - Implementation plan

3. **God Coordination**
   Automatically summons the right gods for your project

## ⚡ Individual Gods

### Zeus - Master Orchestrator
```
"Zeus, orchestrate building a todo app"
"Zeus, coordinate the development team"
"Zeus, what's the project status?"
```

### Athena - Strategic Architect
```
"Athena, design a microservices architecture"
"Athena, plan the database schema"
"Athena, what's the best architecture for a chat app?"
```

### Hephaestus - Master Builder
```
"Hephaestus, implement user authentication"
"Hephaestus, build the REST API"
"Hephaestus, create the database models"
```

### Apollo - Quality Validator
```
"Apollo, review this code for issues"
"Apollo, check the test coverage"
"Apollo, validate the implementation"
```

### Argus - Security Scanner
```
"Argus, scan for security vulnerabilities"
"Argus, check for SQL injection risks"
"Argus, review authentication security"
```

### Themis - Compliance Checker
```
"Themis, check GDPR compliance"
"Themis, verify coding standards"
"Themis, ensure best practices"
```

### Calliope - Documentation Writer
```
"Calliope, write API documentation"
"Calliope, create a README"
"Calliope, document this function"
```

### Iris - UI/UX Consultant
```
"Iris, review the user interface"
"Iris, suggest UX improvements"
"Iris, analyze the user flow"
```

## 💬 Natural Language Patterns

### Direct Commands
```
"Zeus, help me"
"Athena, design this"
"Hermes, status update"
```

### Polite Requests
```
"Could you ask Apollo to review my code?"
"Please have Hephaestus build the feature"
"Would Athena design the architecture?"
```

### Questions
```
"Can Argus check for security issues?"
"What tools does Hermes recommend?"
"How would Zeus orchestrate this?"
```

### Complex Tasks
```
"I need the divine council to build a complete e-commerce platform with user authentication, product catalog, shopping cart, and payment processing"
```

## 📂 Project Structure

When gods create projects, they use this structure:

```
/projects/[your-project-name]/
├── chatrooms/
│   ├── council-progress.md      # Real-time updates
│   ├── architecture-council.md  # Design decisions
│   ├── tool-usage-log.md       # Tools used
│   ├── final-prd.md            # Requirements
│   └── final-prp.md            # Implementation plan
├── src/                        # Source code
├── docs/                       # Documentation
└── tests/                      # Test files
```

## 🔄 Workflows

### Full Development Cycle
```
1. "Divine council, help me build [project]"
2. [Answer interactive questions]
3. [Council creates project structure]
4. [Gods collaborate on solution]
5. [Implementation begins]
```

### Quick Validation
```
1. "Apollo, review the code in app.js"
2. "Argus, scan for security issues"
3. "Themis, check compliance"
```

### Tool Discovery Flow
```
1. "Hermes, what tools are available?"
2. "Hermes, which tool for searching?"
3. "Hermes, how do I use Grep?"
```

## 🎯 Best Practices

### 1. Start with the Divine Council
For new projects, always start with:
```
"Divine council, help me build [your project]"
```

### 2. Ask Hermes About Tools
When unsure about tools:
```
"Hermes, what tool should I use for [task]?"
```

### 3. Use Specific Gods for Specific Tasks
- Architecture → Athena
- Implementation → Hephaestus
- Security → Argus
- Documentation → Calliope

### 4. Track Progress
The divine council automatically creates progress logs you can monitor.

## ⚠️ Important Notes

- **No External APIs**: Everything works within Claude Code
- **No Configuration**: Just start talking to the gods
- **Interactive**: Gods will ask questions when they need clarification
- **Project-Based**: The divine council creates real project structures

## 🚀 Getting Started

1. Open Claude Code
2. Type: `"Hermes, tell me about Pantheon"`
3. Then: `"Divine council, help me build something"`
4. Follow the interactive dialogue

That's it! The gods are ready to help you build anything!

---

**Remember**: Just talk naturally. The gods understand.