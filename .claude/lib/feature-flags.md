# Feature Flags Configuration

This library manages feature flags for BACO, enabling safe rollout of new features.

## ACTIVATION

When this library is loaded, it provides centralized feature flag management for all BACO components.

## Core Feature Flags

```javascript
const FEATURE_FLAGS = {
  // Smart Routing Features
  SMART_ROUTING: {
    enabled: false,
    description: "Enable intelligent task routing to specialized agents",
    rolloutPercentage: 0,
    config: {
      ROUTING_PREVIEW_MODE: true,      // Show routing decisions without executing
      ALLOW_MANUAL_OVERRIDE: true,      // Users can override routing decisions
      ROUTING_ANALYTICS_ENABLED: true,  // Collect routing effectiveness metrics
      AUTO_ROUTE_THRESHOLD: 0.7,        // Minimum confidence for auto-routing
      SUGGEST_COLLABORATION: true,      // Suggest supporting agents
      MAX_SUPPORTING_AGENTS: 2          // Maximum supporting agents to suggest
    }
  },

  // MCP Integration Features
  MCP_INTEGRATION: {
    enabled: true,
    description: "Enable Model Context Protocol tool integration",
    rolloutPercentage: 100,
    config: {
      ENABLE_PLAYWRIGHT: true,
      ENABLE_BROWSERMCP: true,
      ENABLE_SHADCN_UI: true,
      ENABLE_GITHUB_MCP: true,
      ENABLE_CONTEXT7: true,
      ENABLE_TASK_MASTER: true,
      ERROR_RETRY_LIMIT: 3,
      TIMEOUT_SECONDS: 30
    }
  },

  // Advanced Features
  ADVANCED_FEATURES: {
    enabled: true,
    description: "Enable advanced BACO features",
    rolloutPercentage: 100,
    config: {
      LIVE_PREVIEW: true,
      GIT_INTEGRATION: true,
      INCREMENTAL_UPDATES: true,
      TEMPLATE_COMPOSITION: true,
      DEPENDENCY_MANAGEMENT: true
    }
  },

  // AI-Driven UX Features
  AI_UX_FEATURES: {
    enabled: true,
    description: "Enable AI-driven UX capabilities",
    rolloutPercentage: 100,
    config: {
      DYNAMIC_PERSONAS: true,
      VISUAL_MOCKUPS: true,
      UI_SELF_HEALING: true,
      CODE_TRANSFORMATION: true,
      VISUAL_REGRESSION: true
    }
  },

  // Experimental Features
  EXPERIMENTAL: {
    enabled: false,
    description: "Enable experimental features in development",
    rolloutPercentage: 0,
    config: {
      PARALLEL_AGENT_EXECUTION: false,
      LEARNING_SYSTEM: false,
      CUSTOM_TEMPLATES: false,
      PLUGIN_SYSTEM: false
    }
  }
};
```

## Feature Flag Functions

### Check if Feature is Enabled

```javascript
function isFeatureEnabled(featureName, subFeature = null) {
  const feature = FEATURE_FLAGS[featureName];
  
  if (!feature) {
    console.warn(`Unknown feature flag: ${featureName}`);
    return false;
  }
  
  // Check main feature flag
  if (!feature.enabled) {
    return false;
  }
  
  // Check rollout percentage
  if (feature.rolloutPercentage < 100) {
    const userHash = getUserHash(); // Deterministic per user
    const threshold = feature.rolloutPercentage / 100;
    if (userHash > threshold) {
      return false;
    }
  }
  
  // Check sub-feature if specified
  if (subFeature && feature.config) {
    return feature.config[subFeature] === true;
  }
  
  return true;
}
```

### Get Feature Configuration

```javascript
function getFeatureConfig(featureName) {
  const feature = FEATURE_FLAGS[featureName];
  
  if (!feature || !feature.enabled) {
    return {};
  }
  
  return feature.config || {};
}
```

### Toggle Feature Flag

```javascript
function toggleFeature(featureName, enabled = null) {
  const feature = FEATURE_FLAGS[featureName];
  
  if (!feature) {
    throw new Error(`Unknown feature flag: ${featureName}`);
  }
  
  if (enabled === null) {
    // Toggle current state
    feature.enabled = !feature.enabled;
  } else {
    feature.enabled = enabled;
  }
  
  console.log(`Feature ${featureName} is now ${feature.enabled ? 'enabled' : 'disabled'}`);
  return feature.enabled;
}
```

### Set Rollout Percentage

```javascript
function setRolloutPercentage(featureName, percentage) {
  const feature = FEATURE_FLAGS[featureName];
  
  if (!feature) {
    throw new Error(`Unknown feature flag: ${featureName}`);
  }
  
  if (percentage < 0 || percentage > 100) {
    throw new Error('Rollout percentage must be between 0 and 100');
  }
  
  feature.rolloutPercentage = percentage;
  console.log(`Feature ${featureName} rollout set to ${percentage}%`);
}
```

### User Hash for Rollout

```javascript
function getUserHash() {
  // In a real implementation, this would be based on user ID
  // For now, return a consistent value for testing
  return 0.5; // This means user gets features at 50% rollout or higher
}
```

## Usage in Commands

### Smart Routing Example

```javascript
// In /baco route command
if (!isFeatureEnabled('SMART_ROUTING')) {
  console.log("Smart routing is currently disabled. Using default routing.");
  return getDefaultRouting();
}

const config = getFeatureConfig('SMART_ROUTING');

if (config.ROUTING_PREVIEW_MODE) {
  console.log("PREVIEW MODE: Showing routing decision without executing");
}

// Proceed with smart routing...
```

### MCP Tool Usage Example

```javascript
// In agent code
if (isFeatureEnabled('MCP_INTEGRATION', 'ENABLE_PLAYWRIGHT')) {
  // Use playwright for visual testing
  const screenshot = await playwright.screenshot(url);
} else {
  // Fallback to description-based testing
  console.log("Visual testing unavailable - using text descriptions");
}
```

## Feature Flag Best Practices

1. **Gradual Rollout**: Start with 0%, increase gradually
2. **Kill Switch**: Always allow disabling features quickly
3. **Configuration**: Use sub-flags for granular control
4. **Monitoring**: Track feature usage and errors
5. **Documentation**: Document what each flag controls

## Environment-Based Overrides

```javascript
// Override flags based on environment
function applyEnvironmentOverrides() {
  const env = process.env.BACO_ENV || 'production';
  
  if (env === 'development') {
    // Enable all features in development
    Object.keys(FEATURE_FLAGS).forEach(flag => {
      FEATURE_FLAGS[flag].enabled = true;
      FEATURE_FLAGS[flag].rolloutPercentage = 100;
    });
  } else if (env === 'testing') {
    // Specific test configuration
    FEATURE_FLAGS.EXPERIMENTAL.enabled = true;
    FEATURE_FLAGS.SMART_ROUTING.enabled = true;
  }
}
```

## Feature Flag Status

```javascript
function getFeatureFlagStatus() {
  const status = {};
  
  Object.entries(FEATURE_FLAGS).forEach(([name, feature]) => {
    status[name] = {
      enabled: feature.enabled,
      rollout: `${feature.rolloutPercentage}%`,
      description: feature.description
    };
  });
  
  return status;
}

// Display current status
function displayFeatureFlags() {
  console.log("=== BACO Feature Flags ===");
  const status = getFeatureFlagStatus();
  
  Object.entries(status).forEach(([name, info]) => {
    const statusIcon = info.enabled ? '✅' : '❌';
    console.log(`${statusIcon} ${name}: ${info.description}`);
    console.log(`   Rollout: ${info.rollout}`);
  });
}
```

## Integration Points

This feature flag system integrates with:
1. **Smart Router**: Controls routing behavior
2. **MCP Tools**: Enables/disables external tools
3. **Commands**: Feature-specific command availability
4. **Agents**: Agent capabilities based on features
5. **Workflows**: Advanced workflow features

## Safety Mechanisms

1. **Validation**: Flags are validated on load
2. **Fallbacks**: Disabled features have safe fallbacks
3. **Logging**: All flag changes are logged
4. **Persistence**: Flag states can be saved/restored
5. **Rollback**: Quick disable for problematic features