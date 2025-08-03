import { EventEmitter } from 'eventemitter3';
import fs from 'fs/promises';
import path from 'path';
import Database from 'better-sqlite3';

/**
 * Usage Tracker - Tracks and manages API usage and quotas
 */
export class UsageTracker extends EventEmitter {
  constructor(config = {}) {
    super();
    
    // Configuration
    this.config = {
      dbPath: config.dbPath || '.claude/state/usage.db',
      trackingEnabled: config.trackingEnabled !== false,
      retentionDays: config.retentionDays || 30,
      ...config
    };
    
    // Quotas
    this.quotas = {
      claude: {
        daily: parseInt(process.env.DAILY_CLAUDE_LIMIT) || 1000,
        hourly: 100,
        concurrent: 5
      },
      gemini: {
        daily: parseInt(process.env.DAILY_GEMINI_LIMIT) || 1500,
        hourly: 150,
        concurrent: 10
      }
    };
    
    // Current usage
    this.usage = {
      claude: {
        daily: 0,
        hourly: 0,
        concurrent: 0,
        lastReset: {
          daily: new Date(),
          hourly: new Date()
        }
      },
      gemini: {
        daily: 0,
        hourly: 0,
        concurrent: 0,
        lastReset: {
          daily: new Date(),
          hourly: new Date()
        }
      }
    };
    
    // Rate limiting
    this.rateLimits = new Map();
    this.concurrentRequests = new Map();
    
    // Statistics
    this.statistics = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      rateLimitedRequests: 0,
      averageLatency: 0,
      requestsByModel: {},
      requestsByHour: new Array(24).fill(0),
      peakHour: 0
    };
    
    // Initialize
    this.initialize();
  }
  
  /**
   * Initialize tracker
   */
  async initialize() {
    if (this.config.trackingEnabled) {
      await this.initializeDatabase();
      await this.loadHistoricalData();
    }
    
    // Setup reset timers
    this.setupResetTimers();
    
    // Setup cleanup
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
        CREATE TABLE IF NOT EXISTS usage_records (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
          provider TEXT NOT NULL,
          model TEXT NOT NULL,
          agent TEXT,
          task_type TEXT,
          input_tokens INTEGER,
          output_tokens INTEGER,
          latency_ms INTEGER,
          success BOOLEAN,
          error TEXT,
          cost REAL
        );
        
        CREATE INDEX IF NOT EXISTS idx_timestamp ON usage_records(timestamp);
        CREATE INDEX IF NOT EXISTS idx_provider ON usage_records(provider);
        CREATE INDEX IF NOT EXISTS idx_model ON usage_records(model);
        
        CREATE TABLE IF NOT EXISTS quota_violations (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
          provider TEXT NOT NULL,
          quota_type TEXT NOT NULL,
          limit_value INTEGER,
          actual_value INTEGER,
          action_taken TEXT
        );
        
        CREATE TABLE IF NOT EXISTS daily_summaries (
          date DATE PRIMARY KEY,
          provider TEXT NOT NULL,
          total_requests INTEGER,
          successful_requests INTEGER,
          failed_requests INTEGER,
          total_tokens INTEGER,
          total_cost REAL,
          average_latency_ms INTEGER
        );
      `);
      
    } catch (error) {
      console.error('Failed to initialize database:', error);
      this.config.trackingEnabled = false;
    }
  }
  
  /**
   * Track API request
   */
  async trackRequest(request) {
    const provider = request.provider;
    
    // Check quotas before allowing request
    const quotaCheck = await this.checkQuota(provider);
    if (!quotaCheck.allowed) {
      this.statistics.rateLimitedRequests++;
      
      this.emit('quotaExceeded', {
        provider,
        quotaType: quotaCheck.reason,
        limit: quotaCheck.limit,
        current: quotaCheck.current
      });
      
      return {
        allowed: false,
        reason: quotaCheck.reason,
        retryAfter: quotaCheck.retryAfter
      };
    }
    
    // Increment concurrent counter
    this.incrementConcurrent(provider);
    
    // Track request start
    const requestId = this.generateRequestId();
    const startTime = Date.now();
    
    this.emit('requestStarted', {
      requestId,
      provider,
      model: request.model,
      timestamp: startTime
    });
    
    return {
      allowed: true,
      requestId,
      trackingCallback: async (response) => {
        await this.completeRequest(requestId, request, response, startTime);
      }
    };
  }
  
  /**
   * Complete request tracking
   */
  async completeRequest(requestId, request, response, startTime) {
    const provider = request.provider;
    const latency = Date.now() - startTime;
    
    // Decrement concurrent counter
    this.decrementConcurrent(provider);
    
    // Update usage counters
    this.usage[provider].daily++;
    this.usage[provider].hourly++;
    
    // Update statistics
    this.statistics.totalRequests++;
    if (response.success) {
      this.statistics.successfulRequests++;
    } else {
      this.statistics.failedRequests++;
    }
    
    // Update average latency
    this.statistics.averageLatency = 
      (this.statistics.averageLatency * (this.statistics.totalRequests - 1) + latency) / 
      this.statistics.totalRequests;
    
    // Track by model
    const modelKey = `${provider}-${request.model}`;
    this.statistics.requestsByModel[modelKey] = 
      (this.statistics.requestsByModel[modelKey] || 0) + 1;
    
    // Track by hour
    const hour = new Date().getHours();
    this.statistics.requestsByHour[hour]++;
    
    // Update peak hour
    const maxRequests = Math.max(...this.statistics.requestsByHour);
    this.statistics.peakHour = this.statistics.requestsByHour.indexOf(maxRequests);
    
    // Save to database if enabled
    if (this.config.trackingEnabled && this.db) {
      await this.saveToDatabase({
        provider: request.provider,
        model: request.model,
        agent: request.agent,
        task_type: request.taskType,
        input_tokens: response.inputTokens || 0,
        output_tokens: response.outputTokens || 0,
        latency_ms: latency,
        success: response.success ? 1 : 0,
        error: response.error || null,
        cost: response.cost || 0
      });
    }
    
    this.emit('requestCompleted', {
      requestId,
      provider,
      model: request.model,
      latency,
      success: response.success
    });
  }
  
  /**
   * Check quota
   */
  async checkQuota(provider) {
    const usage = this.usage[provider];
    const quotas = this.quotas[provider];
    
    // Check daily quota
    if (usage.daily >= quotas.daily) {
      const resetTime = new Date(usage.lastReset.daily);
      resetTime.setDate(resetTime.getDate() + 1);
      
      return {
        allowed: false,
        reason: 'daily_quota_exceeded',
        limit: quotas.daily,
        current: usage.daily,
        retryAfter: resetTime - new Date()
      };
    }
    
    // Check hourly quota
    if (usage.hourly >= quotas.hourly) {
      const resetTime = new Date(usage.lastReset.hourly);
      resetTime.setHours(resetTime.getHours() + 1);
      
      return {
        allowed: false,
        reason: 'hourly_quota_exceeded',
        limit: quotas.hourly,
        current: usage.hourly,
        retryAfter: resetTime - new Date()
      };
    }
    
    // Check concurrent quota
    if (usage.concurrent >= quotas.concurrent) {
      return {
        allowed: false,
        reason: 'concurrent_quota_exceeded',
        limit: quotas.concurrent,
        current: usage.concurrent,
        retryAfter: 1000 // Retry in 1 second
      };
    }
    
    return { allowed: true };
  }
  
  /**
   * Increment concurrent counter
   */
  incrementConcurrent(provider) {
    this.usage[provider].concurrent++;
  }
  
  /**
   * Decrement concurrent counter
   */
  decrementConcurrent(provider) {
    this.usage[provider].concurrent = Math.max(0, this.usage[provider].concurrent - 1);
  }
  
  /**
   * Save to database
   */
  async saveToDatabase(record) {
    try {
      const stmt = this.db.prepare(`
        INSERT INTO usage_records (
          provider, model, agent, task_type,
          input_tokens, output_tokens, latency_ms,
          success, error, cost
        ) VALUES (
          ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
        )
      `);
      
      stmt.run(
        record.provider,
        record.model,
        record.agent,
        record.task_type,
        record.input_tokens,
        record.output_tokens,
        record.latency_ms,
        record.success,
        record.error,
        record.cost
      );
      
    } catch (error) {
      console.error('Failed to save usage record:', error);
    }
  }
  
  /**
   * Load historical data
   */
  async loadHistoricalData() {
    if (!this.db) return;
    
    try {
      // Load today's usage
      const today = new Date().toISOString().split('T')[0];
      
      const stmt = this.db.prepare(`
        SELECT provider, COUNT(*) as count
        FROM usage_records
        WHERE DATE(timestamp) = ?
        GROUP BY provider
      `);
      
      const rows = stmt.all(today);
      
      for (const row of rows) {
        if (this.usage[row.provider]) {
          this.usage[row.provider].daily = row.count;
        }
      }
      
      // Load last hour's usage
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      
      const hourlyStmt = this.db.prepare(`
        SELECT provider, COUNT(*) as count
        FROM usage_records
        WHERE timestamp > ?
        GROUP BY provider
      `);
      
      const hourlyRows = hourlyStmt.all(oneHourAgo.toISOString());
      
      for (const row of hourlyRows) {
        if (this.usage[row.provider]) {
          this.usage[row.provider].hourly = row.count;
        }
      }
      
    } catch (error) {
      console.error('Failed to load historical data:', error);
    }
  }
  
  /**
   * Get usage statistics
   */
  async getStatistics(period = 'daily') {
    const stats = {
      current: this.usage,
      quotas: this.quotas,
      statistics: this.statistics,
      quotaUtilization: {}
    };
    
    // Calculate quota utilization
    for (const provider of ['claude', 'gemini']) {
      stats.quotaUtilization[provider] = {
        daily: (this.usage[provider].daily / this.quotas[provider].daily) * 100,
        hourly: (this.usage[provider].hourly / this.quotas[provider].hourly) * 100,
        concurrent: (this.usage[provider].concurrent / this.quotas[provider].concurrent) * 100
      };
    }
    
    // Add historical data if available
    if (this.db && period !== 'current') {
      stats.historical = await this.getHistoricalStatistics(period);
    }
    
    return stats;
  }
  
  /**
   * Get historical statistics
   */
  async getHistoricalStatistics(period) {
    if (!this.db) return null;
    
    let whereClause = '';
    const params = [];
    
    switch (period) {
      case 'daily':
        whereClause = 'WHERE DATE(timestamp) = DATE("now")';
        break;
      case 'weekly':
        whereClause = 'WHERE timestamp > datetime("now", "-7 days")';
        break;
      case 'monthly':
        whereClause = 'WHERE timestamp > datetime("now", "-30 days")';
        break;
    }
    
    try {
      const stmt = this.db.prepare(`
        SELECT 
          provider,
          model,
          COUNT(*) as total_requests,
          SUM(CASE WHEN success = 1 THEN 1 ELSE 0 END) as successful_requests,
          AVG(latency_ms) as avg_latency,
          SUM(input_tokens + output_tokens) as total_tokens,
          SUM(cost) as total_cost
        FROM usage_records
        ${whereClause}
        GROUP BY provider, model
      `);
      
      return stmt.all(...params);
      
    } catch (error) {
      console.error('Failed to get historical statistics:', error);
      return null;
    }
  }
  
  /**
   * Reset hourly usage
   */
  resetHourlyUsage() {
    for (const provider of ['claude', 'gemini']) {
      this.usage[provider].hourly = 0;
      this.usage[provider].lastReset.hourly = new Date();
    }
    
    this.emit('hourlyReset', {
      timestamp: new Date(),
      usage: this.usage
    });
  }
  
  /**
   * Reset daily usage
   */
  resetDailyUsage() {
    // Save daily summary before reset
    if (this.db) {
      this.saveDailySummary();
    }
    
    for (const provider of ['claude', 'gemini']) {
      this.usage[provider].daily = 0;
      this.usage[provider].hourly = 0;
      this.usage[provider].lastReset.daily = new Date();
      this.usage[provider].lastReset.hourly = new Date();
    }
    
    // Reset daily statistics
    this.statistics.requestsByHour = new Array(24).fill(0);
    
    this.emit('dailyReset', {
      timestamp: new Date(),
      usage: this.usage
    });
  }
  
  /**
   * Save daily summary
   */
  async saveDailySummary() {
    if (!this.db) return;
    
    const date = new Date().toISOString().split('T')[0];
    
    try {
      for (const provider of ['claude', 'gemini']) {
        const stmt = this.db.prepare(`
          INSERT OR REPLACE INTO daily_summaries (
            date, provider, total_requests, successful_requests,
            failed_requests, total_tokens, total_cost, average_latency_ms
          )
          SELECT 
            ?, ?, 
            COUNT(*),
            SUM(CASE WHEN success = 1 THEN 1 ELSE 0 END),
            SUM(CASE WHEN success = 0 THEN 1 ELSE 0 END),
            SUM(input_tokens + output_tokens),
            SUM(cost),
            AVG(latency_ms)
          FROM usage_records
          WHERE DATE(timestamp) = ? AND provider = ?
        `);
        
        stmt.run(date, provider, date, provider);
      }
    } catch (error) {
      console.error('Failed to save daily summary:', error);
    }
  }
  
  /**
   * Setup reset timers
   */
  setupResetTimers() {
    // Hourly reset
    setInterval(() => {
      this.resetHourlyUsage();
    }, 60 * 60 * 1000);
    
    // Daily reset at midnight
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    const msUntilMidnight = tomorrow - now;
    
    setTimeout(() => {
      this.resetDailyUsage();
      
      // Set recurring daily interval
      setInterval(() => {
        this.resetDailyUsage();
      }, 24 * 60 * 60 * 1000);
      
    }, msUntilMidnight);
  }
  
  /**
   * Setup cleanup
   */
  setupCleanup() {
    // Daily cleanup of old records
    setInterval(async () => {
      await this.cleanupOldRecords();
    }, 24 * 60 * 60 * 1000);
  }
  
  /**
   * Cleanup old records
   */
  async cleanupOldRecords() {
    if (!this.db) return;
    
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - this.config.retentionDays);
      
      const stmt = this.db.prepare(`
        DELETE FROM usage_records
        WHERE timestamp < ?
      `);
      
      const result = stmt.run(cutoffDate.toISOString());
      
      if (result.changes > 0) {
        this.emit('recordsCleanedUp', {
          count: result.changes,
          cutoffDate
        });
      }
      
    } catch (error) {
      console.error('Failed to cleanup old records:', error);
    }
  }
  
  /**
   * Generate request ID
   */
  generateRequestId() {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  /**
   * Export usage data
   */
  async exportData(format = 'json') {
    const data = {
      current: this.usage,
      quotas: this.quotas,
      statistics: this.statistics,
      timestamp: new Date()
    };
    
    if (this.db) {
      data.historical = await this.getHistoricalStatistics('monthly');
    }
    
    if (format === 'json') {
      return JSON.stringify(data, null, 2);
    }
    
    // Could add CSV or other formats
    return data;
  }
  
  /**
   * Close database connection
   */
  close() {
    if (this.db) {
      this.db.close();
    }
  }
}

// Singleton instance
let trackerInstance = null;

/**
 * Get or create singleton tracker instance
 */
export function getTracker() {
  if (!trackerInstance) {
    trackerInstance = new UsageTracker();
  }
  return trackerInstance;
}

export default UsageTracker;