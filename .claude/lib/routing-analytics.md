# Routing Analytics & Monitoring

This library provides analytics collection and monitoring capabilities for the Smart Router, enabling continuous improvement through data-driven insights.

## ACTIVATION

When this library is active, it collects and analyzes routing decisions, success rates, and user feedback to improve agent selection over time.

## Core Components

### 1. Analytics Data Model

```typescript
interface RoutingAnalytics {
  id: string;
  timestamp: Date;
  sessionId: string;
  
  // Request details
  request: {
    originalText: string;
    wordCount: number;
    hasCodeBlocks: boolean;
    hasPriority: boolean;
  };
  
  // Analysis results
  analysis: {
    domains: string[];
    technologies: string[];
    complexity: number;
    taskType: string;
    estimatedDuration: string;
    analysisTime: number; // ms
  };
  
  // Routing decision
  routing: {
    primaryAgent: string;
    confidence: number;
    supportingAgents: string[];
    alternativeAgents: Array<{
      agent: string;
      confidence: number;
    }>;
    routingTime: number; // ms
    autoRouted: boolean;
  };
  
  // User interaction
  interaction: {
    userAccepted: boolean;
    userOverride?: string; // Agent selected if overridden
    userFeedback?: 'positive' | 'negative' | 'neutral';
    feedbackText?: string;
  };
  
  // Outcome tracking
  outcome?: {
    taskCompleted: boolean;
    completionTime?: number; // minutes
    agentPerformance?: number; // 1-10 scale
    errors?: string[];
    retries?: number;
  };
}
```

### 2. Analytics Collector

```javascript
class RoutingAnalyticsCollector {
  private analytics: Map<string, RoutingAnalytics> = new Map();
  private sessionId: string;
  
  constructor() {
    this.sessionId = generateSessionId();
  }
  
  startTracking(request: string): string {
    const analyticsId = generateId();
    const analytics: RoutingAnalytics = {
      id: analyticsId,
      timestamp: new Date(),
      sessionId: this.sessionId,
      request: {
        originalText: request,
        wordCount: request.split(/\s+/).length,
        hasCodeBlocks: /```/.test(request),
        hasPriority: /urgent|asap|critical/i.test(request)
      },
      analysis: null,
      routing: null,
      interaction: null
    };
    
    this.analytics.set(analyticsId, analytics);
    return analyticsId;
  }
  
  recordAnalysis(analyticsId: string, analysis: TaskAnalysis, analysisTime: number) {
    const record = this.analytics.get(analyticsId);
    if (!record) return;
    
    record.analysis = {
      domains: analysis.domains,
      technologies: analysis.technologies,
      complexity: analysis.complexity,
      taskType: analysis.taskType,
      estimatedDuration: analysis.estimatedDuration,
      analysisTime
    };
  }
  
  recordRouting(analyticsId: string, decision: RoutingDecision, routingTime: number) {
    const record = this.analytics.get(analyticsId);
    if (!record) return;
    
    record.routing = {
      primaryAgent: decision.primaryAgent.name,
      confidence: decision.confidence,
      supportingAgents: decision.supportingAgents.map(a => a.name),
      alternativeAgents: decision.alternativeRoutes.map(a => ({
        agent: a.agent,
        confidence: a.confidence
      })),
      routingTime,
      autoRouted: decision.flags.autoRoute
    };
  }
  
  recordInteraction(analyticsId: string, interaction: any) {
    const record = this.analytics.get(analyticsId);
    if (!record) return;
    
    record.interaction = interaction;
  }
  
  recordOutcome(analyticsId: string, outcome: any) {
    const record = this.analytics.get(analyticsId);
    if (!record) return;
    
    record.outcome = outcome;
    
    // Persist to storage
    this.persistAnalytics(record);
  }
  
  private persistAnalytics(analytics: RoutingAnalytics) {
    // In practice, save to file or database
    const filePath = `.claude/analytics/routing/${analytics.timestamp.toISOString().split('T')[0]}.jsonl`;
    appendToFile(filePath, JSON.stringify(analytics) + '\n');
  }
}
```

### 3. Analytics Aggregator

```javascript
class RoutingAnalyticsAggregator {
  
  async generateReport(startDate: Date, endDate: Date): Promise<AnalyticsReport> {
    const analytics = await this.loadAnalytics(startDate, endDate);
    
    return {
      summary: this.generateSummary(analytics),
      agentPerformance: this.calculateAgentPerformance(analytics),
      routingAccuracy: this.calculateRoutingAccuracy(analytics),
      domainAnalysis: this.analyzeDomains(analytics),
      userBehavior: this.analyzeUserBehavior(analytics),
      recommendations: this.generateRecommendations(analytics)
    };
  }
  
  private generateSummary(analytics: RoutingAnalytics[]): Summary {
    return {
      totalRequests: analytics.length,
      avgConfidence: average(analytics.map(a => a.routing?.confidence || 0)),
      acceptanceRate: percentage(analytics.filter(a => a.interaction?.userAccepted).length, analytics.length),
      avgAnalysisTime: average(analytics.map(a => a.analysis?.analysisTime || 0)),
      avgRoutingTime: average(analytics.map(a => a.routing?.routingTime || 0)),
      completionRate: percentage(analytics.filter(a => a.outcome?.taskCompleted).length, analytics.length)
    };
  }
  
  private calculateAgentPerformance(analytics: RoutingAnalytics[]): AgentPerformance[] {
    const agentStats = new Map<string, AgentStats>();
    
    for (const record of analytics) {
      if (!record.routing) continue;
      
      const agent = record.routing.primaryAgent;
      const stats = agentStats.get(agent) || {
        totalRouted: 0,
        accepted: 0,
        completed: 0,
        avgConfidence: [],
        avgPerformance: [],
        domains: new Set()
      };
      
      stats.totalRouted++;
      if (record.interaction?.userAccepted) stats.accepted++;
      if (record.outcome?.taskCompleted) stats.completed++;
      stats.avgConfidence.push(record.routing.confidence);
      if (record.outcome?.agentPerformance) {
        stats.avgPerformance.push(record.outcome.agentPerformance);
      }
      record.analysis?.domains.forEach(d => stats.domains.add(d));
      
      agentStats.set(agent, stats);
    }
    
    return Array.from(agentStats.entries()).map(([agent, stats]) => ({
      agent,
      totalRouted: stats.totalRouted,
      acceptanceRate: percentage(stats.accepted, stats.totalRouted),
      completionRate: percentage(stats.completed, stats.totalRouted),
      avgConfidence: average(stats.avgConfidence),
      avgPerformance: average(stats.avgPerformance),
      topDomains: Array.from(stats.domains).slice(0, 3)
    }));
  }
  
  private calculateRoutingAccuracy(analytics: RoutingAnalytics[]): RoutingAccuracy {
    const correctRoutings = analytics.filter(a => 
      a.interaction?.userAccepted && 
      a.outcome?.taskCompleted &&
      !a.interaction?.userOverride
    );
    
    const overriddenRoutings = analytics.filter(a => 
      a.interaction?.userOverride
    );
    
    return {
      accuracy: percentage(correctRoutings.length, analytics.length),
      overrideRate: percentage(overriddenRoutings.length, analytics.length),
      commonOverrides: this.findCommonOverrides(overriddenRoutings),
      confidenceCorrelation: this.calculateConfidenceCorrelation(analytics)
    };
  }
  
  private analyzeDomains(analytics: RoutingAnalytics[]): DomainAnalysis[] {
    const domainStats = new Map<string, DomainStats>();
    
    for (const record of analytics) {
      if (!record.analysis) continue;
      
      for (const domain of record.analysis.domains) {
        const stats = domainStats.get(domain) || {
          count: 0,
          avgComplexity: [],
          commonAgents: new Map(),
          successRate: { total: 0, successful: 0 }
        };
        
        stats.count++;
        stats.avgComplexity.push(record.analysis.complexity);
        
        const agent = record.routing?.primaryAgent;
        if (agent) {
          stats.commonAgents.set(agent, (stats.commonAgents.get(agent) || 0) + 1);
        }
        
        stats.successRate.total++;
        if (record.outcome?.taskCompleted) {
          stats.successRate.successful++;
        }
        
        domainStats.set(domain, stats);
      }
    }
    
    return Array.from(domainStats.entries()).map(([domain, stats]) => ({
      domain,
      requestCount: stats.count,
      avgComplexity: average(stats.avgComplexity),
      topAgents: Array.from(stats.commonAgents.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([agent, count]) => ({ agent, count })),
      successRate: percentage(stats.successRate.successful, stats.successRate.total)
    }));
  }
  
  private generateRecommendations(analytics: RoutingAnalytics[]): Recommendation[] {
    const recommendations = [];
    
    // Find agents with low acceptance rates
    const agentPerformance = this.calculateAgentPerformance(analytics);
    for (const agent of agentPerformance) {
      if (agent.acceptanceRate < 50) {
        recommendations.push({
          type: 'agent-improvement',
          priority: 'high',
          message: `${agent.agent} has low acceptance rate (${agent.acceptanceRate}%). Consider reviewing capability definitions.`,
          action: `Review and update ${agent.agent}'s capability metadata`
        });
      }
    }
    
    // Find high-complexity tasks with low success
    const complexTasks = analytics.filter(a => 
      a.analysis?.complexity >= 8 && 
      !a.outcome?.taskCompleted
    );
    
    if (complexTasks.length > analytics.length * 0.2) {
      recommendations.push({
        type: 'complexity-handling',
        priority: 'high',
        message: 'High-complexity tasks have low success rate. Consider using BMad Master more often.',
        action: 'Lower auto-route threshold for complex tasks'
      });
    }
    
    // Find domains with poor routing
    const domainAnalysis = this.analyzeDomains(analytics);
    for (const domain of domainAnalysis) {
      if (domain.successRate < 60) {
        recommendations.push({
          type: 'domain-routing',
          priority: 'medium',
          message: `${domain.domain} domain has low success rate (${domain.successRate}%)`,
          action: `Review agent capabilities for ${domain.domain} domain`
        });
      }
    }
    
    return recommendations;
  }
}
```

### 4. Real-time Monitoring

```javascript
class RoutingMonitor {
  private recentDecisions: RoutingDecision[] = [];
  private maxHistory = 50;
  
  recordDecision(decision: RoutingDecision) {
    this.recentDecisions.unshift(decision);
    if (this.recentDecisions.length > this.maxHistory) {
      this.recentDecisions.pop();
    }
  }
  
  getRealtimeStats(): RealtimeStats {
    const recent = this.recentDecisions.slice(0, 10);
    
    return {
      avgConfidence: average(recent.map(d => d.confidence)),
      topAgents: this.getTopAgents(recent),
      routingTrend: this.calculateTrend(),
      currentLoad: this.getCurrentLoad(),
      alerts: this.checkAlerts()
    };
  }
  
  private getTopAgents(decisions: RoutingDecision[]): AgentCount[] {
    const counts = new Map<string, number>();
    
    for (const decision of decisions) {
      const agent = decision.primaryAgent.name;
      counts.set(agent, (counts.get(agent) || 0) + 1);
    }
    
    return Array.from(counts.entries())
      .map(([agent, count]) => ({ agent, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }
  
  private calculateTrend(): 'improving' | 'stable' | 'degrading' {
    if (this.recentDecisions.length < 20) return 'stable';
    
    const firstHalf = this.recentDecisions.slice(10, 20);
    const secondHalf = this.recentDecisions.slice(0, 10);
    
    const firstAvg = average(firstHalf.map(d => d.confidence));
    const secondAvg = average(secondHalf.map(d => d.confidence));
    
    if (secondAvg > firstAvg + 0.05) return 'improving';
    if (secondAvg < firstAvg - 0.05) return 'degrading';
    return 'stable';
  }
  
  private checkAlerts(): Alert[] {
    const alerts = [];
    
    // Low confidence alert
    const recentLowConfidence = this.recentDecisions
      .slice(0, 5)
      .filter(d => d.confidence < 0.5);
    
    if (recentLowConfidence.length >= 3) {
      alerts.push({
        type: 'low-confidence',
        severity: 'warning',
        message: 'Multiple low-confidence routing decisions detected'
      });
    }
    
    // Single agent overload
    const agentCounts = this.getTopAgents(this.recentDecisions.slice(0, 10));
    if (agentCounts[0]?.count > 7) {
      alerts.push({
        type: 'agent-overload',
        severity: 'info',
        message: `${agentCounts[0].agent} is handling most requests`
      });
    }
    
    return alerts;
  }
}
```

### 5. Analytics Dashboard

```javascript
function displayAnalyticsDashboard() {
  const monitor = getRoutingMonitor();
  const stats = monitor.getRealtimeStats();
  
  console.log(`
📊 SMART ROUTING ANALYTICS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📈 Real-time Metrics
├─ Average Confidence: ${(stats.avgConfidence * 100).toFixed(1)}%
├─ Routing Trend: ${stats.routingTrend}
└─ Active Alerts: ${stats.alerts.length}

👥 Top Agents (Last 10 Requests)
${stats.topAgents.map(a => `├─ ${a.agent}: ${a.count} requests`).join('\n')}

⚠️  Alerts
${stats.alerts.map(a => `├─ [${a.severity}] ${a.message}`).join('\n') || '└─ No active alerts'}

📊 Historical Performance
├─ Total Requests: ${getTotalRequests()}
├─ Acceptance Rate: ${getAcceptanceRate()}%
├─ Success Rate: ${getSuccessRate()}%
└─ Avg Response Time: ${getAvgResponseTime()}ms

🔄 Recent Routing Decisions
${getRecentDecisions().map(d => 
  `├─ ${d.task} → ${d.agent} (${d.confidence}%)`
).join('\n')}
  `);
}
```

### 6. Learning System

```javascript
class RoutingLearningSystem {
  private patterns: Map<string, RoutingPattern> = new Map();
  
  async learn(analytics: RoutingAnalytics[]) {
    // Find successful patterns
    const successfulRoutings = analytics.filter(a =>
      a.interaction?.userAccepted &&
      a.outcome?.taskCompleted &&
      a.outcome?.agentPerformance >= 8
    );
    
    // Extract patterns
    for (const routing of successfulRoutings) {
      const pattern = this.extractPattern(routing);
      this.updatePattern(pattern);
    }
    
    // Save learned patterns
    await this.savePatterns();
  }
  
  private extractPattern(routing: RoutingAnalytics): RoutingPattern {
    return {
      domains: routing.analysis.domains,
      technologies: routing.analysis.technologies,
      complexity: routing.analysis.complexity,
      taskType: routing.analysis.taskType,
      successfulAgent: routing.routing.primaryAgent,
      confidence: routing.routing.confidence,
      performance: routing.outcome.agentPerformance
    };
  }
  
  private updatePattern(pattern: RoutingPattern) {
    const key = this.generatePatternKey(pattern);
    const existing = this.patterns.get(key) || {
      ...pattern,
      occurrences: 0,
      avgPerformance: []
    };
    
    existing.occurrences++;
    existing.avgPerformance.push(pattern.performance);
    
    this.patterns.set(key, existing);
  }
  
  suggestAgent(analysis: TaskAnalysis): AgentSuggestion | null {
    const key = this.generateKeyFromAnalysis(analysis);
    const pattern = this.patterns.get(key);
    
    if (pattern && pattern.occurrences >= 3) {
      return {
        agent: pattern.successfulAgent,
        confidence: 0.9,
        reason: `Based on ${pattern.occurrences} successful similar tasks`,
        avgPerformance: average(pattern.avgPerformance)
      };
    }
    
    return null;
  }
}
```

## Usage Examples

### 1. Tracking a Routing Decision

```javascript
const collector = new RoutingAnalyticsCollector();

// Start tracking
const trackingId = collector.startTracking(userRequest);

// Track analysis
const startAnalysis = Date.now();
const analysis = analyzeTask(userRequest);
collector.recordAnalysis(trackingId, analysis, Date.now() - startAnalysis);

// Track routing
const startRouting = Date.now();
const decision = matchAgents(analysis);
collector.recordRouting(trackingId, decision, Date.now() - startRouting);

// Track user interaction
collector.recordInteraction(trackingId, {
  userAccepted: true,
  userFeedback: 'positive'
});

// Track outcome (after task completion)
collector.recordOutcome(trackingId, {
  taskCompleted: true,
  completionTime: 45,
  agentPerformance: 9
});
```

### 2. Generating Analytics Report

```javascript
const aggregator = new RoutingAnalyticsAggregator();

// Generate weekly report
const report = await aggregator.generateReport(
  new Date('2024-01-01'),
  new Date('2024-01-07')
);

console.log('Weekly Routing Report:');
console.log(`Total Requests: ${report.summary.totalRequests}`);
console.log(`Acceptance Rate: ${report.summary.acceptanceRate}%`);
console.log('\nTop Performing Agents:');
report.agentPerformance
  .sort((a, b) => b.avgPerformance - a.avgPerformance)
  .forEach(agent => {
    console.log(`- ${agent.agent}: ${agent.avgPerformance.toFixed(1)}/10`);
  });
```

### 3. Real-time Monitoring

```javascript
// In routing command
const monitor = getRoutingMonitor();
monitor.recordDecision(routingDecision);

// Display dashboard
displayAnalyticsDashboard();
```

## Analytics Storage

Analytics are stored in JSONL format for easy processing:

```
.claude/analytics/routing/
├── 2024-01-15.jsonl
├── 2024-01-16.jsonl
└── 2024-01-17.jsonl
```

Each line is a complete analytics record that can be processed independently.

## Privacy & Security

- No sensitive user data is stored
- Task descriptions are anonymized
- Analytics are local-only by default
- Configurable retention period

## Configuration

```javascript
const ANALYTICS_CONFIG = {
  // Enable analytics collection
  ENABLE_ANALYTICS: true,
  
  // Data retention (days)
  RETENTION_DAYS: 30,
  
  // Real-time monitoring
  ENABLE_MONITORING: true,
  
  // Learning system
  ENABLE_LEARNING: true,
  LEARNING_THRESHOLD: 3, // Min occurrences before pattern is used
  
  // Privacy settings
  ANONYMIZE_TASKS: true,
  EXCLUDE_PATTERNS: [/password|secret|key|token/i]
};
```

## Benefits

1. **Continuous Improvement**: Learn from successful routings
2. **Performance Tracking**: Monitor agent effectiveness
3. **User Insights**: Understand how users interact with routing
4. **Proactive Alerts**: Catch issues before they become problems
5. **Data-Driven Decisions**: Make improvements based on evidence

This analytics system enables BACO's Smart Router to improve over time through data-driven insights and continuous learning.