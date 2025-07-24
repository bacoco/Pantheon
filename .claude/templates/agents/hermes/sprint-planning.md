---
id: "sprint-planning"
name: "Sprint Planning Document Template"
description: "Comprehensive sprint planning template for effective sprint execution"
category: "agile"
agent: "hermes"
frameworks: ["scrum", "agile"]
dependencies: []
tags: ["sprint", "planning", "scrum", "agile", "velocity"]
testTemplate: null
conflicts: []
mergeStrategy: "new"
targetFiles:
  - path: "docs/sprints/sprint-{{sprintNumber}}-plan.md"
    type: "new"
---

## Overview

This template helps Hermes create detailed sprint plans that set teams up for successful sprint execution with clear goals, capacity planning, and risk mitigation.

## Template

# Sprint {{sprintNumber}} Planning Document

**Sprint Name**: {{sprintName}}  
**Sprint Duration**: {{startDate}} - {{endDate}}  
**Sprint Goal**: {{sprintGoal}}  
**Scrum Master**: Hermes  
**Product Owner**: {{productOwner}}  
**Team Members**: {{teamMembers}}  
**Planning Date**: {{planningDate}}

## Sprint Overview

### Sprint Goal
{{detailedSprintGoal}}

### Success Criteria
1. {{successCriteria1}}
2. {{successCriteria2}}
3. {{successCriteria3}}

### Business Value
{{businessValueStatement}}

## Team Capacity

### Availability Matrix
| Team Member | Role | Capacity (hours) | Planned PTO | Actual Available | Story Points |
|-------------|------|------------------|-------------|------------------|--------------|
| {{member1}} | {{role1}} | {{capacity1}} | {{pto1}} | {{available1}} | {{points1}} |
| {{member2}} | {{role2}} | {{capacity2}} | {{pto2}} | {{available2}} | {{points2}} |
| {{member3}} | {{role3}} | {{capacity3}} | {{pto3}} | {{available3}} | {{points3}} |
| {{member4}} | {{role4}} | {{capacity4}} | {{pto4}} | {{available4}} | {{points4}} |
| **Total** | | {{totalCapacity}} | {{totalPTO}} | {{totalAvailable}} | {{totalPoints}} |

### Velocity Analysis
- **3-Sprint Average**: {{avgVelocity}} points
- **Last Sprint**: {{lastSprintVelocity}} points
- **Sprint Capacity**: {{sprintCapacity}} points
- **Commitment**: {{commitment}} points
- **Buffer**: {{buffer}}%

## Sprint Backlog

### Committed Stories

#### Priority 1: Must Complete
| Story ID | Title | Points | Assignee | Dependencies | Acceptance Criteria |
|----------|-------|--------|----------|--------------|-------------------|
| {{story1Id}} | {{story1Title}} | {{story1Points}} | {{story1Assignee}} | {{story1Deps}} | {{story1AC}} |
| {{story2Id}} | {{story2Title}} | {{story2Points}} | {{story2Assignee}} | {{story2Deps}} | {{story2AC}} |
| {{story3Id}} | {{story3Title}} | {{story3Points}} | {{story3Assignee}} | {{story3Deps}} | {{story3AC}} |

#### Priority 2: Should Complete
| Story ID | Title | Points | Assignee | Dependencies |
|----------|-------|--------|----------|--------------|
| {{story4Id}} | {{story4Title}} | {{story4Points}} | {{story4Assignee}} | {{story4Deps}} |
| {{story5Id}} | {{story5Title}} | {{story5Points}} | {{story5Assignee}} | {{story5Deps}} |

#### Stretch Goals
| Story ID | Title | Points | Why Stretch? |
|----------|-------|--------|--------------|
| {{stretch1Id}} | {{stretch1Title}} | {{stretch1Points}} | {{stretch1Reason}} |
| {{stretch2Id}} | {{stretch2Title}} | {{stretch2Points}} | {{stretch2Reason}} |

### Technical Debt Items
| Item | Description | Points | Impact if Not Done |
|------|-------------|--------|-------------------|
| {{debt1}} | {{debt1Desc}} | {{debt1Points}} | {{debt1Impact}} |
| {{debt2}} | {{debt2Desc}} | {{debt2Points}} | {{debt2Impact}} |

### Bug Fixes
| Bug ID | Severity | Description | Points | Assignee |
|--------|----------|-------------|--------|----------|
| {{bug1Id}} | {{bug1Severity}} | {{bug1Desc}} | {{bug1Points}} | {{bug1Assignee}} |
| {{bug2Id}} | {{bug2Severity}} | {{bug2Desc}} | {{bug2Points}} | {{bug2Assignee}} |

## Story Breakdown and Dependencies

### Dependency Map
```mermaid
graph LR
    {{story1Id}}[{{story1Title}}] --> {{story2Id}}[{{story2Title}}]
    {{story2Id}} --> {{story3Id}}[{{story3Title}}]
    {{story4Id}}[{{story4Title}}] --> {{story3Id}}
    {{dependencyDiagram}}
```

### Daily Story Flow
```yaml
Day 1-2:
  - Start: [{{day1Stories}}]
  - Goal: {{day1Goal}}
  
Day 3-4:
  - Start: [{{day3Stories}}]
  - Complete: [{{day3Complete}}]
  - Goal: {{day3Goal}}
  
Day 5-6:
  - Start: [{{day5Stories}}]
  - Complete: [{{day5Complete}}]
  - Goal: {{day5Goal}}
  
Day 7-8:
  - Complete: [{{day7Complete}}]
  - Testing Focus
  
Day 9-10:
  - Bug Fixes
  - Documentation
  - Sprint Review Prep
```

## Risk Assessment and Mitigation

### Identified Risks
| Risk | Probability | Impact | Mitigation Strategy | Owner |
|------|-------------|--------|-------------------|-------|
| {{risk1}} | {{risk1Prob}} | {{risk1Impact}} | {{risk1Mitigation}} | {{risk1Owner}} |
| {{risk2}} | {{risk2Prob}} | {{risk2Impact}} | {{risk2Mitigation}} | {{risk2Owner}} |
| {{risk3}} | {{risk3Prob}} | {{risk3Impact}} | {{risk3Mitigation}} | {{risk3Owner}} |

### Blockers and Dependencies
1. **{{blocker1}}**
   - Status: {{blocker1Status}}
   - Action: {{blocker1Action}}
   - Owner: {{blocker1Owner}}
   - Due: {{blocker1Due}}

2. **{{blocker2}}**
   - Status: {{blocker2Status}}
   - Action: {{blocker2Action}}
   - Owner: {{blocker2Owner}}

## Definition of Done

### Story Level
- [ ] Code complete and follows standards
- [ ] Unit tests written and passing (>80% coverage)
- [ ] Integration tests written and passing
- [ ] Code reviewed and approved
- [ ] Documentation updated
- [ ] Deployed to staging environment
- [ ] Acceptance criteria verified by PO
- [ ] No critical bugs

### Sprint Level
- [ ] All committed stories meet DoD
- [ ] Sprint goal achieved
- [ ] Code merged to main branch
- [ ] Release notes prepared
- [ ] Sprint metrics updated
- [ ] Retrospective completed
- [ ] Next sprint planned

## Team Agreements

### Working Agreements
1. **Core Hours**: {{coreHours}}
2. **Daily Standup**: {{standupTime}}
3. **Code Review SLA**: {{reviewSLA}}
4. **Communication Channel**: {{commChannel}}
5. **Escalation Process**: {{escalationProcess}}

### Technical Standards
- **Coding Standards**: {{codingStandards}}
- **Testing Requirements**: {{testingReqs}}
- **Documentation Standards**: {{docStandards}}
- **Git Workflow**: {{gitWorkflow}}

### Meeting Schedule
| Meeting | Day/Time | Duration | Purpose | Attendees |
|---------|----------|----------|---------|-----------|
| Daily Standup | {{standupSchedule}} | 15 min | Sync & blockers | All |
| Mid-Sprint Review | {{midSprintSchedule}} | 1 hour | Progress check | All |
| Backlog Refinement | {{refinementSchedule}} | 2 hours | Story preparation | All |
| Sprint Review | {{reviewSchedule}} | 1 hour | Demo & feedback | All + Stakeholders |
| Retrospective | {{retroSchedule}} | 1.5 hours | Improvement | All |

## Sprint Ceremonies Plan

### Sprint Review Agenda
1. Sprint Goal Recap (5 min)
2. Demos:
   - {{demo1}} ({{demo1Duration}})
   - {{demo2}} ({{demo2Duration}})
   - {{demo3}} ({{demo3Duration}})
3. Metrics Review (10 min)
4. Stakeholder Feedback (15 min)
5. Next Sprint Preview (5 min)

### Demo Assignments
| Story | Demo Owner | Demo Environment | Special Setup |
|-------|------------|------------------|---------------|
| {{demoStory1}} | {{demoOwner1}} | {{demoEnv1}} | {{demoSetup1}} |
| {{demoStory2}} | {{demoOwner2}} | {{demoEnv2}} | {{demoSetup2}} |

## Metrics and Tracking

### Sprint Metrics to Track
- **Velocity**: Target {{targetVelocity}} / Actual ___
- **Commitment Accuracy**: Target 90% / Actual ___
- **Defect Rate**: Target <5% / Actual ___
- **Code Coverage**: Target >80% / Actual ___
- **Cycle Time**: Target {{targetCycleTime}} / Actual ___

### Daily Tracking
```yaml
burndown_chart:
  day_0: {{totalPoints}} points
  day_1: ___ points remaining
  day_2: ___ points remaining
  # ... continue for sprint duration
  
daily_health:
  - date: ___
    blockers: ___
    risks: ___
    mood: ___
```

### Success Indicators
- [ ] Burndown tracking ideal line
- [ ] No blockers lasting >1 day
- [ ] Team morale positive
- [ ] Stakeholder satisfaction high
- [ ] Quality metrics met

## Communication Plan

### Stakeholder Updates
| Stakeholder | Update Frequency | Format | Owner |
|-------------|------------------|--------|-------|
| {{stakeholder1}} | {{freq1}} | {{format1}} | {{owner1}} |
| {{stakeholder2}} | {{freq2}} | {{format2}} | {{owner2}} |
| {{stakeholder3}} | {{freq3}} | {{format3}} | {{owner3}} |

### Escalation Matrix
| Issue Type | Level 1 | Level 2 | Level 3 |
|------------|---------|---------|---------|
| Technical Blocker | {{tech1}} | {{tech2}} | {{tech3}} |
| Resource Issue | {{resource1}} | {{resource2}} | {{resource3}} |
| Scope Change | {{scope1}} | {{scope2}} | {{scope3}} |

## Learning and Improvement

### Experiment for This Sprint
**Hypothesis**: {{experimentHypothesis}}  
**Method**: {{experimentMethod}}  
**Success Criteria**: {{experimentCriteria}}  
**Review in Retro**: Yes

### Skills Development
| Team Member | Skill Focus | Plan | Pair With |
|-------------|-------------|------|-----------|
| {{member1}} | {{skill1}} | {{plan1}} | {{pair1}} |
| {{member2}} | {{skill2}} | {{plan2}} | {{pair2}} |

### Knowledge Sharing Sessions
1. **{{session1Topic}}** by {{session1Lead}} on {{session1Date}}
2. **{{session2Topic}}** by {{session2Lead}} on {{session2Date}}

## Retrospective Actions from Last Sprint

### What We're Continuing
1. {{continue1}}
2. {{continue2}}

### What We're Changing
1. {{change1}}
   - Action: {{change1Action}}
   - Owner: {{change1Owner}}
2. {{change2}}
   - Action: {{change2Action}}
   - Owner: {{change2Owner}}

### What We're Starting
1. {{start1}}
2. {{start2}}

## Support and Resources

### Required Resources
- **Environments**: {{environments}}
- **Tools Access**: {{toolsAccess}}
- **External Dependencies**: {{externalDeps}}
- **Documentation**: {{documentation}}

### Support Contacts
| Area | Contact | Availability |
|------|---------|--------------|
| DevOps | {{devopsContact}} | {{devopsAvail}} |
| Security | {{securityContact}} | {{securityAvail}} |
| Architecture | {{archContact}} | {{archAvail}} |
| Database | {{dbContact}} | {{dbAvail}} |

## Sprint Checklist

### Pre-Sprint
- [x] Backlog refined and estimated
- [x] Capacity calculated
- [x] Dependencies identified
- [x] Risks assessed
- [x] Team availability confirmed

### During Sprint
- [ ] Daily standups effective
- [ ] Blockers addressed quickly
- [ ] Progress tracked daily
- [ ] Stakeholders updated
- [ ] Quality maintained

### End of Sprint
- [ ] All stories demoed
- [ ] Metrics collected
- [ ] Retrospective completed
- [ ] Next sprint ready
- [ ] Celebrations had!

---

## Hermes's Sprint Planning Principles

1. **Realistic Commitments**: Under-promise, over-deliver
2. **Clear Communication**: Everyone knows the plan
3. **Risk Awareness**: Identify and mitigate early
4. **Team Empowerment**: Let the team own the sprint
5. **Continuous Improvement**: Every sprint better than the last