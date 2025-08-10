# 📚 Pantheon GOD Ultimate - Documentation Index

## Core Documentation

### Quick References
- **[GODS-SIMPLE.md](GODS-SIMPLE.md)** - Simplified `/gods` command usage
- **[GODS-COMMAND.md](GODS-COMMAND.md)** - Complete `/gods` command reference
- **[PANTHEON-USAGE-GUIDE.md](PANTHEON-USAGE-GUIDE.md)** - Traditional Task() usage

### System Documentation
- **[README.md](../README.md)** - Complete .claude structure overview
- **[CLAUDE.md](../CLAUDE.md)** - Divine Council configuration

## Usage Patterns

### 1. Simple Mode (`/gods`)
The easiest way - one command for everything:
```bash
/gods create todo app with authentication
/gods fix the logout bug
/gods review my code
```

### 2. Direct God Invocation
Traditional Task() approach for specific gods:
```javascript
Task("zeus-ultimate", "Orchestrate project")
Task("apollo-enhanced", "Analyze stripe.com")
Task("mimesis", "Clone airbnb.com")
```

### 3. Expert Summoning
Direct access to Claude Code Studio experts:
```javascript
await summon_expert({
  expert_name: "senior-software-engineer",
  task_prompt: "Design microservices architecture"
});
```

### 4. Hybrid Orchestration
Zeus coordinates both gods and experts:
```javascript
Task("zeus-ultimate", `
  1. Apollo analyzes reference sites
  2. Summon product-manager for PRD
  3. Orchestrate engineers for implementation
  4. Oracle validates quality
`);
```

## Available Resources

### Gods (15 Divine Agents)
Located in `.claude/agents/`:
- **Creation**: Zeus, Athena, Hephaestus, Daedalus
- **Validation**: Apollo, Oracle, Themis, Argus
- **Support**: Hermes, Calliope, Iris
- **Specialized**: Thoth, Aegis, Githeus
- **Enhanced**: Zeus-Ultimate, Apollo-Enhanced, Mimesis

### Experts (47 Mortal Specialists)
Located in `.claude/experts/`:
- **Engineering**: 12 experts
- **Product/Design**: 8 experts  
- **Marketing**: 7 experts
- **Testing**: 5 experts
- **Utilities**: 5 experts
- **Bonus**: 2 experts

### MCP Tools (11 Total)
- **UI Design Analyzer**: 6 tools
  - firecrawl_scrape_design
  - screenshot_analyze
  - ui_pattern_extract
  - design_system_generate
  - color_palette_extract
  - layout_analyze
- **Divine Assembly**: 5 tools
  - summon_expert
  - list_experts
  - get_expert_info
  - orchestrate_experts
  - get_session_status

## Command Cheatsheet

### Project Creation
```bash
# Complete flow
/gods create [project description]

# Manual orchestration
Task("divine-council", "Create [project]")

# Zeus coordination
Task("zeus-ultimate", "Build [project] using gods and experts")
```

### Design & Analysis
```bash
# Simple
/gods design modern dashboard

# Enhanced Apollo
Task("apollo-enhanced", "Analyze [website] design system")

# Mimesis cloning
Task("mimesis", "Clone [website] for [purpose]")
```

### Implementation
```bash
# Simple
/gods build user authentication

# Direct
Task("hephaestus", "Implement [feature]")

# With expert
await summon_expert({
  expert_name: "frontend-developer",
  task_prompt: "Build React components"
});
```

### Quality & Testing
```bash
# Simple
/gods test the API endpoints

# Oracle gates
Task("oracle", "Review and validate implementation")

# Security
Task("argus", "Security audit of [component]")
```

## Workflow Examples

### Example 1: SaaS Dashboard
```javascript
// Using /gods command
"/gods create SaaS dashboard inspired by Linear and Stripe"

// Using Zeus Ultimate
Task("zeus-ultimate", `
  Project: SaaS Dashboard
  1. Apollo analyzes Linear and Stripe designs
  2. Summon product-manager for requirements
  3. Athena designs architecture
  4. Orchestrate frontend and backend developers
  5. Oracle validates quality
`);
```

### Example 2: Website Recreation
```javascript
// Simple
"/gods recreate airbnb for co-working spaces"

// Using Mimesis
Task("mimesis", "Clone airbnb.com but adapt for co-working spaces")

// With analysis
Task("apollo-enhanced", "Extract airbnb design patterns")
Task("mimesis", "Recreate with extracted patterns")
```

### Example 3: Expert Team
```javascript
// Orchestrate multiple experts
await orchestrate_experts({
  experts: [
    { name: "product-manager", task: "Create PRD" },
    { name: "ui-designer", task: "Design mockups" },
    { name: "frontend-developer", task: "Implement UI" },
    { name: "test-writer", task: "Create tests" }
  ],
  parallel: true
});
```

## Best Practices

### Use `/gods` for Simplicity
- Natural language requests
- Automatic god selection
- Complete workflows

### Use Task() for Control
- Specific god selection
- Custom parameters
- Complex orchestration

### Use Experts for Specialization
- Deep domain expertise
- Focused tasks
- Parallel execution

### Combine All Three
- Gods for strategy
- Experts for execution
- `/gods` for simplicity

## Troubleshooting

### Command Not Working
1. Check if god exists: `ls .claude/agents/`
2. Verify MCP servers: `.claude/install.sh`
3. Check expert loading: `find .claude/experts -name "*.md" | wc -l`

### API Issues
1. Check keys: `cat .claude/mcp-servers/ui-design-analyzer/.env`
2. Verify Firecrawl key format: `fc-xxxxx`
3. Test without optional keys (OpenAI/Anthropic)

### Performance
1. Check cache: Response caching reduces API calls
2. Use parallel execution: `parallel: true` in orchestration
3. Monitor logs: Check `.claude/mcp-servers/*/logs/`

## Resources

- **Installation**: `.claude/install.sh`
- **Configuration**: `.claude.json`
- **API Keys**: `.claude/mcp-servers/ui-design-analyzer/.env`
- **Gods**: `.claude/agents/`
- **Experts**: `.claude/experts/`
- **Logs**: `.claude/mcp-servers/*/logs/`

---

*Complete documentation for Pantheon GOD Ultimate - Where gods and mortals unite*