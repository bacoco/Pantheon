#!/bin/bash
# Pantheon Installation Script for Claude Code
# This script sets up Pantheon for use in Claude Code UI

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Print colored output
print_color() {
    local color=$1
    shift
    echo -e "${color}$@${NC}"
}

# Print banner
print_banner() {
    echo
    print_color $BLUE "╔════════════════════════════════════════════╗"
    print_color $BLUE "║          Pantheon Installation             ║"
    print_color $BLUE "║    Where Gods Build Software Together      ║"
    print_color $BLUE "╚════════════════════════════════════════════╝"
    echo
}

# Check if we're in Claude Code
check_claude_code() {
    if [ -z "$CLAUDE_CODE" ] && [ ! -d ".claude" ]; then
        print_color $YELLOW "⚠️  This script is designed for Claude Code."
        print_color $YELLOW "   Make sure you're running this in Claude Code's terminal."
        echo
    fi
}

# Check prerequisites
check_prerequisites() {
    print_color $BLUE "📋 Checking prerequisites..."
    
    # Check Node.js
    if command -v node &> /dev/null; then
        NODE_VERSION=$(node -v)
        print_color $GREEN "✅ Node.js installed: $NODE_VERSION"
    else
        print_color $RED "❌ Node.js not found. Please install Node.js 18+"
        exit 1
    fi
    
    # Check npm
    if command -v npm &> /dev/null; then
        NPM_VERSION=$(npm -v)
        print_color $GREEN "✅ npm installed: $NPM_VERSION"
    else
        print_color $RED "❌ npm not found. Please install npm"
        exit 1
    fi
    
    # Check git
    if command -v git &> /dev/null; then
        print_color $GREEN "✅ Git installed"
    else
        print_color $RED "❌ Git not found. Please install git"
        exit 1
    fi
    
    echo
}

# Install Pantheon
install_pantheon() {
    print_color $BLUE "🏛️  Installing Pantheon..."
    
    # Check if we're already in Pantheon directory
    if [ -f ".mcp.json" ] && [ -d ".claude" ]; then
        print_color $GREEN "✅ Already in Pantheon directory!"
    else
        # Clone repository
        print_color $YELLOW "📦 Cloning Pantheon repository..."
        git clone https://github.com/bacoco/Pantheon.git
        cd Pantheon
        print_color $GREEN "✅ Repository cloned successfully"
    fi
    
    echo
}

# Verify installation
verify_installation() {
    print_color $BLUE "🔍 Verifying installation..."
    
    # Check critical files
    if [ -f ".mcp.json" ]; then
        print_color $GREEN "✅ MCP configuration found"
    else
        print_color $RED "❌ Missing .mcp.json"
        exit 1
    fi
    
    if [ -f ".claude/settings.json" ]; then
        print_color $GREEN "✅ Claude settings found (auto-approval enabled)"
    else
        print_color $RED "❌ Missing .claude/settings.json"
        exit 1
    fi
    
    if [ -d ".claude/agents" ]; then
        print_color $GREEN "✅ Divine agents ready"
    else
        print_color $RED "❌ Missing agents directory"
        exit 1
    fi
    
    echo
}

# Show next steps
show_next_steps() {
    print_color $GREEN "🎉 Pantheon is ready to use!"
    echo
    print_color $BLUE "📚 Quick Start Commands:"
    echo
    echo "  Start a collaborative planning session:"
    print_color $YELLOW "  /gods council"
    echo
    echo "  Summon specific gods:"
    print_color $YELLOW "  /gods summon zeus       # Orchestration"
    print_color $YELLOW "  /gods summon apollo     # UI/UX Design"
    print_color $YELLOW "  /gods summon daedalus   # Architecture"
    print_color $YELLOW "  /gods summon hephaestus # Implementation"
    echo
    echo "  See all available gods:"
    print_color $YELLOW "  /gods list"
    echo
    echo "  Get help:"
    print_color $YELLOW "  /help"
    echo
    print_color $BLUE "💡 Pro Tips:"
    echo "  • MCP tools download automatically on first use"
    echo "  • All discussions are saved in /chatrooms/"
    echo "  • Use /gods council for comprehensive planning"
    echo
    print_color $GREEN "⚡ Ready to build something divine? Start with: /gods council"
    echo
}

# Main execution
main() {
    print_banner
    check_claude_code
    check_prerequisites
    install_pantheon
    verify_installation
    show_next_steps
}

# Run main function
main