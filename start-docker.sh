#!/bin/bash
# start-docker.sh - Simple startup script for BACO/Pantheon Docker environment
# This script handles all setup and starts the VS Code Server with Claude authentication support

set -e

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Function to print colored output
print_color() {
    local color=$1
    shift
    echo -e "${color}$@${NC}"
}

# Function to print a banner
print_banner() {
    echo
    print_color $CYAN "╔════════════════════════════════════════════╗"
    print_color $CYAN "║      BACO/Pantheon Docker Environment      ║"
    print_color $CYAN "║         VS Code + Claude + BACO            ║"
    print_color $CYAN "╚════════════════════════════════════════════╝"
    echo
}

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check prerequisites
check_prerequisites() {
    print_color $BLUE "🔍 Checking prerequisites..."
    
    local missing=0
    
    # Check Docker
    if command_exists docker; then
        print_color $GREEN "  ✓ Docker is installed"
    else
        print_color $RED "  ✗ Docker is not installed"
        print_color $YELLOW "    Please install Docker from https://docs.docker.com/get-docker/"
        missing=1
    fi
    
    # Check Docker Compose
    if command_exists docker-compose; then
        print_color $GREEN "  ✓ Docker Compose is installed"
    else
        print_color $RED "  ✗ Docker Compose is not installed"
        print_color $YELLOW "    Please install Docker Compose from https://docs.docker.com/compose/install/"
        missing=1
    fi
    
    # Check if Docker daemon is running
    if docker info >/dev/null 2>&1; then
        print_color $GREEN "  ✓ Docker daemon is running"
    else
        print_color $RED "  ✗ Docker daemon is not running"
        print_color $YELLOW "    Please start Docker Desktop or the Docker service"
        missing=1
    fi
    
    if [ $missing -eq 1 ]; then
        echo
        print_color $RED "❌ Prerequisites check failed. Please install missing components."
        exit 1
    fi
    
    print_color $GREEN "✅ All prerequisites met!"
    echo
}

# Function to setup environment file
setup_env_file() {
    print_color $BLUE "🔧 Setting up environment configuration..."
    
    # Debug: Show current directory
    print_color $PURPLE "  Current directory: $(pwd)"
    
    # Debug: Check if docker directory exists
    if [ -d "docker" ]; then
        print_color $GREEN "  ✓ docker/ directory exists"
        # Debug: List files in docker directory
        print_color $PURPLE "  Files in docker/: $(ls -la docker/ | grep -v '^total' | wc -l) files"
    else
        print_color $RED "  ✗ docker/ directory not found!"
        print_color $YELLOW "  Creating docker/ directory..."
        mkdir -p docker
    fi
    
    if [ ! -f "docker/.env" ]; then
        # Test if we can read the .env.example file
        if [ -f "docker/.env.example" ] && [ -r "docker/.env.example" ]; then
            cp docker/.env.example docker/.env
            print_color $YELLOW "  Created docker/.env from template"
            print_color $YELLOW "  ⚠️  Please edit docker/.env and set a secure password!"
            echo
            
            # Prompt for password
            read -p "Enter a password for VS Code Server (or press Enter to use default): " password
            if [ -n "$password" ]; then
                # Use sed to replace the password
                if [[ "$OSTYPE" == "darwin"* ]]; then
                    # macOS
                    sed -i '' "s/VS_CODE_PASSWORD=.*/VS_CODE_PASSWORD=$password/" docker/.env
                else
                    # Linux
                    sed -i "s/VS_CODE_PASSWORD=.*/VS_CODE_PASSWORD=$password/" docker/.env
                fi
                print_color $GREEN "  ✓ Password set"
            else
                print_color $YELLOW "  Using default password (change it later in docker/.env)"
            fi
        else
            print_color $YELLOW "  ⚠️  docker/.env.example not found!"
            print_color $YELLOW "  Creating docker/.env.example..."
            
            # Create the .env.example file
            cat > docker/.env.example << 'EOF'
# Docker Environment Configuration
# Copy this file to .env and update with your values

# VS Code Server Configuration
VS_CODE_PASSWORD=your-secure-password-here

# Claude Authentication (optional)
# If you have a Claude API key, set it here to skip interactive auth
CLAUDE_API_KEY=

# Proxy Configuration (for corporate environments)
# HTTP_PROXY=http://proxy.company.com:8080
# HTTPS_PROXY=http://proxy.company.com:8080
# NO_PROXY=localhost,127.0.0.1,*.company.com

# Development Ports (customize if needed)
# VS_CODE_PORT=8080
# REACT_PORT=3000
# VITE_PORT=5173
# API_PORT=8000

# Resource Limits (adjust based on your system)
# MEMORY_LIMIT=8G
# CPU_LIMIT=4

# Git Configuration (optional)
# GIT_USER_NAME="Your Name"
# GIT_USER_EMAIL="your.email@example.com"
EOF
            
            # Now copy it to .env
            cp docker/.env.example docker/.env
            print_color $GREEN "  ✓ Created docker/.env from default template"
        fi
    else
        print_color $GREEN "  ✓ docker/.env already exists"
    fi
    echo
}

# Function to create projects directory
setup_directories() {
    print_color $BLUE "📁 Setting up directories..."
    
    # Create projects directory if it doesn't exist
    if [ ! -d "projects" ]; then
        mkdir -p projects
        print_color $GREEN "  ✓ Created projects/ directory"
    else
        print_color $GREEN "  ✓ projects/ directory exists"
    fi
    
    echo
}

# Function to build the Docker image
build_image() {
    print_color $BLUE "🔨 Building Docker image..."
    
    # Check for secure mode flag or default to secure
    local compose_file="docker-compose.secure.yml"
    if [ "$1" = "--standard" ]; then
        compose_file="docker-compose.claude.yml"
        print_color $YELLOW "  Using standard mode (visible commands)"
    else
        print_color $GREEN "  Using secure mode (protected commands)"
        print_color $PURPLE "  Commands will be compiled and protected"
    fi
    
    print_color $YELLOW "  This may take a few minutes on first run..."
    echo
    
    cd docker
    if docker-compose -f $compose_file build; then
        cd ..
        print_color $GREEN "✅ Docker image built successfully!"
        # Store which mode we used
        echo $compose_file > .docker-mode
    else
        cd ..
        print_color $RED "❌ Failed to build Docker image"
        exit 1
    fi
    echo
}

# Function to start the container
start_container() {
    print_color $BLUE "🚀 Starting BACO/Pantheon container..."
    
    # Use the same compose file that was used for building
    local compose_file="docker-compose.secure.yml"
    if [ -f ".docker-mode" ]; then
        compose_file=$(cat .docker-mode)
    fi
    
    cd docker
    if docker-compose -f $compose_file up -d; then
        cd ..
        print_color $GREEN "✅ Container started successfully!"
    else
        cd ..
        print_color $RED "❌ Failed to start container"
        exit 1
    fi
    echo
}

# Function to wait for VS Code Server to be ready
wait_for_vscode() {
    print_color $BLUE "⏳ Waiting for VS Code Server to be ready..."
    
    local max_attempts=30
    local attempt=0
    
    while [ $attempt -lt $max_attempts ]; do
        if curl -s -o /dev/null http://localhost:8080; then
            print_color $GREEN "✅ VS Code Server is ready!"
            return 0
        fi
        
        sleep 2
        attempt=$((attempt + 1))
        echo -n "."
    done
    
    echo
    print_color $YELLOW "⚠️  VS Code Server is taking longer than expected to start"
    print_color $YELLOW "  You can check logs with: docker logs pantheon-ide"
    return 1
}

# Function to show next steps
show_next_steps() {
    echo
    print_color $CYAN "🎉 BACO/Pantheon Docker environment is ready!"
    echo
    print_color $GREEN "📡 Access VS Code Server at: http://localhost:8080"
    echo
    print_color $PURPLE "Next steps:"
    echo "1. Open http://localhost:8080 in your browser"
    echo "2. Enter the password you set (check docker/.env if you forgot)"
    echo "3. Open a terminal in VS Code (Ctrl+\` or Cmd+\`)"
    echo "4. Start using BACO with the 'gods' command!"
    echo
    print_color $YELLOW "Useful commands:"
    echo "  make shell     - Open a shell in the container"
    echo "  make logs      - View container logs"
    echo "  make down      - Stop the container"
    echo
    print_color $BLUE "Happy coding! 🚀"
}


# Main function
main() {
    print_banner
    
    # Parse command line arguments
    local build_mode="secure"
    for arg in "$@"; do
        case $arg in
            --standard)
                build_mode="standard"
                shift
                ;;
            --secure)
                build_mode="secure"
                shift
                ;;
            --help)
                echo "Usage: $0 [--secure|--standard]"
                echo "  --secure    Use secure Dockerfile with protected commands (default)"
                echo "  --standard  Use standard Dockerfile with visible commands"
                exit 0
                ;;
        esac
    done
    
    # Check prerequisites
    check_prerequisites
    
    # Setup environment
    setup_env_file
    setup_directories
    
    # Check if container is already running
    if docker ps --format '{{.Names}}' | grep -q '^pantheon-ide'; then
        print_color $YELLOW "⚠️  Container 'pantheon-ide' or 'pantheon-ide-secure' is already running"
        read -p "Would you like to restart it? (y/N): " restart
        
        if [[ "$restart" =~ ^[Yy]$ ]]; then
            print_color $BLUE "Stopping existing container..."
            # Stop both possible containers
            cd docker
            docker-compose -f docker-compose.claude.yml down 2>/dev/null || true
            docker-compose -f docker-compose.secure.yml down 2>/dev/null || true
            cd ..
        else
            wait_for_vscode
            show_next_steps
            exit 0
        fi
    fi
    
    # Build and start
    if [ "$build_mode" = "standard" ]; then
        build_image --standard
    else
        build_image --secure
    fi
    start_container
    wait_for_vscode
    
    # Show next steps
    show_next_steps
}

# Run main function
main "$@"