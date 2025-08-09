#!/bin/bash

# 🏛️ Pantheon Divine Tools Installation Script
# Installs MCP servers to empower the gods with specialized capabilities

echo "⚡ Installing Divine Tools for Pantheon Gods..."
echo "================================================"

# Check for required tools
check_requirements() {
    echo "🔍 Checking requirements..."
    
    if ! command -v python3 &> /dev/null; then
        echo "❌ Python 3 is required but not installed."
        exit 1
    fi
    
    if ! command -v npm &> /dev/null; then
        echo "❌ Node.js/npm is required but not installed."
        exit 1
    fi
    
    if ! command -v pip &> /dev/null; then
        echo "❌ pip is required but not installed."
        exit 1
    fi
    
    echo "✅ All requirements met!"
}

# Install Python-based MCP servers
install_python_servers() {
    echo ""
    echo "📦 Installing Python-based Divine Tools..."
    echo "----------------------------------------"
    
    # Basic Memory - Sacred Scrolls Persistence
    echo "📜 Installing basic-memory (Sacred Scrolls)..."
    pip install basic-memory
    
    # Serena - Code Oracle Analysis
    echo "🔮 Installing serena (Code Oracle)..."
    pip install git+https://github.com/oraios/serena
    
    echo "✅ Python divine tools installed!"
}

# Install Node-based MCP servers
install_node_servers() {
    echo ""
    echo "📦 Installing Node-based Divine Tools..."
    echo "----------------------------------------"
    
    # Task Master - Zeus's Orchestration
    echo "⚡ Installing task-master (Divine Orchestration)..."
    npm install -g task-master-ai
    
    # Sequential Thinking - Strategic Reasoning
    echo "🧠 Installing sequential-thinking (Divine Wisdom)..."
    npm install -g @modelcontextprotocol/server-sequential-thinking
    
    # Shadcn UI - Hephaestus's Forge
    echo "🔨 Installing shadcn-ui (UI Forge)..."
    npm install -g @jpisnice/shadcn-ui-mcp-server
    
    # Filesystem - Divine File Operations
    echo "📁 Installing filesystem server (Sacred Archives)..."
    npm install -g @modelcontextprotocol/server-filesystem
    
    # GitHub - Version Control Smithing
    echo "🔧 Installing github server (Forge Version Control)..."
    npm install -g @modelcontextprotocol/server-github
    
    # YouTube Transcript - Knowledge Extraction
    echo "📺 Installing youtube-transcript (Knowledge Oracle)..."
    npm install -g @modelcontextprotocol/server-youtube-transcript
    
    # Web Search - Hermes's Information Network
    echo "🔍 Installing web-search servers (Divine Search)..."
    npm install -g @modelcontextprotocol/server-exa
    npm install -g @modelcontextprotocol/server-brave-search
    
    echo "✅ Node divine tools installed!"
}

# Verify installations
verify_installations() {
    echo ""
    echo "🔍 Verifying Divine Tool Installations..."
    echo "----------------------------------------"
    
    # Check Python installations
    python3 -c "import basic_memory" 2>/dev/null && echo "✅ basic-memory verified" || echo "⚠️ basic-memory verification failed"
    
    # Check Node installations (basic check for global packages)
    npm list -g task-master-ai 2>/dev/null | grep -q "task-master-ai" && echo "✅ task-master verified" || echo "⚠️ task-master verification failed"
    npm list -g @modelcontextprotocol/server-sequential-thinking 2>/dev/null | grep -q "sequential-thinking" && echo "✅ sequential-thinking verified" || echo "⚠️ sequential-thinking verification failed"
    npm list -g @jpisnice/shadcn-ui-mcp-server 2>/dev/null | grep -q "shadcn-ui" && echo "✅ shadcn-ui verified" || echo "⚠️ shadcn-ui verification failed"
    npm list -g @modelcontextprotocol/server-filesystem 2>/dev/null | grep -q "filesystem" && echo "✅ filesystem verified" || echo "⚠️ filesystem verification failed"
    npm list -g @modelcontextprotocol/server-github 2>/dev/null | grep -q "github" && echo "✅ github verified" || echo "⚠️ github verification failed"
}

# Create environment template if needed
create_env_template() {
    if [ ! -f ".env.mcp" ]; then
        echo ""
        echo "📝 Creating .env.mcp template..."
        cat > .env.mcp << 'EOF'
# MCP Server Environment Variables
# Copy this to .env and fill in your API keys

# GitHub Integration
GITHUB_TOKEN=your_github_personal_access_token

# Web Search (Exa)
EXA_API_KEY=your_exa_api_key

# Brave Search
BRAVE_API_KEY=your_brave_search_api_key

# Additional Configuration
MCP_FILESYSTEM_ROOT=/Users/loic/develop/pantheon-multi-ai
EOF
        echo "✅ Created .env.mcp template - configure your API keys!"
    fi
}

# Main installation flow
main() {
    echo "🏛️ PANTHEON DIVINE TOOLS INSTALLER"
    echo "==================================="
    echo ""
    
    check_requirements
    
    echo ""
    echo "This will install MCP servers to empower the Pantheon gods:"
    echo "- Task orchestration for Zeus"
    echo "- Code analysis for Athena and Oracle"
    echo "- UI forging for Hephaestus"
    echo "- Information gathering for Hermes"
    echo "- And more divine capabilities..."
    echo ""
    read -p "Continue with installation? (y/n) " -n 1 -r
    echo ""
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        install_python_servers
        install_node_servers
        verify_installations
        create_env_template
        
        echo ""
        echo "⚡ ======================================= ⚡"
        echo "   DIVINE TOOLS INSTALLATION COMPLETE!"
        echo "⚡ ======================================= ⚡"
        echo ""
        echo "Next steps:"
        echo "1. Configure API keys in .env.mcp (if using external services)"
        echo "2. Restart Claude Code to load MCP servers"
        echo "3. Summon the gods with their new powers!"
        echo ""
        echo "Example: 'Zeus, orchestrate with your divine tools!'"
    else
        echo "Installation cancelled."
    fi
}

# Run main installation
main