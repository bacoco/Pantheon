# Browser Preview Tool (browsermcp)

This tool provides real browser automation and preview capabilities for interactive testing and demonstration.

## ACTIVATION

When agents need to preview web content, test interactions, or demonstrate features, use this tool.

## Capabilities

- **Live preview**: Real-time browser rendering
- **Interactive testing**: User interaction simulation
- **Multi-browser support**: Chrome, Firefox, Safari, Edge
- **Session recording**: Capture user flows
- **Network inspection**: Monitor API calls
- **Console access**: Debug JavaScript execution

## Configuration

```yaml
tool:
  name: browsermcp
  type: mcp_server
  config:
    command: "npx"
    args: ["@browsermcp/mcp@latest"]
    
capabilities:
  browsers:
    - chrome: { headless: false, devtools: true }
    - firefox: { headless: false }
    - safari: { available: "macOS_only" }
    - edge: { headless: false }
    
  features:
    preview: true
    interaction: true
    recording: true
    debugging: true
    network_monitoring: true
    performance_profiling: true
```

## Usage Patterns

### Basic Preview

```javascript
// Preview a URL
const preview = await mcp.browsermcp.preview({
  url: "http://localhost:3000",
  browser: "chrome",
  viewport: { width: 1280, height: 720 },
  waitUntil: "networkidle"
});

// Preview HTML content directly
const htmlPreview = await mcp.browsermcp.previewHTML({
  html: `
    <!DOCTYPE html>
    <html>
      <head>
        <link href="https://cdn.tailwindcss.com" rel="stylesheet">
      </head>
      <body>
        <div class="p-8">
          <h1 class="text-3xl font-bold">Preview</h1>
        </div>
      </body>
    </html>
  `,
  viewport: "desktop"
});
```

### Interactive Testing

```javascript
// Simulate user interactions
const session = await mcp.browsermcp.startSession({
  url: "http://localhost:3000",
  record: true
});

// Perform interactions
await session.click("button#submit");
await session.type("input#email", "user@example.com");
await session.select("select#country", "USA");
await session.hover(".tooltip-trigger");

// Capture result
const result = await session.screenshot();
const recording = await session.getRecording();

await session.end();
```

### Multi-Viewport Testing

```javascript
// Test responsive behavior
async function testResponsive(url) {
  const viewports = [
    { name: "mobile", width: 375, height: 667 },
    { name: "tablet", width: 768, height: 1024 },
    { name: "desktop", width: 1280, height: 720 },
    { name: "wide", width: 1920, height: 1080 }
  ];
  
  const results = [];
  
  for (const viewport of viewports) {
    const preview = await mcp.browsermcp.preview({
      url: url,
      viewport: viewport,
      screenshot: true
    });
    
    results.push({
      viewport: viewport.name,
      screenshot: preview.screenshot,
      issues: await detectResponsiveIssues(preview)
    });
  }
  
  return results;
}
```

## Agent-Specific Usage

### Sally (UX Designer)

```javascript
// Interactive mockup demonstration
async function demonstrateMockup(mockupHTML) {
  // Start interactive session
  const demo = await mcp.browsermcp.demo({
    html: mockupHTML,
    interactive: true,
    record: true,
    annotations: true
  });
  
  // Guide through features
  const features = [
    { element: ".hero-cta", action: "click", note: "Primary call-to-action" },
    { element: ".nav-menu", action: "hover", note: "Navigation reveals on hover" },
    { element: ".carousel", action: "swipe", note: "Swipe for next slide" }
  ];
  
  for (const feature of features) {
    await demo.highlight(feature.element);
    await demo.annotate(feature.note);
    await demo.perform(feature.action, feature.element);
    await demo.pause(2000); // Let viewer see the result
  }
  
  // Export demo video
  return await demo.export({
    format: "mp4",
    quality: "high",
    includeAudio: true
  });
}
```

### James (Developer)

```javascript
// Debug implementation
async function debugFeature(url, scenario) {
  const debug = await mcp.browsermcp.debug({
    url: url,
    devtools: true,
    console: true,
    network: true
  });
  
  // Monitor console
  debug.onConsoleLog((log) => {
    console.log(`[Browser]: ${log.type} - ${log.message}`);
  });
  
  // Monitor network
  debug.onNetworkRequest((request) => {
    console.log(`[Network]: ${request.method} ${request.url}`);
  });
  
  // Execute test scenario
  for (const step of scenario.steps) {
    await debug.execute(step.action, step.target);
    
    // Check for errors
    const errors = await debug.getErrors();
    if (errors.length > 0) {
      return {
        step: step.name,
        errors: errors,
        screenshot: await debug.screenshot()
      };
    }
  }
  
  return { success: true };
}
```

### Elena (QA)

```javascript
// Automated E2E testing
async function runE2ETest(testCase) {
  const test = await mcp.browsermcp.test({
    name: testCase.name,
    browser: "chrome",
    headless: false, // Show browser for debugging
    video: true
  });
  
  try {
    // Setup
    await test.goto(testCase.url);
    await test.waitForLoadState("networkidle");
    
    // Execute test steps
    for (const step of testCase.steps) {
      await test.step(step.name, async () => {
        // Perform action
        await executeAction(test, step.action);
        
        // Verify expectation
        await verifyExpectation(test, step.expect);
        
        // Capture state
        if (step.screenshot) {
          await test.screenshot({ name: step.name });
        }
      });
    }
    
    // Generate report
    return await test.generateReport({
      includeVideo: true,
      includeScreenshots: true,
      format: "html"
    });
  } finally {
    await test.close();
  }
}
```

### John (PM)

```javascript
// Product demonstration
async function createProductDemo(features) {
  const demo = await mcp.browsermcp.createDemo({
    title: "Product Feature Walkthrough",
    resolution: "1080p",
    branding: true
  });
  
  for (const feature of features) {
    await demo.chapter(feature.name, async () => {
      // Navigate to feature
      await demo.goto(feature.url);
      
      // Add narration overlay
      await demo.narrate(feature.description);
      
      // Demonstrate key points
      for (const point of feature.keyPoints) {
        await demo.highlight(point.element);
        await demo.callout(point.text);
        await demo.pause(3000);
      }
      
      // Show value proposition
      await demo.emphasize(feature.value);
    });
  }
  
  // Export presentation
  return await demo.export({
    formats: ["mp4", "gif", "pdf"],
    quality: "high"
  });
}
```

## Advanced Features

### Performance Profiling

```javascript
// Profile page performance
async function profilePerformance(url) {
  const profile = await mcp.browsermcp.profile({
    url: url,
    metrics: ["FCP", "LCP", "CLS", "FID", "TTFB"],
    throttling: "Fast 3G"
  });
  
  // Analyze results
  return {
    metrics: profile.metrics,
    suggestions: profile.suggestions,
    filmstrip: profile.filmstrip,
    waterfall: profile.networkWaterfall
  };
}
```

### Network Monitoring

```javascript
// Monitor API interactions
async function monitorAPIs(url, actions) {
  const monitor = await mcp.browsermcp.networkMonitor({
    url: url,
    filter: { type: "xhr,fetch" }
  });
  
  const apiCalls = [];
  
  monitor.onRequest((request) => {
    apiCalls.push({
      timestamp: Date.now(),
      method: request.method,
      url: request.url,
      headers: request.headers,
      body: request.postData
    });
  });
  
  monitor.onResponse((response) => {
    const call = apiCalls.find(c => c.url === response.url);
    if (call) {
      call.response = {
        status: response.status,
        headers: response.headers,
        body: response.body,
        duration: Date.now() - call.timestamp
      };
    }
  });
  
  // Execute actions
  for (const action of actions) {
    await monitor.execute(action);
  }
  
  return apiCalls;
}
```

### Session Management

```javascript
// Manage browser sessions
class BrowserSession {
  constructor(config) {
    this.config = config;
    this.session = null;
  }
  
  async start() {
    this.session = await mcp.browsermcp.createSession({
      ...this.config,
      persistent: true
    });
    return this.session.id;
  }
  
  async execute(commands) {
    if (!this.session) throw new Error("Session not started");
    
    const results = [];
    for (const cmd of commands) {
      const result = await this.session.execute(cmd);
      results.push(result);
    }
    return results;
  }
  
  async save() {
    return await this.session.save({
      includeState: true,
      includeCookies: true,
      includeStorage: true
    });
  }
  
  async restore(savedState) {
    this.session = await mcp.browsermcp.restoreSession(savedState);
  }
  
  async end() {
    if (this.session) {
      await this.session.close();
      this.session = null;
    }
  }
}
```

## Error Handling

```javascript
// Robust preview with retries
async function robustPreview(url, options = {}) {
  let attempts = 0;
  const maxAttempts = 3;
  
  while (attempts < maxAttempts) {
    try {
      return await mcp.browsermcp.preview({
        url,
        ...options,
        timeout: 30000
      });
    } catch (error) {
      attempts++;
      
      if (error.code === 'TIMEOUT' && attempts < maxAttempts) {
        console.log(`Timeout, retrying (${attempts}/${maxAttempts})...`);
        await new Promise(resolve => setTimeout(resolve, 2000));
        continue;
      }
      
      if (error.code === 'BROWSER_CRASHED') {
        // Try different browser
        const fallbackBrowser = options.browser === 'chrome' ? 'firefox' : 'chrome';
        return await mcp.browsermcp.preview({
          ...options,
          url,
          browser: fallbackBrowser
        });
      }
      
      throw error;
    }
  }
}
```

## Best Practices

1. **Use appropriate timeouts** for different operations
2. **Clean up sessions** to avoid memory leaks
3. **Handle browser crashes** gracefully
4. **Record important flows** for debugging
5. **Use headless mode** for CI/CD environments
6. **Monitor resource usage** during long sessions
7. **Cache static previews** when possible
8. **Implement retry logic** for flaky operations

This tool enables real browser-based testing and demonstration capabilities for BACO agents.