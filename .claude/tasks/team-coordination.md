# Team Coordination Task

## Purpose

Coordinate multiple agents working together as a cohesive team, managing roles, responsibilities, communication, and deliverables to achieve complex goals efficiently.

## Core Concepts

### Team Dynamics
- Role-based responsibilities
- Clear communication channels
- Defined handoff procedures
- Shared workspace management
- Collective decision making

### Coordination Styles
1. **Sequential**: Linear task flow
2. **Parallel**: Simultaneous work
3. **Collaborative**: Continuous interaction
4. **Adaptive**: Dynamic adjustment

## Task Instructions

### 1. Team Initialization

When starting team coordination:

**Load Team Configuration**:
```yaml
team:
  name: {team_name}
  members:
    - agent: {agent_id}
      role: {role_name}
      responsibilities: [list]
  leader: {leader_agent}
  coordination: {style}
```

**Initialize Team Workspace**:
```
workspace/
├── artifacts/      # Shared deliverables
├── decisions/      # Decision log
├── communications/ # Team messages
├── progress/       # Status tracking
└── retrospectives/ # Learning records
```

**Assign Roles**:
- Each agent knows their role
- Clear responsibility boundaries
- Backup assignments for critical roles

### 2. Team Briefing

**Conduct Team Kickoff**:
```
=== Team Briefing: {project_name} ===

Objective: {clear_goal_statement}

Team Composition:
- {role}: {agent} - {key_responsibilities}
[repeat for each member]

Timeline: {duration}
Success Criteria: {measurable_outcomes}

{leader}: "Let's break this down..."
```

**Establish Communication Protocol**:
- Update frequency
- Escalation procedures
- Decision-making process
- Conflict resolution

### 3. Planning Phase

**Collaborative Planning**:
```
Team Planning Session:

1. Goal Decomposition
   {leader} facilitates breaking down the main goal

2. Task Identification
   Each member identifies tasks in their domain

3. Dependency Mapping
   Team identifies interdependencies

4. Timeline Creation
   Realistic estimates with buffers

5. Risk Assessment
   Each member notes risks in their area
```

**Create Team Plan**:
```yaml
team_plan:
  phases:
    - phase: Discovery
      lead: {agent}
      duration: {time}
      deliverables: [list]
      
    - phase: Design
      lead: {agent}
      participants: [agents]
      deliverables: [list]
      
    - phase: Implementation
      lead: {agent}
      duration: {time}
      deliverables: [list]
```

### 4. Execution Management

**Parallel Execution**:
```
While phase_active:
  For each active_agent:
    - Execute assigned tasks
    - Update progress
    - Flag blockers
    - Share artifacts
    
  If sync_time:
    Execute team_sync()
```

**Sequential Execution**:
```
For each phase in plan:
  - Activate phase lead
  - Execute phase tasks
  - Validate deliverables
  - Handoff to next phase
  - Update team on progress
```

### 5. Communication Management

**Regular Sync Format**:
```
=== Team Sync {date} ===

Progress Updates:
{agent_1}: Completed {tasks}, working on {current}
{agent_2}: Blocked by {blocker}, need help with {issue}
[continue for each member]

Decisions Needed:
1. {decision_point} - Owner: {agent}
2. {decision_point} - Owner: {agent}

Next Sync: {time}
```

**Asynchronous Updates**:
- Progress notifications
- Blocker alerts
- Artifact availability
- Decision requests

### 6. Handoff Procedures

**Artifact Handoff**:
```
=== Handoff: {from_agent} → {to_agent} ===

Deliverables:
- {artifact_1}: {description}
- {artifact_2}: {description}

Context:
{key points for receiving agent}

Quality Checklist:
☑ Completeness verified
☑ Documentation included
☑ Tests passing
☑ Known issues documented

{to_agent}: "Received. Beginning {next_phase}..."
```

### 7. Decision Making

**Team Decision Process**:
```
Decision Point: {description}

Options Presented:
1. {option_1} - Pros/Cons
2. {option_2} - Pros/Cons

Team Input:
- {agent_1}: Recommends {option} because {reason}
- {agent_2}: Concerns about {issue}

Decision: {final_choice}
Rationale: {explanation}
Owner: {responsible_agent}
```

### 8. Conflict Resolution

**When Conflicts Arise**:
1. Identify the conflict type
2. Gather perspectives
3. Find common ground
4. Propose solutions
5. Reach consensus
6. Document resolution

**Escalation Path**:
- Team discussion
- Leader decision
- User intervention

### 9. Progress Tracking

**Team Dashboard**:
```
Team: {team_name}
Sprint/Phase: {current}
Progress: {percentage}%

Member Status:
✓ {agent_1}: On track
⚠ {agent_2}: At risk
✗ {agent_3}: Blocked

Key Metrics:
- Velocity: {metric}
- Quality: {metric}
- Collaboration: {metric}
```

### 10. Team Retrospective

**After Major Milestones**:
```
=== Team Retrospective ===

What Went Well:
- {success_1}
- {success_2}

Challenges Faced:
- {challenge_1} → {how_resolved}
- {challenge_2} → {lesson_learned}

Improvements for Next Time:
1. {improvement_1}
2. {improvement_2}

Team Morale: {rating}/5
```

## Success Criteria

- [ ] Clear role definition and acceptance
- [ ] Effective communication throughout
- [ ] Timely delivery of all phases
- [ ] Quality standards met
- [ ] Team coordination smooth
- [ ] Decisions documented
- [ ] Knowledge transferred

## Common Patterns

### Feature Development Team
```
PM → UX → Architect → Developer → QA
Sequential with feedback loops
```

### Security Audit Team
```
Security Lead coordinates parallel analysis
All members → Findings → Consolidated report
```

### Agile Sprint Team
```
Daily cycles with all members active
Continuous integration and testing
```

## Anti-Patterns to Avoid

- ❌ Unclear role boundaries
- ❌ Missing handoff documentation
- ❌ Delayed blocker communication
- ❌ Decisions without team input
- ❌ Skipping retrospectives

## Team Coordination Commands

During team operations:
- `*status` - Team member updates
- `*sync` - Force synchronization
- `*handoff` - Execute handoff
- `*decision` - Team decision needed
- `*escalate` - Escalate issue
- `*retrospective` - Team reflection

Remember: Great teams communicate openly, support each other, and focus on collective success over individual achievement.