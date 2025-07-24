# Pantheon UI Architecture

## Overview

Pantheon UI is a web-based chat interface that bridges user interactions with the Claude Code CLI, providing a modern, intuitive way to use Pantheon's powerful features.

## System Architecture

### High-Level Design

```
┌─────────────────────────────────────────────────────────────┐
│                        Browser                               │
├─────────────────────────┬───────────────────────────────────┤
│     React Frontend      │         WebSocket Client          │
│  - Chat UI Components   │    - Real-time updates           │
│  - State Management     │    - Output streaming             │
│  - API Client          │    - Status notifications         │
└────────────┬───────────┴──────────────┬────────────────────┘
             │ HTTP                      │ WS
             ▼                           ▼
┌─────────────────────────────────────────────────────────────┐
│                   Node.js Backend                            │
├─────────────────────────┬───────────────────────────────────┤
│    Express REST API     │      Socket.io Server             │
│  - Command endpoints    │   - Event broadcasting            │
│  - File operations      │   - Client management             │
│  - Project management   │   - Output streaming              │
└────────────┬───────────┴──────────────┬────────────────────┘
             │                           │
             ▼                           ▼
┌─────────────────────────────────────────────────────────────┐
│                  Claude Code Bridge                          │
│  - Process spawning and management                          │
│  - Command parsing and execution                            │
│  - Output capture and streaming                             │
│  - Error handling and recovery                              │
└─────────────────────────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────────┐
│                    Claude Code CLI                           │
│  - Pantheon commands execution                                  │
│  - File system operations                                   │
│  - Git operations                                           │
│  - Docker management                                        │
└─────────────────────────────────────────────────────────────┘
```

## Component Details

### Frontend (React Application)

#### Core Components

1. **ChatInterface**
   - Message display (user/Pantheon/system messages)
   - Input handling with command suggestions
   - Natural language processing
   - Progress indicators

2. **ProjectExplorer**
   - File tree visualization
   - Real-time file system updates
   - Git status indicators
   - File preview capabilities

3. **TaskManager**
   - Visual task progress
   - Phase tracking
   - Task history
   - Error display

4. **DockerPanel**
   - Container status
   - Image management
   - Build progress
   - Logs viewer

#### State Management (Zustand)

```typescript
interface AppState {
  // Chat state
  messages: Message[];
  isExecuting: boolean;
  currentCommand: string;
  
  // Project state
  currentProject: Project | null;
  fileTree: FileNode[];
  gitStatus: GitStatus;
  
  // Task state
  tasks: Task[];
  currentPhase: string;
  progress: number;
  
  // Connection state
  isConnected: boolean;
  connectionError: string | null;
}
```

#### API Client

```typescript
class PantheonApiClient {
  // Command execution
  async executeCommand(command: string): Promise<ExecutionResult>;
  
  // Project operations
  async createProject(name: string): Promise<Project>;
  async listProjects(): Promise<Project[]>;
  async getProjectFiles(projectId: string): Promise<FileNode[]>;
  
  // Real-time subscriptions
  subscribeToOutput(callback: (output: string) => void): () => void;
  subscribeToFileChanges(callback: (changes: FileChange[]) => void): () => void;
}
```

### Backend (Node.js Server)

#### API Routes

```typescript
// Command execution
POST   /api/execute        - Execute Pantheon command
GET    /api/execute/:id    - Get execution status

// Project management
GET    /api/projects       - List all projects
POST   /api/projects       - Create new project
GET    /api/projects/:id   - Get project details
DELETE /api/projects/:id   - Delete project

// File operations
GET    /api/files/:projectId      - Get file tree
GET    /api/files/:projectId/*    - Read file content
POST   /api/files/:projectId/*    - Create/update file

// System
GET    /api/health         - Health check
GET    /api/claude/status  - Claude Code status
```

#### Claude Code Bridge

```typescript
export class ClaudeCodeBridge {
  private processes: Map<string, ChildProcess>;
  private outputStreams: Map<string, Stream>;

  // Execute command with streaming output
  async execute(command: string, args: string[], options: ExecuteOptions): Promise<ExecutionResult> {
    const process = spawn('claude', ['code', command, ...args], {
      cwd: options.workingDirectory,
      env: { ...process.env, CLAUDE_CODE_API: 'true' }
    });

    // Stream output via WebSocket
    process.stdout.on('data', (data) => {
      this.broadcastOutput(options.executionId, data.toString());
    });

    // Handle completion
    return new Promise((resolve, reject) => {
      process.on('close', (code) => {
        if (code === 0) resolve({ success: true, executionId: options.executionId });
        else reject(new Error(`Command failed with code ${code}`));
      });
    });
  }

  // Parse Pantheon-specific output
  parsePantheonOutput(output: string): PantheonResponse {
    // Extract progress, file changes, phase updates, etc.
  }
}
```

#### WebSocket Events

```typescript
// Server -> Client events
interface ServerEvents {
  'output': { executionId: string; data: string; timestamp: Date };
  'fileChange': { type: 'created' | 'modified' | 'deleted'; path: string };
  'phaseUpdate': { phase: string; progress: number };
  'taskComplete': { taskId: string; result: TaskResult };
  'error': { message: string; code: string };
}

// Client -> Server events
interface ClientEvents {
  'execute': { command: string; projectId?: string };
  'subscribe': { channel: string; projectId: string };
  'unsubscribe': { channel: string };
  'cancel': { executionId: string };
}
```

### Data Flow

#### Command Execution Flow

```
1. User types: "Create a Next.js app with authentication"
   ↓
2. Frontend parses to Pantheon command: "/pantheon init"
   ↓
3. API request: POST /api/execute { command: "/baco init", args: [] }
   ↓
4. Backend spawns Claude Code process
   ↓
5. Output streams via WebSocket to frontend
   ↓
6. Frontend updates UI in real-time
   ↓
7. Process completes, final status sent
   ↓
8. Frontend shows completion message
```

#### File System Sync

```
1. File watcher detects changes in project directory
   ↓
2. Backend emits 'fileChange' WebSocket event
   ↓
3. Frontend updates file tree
   ↓
4. Git status check triggered
   ↓
5. UI updates with new file states
```

## Security Considerations

### Authentication & Authorization
- Local-only deployment (no remote access by default)
- Optional authentication for multi-user scenarios
- Session-based access control

### File System Security
- Sandboxed project directories
- Path validation to prevent directory traversal
- Read-only access outside project directories

### Process Security
- Limited command whitelist
- Argument sanitization
- Process isolation
- Resource limits (CPU, memory, timeout)

## Performance Optimizations

### Frontend
- Virtual scrolling for large file trees
- Debounced search and filtering
- Lazy loading of file contents
- Optimistic UI updates

### Backend
- Connection pooling for database
- Output buffering and batching
- File system caching
- Process reuse where possible

### WebSocket
- Message compression
- Reconnection with exponential backoff
- Heartbeat for connection monitoring
- Event batching for high-frequency updates

## Scalability Considerations

### Horizontal Scaling
- Stateless API design
- Session storage in SQLite/Redis
- WebSocket sticky sessions
- Load balancer compatible

### Vertical Scaling
- Efficient process management
- Memory-conscious output buffering
- Configurable process limits
- Resource monitoring

## Error Handling

### Frontend Error Boundaries
```typescript
class ErrorBoundary extends Component {
  // Graceful error display
  // Retry mechanisms
  // Error reporting
}
```

### Backend Error Recovery
```typescript
class ErrorHandler {
  // Process crash recovery
  // Partial execution rollback
  // User-friendly error messages
  // Detailed logging
}
```

## Testing Strategy

### Unit Tests
- Component testing with React Testing Library
- API endpoint testing with Jest
- Claude Code Bridge mocking

### Integration Tests
- End-to-end command execution
- WebSocket communication
- File system operations

### Performance Tests
- Load testing with multiple concurrent users
- Large project handling
- Output streaming performance

## Deployment

### Development
```bash
# Frontend: http://localhost:5173
# Backend: http://localhost:3001
pnpm dev
```

### Production
```bash
# Build all packages
pnpm build

# Run with PM2
pm2 start ecosystem.config.js
```

### Docker
```dockerfile
# Multi-stage build for optimal size
FROM node:18-alpine AS builder
# ... build steps ...

FROM node:18-alpine AS runner
# ... production setup ...
```

## Future Enhancements

1. **Plugin System**
   - Custom command handlers
   - UI extensions
   - Third-party integrations

2. **Collaboration Features**
   - Multi-user support
   - Real-time collaboration
   - Shared sessions

3. **AI Enhancements**
   - Smarter command parsing
   - Context-aware suggestions
   - Learning from usage patterns

4. **Advanced Visualizations**
   - Dependency graphs
   - Architecture diagrams
   - Performance metrics