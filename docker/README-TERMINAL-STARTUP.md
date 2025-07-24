# Configure VS Code Server to Open Terminal on Startup

If you prefer to have the terminal open automatically when you start VS Code Server, you can modify the configuration.

## Option 1: Open Terminal Alongside README (Recommended)

Add this to your VS Code settings to automatically open a terminal when VS Code starts:

1. Open VS Code at http://localhost:8080
2. Press `Ctrl+Shift+P` (or `Cmd+Shift+P` on Mac)
3. Type "Preferences: Open Settings (JSON)"
4. Add these lines:

```json
{
  "workbench.startupEditor": "readme",
  "terminal.integrated.defaultProfile.linux": "pantheon",
  "workbench.action.terminal.new.openToSide": false,
  "window.restoreWindows": "all",
  "workbench.action.terminal.focusOnStartup": true
}
```

## Option 2: Open Only Terminal (No README)

To have only the terminal open on startup:

```json
{
  "workbench.startupEditor": "none",
  "terminal.integrated.defaultProfile.linux": "pantheon",
  "workbench.action.terminal.focusOnStartup": true,
  "workbench.panel.opensMaximized": "always"
}
```

## Option 3: Modify the Docker Image

To make this change permanent in the Docker image, edit `docker/Dockerfile.claude`:

Find this line (around line 115):
```json
"workbench.startupEditor": "readme",
```

Change it to:
```json
"workbench.startupEditor": "none",
"workbench.action.terminal.focusOnStartup": true,
```

Then rebuild the Docker image:
```bash
make build
make up
```

## Using Pantheon Commands

Remember, in the Docker terminal:
- Use `gods init` (without the slash)
- Use `gods plan "your idea"`
- Use `gods execute`

The `/gods` slash command syntax only works in Claude Code's web interface at claude.ai/code.

## Tips

- The terminal will show the Pantheon welcome message on startup
- You can always open the README by clicking on it in the file explorer
- Press `Ctrl+\`` to toggle the terminal panel
- Use `Ctrl+Shift+5` to open a new terminal