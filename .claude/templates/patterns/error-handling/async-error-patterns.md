---
name: "Async Error Handling Patterns"
description: "Comprehensive async error handling for promises, streams, and event-driven code"
category: "error-handling"
frameworks: ["nodejs", "typescript", "express"]
dependencies: 
  - package: "p-retry"
    version: "^5.1.0"
  - package: "p-timeout"
    version: "^6.1.0"
  - package: "p-queue"
    version: "^7.4.0"
tags: ["async", "error-handling", "promises", "streams", "retry", "circuit-breaker"]
---

## Overview

This template provides async error handling patterns including:
- Promise error handling
- Async/await best practices
- Stream error handling
- Event emitter error handling
- Retry mechanisms
- Circuit breaker pattern
- Timeout handling
- Concurrent error handling

## Code

### Promise Error Utilities (src/utils/promiseUtils.ts)
```typescript
// Safe promise wrapper that never rejects
export async function safePromise<T>(
  promise: Promise<T>
): Promise<[T, null] | [null, Error]> {
  try {
    const data = await promise;
    return [data, null];
  } catch (error) {
    return [null, error as Error];
  }
}

// Usage
const [data, error] = await safePromise(fetchUserData());
if (error) {
  console.error('Failed to fetch user:', error);
  return;
}

// Promise.all with individual error handling
export async function settleAll<T>(
  promises: Promise<T>[]
): Promise<Array<{ status: 'fulfilled'; value: T } | { status: 'rejected'; reason: Error }>> {
  return Promise.allSettled(promises);
}

// Timeout wrapper
export function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  timeoutError = new Error('Operation timed out')
): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => 
      setTimeout(() => reject(timeoutError), timeoutMs)
    )
  ]);
}

// Sequential promise execution with error handling
export async function sequentialExecute<T, R>(
  items: T[],
  handler: (item: T, index: number) => Promise<R>,
  onError?: (error: Error, item: T, index: number) => void
): Promise<R[]> {
  const results: R[] = [];
  
  for (let i = 0; i < items.length; i++) {
    try {
      const result = await handler(items[i], i);
      results.push(result);
    } catch (error) {
      if (onError) {
        onError(error as Error, items[i], i);
      } else {
        throw error;
      }
    }
  }
  
  return results;
}

// Concurrent execution with error handling
export async function concurrentExecute<T, R>(
  items: T[],
  handler: (item: T, index: number) => Promise<R>,
  options: {
    concurrency?: number;
    stopOnError?: boolean;
    onError?: (error: Error, item: T, index: number) => void;
  } = {}
): Promise<Array<R | Error>> {
  const { concurrency = 5, stopOnError = false, onError } = options;
  const results: Array<R | Error> = [];
  const executing: Promise<void>[] = [];
  
  for (let i = 0; i < items.length; i++) {
    const promise = handler(items[i], i)
      .then(result => {
        results[i] = result;
      })
      .catch(error => {
        results[i] = error;
        onError?.(error, items[i], i);
        
        if (stopOnError) {
          throw error;
        }
      });
    
    executing.push(promise);
    
    if (executing.length >= concurrency) {
      await Promise.race(executing);
      executing.splice(executing.findIndex(p => p === promise), 1);
    }
  }
  
  await Promise.all(executing);
  return results;
}
```

### Retry Mechanism with Exponential Backoff (src/utils/retry.ts)
```typescript
interface RetryOptions {
  maxAttempts?: number;
  initialDelay?: number;
  maxDelay?: number;
  factor?: number;
  onRetry?: (error: Error, attempt: number) => void;
  retryCondition?: (error: Error) => boolean;
  signal?: AbortSignal;
}

export async function retry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxAttempts = 3,
    initialDelay = 1000,
    maxDelay = 30000,
    factor = 2,
    onRetry,
    retryCondition = () => true,
    signal
  } = options;

  let lastError: Error;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      // Check if aborted
      if (signal?.aborted) {
        throw new Error('Operation aborted');
      }

      return await fn();
    } catch (error) {
      lastError = error as Error;

      // Check if we should retry
      if (
        attempt === maxAttempts ||
        !retryCondition(lastError) ||
        signal?.aborted
      ) {
        throw lastError;
      }

      // Calculate delay with exponential backoff
      const delay = Math.min(
        initialDelay * Math.pow(factor, attempt - 1),
        maxDelay
      );

      // Call retry callback
      onRetry?.(lastError, attempt);

      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError!;
}

// Usage
const data = await retry(
  async () => {
    const response = await fetch('/api/data');
    if (!response.ok) throw new Error('Request failed');
    return response.json();
  },
  {
    maxAttempts: 5,
    initialDelay: 500,
    onRetry: (error, attempt) => {
      console.log(`Retry attempt ${attempt} after error:`, error.message);
    },
    retryCondition: (error) => {
      // Don't retry on 4xx errors
      return !error.message.includes('4');
    }
  }
);
```

### Circuit Breaker Pattern (src/utils/circuitBreaker.ts)
```typescript
enum CircuitState {
  CLOSED = 'CLOSED',
  OPEN = 'OPEN',
  HALF_OPEN = 'HALF_OPEN'
}

interface CircuitBreakerOptions {
  failureThreshold?: number;
  resetTimeout?: number;
  monitoringPeriod?: number;
  onStateChange?: (state: CircuitState) => void;
}

export class CircuitBreaker<T> {
  private state = CircuitState.CLOSED;
  private failures = 0;
  private lastFailureTime?: number;
  private successCount = 0;
  private readonly options: Required<CircuitBreakerOptions>;

  constructor(
    private readonly fn: (...args: any[]) => Promise<T>,
    options: CircuitBreakerOptions = {}
  ) {
    this.options = {
      failureThreshold: 5,
      resetTimeout: 60000, // 1 minute
      monitoringPeriod: 10000, // 10 seconds
      onStateChange: () => {},
      ...options
    };
  }

  async execute(...args: any[]): Promise<T> {
    if (this.state === CircuitState.OPEN) {
      if (this.shouldAttemptReset()) {
        this.setState(CircuitState.HALF_OPEN);
      } else {
        throw new Error('Circuit breaker is OPEN');
      }
    }

    try {
      const result = await this.fn(...args);
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess(): void {
    this.failures = 0;
    
    if (this.state === CircuitState.HALF_OPEN) {
      this.successCount++;
      
      // Require multiple successes in half-open state
      if (this.successCount >= 3) {
        this.setState(CircuitState.CLOSED);
        this.successCount = 0;
      }
    }
  }

  private onFailure(): void {
    this.failures++;
    this.lastFailureTime = Date.now();
    
    if (this.state === CircuitState.HALF_OPEN) {
      this.setState(CircuitState.OPEN);
      this.successCount = 0;
    } else if (
      this.failures >= this.options.failureThreshold &&
      this.state === CircuitState.CLOSED
    ) {
      this.setState(CircuitState.OPEN);
    }
  }

  private shouldAttemptReset(): boolean {
    return (
      this.lastFailureTime !== undefined &&
      Date.now() - this.lastFailureTime >= this.options.resetTimeout
    );
  }

  private setState(state: CircuitState): void {
    if (this.state !== state) {
      this.state = state;
      this.options.onStateChange(state);
    }
  }

  getState(): CircuitState {
    return this.state;
  }

  reset(): void {
    this.failures = 0;
    this.successCount = 0;
    this.lastFailureTime = undefined;
    this.setState(CircuitState.CLOSED);
  }
}

// Usage
const apiBreaker = new CircuitBreaker(
  async (endpoint: string) => {
    const response = await fetch(endpoint);
    if (!response.ok) throw new Error('API request failed');
    return response.json();
  },
  {
    failureThreshold: 3,
    resetTimeout: 30000,
    onStateChange: (state) => {
      console.log(`Circuit breaker state changed to: ${state}`);
    }
  }
);

try {
  const data = await apiBreaker.execute('/api/users');
} catch (error) {
  if (error.message === 'Circuit breaker is OPEN') {
    // Handle circuit open scenario
    return cachedData;
  }
  throw error;
}
```

### Stream Error Handling (src/utils/streamErrorHandler.ts)
```typescript
import { Transform, pipeline, Readable, Writable } from 'stream';
import { promisify } from 'util';

const pipelineAsync = promisify(pipeline);

// Error handling transform stream
export class ErrorHandlingStream extends Transform {
  constructor(
    private onError: (error: Error, chunk: any) => void,
    options?: any
  ) {
    super(options);
  }

  _transform(chunk: any, encoding: string, callback: Function) {
    try {
      // Process chunk
      const processed = this.processChunk(chunk);
      callback(null, processed);
    } catch (error) {
      // Handle error without breaking the stream
      this.onError(error as Error, chunk);
      
      // Optionally skip the problematic chunk
      callback();
      
      // Or pass error to break the stream
      // callback(error);
    }
  }

  private processChunk(chunk: any): any {
    // Your processing logic here
    return chunk;
  }
}

// Safe stream pipeline with error handling
export async function safeStreamPipeline(
  streams: Array<Readable | Transform | Writable>,
  options: {
    onError?: (error: Error, stream: any) => void;
    destroyOnError?: boolean;
  } = {}
): Promise<void> {
  const { onError, destroyOnError = true } = options;

  try {
    // Add error handlers to each stream
    streams.forEach((stream, index) => {
      stream.on('error', (error) => {
        console.error(`Error in stream ${index}:`, error);
        onError?.(error, stream);
        
        if (destroyOnError) {
          // Destroy all streams on error
          streams.forEach(s => s.destroy());
        }
      });
    });

    await pipelineAsync(...streams);
  } catch (error) {
    console.error('Pipeline error:', error);
    throw error;
  }
}

// Retry stream on error
export class RetryStream extends Transform {
  private retryCount = 0;

  constructor(
    private maxRetries: number = 3,
    private retryDelay: number = 1000
  ) {
    super({ objectMode: true });
  }

  async _transform(chunk: any, encoding: string, callback: Function) {
    let lastError: Error;

    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        const result = await this.processChunk(chunk);
        this.retryCount = 0;
        callback(null, result);
        return;
      } catch (error) {
        lastError = error as Error;
        
        if (attempt < this.maxRetries) {
          await new Promise(resolve => 
            setTimeout(resolve, this.retryDelay * (attempt + 1))
          );
        }
      }
    }

    // All retries failed
    this.emit('retry-failed', lastError, chunk);
    callback(lastError);
  }

  private async processChunk(chunk: any): Promise<any> {
    // Your async processing logic here
    return chunk;
  }
}

// Usage example
async function processLargeFile(inputPath: string, outputPath: string) {
  const readStream = fs.createReadStream(inputPath);
  const writeStream = fs.createWriteStream(outputPath);
  
  const errorHandler = new ErrorHandlingStream(
    (error, chunk) => {
      console.error('Error processing chunk:', error);
      // Log problematic chunk for analysis
    }
  );
  
  const retryStream = new RetryStream(3, 500);
  
  await safeStreamPipeline(
    [readStream, errorHandler, retryStream, writeStream],
    {
      onError: (error, stream) => {
        console.error('Stream error:', error);
        // Additional error handling
      }
    }
  );
}
```

### Event Emitter Error Handling (src/utils/safeEventEmitter.ts)
```typescript
import { EventEmitter } from 'events';

export class SafeEventEmitter extends EventEmitter {
  private errorHandlers = new Map<string, (error: Error) => void>();

  constructor() {
    super();
    
    // Global error handler
    this.on('error', (error) => {
      console.error('Unhandled event emitter error:', error);
      // Prevent crash on unhandled errors
    });
  }

  // Safe emit that catches listener errors
  safeEmit(event: string, ...args: any[]): boolean {
    const listeners = this.listeners(event);
    
    if (listeners.length === 0) {
      return false;
    }

    for (const listener of listeners) {
      try {
        listener(...args);
      } catch (error) {
        const errorHandler = this.errorHandlers.get(event);
        
        if (errorHandler) {
          errorHandler(error as Error);
        } else {
          this.emit('error', error);
        }
      }
    }

    return true;
  }

  // Register error handler for specific event
  onError(event: string, handler: (error: Error) => void): this {
    this.errorHandlers.set(event, handler);
    return this;
  }

  // Async event handling with error catching
  async emitAsync(event: string, ...args: any[]): Promise<any[]> {
    const listeners = this.listeners(event);
    const results: any[] = [];

    for (const listener of listeners) {
      try {
        const result = await Promise.resolve(listener(...args));
        results.push(result);
      } catch (error) {
        const errorHandler = this.errorHandlers.get(event);
        
        if (errorHandler) {
          errorHandler(error as Error);
        } else {
          throw error;
        }
      }
    }

    return results;
  }
}

// Usage
const emitter = new SafeEventEmitter();

emitter.onError('data', (error) => {
  console.error('Error in data handler:', error);
});

emitter.on('data', (data) => {
  // This might throw
  processData(data);
});

// Won't crash the application
emitter.safeEmit('data', { id: 1 });

// Async handlers
emitter.on('async-task', async (data) => {
  await processAsync(data);
});

try {
  await emitter.emitAsync('async-task', { id: 1 });
} catch (error) {
  console.error('Async task failed:', error);
}
```

### Express Async Error Wrapper (src/middleware/asyncWrapper.ts)
```typescript
import { Request, Response, NextFunction, RequestHandler } from 'express';

// Wrapper for async route handlers
export const asyncWrapper = (fn: RequestHandler): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Class decorator for async methods
export function AsyncError(
  target: any,
  propertyKey: string,
  descriptor: PropertyDescriptor
) {
  const originalMethod = descriptor.value;

  descriptor.value = async function (...args: any[]) {
    try {
      return await originalMethod.apply(this, args);
    } catch (error) {
      // Handle based on method signature
      const lastArg = args[args.length - 1];
      
      if (typeof lastArg === 'function') {
        // Express middleware - pass to next()
        lastArg(error);
      } else {
        // Re-throw for other handlers
        throw error;
      }
    }
  };

  return descriptor;
}

// Controller with automatic async error handling
export class BaseController {
  protected async handleRequest(
    handler: () => Promise<any>,
    res: Response,
    next: NextFunction
  ) {
    try {
      const result = await handler();
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }
}

// Usage
router.get('/users/:id', asyncWrapper(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw new NotFoundError('User');
  res.json(user);
}));

// With class decorator
class UserController extends BaseController {
  @AsyncError
  async getUser(req: Request, res: Response, next: NextFunction) {
    await this.handleRequest(async () => {
      return await User.findById(req.params.id);
    }, res, next);
  }
}
```

## Usage

1. Install dependencies:
   ```bash
   npm install p-retry p-timeout p-queue
   ```

2. Use appropriate error handling patterns for your async operations

3. Implement circuit breakers for external services

4. Add retry logic for transient failures

## Configuration

### Global Unhandled Rejection Handler
```typescript
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Log to error tracking service
  // Optionally exit process
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  // Log to error tracking service
  // Gracefully shutdown
  process.exit(1);
});
```

### Async Error Monitoring
```typescript
// Track async operation performance
class AsyncMonitor {
  private operations = new Map<string, {
    count: number;
    errors: number;
    totalTime: number;
  }>();

  async monitor<T>(
    name: string,
    operation: () => Promise<T>
  ): Promise<T> {
    const start = Date.now();
    
    try {
      const result = await operation();
      this.recordSuccess(name, Date.now() - start);
      return result;
    } catch (error) {
      this.recordError(name, Date.now() - start);
      throw error;
    }
  }

  private recordSuccess(name: string, time: number) {
    const stats = this.operations.get(name) || 
      { count: 0, errors: 0, totalTime: 0 };
    
    stats.count++;
    stats.totalTime += time;
    
    this.operations.set(name, stats);
  }

  private recordError(name: string, time: number) {
    const stats = this.operations.get(name) || 
      { count: 0, errors: 0, totalTime: 0 };
    
    stats.count++;
    stats.errors++;
    stats.totalTime += time;
    
    this.operations.set(name, stats);
  }

  getStats() {
    const stats: any = {};
    
    for (const [name, data] of this.operations) {
      stats[name] = {
        ...data,
        errorRate: data.errors / data.count,
        avgTime: data.totalTime / data.count
      };
    }
    
    return stats;
  }
}
```

## Example

### Complete Async Error Handling Setup
```typescript
// API service with retry and circuit breaker
class ApiService {
  private breaker = new CircuitBreaker(
    this.makeRequest.bind(this),
    { failureThreshold: 5 }
  );

  async fetchData(endpoint: string): Promise<any> {
    return retry(
      () => this.breaker.execute(endpoint),
      {
        maxAttempts: 3,
        retryCondition: (error) => {
          // Don't retry on 4xx errors
          return !error.message.includes('4');
        }
      }
    );
  }

  private async makeRequest(endpoint: string): Promise<any> {
    const response = await withTimeout(
      fetch(endpoint),
      5000,
      new Error('Request timeout')
    );

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    return response.json();
  }
}

// Use in Express route
router.get('/data', asyncWrapper(async (req, res) => {
  const apiService = new ApiService();
  
  const [data, error] = await safePromise(
    apiService.fetchData('/external-api/data')
  );

  if (error) {
    // Fallback to cache or default
    return res.json({ 
      data: getCachedData(), 
      warning: 'Using cached data' 
    });
  }

  res.json({ data });
}));
```