#!/bin/bash

# Pantheon GOD Ultimate - Clean .claude Installation
# This script sets up everything within the .claude directory structure

echo "🏛️ Pantheon GOD Ultimate - .claude Installation"
echo "=============================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Get the .claude directory path
CLAUDE_DIR="$(pwd)/.claude"

# Check Node.js version
check_node() {
    if ! command -v node &> /dev/null; then
        echo -e "${RED}❌ Node.js is not installed. Please install Node.js 18+ first.${NC}"
        exit 1
    fi
    
    NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        echo -e "${RED}❌ Node.js version 18+ required. Current version: $(node -v)${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✓ Node.js $(node -v) detected${NC}"
}

# Install UI Design Analyzer
install_ui_analyzer() {
    echo -e "\n${YELLOW}Installing UI Design Analyzer...${NC}"
    cd "$CLAUDE_DIR/mcp-servers/ui-design-analyzer"
    
    # Install dependencies
    npm install --silent
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ Failed to install UI Design Analyzer dependencies${NC}"
        exit 1
    fi
    
    # Copy environment template if .env doesn't exist
    if [ ! -f .env ]; then
        cp .env.template .env 2>/dev/null || echo "# Add your API keys here" > .env
        echo -e "${YELLOW}⚠️  Created .env file - Please add your API keys${NC}"
    fi
    
    # Build TypeScript
    npm run build --silent
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ Failed to build UI Design Analyzer${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✓ UI Design Analyzer installed${NC}"
}

# Install Divine Assembly Manager
install_divine_assembly() {
    echo -e "\n${YELLOW}Installing Divine Assembly Manager...${NC}"
    cd "$CLAUDE_DIR/mcp-servers/divine-assembly"
    
    # Install dependencies
    npm install --silent
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ Failed to install Divine Assembly dependencies${NC}"
        exit 1
    fi
    
    # Build TypeScript
    npm run build --silent
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ Failed to build Divine Assembly Manager${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✓ Divine Assembly Manager installed${NC}"
}

# Check for expert agents
check_experts() {
    echo -e "\n${YELLOW}Checking expert agents...${NC}"
    
    EXPERT_COUNT=$(find "$CLAUDE_DIR/experts" -name "*.md" -type f 2>/dev/null | wc -l)
    
    if [ "$EXPERT_COUNT" -eq 0 ]; then
        echo -e "${YELLOW}No expert agents found. Creating local experts...${NC}"
        
        # Create sample expert template
        cat > "$CLAUDE_DIR/experts/sample-expert.md.template" << 'EOF'
---
name: expert-name
description: Expert description
tools: Read, Write, Edit, Bash
---

# Expert Agent Template

This is a template for creating expert agents locally.
Copy this file and customize for your specific needs.
EOF
        echo -e "${GREEN}✓ Created expert template in $CLAUDE_DIR/experts/${NC}"
        echo -e "${BLUE}Create your own experts based on the template${NC}"
    else
        echo -e "${GREEN}✓ Found $EXPERT_COUNT expert agents${NC}"
    fi
}

# Check enhanced gods
check_gods() {
    echo -e "\n${YELLOW}Checking enhanced gods...${NC}"
    
    if [ -f "$CLAUDE_DIR/agents/zeus-ultimate.md" ]; then
        echo -e "${GREEN}✓ Zeus Ultimate installed${NC}"
    else
        echo -e "${YELLOW}⚠️  Zeus Ultimate not found${NC}"
    fi
    
    if [ -f "$CLAUDE_DIR/agents/apollo-enhanced.md" ]; then
        echo -e "${GREEN}✓ Apollo Enhanced installed${NC}"
    else
        echo -e "${YELLOW}⚠️  Apollo Enhanced not found${NC}"
    fi
    
    if [ -f "$CLAUDE_DIR/agents/mimesis.md" ]; then
        echo -e "${GREEN}✓ Mimesis installed${NC}"
    else
        echo -e "${YELLOW}⚠️  Mimesis not found${NC}"
    fi
}

# Display configuration
show_config() {
    echo -e "\n${BLUE}Configuration Summary:${NC}"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo -e "📁 Installation Path: ${GREEN}$CLAUDE_DIR${NC}"
    echo -e "🛠️  UI Design Analyzer: ${GREEN}$CLAUDE_DIR/mcp-servers/ui-design-analyzer${NC}"
    echo -e "👥 Divine Assembly: ${GREEN}$CLAUDE_DIR/mcp-servers/divine-assembly${NC}"
    echo -e "🎓 Expert Agents: ${GREEN}$CLAUDE_DIR/experts${NC}"
    echo -e "⚡ Enhanced Gods: ${GREEN}$CLAUDE_DIR/agents${NC}"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
}

# Main installation flow
main() {
    echo "Starting clean .claude installation..."
    
    # Check we're in the right directory
    if [ ! -d ".claude" ]; then
        echo -e "${RED}❌ No .claude directory found. Please run from project root.${NC}"
        exit 1
    fi
    
    # Check prerequisites
    check_node
    
    # Install MCP servers
    install_ui_analyzer
    install_divine_assembly
    
    # Check components
    check_experts
    check_gods
    
    # Show configuration
    show_config
    
    echo -e "\n${GREEN}🎉 Installation Complete!${NC}"
    echo -e "\n${YELLOW}Next Steps:${NC}"
    echo "1. Add your API keys to .claude/mcp-servers/ui-design-analyzer/.env"
    echo "   - Firecrawl: https://firecrawl.dev"
    echo "   - OpenAI (optional): https://platform.openai.com"
    echo "   - Anthropic (optional): https://console.anthropic.com"
    echo ""
    echo "2. Restart Claude Code to load the new MCP servers"
    echo ""
    echo "3. Test the system:"
    echo '   Task("zeus-ultimate", "List available experts")'
    echo '   Task("apollo-enhanced", "Analyze stripe.com design")'
    echo ""
    echo -e "${GREEN}⚡ Divine power awaits!${NC}"
}

# Run main installation
main