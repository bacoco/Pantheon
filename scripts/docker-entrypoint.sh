#!/bin/bash
# Docker entrypoint script for BACO/Pantheon
# This ensures Pantheon files are available in the mounted projects directory

echo "🚀 Initializing Pantheon environment..."

# Copy Pantheon files to projects directory if they don't exist
if [ ! -d "/home/coder/projects/.claude" ]; then
    echo "📁 Setting up Pantheon command files..."
    cp -r /home/coder/.pantheon-files/.claude /home/coder/projects/.claude 2>/dev/null || true
fi

if [ ! -d "/home/coder/projects/examples" ]; then
    echo "📚 Copying example files..."
    cp -r /home/coder/.pantheon-files/examples /home/coder/projects/examples 2>/dev/null || true
fi

if [ ! -f "/home/coder/projects/CLAUDE.md" ]; then
    echo "📄 Copying CLAUDE.md..."
    cp /home/coder/.pantheon-files/CLAUDE.md /home/coder/projects/CLAUDE.md 2>/dev/null || true
fi

# Show welcome message
if [ -f "/home/coder/.pantheon-branding/motd.sh" ]; then
    /home/coder/.pantheon-branding/motd.sh
fi

echo "✅ Pantheon environment ready!"
echo ""

# Start code-server with all arguments passed to this script
exec code-server "$@"