#!/bin/bash
# claude-auth-status.sh - Check Claude authentication status and provide helpful information

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Function to print colored output
print_color() {
    local color=$1
    shift
    echo -e "${color}$@${NC}"
}

# Function to check Claude installation
check_claude_installed() {
    if command -v claude &> /dev/null; then
        return 0
    else
        return 1
    fi
}

# Function to get Claude version
get_claude_version() {
    claude --version 2>/dev/null || echo "Unknown"
}

# Function to check authentication files
check_auth_files() {
    local auth_dir="$HOME/.claude"
    local config_files=()
    
    if [ -d "$auth_dir" ]; then
        # Look for common authentication files
        for file in "$auth_dir"/{config,credentials,auth,token}*; do
            if [ -f "$file" ]; then
                config_files+=("$(basename "$file")")
            fi
        done
    fi
    
    if [ ${#config_files[@]} -gt 0 ]; then
        echo "${config_files[@]}"
    else
        echo "None"
    fi
}

# Function to check environment variables
check_env_vars() {
    local env_vars=""
    
    if [ -n "$CLAUDE_API_KEY" ]; then
        env_vars="CLAUDE_API_KEY (set)"
    fi
    
    if [ -n "$CLAUDE_CONFIG_DIR" ]; then
        if [ -n "$env_vars" ]; then
            env_vars="$env_vars, "
        fi
        env_vars="${env_vars}CLAUDE_CONFIG_DIR=$CLAUDE_CONFIG_DIR"
    fi
    
    if [ -z "$env_vars" ]; then
        echo "None"
    else
        echo "$env_vars"
    fi
}

# Main status check
main() {
    print_color $BLUE "📊 Claude Authentication Status Report"
    print_color $BLUE "===================================="
    echo

    # Check if Claude is installed
    if ! check_claude_installed; then
        print_color $RED "❌ Claude CLI is not installed!"
        echo
        print_color $YELLOW "To install Claude, run:"
        echo "   curl -fsSL https://claude.ai/install.sh | sh"
        exit 1
    fi

    # Claude version
    print_color $PURPLE "Claude Version:"
    echo "   $(get_claude_version)"
    echo

    # Check authentication status
    print_color $PURPLE "Authentication Status:"
    if claude status &>/dev/null; then
        print_color $GREEN "   ✅ Authenticated"
        
        # Try to get more details if available
        if claude whoami &>/dev/null; then
            local user_info=$(claude whoami 2>/dev/null)
            if [ -n "$user_info" ]; then
                echo "   User: $user_info"
            fi
        fi
    else
        print_color $RED "   ❌ Not authenticated"
    fi
    echo

    # Configuration files
    print_color $PURPLE "Configuration Files:"
    echo "   Directory: $HOME/.claude"
    echo "   Files: $(check_auth_files)"
    echo

    # Environment variables
    print_color $PURPLE "Environment Variables:"
    echo "   $(check_env_vars)"
    echo

    # Docker volume check (if in Docker)
    if [ -f /.dockerenv ]; then
        print_color $PURPLE "Docker Environment:"
        echo "   ✓ Running inside Docker container"
        
        # Check if .claude directory is on a volume
        if mount | grep -q "/home/[^/]*/\.claude"; then
            print_color $GREEN "   ✓ Authentication directory is mounted as volume (will persist)"
        else
            print_color $YELLOW "   ⚠️  Authentication directory is not on a volume (won't persist)"
        fi
        echo
    fi

    # Recommendations
    print_color $PURPLE "Recommendations:"
    
    if claude status &>/dev/null; then
        print_color $GREEN "   ✓ You're all set! Claude is authenticated and ready to use."
    else
        echo "   1. Run 'claude-auth-docker.sh' to authenticate"
        echo "   2. Or set CLAUDE_API_KEY environment variable"
        echo "   3. Or run 'claude login' directly"
    fi
    echo

    # Quick commands
    print_color $PURPLE "Quick Commands:"
    echo "   claude status     - Check authentication"
    echo "   claude help       - Show available commands"
    echo "   claude-auth-docker.sh - Run authentication wizard"
}

# Run main function
main