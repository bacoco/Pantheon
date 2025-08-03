import { EventEmitter } from 'eventemitter3';

/**
 * Circuit Breaker Pattern - Enhanced implementation from Pantheon
 * Prevents cascading failures in distributed systems
 */
export class CircuitBreaker extends EventEmitter {
  constructor(options = {}) {
    super();
    
    this.name = options.name || 'default';
    this.failureThreshold = options.failureThreshold || 5;
    this.successThreshold = options.successThreshold || 2;
    this.timeout = options.timeout || 60000; // 1 minute
    this.resetTimeout = options.resetTimeout || 30000; // 30 seconds
    
    // State: 'CLOSED', 'OPEN', 'HALF_OPEN'
    this.state = 'CLOSED';
    this.failures = 0;
    this.successes = 0;
    this.nextAttempt = Date.now();
    this.lastFailureTime = null;
    
    // Metrics
    this.metrics = {
      totalCalls: 0,
      successfulCalls: 0,
      failedCalls: 0,
      rejectedCalls: 0,
      timeouts: 0,
      stateChanges: []
    };
  }
  
  /**
   * Execute function with circuit breaker protection
   */
  async execute(fn, fallback = null) {
    this.metrics.totalCalls++;
    
    // Check if circuit is open
    if (this.state === 'OPEN') {
      if (Date.now() < this.nextAttempt) {
        this.metrics.rejectedCalls++;
        
        this.emit('rejected', {
          name: this.name,
          state: this.state,
          nextAttempt: this.nextAttempt
        });
        
        if (fallback) {
          return await this.executeFallback(fallback);
        }
        
        throw new Error(`Circuit breaker is OPEN for ${this.name}`);
      }
      
      // Try to recover
      this.transitionTo('HALF_OPEN');
    }
    
    try {
      // Set timeout for the operation
      const result = await this.executeWithTimeout(fn, this.timeout);
      
      this.onSuccess();
      return result;
      
    } catch (error) {
      this.onFailure(error);
      
      if (fallback) {
        return await this.executeFallback(fallback);
      }
      
      throw error;
    }
  }
  
  /**
   * Execute function with timeout
   */
  async executeWithTimeout(fn, timeout) {
    return Promise.race([
      fn(),
      new Promise((_, reject) => {
        setTimeout(() => {
          this.metrics.timeouts++;
          reject(new Error(`Operation timed out after ${timeout}ms`));
        }, timeout);
      })
    ]);
  }
  
  /**
   * Execute fallback function
   */
  async executeFallback(fallback) {
    try {
      this.emit('fallbackExecuted', {
        name: this.name,
        state: this.state
      });
      
      return await fallback();
    } catch (error) {
      this.emit('fallbackFailed', {
        name: this.name,
        error: error.message
      });
      
      throw error;
    }
  }
  
  /**
   * Handle successful execution
   */
  onSuccess() {
    this.metrics.successfulCalls++;
    this.failures = 0;
    
    switch (this.state) {
      case 'HALF_OPEN':
        this.successes++;
        if (this.successes >= this.successThreshold) {
          this.transitionTo('CLOSED');
        }
        break;
        
      case 'CLOSED':
        // Reset failure count on success
        this.failures = 0;
        break;
    }
    
    this.emit('success', {
      name: this.name,
      state: this.state
    });
  }
  
  /**
   * Handle failed execution
   */
  onFailure(error) {
    this.metrics.failedCalls++;
    this.failures++;
    this.lastFailureTime = Date.now();
    
    switch (this.state) {
      case 'HALF_OPEN':
        this.transitionTo('OPEN');
        break;
        
      case 'CLOSED':
        if (this.failures >= this.failureThreshold) {
          this.transitionTo('OPEN');
        }
        break;
    }
    
    this.emit('failure', {
      name: this.name,
      state: this.state,
      failures: this.failures,
      error: error.message
    });
  }
  
  /**
   * Transition to new state
   */
  transitionTo(newState) {
    const oldState = this.state;
    this.state = newState;
    
    this.metrics.stateChanges.push({
      from: oldState,
      to: newState,
      timestamp: Date.now()
    });
    
    switch (newState) {
      case 'OPEN':
        this.nextAttempt = Date.now() + this.resetTimeout;
        this.emit('opened', {
          name: this.name,
          failures: this.failures,
          nextAttempt: this.nextAttempt
        });
        break;
        
      case 'HALF_OPEN':
        this.successes = 0;
        this.failures = 0;
        this.emit('halfOpened', {
          name: this.name
        });
        break;
        
      case 'CLOSED':
        this.failures = 0;
        this.successes = 0;
        this.emit('closed', {
          name: this.name
        });
        break;
    }
    
    this.emit('stateChanged', {
      name: this.name,
      from: oldState,
      to: newState
    });
  }
  
  /**
   * Force circuit to open
   */
  open() {
    this.transitionTo('OPEN');
  }
  
  /**
   * Force circuit to close
   */
  close() {
    this.transitionTo('CLOSED');
  }
  
  /**
   * Reset circuit breaker
   */
  reset() {
    this.state = 'CLOSED';
    this.failures = 0;
    this.successes = 0;
    this.nextAttempt = Date.now();
    this.lastFailureTime = null;
    
    this.emit('reset', {
      name: this.name
    });
  }
  
  /**
   * Get current status
   */
  getStatus() {
    return {
      name: this.name,
      state: this.state,
      failures: this.failures,
      successes: this.successes,
      lastFailureTime: this.lastFailureTime,
      nextAttempt: this.state === 'OPEN' ? this.nextAttempt : null,
      metrics: this.metrics
    };
  }
  
  /**
   * Health check
   */
  isHealthy() {
    return this.state === 'CLOSED';
  }
  
  /**
   * Create a protected function
   */
  protect(fn, fallback = null) {
    return async (...args) => {
      return this.execute(() => fn(...args), fallback);
    };
  }
}

/**
 * Circuit Breaker Factory for managing multiple breakers
 */
export class CircuitBreakerFactory {
  constructor() {
    this.breakers = new Map();
  }
  
  /**
   * Get or create circuit breaker
   */
  get(name, options = {}) {
    if (!this.breakers.has(name)) {
      this.breakers.set(name, new CircuitBreaker({ name, ...options }));
    }
    return this.breakers.get(name);
  }
  
  /**
   * Get all circuit breakers
   */
  getAll() {
    return Array.from(this.breakers.values());
  }
  
  /**
   * Get status of all breakers
   */
  getStatus() {
    const status = {};
    for (const [name, breaker] of this.breakers) {
      status[name] = breaker.getStatus();
    }
    return status;
  }
  
  /**
   * Reset all breakers
   */
  resetAll() {
    for (const breaker of this.breakers.values()) {
      breaker.reset();
    }
  }
  
  /**
   * Check overall health
   */
  isHealthy() {
    for (const breaker of this.breakers.values()) {
      if (!breaker.isHealthy()) {
        return false;
      }
    }
    return true;
  }
}

// Singleton factory instance
export const circuitBreakerFactory = new CircuitBreakerFactory();

export default CircuitBreaker;