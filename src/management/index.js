/**
 * Management Layer Index
 * Exports all management components for the Pantheon Multi-AI ecosystem
 */

// Core management components
export { ModelManager } from './ModelManager.js';
export { AgentOrchestrator } from './AgentOrchestrator.js';
export { CostController } from './CostController.js';
export { MetricsDashboard } from './MetricsDashboard.js';

// Re-export default exports for convenience
import ModelManager from './ModelManager.js';
import AgentOrchestrator from './AgentOrchestrator.js';
import CostController from './CostController.js';
import MetricsDashboard from './MetricsDashboard.js';

/**
 * Management System Factory
 * Creates and configures all management components with proper interconnections
 */
export class ManagementSystem {
  constructor(config = {}) {
    this.config = {
      orchestrator: config.orchestrator || {},
      costController: config.costController || {},
      dashboard: config.dashboard || {},
      modelManager: config.modelManager || {},
      ...config
    };
    
    this.components = {};
    this.initialized = false;
  }
  
  /**
   * Initialize the complete management system
   */
  async initialize() {
    try {
      // Initialize cost controller first (needed by orchestrator)
      this.components.costController = new CostController(this.config.costController);
      await this.components.costController.initialize();
      
      // Initialize model manager
      this.components.modelManager = new ModelManager(this.config.modelManager);
      await this.components.modelManager.initialize();
      
      // Initialize orchestrator with cost controller reference
      this.components.orchestrator = new AgentOrchestrator({
        ...this.config.orchestrator,
        costController: this.components.costController,
        modelManager: this.components.modelManager
      });
      await this.components.orchestrator.initialize();
      
      // Initialize dashboard with all component references
      this.components.dashboard = new MetricsDashboard(this.config.dashboard);
      await this.components.dashboard.initialize();
      
      // Connect components to dashboard for monitoring
      this.components.dashboard.connectComponents({
        orchestrator: this.components.orchestrator,
        costController: this.components.costController,
        modelManager: this.components.modelManager
      });
      
      // Start dashboard server if configured
      if (this.config.dashboard.autoStart !== false) {
        await this.components.dashboard.start();
      }
      
      this.initialized = true;
      
      return {
        success: true,
        components: Object.keys(this.components),
        dashboardUrl: `http://localhost:${this.config.dashboard.port || 3001}`
      };
      
    } catch (error) {
      throw new Error(`Failed to initialize management system: ${error.message}`);
    }
  }
  
  /**
   * Get a specific component
   */
  getComponent(name) {
    if (!this.initialized) {
      throw new Error('Management system not initialized');
    }
    return this.components[name];
  }
  
  /**
   * Get all components
   */
  getAllComponents() {
    if (!this.initialized) {
      throw new Error('Management system not initialized');
    }
    return { ...this.components };
  }
  
  /**
   * Get system status
   */
  async getStatus() {
    if (!this.initialized) {
      return { status: 'not_initialized' };
    }
    
    const status = {
      system: 'operational',
      components: {},
      timestamp: new Date().toISOString()
    };
    
    // Get orchestrator status
    if (this.components.orchestrator) {
      status.components.orchestrator = this.components.orchestrator.getSystemStatus();
    }
    
    // Get cost controller status
    if (this.components.costController) {
      status.components.costController = this.components.costController.getCostStatus();
    }
    
    // Get model manager status
    if (this.components.modelManager) {
      status.components.modelManager = await this.components.modelManager.getStatus();
    }
    
    // Get dashboard status
    if (this.components.dashboard) {
      status.components.dashboard = this.components.dashboard.getSystemStatus();
    }
    
    return status;
  }
  
  /**
   * Shutdown the management system gracefully
   */
  async shutdown() {
    if (!this.initialized) {
      return;
    }
    
    const shutdownPromises = [];
    
    // Stop dashboard server
    if (this.components.dashboard) {
      shutdownPromises.push(this.components.dashboard.stop());
    }
    
    // Shutdown orchestrator
    if (this.components.orchestrator) {
      shutdownPromises.push(this.components.orchestrator.gracefulShutdown());
    }
    
    // Close cost controller database
    if (this.components.costController) {
      shutdownPromises.push(this.components.costController.close());
    }
    
    // Shutdown model manager
    if (this.components.modelManager) {
      shutdownPromises.push(this.components.modelManager.shutdown());
    }
    
    await Promise.allSettled(shutdownPromises);
    this.initialized = false;
  }
}

/**
 * Default configuration for the management system
 */
export const DEFAULT_MANAGEMENT_CONFIG = {
  orchestrator: {
    maxConcurrentAgents: 5,
    maxQueueSize: 100,
    healthCheckInterval: 30000,
    autoScaling: false
  },
  costController: {
    dailyLimits: {
      claude: 1000,  // $10.00 in cents
      gemini: 1500,  // $15.00 in cents (for tracking, Gemini is free)
      total: 2000    // $20.00 in cents
    },
    warningThresholds: {
      level1: 0.5,   // 50%
      level2: 0.75,  // 75%
      level3: 0.9    // 90%
    }
  },
  dashboard: {
    port: 3001,
    updateInterval: 5000,
    historyLength: 100,
    enableWebSocketUpdates: true,
    autoStart: true
  },
  modelManager: {
    cacheEnabled: true,
    cacheTTL: 3600,
    healthCheckInterval: 60000
  }
};

/**
 * Quick setup function for development
 */
export async function setupManagementSystem(overrideConfig = {}) {
  const config = {
    ...DEFAULT_MANAGEMENT_CONFIG,
    ...overrideConfig
  };
  
  const managementSystem = new ManagementSystem(config);
  await managementSystem.initialize();
  
  return managementSystem;
}

/**
 * Export individual components as defaults for direct imports
 */
export default {
  ModelManager,
  AgentOrchestrator,
  CostController,
  MetricsDashboard,
  ManagementSystem,
  setupManagementSystem,
  DEFAULT_MANAGEMENT_CONFIG
};