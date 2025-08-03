import { EventEmitter } from 'eventemitter3';
import winston from 'winston';
import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs/promises';

/**
 * CostController manages cost tracking and enforcement across all AI models
 * Provides real-time cost monitoring, limits, alerts, and predictions
 */
export class CostController extends EventEmitter {
  constructor(config = {}) {
    super();
    
    // Cost limits configuration
    this.dailyLimits = config.dailyLimits || {
      claude: 1000, // $10.00
      gemini: 1500, // $15.00 (Gemini is free but we track for awareness)
      total: 2000   // $20.00
    };
    
    this.warningThresholds = config.warningThresholds || {
      level1: 0.5,  // 50%
      level2: 0.75, // 75%
      level3: 0.9   // 90%
    };
    
    // Rate limiting
    this.rateLimits = config.rateLimits || {
      claude: {
        requests_per_minute: 50,
        tokens_per_minute: 10000
      },
      gemini: {
        requests_per_minute: 100,
        tokens_per_minute: 50000
      }
    };
    
    // Pricing per 1000 tokens (in cents)
    this.pricing = {
      'claude-sonnet': { input: 300, output: 1500 },    // $3.00/$15.00
      'claude-haiku': { input: 25, output: 125 },       // $0.25/$1.25
      'claude-opus': { input: 1500, output: 7500 },     // $15.00/$75.00
      'gemini-2.5-pro': { input: 0, output: 0 },        // Free
      'gemini-2.5-flash': { input: 0, output: 0 },      // Free
      'gemini-pro': { input: 0, output: 0 },            // Free
      'gemini-flash': { input: 0, output: 0 }           // Free
    };
    
    // Current usage tracking
    this.currentUsage = {
      daily: { claude: 0, gemini: 0, total: 0 },
      hourly: { claude: 0, gemini: 0, total: 0 },
      monthly: { claude: 0, gemini: 0, total: 0 }
    };
    
    // Request tracking for rate limiting
    this.requestTracking = new Map();
    
    // Database for persistent storage
    this.dbPath = path.join('.claude', 'cost-tracking.db');
    this.db = null;
    
    // State management
    this.emergencyStop = false;
    this.alertsSent = new Set();
    this.lastResetDate = new Date().toDateString();
    
    // Logging
    this.logger = winston.createLogger({
      level: process.env.PANTHEON_LOG_LEVEL || 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json()
      ),
      defaultMeta: { component: 'CostController' },
      transports: [
        new winston.transports.File({
          filename: '.claude/logs/cost-controller.log',
          maxsize: 5242880, // 5MB
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
   * Initialize the cost controller
   */
  async initialize() {
    try {
      await this.ensureDirectories();
      await this.initializeDatabase();
      await this.loadCurrentUsage();
      this.startPeriodicTasks();
      
      this.logger.info('Cost Controller initialized', {
        dailyLimits: this.dailyLimits,
        currentUsage: this.currentUsage.daily
      });
      
      this.emit('initialized');
      
    } catch (error) {
      this.logger.error('Failed to initialize cost controller', { error: error.message });
      throw error;
    }
  }
  
  /**
   * Ensure required directories exist
   */
  async ensureDirectories() {
    try {
      await fs.mkdir('.claude', { recursive: true });
      await fs.mkdir('.claude/logs', { recursive: true });
    } catch (error) {
      // Directory might already exist
    }
  }
  
  /**
   * Initialize SQLite database for cost tracking
   */
  async initializeDatabase() {
    this.db = new Database(this.dbPath);
    
    // Create tables
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS usage_records (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        timestamp TEXT NOT NULL,
        date TEXT NOT NULL,
        hour INTEGER NOT NULL,
        model TEXT NOT NULL,
        provider TEXT NOT NULL,
        task_type TEXT,
        input_tokens INTEGER DEFAULT 0,
        output_tokens INTEGER DEFAULT 0,
        cost_cents INTEGER DEFAULT 0,
        agent_id TEXT,
        task_id TEXT
      );
      
      CREATE INDEX IF NOT EXISTS idx_date_hour ON usage_records(date, hour);
      CREATE INDEX IF NOT EXISTS idx_provider_date ON usage_records(provider, date);
      CREATE INDEX IF NOT EXISTS idx_model_date ON usage_records(model, date);
      
      CREATE TABLE IF NOT EXISTS cost_alerts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        timestamp TEXT NOT NULL,
        alert_type TEXT NOT NULL,
        provider TEXT NOT NULL,
        threshold_level TEXT,
        current_usage INTEGER,
        limit_value INTEGER,
        message TEXT
      );
      
      CREATE TABLE IF NOT EXISTS rate_limit_violations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        timestamp TEXT NOT NULL,
        provider TEXT NOT NULL,
        violation_type TEXT NOT NULL,
        current_rate INTEGER,
        limit_rate INTEGER,
        agent_id TEXT
      );
    `);
    
    this.logger.info('Database initialized');
  }
  
  /**
   * Load current usage from database
   */
  async loadCurrentUsage() {
    const today = new Date().toDateString();
    const currentHour = new Date().getHours();
    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
    
    // Daily usage
    const dailyQuery = this.db.prepare(`
      SELECT provider, SUM(cost_cents) as total_cost
      FROM usage_records 
      WHERE date = ?
      GROUP BY provider
    `);
    
    const dailyResults = dailyQuery.all(today);
    this.currentUsage.daily = { claude: 0, gemini: 0, total: 0 };
    
    dailyResults.forEach(row => {
      this.currentUsage.daily[row.provider] = row.total_cost;
      this.currentUsage.daily.total += row.total_cost;
    });
    
    // Hourly usage
    const hourlyQuery = this.db.prepare(`
      SELECT provider, SUM(cost_cents) as total_cost
      FROM usage_records 
      WHERE date = ? AND hour = ?
      GROUP BY provider
    `);
    
    const hourlyResults = hourlyQuery.all(today, currentHour);
    this.currentUsage.hourly = { claude: 0, gemini: 0, total: 0 };
    
    hourlyResults.forEach(row => {
      this.currentUsage.hourly[row.provider] = row.total_cost;
      this.currentUsage.hourly.total += row.total_cost;
    });
    
    // Monthly usage
    const monthlyQuery = this.db.prepare(`
      SELECT provider, SUM(cost_cents) as total_cost
      FROM usage_records 
      WHERE date LIKE ?
      GROUP BY provider
    `);
    
    const monthlyResults = monthlyQuery.all(`${currentMonth}%`);
    this.currentUsage.monthly = { claude: 0, gemini: 0, total: 0 };
    
    monthlyResults.forEach(row => {
      this.currentUsage.monthly[row.provider] = row.total_cost;
      this.currentUsage.monthly.total += row.total_cost;
    });
    
    this.logger.info('Current usage loaded', { usage: this.currentUsage });
  }
  
  /**
   * Check if request is allowed under current limits
   */
  async checkRequestAllowed(request) {
    const { model, estimatedTokens = 1000, agentId, taskType } = request;
    const provider = this.getProviderFromModel(model);
    
    try {
      // Check emergency stop
      if (this.emergencyStop) {
        return {
          allowed: false,
          reason: 'Emergency stop activated - all requests blocked',
          code: 'EMERGENCY_STOP'
        };
      }
      
      // Check daily limits
      const dailyCheck = this.checkDailyLimit(provider, estimatedTokens);
      if (!dailyCheck.allowed) {
        return dailyCheck;
      }
      
      // Check rate limits
      const rateCheck = this.checkRateLimit(provider, agentId);
      if (!rateCheck.allowed) {
        return rateCheck;
      }
      
      // Estimate cost
      const estimatedCost = this.estimateCost(model, estimatedTokens, estimatedTokens);
      
      // Check if this request would exceed limits
      const totalDailyAfter = this.currentUsage.daily.total + estimatedCost;
      if (totalDailyAfter > this.dailyLimits.total) {
        return {
          allowed: false,
          reason: `Request would exceed daily total limit (${totalDailyAfter} > ${this.dailyLimits.total})`,
          code: 'DAILY_LIMIT_EXCEEDED',
          estimatedCost
        };
      }
      
      return {
        allowed: true,
        estimatedCost,
        provider,
        warnings: this.getUsageWarnings(provider, estimatedCost)
      };
      
    } catch (error) {
      this.logger.error('Error checking request allowance', { error: error.message, request });
      return {
        allowed: false,
        reason: 'Internal error checking limits',
        code: 'INTERNAL_ERROR'
      };
    }
  }
  
  /**
   * Record actual usage after request completion
   */
  async recordUsage(usage) {
    const {
      model,
      inputTokens = 0,
      outputTokens = 0,
      agentId,
      taskId,
      taskType,
      timestamp = new Date()
    } = usage;
    
    const provider = this.getProviderFromModel(model);
    const cost = this.calculateCost(model, inputTokens, outputTokens);
    const date = timestamp.toDateString();
    const hour = timestamp.getHours();
    
    try {
      // Insert into database
      const insertStmt = this.db.prepare(`
        INSERT INTO usage_records 
        (timestamp, date, hour, model, provider, task_type, input_tokens, output_tokens, cost_cents, agent_id, task_id)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      
      insertStmt.run(
        timestamp.toISOString(),
        date,
        hour,
        model,
        provider,
        taskType || 'unknown',
        inputTokens,
        outputTokens,
        cost,
        agentId,
        taskId
      );
      
      // Update current usage
      this.updateCurrentUsage(provider, cost, date, hour);
      
      // Check for threshold alerts
      await this.checkThresholdAlerts(provider, cost);
      
      this.logger.debug('Usage recorded', {
        model,
        provider,
        inputTokens,
        outputTokens,
        cost,
        currentDaily: this.currentUsage.daily
      });
      
      this.emit('usageRecorded', {
        provider,
        model,
        cost,
        currentUsage: this.currentUsage.daily
      });
      
      return { success: true, cost, currentUsage: this.currentUsage.daily };
      
    } catch (error) {
      this.logger.error('Failed to record usage', { error: error.message, usage });
      throw error;
    }
  }
  
  /**
   * Calculate actual cost based on token usage
   */
  calculateCost(model, inputTokens, outputTokens) {
    const pricing = this.pricing[model];
    if (!pricing) {
      this.logger.warn('Unknown model pricing', { model });
      return 0;
    }
    
    const inputCost = Math.ceil(inputTokens / 1000) * pricing.input;
    const outputCost = Math.ceil(outputTokens / 1000) * pricing.output;
    
    return inputCost + outputCost;
  }
  
  /**
   * Estimate cost for planning purposes
   */
  estimateCost(model, estimatedInputTokens, estimatedOutputTokens) {
    return this.calculateCost(model, estimatedInputTokens, estimatedOutputTokens);
  }
  
  /**
   * Check daily limit
   */
  checkDailyLimit(provider, estimatedTokens) {
    const currentDaily = this.currentUsage.daily[provider] || 0;
    const limit = this.dailyLimits[provider];
    
    if (currentDaily >= limit) {
      return {
        allowed: false,
        reason: `Daily limit exceeded for ${provider} (${currentDaily} >= ${limit})`,
        code: 'DAILY_LIMIT_EXCEEDED'
      };
    }
    
    return { allowed: true };
  }
  
  /**
   * Check rate limit
   */
  checkRateLimit(provider, agentId) {
    const now = Date.now();
    const rateLimitKey = `${provider}:${agentId}`;
    const rateLimit = this.rateLimits[provider];
    
    if (!rateLimit) {
      return { allowed: true };
    }
    
    // Get or create tracking entry
    if (!this.requestTracking.has(rateLimitKey)) {
      this.requestTracking.set(rateLimitKey, {
        requests: [],
        tokens: []
      });
    }
    
    const tracking = this.requestTracking.get(rateLimitKey);
    
    // Clean old entries (older than 1 minute)
    const oneMinuteAgo = now - 60000;
    tracking.requests = tracking.requests.filter(timestamp => timestamp > oneMinuteAgo);
    tracking.tokens = tracking.tokens.filter(entry => entry.timestamp > oneMinuteAgo);
    
    // Check request rate
    if (tracking.requests.length >= rateLimit.requests_per_minute) {
      this.recordRateViolation(provider, 'requests', tracking.requests.length, rateLimit.requests_per_minute, agentId);
      return {
        allowed: false,
        reason: `Rate limit exceeded: ${tracking.requests.length} requests/minute (limit: ${rateLimit.requests_per_minute})`,
        code: 'RATE_LIMIT_EXCEEDED'
      };
    }
    
    // Add current request
    tracking.requests.push(now);
    
    return { allowed: true };
  }
  
  /**
   * Record rate limit violation
   */
  recordRateViolation(provider, violationType, currentRate, limitRate, agentId) {
    try {
      const insertStmt = this.db.prepare(`
        INSERT INTO rate_limit_violations 
        (timestamp, provider, violation_type, current_rate, limit_rate, agent_id)
        VALUES (?, ?, ?, ?, ?, ?)
      `);
      
      insertStmt.run(
        new Date().toISOString(),
        provider,
        violationType,
        currentRate,
        limitRate,
        agentId
      );
      
      this.logger.warn('Rate limit violation recorded', {
        provider,
        violationType,
        currentRate,
        limitRate,
        agentId
      });
      
    } catch (error) {
      this.logger.error('Failed to record rate violation', { error: error.message });
    }
  }
  
  /**
   * Update current usage tracking
   */
  updateCurrentUsage(provider, cost, date, hour) {
    const today = new Date().toDateString();
    const currentHour = new Date().getHours();
    const currentMonth = new Date().toISOString().slice(0, 7);
    
    // Update daily if same day
    if (date === today) {
      this.currentUsage.daily[provider] += cost;
      this.currentUsage.daily.total += cost;
    }
    
    // Update hourly if same hour
    if (date === today && hour === currentHour) {
      this.currentUsage.hourly[provider] += cost;
      this.currentUsage.hourly.total += cost;
    }
    
    // Update monthly (always for current month)
    if (date.startsWith(currentMonth)) {
      this.currentUsage.monthly[provider] += cost;
      this.currentUsage.monthly.total += cost;
    }
  }
  
  /**
   * Check threshold alerts and send if necessary
   */
  async checkThresholdAlerts(provider, additionalCost) {
    const currentUsage = this.currentUsage.daily[provider] + additionalCost;
    const limit = this.dailyLimits[provider];
    const percentage = currentUsage / limit;
    
    for (const [level, threshold] of Object.entries(this.warningThresholds)) {
      if (percentage >= threshold) {
        const alertKey = `${provider}:${level}:${this.lastResetDate}`;
        
        if (!this.alertsSent.has(alertKey)) {
          await this.sendThresholdAlert(provider, level, percentage, currentUsage, limit);
          this.alertsSent.add(alertKey);
        }
      }
    }
  }
  
  /**
   * Send threshold alert
   */
  async sendThresholdAlert(provider, level, percentage, currentUsage, limit) {
    const message = `Cost threshold ${level} reached for ${provider}: ${(percentage * 100).toFixed(1)}% (${currentUsage}/${limit} cents)`;
    
    try {
      // Record alert in database
      const insertStmt = this.db.prepare(`
        INSERT INTO cost_alerts 
        (timestamp, alert_type, provider, threshold_level, current_usage, limit_value, message)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);
      
      insertStmt.run(
        new Date().toISOString(),
        'threshold',
        provider,
        level,
        currentUsage,
        limit,
        message
      );
      
      // Emit event
      this.emit('thresholdAlert', {
        provider,
        level,
        percentage,
        currentUsage,
        limit,
        message
      });
      
      this.logger.warn('Cost threshold alert', {
        provider,
        level,
        percentage: `${(percentage * 100).toFixed(1)}%`,
        currentUsage,
        limit
      });
      
      // Emergency stop if critical threshold
      if (level === 'level3' && percentage >= 0.95) {
        await this.activateEmergencyStop(`Critical cost threshold reached for ${provider}`);
      }
      
    } catch (error) {
      this.logger.error('Failed to send threshold alert', { error: error.message });
    }
  }
  
  /**
   * Activate emergency stop
   */
  async activateEmergencyStop(reason) {
    this.emergencyStop = true;
    
    const message = `EMERGENCY STOP ACTIVATED: ${reason}`;
    this.logger.error(message);
    
    try {
      const insertStmt = this.db.prepare(`
        INSERT INTO cost_alerts 
        (timestamp, alert_type, provider, threshold_level, current_usage, limit_value, message)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);
      
      insertStmt.run(
        new Date().toISOString(),
        'emergency_stop',
        'all',
        'critical',
        this.currentUsage.daily.total,
        this.dailyLimits.total,
        message
      );
      
    } catch (error) {
      this.logger.error('Failed to record emergency stop', { error: error.message });
    }
    
    this.emit('emergencyStop', { reason, currentUsage: this.currentUsage.daily });
  }
  
  /**
   * Deactivate emergency stop (manual override)
   */
  async deactivateEmergencyStop(authorizedBy) {
    this.emergencyStop = false;
    
    const message = `Emergency stop deactivated by: ${authorizedBy}`;
    this.logger.warn(message);
    
    this.emit('emergencyStopDeactivated', { authorizedBy });
  }
  
  /**
   * Get usage warnings for a request
   */
  getUsageWarnings(provider, estimatedCost) {
    const warnings = [];
    const afterCost = this.currentUsage.daily[provider] + estimatedCost;
    const limit = this.dailyLimits[provider];
    const percentage = afterCost / limit;
    
    if (percentage > 0.8) {
      warnings.push({
        type: 'cost_warning',
        message: `Request will bring ${provider} usage to ${(percentage * 100).toFixed(1)}% of daily limit`,
        severity: percentage > 0.9 ? 'high' : 'medium'
      });
    }
    
    return warnings;
  }
  
  /**
   * Get provider from model name
   */
  getProviderFromModel(model) {
    if (model.includes('claude')) return 'claude';
    if (model.includes('gemini')) return 'gemini';
    return 'unknown';
  }
  
  /**
   * Start periodic tasks
   */
  startPeriodicTasks() {
    // Reset daily usage at midnight
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    const msUntilMidnight = tomorrow.getTime() - now.getTime();
    
    setTimeout(() => {
      this.resetDailyUsage();
      // Then set up daily interval
      setInterval(() => this.resetDailyUsage(), 24 * 60 * 60 * 1000);
    }, msUntilMidnight);
    
    // Clean old rate limit tracking every minute
    setInterval(() => this.cleanOldRateTracking(), 60000);
    
    // Generate cost reports every hour
    setInterval(() => this.generateHourlyReport(), 60 * 60 * 1000);
  }
  
  /**
   * Reset daily usage counters
   */
  resetDailyUsage() {
    this.currentUsage.daily = { claude: 0, gemini: 0, total: 0 };
    this.currentUsage.hourly = { claude: 0, gemini: 0, total: 0 };
    this.alertsSent.clear();
    this.lastResetDate = new Date().toDateString();
    
    this.logger.info('Daily usage reset');
    this.emit('dailyReset');
  }
  
  /**
   * Clean old rate tracking data
   */
  cleanOldRateTracking() {
    const oneMinuteAgo = Date.now() - 60000;
    
    for (const [key, tracking] of this.requestTracking) {
      tracking.requests = tracking.requests.filter(timestamp => timestamp > oneMinuteAgo);
      tracking.tokens = tracking.tokens.filter(entry => entry.timestamp > oneMinuteAgo);
      
      // Remove empty tracking entries
      if (tracking.requests.length === 0 && tracking.tokens.length === 0) {
        this.requestTracking.delete(key);
      }
    }
  }
  
  /**
   * Generate hourly cost report
   */
  generateHourlyReport() {
    const report = {
      timestamp: new Date().toISOString(),
      currentUsage: { ...this.currentUsage },
      limits: { ...this.dailyLimits },
      utilizationPercentages: {
        claude: (this.currentUsage.daily.claude / this.dailyLimits.claude) * 100,
        gemini: (this.currentUsage.daily.gemini / this.dailyLimits.gemini) * 100,
        total: (this.currentUsage.daily.total / this.dailyLimits.total) * 100
      },
      emergencyStop: this.emergencyStop
    };
    
    this.logger.info('Hourly cost report', report);
    this.emit('hourlyReport', report);
  }
  
  /**
   * Get comprehensive cost status
   */
  getCostStatus() {
    return {
      currentUsage: { ...this.currentUsage },
      limits: { ...this.dailyLimits },
      utilizationPercentages: {
        claude: (this.currentUsage.daily.claude / this.dailyLimits.claude) * 100,
        gemini: (this.currentUsage.daily.gemini / this.dailyLimits.gemini) * 100,
        total: (this.currentUsage.daily.total / this.dailyLimits.total) * 100
      },
      emergencyStop: this.emergencyStop,
      warningThresholds: { ...this.warningThresholds },
      rateLimits: { ...this.rateLimits },
      activeRateTracking: this.requestTracking.size,
      lastReset: this.lastResetDate
    };
  }
  
  /**
   * Get cost analytics
   */
  async getCostAnalytics(days = 7) {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    try {
      const analyticsQuery = this.db.prepare(`
        SELECT 
          date,
          provider,
          model,
          SUM(cost_cents) as total_cost,
          SUM(input_tokens) as total_input_tokens,
          SUM(output_tokens) as total_output_tokens,
          COUNT(*) as request_count
        FROM usage_records 
        WHERE date BETWEEN ? AND ?
        GROUP BY date, provider, model
        ORDER BY date DESC, total_cost DESC
      `);
      
      const results = analyticsQuery.all(
        startDate.toDateString(),
        endDate.toDateString()
      );
      
      return {
        period: { start: startDate, end: endDate, days },
        data: results,
        summary: this.calculateAnalyticsSummary(results)
      };
      
    } catch (error) {
      this.logger.error('Failed to get cost analytics', { error: error.message });
      throw error;
    }
  }
  
  /**
   * Calculate analytics summary
   */
  calculateAnalyticsSummary(data) {
    const summary = {
      totalCost: 0,
      totalRequests: 0,
      totalTokens: 0,
      byProvider: {},
      byModel: {},
      dailyAverages: {}
    };
    
    data.forEach(row => {
      summary.totalCost += row.total_cost;
      summary.totalRequests += row.request_count;
      summary.totalTokens += row.total_input_tokens + row.total_output_tokens;
      
      // By provider
      if (!summary.byProvider[row.provider]) {
        summary.byProvider[row.provider] = { cost: 0, requests: 0, tokens: 0 };
      }
      summary.byProvider[row.provider].cost += row.total_cost;
      summary.byProvider[row.provider].requests += row.request_count;
      summary.byProvider[row.provider].tokens += row.total_input_tokens + row.total_output_tokens;
      
      // By model
      if (!summary.byModel[row.model]) {
        summary.byModel[row.model] = { cost: 0, requests: 0, tokens: 0 };
      }
      summary.byModel[row.model].cost += row.total_cost;
      summary.byModel[row.model].requests += row.request_count;
      summary.byModel[row.model].tokens += row.total_input_tokens + row.total_output_tokens;
    });
    
    return summary;
  }
  
  /**
   * Close database connection
   */
  async close() {
    if (this.db) {
      this.db.close();
      this.logger.info('Cost Controller closed');
    }
  }
}

export default CostController;