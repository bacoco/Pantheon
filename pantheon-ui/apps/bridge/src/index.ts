import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import { ClaudeCodeBridge } from './claude/bridge.js';
import { setupApiRoutes } from './api/routes.js';
import { setupWebSocketHandlers } from './websocket/handlers.js';
import { logger } from './utils/logger.js';
import bacoRoutes from './api/baco-routes.js';

// Load environment variables
dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

// Initialize Claude Code Bridge
const claudeBridge = new ClaudeCodeBridge();

// Setup routes
setupApiRoutes(app, claudeBridge);

// Setup BACO routes
app.use('/api/baco', bacoRoutes);

// Setup WebSocket handlers
setupWebSocketHandlers(io, claudeBridge);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    claude: claudeBridge.isAvailable() 
  });
});

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, async () => {
  logger.info(`BACO UI Bridge server running on port ${PORT}`);
  logger.info(`Claude Code path: ${process.env.CLAUDE_CODE_PATH || 'claude'}`);
  
  // Initialize Claude Code Bridge
  try {
    logger.info('Initializing Claude Code Bridge...');
    await claudeBridge.initialize();
    logger.info('Claude Code Bridge initialized successfully');
  } catch (error) {
    logger.error('Failed to initialize Claude Code Bridge:', error);
    logger.warn('Claude Code features will not be available');
  }
});