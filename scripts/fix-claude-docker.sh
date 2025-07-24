#!/bin/bash
# fix-claude-docker.sh - Fix Claude integration issues in Docker

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_color() {
    local color=$1
    shift
    echo -e "${color}$@${NC}"
}

print_color $BLUE "🔧 Claude Docker Fix Script"
print_color $BLUE "=========================="
echo

# Check if running inside Docker
if [ ! -f /.dockerenv ]; then
    print_color $YELLOW "⚠️  This script should be run inside the Docker container"
    print_color $YELLOW "   Run: docker exec -it pantheon-ide /usr/local/bin/fix-claude-docker.sh"
    exit 1
fi

# Fix 1: Install missing Xvfb packages
print_color $BLUE "1. Checking Xvfb installation..."
if ! command -v Xvfb &> /dev/null; then
    print_color $YELLOW "Installing Xvfb and dependencies..."
    sudo apt-get update
    sudo apt-get install -y xvfb x11vnc xfonts-base xfonts-100dpi xfonts-75dpi xfonts-cyrillic
    print_color $GREEN "✅ Xvfb installed successfully"
else
    print_color $GREEN "✅ Xvfb is already installed"
fi

# Fix 2: Try to install Claude CLI
print_color $BLUE "2. Checking Claude CLI..."
if ! command -v claude &> /dev/null; then
    print_color $YELLOW "Attempting to install Claude CLI..."
    
    # Try multiple methods
    npm install -g @anthropic-ai/claude-code 2>/dev/null && print_color $GREEN "✅ Claude CLI installed via @anthropic-ai/claude-code" || \
    npm install -g claude-cli 2>/dev/null && print_color $GREEN "✅ Claude CLI installed via claude-cli" || \
    npm install -g claude 2>/dev/null && print_color $GREEN "✅ Claude CLI installed via claude" || \
    print_color $YELLOW "⚠️  Could not install Claude CLI via npm"
else
    print_color $GREEN "✅ Claude CLI is already installed"
fi

# Fix 3: Check VS Code extension
print_color $BLUE "3. Checking Claude VS Code extension..."
if code-server --list-extensions | grep -q "anthropic.claude-code"; then
    print_color $GREEN "✅ Claude Code extension is installed"
else
    print_color $YELLOW "Installing Claude Code extension..."
    code-server --install-extension anthropic.claude-code && \
    print_color $GREEN "✅ Claude Code extension installed" || \
    print_color $RED "❌ Failed to install Claude Code extension"
fi

# Fix 4: Create helper command for extension-only mode
print_color $BLUE "4. Creating extension helper..."
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
echo "Example commands to try:"
echo "  /gods init"
echo "  /gods plan 'Build a REST API'"
echo "  /gods execute"
echo ""
echo "If you don't see the Claude icon:"
echo "  - Press Ctrl+Shift+P (or Cmd+Shift+P on Mac)"
echo "  - Type 'Claude' to see available commands"
echo "  - Or reload the window: Ctrl+R (or Cmd+R on Mac)"
EOF
chmod +x /usr/local/bin/claude-extension

# Summary
echo
print_color $BLUE "Summary of fixes applied:"
echo "========================"

# Check final status
if command -v Xvfb &> /dev/null; then
    echo "✅ Xvfb: Installed"
else
    echo "❌ Xvfb: Not installed"
fi

if command -v claude &> /dev/null; then
    echo "✅ Claude CLI: Installed ($(which claude))"
else
    echo "⚠️  Claude CLI: Not available - use VS Code extension instead"
fi

if code-server --list-extensions | grep -q "anthropic.claude-code"; then
    echo "✅ Claude Extension: Installed"
else
    echo "❌ Claude Extension: Not installed"
fi

echo
print_color $GREEN "Next steps:"
echo "==========="
echo "1. If Claude CLI is installed: Run 'claude-auth-docker.sh' to authenticate"
echo "2. If using extension only: Run 'claude-extension' for guidance"
echo "3. Reload VS Code window if needed: Ctrl+R (or Cmd+R on Mac)"
echo
print_color $BLUE "Happy coding with Pantheon! ⚡"