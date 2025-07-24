# Claude Authentication in Docker Guide

This guide explains how to authenticate the Claude CLI within the BACO/Pantheon Docker environment.

## Table of Contents

1. [Overview](#overview)
2. [Quick Start](#quick-start)
3. [Authentication Methods](#authentication-methods)
4. [Troubleshooting](#troubleshooting)
5. [Advanced Configuration](#advanced-configuration)
6. [Security Best Practices](#security-best-practices)
7. [CI/CD Integration](#cicd-integration)

## Overview

This guide covers authentication for both:
1. **Claude CLI** - Command-line interface for Claude
2. **Claude Code VS Code Extension** - The official VS Code extension by Anthropic

In a Docker container (a headless environment without a display), the standard browser-based authentication flow needs special handling. This guide covers multiple authentication methods to ensure you can successfully authenticate regardless of your setup.

### Key Features

- **Multiple Authentication Methods**: API key, device code, and headless browser
- **Persistent Authentication**: Credentials stored in Docker volumes
- **Automatic Detection**: Scripts intelligently detect the best authentication method
- **Backup & Restore**: Built-in utilities for credential management
- **Security**: Best practices for protecting your authentication data

## Quick Start

### 1. Start the Docker Container

```bash
# Clone the repository
git clone https://github.com/your-repo/baco.git
cd baco

# Copy environment file and edit it
cp docker/.env.example docker/.env
# Edit docker/.env and set VS_CODE_PASSWORD

# Start the container
cd docker
docker-compose -f docker-compose.claude.yml up -d
```

### 2. Access VS Code Server

Open your browser and navigate to: **http://localhost:8080**

Enter the password you set in the `.env` file.

### 3. Authenticate Claude

Open a terminal in VS Code (`` Ctrl+` ``) and run:

```bash
claude-auth-docker.sh
```

Follow the on-screen instructions to complete authentication.

### 4. Verify Authentication

Check your authentication status:

```bash
claude-auth-status.sh
```

## Claude Code VS Code Extension

The Claude Code extension is now included by default! To use it:

1. **Open VS Code Server** at http://localhost:8080
2. **Look for the Claude icon** in the activity bar (left sidebar)
3. **Sign in to Claude** - The extension will guide you through authentication
4. **Start using Claude** - You can now use Claude directly in your editor!

### Extension Features
- Ask Claude questions about your code
- Generate code with Claude
- Get explanations and documentation
- Refactor and improve existing code

### Note on Authentication
The Claude Code extension uses its own authentication separate from the CLI. You may need to authenticate both if you want to use both the extension and CLI commands.

## Authentication Methods

### Method 1: API Key (Recommended for Automation)

If you have a Claude API key, this is the simplest method:

1. **Set Environment Variable** (before starting container):
   ```bash
   export CLAUDE_API_KEY="your-api-key-here"
   docker-compose -f docker-compose.claude.yml up -d
   ```

2. **Or Add to .env File**:
   ```env
   CLAUDE_API_KEY=your-api-key-here
   ```

3. **Or Set Inside Container**:
   ```bash
   export CLAUDE_API_KEY="your-api-key-here"
   claude-auth-docker.sh
   ```

### Method 2: Device Code Flow (Recommended for Interactive Use)

This method provides a URL and code to enter on the Claude website:

1. Run the authentication script:
   ```bash
   claude-auth-docker.sh
   ```

2. If device code is supported, you'll see:
   ```
   Please visit: https://claude.ai/cli/auth
   Enter code: ABCD-1234
   ```

3. Open the URL in your browser, log in, and enter the code

4. The script will automatically detect successful authentication

### Method 3: Headless Browser (Fallback)

If other methods aren't available, the script uses a virtual display:

1. The script automatically starts Xvfb (virtual display)
2. Launches Claude authentication in a headless browser
3. Extracts and displays the authentication URL
4. You complete authentication in your local browser

### Manual Authentication

If the automated scripts fail, you can authenticate manually:

```bash
# Start a virtual display
Xvfb :99 -screen 0 1024x768x16 &
export DISPLAY=:99

# Run Claude login
claude login

# Copy the URL that appears and open it in your browser
```

## Troubleshooting

### Common Issues

#### 1. "Claude CLI is not installed"

**Solution**: The Claude CLI may not be properly installed. Try:
```bash
# Check if Claude is in PATH
which claude

# Try installing manually
curl -fsSL https://claude.ai/install.sh | sh

# Or via npm (if available)
npm install -g claude-cli
```

#### 2. "Authentication failed or not completed"

**Solutions**:
- Ensure you completed the authentication in your browser
- Check internet connectivity
- Try a different authentication method
- Clear existing auth and retry:
  ```bash
  claude-auth-helper.sh clear
  claude-auth-docker.sh
  ```

#### 3. "Xvfb is not installed"

**Solution**: Rebuild the Docker image:
```bash
docker-compose -f docker-compose.claude.yml build --no-cache
```

#### 4. Authentication doesn't persist

**Solutions**:
- Check volume is properly mounted:
  ```bash
  docker volume inspect pantheon-claude-auth
  ```
- Ensure proper permissions:
  ```bash
  ls -la ~/.claude/
  ```

### Debug Mode

Run authentication with debug output:
```bash
bash -x claude-auth-docker.sh
```

### Check Logs

View authentication logs:
```bash
# Inside container
cat /tmp/claude-auth.log

# From host
docker exec pantheon-ide cat /tmp/claude-auth.log
```

## Advanced Configuration

### Authentication Helper Commands

The `claude-auth-helper.sh` script provides utilities:

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

For corporate environments with proxies:

1. **Set in .env**:
   ```env
   HTTP_PROXY=http://proxy.company.com:8080
   HTTPS_PROXY=http://proxy.company.com:8080
   NO_PROXY=localhost,127.0.0.1
   ```

2. **Configure Git** (if needed):
   ```bash
   git config --global http.proxy http://proxy.company.com:8080
   ```

### Multiple User Support

To support multiple users with separate authentications:

```yaml
# docker-compose.override.yml
services:
  pantheon-ide:
    volumes:
      - ${USER}-claude-auth:/home/coder/.claude
```

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
# Backup authentication regularly
claude-auth-helper.sh backup

# Backup Docker volumes
docker run --rm -v pantheon-claude-auth:/data -v $(pwd):/backup alpine tar czf /backup/claude-auth-backup.tar.gz -C /data .
```

### 5. Audit Access

- Review authentication logs
- Monitor container access
- Use Docker's built-in security scanning

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

### Jenkins Pipeline

```groovy
pipeline {
    agent any
    
    environment {
        CLAUDE_API_KEY = credentials('claude-api-key')
    }
    
    stages {
        stage('Setup') {
            steps {
                sh '''
                    cd docker
                    docker-compose -f docker-compose.claude.yml up -d
                    docker exec pantheon-ide claude-auth-status.sh
                '''
            }
        }
        
        stage('Test') {
            steps {
                sh 'docker exec pantheon-ide gods test'
            }
        }
    }
    
    post {
        always {
            sh 'docker-compose -f docker/docker-compose.claude.yml down'
        }
    }
}
```

## Appendix

### Environment Variables Reference

| Variable | Description | Default |
|----------|-------------|---------|
| `CLAUDE_API_KEY` | Claude API key for authentication | None |
| `CLAUDE_CONFIG_DIR` | Directory for Claude configuration | `/home/coder/.claude` |
| `VS_CODE_PASSWORD` | Password for VS Code Server | `pantheon` |
| `HTTP_PROXY` | HTTP proxy server | None |
| `HTTPS_PROXY` | HTTPS proxy server | None |

### File Locations

| File/Directory | Purpose |
|----------------|---------|
| `/home/coder/.claude/` | Claude configuration and credentials |
| `/home/coder/.claude-backups/` | Authentication backups |
| `/usr/local/bin/claude-auth-*.sh` | Authentication scripts |
| `/tmp/claude-auth.log` | Temporary authentication logs |

### Useful Commands

```bash
# Check Claude version
claude --version

# View Claude help
claude help

# Test API connection
claude status

# View current user (if supported)
claude whoami

# List available commands
claude list-commands
```

### Getting Help

1. **Check Status First**: Run `claude-auth-status.sh`
2. **Review Logs**: Check `/tmp/claude-auth.log`
3. **Try Manual Auth**: Follow manual authentication steps
4. **Container Logs**: `docker logs pantheon-ide`
5. **GitHub Issues**: Report persistent issues

---

Remember: Authentication only needs to be done once. The credentials are stored in a Docker volume and will persist across container restarts.