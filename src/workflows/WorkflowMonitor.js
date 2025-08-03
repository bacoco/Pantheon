import { EventEmitter } from 'eventemitter3';
import fs from 'fs/promises';
import path from 'path';
import Database from 'better-sqlite3';

/**
 * Workflow Monitor - Real-time monitoring and analytics for workflows
 */
export class WorkflowMonitor extends EventEmitter {
  constructor(config = {}) {
    super();
    
    // Configuration
    this.config = {
      dbPath: config.dbPath || '.claude/state/workflow-analytics.db',
      metricsInterval: config.metricsInterval || 5000, // 5 seconds
      retentionDays: config.retentionDays || 30,
      alertThresholds: config.alertThresholds || {
        duration: 3600000, // 1 hour
        failureRate: 0.2, // 20%
        stageTimeout: 0.1, // 10% over expected
        costOverrun: 0.15 // 15% over budget
      },
      ...config
    };
    
    // Active workflow tracking
    this.activeWorkflows = new Map();
    this.workflowMetrics = new Map();
    this.stageMetrics = new Map();
    
    // Performance tracking
    this.performanceData = {
      avgDuration: {},
      successRate: {},
      failureReasons: {},
      bottlenecks: [],
      trends: {}
    };
    
    // Alerts
    this.alerts = [];
    this.alertSubscribers = new Set();
    
    // Statistics
    this.statistics = {
      totalWorkflows: 0,
      activeWorkflows: 0,
      completedWorkflows: 0,
      failedWorkflows: 0,
      totalStages: 0,
      completedStages: 0,
      failedStages: 0,
      avgWorkflowDuration: 0,
      avgStageDuration: 0,
      totalCost: 0
    };
    
    // Initialize
    this.initialize();
  }
  
  /**
   * Initialize monitor
   */
  async initialize() {
    await this.initializeDatabase();
    this.startMetricsCollection();
    this.setupCleanup();
  }
  
  /**
   * Initialize database
   */
  async initializeDatabase() {
    try {
      // Ensure directory exists
      const dbDir = path.dirname(this.config.dbPath);
      await fs.mkdir(dbDir, { recursive: true });
      
      // Open database
      this.db = new Database(this.config.dbPath);
      
      // Create tables
      this.db.exec(`
        CREATE TABLE IF NOT EXISTS workflow_executions (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          version TEXT,
          start_time DATETIME NOT NULL,
          end_time DATETIME,
          duration_ms INTEGER,
          state TEXT NOT NULL,
          success BOOLEAN,
          total_stages INTEGER,
          completed_stages INTEGER,
          failed_stages INTEGER,
          total_cost REAL,
          error TEXT,
          parameters TEXT,
          results TEXT
        );
        
        CREATE INDEX IF NOT EXISTS idx_workflow_name ON workflow_executions(name);
        CREATE INDEX IF NOT EXISTS idx_workflow_state ON workflow_executions(state);
        CREATE INDEX IF NOT EXISTS idx_workflow_start ON workflow_executions(start_time);
        
        CREATE TABLE IF NOT EXISTS stage_executions (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          workflow_id TEXT NOT NULL,
          stage_name TEXT NOT NULL,
          agent TEXT,
          start_time DATETIME NOT NULL,
          end_time DATETIME,
          duration_ms INTEGER,
          success BOOLEAN,
          error TEXT,
          input_size INTEGER,
          output_size INTEGER,
          cost REAL,
          FOREIGN KEY (workflow_id) REFERENCES workflow_executions(id)
        );
        
        CREATE INDEX IF NOT EXISTS idx_stage_workflow ON stage_executions(workflow_id);
        CREATE INDEX IF NOT EXISTS idx_stage_name ON stage_executions(stage_name);
        
        CREATE TABLE IF NOT EXISTS workflow_metrics (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
          workflow_name TEXT NOT NULL,
          metric_name TEXT NOT NULL,
          metric_value REAL NOT NULL,
          metric_unit TEXT
        );
        
        CREATE INDEX IF NOT EXISTS idx_metrics_workflow ON workflow_metrics(workflow_name);
        CREATE INDEX IF NOT EXISTS idx_metrics_name ON workflow_metrics(metric_name);
        
        CREATE TABLE IF NOT EXISTS alerts (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
          workflow_id TEXT,
          alert_type TEXT NOT NULL,
          severity TEXT NOT NULL,
          message TEXT NOT NULL,
          details TEXT,
          acknowledged BOOLEAN DEFAULT 0
        );
        
        CREATE INDEX IF NOT EXISTS idx_alerts_workflow ON alerts(workflow_id);
        CREATE INDEX IF NOT EXISTS idx_alerts_type ON alerts(alert_type);
      `);
      
    } catch (error) {
      console.error('Failed to initialize database:', error);
    }
  }
  
  /**
   * Start monitoring a workflow
   */
  startWorkflow(workflow) {
    const monitorData = {
      id: workflow.id,
      name: workflow.name,
      version: workflow.version,
      startTime: new Date(),
      state: 'running',
      stages: new Map(),
      metrics: {
        stagesCompleted: 0,
        stagesFailed: 0,
        totalDuration: 0,
        stageDurations: {},
        cost: 0
      }
    };
    
    this.activeWorkflows.set(workflow.id, monitorData);
    this.statistics.activeWorkflows++;
    this.statistics.totalWorkflows++;
    
    // Subscribe to workflow events
    this.subscribeToWorkflow(workflow);
    
    // Record in database
    this.recordWorkflowStart(workflow);
    
    this.emit('workflowMonitoringStarted', {
      workflowId: workflow.id,
      workflowName: workflow.name
    });
  }
  
  /**
   * Subscribe to workflow events
   */
  subscribeToWorkflow(workflow) {
    // Workflow-level events
    workflow.on('stageStarted', (data) => this.handleStageStarted(data));
    workflow.on('stageCompleted', (data) => this.handleStageCompleted(data));
    workflow.on('stageFailed', (data) => this.handleStageFailed(data));
    workflow.on('workflowCompleted', (data) => this.handleWorkflowCompleted(data));
    workflow.on('workflowFailed', (data) => this.handleWorkflowFailed(data));
    workflow.on('workflowPaused', (data) => this.handleWorkflowPaused(data));
    workflow.on('workflowResumed', (data) => this.handleWorkflowResumed(data));
  }
  
  /**
   * Handle stage started event
   */
  handleStageStarted(data) {
    const workflow = this.activeWorkflows.get(data.workflow);
    if (!workflow) return;
    
    workflow.stages.set(data.stage, {
      name: data.stage,
      agent: data.agent,
      startTime: new Date(),
      state: 'running'
    });
    
    this.emit('stageMonitoringStarted', {
      workflowId: workflow.id,
      stageName: data.stage,
      agent: data.agent
    });
  }
  
  /**
   * Handle stage completed event
   */
  handleStageCompleted(data) {
    const workflow = this.activeWorkflows.get(data.workflow);
    if (!workflow) return;
    
    const stage = workflow.stages.get(data.stage);
    if (stage) {
      stage.endTime = new Date();
      stage.duration = data.duration;
      stage.state = 'completed';
      stage.result = data.result;
      
      workflow.metrics.stagesCompleted++;
      workflow.metrics.stageDurations[data.stage] = data.duration;
      
      // Update statistics
      this.statistics.completedStages++;
      this.updateAverageStageDuration(data.duration);
      
      // Check for performance issues
      this.checkStagePerformance(workflow.name, data.stage, data.duration);
      
      // Record in database
      this.recordStageExecution(workflow.id, stage);
    }
    
    this.emit('stageMonitoringCompleted', {
      workflowId: workflow.id,
      stageName: data.stage,
      duration: data.duration
    });
  }
  
  /**
   * Handle stage failed event
   */
  handleStageFailed(data) {
    const workflow = this.activeWorkflows.get(data.workflow);
    if (!workflow) return;
    
    const stage = workflow.stages.get(data.stage);
    if (stage) {
      stage.endTime = new Date();
      stage.duration = data.duration;
      stage.state = 'failed';
      stage.error = data.error;
      
      workflow.metrics.stagesFailed++;
      
      // Update statistics
      this.statistics.failedStages++;
      
      // Create alert
      this.createAlert({
        workflowId: workflow.id,
        type: 'stage_failure',
        severity: 'warning',
        message: `Stage '${data.stage}' failed in workflow '${workflow.name}'`,
        details: { error: data.error }
      });
      
      // Record failure reason
      this.recordFailureReason(workflow.name, data.stage, data.error);
    }
    
    this.emit('stageMonitoringFailed', {
      workflowId: workflow.id,
      stageName: data.stage,
      error: data.error
    });
  }
  
  /**
   * Handle workflow completed event
   */
  handleWorkflowCompleted(data) {
    const workflow = this.activeWorkflows.get(data.id);
    if (!workflow) return;
    
    workflow.endTime = new Date();
    workflow.state = 'completed';
    workflow.metrics.totalDuration = workflow.endTime - workflow.startTime;
    
    // Update statistics
    this.statistics.completedWorkflows++;
    this.statistics.activeWorkflows--;
    this.updateAverageWorkflowDuration(workflow.metrics.totalDuration);
    
    // Calculate success rate
    const successRate = workflow.metrics.stagesCompleted / 
                       (workflow.metrics.stagesCompleted + workflow.metrics.stagesFailed);
    
    // Update performance data
    this.updatePerformanceData(workflow.name, {
      duration: workflow.metrics.totalDuration,
      successRate: successRate,
      cost: data.metrics?.totalCost || 0
    });
    
    // Record in database
    this.recordWorkflowCompletion(workflow);
    
    // Remove from active
    this.activeWorkflows.delete(data.id);
    
    this.emit('workflowMonitoringCompleted', {
      workflowId: data.id,
      workflowName: workflow.name,
      duration: workflow.metrics.totalDuration,
      successRate: successRate
    });
  }
  
  /**
   * Handle workflow failed event
   */
  handleWorkflowFailed(data) {
    const workflow = this.activeWorkflows.get(data.id);
    if (!workflow) return;
    
    workflow.endTime = new Date();
    workflow.state = 'failed';
    workflow.error = data.error;
    
    // Update statistics
    this.statistics.failedWorkflows++;
    this.statistics.activeWorkflows--;
    
    // Create alert
    this.createAlert({
      workflowId: data.id,
      type: 'workflow_failure',
      severity: 'high',
      message: `Workflow '${workflow.name}' failed`,
      details: {
        error: data.error,
        completedStages: data.completedStages,
        failedStages: data.failedStages
      }
    });
    
    // Record in database
    this.recordWorkflowCompletion(workflow);
    
    // Remove from active
    this.activeWorkflows.delete(data.id);
    
    this.emit('workflowMonitoringFailed', {
      workflowId: data.id,
      workflowName: workflow.name,
      error: data.error
    });
  }
  
  /**
   * Handle workflow paused event
   */
  handleWorkflowPaused(data) {
    const workflow = this.activeWorkflows.get(data.id);
    if (!workflow) return;
    
    workflow.state = 'paused';
    workflow.pausedAt = new Date();
    
    this.emit('workflowMonitoringPaused', {
      workflowId: data.id,
      workflowName: workflow.name
    });
  }
  
  /**
   * Handle workflow resumed event
   */
  handleWorkflowResumed(data) {
    const workflow = this.activeWorkflows.get(data.id);
    if (!workflow) return;
    
    workflow.state = 'running';
    
    if (workflow.pausedAt) {
      const pauseDuration = new Date() - workflow.pausedAt;
      workflow.metrics.pauseDuration = (workflow.metrics.pauseDuration || 0) + pauseDuration;
      delete workflow.pausedAt;
    }
    
    this.emit('workflowMonitoringResumed', {
      workflowId: data.id,
      workflowName: workflow.name
    });
  }
  
  /**
   * Check stage performance
   */
  checkStagePerformance(workflowName, stageName, duration) {
    // Get historical average
    const avgKey = `${workflowName}.${stageName}`;
    const historicalAvg = this.getHistoricalAverage(avgKey);
    
    if (historicalAvg) {
      const deviation = (duration - historicalAvg) / historicalAvg;
      
      if (deviation > this.config.alertThresholds.stageTimeout) {
        this.createAlert({
          type: 'performance_degradation',
          severity: 'warning',
          message: `Stage '${stageName}' took ${(deviation * 100).toFixed(1)}% longer than average`,
          details: {
            workflow: workflowName,
            stage: stageName,
            duration: duration,
            average: historicalAvg
          }
        });
      }
    }
  }
  
  /**
   * Update performance data
   */
  updatePerformanceData(workflowName, metrics) {
    if (!this.performanceData.avgDuration[workflowName]) {
      this.performanceData.avgDuration[workflowName] = metrics.duration;
      this.performanceData.successRate[workflowName] = metrics.successRate;
    } else {
      // Calculate moving average
      const alpha = 0.3; // Smoothing factor
      this.performanceData.avgDuration[workflowName] = 
        alpha * metrics.duration + (1 - alpha) * this.performanceData.avgDuration[workflowName];
      this.performanceData.successRate[workflowName] = 
        alpha * metrics.successRate + (1 - alpha) * this.performanceData.successRate[workflowName];
    }
    
    // Update cost tracking
    this.statistics.totalCost += metrics.cost;
    
    // Check for trends
    this.detectTrends(workflowName, metrics);
  }
  
  /**
   * Detect performance trends
   */
  detectTrends(workflowName, metrics) {
    if (!this.performanceData.trends[workflowName]) {
      this.performanceData.trends[workflowName] = {
        durations: [],
        successRates: []
      };
    }
    
    const trend = this.performanceData.trends[workflowName];
    trend.durations.push(metrics.duration);
    trend.successRates.push(metrics.successRate);
    
    // Keep last 20 data points
    if (trend.durations.length > 20) {
      trend.durations.shift();
      trend.successRates.shift();
    }
    
    // Detect negative trends
    if (trend.durations.length >= 5) {
      const recentAvg = trend.durations.slice(-5).reduce((a, b) => a + b, 0) / 5;
      const overallAvg = trend.durations.reduce((a, b) => a + b, 0) / trend.durations.length;
      
      if (recentAvg > overallAvg * 1.2) {
        this.createAlert({
          type: 'negative_trend',
          severity: 'warning',
          message: `Performance degradation detected in workflow '${workflowName}'`,
          details: {
            recentAverage: recentAvg,
            overallAverage: overallAvg,
            increase: ((recentAvg - overallAvg) / overallAvg * 100).toFixed(1) + '%'
          }
        });
      }
    }
  }
  
  /**
   * Record failure reason
   */
  recordFailureReason(workflowName, stageName, error) {
    const key = `${workflowName}.${stageName}`;
    
    if (!this.performanceData.failureReasons[key]) {
      this.performanceData.failureReasons[key] = {};
    }
    
    const errorType = this.categorizeError(error);
    this.performanceData.failureReasons[key][errorType] = 
      (this.performanceData.failureReasons[key][errorType] || 0) + 1;
  }
  
  /**
   * Categorize error
   */
  categorizeError(error) {
    const errorStr = error?.message || error?.toString() || 'unknown';
    
    if (errorStr.includes('timeout')) return 'timeout';
    if (errorStr.includes('validation')) return 'validation';
    if (errorStr.includes('rate_limit')) return 'rate_limit';
    if (errorStr.includes('permission')) return 'permission';
    if (errorStr.includes('network')) return 'network';
    if (errorStr.includes('memory')) return 'memory';
    
    return 'other';
  }
  
  /**
   * Create alert
   */
  createAlert(alert) {
    const fullAlert = {
      id: Date.now(),
      timestamp: new Date(),
      ...alert
    };
    
    this.alerts.push(fullAlert);
    
    // Keep last 100 alerts in memory
    if (this.alerts.length > 100) {
      this.alerts.shift();
    }
    
    // Notify subscribers
    this.notifyAlertSubscribers(fullAlert);
    
    // Record in database
    if (this.db) {
      this.recordAlert(fullAlert);
    }
    
    this.emit('alertCreated', fullAlert);
  }
  
  /**
   * Notify alert subscribers
   */
  notifyAlertSubscribers(alert) {
    for (const subscriber of this.alertSubscribers) {
      try {
        subscriber(alert);
      } catch (error) {
        console.error('Failed to notify alert subscriber:', error);
      }
    }
  }
  
  /**
   * Subscribe to alerts
   */
  subscribeToAlerts(callback) {
    this.alertSubscribers.add(callback);
    
    return () => {
      this.alertSubscribers.delete(callback);
    };
  }
  
  /**
   * Get active workflows
   */
  getActiveWorkflows() {
    return Array.from(this.activeWorkflows.values()).map(workflow => ({
      id: workflow.id,
      name: workflow.name,
      state: workflow.state,
      startTime: workflow.startTime,
      duration: new Date() - workflow.startTime,
      progress: {
        completed: workflow.metrics.stagesCompleted,
        failed: workflow.metrics.stagesFailed,
        total: workflow.stages.size
      }
    }));
  }
  
  /**
   * Get workflow metrics
   */
  getWorkflowMetrics(workflowName, period = 'day') {
    if (!this.db) return null;
    
    const periodMap = {
      hour: 'datetime("now", "-1 hour")',
      day: 'datetime("now", "-1 day")',
      week: 'datetime("now", "-7 days")',
      month: 'datetime("now", "-30 days")'
    };
    
    const since = periodMap[period] || periodMap.day;
    
    try {
      const stmt = this.db.prepare(`
        SELECT 
          COUNT(*) as total_executions,
          SUM(CASE WHEN success = 1 THEN 1 ELSE 0 END) as successful_executions,
          AVG(duration_ms) as avg_duration,
          MIN(duration_ms) as min_duration,
          MAX(duration_ms) as max_duration,
          AVG(completed_stages * 100.0 / total_stages) as avg_completion_rate,
          SUM(total_cost) as total_cost
        FROM workflow_executions
        WHERE name = ? AND start_time > ${since}
      `);
      
      return stmt.get(workflowName);
      
    } catch (error) {
      console.error('Failed to get workflow metrics:', error);
      return null;
    }
  }
  
  /**
   * Get stage metrics
   */
  getStageMetrics(stageName, period = 'day') {
    if (!this.db) return null;
    
    const periodMap = {
      hour: 'datetime("now", "-1 hour")',
      day: 'datetime("now", "-1 day")',
      week: 'datetime("now", "-7 days")',
      month: 'datetime("now", "-30 days")'
    };
    
    const since = periodMap[period] || periodMap.day;
    
    try {
      const stmt = this.db.prepare(`
        SELECT 
          COUNT(*) as total_executions,
          SUM(CASE WHEN success = 1 THEN 1 ELSE 0 END) as successful_executions,
          AVG(duration_ms) as avg_duration,
          MIN(duration_ms) as min_duration,
          MAX(duration_ms) as max_duration,
          AVG(cost) as avg_cost
        FROM stage_executions
        WHERE stage_name = ? AND start_time > ${since}
      `);
      
      return stmt.get(stageName);
      
    } catch (error) {
      console.error('Failed to get stage metrics:', error);
      return null;
    }
  }
  
  /**
   * Get performance report
   */
  getPerformanceReport() {
    return {
      statistics: this.statistics,
      activeWorkflows: this.getActiveWorkflows(),
      performanceData: this.performanceData,
      recentAlerts: this.alerts.slice(-10),
      topBottlenecks: this.identifyBottlenecks(),
      recommendations: this.generateRecommendations()
    };
  }
  
  /**
   * Identify bottlenecks
   */
  identifyBottlenecks() {
    const bottlenecks = [];
    
    // Analyze stage durations
    for (const [key, durations] of Object.entries(this.stageMetrics)) {
      const avg = durations.reduce((a, b) => a + b, 0) / durations.length;
      const variance = durations.reduce((sum, d) => sum + Math.pow(d - avg, 2), 0) / durations.length;
      const stdDev = Math.sqrt(variance);
      
      if (stdDev > avg * 0.5) {
        bottlenecks.push({
          stage: key,
          avgDuration: avg,
          variance: variance,
          volatility: 'high'
        });
      }
    }
    
    return bottlenecks.sort((a, b) => b.avgDuration - a.avgDuration).slice(0, 5);
  }
  
  /**
   * Generate recommendations
   */
  generateRecommendations() {
    const recommendations = [];
    
    // Check failure rates
    const failureRate = this.statistics.failedWorkflows / 
                       (this.statistics.completedWorkflows + this.statistics.failedWorkflows);
    
    if (failureRate > this.config.alertThresholds.failureRate) {
      recommendations.push({
        type: 'reliability',
        priority: 'high',
        message: `High failure rate detected (${(failureRate * 100).toFixed(1)}%)`,
        action: 'Review error logs and implement better error handling'
      });
    }
    
    // Check for slow workflows
    const slowWorkflows = Object.entries(this.performanceData.avgDuration)
      .filter(([name, duration]) => duration > this.config.alertThresholds.duration)
      .map(([name]) => name);
    
    if (slowWorkflows.length > 0) {
      recommendations.push({
        type: 'performance',
        priority: 'medium',
        message: `Workflows exceeding duration threshold: ${slowWorkflows.join(', ')}`,
        action: 'Consider optimizing or parallelizing stages'
      });
    }
    
    // Check cost trends
    if (this.statistics.totalCost > 0) {
      const avgCostPerWorkflow = this.statistics.totalCost / this.statistics.totalWorkflows;
      recommendations.push({
        type: 'cost',
        priority: 'low',
        message: `Average cost per workflow: $${avgCostPerWorkflow.toFixed(2)}`,
        action: 'Review cost optimization opportunities'
      });
    }
    
    return recommendations;
  }
  
  /**
   * Update average workflow duration
   */
  updateAverageWorkflowDuration(duration) {
    const total = this.statistics.completedWorkflows + this.statistics.failedWorkflows;
    this.statistics.avgWorkflowDuration = 
      (this.statistics.avgWorkflowDuration * (total - 1) + duration) / total;
  }
  
  /**
   * Update average stage duration
   */
  updateAverageStageDuration(duration) {
    const total = this.statistics.completedStages + this.statistics.failedStages;
    this.statistics.avgStageDuration = 
      (this.statistics.avgStageDuration * (total - 1) + duration) / total;
  }
  
  /**
   * Get historical average
   */
  getHistoricalAverage(key) {
    if (!this.db) return null;
    
    try {
      const [workflowName, stageName] = key.split('.');
      
      const stmt = this.db.prepare(`
        SELECT AVG(duration_ms) as avg_duration
        FROM stage_executions
        WHERE stage_name = ?
        AND workflow_id IN (
          SELECT id FROM workflow_executions WHERE name = ?
        )
      `);
      
      const result = stmt.get(stageName, workflowName);
      return result?.avg_duration || null;
      
    } catch (error) {
      console.error('Failed to get historical average:', error);
      return null;
    }
  }
  
  /**
   * Record workflow start in database
   */
  recordWorkflowStart(workflow) {
    if (!this.db) return;
    
    try {
      const stmt = this.db.prepare(`
        INSERT INTO workflow_executions (
          id, name, version, start_time, state, total_stages, parameters
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `);
      
      stmt.run(
        workflow.id,
        workflow.name,
        workflow.version,
        new Date().toISOString(),
        'running',
        Object.keys(workflow.stages).length,
        JSON.stringify(workflow.parameters || {})
      );
      
    } catch (error) {
      console.error('Failed to record workflow start:', error);
    }
  }
  
  /**
   * Record workflow completion in database
   */
  recordWorkflowCompletion(workflow) {
    if (!this.db) return;
    
    try {
      const stmt = this.db.prepare(`
        UPDATE workflow_executions
        SET end_time = ?, duration_ms = ?, state = ?, success = ?,
            completed_stages = ?, failed_stages = ?, total_cost = ?,
            error = ?, results = ?
        WHERE id = ?
      `);
      
      stmt.run(
        workflow.endTime.toISOString(),
        workflow.metrics.totalDuration,
        workflow.state,
        workflow.state === 'completed' ? 1 : 0,
        workflow.metrics.stagesCompleted,
        workflow.metrics.stagesFailed,
        workflow.metrics.cost || 0,
        workflow.error ? JSON.stringify(workflow.error) : null,
        workflow.state === 'completed' ? JSON.stringify(workflow.metrics) : null,
        workflow.id
      );
      
    } catch (error) {
      console.error('Failed to record workflow completion:', error);
    }
  }
  
  /**
   * Record stage execution in database
   */
  recordStageExecution(workflowId, stage) {
    if (!this.db) return;
    
    try {
      const stmt = this.db.prepare(`
        INSERT INTO stage_executions (
          workflow_id, stage_name, agent, start_time, end_time,
          duration_ms, success, error, cost
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      
      stmt.run(
        workflowId,
        stage.name,
        stage.agent,
        stage.startTime.toISOString(),
        stage.endTime?.toISOString(),
        stage.duration,
        stage.state === 'completed' ? 1 : 0,
        stage.error ? JSON.stringify(stage.error) : null,
        stage.cost || 0
      );
      
    } catch (error) {
      console.error('Failed to record stage execution:', error);
    }
  }
  
  /**
   * Record alert in database
   */
  recordAlert(alert) {
    if (!this.db) return;
    
    try {
      const stmt = this.db.prepare(`
        INSERT INTO alerts (
          workflow_id, alert_type, severity, message, details
        ) VALUES (?, ?, ?, ?, ?)
      `);
      
      stmt.run(
        alert.workflowId || null,
        alert.type,
        alert.severity,
        alert.message,
        alert.details ? JSON.stringify(alert.details) : null
      );
      
    } catch (error) {
      console.error('Failed to record alert:', error);
    }
  }
  
  /**
   * Start metrics collection
   */
  startMetricsCollection() {
    this.metricsInterval = setInterval(() => {
      this.collectMetrics();
    }, this.config.metricsInterval);
  }
  
  /**
   * Collect metrics
   */
  collectMetrics() {
    // Emit current statistics
    this.emit('metricsCollected', {
      timestamp: new Date(),
      statistics: this.statistics,
      activeWorkflows: this.activeWorkflows.size,
      alerts: this.alerts.length
    });
  }
  
  /**
   * Setup cleanup
   */
  setupCleanup() {
    // Daily cleanup of old data
    setInterval(async () => {
      await this.cleanupOldData();
    }, 24 * 60 * 60 * 1000);
  }
  
  /**
   * Cleanup old data
   */
  async cleanupOldData() {
    if (!this.db) return;
    
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - this.config.retentionDays);
      
      // Clean up old workflow executions
      this.db.prepare(`
        DELETE FROM workflow_executions
        WHERE start_time < ?
      `).run(cutoffDate.toISOString());
      
      // Clean up old alerts
      this.db.prepare(`
        DELETE FROM alerts
        WHERE timestamp < ? AND acknowledged = 1
      `).run(cutoffDate.toISOString());
      
      this.emit('dataCleanupCompleted', {
        cutoffDate: cutoffDate
      });
      
    } catch (error) {
      console.error('Failed to cleanup old data:', error);
    }
  }
  
  /**
   * Stop monitoring
   */
  stop() {
    if (this.metricsInterval) {
      clearInterval(this.metricsInterval);
    }
    
    if (this.db) {
      this.db.close();
    }
    
    this.emit('monitoringStopped');
  }
}

export default WorkflowMonitor;