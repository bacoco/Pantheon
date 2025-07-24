import fs from 'fs/promises';
import path from 'path';
import { createLogger } from '../utils/logger.js';
import { fileURLToPath } from 'url';
import type { 
  BacoCommand, 
  CommandResult, 
  BacoStatus, 
  BacoMemoryPattern 
} from './baco-types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const logger = createLogger('BacoService');

export class BacoService {
  private workingDirectory: string;
  private claudeDirectory: string;
  private commandsDirectory: string;
  private commandCache: Map<string, BacoCommand> = new Map();

  constructor(workingDirectory: string = process.cwd()) {
    this.workingDirectory = workingDirectory;
    this.claudeDirectory = path.join(workingDirectory, '.claude');
    this.commandsDirectory = path.join(this.claudeDirectory, 'commands');
  }

  /**
   * Check if .claude directory exists in the working directory
   */
  async checkClaudeDirectory(): Promise<boolean> {
    try {
      await fs.access(this.claudeDirectory);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Initialize BACO - this is now handled by Claude Code itself
   */
  async initBaco(projectName?: string): Promise<CommandResult> {
    // This method is no longer used - /baco init goes directly to Claude Code
    return {
      success: true,
      output: 'Please use /baco init command to start an interactive session with Claude Code.',
      artifacts: [{
        type: 'command',
        name: 'baco',
        args: 'init' + (projectName ? ` ${projectName}` : ''),
        metadata: { requiresClaudeCode: true }
      }]
    };
  }

  /**
   * DEPRECATED - Old initialization code
   */
  async initBacoOld(projectName?: string): Promise<CommandResult> {
    try {
      let targetDirectory = this.workingDirectory;
      let projectPath = this.workingDirectory;

      // If project name is provided, create a new directory
      if (projectName) {
        projectPath = path.join(this.workingDirectory, projectName);
        
        // Check if project directory already exists
        try {
          await fs.access(projectPath);
          return {
            success: false,
            error: `Project directory '${projectName}' already exists`
          };
        } catch {
          // Directory doesn't exist, create it
          await fs.mkdir(projectPath, { recursive: true });
          targetDirectory = projectPath;
        }
      }

      // Check if already initialized in target directory
      const targetClaudeDir = path.join(targetDirectory, '.claude');
      try {
        await fs.access(targetClaudeDir);
        return {
          success: false,
          error: projectName 
            ? `BACO is already initialized in project '${projectName}'`
            : 'BACO is already initialized in this directory'
        };
      } catch {
        // Good, .claude doesn't exist yet
      }

      // Create directory structure
      const directories = [
        targetClaudeDir,
        path.join(targetClaudeDir, 'commands'),
        path.join(targetClaudeDir, 'agents'),
        path.join(targetClaudeDir, 'memory'),
        path.join(targetClaudeDir, 'templates'),
        path.join(targetClaudeDir, 'workflows')
      ];

      for (const dir of directories) {
        await fs.mkdir(dir, { recursive: true });
      }

      // Create default files in the new location
      const originalClaudeDir = this.claudeDirectory;
      const originalCommandsDir = this.commandsDirectory;
      
      // Temporarily update paths for file creation
      this.claudeDirectory = targetClaudeDir;
      this.commandsDirectory = path.join(targetClaudeDir, 'commands');
      
      await this.createDefaultFiles();
      
      // Restore original paths
      this.claudeDirectory = originalClaudeDir;
      this.commandsDirectory = originalCommandsDir;

      // If project was created, also create basic project files
      if (projectName) {
        // Create package.json
        const packageJson = {
          name: projectName,
          version: "0.1.0",
          private: true,
          description: `BACO-enabled project: ${projectName}`,
          scripts: {
            start: "echo 'Configure your start script'",
            build: "echo 'Configure your build script'",
            test: "echo 'Configure your test script'"
          }
        };
        await fs.writeFile(
          path.join(projectPath, 'package.json'),
          JSON.stringify(packageJson, null, 2)
        );

        // Create README
        const readmeContent = `# ${projectName}

This is a BACO-enabled project with AI-powered development capabilities.

## Getting Started

BACO has been initialized in this project. You can now use natural language commands to:

- Generate code: "create a React component for user authentication"
- Analyze tasks: "/analyze implement payment processing"
- Plan projects: "/generate-prp e-commerce platform"
- Create apps: "/baco create-app web my-app"

## Available Commands

Run \`/help\` in the BACO UI to see all available commands.

## Project Structure

\`\`\`
${projectName}/
├── .claude/          # BACO configuration and commands
│   ├── commands/     # Command definitions
│   ├── agents/       # AI agent configurations
│   ├── workflows/    # Multi-step workflows
│   └── memory/       # Context and patterns
├── package.json
└── README.md
\`\`\`
`;
        await fs.writeFile(path.join(projectPath, 'README.md'), readmeContent);
      }

      logger.info('BACO initialized successfully', { 
        targetDirectory,
        projectName,
        projectPath
      });

      return {
        success: true,
        output: projectName
          ? `BACO project '${projectName}' created successfully!\n\nProject location: ${projectPath}\n\nNext steps:\n1. cd ${projectName}\n2. Start coding with natural language or commands\n3. Run /help to see available commands`
          : 'BACO initialized successfully in current directory.\n\nYou can now use natural language commands to code!'
      };
    } catch (error) {
      logger.error('Failed to initialize BACO', { error });
      return {
        success: false,
        error: `Failed to initialize BACO: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Create default BACO files
   */
  private async createDefaultFiles(): Promise<void> {
    // Create README
    const readmeContent = `# BACO - Beyond Automated Context Orchestrator

This directory contains BACO configuration and commands for enhanced Claude Code interactions.

## Directory Structure
- commands/ - BACO command definitions
- agents/ - Specialist agent configurations
- memory/ - Pattern memory and context storage
- templates/ - Reusable templates
- workflows/ - Multi-step workflow definitions

## Quick Start
Use /help in Claude Code to see available commands.
`;
    await fs.writeFile(path.join(this.claudeDirectory, 'README.md'), readmeContent);

    // Create default help command
    const helpCommand = `# /help Command

## ACTIVATION
When the user types /help, show available BACO commands.

## OUTPUT FORMAT
\`\`\`yaml
available_commands:
  - name: help
    description: Show this help message
  - name: analyze
    description: Perform multi-dimensional complexity analysis
  - name: orchestrate
    description: Coordinate specialist agents for insights
  - name: generate-prp
    description: Generate Product Requirements Prompt
  - name: execute-prp
    description: Execute a Product Requirements Prompt
\`\`\`

## INSTRUCTIONS
1. List all available commands from the .claude/commands directory
2. Show brief description for each command
3. Suggest next steps based on user's context
`;
    await fs.writeFile(path.join(this.commandsDirectory, 'help.md'), helpCommand);

    // Create memory patterns file
    const memoryPatterns: BacoMemoryPattern = {
      patterns: [],
      version: "1.0.0",
      lastUpdated: new Date().toISOString()
    };
    await fs.writeFile(
      path.join(this.claudeDirectory, 'memory', 'patterns.json'),
      JSON.stringify(memoryPatterns, null, 2)
    );
  }

  /**
   * Load all available commands
   */
  async loadCommands(): Promise<Map<string, BacoCommand>> {
    try {
      this.commandCache.clear();

      const files = await fs.readdir(this.commandsDirectory);
      const commandFiles = files.filter(f => f.endsWith('.md'));

      for (const file of commandFiles) {
        const commandName = path.basename(file, '.md');
        const filePath = path.join(this.commandsDirectory, file);
        const content = await fs.readFile(filePath, 'utf-8');

        const command: BacoCommand = {
          name: commandName,
          description: this.extractDescription(content),
          content,
          metadata: this.extractMetadata(content)
        };

        this.commandCache.set(commandName, command);
      }

      logger.info('Loaded BACO commands', { count: this.commandCache.size });
      return this.commandCache;
    } catch (error) {
      logger.error('Failed to load commands', { error });
      return new Map();
    }
  }

  /**
   * Get a specific command
   */
  async getCommand(commandName: string): Promise<BacoCommand | null> {
    // Check cache first
    if (this.commandCache.has(commandName)) {
      return this.commandCache.get(commandName)!;
    }

    // Try to load from file
    try {
      const filePath = path.join(this.commandsDirectory, `${commandName}.md`);
      const content = await fs.readFile(filePath, 'utf-8');

      const command: BacoCommand = {
        name: commandName,
        description: this.extractDescription(content),
        content,
        metadata: this.extractMetadata(content)
      };

      this.commandCache.set(commandName, command);
      return command;
    } catch (error) {
      logger.error('Command not found', { commandName, error });
      return null;
    }
  }

  /**
   * Parse and execute a BACO command
   */
  async executeCommand(commandLine: string): Promise<CommandResult> {
    try {
      // Parse command line
      const parts = commandLine.trim().split(/\s+/);
      const commandName = parts[0].startsWith('/') ? parts[0].substring(1) : parts[0];
      const args = parts.slice(1).join(' ');

      // Remove special handling - let all commands go through Claude Code
      // The baco.md file will tell Claude Code how to handle /baco init

      // Special handling for chat command (natural language)
      if (commandName === 'chat') {
        // For chat commands, return the chat.md template
        const chatCommand = await this.getCommand('chat');
        if (chatCommand) {
          return {
            success: true,
            output: chatCommand.content,
            artifacts: [{
              type: 'command',
              name: 'chat',
              args: args,
              metadata: { isNaturalLanguage: true }
            }]
          };
        }
      }

      // For /baco init, we don't need .claude to exist yet
      if (commandName !== 'baco' && !await this.checkClaudeDirectory()) {
        return {
          success: false,
          error: 'BACO is not initialized. Run "/baco init" first.'
        };
      }

      // Get command
      const command = await this.getCommand(commandName);
      if (!command) {
        return {
          success: false,
          error: `Command not found: ${commandName}. Use /help to see available commands.`
        };
      }

      // Return command content for Claude to execute
      return {
        success: true,
        output: command.content,
        artifacts: [{
          type: 'command',
          name: commandName,
          args: args,
          metadata: command.metadata
        }]
      };
    } catch (error) {
      logger.error('Failed to execute command', { commandLine, error });
      return {
        success: false,
        error: `Failed to execute command: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * List all available commands
   */
  async listCommands(): Promise<string[]> {
    const commands = await this.loadCommands();
    return Array.from(commands.keys()).sort();
  }

  /**
   * Extract description from command markdown
   */
  private extractDescription(content: string): string {
    const lines = content.split('\n');
    for (const line of lines) {
      if (line.trim() && !line.startsWith('#') && !line.startsWith('##')) {
        return line.trim();
      }
    }
    return 'No description available';
  }

  /**
   * Extract metadata from command markdown
   */
  private extractMetadata(content: string): any {
    const metadataMatch = content.match(/```yaml\s*metadata:([\s\S]*?)```/);
    if (metadataMatch) {
      try {
        // Simple YAML parsing for basic key-value pairs
        const metadata: any = {};
        const lines = metadataMatch[1].trim().split('\n');
        for (const line of lines) {
          const match = line.match(/^\s*(\w+):\s*(.+)$/);
          if (match) {
            metadata[match[1]] = match[2].trim();
          }
        }
        return metadata;
      } catch {
        return {};
      }
    }
    return {};
  }

  /**
   * Get BACO system status
   */
  async getStatus(): Promise<BacoStatus> {
    const isInitialized = await this.checkClaudeDirectory();
    if (!isInitialized) {
      return {
        initialized: false,
        message: 'BACO not initialized'
      };
    }

    const commands = await this.loadCommands();
    
    // Count files in each directory
    const countFiles = async (dir: string): Promise<number> => {
      try {
        const files = await fs.readdir(dir);
        return files.length;
      } catch {
        return 0;
      }
    };

    return {
      initialized: true,
      workingDirectory: this.workingDirectory,
      commands: {
        count: commands.size,
        list: Array.from(commands.keys())
      },
      structure: {
        agents: await countFiles(path.join(this.claudeDirectory, 'agents')),
        templates: await countFiles(path.join(this.claudeDirectory, 'templates')),
        workflows: await countFiles(path.join(this.claudeDirectory, 'workflows')),
        memory: await countFiles(path.join(this.claudeDirectory, 'memory'))
      }
    };
  }

  /**
   * Get project files for file explorer
   */
  async getProjectFiles(rootPath?: string): Promise<any> {
    const projectPath = rootPath || this.workingDirectory;
    
    const buildFileTree = async (dirPath: string, basePath: string): Promise<any[]> => {
      const files: any[] = [];
      
      try {
        const entries = await fs.readdir(dirPath, { withFileTypes: true });
        
        for (const entry of entries) {
          // Skip node_modules and hidden files (except .claude)
          if (entry.name === 'node_modules' || 
              (entry.name.startsWith('.') && entry.name !== '.claude')) {
            continue;
          }
          
          const fullPath = path.join(dirPath, entry.name);
          const relativePath = path.relative(projectPath, fullPath);
          
          if (entry.isDirectory()) {
            const children = await buildFileTree(fullPath, basePath);
            files.push({
              name: entry.name,
              path: '/' + relativePath.replace(/\\/g, '/'),
              type: 'directory',
              children: children.length > 0 ? children : undefined
            });
          } else {
            files.push({
              name: entry.name,
              path: '/' + relativePath.replace(/\\/g, '/'),
              type: 'file'
            });
          }
        }
      } catch (error) {
        logger.error('Error reading directory:', { dirPath, error });
      }
      
      return files.sort((a, b) => {
        // Directories first, then files
        if (a.type !== b.type) {
          return a.type === 'directory' ? -1 : 1;
        }
        return a.name.localeCompare(b.name);
      });
    };
    
    const files = await buildFileTree(projectPath, projectPath);
    
    return {
      id: path.basename(projectPath),
      name: path.basename(projectPath),
      path: projectPath,
      files
    };
  }
}

// Export singleton instance for convenience
export const bacoService = new BacoService();