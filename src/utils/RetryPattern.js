import { EventEmitter } from 'eventemitter3';

/**
 * Retry Pattern with Exponential Backoff - Enhanced from Pantheon
 * Provides intelligent retry logic with various strategies
 */
export class RetryPattern extends EventEmitter {
  constructor(options = {}) {
    super();
    
    this.maxRetries = options.maxRetries || 3;
    this.initialDelay = options.initialDelay || 1000;
    this.maxDelay = options.maxDelay || 30000;
    this.backoffMultiplier = options.backoffMultiplier || 2;
    this.jitter = options.jitter !== false; // Add randomness to prevent thundering herd
    this.retryCondition = options.retryCondition || this.defaultRetryCondition;
    this.onRetry = options.onRetry || null;
    
    // Strategies: 'exponential', 'linear', 'fibonacci', 'fixed'
    this.strategy = options.strategy || 'exponential';
    
    // Metrics
    this.metrics = {
      totalAttempts: 0,
      successfulAttempts: 0,
      failedAttempts: 0,
      totalRetries: 0,
      averageRetries: 0
    };
  }
  
  /**
   * Execute function with retry logic
   */
  async execute(fn, context = {}) {
    let lastError;
    let delay = this.initialDelay;
    let attempt = 0;
    const startTime = Date.now();
    
    this.emit('retryStarted', {
      maxRetries: this.maxRetries,
      strategy: this.strategy
    });
    
    while (attempt <= this.maxRetries) {
      attempt++;
      this.metrics.totalAttempts++;
      
      try {
        // Add delay before retry (not on first attempt)
        if (attempt > 1) {
          const actualDelay = this.jitter ? this.addJitter(delay) : delay;
          
          this.emit('retrying', {
            attempt,
            delay: actualDelay,
            totalDuration: Date.now() - startTime
          });
          
          if (this.onRetry) {
            await this.onRetry(attempt, actualDelay, lastError);
          }
          
          await this.sleep(actualDelay);
          this.metrics.totalRetries++;
        }
        
        // Execute the function
        const result = await fn(attempt);
        
        // Success
        this.metrics.successfulAttempts++;
        this.updateAverageRetries(attempt - 1);
        
        this.emit('retrySucceeded', {
          attempt,
          totalDuration: Date.now() - startTime,
          retries: attempt - 1
        });
        
        return result;
        
      } catch (error) {
        lastError = error;
        
        // Check if error is retryable
        if (!this.retryCondition(error, attempt)) {
          this.metrics.failedAttempts++;
          
          this.emit('retryAborted', {
            attempt,
            error: error.message,
            reason: 'Non-retryable error'
          });
          
          throw error;
        }
        
        // Check if we've exhausted retries
        if (attempt >= this.maxRetries + 1) {
          this.metrics.failedAttempts++;
          
          this.emit('retryExhausted', {
            attempts: attempt,
            totalDuration: Date.now() - startTime,
            error: error.message
          });
          
          throw new Error(`Operation failed after ${attempt} attempts: ${error.message}`);
        }
        
        // Calculate next delay
        delay = this.calculateDelay(attempt, delay);
        
        this.emit('retryFailed', {
          attempt,
          error: error.message,
          nextDelay: delay,
          retriesRemaining: this.maxRetries - attempt + 1
        });
      }
    }
    
    throw lastError;
  }
  
  /**
   * Calculate delay based on strategy
   */
  calculateDelay(attempt, currentDelay) {
    let nextDelay;
    
    switch (this.strategy) {
      case 'exponential':
        nextDelay = this.initialDelay * Math.pow(this.backoffMultiplier, attempt - 1);
        break;
        
      case 'linear':
        nextDelay = this.initialDelay * attempt;
        break;
        
      case 'fibonacci':
        nextDelay = this.getFibonacciDelay(attempt);
        break;
        
      case 'fixed':
        nextDelay = this.initialDelay;
        break;
        
      default:
        nextDelay = currentDelay * this.backoffMultiplier;
    }
    
    return Math.min(nextDelay, this.maxDelay);
  }
  
  /**
   * Get Fibonacci delay
   */
  getFibonacciDelay(n) {
    if (n <= 1) return this.initialDelay;
    
    let a = this.initialDelay;
    let b = this.initialDelay;
    
    for (let i = 2; i <= n; i++) {
      const temp = a + b;
      a = b;
      b = temp;
    }
    
    return b;
  }
  
  /**
   * Add jitter to delay
   */
  addJitter(delay) {
    // Add random jitter between -25% and +25%
    const jitterRange = delay * 0.25;
    const jitter = (Math.random() - 0.5) * 2 * jitterRange;
    return Math.max(0, delay + jitter);
  }
  
  /**
   * Default retry condition
   */
  defaultRetryCondition(error, attempt) {
    // Retry on specific error types
    const retryableErrors = [
      'ETIMEDOUT',
      'ECONNRESET',
      'ENOTFOUND',
      'ECONNREFUSED',
      'EPIPE',
      'ENETUNREACH'
    ];
    
    // Check error code
    if (error.code && retryableErrors.includes(error.code)) {
      return true;
    }
    
    // Check status codes for HTTP errors
    if (error.response) {
      const status = error.response.status;
      // Retry on 5xx errors and specific 4xx errors
      return status >= 500 || status === 429 || status === 408;
    }
    
    // Check error message patterns
    const retryablePatterns = [
      /timeout/i,
      /temporary/i,
      /unavailable/i,
      /rate limit/i,
      /too many requests/i,
      /connection reset/i
    ];
    
    const errorMessage = error.message || '';
    return retryablePatterns.some(pattern => pattern.test(errorMessage));
  }
  
  /**
   * Sleep helper
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  /**
   * Update average retries metric
   */
  updateAverageRetries(retries) {
    const totalSuccessful = this.metrics.successfulAttempts;
    const currentAverage = this.metrics.averageRetries;
    
    this.metrics.averageRetries = 
      ((currentAverage * (totalSuccessful - 1)) + retries) / totalSuccessful;
  }
  
  /**
   * Get metrics
   */
  getMetrics() {
    return {
      ...this.metrics,
      successRate: this.metrics.totalAttempts > 0 
        ? (this.metrics.successfulAttempts / this.metrics.totalAttempts) * 100 
        : 0,
      retryRate: this.metrics.totalAttempts > 0
        ? (this.metrics.totalRetries / this.metrics.totalAttempts) * 100
        : 0
    };
  }
  
  /**
   * Reset metrics
   */
  resetMetrics() {
    this.metrics = {
      totalAttempts: 0,
      successfulAttempts: 0,
      failedAttempts: 0,
      totalRetries: 0,
      averageRetries: 0
    };
  }
  
  /**
   * Create a wrapped function with retry logic
   */
  wrap(fn, options = {}) {
    const pattern = new RetryPattern({ ...this, ...options });
    
    return async (...args) => {
      return pattern.execute(() => fn(...args));
    };
  }
}

/**
 * Bulk Retry - Execute multiple operations with retry
 */
export class BulkRetry extends EventEmitter {
  constructor(options = {}) {
    super();
    
    this.concurrency = options.concurrency || 5;
    this.stopOnError = options.stopOnError || false;
    this.retryOptions = options.retryOptions || {};
  }
  
  /**
   * Execute multiple operations with retry
   */
  async executeAll(operations) {
    const results = [];
    const errors = [];
    const queue = [...operations];
    const executing = new Set();
    
    this.emit('bulkStarted', {
      totalOperations: operations.length,
      concurrency: this.concurrency
    });
    
    while (queue.length > 0 || executing.size > 0) {
      // Start new executions up to concurrency limit
      while (queue.length > 0 && executing.size < this.concurrency) {
        const operation = queue.shift();
        const index = operations.indexOf(operation);
        
        const execution = this.executeOperation(operation, index)
          .then(result => {
            results[index] = { success: true, result };
            executing.delete(execution);
            
            this.emit('operationCompleted', {
              index,
              success: true,
              remaining: queue.length + executing.size
            });
          })
          .catch(error => {
            errors[index] = error;
            results[index] = { success: false, error };
            executing.delete(execution);
            
            this.emit('operationFailed', {
              index,
              error: error.message,
              remaining: queue.length + executing.size
            });
            
            if (this.stopOnError) {
              queue.length = 0; // Clear queue
              throw error;
            }
          });
        
        executing.add(execution);
      }
      
      // Wait for at least one to complete
      if (executing.size > 0) {
        await Promise.race(Array.from(executing));
      }
    }
    
    this.emit('bulkCompleted', {
      total: operations.length,
      successful: results.filter(r => r.success).length,
      failed: errors.length
    });
    
    return results;
  }
  
  /**
   * Execute single operation with retry
   */
  async executeOperation(operation, index) {
    const retry = new RetryPattern(this.retryOptions);
    
    retry.on('retrying', (data) => {
      this.emit('operationRetrying', {
        index,
        ...data
      });
    });
    
    if (typeof operation === 'function') {
      return retry.execute(operation);
    } else if (operation.fn) {
      return retry.execute(operation.fn, operation.context);
    } else {
      throw new Error(`Invalid operation at index ${index}`);
    }
  }
}

/**
 * Retry with circuit breaker integration
 */
export class SmartRetry extends RetryPattern {
  constructor(options = {}) {
    super(options);
    
    this.circuitBreaker = options.circuitBreaker || null;
    this.healthCheck = options.healthCheck || null;
    this.adaptiveBackoff = options.adaptiveBackoff !== false;
    
    // Adaptive backoff state
    this.successStreak = 0;
    this.failureStreak = 0;
  }
  
  /**
   * Execute with smart retry logic
   */
  async execute(fn, context = {}) {
    // Check circuit breaker first
    if (this.circuitBreaker && !this.circuitBreaker.isHealthy()) {
      throw new Error('Circuit breaker is open');
    }
    
    // Check health if provided
    if (this.healthCheck) {
      const healthy = await this.healthCheck();
      if (!healthy) {
        throw new Error('Health check failed');
      }
    }
    
    try {
      const result = await super.execute(fn, context);
      
      // Adapt on success
      if (this.adaptiveBackoff) {
        this.onAdaptiveSuccess();
      }
      
      return result;
      
    } catch (error) {
      // Adapt on failure
      if (this.adaptiveBackoff) {
        this.onAdaptiveFailure();
      }
      
      throw error;
    }
  }
  
  /**
   * Handle adaptive success
   */
  onAdaptiveSuccess() {
    this.successStreak++;
    this.failureStreak = 0;
    
    // Reduce delays after consistent success
    if (this.successStreak > 5) {
      this.backoffMultiplier = Math.max(1.5, this.backoffMultiplier * 0.9);
      this.maxRetries = Math.max(2, this.maxRetries - 1);
    }
  }
  
  /**
   * Handle adaptive failure
   */
  onAdaptiveFailure() {
    this.failureStreak++;
    this.successStreak = 0;
    
    // Increase delays after consistent failures
    if (this.failureStreak > 3) {
      this.backoffMultiplier = Math.min(3, this.backoffMultiplier * 1.1);
      this.maxRetries = Math.min(5, this.maxRetries + 1);
    }
  }
}

export default RetryPattern;