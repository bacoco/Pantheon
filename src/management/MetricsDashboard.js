import { EventEmitter } from 'eventemitter3';
import express from 'express';
import http from 'http';
import path from 'path';
import fs from 'fs/promises';
import winston from 'winston';

/**
 * MetricsDashboard provides real-time monitoring and visualization
 * Serves a web-based dashboard for system metrics, agent status, and performance analytics
 */
export class MetricsDashboard extends EventEmitter {
  constructor(config = {}) {
    super();
    
    this.port = config.port || 3001;
    this.updateInterval = config.updateInterval || 5000; // 5 seconds
    this.historyLength = config.historyLength || 100; // Keep 100 data points
    this.enableWebSocketUpdates = config.enableWebSocketUpdates !== false;
    
    // Connected components
    this.orchestrator = null;
    this.costController = null;
    this.router = null;
    this.workflowMonitor = null;
    
    // Metrics storage
    this.metrics = {
      system: {
        uptime: 0,
        memoryUsage: [],
        cpuUsage: [],
        activeConnections: 0
      },
      agents: {
        total: 0,
        active: 0,
        executing: 0,
        errors: 0,
        byType: {},
        performance: []
      },
      costs: {
        daily: { claude: 0, gemini: 0, total: 0 },
        hourly: [],
        alerts: [],
        predictions: []
      },
      workflows: {
        active: 0,
        completed: 0,
        failed: 0,
        avgDuration: 0,
        completionRate: 0,
        recent: []
      },
      routing: {
        totalRequests: 0,
        routingDecisions: [],
        fallbackUsage: 0,
        avgDecisionTime: 0
      }
    };
    
    // WebSocket connections
    this.wsConnections = new Set();
    
    // Express app
    this.app = express();
    this.server = null;
    
    // Logging
    this.logger = winston.createLogger({
      level: process.env.PANTHEON_LOG_LEVEL || 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json()
      ),
      defaultMeta: { component: 'MetricsDashboard' },
      transports: [
        new winston.transports.File({
          filename: '.claude/logs/metrics-dashboard.log',
          maxsize: 5242880, // 5MB
          maxFiles: 5
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
   * Initialize the metrics dashboard
   */
  async initialize() {
    try {
      await this.setupExpressApp();
      await this.createDashboardAssets();
      this.startMetricsCollection();
      
      this.logger.info('Metrics Dashboard initialized', { port: this.port });
      this.emit('initialized');
      
    } catch (error) {
      this.logger.error('Failed to initialize metrics dashboard', { error: error.message });
      throw error;
    }
  }
  
  /**
   * Connect system components for monitoring
   */
  connectComponents(components) {
    const { orchestrator, costController, router, workflowMonitor } = components;
    
    this.orchestrator = orchestrator;
    this.costController = costController;
    this.router = router;
    this.workflowMonitor = workflowMonitor;
    
    this.setupComponentListeners();
    this.logger.info('Components connected to dashboard');
  }
  
  /**
   * Setup Express application
   */
  async setupExpressApp() {
    // Middleware
    this.app.use(express.json());
    this.app.use(express.static(path.join(process.cwd(), '.claude', 'dashboard')));
    
    // CORS for development
    this.app.use((req, res, next) => {
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
      res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      next();
    });
    
    // API Routes
    this.setupAPIRoutes();
    
    // WebSocket setup
    this.server = http.createServer(this.app);
    
    if (this.enableWebSocketUpdates) {
      await this.setupWebSocket();
    }
  }
  
  /**
   * Setup API routes
   */
  setupAPIRoutes() {
    // Real-time metrics endpoint
    this.app.get('/api/metrics', (req, res) => {
      res.json({
        timestamp: Date.now(),
        metrics: this.metrics,
        status: 'active'
      });
    });
    
    // System status endpoint
    this.app.get('/api/status', (req, res) => {
      const status = {
        system: this.getSystemStatus(),
        agents: this.getAgentStatus(),
        costs: this.getCostStatus(),
        workflows: this.getWorkflowStatus()
      };
      res.json(status);
    });
    
    // Agent details endpoint
    this.app.get('/api/agents', (req, res) => {
      if (this.orchestrator) {
        res.json(this.orchestrator.getSystemStatus());
      } else {
        res.json({ agents: [], message: 'Orchestrator not connected' });
      }
    });
    
    // Cost analytics endpoint
    this.app.get('/api/costs/analytics', async (req, res) => {
      try {
        const days = parseInt(req.query.days) || 7;
        if (this.costController) {
          const analytics = await this.costController.getCostAnalytics(days);
          res.json(analytics);
        } else {
          res.json({ message: 'Cost controller not connected' });
        }
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });
    
    // Historical metrics endpoint
    this.app.get('/api/metrics/history', (req, res) => {
      const type = req.query.type || 'all';
      const limit = parseInt(req.query.limit) || 50;
      
      const history = this.getMetricsHistory(type, limit);
      res.json(history);
    });
    
    // Performance benchmarks endpoint
    this.app.get('/api/performance', (req, res) => {
      res.json(this.getPerformanceBenchmarks());
    });
    
    // Alert configuration endpoint
    this.app.get('/api/alerts', (req, res) => {
      res.json(this.getActiveAlerts());
    });
    
    // Emergency controls endpoint
    this.app.post('/api/emergency/stop', (req, res) => {
      if (this.costController) {
        this.costController.activateEmergencyStop('Manual activation via dashboard');
        res.json({ success: true, message: 'Emergency stop activated' });
      } else {
        res.status(503).json({ error: 'Cost controller not available' });
      }
    });
    
    this.app.post('/api/emergency/resume', (req, res) => {
      const { authorizedBy } = req.body;
      if (this.costController && authorizedBy) {
        this.costController.deactivateEmergencyStop(authorizedBy);
        res.json({ success: true, message: 'Emergency stop deactivated' });
      } else {
        res.status(400).json({ error: 'Authorization required' });
      }
    });
  }
  
  /**
   * Setup WebSocket for real-time updates
   */
  async setupWebSocket() {
    const { Server } = await import('socket.io');
    this.io = new Server(this.server, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"]
      }
    });
    
    this.io.on('connection', (socket) => {
      this.wsConnections.add(socket);
      this.logger.debug('Dashboard client connected');
      
      // Send initial data
      socket.emit('metricsUpdate', {
        timestamp: Date.now(),
        metrics: this.metrics
      });
      
      socket.on('disconnect', () => {
        this.wsConnections.delete(socket);
        this.logger.debug('Dashboard client disconnected');
      });
      
      // Handle subscriptions
      socket.on('subscribe', (topics) => {
        socket.topics = topics;
        this.logger.debug('Client subscribed to topics', { topics });
      });
    });
  }
  
  /**
   * Start the dashboard server
   */
  async start() {
    return new Promise((resolve, reject) => {
      this.server.listen(this.port, (error) => {
        if (error) {
          reject(error);
        } else {
          this.logger.info(`Metrics Dashboard running on port ${this.port}`);
          this.logger.info(`Dashboard URL: http://localhost:${this.port}`);
          resolve();
        }
      });
    });
  }
  
  /**
   * Create dashboard static assets
   */
  async createDashboardAssets() {
    const dashboardDir = path.join(process.cwd(), '.claude', 'dashboard');
    
    try {
      await fs.mkdir(dashboardDir, { recursive: true });
      
      // Create main HTML file
      const htmlContent = this.generateDashboardHTML();
      await fs.writeFile(path.join(dashboardDir, 'index.html'), htmlContent);
      
      // Create CSS file
      const cssContent = this.generateDashboardCSS();
      await fs.writeFile(path.join(dashboardDir, 'dashboard.css'), cssContent);
      
      // Create JavaScript file
      const jsContent = this.generateDashboardJS();
      await fs.writeFile(path.join(dashboardDir, 'dashboard.js'), jsContent);
      
      this.logger.info('Dashboard assets created');
      
    } catch (error) {
      this.logger.error('Failed to create dashboard assets', { error: error.message });
      throw error;
    }
  }
  
  /**
   * Generate dashboard HTML
   */
  generateDashboardHTML() {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Pantheon Multi-AI Dashboard</title>
    <link rel="stylesheet" href="dashboard.css">
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <script src="https://cdn.socket.io/4.7.2/socket.io.min.js"></script>
</head>
<body>
    <div class="dashboard">
        <header class="dashboard-header">
            <h1>🏛️ Pantheon Multi-AI Dashboard</h1>
            <div class="status-indicators">
                <div class="indicator" id="system-status">
                    <span class="dot"></span>
                    <span class="label">System</span>
                </div>
                <div class="indicator" id="cost-status">
                    <span class="dot"></span>
                    <span class="label">Costs</span>
                </div>
                <div class="indicator" id="agents-status">
                    <span class="dot"></span>
                    <span class="label">Agents</span>
                </div>
            </div>
        </header>

        <div class="dashboard-grid">
            <!-- System Overview -->
            <div class="card system-overview">
                <h2>System Overview</h2>
                <div class="metrics-grid">
                    <div class="metric">
                        <span class="value" id="uptime">--</span>
                        <span class="label">Uptime</span>
                    </div>
                    <div class="metric">
                        <span class="value" id="total-agents">--</span>
                        <span class="label">Total Agents</span>
                    </div>
                    <div class="metric">
                        <span class="value" id="active-tasks">--</span>
                        <span class="label">Active Tasks</span>
                    </div>
                    <div class="metric">
                        <span class="value" id="success-rate">--</span>
                        <span class="label">Success Rate</span>
                    </div>
                </div>
            </div>

            <!-- Agent Status -->
            <div class="card agent-status">
                <h2>Agent Status</h2>
                <canvas id="agentChart" width="400" height="200"></canvas>
                <div class="agent-list" id="agent-list">
                    <!-- Dynamic agent list -->
                </div>
            </div>

            <!-- Cost Tracking -->
            <div class="card cost-tracking">
                <h2>Cost Tracking</h2>
                <div class="cost-summary">
                    <div class="cost-item">
                        <span class="provider">Claude</span>
                        <div class="cost-bar">
                            <div class="cost-fill claude-fill" id="claude-usage"></div>
                        </div>
                        <span class="cost-value" id="claude-cost">$0.00</span>
                    </div>
                    <div class="cost-item">
                        <span class="provider">Gemini</span>
                        <div class="cost-bar">
                            <div class="cost-fill gemini-fill" id="gemini-usage"></div>
                        </div>
                        <span class="cost-value" id="gemini-cost">$0.00</span>
                    </div>
                </div>
                <canvas id="costChart" width="400" height="200"></canvas>
            </div>

            <!-- Performance Metrics -->
            <div class="card performance-metrics">
                <h2>Performance</h2>
                <canvas id="performanceChart" width="400" height="200"></canvas>
                <div class="performance-stats">
                    <div class="stat">
                        <span class="label">Avg Response Time</span>
                        <span class="value" id="avg-response-time">--ms</span>
                    </div>
                    <div class="stat">
                        <span class="label">Tasks/Hour</span>
                        <span class="value" id="tasks-per-hour">--</span>
                    </div>
                </div>
            </div>

            <!-- Workflow Status -->
            <div class="card workflow-status">
                <h2>Workflows</h2>
                <div class="workflow-summary">
                    <div class="workflow-stat">
                        <span class="value" id="active-workflows">--</span>
                        <span class="label">Active</span>
                    </div>
                    <div class="workflow-stat">
                        <span class="value" id="completed-workflows">--</span>
                        <span class="label">Completed</span>
                    </div>
                    <div class="workflow-stat">
                        <span class="value" id="failed-workflows">--</span>
                        <span class="label">Failed</span>
                    </div>
                </div>
                <div class="recent-workflows" id="recent-workflows">
                    <!-- Dynamic workflow list -->
                </div>
            </div>

            <!-- Alerts -->
            <div class="card alerts">
                <h2>Alerts & Notifications</h2>
                <div class="alert-list" id="alert-list">
                    <!-- Dynamic alerts -->
                </div>
                <div class="emergency-controls">
                    <button id="emergency-stop" class="emergency-btn">Emergency Stop</button>
                    <button id="emergency-resume" class="emergency-btn resume" style="display: none;">Resume</button>
                </div>
            </div>
        </div>
    </div>
    <script src="dashboard.js"></script>
</body>
</html>`;
  }
  
  /**
   * Generate dashboard CSS
   */
  generateDashboardCSS() {
    return `* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
    background: #f5f5f7;
    color: #1d1d1f;
    line-height: 1.6;
}

.dashboard {
    max-width: 1400px;
    margin: 0 auto;
    padding: 20px;
}

.dashboard-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 30px;
    padding: 20px;
    background: white;
    border-radius: 12px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.dashboard-header h1 {
    font-size: 2rem;
    font-weight: 700;
    color: #1d1d1f;
}

.status-indicators {
    display: flex;
    gap: 20px;
}

.indicator {
    display: flex;
    align-items: center;
    gap: 8px;
}

.indicator .dot {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: #34c759;
    animation: pulse 2s infinite;
}

.indicator .dot.warning { background: #ff9500; }
.indicator .dot.error { background: #ff3b30; }

@keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
}

.dashboard-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
    gap: 20px;
}

.card {
    background: white;
    border-radius: 12px;
    padding: 24px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    border: 1px solid #e5e5e7;
}

.card h2 {
    margin-bottom: 20px;
    font-size: 1.25rem;
    font-weight: 600;
    color: #1d1d1f;
}

.metrics-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
}

.metric {
    text-align: center;
    padding: 16px;
    background: #f9f9fb;
    border-radius: 8px;
}

.metric .value {
    display: block;
    font-size: 1.5rem;
    font-weight: 700;
    color: #007aff;
    margin-bottom: 4px;
}

.metric .label {
    font-size: 0.875rem;
    color: #6e6e73;
}

.cost-summary {
    margin-bottom: 20px;
}

.cost-item {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 12px;
}

.provider {
    width: 60px;
    font-weight: 600;
    font-size: 0.875rem;
}

.cost-bar {
    flex: 1;
    height: 8px;
    background: #e5e5e7;
    border-radius: 4px;
    overflow: hidden;
}

.cost-fill {
    height: 100%;
    border-radius: 4px;
    transition: width 0.3s ease;
}

.claude-fill { background: #007aff; }
.gemini-fill { background: #34c759; }

.cost-value {
    font-weight: 600;
    font-size: 0.875rem;
    min-width: 50px;
    text-align: right;
}

.performance-stats {
    display: flex;
    justify-content: space-around;
    margin-top: 20px;
}

.stat {
    text-align: center;
}

.stat .label {
    display: block;
    font-size: 0.875rem;
    color: #6e6e73;
    margin-bottom: 4px;
}

.stat .value {
    font-size: 1.25rem;
    font-weight: 600;
    color: #1d1d1f;
}

.workflow-summary {
    display: flex;
    justify-content: space-around;
    margin-bottom: 20px;
    padding: 16px;
    background: #f9f9fb;
    border-radius: 8px;
}

.workflow-stat {
    text-align: center;
}

.workflow-stat .value {
    display: block;
    font-size: 1.5rem;
    font-weight: 700;
    color: #007aff;
    margin-bottom: 4px;
}

.workflow-stat .label {
    font-size: 0.875rem;
    color: #6e6e73;
}

.alert-list {
    max-height: 200px;
    overflow-y: auto;
    margin-bottom: 20px;
}

.alert-item {
    padding: 12px;
    margin-bottom: 8px;
    border-radius: 6px;
    border-left: 4px solid #ff9500;
    background: #fff8f0;
}

.alert-item.error {
    border-left-color: #ff3b30;
    background: #fff0f0;
}

.alert-item.success {
    border-left-color: #34c759;
    background: #f0fff0;
}

.emergency-controls {
    display: flex;
    gap: 12px;
}

.emergency-btn {
    flex: 1;
    padding: 12px;
    border: none;
    border-radius: 6px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
}

.emergency-btn {
    background: #ff3b30;
    color: white;
}

.emergency-btn:hover {
    background: #d70015;
}

.emergency-btn.resume {
    background: #34c759;
}

.emergency-btn.resume:hover {
    background: #248a3d;
}

.agent-list {
    max-height: 150px;
    overflow-y: auto;
}

.agent-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 0;
    border-bottom: 1px solid #f0f0f0;
}

.agent-name {
    font-weight: 500;
}

.agent-status {
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 0.75rem;
    font-weight: 600;
}

.agent-status.ready { background: #e8f5e8; color: #34c759; }
.agent-status.executing { background: #e8f2ff; color: #007aff; }
.agent-status.error { background: #ffe8e8; color: #ff3b30; }

.recent-workflows {
    max-height: 150px;
    overflow-y: auto;
}

.workflow-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 0;
    border-bottom: 1px solid #f0f0f0;
}

.workflow-name {
    font-weight: 500;
}

.workflow-duration {
    font-size: 0.75rem;
    color: #6e6e73;
}

@media (max-width: 768px) {
    .dashboard-grid {
        grid-template-columns: 1fr;
    }
    
    .dashboard-header {
        flex-direction: column;
        gap: 16px;
    }
    
    .metrics-grid {
        grid-template-columns: 1fr;
    }
}`;
  }
  
  /**
   * Generate dashboard JavaScript
   */
  generateDashboardJS() {
    return `class PantheonDashboard {
    constructor() {
        this.socket = null;
        this.charts = {};
        this.lastUpdate = Date.now();
        this.metrics = {};
        
        this.initialize();
    }
    
    async initialize() {
        await this.connectWebSocket();
        this.setupCharts();
        this.setupEventListeners();
        this.startPeriodicUpdates();
        
        console.log('Pantheon Dashboard initialized');
    }
    
    async connectWebSocket() {
        try {
            this.socket = io();
            
            this.socket.on('connect', () => {
                console.log('Connected to dashboard server');
                this.updateConnectionStatus(true);
            });
            
            this.socket.on('disconnect', () => {
                console.log('Disconnected from dashboard server');
                this.updateConnectionStatus(false);
            });
            
            this.socket.on('metricsUpdate', (data) => {
                this.handleMetricsUpdate(data);
            });
            
        } catch (error) {
            console.error('WebSocket connection failed:', error);
            this.fallbackToPolling();
        }
    }
    
    fallbackToPolling() {
        console.log('Falling back to HTTP polling');
        setInterval(() => {
            this.fetchMetrics();
        }, 5000);
    }
    
    async fetchMetrics() {
        try {
            const response = await fetch('/api/metrics');
            const data = await response.json();
            this.handleMetricsUpdate(data);
        } catch (error) {
            console.error('Failed to fetch metrics:', error);
        }
    }
    
    handleMetricsUpdate(data) {
        this.metrics = data.metrics;
        this.lastUpdate = data.timestamp;
        
        this.updateSystemOverview();
        this.updateAgentStatus();
        this.updateCostTracking();
        this.updatePerformanceMetrics();
        this.updateWorkflowStatus();
        this.updateCharts();
    }
    
    updateSystemOverview() {
        const system = this.metrics.system || {};
        const agents = this.metrics.agents || {};
        
        document.getElementById('uptime').textContent = this.formatUptime(system.uptime || 0);
        document.getElementById('total-agents').textContent = agents.total || 0;
        document.getElementById('active-tasks').textContent = agents.executing || 0;
        document.getElementById('success-rate').textContent = 
            ((agents.completed || 0) / Math.max(agents.total || 1, 1) * 100).toFixed(1) + '%';
    }
    
    updateAgentStatus() {
        const agents = this.metrics.agents || {};
        const agentList = document.getElementById('agent-list');
        
        if (agents.byType) {
            agentList.innerHTML = '';
            Object.entries(agents.byType).forEach(([type, count]) => {
                const item = document.createElement('div');
                item.className = 'agent-item';
                item.innerHTML = \`
                    <span class="agent-name">\${type}</span>
                    <span class="agent-status ready">\${count} active</span>
                \`;
                agentList.appendChild(item);
            });
        }
    }
    
    updateCostTracking() {
        const costs = this.metrics.costs || {};
        const daily = costs.daily || {};
        
        const claudeUsage = (daily.claude || 0) / 100; // Convert cents to dollars
        const geminiUsage = (daily.gemini || 0) / 100;
        
        document.getElementById('claude-cost').textContent = \`$\${claudeUsage.toFixed(2)}\`;
        document.getElementById('gemini-cost').textContent = \`$\${geminiUsage.toFixed(2)}\`;
        
        // Update cost bars (assuming daily limits)
        const claudePercent = Math.min((daily.claude || 0) / 1000 * 100, 100);
        const geminiPercent = Math.min((daily.gemini || 0) / 1500 * 100, 100);
        
        document.getElementById('claude-usage').style.width = \`\${claudePercent}%\`;
        document.getElementById('gemini-usage').style.width = \`\${geminiPercent}%\`;
    }
    
    updatePerformanceMetrics() {
        const routing = this.metrics.routing || {};
        const workflows = this.metrics.workflows || {};
        
        document.getElementById('avg-response-time').textContent = 
            \`\${routing.avgDecisionTime || 0}ms\`;
        document.getElementById('tasks-per-hour').textContent = 
            routing.totalRequests || 0;
    }
    
    updateWorkflowStatus() {
        const workflows = this.metrics.workflows || {};
        
        document.getElementById('active-workflows').textContent = workflows.active || 0;
        document.getElementById('completed-workflows').textContent = workflows.completed || 0;
        document.getElementById('failed-workflows').textContent = workflows.failed || 0;
    }
    
    setupCharts() {
        // Agent Chart
        const agentCtx = document.getElementById('agentChart').getContext('2d');
        this.charts.agents = new Chart(agentCtx, {
            type: 'doughnut',
            data: {
                labels: ['Active', 'Executing', 'Ready', 'Error'],
                datasets: [{
                    data: [0, 0, 0, 0],
                    backgroundColor: ['#34c759', '#007aff', '#8e8e93', '#ff3b30'],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
        
        // Cost Chart
        const costCtx = document.getElementById('costChart').getContext('2d');
        this.charts.costs = new Chart(costCtx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [
                    {
                        label: 'Claude',
                        data: [],
                        borderColor: '#007aff',
                        backgroundColor: 'rgba(0,122,255,0.1)',
                        fill: true
                    },
                    {
                        label: 'Gemini',
                        data: [],
                        borderColor: '#34c759',
                        backgroundColor: 'rgba(52,199,89,0.1)',
                        fill: true
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Cost ($)'
                        }
                    }
                }
            }
        });
        
        // Performance Chart
        const perfCtx = document.getElementById('performanceChart').getContext('2d');
        this.charts.performance = new Chart(perfCtx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'Response Time (ms)',
                    data: [],
                    borderColor: '#ff9500',
                    backgroundColor: 'rgba(255,149,0,0.1)',
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Response Time (ms)'
                        }
                    }
                }
            }
        });
    }
    
    updateCharts() {
        const agents = this.metrics.agents || {};
        const costs = this.metrics.costs || {};
        const routing = this.metrics.routing || {};
        
        // Update agent chart
        if (this.charts.agents) {
            this.charts.agents.data.datasets[0].data = [
                agents.active || 0,
                agents.executing || 0,
                agents.total - (agents.active || 0) - (agents.executing || 0),
                agents.errors || 0
            ];
            this.charts.agents.update();
        }
        
        // Update cost chart with hourly data
        if (this.charts.costs && costs.hourly) {
            const now = new Date();
            const labels = costs.hourly.map((_, i) => {
                const hour = new Date(now.getTime() - (costs.hourly.length - 1 - i) * 3600000);
                return hour.toLocaleTimeString('en-US', { hour: '2-digit' });
            });
            
            this.charts.costs.data.labels = labels;
            this.charts.costs.data.datasets[0].data = costs.hourly.map(h => (h.claude || 0) / 100);
            this.charts.costs.data.datasets[1].data = costs.hourly.map(h => (h.gemini || 0) / 100);
            this.charts.costs.update();
        }
    }
    
    setupEventListeners() {
        document.getElementById('emergency-stop').addEventListener('click', async () => {
            if (confirm('Are you sure you want to activate emergency stop?')) {
                try {
                    await fetch('/api/emergency/stop', { method: 'POST' });
                    this.showAlert('Emergency stop activated', 'error');
                } catch (error) {
                    console.error('Failed to activate emergency stop:', error);
                }
            }
        });
        
        document.getElementById('emergency-resume').addEventListener('click', async () => {
            const authorizedBy = prompt('Enter your authorization ID:');
            if (authorizedBy) {
                try {
                    await fetch('/api/emergency/resume', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ authorizedBy })
                    });
                    this.showAlert('Emergency stop deactivated', 'success');
                } catch (error) {
                    console.error('Failed to deactivate emergency stop:', error);
                }
            }
        });
    }
    
    startPeriodicUpdates() {
        setInterval(() => {
            if (!this.socket || !this.socket.connected) {
                this.fetchMetrics();
            }
        }, 10000); // Fallback polling every 10 seconds
    }
    
    updateConnectionStatus(connected) {
        const systemStatus = document.getElementById('system-status').querySelector('.dot');
        systemStatus.className = \`dot \${connected ? '' : 'error'}\`;
    }
    
    showAlert(message, type = 'info') {
        const alertList = document.getElementById('alert-list');
        const alert = document.createElement('div');
        alert.className = \`alert-item \${type}\`;
        alert.textContent = \`\${new Date().toLocaleTimeString()}: \${message}\`;
        
        alertList.insertBefore(alert, alertList.firstChild);
        
        // Remove old alerts (keep only last 10)
        while (alertList.children.length > 10) {
            alertList.removeChild(alertList.lastChild);
        }
        
        // Auto-remove after 30 seconds
        setTimeout(() => {
            if (alert.parentNode) {
                alert.parentNode.removeChild(alert);
            }
        }, 30000);
    }
    
    formatUptime(milliseconds) {
        const seconds = Math.floor(milliseconds / 1000);
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        
        if (hours > 0) {
            return \`\${hours}h \${minutes}m\`;
        } else if (minutes > 0) {
            return \`\${minutes}m\`;
        } else {
            return \`\${seconds}s\`;
        }
    }
}

// Initialize dashboard when page loads
document.addEventListener('DOMContentLoaded', () => {
    window.dashboard = new PantheonDashboard();
});`;
  }
  
  /**
   * Setup component event listeners
   */
  setupComponentListeners() {
    if (this.orchestrator) {
      this.orchestrator.on('taskCompleted', (data) => {
        this.updateAgentMetrics('taskCompleted', data);
      });
      
      this.orchestrator.on('agentCreated', (data) => {
        this.updateAgentMetrics('agentCreated', data);
      });
      
      this.orchestrator.on('metricsUpdated', (data) => {
        this.updateSystemMetrics(data);
      });
    }
    
    if (this.costController) {
      this.costController.on('usageRecorded', (data) => {
        this.updateCostMetrics(data);
      });
      
      this.costController.on('thresholdAlert', (data) => {
        this.addAlert(data, 'warning');
      });
      
      this.costController.on('emergencyStop', (data) => {
        this.addAlert(data, 'error');
      });
    }
    
    if (this.workflowMonitor) {
      this.workflowMonitor.on('workflowCompleted', (data) => {
        this.updateWorkflowMetrics('completed', data);
      });
      
      this.workflowMonitor.on('workflowFailed', (data) => {
        this.updateWorkflowMetrics('failed', data);
      });
    }
  }
  
  /**
   * Start metrics collection
   */
  startMetricsCollection() {
    // Collect system metrics every 5 seconds
    setInterval(() => {
      this.collectSystemMetrics();
    }, this.updateInterval);
    
    // Broadcast updates to connected clients
    setInterval(() => {
      this.broadcastMetricsUpdate();
    }, this.updateInterval);
    
    // Clean old metrics data every minute
    setInterval(() => {
      this.cleanOldMetrics();
    }, 60000);
  }
  
  /**
   * Collect system metrics
   */
  collectSystemMetrics() {
    const memUsage = process.memoryUsage();
    
    this.metrics.system.uptime = Date.now() - this.startTime;
    this.metrics.system.memoryUsage.push({
      timestamp: Date.now(),
      rss: memUsage.rss,
      heapUsed: memUsage.heapUsed,
      heapTotal: memUsage.heapTotal
    });
    
    // Keep only recent data
    if (this.metrics.system.memoryUsage.length > this.historyLength) {
      this.metrics.system.memoryUsage.shift();
    }
  }
  
  /**
   * Broadcast metrics update to connected clients
   */
  broadcastMetricsUpdate() {
    if (this.io && this.wsConnections.size > 0) {
      const updateData = {
        timestamp: Date.now(),
        metrics: this.metrics
      };
      
      this.io.emit('metricsUpdate', updateData);
    }
  }
  
  /**
   * Update agent metrics
   */
  updateAgentMetrics(type, data) {
    switch (type) {
      case 'taskCompleted':
        this.metrics.agents.performance.push({
          timestamp: Date.now(),
          duration: data.duration,
          success: true,
          agent: data.agent
        });
        break;
        
      case 'agentCreated':
        this.metrics.agents.total++;
        this.metrics.agents.active++;
        break;
    }
    
    this.trimArrayToLimit(this.metrics.agents.performance);
  }
  
  /**
   * Update cost metrics
   */
  updateCostMetrics(data) {
    this.metrics.costs.daily = data.currentUsage;
    
    // Add to hourly tracking
    const hour = new Date().getHours();
    const hourlyEntry = { timestamp: Date.now(), hour, ...data.currentUsage };
    
    this.metrics.costs.hourly.push(hourlyEntry);
    this.trimArrayToLimit(this.metrics.costs.hourly);
  }
  
  /**
   * Update workflow metrics
   */
  updateWorkflowMetrics(type, data) {
    this.metrics.workflows[type]++;
    
    this.metrics.workflows.recent.push({
      timestamp: Date.now(),
      type,
      workflow: data.workflow || 'unknown',
      duration: data.duration || 0
    });
    
    this.trimArrayToLimit(this.metrics.workflows.recent);
  }
  
  /**
   * Add alert to metrics
   */
  addAlert(data, severity = 'info') {
    this.metrics.costs.alerts.push({
      timestamp: Date.now(),
      severity,
      message: data.message || JSON.stringify(data),
      data
    });
    
    this.trimArrayToLimit(this.metrics.costs.alerts);
  }
  
  /**
   * Trim array to history limit
   */
  trimArrayToLimit(array) {
    while (array.length > this.historyLength) {
      array.shift();
    }
  }
  
  /**
   * Clean old metrics data
   */
  cleanOldMetrics() {
    const oneHourAgo = Date.now() - (60 * 60 * 1000);
    
    // Clean old performance data
    this.metrics.agents.performance = this.metrics.agents.performance
      .filter(p => p.timestamp > oneHourAgo);
      
    // Clean old cost data
    this.metrics.costs.hourly = this.metrics.costs.hourly
      .filter(c => c.timestamp > oneHourAgo);
      
    // Clean old alerts
    this.metrics.costs.alerts = this.metrics.costs.alerts
      .filter(a => a.timestamp > oneHourAgo);
  }
  
  /**
   * Get helper methods for API endpoints
   */
  getSystemStatus() {
    return {
      uptime: this.metrics.system.uptime,
      memoryUsage: this.metrics.system.memoryUsage.slice(-1)[0],
      activeConnections: this.wsConnections.size,
      lastUpdate: this.lastUpdate
    };
  }
  
  getAgentStatus() {
    return this.metrics.agents;
  }
  
  getCostStatus() {
    return this.metrics.costs;
  }
  
  getWorkflowStatus() {
    return this.metrics.workflows;
  }
  
  getMetricsHistory(type, limit) {
    switch (type) {
      case 'performance':
        return this.metrics.agents.performance.slice(-limit);
      case 'costs':
        return this.metrics.costs.hourly.slice(-limit);
      case 'workflows':
        return this.metrics.workflows.recent.slice(-limit);
      default:
        return {
          performance: this.metrics.agents.performance.slice(-limit),
          costs: this.metrics.costs.hourly.slice(-limit),
          workflows: this.metrics.workflows.recent.slice(-limit)
        };
    }
  }
  
  getPerformanceBenchmarks() {
    const performance = this.metrics.agents.performance;
    if (performance.length === 0) return null;
    
    const durations = performance.map(p => p.duration);
    const avg = durations.reduce((a, b) => a + b, 0) / durations.length;
    const sorted = durations.sort((a, b) => a - b);
    const p95 = sorted[Math.floor(sorted.length * 0.95)];
    const p99 = sorted[Math.floor(sorted.length * 0.99)];
    
    return {
      average: avg,
      p95,
      p99,
      min: Math.min(...durations),
      max: Math.max(...durations),
      totalSamples: performance.length
    };
  }
  
  getActiveAlerts() {
    return this.metrics.costs.alerts.filter(alert => 
      Date.now() - alert.timestamp < (30 * 60 * 1000) // Last 30 minutes
    );
  }
  
  /**
   * Stop the dashboard server
   */
  async stop() {
    if (this.server) {
      return new Promise((resolve) => {
        this.server.close(() => {
          this.logger.info('Metrics Dashboard stopped');
          resolve();
        });
      });
    }
  }
}

export default MetricsDashboard;