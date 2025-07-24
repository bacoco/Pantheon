#!/bin/bash
# Docker entrypoint for BACO/Pantheon

echo "🚀 Initializing Pantheon environment..."

# Set PATH for npm global packages
export PATH="/home/coder/.npm-global/bin:$PATH"

# Check Claude status
if command -v claude &> /dev/null; then
    echo "✅ Claude Code CLI available"
else
    echo "🔍 Claude Code CLI not found - install with: npm install -g @anthropic-ai/claude-code"
fi

# Install custom theme
if [ -f "/usr/local/bin/install-theme.sh" ]; then
    /usr/local/bin/install-theme.sh
fi

# Ensure .claude directory is in projects
if [ ! -d "/home/coder/projects/.claude" ]; then
    echo "📁 Setting up .claude directory..."
    if [ -d "/home/coder/.config/pantheon/claude-source" ]; then
        cp -r /home/coder/.config/pantheon/claude-source /home/coder/projects/.claude
        echo "✅ Copied .claude directory to projects"
    else
        echo "❌ Source .claude directory not found!"
    fi
fi

# Check .claude directory
if [ -d "/home/coder/projects/.claude" ]; then
    file_count=$(find /home/coder/projects/.claude -type f -name "*.md" 2>/dev/null | wc -l)
    echo "📁 .claude directory ready with $file_count command files"
    echo "📝 Commands available:"
    echo "   Type: gods init    (to initialize a project)"
    echo "   Type: gods help    (for all commands)"
    echo ""
    echo "⚠️  Note: Use 'gods' not '/gods'"
else
    echo "❌ .claude directory not found!"
fi

# Copy other needed files if needed
if [ ! -d "/home/coder/projects/examples" ] && [ -d "/home/coder/.config/pantheon/files/examples" ]; then
    echo "📚 Copying example files..."
    cp -r /home/coder/.config/pantheon/files/examples /home/coder/projects/examples 2>/dev/null || true
fi

# Don't copy CLAUDE.md to projects - it doesn't work there

# Show welcome message
if [ -f "/home/coder/.config/pantheon/branding/motd.sh" ]; then
    /home/coder/.config/pantheon/branding/motd.sh
fi

# Don't start the Pantheon server - it creates too many port forwards
# The compiled commands are available if needed

echo "✅ Pantheon environment ready!"
echo ""

# Ensure we're in the right directory
cd /home/coder/projects

# Set Pantheon prompt if not already set
if ! grep -q "pantheon" /home/coder/.bashrc; then
    echo "export PS1='⚡ [\\u@pantheon \\W]$ '" >> /home/coder/.bashrc
fi

# Create a symlink to hide the home directory mess
if [ ! -L "/home/coder/workspace" ]; then
    ln -s /home/coder/projects /home/coder/workspace
fi

# Create a startup file that VS Code will open by default
if [ -f "/home/coder/projects/WELCOME.html" ]; then
    # Create a .code-workspace file that opens our welcome page
    cat > /home/coder/projects/.vscode/startup.code-workspace << 'EOF'
{
    "folders": [{"path": ".."}],
    "settings": {
        "workbench.startupEditor": "none"
    },
    "extensions": {},
    "launch": {}
}
EOF
fi

# Start code-server - it will open the projects folder and our welcome page
exec code-server "$@"