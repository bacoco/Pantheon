import { EventEmitter } from 'eventemitter3';

/**
 * Fallback Handler - Manages fallback chains and emergency overrides
 */
export class FallbackHandler extends EventEmitter {
  constructor(config = {}) {
    super();
    
    // Configuration
    this.config = {
      maxRetries: config.maxRetries || 3,
      retryDelay: config.retryDelay || 1000,
      emergencyEnabled: config.emergencyEnabled !== false,
      ...config
    };
    
    // Fallback chains by priority
    this.fallbackChains = {
      creation: [
        { provider: 'claude', model: 'sonnet', priority: 1 },
        { provider: 'claude', model: 'haiku', priority: 2 },
        { provider: 'gemini', model: 'gemini-2.5-pro', priority: 3 },
        { provider: 'gemini', model: 'gemini-2.5-flash', priority: 4 }
      ],
      validation: [
        { provider: 'gemini', model: 'gemini-2.5-pro', priority: 1 },
        { provider: 'gemini', model: 'gemini-2.5-flash', priority: 2 },
        { provider: 'claude', model: 'haiku', priority: 3 }
      ],
      quick_task: [
        { provider: 'gemini', model: 'gemini-2.5-flash', priority: 1 },
        { provider: 'claude', model: 'haiku', priority: 2 },
        { provider: 'gemini', model: 'gemini-2.5-pro', priority: 3 }
      ],
      emergency: [
        { provider: 'gemini', model: 'gemini-2.5-flash', priority: 1 },
        { provider: 'gemini', model: 'gemini-2.5-pro', priority: 2 }
      ]
    };
    
    // Model availability tracking
    this.modelAvailability = new Map();
    this.failureHistory = new Map();
    this.circuitBreakers = new Map();
    
    // Emergency mode state
    this.emergencyMode = false;
    this.emergencyOverrides = new Map();
    
    // Statistics
    this.statistics = {
      totalFallbacks: 0,
      successfulFallbacks: 0,
      failedFallbacks: 0,
      emergencyActivations: 0,
      circuitBreakerTrips: 0
    };
    
    // Initialize
    this.initialize();
  }
  
  /**
   * Initialize fallback handler
   */
  initialize() {
    // Initialize all models as available
    for (const chain of Object.values(this.fallbackChains)) {
      for (const model of chain) {
        const key = `${model.provider}-${model.model}`;
        this.modelAvailability.set(key, {
          available: true,
          lastCheck: new Date(),
          consecutiveFailures: 0,
          totalFailures: 0,
          successRate: 100
        });
        
        // Initialize circuit breaker
        this.circuitBreakers.set(key, {
          state: 'closed', // closed (normal), open (blocked), half-open (testing)
          failures: 0,
          lastFailure: null,
          nextRetry: null
        });
      }
    }
  }
  
  /**
   * Get fallback route for a failed request
   */
  async getFallback(originalRoute, error, taskType = 'creation') {
    this.statistics.totalFallbacks++;
    
    // Record failure
    this.recordFailure(originalRoute, error);
    
    // Check if emergency mode should be activated
    if (this.shouldActivateEmergency(originalRoute, error)) {
      this.activateEmergencyMode();
    }
    
    // Get appropriate fallback chain
    const chain = this.emergencyMode 
      ? this.fallbackChains.emergency 
      : this.fallbackChains[taskType] || this.fallbackChains.creation;
    
    // Find next available model
    const fallback = await this.findAvailableModel(chain, originalRoute);
    
    if (fallback) {
      this.statistics.successfulFallbacks++;
      
      this.emit('fallbackUsed', {
        original: originalRoute,
        fallback: fallback,
        reason: error.message,
        emergency: this.emergencyMode
      });
      
      return fallback;
    }
    
    // No fallback available
    this.statistics.failedFallbacks++;
    
    this.emit('fallbackFailed', {
      original: originalRoute,
      error: error,
      emergency: this.emergencyMode
    });
    
    // Last resort - always available free tier
    return this.getLastResort();
  }
  
  /**
   * Record model failure
   */
  recordFailure(route, error) {
    const key = `${route.provider}-${route.model}`;
    
    // Update availability tracking
    const availability = this.modelAvailability.get(key);
    if (availability) {
      availability.consecutiveFailures++;
      availability.totalFailures++;
      availability.lastFailure = new Date();
      
      // Calculate success rate
      const totalAttempts = availability.totalFailures + (availability.successCount || 0);
      availability.successRate = ((availability.successCount || 0) / totalAttempts) * 100;
      
      // Check if model should be marked unavailable
      if (availability.consecutiveFailures >= 3) {
        availability.available = false;
        availability.availableAfter = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
        
        this.emit('modelMarkedUnavailable', {
          model: key,
          reason: 'Consecutive failures',
          availableAfter: availability.availableAfter
        });
      }
    }
    
    // Update circuit breaker
    this.updateCircuitBreaker(key, false);
    
    // Record in failure history
    if (!this.failureHistory.has(key)) {
      this.failureHistory.set(key, []);
    }
    
    this.failureHistory.get(key).push({
      timestamp: new Date(),
      error: error.message,
      type: error.type || 'unknown'
    });
    
    // Keep only last 100 failures
    const history = this.failureHistory.get(key);
    if (history.length > 100) {
      history.shift();
    }
  }
  
  /**
   * Record model success
   */
  recordSuccess(route) {
    const key = `${route.provider}-${route.model}`;
    
    // Update availability tracking
    const availability = this.modelAvailability.get(key);
    if (availability) {
      availability.consecutiveFailures = 0;
      availability.available = true;
      availability.successCount = (availability.successCount || 0) + 1;
      
      // Calculate success rate
      const totalAttempts = availability.totalFailures + availability.successCount;
      availability.successRate = (availability.successCount / totalAttempts) * 100;
    }
    
    // Update circuit breaker
    this.updateCircuitBreaker(key, true);
  }
  
  /**
   * Update circuit breaker state
   */
  updateCircuitBreaker(modelKey, success) {
    const breaker = this.circuitBreakers.get(modelKey);
    if (!breaker) return;
    
    if (success) {
      // Success - reset failures if in half-open, close if open
      if (breaker.state === 'half-open') {
        breaker.state = 'closed';
        breaker.failures = 0;
        
        this.emit('circuitBreakerClosed', {
          model: modelKey,
          previousState: 'half-open'
        });
      }
      
      if (breaker.state === 'closed') {
        breaker.failures = Math.max(0, breaker.failures - 1);
      }
      
    } else {
      // Failure
      breaker.failures++;
      breaker.lastFailure = new Date();
      
      // Check if should trip
      if (breaker.failures >= 5 && breaker.state === 'closed') {
        breaker.state = 'open';
        breaker.nextRetry = new Date(Date.now() + 60 * 1000); // 1 minute
        
        this.statistics.circuitBreakerTrips++;
        
        this.emit('circuitBreakerTripped', {
          model: modelKey,
          failures: breaker.failures,
          nextRetry: breaker.nextRetry
        });
      }
      
      // If in half-open and failed, go back to open
      if (breaker.state === 'half-open') {
        breaker.state = 'open';
        breaker.nextRetry = new Date(Date.now() + 2 * 60 * 1000); // 2 minutes
      }
    }
  }
  
  /**
   * Find available model from chain
   */
  async findAvailableModel(chain, excludeRoute) {
    const excludeKey = excludeRoute ? `${excludeRoute.provider}-${excludeRoute.model}` : null;
    
    for (const model of chain) {
      const key = `${model.provider}-${model.model}`;
      
      // Skip if same as failed model
      if (key === excludeKey) continue;
      
      // Check circuit breaker
      const breaker = this.circuitBreakers.get(key);
      if (breaker) {
        if (breaker.state === 'open') {
          // Check if ready for half-open
          if (breaker.nextRetry && new Date() > breaker.nextRetry) {
            breaker.state = 'half-open';
          } else {
            continue; // Skip this model
          }
        }
      }
      
      // Check availability
      const availability = this.modelAvailability.get(key);
      if (availability) {
        if (!availability.available) {
          // Check if cooldown period has passed
          if (availability.availableAfter && new Date() > availability.availableAfter) {
            availability.available = true;
            availability.consecutiveFailures = 0;
          } else {
            continue; // Skip this model
          }
        }
        
        // Check success rate threshold
        if (availability.successRate < 50 && availability.totalFailures > 5) {
          continue; // Skip models with poor success rate
        }
      }
      
      // Model is available
      return model;
    }
    
    return null;
  }
  
  /**
   * Check if emergency mode should be activated
   */
  shouldActivateEmergency(route, error) {
    // Activate on critical errors
    const criticalErrors = ['rate_limit', 'quota_exceeded', 'api_error', 'service_unavailable'];
    if (criticalErrors.some(e => error.message?.toLowerCase().includes(e))) {
      return true;
    }
    
    // Activate if too many models are unavailable
    let unavailableCount = 0;
    for (const [key, availability] of this.modelAvailability) {
      if (!availability.available) {
        unavailableCount++;
      }
    }
    
    if (unavailableCount >= 3) {
      return true;
    }
    
    // Activate if too many circuit breakers are open
    let openBreakers = 0;
    for (const [key, breaker] of this.circuitBreakers) {
      if (breaker.state === 'open') {
        openBreakers++;
      }
    }
    
    if (openBreakers >= 2) {
      return true;
    }
    
    return false;
  }
  
  /**
   * Activate emergency mode
   */
  activateEmergencyMode() {
    if (this.emergencyMode) return;
    
    this.emergencyMode = true;
    this.statistics.emergencyActivations++;
    
    this.emit('emergencyModeActivated', {
      timestamp: new Date(),
      reason: 'Multiple failures detected',
      fallbackChain: this.fallbackChains.emergency
    });
    
    // Auto-deactivate after 5 minutes
    setTimeout(() => {
      this.deactivateEmergencyMode();
    }, 5 * 60 * 1000);
  }
  
  /**
   * Deactivate emergency mode
   */
  deactivateEmergencyMode() {
    if (!this.emergencyMode) return;
    
    this.emergencyMode = false;
    
    this.emit('emergencyModeDeactivated', {
      timestamp: new Date()
    });
  }
  
  /**
   * Set emergency override
   */
  setEmergencyOverride(taskType, route) {
    this.emergencyOverrides.set(taskType, route);
    
    this.emit('emergencyOverrideSet', {
      taskType,
      route,
      timestamp: new Date()
    });
  }
  
  /**
   * Clear emergency override
   */
  clearEmergencyOverride(taskType) {
    this.emergencyOverrides.delete(taskType);
    
    this.emit('emergencyOverrideCleared', {
      taskType,
      timestamp: new Date()
    });
  }
  
  /**
   * Get last resort fallback
   */
  getLastResort() {
    // Always available free tier model
    return {
      provider: 'gemini',
      model: 'gemini-2.5-flash',
      lastResort: true,
      reason: 'All fallbacks exhausted'
    };
  }
  
  /**
   * Test model availability
   */
  async testAvailability(route) {
    const key = `${route.provider}-${route.model}`;
    
    // Simulate availability test (in production, would make actual API call)
    const testResult = await this.performAvailabilityTest(route);
    
    if (testResult.available) {
      this.recordSuccess(route);
      
      // Reset circuit breaker if needed
      const breaker = this.circuitBreakers.get(key);
      if (breaker && breaker.state === 'open') {
        breaker.state = 'half-open';
        breaker.nextRetry = null;
      }
      
      return true;
    } else {
      this.recordFailure(route, testResult.error);
      return false;
    }
  }
  
  /**
   * Perform availability test (simulated)
   */
  async performAvailabilityTest(route) {
    // In production, would make actual API health check
    // For now, simulate with random success
    const success = Math.random() > 0.1;
    
    return {
      available: success,
      error: success ? null : new Error('Model temporarily unavailable')
    };
  }
  
  /**
   * Get statistics
   */
  getStatistics() {
    const stats = {
      ...this.statistics,
      emergencyMode: this.emergencyMode,
      modelStatus: {},
      circuitBreakers: {}
    };
    
    // Add model availability status
    for (const [key, availability] of this.modelAvailability) {
      stats.modelStatus[key] = {
        available: availability.available,
        successRate: availability.successRate,
        consecutiveFailures: availability.consecutiveFailures
      };
    }
    
    // Add circuit breaker status
    for (const [key, breaker] of this.circuitBreakers) {
      stats.circuitBreakers[key] = {
        state: breaker.state,
        failures: breaker.failures
      };
    }
    
    return stats;
  }
  
  /**
   * Reset model availability
   */
  resetModelAvailability(modelKey) {
    const availability = this.modelAvailability.get(modelKey);
    if (availability) {
      availability.available = true;
      availability.consecutiveFailures = 0;
      availability.availableAfter = null;
    }
    
    const breaker = this.circuitBreakers.get(modelKey);
    if (breaker) {
      breaker.state = 'closed';
      breaker.failures = 0;
      breaker.nextRetry = null;
    }
    
    this.emit('modelReset', {
      model: modelKey,
      timestamp: new Date()
    });
  }
  
  /**
   * Reset all fallback chains
   */
  resetAll() {
    for (const key of this.modelAvailability.keys()) {
      this.resetModelAvailability(key);
    }
    
    this.emergencyMode = false;
    this.emergencyOverrides.clear();
    
    this.emit('fallbackSystemReset', {
      timestamp: new Date()
    });
  }
}

// Singleton instance
let handlerInstance = null;

/**
 * Get or create singleton handler instance
 */
export function getFallbackHandler() {
  if (!handlerInstance) {
    handlerInstance = new FallbackHandler();
  }
  return handlerInstance;
}

export default FallbackHandler;