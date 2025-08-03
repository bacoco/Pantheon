# Analyze Complexity Task

## Purpose

Perform a multi-dimensional complexity analysis of a software development task to determine the appropriate approach, agents, and resources needed.

## Input Requirements

- Task description from user
- Any additional context or constraints
- Current project state (if applicable)

## Sequential Task Execution

### 1. Task Understanding

First, ensure clear understanding of the task:
- Parse the task description
- Identify key components and requirements
- Note any ambiguities that need clarification
- Extract implicit requirements (performance, security, scale)

### 2. Dimension Analysis

Analyze the task across multiple dimensions, scoring each 1-10:

#### Technical Complexity (1-10)
- Algorithm complexity
- Data structure requirements
- Integration points
- Technology diversity
- Performance requirements

#### Architectural Impact (1-10)
- System design changes
- Component interactions
- Scalability considerations
- Infrastructure needs
- Cross-cutting concerns

#### Business Criticality (1-10)
- Revenue impact
- User experience impact
- Compliance requirements
- Time sensitivity
- Stakeholder visibility

#### Implementation Risk (1-10)
- Technical uncertainty
- Dependency complexity
- Team expertise gaps
- External service reliability
- Testing difficulty

#### Security Sensitivity (1-10)
- Data sensitivity
- Authentication/authorization needs
- Compliance requirements
- Attack surface changes
- Audit requirements

### 3. Complexity Score Calculation

Calculate overall complexity:
```
Base Score = (Technical + Architectural + Business + Risk + Security) / 5
Adjusted Score = Base Score + Modifier Factors
```

Modifier Factors:
- +1 if involves financial data
- +1 if real-time requirements
- +1 if distributed system
- +0.5 if brownfield with legacy constraints
- -0.5 if well-established patterns exist
- -0.5 if similar system already implemented

### 4. Resource Recommendation

Based on complexity score:

**Simple (1-3)**
- Single agent: Developer
- Straightforward implementation
- Standard patterns apply

**Moderate (4-6)**
- 2-3 agents: Developer + QA, possibly Architect
- Some design decisions needed
- Testing strategy important

**Complex (7-8)**
- Multiple agents: Architect + Developer + QA
- Careful design required
- Structured workflow beneficial

**Extreme (9-10)**
- Full orchestration: All specialists
- Formal workflow essential
- Multiple review cycles

### 5. Specific Agent Triggers

Regardless of complexity score, activate specific agents for:

**Architect (Winston)**:
- New service/component design
- Technology selection decisions
- Integration pattern design
- Scalability planning
- Major refactoring

**Developer (James)**:
- Code implementation
- Bug fixes
- Performance optimization
- Refactoring
- Technical debt reduction

**QA (Elena)**:
- Test strategy design
- User experience concerns
- Edge case identification
- Quality metrics definition
- Regression prevention

**Security (Marcus)**:
- Authentication/authorization
- Data encryption needs
- Compliance requirements
- Threat modeling
- Security review

### 6. Output Format

```yaml
Task: [Original task description]
Complexity Analysis:
  Technical Complexity: X/10
    - [Specific factors]
  Architectural Impact: X/10
    - [Specific factors]
  Business Criticality: X/10
    - [Specific factors]
  Implementation Risk: X/10
    - [Specific factors]
  Security Sensitivity: X/10
    - [Specific factors]

Overall Complexity: X.X/10 (Category)

Recommended Approach:
  Primary Agent(s): [List]
  Supporting Agent(s): [List if needed]
  Workflow: [Specific workflow if applicable]
  
Key Considerations:
  - [Important factor 1]
  - [Important factor 2]
  - [Important factor 3]

Suggested First Steps:
  1. [Concrete action]
  2. [Concrete action]
  3. [Concrete action]
```

### 7. Pattern Recording

If this is a new type of task:
- Note the pattern for future reference
- Record successful approaches
- Update complexity heuristics

## Integration Notes

This task can be invoked:
- Directly via `*analyze <task>` in orchestrator
- As part of `/analyze` command
- Within any agent needing complexity assessment
- As first step in workflows

## Success Criteria

- [ ] All dimensions analyzed
- [ ] Clear complexity score provided
- [ ] Specific agents recommended
- [ ] Actionable next steps defined
- [ ] Rationale explained clearly