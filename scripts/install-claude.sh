#!/bin/bash
# install-claude.sh - Install Claude Code CLI in Docker container

set -e

echo "📦 Installing Claude Code CLI..."

# Ensure npm is configured for user-specific global installs
export NPM_CONFIG_PREFIX="/home/coder/.npm-global"
export PATH="/home/coder/.npm-global/bin:$PATH"

# Install the official Claude Code CLI from npm
if npm install -g @anthropic-ai/claude-code; then
    echo "✅ Claude Code CLI installed successfully!"
    
    # Check if it needs authentication
    if ! claude status &>/dev/null; then
        echo ""
        echo "🔐 Claude authentication required."
        echo "   Run: claude-auth-docker.sh"
    fi
else
    echo "❌ Failed to install Claude Code CLI"
    echo "   Please check your npm configuration and internet connection"
    exit 1
fi