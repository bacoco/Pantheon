# Create User Persona Task

## Overview
This task guides the creation of detailed user personas that will drive product decisions and ensure all team members understand the target users.

## Prerequisites
- Basic understanding of target market
- Access to user research data (if available)
- Project goals and objectives defined

## Task Steps

### 1. Gather Context
First, understand the project and its target users:

```yaml
project_context:
  name: "[Project name]"
  domain: "[Industry/domain]"
  problem_solving: "[What problem are we solving?]"
  target_market: "[Who are we building for?]"
  success_metrics: "[How do we measure success?]"
```

### 2. Research Target Users

Use available MCP tools to research:

1. **Market Research** (browsermcp):
   - Search for target user demographics
   - Find behavioral patterns
   - Identify common pain points
   - Discover workflow patterns

2. **Competitive Analysis**:
   - How do competitors define their users?
   - What user segments do they target?
   - What user problems do they solve?

3. **Internal Data** (if available):
   - User interviews
   - Survey results
   - Analytics data
   - Support tickets

### 3. Select Persona Template

Load the persona template from `.claude/templates/persona.md`. This provides the comprehensive structure for creating detailed, actionable personas.

For reference, also review `.claude/templates/persona-example-developer.md` to see a completed example.

### 4. Create Primary Persona

Start with the most important user segment:

1. **Identity Section**:
   - Choose a realistic name
   - Define role and context
   - Set demographic details
   - Establish tech savviness

2. **Goals & Motivations**:
   - What are they trying to achieve?
   - What does success look like?
   - What drives them?

3. **Pain Points**:
   - Current frustrations
   - Workarounds they use
   - Time wasters

4. **Behaviors**:
   - Work patterns
   - Decision-making style
   - Communication preferences

5. **User Journey**:
   - Map their typical workflow
   - Identify key touchpoints
   - Note critical moments

### 5. Validate Persona

Check that the persona is:
- **Specific**: Not too generic
- **Realistic**: Based on real data/insights
- **Actionable**: Helps make decisions
- **Memorable**: Team can relate to them

### 6. Create Secondary Personas

If needed, create 1-2 additional personas for other important user segments. Keep the total number small (max 3-4) to maintain focus.

### 7. Document Personas

Save personas in the project directory:
```
[project]/
  └── personas/
      ├── primary-persona.md
      ├── secondary-persona.md
      └── persona-summary.md
```

### 8. Share with Team

Make personas accessible to all agents:
1. Create a `persona-summary.md` with key highlights
2. Reference in project documentation
3. Use github to track versions
4. Ensure all agents can access via file path

## Output Format

Each persona should follow the template structure and include:
- Clear header with name and role
- Comprehensive background
- Specific goals and pain points
- Detailed behavioral patterns
- Actionable design implications
- Quick reference card

## Quality Checklist

- [ ] Based on research, not assumptions
- [ ] Specific enough to guide decisions
- [ ] Includes real quotes or insights
- [ ] Has clear goals and pain points
- [ ] Defines success metrics
- [ ] Accessible to all team members
- [ ] Version controlled

## Integration Points

The personas will be used by:
- **Apollo (UX)**: Design decisions
- **Hephaestus (Developer)**: Feature priorities
- **Themis (QA)**: Test scenarios
- **Athena (PO)**: User story creation
- **All agents**: Understanding user needs

## Tips for Success

1. **Start with one**: Perfect a primary persona before creating others
2. **Use real data**: Base on research, not stereotypes
3. **Keep it alive**: Update as you learn more
4. **Make it visual**: Consider adding a photo/avatar
5. **Share stories**: Use personas in team discussions

## Common Pitfalls to Avoid

- Creating too many personas (loses focus)
- Making them too generic ("everyone")
- Focusing only on demographics
- Forgetting to update them
- Not using them in decisions

## MCP Tool Usage

When creating personas:
1. Use **browsermcp** to research user behaviors online
2. Use **github** to store and version personas
3. Use **claude-task-master** to coordinate team input

## Success Criteria

A good persona:
- Feels like a real person
- Helps team make decisions
- Reduces arguments ("What would Alex do?")
- Guides feature prioritization
- Improves user empathy