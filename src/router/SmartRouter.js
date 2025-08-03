import { EventEmitter } from 'eventemitter3';
import winston from 'winston';
import fs from 'fs/promises';
import path from 'path';

/**
 * Smart Router - Intelligent model routing with cost optimization
 * Routes tasks to appropriate models based on multiple factors
 */
export class SmartRouter extends EventEmitter {
  constructor(config = {}) {
    super();
    
    // Configuration
    this.config = {
      strategy: process.env.ROUTING_STRATEGY || config.strategy || 'balanced',
      preferFreeTier: process.env.PREFER_FREE_TIER === 'true' || config.preferFreeTier || true,
      emergencyThreshold: parseInt(process.env.COST_EMERGENCY_THRESHOLD) || config.emergencyThreshold || 100,
      ...config
    };
    
    // Routing configurations
    this.routingStrategies = this.loadRoutingStrategies();
    this.taskPatterns = this.loadTaskPatterns();
    this.costProfiles = this.loadCostProfiles();
    this.agentRouting = this.loadAgentRouting();
    
    // State
    this.currentStrategy = this.routingStrategies[this.config.strategy];
    this.overrides = new Map();
    this.emergencyMode = false;
    
    // Metrics
    this.routingMetrics = {
      totalRouted: 0,
      byModel: {},
      byTaskType: {},
      costSaved: 0,
      fallbacksUsed: 0
    };
    
    // Logger
    this.logger = this.setupLogger();
    
    this.initialize();
  }
  
  /**
   * Setup logger
   */
  setupLogger() {
    return winston.createLogger({
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
      defaultMeta: { service: 'smart-router' },
      transports: [
        new winston.transports.File({ 
          filename: '.claude/logs/router.log',
          maxsize: 5242880,
          maxFiles: 5
        }),
        new winston.transports.Console({
          format: winston.format.simple()
        })
      ]
    });
  }
  
  /**
   * Initialize router
   */
  async initialize() {
    // Load custom configurations if they exist
    await this.loadCustomConfigurations();
    
    this.logger.info('Smart Router initialized', {
      strategy: this.config.strategy,
      preferFreeTier: this.config.preferFreeTier
    });
  }
  
  /**
   * Load routing strategies
   */
  loadRoutingStrategies() {
    return {
      cost_optimized: {
        name: 'Cost Optimized',
        description: 'Minimize costs while maintaining quality',
        rules: {
          creation: { provider: 'claude', model: 'sonnet' },
          validation: { provider: 'gemini', model: 'gemini-2.5-pro' },
          quick_tasks: { provider: 'gemini', model: 'gemini-2.5-flash' },
          documentation: { provider: 'claude', model: 'haiku' },
          research: { provider: 'gemini', model: 'gemini-2.5-pro' },
          ui_design: { provider: 'gemini', model: 'gemini-2.5-flash' }
        },
        fallbackChain: [
          { provider: 'gemini', model: 'gemini-2.5-flash' },
          { provider: 'claude', model: 'haiku' },
          { provider: 'gemini', model: 'gemini-2.5-pro' }
        ]
      },
      quality_focused: {
        name: 'Quality Focused',
        description: 'Maximize output quality regardless of cost',
        rules: {
          creation: { provider: 'claude', model: 'sonnet' },
          validation: { provider: 'claude', model: 'sonnet' },
          quick_tasks: { provider: 'claude', model: 'haiku' },
          documentation: { provider: 'claude', model: 'sonnet' },
          research: { provider: 'gemini', model: 'gemini-2.5-pro' },
          ui_design: { provider: 'gemini', model: 'gemini-2.5-pro' }
        },
        fallbackChain: [
          { provider: 'claude', model: 'sonnet' },
          { provider: 'gemini', model: 'gemini-2.5-pro' }
        ]
      },
      speed_focused: {
        name: 'Speed Focused',
        description: 'Optimize for fastest response times',
        rules: {
          creation: { provider: 'gemini', model: 'gemini-2.5-flash' },
          validation: { provider: 'gemini', model: 'gemini-2.5-flash' },
          quick_tasks: { provider: 'gemini', model: 'gemini-2.5-flash' },
          documentation: { provider: 'gemini', model: 'gemini-2.5-flash' },
          research: { provider: 'gemini', model: 'gemini-2.5-flash' },
          ui_design: { provider: 'gemini', model: 'gemini-2.5-flash' }
        },
        fallbackChain: [
          { provider: 'gemini', model: 'gemini-2.5-flash' },
          { provider: 'claude', model: 'haiku' }
        ]
      },
      balanced: {
        name: 'Balanced',
        description: 'Balance between cost, quality, and speed',
        rules: {
          creation: { provider: 'claude', model: 'sonnet' },
          validation: { provider: 'gemini', model: 'gemini-2.5-pro' },
          quick_tasks: { provider: 'gemini', model: 'gemini-2.5-flash' },
          documentation: { provider: 'claude', model: 'haiku' },
          research: { provider: 'gemini', model: 'gemini-2.5-pro' },
          ui_design: { provider: 'gemini', model: 'gemini-2.5-flash' }
        },
        fallbackChain: [
          { provider: 'gemini', model: 'gemini-2.5-flash' },
          { provider: 'claude', model: 'haiku' },
          { provider: 'gemini', model: 'gemini-2.5-pro' },
          { provider: 'claude', model: 'sonnet' }
        ]
      }
    };
  }
  
  /**
   * Load task patterns for routing
   */
  loadTaskPatterns() {
    return {
      validation: {
        patterns: ['validate', 'review', 'check', 'audit', 'analyze.*code', 'assess', 'evaluate'],
        taskType: 'validation',
        preferredProvider: 'gemini',
        preferredModel: 'gemini-2.5-pro'
      },
      creation: {
        patterns: ['create', 'build', 'implement', 'write.*code', 'develop', 'generate', 'construct'],
        taskType: 'creation',
        preferredProvider: 'claude',
        preferredModel: 'sonnet'
      },
      architecture: {
        patterns: ['design', 'architect', 'plan', 'structure', 'blueprint', 'system.*design'],
        taskType: 'creation',
        preferredProvider: 'claude',
        preferredModel: 'sonnet'
      },
      synthesis: {
        patterns: ['summarize', 'synthesize', 'research', 'compile', 'gather', 'aggregate'],
        taskType: 'research',
        preferredProvider: 'gemini',
        preferredModel: 'gemini-2.5-pro'
      },
      ui_design: {
        patterns: ['ui', 'ux', 'interface', 'design.*user', 'wireframe', 'mockup'],
        taskType: 'ui_design',
        preferredProvider: 'gemini',
        preferredModel: 'gemini-2.5-flash'
      },
      documentation: {
        patterns: ['document', 'readme', 'comment', 'explain', 'describe', 'annotate'],
        taskType: 'documentation',
        preferredProvider: 'claude',
        preferredModel: 'haiku'
      }
    };
  }
  
  /**
   * Load cost profiles for models
   */
  loadCostProfiles() {
    return {
      'claude-sonnet': {
        costPer1kInput: 0.003,
        costPer1kOutput: 0.015,
        qualityScore: 10,
        speedScore: 7,
        dailyLimit: 1000
      },
      'claude-haiku': {
        costPer1kInput: 0.00025,
        costPer1kOutput: 0.00125,
        qualityScore: 7,
        speedScore: 9,
        dailyLimit: 5000
      },
      'gemini-2.5-pro': {
        costPer1kInput: 0,
        costPer1kOutput: 0,
        qualityScore: 9,
        speedScore: 8,
        dailyLimit: 1000,
        freeТier: true
      },
      'gemini-2.5-flash': {
        costPer1kInput: 0,
        costPer1kOutput: 0,
        qualityScore: 7,
        speedScore: 10,
        dailyLimit: 1500,
        freeTier: true
      }
    };
  }
  
  /**
   * Load agent-specific routing
   */
  loadAgentRouting() {
    return {
      'claude-architect': { provider: 'claude', model: 'sonnet', override: false },
      'claude-builder': { provider: 'claude', model: 'sonnet', override: true },
      'claude-documenter': { provider: 'claude', model: 'haiku', override: true },
      'gemini-advisor': { provider: 'gemini', model: 'gemini-2.5-pro', override: false },
      'gemini-synthesizer': { provider: 'gemini', model: 'gemini-2.5-pro', override: true },
      'gemini-ui-designer': { provider: 'gemini', model: 'gemini-2.5-flash', override: true }
    };
  }
  
  /**
   * Main routing method
   */
  async route(request) {
    const startTime = Date.now();
    
    try {
      this.logger.info('Routing request', {
        agent: request.agent,
        taskType: request.taskType,
        messageLength: request.messageLength
      });
      
      // Check for emergency mode
      if (this.emergencyMode) {
        return this.getEmergencyRoute(request);
      }
      
      // Check for global override
      const globalOverride = this.getGlobalOverride();
      if (globalOverride) {
        return this.applyRoute(globalOverride, request);
      }
      
      // Check for agent-specific override
      const agentOverride = this.getAgentOverride(request.agent);
      if (agentOverride) {
        return this.applyRoute(agentOverride, request);
      }
      
      // Check for agent-specific routing
      if (request.agent && this.agentRouting[request.agent]) {
        const agentRoute = this.agentRouting[request.agent];
        return this.applyRoute(agentRoute, request);
      }
      
      // Detect task type from patterns
      const detectedTaskType = this.detectTaskType(request);
      
      // Get route based on strategy and task type
      const route = this.getStrategyRoute(detectedTaskType, request);
      
      // Apply cost optimization if enabled
      if (this.config.preferFreeTier) {
        const optimizedRoute = await this.optimizeForCost(route, request);
        if (optimizedRoute) {
          this.routingMetrics.costSaved += this.calculateCostSaved(route, optimizedRoute);
          return this.applyRoute(optimizedRoute, request);
        }
      }
      
      return this.applyRoute(route, request);
      
    } catch (error) {
      this.logger.error('Routing failed', { error: error.message });
      
      // Use fallback chain
      return this.getFallbackRoute(request);
      
    } finally {
      // Record metrics
      this.recordRoutingMetrics(request, Date.now() - startTime);
    }
  }
  
  /**
   * Detect task type from request
   */
  detectTaskType(request) {
    const message = request.message || '';
    const lowerMessage = message.toLowerCase();
    
    for (const [key, pattern] of Object.entries(this.taskPatterns)) {
      for (const patternStr of pattern.patterns) {
        const regex = new RegExp(patternStr, 'i');
        if (regex.test(lowerMessage)) {
          this.logger.debug('Task type detected', { 
            type: pattern.taskType,
            pattern: patternStr 
          });
          return pattern.taskType;
        }
      }
    }
    
    // Default to creation for unknown tasks
    return 'creation';
  }
  
  /**
   * Get route based on strategy and task type
   */
  getStrategyRoute(taskType, request) {
    const strategyRules = this.currentStrategy.rules;
    
    // Check if task type has specific routing
    if (strategyRules[taskType]) {
      return strategyRules[taskType];
    }
    
    // Check context-based routing
    if (request.contextSize > 10000) {
      // Large context - use Gemini Pro
      return { provider: 'gemini', model: 'gemini-2.5-pro' };
    }
    
    if (request.complexity === 'simple' || request.urgent) {
      // Simple or urgent - use fast model
      return { provider: 'gemini', model: 'gemini-2.5-flash' };
    }
    
    // Default to creation route
    return strategyRules.creation || { provider: 'claude', model: 'sonnet' };
  }
  
  /**
   * Optimize route for cost
   */
  async optimizeForCost(route, request) {
    // If already using free tier, keep it
    const routeModel = `${route.provider}-${route.model}`;
    if (this.costProfiles[routeModel]?.freeTier) {
      return null; // Already optimized
    }
    
    // Find free tier alternative
    for (const [modelKey, profile] of Object.entries(this.costProfiles)) {
      if (profile.freeTier && profile.qualityScore >= 7) {
        const [provider, ...modelParts] = modelKey.split('-');
        return {
          provider: provider,
          model: modelParts.join('-'),
          optimized: true
        };
      }
    }
    
    return null;
  }
  
  /**
   * Apply route and record metrics
   */
  applyRoute(route, request) {
    const result = {
      provider: route.provider,
      model: route.model,
      routingStrategy: this.config.strategy,
      taskType: request.taskType,
      optimized: route.optimized || false,
      timestamp: new Date()
    };
    
    // Update metrics
    this.routingMetrics.totalRouted++;
    
    const modelKey = `${route.provider}-${route.model}`;
    this.routingMetrics.byModel[modelKey] = (this.routingMetrics.byModel[modelKey] || 0) + 1;
    
    if (request.taskType) {
      this.routingMetrics.byTaskType[request.taskType] = 
        (this.routingMetrics.byTaskType[request.taskType] || 0) + 1;
    }
    
    this.logger.info('Route applied', result);
    
    return result;
  }
  
  /**
   * Get emergency route (free tier only)
   */
  getEmergencyRoute(request) {
    this.logger.warn('Emergency routing activated');
    
    // Use only free tier models
    return {
      provider: 'gemini',
      model: 'gemini-2.5-flash',
      emergency: true
    };
  }
  
  /**
   * Get fallback route
   */
  getFallbackRoute(request) {
    const fallbackChain = this.currentStrategy.fallbackChain;
    
    // Try each fallback in order
    for (const fallback of fallbackChain) {
      // Check if model is available (would check actual availability in production)
      if (this.isModelAvailable(fallback)) {
        this.routingMetrics.fallbacksUsed++;
        
        this.logger.info('Using fallback route', fallback);
        
        return {
          ...fallback,
          fallback: true
        };
      }
    }
    
    // Last resort - Gemini Flash (free tier)
    return {
      provider: 'gemini',
      model: 'gemini-2.5-flash',
      lastResort: true
    };
  }
  
  /**
   * Check if model is available
   */
  isModelAvailable(route) {
    // In production, would check actual API availability
    // For now, always return true
    return true;
  }
  
  /**
   * Set global override
   */
  setGlobalOverride(provider, model) {
    this.overrides.set('global', { provider, model });
    this.logger.info('Global override set', { provider, model });
  }
  
  /**
   * Clear global override
   */
  clearGlobalOverride() {
    this.overrides.delete('global');
    this.logger.info('Global override cleared');
  }
  
  /**
   * Get global override
   */
  getGlobalOverride() {
    return this.overrides.get('global');
  }
  
  /**
   * Set agent-specific override
   */
  setAgentOverride(agent, provider, model) {
    this.overrides.set(`agent:${agent}`, { provider, model });
    this.logger.info('Agent override set', { agent, provider, model });
  }
  
  /**
   * Get agent-specific override
   */
  getAgentOverride(agent) {
    return this.overrides.get(`agent:${agent}`);
  }
  
  /**
   * Set routing strategy
   */
  setStrategy(strategyName) {
    if (!this.routingStrategies[strategyName]) {
      throw new Error(`Unknown strategy: ${strategyName}`);
    }
    
    this.config.strategy = strategyName;
    this.currentStrategy = this.routingStrategies[strategyName];
    
    this.logger.info('Routing strategy changed', { strategy: strategyName });
  }
  
  /**
   * Enable emergency mode
   */
  enableEmergencyMode() {
    this.emergencyMode = true;
    this.logger.warn('Emergency mode enabled - using free tier only');
  }
  
  /**
   * Disable emergency mode
   */
  disableEmergencyMode() {
    this.emergencyMode = false;
    this.logger.info('Emergency mode disabled');
  }
  
  /**
   * Calculate cost saved
   */
  calculateCostSaved(originalRoute, optimizedRoute) {
    const originalModel = `${originalRoute.provider}-${originalRoute.model}`;
    const optimizedModel = `${optimizedRoute.provider}-${optimizedRoute.model}`;
    
    const originalCost = this.costProfiles[originalModel]?.costPer1kInput || 0;
    const optimizedCost = this.costProfiles[optimizedModel]?.costPer1kInput || 0;
    
    return originalCost - optimizedCost;
  }
  
  /**
   * Record routing metrics
   */
  recordRoutingMetrics(request, duration) {
    // Would send to monitoring service in production
    this.emit('metricsRecorded', {
      request,
      duration,
      metrics: this.routingMetrics
    });
  }
  
  /**
   * Get routing statistics
   */
  getStatistics() {
    return {
      ...this.routingMetrics,
      currentStrategy: this.config.strategy,
      emergencyMode: this.emergencyMode,
      activeOverrides: this.overrides.size
    };
  }
  
  /**
   * Load custom configurations
   */
  async loadCustomConfigurations() {
    try {
      const configPath = '.claude/configs/model-routing.json';
      const configData = await fs.readFile(configPath, 'utf8');
      const config = JSON.parse(configData);
      
      // Merge custom strategies
      if (config.routing_strategies) {
        Object.assign(this.routingStrategies, config.routing_strategies);
      }
      
      // Apply active strategy
      if (config.active_strategy) {
        this.setStrategy(config.active_strategy);
      }
      
      this.logger.info('Custom configurations loaded');
      
    } catch (error) {
      // Config file might not exist yet
      this.logger.debug('No custom configuration found, using defaults');
    }
  }
}

// Singleton instance
let routerInstance = null;

/**
 * Get or create singleton router instance
 */
export function getRouter() {
  if (!routerInstance) {
    routerInstance = new SmartRouter();
  }
  return routerInstance;
}

export default SmartRouter;