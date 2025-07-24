# Pantheon Docker Architecture Guide

## Overview

Pantheon employs a secure, two-container architecture designed to protect proprietary intellectual property while providing a seamless developer experience. This architecture enables both large-scale project scaffolding and real-time interactive coding assistance.

## Architecture Principles

### Security First
- Proprietary `.claude` prompts are isolated in the secure backend container
- The user never has direct access to the Pantheon Engine
- All communication happens through a controlled REST API
- SSH keys and authentication tokens are managed securely

### Hybrid Interaction Model
The system supports two complementary workflows:

1. **Git-Flow Operator** (Large-Scale Tasks)
   - Scaffolding new services
   - Generating full feature modules
   - Performing project-wide refactors
   - Results in clean Git commits for version control

2. **In-Editor Assistant** (Interactive Tasks)
   - Real-time code refactoring
   - Adding documentation
   - Bug fixes
   - Presents diffs for user acceptance/rejection

## Container Architecture

### Service 1: User IDE (`code-server`)

**Purpose**: Provides the interactive development environment

**Contains**:
- `code-server` (VS Code in the browser)
- Pantheon VS Code extension
- Simple `gods` CLI wrapper

**Does NOT Contain**:
- Proprietary `.md` prompts
- `claude` CLI
- Direct access to backend logic

**Responsibilities**:
- Capture user intent through UI/CLI
- Display code diffs and suggestions
- Communicate with backend via REST API
- Apply accepted changes to files

### Service 2: Pantheon Engine (Secure Backend)

**Purpose**: Executes AI operations while protecting IP

**Contains**:
- All proprietary `.claude/*.md` prompt files
- `claude` CLI (authenticated)
- REST API server
- Git operation capabilities

**Responsibilities**:
- Manage `claude` process execution
- Handle Git operations (clone/commit/push)
- Serve API responses to IDE
- Maintain security boundaries

## Technical Implementation

### Docker Compose Configuration

```yaml
version: '3.8'

services:
  # User's interactive VS Code environment
  ide:
    build:
      context: ./services/ide
    ports:
      - "8080:8080"  # VS Code accessible on localhost:8080
    volumes:
      - ./projects:/home/coder/projects  # Mount user's project code
    environment:
      - PANTHEON_ENGINE_URL=http://engine:5000
    depends_on:
      - engine
    restart: always

  # Secure backend engine
  engine:
    build:
      context: ./services/engine
    # No ports exposed to host - only accessible from IDE container
    environment:
      - GITHUB_SSH_KEY=${GITHUB_SSH_KEY}
    volumes:
      - claude-auth:/root/.claude  # Persist authentication
    restart: always

volumes:
  claude-auth:  # Persistent storage for Claude tokens
```

### API Endpoints

#### `/execute/git-flow` (POST)
Handles large-scale operations with Git integration.

**Request**:
```json
{
  "repoUrl": "git@github.com:user/repo.git",
  "command": "scaffold:service user-auth-api"
}
```

**Process**:
1. Clone repository using provided SSH key
2. Execute appropriate prompt with `claude` CLI
3. Generate files in cloned repository
4. Commit and push changes
5. Clean up temporary files

**Response**:
```json
{
  "status": "success",
  "message": "Successfully executed command and pushed to git@github.com:user/repo.git",
  "commitHash": "abc123..."
}
```

#### `/execute/interactive-diff` (POST)
Handles real-time, in-editor code modifications.

**Request**:
```json
{
  "code": "def calculate_total(items):\n    return sum(items)",
  "command": "refactor",
  "filePath": "/home/coder/projects/app.py"
}
```

**Process**:
1. Load appropriate prompt template
2. Execute `claude` with code snippet
3. Parse AI response into structured diff

**Response**:
```json
{
  "status": "success",
  "diff": {
    "filePath": "/home/coder/projects/app.py",
    "originalCode": "def calculate_total(items):\n    return sum(items)",
    "suggestedCode": "def calculate_total(items: List[float]) -> float:\n    \"\"\"Calculate the total sum of items.\"\"\"\n    return sum(items)"
  }
}
```

## Directory Structure

```
/pantheon/
├── .env                    # Environment variables (SSH keys, tokens)
├── docker-compose.yml      # Container orchestration
├── projects/              # User workspace (mounted volume)
└── services/
    ├── ide/
    │   ├── Dockerfile     # VS Code server + extension
    │   └── extension/
    │       ├── extension.js    # VS Code extension logic
    │       └── package.json    # Extension metadata
    └── engine/
        ├── Dockerfile     # Python API + Claude CLI
        ├── main.py       # Flask/FastAPI server
        ├── requirements.txt
        └── prompts/      # Proprietary prompt templates
            ├── refactor.md
            └── scaffold_service.md
```

## Development Workflow

### Initial Setup

1. **Generate SSH Keys**:
   ```bash
   ssh-keygen -t ed25519 -C "pantheon-engine@example.com" -f ~/.ssh/pantheon_github
   ```

2. **Configure Environment**:
   ```bash
   # .env file
   GITHUB_SSH_KEY="-----BEGIN OPENSSH PRIVATE KEY-----\n...\n-----END OPENSSH PRIVATE KEY-----\n"
   ```

3. **Add Deploy Key**: Add public key to GitHub repository with write access

4. **Build and Run**:
   ```bash
   docker-compose up --build
   ```

### Extension Development

The VS Code extension handles:
- Command registration (context menu, command palette)
- API communication with Pantheon Engine
- Diff visualization
- File system updates

Key extension features:
- Progress notifications during AI processing
- Modal dialogs for accept/reject decisions
- Error handling and user feedback
- Workspace-aware file operations

### Engine Development

The backend API server:
- Validates incoming requests
- Manages temporary Git repositories
- Executes Claude CLI with appropriate prompts
- Handles error cases gracefully
- Cleans up resources after operations

## Security Considerations

### Network Isolation
- Engine port (5000) is not exposed to host
- Communication only allowed from IDE container
- No direct external access to backend

### Secret Management
- SSH keys stored in environment variables
- Claude authentication persisted in named volume
- No secrets in container images

### IP Protection
- Prompts remain in engine container
- User never sees raw prompt templates
- All AI operations proxied through API

## Performance Optimization

### Caching Strategy
- Persist Claude authentication tokens
- Cache Git repositories when possible
- Reuse SSH connections

### Resource Management
- Clean up temporary directories after Git operations
- Stream large responses to avoid memory issues
- Implement request timeouts

### Scalability Considerations
- Stateless API design allows horizontal scaling
- Volume mounts enable multi-instance deployments
- Queue system can be added for async operations

## Monitoring and Debugging

### Logging
- Structured logging in both containers
- Correlation IDs for request tracking
- Error aggregation for troubleshooting

### Health Checks
```yaml
healthcheck:
  test: ["CMD", "curl", "-f", "http://localhost:5000/health"]
  interval: 30s
  timeout: 10s
  retries: 3
```

### Development Tools
- VS Code debugger available in IDE container
- Python debugger (pdb) in engine container
- Docker logs for container-level issues

## Future Enhancements

### Planned Features
1. WebSocket support for real-time updates
2. Multi-file diff support
3. Batch operation queuing
4. Enhanced diff visualization
5. Workspace-wide refactoring

### Architecture Evolution
- Kubernetes deployment manifests
- Microservice decomposition
- Event-driven architecture
- Multi-tenant support

## Conclusion

This two-container architecture provides a secure, scalable foundation for Pantheon's AI-powered development assistance. By separating concerns between the user interface and the AI engine, we protect intellectual property while delivering a premium developer experience comparable to GitHub Copilot and Cursor.