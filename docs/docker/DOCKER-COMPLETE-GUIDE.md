# 🚀 Complete Docker Guide: BACO/Pantheon Development Environment

This comprehensive guide covers everything you need to know about using BACO/Pantheon in a Docker environment with VS Code Server and Claude integration.

## Table of Contents

1. [Quick Start](#quick-start)
2. [Prerequisites](#prerequisites)
3. [Installation & Setup](#installation--setup)
4. [Accessing Your Environment](#accessing-your-environment)
5. [Claude Integration](#claude-integration)
   - [Claude Code Extension](#claude-code-extension)
   - [Claude CLI](#claude-cli)
   - [Authentication](#authentication)
6. [Using Pantheon](#using-pantheon)
7. [Container Management](#container-management)
8. [File Structure](#file-structure)
9. [Command Reference](#command-reference)
10. [Troubleshooting](#troubleshooting)
11. [Advanced Configuration](#advanced-configuration)
12. [Security Best Practices](#security-best-practices)
13. [CI/CD Integration](#cicd-integration)

## Quick Start

Get up and running with BACO/Pantheon in VS Code Server with Claude authentication in just 2 minutes!

```bash
# Clone the repository
git clone https://github.com/your-repo/baco.git
cd baco

# Make scripts executable
chmod +x start-docker.sh

# Run the one-command setup
./start-docker.sh
```

That's it! The script will:
- ✅ Check prerequisites
- ✅ Set up environment configuration
- ✅ Build the Docker image
- ✅ Start VS Code Server
- ✅ Guide you through Claude authentication

## Prerequisites

- **Docker Desktop** installed and running
- **Git** (to clone the repository)
- **A web browser**
- **Internet connection** (for Claude authentication)

## Installation & Setup

### Option 1: One-Command Setup (Recommended)

```bash
# Clone and enter the repository
git clone https://github.com/your-repo/baco.git
cd baco

# Make the startup script executable
chmod +x start-docker.sh

# Run the setup
./start-docker.sh
```

### Option 2: Using Make Commands

If you prefer using Make:

```bash
# Complete setup with authentication
make setup

# Or step by step:
make build    # Build Docker image
make up       # Start container
make auth     # Authenticate Claude
```

### Option 3: Manual Setup

```bash
# Copy and configure environment file
cp docker/.env.example docker/.env
# Edit docker/.env and set VS_CODE_PASSWORD

# Start the container
cd docker
docker-compose -f docker-compose.claude.yml up -d
```

## Accessing Your Environment

### 1. Open VS Code Server
- Navigate to: **http://localhost:8080**
- Enter the password you set during setup

### 2. Verify Installation
- Look for the Claude icon in the activity bar (left sidebar)
- Open a terminal (`` Ctrl+` ``)
- Check available commands: `gods --help`

### 3. Terminal vs README on Startup
By default, VS Code opens with the README visible. To open with terminal instead, see [Terminal Startup Configuration](README-TERMINAL-STARTUP.md).

## Claude Integration

Your Docker environment includes Claude integration through:

### Claude Code Extension (Primary Method)

#### Features
- **Interactive Chat** - Chat with Claude in a sidebar panel
- **Code Generation** - Generate code directly in your editor
- **Code Explanation** - Get explanations for selected code
- **Inline Suggestions** - Get AI-powered code completions
- **Refactoring** - Improve and refactor existing code

#### How to Use
1. Click the **Claude icon** in the Activity Bar (left sidebar)
2. Sign in when prompted (uses browser-based OAuth)
3. Start chatting or select code and right-click for Claude options

#### Extension Commands
- `Cmd/Ctrl + Shift + P` → Type "Claude" to see all commands
- Right-click on code → See Claude options in context menu

### Claude CLI (Optional - May Require Setup)

**Note**: Claude CLI availability varies. If not pre-installed, you can:
1. Run `fix-claude-docker.sh` to attempt installation
2. Use the VS Code extension as the primary method

#### If CLI is Available:
```bash
# Authenticate
claude-auth-docker.sh

# Use Claude
claude chat "Help me build a REST API"
```

### Authentication

#### Claude Code Extension
- Uses browser-based OAuth
- Click the Claude icon and sign in
- Works immediately after sign-in

#### Claude CLI (If Available)
- Run `claude-auth-docker.sh`
- Follow the prompts
- If issues occur, run `fix-claude-docker.sh`

#### Authentication Methods

##### Method 1: API Key (Recommended for Automation)

```bash
# Set before starting container
export CLAUDE_API_KEY="your-api-key-here"
docker-compose -f docker-compose.claude.yml up -d

# Or add to .env file
CLAUDE_API_KEY=your-api-key-here

# Or set inside container
export CLAUDE_API_KEY="your-api-key-here"
claude-auth-docker.sh
```

##### Method 2: Device Code Flow (Recommended for Interactive Use)

1. Run: `claude-auth-docker.sh`
2. Visit the provided URL and enter the code
3. The script will detect successful authentication

##### Method 3: Headless Browser (Fallback)

The script automatically uses a virtual display if needed.

#### Verify Authentication

```bash
# Check CLI authentication status
claude-auth-status.sh

# Test API connectivity
claude-auth-helper.sh test
```

## Using Pantheon

### Command Syntax Differences

| Environment | Command Syntax | Example |
|------------|----------------|---------|
| **Claude Code** (claude.ai/code) | `/gods init` (with slash) | `/gods plan "create a web app"` |
| **Docker Terminal** | `gods init` (no slash) | `gods plan "create a web app"` |

### Why the Difference?
- **Claude Code**: Uses special slash commands built into Claude Code
- **Docker Terminal**: Uses bash wrapper that calls `claude chat "/gods init"`

Both provide the same Pantheon experience!

### Basic Pantheon Commands

```bash
# Initialize a new project
gods init

# Generate a plan
gods plan "your idea"

# Execute the plan
gods execute

# Show help
gods --help
```

### Example Workflow

1. **Create a new project**: `gods init`
2. **Generate a plan**: `gods plan "build a task management API"`
3. **Execute the plan**: `gods execute`

## Container Management

### Using Make Commands

```bash
make up       # Start container
make down     # Stop container
make restart  # Restart container
make logs     # View logs
make shell    # Open shell in container
make status   # Check container status
```

### Using Docker Commands

```bash
# Start container
docker-compose -f docker-compose.claude.yml up -d

# Stop container
docker-compose -f docker-compose.claude.yml down

# View logs
docker logs pantheon-ide

# Open shell
docker exec -it pantheon-ide bash
```

### Authentication Management

```bash
make auth     # Run authentication wizard
make status   # Check auth status
make backup   # Backup credentials
```

## File Structure

```
baco/
├── start-docker.sh         # 🚀 Main startup script
├── Makefile               # Make commands
├── docker/
│   ├── Dockerfile.claude
│   ├── docker-compose.claude.yml
│   └── .env               # Your configuration
├── scripts/
│   ├── claude-auth-docker.sh    # Authentication wizard
│   ├── claude-auth-status.sh    # Check auth status
│   └── claude-auth-helper.sh    # Auth utilities
└── projects/              # Your code goes here
```

## Command Reference

### Container Commands

| Command | Description |
|---------|-------------|
| `make up` | Start container |
| `make down` | Stop container |
| `make restart` | Restart container |
| `make logs` | View container logs |
| `make shell` | Open bash shell in container |
| `make status` | Check container and auth status |

### Authentication Commands

| Command | Description |
|---------|-------------|
| `make auth` | Run authentication wizard |
| `claude-auth-docker.sh` | Interactive authentication |
| `claude-auth-status.sh` | Check authentication status |
| `claude-auth-helper.sh backup` | Backup credentials |
| `claude-auth-helper.sh restore` | Restore credentials |
| `claude-auth-helper.sh clear` | Clear authentication |

### Claude CLI Commands

| Command | Description |
|---------|-------------|
| `claude help` | Show all commands |
| `claude chat` | Start interactive chat |
| `claude chat "prompt"` | Send a single prompt |
| `claude analyze <file>` | Analyze code file |
| `claude generate "prompt"` | Generate code |
| `claude status` | Check Claude status |

### Pantheon Commands

| Command | Description |
|---------|-------------|
| `gods init` | Initialize new project |
| `gods init --template` | Create a basic template for manual editing |
| `gods validate` | Validate your pantheon.md file |
| `gods plan "idea"` | Generate project plan |
| `gods execute` | Execute the plan |
| `gods --help` | Show Pantheon help |

### Core Analysis Commands

| Command | Description |
|---------|-------------|
| `/analyze <task>` | Perform multi-dimensional complexity analysis |
| `/orchestrate <task>` | Coordinate specialist agents for insights |
| `/generate-prp <task>` | Generate implementation guide (PRP) |
| `/execute-prp <file>` | Execute a Product Requirements Prompt |
| `/help` | Show available commands |

### Multi-Agent Workflow Commands

| Command | Description |
|---------|-------------|
| `/workflow product-planning` | PM → PO → SM workflow |
| `/workflow implementation` | Architect → Developer → QA workflow |
| `/workflow ui-feature` | UX → Developer → QA workflow |
| `/workflow security-first` | Aegis → Developer workflow |
| `/workflow list` | View available workflows |
| `/workflow custom` | Create custom workflow |

### Agent & Team Commands

| Command | Description |
|---------|-------------|
| `/agent [name]` | Transform into specialist agent directly |
| `/team [name]` | Activate pre-configured agent teams |

### Git Integration Commands

| Command | Description |
|---------|-------------|
| `/git init` | Initialize repository |
| `/git commit <message>` | Commit changes |
| `/git branch <name>` | Create/switch branch |
| `/git pr` | Create pull request |
| `/git status` | Check git status |

### Live Preview Commands

| Command | Description |
|---------|-------------|
| `/preview` | Auto-detect and start development server |
| `/preview --port 3000` | Specify custom port |
| `/preview --mobile` | Show QR code for mobile testing |
| `/preview stop` | Stop preview server |

### Incremental Update Commands

| Command | Description |
|---------|-------------|
| `/add-feature auth-jwt` | Add JWT authentication |
| `/add-feature api-graphql` | Add GraphQL endpoint |
| `/add-feature ui-dashboard` | Add admin dashboard |
| `/add-feature test-e2e` | Add E2E testing |
| `/update-deps` | Interactive dependency update process |
| `/update-deps check` | Check for updates only |
| `/update-deps security` | Security updates only |
| `/update-deps [package]` | Update specific package |

## Troubleshooting

### Claude Integration Issues

#### Extension Not Visible
1. Press `Ctrl+Shift+P` and search for "Claude"
2. Reload window: `Ctrl+R`
3. Check extensions: `code-server --list-extensions`
4. Manually install: `code-server --install-extension anthropic.claude-code`

#### CLI Not Working
1. Run `fix-claude-docker.sh` to fix common issues
2. Check if installed: `which claude`
3. Try manual install: `npm install -g @anthropic-ai/claude-code`
4. Use extension instead: Click Claude icon in sidebar

#### Authentication Failed
1. For extension: Sign out and sign in again
2. For CLI: Run `claude-auth-docker.sh`
3. If Xvfb error: Run `fix-claude-docker.sh` first

### Common Issues

#### Can't Access VS Code?

```bash
# Check if container is running
docker ps

# View logs
make logs

# Restart container
make restart
```

#### Authentication Failed

```bash
# Check status
make status

# Clear and retry
claude-auth-helper.sh clear
claude-auth-docker.sh

# Try manual auth
docker exec -it pantheon-ide claude-auth-docker.sh
```

#### Extension Not Working?

1. Check if extension is installed: Extensions panel → Search "Claude"
2. Click Claude icon and ensure you're signed in
3. Try reloading VS Code: `Cmd/Ctrl + R`

#### CLI Not Working?

1. Check authentication: `claude-auth-status.sh`
2. Re-authenticate: `claude-auth-docker.sh`
3. Verify installation: `which claude`

### Debug Mode

Run authentication with debug output:
```bash
bash -x claude-auth-docker.sh
```

### Check Logs

```bash
# Inside container
cat /tmp/claude-auth.log

# From host
docker exec pantheon-ide cat /tmp/claude-auth.log
```

## Advanced Configuration

### Authentication Helper Commands

```bash
# Backup current authentication
claude-auth-helper.sh backup

# List available backups
ls ~/.claude-backups/

# Restore from backup
claude-auth-helper.sh restore

# Test API connectivity
claude-auth-helper.sh test

# Export credentials as environment variables
claude-auth-helper.sh export-env

# Clear all authentication
claude-auth-helper.sh clear
```

### Custom Terminal Profiles

VS Code includes pre-configured terminal profiles:
1. Click the dropdown (˅) next to + in terminal
2. Select:
   - **claude-auth**: Opens authentication wizard
   - **claude-status**: Shows authentication status

### Proxy Configuration

For corporate environments:

```env
# In docker/.env
HTTP_PROXY=http://proxy.company.com:8080
HTTPS_PROXY=http://proxy.company.com:8080
NO_PROXY=localhost,127.0.0.1
```

### Multiple User Support

```yaml
# docker-compose.override.yml
services:
  pantheon-ide:
    volumes:
      - ${USER}-claude-auth:/home/coder/.claude
```

### Environment Variables Reference

| Variable | Description | Default |
|----------|-------------|---------|
| `CLAUDE_API_KEY` | Claude API key | None |
| `CLAUDE_CONFIG_DIR` | Claude config directory | `/home/coder/.claude` |
| `VS_CODE_PASSWORD` | VS Code Server password | `pantheon` |
| `HTTP_PROXY` | HTTP proxy server | None |
| `HTTPS_PROXY` | HTTPS proxy server | None |

## Security Best Practices

### 1. Protect Your Credentials
- **Never commit** `.env` files or API keys
- Use **Docker secrets** for production
- Set proper file permissions:
  ```bash
  chmod 600 ~/.claude/credentials
  ```

### 2. Use Secure Passwords
- Set a strong VS Code password
- Don't use default passwords
- Consider using a password manager

### 3. Network Security
- Use HTTPS reverse proxy for production
- Limit port exposure
- Use firewall rules

### 4. Regular Backups
```bash
# Backup authentication
claude-auth-helper.sh backup

# Backup Docker volumes
docker run --rm -v pantheon-claude-auth:/data -v $(pwd):/backup alpine tar czf /backup/claude-auth-backup.tar.gz -C /data .
```

### 5. Audit Access
- Review authentication logs
- Monitor container access
- Use Docker's security scanning

## CI/CD Integration

### GitHub Actions

```yaml
name: CI with Claude

on: [push]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v2
    
    - name: Start BACO Environment
      env:
        CLAUDE_API_KEY: ${{ secrets.CLAUDE_API_KEY }}
      run: |
        cd docker
        docker-compose -f docker-compose.claude.yml up -d
        
    - name: Wait for services
      run: |
        docker exec pantheon-ide claude-auth-status.sh
        
    - name: Run tests
      run: |
        docker exec pantheon-ide gods test
```

### GitLab CI

```yaml
stages:
  - test

test:
  stage: test
  services:
    - docker:dind
  variables:
    CLAUDE_API_KEY: $CLAUDE_API_KEY
  script:
    - cd docker
    - docker-compose -f docker-compose.claude.yml up -d
    - docker exec pantheon-ide claude-auth-status.sh
    - docker exec pantheon-ide gods test
```

## Best Practices

### When to Use Which Tool?

#### Use Claude Code Extension When:
- Writing code interactively
- Need visual feedback
- Want to see suggestions inline
- Refactoring existing code
- Learning and exploring

#### Use Claude CLI When:
- Automating tasks
- Processing multiple files
- Writing scripts
- CI/CD pipelines
- Quick terminal queries

### Workflow Recommendations

1. **Start with the Extension** for most development tasks
2. **Use CLI for Automation** when you need to script Claude interactions
3. **Keep Both Authenticated** for maximum flexibility
4. **Combine Both** for complex workflows:

```bash
# 1. Use extension to prototype a function
# 2. Save to utils.py
# 3. Use CLI to create tests
claude generate "Create pytest tests for utils.py" > test_utils.py
# 4. Use extension to refine the tests
# 5. Use CLI to document
claude analyze utils.py --add-docstrings > utils_documented.py
```

## Next Steps

1. **Explore Pantheon**: Try `gods init` to start a new project
2. **Learn Claude Commands**: Use `claude help` to see all options
3. **Read Documentation**: Check `/docs` for detailed guides
4. **Join Community**: Share your experience and get help

## Getting Help

1. **Check Status First**: Run `claude-auth-status.sh`
2. **Review Logs**: Check `/tmp/claude-auth.log`
3. **Try Manual Auth**: Follow manual authentication steps
4. **Container Logs**: `docker logs pantheon-ide`
5. **GitHub Issues**: Report persistent issues

---

**Remember**: Authentication only needs to be done once. The credentials are stored in a Docker volume and will persist across container restarts.

Happy coding with BACO/Pantheon! 🎉