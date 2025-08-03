import { EventEmitter } from 'eventemitter3';
import express from 'express';
import http from 'http';
import { WebSocketServer } from 'ws';
import winston from 'winston';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';

/**
 * MCPServer - Model Context Protocol server for Claude Code integration
 * Provides standardized interface for multi-agent coordination and tool sharing
 */
export class MCPServer extends EventEmitter {
  constructor(config = {}) {
    super();
    
    this.port = config.port || 3000;
    this.host = config.host || 'localhost';
    this.version = '1.0.0';
    this.serverInfo = {
      name: 'pantheon-mcp-server',
      version: this.version,
      description: 'Pantheon Multi-AI MCP Server',
      capabilities: [
        'tools',
        'resources',
        'prompts',
        'sampling',
        'logging'
      ]
    };
    
    // Tool registry
    this.tools = new Map();
    this.resources = new Map();
    this.prompts = new Map();
    this.clients = new Map();
    
    // Request handling
    this.requestHandlers = new Map();
    this.notifications = new Map();
    
    // Security
    this.authentication = config.authentication || false;
    this.apiKeys = new Map();
    
    // Rate limiting
    this.rateLimits = new Map();
    this.rateLimitConfig = config.rateLimit || {
      windowMs: 60000, // 1 minute
      maxRequests: 100
    };
    
    // Express app for HTTP endpoints
    this.app = express();
    this.server = null;
    this.wsServer = null;
    
    // Logging
    this.logger = winston.createLogger({
      level: process.env.PANTHEON_LOG_LEVEL || 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json()
      ),
      defaultMeta: { component: 'MCPServer' },
      transports: [
        new winston.transports.File({
          filename: '.claude/logs/mcp-server.log',
          maxsize: 10485760, // 10MB
          maxFiles: 10
        }),
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple()
          )
        })
      ]
    });
    
    this.initialize();
  }
  
  /**
   * Initialize the MCP server
   */
  async initialize() {
    try {
      this.setupExpressApp();
      this.setupRequestHandlers();
      this.registerDefaultTools();
      this.registerDefaultResources();
      this.registerDefaultPrompts();
      
      this.logger.info('MCP Server initialized', {
        port: this.port,
        capabilities: this.serverInfo.capabilities
      });
      
      this.emit('initialized');
      
    } catch (error) {
      this.logger.error('Failed to initialize MCP server', { error: error.message });
      throw error;
    }
  }
  
  /**
   * Setup Express application
   */
  setupExpressApp() {
    // Middleware
    this.app.use(express.json({ limit: '10mb' }));
    
    // CORS
    this.app.use((req, res, next) => {
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
      res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      next();
    });
    
    // Authentication middleware
    if (this.authentication) {
      this.app.use(this.authenticateRequest.bind(this));
    }
    
    // Rate limiting middleware
    this.app.use(this.rateLimitMiddleware.bind(this));
    
    // MCP endpoints
    this.setupMCPEndpoints();
    
    // Health check
    this.app.get('/health', (req, res) => {
      res.json({
        status: 'healthy',
        version: this.version,
        uptime: process.uptime(),
        capabilities: this.serverInfo.capabilities
      });
    });
    
    // Error handler
    this.app.use(this.errorHandler.bind(this));
  }
  
  /**
   * Setup MCP-specific endpoints
   */
  setupMCPEndpoints() {
    // Initialize handshake
    this.app.post('/mcp/initialize', async (req, res) => {
      try {
        const { protocolVersion, capabilities, clientInfo } = req.body;
        
        // Validate protocol version
        if (!this.isCompatibleVersion(protocolVersion)) {
          return res.status(400).json({
            error: 'incompatible_protocol_version',
            message: `Unsupported protocol version: ${protocolVersion}`
          });
        }
        
        const clientId = uuidv4();
        const client = {
          id: clientId,
          info: clientInfo,
          capabilities: capabilities || [],
          connected: true,
          connectedAt: new Date()
        };
        
        this.clients.set(clientId, client);
        
        res.json({
          protocolVersion: this.version,
          capabilities: this.serverInfo.capabilities,
          serverInfo: this.serverInfo,
          clientId
        });
        
        this.logger.info('Client initialized', { clientId, clientInfo });
        this.emit('clientConnected', { client });
        
      } catch (error) {
        this.handleRequestError(error, res);
      }
    });
    
    // List tools
    this.app.get('/mcp/tools', async (req, res) => {
      try {
        const tools = Array.from(this.tools.values()).map(tool => ({
          name: tool.name,
          description: tool.description,
          inputSchema: tool.inputSchema
        }));
        
        res.json({ tools });
        
      } catch (error) {
        this.handleRequestError(error, res);
      }
    });
    
    // Call tool
    this.app.post('/mcp/tools/:toolName/call', async (req, res) => {
      try {
        const { toolName } = req.params;
        const { arguments: args } = req.body;
        
        const tool = this.tools.get(toolName);
        if (!tool) {
          return res.status(404).json({
            error: 'tool_not_found',
            message: `Tool ${toolName} not found`
          });
        }
        
        const result = await this.callTool(toolName, args, req.clientId);
        res.json(result);
        
      } catch (error) {
        this.handleRequestError(error, res);
      }
    });
    
    // List resources
    this.app.get('/mcp/resources', async (req, res) => {
      try {
        const resources = Array.from(this.resources.values()).map(resource => ({
          uri: resource.uri,
          name: resource.name,
          description: resource.description,
          mimeType: resource.mimeType
        }));
        
        res.json({ resources });
        
      } catch (error) {
        this.handleRequestError(error, res);
      }
    });
    
    // Get resource
    this.app.get('/mcp/resources/:resourceId', async (req, res) => {
      try {
        const { resourceId } = req.params;
        const resource = await this.getResource(resourceId, req.clientId);
        
        if (!resource) {
          return res.status(404).json({
            error: 'resource_not_found',
            message: `Resource ${resourceId} not found`
          });
        }
        
        res.json(resource);
        
      } catch (error) {
        this.handleRequestError(error, res);
      }
    });
    
    // List prompts
    this.app.get('/mcp/prompts', async (req, res) => {
      try {
        const prompts = Array.from(this.prompts.values()).map(prompt => ({
          name: prompt.name,
          description: prompt.description,
          arguments: prompt.arguments
        }));
        
        res.json({ prompts });
        
      } catch (error) {
        this.handleRequestError(error, res);
      }
    });
    
    // Get prompt
    this.app.post('/mcp/prompts/:promptName', async (req, res) => {
      try {
        const { promptName } = req.params;
        const { arguments: args } = req.body;
        
        const prompt = await this.getPrompt(promptName, args, req.clientId);
        
        if (!prompt) {
          return res.status(404).json({
            error: 'prompt_not_found',
            message: `Prompt ${promptName} not found`
          });
        }
        
        res.json(prompt);
        
      } catch (error) {
        this.handleRequestError(error, res);
      }
    });
  }
  
  /**
   * Setup WebSocket server for real-time communication
   */
  setupWebSocketServer() {
    this.wsServer = new WebSocketServer({ server: this.server });
    
    this.wsServer.on('connection', (ws, request) => {
      const clientId = uuidv4();
      
      ws.clientId = clientId;
      ws.isAlive = true;
      
      ws.on('pong', () => {
        ws.isAlive = true;
      });
      
      ws.on('message', async (data) => {
        try {
          const message = JSON.parse(data.toString());
          await this.handleWebSocketMessage(ws, message);
        } catch (error) {
          this.logger.error('WebSocket message error', { error: error.message });
          ws.send(JSON.stringify({
            error: 'invalid_message',
            message: 'Failed to parse message'
          }));
        }
      });
      
      ws.on('close', () => {
        this.clients.delete(clientId);
        this.logger.info('WebSocket client disconnected', { clientId });
      });
      
      this.logger.info('WebSocket client connected', { clientId });
    });
    
    // Heartbeat
    setInterval(() => {
      this.wsServer.clients.forEach((ws) => {
        if (!ws.isAlive) {
          return ws.terminate();
        }
        
        ws.isAlive = false;
        ws.ping();
      });
    }, 30000);
  }
  
  /**
   * Handle WebSocket messages
   */
  async handleWebSocketMessage(ws, message) {
    const { id, method, params } = message;
    
    try {
      let result;
      
      switch (method) {
        case 'tools/list':
          result = await this.listTools();
          break;
        case 'tools/call':
          result = await this.callTool(params.name, params.arguments, ws.clientId);
          break;
        case 'resources/list':
          result = await this.listResources();
          break;
        case 'resources/read':
          result = await this.getResource(params.uri, ws.clientId);
          break;
        case 'prompts/list':
          result = await this.listPrompts();
          break;
        case 'prompts/get':
          result = await this.getPrompt(params.name, params.arguments, ws.clientId);
          break;
        default:
          throw new Error(`Unknown method: ${method}`);
      }
      
      ws.send(JSON.stringify({
        id,
        result
      }));
      
    } catch (error) {
      ws.send(JSON.stringify({
        id,
        error: {
          code: error.code || 'internal_error',
          message: error.message
        }
      }));
    }
  }
  
  /**
   * Register a tool
   */
  registerTool(tool) {
    if (!tool.name || !tool.handler) {
      throw new Error('Tool must have name and handler');
    }
    
    const toolDefinition = {
      name: tool.name,
      description: tool.description || '',
      inputSchema: tool.inputSchema || { type: 'object' },
      handler: tool.handler,
      category: tool.category || 'general',
      permissions: tool.permissions || [],
      rateLimit: tool.rateLimit
    };
    
    this.tools.set(tool.name, toolDefinition);
    
    this.logger.info('Tool registered', { 
      name: tool.name, 
      category: tool.category 
    });
    
    this.emit('toolRegistered', { tool: toolDefinition });
  }
  
  /**
   * Register a resource
   */
  registerResource(resource) {
    if (!resource.uri || !resource.handler) {
      throw new Error('Resource must have uri and handler');
    }
    
    const resourceDefinition = {
      uri: resource.uri,
      name: resource.name || resource.uri,
      description: resource.description || '',
      mimeType: resource.mimeType || 'text/plain',
      handler: resource.handler,
      category: resource.category || 'general',
      permissions: resource.permissions || []
    };
    
    this.resources.set(resource.uri, resourceDefinition);
    
    this.logger.info('Resource registered', { 
      uri: resource.uri, 
      mimeType: resource.mimeType 
    });
    
    this.emit('resourceRegistered', { resource: resourceDefinition });
  }
  
  /**
   * Register a prompt
   */
  registerPrompt(prompt) {
    if (!prompt.name || !prompt.handler) {
      throw new Error('Prompt must have name and handler');
    }
    
    const promptDefinition = {
      name: prompt.name,
      description: prompt.description || '',
      arguments: prompt.arguments || [],
      handler: prompt.handler,
      category: prompt.category || 'general'
    };
    
    this.prompts.set(prompt.name, promptDefinition);
    
    this.logger.info('Prompt registered', { 
      name: prompt.name, 
      category: prompt.category 
    });
    
    this.emit('promptRegistered', { prompt: promptDefinition });
  }
  
  /**
   * Call a tool
   */
  async callTool(toolName, args, clientId) {
    const tool = this.tools.get(toolName);
    if (!tool) {
      throw new Error(`Tool ${toolName} not found`);
    }
    
    // Check permissions
    if (!this.checkToolPermissions(tool, clientId)) {
      throw new Error(`Permission denied for tool ${toolName}`);
    }
    
    // Check rate limits
    if (!this.checkToolRateLimit(tool, clientId)) {
      throw new Error(`Rate limit exceeded for tool ${toolName}`);
    }
    
    try {
      const startTime = Date.now();
      
      this.logger.info('Calling tool', { toolName, clientId });
      
      const result = await tool.handler(args, { clientId, tool });
      
      const duration = Date.now() - startTime;
      
      this.logger.info('Tool call completed', { 
        toolName, 
        clientId, 
        duration,
        success: true
      });
      
      this.emit('toolCalled', { 
        tool: toolName, 
        clientId, 
        args, 
        result, 
        duration 
      });
      
      return {
        content: result.content || result,
        isError: false,
        duration
      };
      
    } catch (error) {
      this.logger.error('Tool call failed', { 
        toolName, 
        clientId, 
        error: error.message 
      });
      
      this.emit('toolError', { 
        tool: toolName, 
        clientId, 
        args, 
        error 
      });
      
      return {
        content: error.message,
        isError: true
      };
    }
  }
  
  /**
   * Get a resource
   */
  async getResource(uri, clientId) {
    const resource = this.resources.get(uri);
    if (!resource) {
      return null;
    }
    
    // Check permissions
    if (!this.checkResourcePermissions(resource, clientId)) {
      throw new Error(`Permission denied for resource ${uri}`);
    }
    
    try {
      const content = await resource.handler(uri, { clientId, resource });
      
      this.logger.info('Resource accessed', { uri, clientId });
      
      this.emit('resourceAccessed', { 
        resource: uri, 
        clientId 
      });
      
      return {
        uri,
        mimeType: resource.mimeType,
        text: content.text || content,
        blob: content.blob
      };
      
    } catch (error) {
      this.logger.error('Resource access failed', { 
        uri, 
        clientId, 
        error: error.message 
      });
      
      throw error;
    }
  }
  
  /**
   * Get a prompt
   */
  async getPrompt(name, args, clientId) {
    const prompt = this.prompts.get(name);
    if (!prompt) {
      return null;
    }
    
    try {
      const result = await prompt.handler(args, { clientId, prompt });
      
      this.logger.info('Prompt accessed', { name, clientId });
      
      this.emit('promptAccessed', { 
        prompt: name, 
        clientId, 
        args 
      });
      
      return {
        description: prompt.description,
        messages: result.messages || [{ role: 'user', content: result.content || result }]
      };
      
    } catch (error) {
      this.logger.error('Prompt access failed', { 
        name, 
        clientId, 
        error: error.message 
      });
      
      throw error;
    }
  }
  
  /**
   * Register default tools
   */
  registerDefaultTools() {
    // Echo tool for testing
    this.registerTool({
      name: 'echo',
      description: 'Echo the input text',
      inputSchema: {
        type: 'object',
        properties: {
          text: {
            type: 'string',
            description: 'Text to echo'
          }
        },
        required: ['text']
      },
      handler: async (args) => {
        return { content: args.text };
      }
    });
    
    // System info tool
    this.registerTool({
      name: 'system_info',
      description: 'Get system information',
      inputSchema: { type: 'object' },
      handler: async () => {
        return {
          content: JSON.stringify({
            platform: process.platform,
            nodeVersion: process.version,
            uptime: process.uptime(),
            memory: process.memoryUsage(),
            serverInfo: this.serverInfo
          }, null, 2)
        };
      }
    });
    
    // List clients tool
    this.registerTool({
      name: 'list_clients',
      description: 'List connected clients',
      inputSchema: { type: 'object' },
      handler: async () => {
        const clients = Array.from(this.clients.values()).map(client => ({
          id: client.id,
          info: client.info,
          connected: client.connected,
          connectedAt: client.connectedAt
        }));
        
        return {
          content: JSON.stringify(clients, null, 2)
        };
      }
    });
  }
  
  /**
   * Register default resources
   */
  registerDefaultResources() {
    // Server status resource
    this.registerResource({
      uri: 'server://status',
      name: 'Server Status',
      description: 'Current server status and metrics',
      mimeType: 'application/json',
      handler: async () => {
        return {
          text: JSON.stringify({
            status: 'running',
            uptime: process.uptime(),
            clients: this.clients.size,
            tools: this.tools.size,
            resources: this.resources.size,
            prompts: this.prompts.size,
            memory: process.memoryUsage()
          }, null, 2)
        };
      }
    });
    
    // Server logs resource
    this.registerResource({
      uri: 'server://logs',
      name: 'Server Logs',
      description: 'Recent server log entries',
      mimeType: 'text/plain',
      handler: async () => {
        // In a real implementation, this would read from log files
        return {
          text: 'Recent log entries would be displayed here'
        };
      }
    });
  }
  
  /**
   * Register default prompts
   */
  registerDefaultPrompts() {
    // Agent coordination prompt
    this.registerPrompt({
      name: 'agent_coordination',
      description: 'Coordinate multiple agents for a task',
      arguments: [
        {
          name: 'task',
          description: 'The task to coordinate agents for',
          required: true
        },
        {
          name: 'agents',
          description: 'List of available agents',
          required: false
        }
      ],
      handler: async (args) => {
        const task = args.task || 'general task';
        const agents = args.agents || ['claude-architect', 'gemini-advisor'];
        
        return {
          content: `You are coordinating ${agents.join(', ')} to complete the following task: ${task}. 
          
Please:
1. Break down the task into subtasks
2. Assign appropriate agents to each subtask
3. Define the coordination strategy
4. Establish communication protocols between agents
5. Set success criteria for the overall task

Consider the strengths of each agent type and how they can best collaborate.`
        };
      }
    });
  }
  
  /**
   * Authentication middleware
   */
  authenticateRequest(req, res, next) {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'authentication_required',
        message: 'Bearer token required'
      });
    }
    
    const token = authHeader.substring(7);
    const apiKey = this.apiKeys.get(token);
    
    if (!apiKey || !apiKey.active) {
      return res.status(401).json({
        error: 'invalid_token',
        message: 'Invalid or expired token'
      });
    }
    
    req.clientId = apiKey.clientId;
    req.permissions = apiKey.permissions;
    
    next();
  }
  
  /**
   * Rate limiting middleware
   */
  rateLimitMiddleware(req, res, next) {
    const clientId = req.clientId || req.ip;
    const now = Date.now();
    
    if (!this.rateLimits.has(clientId)) {
      this.rateLimits.set(clientId, {
        requests: [],
        resetTime: now + this.rateLimitConfig.windowMs
      });
    }
    
    const clientLimit = this.rateLimits.get(clientId);
    
    // Clean old requests
    clientLimit.requests = clientLimit.requests.filter(
      time => time > now - this.rateLimitConfig.windowMs
    );
    
    if (clientLimit.requests.length >= this.rateLimitConfig.maxRequests) {
      return res.status(429).json({
        error: 'rate_limit_exceeded',
        message: 'Too many requests'
      });
    }
    
    clientLimit.requests.push(now);
    next();
  }
  
  /**
   * Error handler
   */
  errorHandler(error, req, res, next) {
    this.logger.error('Request error', { 
      error: error.message, 
      path: req.path,
      method: req.method
    });
    
    res.status(500).json({
      error: 'internal_error',
      message: 'Internal server error'
    });
  }
  
  /**
   * Start the server
   */
  async start() {
    return new Promise((resolve, reject) => {
      this.server = http.createServer(this.app);
      
      this.setupWebSocketServer();
      
      this.server.listen(this.port, this.host, (error) => {
        if (error) {
          reject(error);
        } else {
          this.logger.info(`MCP Server started on ${this.host}:${this.port}`);
          this.emit('started');
          resolve();
        }
      });
    });
  }
  
  /**
   * Stop the server
   */
  async stop() {
    return new Promise((resolve) => {
      if (this.server) {
        this.server.close(() => {
          this.logger.info('MCP Server stopped');
          this.emit('stopped');
          resolve();
        });
      } else {
        resolve();
      }
    });
  }
  
  // Helper methods
  isCompatibleVersion(version) {
    // Simple version compatibility check
    return version === this.version || version.startsWith('1.');
  }
  
  checkToolPermissions(tool, clientId) {
    // Implement permission checking logic
    return true; // Allow all for now
  }
  
  checkResourcePermissions(resource, clientId) {
    // Implement permission checking logic
    return true; // Allow all for now
  }
  
  checkToolRateLimit(tool, clientId) {
    // Implement tool-specific rate limiting
    return true; // Allow all for now
  }
  
  handleRequestError(error, res) {
    this.logger.error('Request error', { error: error.message });
    res.status(500).json({
      error: 'internal_error',
      message: error.message
    });
  }
  
  async listTools() {
    return {
      tools: Array.from(this.tools.values()).map(tool => ({
        name: tool.name,
        description: tool.description,
        inputSchema: tool.inputSchema
      }))
    };
  }
  
  async listResources() {
    return {
      resources: Array.from(this.resources.values()).map(resource => ({
        uri: resource.uri,
        name: resource.name,
        description: resource.description,
        mimeType: resource.mimeType
      }))
    };
  }
  
  async listPrompts() {
    return {
      prompts: Array.from(this.prompts.values()).map(prompt => ({
        name: prompt.name,
        description: prompt.description,
        arguments: prompt.arguments
      }))
    };
  }
  
  /**
   * Generate API key
   */
  generateApiKey(clientId, permissions = []) {
    const token = crypto.randomBytes(32).toString('hex');
    
    this.apiKeys.set(token, {
      clientId,
      permissions,
      active: true,
      createdAt: new Date()
    });
    
    return token;
  }
  
  /**
   * Revoke API key
   */
  revokeApiKey(token) {
    const apiKey = this.apiKeys.get(token);
    if (apiKey) {
      apiKey.active = false;
      return true;
    }
    return false;
  }
}

export default MCPServer;