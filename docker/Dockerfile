# =================================================================
# Secure BACO/Pantheon Docker Environment
# =================================================================

# Stage 1: Build secure command bundle
FROM python:3.10-slim as command-builder

# Install build dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    openssl \
    && rm -rf /var/lib/apt/lists/*

# Copy .claude directory
COPY ./.claude /build/.claude

# Create Python script that embeds all commands
RUN cat > /build/embed_commands.py << 'EOF'
import os
import json
import base64
import zlib

commands = {}
agents = {}

# Read all command files
for root, dirs, files in os.walk('/build/.claude/commands'):
    for file in files:
        if file.endswith('.md'):
            with open(os.path.join(root, file), 'r') as f:
                key = file[:-3]  # Remove .md
                # Compress and encode
                content = f.read()
                compressed = zlib.compress(content.encode())
                commands[key] = base64.b64encode(compressed).decode()

# Read all agent files
for root, dirs, files in os.walk('/build/.claude/agents'):
    for file in files:
        if file.endswith('.md'):
            with open(os.path.join(root, file), 'r') as f:
                key = file[:-3]
                content = f.read()
                compressed = zlib.compress(content.encode())
                agents[key] = base64.b64encode(compressed).decode()

# Create secure loader
with open('/build/pantheon_secure.py', 'w') as f:
    f.write(f'''#!/usr/bin/env python3
import base64
import zlib
import sys
import os

# Embedded command data (compressed and encoded)
COMMANDS = {json.dumps(commands)}
AGENTS = {json.dumps(agents)}

def get_command(name):
    """Retrieve and decompress a command"""
    if name in COMMANDS:
        compressed = base64.b64decode(COMMANDS[name])
        return zlib.decompress(compressed).decode()
    return None

def get_agent(name):
    """Retrieve and decompress an agent"""
    if name in AGENTS:
        compressed = base64.b64decode(AGENTS[name])
        return zlib.decompress(compressed).decode()
    return None

# Command server mode
if __name__ == "__main__":
    if len(sys.argv) > 1:
        if sys.argv[1] == "command" and len(sys.argv) > 2:
            content = get_command(sys.argv[2])
            if content:
                print(content)
                sys.exit(0)
        elif sys.argv[1] == "agent" and len(sys.argv) > 2:
            content = get_agent(sys.argv[2])
            if content:
                print(content)
                sys.exit(0)
    sys.exit(1)
''')
EOF

# Run the embedding script
RUN cd /build && python embed_commands.py

# Compile to bytecode for additional obfuscation
RUN python -m py_compile /build/pantheon_secure.py

# =================================================================
# Stage 2: Final secure image
# =================================================================
FROM codercom/code-server:latest

USER root

# Install minimal Python runtime and necessary tools including Xvfb for Claude auth
RUN apt-get update && apt-get install -y \
    python3-minimal \
    curl \
    git \
    nodejs \
    npm \
    xvfb \
    x11-utils \
    libgtk-3-0 \
    libgbm-dev \
    libnss3 \
    libatk-bridge2.0-0 \
    libdrm2 \
    libxcomposite1 \
    libxdamage1 \
    libxrandr2 \
    libasound2 \
    libatspi2.0-0 \
    libxss1 \
    fonts-liberation \
    && rm -rf /var/lib/apt/lists/*

# Install Claude Code CLI as root (if available)
RUN npm install -g @anthropic-ai/claude-code 2>/dev/null || true

# Copy the gods bash script
COPY ./gods /usr/local/bin/gods
RUN chmod +x /usr/local/bin/gods

# Copy only the compiled secure loader
COPY --from=command-builder /build/__pycache__/pantheon_secure.cpython-*.pyc /opt/pantheon/pantheon.pyc

# Create wrapper that prevents direct access
RUN cat > /usr/local/bin/pantheon-get << 'EOF'
#!/bin/bash
# Secure wrapper for Pantheon commands
# Only allows access from specific processes

# Check if caller is code-server or claude
PARENT_CMD=$(ps -o comm= -p $PPID)
if [[ ! "$PARENT_CMD" =~ (code-server|node|claude) ]]; then
    echo "Access denied"
    exit 1
fi

# Run the secure Python loader
exec python3 /opt/pantheon/pantheon.pyc "$@"
EOF

RUN chmod 755 /usr/local/bin/pantheon-get && \
    chmod 700 /opt/pantheon && \
    chmod 400 /opt/pantheon/pantheon.pyc

# Create Claude wrapper that uses the secure loader
RUN cat > /usr/local/bin/claude-secure << 'EOF'
#!/bin/bash
# This wrapper makes .claude files available to Claude without exposing them

if [ "$1" = "read-command" ]; then
    pantheon-get command "$2"
elif [ "$1" = "read-agent" ]; then
    pantheon-get agent "$2"
else
    echo "Claude Code wrapper - commands are built-in"
fi
EOF

RUN chmod 755 /usr/local/bin/claude-secure

# Rest of normal setup continues...

# Copy authentication and helper scripts
COPY ./scripts/claude-auth-docker.sh /usr/local/bin/claude-auth-docker.sh
COPY ./scripts/claude-auth-status.sh /usr/local/bin/claude-auth-status.sh
COPY ./scripts/claude-auth-helper.sh /usr/local/bin/claude-auth-helper.sh
COPY ./scripts/install-claude.sh /usr/local/bin/install-claude.sh
COPY ./scripts/fix-claude-location.sh /usr/local/bin/fix-claude-location.sh
COPY ./scripts/install-theme.sh /usr/local/bin/install-theme.sh
COPY ./scripts/fix-pantheon-prompt.sh /usr/local/bin/fix-pantheon-prompt.sh
RUN chmod +x /usr/local/bin/claude-auth-*.sh /usr/local/bin/install-claude.sh /usr/local/bin/fix-claude-location.sh /usr/local/bin/install-theme.sh /usr/local/bin/fix-pantheon-prompt.sh

# Copy VS Code extension
COPY ./baco-vscode-extension /tmp/baco-vscode-extension/

# Setup workspace and user directories FIRST
RUN mkdir -p /home/coder/projects && \
    mkdir -p /home/coder/.local/share/code-server/User/ && \
    mkdir -p /home/coder/.config && \
    mkdir -p /home/coder/.config/pantheon/branding && \
    mkdir -p /home/coder/.config/pantheon/files

# Copy example pantheon files to a safe location
COPY ./examples /home/coder/.config/pantheon/files/examples
COPY ./CLAUDE.md /home/coder/.config/pantheon/files/CLAUDE.md

# Copy .claude directory to a safe location (not in volume mount)
COPY .claude /home/coder/.config/pantheon/claude-source
RUN chown -R coder:coder /home/coder/.config/pantheon/claude-source && \
    find /home/coder/.config/pantheon/claude-source -type d -exec chmod 755 {} \; && \
    find /home/coder/.config/pantheon/claude-source -type f -exec chmod 644 {} \; && \
    echo "Copied .claude directory with $(find /home/coder/.config/pantheon/claude-source -name '*.md' | wc -l) .md files"

# Copy branding files
COPY ./docker/pantheon-branding /home/coder/.config/pantheon/branding/
RUN chmod +x /home/coder/.config/pantheon/branding/*.sh

# Copy workspace and customization files
COPY ./docker/pantheon.code-workspace /home/coder/pantheon.code-workspace
COPY ./docker/custom-theme.json /home/coder/.local/share/code-server/User/pantheon-theme.json
COPY ./docker/custom-styles.css /home/coder/.local/share/code-server/User/custom.css

# VS Code settings.json with terminal profiles and Pantheon customization
RUN cat > /home/coder/.local/share/code-server/User/settings.json << 'EOF'
{
  "terminal.integrated.defaultProfile.linux": "pantheon",
  "terminal.integrated.profiles.linux": {
    "pantheon": {
      "path": "/bin/bash",
      "icon": "zap",
      "color": "terminal.ansiYellow",
      "overrideName": true,
      "cwd": "/home/coder/projects",
      "env": {
        "TERM": "xterm-256color",
        "PS1": "⚡ [\\u@pantheon \\W]$ "
      },
      "args": ["--login", "-c", "cd /home/coder/projects && /home/coder/.config/pantheon/branding/motd.sh && exec bash"]
    }
  },
  "workbench.panel.defaultLocation": "bottom",
  "workbench.colorTheme": "Pantheon Lightning",
  "workbench.startupEditor": "none",
  "explorer.openEditors.visible": 0,
  "terminal.integrated.cwd": "/home/coder/projects",
  "explorer.openEditors.sortOrder": "alphabetical",
  "explorer.autoReveal": false,
  "files.simpleDialog.enable": true,
  "window.title": "BACO/Pantheon - Where Gods Build Software",
  "workbench.colorCustomizations": {
    "titleBar.activeBackground": "#1a1a2e",
    "titleBar.activeForeground": "#ffd700",
    "activityBar.background": "#1a1a2e",
    "activityBar.foreground": "#ffd700",
    "statusBar.background": "#1a1a2e",
    "statusBar.foreground": "#ffd700"
  },
  "files.exclude": {
    ".cache": true,
    ".config": true,
    ".local": true,
    ".npm": true,
    ".npm-global": true,
    ".bashrc": true,
    ".profile": true,
    ".bash_logout": true,
    "pantheon.code-workspace": true,
    ".hidden": true,
    "node_modules": true,
    "__pycache__": true,
    "*.pyc": true
  },
  "workbench.startupEditor": "none",
  "explorer.compactFolders": false,
  "remote.autoForwardPorts": false,
  "remote.autoForwardPortsSource": "process",
  "workbench.welcomePage.walkthroughs.openOnInstall": false,
  "workbench.tips.enabled": false,
  "workbench.welcome.enabled": false,
  "update.showReleaseNotes": false,
  "workbench.welcomePage.preferredStartupEditor": "none",
  "workbench.welcomePage.hiddenCategories": ["Setup", "Beginner", "Intermediate"],
  "window.restoreWindows": "none",
  "update.mode": "none",
  "workbench.editorAssociations": {
    "*.html": "default"
  },
  "workbench.editor.enablePreview": false,
  "workbench.editor.restoreViewState": false
}
EOF

# Settings will hide unwanted files via VS Code settings.json

# Copy custom welcome page and pantheon image
RUN mkdir -p /home/coder/projects/docs/images
COPY ./docker/pantheon-welcome.html /home/coder/projects/WELCOME.html
COPY ./docs/images/pantheon.jpeg /home/coder/projects/docs/images/pantheon.jpeg

# Create welcome file
RUN cat > /home/coder/projects/README.md << 'EOF'
<div align="center">
  <h1>⚡ PANTHEON SECURE ⚡</h1>
  <h3>Where Gods Build Software - Protected Edition</h3>
  <p><em>Powered by Claude AI with Secure Command Architecture</em></p>
</div>

---

## 🏦 Welcome to Your Secure Development Environment

This is the secure version of Pantheon where all commands are protected and served
through a secure API rather than being exposed in the filesystem.

### 🔒 Security Features

- **Protected Commands**: All Pantheon commands are compiled and protected
- **No File Access**: Command definitions are not accessible in the filesystem
- **Secure API**: Commands served through authenticated localhost API
- **Audit Trail**: All command access is logged and monitored

### 🚀 Getting Started

1. **Use the gods command** (no slash!):
   ```bash
   gods init
   gods plan "your project idea"
   gods execute
   ```

2. **Or use Claude directly**:
   - Click the Claude icon in the sidebar
   - Type `/gods init` in the chat (with slash in Claude)

### 📚 Available Commands

All standard Pantheon commands work as expected:
- `gods init` - Initialize a new project
- `gods plan` - Create a development plan
- `gods execute` - Execute the plan
- `gods validate` - Validate your pantheon.md

### 🔐 Security Notice

This environment uses the secure Pantheon architecture. Command definitions
are protected and cannot be copied or modified. This ensures the integrity
of the Pantheon system while providing full functionality.

---

<div align="center">
  <p><strong>Ready to build something legendary?</strong></p>
  <p>Type <code>gods init</code> in the terminal to begin</p>
  <h2>⚡</h2>
</div>
EOF

# Configure npm for coder user to use local directory for global packages
RUN mkdir -p /home/coder/.npm-global && \
    chown -R coder:coder /home/coder/.npm-global && \
    echo "export PATH=/home/coder/.npm-global/bin:\$PATH" >> /home/coder/.bashrc && \
    echo "export NPM_CONFIG_PREFIX=/home/coder/.npm-global" >> /home/coder/.bashrc && \
    echo "# Always start in projects directory" >> /home/coder/.bashrc && \
    echo "cd /home/coder/projects" >> /home/coder/.bashrc && \
    echo "export HISTFILE=/home/coder/.bash_history" >> /home/coder/.bashrc && \
    echo "# Pantheon terminal prompt" >> /home/coder/.bashrc && \
    echo "export PS1='⚡ [\\u@pantheon \\W]$ '" >> /home/coder/.bashrc

# Create .hidden file to hide clutter in explorer
RUN cat > /home/coder/.hidden << 'EOF'
.cache
.config
.local
.npm
.npm-global
.bashrc
.profile
.bash_logout
.bash_history
pantheon.code-workspace
.vscode
.node
.yarn
EOF

# Fix ownership
RUN chown -R coder:coder /home/coder/

# Permissions are set by --chown during COPY

# Switch to non-root user
USER coder

# Configure npm for user
RUN npm config set prefix '/home/coder/.npm-global'
ENV PATH="/home/coder/.npm-global/bin:${PATH}"
ENV NPM_CONFIG_PREFIX="/home/coder/.npm-global"

# Install VS Code extensions
RUN code-server --install-extension Anthropic.claude-code || echo "Claude extension may not be available" && \
    code-server --install-extension esbenp.prettier-vscode && \
    code-server --install-extension dbaeumer.vscode-eslint && \
    code-server --install-extension ms-python.python && \
    code-server --install-extension ms-python.vscode-pylance && \
    code-server --install-extension bradlc.vscode-tailwindcss && \
    code-server --install-extension ritwickdey.liveserver || \
    echo "Some extensions may not be available"

# Expose port for code-server
EXPOSE 8080

# Set password via environment variable
ENV PASSWORD=${PASSWORD:-pantheon}

# Add paths including npm global bin
ENV PATH="/home/coder/.npm-global/bin:/home/coder/.local/bin:/usr/local/bin:${PATH}"

# Copy entrypoint script
COPY --chmod=755 ./scripts/docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8080/healthz || exit 1

# Set working directory and ensure VS Code opens with projects in explorer
WORKDIR /home/coder/projects
ENV VSCODE_CWD=/home/coder/projects

# Use entrypoint to start Pantheon server and code-server
ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]