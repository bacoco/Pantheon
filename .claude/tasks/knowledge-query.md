# Knowledge Query Task

## Purpose

Enable agents to search, retrieve, and apply knowledge from the BACO knowledge base to provide informed recommendations and solutions based on proven patterns and best practices.

## Knowledge Base Structure

The knowledge base is organized into:
- **Domains**: Technology-specific knowledge (web, mobile, cloud, data)
- **Patterns**: Reusable design and implementation patterns
- **Best Practices**: Industry-standard approaches
- **Technologies**: Framework and tool-specific guidance
- **Case Studies**: Real-world examples and lessons

## Task Instructions

### 1. Query Processing

When a knowledge query is needed:

**Parse Query Intent**:
```yaml
query_analysis:
  topic: "authentication implementation"
  domain: "web security"
  context: "Node.js REST API"
  specificity: "implementation details"
```

**Search Strategy**:
1. Direct path match (if user specifies)
2. Tag-based search
3. Content search
4. Related knowledge expansion

### 2. Knowledge Retrieval

**Direct Path Access**:
```
User asks: "Show me React patterns"
Direct match: knowledge/domains/web/react-patterns.md
```

**Tag-Based Search**:
```
User asks: "Security best practices"
Search tags: [security, authentication, authorization]
Results:
- patterns/security/authentication.md
- patterns/security/api-security.md
- best-practices/security/security-testing.md
```

**Content Search**:
```
User asks: "How to implement JWT"
Search in content for: "JWT", "JSON Web Token"
Found in:
- patterns/security/authentication.md (high relevance)
- patterns/security/api-security.md (medium relevance)
```

### 3. Knowledge Application

**Extract Relevant Sections**:
```markdown
From: patterns/security/authentication.md

## JWT Implementation
[Specific code examples and explanations]

## Security Considerations
[Relevant security notes]
```

**Contextualize for User**:
- Adapt examples to user's tech stack
- Highlight relevant warnings
- Suggest related patterns

**Provide Actionable Guidance**:
```
Based on the knowledge base, here's how to implement JWT in your Node.js API:

1. [Specific implementation steps]
2. [Code examples adapted to context]
3. [Security considerations]
4. [Testing approach]

Related patterns you might need:
- Rate limiting (see security/rate-limiting.md)
- Refresh tokens (see security/token-rotation.md)
```

### 4. Knowledge Synthesis

When multiple knowledge sources apply:

**Combine Patterns**:
```
For "secure user registration":
1. From authentication.md: Password hashing
2. From validation.md: Input validation
3. From email.md: Verification flow
4. From security.md: Rate limiting
```

**Resolve Conflicts**:
- Prefer more recent knowledge
- Consider context specificity
- Note trade-offs explicitly

**Create Comprehensive Solution**:
```markdown
## Secure User Registration Implementation

Combining best practices from multiple sources:

### 1. Input Validation (from validation patterns)
[Code example]

### 2. Password Security (from authentication patterns)
[Code example]

### 3. Email Verification (from email patterns)
[Code example]

### 4. Rate Limiting (from security patterns)
[Code example]

### Integration Example
[Complete working example combining all patterns]
```

### 5. Query Response Format

**For Direct Queries**:
```markdown
## Query: [User's question]

### Answer
[Direct answer with source reference]

### Detailed Explanation
[From knowledge base with adaptations]

### Example Implementation
[Code example from knowledge base]

### Additional Resources
- Related: [Other relevant knowledge entries]
- External: [Trusted external resources]
```

**For Exploratory Queries**:
```markdown
## Topic: [Broad topic]

### Overview
[Summary of available knowledge]

### Available Knowledge
1. **[Entry 1]**: [Brief description]
2. **[Entry 2]**: [Brief description]

### Recommended Reading Order
1. Start with: [Foundational entry]
2. Then read: [Building on foundation]
3. Advanced: [Advanced topics]
```

### 6. Knowledge Confidence Levels

Communicate confidence based on:
- Knowledge entry confidence rating
- Recency of information
- Specificity to user's context

```markdown
**Confidence: High** ✅
This pattern is well-established and widely used in production.

**Confidence: Medium** ⚠️
This approach works but consider your specific requirements.

**Confidence: Low** ⚡
Experimental approach - thoroughly test before production use.
```

### 7. Knowledge Updates

When knowledge might be outdated:

```markdown
⚠️ **Note**: This knowledge was last updated on [date].
For [rapidly changing technology], please verify:
- Current version compatibility
- Latest security recommendations
- Recent best practices

Suggested verification:
- Check official docs: [URL]
- Recent discussions: [Community link]
```

### 8. Interactive Knowledge Exploration

Enable discovery through questions:

```markdown
Based on your interest in [topic], you might want to know:

1. **Implementation details?**
   → See [specific pattern file]

2. **Security considerations?**
   → See [security pattern file]

3. **Performance optimization?**
   → See [performance pattern file]

4. **Real-world examples?**
   → See [case study file]

Which aspect would you like to explore?
```

## Query Examples

### Example 1: Specific Technology Query
```
Query: "How to implement authentication in React?"

Response:
From knowledge/domains/web/react-patterns.md:
- Token storage in React (httpOnly cookies recommended)
- Protected route implementation
- Auth context pattern
- Hook examples for auth state

Also relevant:
- General auth patterns: patterns/security/authentication.md
- Testing auth: best-practices/testing/testing-strategy.md
```

### Example 2: Best Practice Query
```
Query: "What's the best testing strategy?"

Response:
From knowledge/best-practices/testing/testing-strategy.md:
- Testing pyramid (70% unit, 20% integration, 10% E2E)
- TDD workflow examples
- Mocking strategies
- CI/CD integration

Your tech stack (React + Node.js) specific:
- React Testing Library examples
- Jest configuration
- API testing with Supertest
```

### Example 3: Pattern Recommendation
```
Query: "Need to handle file uploads securely"

Response:
Combining knowledge from:
1. Security patterns: File upload validation
2. Storage patterns: Cloud storage best practices
3. API patterns: Multipart handling

Recommended approach:
[Synthesized solution with code examples]
```

## Success Criteria

- [ ] Relevant knowledge retrieved
- [ ] Context-appropriate adaptation
- [ ] Clear, actionable guidance
- [ ] Related knowledge suggested
- [ ] Confidence level communicated
- [ ] Sources properly attributed

## Integration with Agents

Agents can invoke knowledge queries:
```yaml
dependencies:
  - type: task
    name: knowledge-query
    action: "Find best practices for {topic}"
```

This enables agents to provide expertise backed by the knowledge base rather than general assumptions.

## Continuous Improvement

- Track frequently asked queries
- Identify knowledge gaps
- Update outdated entries
- Add new patterns as discovered
- Link related knowledge better

Remember: The knowledge base is a living resource. Use it to provide consistent, high-quality guidance based on proven patterns and practices.