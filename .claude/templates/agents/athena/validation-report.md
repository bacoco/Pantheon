---
id: "validation-report"
name: "Story Validation Report Template"
description: "Comprehensive validation report for implemented features"
category: "product"
agent: "sarah"
frameworks: ["agile", "scrum"]
dependencies: []
tags: ["validation", "acceptance", "quality", "verification", "product-owner"]
testTemplate: null
conflicts: []
mergeStrategy: "new"
targetFiles:
  - path: "docs/validation/{{storyId}}-validation-report.md"
    type: "new"
---

## Overview

This template helps Sarah validate that implemented features meet all acceptance criteria and business requirements before release.

## Template

# Validation Report: {{storyTitle}}

**Story ID**: {{storyId}}  
**Validation Date**: {{validationDate}}  
**Validator**: Sarah (Product Owner)  
**Development Team**: {{devTeam}}  
**Sprint**: {{sprintNumber}}  
**Overall Status**: {{overallStatus}}

## Executive Summary

### Validation Result
**VERDICT**: {{verdict}} ✅/❌/⚠️

### Summary
{{validationSummary}}

### Key Findings
1. {{keyFinding1}}
2. {{keyFinding2}}
3. {{keyFinding3}}

## Acceptance Criteria Validation

### Functional Requirements

| Criteria ID | Description | Status | Notes |
|-------------|-------------|--------|-------|
| AC-001 | {{criteria1}} | {{status1}} | {{notes1}} |
| AC-002 | {{criteria2}} | {{status2}} | {{notes2}} |
| AC-003 | {{criteria3}} | {{status3}} | {{notes3}} |
| AC-004 | {{criteria4}} | {{status4}} | {{notes4}} |
| AC-005 | {{criteria5}} | {{status5}} | {{notes5}} |

**Functional Score**: {{functionalScore}}/{{totalFunctional}} ({{functionalPercentage}}%)

### Scenario Testing Results

#### Scenario 1: {{scenario1Name}}
- **Test Date**: {{testDate1}}
- **Tester**: {{tester1}}
- **Result**: {{result1}}
- **Evidence**: {{evidence1}}
- **Issues Found**: {{issues1}}

#### Scenario 2: {{scenario2Name}}
- **Test Date**: {{testDate2}}
- **Tester**: {{tester2}}
- **Result**: {{result2}}
- **Evidence**: {{evidence2}}
- **Issues Found**: {{issues2}}

### Edge Case Validation

| Edge Case | Expected Behavior | Actual Behavior | Pass/Fail |
|-----------|-------------------|-----------------|-----------|
| {{edgeCase1}} | {{expected1}} | {{actual1}} | {{passFail1}} |
| {{edgeCase2}} | {{expected2}} | {{actual2}} | {{passFail2}} |
| {{edgeCase3}} | {{expected3}} | {{actual3}} | {{passFail3}} |

## Non-Functional Requirements

### Performance Validation
| Metric | Target | Actual | Status | Notes |
|--------|--------|--------|--------|-------|
| Response Time | {{targetResponse}} | {{actualResponse}} | {{responseStatus}} | {{responseNotes}} |
| Page Load | {{targetLoad}} | {{actualLoad}} | {{loadStatus}} | {{loadNotes}} |
| Concurrent Users | {{targetUsers}} | {{actualUsers}} | {{usersStatus}} | {{usersNotes}} |
| Memory Usage | {{targetMemory}} | {{actualMemory}} | {{memoryStatus}} | {{memoryNotes}} |

### Security Validation
- [ ] Authentication working as specified
- [ ] Authorization rules enforced correctly
- [ ] Data encryption verified
- [ ] Input validation preventing attacks
- [ ] Security headers properly configured
- [ ] Audit logging functional

**Security Issues**: {{securityIssues}}

### Usability Validation

#### Accessibility Testing
| Test | Result | WCAG Level | Notes |
|------|--------|------------|-------|
| Keyboard Navigation | {{keyboardResult}} | {{keyboardWCAG}} | {{keyboardNotes}} |
| Screen Reader | {{screenReaderResult}} | {{screenReaderWCAG}} | {{screenReaderNotes}} |
| Color Contrast | {{contrastResult}} | {{contrastWCAG}} | {{contrastNotes}} |
| Focus Indicators | {{focusResult}} | {{focusWCAG}} | {{focusNotes}} |

#### User Experience Review
- **Intuitiveness**: {{intuitiveScore}}/5
- **Visual Design**: {{visualScore}}/5
- **Error Handling**: {{errorScore}}/5
- **Help/Documentation**: {{helpScore}}/5

**UX Comments**: {{uxComments}}

### Browser Compatibility

| Browser | Version | Status | Issues |
|---------|---------|--------|--------|
| Chrome | {{chromeVersion}} | {{chromeStatus}} | {{chromeIssues}} |
| Firefox | {{firefoxVersion}} | {{firefoxStatus}} | {{firefoxIssues}} |
| Safari | {{safariVersion}} | {{safariStatus}} | {{safariIssues}} |
| Edge | {{edgeVersion}} | {{edgeStatus}} | {{edgeIssues}} |
| Mobile Safari | {{mobileSafariVersion}} | {{mobileSafariStatus}} | {{mobileSafariIssues}} |
| Chrome Mobile | {{chromeMobileVersion}} | {{chromeMobileStatus}} | {{chromeMobileIssues}} |

## Business Requirements Validation

### Business Value Delivery
**Expected Value**: {{expectedValue}}  
**Delivered Value**: {{deliveredValue}}  
**Value Gap**: {{valueGap}}

### User Problem Resolution
**Original Problem**: {{originalProblem}}  
**Solution Effectiveness**: {{solutionEffectiveness}}  
**User Feedback**: {{userFeedback}}

### Success Metrics Projection
| Metric | Current | Projected (30 days) | Projected (90 days) |
|--------|---------|--------------------|--------------------|
| {{metric1}} | {{current1}} | {{projected30_1}} | {{projected90_1}} |
| {{metric2}} | {{current2}} | {{projected30_2}} | {{projected90_2}} |
| {{metric3}} | {{current3}} | {{projected30_3}} | {{projected90_3}} |

## User Acceptance Testing (UAT)

### UAT Participants
| Name | Role | Test Date | Feedback |
|------|------|-----------|----------|
| {{participant1}} | {{role1}} | {{date1}} | {{feedback1}} |
| {{participant2}} | {{role2}} | {{date2}} | {{feedback2}} |
| {{participant3}} | {{role3}} | {{date3}} | {{feedback3}} |

### UAT Findings
1. **Positive Feedback**:
   - {{positiveFeedback1}}
   - {{positiveFeedback2}}
   - {{positiveFeedback3}}

2. **Areas for Improvement**:
   - {{improvement1}}
   - {{improvement2}}
   - {{improvement3}}

3. **Critical Issues**:
   - {{criticalIssue1}}
   - {{criticalIssue2}}

## Defects and Issues

### Open Defects
| ID | Description | Severity | Assigned To | ETA |
|----|-------------|----------|-------------|-----|
| {{defectId1}} | {{defectDesc1}} | {{severity1}} | {{assignee1}} | {{eta1}} |
| {{defectId2}} | {{defectDesc2}} | {{severity2}} | {{assignee2}} | {{eta2}} |

### Resolved During Validation
| ID | Description | Resolution |
|----|-------------|------------|
| {{resolvedId1}} | {{resolvedDesc1}} | {{resolution1}} |
| {{resolvedId2}} | {{resolvedDesc2}} | {{resolution2}} |

## Documentation Review

### User Documentation
- [ ] Feature documented in user guide
- [ ] FAQ updated
- [ ] Tutorial/walkthrough created
- [ ] Release notes prepared

**Documentation Status**: {{docStatus}}

### Technical Documentation
- [ ] API documentation complete
- [ ] Code comments adequate
- [ ] Architecture diagrams updated
- [ ] Runbook created

## Analytics Validation

### Tracking Implementation
| Event | Implemented | Firing Correctly | Data Quality |
|-------|-------------|------------------|--------------|
| {{event1}} | {{implemented1}} | {{firing1}} | {{quality1}} |
| {{event2}} | {{implemented2}} | {{firing2}} | {{quality2}} |
| {{event3}} | {{implemented3}} | {{firing3}} | {{quality3}} |

### Dashboard Setup
- [ ] Metrics dashboard configured
- [ ] Alerts configured
- [ ] Reports scheduled

## Release Readiness

### Go-Live Checklist
- [ ] All P0 acceptance criteria passed
- [ ] No critical defects open
- [ ] Performance benchmarks met
- [ ] Security review passed
- [ ] Documentation complete
- [ ] Support team trained
- [ ] Rollback plan tested
- [ ] Feature flags configured
- [ ] Monitoring in place
- [ ] Communication plan ready

### Risk Assessment
| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| {{risk1}} | {{likelihood1}} | {{impact1}} | {{mitigation1}} |
| {{risk2}} | {{likelihood2}} | {{impact2}} | {{mitigation2}} |

## Recommendations

### Immediate Actions Required
1. {{immediateAction1}}
2. {{immediateAction2}}
3. {{immediateAction3}}

### Future Enhancements
1. {{enhancement1}}
2. {{enhancement2}}
3. {{enhancement3}}

### Technical Debt Identified
1. {{techDebt1}}
2. {{techDebt2}}

## Sign-off

### Product Owner Approval
**Sarah (Product Owner)**  
**Date**: {{poSignoffDate}}  
**Decision**: {{poDecision}}  
**Conditions**: {{poConditions}}

### Stakeholder Approvals
| Stakeholder | Role | Date | Approval | Conditions |
|-------------|------|------|----------|------------|
| {{stakeholder1}} | {{role1}} | {{date1}} | {{approval1}} | {{conditions1}} |
| {{stakeholder2}} | {{role2}} | {{date2}} | {{approval2}} | {{conditions2}} |

## Appendices

### A. Test Evidence
- Screenshot links: {{screenshotLinks}}
- Video recordings: {{videoLinks}}
- Test logs: {{testLogLinks}}

### B. User Feedback Verbatims
1. "{{verbatim1}}"
2. "{{verbatim2}}"
3. "{{verbatim3}}"

### C. Performance Test Results
{{performanceTestDetails}}

### D. Security Scan Report
{{securityScanSummary}}

---

## Sarah's Validation Principles

1. **Trust but Verify**: Test everything, assume nothing
2. **User Advocacy**: Represent the user's interests
3. **Quality Gate**: No compromise on acceptance criteria
4. **Data-Driven**: Let metrics guide decisions
5. **Continuous Improvement**: Learn from each release