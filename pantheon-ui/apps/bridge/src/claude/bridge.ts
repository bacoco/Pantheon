import { spawn, ChildProcess } from 'child_process';
import { EventEmitter } from 'events';
import { logger } from '../utils/logger.js';
import { PantheonService } from '../services/pantheon-service.js';
import { SessionManager } from './session-manager.js';
import type { 
  PantheonCommand, 
  CommandResult, 
  ClaudeCodeOptions,
  StreamHandler 
} from '@pantheon-ui/types';

export class ClaudeCodeBridge extends EventEmitter {
  private claudeProcess: ChildProcess | null = null;
  private isReady = false;
  private commandQueue: Array<{
    command: string;
    resolve: (result: CommandResult) => void;
    reject: (error: Error) => void;
  }> = [];
  private currentOutput = '';
  private streamHandlers = new Map<string, StreamHandler>();
  private pantheonService: PantheonService;
  private sessionManager: SessionManager;
  private interactiveSessions = new Map<string, boolean>(); // socketId -> isInPantheonInit

  constructor(private options: ClaudeCodeOptions = {}) {
    super();
    this.options = {
      claudePath: process.env.CLAUDE_CODE_PATH || '/Users/loic/.claude/local/claude',
      workingDirectory: process.env.PANTHEON_PROJECT_PATH || process.cwd(),
      timeout: 300000, // 5 minutes default timeout
      ...options
    };
    this.pantheonService = new PantheonService(this.options.workingDirectory);
    this.sessionManager = new SessionManager(this.options.claudePath!);
  }

  /**
   * Initialize connection to Claude Code CLI
   */
  async initialize(): Promise<void> {
    // For now, we'll just verify Claude Code is available
    // We'll execute commands directly instead of keeping a process running
    try {
      logger.info('Verifying Claude Code CLI...');
      
      const testCommand = spawn(this.options.claudePath!, ['--version'], {
        cwd: this.options.workingDirectory,
        env: {
          ...process.env,
          FORCE_COLOR: '0',
        },
        shell: false
      });

      const output = await new Promise<string>((resolve, reject) => {
        let data = '';
        testCommand.stdout?.on('data', chunk => data += chunk.toString());
        testCommand.on('close', code => {
          if (code === 0) {
            resolve(data);
          } else {
            reject(new Error(`Claude Code exited with code ${code}`));
          }
        });
        testCommand.on('error', reject);
      });
      
      logger.info(`Claude Code CLI verified: ${output.trim()}`);
      this.isReady = true;
    } catch (error) {
      logger.error('Failed to verify Claude Code:', error);
      throw error;
    }
  }

  /**
   * Execute a Pantheon command
   */
  async executeCommand(command: PantheonCommand): Promise<CommandResult> {
    try {
      logger.debug(`Executing command: ${command.command}`);
      
      // First try to execute through Pantheon service (for special commands like /pantheon init)
      const commandLine = command.command + (command.args ? ' ' + command.args.join(' ') : '');
      const pantheonResult = await this.pantheonService.executeCommand(commandLine);
      
      // For Pantheon commands, always try to execute through Claude Code if available
      if ((commandLine.startsWith('/pantheon') || pantheonResult.artifacts?.some(a => a.type === 'command')) && this.isReady) {
        // Execute through Claude Code
        return await this.executeCommandThroughClaude(command, pantheonResult);
      }
      
      // For other results, return directly
      return {
        ...pantheonResult,
        timestamp: new Date(),
        command: command.command
      };
    } catch (error) {
      logger.error('Command execution error:', error);
      return {
        success: false,
        output: '',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date(),
        command: command.command
      };
    }
  }

  /**
   * Execute command through Claude Code CLI
   */
  private async executeCommandThroughClaude(
    command: PantheonCommand, 
    pantheonResult: CommandResult
  ): Promise<CommandResult> {
    return new Promise((resolve, reject) => {
      try {
        const fullCommand = command.command + (command.args ? ' ' + command.args.join(' ') : '');
        
        logger.info('Executing through Claude Code CLI:', { 
          command: fullCommand,
          claudePath: this.options.claudePath,
          cwd: this.options.workingDirectory
        });

        // Execute the command through Claude Code CLI with --print flag for non-interactive mode
        // This ensures we get the response back to display in the UI
        const args = ['--print', fullCommand];
        
        logger.info('Spawning Claude Code with command:', fullCommand);
        
        const claudeProcess = spawn(this.options.claudePath!, args, {
          cwd: this.options.workingDirectory,
          env: {
            ...process.env,
            FORCE_COLOR: '0',
            CLAUDE_MODEL: 'claude-3-5-sonnet-20241022', // Use Sonnet for faster responses
          },
          shell: false,
          stdio: ['pipe', 'pipe', 'pipe']
        });

        let output = '';
        let errorOutput = '';
        let hasResponded = false;

        // Capture stdout
        claudeProcess.stdout?.on('data', (data: Buffer) => {
          const chunk = data.toString();
          output += chunk;
          hasResponded = true;
          
          logger.debug('Claude Code stdout chunk:', chunk);
          
          // Stream output back to UI in real-time
          this.emit('output', chunk);
          
          // Also emit as chat response for the WebSocket handler
          this.emit('chat-response', {
            message: chunk,
            success: true,
            timestamp: new Date()
          });
        });

        // Capture stderr
        claudeProcess.stderr?.on('data', (data: Buffer) => {
          const chunk = data.toString();
          errorOutput += chunk;
          logger.debug('Claude Code stderr:', chunk);
        });

        // Handle process completion
        claudeProcess.on('close', (code) => {
          logger.info(`Claude Code process closed with code ${code}`);
          
          if (code === 0 || hasResponded) {
            resolve({
              success: true,
              output: output || 'Command executed successfully',
              timestamp: new Date(),
              command: command.command
            });
          } else {
            const errorMessage = errorOutput || `Claude Code exited with code ${code}`;
            logger.error('Claude Code failed:', errorMessage);
            
            resolve({
              success: false,
              output: output,
              error: errorMessage,
              timestamp: new Date(),
              command: command.command
            });
          }
        });

        // Handle process errors
        claudeProcess.on('error', (error) => {
          logger.error('Failed to start Claude Code:', error);
          resolve({
            success: false,
            error: `Failed to start Claude Code: ${error.message}`,
            timestamp: new Date(),
            command: command.command
          });
        });

        // Set a longer timeout for interactive sessions
        const timeoutDuration = fullCommand.includes('init') ? 600000 : this.options.timeout; // 10 min for init
        setTimeout(() => {
          if (!claudeProcess.killed) {
            logger.warn('Claude Code execution timeout, killing process');
            claudeProcess.kill();
            resolve({
              success: false,
              error: 'Claude Code execution timeout',
              timestamp: new Date(),
              command: command.command
            });
          }
        }, timeoutDuration);
      } catch (error) {
        logger.error('Exception in executeCommandThroughClaude:', error);
        resolve({
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date(),
          command: command.command
        });
      }
    });
  }

  /**
   * Get project files for file explorer
   */
  async getProjectFiles(projectId?: string): Promise<any> {
    try {
      return await this.pantheonService.getProjectFiles(projectId);
    } catch (error) {
      logger.error('Failed to get project files:', error);
      throw error;
    }
  }

  /**
   * Get Pantheon status
   */
  async getPantheonStatus(): Promise<any> {
    try {
      return await this.pantheonService.getStatus();
    } catch (error) {
      logger.error('Failed to get Pantheon status:', error);
      return {
        initialized: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
  
  /**
   * Execute basic shell commands without Claude Code
   */
  private async executeBasicCommand(command: PantheonCommand): Promise<CommandResult> {
    const startTime = Date.now();
    
    // Handle /help command
    if (command.command === '/help') {
      try {
        // Try to get commands from real Pantheon
        const commandMap = await this.pantheonService.loadCommands();
        if (commandMap.size > 0) {
          const commandList = Array.from(commandMap.entries())
            .map(([name, cmd]) => `• **/${name}** - ${cmd.description || 'No description'}`)
            .join('\n');
          
          return {
            success: true,
            output: `Available commands:\n\n${commandList}`,
            timestamp: new Date(),
            command: command.command
          };
        }
      } catch (error) {
        logger.debug('Failed to get real commands, using defaults');
      }
      
      // Fallback to default commands
      return {
        success: true,
        output: `Available commands:

• **/help** - Show this help message
• **/pantheon init** - Initialize Pantheon in current project
• **/analyze <task>** - Analyze a task
• **/orchestrate <task>** - Orchestrate specialist agents
• **/generate-prp <task>** - Generate Product Requirements Prompt
• **/execute-prp <file>** - Execute a Product Requirements Prompt
• **/agent [name]** - Transform into specialist agent
• **/team [name]** - Activate pre-configured agent teams
• **/workflow [name]** - Execute multi-agent workflows`,
        timestamp: new Date(),
        command: command.command
      };
    }
    
    
    // Try to execute command through Pantheon service
    try {
      // Build the full command line string for Pantheon service
      const commandLine = command.command + (command.args ? ' ' + command.args.join(' ') : '');
      const pantheonResult = await this.pantheonService.executeCommand(commandLine);
      
      if (pantheonResult.success) {
        return {
          ...pantheonResult,
          timestamp: new Date(),
          command: command.command
        };
      }
      
      // If Pantheon service returned an error, use it
      if (pantheonResult.error) {
        return pantheonResult;
      }
    } catch (error) {
      logger.debug('Failed to execute through Pantheon:', error);
    }
    
    // Fallback for unimplemented commands
    return {
      success: true,
      output: `Command '${command.command}' is not yet implemented in this UI.

To use real Pantheon commands:
1. Run '/pantheon init' to initialize Pantheon in your project
2. Ensure .claude/ directory exists with command files
3. Commands will be loaded from .claude/commands/`,
      timestamp: new Date(),
      command: command.command
    };
  }

  /**
   * Stream command output in real-time
   */
  streamCommand(
    command: PantheonCommand, 
    handler: StreamHandler
  ): string {
    const streamId = Math.random().toString(36).substring(7);
    this.streamHandlers.set(streamId, handler);

    this.executeCommand(command)
      .then(result => {
        handler.onComplete?.(result);
        this.streamHandlers.delete(streamId);
      })
      .catch(error => {
        handler.onError?.(error);
        this.streamHandlers.delete(streamId);
      });

    return streamId;
  }

  /**
   * Cancel a streaming command
   */
  cancelStream(streamId: string): void {
    const handler = this.streamHandlers.get(streamId);
    if (handler) {
      handler.onError?.(new Error('Stream cancelled'));
      this.streamHandlers.delete(streamId);
    }
  }

  /**
   * Check if Claude Code is available
   */
  isAvailable(): boolean {
    return this.isReady && this.claudeProcess !== null;
  }

  /**
   * Shutdown the Claude Code process
   */
  async shutdown(): Promise<void> {
    // Close all interactive sessions
    await this.sessionManager.closeAllSessions();
    
    if (this.claudeProcess) {
      logger.info('Shutting down Claude Code CLI...');
      this.isReady = false;
      
      // Send exit command
      this.claudeProcess.stdin?.write('exit\n');
      
      // Give it time to shutdown gracefully
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Force kill if still running
      if (!this.claudeProcess.killed) {
        this.claudeProcess.kill();
      }
      
      this.claudeProcess = null;
      this.commandQueue = [];
      this.streamHandlers.clear();
    }
  }

  /**
   * Start an interactive session for a socket
   */
  async startInteractiveSession(socketId: string): Promise<void> {
    try {
      const session = await this.sessionManager.createSession(
        socketId,
        this.options.workingDirectory!
      );
      
      // Set up event handlers for this session
      session.on('output', (chunk: string) => {
        this.emit(`session-output-${socketId}`, chunk);
      });
      
      session.on('response', (response: any) => {
        this.emit(`session-response-${socketId}`, response);
      });
      
      session.on('error', (error: Error) => {
        logger.error(`Session error for ${socketId}:`, error);
        this.emit(`session-error-${socketId}`, error);
      });
      
      session.on('exit', (code: number) => {
        logger.info(`Session exited for ${socketId} with code ${code}`);
        this.interactiveSessions.delete(socketId);
      });
      
      logger.info(`Started interactive session for socket ${socketId}`);
    } catch (error) {
      logger.error('Failed to start interactive session:', error);
      throw error;
    }
  }

  /**
   * Send a message to an interactive session
   */
  async sendToSession(socketId: string, message: string): Promise<void> {
    const session = this.sessionManager.getSession(socketId);
    if (!session) {
      throw new Error(`No active session for socket ${socketId}`);
    }
    
    await session.sendMessage(message);
  }

  /**
   * Check if socket has an active session
   */
  hasActiveSession(socketId: string): boolean {
    const session = this.sessionManager.getSession(socketId);
    return session?.isActive() || false;
  }

  /**
   * Set whether a socket is in Pantheon init flow
   */
  setInPantheonInit(socketId: string, inInit: boolean): void {
    if (inInit) {
      this.interactiveSessions.set(socketId, true);
    } else {
      this.interactiveSessions.delete(socketId);
    }
  }

  /**
   * Check if socket is in Pantheon init flow
   */
  isInPantheonInit(socketId: string): boolean {
    return this.interactiveSessions.get(socketId) || false;
  }

  /**
   * Close session for a socket
   */
  async closeSession(socketId: string): Promise<void> {
    await this.sessionManager.closeSession(socketId);
    this.interactiveSessions.delete(socketId);
  }

  private setupProcessHandlers(): void {
    if (!this.claudeProcess) return;

    // Handle stdout
    this.claudeProcess.stdout?.on('data', (data: Buffer) => {
      const output = data.toString();
      this.currentOutput += output;
      
      // Emit output for streaming
      this.emit('output', output);
      
      // Notify stream handlers
      for (const handler of this.streamHandlers.values()) {
        handler.onData?.(output);
      }
      
      // Check if Claude is ready
      if (!this.isReady && this.detectReady(output)) {
        this.isReady = true;
        this.emit('ready');
      }
      
      // Check if command is complete
      this.checkCommandComplete();
    });

    // Handle stderr
    this.claudeProcess.stderr?.on('data', (data: Buffer) => {
      const error = data.toString();
      logger.error('Claude Code stderr:', error);
      this.emit('error', error);
    });

    // Handle process exit
    this.claudeProcess.on('exit', (code) => {
      logger.info(`Claude Code process exited with code ${code}`);
      this.isReady = false;
      this.claudeProcess = null;
      this.emit('exit', code);
      
      // Reject all pending commands
      this.commandQueue.forEach(({ reject }) => {
        reject(new Error('Claude Code process exited'));
      });
      this.commandQueue = [];
    });

    // Handle process errors
    this.claudeProcess.on('error', (error) => {
      logger.error('Claude Code process error:', error);
      this.emit('error', error);
    });
  }

  private waitForReady(): Promise<void> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Claude Code initialization timeout'));
      }, 30000);

      this.once('ready', () => {
        clearTimeout(timeout);
        resolve();
      });

      this.once('error', (error) => {
        clearTimeout(timeout);
        reject(error);
      });
    });
  }

  private detectReady(output: string): boolean {
    // Look for Claude's prompt or ready indicator
    return output.includes('claude>') || 
           output.includes('Ready') ||
           output.includes('Claude Code');
  }

  private formatCommand(command: PantheonCommand): string {
    let formattedCommand = command.command;
    
    // Add any arguments
    if (command.args) {
      formattedCommand += ' ' + command.args.join(' ');
    }
    
    // Add context if provided
    if (command.context) {
      formattedCommand = `Context: ${JSON.stringify(command.context)}\n${formattedCommand}`;
    }
    
    return formattedCommand;
  }

  private processNextCommand(): void {
    if (this.commandQueue.length === 0 || !this.claudeProcess?.stdin) {
      return;
    }

    const { command } = this.commandQueue[0];
    this.currentOutput = '';
    
    logger.debug(`Executing command: ${command}`);
    this.claudeProcess.stdin.write(command + '\n');
  }

  private checkCommandComplete(): void {
    // Look for command completion indicators
    if (this.detectCommandComplete(this.currentOutput)) {
      const completedCommand = this.commandQueue.shift();
      
      if (completedCommand) {
        const result: CommandResult = {
          success: !this.detectError(this.currentOutput),
          output: this.cleanOutput(this.currentOutput),
          timestamp: new Date(),
          command: completedCommand.command
        };
        
        if (!result.success) {
          result.error = this.extractError(this.currentOutput);
        }
        
        completedCommand.resolve(result);
      }
      
      // Process next command
      this.processNextCommand();
    }
  }

  private detectCommandComplete(output: string): boolean {
    // Look for Claude's prompt indicating command completion
    return output.includes('claude>') || 
           output.includes('Command complete') ||
           output.includes('Done');
  }

  private detectError(output: string): boolean {
    return output.toLowerCase().includes('error') ||
           output.toLowerCase().includes('failed') ||
           output.toLowerCase().includes('exception');
  }

  private extractError(output: string): string {
    const errorMatch = output.match(/error:?\s*(.+)/i);
    return errorMatch ? errorMatch[1] : 'Unknown error';
  }

  private cleanOutput(output: string): string {
    // Remove Claude prompts and clean up output
    return output
      .replace(/claude>/g, '')
      .replace(/Command complete/g, '')
      .replace(/Done/g, '')
      .trim();
  }
}