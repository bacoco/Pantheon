# UI Tools Integration Framework

## Overview
This framework provides integration patterns and utilities for UI improvement tools within the BACO system. While BACO operates entirely within Claude Code, these patterns enable sophisticated UI analysis and enhancement workflows.

## Core Integration Patterns

### Screenshot Capture Pattern
```javascript
// Pattern for capturing UI states
const captureUIStates = async (config) => {
  const states = ['default', 'hover', 'focus', 'active', 'disabled', 'loading', 'error'];
  const viewports = [
    { name: 'mobile', width: 375, height: 667 },
    { name: 'tablet', width: 768, height: 1024 },
    { name: 'desktop', width: 1440, height: 900 }
  ];
  
  const captures = [];
  
  for (const viewport of viewports) {
    for (const state of states) {
      captures.push({
        viewport: viewport.name,
        state: state,
        path: `screenshots/${viewport.name}-${state}.png`,
        timestamp: new Date().toISOString()
      });
    }
  }
  
  return captures;
};
```

### Style Extraction Pattern
```javascript
// Pattern for extracting computed styles
const extractComputedStyles = (element) => {
  const styles = window.getComputedStyle(element);
  
  return {
    colors: {
      color: styles.color,
      backgroundColor: styles.backgroundColor,
      borderColor: styles.borderColor
    },
    typography: {
      fontFamily: styles.fontFamily,
      fontSize: styles.fontSize,
      fontWeight: styles.fontWeight,
      lineHeight: styles.lineHeight,
      letterSpacing: styles.letterSpacing
    },
    spacing: {
      padding: styles.padding,
      margin: styles.margin,
      gap: styles.gap
    },
    effects: {
      boxShadow: styles.boxShadow,
      borderRadius: styles.borderRadius,
      opacity: styles.opacity
    }
  };
};
```

### Token Conversion Pattern
```javascript
// Pattern for converting styles to design tokens
const stylesToTokens = (extractedStyles) => {
  const tokens = {
    color: {},
    typography: {},
    spacing: {},
    effects: {}
  };
  
  // Color tokens
  const colorMap = new Map();
  Object.entries(extractedStyles.colors).forEach(([key, value]) => {
    if (value && value !== 'transparent') {
      const tokenName = generateTokenName('color', key, value);
      colorMap.set(value, tokenName);
      tokens.color[tokenName] = { value };
    }
  });
  
  // Typography tokens
  const fontSizes = new Set();
  Object.entries(extractedStyles.typography).forEach(([key, value]) => {
    if (key === 'fontSize') {
      fontSizes.add(value);
    }
  });
  
  // Generate scale
  const sortedSizes = Array.from(fontSizes).sort((a, b) => 
    parseFloat(a) - parseFloat(b)
  );
  
  sortedSizes.forEach((size, index) => {
    const scale = ['xs', 'sm', 'base', 'lg', 'xl', '2xl', '3xl', '4xl', '5xl'];
    tokens.typography[`fontSize-${scale[index] || index}`] = { value: size };
  });
  
  return tokens;
};
```

### Visual Diff Pattern
```javascript
// Pattern for visual regression testing
const visualDiff = {
  capture: async (identifier) => ({
    id: identifier,
    timestamp: Date.now(),
    viewport: getCurrentViewport(),
    url: window.location.href,
    screenshot: 'base64-encoded-image-data'
  }),
  
  compare: (baseline, current, threshold = 0.01) => {
    // Pixel-by-pixel comparison logic
    const differences = [];
    const diffPercentage = calculateDiffPercentage(baseline, current);
    
    return {
      passed: diffPercentage <= threshold,
      diffPercentage,
      differences,
      report: generateDiffReport(differences)
    };
  },
  
  generateReport: (comparison) => ({
    summary: `${comparison.passed ? 'PASS' : 'FAIL'}: ${comparison.diffPercentage}% difference`,
    details: comparison.differences,
    recommendations: comparison.diffPercentage > 0.05 
      ? 'Significant visual changes detected. Review required.'
      : 'Minor differences within acceptable threshold.'
  })
};
```

### Performance Monitoring Pattern
```javascript
// Pattern for monitoring animation performance
const performanceMonitor = {
  startMonitoring: () => {
    const metrics = {
      fps: [],
      jank: [],
      paintTime: [],
      layoutTime: []
    };
    
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'measure') {
          metrics.paintTime.push(entry.duration);
        }
      }
    });
    
    observer.observe({ entryTypes: ['measure', 'navigation'] });
    
    // FPS monitoring
    let lastTime = performance.now();
    const checkFPS = () => {
      const currentTime = performance.now();
      const fps = 1000 / (currentTime - lastTime);
      metrics.fps.push(fps);
      
      if (fps < 55) {
        metrics.jank.push({
          timestamp: currentTime,
          fps: fps
        });
      }
      
      lastTime = currentTime;
      requestAnimationFrame(checkFPS);
    };
    
    checkFPS();
    
    return {
      stop: () => observer.disconnect(),
      getMetrics: () => ({
        averageFPS: average(metrics.fps),
        jankCount: metrics.jank.length,
        p95PaintTime: percentile(metrics.paintTime, 95)
      })
    };
  }
};
```

### Accessibility Validation Pattern
```javascript
// Pattern for accessibility checks
const accessibilityValidator = {
  checkContrast: (foreground, background) => {
    const ratio = getContrastRatio(foreground, background);
    return {
      ratio,
      AANormal: ratio >= 4.5,
      AALarge: ratio >= 3,
      AAANormal: ratio >= 7,
      AAALarge: ratio >= 4.5
    };
  },
  
  checkKeyboardNav: () => {
    const focusableElements = document.querySelectorAll(
      'a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    const issues = [];
    focusableElements.forEach(el => {
      if (!el.matches(':focus-visible')) {
        issues.push({
          element: el,
          issue: 'Missing focus indicator'
        });
      }
    });
    
    return issues;
  },
  
  checkAria: () => {
    const ariaIssues = [];
    
    // Check for missing labels
    document.querySelectorAll('input, select, textarea').forEach(el => {
      if (!el.getAttribute('aria-label') && !el.labels.length) {
        ariaIssues.push({
          element: el,
          issue: 'Missing label'
        });
      }
    });
    
    return ariaIssues;
  }
};
```

## Tool Simulation Patterns

### Mobbin-Style Inspiration Capture
```javascript
const inspirationCapture = {
  pull: async (query, options = {}) => {
    // Simulate pulling design inspiration
    return {
      query,
      results: [
        {
          name: 'Modern Dashboard',
          category: 'fintech',
          thumbnail: 'path/to/thumbnail.png',
          fullSize: 'path/to/full.png',
          colors: ['#3B82F6', '#10B981', '#F59E0B'],
          tags: ['minimal', 'data-viz', 'professional']
        }
      ],
      savedTo: options.outputDir || './inspiration'
    };
  }
};
```

### Context7-Style Analysis
```javascript
const contextAnalysis = {
  analyzeWithPrompt: async (content, prompt) => {
    // Simulate AI analysis of content
    return {
      analysis: 'AI-generated analysis based on prompt',
      insights: [],
      recommendations: [],
      confidence: 0.85
    };
  },
  
  findPatterns: async (category) => {
    // Simulate pattern discovery
    return {
      patterns: [
        {
          name: 'Card-based layout',
          frequency: 'common',
          usage: 'Data display, content organization',
          example: 'code-snippet-here'
        }
      ]
    };
  }
};
```

### ShadCN-Style Token Conversion
```javascript
const tokenConverter = {
  toTailwind: (tokens) => {
    const config = {
      theme: {
        extend: {
          colors: {},
          fontSize: {},
          spacing: {}
        }
      }
    };
    
    // Convert color tokens
    Object.entries(tokens.color).forEach(([key, value]) => {
      const name = key.replace('color-', '');
      config.theme.extend.colors[name] = value.value;
    });
    
    return config;
  },
  
  toRadixPrimitives: (tokens) => {
    // Convert to Radix-compatible format
    return {
      colors: tokens.color,
      radii: tokens.borderRadius,
      space: tokens.spacing
    };
  }
};
```

## Integration Workflows

### Complete UI Analysis Workflow
```javascript
class UIAnalysisWorkflow {
  constructor(config) {
    this.config = config;
    this.results = {};
  }
  
  async execute() {
    // 1. Capture current state
    this.results.captures = await this.captureUI();
    
    // 2. Extract styles
    this.results.styles = await this.extractStyles();
    
    // 3. Generate tokens
    this.results.tokens = await this.generateTokens();
    
    // 4. Analyze quality
    this.results.quality = await this.analyzeQuality();
    
    // 5. Generate recommendations
    this.results.recommendations = await this.generateRecommendations();
    
    return this.results;
  }
  
  async captureUI() {
    // Implementation
  }
  
  async extractStyles() {
    // Implementation
  }
  
  async generateTokens() {
    // Implementation
  }
  
  async analyzeQuality() {
    const scores = {
      consistency: this.checkConsistency(),
      accessibility: this.checkAccessibility(),
      performance: this.checkPerformance(),
      overall: 0
    };
    
    scores.overall = (
      scores.consistency * 0.3 +
      scores.accessibility * 0.4 +
      scores.performance * 0.3
    );
    
    return scores;
  }
  
  async generateRecommendations() {
    // Based on analysis, generate specific recommendations
  }
}
```

### Continuous Improvement Pipeline
```javascript
class ContinuousUIImprovement {
  constructor(agents) {
    this.agents = agents;
    this.history = [];
  }
  
  async runCycle() {
    const cycle = {
      timestamp: new Date(),
      baseline: await this.captureBaseline(),
      improvements: []
    };
    
    // Run each agent's improvements
    for (const agent of this.agents) {
      const improvement = await agent.improve(cycle.baseline);
      if (improvement.impact > 0) {
        cycle.improvements.push(improvement);
      }
    }
    
    // Apply improvements
    const result = await this.applyImprovements(cycle.improvements);
    
    // Validate results
    cycle.validation = await this.validate(result);
    
    this.history.push(cycle);
    return cycle;
  }
  
  async captureBaseline() {
    // Capture current state
  }
  
  async applyImprovements(improvements) {
    // Apply in order of impact
    improvements.sort((a, b) => b.impact - a.impact);
    
    for (const improvement of improvements) {
      await this.applyImprovement(improvement);
    }
  }
  
  async validate(result) {
    // Run validation checks
  }
}
```

## Utility Functions

### Color Utilities
```javascript
const colorUtils = {
  hexToRgb: (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  },
  
  getLuminance: (rgb) => {
    const [r, g, b] = [rgb.r, rgb.g, rgb.b].map(val => {
      val = val / 255;
      return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  },
  
  getContrastRatio: (color1, color2) => {
    const lum1 = colorUtils.getLuminance(color1);
    const lum2 = colorUtils.getLuminance(color2);
    const brightest = Math.max(lum1, lum2);
    const darkest = Math.min(lum1, lum2);
    return (brightest + 0.05) / (darkest + 0.05);
  }
};
```

### Animation Utilities
```javascript
const animationUtils = {
  easings: {
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    spring: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)'
  },
  
  durations: {
    instant: '0ms',
    fast: '150ms',
    normal: '250ms',
    slow: '350ms',
    slower: '500ms'
  },
  
  generateKeyframes: (from, to, steps = 2) => {
    const keyframes = [from];
    for (let i = 1; i < steps; i++) {
      const progress = i / steps;
      const frame = {};
      Object.keys(from).forEach(key => {
        if (typeof from[key] === 'number') {
          frame[key] = from[key] + (to[key] - from[key]) * progress;
        }
      });
      keyframes.push(frame);
    }
    keyframes.push(to);
    return keyframes;
  }
};
```

## Best Practices

### 1. Performance First
- Always measure before and after changes
- Set performance budgets
- Use GPU-accelerated properties
- Monitor real user metrics

### 2. Accessibility Always
- Test with keyboard navigation
- Verify screen reader compatibility
- Check color contrast ratios
- Respect motion preferences

### 3. Progressive Enhancement
- Start with baseline functionality
- Layer on enhancements
- Ensure graceful degradation
- Test on various devices

### 4. Systematic Approach
- Use design tokens consistently
- Document all decisions
- Version control changes
- Maintain audit trails

## Usage Example

```javascript
// Initialize the UI improvement system
const uiSystem = new UIAnalysisWorkflow({
  targets: ['dashboard', 'settings', 'profile'],
  viewports: ['mobile', 'tablet', 'desktop'],
  agents: ['vision', 'fusion', 'motion', 'voice', 'pixel']
});

// Run analysis
const analysis = await uiSystem.execute();

// Check results
console.log(`Overall UI Score: ${analysis.quality.overall}/10`);
console.log(`Issues found: ${analysis.recommendations.length}`);

// Apply improvements
for (const recommendation of analysis.recommendations) {
  if (recommendation.autoFixable) {
    await recommendation.apply();
  }
}
```

This framework provides the foundation for sophisticated UI analysis and improvement within the BACO system, maintaining the principle of operating entirely within Claude Code while enabling powerful UI enhancement capabilities.