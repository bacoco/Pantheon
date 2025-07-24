# Visual Regression Workflow

## Overview
This workflow implements automated visual regression testing using Pixel (UI Healer) with real screenshot capture and comparison via playwright MCP.

## Prerequisites
- UI components/pages to test
- Style guide and UX rules defined
- Playwright MCP configured
- Baseline screenshots (or ability to create them)

## Workflow Steps

### 1. Initialize Visual Testing

```yaml
setup:
  project: "[Project name]"
  test_scope:
    - pages: ["home", "dashboard", "profile"]
    - components: ["button", "card", "form"]
    - viewports: ["mobile", "tablet", "desktop"]
  style_guide: "style-guide.md"
  ux_rules: "ux-rules.md"
```

### 2. Capture Baseline Screenshots

If no baselines exist, create them:

```javascript
// Using playwright MCP
for (const page of pages) {
  for (const viewport of viewports) {
    await mcp.playwright.screenshot({
      url: `${baseUrl}/${page}`,
      fullPage: true,
      viewport: viewport,
      path: `baselines/${page}-${viewport}.png`
    });
  }
}
```

### 3. Implement Test Execution

```javascript
async function runVisualRegression() {
  const results = [];
  
  // Test each page/component
  for (const target of testTargets) {
    // Capture current state
    const current = await mcp.playwright.screenshot({
      url: target.url,
      fullPage: true,
      viewport: target.viewport
    });
    
    // Compare with baseline
    const comparison = await mcp.playwright.visualDiff({
      baseline: target.baseline,
      current: current,
      threshold: 0.1 // 10% difference threshold
    });
    
    // Analyze results
    if (!comparison.passed) {
      results.push({
        target: target.name,
        viewport: target.viewport,
        diffPercentage: comparison.diffPercentage,
        diffImage: comparison.diffImage,
        issues: await analyzeVisualIssues(comparison)
      });
    }
  }
  
  return results;
}
```

### 4. Visual Issue Analysis

When differences are detected, analyze them:

```javascript
async function analyzeVisualIssues(comparison) {
  const issues = [];
  
  // Check against style guide
  const styleViolations = await checkStyleCompliance(comparison);
  
  // Check against UX rules
  const uxViolations = await checkUXCompliance(comparison);
  
  // Categorize issues
  return {
    critical: issues.filter(i => i.severity === 'critical'),
    major: issues.filter(i => i.severity === 'major'),
    minor: issues.filter(i => i.severity === 'minor'),
    suggestions: generateFixSuggestions(issues)
  };
}
```

### 5. UI Quality Scoring

Score the UI based on visual regression results:

```javascript
function calculateUIScore(results) {
  let score = 10; // Start with perfect score
  
  // Deduct points based on issues
  results.forEach(result => {
    result.issues.critical.forEach(() => score -= 2);
    result.issues.major.forEach(() => score -= 1);
    result.issues.minor.forEach(() => score -= 0.5);
  });
  
  return Math.max(0, Math.min(10, score));
}
```

### 6. Generate Healing Plan

For scores below 8/10, create a healing plan:

```javascript
function generateHealingPlan(results, score) {
  const plan = {
    score: score,
    totalIssues: countAllIssues(results),
    healingSteps: []
  };
  
  // Prioritize fixes
  results.forEach(result => {
    // Critical issues first
    result.issues.critical.forEach(issue => {
      plan.healingSteps.push({
        priority: 'HIGH',
        component: result.target,
        issue: issue.description,
        fix: issue.suggestedFix,
        effort: estimateEffort(issue)
      });
    });
  });
  
  return plan;
}
```

### 7. Developer Feedback Loop

Send healing plan to Hephaestus (Developer):

```yaml
feedback_message:
  to: hephaestus
  from: pixel
  subject: "UI Quality Issues Detected"
  score: 6.5/10
  critical_issues: 3
  healing_plan:
    - component: "dashboard"
      issue: "Misaligned grid on tablet viewport"
      fix: "Apply grid-template-columns: repeat(2, 1fr)"
      screenshot: "diff-dashboard-tablet.png"
    - component: "button"
      issue: "Inconsistent padding with style guide"
      fix: "Change padding to var(--space-2) var(--space-4)"
      affected_viewports: ["mobile", "desktop"]
```

### 8. Continuous Monitoring

Set up automated visual regression:

```javascript
// Run on every commit
async function onCommit(commitHash) {
  const results = await runVisualRegression();
  const score = calculateUIScore(results);
  
  if (score < 8) {
    // Block deployment
    await notifyTeam({
      status: 'UI_QUALITY_FAILED',
      score: score,
      commit: commitHash,
      report: generateReport(results)
    });
  } else {
    // Update baselines if intentional changes
    if (hasIntentionalChanges(commitHash)) {
      await updateBaselines(results);
    }
  }
}
```

## Integration with CI/CD

```yaml
# .github/workflows/visual-regression.yml
name: Visual Regression Tests
on: [push, pull_request]

jobs:
  visual-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Run Visual Regression
        run: |
          pantheon agent argus
          pixel visual-test --all
      
      - name: Check UI Score
        run: |
          score=$(pixel get-score)
          if [ "$score" -lt "8" ]; then
            echo "UI quality below threshold"
            exit 1
          fi
      
      - name: Upload Diff Images
        if: failure()
        uses: actions/upload-artifact@v3
        with:
          name: visual-regression-diffs
          path: diffs/
```

## Reporting Format

```markdown
# Visual Regression Report

**Date**: [timestamp]
**Commit**: [hash]
**Overall Score**: 7.5/10

## Summary
- Total Pages Tested: 12
- Failed: 3
- Passed: 9

## Critical Issues (3)

### 1. Homepage - Mobile Viewport
- **Issue**: Navigation menu overlaps content
- **Diff**: 15.3%
- **Fix**: Add z-index: 100 to .nav-mobile
- [View Screenshot Diff]

### 2. Dashboard - Tablet Viewport
- **Issue**: Card grid misalignment
- **Diff**: 8.7%
- **Fix**: Use CSS Grid instead of flexbox
- [View Screenshot Diff]

## Recommendations
1. Update mobile navigation z-index
2. Refactor dashboard grid layout
3. Review tablet breakpoints

## Next Steps
- Developer fixes required
- Re-run tests after fixes
- Update baselines when approved
```

## Best Practices

1. **Baseline Management**
   - Version control baselines
   - Document intentional changes
   - Review before updating

2. **Test Coverage**
   - Test all viewports
   - Include edge cases
   - Test interactive states

3. **Performance**
   - Parallelize screenshot capture
   - Cache unchanged baselines
   - Optimize comparison algorithms

4. **Communication**
   - Clear issue descriptions
   - Actionable fix suggestions
   - Visual diff highlights

## Success Metrics

- UI score consistently > 8/10
- < 5% visual regression rate
- < 24 hour fix turnaround
- 100% critical issue resolution

This workflow ensures consistent UI quality through automated visual testing and self-healing capabilities.