import { EventEmitter } from 'eventemitter3';
import { v4 as uuidv4 } from 'uuid';

/**
 * Execution Patterns - Advanced workflow execution strategies
 */
export class ExecutionPatterns extends EventEmitter {
  constructor() {
    super();
    
    // Pattern definitions
    this.patterns = {
      sequential: this.sequentialPattern.bind(this),
      parallel: this.parallelPattern.bind(this),
      conditional: this.conditionalPattern.bind(this),
      pipeline: this.pipelinePattern.bind(this),
      fanOut: this.fanOutPattern.bind(this),
      fanIn: this.fanInPattern.bind(this),
      raceCondition: this.raceConditionPattern.bind(this),
      retry: this.retryPattern.bind(this),
      circuitBreaker: this.circuitBreakerPattern.bind(this),
      saga: this.sagaPattern.bind(this)
    };
    
    // Execution state
    this.activeExecutions = new Map();
    this.executionHistory = [];
    this.circuitBreakers = new Map();
  }
  
  /**
   * Sequential Pattern - Execute tasks one after another
   */
  async sequentialPattern(tasks, context = {}) {
    const executionId = uuidv4();
    const startTime = Date.now();
    
    this.emit('patternStarted', { 
      pattern: 'sequential', 
      executionId, 
      taskCount: tasks.length 
    });
    
    const results = [];
    let lastResult = null;
    
    try {
      for (let i = 0; i < tasks.length; i++) {
        const task = tasks[i];
        
        this.emit('taskStarted', {
          pattern: 'sequential',
          executionId,
          taskIndex: i,
          taskName: task.name
        });
        
        // Pass previous result as input to next task
        const input = {
          ...context,
          previousResult: lastResult,
          sequenceIndex: i
        };
        
        const result = await this.executeTask(task, input);
        results.push(result);
        lastResult = result;
        
        this.emit('taskCompleted', {
          pattern: 'sequential',
          executionId,
          taskIndex: i,
          taskName: task.name,
          result
        });
        
        // Check for early termination
        if (task.terminateOnFailure && !result.success) {
          throw new Error(`Sequential execution terminated at task ${i}: ${task.name}`);
        }
      }
      
      const duration = Date.now() - startTime;
      
      this.emit('patternCompleted', {
        pattern: 'sequential',
        executionId,
        duration,
        results
      });
      
      return {
        success: true,
        pattern: 'sequential',
        results,
        duration
      };
      
    } catch (error) {
      this.emit('patternFailed', {
        pattern: 'sequential',
        executionId,
        error: error.message,
        partialResults: results
      });
      
      throw error;
    }
  }
  
  /**
   * Parallel Pattern - Execute multiple tasks simultaneously
   */
  async parallelPattern(tasks, context = {}, options = {}) {
    const executionId = uuidv4();
    const startTime = Date.now();
    const maxConcurrency = options.maxConcurrency || tasks.length;
    
    this.emit('patternStarted', {
      pattern: 'parallel',
      executionId,
      taskCount: tasks.length,
      maxConcurrency
    });
    
    try {
      const results = [];
      const executing = new Map();
      const queue = [...tasks];
      let completedCount = 0;
      
      while (queue.length > 0 || executing.size > 0) {
        // Start new executions up to concurrency limit
        while (queue.length > 0 && executing.size < maxConcurrency) {
          const task = queue.shift();
          const taskId = uuidv4();
          
          this.emit('taskStarted', {
            pattern: 'parallel',
            executionId,
            taskId,
            taskName: task.name
          });
          
          const execution = this.executeTask(task, context)
            .then(result => {
              completedCount++;
              
              this.emit('taskCompleted', {
                pattern: 'parallel',
                executionId,
                taskId,
                taskName: task.name,
                result,
                progress: (completedCount / tasks.length) * 100
              });
              
              return { task, result };
            })
            .catch(error => {
              completedCount++;
              
              this.emit('taskFailed', {
                pattern: 'parallel',
                executionId,
                taskId,
                taskName: task.name,
                error: error.message
              });
              
              if (options.failFast) {
                throw error;
              }
              
              return { task, error };
            });
          
          executing.set(taskId, execution);
          
          // Clean up completed execution
          execution.finally(() => {
            executing.delete(taskId);
          });
        }
        
        // Wait for at least one execution to complete
        if (executing.size > 0) {
          const completed = await Promise.race(Array.from(executing.values()));
          results.push(completed);
        }
      }
      
      const duration = Date.now() - startTime;
      
      this.emit('patternCompleted', {
        pattern: 'parallel',
        executionId,
        duration,
        results
      });
      
      return {
        success: true,
        pattern: 'parallel',
        results,
        duration
      };
      
    } catch (error) {
      this.emit('patternFailed', {
        pattern: 'parallel',
        executionId,
        error: error.message
      });
      
      throw error;
    }
  }
  
  /**
   * Conditional Pattern - Execute tasks based on conditions
   */
  async conditionalPattern(definition, context = {}) {
    const executionId = uuidv4();
    const startTime = Date.now();
    
    this.emit('patternStarted', {
      pattern: 'conditional',
      executionId
    });
    
    const results = [];
    
    try {
      // Evaluate initial condition
      const conditionResult = await this.evaluateCondition(definition.condition, context);
      
      this.emit('conditionEvaluated', {
        pattern: 'conditional',
        executionId,
        condition: definition.condition,
        result: conditionResult
      });
      
      // Choose branch based on condition
      const branch = conditionResult ? definition.trueBranch : definition.falseBranch;
      
      if (branch) {
        // Execute branch tasks
        for (const task of branch) {
          const result = await this.executeTask(task, context);
          results.push(result);
          
          // Update context for next task
          if (task.updateContext) {
            context = { ...context, ...result };
          }
        }
      }
      
      // Execute always tasks if defined
      if (definition.always) {
        for (const task of definition.always) {
          const result = await this.executeTask(task, context);
          results.push(result);
        }
      }
      
      const duration = Date.now() - startTime;
      
      this.emit('patternCompleted', {
        pattern: 'conditional',
        executionId,
        branch: conditionResult ? 'true' : 'false',
        duration,
        results
      });
      
      return {
        success: true,
        pattern: 'conditional',
        branch: conditionResult ? 'true' : 'false',
        results,
        duration
      };
      
    } catch (error) {
      this.emit('patternFailed', {
        pattern: 'conditional',
        executionId,
        error: error.message
      });
      
      throw error;
    }
  }
  
  /**
   * Pipeline Pattern - Transform data through a series of stages
   */
  async pipelinePattern(stages, initialData, context = {}) {
    const executionId = uuidv4();
    const startTime = Date.now();
    
    this.emit('patternStarted', {
      pattern: 'pipeline',
      executionId,
      stageCount: stages.length
    });
    
    let data = initialData;
    const stageResults = [];
    
    try {
      for (let i = 0; i < stages.length; i++) {
        const stage = stages[i];
        
        this.emit('stageStarted', {
          pattern: 'pipeline',
          executionId,
          stageIndex: i,
          stageName: stage.name
        });
        
        // Transform data through stage
        data = await this.executeStage(stage, data, context);
        
        stageResults.push({
          stage: stage.name,
          output: data
        });
        
        this.emit('stageCompleted', {
          pattern: 'pipeline',
          executionId,
          stageIndex: i,
          stageName: stage.name,
          outputSize: JSON.stringify(data).length
        });
        
        // Check for pipeline termination
        if (stage.terminateOnEmpty && (!data || Object.keys(data).length === 0)) {
          break;
        }
      }
      
      const duration = Date.now() - startTime;
      
      this.emit('patternCompleted', {
        pattern: 'pipeline',
        executionId,
        duration,
        finalOutput: data
      });
      
      return {
        success: true,
        pattern: 'pipeline',
        output: data,
        stageResults,
        duration
      };
      
    } catch (error) {
      this.emit('patternFailed', {
        pattern: 'pipeline',
        executionId,
        error: error.message
      });
      
      throw error;
    }
  }
  
  /**
   * Fan-Out Pattern - Distribute work to multiple workers
   */
  async fanOutPattern(distributor, workers, data, context = {}) {
    const executionId = uuidv4();
    const startTime = Date.now();
    
    this.emit('patternStarted', {
      pattern: 'fanOut',
      executionId,
      workerCount: workers.length
    });
    
    try {
      // Distribute data using distributor function
      const distributions = await distributor(data, workers.length);
      
      this.emit('dataDistributed', {
        pattern: 'fanOut',
        executionId,
        distributions: distributions.length
      });
      
      // Execute workers in parallel with their data portions
      const workerPromises = workers.map((worker, index) => {
        const workerData = distributions[index] || [];
        
        return this.executeTask(worker, {
          ...context,
          data: workerData,
          workerIndex: index
        });
      });
      
      const results = await Promise.all(workerPromises);
      
      const duration = Date.now() - startTime;
      
      this.emit('patternCompleted', {
        pattern: 'fanOut',
        executionId,
        duration,
        results
      });
      
      return {
        success: true,
        pattern: 'fanOut',
        results,
        duration
      };
      
    } catch (error) {
      this.emit('patternFailed', {
        pattern: 'fanOut',
        executionId,
        error: error.message
      });
      
      throw error;
    }
  }
  
  /**
   * Fan-In Pattern - Aggregate results from multiple sources
   */
  async fanInPattern(sources, aggregator, context = {}) {
    const executionId = uuidv4();
    const startTime = Date.now();
    
    this.emit('patternStarted', {
      pattern: 'fanIn',
      executionId,
      sourceCount: sources.length
    });
    
    try {
      // Collect data from all sources
      const sourcePromises = sources.map(source => 
        this.executeTask(source, context)
      );
      
      const sourceResults = await Promise.all(sourcePromises);
      
      this.emit('dataCollected', {
        pattern: 'fanIn',
        executionId,
        resultCount: sourceResults.length
      });
      
      // Aggregate results
      const aggregatedResult = await aggregator(sourceResults, context);
      
      const duration = Date.now() - startTime;
      
      this.emit('patternCompleted', {
        pattern: 'fanIn',
        executionId,
        duration,
        aggregatedResult
      });
      
      return {
        success: true,
        pattern: 'fanIn',
        sourceResults,
        aggregatedResult,
        duration
      };
      
    } catch (error) {
      this.emit('patternFailed', {
        pattern: 'fanIn',
        executionId,
        error: error.message
      });
      
      throw error;
    }
  }
  
  /**
   * Race Condition Pattern - First successful result wins
   */
  async raceConditionPattern(competitors, context = {}) {
    const executionId = uuidv4();
    const startTime = Date.now();
    
    this.emit('patternStarted', {
      pattern: 'race',
      executionId,
      competitorCount: competitors.length
    });
    
    try {
      // Start all competitors
      const competitorPromises = competitors.map((competitor, index) => {
        return this.executeTask(competitor, context)
          .then(result => ({ winner: index, result }));
      });
      
      // Wait for first successful completion
      const winner = await Promise.race(competitorPromises);
      
      const duration = Date.now() - startTime;
      
      this.emit('patternCompleted', {
        pattern: 'race',
        executionId,
        winner: winner.winner,
        winnerName: competitors[winner.winner].name,
        duration
      });
      
      // Cancel other competitors if possible
      this.cancelPendingTasks(competitorPromises, winner);
      
      return {
        success: true,
        pattern: 'race',
        winner: winner.winner,
        result: winner.result,
        duration
      };
      
    } catch (error) {
      this.emit('patternFailed', {
        pattern: 'race',
        executionId,
        error: error.message
      });
      
      throw error;
    }
  }
  
  /**
   * Retry Pattern - Retry failed tasks with backoff
   */
  async retryPattern(task, context = {}, options = {}) {
    const executionId = uuidv4();
    const maxRetries = options.maxRetries || 3;
    const backoffMultiplier = options.backoffMultiplier || 2;
    const initialDelay = options.initialDelay || 1000;
    
    this.emit('patternStarted', {
      pattern: 'retry',
      executionId,
      maxRetries
    });
    
    let lastError;
    let delay = initialDelay;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        this.emit('retryAttempt', {
          pattern: 'retry',
          executionId,
          attempt,
          delay: attempt > 1 ? delay : 0
        });
        
        if (attempt > 1) {
          await new Promise(resolve => setTimeout(resolve, delay));
        }
        
        const result = await this.executeTask(task, {
          ...context,
          retryAttempt: attempt
        });
        
        this.emit('patternCompleted', {
          pattern: 'retry',
          executionId,
          successfulAttempt: attempt,
          totalAttempts: attempt
        });
        
        return {
          success: true,
          pattern: 'retry',
          result,
          attempts: attempt
        };
        
      } catch (error) {
        lastError = error;
        delay *= backoffMultiplier;
        
        this.emit('retryFailed', {
          pattern: 'retry',
          executionId,
          attempt,
          error: error.message,
          nextDelay: attempt < maxRetries ? delay : null
        });
        
        // Check if error is retryable
        if (options.retryCondition && !options.retryCondition(error)) {
          throw error;
        }
      }
    }
    
    this.emit('patternFailed', {
      pattern: 'retry',
      executionId,
      error: lastError.message,
      attempts: maxRetries
    });
    
    throw lastError;
  }
  
  /**
   * Circuit Breaker Pattern - Prevent cascading failures
   */
  async circuitBreakerPattern(task, context = {}, options = {}) {
    const executionId = uuidv4();
    const breakerKey = task.name || 'default';
    const threshold = options.failureThreshold || 5;
    const timeout = options.timeout || 60000;
    const halfOpenRequests = options.halfOpenRequests || 1;
    
    // Get or create circuit breaker
    if (!this.circuitBreakers.has(breakerKey)) {
      this.circuitBreakers.set(breakerKey, {
        state: 'closed',
        failures: 0,
        lastFailure: null,
        nextRetry: null,
        halfOpenAttempts: 0
      });
    }
    
    const breaker = this.circuitBreakers.get(breakerKey);
    
    this.emit('patternStarted', {
      pattern: 'circuitBreaker',
      executionId,
      breakerState: breaker.state
    });
    
    // Check circuit breaker state
    if (breaker.state === 'open') {
      if (Date.now() < breaker.nextRetry) {
        this.emit('patternFailed', {
          pattern: 'circuitBreaker',
          executionId,
          error: 'Circuit breaker is open',
          nextRetry: breaker.nextRetry
        });
        
        throw new Error('Circuit breaker is open');
      }
      
      // Transition to half-open
      breaker.state = 'half-open';
      breaker.halfOpenAttempts = 0;
    }
    
    if (breaker.state === 'half-open' && breaker.halfOpenAttempts >= halfOpenRequests) {
      // Too many half-open attempts, go back to open
      breaker.state = 'open';
      breaker.nextRetry = Date.now() + timeout;
      
      throw new Error('Circuit breaker half-open limit reached');
    }
    
    try {
      if (breaker.state === 'half-open') {
        breaker.halfOpenAttempts++;
      }
      
      const result = await this.executeTask(task, context);
      
      // Success - reset failures
      if (breaker.state === 'half-open') {
        breaker.state = 'closed';
        this.emit('circuitBreakerClosed', {
          pattern: 'circuitBreaker',
          executionId,
          breakerKey
        });
      }
      
      breaker.failures = 0;
      
      this.emit('patternCompleted', {
        pattern: 'circuitBreaker',
        executionId,
        breakerState: breaker.state
      });
      
      return {
        success: true,
        pattern: 'circuitBreaker',
        result,
        breakerState: breaker.state
      };
      
    } catch (error) {
      breaker.failures++;
      breaker.lastFailure = Date.now();
      
      if (breaker.failures >= threshold) {
        breaker.state = 'open';
        breaker.nextRetry = Date.now() + timeout;
        
        this.emit('circuitBreakerOpened', {
          pattern: 'circuitBreaker',
          executionId,
          breakerKey,
          failures: breaker.failures,
          nextRetry: breaker.nextRetry
        });
      }
      
      this.emit('patternFailed', {
        pattern: 'circuitBreaker',
        executionId,
        error: error.message,
        breakerState: breaker.state
      });
      
      throw error;
    }
  }
  
  /**
   * Saga Pattern - Distributed transaction with compensations
   */
  async sagaPattern(steps, context = {}) {
    const executionId = uuidv4();
    const startTime = Date.now();
    const completedSteps = [];
    
    this.emit('patternStarted', {
      pattern: 'saga',
      executionId,
      stepCount: steps.length
    });
    
    try {
      // Execute forward steps
      for (let i = 0; i < steps.length; i++) {
        const step = steps[i];
        
        this.emit('sagaStepStarted', {
          pattern: 'saga',
          executionId,
          stepIndex: i,
          stepName: step.name
        });
        
        const result = await this.executeTask(step.transaction, context);
        
        completedSteps.push({
          step,
          result,
          index: i
        });
        
        this.emit('sagaStepCompleted', {
          pattern: 'saga',
          executionId,
          stepIndex: i,
          stepName: step.name
        });
        
        // Update context for next step
        if (step.updateContext) {
          context = { ...context, ...result };
        }
      }
      
      const duration = Date.now() - startTime;
      
      this.emit('patternCompleted', {
        pattern: 'saga',
        executionId,
        duration,
        completedSteps: completedSteps.length
      });
      
      return {
        success: true,
        pattern: 'saga',
        results: completedSteps.map(s => s.result),
        duration
      };
      
    } catch (error) {
      // Saga failed - execute compensations
      this.emit('sagaCompensationStarted', {
        pattern: 'saga',
        executionId,
        error: error.message,
        stepsToCompensate: completedSteps.length
      });
      
      // Execute compensations in reverse order
      for (let i = completedSteps.length - 1; i >= 0; i--) {
        const { step, result } = completedSteps[i];
        
        if (step.compensation) {
          try {
            this.emit('compensationStarted', {
              pattern: 'saga',
              executionId,
              stepName: step.name
            });
            
            await this.executeTask(step.compensation, {
              ...context,
              originalResult: result,
              failureReason: error.message
            });
            
            this.emit('compensationCompleted', {
              pattern: 'saga',
              executionId,
              stepName: step.name
            });
            
          } catch (compensationError) {
            this.emit('compensationFailed', {
              pattern: 'saga',
              executionId,
              stepName: step.name,
              error: compensationError.message
            });
          }
        }
      }
      
      this.emit('patternFailed', {
        pattern: 'saga',
        executionId,
        error: error.message,
        compensated: true
      });
      
      throw error;
    }
  }
  
  /**
   * Execute a task
   */
  async executeTask(task, context) {
    if (typeof task === 'function') {
      return await task(context);
    }
    
    if (task.execute) {
      return await task.execute(context);
    }
    
    if (task.handler) {
      return await task.handler(context);
    }
    
    throw new Error('Invalid task definition');
  }
  
  /**
   * Execute a stage (for pipeline pattern)
   */
  async executeStage(stage, data, context) {
    if (typeof stage === 'function') {
      return await stage(data, context);
    }
    
    if (stage.transform) {
      return await stage.transform(data, context);
    }
    
    if (stage.handler) {
      return await stage.handler(data, context);
    }
    
    throw new Error('Invalid stage definition');
  }
  
  /**
   * Evaluate a condition
   */
  async evaluateCondition(condition, context) {
    if (typeof condition === 'boolean') {
      return condition;
    }
    
    if (typeof condition === 'function') {
      return await condition(context);
    }
    
    if (condition.evaluate) {
      return await condition.evaluate(context);
    }
    
    // Simple property check
    if (typeof condition === 'string') {
      return !!context[condition];
    }
    
    return false;
  }
  
  /**
   * Cancel pending tasks
   */
  cancelPendingTasks(promises, winner) {
    // In a real implementation, would cancel ongoing operations
    // This is a placeholder for cancellation logic
  }
  
  /**
   * Create a pattern executor
   */
  createExecutor(patternName) {
    const pattern = this.patterns[patternName];
    
    if (!pattern) {
      throw new Error(`Unknown pattern: ${patternName}`);
    }
    
    return pattern;
  }
  
  /**
   * Get execution statistics
   */
  getStatistics() {
    return {
      activeExecutions: this.activeExecutions.size,
      executionHistory: this.executionHistory.length,
      circuitBreakers: Array.from(this.circuitBreakers.entries()).map(([key, breaker]) => ({
        key,
        state: breaker.state,
        failures: breaker.failures
      }))
    };
  }
}

export default ExecutionPatterns;