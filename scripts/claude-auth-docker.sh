#!/bin/bash
# claude-auth-docker.sh - Intelligent Claude authentication for Docker environments
# This script handles multiple authentication methods for the Claude CLI in headless environments

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

# Function to check if Claude is already authenticated
check_auth_status() {
    if claude status &>/dev/null; then
        return 0
    else
        return 1
    fi
}

# Function to clean up background processes
cleanup() {
    if [ -n "$XVFB_PID" ]; then
        kill $XVFB_PID 2>/dev/null || true
    fi
    if [ -n "$CLAUDE_PID" ]; then
        kill $CLAUDE_PID 2>/dev/null || true
    fi
    rm -f /tmp/claude-auth.log
}

# Set up trap to ensure cleanup on exit
trap cleanup EXIT

# Main authentication flow
main() {
    print_color $BLUE "🔐 Claude Docker Authentication Script"
    print_color $BLUE "====================================="
    echo

    # Check if already authenticated
    if check_auth_status; then
        print_color $GREEN "✅ Claude is already authenticated!"
        print_color $GREEN "   You can start using Claude commands."
        exit 0
    fi

    print_color $YELLOW "⚠️  Claude authentication required..."
    echo

    # Method 1: Check for API key in environment
    if [ -n "$CLAUDE_API_KEY" ]; then
        print_color $BLUE "🔑 Found API key in environment variable..."
        
        # Try to authenticate with API key
        if claude login --api-key "$CLAUDE_API_KEY" 2>/dev/null; then
            print_color $GREEN "✅ Successfully authenticated with API key!"
            exit 0
        else
            print_color $YELLOW "⚠️  API key authentication not supported or failed."
        fi
    fi

    # Method 2: Try device code flow (most user-friendly for Docker)
    print_color $BLUE "📱 Attempting device code authentication..."
    
    # Check if claude supports --no-browser or --device flag
    if claude login --help 2>/dev/null | grep -qE "(no-browser|device|headless)"; then
        print_color $GREEN "✓ Device code authentication is supported!"
        echo
        
        # Try different variations of the command
        for flag in "--no-browser" "--device" "--headless"; do
            if claude login $flag 2>&1 | tee /tmp/claude-auth.log; then
                if check_auth_status; then
                    print_color $GREEN "✅ Successfully authenticated!"
                    exit 0
                fi
            fi
        done
    fi

    # Method 3: Headless browser authentication
    print_color $BLUE "🌐 Falling back to headless browser authentication..."
    echo
    
    # Check if Xvfb is installed
    if ! command -v Xvfb &> /dev/null; then
        print_color $RED "❌ Error: Xvfb is not installed. Cannot proceed with headless authentication."
        print_color $YELLOW "   Please ensure the Docker image includes Xvfb package."
        exit 1
    fi

    # Start Xvfb (virtual display)
    print_color $YELLOW "Starting virtual display..."
    export DISPLAY=:99
    Xvfb :99 -screen 0 1024x768x16 &
    XVFB_PID=$!
    sleep 2

    # Run claude login and capture output
    print_color $YELLOW "Launching Claude authentication..."
    echo
    
    # Start claude login in background and capture output
    (claude login 2>&1 | tee /tmp/claude-auth.log) &
    CLAUDE_PID=$!
    
    # Wait a moment for the process to start
    sleep 3
    
    # Try to extract URL from the output
    AUTH_URL=""
    for i in {1..10}; do
        if [ -f /tmp/claude-auth.log ]; then
            AUTH_URL=$(grep -Eo 'https://[^ ]+' /tmp/claude-auth.log | head -1)
            if [ -n "$AUTH_URL" ]; then
                break
            fi
        fi
        sleep 1
    done
    
    if [ -n "$AUTH_URL" ]; then
        print_color $GREEN "🔗 Authentication URL detected!"
        echo
        print_color $YELLOW "Please complete authentication by following these steps:"
        echo
        echo "1. Open this URL in your browser:"
        print_color $BLUE "   $AUTH_URL"
        echo
        echo "2. Log in with your Claude account"
        echo "3. Complete the authentication flow"
        echo "4. Press Enter here when done..."
        echo
        read -r
        
        # Check if authentication was successful
        if check_auth_status; then
            print_color $GREEN "✅ Authentication successful!"
            print_color $GREEN "   Your authentication has been saved and will persist across container restarts."
        else
            print_color $RED "❌ Authentication failed or not completed."
            print_color $YELLOW "   Please try running this script again."
            exit 1
        fi
    else
        print_color $RED "❌ Could not detect authentication URL."
        print_color $YELLOW "   Please check if the Claude CLI is properly installed."
        echo
        print_color $YELLOW "Manual authentication steps:"
        echo "1. In a terminal, run: claude login"
        echo "2. Copy the URL that appears"
        echo "3. Open it in your browser"
        echo "4. Complete the authentication"
        exit 1
    fi
}

# Run main function
main