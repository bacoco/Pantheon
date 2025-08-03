import { EventEmitter } from 'eventemitter3';

/**
 * Cost Optimizer - Manages cost optimization and budget control
 */
export class CostOptimizer extends EventEmitter {
  constructor(config = {}) {
    super();
    
    // Configuration
    this.config = {
      dailyClaudeLimit: parseInt(process.env.DAILY_CLAUDE_LIMIT) || config.dailyClaudeLimit || 1000,
      dailyGeminiLimit: parseInt(process.env.DAILY_GEMINI_LIMIT) || config.dailyGeminiLimit || 1500,
      costAlertThreshold: parseInt(process.env.COST_ALERT_THRESHOLD) || config.costAlertThreshold || 50,
      emergencyThreshold: parseInt(process.env.COST_EMERGENCY_THRESHOLD) || config.emergencyThreshold || 100,
      preferFreeTier: process.env.PREFER_FREE_TIER === 'true' || config.preferFreeTier !== false,
      ...config
    };
    
    // Cost tracking
    this.dailyUsage = {
      claude: { requests: 0, tokens: 0, cost: 0 },
      gemini: { requests: 0, tokens: 0, cost: 0 },
      total: { requests: 0, tokens: 0, cost: 0 }
    };
    
    // Budget tracking
    this.budget = {
      daily: config.dailyBudget || 100,
      weekly: config.weeklyBudget || 500,
      monthly: config.monthlyBudget || 2000
    };
    
    // Historical data
    this.history = [];
    this.lastReset = new Date();
    
    // Model cost profiles
    this.modelCosts = {
      'claude-sonnet': {
        input: 0.003,    // per 1k tokens
        output: 0.015,    // per 1k tokens
        averageRatio: 0.3 // typical input/output ratio
      },
      'claude-haiku': {
        input: 0.00025,
        output: 0.00125,
        averageRatio: 0.3
      },
      'claude-opus': {
        input: 0.015,
        output: 0.075,
        averageRatio: 0.3
      },
      'gemini-2.5-pro': {
        input: 0,  // Free tier
        output: 0,
        averageRatio: 0.3,
        freeLimit: 1000  // requests per day
      },
      'gemini-2.5-flash': {
        input: 0,
        output: 0,
        averageRatio: 0.3,
        freeLimit: 1500
      }
    };
    
    // Optimization strategies
    this.strategies = {
      aggressive: {
        freeTierFirst: true,
        fallbackThreshold: 0.7,  // Switch to free tier at 70% budget
        cacheAggressively: true
      },
      balanced: {
        freeTierFirst: false,
        fallbackThreshold: 0.85,
        cacheAggressively: false
      },
      quality: {
        freeTierFirst: false,
        fallbackThreshold: 0.95,
        cacheAggressively: false
      }
    };
    
    this.currentStrategy = this.strategies.balanced;
    
    // Initialize daily reset timer
    this.setupDailyReset();
  }
  
  /**
   * Track usage for a request
   */
  trackUsage(request, response) {
    const provider = request.provider;
    const model = request.model;
    const modelKey = `${provider}-${model}`;
    
    // Calculate tokens (estimated if not provided)
    const inputTokens = response.inputTokens || this.estimateTokens(request.message);
    const outputTokens = response.outputTokens || this.estimateTokens(response.content);
    
    // Calculate cost
    const cost = this.calculateCost(modelKey, inputTokens, outputTokens);
    
    // Update daily usage
    if (provider === 'claude') {
      this.dailyUsage.claude.requests++;
      this.dailyUsage.claude.tokens += inputTokens + outputTokens;
      this.dailyUsage.claude.cost += cost;
    } else if (provider === 'gemini') {
      this.dailyUsage.gemini.requests++;
      this.dailyUsage.gemini.tokens += inputTokens + outputTokens;
      this.dailyUsage.gemini.cost += cost;
    }
    
    this.dailyUsage.total.requests++;
    this.dailyUsage.total.tokens += inputTokens + outputTokens;
    this.dailyUsage.total.cost += cost;
    
    // Check thresholds
    this.checkThresholds();
    
    // Record in history
    this.history.push({
      timestamp: new Date(),
      provider,
      model,
      inputTokens,
      outputTokens,
      cost,
      budgetRemaining: this.budget.daily - this.dailyUsage.total.cost
    });
    
    // Emit usage event
    this.emit('usageTracked', {
      provider,
      model,
      cost,
      dailyTotal: this.dailyUsage.total.cost
    });
    
    return {
      cost,
      dailyUsagePercent: (this.dailyUsage.total.cost / this.budget.daily) * 100,
      withinBudget: this.dailyUsage.total.cost < this.budget.daily
    };
  }
  
  /**
   * Calculate cost for a model
   */
  calculateCost(modelKey, inputTokens, outputTokens) {
    const profile = this.modelCosts[modelKey];
    if (!profile) {
      return 0;
    }
    
    const inputCost = (inputTokens / 1000) * profile.input;
    const outputCost = (outputTokens / 1000) * profile.output;
    
    return inputCost + outputCost;
  }
  
  /**
   * Estimate tokens from text
   */
  estimateTokens(text) {
    if (!text) return 0;
    
    // Rough estimation: 1 token ≈ 4 characters
    return Math.ceil(text.length / 4);
  }
  
  /**
   * Check budget thresholds
   */
  checkThresholds() {
    const dailyPercent = (this.dailyUsage.total.cost / this.budget.daily) * 100;
    
    // Check alert threshold
    if (dailyPercent >= this.config.costAlertThreshold && dailyPercent < this.config.emergencyThreshold) {
      this.emit('costAlert', {
        level: 'warning',
        message: `Daily cost at ${dailyPercent.toFixed(1)}% of budget`,
        usage: this.dailyUsage,
        threshold: this.config.costAlertThreshold
      });
    }
    
    // Check emergency threshold
    if (dailyPercent >= this.config.emergencyThreshold) {
      this.emit('costEmergency', {
        level: 'critical',
        message: `Daily cost exceeded ${this.config.emergencyThreshold}% of budget`,
        usage: this.dailyUsage,
        threshold: this.config.emergencyThreshold
      });
      
      // Trigger emergency mode
      this.enterEmergencyMode();
    }
    
    // Check provider limits
    if (this.dailyUsage.claude.requests >= this.config.dailyClaudeLimit) {
      this.emit('providerLimitReached', {
        provider: 'claude',
        limit: this.config.dailyClaudeLimit,
        usage: this.dailyUsage.claude.requests
      });
    }
    
    if (this.dailyUsage.gemini.requests >= this.config.dailyGeminiLimit) {
      this.emit('providerLimitReached', {
        provider: 'gemini',
        limit: this.config.dailyGeminiLimit,
        usage: this.dailyUsage.gemini.requests
      });
    }
  }
  
  /**
   * Get optimization recommendation
   */
  getOptimizationRecommendation(taskType, contextSize) {
    const budgetUsed = (this.dailyUsage.total.cost / this.budget.daily) * 100;
    
    // Emergency mode - free tier only
    if (budgetUsed >= this.config.emergencyThreshold) {
      return {
        provider: 'gemini',
        model: 'gemini-2.5-flash',
        reason: 'Emergency mode - budget exceeded'
      };
    }
    
    // High budget usage - prefer free tier
    if (budgetUsed >= this.currentStrategy.fallbackThreshold * 100) {
      if (taskType === 'validation' || taskType === 'research') {
        return {
          provider: 'gemini',
          model: 'gemini-2.5-pro',
          reason: 'High budget usage - using free tier'
        };
      }
      return {
        provider: 'gemini',
        model: 'gemini-2.5-flash',
        reason: 'High budget usage - using free tier'
      };
    }
    
    // Normal operation - optimize based on task
    if (this.config.preferFreeTier) {
      // Prefer free tier for suitable tasks
      if (taskType === 'validation' || taskType === 'research' || taskType === 'ui_design') {
        return {
          provider: 'gemini',
          model: contextSize > 10000 ? 'gemini-2.5-pro' : 'gemini-2.5-flash',
          reason: 'Free tier preferred for this task type'
        };
      }
    }
    
    // Default to quality models for creation tasks
    if (taskType === 'creation' || taskType === 'architecture') {
      return {
        provider: 'claude',
        model: 'sonnet',
        reason: 'Quality model for creation task'
      };
    }
    
    // Balanced default
    return {
      provider: 'claude',
      model: 'haiku',
      reason: 'Balanced cost/quality option'
    };
  }
  
  /**
   * Enter emergency mode
   */
  enterEmergencyMode() {
    this.emit('emergencyModeActivated', {
      timestamp: new Date(),
      usage: this.dailyUsage,
      budget: this.budget
    });
    
    // Switch to aggressive cost saving
    this.currentStrategy = this.strategies.aggressive;
  }
  
  /**
   * Exit emergency mode
   */
  exitEmergencyMode() {
    this.emit('emergencyModeDeactivated', {
      timestamp: new Date()
    });
    
    // Return to balanced strategy
    this.currentStrategy = this.strategies.balanced;
  }
  
  /**
   * Get cost projection
   */
  getProjection(hoursAhead = 24) {
    if (this.history.length === 0) {
      return { projected: 0, withinBudget: true };
    }
    
    // Calculate average cost per hour from history
    const recentHistory = this.history.slice(-100); // Last 100 requests
    const timeSpan = recentHistory[recentHistory.length - 1].timestamp - recentHistory[0].timestamp;
    const hoursPassed = timeSpan / (1000 * 60 * 60);
    
    if (hoursPassed === 0) {
      return { projected: this.dailyUsage.total.cost, withinBudget: true };
    }
    
    const costPerHour = this.dailyUsage.total.cost / hoursPassed;
    const projectedCost = costPerHour * hoursAhead;
    
    return {
      projected: projectedCost,
      costPerHour,
      withinBudget: projectedCost <= this.budget.daily,
      budgetRemaining: this.budget.daily - projectedCost
    };
  }
  
  /**
   * Get usage statistics
   */
  getStatistics() {
    const projection = this.getProjection();
    
    return {
      daily: this.dailyUsage,
      budget: this.budget,
      budgetUsedPercent: (this.dailyUsage.total.cost / this.budget.daily) * 100,
      projection: projection,
      lastReset: this.lastReset,
      currentStrategy: this.currentStrategy,
      recommendations: {
        claudeRemaining: this.config.dailyClaudeLimit - this.dailyUsage.claude.requests,
        geminiRemaining: this.config.dailyGeminiLimit - this.dailyUsage.gemini.requests,
        shouldUseFreeTier: this.dailyUsage.total.cost >= (this.budget.daily * 0.5)
      }
    };
  }
  
  /**
   * Reset daily usage
   */
  resetDaily() {
    // Store history before reset
    this.emit('dailyReset', {
      date: new Date(),
      usage: this.dailyUsage
    });
    
    // Reset counters
    this.dailyUsage = {
      claude: { requests: 0, tokens: 0, cost: 0 },
      gemini: { requests: 0, tokens: 0, cost: 0 },
      total: { requests: 0, tokens: 0, cost: 0 }
    };
    
    this.lastReset = new Date();
    
    // Clear old history (keep last 7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    this.history = this.history.filter(entry => entry.timestamp > sevenDaysAgo);
    
    // Exit emergency mode if active
    if (this.currentStrategy === this.strategies.aggressive) {
      this.exitEmergencyMode();
    }
  }
  
  /**
   * Setup daily reset timer
   */
  setupDailyReset() {
    // Calculate time until midnight
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    const msUntilMidnight = tomorrow - now;
    
    // Set initial timeout
    setTimeout(() => {
      this.resetDaily();
      
      // Set recurring daily interval
      setInterval(() => {
        this.resetDaily();
      }, 24 * 60 * 60 * 1000);
      
    }, msUntilMidnight);
  }
  
  /**
   * Set optimization strategy
   */
  setStrategy(strategyName) {
    if (!this.strategies[strategyName]) {
      throw new Error(`Unknown strategy: ${strategyName}`);
    }
    
    this.currentStrategy = this.strategies[strategyName];
    
    this.emit('strategyChanged', {
      strategy: strategyName,
      config: this.currentStrategy
    });
  }
  
  /**
   * Export usage report
   */
  exportReport() {
    return {
      period: {
        start: this.lastReset,
        end: new Date()
      },
      usage: this.dailyUsage,
      budget: this.budget,
      history: this.history,
      projections: this.getProjection(),
      recommendations: this.getOptimizationRecommendations()
    };
  }
  
  /**
   * Get optimization recommendations
   */
  getOptimizationRecommendations() {
    const recommendations = [];
    const stats = this.getStatistics();
    
    if (stats.budgetUsedPercent > 80) {
      recommendations.push({
        priority: 'high',
        action: 'Switch to free tier models',
        savings: 'Up to 100% cost reduction',
        impact: 'Minimal for validation and research tasks'
      });
    }
    
    if (this.dailyUsage.claude.requests > this.dailyUsage.gemini.requests * 2) {
      recommendations.push({
        priority: 'medium',
        action: 'Increase Gemini usage for suitable tasks',
        savings: 'Reduce costs by 30-50%',
        impact: 'No impact on validation quality'
      });
    }
    
    if (!this.config.preferFreeTier) {
      recommendations.push({
        priority: 'low',
        action: 'Enable preferFreeTier setting',
        savings: 'Automatic cost optimization',
        impact: 'Automatic routing to free models when suitable'
      });
    }
    
    return recommendations;
  }
}

// Singleton instance
let optimizerInstance = null;

/**
 * Get or create singleton optimizer instance
 */
export function getOptimizer() {
  if (!optimizerInstance) {
    optimizerInstance = new CostOptimizer();
  }
  return optimizerInstance;
}

export default CostOptimizer;