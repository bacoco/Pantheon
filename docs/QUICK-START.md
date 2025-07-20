# BACO Quick Start Guide

## Overview
This guide walks through implementing BACO from scratch using the previous implementation guides with Claude Code.

## Implementation Order

### Phase 1: Project Setup (30 mins)
1. Use `00-PROJECT-SETUP.md` with Claude Code to:
   - Initialize Poetry project
   - Create directory structure
   - Setup dependencies
   - Create base configuration

```bash
# After Claude Code generates the setup:
cd baco
poetry install
poetry run baco --help  # Verify CLI works
```

### Phase 2: Core Components (2-3 hours)
2. Implement Complexity Analyzer using `01-COMPLEXITY-ANALYZER.md`
3. Build Agent System using `02-AGENT-SYSTEM.md`
4. Create Context Management using `03-CONTEXT-MANAGEMENT.md`

```bash
# Test each component as you build:
poetry run pytest tests/test_complexity.py -v
poetry run pytest tests/test_agents.py -v
poetry run pytest tests/test_context.py -v
```

### Phase 3: Orchestration (1-2 hours)
5. Implement Orchestrator using `04-ORCHESTRATOR.md`
6. Build CLI Interface using `05-CLI-INTERFACE.md`

### Phase 4: Testing & Validation (1 hour)
7. Add comprehensive tests using `06-TESTING-VALIDATION.md`
8. Run full test suite and fix any issues

## Example Usage

### 1. Initialize Configuration
```bash
poetry run baco config --init

# Edit ~/.baco/config.yaml to add your OpenAI API key:
# openai_api_key: "sk-..."
```

### 2. Simple Project Example
```bash
# Plan a basic CRUD API
poetry run baco plan \
  --project "TODO list API with user authentication" \
  --requirements "User registration and login" \
  --requirements "CRUD operations for tasks" \
  --requirements "PostgreSQL database" \
  --tech-stack "FastAPI" \
  --tech-stack "PostgreSQL" \
  --tech-stack "SQLAlchemy" \
  --output todo-api.prp
```

Expected output:
```
╭─────────────────────────────────────╮
│     BACO Planning Phase             │
│ Project: TODO list API with user... │
╰─────────────────────────────────────╯

⠋ Analyzing project complexity...
✓ Complexity: SIMPLE

Selected Agents:
  🤖 developer - Core development expertise
  🤖 qa - Quality assurance and testing

⠋ Running agent analysis...
✓ Planning complete in 8.3s

Tokens used: 2,847
Patterns found: 2 (auth-pattern, crud-pattern)

✓ PRP saved to: todo-api.prp
```

### 3. Complex Project Example
```bash
# Plan a microservices platform
poetry run baco plan \
  --project "E-commerce platform with microservices architecture" \
  --requirements "Product catalog service" \
  --requirements "Order management service" \
  --requirements "Payment processing with Stripe" \
  --requirements "Real-time inventory updates" \
  --requirements "99.9% uptime SLA" \
  --tech-stack "Python" \
  --tech-stack "Kubernetes" \
  --tech-stack "PostgreSQL" \
  --tech-stack "Redis" \
  --tech-stack "Kafka" \
  --live \
  --output ecommerce.prp
```

With `--live` flag, see agent deliberation:
```
Live Agent Deliberation:

Developer:
├─ Confidence: 0.92
└─ "Microservices architecture requires careful service boundaries..."

Architect:
├─ Confidence: 0.88  
└─ "Event-driven pattern with Kafka for service communication..."

Security:
├─ Confidence: 0.95
└─ "Payment processing requires PCI compliance considerations..."

Performance:
├─ Confidence: 0.85
└─ "Redis caching strategy for inventory queries..."
```

### 4. Build Phase
```bash
# Execute the generated PRP
poetry run baco build --prp ecommerce.prp --live

# Or use Claude Code directly:
# "Here's my PRP, please implement: [paste PRP content]"
```

### 5. View Learned Patterns
```bash
# List all patterns BACO has learned
poetry run baco patterns --list

# Search for specific patterns
poetry run baco patterns --search "authentication"

# View pattern statistics
poetry run baco patterns --stats
```

## Configuration Examples

### Custom Agent Configuration
Add to `~/.baco/config.yaml`:

```yaml
agents:
  - name: "database_expert"
    triggers: 
      - "database"
      - "postgresql"
      - "optimization"
      - "migration"
    system_prompt: |
      You are a database architecture expert specializing in PostgreSQL.
      Focus on schema design, query optimization, and migration strategies.
    enabled: true
```

### Complexity Thresholds
```yaml
# Adjust agent limits
max_agents_simple: 2
max_agents_medium: 5  
max_agents_complex: 10

# Adjust context window
context_window_size: 16000  # For GPT-4-turbo
```

## Practical Workflows

### Workflow 1: Rapid Prototyping
```bash
# Quick prototype with minimal agents
poetry run baco plan \
  --project "MVP for startup idea" \
  --requirements "Quick proof of concept" \
  --config ~/.baco/prototype.yaml  # Uses only developer agent
```

### Workflow 2: Enterprise Project
```bash
# Full analysis for enterprise system
poetry run baco plan \
  --project "Enterprise resource planning system" \
  --requirements "Multi-tenant architecture" \
  --requirements "SOC2 compliance" \
  --requirements "50+ modules" \
  --patterns  # Show similar past projects
  --verbose   # Detailed analysis
```

### Workflow 3: Learning from Success
```bash
# After successful project implementation:
poetry run baco learn \
  --project "path/to/successful/project" \
  --metrics "tests_passed=100,performance_score=95"
  
# BACO will extract and store patterns for future use
```

## Troubleshooting

### Common Issues

1. **"Low confidence" warnings**
   - Add more specific requirements
   - Use `--verbose` to see what's unclear
   - Consider manual agent selection with `--agent`

2. **Token limit exceeded**
   - Reduce project description verbosity
   - Use `--config` with higher context_window_size
   - Split into sub-projects

3. **Slow performance**
   - Check API rate limits
   - Use `--no-patterns` to skip pattern search
   - Reduce max agents in config

### Debug Mode
```bash
# Enable debug logging
export BACO_DEBUG=1
poetry run baco plan --project "Debug test"

# View detailed orchestration logs
tail -f ~/.baco/logs/orchestration.log
```

## Integration Examples

### CI/CD Integration
```yaml
# .github/workflows/baco-plan.yml
- name: Generate PRP with BACO
  run: |
    poetry run baco plan \
      --project "${{ github.event.issue.body }}" \
      --output prp.md
    
- name: Create PR with PRP
  uses: peter-evans/create-pull-request@v5
  with:
    title: "BACO Generated PRP"
    body-path: prp.md
```

### IDE Integration
```json
// VS Code task.json
{
  "label": "BACO Plan",
  "type": "shell",
  "command": "poetry run baco plan --project '${input:projectDescription}'",
  "problemMatcher": []
}
```

## Next Steps

1. **Experiment with Different Projects**
   - Try various complexity levels
   - Test edge cases
   - Build pattern library

2. **Customize for Your Workflow**
   - Add domain-specific agents
   - Tune complexity thresholds
   - Create project templates

3. **Contribute Improvements**
   - Share successful patterns
   - Submit agent implementations
   - Improve orchestration logic

## Resources
- BACO Documentation: [link]
- Claude Code Best Practices: [link]
- Community Patterns: [link]
- Support Discord: [link]