# Conversation Manager Utility

Instructions for managing interactive BACO init conversations with state tracking and intelligent responses.

## Core Responsibilities

1. Track conversation state across multiple interactions
2. Detect when to move between conversation phases
3. Handle clarifications and refinements
4. Build comprehensive project understanding
5. Maintain context for intelligent suggestions

## Conversation State Structure

```yaml
conversation_state:
  session_id: "baco_init_[timestamp]"
  current_phase: "welcome|discovery|features|technical|constraints|review|generation"
  
  project_info:
    type: ""              # Web App, API, CLI, etc.
    subtype: ""           # SPA, REST, GraphQL, etc.
    purpose: ""           # Main problem being solved
    users: []             # Target user types
    scale: ""             # Expected scale/size
    timeline: ""          # Deadline or timeframe
    
  features:
    high_priority: []
    medium_priority: []
    low_priority: []
    dependencies: {}      # feature_name: [depends_on]
    
  technical:
    languages: []
    frameworks: []
    databases: []
    services: []          # Third-party integrations
    infrastructure: []    # Deployment targets
    
  patterns:
    naming_convention: ""
    file_structure: ""
    testing_approach: ""
    doc_style: ""
    error_handling: ""
    
  constraints:
    performance: []
    security: []
    compliance: []
    infrastructure: []
    budget: []
    
  documentation:
    urls_analyzed: []
    key_concepts: []
    best_practices: []
    
  conversation_log:
    - timestamp: ""
      phase: ""
      question: ""
      answer: ""
      insights_extracted: []
```

## Phase Transition Logic

### Welcome → Discovery
Triggered immediately after welcome message and user acknowledgment.

### Discovery → Features
Triggered when basic project info is gathered:
- Project type identified
- Purpose explained
- Users defined
- Scale understood

### Features → Technical
Triggered when:
- At least 3 core features defined
- OR user indicates feature list is complete
- OR conversation naturally moves to "how to build"

### Technical → Constraints
Triggered when:
- Technology stack defined
- OR user mentions limitations/requirements
- OR standard technical questions answered

### Constraints → Review
Triggered when:
- Key constraints captured
- OR user seems ready to proceed
- OR all standard questions asked

### Review → Generation
Triggered when user approves summary or after refinements complete.

## Response Intelligence

### Contextual Follow-ups

Based on project type, ask relevant follow-ups:

```python
follow_ups = {
    "e-commerce": [
        "Will you need inventory management?",
        "Multiple payment providers or just one?",
        "International shipping support?"
    ],
    "saas": [
        "Multi-tenant or single-tenant architecture?",
        "Subscription billing needed?",
        "Team/organization management?"
    ],
    "api": [
        "Public or internal API?",
        "Rate limiting requirements?",
        "API versioning strategy?"
    ]
}
```

### Feature Relationship Detection

When user mentions a feature, identify related features:

```python
feature_relationships = {
    "authentication": ["password_reset", "2fa", "session_management", "oauth"],
    "payment": ["invoicing", "refunds", "subscriptions", "tax_calculation"],
    "search": ["filters", "sorting", "facets", "saved_searches"],
    "notifications": ["email", "sms", "push", "in_app", "preferences"]
}
```

### Constraint Inference

From mentioned technologies, infer constraints:

```python
tech_constraints = {
    "react": ["JavaScript/TypeScript required", "Build process needed"],
    "django": ["Python required", "PostgreSQL recommended"],
    "kubernetes": ["Container orchestration", "DevOps expertise needed"],
    "aws": ["Cloud infrastructure", "AWS costs consideration"]
}
```

## Conversation Techniques

### Clarification Strategies

When responses are vague:

**Too Broad:**
```
User: "I need user management"
Response: "User management can mean different things. Are you thinking of:
- Basic authentication (login/logout)
- User profiles and settings
- Role-based permissions
- Team/organization management
- All of the above?"
```

**Too Technical:**
```
User: "CQRS with event sourcing"
Response: "I understand you want CQRS with event sourcing. This is quite advanced. 
Can you help me understand:
- What specific problems this solves for your use case?
- Do you have experience with this pattern?
- Would a simpler approach work initially?"
```

### Gentle Corrections

When detecting potential issues:

```
"I notice you mentioned both MongoDB and complex transactions. 
MongoDB has limited transaction support compared to traditional databases. 
Would you like to:
1. Stick with MongoDB and design around its constraints
2. Consider PostgreSQL for transaction-heavy features
3. Use both for different parts of the system"
```

### Progressive Depth

Start simple, go deeper based on responses:

**Level 1:** "Do you need user authentication?"
**Level 2:** "What kind of authentication? (email/password, social, SSO?)"
**Level 3:** "Any specific requirements? (2FA, password policies, session timeout?)"

## Memory Patterns

### Cross-Reference Information

Build connections between different parts of conversation:

- User mentions "high performance" → Remember when asking about infrastructure
- User mentions "HIPAA compliance" → Affects all security-related features
- User mentions "small team" → Suggest simpler architectural patterns

### Contradiction Detection

Flag and resolve inconsistencies:

```
"Earlier you mentioned this is for a small team, but now you're describing 
enterprise features. Let's clarify the initial target vs. future vision:
- Start small and grow?
- Enterprise from day one?
- Phased approach?"
```

## Smart Suggestions

### Feature Prioritization Help

When user lists many features:

```
"That's a comprehensive list! To help prioritize, let's think about:
- What's the absolute minimum for your first users?
- What would make users choose you over alternatives?
- What can wait for version 2?

Based on what you've told me, I'd suggest these as HIGH priority:
[list based on conversation context]"
```

### Technology Recommendations

Based on requirements, suggest stacks:

```
"Based on your needs for real-time features, scalable API, and React frontend,
here are some technology combinations that work well:

Option 1: Modern JavaScript Stack
- Frontend: React + TypeScript
- Backend: Node.js + Express/Fastify
- Real-time: Socket.io
- Database: PostgreSQL + Redis

Option 2: [alternative based on context]

Which direction appeals to you?"
```

## Conversation Recovery

### Handle Interruptions

If conversation seems to restart:

```
"I see we were discussing your [project type]. 
We had covered [summary of progress].
Would you like to:
1. Continue where we left off
2. Start fresh
3. Jump to a specific topic"
```

### Handle Confusion

If user seems lost:

```
"Let me help orient us. We're currently discussing [phase topic].
So far we've established:
- [Key point 1]
- [Key point 2]

The next step would be [next topic]. Ready to continue?"
```

## Quality Assurance

Before moving to review phase, ensure:

1. **Completeness Checklist:**
   - [ ] Project type and purpose clear
   - [ ] At least 3 core features defined
   - [ ] Technology direction established
   - [ ] Key constraints identified

2. **Clarity Checklist:**
   - [ ] No vague feature descriptions
   - [ ] Dependencies make sense
   - [ ] Constraints are specific

3. **Consistency Checklist:**
   - [ ] Tech choices support requirements
   - [ ] Scale matches architecture
   - [ ] Timeline is realistic

## Final Summary Generation

Create a comprehensive summary that:
- Groups related information logically
- Highlights key decisions made
- Shows feature dependencies visually
- Includes discovered patterns
- References analyzed documentation
- Suggests next steps

The summary should demonstrate deep understanding of the project, not just echo back what was said.