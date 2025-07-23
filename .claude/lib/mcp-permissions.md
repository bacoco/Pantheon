# MCP Permissions Matrix

This library defines which BACO agents can access which MCP tools and what operations they can perform.

## ACTIVATION

When checking MCP permissions, reference this matrix to validate agent access to tools.

## Permission Matrix

### Agent-to-Tool Mapping

```yaml
permissions:
  winston: # Architect
    tools:
      - context7      # Find architectural patterns
      - github        # Repository analysis, ADR creation
      - browsermcp    # Preview documentation
    allowed_actions:
      context7: ["search", "get_context", "find_patterns"]
      github: ["read_repo", "create_docs", "create_adr"]
      browsermcp: ["preview", "export_pdf"]

  james: # Developer
    tools:
      - context7      # Find code patterns
      - github        # Code management
      - shadcn-ui     # Component implementation
      - browsermcp    # Preview implementations
    allowed_actions:
      context7: ["search", "get_context", "find_implementations"]
      github: ["create_branch", "commit", "create_pr", "push"]
      shadcn-ui: ["generate", "get_docs", "list_components"]
      browsermcp: ["preview", "debug", "test_interaction"]

  elena: # QA Engineer
    tools:
      - playwright    # E2E testing
      - browsermcp    # Manual testing
      - github        # Issue tracking
      - context7      # Find test patterns
    allowed_actions:
      playwright: ["screenshot", "test", "visual_diff", "record"]
      browsermcp: ["preview", "interact", "capture_video"]
      github: ["create_issue", "update_issue", "create_test_report"]
      context7: ["search_tests", "find_test_patterns"]

  marcus: # Security Expert
    tools:
      - github        # Security scanning
      - context7      # Security patterns
      - browsermcp    # Security docs
    allowed_actions:
      github: ["security_scan", "create_security_issue", "audit"]
      context7: ["search_vulnerabilities", "find_security_patterns"]
      browsermcp: ["preview_docs", "export_report"]

  john: # Product Manager
    tools:
      - github        # Project management
      - claude-task-master  # Complex orchestration
      - browsermcp    # Demos and presentations
    allowed_actions:
      github: ["create_milestone", "manage_project", "create_issue"]
      claude-task-master: ["orchestrate", "track_progress", "generate_roadmap"]
      browsermcp: ["demo", "present", "export_slides"]

  sarah: # Product Owner
    tools:
      - github        # Story management
      - browsermcp    # Feature demos
      - claude-task-master  # Story prioritization
    allowed_actions:
      github: ["create_story", "manage_backlog", "update_story"]
      browsermcp: ["demo_feature", "capture_feedback"]
      claude-task-master: ["prioritize", "plan_sprint"]

  bob: # Scrum Master
    tools:
      - claude-task-master  # Sprint orchestration
      - github        # Sprint tracking
      - context7      # Process patterns
    allowed_actions:
      claude-task-master: ["plan_sprint", "track_velocity", "orchestrate_ceremony"]
      github: ["update_sprint", "generate_burndown", "manage_board"]
      context7: ["find_ceremony_patterns", "search_agile_practices"]

  sally: # UX Designer
    tools:
      - browsermcp    # Interactive mockups
      - shadcn-ui     # Component library
      - playwright    # Visual testing
    allowed_actions:
      browsermcp: ["create_mockup", "preview", "user_test", "iterate_design"]
      shadcn-ui: ["browse_components", "generate_ui", "customize_theme"]
      playwright: ["capture_design", "visual_test", "accessibility_check"]

  baco-master: # Meta-orchestrator
    tools:
      - ALL           # Access to all tools
    allowed_actions:
      ALL: ["ALL"]    # All actions permitted

  pixel: # UI Healer
    tools:
      - playwright    # Screenshot analysis
      - browsermcp    # Live inspection
      - context7      # UI patterns
    allowed_actions:
      playwright: ["screenshot", "visual_diff", "analyze_ui", "detect_issues"]
      browsermcp: ["inspect", "analyze_layout", "test_responsive"]
      context7: ["find_ui_fixes", "search_patterns", "get_best_practices"]
```

## Permission Validation Functions

### Check Basic Access

```javascript
function hasToolAccess(agent, tool) {
  const agentPerms = permissions[agent];
  if (!agentPerms) return false;
  
  // BMad Master has access to all tools
  if (agentPerms.tools.includes("ALL")) return true;
  
  return agentPerms.tools.includes(tool);
}
```

### Check Action Permission

```javascript
function canPerformAction(agent, tool, action) {
  const agentPerms = permissions[agent];
  if (!agentPerms) return false;
  
  // Check basic tool access first
  if (!hasToolAccess(agent, tool)) return false;
  
  // BMad Master can perform all actions
  if (agentPerms.allowed_actions.ALL === ["ALL"]) return true;
  
  // Check specific action permission
  const toolActions = agentPerms.allowed_actions[tool];
  return toolActions && toolActions.includes(action);
}
```

### Get Agent Capabilities

```javascript
function getAgentCapabilities(agent) {
  const agentPerms = permissions[agent];
  if (!agentPerms) return null;
  
  return {
    agent: agent,
    tools: agentPerms.tools,
    capabilities: Object.entries(agentPerms.allowed_actions).map(([tool, actions]) => ({
      tool: tool,
      actions: actions
    }))
  };
}
```

## Special Permission Rules

### Cross-Agent Collaboration

Some operations require multiple agents to collaborate:

```yaml
collaborative_permissions:
  ui_implementation:
    required_agents: ["sally", "james"]
    workflow: "sally designs -> james implements"
    
  security_review:
    required_agents: ["marcus", "james", "elena"]
    workflow: "marcus reviews -> james fixes -> elena validates"
    
  feature_delivery:
    required_agents: ["john", "sarah", "bob", "james", "elena"]
    workflow: "john defines -> sarah refines -> bob plans -> james builds -> elena tests"
```

### Escalation Permissions

When an agent needs access beyond their permissions:

```yaml
escalation_rules:
  request_elevated_access:
    approver: "baco-master"
    max_duration: "1_session"
    audit_required: true
    
  temporary_tool_access:
    conditions:
      - "critical_bug_fix"
      - "production_incident"
      - "user_requested_override"
```

### Tool-Specific Restrictions

```yaml
tool_restrictions:
  github:
    production_branch_protection:
      - "main"
      - "production"
    requires_review: ["james", "elena"]
    
  playwright:
    max_parallel_tests: 5
    screenshot_retention: "7_days"
    
  browsermcp:
    session_timeout: "30_minutes"
    max_concurrent_previews: 3
```

## Security Considerations

### Audit Requirements

All MCP tool usage must be logged:

```javascript
function auditMCPAccess(agent, tool, action, result) {
  const audit = {
    timestamp: new Date().toISOString(),
    agent: agent,
    tool: tool,
    action: action,
    result: result.status,
    duration: result.duration,
    error: result.error || null
  };
  
  // Store in audit log
  appendToMCPAuditLog(audit);
}
```

### Rate Limiting

Prevent abuse of external tools:

```javascript
const rateLimits = {
  context7: {
    requests_per_minute: 10,
    requests_per_hour: 100
  },
  github: {
    requests_per_minute: 30,
    requests_per_hour: 1000
  },
  playwright: {
    screenshots_per_minute: 5,
    tests_per_hour: 50
  }
};
```

### Sensitive Operations

Operations requiring additional validation:

```yaml
sensitive_operations:
  github:
    - "delete_branch"
    - "force_push"
    - "merge_to_main"
    
  browsermcp:
    - "clear_all_data"
    - "modify_cookies"
    
  validation_required:
    - user_confirmation: true
    - audit_log: enhanced
    - notification: team_lead
```

## Usage Examples

### Simple Permission Check

```javascript
// In agent workflow
if (!canPerformAction("sally", "browsermcp", "create_mockup")) {
  throw new Error("Sally lacks permission to create mockups");
}
```

### Collaborative Workflow

```javascript
// UI implementation workflow
const workflow = collaborative_permissions.ui_implementation;

// Sally designs
if (canPerformAction("sally", "browsermcp", "create_mockup")) {
  const mockup = await createMockup();
  
  // Hand off to James
  if (canPerformAction("james", "shadcn-ui", "generate")) {
    const component = await generateFromMockup(mockup);
  }
}
```

### Audit Trail

```javascript
// Wrapped MCP call with audit
async function auditedMCPCall(agent, tool, action, operation) {
  const startTime = Date.now();
  let result;
  
  try {
    // Check permission
    if (!canPerformAction(agent, tool, action)) {
      throw new Error(`Permission denied: ${agent} cannot ${action} on ${tool}`);
    }
    
    // Execute operation
    result = await operation();
    
    // Audit success
    auditMCPAccess(agent, tool, action, {
      status: "success",
      duration: Date.now() - startTime
    });
    
    return result;
  } catch (error) {
    // Audit failure
    auditMCPAccess(agent, tool, action, {
      status: "failure",
      duration: Date.now() - startTime,
      error: error.message
    });
    
    throw error;
  }
}
```

## Best Practices

1. **Always check permissions** before MCP operations
2. **Use the principle of least privilege** - only grant necessary access
3. **Audit all operations** for security and debugging
4. **Implement rate limiting** to prevent abuse
5. **Review permissions regularly** as agents evolve
6. **Document permission changes** in version control
7. **Test permission denials** as well as grants

This permission matrix ensures secure, controlled access to MCP tools while enabling powerful agent capabilities.