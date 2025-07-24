# 🚀 Quick Start: BACO/Pantheon Docker Environment

Get up and running with BACO/Pantheon in VS Code Server with Claude authentication in just 2 minutes!

## Prerequisites

- Docker Desktop installed and running
- Git (to clone the repository)
- A web browser

## One-Command Setup

```bash
# Clone the repository (if you haven't already)
git clone https://github.com/your-repo/baco.git
cd baco

# Make scripts executable
chmod +x start-docker.sh

# Run the setup script
./start-docker.sh
```

That's it! The script will:
- ✅ Check prerequisites
- ✅ Set up environment configuration
- ✅ Build the Docker image
- ✅ Start VS Code Server
- ✅ Guide you through Claude authentication

## Access Your Environment

1. **Open VS Code**: http://localhost:8080
2. **Enter Password**: Use the password you set during setup
3. **Authenticate Claude**: Run `claude-auth-docker.sh` in the terminal

## Alternative: Using Make

If you prefer using Make commands:

```bash
# Complete setup with authentication
make setup

# Or step by step:
make build    # Build Docker image
make up       # Start container
make auth     # Authenticate Claude
```

## Key Commands

### Container Management
```bash
make up       # Start container
make down     # Stop container
make logs     # View logs
make shell    # Open shell in container
```

### Authentication
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
│   ├── claude-auth-docker.sh
│   ├── claude-auth-status.sh
│   └── claude-auth-helper.sh
└── projects/              # Your code goes here
```

## What's Included

- **VS Code Server**: Full IDE in your browser
- **Claude Code Extension**: Official Anthropic VS Code extension (pre-installed!)
- **Claude CLI**: Command-line interface with authentication support
- **BACO/Pantheon**: The `gods` command for AI-driven development
- **Development Tools**: Node.js, Python, Git, and more
- **Persistent Storage**: Your code and settings are saved

### Two Ways to Use Claude:
1. **VS Code Extension** - Click the Claude icon in the sidebar
2. **CLI Commands** - Use `claude` in the terminal

## Troubleshooting

### Can't access VS Code?
```bash
# Check if container is running
docker ps

# View logs
make logs
```

### Authentication issues?
```bash
# Check status
make status

# Try manual auth
docker exec -it pantheon-ide claude-auth-docker.sh
```

### Need help?
```bash
# Show all available commands
make help

# Read detailed documentation
cat docs/CLAUDE_AUTH_DOCKER.md
```

## Next Steps

1. Create a new project: `gods init`
2. Generate a plan: `gods plan "your idea"`
3. Execute the plan: `gods execute`

Happy coding! 🎉

---

For detailed documentation, see:
- [Claude Authentication Guide](docs/CLAUDE_AUTH_DOCKER.md)
- [Docker Setup Guide](docker/README.md)
- [Main Documentation](README.md)