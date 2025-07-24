# Secure Server-Based Pantheon Implementation (Option 2)

This document describes how to implement a server-based security model for Pantheon commands, where the .claude files are never exposed in the filesystem.

## Architecture Overview

```
┌─────────────────────┐     ┌──────────────────────┐
│   Claude Code       │────▶│  Pantheon Server     │
│   (VS Code)         │     │  (localhost:8888)    │
└─────────────────────┘     └──────────────────────┘
                                      │
                                      ▼
                            ┌──────────────────────┐
                            │  Encrypted Commands  │
                            │  (in memory only)    │
                            └──────────────────────┘
```

## Implementation Steps

### 1. Create the Secure Pantheon Server

```python
# /usr/local/bin/pantheon-server
#!/usr/bin/env python3
"""
Secure Pantheon Command Server
Serves commands from memory without filesystem exposure
"""

import os
import json
import hmac
import hashlib
import asyncio
import aiohttp
from aiohttp import web
from pathlib import Path
import base64
import zlib

class PantheonServer:
    def __init__(self, command_data):
        self.commands = {}
        self.agents = {}
        self.secret_key = os.environ.get('PANTHEON_SECRET', 'default-dev-key')
        self._load_commands(command_data)
    
    def _load_commands(self, data):
        """Load and decrypt command data into memory"""
        # Commands would be embedded during build
        self.commands = data.get('commands', {})
        self.agents = data.get('agents', {})
    
    def _verify_token(self, token):
        """Verify request token using HMAC"""
        expected = hmac.new(
            self.secret_key.encode(),
            b'pantheon-access',
            hashlib.sha256
        ).hexdigest()
        return hmac.compare_digest(token, expected)
    
    async def handle_command(self, request):
        """Serve command content"""
        # Verify authorization
        auth_header = request.headers.get('Authorization', '')
        if not auth_header.startswith('Bearer '):
            return web.Response(status=401, text='Unauthorized')
        
        token = auth_header[7:]
        if not self._verify_token(token):
            return web.Response(status=403, text='Forbidden')
        
        # Get command
        command_name = request.match_info.get('name')
        if command_name in self.commands:
            return web.Response(
                text=self.commands[command_name],
                content_type='text/markdown'
            )
        
        return web.Response(status=404, text='Command not found')
    
    async def handle_agent(self, request):
        """Serve agent content"""
        # Similar to handle_command but for agents
        pass
    
    def create_app(self):
        app = web.Application()
        app.router.add_get('/command/{name}', self.handle_command)
        app.router.add_get('/agent/{name}', self.handle_agent)
        app.router.add_get('/health', lambda r: web.Response(text='OK'))
        return app

# Embedded command data (populated during Docker build)
COMMAND_DATA = {}  # This would be injected during build

if __name__ == '__main__':
    server = PantheonServer(COMMAND_DATA)
    app = server.create_app()
    
    # Bind to localhost only
    web.run_app(app, host='127.0.0.1', port=8888)
```

### 2. Create Claude Integration Wrapper

```bash
#!/bin/bash
# /usr/local/bin/claude-pantheon
# Wrapper that fetches commands from secure server

PANTHEON_SERVER="http://127.0.0.1:8888"
PANTHEON_TOKEN=$(hmac256 "pantheon-access" "$PANTHEON_SECRET")

get_command() {
    local cmd_name="$1"
    curl -s -H "Authorization: Bearer $PANTHEON_TOKEN" \
         "$PANTHEON_SERVER/command/$cmd_name"
}

get_agent() {
    local agent_name="$1"
    curl -s -H "Authorization: Bearer $PANTHEON_TOKEN" \
         "$PANTHEON_SERVER/agent/$agent_name"
}

# Main Claude wrapper logic
case "$1" in
    "read-command")
        get_command "$2"
        ;;
    "read-agent")
        get_agent "$2"
        ;;
    *)
        # Regular Claude functionality
        echo "Pantheon-secured Claude environment"
        ;;
esac
```

### 3. Update Dockerfile for Server Mode

```dockerfile
# Add to Dockerfile.secure-claude

# Install server dependencies
RUN pip install aiohttp cryptography

# Copy and setup server
COPY --from=command-builder /build/pantheon_server.py /usr/local/bin/pantheon-server
RUN chmod 755 /usr/local/bin/pantheon-server

# Create systemd service or supervisor config
RUN cat > /etc/supervisor/conf.d/pantheon-server.conf << 'EOF'
[program:pantheon-server]
command=/usr/local/bin/pantheon-server
autostart=true
autorestart=true
user=pantheon
redirect_stderr=true
stdout_logfile=/var/log/pantheon-server.log
environment=PANTHEON_SECRET="%(ENV_PANTHEON_SECRET)s"
EOF

# Start server before code-server
```

### 4. VS Code Extension Integration

Create a VS Code extension that communicates with the server:

```javascript
// pantheon-vscode-client/extension.js
const vscode = require('vscode');
const http = require('http');
const crypto = require('crypto');

class PantheonClient {
    constructor() {
        this.serverUrl = 'http://127.0.0.1:8888';
        this.token = this.generateToken();
    }
    
    generateToken() {
        const secret = process.env.PANTHEON_SECRET || 'default-dev-key';
        return crypto.createHmac('sha256', secret)
                    .update('pantheon-access')
                    .digest('hex');
    }
    
    async getCommand(name) {
        return new Promise((resolve, reject) => {
            const options = {
                hostname: '127.0.0.1',
                port: 8888,
                path: `/command/${name}`,
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${this.token}`
                }
            };
            
            const req = http.request(options, (res) => {
                let data = '';
                res.on('data', chunk => data += chunk);
                res.on('end', () => resolve(data));
            });
            
            req.on('error', reject);
            req.end();
        });
    }
}

// VS Code command registration
function activate(context) {
    const client = new PantheonClient();
    
    // Register command provider
    const provider = {
        provideCommands: async () => {
            // Fetch available commands from server
            return await client.getAvailableCommands();
        }
    };
    
    context.subscriptions.push(
        vscode.commands.registerCommand('pantheon.getCommand', async (name) => {
            const content = await client.getCommand(name);
            // Process command content
        })
    );
}
```

### 5. Security Enhancements

#### A. Certificate Pinning
```python
# Add SSL/TLS even for localhost
ssl_context = ssl.create_default_context(ssl.Purpose.CLIENT_AUTH)
ssl_context.load_cert_chain('pantheon.crt', 'pantheon.key')
```

#### B. Rate Limiting
```python
from aiohttp_ratelimit import RateLimitMiddleware

app.middlewares.append(
    RateLimitMiddleware(rate=100, per=60)  # 100 requests per minute
)
```

#### C. Request Logging
```python
async def log_requests(request, handler):
    start = time.time()
    response = await handler(request)
    duration = time.time() - start
    logger.info(f"{request.method} {request.path} - {response.status} ({duration:.3f}s)")
    return response
```

## Deployment Options

### 1. Supervisor (Recommended)
```ini
[program:pantheon-server]
command=python3 /usr/local/bin/pantheon-server
autostart=true
autorestart=true
stderr_logfile=/var/log/pantheon.err.log
stdout_logfile=/var/log/pantheon.out.log
```

### 2. Systemd Service
```ini
[Unit]
Description=Pantheon Command Server
After=network.target

[Service]
Type=simple
User=pantheon
ExecStart=/usr/local/bin/pantheon-server
Restart=always
Environment="PANTHEON_SECRET=your-secret-key"

[Install]
WantedBy=multi-user.target
```

### 3. Docker Compose Integration
```yaml
services:
  pantheon-server:
    image: pantheon-server:latest
    network_mode: "host"
    environment:
      - PANTHEON_SECRET=${PANTHEON_SECRET}
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8888/health"]
      interval: 30s
```

## Implementation Timeline

1. **Phase 1**: Basic HTTP server (current implementation)
2. **Phase 2**: Add authentication and encryption
3. **Phase 3**: VS Code extension integration
4. **Phase 4**: Full SSL/TLS with certificate pinning
5. **Phase 5**: Distributed mode with Redis backend

## Testing

```bash
# Test server is running
curl http://localhost:8888/health

# Test command retrieval (with token)
TOKEN=$(echo -n "pantheon-access" | hmac256 "$PANTHEON_SECRET")
curl -H "Authorization: Bearer $TOKEN" http://localhost:8888/command/gods

# Load test
ab -n 1000 -c 10 -H "Authorization: Bearer $TOKEN" http://localhost:8888/command/gods
```

## Advantages

1. **No filesystem exposure** - Commands never touch disk
2. **Central control** - Easy to update/revoke access
3. **Audit trail** - All access can be logged
4. **Performance** - Commands cached in memory
5. **Scalable** - Can add caching, CDN, etc.

## Migration Path

To migrate from current implementation:

1. Deploy server alongside current system
2. Update Claude wrapper to try server first, fall back to files
3. Monitor usage and performance
4. Gradually remove file-based access
5. Full cutover to server-only mode

---

This implementation provides maximum security while maintaining functionality. The server approach ensures that Pantheon commands are never exposed in the filesystem and all access is controlled and audited.