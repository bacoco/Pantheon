# Screenshot Tool (Playwright MCP)

This tool provides screenshot capture and visual testing capabilities using Playwright MCP.

## ACTIVATION

When agents need to capture screenshots or perform visual testing, use this tool configuration.

## Capabilities

- **Full page screenshots**: Capture entire page content
- **Element screenshots**: Target specific UI elements
- **Visual regression testing**: Compare screenshots for changes
- **Multi-viewport capture**: Test responsive designs
- **Accessibility testing**: Validate UI accessibility

## Configuration

```yaml
tool:
  name: playwright
  type: mcp_server
  config:
    command: "npx"
    args: ["-y", "@playwright/mcp@latest"]
    
capabilities:
  screenshot:
    formats: ["png", "jpeg", "webp"]
    max_width: 1920
    max_height: 10000
    viewports:
      mobile: { width: 375, height: 667 }
      tablet: { width: 768, height: 1024 }
      desktop: { width: 1280, height: 720 }
      wide: { width: 1920, height: 1080 }
      
  visual_testing:
    diff_threshold: 0.1
    highlight_differences: true
    generate_report: true
```

## Usage Patterns

### Basic Screenshot Capture

```javascript
// Capture full page screenshot
const screenshot = await mcp.playwright.screenshot({
  url: "http://localhost:3000",
  fullPage: true,
  format: "png"
});

// Capture specific element
const elementShot = await mcp.playwright.screenshot({
  url: "http://localhost:3000",
  selector: ".hero-section",
  padding: 20
});
```

### Responsive Testing

```javascript
// Test across multiple viewports
const viewports = ["mobile", "tablet", "desktop"];
const screenshots = await Promise.all(
  viewports.map(viewport => 
    mcp.playwright.screenshot({
      url: "http://localhost:3000",
      viewport: viewport,
      fullPage: true
    })
  )
);
```

### Visual Regression Testing

```javascript
// Compare against baseline
const result = await mcp.playwright.visualTest({
  baseline: "baseline/homepage.png",
  current: await mcp.playwright.screenshot({
    url: "http://localhost:3000",
    fullPage: true
  }),
  threshold: 0.1,
  ignoreRegions: [
    { selector: ".timestamp" },
    { selector: ".dynamic-content" }
  ]
});

if (!result.passed) {
  console.log(`Visual differences found: ${result.diffPercentage}%`);
  // result.diffImage contains highlighted differences
}
```

### Accessibility Testing

```javascript
// Check accessibility with screenshot
const a11yResult = await mcp.playwright.accessibilityTest({
  url: "http://localhost:3000",
  screenshot: true,
  rules: ["wcag2a", "wcag2aa"],
  includeScreenshot: true
});

// Returns violations with screenshots showing issues
a11yResult.violations.forEach(violation => {
  console.log(`${violation.rule}: ${violation.description}`);
  // violation.screenshot shows the problematic element
});
```

## Agent-Specific Usage

### Pixel (UI Healer)

```javascript
// Analyze UI for issues
async function analyzeUI(url) {
  // Capture screenshots at different viewports
  const screenshots = await captureAllViewports(url);
  
  // Check for visual issues
  const issues = [];
  
  for (const [viewport, screenshot] of screenshots) {
    // Check alignment
    const alignmentIssues = await detectAlignmentIssues(screenshot);
    
    // Check spacing
    const spacingIssues = await detectSpacingIssues(screenshot);
    
    // Check color contrast
    const contrastIssues = await detectContrastIssues(screenshot);
    
    issues.push({
      viewport,
      problems: [...alignmentIssues, ...spacingIssues, ...contrastIssues]
    });
  }
  
  return issues;
}
```

### Elena (QA)

```javascript
// E2E visual testing workflow
async function visualE2ETest(testScenario) {
  const screenshots = [];
  
  // Navigate through test scenario
  for (const step of testScenario.steps) {
    await navigateTo(step.url);
    
    // Capture state after each step
    const screenshot = await mcp.playwright.screenshot({
      url: step.url,
      fullPage: true,
      annotation: step.description
    });
    
    screenshots.push({
      step: step.name,
      screenshot: screenshot
    });
  }
  
  // Generate visual test report
  return generateVisualReport(screenshots);
}
```

### Sally (UX)

```javascript
// Capture design iterations
async function captureDesignIterations(mockupUrl) {
  const iterations = [];
  
  // Capture at different states
  const states = ["default", "hover", "active", "disabled"];
  
  for (const state of states) {
    const screenshot = await mcp.playwright.screenshot({
      url: mockupUrl,
      state: state,
      fullPage: false,
      selector: ".design-component"
    });
    
    iterations.push({
      state: state,
      screenshot: screenshot,
      timestamp: new Date().toISOString()
    });
  }
  
  return iterations;
}
```

## Error Handling

```javascript
async function safeScreenshot(options) {
  try {
    return await mcp.playwright.screenshot(options);
  } catch (error) {
    if (error.code === 'TIMEOUT') {
      // Retry with longer timeout
      return await mcp.playwright.screenshot({
        ...options,
        timeout: 30000
      });
    }
    
    if (error.code === 'ELEMENT_NOT_FOUND') {
      // Fall back to full page
      return await mcp.playwright.screenshot({
        ...options,
        selector: undefined,
        fullPage: true
      });
    }
    
    throw error;
  }
}
```

## Performance Optimization

```javascript
// Batch screenshot operations
async function batchScreenshots(urls, options = {}) {
  const batchSize = 3; // Parallel limit
  const results = [];
  
  for (let i = 0; i < urls.length; i += batchSize) {
    const batch = urls.slice(i, i + batchSize);
    const batchResults = await Promise.all(
      batch.map(url => 
        safeScreenshot({ url, ...options })
      )
    );
    results.push(...batchResults);
  }
  
  return results;
}
```

## Storage & Organization

```javascript
// Organize screenshots by project and date
function getScreenshotPath(project, type, name) {
  const date = new Date().toISOString().split('T')[0];
  return `screenshots/${project}/${date}/${type}/${name}.png`;
}

// Store with metadata
async function storeScreenshot(screenshot, metadata) {
  const path = getScreenshotPath(
    metadata.project,
    metadata.type,
    metadata.name
  );
  
  return {
    path: path,
    screenshot: screenshot,
    metadata: {
      ...metadata,
      timestamp: new Date().toISOString(),
      size: screenshot.size,
      dimensions: screenshot.dimensions
    }
  };
}
```

## Best Practices

1. **Always specify viewport** for consistent results
2. **Use selectors** to focus on specific components
3. **Handle dynamic content** with ignore regions
4. **Set appropriate timeouts** for page loading
5. **Compress screenshots** for storage efficiency
6. **Add metadata** for organization and searching
7. **Clean up old screenshots** regularly
8. **Use visual regression** for critical UI paths

This tool enables powerful visual testing and validation capabilities for Pantheon agents.