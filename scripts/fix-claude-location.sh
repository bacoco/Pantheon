#!/bin/bash
# Fix .claude directory location if it's in the wrong place

echo "🔍 Checking .claude directory location..."

# If .claude exists in /home/coder but not in /home/coder/projects
if [ -d "/home/coder/.claude" ] && [ ! -d "/home/coder/projects/.claude" ]; then
    echo "📁 Moving .claude to correct location..."
    mv /home/coder/.claude /home/coder/projects/
    echo "✅ Moved .claude to /home/coder/projects/"
elif [ -d "/home/coder/projects/.claude" ]; then
    echo "✅ .claude is already in the correct location"
    # Remove any duplicate in the wrong location
    if [ -d "/home/coder/.claude" ]; then
        rm -rf /home/coder/.claude
        echo "🗑️  Removed duplicate .claude from /home/coder"
    fi
else
    echo "❌ .claude directory not found in expected locations"
fi

# Report final status
if [ -d "/home/coder/projects/.claude" ]; then
    file_count=$(find /home/coder/projects/.claude -name "*.md" -type f 2>/dev/null | wc -l)
    echo "📊 .claude directory contains $file_count .md files"
fi