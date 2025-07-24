# BACO Pantheon VS Code Extension

This extension provides convenient shortcuts and authentication helpers for the BACO/Pantheon development environment within VS Code Server.

## Features

### 🚀 BACO Commands

- **Initialize Project** - Start a new BACO project
- **Create Plan** - Generate a development plan with AI assistance
- **Execute Plan** - Execute the generated plan

### 🔐 Claude Authentication

- **Authenticate** - Run the authentication wizard
- **Check Status** - View current authentication status
- **Backup** - Save authentication credentials
- **Restore** - Restore from backup

### 🎯 Quick Access

- **Status Bar** - Quick access to all commands
- **Command Palette** - Type "BACO" to see all commands
- **Keyboard Shortcut** - `Ctrl+Shift+B` (or `Cmd+Shift+B` on Mac)

## Usage

### Status Bar

Look for two items in your status bar:

1. **🚀 BACO** - Click to open the command menu
2. **✓ Claude** or **✗ Claude** - Shows authentication status

### Command Palette

Press `Ctrl+Shift+P` (or `Cmd+Shift+P` on Mac) and type:

- `BACO: Initialize Project`
- `BACO: Create Plan`
- `BACO: Execute Plan`
- `BACO: Authenticate Claude`
- `BACO: Check Authentication Status`
- `BACO: Backup Authentication`
- `BACO: Restore Authentication`

### Terminal Profiles

The extension adds custom terminal profiles:

- **claude-auth** - Opens terminal with authentication wizard
- **claude-status** - Opens terminal showing auth status

## Configuration

Access settings through `File → Preferences → Settings` and search for "BACO":

- **baco.showStatusBar** - Show/hide the BACO status bar item
- **baco.autoCheckAuth** - Automatically check authentication on startup

## Authentication Flow

1. On first use, click the **✗ Claude** status bar item
2. Follow the authentication wizard in the terminal
3. The status will update to **✓ Claude** when authenticated
4. Authentication persists across container restarts

## Troubleshooting

### Authentication Issues

- Run `BACO: Check Authentication Status` to diagnose
- Use `BACO: Backup Authentication` before making changes
- Try `BACO: Restore Authentication` if something goes wrong

### Extension Not Working

1. Ensure you're in the Docker container
2. Check that authentication scripts are installed
3. Verify the `gods` command is available

## Development

This extension is automatically installed in the BACO/Pantheon Docker container. To modify it:

1. Edit files in `/tmp/baco-vscode-extension/`
2. Reload VS Code to test changes
3. Copy changes back to the host for persistence

## License

Part of the BACO/Pantheon project.