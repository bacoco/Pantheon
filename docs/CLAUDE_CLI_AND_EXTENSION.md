# Using Claude CLI and Claude Code Extension Together

This guide explains how to use both the Claude CLI and Claude Code VS Code extension in the BACO/Pantheon Docker environment.

## Overview

Your Docker environment includes TWO ways to interact with Claude:

1. **Claude Code Extension** - Visual, integrated IDE experience
2. **Claude CLI** - Command-line interface for scripts and automation

Both are installed and ready to use!

## Claude Code Extension (VS Code)

### Features
- **Interactive Chat** - Chat with Claude in a sidebar panel
- **Code Generation** - Generate code directly in your editor
- **Code Explanation** - Get explanations for selected code
- **Inline Suggestions** - Get AI-powered code completions
- **Refactoring** - Improve and refactor existing code

### How to Use
1. Open VS Code Server at http://localhost:8080
2. Look for the **Claude icon** in the Activity Bar (left sidebar)
3. Click the icon to open the Claude panel
4. Sign in when prompted (uses browser-based auth)
5. Start chatting or select code and right-click for Claude options

### Extension Commands
- `Cmd/Ctrl + Shift + P` → Type "Claude" to see all commands
- Right-click on code → See Claude options in context menu

## Claude CLI

### Features
- **Script Automation** - Use Claude in bash scripts
- **Batch Processing** - Process multiple files
- **CI/CD Integration** - Use in automated workflows
- **Terminal Workflows** - Quick commands without leaving terminal

### How to Use
1. Open a terminal in VS Code (`Ctrl + ``)
2. Authenticate: `claude-auth-docker.sh`
3. Use Claude commands:
   ```bash
   # Interactive chat
   claude chat
   
   # Ask a question
   claude chat "How do I implement a binary search in Python?"
   
   # Analyze a file
   claude analyze main.py
   
   # Generate code
   claude generate "Create a REST API endpoint for user authentication"
   ```

### CLI Commands
```bash
claude help              # Show all commands
claude chat             # Start interactive chat
claude analyze <file>   # Analyze a code file
claude generate <prompt> # Generate code
claude explain <code>   # Explain code snippet
```

## When to Use Which?

### Use Claude Code Extension When:
- Writing code interactively
- Need visual feedback
- Want to see suggestions inline
- Refactoring existing code
- Learning and exploring

### Use Claude CLI When:
- Automating tasks
- Processing multiple files
- Writing scripts
- CI/CD pipelines
- Quick terminal queries

## Authentication

### Important: They Use Different Auth Systems!

1. **Claude Code Extension**
   - Uses browser-based OAuth
   - Sign in through the extension UI
   - Credentials stored in VS Code

2. **Claude CLI**
   - Uses API key or device code
   - Authenticate with `claude-auth-docker.sh`
   - Credentials stored in `~/.claude/`

You need to authenticate BOTH separately if you want to use both!

## Best Practices

### 1. Start with the Extension
For most development tasks, the VS Code extension provides the best experience.

### 2. Use CLI for Automation
When you need to automate or script Claude interactions, switch to the CLI.

### 3. Combine Both
Example workflow:
1. Use the extension to prototype and test code
2. Once happy, use the CLI to apply similar changes across multiple files

### 4. Keep Both Authenticated
Run these commands after starting your container:
```bash
# For CLI
claude-auth-docker.sh

# For Extension
# Click the Claude icon and sign in through the UI
```

## Troubleshooting

### Extension Not Working?
1. Check if the extension is installed: Extensions panel → Search "Claude"
2. Click the Claude icon and ensure you're signed in
3. Try reloading VS Code: `Cmd/Ctrl + R`

### CLI Not Working?
1. Check authentication: `claude-auth-status.sh`
2. Re-authenticate: `claude-auth-docker.sh`
3. Verify installation: `which claude`

### Both Not Working?
1. Rebuild the container: `make build`
2. Check logs: `make logs`
3. Ensure internet connectivity

## Example: Using Both Together

```bash
# 1. Use the extension to prototype a function
# (Create a function using the Claude panel)

# 2. Save the function to utils.py

# 3. Use CLI to create tests
claude generate "Create pytest tests for the functions in utils.py" > test_utils.py

# 4. Use extension to refine the tests
# (Open test_utils.py and use Claude to improve)

# 5. Use CLI to document
claude analyze utils.py --add-docstrings > utils_documented.py
```

This hybrid approach gives you the best of both worlds!