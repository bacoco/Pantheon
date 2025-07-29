# Pantheon Installation Guide

This guide will help you set up Pantheon with all required MCP (Model Context Protocol) servers for full functionality.

## Prerequisites

- Claude Code (claude.ai/code) 
- Node.js 18+ installed
- npm package manager
- git

## One-Command Installation

```bash
curl -sSL https://raw.githubusercontent.com/bacoco/Pantheon/main/install-pantheon.sh | bash
```

This single command:
- ✅ Checks all prerequisites
- ✅ Clones the Pantheon repository
- ✅ Verifies the installation
- ✅ Shows you how to get started

## MCP Servers Are Ready!

Pantheon includes all required MCP server configurations in the `.mcp.json` file, and they are **automatically approved** via `.claude/settings.json`.

When you open the project in Claude Code:
1. **Open the Pantheon folder** in Claude Code
2. **MCP servers are automatically enabled** - no approval needed!
3. **Start using Pantheon immediately**

> **Note**: The MCP servers are defined locally in the project's `.mcp.json` file and auto-approved by `.claude/settings.json`. You don't need to modify any settings or approve anything.

> **First-time use**: MCP tools using `npx` will automatically download their packages on first use. This is a one-time download that gets cached for future use.

## Step 4: Verify Installation

To verify that Pantheon and MCP tools are working correctly:

```bash
# Test a Pantheon command
/help

# Start a divine council session
/gods council

# List available MCP tools
/mcp_ListMcpResourcesTool
```

## MCP Servers Used by Pantheon Gods

### Core Orchestration
- **claude-flow**: Advanced workflow orchestration, SPARC modes, and swarm management (heavily used by all gods)
- **claude-task-master**: Complex task orchestration and coordination

### Development & Testing
- **playwright**: End-to-end testing framework (used by Themis for quality assurance)
- **context7**: Code pattern retrieval and context search (used for finding best practices)

### UI & Design
- **browsermcp**: Browser automation and preview (used by Apollo for UI/UX design)
- **shadcn-ui**: UI component design and management

## Troubleshooting

### MCP Servers Not Loading
1. Ensure Node.js is installed: `node --version`
2. Check npm is accessible: `npm --version`
3. Restart Claude Code after configuration changes

### Missing MCP Tools
If a god mentions an MCP tool is unavailable:
1. Check the specific server is in your settings.json
2. Restart Claude Code
3. Check the Claude Code console for any error messages

### Permission Errors
If you see permission errors:
```bash
# Clear npm cache
npm cache clean --force

# Try with elevated permissions (use cautiously)
sudo npm install -g npx
```

## Additional Configuration

### For Enterprise Users
Some MCP servers may require additional configuration:
- API keys
- Authentication tokens
- Custom endpoints

These can be added in the env block of each server configuration:
```json
{
  "mcpServers": {
    "example-server": {
      "command": "npx",
      "args": ["-y", "example-mcp"],
      "env": {
        "API_KEY": "your-api-key-here"
      }
    }
  }
}
```

## Next Steps

Once installation is complete:
1. Try `/gods council` to start a collaborative planning session
2. Use `/help` to see all available commands
3. Check `.claude/docs/` for more documentation

## Support

If you encounter issues:
1. Check the [Pantheon repository](https://github.com/bacoco/Pantheon) for updates
2. Review Claude Code logs for MCP initialization errors
3. Ensure all prerequisites are met

---

*Welcome to Pantheon - Where Gods Build Software!*