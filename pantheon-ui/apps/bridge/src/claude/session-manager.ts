import { spawn, ChildProcess } from 'child_process';
import { EventEmitter } from 'events';
import { logger } from '../utils/logger.js';
import { v4 as uuidv4 } from 'uuid';

export interface SessionOptions {
  claudePath: string;
  workingDirectory: string;
  sessionId?: string;
  model?: string;
}

export interface SessionMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export class ClaudeSession extends EventEmitter {
  private process: ChildProcess | null = null;
  private sessionId: string;
  private isReady = false;
  private messageQueue: string[] = [];
  private currentOutput = '';
  private conversation: SessionMessage[] = [];
  private isProcessing = false;

  constructor(private options: SessionOptions) {
    super();
    this.sessionId = options.sessionId || uuidv4();
  }

  async start(): Promise<void> {
    if (this.process) {
      logger.warn('Session already started');
      return;
    }

    logger.info(`Starting Claude session ${this.sessionId}`);

    // Start Claude Code in interactive mode with session ID
    const args = [
      '--session-id', this.sessionId,
      '--model', this.options.model || 'claude-3-5-sonnet-20241022'
    ];

    this.process = spawn(this.options.claudePath, args, {
      cwd: this.options.workingDirectory,
      env: {
        ...process.env,
        FORCE_COLOR: '0',
      },
      shell: false,
      stdio: ['pipe', 'pipe', 'pipe']
    });

    this.setupProcessHandlers();

    // Wait for Claude to be ready
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Claude session startup timeout'));
      }, 10000);

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

  private setupProcessHandlers(): void {
    if (!this.process) return;

    // Handle stdout
    this.process.stdout?.on('data', (data: Buffer) => {
      const chunk = data.toString();
      this.currentOutput += chunk;
      
      logger.debug(`Session ${this.sessionId} stdout:`, chunk);
      
      // Emit output chunks for real-time display
      this.emit('output', chunk);
      
      // Check if Claude is ready (look for prompt)
      if (!this.isReady && this.detectReady(chunk)) {
        this.isReady = true;
        this.emit('ready');
        this.processQueue();
      }
      
      // Check if response is complete
      if (this.isProcessing && this.detectComplete(this.currentOutput)) {
        this.handleCompleteResponse();
      }
    });

    // Handle stderr
    this.process.stderr?.on('data', (data: Buffer) => {
      const error = data.toString();
      logger.error(`Session ${this.sessionId} stderr:`, error);
      this.emit('error', new Error(error));
    });

    // Handle process exit
    this.process.on('exit', (code) => {
      logger.info(`Session ${this.sessionId} exited with code ${code}`);
      this.isReady = false;
      this.process = null;
      this.emit('exit', code);
    });

    // Handle process errors
    this.process.on('error', (error) => {
      logger.error(`Session ${this.sessionId} error:`, error);
      this.emit('error', error);
    });
  }

  private detectReady(output: string): boolean {
    // Claude Code shows a prompt when ready
    return output.includes('Human:') || 
           output.includes('Assistant:') ||
           output.includes('?') ||
           output.includes('Claude');
  }

  private detectComplete(output: string): boolean {
    // Detect when Claude has finished responding
    // Look for typical end patterns or a pause in output
    const lines = output.split('\n');
    const lastLine = lines[lines.length - 1] || lines[lines.length - 2];
    
    // Claude typically ends with a question or statement
    return lastLine.trim().length > 0 && 
           (lastLine.includes('?') || 
            lastLine.includes('.') ||
            output.includes('Human:'));
  }

  private handleCompleteResponse(): void {
    if (!this.isProcessing) return;
    
    const response = this.cleanOutput(this.currentOutput);
    
    // Add to conversation history
    this.conversation.push({
      role: 'assistant',
      content: response,
      timestamp: new Date()
    });
    
    // Emit the complete response
    this.emit('response', {
      content: response,
      sessionId: this.sessionId,
      timestamp: new Date()
    });
    
    // Reset for next message
    this.currentOutput = '';
    this.isProcessing = false;
    
    // Process next message in queue
    this.processQueue();
  }

  private cleanOutput(output: string): string {
    // Remove prompts and clean up the output
    return output
      .replace(/Human:\s*/g, '')
      .replace(/Assistant:\s*/g, '')
      .replace(/^\s*Claude\s*$/gm, '')
      .trim();
  }

  async sendMessage(message: string): Promise<void> {
    if (!message.trim()) return;
    
    // Add to conversation history
    this.conversation.push({
      role: 'user',
      content: message,
      timestamp: new Date()
    });
    
    // Add to queue
    this.messageQueue.push(message);
    
    // Process queue if ready
    if (this.isReady && !this.isProcessing) {
      this.processQueue();
    }
  }

  private processQueue(): void {
    if (this.messageQueue.length === 0 || !this.process?.stdin || this.isProcessing) {
      return;
    }
    
    const message = this.messageQueue.shift()!;
    this.isProcessing = true;
    this.currentOutput = '';
    
    logger.info(`Session ${this.sessionId} sending message:`, message);
    this.process.stdin.write(message + '\n');
  }

  async stop(): Promise<void> {
    if (!this.process) return;
    
    logger.info(`Stopping session ${this.sessionId}`);
    
    // Send exit command
    if (this.process.stdin) {
      this.process.stdin.write('exit\n');
    }
    
    // Give it time to shutdown gracefully
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Force kill if still running
    if (this.process && !this.process.killed) {
      this.process.kill();
    }
    
    this.process = null;
    this.isReady = false;
  }

  getSessionId(): string {
    return this.sessionId;
  }

  getConversation(): SessionMessage[] {
    return [...this.conversation];
  }

  isActive(): boolean {
    return this.process !== null && this.isReady;
  }
}

export class SessionManager {
  private sessions = new Map<string, ClaudeSession>();
  private activeSessions = new Map<string, string>(); // socketId -> sessionId

  constructor(private claudePath: string) {}

  async createSession(
    socketId: string, 
    workingDirectory: string,
    options?: { sessionId?: string; model?: string }
  ): Promise<ClaudeSession> {
    // Check if socket already has an active session
    const existingSessionId = this.activeSessions.get(socketId);
    if (existingSessionId) {
      const existingSession = this.sessions.get(existingSessionId);
      if (existingSession?.isActive()) {
        logger.info(`Reusing existing session ${existingSessionId} for socket ${socketId}`);
        return existingSession;
      }
    }

    // Create new session
    const session = new ClaudeSession({
      claudePath: this.claudePath,
      workingDirectory,
      ...options
    });

    await session.start();

    const sessionId = session.getSessionId();
    this.sessions.set(sessionId, session);
    this.activeSessions.set(socketId, sessionId);

    logger.info(`Created session ${sessionId} for socket ${socketId}`);
    return session;
  }

  getSession(socketId: string): ClaudeSession | undefined {
    const sessionId = this.activeSessions.get(socketId);
    if (!sessionId) return undefined;
    
    return this.sessions.get(sessionId);
  }

  async closeSession(socketId: string): Promise<void> {
    const sessionId = this.activeSessions.get(socketId);
    if (!sessionId) return;

    const session = this.sessions.get(sessionId);
    if (session) {
      await session.stop();
      this.sessions.delete(sessionId);
    }

    this.activeSessions.delete(socketId);
    logger.info(`Closed session ${sessionId} for socket ${socketId}`);
  }

  async closeAllSessions(): Promise<void> {
    const promises = Array.from(this.sessions.values()).map(session => session.stop());
    await Promise.all(promises);
    
    this.sessions.clear();
    this.activeSessions.clear();
    logger.info('Closed all sessions');
  }
}