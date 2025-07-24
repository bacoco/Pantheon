# Interactive Pantheon Init Task

## Purpose

Guide an interactive conversation to gather comprehensive project requirements and generate a customized pantheon.md file. This task transforms the initialization process from a template-filling exercise into an intelligent dialogue that builds deep understanding of the project.

## Conversation Architecture

### Phase 1: Discovery & Context Building

#### Opening Sequence
```
🎯 Welcome to BACO Interactive Project Setup!

I'll help you create a comprehensive project definition through conversation.
This will help me understand your needs and generate a customized pantheon.md file.

Let's start with the basics...

1️⃣ What type of application are you building?
   (e.g., Web App, REST API, CLI Tool, Mobile Backend, Desktop App, etc.)
```

#### Adaptive Follow-ups by Type

**For Web Applications:**
- Is this a single-page application (SPA) or server-rendered?
- Will it need real-time features?
- What about authentication and user management?

**For APIs:**
- REST, GraphQL, gRPC, or something else?
- Public API or internal service?
- Need for versioning strategy?

**For CLI Tools:**
- Interactive or scriptable?
- Cross-platform requirements?
- Installation method (npm, pip, binary)?

**For Mobile Backends:**
- Native app or hybrid?
- Push notifications needed?
- Offline sync capabilities?

### Phase 2: Feature Discovery

#### Initial Feature Gathering
```
Now let's explore your features. I'll help you organize them by priority.

What are the core features your application must have?
(You can list them all at once, or we can go through them one by one)
```

#### Feature Refinement Process

For each feature mentioned:

1. **Clarification Questions:**
   - Who uses this feature?
   - What problem does it solve?
   - How critical is it for launch?

2. **Dependency Detection:**
   - Does this feature depend on others?
   - What features depend on this?

3. **Related Feature Suggestions:**
   Based on the feature type, suggest commonly paired features:
   
   - "User Authentication" → Suggest: Password reset, 2FA, Session management
   - "Payment Processing" → Suggest: Invoice generation, Refunds, Subscription management
   - "Search" → Suggest: Filters, Sorting, Saved searches
   - "Notifications" → Suggest: Preferences, Channels (email/SMS/push), Templates

### Phase 3: Technical Requirements

#### Technology Stack Discovery
```
Let's talk about technical requirements...

🛠️ What technologies/frameworks are you planning to use?
   (or would you like suggestions based on your requirements?)
```

If they want suggestions, provide options based on:
- Project type
- Team expertise
- Performance requirements
- Ecosystem preferences

#### Documentation & Example Analysis
```
📚 Do you have any documentation or examples to share?
   - Framework documentation URLs
   - Similar projects or code examples
   - Design documents or specifications
   - API documentation you'll integrate with
```

**When URLs are provided:**
1. Use WebFetch to analyze documentation
2. Extract:
   - Key concepts and terminology
   - Best practices and conventions
   - Common patterns
   - Performance guidelines
   - Security considerations

**When code examples are provided:**
1. Analyze for:
   - Naming conventions
   - File structure
   - Testing patterns
   - Error handling approaches
   - Documentation style
   - Dependencies used

### Phase 4: Constraints & Considerations

#### Systematic Constraint Gathering
```
Almost done! Let's capture any constraints or special considerations...
```

**Performance Requirements:**
- Expected response times?
- Concurrent user load?
- Data volume expectations?
- Geographic distribution?

**Security & Compliance:**
- Authentication requirements?
- Data privacy regulations (GDPR, HIPAA)?
- Security standards to meet?
- Audit requirements?

**Infrastructure & Operations:**
- Deployment targets (cloud, on-premise)?
- Scaling requirements?
- Backup and disaster recovery?
- Monitoring and logging needs?

**Resource Constraints:**
- Team size and expertise?
- Budget limitations?
- Timeline pressures?
- Third-party service limits?

### Phase 5: Intelligent Synthesis

#### Information Organization

Structure gathered information into:

```yaml
project_context:
  type: "identified_type"
  purpose: "main_problem_solved"
  users: ["user_types"]
  scale: "expected_scale"
  timeline: "deadline_info"

features:
  high_priority:
    - name: "Feature Name"
      description: "What it does"
      dependencies: ["other_features"]
      
  medium_priority:
    - ...
    
  low_priority:
    - ...

technical_stack:
  languages: ["identified_languages"]
  frameworks: ["identified_frameworks"]
  databases: ["identified_databases"]
  services: ["third_party_services"]

patterns_detected:
  naming: "convention_found"
  architecture: "pattern_found"
  testing: "approach_found"

constraints:
  performance: ["requirements"]
  security: ["requirements"]
  compliance: ["requirements"]
  infrastructure: ["requirements"]
```

### Phase 6: Review & Generation

#### Comprehensive Summary
```
Great! Based on our conversation, here's what I understand:

📋 Project Type: [type] - [brief description]
🎯 Main Purpose: [problem solved]
👥 Target Users: [user types]
📏 Expected Scale: [scale description]
📅 Timeline: [deadline info]

⚡ Key Features:
HIGH PRIORITY:
  • [Feature 1] - [brief description]
  • [Feature 2] - [brief description]
  
MEDIUM PRIORITY:
  • [Feature 3] - [brief description]
  
LOW PRIORITY:
  • [Feature 4] - [brief description]

🛠️ Technology Stack:
  • Frontend: [if applicable]
  • Backend: [if applicable]
  • Database: [if applicable]
  • Key Libraries: [list]

📐 Detected Patterns:
  • [Pattern 1]
  • [Pattern 2]

⚠️ Key Constraints:
  • [Constraint 1]
  • [Constraint 2]

Shall I generate your customized pantheon.md file? (yes/no/refine)
```

#### Refinement Options

If user selects "refine":
```
What would you like to adjust?
1. Project details
2. Features (add/remove/reprioritize)
3. Technical requirements
4. Constraints
5. Something else

Please select a number or describe what needs changing:
```

### Smart Generation Rules

#### Feature Organization
- Group related features together
- Clearly mark dependencies
- Include discovered sub-features
- Add priority tags consistently

#### Example Integration
- Reference analyzed documentation
- Include pattern examples from code
- Link to relevant resources
- Add inline code snippets where helpful

#### Constraint Specification
- Be specific with numbers (response times, user counts)
- Include compliance standards by name
- List specific technology versions if mentioned
- Add discovered constraints from documentation

#### Contextual Additions
Based on project type, automatically include relevant sections:

**For E-commerce:**
- Payment processing constraints
- Inventory management considerations
- Tax and shipping complexities

**For SaaS:**
- Multi-tenancy architecture notes
- Subscription billing considerations
- Data isolation requirements

**For Real-time Apps:**
- Latency requirements
- Connection handling strategies
- Scalability considerations

### Conversation State Management

Track throughout conversation:
```yaml
session_state:
  current_phase: "discovery|features|technical|constraints|review"
  gathered_info:
    project_type: ""
    features: []
    tech_stack: []
    constraints: []
  
  clarifications_needed: []
  suggestions_made: []
  patterns_detected: []
  
  conversation_history:
    - question: ""
      answer: ""
      insights: []
```

### Error Recovery

Handle common conversation issues:

**Vague Responses:**
- Ask specific follow-up questions
- Provide examples of what you're looking for
- Offer multiple choice options

**Contradictions:**
- Politely point out the inconsistency
- Ask for clarification
- Suggest resolution

**Scope Creep:**
- Remind of original goals
- Suggest creating separate projects
- Help prioritize features

### Quality Checks

Before generating final pantheon.md:

1. **Completeness:**
   - At least 3 features defined
   - Technology stack specified
   - Basic constraints captured

2. **Clarity:**
   - Each feature has clear description
   - Dependencies are logical
   - Constraints are specific

3. **Consistency:**
   - Naming conventions align
   - Priorities make sense
   - Tech choices support requirements

### Final Generation

Generate pantheon.md with:
- Rich descriptions from conversation
- Discovered patterns and conventions
- Analyzed documentation references
- Contextual best practices
- Specific, actionable constraints
- Clear feature dependencies
- Appropriate priority markings

The generated file should feel like it was written by someone who deeply understands the project, not filled from a template.