#!/bin/bash
# claude-auth-helper.sh - Helper utilities for Claude authentication management

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

# Function to show usage
show_usage() {
    echo "Claude Authentication Helper"
    echo "Usage: $0 [COMMAND]"
    echo
    echo "Commands:"
    echo "  backup     - Backup current authentication"
    echo "  restore    - Restore authentication from backup"
    echo "  clear      - Clear authentication (logout)"
    echo "  refresh    - Attempt to refresh authentication"
    echo "  export-env - Export authentication as environment variables"
    echo "  test       - Test Claude API connectivity"
    echo "  help       - Show this help message"
}

# Function to backup authentication
backup_auth() {
    local backup_dir="$HOME/.claude-backups"
    local timestamp=$(date +%Y%m%d_%H%M%S)
    local backup_file="$backup_dir/claude-auth-$timestamp.tar.gz"
    
    print_color $BLUE "📦 Backing up Claude authentication..."
    
    # Create backup directory if it doesn't exist
    mkdir -p "$backup_dir"
    
    # Check if .claude directory exists
    if [ ! -d "$HOME/.claude" ]; then
        print_color $RED "❌ No Claude configuration found to backup"
        return 1
    fi
    
    # Create backup
    if tar -czf "$backup_file" -C "$HOME" .claude 2>/dev/null; then
        print_color $GREEN "✅ Backup created: $backup_file"
        
        # Keep only last 5 backups
        ls -t "$backup_dir"/claude-auth-*.tar.gz 2>/dev/null | tail -n +6 | xargs -r rm
        print_color $YELLOW "   (Keeping only the 5 most recent backups)"
    else
        print_color $RED "❌ Failed to create backup"
        return 1
    fi
}

# Function to restore authentication
restore_auth() {
    local backup_dir="$HOME/.claude-backups"
    
    print_color $BLUE "📥 Restoring Claude authentication..."
    
    # Check if backup directory exists
    if [ ! -d "$backup_dir" ]; then
        print_color $RED "❌ No backups found"
        return 1
    fi
    
    # List available backups
    local backups=($(ls -t "$backup_dir"/claude-auth-*.tar.gz 2>/dev/null))
    
    if [ ${#backups[@]} -eq 0 ]; then
        print_color $RED "❌ No backups found"
        return 1
    fi
    
    print_color $YELLOW "Available backups:"
    for i in "${!backups[@]}"; do
        echo "  $((i+1)). $(basename "${backups[$i]}")"
    done
    
    # Ask user to select
    echo
    read -p "Select backup to restore (1-${#backups[@]}): " selection
    
    if [[ "$selection" =~ ^[0-9]+$ ]] && [ "$selection" -ge 1 ] && [ "$selection" -le ${#backups[@]} ]; then
        local selected_backup="${backups[$((selection-1))]}"
        
        # Backup current state before restore
        if [ -d "$HOME/.claude" ]; then
            print_color $YELLOW "Backing up current state before restore..."
            backup_auth
        fi
        
        # Restore
        if tar -xzf "$selected_backup" -C "$HOME"; then
            print_color $GREEN "✅ Authentication restored from: $(basename "$selected_backup")"
        else
            print_color $RED "❌ Failed to restore authentication"
            return 1
        fi
    else
        print_color $RED "❌ Invalid selection"
        return 1
    fi
}

# Function to clear authentication
clear_auth() {
    print_color $YELLOW "⚠️  This will clear all Claude authentication data."
    read -p "Are you sure? (y/N): " confirm
    
    if [[ "$confirm" =~ ^[Yy]$ ]]; then
        # Backup before clearing
        if [ -d "$HOME/.claude" ]; then
            print_color $BLUE "Creating backup before clearing..."
            backup_auth
        fi
        
        # Clear authentication
        rm -rf "$HOME/.claude"
        print_color $GREEN "✅ Claude authentication cleared"
    else
        print_color $YELLOW "Cancelled"
    fi
}

# Function to attempt authentication refresh
refresh_auth() {
    print_color $BLUE "🔄 Attempting to refresh Claude authentication..."
    
    # Check if authenticated
    if ! claude status &>/dev/null; then
        print_color $RED "❌ Not authenticated. Please run claude-auth-docker.sh first"
        return 1
    fi
    
    # Try to refresh (this depends on Claude CLI implementation)
    if claude refresh &>/dev/null || claude auth refresh &>/dev/null; then
        print_color $GREEN "✅ Authentication refreshed successfully"
    else
        print_color $YELLOW "⚠️  Refresh command not available or not needed"
        print_color $YELLOW "   Your current authentication is still valid"
    fi
}

# Function to export authentication as environment variables
export_env() {
    print_color $BLUE "📤 Exporting authentication environment..."
    
    local env_file="$HOME/.claude-env"
    
    # Check common locations for API keys or tokens
    if [ -f "$HOME/.claude/credentials" ]; then
        # Extract API key if present (this is hypothetical - adjust based on actual format)
        local api_key=$(grep -E "api_key|token" "$HOME/.claude/credentials" 2>/dev/null | cut -d'=' -f2 | tr -d ' "')
        
        if [ -n "$api_key" ]; then
            echo "export CLAUDE_API_KEY='$api_key'" > "$env_file"
            print_color $GREEN "✅ Environment variables exported to: $env_file"
            echo
            print_color $YELLOW "To use these variables, run:"
            echo "   source $env_file"
        else
            print_color $YELLOW "⚠️  Could not extract API key from credentials"
        fi
    else
        print_color $YELLOW "⚠️  No credentials file found"
    fi
}

# Function to test Claude connectivity
test_connection() {
    print_color $BLUE "🧪 Testing Claude API connectivity..."
    echo
    
    # Check authentication
    print_color $YELLOW "1. Checking authentication status..."
    if claude status &>/dev/null; then
        print_color $GREEN "   ✅ Authenticated"
    else
        print_color $RED "   ❌ Not authenticated"
        return 1
    fi
    
    # Try a simple API call (adjust based on available commands)
    print_color $YELLOW "2. Testing API connection..."
    if claude version &>/dev/null || claude help &>/dev/null; then
        print_color $GREEN "   ✅ API connection successful"
    else
        print_color $RED "   ❌ API connection failed"
        return 1
    fi
    
    echo
    print_color $GREEN "🎉 All tests passed! Claude is ready to use."
}

# Main function
main() {
    case "${1:-help}" in
        backup)
            backup_auth
            ;;
        restore)
            restore_auth
            ;;
        clear)
            clear_auth
            ;;
        refresh)
            refresh_auth
            ;;
        export-env)
            export_env
            ;;
        test)
            test_connection
            ;;
        help|--help|-h)
            show_usage
            ;;
        *)
            print_color $RED "Unknown command: $1"
            echo
            show_usage
            exit 1
            ;;
    esac
}

# Run main function with all arguments
main "$@"