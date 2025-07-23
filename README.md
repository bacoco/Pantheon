# BACO - Beyond Automated Context Orchestrator

A structured approach to defining software projects for AI-assisted development in Claude Code.

## What is BACO?

BACO provides a standardized format (`baco.md`) for describing software projects, enabling Claude Code to better understand your requirements and provide more accurate assistance. It acts as a bridge between your project vision and AI-generated implementation guidance.

## Key Benefits

- **Structured Requirements**: Define features, dependencies, and constraints in a consistent format
- **Context Preservation**: Maintain project context across multiple development sessions
- **Better AI Assistance**: Help Claude understand your coding conventions and architectural preferences
- **Reduced Ambiguity**: Clear specifications lead to more accurate code generation

## Getting Started

### 1. Install BACO

```bash
git clone https://github.com/bacoco/BACO.git
cd BACO
```

### 2. Create Your Project Definition

```
/baco init
```

This starts an interactive conversation where BACO helps you define your project:

**Example conversation:**
```
BACO: What type of application are you building?
You: A REST API with FastAPI

BACO: Great choice! Loading FastAPI best practices...
      What's the main purpose of your API?
You: Task management for teams

BACO: Perfect! Who are your target users?
You: Small businesses, 5-50 people per team

BACO: Let's explore features. What are the core features?
You: User auth, create/edit tasks, assign to team members

BACO: I'll organize these as:
      ✅ User Authentication (JWT-based)
      ✅ Task Management (CRUD operations)
      ✅ Team Collaboration
      
      Would you like me to suggest related features?
You: Yes

BACO: Based on task management apps, consider:
      - Real-time updates
      - Search and filters
      - Analytics dashboard
      - Notifications
      
[... continues gathering requirements ...]

BACO: Generating your customized baco.md file...
```

For a quick template instead, use: `/baco init --template`

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

### 3. Generate Development Plan

```
/baco plan
```

BACO analyzes your requirements and provides:
- Recommended architecture
- Implementation phases
- Technology suggestions
- Team composition (which specialist agents to consult)

### 4. Execute Implementation

```
/baco execute
```

Generates a comprehensive Product Requirements Prompt (PRP) to guide implementation.

## 🚀 New Features (Phases 4-5 Complete!)

### 🤖 Multi-Agent Workflows
BACO now orchestrates teams of specialized AI agents working together:

```
/workflow product-planning  # PM → PO → SM workflow
/workflow implementation   # Architect → Developer → QA workflow
/workflow ui-feature      # UX → Developer → QA workflow
```

**14 Specialized Agents** with domain expertise:
- **Winston** (Architect), **James** (Developer), **Elena** (QA)
- **Marcus** (Security), **John** (PM), **Sarah** (PO)
- **Bob** (SM), **Sally** (UX), **BMad Master** (Meta-orchestrator)
- **BACO Orchestrator** (Complexity analysis)
- **Vision** (Style Guide Generator), **Fusion** (Design Optimizer)
- **Motion** (Interactivity), **Voice** (Microcopy)

### 🎯 Git Integration
Seamless version control throughout development:
```
Options:
[ ] Initialize Git repository
[ ] Create feature branch  
[ ] Commit after each phase

Your choice (1-4) [include options like "1 git branch"]: 1 git branch
```

Features:
- Auto-initialize repositories
- Commit after each development phase
- Create feature branches
- Generate PR descriptions
- Smart gitignore templates

### 📱 Live Preview
Instant development server with mobile support:
```
🚀 Starting development server...
✅ Server running at http://localhost:3000

📱 Mobile Preview:
[QR Code displayed here]

URLs for mobile devices:
• http://192.168.1.100:3000
```

### 🔧 Incremental Updates
Add features to existing projects safely:
```
/add-feature auth-jwt      # Add JWT authentication
/add-feature api-graphql   # Add GraphQL endpoint
/update-deps              # Smart dependency updates
```

Features:
- Analyze existing code before changes
- Automatic backups
- Intelligent code merging
- Conflict resolution
- Breaking change detection

## 🎨 AI-Driven UI Enhancement System (New!)

BACO now includes a sophisticated UI improvement system inspired by industry best practices:

### Specialized UI Agents
Four new agents work together to transform your UI:

- **Vision** 👁️ - Extracts design tokens from visual inspiration
- **Fusion** 🔄 - Optimizes tokens for your target audience using design psychology
- **Motion** ✨ - Adds purposeful micro-interactions and animations (60fps guaranteed)
- **Voice** 💬 - Ensures consistent microcopy and brand voice

### UI Quality Commands

#### `/ui-improve` - Comprehensive UI Enhancement
```
/ui-improve --screen dashboard --focus visual

📸 Capturing Current UI State...
👁️ Extracting Design Patterns (Vision)
🎯 UI Quality Assessment: 6.2/10
🔄 Optimizing for Target Audience (Fusion)
✨ Adding Micro-interactions (Motion)
💬 Improving Microcopy (Voice)

✅ Improvements Ready:
- Fixed 3 critical accessibility issues
- Added 12 micro-interactions
- Standardized 24 UI strings
- Created design token system
```

#### `/ui-score` - Detailed Quality Assessment
```
/ui-score --detailed

🎯 UI Quality Assessment
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Visual Consistency      8.2/10
Design System          7.5/10
Accessibility          6.8/10 ⚠️
Interactivity          7.0/10
Microcopy              7.8/10
Performance            8.5/10
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Overall Score:         7.4/10 (B+)
```

### Key Features
- **Token-Based Design Systems** - Automatic extraction from screenshots
- **Audience-Specific Optimization** - UI tailored to user psychology
- **Performance-First Animations** - All interactions maintain 60fps
- **Continuous UI Healing** - Automated quality monitoring and fixes
- **Voice Consistency** - Brand personality in every word

### Example Workflow
```bash
# Start with visual inspiration
/ui-improve
> "Analyze my dashboard and make it more professional"

# Get detailed scoring
/ui-score --compare baseline

# Watch continuous improvement
UI scores improved from 6.2 → 8.7 (+40%)
```

## 🆕 Interactive Workflow with Code Generation

BACO now features a **fully interactive experience** that guides you seamlessly from project definition to **actual working code**:

### Complete Development Flow
```
/baco init → Interactive setup → Auto-plan → Auto-execute → Real code + Git + Preview
```

**BACO now generates actual code files with professional features:**
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

See the [Interactive BACO Guide](docs/interactive-baco-guide.md) and [Code Generation Guide](docs/code-generation-guide.md) for details.

## Real-World Examples

BACO includes 14 examples covering common project types:

### Web Applications
- **E-commerce Platform**: Multi-vendor marketplace with payment processing
- **SaaS Dashboard**: Multi-tenant B2B application with subscription billing
- **Content Management System**: Headless CMS with multi-language support

### Mobile & Real-time
- **Mobile Backend**: API backend with push notifications and offline sync
- **Chat Application**: Real-time messaging with WebSocket support
- **Video Streaming**: Scalable video platform with CDN integration

### Developer Tools & Infrastructure
- **API Gateway**: Microservices gateway with rate limiting
- **Analytics Platform**: Data pipeline with visualization dashboards
- **Developer Tools**: Code analysis and collaboration platform

View all examples in the `examples/` directory.

## Core Commands

### Project Commands
- `/baco init` - Start interactive project setup conversation
- `/baco init --template` - Create a basic template for manual editing
- `/baco validate` - Check your baco.md syntax
- `/baco plan` - Generate a development plan
- `/baco execute` - Create implementation guide

### UI Enhancement Commands
- `/ui-improve` - Run comprehensive UI enhancement pipeline
- `/ui-score` - Get detailed UI quality assessment

### Traditional Commands
- `/analyze [task]` - Analyze task complexity
- `/orchestrate [task]` - Get multi-agent perspectives
- `/generate-prp [task]` - Generate implementation guide

## The baco.md Format

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

## When to Use BACO

BACO is most valuable for:
- New project planning and architecture
- Complex features requiring multiple components
- Projects with specific technical constraints
- Team collaboration on requirements
- Maintaining consistency across a codebase

## License

MIT License - see [LICENSE](LICENSE) for details.

## Contributing

Contributions are welcome. See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## Documentation

- [Usage Guide](USAGE.md) - Detailed command reference
- [Technical Architecture](TECHNICAL.md) - Implementation details
- [Examples](examples/) - Sample project definitions

---

For issues and discussions: [github.com/bacoco/BACO](https://github.com/bacoco/BACO/issues)