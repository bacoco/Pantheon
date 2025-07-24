---
id: "user-story-template"
name: "User Story with Acceptance Criteria Template"
description: "Comprehensive user story template with detailed acceptance criteria"
category: "product"
agent: "sarah"
frameworks: ["agile", "scrum"]
dependencies: []
tags: ["user-story", "acceptance-criteria", "agile", "requirements", "validation"]
testTemplate: null
conflicts: []
mergeStrategy: "append"
targetFiles:
  - path: "docs/stories/{{storyId}}-{{storyTitle}}.md"
    type: "new"
---

## Overview

This template helps Sarah (PO) create detailed user stories with comprehensive acceptance criteria, ensuring clear communication between product and development teams.

## Template

# User Story: {{storyTitle}}

**Story ID**: {{storyId}}  
**Epic**: {{epicName}}  
**Sprint**: {{sprintNumber}}  
**Points**: {{storyPoints}}  
**Priority**: {{priority}}  
**Created**: {{createdDate}}  
**Author**: Sarah (Product Owner)  
**Status**: {{status}}

## Story Overview

### User Story Statement
**As a** {{userRole}}  
**I want to** {{userGoal}}  
**So that** {{userBenefit}}

### Business Value
{{businessValue}}

### User Problem
{{userProblem}}

### Assumptions
1. {{assumption1}}
2. {{assumption2}}
3. {{assumption3}}

### Dependencies
- **Blocked by**: {{blockedBy}}
- **Blocks**: {{blocks}}
- **Related to**: {{relatedStories}}

## Acceptance Criteria

### Functional Criteria

#### Scenario 1: {{scenario1Name}}
**Given** {{given1}}  
**When** {{when1}}  
**Then** {{then1}}  
**And** {{and1}}

```gherkin
Scenario: {{scenario1Name}}
  Given {{given1}}
  When {{when1}}
  Then {{then1}}
  And {{and1}}
```

#### Scenario 2: {{scenario2Name}}
**Given** {{given2}}  
**When** {{when2}}  
**Then** {{then2}}  
**And** {{and2}}

#### Scenario 3: {{scenario3Name}}
**Given** {{given3}}  
**When** {{when3}}  
**Then** {{then3}}

### Edge Cases

#### Edge Case 1: {{edgeCase1}}
**Given** {{edgeGiven1}}  
**When** {{edgeWhen1}}  
**Then** {{edgeThen1}}

#### Edge Case 2: {{edgeCase2}}
**Given** {{edgeGiven2}}  
**When** {{edgeWhen2}}  
**Then** {{edgeThen2}}

### Error Handling

#### Error Scenario 1: {{errorScenario1}}
**Given** {{errorGiven1}}  
**When** {{errorWhen1}}  
**Then** {{errorThen1}}  
**And** the system should {{errorBehavior1}}

#### Error Scenario 2: {{errorScenario2}}
**Given** {{errorGiven2}}  
**When** {{errorWhen2}}  
**Then** {{errorThen2}}

### Non-Functional Criteria

#### Performance
- [ ] Response time < {{responseTime}}
- [ ] Can handle {{concurrentUsers}} concurrent users
- [ ] Page load time < {{pageLoadTime}}
- [ ] API response time < {{apiResponseTime}}

#### Security
- [ ] User authentication required for {{secureFeatures}}
- [ ] Data encrypted in transit
- [ ] Input validation prevents {{securityThreats}}
- [ ] Audit log captures {{auditEvents}}

#### Usability
- [ ] Feature is accessible via keyboard navigation
- [ ] Screen reader compatible
- [ ] Mobile responsive
- [ ] Clear error messages displayed
- [ ] Help text available for {{helpAreas}}

#### Compatibility
- [ ] Works on Chrome (latest 2 versions)
- [ ] Works on Firefox (latest 2 versions)
- [ ] Works on Safari (latest 2 versions)
- [ ] Works on Edge (latest 2 versions)
- [ ] Mobile Safari (iOS 14+)
- [ ] Chrome Mobile (Android 10+)

## User Interface

### UI Components
1. **{{component1}}**: {{component1Description}}
2. **{{component2}}**: {{component2Description}}
3. **{{component3}}**: {{component3Description}}

### Mockups
- [Link to Figma designs]({{figmaLink}})
- [Link to wireframes]({{wireframeLink}})

### UI States
- **Default State**: {{defaultState}}
- **Loading State**: {{loadingState}}
- **Error State**: {{errorState}}
- **Success State**: {{successState}}
- **Empty State**: {{emptyState}}

### Responsive Behavior
- **Desktop**: {{desktopBehavior}}
- **Tablet**: {{tabletBehavior}}
- **Mobile**: {{mobileBehavior}}

## Data Requirements

### Input Data
| Field | Type | Required | Validation | Default |
|-------|------|----------|------------|---------|
| {{field1}} | {{type1}} | {{required1}} | {{validation1}} | {{default1}} |
| {{field2}} | {{type2}} | {{required2}} | {{validation2}} | {{default2}} |
| {{field3}} | {{type3}} | {{required3}} | {{validation3}} | {{default3}} |

### Output Data
| Field | Type | Format | Example |
|-------|------|--------|---------|
| {{output1}} | {{outputType1}} | {{format1}} | {{example1}} |
| {{output2}} | {{outputType2}} | {{format2}} | {{example2}} |

### Data Constraints
- {{constraint1}}
- {{constraint2}}
- {{constraint3}}

## API Specifications

### Endpoints Required
```yaml
- method: {{method1}}
  path: {{path1}}
  description: {{apiDescription1}}
  request:
    {{request1}}
  response:
    {{response1}}

- method: {{method2}}
  path: {{path2}}
  description: {{apiDescription2}}
  request:
    {{request2}}
  response:
    {{response2}}
```

### Error Responses
| Error Code | Scenario | User Message |
|------------|----------|--------------|
| {{errorCode1}} | {{errorScenario1}} | {{userMessage1}} |
| {{errorCode2}} | {{errorScenario2}} | {{userMessage2}} |

## Testing Guidelines

### Test Cases to Cover
1. **Happy Path**: {{happyPath}}
2. **Alternative Paths**: {{alternativePaths}}
3. **Error Paths**: {{errorPaths}}
4. **Boundary Testing**: {{boundaryTests}}
5. **Performance Testing**: {{performanceTests}}

### Test Data
```json
{
  "validData": {{validTestData}},
  "invalidData": {{invalidTestData}},
  "edgeCaseData": {{edgeCaseTestData}}
}
```

### Regression Testing
- [ ] Existing feature {{existingFeature1}} still works
- [ ] No impact on {{relatedFeature1}}
- [ ] Performance benchmarks maintained

## Analytics & Tracking

### Events to Track
1. **{{event1}}**: {{event1Description}}
   - Properties: {{event1Properties}}
2. **{{event2}}**: {{event2Description}}
   - Properties: {{event2Properties}}
3. **{{event3}}**: {{event3Description}}
   - Properties: {{event3Properties}}

### Success Metrics
- **Primary Metric**: {{primaryMetric}}
- **Secondary Metrics**: 
  - {{secondaryMetric1}}
  - {{secondaryMetric2}}
- **Tracking Period**: {{trackingPeriod}}

## Release Criteria

### Definition of Done
- [ ] All acceptance criteria met
- [ ] Unit tests written and passing
- [ ] Integration tests written and passing
- [ ] Code reviewed and approved
- [ ] Documentation updated
- [ ] UI/UX review passed
- [ ] Performance criteria met
- [ ] Security review completed
- [ ] Analytics implemented
- [ ] Feature flag configured
- [ ] Rollback plan documented

### Release Plan
- **Feature Flag**: {{featureFlag}}
- **Rollout Strategy**: {{rolloutStrategy}}
- **Target Users**: {{targetUsers}}
- **Monitoring Plan**: {{monitoringPlan}}

## Documentation

### User Documentation
- [ ] User guide updated
- [ ] FAQ section added
- [ ] Video tutorial created
- [ ] Release notes prepared

### Technical Documentation
- [ ] API documentation updated
- [ ] Architecture diagram updated
- [ ] Database schema documented
- [ ] Configuration guide updated

## Stakeholder Sign-off

| Stakeholder | Role | Sign-off Date | Comments |
|-------------|------|---------------|----------|
| {{stakeholder1}} | {{role1}} | {{date1}} | {{comments1}} |
| {{stakeholder2}} | {{role2}} | {{date2}} | {{comments2}} |
| {{stakeholder3}} | {{role3}} | {{date3}} | {{comments3}} |

## Notes and Clarifications

### Open Questions
1. {{question1}}
2. {{question2}}

### Decisions Made
1. **{{decision1}}**: {{decisionRationale1}}
2. **{{decision2}}**: {{decisionRationale2}}

### Out of Scope
- {{outOfScope1}}
- {{outOfScope2}}
- {{outOfScope3}}

---

## Sarah's PO Best Practices

1. **Clear is Kind**: Ambiguity leads to rework
2. **Test Everything**: If it's not tested, it's not done
3. **User First**: Always consider the user's perspective
4. **Measure Success**: Define metrics before building
5. **Iterate**: Stories evolve through collaboration