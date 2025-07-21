---
id: "product-roadmap"
name: "Product Roadmap Template"
description: "Strategic product roadmap for planning and communication"
category: "product"
agent: "john"
frameworks: ["any"]
dependencies: []
tags: ["product", "roadmap", "planning", "strategy", "timeline"]
testTemplate: null
conflicts: []
mergeStrategy: "new"
targetFiles:
  - path: "docs/product/roadmap-{{year}}.md"
    type: "new"
---

## Overview

This template helps John create visual and strategic product roadmaps that align teams around product direction and priorities.

## Template

# Product Roadmap: {{productName}}

**Year**: {{year}}  
**Last Updated**: {{lastUpdated}}  
**Product Manager**: John  
**Review Cycle**: {{reviewCycle}}

## Executive Summary

### Product Vision
{{productVision}}

### Strategic Themes for {{year}}
1. **{{theme1}}**: {{theme1Description}}
2. **{{theme2}}**: {{theme2Description}}
3. **{{theme3}}**: {{theme3Description}}

### Key Outcomes
- {{outcome1}}
- {{outcome2}}
- {{outcome3}}

## Roadmap Overview

```mermaid
gantt
    title {{productName}} Roadmap {{year}}
    dateFormat YYYY-MM-DD
    
    section Q1
    {{q1Item1}}        :{{q1Item1Start}}, {{q1Item1Duration}}
    {{q1Item2}}        :{{q1Item2Start}}, {{q1Item2Duration}}
    {{q1Item3}}        :{{q1Item3Start}}, {{q1Item3Duration}}
    
    section Q2
    {{q2Item1}}        :{{q2Item1Start}}, {{q2Item1Duration}}
    {{q2Item2}}        :{{q2Item2Start}}, {{q2Item2Duration}}
    {{q2Item3}}        :{{q2Item3Start}}, {{q2Item3Duration}}
    
    section Q3
    {{q3Item1}}        :{{q3Item1Start}}, {{q3Item1Duration}}
    {{q3Item2}}        :{{q3Item2Start}}, {{q3Item2Duration}}
    
    section Q4
    {{q4Item1}}        :{{q4Item1Start}}, {{q4Item1Duration}}
    {{q4Item2}}        :{{q4Item2Start}}, {{q4Item2Duration}}
```

## Quarterly Breakdown

### Q1: {{q1Theme}}

#### Objectives
1. {{q1Objective1}}
2. {{q1Objective2}}
3. {{q1Objective3}}

#### Key Features

**{{q1Feature1}}** [{{q1Feature1Status}}]
- **Problem**: {{q1Feature1Problem}}
- **Solution**: {{q1Feature1Solution}}
- **Impact**: {{q1Feature1Impact}}
- **Success Metrics**: {{q1Feature1Metrics}}
- **Dependencies**: {{q1Feature1Dependencies}}
- **Team**: {{q1Feature1Team}}

**{{q1Feature2}}** [{{q1Feature2Status}}]
- **Problem**: {{q1Feature2Problem}}
- **Solution**: {{q1Feature2Solution}}
- **Impact**: {{q1Feature2Impact}}
- **Success Metrics**: {{q1Feature2Metrics}}

#### Milestones
- [ ] {{q1Milestone1}} - {{q1Milestone1Date}}
- [ ] {{q1Milestone2}} - {{q1Milestone2Date}}
- [ ] {{q1Milestone3}} - {{q1Milestone3Date}}

### Q2: {{q2Theme}}

#### Objectives
1. {{q2Objective1}}
2. {{q2Objective2}}
3. {{q2Objective3}}

#### Key Features

**{{q2Feature1}}** [{{q2Feature1Status}}]
- **Problem**: {{q2Feature1Problem}}
- **Solution**: {{q2Feature1Solution}}
- **Impact**: {{q2Feature1Impact}}
- **Success Metrics**: {{q2Feature1Metrics}}

**{{q2Feature2}}** [{{q2Feature2Status}}]
- **Problem**: {{q2Feature2Problem}}
- **Solution**: {{q2Feature2Solution}}
- **Impact**: {{q2Feature2Impact}}
- **Success Metrics**: {{q2Feature2Metrics}}

### Q3: {{q3Theme}}

#### Objectives
1. {{q3Objective1}}
2. {{q3Objective2}}

#### Key Features

**{{q3Feature1}}** [{{q3Feature1Status}}]
- **Problem**: {{q3Feature1Problem}}
- **Solution**: {{q3Feature1Solution}}
- **Impact**: {{q3Feature1Impact}}

### Q4: {{q4Theme}}

#### Objectives
1. {{q4Objective1}}
2. {{q4Objective2}}

#### Key Features

**{{q4Feature1}}** [{{q4Feature1Status}}]
- **Problem**: {{q4Feature1Problem}}
- **Solution**: {{q4Feature1Solution}}
- **Impact**: {{q4Feature1Impact}}

## Feature Priority Matrix

```mermaid
quadrantChart
    title Feature Priority Matrix
    x-axis Low Impact --> High Impact
    y-axis Low Effort --> High Effort
    
    quadrant-1 Quick Wins
    quadrant-2 Major Projects
    quadrant-3 Fill Ins
    quadrant-4 Questionable
    
    {{feature1}}: [{{feature1Impact}}, {{feature1Effort}}]
    {{feature2}}: [{{feature2Impact}}, {{feature2Effort}}]
    {{feature3}}: [{{feature3Impact}}, {{feature3Effort}}]
    {{feature4}}: [{{feature4Impact}}, {{feature4Effort}}]
    {{feature5}}: [{{feature5Impact}}, {{feature5Effort}}]
```

## Now, Next, Later Framework

### Now (Current Quarter)
| Feature | Status | Owner | Target Date |
|---------|--------|-------|-------------|
| {{nowFeature1}} | {{nowStatus1}} | {{nowOwner1}} | {{nowDate1}} |
| {{nowFeature2}} | {{nowStatus2}} | {{nowOwner2}} | {{nowDate2}} |
| {{nowFeature3}} | {{nowStatus3}} | {{nowOwner3}} | {{nowDate3}} |

### Next (Next Quarter)
| Feature | Status | Owner | Target Date |
|---------|--------|-------|-------------|
| {{nextFeature1}} | {{nextStatus1}} | {{nextOwner1}} | {{nextDate1}} |
| {{nextFeature2}} | {{nextStatus2}} | {{nextOwner2}} | {{nextDate2}} |

### Later (Future Consideration)
| Feature | Rationale | Potential Impact |
|---------|-----------|------------------|
| {{laterFeature1}} | {{laterRationale1}} | {{laterImpact1}} |
| {{laterFeature2}} | {{laterRationale2}} | {{laterImpact2}} |
| {{laterFeature3}} | {{laterRationale3}} | {{laterImpact3}} |

## Technical Debt & Infrastructure

### Planned Technical Improvements
1. **{{techDebt1}}**
   - Current State: {{techDebt1Current}}
   - Target State: {{techDebt1Target}}
   - Quarter: {{techDebt1Quarter}}

2. **{{techDebt2}}**
   - Current State: {{techDebt2Current}}
   - Target State: {{techDebt2Target}}
   - Quarter: {{techDebt2Quarter}}

### Infrastructure Roadmap
- **Q1**: {{infraQ1}}
- **Q2**: {{infraQ2}}
- **Q3**: {{infraQ3}}
- **Q4**: {{infraQ4}}

## Resource Planning

### Team Allocation by Quarter
| Team | Q1 | Q2 | Q3 | Q4 |
|------|----|----|----|----|
| Engineering | {{engQ1}} | {{engQ2}} | {{engQ3}} | {{engQ4}} |
| Design | {{designQ1}} | {{designQ2}} | {{designQ3}} | {{designQ4}} |
| QA | {{qaQ1}} | {{qaQ2}} | {{qaQ3}} | {{qaQ4}} |
| DevOps | {{devopsQ1}} | {{devopsQ2}} | {{devopsQ3}} | {{devopsQ4}} |

### Hiring Plan
- **Q1**: {{hiringQ1}}
- **Q2**: {{hiringQ2}}
- **Q3**: {{hiringQ3}}
- **Q4**: {{hiringQ4}}

## Success Metrics & KPIs

### North Star Metric
**{{northStarMetric}}**: {{northStarCurrent}} → {{northStarTarget}}

### Quarterly KPIs
| Quarter | Metric | Current | Target | Owner |
|---------|--------|---------|--------|-------|
| Q1 | {{q1Metric}} | {{q1Current}} | {{q1Target}} | {{q1Owner}} |
| Q2 | {{q2Metric}} | {{q2Current}} | {{q2Target}} | {{q2Owner}} |
| Q3 | {{q3Metric}} | {{q3Current}} | {{q3Target}} | {{q3Owner}} |
| Q4 | {{q4Metric}} | {{q4Current}} | {{q4Target}} | {{q4Owner}} |

### Leading Indicators
1. {{leadingIndicator1}}: {{leadingIndicator1Description}}
2. {{leadingIndicator2}}: {{leadingIndicator2Description}}
3. {{leadingIndicator3}}: {{leadingIndicator3Description}}

## Dependencies & Risks

### Cross-Team Dependencies
```mermaid
graph LR
    A[{{team1}}] -->|{{dependency1}}| B[{{team2}}]
    B -->|{{dependency2}}| C[{{team3}}]
    C -->|{{dependency3}}| A
    {{additionalDependencies}}
```

### Risk Register
| Risk | Impact | Probability | Mitigation | Owner |
|------|--------|-------------|------------|-------|
| {{risk1}} | {{risk1Impact}} | {{risk1Prob}} | {{risk1Mitigation}} | {{risk1Owner}} |
| {{risk2}} | {{risk2Impact}} | {{risk2Prob}} | {{risk2Mitigation}} | {{risk2Owner}} |
| {{risk3}} | {{risk3Impact}} | {{risk3Prob}} | {{risk3Mitigation}} | {{risk3Owner}} |

## Stakeholder Communication

### Review Schedule
- **Weekly**: {{weeklyReview}}
- **Monthly**: {{monthlyReview}}
- **Quarterly**: {{quarterlyReview}}

### Communication Channels
- **Roadmap Updates**: {{roadmapChannel}}
- **Progress Reports**: {{progressChannel}}
- **Feedback Collection**: {{feedbackChannel}}

## Research & Discovery

### Upcoming Research
1. **{{research1}}**
   - Objective: {{research1Objective}}
   - Timeline: {{research1Timeline}}
   - Method: {{research1Method}}

2. **{{research2}}**
   - Objective: {{research2Objective}}
   - Timeline: {{research2Timeline}}
   - Method: {{research2Method}}

### Discovery Themes
- {{discoveryTheme1}}
- {{discoveryTheme2}}
- {{discoveryTheme3}}

## Competitive Landscape

### Competitive Features to Watch
| Competitor | Feature | Our Response | Timeline |
|------------|---------|--------------|----------|
| {{competitor1}} | {{competitorFeature1}} | {{response1}} | {{timeline1}} |
| {{competitor2}} | {{competitorFeature2}} | {{response2}} | {{timeline2}} |

## Change Management

### Recent Changes
| Date | Change | Rationale | Impact |
|------|--------|-----------|--------|
| {{changeDate1}} | {{change1}} | {{changeRationale1}} | {{changeImpact1}} |
| {{changeDate2}} | {{change2}} | {{changeRationale2}} | {{changeImpact2}} |

### Change Process
1. {{changeStep1}}
2. {{changeStep2}}
3. {{changeStep3}}

## Appendix

### Feature Status Definitions
- **Concept**: Early exploration phase
- **Design**: UX/UI design in progress
- **Development**: Engineering implementation
- **Testing**: QA and user testing
- **Launch**: Deployment and rollout
- **Complete**: Fully launched and stable

### Roadmap Principles
1. **Outcome-Focused**: Features tied to business outcomes
2. **Flexible**: Adapt based on learning and feedback
3. **Transparent**: Clear communication of priorities
4. **Data-Driven**: Decisions based on metrics and research
5. **Customer-Centric**: User needs drive prioritization

---

## John's Roadmap Best Practices

1. **Themes Over Features**: Focus on outcomes, not outputs
2. **Regular Reviews**: Roadmaps are living documents
3. **Buffer Time**: Account for unknowns and technical debt
4. **Clear Communication**: Different views for different audiences
5. **Measure Impact**: Track success of shipped features