import { Server, Socket } from 'socket.io';
import { ClaudeCodeBridge } from '../claude/bridge.js';
import { logger } from '../utils/logger.js';
import { z } from 'zod';
import type { BacoCommand, StreamHandler } from '@baco-ui/types';

// WebSocket event schemas
const executeCommandSchema = z.object({
  name: z.string(),
  parameters: z.record(z.any()).optional()
});

const cancelStreamSchema = z.object({
  streamId: z.string()
});

// Active streams per client
const activeStreams = new Map<string, Set<string>>();

export function setupWebSocketHandlers(io: Server, bridge: ClaudeCodeBridge) {
  io.on('connection', (socket: Socket) => {
    logger.info(`Client connected: ${socket.id}`);
    
    // Initialize client stream tracking
    activeStreams.set(socket.id, new Set());
    
    // Send initial connection status
    socket.emit('status', {
      connected: true,
      claudeAvailable: bridge.isAvailable()
    });
    
    // Log all incoming events for debugging
    socket.onAny((event, ...args) => {
      logger.info(`Received event '${event}' from ${socket.id}:`, args);
    });
    
    // Handle command execution
    socket.on('executeCommand', async (data, callback) => {
      try {
        const payload = executeCommandSchema.parse(data);
        
        // Format command with / prefix if not present
        const commandName = payload.name.startsWith('/') ? payload.name : `/${payload.name}`;
        
        // Build command arguments from parameters
        const args = payload.parameters?.input ? [payload.parameters.input] : [];
        
        const command: BacoCommand = {
          command: commandName,
          args: args.length > 0 ? args : undefined,
          context: payload.parameters
        };
        
        logger.info(`Executing command from ${socket.id}: ${commandName}`, { args });
        
        // Execute command
        const result = await bridge.executeCommand(command);
        
        // Send result back as assistant message
        socket.emit('commandExecuted', {
          execution: {
            id: Date.now().toString(),
            commandName: commandName,
            status: result.success ? 'completed' : 'failed',
            output: result.output,
            error: result.error,
            timestamp: result.timestamp
          }
        });
        
        callback?.({ success: true });
      } catch (error) {
        logger.error('Command execution error:', error);
        
        const errorMessage = error instanceof z.ZodError
          ? 'Invalid command format'
          : error instanceof Error
          ? error.message
          : 'Unknown error';
        
        socket.emit('commandError', {
          executionId: Date.now().toString(),
          error: errorMessage
        });
        
        callback?.({ success: false, error: errorMessage });
      }
    });
    
    // Handle stream cancellation
    socket.on('cancel-stream', (data, callback) => {
      try {
        const { streamId } = cancelStreamSchema.parse(data);
        
        bridge.cancelStream(streamId);
        activeStreams.get(socket.id)?.delete(streamId);
        
        callback?.({ success: true });
      } catch (error) {
        logger.error('Stream cancellation error:', error);
        callback?.({ success: false, error: 'Failed to cancel stream' });
      }
    });
    
    // Handle natural language input
    socket.on('chat', async (data, callback) => {
      try {
        const { message, context } = z.object({
          message: z.string(),
          context: z.record(z.any()).optional()
        }).parse(data);
        
        logger.info(`Chat message from ${socket.id}: ${message}`);
        
        // Check if this is /baco init command
        if (message.trim() === '/baco init' || message.trim().startsWith('/baco init ')) {
          // Start interactive session for BACO init
          try {
            await bridge.startInteractiveSession(socket.id);
            bridge.setInBacoInit(socket.id, true);
            
            // Set up session event handlers
            setupSessionHandlers(socket, bridge);
            
            // Send the /baco init command to the session
            await bridge.sendToSession(socket.id, message);
            
            callback?.({ success: true });
            return;
          } catch (error) {
            logger.error('Failed to start BACO init session:', error);
            socket.emit('chat-response', {
              message: 'Failed to start interactive session. Please try again.',
              success: false,
              error: error instanceof Error ? error.message : 'Unknown error'
            });
            callback?.({ success: false });
            return;
          }
        }
        
        // Check if we're in an interactive session
        if (bridge.hasActiveSession(socket.id)) {
          // Send message to the active session
          await bridge.sendToSession(socket.id, message);
          callback?.({ success: true });
          return;
        }
        
        // Check if BACO is initialized for non-session commands
        const bacoStatus = await bridge.getBacoStatus();
        
        if (!bacoStatus.initialized) {
          socket.emit('chat-response', {
            message: 'BACO is not initialized. Please run `/baco init` first to enable chatbot functionality.',
            success: false
          });
          callback?.({ success: true });
          return;
        }
        
        // Convert natural language to BACO command or pass through
        const command = await nlpToBacoCommand(message, context);
        
        // Execute the command
        const result = await bridge.executeCommand(command);
        
        // Send result back as chat response
        socket.emit('chat-response', {
          message: result.output,
          command: command.command,
          success: result.success,
          error: result.error
        });
        
        callback?.({ success: true });
      } catch (error) {
        logger.error('Chat processing error:', error);
        
        socket.emit('chat-error', {
          error: error instanceof Error ? error.message : 'Failed to process message'
        });
        
        callback?.({ success: false, error: 'Failed to process message' });
      }
    });
    
    // Handle getting project files
    socket.on('getProjectFiles', async (projectId, callback) => {
      try {
        logger.info(`Getting project files for: ${projectId} from ${socket.id}`);
        
        // Get real project files from BacoService
        const projectFiles = await bridge.getProjectFiles(projectId);
        
        logger.info(`Sending project files to ${socket.id}:`, {
          id: projectFiles.id,
          name: projectFiles.name,
          path: projectFiles.path,
          fileCount: projectFiles.files?.length || 0
        });
        
        // Send project files to client
        socket.emit('projectFiles', projectFiles);
        
        callback?.({ success: true });
      } catch (error) {
        logger.error('Get project files error:', error);
        callback?.({ success: false, error: 'Failed to get project files' });
      }
    });
    
    // Handle project change
    socket.on('change-project', async (data, callback) => {
      try {
        const { path } = z.object({
          path: z.string()
        }).parse(data);
        
        const result = await bridge.executeCommand({
          command: 'cd',
          args: [path],
          timeout: 5000
        });
        
        if (result.success) {
          // Broadcast project change to all clients
          io.emit('project-changed', {
            path,
            name: path.split('/').pop()
          });
          
          callback?.({ success: true });
        } else {
          callback?.({ success: false, error: result.error });
        }
      } catch (error) {
        logger.error('Project change error:', error);
        callback?.({ success: false, error: 'Failed to change project' });
      }
    });
    
    // Handle Claude Code output events
    bridge.on('output', (output: string) => {
      socket.emit('claude-output', { output });
    });
    
    // Handle Claude Code chat responses
    bridge.on('chat-response', (response: any) => {
      logger.info('Forwarding chat response to client:', response);
      socket.emit('chat-response', response);
    });
    
    // Handle disconnection
    socket.on('disconnect', async () => {
      logger.info(`Client disconnected: ${socket.id}`);
      
      // Cancel all active streams for this client
      const streams = activeStreams.get(socket.id);
      if (streams) {
        for (const streamId of streams) {
          bridge.cancelStream(streamId);
        }
        activeStreams.delete(socket.id);
      }
      
      // Close any active session
      if (bridge.hasActiveSession(socket.id)) {
        await bridge.closeSession(socket.id);
      }
      
      // Remove bridge event listeners for this socket
      bridge.removeAllListeners('output');
      bridge.removeAllListeners('chat-response');
      bridge.removeAllListeners(`session-output-${socket.id}`);
      bridge.removeAllListeners(`session-response-${socket.id}`);
      bridge.removeAllListeners(`session-error-${socket.id}`);
    });
  });
  
  // Monitor Claude Code status
  setInterval(() => {
    io.emit('status', {
      connected: true,
      claudeAvailable: bridge.isAvailable()
    });
  }, 5000);
}

// Create a stream handler for WebSocket
function createStreamHandler(socket: Socket, commandId: string): StreamHandler {
  return {
    onData: (data: string) => {
      socket.emit('command-stream', {
        id: commandId,
        data,
        timestamp: new Date()
      });
    },
    onComplete: (result) => {
      socket.emit('command-complete', {
        id: commandId,
        ...result
      });
    },
    onError: (error) => {
      socket.emit('command-error', {
        id: commandId,
        error: error.message
      });
    }
  };
}

// Set up session event handlers for a socket
function setupSessionHandlers(socket: Socket, bridge: ClaudeCodeBridge): void {
  const socketId = socket.id;
  
  // Handle session output (real-time streaming)
  bridge.on(`session-output-${socketId}`, (chunk: string) => {
    // Don't emit empty chunks
    if (chunk.trim()) {
      socket.emit('claude-output', { output: chunk });
    }
  });
  
  // Handle complete session responses
  bridge.on(`session-response-${socketId}`, (response: any) => {
    logger.info(`Session response for ${socketId}:`, response.content);
    socket.emit('chat-response', {
      message: response.content,
      success: true,
      timestamp: response.timestamp
    });
  });
  
  // Handle session errors
  bridge.on(`session-error-${socketId}`, (error: Error) => {
    logger.error(`Session error for ${socketId}:`, error);
    socket.emit('chat-error', {
      error: error.message
    });
  });
}

// Convert natural language to BACO command
async function nlpToBacoCommand(message: string, context?: any): Promise<BacoCommand> {
  const lowerMessage = message.toLowerCase();
  
  // Check for specific command patterns
  if (lowerMessage === 'help' || lowerMessage.includes('help me')) {
    return { command: '/help' };
  }
  
  // Check for app creation patterns
  if (lowerMessage.includes('create') && (lowerMessage.includes('app') || lowerMessage.includes('application'))) {
    const patterns = [
      /create\s+(?:a\s+)?(\w+)\s+app(?:lication)?\s+(?:called\s+)?(\w+)/i,
      /create\s+(?:a\s+)?(\w+)\s+(?:called\s+)?(\w+)/i,
      /build\s+(?:a\s+)?(\w+)\s+app(?:lication)?\s+(?:called\s+)?(\w+)/i
    ];
    
    for (const pattern of patterns) {
      const match = message.match(pattern);
      if (match) {
        return {
          command: '/baco',
          args: ['create-app', match[1], match[2]],
          context
        };
      }
    }
  }
  
  if (lowerMessage.includes('analyze')) {
    const taskMatch = message.match(/analyze\s+(.+)/i);
    return {
      command: '/analyze',
      args: taskMatch ? [taskMatch[1]] : [],
      context
    };
  }
  
  if (lowerMessage.includes('create') && lowerMessage.includes('prp')) {
    const taskMatch = message.match(/(?:create|generate)\s+(?:a\s+)?prp\s+(?:for\s+)?(.+)/i);
    return {
      command: '/generate-prp',
      args: taskMatch ? [taskMatch[1]] : [],
      context
    };
  }
  
  if (lowerMessage.includes('orchestrate')) {
    const taskMatch = message.match(/orchestrate\s+(.+)/i);
    return {
      command: '/orchestrate',
      args: taskMatch ? [taskMatch[1]] : [],
      context
    };
  }
  
  // For natural language coding requests, use the chat command
  const codingKeywords = ['create', 'build', 'implement', 'code', 'develop', 'make', 'write', 'fix', 'debug', 'help', 'how'];
  const hasCodingKeyword = codingKeywords.some(keyword => lowerMessage.includes(keyword));
  
  if (hasCodingKeyword || !message.startsWith('/')) {
    return {
      command: '/chat',
      args: [message],
      context: {
        ...context,
        isNaturalLanguage: true
      }
    };
  }
  
  // Default: treat as orchestration task
  return {
    command: '/orchestrate',
    args: [message],
    context
  };
}