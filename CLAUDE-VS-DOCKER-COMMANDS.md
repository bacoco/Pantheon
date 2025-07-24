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
- **How it works**: Bash wrapper that calls `claude chat "/gods init"`
- **Available commands**: All Pantheon commands via Claude integration
- **Claude integration**: Automatic via wrapper script + VS Code extension

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
- **Docker Terminal**: Uses regular bash commands that wrap Claude CLI to provide the same experience

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

The `gods` command now fully integrates with Claude! Here's how:

### In Docker Terminal:
```bash
gods init          # Executes: claude chat "/gods init"
gods plan "idea"  # Executes: claude chat "/gods plan idea"
gods execute       # Executes: claude chat "/gods execute"
```

### In Claude Code:
```
/gods init         # Direct slash command
/gods plan "idea" # Direct slash command
/gods execute      # Direct slash command
```

## Behind the Scenes

The Docker `gods` command is a bash script that:
1. Checks if Claude CLI is authenticated
2. Wraps your command with the appropriate slash syntax
3. Passes it to `claude chat`
4. Provides the same Pantheon experience as Claude Code

This means you get the full AI-powered Pantheon experience in both environments!