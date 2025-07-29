# Installation Test Checklist

This document helps verify the one-command installation process works correctly.

## Pre-Installation

- [ ] Claude Code is open
- [ ] Node.js 18+ is installed
- [ ] npm is available
- [ ] git is installed

## Installation Test

1. **Run the installation command**:
   ```bash
   curl -sSL https://raw.githubusercontent.com/bacoco/Pantheon/main/install-pantheon.sh | bash
   ```

2. **Expected output**:
   - Banner shows "Pantheon Installation"
   - Prerequisites check passes
   - Repository clones successfully
   - Verification shows all green checkmarks
   - Next steps are displayed

3. **Verify files exist**:
   ```bash
   ls -la .mcp.json
   ls -la .claude/settings.json
   ls -la .claude/agents/
   ```

## Post-Installation Test

1. **Test basic commands**:
   ```bash
   /help
   /gods list
   ```

2. **Test council**:
   ```bash
   /gods council
   ```

3. **Test individual god**:
   ```bash
   /gods summon apollo
   ```

## MCP Verification

1. **Check MCP resources**:
   ```bash
   /ListMcpResourcesTool
   ```

2. **Verify auto-approval**:
   - No approval prompt should appear
   - MCP tools should be immediately available

## Success Criteria

- [ ] Installation completes without errors
- [ ] All verification checks pass
- [ ] Commands are recognized
- [ ] MCP tools are available
- [ ] No manual approval needed
- [ ] User can start using immediately

## Common Issues

### Node.js not found
Solution: Install Node.js 18+ from nodejs.org

### Permission denied
Solution: Check file permissions or use sudo

### MCP tools not loading
Solution: Restart Claude Code after installation