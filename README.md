# 🏛️ Pantheon Multi-AI Ecosystem with Divine Council

> **Orchestrating Claude and Gemini models through mythological divine collaboration**

The Pantheon Multi-AI Ecosystem is a sophisticated orchestration framework that coordinates multiple AI models (Claude and Gemini) in a collaborative development environment. Now enhanced with the **Divine Council** system from BACO Pantheon, it uses mythological god agents to make AI collaboration intuitive and powerful.

## ⚡ New: Divine Council Integration

The ecosystem now includes a divine council of specialized AI agents:
- **Creation Gods** (Claude): Zeus, Athena, Hephaestus - for building and architecting
- **Validation Gods** (Gemini): Apollo, Themis, Argus - for testing and validation
- **Support Gods** (Gemini Flash): Hermes, Calliope - for quick tasks and documentation

Using the Claude Code Router, the system intelligently routes tasks between Claude Code CLI (your max plan) and Gemini CLI (free tier) for optimal quality and cost.

## 🚀 Quick Start

```bash
# Clone the repository
git clone https://github.com/yourusername/pantheon-multi-ai.git
cd pantheon-multi-ai

# Install dependencies
npm install

# Copy and configure environment variables
cp .env.pantheon .env
# Edit .env and add your API keys

# Run setup script
npm run setup

# Start the ecosystem
npm start
```

## 📁 Project Structure

```
pantheon-multi-ai/
├── .claude/                    # Agent ecosystem configuration
│   ├── agents/                 # Agent definitions
│   │   ├── creation/          # Claude creator agents
│   │   ├── validation/        # Gemini validator agents
│   │   ├── synthesis/         # Research and synthesis agents
│   │   ├── management/        # System management agents
│   │   └── specialized/       # Domain-specific agents
│   ├── configs/               # System configuration
│   │   ├── model-routing.json
│   │   └── tool-permissions.json
│   ├── schemas/               # JSON schemas for validation
│   ├── workflows/             # Workflow definitions
│   └── templates/             # Agent and workflow templates
├── src/                       # Source code
│   ├── agents/               # Agent implementations
│   ├── router/               # Smart routing system
│   ├── workflows/            # Workflow engine
│   ├── validation/           # Validation pipeline
│   └── cli/                  # Command-line tools
├── docs/                      # Documentation
├── tests/                     # Test suites
└── scripts/                   # Utility scripts
```

## 🎯 Core Concepts

### Agent Types

1. **Creator Agents (Claude)**
   - `claude-architect`: System design and architecture
   - `claude-builder`: Feature implementation
   - `claude-documenter`: Documentation generation

2. **Validator Agents (Gemini)**
   - `gemini-advisor`: Primary validation specialist
   - `gemini-synthesizer`: Research and synthesis
   - `gemini-ui-designer`: UI/UX consultation

3. **Management Agents**
   - `model-manager`: Model attribution control
   - `agent-orchestrator`: Workflow coordination
   - `cost-optimizer`: Usage optimization

### Key Principles

- 🚫 **Gemini NEVER writes code** - Only validates and advises
- ✅ **Automatic validation** - Key checkpoints trigger validation
- 💰 **Cost optimization** - Smart routing based on task requirements
- 🔄 **Workflow orchestration** - Complex multi-agent coordination
- 🔒 **Safety first** - Strict permission enforcement

## 🏛️ Divine Council Commands

### Using the Gods

The Divine Council provides mythological-themed commands for intuitive AI collaboration:

```bash
# Start a divine council session
/gods plan "Build authentication system"

# Execute implementation with divine builders
/gods execute

# Validate with divine validators (Gemini CLI)
/gods validate

# Quick status check
/gods status
```

### God Routing

| God | Role | Provider | Usage |
|-----|------|----------|-------|
| **Zeus** ⚡ | Orchestrator | Claude Code | Project leadership |
| **Athena** 🦉 | Architect | Claude Code | System design |
| **Hephaestus** 🔨 | Builder | Claude Code | Implementation |
| **Apollo** ☀️ | Validator | Gemini CLI | Quality testing |
| **Hermes** 👟 | Messenger | Gemini CLI | Quick updates |

### Claude Code Router

The system uses intelligent routing:
- **Creation tasks** → Claude Code CLI (your current session)
- **Validation tasks** → Gemini CLI (run `gemini "..."` in terminal)
- **All FREE** → Claude max plan + Gemini free tier

### Example Workflow

```bash
# In Claude Code CLI
You: /gods plan "Build real-time chat"

# Claude responds (Zeus + Athena work here)
Claude: ⚡ Orchestrating... 🦉 Designing architecture...

# System suggests Gemini validation
System: Run: gemini "Validate chat architecture..."

# You run in terminal and paste results back
$ gemini "Validate chat architecture..."
```

## 🔧 Configuration

### Environment Variables

Edit `.env` file with your API keys and preferences:

```bash
# Required API Keys
CLAUDE_API_KEY=your_claude_api_key
GEMINI_API_KEY=your_gemini_api_key

# Routing Strategy (cost-optimized, quality-focused, speed-focused, balanced)
ROUTING_STRATEGY=balanced

# Validation Mode (strict, optional, none)
VALIDATION_MODE=strict
```

### Model Routing

Configure routing strategies in `.claude/configs/model-routing.json`:

```json
{
  "routing_strategies": {
    "cost_optimized": {
      "creation": "claude,sonnet",
      "validation": "gemini,gemini-2.5-pro",
      "quick_tasks": "gemini,gemini-2.5-flash"
    }
  }
}
```

## 📋 Workflows

### Feature Development Workflow

```bash
# Start a feature development workflow
npm run workflow:run -- feature-development --feature="user-authentication"
```

Stages:
1. Requirements analysis (Gemini)
2. Architecture design (Claude)
3. Architecture validation (Gemini)
4. Implementation (Claude)
5. Code review (Gemini)
6. Testing (Claude)
7. Documentation (Claude)

### Bug Fix Workflow

```bash
# Start a bug fix workflow
npm run workflow:run -- bug-fix --issue="payment-processing-error"
```

## 🛠️ CLI Commands

```bash
# Spawn an agent
npm run agent:spawn -- --type=creator --name=claude-architect

# Run a workflow
npm run workflow:run -- [workflow-name] [options]

# Start the router
npm run router:start

# Run tests
npm test

# Clean cache and logs
npm run clean
```

## 📊 Monitoring

The ecosystem provides comprehensive monitoring:

- **Cost tracking**: Real-time API usage and costs
- **Performance metrics**: Agent response times and throughput
- **Validation reports**: Success rates and issue tracking
- **Workflow analytics**: Completion times and bottlenecks

## 🧪 Testing

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Watch mode for development
npm run test:watch
```

## 🔐 Security

- Gemini models are restricted to read-only operations
- Tool permissions enforced at multiple levels
- Audit logging for all file modifications
- Emergency override requires authentication

## 📚 Documentation

- [Complete Setup Guide](docs/setup.md)
- [Agent Development](docs/agents.md)
- [Workflow Creation](docs/workflows.md)
- [API Reference](docs/api.md)
- [Troubleshooting](docs/troubleshooting.md)

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
3. Implement your changes with tests
4. Ensure validation passes
5. Submit a pull request

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details

## 🙏 Acknowledgments

- Built on Claude (Anthropic) and Gemini (Google) APIs
- Inspired by multi-agent system architectures
- Community contributions and feedback

---

**Status**: 🟢 Active Development | **Version**: 0.1.0 | **Last Updated**: January 2025
