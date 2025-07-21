# Live Preview Integration for BACO

This library provides automatic dev server management and live preview capabilities for BACO projects.

## Overview

Live Preview enables:
- Automatic dev server startup
- Browser preview launch
- Hot reload integration
- Mobile device preview via QR codes
- Multi-framework support

## Framework Detection and Commands

### Dev Server Commands by Framework
```typescript
const devServerCommands = {
  'next.js': {
    command: 'npm run dev',
    defaultPort: 3000,
    readyMessage: 'Ready in',
    hotReload: true
  },
  'react': {
    command: 'npm start',
    defaultPort: 3000,
    readyMessage: 'Compiled successfully',
    hotReload: true
  },
  'vue': {
    command: 'npm run dev',
    defaultPort: 5173,
    readyMessage: 'ready in',
    hotReload: true
  },
  'express': {
    command: 'npm run dev',
    defaultPort: 3000,
    readyMessage: 'Server running on',
    hotReload: false,
    needsNodemon: true
  },
  'fastapi': {
    command: 'uvicorn main:app --reload',
    defaultPort: 8000,
    readyMessage: 'Uvicorn running on',
    hotReload: true
  },
  'django': {
    command: 'python manage.py runserver',
    defaultPort: 8000,
    readyMessage: 'Starting development server',
    hotReload: true
  }
};
```

## Core Implementation

### Dev Server Manager
```typescript
import { spawn, ChildProcess } from 'child_process';
import { createServer } from 'net';

class DevServerManager {
  private process: ChildProcess | null = null;
  private framework: string;
  private projectPath: string;
  private port: number;
  
  constructor(projectPath: string, framework: string) {
    this.projectPath = projectPath;
    this.framework = framework;
    this.port = devServerCommands[framework]?.defaultPort || 3000;
  }
  
  async start(): Promise<DevServerInfo> {
    // Check if port is available
    const availablePort = await this.findAvailablePort(this.port);
    
    // Get command for framework
    const config = devServerCommands[this.framework];
    if (!config) {
      throw new Error(`Unknown framework: ${this.framework}`);
    }
    
    // Start dev server
    return new Promise((resolve, reject) => {
      const env = {
        ...process.env,
        PORT: availablePort.toString(),
        BROWSER: 'none' // Prevent auto-opening
      };
      
      this.process = spawn('npm', ['run', 'dev'], {
        cwd: this.projectPath,
        env,
        shell: true
      });
      
      let output = '';
      
      this.process.stdout?.on('data', (data) => {
        output += data.toString();
        console.log(data.toString());
        
        // Check if server is ready
        if (output.includes(config.readyMessage)) {
          resolve({
            url: `http://localhost:${availablePort}`,
            port: availablePort,
            process: this.process,
            framework: this.framework
          });
        }
      });
      
      this.process.stderr?.on('data', (data) => {
        console.error(data.toString());
      });
      
      this.process.on('error', reject);
      
      // Timeout after 30 seconds
      setTimeout(() => {
        reject(new Error('Dev server failed to start in 30 seconds'));
      }, 30000);
    });
  }
  
  private async findAvailablePort(startPort: number): Promise<number> {
    let port = startPort;
    
    while (!(await this.isPortAvailable(port))) {
      port++;
      if (port > startPort + 100) {
        throw new Error('No available ports found');
      }
    }
    
    return port;
  }
  
  private isPortAvailable(port: number): Promise<boolean> {
    return new Promise((resolve) => {
      const server = createServer();
      
      server.once('error', () => {
        resolve(false);
      });
      
      server.once('listening', () => {
        server.close();
        resolve(true);
      });
      
      server.listen(port);
    });
  }
  
  async stop(): Promise<void> {
    if (this.process) {
      this.process.kill();
      this.process = null;
    }
  }
}
```

### Browser Preview Launcher
```typescript
import open from 'open';

class BrowserLauncher {
  static async launch(url: string, options: LaunchOptions = {}): Promise<void> {
    const { browser = 'default', wait = false } = options;
    
    console.log(`🌐 Opening ${url} in browser...`);
    
    try {
      await open(url, {
        wait,
        app: browser !== 'default' ? { name: browser } : undefined
      });
      
      console.log('✅ Browser opened successfully');
    } catch (error) {
      console.error('Failed to open browser:', error);
      console.log(`Please open manually: ${url}`);
    }
  }
}
```

### QR Code Generator for Mobile
```typescript
import QRCode from 'qrcode';
import { networkInterfaces } from 'os';

class MobilePreview {
  static async generateQR(port: number): Promise<string> {
    const urls = this.getNetworkURLs(port);
    
    if (urls.length === 0) {
      throw new Error('No network interfaces found');
    }
    
    // Generate QR code for the first available network URL
    const url = urls[0];
    const qr = await QRCode.toString(url, { type: 'terminal' });
    
    return {
      qr,
      urls,
      instructions: this.getInstructions(urls)
    };
  }
  
  private static getNetworkURLs(port: number): string[] {
    const interfaces = networkInterfaces();
    const urls: string[] = [];
    
    for (const name of Object.keys(interfaces)) {
      for (const iface of interfaces[name] || []) {
        // Skip internal and non-IPv4 addresses
        if (iface.family === 'IPv4' && !iface.internal) {
          urls.push(`http://${iface.address}:${port}`);
        }
      }
    }
    
    return urls;
  }
  
  private static getInstructions(urls: string[]): string {
    return `
📱 Mobile Preview Available!

Scan this QR code with your phone:
${urls[0]}

Or manually enter one of these URLs:
${urls.map(url => `  • ${url}`).join('\n')}

Make sure your phone is on the same network!
    `;
  }
}
```

### Hot Reload Monitor
```typescript
class HotReloadMonitor {
  private framework: string;
  private projectPath: string;
  
  constructor(projectPath: string, framework: string) {
    this.projectPath = projectPath;
    this.framework = framework;
  }
  
  async ensureHotReload(): Promise<void> {
    const config = devServerCommands[this.framework];
    
    if (!config.hotReload && config.needsNodemon) {
      await this.setupNodemon();
    }
    
    // Framework-specific hot reload setup
    switch (this.framework) {
      case 'next.js':
        await this.ensureNextConfig();
        break;
      case 'vue':
        await this.ensureViteConfig();
        break;
      case 'express':
        await this.ensureNodemonConfig();
        break;
    }
  }
  
  private async setupNodemon(): Promise<void> {
    // Check if nodemon is installed
    const hasNodemon = await this.checkDependency('nodemon');
    
    if (!hasNodemon) {
      console.log('📦 Installing nodemon for hot reload...');
      await exec('npm install -D nodemon', { cwd: this.projectPath });
    }
    
    // Update package.json scripts
    const packageJson = await readJSON(path.join(this.projectPath, 'package.json'));
    
    if (!packageJson.scripts.dev?.includes('nodemon')) {
      packageJson.scripts.dev = 'nodemon src/index.js';
      await writeJSON(path.join(this.projectPath, 'package.json'), packageJson);
    }
  }
}
```

## Integration with BACO Workflow

### Live Preview During Development
```typescript
class LivePreviewIntegration {
  static async startPreview(
    projectPath: string,
    options: PreviewOptions = {}
  ): Promise<PreviewSession> {
    const { 
      autoOpen = true,
      mobile = true,
      browser = 'default'
    } = options;
    
    // Detect framework
    const framework = await detectFramework(projectPath);
    
    // Ensure hot reload is configured
    const hotReload = new HotReloadMonitor(projectPath, framework);
    await hotReload.ensureHotReload();
    
    // Start dev server
    console.log('🚀 Starting development server...');
    const serverManager = new DevServerManager(projectPath, framework);
    const serverInfo = await serverManager.start();
    
    console.log(`✅ Dev server running at ${serverInfo.url}`);
    
    // Open browser if requested
    if (autoOpen) {
      await BrowserLauncher.launch(serverInfo.url, { browser });
    }
    
    // Generate QR code for mobile
    if (mobile) {
      const mobileInfo = await MobilePreview.generateQR(serverInfo.port);
      console.log(mobileInfo.qr);
      console.log(mobileInfo.instructions);
    }
    
    return {
      serverInfo,
      stop: () => serverManager.stop(),
      restart: () => {
        serverManager.stop();
        return serverManager.start();
      }
    };
  }
}
```

### BACO Command Integration
```typescript
// In /baco execute or workflow completion
async function handleLivePreview(projectPath: string) {
  // Detect if in monorepo
  const monorepoInfo = await detectMonorepo(projectPath);
  
  let choices = `
🎉 Project implementation complete!

Would you like to:
1. Start live preview
2. Start with mobile preview
3. Skip preview
4. Custom preview options`;
  
  if (monorepoInfo) {
    choices += `
5. Start all apps in monorepo
6. Choose specific app to preview`;
  }
  
  console.log(choices + '\n\nChoice (1-6):');
  
  const choice = await getUserChoice();
  
  switch (choice) {
    case '1':
      await LivePreviewIntegration.startPreview(projectPath);
      break;
      
    case '2':
      await LivePreviewIntegration.startPreview(projectPath, {
        mobile: true,
        autoOpen: true
      });
      break;
      
    case '4':
      const options = await getCustomOptions();
      await LivePreviewIntegration.startPreview(projectPath, options);
      break;
      
    case '5':
      if (monorepoInfo) {
        const manager = new MonorepoDevManager();
        const apps = monorepoInfo.packages
          .filter(pkg => pkg.type === 'app')
          .map(pkg => pkg.name);
        await manager.startMultiple(apps, monorepoInfo);
      }
      break;
      
    case '6':
      if (monorepoInfo) {
        const apps = monorepoInfo.packages.filter(pkg => pkg.type === 'app');
        console.log('Available apps:');
        apps.forEach((app, index) => {
          console.log(`${index + 1}. ${app.name}`);
        });
        const appChoice = await getUserChoice();
        const selectedApp = apps[parseInt(appChoice) - 1];
        if (selectedApp) {
          await LivePreviewIntegration.startPreview(
            path.join(monorepoInfo.root, selectedApp.path),
            { monorepoContext: { type: monorepoInfo.type, root: monorepoInfo.root, packageName: selectedApp.name } }
          );
        }
      }
      break;
  }
}
```

## Framework-Specific Configurations

### Next.js Configuration
```javascript
// Ensure next.config.js has proper settings
module.exports = {
  reactStrictMode: true,
  swcMinify: true,
  // Enable fast refresh
  experimental: {
    fastRefresh: true
  }
};
```

### Vite Configuration
```javascript
// vite.config.js
export default {
  server: {
    host: true, // Listen on all addresses
    port: 5173,
    open: false // We control opening
  }
};
```

### Express with Nodemon
```json
// nodemon.json
{
  "watch": ["src"],
  "ext": "js,json",
  "ignore": ["src/**/*.spec.js"],
  "exec": "node src/index.js",
  "env": {
    "NODE_ENV": "development"
  }
}
```

## Error Handling

### Common Issues
```typescript
const errorHandlers = {
  portInUse: async (port: number) => {
    console.log(`⚠️ Port ${port} is in use`);
    const newPort = await findAvailablePort(port + 1);
    console.log(`Using port ${newPort} instead`);
    return newPort;
  },
  
  serverCrash: async (error: Error) => {
    console.error('💥 Dev server crashed:', error.message);
    console.log('Attempting to restart...');
    // Restart logic
  },
  
  networkError: (error: Error) => {
    console.error('🌐 Network error:', error.message);
    console.log('Check your network connection');
  }
};
```

## Best Practices

1. **Port Management**: Always check for available ports
2. **Error Recovery**: Gracefully handle server crashes
3. **Network Access**: Ensure firewall allows connections
4. **Hot Reload**: Configure for optimal DX
5. **Mobile Testing**: Test on real devices when possible
6. **Monorepo Support**: Detect and use appropriate build tools
7. **Multi-App Coordination**: Space out ports for concurrent servers
8. **Context Detection**: Auto-detect monorepo vs standalone
9. **Tool Integration**: Use nx serve, turbo dev, etc. when available
10. **Resource Management**: Clean up all processes on exit

## Monorepo Considerations

When working in monorepos:

1. **Use native tools**: Prefer `nx serve`, `turbo dev` over generic commands
2. **Port allocation**: Space apps by 100+ ports to avoid conflicts
3. **Concurrent servers**: Support running multiple apps simultaneously
4. **Shared dependencies**: Ensure shared packages are built first
5. **Hot reload scope**: Configure to watch only relevant packages

The Live Preview integration provides seamless development experience across frameworks, devices, and monorepo structures.