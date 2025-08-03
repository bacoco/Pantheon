import { EventEmitter } from 'eventemitter3';
import { v4 as uuidv4 } from 'uuid';
import { getRegistry } from '../agents/AgentRegistry.js';

/**
 * Feedback Processor - Processes validation feedback and manages refinements
 */
export class FeedbackProcessor extends EventEmitter {
  constructor(config = {}) {
    super();
    
    // Configuration
    this.config = {
      autoRefine: config.autoRefine !== false,
      maxRefinementCycles: config.maxRefinementCycles || 3,
      refinementThreshold: config.refinementThreshold || 0.8,
      priorityWeights: {
        critical: 1.0,
        high: 0.7,
        medium: 0.4,
        low: 0.1
      },
      ...config
    };
    
    // State
    this.feedbackQueue = [];
    this.refinementHistory = new Map();
    this.activeRefinements = new Map();
    this.learningData = new Map();
    
    // Statistics
    this.statistics = {
      totalFeedback: 0,
      processedFeedback: 0,
      refinementCycles: 0,
      successfulRefinements: 0,
      failedRefinements: 0,
      averageImprovement: 0
    };
    
    // Agent registry
    this.agentRegistry = getRegistry();
  }
  
  /**
   * Process validation feedback
   */
  async processFeedback(validationResult, options = {}) {
    const feedbackId = uuidv4();
    const startTime = Date.now();
    
    this.statistics.totalFeedback++;
    
    const feedback = {
      id: feedbackId,
      validationId: validationResult.id,
      timestamp: new Date(),
      issues: validationResult.analysis?.issues || [],
      suggestions: validationResult.analysis?.suggestions || [],
      profile: validationResult.profile,
      passed: validationResult.passed,
      options: options
    };
    
    this.emit('feedbackReceived', {
      id: feedbackId,
      issueCount: feedback.issues.length
    });
    
    // Analyze feedback
    const analysis = await this.analyzeFeedback(feedback);
    
    // Determine if refinement is needed
    if (analysis.requiresRefinement && (this.config.autoRefine || options.forceRefine)) {
      // Create refinement plan
      const refinementPlan = await this.createRefinementPlan(analysis);
      
      // Execute refinement if auto-refine is enabled
      if (this.config.autoRefine) {
        const refinementResult = await this.executeRefinement(refinementPlan);
        
        // Store learning data
        this.updateLearningData(feedback, refinementResult);
        
        return {
          feedbackId: feedbackId,
          analysis: analysis,
          refinementPlan: refinementPlan,
          refinementResult: refinementResult,
          duration: Date.now() - startTime
        };
      }
      
      // Return plan for manual refinement
      return {
        feedbackId: feedbackId,
        analysis: analysis,
        refinementPlan: refinementPlan,
        requiresManualAction: true,
        duration: Date.now() - startTime
      };
    }
    
    this.statistics.processedFeedback++;
    
    return {
      feedbackId: feedbackId,
      analysis: analysis,
      requiresRefinement: false,
      duration: Date.now() - startTime
    };
  }
  
  /**
   * Analyze feedback to determine actions
   */
  async analyzeFeedback(feedback) {
    const analysis = {
      requiresRefinement: false,
      priority: 'low',
      categories: {},
      patterns: [],
      actionableItems: [],
      estimatedEffort: 0,
      confidence: 0
    };
    
    // Categorize issues
    for (const issue of feedback.issues) {
      const category = this.categorizeIssue(issue);
      
      if (!analysis.categories[category]) {
        analysis.categories[category] = {
          count: 0,
          severity: issue.severity,
          issues: []
        };
      }
      
      analysis.categories[category].count++;
      analysis.categories[category].issues.push(issue);
      
      // Update priority based on severity
      if (issue.severity === 'critical' || issue.severity === 'high') {
        analysis.requiresRefinement = true;
        analysis.priority = this.getHigherPriority(analysis.priority, issue.severity);
      }
    }
    
    // Identify patterns
    analysis.patterns = this.identifyPatterns(feedback.issues);
    
    // Create actionable items
    for (const [category, data] of Object.entries(analysis.categories)) {
      if (data.count > 0) {
        const action = await this.createActionableItem(category, data);
        analysis.actionableItems.push(action);
      }
    }
    
    // Calculate estimated effort
    analysis.estimatedEffort = this.calculateEffort(analysis.actionableItems);
    
    // Calculate confidence score
    analysis.confidence = this.calculateConfidence(analysis);
    
    return analysis;
  }
  
  /**
   * Categorize issue
   */
  categorizeIssue(issue) {
    const categories = {
      syntax: ['syntax', 'parse', 'compile'],
      logic: ['logic', 'algorithm', 'flow'],
      security: ['security', 'vulnerability', 'auth', 'injection'],
      performance: ['performance', 'slow', 'memory', 'optimization'],
      style: ['style', 'format', 'naming', 'convention'],
      structure: ['structure', 'architecture', 'pattern', 'design'],
      testing: ['test', 'coverage', 'assertion', 'mock'],
      documentation: ['documentation', 'comment', 'readme', 'api']
    };
    
    const issueText = (issue.message + ' ' + issue.type).toLowerCase();
    
    for (const [category, keywords] of Object.entries(categories)) {
      if (keywords.some(keyword => issueText.includes(keyword))) {
        return category;
      }
    }
    
    return 'other';
  }
  
  /**
   * Identify patterns in issues
   */
  identifyPatterns(issues) {
    const patterns = [];
    const locationGroups = {};
    const messageGroups = {};
    
    // Group by location
    for (const issue of issues) {
      if (issue.location) {
        const key = issue.location.file || issue.location.line || 'unknown';
        if (!locationGroups[key]) {
          locationGroups[key] = [];
        }
        locationGroups[key].push(issue);
      }
    }
    
    // Group by similar messages
    for (const issue of issues) {
      const key = this.normalizeMessage(issue.message);
      if (!messageGroups[key]) {
        messageGroups[key] = [];
      }
      messageGroups[key].push(issue);
    }
    
    // Identify location patterns
    for (const [location, locationIssues] of Object.entries(locationGroups)) {
      if (locationIssues.length >= 2) {
        patterns.push({
          type: 'location_cluster',
          location: location,
          count: locationIssues.length,
          description: `Multiple issues in ${location}`
        });
      }
    }
    
    // Identify message patterns
    for (const [message, messageIssues] of Object.entries(messageGroups)) {
      if (messageIssues.length >= 3) {
        patterns.push({
          type: 'repeated_issue',
          message: message,
          count: messageIssues.length,
          description: `Repeated issue: ${message}`
        });
      }
    }
    
    return patterns;
  }
  
  /**
   * Normalize message for pattern matching
   */
  normalizeMessage(message) {
    return message
      .toLowerCase()
      .replace(/[0-9]+/g, 'N')  // Replace numbers with N
      .replace(/['"`]/g, '')     // Remove quotes
      .replace(/\s+/g, ' ')      // Normalize whitespace
      .trim();
  }
  
  /**
   * Create actionable item
   */
  async createActionableItem(category, data) {
    const actionTemplates = {
      syntax: {
        action: 'fix_syntax_errors',
        description: 'Fix syntax errors and formatting issues',
        agent: 'claude-builder'
      },
      logic: {
        action: 'refactor_logic',
        description: 'Refactor logic and improve algorithms',
        agent: 'claude-architect'
      },
      security: {
        action: 'patch_security',
        description: 'Apply security patches and fixes',
        agent: 'claude-builder'
      },
      performance: {
        action: 'optimize_performance',
        description: 'Optimize performance bottlenecks',
        agent: 'claude-architect'
      },
      style: {
        action: 'format_code',
        description: 'Apply code formatting and style fixes',
        agent: 'claude-builder'
      },
      structure: {
        action: 'refactor_architecture',
        description: 'Refactor architecture and design patterns',
        agent: 'claude-architect'
      },
      testing: {
        action: 'improve_tests',
        description: 'Improve test coverage and quality',
        agent: 'claude-builder'
      },
      documentation: {
        action: 'update_documentation',
        description: 'Update and improve documentation',
        agent: 'claude-documenter'
      }
    };
    
    const template = actionTemplates[category] || {
      action: 'general_improvement',
      description: 'General code improvements',
      agent: 'claude-builder'
    };
    
    return {
      category: category,
      action: template.action,
      description: template.description,
      agent: template.agent,
      priority: data.severity,
      issueCount: data.count,
      issues: data.issues,
      estimatedEffort: this.estimateActionEffort(category, data.count)
    };
  }
  
  /**
   * Estimate action effort
   */
  estimateActionEffort(category, issueCount) {
    const baseEffort = {
      syntax: 5,
      logic: 20,
      security: 30,
      performance: 25,
      style: 10,
      structure: 40,
      testing: 15,
      documentation: 10,
      other: 15
    };
    
    const base = baseEffort[category] || 15;
    return base + (issueCount * 2); // Additional time per issue
  }
  
  /**
   * Calculate total effort
   */
  calculateEffort(actionableItems) {
    return actionableItems.reduce((total, item) => total + item.estimatedEffort, 0);
  }
  
  /**
   * Calculate confidence score
   */
  calculateConfidence(analysis) {
    let confidence = 0.5; // Base confidence
    
    // Increase confidence based on clear patterns
    if (analysis.patterns.length > 0) {
      confidence += 0.1 * Math.min(analysis.patterns.length, 3);
    }
    
    // Increase confidence based on actionable items
    if (analysis.actionableItems.length > 0) {
      confidence += 0.1 * Math.min(analysis.actionableItems.length, 2);
    }
    
    // Decrease confidence for complex issues
    if (analysis.categories.structure || analysis.categories.logic) {
      confidence -= 0.1;
    }
    
    return Math.max(0, Math.min(1, confidence));
  }
  
  /**
   * Create refinement plan
   */
  async createRefinementPlan(analysis) {
    const plan = {
      id: uuidv4(),
      timestamp: new Date(),
      priority: analysis.priority,
      estimatedEffort: analysis.estimatedEffort,
      confidence: analysis.confidence,
      stages: [],
      dependencies: []
    };
    
    // Sort actionable items by priority
    const sortedActions = analysis.actionableItems.sort((a, b) => {
      const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
    
    // Create refinement stages
    for (const action of sortedActions) {
      const stage = {
        id: uuidv4(),
        action: action.action,
        description: action.description,
        agent: action.agent,
        category: action.category,
        priority: action.priority,
        issues: action.issues,
        estimatedEffort: action.estimatedEffort,
        dependencies: []
      };
      
      // Add dependencies based on category
      if (action.category === 'structure') {
        // Structure changes should happen first
        stage.dependencies = [];
      } else if (action.category === 'logic') {
        // Logic changes depend on structure
        const structureStage = plan.stages.find(s => s.category === 'structure');
        if (structureStage) {
          stage.dependencies.push(structureStage.id);
        }
      } else if (action.category === 'testing') {
        // Testing depends on logic being fixed
        const logicStage = plan.stages.find(s => s.category === 'logic');
        if (logicStage) {
          stage.dependencies.push(logicStage.id);
        }
      }
      
      plan.stages.push(stage);
    }
    
    return plan;
  }
  
  /**
   * Execute refinement plan
   */
  async executeRefinement(plan) {
    const refinementId = plan.id;
    const startTime = Date.now();
    
    this.activeRefinements.set(refinementId, {
      plan: plan,
      status: 'running',
      startTime: startTime,
      completedStages: [],
      results: []
    });
    
    this.emit('refinementStarted', {
      id: refinementId,
      stageCount: plan.stages.length
    });
    
    this.statistics.refinementCycles++;
    
    const results = [];
    const completedStages = new Set();
    
    try {
      // Execute stages in dependency order
      while (completedStages.size < plan.stages.length) {
        const readyStages = plan.stages.filter(stage => {
          if (completedStages.has(stage.id)) return false;
          
          // Check if all dependencies are completed
          return stage.dependencies.every(dep => completedStages.has(dep));
        });
        
        if (readyStages.length === 0) {
          throw new Error('Circular dependency or no ready stages');
        }
        
        // Execute ready stages in parallel (up to a limit)
        const batch = readyStages.slice(0, 3);
        const batchResults = await Promise.all(
          batch.map(stage => this.executeRefinementStage(stage))
        );
        
        for (let i = 0; i < batch.length; i++) {
          const stage = batch[i];
          const result = batchResults[i];
          
          results.push({
            stageId: stage.id,
            action: stage.action,
            success: result.success,
            result: result
          });
          
          completedStages.add(stage.id);
          
          this.emit('refinementStageCompleted', {
            refinementId: refinementId,
            stageId: stage.id,
            success: result.success
          });
        }
      }
      
      const duration = Date.now() - startTime;
      
      // Calculate improvement score
      const improvementScore = this.calculateImprovement(results);
      
      this.statistics.successfulRefinements++;
      this.updateAverageImprovement(improvementScore);
      
      const refinementResult = {
        id: refinementId,
        success: true,
        stages: results,
        duration: duration,
        improvementScore: improvementScore
      };
      
      // Store in history
      this.refinementHistory.set(refinementId, refinementResult);
      
      this.emit('refinementCompleted', {
        id: refinementId,
        success: true,
        improvementScore: improvementScore
      });
      
      return refinementResult;
      
    } catch (error) {
      this.statistics.failedRefinements++;
      
      this.emit('refinementFailed', {
        id: refinementId,
        error: error.message
      });
      
      throw error;
      
    } finally {
      this.activeRefinements.delete(refinementId);
    }
  }
  
  /**
   * Execute single refinement stage
   */
  async executeRefinementStage(stage) {
    // Get agent
    const agent = await this.agentRegistry.getAgentByName(stage.agent);
    
    if (!agent) {
      throw new Error(`Agent ${stage.agent} not found for refinement`);
    }
    
    // Prepare refinement task
    const task = {
      type: 'refinement',
      data: {
        action: stage.action,
        description: stage.description,
        issues: stage.issues,
        category: stage.category,
        refinementContext: {
          automatic: true,
          priority: stage.priority
        }
      }
    };
    
    // Execute refinement
    const result = await agent.execute(task);
    
    return {
      success: result.success !== false,
      action: stage.action,
      result: result,
      agent: stage.agent
    };
  }
  
  /**
   * Calculate improvement score
   */
  calculateImprovement(results) {
    const successCount = results.filter(r => r.success).length;
    const totalCount = results.length;
    
    if (totalCount === 0) return 0;
    
    return successCount / totalCount;
  }
  
  /**
   * Update average improvement
   */
  updateAverageImprovement(score) {
    const total = this.statistics.successfulRefinements;
    this.statistics.averageImprovement = 
      (this.statistics.averageImprovement * (total - 1) + score) / total;
  }
  
  /**
   * Update learning data
   */
  updateLearningData(feedback, refinementResult) {
    const pattern = this.extractPattern(feedback);
    
    if (!this.learningData.has(pattern)) {
      this.learningData.set(pattern, {
        occurrences: 0,
        successfulRefinements: 0,
        averageImprovement: 0,
        bestStrategy: null
      });
    }
    
    const data = this.learningData.get(pattern);
    data.occurrences++;
    
    if (refinementResult.success) {
      data.successfulRefinements++;
      data.averageImprovement = 
        (data.averageImprovement * (data.successfulRefinements - 1) + 
         refinementResult.improvementScore) / data.successfulRefinements;
      
      // Update best strategy if this one performed better
      if (!data.bestStrategy || refinementResult.improvementScore > data.bestStrategy.score) {
        data.bestStrategy = {
          actions: refinementResult.stages.map(s => s.action),
          score: refinementResult.improvementScore
        };
      }
    }
  }
  
  /**
   * Extract pattern from feedback
   */
  extractPattern(feedback) {
    const categories = {};
    
    for (const issue of feedback.issues) {
      const category = this.categorizeIssue(issue);
      categories[category] = (categories[category] || 0) + 1;
    }
    
    // Create pattern signature
    return Object.entries(categories)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([cat, count]) => `${cat}:${count}`)
      .join(',');
  }
  
  /**
   * Get learning insights
   */
  getLearningInsights() {
    const insights = {
      totalPatterns: this.learningData.size,
      mostCommonPatterns: [],
      bestStrategies: [],
      improvementTrends: []
    };
    
    // Find most common patterns
    const patterns = Array.from(this.learningData.entries())
      .sort(([, a], [, b]) => b.occurrences - a.occurrences)
      .slice(0, 5);
    
    insights.mostCommonPatterns = patterns.map(([pattern, data]) => ({
      pattern: pattern,
      occurrences: data.occurrences,
      successRate: data.successfulRefinements / data.occurrences
    }));
    
    // Find best strategies
    insights.bestStrategies = patterns
      .filter(([, data]) => data.bestStrategy)
      .map(([pattern, data]) => ({
        pattern: pattern,
        strategy: data.bestStrategy,
        improvement: data.averageImprovement
      }));
    
    return insights;
  }
  
  /**
   * Get higher priority
   */
  getHigherPriority(current, candidate) {
    const order = { critical: 0, high: 1, medium: 2, low: 3 };
    return order[candidate] < order[current] ? candidate : current;
  }
  
  /**
   * Get statistics
   */
  getStatistics() {
    return {
      ...this.statistics,
      activeRefinements: this.activeRefinements.size,
      queueLength: this.feedbackQueue.length,
      learningPatterns: this.learningData.size,
      historySize: this.refinementHistory.size
    };
  }
}

export default FeedbackProcessor;