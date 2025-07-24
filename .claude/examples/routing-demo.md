# Smart Routing Demo Examples

This file demonstrates how the `/baco route` command works with various task requests.

## Example 1: Architecture Task

### Input
```
/baco route Design a scalable microservices architecture for our e-commerce platform with AWS
```

### Output
```yaml
=== SMART ROUTING ANALYSIS ===

Task Analysis:
  Domains: [architecture, devops]
  Technologies: [aws, microservices]
  Complexity: 8/10
  Task Type: design
  Estimated Duration: weeks

Routing Decision:
  Primary Agent: Daedalus (System Architect)
  Confidence: 92%
  Match Factors:
    ✓ domain:architecture (expert)
    ✓ capability:system-design (expert)
    ✓ capability:scalability-planning (expert)
    ✓ technology:aws
    ✓ complexity:in-range
    ✓ pattern:system architecture

Supporting Agents:
  - Aegis (Security Expert)
    Role: Security architecture advisor
    Reason: Brings security, compliance expertise

Alternative Routes:
  1. BMad Master (78%) - Orchestrate full architecture team
  2. Hephaestus (45%) - Implementation-focused approach
  3. Hermes (35%) - Break down into sprint tasks

Options:
1. ✅ Accept routing (activate Daedalus with Aegis support)
2. 🔄 Choose alternative agent
3. 📝 Modify task description
4. ❌ Cancel

Your choice (1-4): _
```

## Example 2: Bug Fix Task

### Input
```
/baco route Fix the authentication bug where users can't log in with special characters in passwords
```

### Output
```yaml
=== SMART ROUTING ANALYSIS ===

Task Analysis:
  Domains: [implementation, debugging, security]
  Technologies: [authentication]
  Complexity: 4/10
  Task Type: implementation
  Estimated Duration: hours

Routing Decision:
  Primary Agent: Hephaestus (Senior Developer)
  Confidence: 88%
  Match Factors:
    ✓ domain:implementation (expert)
    ✓ domain:debugging (expert)
    ✓ capability:debugging (expert)
    ✓ complexity:in-range
    ✓ pattern:fix bug

Supporting Agents:
  - Aegis (Security Expert)
    Role: Authentication security validator
    Reason: Brings authentication, security expertise

Alternative Routes:
  1. Themis (65%) - Test-driven fix approach
  2. Aegis (55%) - Security-first debugging
  3. BMad Master (40%) - Orchestrated approach

✅ High Confidence Routing (88%)

I'm highly confident that Hephaestus is the best choice for this task.
Hephaestus (Senior Developer) is the best choice with 88% match. Strong domain expertise in implementation, debugging. Has 2 matching capabilities at expert/advanced level. Task complexity (4/10) is within optimal range. Request matches known patterns for this agent.

The task will be handled by Hephaestus with support from Aegis.
```

## Example 3: UI Design Task

### Input
```
/baco route Create beautiful and accessible mockups for our new dashboard with dark mode support
```

### Output
```yaml
=== SMART ROUTING ANALYSIS ===

Task Analysis:
  Domains: [ui, user_experience]
  Technologies: []
  Complexity: 6/10
  Task Type: design
  Estimated Duration: days

Routing Decision:
  Primary Agent: Apollo (UX Designer)
  Confidence: 95%
  Match Factors:
    ✓ domain:ui (expert)
    ✓ domain:user_experience (expert)
    ✓ capability:ux-design (expert)
    ✓ capability:visual-design (advanced)
    ✓ capability:accessibility (advanced)
    ✓ complexity:in-range
    ✓ pattern:mockup

Supporting Agents:
  - Pixel (UI Healer)
    Role: Visual quality checker
    Reason: Brings ui_quality, visual_testing expertise

Alternative Routes:
  1. Hephaestus (40%) - Direct implementation approach
  2. BMad Master (35%) - Full team coordination
  3. Themis (30%) - Accessibility testing focus

✅ High Confidence Routing (95%)

I'm highly confident that Apollo is the best choice for this task.
Apollo (UX Designer) is the best choice with 95% match. Strong domain expertise in ui, user_experience. Has 3 matching capabilities at expert/advanced level. Task complexity (6/10) is within optimal range. Request matches known patterns for this agent.
```

## Example 4: Complex Multi-Domain Task

### Input
```
/baco route Build a complete user management system with React frontend, Node.js backend, PostgreSQL database, JWT auth, and comprehensive tests
```

### Output
```yaml
=== SMART ROUTING ANALYSIS ===

Task Analysis:
  Domains: [implementation, frontend, backend, testing, security]
  Technologies: [react, nodejs, postgresql, jwt]
  Complexity: 9/10
  Task Type: implementation
  Estimated Duration: weeks

🔀 Complex Multi-Domain Task Detected

This task spans multiple domains and may benefit from orchestration:
- Domains: implementation, frontend, backend, testing, security
- Suggested approach: BMad Master orchestration with specialist team

Routing Decision:
  Primary Agent: BMad Master (Meta-Orchestrator)
  Confidence: 85%
  Match Factors:
    ✓ domain:orchestration (expert)
    ✓ capability:workflow-design (expert)
    ✓ capability:multi-agent-coordination (advanced)
    ✓ complexity:in-range
    ✓ pattern:complex task

Suggested Team Composition:
  - Daedalus: Architecture design
  - Hephaestus: Implementation
  - Aegis: Security (JWT auth)
  - Themis: Test strategy
  - Apollo: UI/UX design

Alternative Routes:
  1. Hephaestus (72%) - Lead implementation with ad-hoc support
  2. Daedalus (68%) - Architecture-first approach
  3. Manual team selection

Would you like to:
1. ✅ Use BMad Master orchestration mode
2. 🎯 Select Hephaestus as lead developer
3. 👥 Manually compose team
4. ❌ Cancel
```

## Example 5: Unclear Request

### Input
```
/baco route help with the thing
```

### Output
```yaml
=== SMART ROUTING ANALYSIS ===

❓ Task description is too brief or unclear.

Please provide more details about:
- What specific "thing" needs help
- What you want to accomplish
- Any specific technologies or constraints
- The expected outcome

Examples of clear task descriptions:
- "Fix the login bug where users get stuck on loading screen"
- "Design API endpoints for user profile management"
- "Create test plan for checkout flow"

Would you like to:
1. 📝 Provide more details
2. 🤖 Use BMad Master for general help
3. 📚 See more examples
4. ❌ Cancel
```

## Example 6: Testing Task

### Input
```
/baco route Develop comprehensive test strategy for our payment processing system including unit, integration, and E2E tests
```

### Output
```yaml
=== SMART ROUTING ANALYSIS ===

Task Analysis:
  Domains: [testing, quality_assurance]
  Technologies: []
  Complexity: 7/10
  Task Type: planning
  Estimated Duration: weeks

Routing Decision:
  Primary Agent: Themis (QA Lead)
  Confidence: 93%
  Match Factors:
    ✓ domain:testing (expert)
    ✓ domain:quality_assurance (expert)
    ✓ capability:testing-strategy (expert)
    ✓ capability:qa-automation (expert)
    ✓ complexity:in-range
    ✓ pattern:test strategy

Supporting Agents:
  - Hephaestus (Senior Developer)
    Role: Test implementation advisor
    Reason: Brings implementation, testing expertise
  - Aegis (Security Expert)
    Role: Security testing requirements
    Reason: Payment systems need security validation

Alternative Routes:
  1. BMad Master (70%) - Orchestrate full QA team
  2. Hephaestus (55%) - Developer-driven testing
  3. Aegis (45%) - Security-first testing

✅ High Confidence Routing (93%)

Themis will create a comprehensive test strategy covering:
- Test pyramid design (unit, integration, E2E)
- Payment-specific test scenarios
- Security test requirements
- Automation approach
- Performance testing needs
```

## Preview Mode Example

### Input
```
/baco route --preview Create a mobile app using React Native
```

### Output
```yaml
=== SMART ROUTING ANALYSIS ===

🔍 PREVIEW MODE - No agents will be activated

Task Analysis:
  Domains: [implementation, frontend, ui]
  Technologies: [react]
  Complexity: 7/10
  Task Type: implementation
  Estimated Duration: weeks

Routing Decision:
  Primary Agent: Hephaestus (Senior Developer)
  Confidence: 82%
  Match Factors:
    ✓ domain:implementation (expert)
    ✓ domain:frontend (advanced)
    ✓ capability:frontend-development (advanced)
    ✓ technology:react
    ✓ complexity:in-range

What would happen:
1. Hephaestus would set up React Native project structure
2. Hephaestus would implement core app functionality
3. Apollo would be consulted for UI/UX design
4. Themis would create mobile-specific test suite

Supporting Agents:
  - Apollo (UX Designer) - Mobile UI patterns
  - Themis (QA Lead) - Mobile testing strategy

This is a preview - no agents have been activated.
Use '/baco route Create a mobile app using React Native' to proceed.
```

## JSON Output Example

### Input
```
/baco route --json Implement REST API for user management
```

### Output
```json
{
  "analysis": {
    "domains": ["implementation", "backend"],
    "technologies": ["rest"],
    "complexity": 5,
    "taskType": "implementation",
    "estimatedDuration": "days"
  },
  "routing": {
    "primaryAgent": {
      "id": "hephaestus",
      "name": "Hephaestus",
      "role": "Senior Developer",
      "confidence": 0.86,
      "matchFactors": [
        "domain:implementation",
        "domain:backend",
        "capability:api-design",
        "pattern:implement api"
      ]
    },
    "supportingAgents": [
      {
        "id": "daedalus",
        "name": "Daedalus",
        "role": "API architecture advisor",
        "reason": "Brings architecture expertise"
      }
    ],
    "alternatives": [
      {"id": "daedalus", "confidence": 0.65},
      {"id": "baco-master", "confidence": 0.50}
    ]
  },
  "flags": {
    "autoRoute": true,
    "allowOverride": true
  }
}
```

## Auto-Accept Example

### Input
```
/baco route --auto Fix typo in README file
```

### Output
```yaml
=== SMART ROUTING ANALYSIS ===

Task Analysis:
  Domains: [implementation]
  Technologies: []
  Complexity: 1/10
  Task Type: implementation
  Estimated Duration: minutes

✅ AUTO-ROUTING (85% confidence threshold met)

Routing to: Hephaestus (Senior Developer)
Confidence: 90%

Task automatically assigned. Hephaestus will fix the typo in the README file.
```

These examples demonstrate the Smart Router's ability to:
- Analyze diverse task types
- Provide transparent routing decisions
- Suggest supporting agents
- Handle edge cases gracefully
- Support different output formats
- Enable preview and auto-accept modes