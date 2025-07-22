# BACO Smart Routing User Guide

## Overview

Smart Routing is an intelligent task distribution system that automatically selects the best BACO agent(s) for any given task. It analyzes your request, matches it with agent capabilities, and provides transparent routing decisions with confidence scores.

## Quick Start

### Basic Usage

```bash
# Route a task to the best agent
/baco route Design a secure REST API with JWT authentication

# Preview routing without executing
/baco route --preview Implement user dashboard with React

# Auto-accept high-confidence routing
/baco route --auto Fix the login bug
```

### Checking Status

```bash
# View current feature flag status
/help  # Look for Smart Routing status

# View analytics dashboard
/baco analytics

# Check agent performance
/baco analytics agents
```

## How Smart Routing Works

### 1. Task Analysis

When you provide a task, the system analyzes:
- **Domains**: Architecture, implementation, testing, security, UI, etc.
- **Technologies**: React, Node.js, AWS, Docker, etc.
- **Complexity**: 1-10 scale based on scope and requirements
- **Task Type**: Design, implementation, testing, review, planning, analysis
- **Duration Estimate**: Minutes, hours, days, or weeks

### 2. Agent Matching

The system matches your task with agents based on:
- **Domain Expertise** (40% weight): How well the agent's domains match
- **Capability Match** (30% weight): Specific skills required
- **Pattern Recognition** (15% weight): Known successful patterns
- **Complexity Handling** (15% weight): Agent's complexity range

### 3. Routing Decision

You receive:
- **Primary Agent**: Best match with confidence percentage
- **Supporting Agents**: Additional agents for collaboration
- **Alternatives**: Other viable options with tradeoffs
- **Reasoning**: Clear explanation of the decision

## Command Reference

### `/baco route`

The main routing command with options:

```bash
# Basic routing
/baco route <task description>

# With options
/baco route --preview <task>     # Preview without activation
/baco route --details <task>     # Show detailed analysis
/baco route --auto <task>        # Auto-accept if confident
/baco route --json <task>        # JSON output format
```

### `/baco analytics`

View routing performance and insights:

```bash
/baco analytics              # Dashboard view
/baco analytics agents       # Agent performance
/baco analytics domains      # Domain analysis
/baco analytics patterns     # Learned patterns
/baco analytics report       # Weekly report
/baco analytics export json  # Export data
```

### Workflow Integration

Smart Routing works with workflows:

```bash
# Use adaptive workflow with auto-routing
/workflow adaptive-feature

# Create custom workflow with smart routing
/workflow custom
# Choose "auto-route" for dynamic agent selection
```

## Examples by Use Case

### 1. Architecture Design

```bash
/baco route Design microservices architecture for e-commerce platform

# Likely routing:
# Primary: Winston (System Architect) - 90%+ confidence
# Supporting: Marcus (Security) for secure architecture
```

### 2. Bug Fixing

```bash
/baco route Fix authentication bug where users can't login

# Likely routing:
# Primary: James (Developer) - 85%+ confidence
# Supporting: Marcus (Security) for auth validation
```

### 3. UI/UX Design

```bash
/baco route Create accessible mockups for mobile app

# Likely routing:
# Primary: Sally (UX Designer) - 95%+ confidence
# Supporting: Pixel (UI Healer) for quality checks
```

### 4. Testing Strategy

```bash
/baco route Develop comprehensive test plan for payment system

# Likely routing:
# Primary: Elena (QA Lead) - 90%+ confidence
# Supporting: Marcus (Security) for payment security
```

### 5. Complex Multi-Domain

```bash
/baco route Build complete user management system with frontend and backend

# Likely routing:
# Primary: BMad Master (Orchestrator) - 85%+ confidence
# Team suggestion for coordinated development
```

## Understanding Confidence Scores

- **90-100%**: Excellent match - agent is ideal for this task
- **80-89%**: Strong match - agent will handle it well
- **70-79%**: Good match - agent is capable, consider alternatives
- **60-69%**: Moderate match - review alternatives carefully
- **Below 60%**: Weak match - manual selection recommended

## Manual Override

You always have control:

```yaml
Options:
1. ✅ Accept routing (activate Winston)
2. 🔄 Choose alternative agent
3. 📝 Modify task description
4. ❌ Cancel

Your choice: 2

Select alternative agent:
1. BMad Master (75%) - Orchestration approach
2. James (60%) - Implementation focus
3. Manual selection
```

## Best Practices

### 1. Be Specific

❌ Vague: "Help with the thing"
✅ Clear: "Fix the user profile image upload feature"

### 2. Include Context

❌ Minimal: "Build API"
✅ Detailed: "Build REST API for user management with Node.js and PostgreSQL"

### 3. Mention Constraints

✅ "Design a scalable architecture that must handle 10k concurrent users"
✅ "Implement feature following our existing React patterns"

### 4. Use Preview Mode

Test routing decisions before committing:
```bash
/baco route --preview Complex task description
```

### 5. Review Analytics

Check routing effectiveness:
```bash
/baco analytics agents  # See which agents perform best
/baco analytics patterns  # Learn from successful patterns
```

## Troubleshooting

### Issue: Low Confidence Scores

**Symptom**: Consistently getting <70% confidence

**Solutions**:
1. Provide more detailed task descriptions
2. Break complex tasks into smaller pieces
3. Check if task matches any agent's expertise

### Issue: Wrong Agent Selected

**Symptom**: Routing doesn't match your expectations

**Solutions**:
1. Use manual override to select preferred agent
2. Update task description with more domain keywords
3. Report pattern for system improvement

### Issue: Feature Not Working

**Symptom**: Smart routing commands not recognized

**Check**:
1. Feature flag status (should show in `/help`)
2. Use `/baco route` not just `/route`
3. Ensure you're on the latest BACO version

## Advanced Features

### Adaptive Workflows

Create workflows that adapt to each task:

```bash
/workflow adaptive-feature

# Each step is analyzed and routed dynamically
Step 1: Analyze requirements → John (PM) selected
Step 2: Design solution → Winston (Architect) selected
Step 3: Implementation → James (Developer) selected
```

### Pattern Learning

The system learns from successful routings:
- After 3+ successful similar tasks, patterns are recognized
- Future similar tasks get higher confidence routing
- View learned patterns with `/baco analytics patterns`

### Team Suggestions

For complex tasks, get team composition:
```yaml
Suggested Team Composition:
- Winston: Architecture design
- James: Implementation
- Marcus: Security
- Elena: Testing
```

## Configuration

Smart Routing can be configured through feature flags:

```javascript
SMART_ROUTING: {
  enabled: true,                    // Master switch
  ROUTING_PREVIEW_MODE: true,       // Show preview by default
  AUTO_ROUTE_THRESHOLD: 0.7,        // Auto-accept above 70%
  SUGGEST_COLLABORATION: true,      // Suggest supporting agents
  MAX_SUPPORTING_AGENTS: 2          // Max supporting suggestions
}
```

## Privacy & Analytics

- Task descriptions are analyzed locally
- No external API calls are made
- Analytics are stored locally and anonymized
- Clear analytics with `/baco analytics clear`

## Future Enhancements

Coming soon:
- Sub-agent routing for specialized tasks
- Parallel routing for independent subtasks
- Custom routing rules and preferences
- API access for external integrations

## FAQ

**Q: Can I disable Smart Routing?**
A: Yes, it's controlled by feature flags and can be disabled.

**Q: Does it replace manual agent selection?**
A: No, it augments it. You always have manual override.

**Q: How accurate is the routing?**
A: Currently achieving 80%+ acceptance rate in testing.

**Q: Can I train it on my patterns?**
A: Yes, it learns from successful task completions.

**Q: What happens if no agent matches?**
A: Falls back to BMad Master for orchestration.

## Getting Help

- Use `/help` to see all commands
- Check `/baco analytics` for performance insights
- Review this guide for best practices
- Report issues or suggestions to improve routing

Smart Routing makes BACO more intelligent and efficient while maintaining full transparency and user control.