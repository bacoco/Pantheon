---
id: "workflow-optimization"
name: "Workflow Optimization Analysis Template"
description: "Template for analyzing and optimizing existing workflows"
category: "optimization"
agent: "janus"
frameworks: ["any"]
dependencies: []
tags: ["optimization", "analysis", "performance", "workflow"]
testTemplate: null
conflicts: []
mergeStrategy: "new"
targetFiles:
  - path: "docs/workflows/optimizations/{{workflowId}}-optimization.md"
    type: "new"
---

## Overview

This template helps Janus analyze existing workflows and generate optimization recommendations.

## Template

# Workflow Optimization Report: {{workflowName}}

**Analyzed by**: Janus
**Date**: {{analysisDate}}
**Current Version**: {{currentVersion}}
**Proposed Version**: {{proposedVersion}}

## Executive Summary

{{executiveSummary}}

### Key Findings
- **Current Performance**: {{currentPerformance}}
- **Optimization Potential**: {{optimizationPotential}}%
- **Risk Level**: {{riskLevel}}
- **Implementation Effort**: {{effortLevel}}

## Current Workflow Analysis

### Performance Metrics
| Metric | Current | Industry Best | Gap |
|--------|---------|---------------|-----|
| Average Duration | {{currentDuration}} | {{bestDuration}} | {{durationGap}} |
| Success Rate | {{currentSuccess}}% | {{bestSuccess}}% | {{successGap}}% |
| Resource Utilization | {{currentUtilization}}% | {{bestUtilization}}% | {{utilizationGap}}% |
| Defect Rate | {{currentDefects}}% | {{bestDefects}}% | {{defectsGap}}% |

### Bottleneck Analysis
```
Workflow Timeline Analysis:
{{#each phases}}
{{name}}: {{visualBar}} {{duration}} ({{percentage}}%)
{{/each}}

Critical Path: {{criticalPath}}
Bottlenecks Identified: {{bottleneckCount}}
```

### Resource Distribution
| Agent | Current Load | Optimal Load | Status |
|-------|--------------|--------------|--------|
| {{agent1}} | {{load1}}% | {{optimal1}}% | {{status1}} |
| {{agent2}} | {{load2}}% | {{optimal2}}% | {{status2}} |
| {{agent3}} | {{load3}}% | {{optimal3}}% | {{status3}} |

## Optimization Opportunities

### 1. Parallelization Opportunities
**Current State**: {{currentParallelization}}% of steps run in parallel
**Optimized State**: {{optimizedParallelization}}% can run in parallel

#### Parallelizable Steps
{{#each parallelizableSteps}}
- **{{stepName}}**: Currently sequential, can run parallel with {{parallelWith}}
  - Time Savings: {{timeSaving}}
  - Dependencies: {{dependencies}}
  - Risk: {{risk}}
{{/each}}

#### Implementation
```yaml
# Current
phases:
  - name: {{currentPhase}}
    steps: 
      - {{step1}} # Sequential
      - {{step2}} # Sequential
      
# Optimized
phases:
  - name: {{optimizedPhase}}
    parallel_groups:
      - [{{step1}}, {{step2}}] # Parallel
```

### 2. Agent Optimization
**Finding**: {{agentOptimizationFinding}}

#### Rebalancing Plan
{{#each agentRebalancing}}
##### {{agentName}}
- **Current Tasks**: {{currentTasks}}
- **Optimized Tasks**: {{optimizedTasks}}
- **Rationale**: {{rationale}}
{{/each}}

### 3. Process Improvements

#### Redundancy Elimination
{{#each redundancies}}
- **Redundancy**: {{description}}
  - **Current Impact**: {{currentImpact}}
  - **Solution**: {{solution}}
  - **Benefit**: {{benefit}}
{{/each}}

#### Automation Opportunities
{{#each automationOpportunities}}
- **Process**: {{processName}}
  - **Current**: {{currentProcess}}
  - **Automated**: {{automatedProcess}}
  - **Time Savings**: {{timeSavings}}
  - **Implementation**: {{implementation}}
{{/each}}

### 4. Context Optimization

#### Current Handoffs
```mermaid
graph LR
    {{#each currentHandoffs}}
    {{from}} -->|{{contextSize}}| {{to}}
    {{/each}}
```

#### Optimized Handoffs
```mermaid
graph LR
    {{#each optimizedHandoffs}}
    {{from}} -->|{{contextSize}}| {{to}}
    {{/each}}
```

**Improvements**:
- Reduced context size by {{contextReduction}}%
- Eliminated {{eliminatedHandoffs}} unnecessary handoffs
- Improved clarity score by {{clarityImprovement}}%

## Optimized Workflow Design

### New Workflow Structure
```yaml
optimized_workflow:
  version: {{proposedVersion}}
  improvements:
    - parallelization: {{parallelizationGain}}%
    - duration_reduction: {{durationReduction}}%
    - resource_efficiency: {{efficiencyGain}}%
    
  phases:
    {{#each optimizedPhases}}
    - name: {{name}}
      duration: {{duration}} (-{{reduction}})
      agents: {{agents}}
      parallel: {{parallel}}
      optimizations:
        {{#each optimizations}}
        - {{optimization}}
        {{/each}}
    {{/each}}
```

### Visualization Comparison

#### Before Optimization
```
{{beforeVisualization}}
```

#### After Optimization
```
{{afterVisualization}}
```

## Implementation Plan

### Phase 1: Quick Wins (Week 1)
{{#each quickWins}}
1. **{{title}}**
   - Change: {{change}}
   - Effort: {{effort}}
   - Impact: {{impact}}
   - Owner: {{owner}}
{{/each}}

### Phase 2: Process Changes (Weeks 2-3)
{{#each processChanges}}
1. **{{title}}**
   - Description: {{description}}
   - Dependencies: {{dependencies}}
   - Testing Required: {{testing}}
   - Rollback Plan: {{rollback}}
{{/each}}

### Phase 3: Structural Changes (Weeks 4-6)
{{#each structuralChanges}}
1. **{{title}}**
   - Scope: {{scope}}
   - Risk Assessment: {{risk}}
   - Migration Strategy: {{migration}}
   - Success Criteria: {{criteria}}
{{/each}}

## Risk Analysis

### Implementation Risks
| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| {{risk1}} | {{prob1}} | {{impact1}} | {{mitigation1}} |
| {{risk2}} | {{prob2}} | {{impact2}} | {{mitigation2}} |
| {{risk3}} | {{prob3}} | {{impact3}} | {{mitigation3}} |

### Rollback Strategy
{{rollbackStrategy}}

## Expected Outcomes

### Performance Improvements
- **Duration**: {{currentDuration}} → {{optimizedDuration}} ({{durationImprovement}}% faster)
- **Throughput**: {{currentThroughput}} → {{optimizedThroughput}} ({{throughputImprovement}}% increase)
- **Quality**: {{currentQuality}} → {{optimizedQuality}} ({{qualityImprovement}}% better)

### Cost-Benefit Analysis
| Category | Current Cost | Optimized Cost | Savings |
|----------|--------------|----------------|---------|
| Time | {{currentTimeCost}} | {{optimizedTimeCost}} | {{timeSavings}} |
| Resources | {{currentResourceCost}} | {{optimizedResourceCost}} | {{resourceSavings}} |
| Quality | {{currentQualityCost}} | {{optimizedQualityCost}} | {{qualitySavings}} |
| **Total** | **{{currentTotalCost}}** | **{{optimizedTotalCost}}** | **{{totalSavings}}** |

### ROI Calculation
- Implementation Cost: {{implementationCost}}
- Annual Savings: {{annualSavings}}
- Payback Period: {{paybackPeriod}}
- 3-Year ROI: {{threeYearROI}}%

## Monitoring Plan

### Key Metrics to Track
1. **{{metric1}}**: {{metric1Description}}
   - Baseline: {{metric1Baseline}}
   - Target: {{metric1Target}}
   - Measurement: {{metric1Measurement}}

2. **{{metric2}}**: {{metric2Description}}
   - Baseline: {{metric2Baseline}}
   - Target: {{metric2Target}}
   - Measurement: {{metric2Measurement}}

### Success Criteria
{{#each successCriteria}}
- [ ] {{criterion}}
{{/each}}

### Review Schedule
- Week 1: Daily monitoring
- Weeks 2-4: Twice weekly reviews
- Month 2+: Weekly reviews
- Quarter 2: Full assessment

## Recommendations

### Immediate Actions
1. {{immediateAction1}}
2. {{immediateAction2}}
3. {{immediateAction3}}

### Long-term Improvements
1. {{longTermImprovement1}}
2. {{longTermImprovement2}}
3. {{longTermImprovement3}}

### Future Optimization Opportunities
- {{futureOpportunity1}}
- {{futureOpportunity2}}
- {{futureOpportunity3}}

## Appendices

### A. Detailed Metrics
{{detailedMetrics}}

### B. Technical Specifications
{{technicalSpecs}}

### C. Stakeholder Impact
{{stakeholderImpact}}

---

*Optimization analysis performed by Janus*
*Using pattern recognition and workflow optimization algorithms*
*Report ID: {{reportId}}*