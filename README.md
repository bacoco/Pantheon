# BACO - Basic Adaptive Context Orchestrator

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

This generates a template `baco.md` file. Edit it to describe your project:

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

- `/baco init` - Create a project definition template
- `/baco validate` - Check your baco.md syntax
- `/baco plan` - Generate a development plan
- `/baco execute` - Create implementation guide

For traditional usage:
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