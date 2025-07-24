#!/bin/bash
# Secure Docker entrypoint for BACO/Pantheon

echo "🚀 Initializing secure Pantheon environment..."

# Create .claude directory with restricted permissions
if [ ! -d "/home/coder/projects/.claude" ]; then
    echo "📁 Setting up secure Pantheon files..."
    
    # Copy files from protected location
    cp -r /home/coder/.pantheon-files/.claude /home/coder/projects/.claude 2>/dev/null || true
    
    # Make files read-only and hide them
    chmod -R 444 /home/coder/projects/.claude
    
    # Hide the directory from casual browsing (still accessible to Claude)
    # Add .hidden file for file managers that respect it
    echo ".claude" > /home/coder/projects/.hidden
    
    # Create a notice file
    cat > /home/coder/projects/.claude/NOTICE.txt << 'EOF'
PANTHEON SYSTEM FILES
=====================
These files are part of the Pantheon system and should not be modified or distributed.
They are made available for Claude Code functionality only.

© BACO/Pantheon - Proprietary system files
EOF
fi

# Set up additional security measures
# Make a backup with restricted access
if [ ! -d "/home/coder/.pantheon-backup" ]; then
    cp -r /home/coder/.pantheon-files/.claude /home/coder/.pantheon-backup
    chmod -R 400 /home/coder/.pantheon-backup
fi

# Copy other needed files
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

# Start Pantheon secure server in background
if [ -f "/opt/pantheon/pantheon.pyc" ]; then
    echo "🔒 Starting secure Pantheon command server..."
    python3 /opt/pantheon/pantheon.pyc server &
    PANTHEON_PID=$!
    echo "  Server PID: $PANTHEON_PID"
fi

echo "✅ Secure Pantheon environment ready!"
echo ""

# Trap to ensure Pantheon server stops when container stops
trap "kill $PANTHEON_PID 2>/dev/null" EXIT

# Start code-server
exec code-server "$@"