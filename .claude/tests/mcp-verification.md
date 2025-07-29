# MCP Tools Verification Test

This document provides a test script to verify that all MCP tools are working correctly with the local `.mcp.json` configuration.

## Test Steps

### 1. Verify MCP Configuration
Check that the `.mcp.json` file exists and contains the required servers:
```bash
cat .mcp.json
```

Expected: Should show claude-flow, browsermcp, playwright, context7, claude-task-master, and shadcn-ui configurations.

### 2. Test Claude-Flow Tools
Try using a claude-flow tool through Zeus:
```bash
/gods summon zeus
# Then ask Zeus to check swarm status
```

Expected: Zeus should be able to use `mcp__claude-flow__swarm_status` or similar tools.

### 3. Test Playwright
Try using playwright through Themis:
```bash
/gods summon themis
# Ask Themis to demonstrate playwright testing capabilities
```

Expected: Themis should be able to reference playwright for E2E testing.

### 4. Test BrowserMCP
Try using browsermcp through Apollo:
```bash
/gods summon apollo
# Ask Apollo to demonstrate UI preview capabilities
```

Expected: Apollo should be able to use browsermcp for design previews.

### 5. List All Available MCP Resources
```bash
/ListMcpResourcesTool
```

Expected: Should list all available MCP tools from the configured servers.

## Verification Checklist

- [ ] `.mcp.json` file exists in project root
- [ ] `.claude/settings.json` exists with `enableAllProjectMcpServers: true`
- [ ] MCP servers are automatically enabled (no approval prompt)
- [ ] Zeus can use claude-flow orchestration tools
- [ ] Themis can reference playwright for testing
- [ ] Apollo can use browsermcp for UI work
- [ ] ListMcpResourcesTool shows all configured servers

## Troubleshooting

If MCP tools are not available:
1. Ensure `.claude/settings.json` exists with auto-approval setting
2. Restart Claude Code if needed
3. Check that Node.js is installed: `node --version`
4. Verify npx is available: `npx --version`

## Notes

- First use of each MCP tool will download its package (one-time)
- Downloads are cached for future use
- context7 uses a URL endpoint, so no download needed