import { EventEmitter } from 'events';
import { v4 as uuidv4 } from 'uuid';
import { CircuitBreaker } from '../utils/CircuitBreaker.js';

/**
 * Event System - Centralized event-driven architecture for Pantheon
 * Provides pub/sub, event sourcing, and async message handling
 */
export class EventSystem extends EventEmitter {
  constructor(config = {}) {
    super();
    
    // Configuration
    this.config = {
      maxListeners: config.maxListeners || 100,
      enableEventSourcing: config.enableEventSourcing !== false,
      enableAsyncProcessing: config.enableAsyncProcessing !== false,
      eventRetention: config.eventRetention || 7 * 24 * 60 * 60 * 1000, // 7 days
      batchSize: config.batchSize || 100,
      processingInterval: config.processingInterval || 1000,
      ...config
    };
    
    // Set max listeners
    this.setMaxListeners(this.config.maxListeners);
    
    // Event store for event sourcing
    this.eventStore = [];
    this.eventIndex = new Map();
    
    // Event subscriptions
    this.subscriptions = new Map();
    this.wildcardSubscriptions = new Set();
    
    // Async event queue
    this.asyncQueue = [];
    this.processing = false;
    
    // Event handlers with middleware
    this.middleware = [];
    this.errorHandlers = [];
    
    // Event channels for topic-based routing
    this.channels = new Map();
    
    // Circuit breaker for external event handlers
    this.circuitBreaker = new CircuitBreaker({
      name: 'event-system',
      failureThreshold: 5,
      timeout: 30000
    });
    
    // Statistics
    this.statistics = {
      totalEvents: 0,
      processedEvents: 0,
      failedEvents: 0,
      queuedEvents: 0,
      subscribers: 0,
      channels: 0
    };
    
    // Initialize default channels
    this.initializeDefaultChannels();
    
    // Start async processor if enabled
    if (this.config.enableAsyncProcessing) {
      this.startAsyncProcessor();
    }
    
    // Setup event sourcing cleanup
    if (this.config.enableEventSourcing) {
      this.setupEventCleanup();
    }
  }
  
  /**
   * Initialize default channels
   */
  initializeDefaultChannels() {
    // System channels
    this.createChannel('system', {
      description: 'System-level events',
      persistent: true
    });
    
    this.createChannel('agents', {
      description: 'Agent-related events',
      persistent: true
    });
    
    this.createChannel('workflows', {
      description: 'Workflow execution events',
      persistent: true
    });
    
    this.createChannel('validation', {
      description: 'Validation events',
      persistent: false
    });
    
    this.createChannel('metrics', {
      description: 'Performance and cost metrics',
      persistent: false
    });
    
    this.createChannel('errors', {
      description: 'Error and exception events',
      persistent: true
    });
  }
  
  /**
   * Create event channel
   */
  createChannel(name, options = {}) {
    if (this.channels.has(name)) {
      return this.channels.get(name);
    }
    
    const channel = {
      name,
      description: options.description || '',
      persistent: options.persistent !== false,
      filters: options.filters || [],
      subscribers: new Set(),
      statistics: {
        events: 0,
        subscribers: 0
      }
    };
    
    this.channels.set(name, channel);
    this.statistics.channels++;
    
    this.emit('channelCreated', {
      name,
      persistent: channel.persistent
    });
    
    return channel;
  }
  
  /**
   * Subscribe to events
   */
  subscribe(pattern, handler, options = {}) {
    const subscriptionId = uuidv4();
    
    const subscription = {
      id: subscriptionId,
      pattern,
      handler,
      channel: options.channel,
      filter: options.filter,
      async: options.async !== false,
      priority: options.priority || 0,
      maxRetries: options.maxRetries || 0,
      createdAt: new Date()
    };
    
    // Add to appropriate collection
    if (pattern === '*' || pattern.includes('*')) {
      this.wildcardSubscriptions.add(subscription);
    } else {
      if (!this.subscriptions.has(pattern)) {
        this.subscriptions.set(pattern, new Set());
      }
      this.subscriptions.get(pattern).add(subscription);
    }
    
    // Add to channel if specified
    if (options.channel) {
      const channel = this.channels.get(options.channel);
      if (channel) {
        channel.subscribers.add(subscriptionId);
        channel.statistics.subscribers++;
      }
    }
    
    this.statistics.subscribers++;
    
    // Set up listener
    this.on(pattern, handler);
    
    this.emit('subscriptionCreated', {
      id: subscriptionId,
      pattern,
      channel: options.channel
    });
    
    return subscriptionId;
  }
  
  /**
   * Unsubscribe from events
   */
  unsubscribe(subscriptionId) {
    let found = false;
    
    // Check regular subscriptions
    for (const [pattern, subs] of this.subscriptions.entries()) {
      for (const sub of subs) {
        if (sub.id === subscriptionId) {
          subs.delete(sub);
          this.off(pattern, sub.handler);
          found = true;
          
          // Remove from channel
          if (sub.channel) {
            const channel = this.channels.get(sub.channel);
            if (channel) {
              channel.subscribers.delete(subscriptionId);
              channel.statistics.subscribers--;
            }
          }
          
          break;
        }
      }
    }
    
    // Check wildcard subscriptions
    for (const sub of this.wildcardSubscriptions) {
      if (sub.id === subscriptionId) {
        this.wildcardSubscriptions.delete(sub);
        this.off(sub.pattern, sub.handler);
        found = true;
        break;
      }
    }
    
    if (found) {
      this.statistics.subscribers--;
      
      this.emit('subscriptionRemoved', {
        id: subscriptionId
      });
    }
    
    return found;
  }
  
  /**
   * Publish event
   */
  async publish(eventName, data = {}, options = {}) {
    const eventId = uuidv4();
    const timestamp = new Date();
    
    const event = {
      id: eventId,
      name: eventName,
      data,
      timestamp,
      channel: options.channel,
      metadata: options.metadata || {},
      correlationId: options.correlationId || null,
      causationId: options.causationId || null
    };
    
    this.statistics.totalEvents++;
    
    // Store event if event sourcing is enabled
    if (this.config.enableEventSourcing) {
      this.storeEvent(event);
    }
    
    // Update channel statistics
    if (options.channel) {
      const channel = this.channels.get(options.channel);
      if (channel) {
        channel.statistics.events++;
      }
    }
    
    // Apply middleware
    for (const middleware of this.middleware) {
      try {
        const result = await middleware(event);
        if (result === false) {
          // Middleware cancelled event
          return null;
        }
      } catch (error) {
        this.handleError(error, event);
      }
    }
    
    // Process async or sync
    if (options.async !== false && this.config.enableAsyncProcessing) {
      this.asyncQueue.push(event);
      this.statistics.queuedEvents++;
      
      this.emit('eventQueued', {
        id: eventId,
        name: eventName,
        queueSize: this.asyncQueue.length
      });
      
      return eventId;
    } else {
      await this.processEvent(event);
      return eventId;
    }
  }
  
  /**
   * Process event
   */
  async processEvent(event) {
    try {
      // Emit to regular subscribers
      await this.emitToSubscribers(event);
      
      // Emit to wildcard subscribers
      await this.emitToWildcardSubscribers(event);
      
      // Emit standard event
      this.emit(event.name, event.data);
      
      this.statistics.processedEvents++;
      
      this.emit('eventProcessed', {
        id: event.id,
        name: event.name
      });
      
    } catch (error) {
      this.statistics.failedEvents++;
      this.handleError(error, event);
    }
  }
  
  /**
   * Emit to subscribers
   */
  async emitToSubscribers(event) {
    const subscribers = this.subscriptions.get(event.name);
    
    if (!subscribers || subscribers.size === 0) {
      return;
    }
    
    // Sort by priority
    const sortedSubscribers = Array.from(subscribers)
      .sort((a, b) => b.priority - a.priority);
    
    for (const subscriber of sortedSubscribers) {
      // Apply filter if specified
      if (subscriber.filter && !subscriber.filter(event)) {
        continue;
      }
      
      // Check channel match
      if (subscriber.channel && subscriber.channel !== event.channel) {
        continue;
      }
      
      try {
        await this.circuitBreaker.execute(
          async () => await subscriber.handler(event.data, event)
        );
      } catch (error) {
        if (subscriber.maxRetries > 0) {
          await this.retryHandler(subscriber, event, subscriber.maxRetries);
        } else {
          this.handleError(error, event, subscriber);
        }
      }
    }
  }
  
  /**
   * Emit to wildcard subscribers
   */
  async emitToWildcardSubscribers(event) {
    for (const subscriber of this.wildcardSubscriptions) {
      // Check pattern match
      if (!this.matchesPattern(event.name, subscriber.pattern)) {
        continue;
      }
      
      // Apply filter if specified
      if (subscriber.filter && !subscriber.filter(event)) {
        continue;
      }
      
      try {
        await subscriber.handler(event.data, event);
      } catch (error) {
        this.handleError(error, event, subscriber);
      }
    }
  }
  
  /**
   * Check if event name matches pattern
   */
  matchesPattern(eventName, pattern) {
    if (pattern === '*') return true;
    
    const regex = new RegExp(
      '^' + pattern.replace(/\*/g, '.*').replace(/\?/g, '.') + '$'
    );
    
    return regex.test(eventName);
  }
  
  /**
   * Retry handler
   */
  async retryHandler(subscriber, event, retries) {
    let lastError;
    
    for (let i = 0; i < retries; i++) {
      try {
        await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, i)));
        await subscriber.handler(event.data, event);
        return;
      } catch (error) {
        lastError = error;
      }
    }
    
    this.handleError(lastError, event, subscriber);
  }
  
  /**
   * Handle error
   */
  handleError(error, event, subscriber = null) {
    const errorEvent = {
      error: error.message,
      stack: error.stack,
      event: event.name,
      eventId: event.id,
      subscriber: subscriber?.id
    };
    
    // Run error handlers
    for (const handler of this.errorHandlers) {
      try {
        handler(errorEvent);
      } catch (handlerError) {
        console.error('Error in error handler:', handlerError);
      }
    }
    
    // Emit error event
    this.emit('error', errorEvent);
    
    // Publish to error channel
    this.publish('system.error', errorEvent, {
      channel: 'errors',
      async: false
    });
  }
  
  /**
   * Add middleware
   */
  use(middleware) {
    if (typeof middleware !== 'function') {
      throw new Error('Middleware must be a function');
    }
    
    this.middleware.push(middleware);
    
    return this;
  }
  
  /**
   * Add error handler
   */
  onError(handler) {
    if (typeof handler !== 'function') {
      throw new Error('Error handler must be a function');
    }
    
    this.errorHandlers.push(handler);
    
    return this;
  }
  
  /**
   * Store event
   */
  storeEvent(event) {
    this.eventStore.push(event);
    
    // Index by correlation ID
    if (event.correlationId) {
      if (!this.eventIndex.has(event.correlationId)) {
        this.eventIndex.set(event.correlationId, []);
      }
      this.eventIndex.get(event.correlationId).push(event);
    }
    
    // Limit store size
    if (this.eventStore.length > 10000) {
      this.eventStore.shift();
    }
  }
  
  /**
   * Get events by correlation ID
   */
  getEventsByCorrelation(correlationId) {
    return this.eventIndex.get(correlationId) || [];
  }
  
  /**
   * Get event history
   */
  getEventHistory(filter = {}) {
    let events = [...this.eventStore];
    
    // Apply filters
    if (filter.name) {
      events = events.filter(e => e.name === filter.name);
    }
    
    if (filter.channel) {
      events = events.filter(e => e.channel === filter.channel);
    }
    
    if (filter.since) {
      events = events.filter(e => e.timestamp > filter.since);
    }
    
    if (filter.until) {
      events = events.filter(e => e.timestamp < filter.until);
    }
    
    // Limit results
    const limit = filter.limit || 100;
    return events.slice(-limit);
  }
  
  /**
   * Replay events
   */
  async replayEvents(filter = {}, handler) {
    const events = this.getEventHistory(filter);
    
    for (const event of events) {
      await handler(event);
    }
    
    return events.length;
  }
  
  /**
   * Start async processor
   */
  startAsyncProcessor() {
    if (this.processing) return;
    
    this.processing = true;
    
    const processQueue = async () => {
      if (!this.processing) return;
      
      if (this.asyncQueue.length > 0) {
        const batch = this.asyncQueue.splice(0, this.config.batchSize);
        
        for (const event of batch) {
          await this.processEvent(event);
          this.statistics.queuedEvents--;
        }
      }
      
      setTimeout(processQueue, this.config.processingInterval);
    };
    
    processQueue();
  }
  
  /**
   * Stop async processor
   */
  stopAsyncProcessor() {
    this.processing = false;
  }
  
  /**
   * Setup event cleanup
   */
  setupEventCleanup() {
    setInterval(() => {
      const cutoff = new Date(Date.now() - this.config.eventRetention);
      
      // Clean event store
      this.eventStore = this.eventStore.filter(e => e.timestamp > cutoff);
      
      // Clean index
      for (const [correlationId, events] of this.eventIndex.entries()) {
        const filtered = events.filter(e => e.timestamp > cutoff);
        if (filtered.length === 0) {
          this.eventIndex.delete(correlationId);
        } else {
          this.eventIndex.set(correlationId, filtered);
        }
      }
      
      this.emit('eventCleanup', {
        removed: this.eventStore.length,
        timestamp: new Date()
      });
      
    }, 60 * 60 * 1000); // Run hourly
  }
  
  /**
   * Create event stream
   */
  createEventStream(filter = {}) {
    const stream = new EventEmitter();
    
    const handler = (data, event) => {
      if (!filter.name || event.name === filter.name) {
        if (!filter.channel || event.channel === filter.channel) {
          stream.emit('data', event);
        }
      }
    };
    
    this.subscribe('*', handler, {
      async: false
    });
    
    stream.close = () => {
      this.off('*', handler);
    };
    
    return stream;
  }
  
  /**
   * Wait for event
   */
  async waitForEvent(eventName, timeout = 30000) {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        this.off(eventName, handler);
        reject(new Error(`Timeout waiting for event: ${eventName}`));
      }, timeout);
      
      const handler = (data) => {
        clearTimeout(timer);
        resolve(data);
      };
      
      this.once(eventName, handler);
    });
  }
  
  /**
   * Get statistics
   */
  getStatistics() {
    return {
      ...this.statistics,
      eventStore: this.eventStore.length,
      middleware: this.middleware.length,
      errorHandlers: this.errorHandlers.length,
      asyncQueueSize: this.asyncQueue.length,
      channels: Array.from(this.channels.values()).map(c => ({
        name: c.name,
        events: c.statistics.events,
        subscribers: c.statistics.subscribers
      })),
      circuitBreaker: this.circuitBreaker.getStatus()
    };
  }
  
  /**
   * Reset system
   */
  reset() {
    // Clear all subscriptions
    this.subscriptions.clear();
    this.wildcardSubscriptions.clear();
    
    // Clear event store
    this.eventStore = [];
    this.eventIndex.clear();
    
    // Clear async queue
    this.asyncQueue = [];
    
    // Reset statistics
    this.statistics = {
      totalEvents: 0,
      processedEvents: 0,
      failedEvents: 0,
      queuedEvents: 0,
      subscribers: 0,
      channels: this.channels.size
    };
    
    // Reset channels
    for (const channel of this.channels.values()) {
      channel.subscribers.clear();
      channel.statistics = {
        events: 0,
        subscribers: 0
      };
    }
    
    this.emit('systemReset', {
      timestamp: new Date()
    });
  }
}

// Singleton instance
let eventSystemInstance = null;

/**
 * Get or create event system instance
 */
export function getEventSystem() {
  if (!eventSystemInstance) {
    eventSystemInstance = new EventSystem();
  }
  return eventSystemInstance;
}

export default EventSystem;