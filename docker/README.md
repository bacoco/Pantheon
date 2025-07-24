# BACO/Pantheon Docker Environment

A complete VS Code Server environment with Claude authentication support for BACO/Pantheon development.

## 🚀 Quick Start

```bash
# 1. Clone and navigate to the repository
git clone https://github.com/your-repo/baco.git
cd baco

# 2. Set up environment
cp docker/.env.example docker/.env
# Edit docker/.env and set VS_CODE_PASSWORD

# 3. Start the environment
make setup
```

Then open **http://localhost:8080** in your browser.

## 📋 Available Commands

### Using Make (Recommended)

```bash
make help       # Show all available commands
make build      # Build Docker image
make up         # Start container
make down       # Stop container
make auth       # Run Claude authentication
make status     # Check auth status
make shell      # Open shell in container
make logs       # View logs
make clean      # Remove everything (careful!)
```

### Using Docker Compose Directly

```bash
cd docker
docker-compose -f docker-compose.claude.yml up -d    # Start
docker-compose -f docker-compose.claude.yml down     # Stop
docker-compose -f docker-compose.claude.yml logs -f  # Logs
```

## 🔐 Claude Authentication

### First Time Setup

1. After starting the container, open VS Code at http://localhost:8080
2. Open a terminal (`` Ctrl+` ``)
3. Run: `claude-auth-docker.sh`
4. Follow the instructions to authenticate

### Authentication Methods

1. **API Key** (Set in .env file)
2. **Device Code** (Interactive browser flow)
3. **Headless Browser** (Automatic fallback)

### Checking Status

```bash
# In VS Code terminal
claude-auth-status.sh

# From host
make status
```

## 📁 Directory Structure

```
docker/
├── Dockerfile.claude        # Multi-stage Docker build
├── docker-compose.claude.yml # Container configuration
├── .env.example            # Environment template
└── README.md              # This file

scripts/
├── claude-auth-docker.sh   # Main authentication script
├── claude-auth-status.sh   # Status checker
└── claude-auth-helper.sh   # Utility functions

baco-vscode-extension/      # VS Code integration
├── extension.js
├── package.json
└── README.md
```

## 🛠️ Configuration

### Environment Variables

Edit `docker/.env`:

```env
# Required
VS_CODE_PASSWORD=your-secure-password

# Optional
CLAUDE_API_KEY=your-api-key
HTTP_PROXY=http://proxy:8080
HTTPS_PROXY=http://proxy:8080
```

### Ports

- `8080` - VS Code Server
- `3000` - React dev server
- `5173` - Vite dev server
- `8000` - API server

### Included VS Code Extensions

- **Claude Code** (`anthropic.claude-code`) - Official Claude AI assistant
- **Prettier** - Code formatting
- **ESLint** - JavaScript linting
- **Python** - Python language support
- **Tailwind CSS** - Tailwind IntelliSense
- **Live Server** - Local development server
- **BACO Extension** - Custom BACO/Pantheon commands

### Volumes

- `./projects` - Your code (persisted)
- `pantheon-config` - VS Code settings
- `claude-auth` - Authentication data

## 🔧 Troubleshooting

### Can't Access VS Code

1. Check if container is running: `docker ps`
2. Check logs: `make logs`
3. Verify port 8080 is not in use

### Authentication Fails

1. Run `make status` to check current state
2. Try different auth method
3. Check internet connectivity
4. Review logs in `/tmp/claude-auth.log`

### Files Not Persisting

- Ensure you're saving files in `/home/coder/projects`
- Check volume mounts: `docker volume ls`

## 🚨 Important Notes

1. **First time**: Always run `make setup` for complete initialization
2. **Passwords**: Change default passwords in production
3. **Backups**: Use `make backup-volumes` regularly
4. **Updates**: Run `make update` to get latest changes

## 📚 Documentation

- [Claude Authentication Guide](../docs/CLAUDE_AUTH_DOCKER.md)
- [VS Code Extension Guide](../baco-vscode-extension/README.md)
- [Main BACO Documentation](../README.md)

## 🆘 Getting Help

1. Run `make help` for command reference
2. Check [troubleshooting guide](../docs/CLAUDE_AUTH_DOCKER.md#troubleshooting)
3. Open an issue on GitHub

---

Happy coding with BACO/Pantheon! 🎉