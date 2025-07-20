# BACO Examples

This directory contains code examples and patterns that BACO agents can reference when implementing features. These examples are critical for ensuring AI agents follow your project's conventions and patterns.

## Directory Structure

```
examples/
├── README.md                  # This file
├── architecture/             # Architecture patterns
│   ├── microservice.md      # Microservice pattern example
│   ├── monolith.md         # Monolithic pattern example
│   └── event-driven.md     # Event-driven pattern example
├── implementation/          # Code implementation patterns
│   ├── api/                # API patterns
│   │   ├── rest.md        # REST API example
│   │   └── graphql.md     # GraphQL example
│   ├── database/          # Database patterns
│   │   ├── orm.md        # ORM usage example
│   │   └── migrations.md # Migration patterns
│   └── auth/             # Authentication patterns
│       ├── jwt.md       # JWT implementation
│       └── oauth.md     # OAuth flow
├── testing/               # Test patterns
│   ├── unit.md           # Unit test examples
│   ├── integration.md    # Integration test examples
│   └── e2e.md           # End-to-end test examples
└── workflows/            # Workflow examples
    ├── ci-cd.md         # CI/CD pipeline
    └── deployment.md    # Deployment patterns
```

## Usage in PRPs

When generating PRPs, reference examples like this:

```yaml
# In your PRP
examples:
  - file: examples/implementation/api/rest.md
    why: Follow this REST API pattern for consistency
  - file: examples/testing/unit.md
    why: Use this test structure for all unit tests
```

## Adding New Examples

When adding examples:

1. **Be Specific**: Show exact patterns to follow
2. **Include Context**: Explain when to use this pattern
3. **Show Anti-patterns**: What NOT to do
4. **Keep Updated**: Examples should reflect current best practices

## Example Template

```markdown
# [Pattern Name]

## When to Use
[Describe scenarios where this pattern applies]

## Pattern
```[language]
// Actual code example
// With comments explaining key points
```

## Anti-pattern
```[language]
// What NOT to do
// Explain why this is wrong
```

## Key Points
- [Important consideration 1]
- [Important consideration 2]

## References
- [Link to documentation]
- [Related patterns]
```

## Integration with Agents

Agents will:
1. Search examples for relevant patterns
2. Use patterns as templates
3. Adapt patterns to specific needs
4. Maintain consistency with examples

## Best Practices

1. **Real Code**: Use actual working code, not pseudocode
2. **Complete Examples**: Include imports, error handling, etc.
3. **Explain Choices**: Comment on why certain approaches were chosen
4. **Version Specific**: Note any version-specific requirements
5. **Test Examples**: Ensure examples actually work