# /help Command - BACO Command Reference

ACTIVATION: When user types `/help`, display available commands and usage.

## 🆕 New: Simplified Workflow with baco.md

BACO now supports a simplified workflow using `baco.md` files:

### Quick Start
```bash
/baco init     # Create a template baco.md file
/baco plan     # Generate development plan from baco.md
/baco execute  # Execute the plan
```

## Available Commands

### 📄 BACO Commands (NEW)
#### `/baco`
Main command for simplified workflow using baco.md files.

**Subcommands**:
- `/baco init` - Create a template baco.md file
- `/baco plan` - Generate development plan from baco.md
- `/baco validate` - Validate baco.md syntax and structure
- `/baco execute` - Execute the development plan

**Usage**: 
```
/baco init
# Edit baco.md with your requirements
/baco plan
```

### 📊 `/analyze <task>`
Perform multi-dimensional complexity analysis of a software development task.

**Usage**: `/analyze Build a real-time notification system`

**Output**: Detailed analysis across 5 dimensions (technical, domain, scale, team, timeline) with complexity scoring and recommendations.

### 🎭 `/orchestrate <task>`
Coordinate multiple specialist agents to provide comprehensive insights.

**Usage**: `/orchestrate Design a payment processing microservice`

**Output**: Perspectives from relevant agents (Architect, Developer, QA, Security) synthesized into actionable recommendations.

### 📝 `/generate-prp <task>`
Generate a complete Product Requirements Prompt for implementation.

**Usage**: `/generate-prp Create user authentication with JWT`

**Output**: Comprehensive implementation guide with context, tasks, validation strategy, and success criteria.

### 🧠 `/learn-pattern <task> <outcome>`
Evaluate and store successful implementation patterns for future use.

**Usage**: `/learn-pattern "WebSocket chat implementation" "Success: 50ms latency, 10k users"`

**Output**: Pattern evaluation and storage decision with applicability conditions.

### ❓ `/help`
Display this help message with command descriptions and usage examples.

## Quick Start Guide

1. **Start with Analysis**: Always begin by analyzing task complexity
   ```
   /analyze Create a REST API for inventory management
   ```

2. **Get Expert Insights**: For complex tasks, orchestrate multiple agents
   ```
   /orchestrate Build a distributed event processing system
   ```

3. **Generate Implementation Guide**: Create detailed PRPs for development
   ```
   /generate-prp Implement OAuth2 authentication flow
   ```

4. **Learn from Success**: Record patterns from successful implementations
   ```
   /learn-pattern "Microservice deployment" "Achieved 99.9% uptime"
   ```

## Specialist Agents

When using `/orchestrate`, these specialists may be activated:

- **🏗️ Winston (Architect)**: System design, scalability, technology selection
- **💻 James (Developer)**: Implementation approach, code quality, best practices
- **✅ Elena (QA)**: Testing strategy, user experience, quality assurance
- **🔒 Marcus (Security)**: Threat modeling, security controls, compliance

## The baco.md File Format

Create structured project requirements with YAML frontmatter and markdown sections:

```yaml
---
version: 1.0
project_type: "FastAPI Web Service"
author: "Your Name"
---

## FEATURE: Feature Name
Description of the feature...

## EXAMPLES:
- `./examples/pattern.py`: Description of example

## DOCUMENTATION:
- `https://docs.example.com`: Framework documentation

## CONSTRAINTS:
- Technical requirements and constraints

## OTHER CONSIDERATIONS:
Additional context...
```

See the `examples/` directory for complete examples:
- `baco-orchestrator.baco.md` - BACO itself (meta-example)
- `ecommerce-platform.baco.md` - E-commerce platform
- `saas-dashboard.baco.md` - Multi-tenant SaaS
- `chat-messaging.baco.md` - Real-time chat
- `video-streaming.baco.md` - Video platform
- `cms-platform.baco.md` - Content management
- `analytics-platform.baco.md` - Data analytics
- `ml-api-service.baco.md` - Machine learning API
- `developer-tools.baco.md` - Developer tools
- And more...

## Tips for Effective Use

1. **Use baco.md for Complex Projects**: Structured requirements lead to better results
2. **Provide Examples**: BACO learns from your coding patterns
3. **Be Specific**: The more context you provide, the better the analysis
4. **Iterate**: Use analysis results to refine your orchestration requests
5. **Learn Continuously**: Record successful patterns to build institutional knowledge
6. **Combine Commands**: Use analysis → orchestration → PRP generation for complex projects

## Examples by Scenario

### Simple Feature

**Traditional Approach:**
```
/analyze Add a search function to the user list
/generate-prp Add a search function to the user list
```

**New baco.md Approach:**
```
/baco init
# Edit baco.md with search feature requirements
/baco plan
/baco execute
```

### Complex System

**Traditional Approach:**
```
/analyze Build a real-time collaborative editing platform
/orchestrate Build a real-time collaborative editing platform
/generate-prp Implement operational transformation for collaborative editing
```

**New baco.md Approach:**
```
/baco init
# Add multiple features, examples, and constraints to baco.md
/baco validate  # Check for errors
/baco plan      # Review comprehensive plan
/baco execute   # Implement with full context
```

### Security-Critical
```
/analyze Implement payment processing with PCI compliance
/orchestrate Implement payment processing with PCI compliance
/learn-pattern "PCI-compliant payment flow" "Passed security audit"
```

## Need More Help?

- Provide more context for better analysis
- Combine multiple commands for comprehensive guidance
- Review stored patterns for similar past implementations