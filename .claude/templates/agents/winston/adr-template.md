---
id: "adr-template"
name: "Architecture Decision Record Template"
description: "Template for documenting architectural decisions"
category: "architecture"
agent: "winston"
frameworks: ["any"]
dependencies: []
tags: ["architecture", "documentation", "decision-record", "adr"]
testTemplate: null
conflicts: []
mergeStrategy: "append"
targetFiles:
  - path: "docs/architecture/decisions/{{adrNumber}}-{{adrTitle}}.md"
    type: "new"
---

## Overview

This template helps Winston (Architect) create comprehensive Architecture Decision Records (ADRs) that document important architectural decisions made during the project.

## Template

### Architecture Decision Record: {{title}}

**ADR-{{number}}**  
**Date**: {{date}}  
**Status**: {{status}}  
**Deciders**: {{deciders}}  
**Technical Story**: {{technicalStory}}

#### Context and Problem Statement

{{contextDescription}}

We need to {{problemStatement}} because {{businessReason}}.

#### Decision Drivers

* {{driver1}}
* {{driver2}}
* {{driver3}}
* {{driver4}}

#### Considered Options

1. **{{option1Name}}**
   - Description: {{option1Description}}
   - Pros: {{option1Pros}}
   - Cons: {{option1Cons}}
   - Cost: {{option1Cost}}
   - Risk: {{option1Risk}}

2. **{{option2Name}}**
   - Description: {{option2Description}}
   - Pros: {{option2Pros}}
   - Cons: {{option2Cons}}
   - Cost: {{option2Cost}}
   - Risk: {{option2Risk}}

3. **{{option3Name}}**
   - Description: {{option3Description}}
   - Pros: {{option3Pros}}
   - Cons: {{option3Cons}}
   - Cost: {{option3Cost}}
   - Risk: {{option3Risk}}

#### Decision Outcome

**Chosen option**: "{{chosenOption}}", because {{decisionRationale}}.

##### Positive Consequences

* {{positiveConsequence1}}
* {{positiveConsequence2}}
* {{positiveConsequence3}}

##### Negative Consequences

* {{negativeConsequence1}}
* {{negativeConsequence2}}

##### Mitigation Strategies

* {{mitigation1}}
* {{mitigation2}}

#### Implementation Plan

1. **Phase 1**: {{phase1Description}} ({{phase1Timeline}})
   - {{phase1Task1}}
   - {{phase1Task2}}

2. **Phase 2**: {{phase2Description}} ({{phase2Timeline}})
   - {{phase2Task1}}
   - {{phase2Task2}}

3. **Phase 3**: {{phase3Description}} ({{phase3Timeline}})
   - {{phase3Task1}}
   - {{phase3Task2}}

#### Technical Details

##### Architecture Diagram

```mermaid
{{architectureDiagram}}
```

##### Key Components

* **{{component1}}**: {{component1Description}}
* **{{component2}}**: {{component2Description}}
* **{{component3}}**: {{component3Description}}

##### Technology Stack

| Layer | Technology | Justification |
|-------|------------|---------------|
| {{layer1}} | {{tech1}} | {{justification1}} |
| {{layer2}} | {{tech2}} | {{justification2}} |
| {{layer3}} | {{tech3}} | {{justification3}} |

##### Integration Points

* **{{integration1}}**: {{integration1Details}}
* **{{integration2}}**: {{integration2Details}}

#### Compliance and Security

* **Security Considerations**: {{securityConsiderations}}
* **Compliance Requirements**: {{complianceRequirements}}
* **Data Privacy**: {{dataPrivacyMeasures}}

#### Monitoring and Success Metrics

* **KPI 1**: {{kpi1Description}} (Target: {{kpi1Target}})
* **KPI 2**: {{kpi2Description}} (Target: {{kpi2Target}})
* **KPI 3**: {{kpi3Description}} (Target: {{kpi3Target}})

#### Review Schedule

* **3-month review**: Assess {{reviewCriteria1}}
* **6-month review**: Evaluate {{reviewCriteria2}}
* **Annual review**: Comprehensive assessment of decision effectiveness

#### References

* {{reference1}}
* {{reference2}}
* {{reference3}}

---

## Variable Definitions

- `{{number}}`: Sequential ADR number (e.g., "001", "002")
- `{{title}}`: Brief title of the decision (e.g., "microservices-architecture")
- `{{date}}`: Date of decision (ISO format: YYYY-MM-DD)
- `{{status}}`: Current status (Proposed, Accepted, Deprecated, Superseded)
- `{{deciders}}`: List of people involved in the decision
- `{{technicalStory}}`: Link to related technical story or epic

## Usage Example

```typescript
const adrData = {
  number: "003",
  title: "api-gateway-selection",
  date: "2024-01-20",
  status: "Accepted",
  deciders: "Winston (Architect), James (Developer), Marcus (Security)",
  technicalStory: "TECH-123",
  contextDescription: "Our microservices architecture requires a central entry point for client applications",
  problemStatement: "select an API gateway solution",
  businessReason: "we need to handle authentication, rate limiting, and request routing centrally",
  // ... other variables
};

const adr = await winston.generateADR(adrData);
```

## Winston's Best Practices

1. **Be Specific**: Avoid vague statements; include concrete details
2. **Consider Trade-offs**: Every decision has pros and cons - document them
3. **Think Long-term**: Consider maintenance and evolution
4. **Include Metrics**: Define how success will be measured
5. **Plan for Change**: Document review criteria and migration paths