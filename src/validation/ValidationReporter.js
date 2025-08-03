import fs from 'fs/promises';
import path from 'path';
import { EventEmitter } from 'eventemitter3';

/**
 * Validation Reporter - Generates validation reports and metrics
 */
export class ValidationReporter extends EventEmitter {
  constructor(config = {}) {
    super();
    
    // Configuration
    this.config = {
      reportPath: config.reportPath || '.claude/reports/validation',
      formats: config.formats || ['html', 'json', 'markdown'],
      includeMetrics: config.includeMetrics !== false,
      includeCharts: config.includeCharts !== false,
      retentionDays: config.retentionDays || 30,
      ...config
    };
    
    // Report templates
    this.templates = {
      html: this.getHtmlTemplate(),
      markdown: this.getMarkdownTemplate()
    };
    
    // Metrics aggregation
    this.metrics = {
      daily: new Map(),
      weekly: new Map(),
      monthly: new Map()
    };
    
    // Initialize
    this.initialize();
  }
  
  /**
   * Initialize reporter
   */
  async initialize() {
    // Ensure report directory exists
    await fs.mkdir(this.config.reportPath, { recursive: true });
    
    // Load historical metrics
    await this.loadHistoricalMetrics();
  }
  
  /**
   * Generate validation report
   */
  async generateReport(validationResults, options = {}) {
    const reportId = `validation-${Date.now()}`;
    const timestamp = new Date();
    
    const report = {
      id: reportId,
      timestamp: timestamp,
      title: options.title || 'Validation Report',
      summary: this.generateSummary(validationResults),
      details: this.generateDetails(validationResults),
      metrics: options.includeMetrics !== false ? this.generateMetrics(validationResults) : null,
      recommendations: this.generateRecommendations(validationResults),
      metadata: {
        generatedBy: 'ValidationReporter',
        version: '1.0.0',
        options: options
      }
    };
    
    // Generate reports in requested formats
    const formats = options.formats || this.config.formats;
    const generatedReports = {};
    
    for (const format of formats) {
      const reportContent = await this.formatReport(report, format);
      const reportPath = await this.saveReport(reportContent, reportId, format);
      generatedReports[format] = reportPath;
    }
    
    // Update metrics
    this.updateMetrics(validationResults);
    
    this.emit('reportGenerated', {
      id: reportId,
      formats: formats,
      paths: generatedReports
    });
    
    return {
      id: reportId,
      timestamp: timestamp,
      report: report,
      paths: generatedReports
    };
  }
  
  /**
   * Generate summary
   */
  generateSummary(results) {
    const summary = {
      totalValidations: 0,
      passed: 0,
      failed: 0,
      passRate: 0,
      criticalIssues: 0,
      highIssues: 0,
      mediumIssues: 0,
      lowIssues: 0,
      profiles: {},
      duration: 0
    };
    
    // Process results array or single result
    const resultsArray = Array.isArray(results) ? results : [results];
    
    for (const result of resultsArray) {
      summary.totalValidations++;
      
      if (result.passed) {
        summary.passed++;
      } else {
        summary.failed++;
      }
      
      // Count issues by severity
      if (result.analysis?.issues) {
        for (const issue of result.analysis.issues) {
          switch (issue.severity) {
            case 'critical':
              summary.criticalIssues++;
              break;
            case 'high':
              summary.highIssues++;
              break;
            case 'medium':
              summary.mediumIssues++;
              break;
            case 'low':
              summary.lowIssues++;
              break;
          }
        }
      }
      
      // Track by profile
      const profile = result.profile || 'unknown';
      if (!summary.profiles[profile]) {
        summary.profiles[profile] = {
          total: 0,
          passed: 0,
          failed: 0
        };
      }
      
      summary.profiles[profile].total++;
      if (result.passed) {
        summary.profiles[profile].passed++;
      } else {
        summary.profiles[profile].failed++;
      }
      
      // Add duration
      summary.duration += result.duration || 0;
    }
    
    // Calculate pass rate
    summary.passRate = summary.totalValidations > 0
      ? (summary.passed / summary.totalValidations) * 100
      : 0;
    
    return summary;
  }
  
  /**
   * Generate details
   */
  generateDetails(results) {
    const details = {
      validations: [],
      issuesByCategory: {},
      issuesByFile: {},
      topIssues: []
    };
    
    const resultsArray = Array.isArray(results) ? results : [results];
    const issueFrequency = new Map();
    
    for (const result of resultsArray) {
      // Add validation detail
      details.validations.push({
        id: result.id,
        profile: result.profile,
        passed: result.passed,
        duration: result.duration,
        issueCount: result.analysis?.issues?.length || 0,
        criticalCount: result.analysis?.criticalCount || 0
      });
      
      // Process issues
      if (result.analysis?.issues) {
        for (const issue of result.analysis.issues) {
          // By category
          const category = issue.type || 'other';
          if (!details.issuesByCategory[category]) {
            details.issuesByCategory[category] = [];
          }
          details.issuesByCategory[category].push(issue);
          
          // By file
          if (issue.location?.file) {
            const file = issue.location.file;
            if (!details.issuesByFile[file]) {
              details.issuesByFile[file] = [];
            }
            details.issuesByFile[file].push(issue);
          }
          
          // Track frequency
          const issueKey = `${issue.type}_${issue.message}`;
          issueFrequency.set(issueKey, (issueFrequency.get(issueKey) || 0) + 1);
        }
      }
    }
    
    // Get top issues
    details.topIssues = Array.from(issueFrequency.entries())
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([key, count]) => ({
        issue: key,
        occurrences: count
      }));
    
    return details;
  }
  
  /**
   * Generate metrics
   */
  generateMetrics(results) {
    const metrics = {
      performance: {
        averageDuration: 0,
        minDuration: Infinity,
        maxDuration: 0,
        totalDuration: 0
      },
      quality: {
        passRate: 0,
        averageIssuesPerValidation: 0,
        severityDistribution: {
          critical: 0,
          high: 0,
          medium: 0,
          low: 0
        }
      },
      trends: {
        improvementRate: 0,
        issueRecurrence: 0
      }
    };
    
    const resultsArray = Array.isArray(results) ? results : [results];
    let totalIssues = 0;
    
    for (const result of resultsArray) {
      // Performance metrics
      const duration = result.duration || 0;
      metrics.performance.totalDuration += duration;
      metrics.performance.minDuration = Math.min(metrics.performance.minDuration, duration);
      metrics.performance.maxDuration = Math.max(metrics.performance.maxDuration, duration);
      
      // Quality metrics
      if (result.analysis?.issues) {
        totalIssues += result.analysis.issues.length;
        
        for (const issue of result.analysis.issues) {
          metrics.quality.severityDistribution[issue.severity]++;
        }
      }
    }
    
    // Calculate averages
    if (resultsArray.length > 0) {
      metrics.performance.averageDuration = 
        metrics.performance.totalDuration / resultsArray.length;
      
      metrics.quality.averageIssuesPerValidation = 
        totalIssues / resultsArray.length;
      
      const passed = resultsArray.filter(r => r.passed).length;
      metrics.quality.passRate = (passed / resultsArray.length) * 100;
    }
    
    // Fix Infinity for min duration if no results
    if (metrics.performance.minDuration === Infinity) {
      metrics.performance.minDuration = 0;
    }
    
    return metrics;
  }
  
  /**
   * Generate recommendations
   */
  generateRecommendations(results) {
    const recommendations = [];
    const summary = this.generateSummary(results);
    const details = this.generateDetails(results);
    
    // Critical issues recommendation
    if (summary.criticalIssues > 0) {
      recommendations.push({
        priority: 'critical',
        type: 'security',
        message: `Address ${summary.criticalIssues} critical security issues immediately`,
        action: 'Run security-focused refinement'
      });
    }
    
    // Low pass rate recommendation
    if (summary.passRate < 70) {
      recommendations.push({
        priority: 'high',
        type: 'quality',
        message: `Pass rate is only ${summary.passRate.toFixed(1)}% - quality improvement needed`,
        action: 'Implement comprehensive code quality improvements'
      });
    }
    
    // Recurring issues recommendation
    if (details.topIssues.length > 0 && details.topIssues[0].occurrences > 5) {
      recommendations.push({
        priority: 'medium',
        type: 'pattern',
        message: `Recurring issue detected: ${details.topIssues[0].issue}`,
        action: 'Create automated fix for recurring pattern'
      });
    }
    
    // File concentration recommendation
    const fileWithMostIssues = Object.entries(details.issuesByFile)
      .sort(([, a], [, b]) => b.length - a.length)[0];
    
    if (fileWithMostIssues && fileWithMostIssues[1].length > 10) {
      recommendations.push({
        priority: 'medium',
        type: 'refactor',
        message: `File ${fileWithMostIssues[0]} has ${fileWithMostIssues[1].length} issues`,
        action: 'Consider refactoring or splitting this file'
      });
    }
    
    // Performance recommendation
    const avgDuration = this.generateMetrics(results).performance.averageDuration;
    if (avgDuration > 30000) {
      recommendations.push({
        priority: 'low',
        type: 'performance',
        message: `Validation taking average of ${(avgDuration/1000).toFixed(1)}s`,
        action: 'Optimize validation rules or use caching'
      });
    }
    
    return recommendations;
  }
  
  /**
   * Format report
   */
  async formatReport(report, format) {
    switch (format) {
      case 'json':
        return JSON.stringify(report, null, 2);
        
      case 'html':
        return this.formatHtmlReport(report);
        
      case 'markdown':
        return this.formatMarkdownReport(report);
        
      case 'csv':
        return this.formatCsvReport(report);
        
      default:
        throw new Error(`Unsupported format: ${format}`);
    }
  }
  
  /**
   * Format HTML report
   */
  formatHtmlReport(report) {
    const template = this.templates.html;
    
    return template
      .replace('{{title}}', report.title)
      .replace('{{timestamp}}', report.timestamp.toISOString())
      .replace('{{summary}}', this.renderHtmlSummary(report.summary))
      .replace('{{details}}', this.renderHtmlDetails(report.details))
      .replace('{{metrics}}', this.renderHtmlMetrics(report.metrics))
      .replace('{{recommendations}}', this.renderHtmlRecommendations(report.recommendations));
  }
  
  /**
   * Format Markdown report
   */
  formatMarkdownReport(report) {
    let markdown = `# ${report.title}\n\n`;
    markdown += `**Generated:** ${report.timestamp.toISOString()}\n\n`;
    
    // Summary
    markdown += `## Summary\n\n`;
    markdown += `- **Total Validations:** ${report.summary.totalValidations}\n`;
    markdown += `- **Passed:** ${report.summary.passed} (${report.summary.passRate.toFixed(1)}%)\n`;
    markdown += `- **Failed:** ${report.summary.failed}\n`;
    markdown += `- **Critical Issues:** ${report.summary.criticalIssues}\n`;
    markdown += `- **High Issues:** ${report.summary.highIssues}\n`;
    markdown += `- **Medium Issues:** ${report.summary.mediumIssues}\n`;
    markdown += `- **Low Issues:** ${report.summary.lowIssues}\n\n`;
    
    // Profile breakdown
    markdown += `### By Profile\n\n`;
    markdown += `| Profile | Total | Passed | Failed | Pass Rate |\n`;
    markdown += `|---------|-------|--------|--------|----------|\n`;
    
    for (const [profile, data] of Object.entries(report.summary.profiles)) {
      const passRate = data.total > 0 ? ((data.passed / data.total) * 100).toFixed(1) : 0;
      markdown += `| ${profile} | ${data.total} | ${data.passed} | ${data.failed} | ${passRate}% |\n`;
    }
    
    markdown += `\n`;
    
    // Top issues
    if (report.details.topIssues.length > 0) {
      markdown += `## Top Issues\n\n`;
      for (const issue of report.details.topIssues) {
        markdown += `- ${issue.issue} (${issue.occurrences} occurrences)\n`;
      }
      markdown += `\n`;
    }
    
    // Recommendations
    if (report.recommendations.length > 0) {
      markdown += `## Recommendations\n\n`;
      for (const rec of report.recommendations) {
        markdown += `### ${rec.priority.toUpperCase()}: ${rec.type}\n`;
        markdown += `- **Issue:** ${rec.message}\n`;
        markdown += `- **Action:** ${rec.action}\n\n`;
      }
    }
    
    // Metrics
    if (report.metrics) {
      markdown += `## Metrics\n\n`;
      markdown += `### Performance\n`;
      markdown += `- Average Duration: ${(report.metrics.performance.averageDuration/1000).toFixed(2)}s\n`;
      markdown += `- Min Duration: ${(report.metrics.performance.minDuration/1000).toFixed(2)}s\n`;
      markdown += `- Max Duration: ${(report.metrics.performance.maxDuration/1000).toFixed(2)}s\n\n`;
      
      markdown += `### Quality\n`;
      markdown += `- Pass Rate: ${report.metrics.quality.passRate.toFixed(1)}%\n`;
      markdown += `- Average Issues per Validation: ${report.metrics.quality.averageIssuesPerValidation.toFixed(1)}\n`;
    }
    
    return markdown;
  }
  
  /**
   * Format CSV report
   */
  formatCsvReport(report) {
    const rows = [];
    
    // Header
    rows.push(['Validation ID', 'Profile', 'Passed', 'Duration (ms)', 'Issue Count', 'Critical Count']);
    
    // Data rows
    for (const validation of report.details.validations) {
      rows.push([
        validation.id,
        validation.profile,
        validation.passed ? 'Yes' : 'No',
        validation.duration,
        validation.issueCount,
        validation.criticalCount
      ]);
    }
    
    // Convert to CSV
    return rows.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
  }
  
  /**
   * Save report
   */
  async saveReport(content, reportId, format) {
    const filename = `${reportId}.${format}`;
    const filepath = path.join(this.config.reportPath, filename);
    
    await fs.writeFile(filepath, content, 'utf8');
    
    return filepath;
  }
  
  /**
   * Update metrics
   */
  updateMetrics(results) {
    const date = new Date();
    const dayKey = date.toISOString().split('T')[0];
    const weekKey = `${date.getFullYear()}-W${this.getWeekNumber(date)}`;
    const monthKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
    
    // Update daily metrics
    if (!this.metrics.daily.has(dayKey)) {
      this.metrics.daily.set(dayKey, {
        validations: 0,
        passed: 0,
        failed: 0,
        issues: 0
      });
    }
    
    const daily = this.metrics.daily.get(dayKey);
    const summary = this.generateSummary(results);
    
    daily.validations += summary.totalValidations;
    daily.passed += summary.passed;
    daily.failed += summary.failed;
    daily.issues += summary.criticalIssues + summary.highIssues + 
                     summary.mediumIssues + summary.lowIssues;
    
    // Similar updates for weekly and monthly
    // ... (abbreviated for brevity)
  }
  
  /**
   * Get week number
   */
  getWeekNumber(date) {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  }
  
  /**
   * Load historical metrics
   */
  async loadHistoricalMetrics() {
    try {
      const metricsPath = path.join(this.config.reportPath, 'metrics.json');
      const data = await fs.readFile(metricsPath, 'utf8');
      const metrics = JSON.parse(data);
      
      // Restore metrics
      this.metrics.daily = new Map(Object.entries(metrics.daily || {}));
      this.metrics.weekly = new Map(Object.entries(metrics.weekly || {}));
      this.metrics.monthly = new Map(Object.entries(metrics.monthly || {}));
      
    } catch (error) {
      // No historical metrics or error reading
      console.log('No historical metrics found or error loading:', error.message);
    }
  }
  
  /**
   * Save metrics
   */
  async saveMetrics() {
    const metrics = {
      daily: Object.fromEntries(this.metrics.daily),
      weekly: Object.fromEntries(this.metrics.weekly),
      monthly: Object.fromEntries(this.metrics.monthly)
    };
    
    const metricsPath = path.join(this.config.reportPath, 'metrics.json');
    await fs.writeFile(metricsPath, JSON.stringify(metrics, null, 2), 'utf8');
  }
  
  /**
   * Get HTML template
   */
  getHtmlTemplate() {
    return `<!DOCTYPE html>
<html>
<head>
  <title>{{title}}</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; }
    h1 { color: #333; }
    .summary { background: #f5f5f5; padding: 15px; border-radius: 5px; }
    .metric { display: inline-block; margin: 10px; padding: 10px; background: white; border: 1px solid #ddd; }
    .passed { color: green; }
    .failed { color: red; }
    .critical { color: darkred; font-weight: bold; }
    .high { color: red; }
    .medium { color: orange; }
    .low { color: gray; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
    th { background: #f5f5f5; }
    .recommendation { margin: 10px 0; padding: 10px; border-left: 4px solid #007bff; background: #f0f8ff; }
  </style>
</head>
<body>
  <h1>{{title}}</h1>
  <p>Generated: {{timestamp}}</p>
  
  <div class="summary">
    <h2>Summary</h2>
    {{summary}}
  </div>
  
  <div class="details">
    <h2>Details</h2>
    {{details}}
  </div>
  
  <div class="metrics">
    <h2>Metrics</h2>
    {{metrics}}
  </div>
  
  <div class="recommendations">
    <h2>Recommendations</h2>
    {{recommendations}}
  </div>
</body>
</html>`;
  }
  
  /**
   * Get Markdown template
   */
  getMarkdownTemplate() {
    return `# {{title}}

**Generated:** {{timestamp}}

## Summary
{{summary}}

## Details
{{details}}

## Metrics
{{metrics}}

## Recommendations
{{recommendations}}
`;
  }
  
  /**
   * Render HTML summary
   */
  renderHtmlSummary(summary) {
    return `
      <div class="metric">
        <strong>Total:</strong> ${summary.totalValidations}
      </div>
      <div class="metric passed">
        <strong>Passed:</strong> ${summary.passed}
      </div>
      <div class="metric failed">
        <strong>Failed:</strong> ${summary.failed}
      </div>
      <div class="metric">
        <strong>Pass Rate:</strong> ${summary.passRate.toFixed(1)}%
      </div>
      <div class="metric critical">
        <strong>Critical:</strong> ${summary.criticalIssues}
      </div>
      <div class="metric high">
        <strong>High:</strong> ${summary.highIssues}
      </div>
      <div class="metric medium">
        <strong>Medium:</strong> ${summary.mediumIssues}
      </div>
      <div class="metric low">
        <strong>Low:</strong> ${summary.lowIssues}
      </div>
    `;
  }
  
  /**
   * Render HTML details
   */
  renderHtmlDetails(details) {
    let html = '<table><tr><th>Validation</th><th>Profile</th><th>Status</th><th>Issues</th></tr>';
    
    for (const validation of details.validations) {
      html += `<tr>
        <td>${validation.id}</td>
        <td>${validation.profile}</td>
        <td class="${validation.passed ? 'passed' : 'failed'}">${validation.passed ? 'Passed' : 'Failed'}</td>
        <td>${validation.issueCount}</td>
      </tr>`;
    }
    
    html += '</table>';
    return html;
  }
  
  /**
   * Render HTML metrics
   */
  renderHtmlMetrics(metrics) {
    if (!metrics) return '<p>No metrics available</p>';
    
    return `
      <h3>Performance</h3>
      <p>Average Duration: ${(metrics.performance.averageDuration/1000).toFixed(2)}s</p>
      
      <h3>Quality</h3>
      <p>Pass Rate: ${metrics.quality.passRate.toFixed(1)}%</p>
      <p>Average Issues: ${metrics.quality.averageIssuesPerValidation.toFixed(1)}</p>
    `;
  }
  
  /**
   * Render HTML recommendations
   */
  renderHtmlRecommendations(recommendations) {
    if (!recommendations || recommendations.length === 0) {
      return '<p>No recommendations at this time.</p>';
    }
    
    let html = '';
    for (const rec of recommendations) {
      html += `<div class="recommendation">
        <strong>${rec.priority.toUpperCase()} - ${rec.type}</strong><br>
        ${rec.message}<br>
        <em>Action: ${rec.action}</em>
      </div>`;
    }
    
    return html;
  }
  
  /**
   * Get aggregated metrics
   */
  getAggregatedMetrics(period = 'daily') {
    const metrics = this.metrics[period];
    if (!metrics) return null;
    
    const aggregated = {
      totalValidations: 0,
      totalPassed: 0,
      totalFailed: 0,
      totalIssues: 0,
      averagePassRate: 0,
      periods: []
    };
    
    for (const [key, data] of metrics) {
      aggregated.totalValidations += data.validations;
      aggregated.totalPassed += data.passed;
      aggregated.totalFailed += data.failed;
      aggregated.totalIssues += data.issues;
      
      aggregated.periods.push({
        period: key,
        ...data,
        passRate: data.validations > 0 ? (data.passed / data.validations) * 100 : 0
      });
    }
    
    aggregated.averagePassRate = aggregated.totalValidations > 0
      ? (aggregated.totalPassed / aggregated.totalValidations) * 100
      : 0;
    
    return aggregated;
  }
}

export default ValidationReporter;