#!/bin/bash
# Test script to verify Docker setup

echo "🔍 Testing BACO/Pantheon Docker Setup..."
echo ""

# Test 1: Check if container is running
echo "1. Checking if container is running..."
if docker ps | grep -q pantheon-ide; then
    echo "   ✅ Container is running"
else
    echo "   ❌ Container is not running"
    exit 1
fi

# Test 2: Check .claude directory in container
echo ""
echo "2. Checking .claude directory in container..."
FILE_COUNT=$(docker exec pantheon-ide find /home/coder/projects/.claude -name "*.md" -type f 2>/dev/null | wc -l)
if [ "$FILE_COUNT" -gt 0 ]; then
    echo "   ✅ Found $FILE_COUNT .md files in .claude directory"
    echo "   📝 Sample commands:"
    docker exec pantheon-ide find /home/coder/projects/.claude/commands -name "*.md" -type f | head -5 | xargs -I {} basename {} .md | sed 's/^/      - /'
else
    echo "   ❌ No .md files found in .claude directory"
fi

# Test 3: Check gods command
echo ""
echo "3. Testing gods command..."
if docker exec pantheon-ide gods help &>/dev/null; then
    echo "   ✅ gods command is working"
else
    echo "   ❌ gods command failed"
fi

# Test 4: Check Claude Code CLI
echo ""
echo "4. Checking Claude Code CLI..."
if docker exec pantheon-ide which claude &>/dev/null; then
    echo "   ✅ Claude Code CLI is installed"
    CLAUDE_PATH=$(docker exec pantheon-ide which claude)
    echo "      Path: $CLAUDE_PATH"
else
    echo "   ⚠️  Claude Code CLI not found (will be installed on first use)"
fi

# Test 5: Check VS Code access
echo ""
echo "5. Testing VS Code Server access..."
if curl -s -o /dev/null -w "%{http_code}" http://localhost:8080 | grep -q "200\|302"; then
    echo "   ✅ VS Code Server is accessible at http://localhost:8080"
else
    echo "   ❌ VS Code Server is not accessible"
fi

echo ""
echo "🏁 Test complete!"