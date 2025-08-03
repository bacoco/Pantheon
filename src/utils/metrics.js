import { EventEmitter } from 'eventemitter3';

/**
 * Metrics Collector - Tracks performance and usage metrics for agents
 */
export class MetricsCollector extends EventEmitter {
  constructor(agent) {
    super();
    
    this.agent = agent;
    this.metrics = {
      tasksExecuted: 0,
      tasksSucceeded: 0,
      tasksFailed: 0,
      totalDuration: 0,
      averageDuration: 0,
      tokensUsed: 0,
      validationsTriggered: 0,
      refinementsPerformed: 0,
      errors: [],
      performance: {
        p50: 0,
        p95: 0,
        p99: 0
      }
    };
    
    this.durations = [];
    this.startTime = Date.now();
  }
  
  /**
   * Record a metric
   */
  record(data) {
    this.metrics.tasksExecuted++;
    
    if (data.success) {
      this.metrics.tasksSucceeded++;
    } else {
      this.metrics.tasksFailed++;
      if (data.error) {
        this.metrics.errors.push({
          timestamp: new Date(),
          error: data.error,
          task: data.task
        });
      }
    }
    
    if (data.duration) {
      this.metrics.totalDuration += data.duration;
      this.durations.push(data.duration);
      this.updatePerformanceMetrics();
    }
    
    if (data.tokensUsed) {
      this.metrics.tokensUsed += data.tokensUsed;
    }
    
    this.emit('metricsUpdated', this.metrics);
  }
  
  /**
   * Update performance percentiles
   */
  updatePerformanceMetrics() {
    if (this.durations.length === 0) return;
    
    const sorted = [...this.durations].sort((a, b) => a - b);
    
    this.metrics.averageDuration = this.metrics.totalDuration / this.metrics.tasksExecuted;
    this.metrics.performance.p50 = this.getPercentile(sorted, 50);
    this.metrics.performance.p95 = this.getPercentile(sorted, 95);
    this.metrics.performance.p99 = this.getPercentile(sorted, 99);
  }
  
  /**
   * Get percentile value
   */
  getPercentile(sortedArray, percentile) {
    const index = Math.ceil((percentile / 100) * sortedArray.length) - 1;
    return sortedArray[Math.max(0, index)];
  }
  
  /**
   * Record validation triggered
   */
  recordValidation() {
    this.metrics.validationsTriggered++;
  }
  
  /**
   * Record refinement performed
   */
  recordRefinement() {
    this.metrics.refinementsPerformed++;
  }
  
  /**
   * Get summary of metrics
   */
  getSummary() {
    const uptime = Date.now() - this.startTime;
    
    return {
      ...this.metrics,
      uptime: uptime,
      successRate: this.metrics.tasksExecuted > 0 
        ? (this.metrics.tasksSucceeded / this.metrics.tasksExecuted) * 100 
        : 0,
      averageTokensPerTask: this.metrics.tasksExecuted > 0
        ? Math.round(this.metrics.tokensUsed / this.metrics.tasksExecuted)
        : 0,
      tasksPerHour: uptime > 0
        ? Math.round(this.metrics.tasksExecuted / (uptime / 3600000))
        : 0
    };
  }
  
  /**
   * Reset metrics
   */
  reset() {
    this.metrics = {
      tasksExecuted: 0,
      tasksSucceeded: 0,
      tasksFailed: 0,
      totalDuration: 0,
      averageDuration: 0,
      tokensUsed: 0,
      validationsTriggered: 0,
      refinementsPerformed: 0,
      errors: [],
      performance: {
        p50: 0,
        p95: 0,
        p99: 0
      }
    };
    
    this.durations = [];
    this.startTime = Date.now();
  }
  
  /**
   * Flush metrics (for cleanup)
   */
  async flush() {
    // In production, would send metrics to monitoring service
    const summary = this.getSummary();
    this.emit('metricsFlushed', summary);
    return summary;
  }
}