# 🏛️ Pantheon Usage Guide

## Quick Start

Pantheon gods are Claude Code sub-agents invoked using the Task tool. Each god specializes in specific aspects of development.

## Invoking Gods

### Basic Syntax
```javascript
Task("God Name", "Your request here")
```

### Examples

#### Planning & Architecture
```javascript
// Orchestrate a project
Task("Zeus", "Plan authentication system with JWT tokens")

// Design architecture  
Task("Athena", "Design microservices architecture for e-commerce platform")

// System design
Task("Daedalus", "Engineer database schema for user management")
```

#### Implementation
```javascript
// Build features
Task("Hephaestus", "Implement user registration with email verification")

// Security architecture
Task("Aegis", "Design secure API authentication flow")
```

#### Validation & Testing
```javascript
// Quality validation
Task("Apollo", "Validate code quality and test coverage")

// Security audit
Task("Argus", "Scan for security vulnerabilities in authentication")

// Compliance check
Task("Themis", "Verify GDPR compliance in user data handling")

// Oracle quality gates
Task("Oracle", "Review and approve current implementation")
```

#### Support & Documentation
```javascript
// Documentation
Task("Calliope", "Write comprehensive API documentation")

// UI/UX design
Task("Iris", "Design user-friendly login interface")

// Communication
Task("Hermes", "Research best practices for JWT implementation")

// Version control
Task("Githeus", "Create meaningful commit for authentication feature")

// Specifications
Task("Thoth", "Create formal specification for payment system")
```

### Divine Council (Multiple Gods)
```javascript
// Collaborative session
Task("Divine Council", "Plan and implement shopping cart feature")

// This automatically orchestrates:
// 1. Zeus for planning
// 2. Athena for architecture
// 3. Hephaestus for implementation
// 4. Apollo for testing
// 5. Calliope for documentation
```

## Hooks Configuration

### Pre-commit Validation
The `.githooks/pre-commit` automatically invokes:
- Apollo for code quality
- Oracle for quality gates
- Argus for security

### Pre-push Validation
The `.githooks/pre-push` performs comprehensive validation before pushing.

### Custom Hooks
Create `.claude/hooks.json`:
```json
{
  "hooks": [
    {
      "event": "PostToolUse",
      "matcher": {
        "tool": "Edit"
      },
      "command": "echo 'Hephaestus watches your code' >> .pantheon/forge.log"
    }
  ]
}
```

## MCP Enhancement (Optional)

For enhanced capabilities, install MCP servers:
```bash
./install-divine-tools.sh
```

This adds:
- Task orchestration (task-master)
- Memory persistence (basic-memory)
- Code analysis (serena)
- UI components (shadcn-ui)
- GitHub integration (github)

## Workflow Examples

### Feature Development
```javascript
// 1. Plan
Task("Zeus", "Plan user authentication feature")

// 2. Design
Task("Athena", "Design authentication architecture")

// 3. Implement
Task("Hephaestus", "Build login and registration endpoints")

// 4. Test
Task("Apollo", "Write comprehensive tests for authentication")

// 5. Document
Task("Calliope", "Document authentication API endpoints")

// 6. Commit
Task("Githeus", "Create commit for authentication feature")
```

### Bug Fix
```javascript
// 1. Investigate
Task("Hermes", "Research error: JWT token expiration issue")

// 2. Fix
Task("Hephaestus", "Fix JWT token expiration handling")

// 3. Test
Task("Apollo", "Test JWT expiration scenarios")

// 4. Validate
Task("Oracle", "Validate the JWT fix is complete")
```

### Security Audit
```javascript
// 1. Scan
Task("Argus", "Perform security audit of API endpoints")

// 2. Review
Task("Aegis", "Review security architecture")

// 3. Compliance
Task("Themis", "Check OWASP compliance")

// 4. Report
Task("Calliope", "Generate security audit report")
```

## Best Practices

1. **Use specific requests**: Be clear about what you want each god to do
2. **Chain appropriately**: Let each god complete before invoking the next
3. **Leverage specialization**: Use the right god for each task
4. **Trust the process**: Gods have mythological personalities but professional output
5. **Use Divine Council**: For complex multi-step features

## God Specializations

| God | Specialization | When to Use |
|-----|---------------|-------------|
| Zeus | Orchestration | Project planning, coordination |
| Athena | Architecture | System design, strategic planning |
| Hephaestus | Implementation | Coding, building features |
| Apollo | Testing | Quality validation, testing |
| Argus | Security | Vulnerability scanning, audits |
| Themis | Compliance | Standards, best practices |
| Oracle | Quality Gates | Final approval, validation |
| Calliope | Documentation | Writing docs, comments |
| Iris | UI/UX | Interface design, user experience |
| Hermes | Research | Quick lookups, communication |
| Aegis | Security Arch | Security system design |
| Daedalus | Engineering | Technical architecture |
| Githeus | Version Control | Git operations, commits |
| Thoth | Specifications | Formal specs, requirements |

## Tips

- Gods work within your Claude Code session context
- Each god has access to appropriate tools
- Gods maintain conversation context
- Use Divine Council for orchestrated workflows
- Hooks provide automatic validation

Remember: The gods serve you, but they have their own personalities. Embrace the mythological flair while receiving professional results!