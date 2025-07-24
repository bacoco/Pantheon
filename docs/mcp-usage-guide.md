# BACO MCP Integration Usage Guide

This guide explains how to use MCP (Model Context Protocol) tools within BACO agents for enhanced real-world capabilities.

## Overview

MCP tools provide BACO agents with access to external services and capabilities, transforming them from prompt-based assistants to agents that can interact with real tools and services.

## Available MCP Tools

### 1. browsermcp
**Purpose**: Browser automation and live preview
- Preview web content in real browsers
- Test user interactions
- Capture user flows
- Debug implementations

### 2. playwright
**Purpose**: Visual testing and screenshot capture  
- Automated E2E testing
- Screenshot capture
- Visual regression testing
- Cross-browser testing

### 3. Context7
**Purpose**: Intelligent code context retrieval
- Find code patterns
- Discover implementations
- Access best practices
- Learn from examples

### 4. claude-task-master
**Purpose**: Advanced task orchestration
- Multi-agent coordination
- Workflow management
- Task dependencies
- Progress tracking

### 5. GitHub MCP
**Purpose**: Repository and project management
- Code version control
- Pull request creation
- Issue tracking
- Project management

### 6. shadcn-ui
**Purpose**: Modern UI component generation
- React component creation
- Accessible components
- Consistent styling
- Theme customization

## Agent MCP Permissions

Each agent has specific MCP tool access based on their role:

| Agent | MCP Tools Available |
|-------|-------------------|
| Winston (Architect) | context7, github, browsermcp |
| James (Developer) | context7, github, shadcn-ui, browsermcp |
| Elena (QA) | playwright, browsermcp, github, context7 |
| Marcus (Security) | github, context7, browsermcp |
| Prometheus (PM) | github, claude-task-master, browsermcp |
| Sarah (PO) | github, browsermcp, claude-task-master |
| Bob (SM) | claude-task-master, github, context7 |
| Sally (UX) | browsermcp, shadcn-ui, playwright |
| Argus (UI Healer) | playwright, browsermcp, context7 |
| Janus | ALL tools |

## Using MCP Tools in Commands

### Basic Usage Pattern

When creating BACO commands that use MCP tools, follow this pattern:

```yaml
# In your command or agent file
steps:
  - description: "Find similar implementations"
    tool: context7
    action: search
    parameters:
      query: "authentication middleware"
      language: "javascript"
      
  - description: "Preview the implementation"
    tool: browsermcp
    action: preview
    parameters:
      url: "http://localhost:3000"
      viewport: "desktop"
```

### Example: Feature Implementation Workflow

```yaml
feature_implementation:
  1_research:
    agent: winston
    tool: context7
    action: "Find architectural patterns"
    
  2_design:
    agent: sally
    tool: browsermcp
    action: "Create interactive mockup"
    
  3_implement:
    agent: james
    tools:
      - github: "Create feature branch"
      - shadcn-ui: "Generate components"
      - browsermcp: "Preview implementation"
      
  4_test:
    agent: elena
    tools:
      - playwright: "Capture screenshots"
      - playwright: "Run visual tests"
      - github: "Report issues"
```

## Common MCP Workflows

### 1. UI Development Workflow
```
Sally (UX) → James (Developer) → Argus (UI Healer)

1. Sally creates mockup with browsermcp
2. James implements using shadcn-ui components
3. Argus validates with playwright screenshots
4. Any issues trigger healing workflow
```

### 2. Code Review Workflow
```
James → Marcus → Elena

1. James creates PR with github tool
2. Marcus reviews security with context7 patterns
3. Elena validates with playwright tests
4. All use github for collaboration
```

### 3. Sprint Management Workflow
```
Bob (SM) → Team

1. Bob uses claude-task-master for sprint planning
2. Creates tasks in github
3. Monitors progress with task-master
4. Team updates via github
```

## Best Practices

### 1. Tool Selection
- Use the most specific tool for the task
- Prefer real tools over simulations
- Consider tool rate limits

### 2. Error Handling
```yaml
error_handling:
  retry_strategy: "exponential_backoff"
  max_retries: 3
  fallback_options:
    - Use alternative tool
    - Provide manual guidance
    - Document limitation
```

### 3. Performance Optimization
- Cache Context7 results
- Batch GitHub operations
- Reuse browser sessions
- Parallelize independent tasks

### 4. Security Considerations
- Never expose credentials in commands
- Use minimal required permissions
- Audit tool usage regularly
- Follow principle of least privilege

## Troubleshooting

### Common Issues

1. **Tool Not Available**
   - Check agent has permission in mcp-permissions.md
   - Verify MCP server is configured in settings.local.json
   - Ensure tool is installed correctly

2. **Rate Limiting**
   - Implement exponential backoff
   - Cache results when possible
   - Batch operations

3. **Connection Failures**
   - Check network connectivity
   - Verify MCP server is running
   - Review error logs

### Debug Commands

```bash
# Check MCP server status
npx @anthropic/mcp status

# Test specific tool
npx @anthropic/mcp test browsermcp

# View MCP logs
npx @anthropic/mcp logs --tail 50
```

## Integration Examples

### Example 1: Visual Regression Testing

```javascript
// Elena uses playwright for visual testing
async function visualRegressionTest(feature) {
  // Capture baseline
  const baseline = await mcp.playwright.screenshot({
    url: feature.url,
    fullPage: true
  });
  
  // After changes, capture new state
  const current = await mcp.playwright.screenshot({
    url: feature.url,
    fullPage: true
  });
  
  // Compare
  const diff = await mcp.playwright.visualDiff({
    baseline: baseline,
    current: current,
    threshold: 0.1
  });
  
  if (!diff.passed) {
    // Create issue with evidence
    await mcp.github.createIssue({
      title: `Visual regression in ${feature.name}`,
      body: `Detected ${diff.percentage}% difference`,
      labels: ["visual-regression"],
      attachments: [diff.image]
    });
  }
}
```

### Example 2: Component Development

```javascript
// Sally and James collaborate on UI
async function developComponent(requirements) {
  // Sally creates mockup
  const mockup = await mcp.browsermcp.createMockup({
    html: requirements.design,
    interactive: true
  });
  
  // James generates component
  const component = await mcp.shadcnui.generate({
    type: requirements.componentType,
    variant: requirements.style,
    props: requirements.props
  });
  
  // Preview in browser
  const preview = await mcp.browsermcp.preview({
    component: component,
    props: requirements.testData
  });
  
  // Argus validates quality
  const quality = await mcp.playwright.analyzeUI({
    url: preview.url,
    styleGuide: requirements.styleGuide
  });
  
  return {
    component,
    preview: preview.url,
    qualityScore: quality.score
  };
}
```

## Advanced Usage

### Custom Tool Combinations

Create powerful workflows by combining tools:

```yaml
advanced_workflow:
  name: "Full Stack Feature"
  agents: ["winston", "james", "elena", "pixel"]
  tools:
    research:
      - context7: "Find patterns"
      - github: "Analyze codebase"
    implement:
      - github: "Branch management"
      - shadcn-ui: "UI components"
      - browsermcp: "Live preview"
    validate:
      - playwright: "E2E tests"
      - playwright: "Visual tests"
      - github: "Test reports"
    deploy:
      - github: "Create release"
      - browsermcp: "Demo video"
```

### Performance Monitoring

Track MCP tool usage and performance:

```javascript
const mcpMetrics = {
  toolUsage: new Map(),
  responseTime: [],
  errorRate: 0,
  
  track(tool, action, duration, success) {
    this.toolUsage.set(`${tool}.${action}`, 
      (this.toolUsage.get(`${tool}.${action}`) || 0) + 1
    );
    this.responseTime.push({ tool, action, duration });
    if (!success) this.errorRate++;
  }
};
```

## Future Enhancements

As MCP tools evolve, BACO will integrate:
- Additional MCP servers
- Custom tool development
- Enhanced error recovery
- Performance optimizations
- Cross-tool orchestration

## Resources

- [MCP Documentation](https://github.com/anthropics/mcp)
- [BACO MCP Integration](.claude/lib/mcp-integration.md)
- [MCP Permissions Matrix](.claude/lib/mcp-permissions.md)
- [Tool Configurations](.claude/tools/)

---

This guide will be updated as new MCP tools and patterns emerge. For specific tool documentation, refer to the individual tool configuration files in `.claude/tools/`.