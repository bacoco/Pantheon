# Command Syntax: Claude Code vs Docker Terminal

## Understanding the Difference

There are two different environments where you can use Pantheon:

### 1. Claude Code (claude.ai/code)
- **Command syntax**: `/gods init` (with slash)
- **How it works**: Slash commands are built into Claude Code
- **Available commands**: All `/` commands work here
- **Claude integration**: Built-in, no setup needed

### 2. Docker Terminal (VS Code Server)
- **Command syntax**: `gods init` (no slash)
- **How it works**: Regular CLI commands in bash
- **Available commands**: Standard terminal commands
- **Claude integration**: Via VS Code extension + CLI

## Quick Reference

| Action | Claude Code | Docker Terminal |
|--------|-------------|----------------|
| Initialize project | `/gods init` | `gods init` |
| Create plan | `/gods plan` | `gods plan` |
| Execute plan | `/gods execute` | `gods execute` |
| Chat with Claude | Built-in chat | `claude chat "prompt"` |
| Authenticate | Automatic | `claude-auth-docker.sh` |

## Why the Difference?

- **Claude Code**: Uses special slash commands that trigger Claude's built-in capabilities
- **Docker Terminal**: Uses regular bash commands that run Python scripts

## Using Claude in Docker

The Docker environment provides TWO ways to use Claude:

### 1. VS Code Extension (Recommended)
- Click the Claude icon in the sidebar
- Sign in when prompted
- Chat directly in the editor
- Full visual interface

### 2. Claude CLI
```bash
# First authenticate
claude-auth-docker.sh

# Then use Claude
claude chat "Help me build a REST API"
claude --help
```

## Pantheon Integration

The `gods` command is currently a placeholder that will eventually integrate with Claude. For now:

1. Use `gods init` to see the command structure
2. Use the Claude extension for actual AI assistance
3. Follow the interactive guides in the documentation

## Future Integration

The plan is to have `gods` commands automatically invoke Claude with the right context and prompts, making the full Pantheon experience available in both environments.