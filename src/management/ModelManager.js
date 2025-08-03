import { EventEmitter } from 'eventemitter3';
import { v4 as uuidv4 } from 'uuid';
import winston from 'winston';

/**
 * Model Manager - Manages model attribution and access control
 */
export class ModelManager extends EventEmitter {
  constructor(config = {}) {
    super();
    
    // Configuration
    this.config = {
      strictAttribution: config.strictAttribution !== false,
      auditEnabled: config.auditEnabled !== false,
      modelQuotas: {
        'claude-sonnet': { daily: 1000, hourly: 100, concurrent: 5 },
        'claude-haiku': { daily: 2000, hourly: 200, concurrent: 10 },
        'claude-opus': { daily: 500, hourly: 50, concurrent: 3 },
        'gemini-2.5-pro': { daily: 1500, hourly: 150, concurrent: 8 },
        'gemini-2.5-flash': { daily: 3000, hourly: 300, concurrent: 15 }
      },
      accessPolicies: {
        creation: ['claude-sonnet', 'claude-haiku', 'claude-opus'],
        validation: ['gemini-2.5-pro', 'gemini-2.5-flash'],
        documentation: ['claude-haiku', 'gemini-2.5-flash']
      },
      ...config
    };
    
    // Model registry
    this.models = new Map();
    this.modelUsage = new Map();
    this.activeConnections = new Map();
    
    // Attribution tracking
    this.attributions = new Map();
    this.auditLog = [];
    
    // Access control
    this.accessControl = {
      policies: new Map(),
      restrictions: new Map(),
      overrides: new Map()
    };
    
    // Statistics
    this.statistics = {
      totalRequests: 0,
      successfulRequests: 0,
      deniedRequests: 0,
      attributionConflicts: 0,
      quotaExceeded: 0
    };
    
    // Logger
    this.logger = this.setupLogger();
    
    // Initialize models
    this.initializeModels();
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
      defaultMeta: { service: 'model-manager' },
      transports: [
        new winston.transports.File({ 
          filename: '.claude/logs/model-manager.log',
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
   * Initialize models
   */
  initializeModels() {
    // Claude models
    this.registerModel({
      id: 'claude-sonnet',
      provider: 'anthropic',
      category: 'creator',
      capabilities: ['code_generation', 'architecture', 'problem_solving'],
      restrictions: [],
      costTier: 'standard'
    });
    
    this.registerModel({
      id: 'claude-haiku',
      provider: 'anthropic',
      category: 'creator',
      capabilities: ['code_generation', 'documentation', 'quick_tasks'],
      restrictions: [],
      costTier: 'economy'
    });
    
    this.registerModel({
      id: 'claude-opus',
      provider: 'anthropic',
      category: 'creator',
      capabilities: ['complex_reasoning', 'architecture', 'deep_analysis'],
      restrictions: [],
      costTier: 'premium'
    });
    
    // Gemini models
    this.registerModel({
      id: 'gemini-2.5-pro',
      provider: 'google',
      category: 'validator',
      capabilities: ['validation', 'analysis', 'review'],
      restrictions: ['no_code_generation', 'read_only'],
      costTier: 'free'
    });
    
    this.registerModel({
      id: 'gemini-2.5-flash',
      provider: 'google',
      category: 'validator',
      capabilities: ['quick_validation', 'analysis'],
      restrictions: ['no_code_generation', 'read_only'],
      costTier: 'free'
    });
  }
  
  /**
   * Register a model
   */
  registerModel(modelConfig) {
    const model = {
      id: modelConfig.id,
      provider: modelConfig.provider,
      category: modelConfig.category,
      capabilities: modelConfig.capabilities || [],
      restrictions: modelConfig.restrictions || [],
      costTier: modelConfig.costTier || 'standard',
      status: 'available',
      registeredAt: new Date()
    };
    
    this.models.set(model.id, model);
    
    // Initialize usage tracking
    this.modelUsage.set(model.id, {
      daily: 0,
      hourly: 0,
      total: 0,
      lastReset: {
        daily: new Date(),
        hourly: new Date()
      }
    });
    
    // Initialize active connections
    this.activeConnections.set(model.id, new Set());
    
    this.logger.info(`Model registered: ${model.id}`, { model });
    
    this.emit('modelRegistered', { model });
  }
  
  /**
   * Request model access
   */
  async requestAccess(request) {
    const requestId = uuidv4();
    const timestamp = new Date();
    
    this.statistics.totalRequests++;
    
    this.logger.info(`Access request: ${requestId}`, { request });
    
    // Validate request
    const validation = this.validateRequest(request);
    if (!validation.valid) {
      this.statistics.deniedRequests++;
      
      this.auditAccess({
        requestId,
        ...request,
        timestamp,
        granted: false,
        reason: validation.reason
      });
      
      throw new Error(`Access denied: ${validation.reason}`);
    }
    
    // Check model availability
    const model = this.models.get(request.modelId);
    if (!model) {
      throw new Error(`Model not found: ${request.modelId}`);
    }
    
    if (model.status !== 'available') {
      throw new Error(`Model unavailable: ${request.modelId} (${model.status})`);
    }
    
    // Check access policy
    if (!this.checkAccessPolicy(request)) {
      this.statistics.deniedRequests++;
      
      this.auditAccess({
        requestId,
        ...request,
        timestamp,
        granted: false,
        reason: 'Policy violation'
      });
      
      throw new Error('Access policy violation');
    }
    
    // Check quotas
    if (!this.checkQuota(request.modelId)) {
      this.statistics.quotaExceeded++;
      
      this.auditAccess({
        requestId,
        ...request,
        timestamp,
        granted: false,
        reason: 'Quota exceeded'
      });
      
      throw new Error('Model quota exceeded');
    }
    
    // Check attribution
    if (this.config.strictAttribution) {
      const attributionCheck = await this.checkAttribution(request);
      if (!attributionCheck.valid) {
        this.statistics.attributionConflicts++;
        
        this.auditAccess({
          requestId,
          ...request,
          timestamp,
          granted: false,
          reason: attributionCheck.reason
        });
        
        throw new Error(`Attribution conflict: ${attributionCheck.reason}`);
      }
    }
    
    // Grant access
    const accessToken = this.grantAccess({
      requestId,
      modelId: request.modelId,
      agentId: request.agentId,
      taskType: request.taskType,
      timestamp
    });
    
    this.statistics.successfulRequests++;
    
    this.auditAccess({
      requestId,
      ...request,
      timestamp,
      granted: true,
      accessToken
    });
    
    return {
      requestId,
      accessToken,
      model: model,
      expiresAt: new Date(Date.now() + 3600000), // 1 hour
      restrictions: model.restrictions,
      quotaRemaining: this.getQuotaRemaining(request.modelId)
    };
  }
  
  /**
   * Validate request
   */
  validateRequest(request) {
    if (!request.modelId) {
      return { valid: false, reason: 'Missing modelId' };
    }
    
    if (!request.agentId) {
      return { valid: false, reason: 'Missing agentId' };
    }
    
    if (!request.taskType) {
      return { valid: false, reason: 'Missing taskType' };
    }
    
    // Check if model exists
    if (!this.models.has(request.modelId)) {
      return { valid: false, reason: 'Invalid modelId' };
    }
    
    // Check for restrictions
    const restrictions = this.accessControl.restrictions.get(request.agentId);
    if (restrictions && restrictions.includes(request.modelId)) {
      return { valid: false, reason: 'Model restricted for this agent' };
    }
    
    return { valid: true };
  }
  
  /**
   * Check access policy
   */
  checkAccessPolicy(request) {
    const model = this.models.get(request.modelId);
    const taskPolicies = this.config.accessPolicies[request.taskType];
    
    // Check override
    const override = this.accessControl.overrides.get(`${request.agentId}_${request.modelId}`);
    if (override) {
      return override.allowed;
    }
    
    // Check task-based policy
    if (taskPolicies && !taskPolicies.includes(request.modelId)) {
      return false;
    }
    
    // Check model category vs task type
    if (request.taskType === 'creation' && model.category !== 'creator') {
      return false;
    }
    
    if (request.taskType === 'validation' && model.category !== 'validator') {
      return false;
    }
    
    // Check model restrictions
    if (request.taskType === 'creation' && model.restrictions.includes('no_code_generation')) {
      return false;
    }
    
    return true;
  }
  
  /**
   * Check quota
   */
  checkQuota(modelId) {
    const quota = this.config.modelQuotas[modelId];
    if (!quota) return true; // No quota defined
    
    const usage = this.modelUsage.get(modelId);
    if (!usage) return true;
    
    // Reset counters if needed
    this.resetUsageIfNeeded(modelId);
    
    // Check daily quota
    if (usage.daily >= quota.daily) {
      return false;
    }
    
    // Check hourly quota
    if (usage.hourly >= quota.hourly) {
      return false;
    }
    
    // Check concurrent connections
    const connections = this.activeConnections.get(modelId);
    if (connections && connections.size >= quota.concurrent) {
      return false;
    }
    
    return true;
  }
  
  /**
   * Reset usage counters if needed
   */
  resetUsageIfNeeded(modelId) {
    const usage = this.modelUsage.get(modelId);
    if (!usage) return;
    
    const now = new Date();
    
    // Reset hourly
    if (now - usage.lastReset.hourly > 3600000) {
      usage.hourly = 0;
      usage.lastReset.hourly = now;
    }
    
    // Reset daily
    if (now.getDate() !== usage.lastReset.daily.getDate()) {
      usage.daily = 0;
      usage.lastReset.daily = now;
    }
  }
  
  /**
   * Check attribution
   */
  async checkAttribution(request) {
    // Check for conflicting attributions
    const existingAttribution = this.attributions.get(request.contextId);
    
    if (existingAttribution) {
      // Check if same model is already attributed
      if (existingAttribution.modelId !== request.modelId) {
        // Different model trying to claim attribution
        const existingModel = this.models.get(existingAttribution.modelId);
        const requestModel = this.models.get(request.modelId);
        
        // Allow if categories are different (creator vs validator)
        if (existingModel.category !== requestModel.category) {
          return { valid: true };
        }
        
        // Deny if same category
        return {
          valid: false,
          reason: `Context already attributed to ${existingAttribution.modelId}`
        };
      }
    }
    
    return { valid: true };
  }
  
  /**
   * Grant access
   */
  grantAccess(accessInfo) {
    const accessToken = uuidv4();
    
    // Update usage
    const usage = this.modelUsage.get(accessInfo.modelId);
    if (usage) {
      usage.daily++;
      usage.hourly++;
      usage.total++;
    }
    
    // Add to active connections
    const connections = this.activeConnections.get(accessInfo.modelId);
    if (connections) {
      connections.add(accessToken);
    }
    
    // Store attribution if context provided
    if (accessInfo.contextId) {
      this.attributions.set(accessInfo.contextId, {
        modelId: accessInfo.modelId,
        agentId: accessInfo.agentId,
        timestamp: accessInfo.timestamp,
        accessToken
      });
    }
    
    this.emit('accessGranted', {
      accessToken,
      ...accessInfo
    });
    
    return accessToken;
  }
  
  /**
   * Release access
   */
  releaseAccess(accessToken, modelId) {
    // Remove from active connections
    const connections = this.activeConnections.get(modelId);
    if (connections) {
      connections.delete(accessToken);
    }
    
    this.emit('accessReleased', {
      accessToken,
      modelId
    });
  }
  
  /**
   * Audit access
   */
  auditAccess(accessInfo) {
    if (!this.config.auditEnabled) return;
    
    const auditEntry = {
      id: uuidv4(),
      timestamp: accessInfo.timestamp || new Date(),
      requestId: accessInfo.requestId,
      modelId: accessInfo.modelId,
      agentId: accessInfo.agentId,
      taskType: accessInfo.taskType,
      granted: accessInfo.granted,
      reason: accessInfo.reason,
      accessToken: accessInfo.accessToken
    };
    
    this.auditLog.push(auditEntry);
    
    // Keep only last 1000 entries
    if (this.auditLog.length > 1000) {
      this.auditLog.shift();
    }
    
    this.logger.info('Access audit', auditEntry);
  }
  
  /**
   * Get quota remaining
   */
  getQuotaRemaining(modelId) {
    const quota = this.config.modelQuotas[modelId];
    if (!quota) return null;
    
    const usage = this.modelUsage.get(modelId);
    if (!usage) return quota;
    
    this.resetUsageIfNeeded(modelId);
    
    return {
      daily: quota.daily - usage.daily,
      hourly: quota.hourly - usage.hourly,
      concurrent: quota.concurrent - (this.activeConnections.get(modelId)?.size || 0)
    };
  }
  
  /**
   * Set access policy
   */
  setAccessPolicy(agentId, policy) {
    this.accessControl.policies.set(agentId, policy);
    
    this.emit('policyUpdated', {
      agentId,
      policy
    });
  }
  
  /**
   * Add restriction
   */
  addRestriction(agentId, modelId) {
    let restrictions = this.accessControl.restrictions.get(agentId);
    if (!restrictions) {
      restrictions = [];
      this.accessControl.restrictions.set(agentId, restrictions);
    }
    
    if (!restrictions.includes(modelId)) {
      restrictions.push(modelId);
    }
    
    this.emit('restrictionAdded', {
      agentId,
      modelId
    });
  }
  
  /**
   * Remove restriction
   */
  removeRestriction(agentId, modelId) {
    const restrictions = this.accessControl.restrictions.get(agentId);
    if (!restrictions) return;
    
    const index = restrictions.indexOf(modelId);
    if (index !== -1) {
      restrictions.splice(index, 1);
    }
    
    this.emit('restrictionRemoved', {
      agentId,
      modelId
    });
  }
  
  /**
   * Set override
   */
  setOverride(agentId, modelId, allowed) {
    const key = `${agentId}_${modelId}`;
    this.accessControl.overrides.set(key, {
      allowed,
      timestamp: new Date()
    });
    
    this.emit('overrideSet', {
      agentId,
      modelId,
      allowed
    });
  }
  
  /**
   * Update model status
   */
  updateModelStatus(modelId, status) {
    const model = this.models.get(modelId);
    if (!model) return;
    
    model.status = status;
    
    this.emit('modelStatusUpdated', {
      modelId,
      status
    });
    
    this.logger.info(`Model status updated: ${modelId}`, { status });
  }
  
  /**
   * Get model statistics
   */
  getModelStatistics(modelId) {
    const model = this.models.get(modelId);
    if (!model) return null;
    
    const usage = this.modelUsage.get(modelId);
    const connections = this.activeConnections.get(modelId);
    const quota = this.config.modelQuotas[modelId];
    
    return {
      model: model,
      usage: usage,
      activeConnections: connections?.size || 0,
      quota: quota,
      quotaRemaining: this.getQuotaRemaining(modelId),
      attributions: Array.from(this.attributions.values())
        .filter(a => a.modelId === modelId).length
    };
  }
  
  /**
   * Get all statistics
   */
  getStatistics() {
    const modelStats = {};
    
    for (const modelId of this.models.keys()) {
      modelStats[modelId] = this.getModelStatistics(modelId);
    }
    
    return {
      global: this.statistics,
      models: modelStats,
      auditLogSize: this.auditLog.length,
      activeAttributions: this.attributions.size,
      policies: this.accessControl.policies.size,
      restrictions: this.accessControl.restrictions.size,
      overrides: this.accessControl.overrides.size
    };
  }
  
  /**
   * Get audit log
   */
  getAuditLog(filters = {}) {
    let log = [...this.auditLog];
    
    // Apply filters
    if (filters.modelId) {
      log = log.filter(entry => entry.modelId === filters.modelId);
    }
    
    if (filters.agentId) {
      log = log.filter(entry => entry.agentId === filters.agentId);
    }
    
    if (filters.granted !== undefined) {
      log = log.filter(entry => entry.granted === filters.granted);
    }
    
    if (filters.since) {
      const sinceDate = new Date(filters.since);
      log = log.filter(entry => new Date(entry.timestamp) > sinceDate);
    }
    
    // Sort by timestamp (newest first)
    log.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    return log;
  }
  
  /**
   * Clear attributions
   */
  clearAttributions(contextId) {
    if (contextId) {
      this.attributions.delete(contextId);
    } else {
      this.attributions.clear();
    }
    
    this.emit('attributionsCleared', { contextId });
  }
  
  /**
   * Reset usage counters
   */
  resetUsage(modelId) {
    if (modelId) {
      const usage = this.modelUsage.get(modelId);
      if (usage) {
        usage.daily = 0;
        usage.hourly = 0;
        usage.lastReset.daily = new Date();
        usage.lastReset.hourly = new Date();
      }
    } else {
      // Reset all
      for (const usage of this.modelUsage.values()) {
        usage.daily = 0;
        usage.hourly = 0;
        usage.lastReset.daily = new Date();
        usage.lastReset.hourly = new Date();
      }
    }
    
    this.emit('usageReset', { modelId });
  }
}

export default ModelManager;