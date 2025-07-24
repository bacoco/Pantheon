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

# Show welcome message
if [ -f "/home/coder/.pantheon-branding/motd.sh" ]; then
    /home/coder/.pantheon-branding/motd.sh
fi

echo "✅ Pantheon environment ready!"
echo ""

# Start code-server with all arguments passed to this script
exec code-server "$@"