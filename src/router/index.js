/**
 * Router Module - Smart routing system with cost optimization
 * Exports all routing components
 */

export { SmartRouter, getRouter } from './SmartRouter.js';
export { CostOptimizer, getOptimizer } from './CostOptimizer.js';
export { UsageTracker, getTracker } from './UsageTracker.js';
export { FallbackHandler, getFallbackHandler } from './FallbackHandler.js';

import { getRouter } from './SmartRouter.js';
import { getOptimizer } from './CostOptimizer.js';
import { getTracker } from './UsageTracker.js';
import { getFallbackHandler } from './FallbackHandler.js';

/**
 * Integrated Router System
 * Combines all routing components into a unified system
 */
export class IntegratedRouter {
  constructor() {
    this.smartRouter = getRouter();
    this.costOptimizer = getOptimizer();
    this.usageTracker = getTracker();
    this.fallbackHandler = getFallbackHandler();
    
    this.setupIntegration();
  }
  
  /**
   * Setup component integration
   */
  setupIntegration() {
    // Connect cost optimizer to router
    this.costOptimizer.on('costAlert', (data) => {
      console.warn('Cost alert:', data.message);
      if (data.level === 'warning') {
        this.smartRouter.setStrategy('cost_optimized');
      }
    });
    
    this.costOptimizer.on('costEmergency', (data) => {
      console.error('Cost emergency:', data.message);
      this.smartRouter.enableEmergencyMode();
    });
    
    // Connect usage tracker to optimizer
    this.usageTracker.on('quotaExceeded', (data) => {
      console.warn('Quota exceeded:', data);
      this.fallbackHandler.activateEmergencyMode();
    });
    
    // Connect fallback handler to router
    this.fallbackHandler.on('emergencyModeActivated', () => {
      this.smartRouter.enableEmergencyMode();
    });
    
    this.fallbackHandler.on('emergencyModeDeactivated', () => {
      this.smartRouter.disableEmergencyMode();
    });
  }
  
  /**
   * Route a request with full integration
   */
  async route(request) {
    try {
      // Check usage quotas
      const quotaCheck = await this.usageTracker.trackRequest(request);
      if (!quotaCheck.allowed) {
        // Use fallback if quota exceeded
        const fallback = await this.fallbackHandler.getFallback(
          { provider: request.provider, model: request.model },
          new Error(quotaCheck.reason),
          request.taskType
        );
        
        return {
          ...fallback,
          quotaFallback: true,
          reason: quotaCheck.reason
        };
      }
      
      // Get cost optimization recommendation
      const costRecommendation = this.costOptimizer.getOptimizationRecommendation(
        request.taskType,
        request.contextSize
      );
      
      // Apply cost recommendation if in cost-saving mode
      if (this.smartRouter.config.preferFreeTier && costRecommendation.provider) {
        request.provider = costRecommendation.provider;
        request.model = costRecommendation.model;
      }
      
      // Route through smart router
      const route = await this.smartRouter.route(request);
      
      // Track the routed request
      if (quotaCheck.trackingCallback) {
        // Will be called when request completes
        request.trackingCallback = quotaCheck.trackingCallback;
      }
      
      return {
        ...route,
        trackingId: quotaCheck.requestId,
        costOptimized: costRecommendation.provider === route.provider
      };
      
    } catch (error) {
      console.error('Routing failed:', error);
      
      // Get fallback route
      const fallback = await this.fallbackHandler.getFallback(
        { provider: request.provider, model: request.model },
        error,
        request.taskType
      );
      
      return {
        ...fallback,
        error: error.message
      };
    }
  }
  
  /**
   * Complete request tracking
   */
  async completeRequest(trackingId, response) {
    // Track usage
    if (response.trackingCallback) {
      await response.trackingCallback(response);
    }
    
    // Track cost
    this.costOptimizer.trackUsage(
      { provider: response.provider, model: response.model },
      response
    );
    
    // Record success/failure for fallback tracking
    if (response.success) {
      this.fallbackHandler.recordSuccess({
        provider: response.provider,
        model: response.model
      });
    } else {
      this.fallbackHandler.recordFailure(
        { provider: response.provider, model: response.model },
        response.error || new Error('Request failed')
      );
    }
  }
  
  /**
   * Get integrated statistics
   */
  getStatistics() {
    return {
      routing: this.smartRouter.getStatistics(),
      cost: this.costOptimizer.getStatistics(),
      usage: this.usageTracker.getStatistics(),
      fallback: this.fallbackHandler.getStatistics()
    };
  }
  
  /**
   * Set routing strategy
   */
  setStrategy(strategy) {
    this.smartRouter.setStrategy(strategy);
    
    // Update cost optimizer strategy
    if (strategy === 'cost_optimized') {
      this.costOptimizer.setStrategy('aggressive');
    } else if (strategy === 'quality_focused') {
      this.costOptimizer.setStrategy('quality');
    } else {
      this.costOptimizer.setStrategy('balanced');
    }
  }
  
  /**
   * Enable emergency mode across all components
   */
  enableEmergencyMode() {
    this.smartRouter.enableEmergencyMode();
    this.costOptimizer.enterEmergencyMode();
    this.fallbackHandler.activateEmergencyMode();
  }
  
  /**
   * Disable emergency mode
   */
  disableEmergencyMode() {
    this.smartRouter.disableEmergencyMode();
    this.costOptimizer.exitEmergencyMode();
    this.fallbackHandler.deactivateEmergencyMode();
  }
  
  /**
   * Export routing report
   */
  async exportReport(format = 'json') {
    const report = {
      timestamp: new Date(),
      statistics: this.getStatistics(),
      costReport: this.costOptimizer.exportReport(),
      usageData: await this.usageTracker.exportData(format)
    };
    
    if (format === 'json') {
      return JSON.stringify(report, null, 2);
    }
    
    return report;
  }
}

// Create singleton integrated router
let integratedInstance = null;

export function getIntegratedRouter() {
  if (!integratedInstance) {
    integratedInstance = new IntegratedRouter();
  }
  return integratedInstance;
}

export default IntegratedRouter;