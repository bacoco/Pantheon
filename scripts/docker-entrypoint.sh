#!/bin/bash
# Docker entrypoint script for BACO/Pantheon
# This ensures Pantheon files are available in the mounted projects directory

echo "🚀 Initializing Pantheon environment..."

# Copy Pantheon files to projects directory if they don't exist
if [ ! -d "/home/coder/projects/.claude" ]; then
    echo "📁 Setting up Pantheon command files..."
    cp -r /home/coder/.pantheon-files/.claude /home/coder/projects/.claude 2>/dev/null || true
    
    # Make files read-only to prevent accidental modification
    find /home/coder/projects/.claude -type f -exec chmod 444 {} \;
    find /home/coder/projects/.claude -type d -exec chmod 555 {} \;
    
    # Add notice about proprietary files
    cat > /home/coder/projects/.claude/README.txt << 'EOF'
PANTHEON SYSTEM FILES
====================
These files are proprietary components of the BACO/Pantheon system.
They are provided for Claude Code functionality only.

DO NOT:
- Copy or distribute these files
- Modify the contents
- Use outside of this environment

© BACO/Pantheon - All rights reserved
EOF
fi

if [ ! -d "/home/coder/projects/examples" ]; then
    echo "📚 Copying example files..."
    cp -r /home/coder/.pantheon-files/examples /home/coder/projects/examples 2>/dev/null || true
fi

if [ ! -f "/home/coder/projects/CLAUDE.md" ]; then
    echo "📄 Copying CLAUDE.md..."
    cp /home/coder/.pantheon-files/CLAUDE.md /home/coder/projects/CLAUDE.md 2>/dev/null || true
fi

# Check Claude CLI installation
echo "🔍 Checking Claude integration..."
if ! command -v claude &> /dev/null; then
    echo "📦 Attempting to install Claude CLI..."
    npm install -g @anthropic-ai/claude-code 2>/dev/null || \
    npm install -g claude-cli 2>/dev/null || \
    npm install -g claude 2>/dev/null || \
    echo "⚠️  Claude CLI not available - use VS Code extension instead"
fi

# Check VS Code extension installation
if ! code-server --list-extensions 2>/dev/null | grep -q "anthropic.claude-code"; then
    echo "🔌 Installing Claude VS Code extension..."
    code-server --install-extension anthropic.claude-code 2>/dev/null || \
    echo "⚠️  Claude extension will need manual installation"
fi

# Create helper command for extension usage
if [ ! -f "/usr/local/bin/claude-extension" ]; then
    cat > /usr/local/bin/claude-extension << 'EOF'
#!/bin/bash
echo "🚀 Claude VS Code Extension Guide"
echo "================================"
echo ""
echo "1. Look for the Claude icon in the VS Code sidebar (left panel)"
echo "2. Click on it to open the Claude panel"
echo "3. Sign in with your Claude account"
echo "4. Use /gods commands directly in the Claude chat"
echo ""
echo "If you don't see the Claude icon:"
echo "  - Press Ctrl+Shift+P and search for 'Claude'"
echo "  - Or reload the window: Ctrl+R"
EOF
    chmod +x /usr/local/bin/claude-extension
fi

# Show welcome message
if [ -f "/home/coder/.pantheon-branding/motd.sh" ]; then
    /home/coder/.pantheon-branding/motd.sh
fi

echo "✅ Pantheon environment ready!"
echo ""

# Start code-server with all arguments passed to this script
exec code-server "$@"