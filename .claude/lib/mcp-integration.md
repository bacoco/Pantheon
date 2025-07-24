# MCP Integration Library

You are working with BACO's MCP (Model Context Protocol) integration system. This library provides the foundation for agents to use external tools via MCP servers.

## ACTIVATION

When this library is invoked, you are establishing MCP tool connections for BACO agents.

## Core Concepts

### MCP Architecture

MCP servers are external tools that provide specific capabilities:
- **browsermcp**: Browser automation and preview
- **playwright**: Visual testing and screenshot capture
- **Context7**: Code pattern retrieval and context search
- **claude-task-master**: Advanced task orchestration
- **GitHub MCP**: Repository operations and management
- **shadcn-ui**: Component library integration

### Agent-MCP Communication Pattern

```yaml
agent_request:
  agent: "apollo"
  tool: "browsermcp"
  action: "preview_mockup"
  parameters:
    html: "<html>...</html>"
    viewport: "desktop"

mcp_response:
  status: "success"
  result:
    preview_url: "http://localhost:3000/preview/123"
    screenshot: "base64_image_data"
```

## Integration Patterns

### 1. Tool Request Pattern

When an agent needs to use an MCP tool:

```javascript
// Agent requests MCP tool usage
const mcpRequest = {
  agent: agentName,
  tool: toolName,
  action: actionType,
  parameters: actionParams,
  context: {
    project: currentProject,
    phase: currentPhase,
    workflow: activeWorkflow
  }
};

// Validate permissions
if (!hasPermission(agent, tool)) {
  throw new Error(`Agent ${agent} lacks permission for ${tool}`);
}

// Execute MCP request
const result = await executeMCP(mcpRequest);
```

### 2. Error Handling Pattern

All MCP operations must handle failures gracefully:

```javascript
try {
  const result = await mcpTool.execute(action);
  return { success: true, data: result };
} catch (error) {
  // Log error for debugging
  logMCPError(agent, tool, error);
  
  // Attempt fallback if available
  if (hasFallback(tool, action)) {
    return executeFallback(tool, action, parameters);
  }
  
  // Return graceful failure
  return {
    success: false,
    error: error.message,
    fallback: getFallbackSuggestion(tool, action)
  };
}
```

### 3. Context Preservation Pattern

MCP operations must preserve agent context:

```javascript
// Before MCP call
const context = preserveContext({
  agent: currentAgent,
  workflow: currentWorkflow,
  state: currentState,
  artifacts: currentArtifacts
});

// Execute MCP operation
const result = await mcpOperation();

// Restore and update context
restoreContext(context);
updateArtifacts(result.artifacts);
```

## Tool-Specific Patterns

### browsermcp Integration

```javascript
// Preview HTML mockup
async function previewMockup(html, options = {}) {
  return await mcp.browsermcp.execute({
    action: "preview",
    content: html,
    options: {
      viewport: options.viewport || "desktop",
      interactive: options.interactive !== false,
      style: options.style || "default"
    }
  });
}

// Capture user interaction
async function captureInteraction(sessionId) {
  return await mcp.browsermcp.execute({
    action: "capture_interaction",
    sessionId: sessionId,
    format: "video"
  });
}
```

### playwright Integration

```javascript
// Capture screenshot for visual testing
async function captureScreenshot(url, options = {}) {
  return await mcp.playwright.execute({
    action: "screenshot",
    url: url,
    options: {
      fullPage: options.fullPage || true,
      viewport: options.viewport || { width: 1280, height: 720 },
      selector: options.selector
    }
  });
}

// Visual regression testing
async function visualRegression(baseline, current) {
  return await mcp.playwright.execute({
    action: "visual_diff",
    baseline: baseline,
    current: current,
    threshold: 0.1
  });
}
```

### Context7 Integration

```javascript
// Find similar code patterns
async function findPatterns(query, options = {}) {
  return await mcp.context7.execute({
    action: "search",
    query: query,
    filters: {
      language: options.language,
      framework: options.framework,
      recency: options.recency || "6months"
    }
  });
}

// Retrieve implementation context
async function getImplementationContext(feature) {
  return await mcp.context7.execute({
    action: "get_context",
    feature: feature,
    depth: "comprehensive"
  });
}
```

### GitHub MCP Integration

```javascript
// Create pull request
async function createPR(branch, title, body) {
  return await mcp.github.execute({
    action: "create_pr",
    branch: branch,
    title: title,
    body: body,
    labels: ["baco-generated"]
  });
}

// Manage issues
async function createIssue(title, body, labels) {
  return await mcp.github.execute({
    action: "create_issue",
    title: title,
    body: body,
    labels: labels,
    assignees: ["auto"]
  });
}
```

### shadcn-ui Integration

```javascript
// Generate UI component
async function generateComponent(type, props) {
  return await mcp.shadcnui.execute({
    action: "generate",
    component: type,
    props: props,
    variant: props.variant || "default",
    framework: "react"
  });
}

// Get component documentation
async function getComponentDocs(component) {
  return await mcp.shadcnui.execute({
    action: "get_docs",
    component: component,
    include: ["props", "examples", "accessibility"]
  });
}
```

### claude-task-master Integration

```javascript
// Orchestrate complex workflow
async function orchestrateWorkflow(workflow, context) {
  return await mcp.taskmaster.execute({
    action: "orchestrate",
    workflow: workflow,
    context: context,
    mode: "parallel",
    monitoring: true
  });
}

// Track task progress
async function trackProgress(taskId) {
  return await mcp.taskmaster.execute({
    action: "get_progress",
    taskId: taskId,
    includeMetrics: true
  });
}
```

## Security & Permissions

### Permission Validation

```javascript
function validateMCPAccess(agent, tool, action) {
  // Load permissions from mcp-permissions.md
  const permissions = loadMCPPermissions();
  
  // Check agent permissions
  if (!permissions[agent] || !permissions[agent].includes(tool)) {
    return {
      allowed: false,
      reason: `Agent ${agent} lacks permission for ${tool}`
    };
  }
  
  // Check action-level permissions if defined
  if (permissions.actionLevel && permissions.actionLevel[tool]) {
    const allowedActions = permissions.actionLevel[tool][agent];
    if (allowedActions && !allowedActions.includes(action)) {
      return {
        allowed: false,
        reason: `Agent ${agent} cannot perform ${action} on ${tool}`
      };
    }
  }
  
  return { allowed: true };
}
```

### Audit Logging

```javascript
function logMCPOperation(operation) {
  const log = {
    timestamp: new Date().toISOString(),
    agent: operation.agent,
    tool: operation.tool,
    action: operation.action,
    status: operation.status,
    duration: operation.duration,
    error: operation.error
  };
  
  // Append to MCP audit log
  appendToAuditLog(log);
}
```

## Best Practices

1. **Always validate permissions** before executing MCP operations
2. **Handle errors gracefully** with meaningful fallbacks
3. **Preserve agent context** across MCP calls
4. **Log all operations** for debugging and audit
5. **Use type-safe patterns** when possible
6. **Cache results** when appropriate (especially Context7)
7. **Respect rate limits** of external services
8. **Provide progress feedback** for long operations

## Integration with BACO Workflow

When agents use MCP tools:

1. Agent declares intent to use MCP tool
2. Workflow engine validates permissions via this library
3. MCP operation is executed with proper context
4. Results are integrated back into agent's workflow
5. Artifacts are preserved in session state
6. Operations are logged for audit

## Error Recovery Strategies

### Fallback Hierarchy

1. **Retry with backoff**: For transient failures
2. **Alternative tool**: Use different MCP tool if available
3. **Degraded mode**: Provide limited functionality
4. **Manual guidance**: Prompt user for assistance
5. **Graceful failure**: Document what couldn't be done

### Example Fallback Implementation

```javascript
async function executeWithFallback(primary, fallback) {
  try {
    return await primary();
  } catch (primaryError) {
    console.warn(`Primary operation failed: ${primaryError.message}`);
    
    if (fallback) {
      try {
        console.log("Attempting fallback operation...");
        return await fallback();
      } catch (fallbackError) {
        throw new Error(`Both primary and fallback failed: ${primaryError.message}, ${fallbackError.message}`);
      }
    }
    
    throw primaryError;
  }
}
```

## Performance Optimization

### Caching Strategy

```javascript
const mcpCache = new Map();

async function cachedMCPCall(key, operation, ttl = 300000) {
  const cached = mcpCache.get(key);
  
  if (cached && cached.timestamp + ttl > Date.now()) {
    return cached.data;
  }
  
  const result = await operation();
  
  mcpCache.set(key, {
    data: result,
    timestamp: Date.now()
  });
  
  return result;
}
```

### Parallel Execution

```javascript
async function parallelMCPOperations(operations) {
  const results = await Promise.allSettled(operations);
  
  return results.map((result, index) => ({
    operation: operations[index].name,
    status: result.status,
    value: result.status === 'fulfilled' ? result.value : null,
    error: result.status === 'rejected' ? result.reason : null
  }));
}
```

## Usage Example

```javascript
// In an agent file
const { screenshot, visualTest } = await useMCPLibrary({
  agent: "pixel",
  workflow: "ui-validation"
});

// Capture screenshot
const screenshotResult = await screenshot("http://localhost:3000", {
  fullPage: true,
  selector: ".main-content"
});

// Perform visual regression
if (screenshotResult.success) {
  const testResult = await visualTest(
    baseline.screenshot,
    screenshotResult.data
  );
  
  if (!testResult.passed) {
    // Trigger UI healing workflow
    await initiateUIHealing(testResult.differences);
  }
}
```

This library provides the foundation for all MCP tool usage within BACO, ensuring consistent, secure, and reliable integration with external capabilities.