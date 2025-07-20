# /generate-prp Command - Product Requirements Prompt Generation

ACTIVATION: When user types `/generate-prp <task>`, create a comprehensive implementation guide.

## PRP Structure

Generate a complete Product Requirements Prompt following Context Engineering best practices.

### Core Sections

```markdown
# [Descriptive Name for the Task]

## Purpose
[Clear explanation of what needs to be built and why]

## Goal
[Specific, measurable end state]

## Why
- [Business value point 1]
- [Business value point 2]
- [User impact]

## What
[User-visible behavior and technical requirements]

### Success Criteria
- [ ] [Specific measurable outcome]
- [ ] [Specific measurable outcome]
- [ ] [Specific measurable outcome]

## All Needed Context

### Documentation & References
\`\`\`yaml
- resource: [Type of resource]
  location: [Where to find it]
  why: [What specific information is needed]
\`\`\`

### Current State
\`\`\`
[Current codebase structure or system state]
\`\`\`

### Desired State
\`\`\`
[Target codebase structure or system state]
\`\`\`

### Known Constraints & Considerations
- **Technical**: [Constraints]
- **Business**: [Constraints]
- **Timeline**: [Constraints]

## Implementation Blueprint

### Task Breakdown
1. **[Task Name]**
   - Description: [What to do]
   - Files: [What to create/modify]
   - Validation: [How to verify]

2. **[Task Name]**
   - Description: [What to do]
   - Files: [What to create/modify]
   - Validation: [How to verify]

### Technical Approach
\`\`\`[language]
// Pseudocode or key implementation details
// Focus on non-obvious aspects
// Include critical patterns
\`\`\`

### Integration Points
- **Database**: [Changes needed]
- **APIs**: [Endpoints to create/modify]
- **Configuration**: [Settings to add]
- **Dependencies**: [Packages to install]

## Validation Strategy

### Level 1: Unit Testing
\`\`\`bash
# Commands to run
# Expected outcomes
\`\`\`

### Level 2: Integration Testing
\`\`\`bash
# Commands to run
# Expected outcomes
\`\`\`

### Level 3: End-to-End Validation
\`\`\`bash
# Commands to run
# Expected outcomes
\`\`\`

## Risk Mitigation

### Potential Issues
1. **[Risk]**: [Mitigation strategy]
2. **[Risk]**: [Mitigation strategy]

### Rollback Plan
[How to safely revert if needed]

## Anti-Patterns to Avoid
- ❌ [Common mistake]
- ❌ [Common mistake]
- ❌ [Common mistake]

## Definition of Done
- [ ] All tests passing
- [ ] Code reviewed
- [ ] Documentation updated
- [ ] Performance validated
- [ ] Security reviewed
- [ ] Deployed successfully
```

## PRP Generation Process

1. **Understand the task**: Use complexity analysis if needed
2. **Gather insights**: Use orchestration to get multiple perspectives
3. **Structure comprehensively**: Include all sections with relevant detail
4. **Be specific**: Avoid vague instructions
5. **Include validation**: Every task should be verifiable
6. **Consider failure**: Include error handling and rollback

## Quality Criteria

A good PRP should be:
- **Self-contained**: All needed information included
- **Actionable**: Clear steps to follow
- **Verifiable**: Success can be measured
- **Risk-aware**: Potential issues addressed
- **Maintainable**: Considers long-term implications

## Adaptation Guidelines

Adjust detail level based on complexity:
- **Simple tasks**: Focus on clarity and efficiency
- **Complex tasks**: Include extensive detail and considerations
- **Novel tasks**: Emphasize exploration and validation
- **Critical tasks**: Stress testing and rollback procedures

## Example

User: `/generate-prp Create a REST API for user authentication`

You would generate a complete PRP including:
- JWT implementation details
- Database schema for users
- API endpoint specifications
- Security considerations
- Testing strategies
- Deployment steps

The output should be immediately usable by a developer to implement the feature with confidence.