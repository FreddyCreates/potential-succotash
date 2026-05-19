/**
 * Dark Queue Protocol (DRK-010)
 * 
 * Priority queue management for dark layer task processing.
 * Phi-weighted priorities, silent execution.
 * 
 * Protocol ID: DRK-010
 * Category: Dark Core
 * Status: Active
 */

const PHI = 1.618033988749895;
const HB = 873;
const THRESHOLD = 1 / PHI;

/**
 * Queue priorities
 */
export const QUEUE_PRIORITIES = {
  CRITICAL: 0,
  URGENT: 1,
  HIGH: 2,
  NORMAL: 3,
  LOW: 4,
  BACKGROUND: 5
};

/**
 * Task states
 */
export const TASK_STATES = {
  PENDING: 'pending',
  RUNNING: 'running',
  COMPLETED: 'completed',
  FAILED: 'failed',
  CANCELLED: 'cancelled'
};

/**
 * Dark Task
 */
export class DarkTask {
  constructor(handler, options = {}) {
    this.id = `task-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    this.handler = handler;
    this.priority = options.priority ?? QUEUE_PRIORITIES.NORMAL;
    this.state = TASK_STATES.PENDING;
    this.data = options.data || {};
    this.created = Date.now();
    this.started = null;
    this.completed = null;
    this.result = null;
    this.error = null;
    this.retries = 0;
    this.maxRetries = options.maxRetries || 3;
    this.timeout = options.timeout || 30000;
  }
  
  /**
   * Execute task
   */
  async execute() {
    this.state = TASK_STATES.RUNNING;
    this.started = Date.now();
    
    try {
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Task timeout')), this.timeout);
      });
      
      this.result = await Promise.race([
        this.handler(this.data),
        timeoutPromise
      ]);
      
      this.state = TASK_STATES.COMPLETED;
    } catch (err) {
      this.error = err.message;
      this.state = TASK_STATES.FAILED;
    }
    
    this.completed = Date.now();
    return this;
  }
  
  /**
   * Check if can retry
   */
  canRetry() {
    return this.state === TASK_STATES.FAILED && this.retries < this.maxRetries;
  }
  
  /**
   * Retry task
   */
  retry() {
    if (!this.canRetry()) return false;
    
    this.retries++;
    this.state = TASK_STATES.PENDING;
    this.error = null;
    this.result = null;
    this.started = null;
    this.completed = null;
    
    return true;
  }
  
  /**
   * Cancel task
   */
  cancel() {
    if (this.state === TASK_STATES.PENDING) {
      this.state = TASK_STATES.CANCELLED;
      return true;
    }
    return false;
  }
}

/**
 * Dark Priority Queue
 */
export class DarkPriorityQueue {
  constructor(config = {}) {
    this.config = {
      maxSize: config.maxSize || 10000,
      concurrency: config.concurrency || 4,
      processingInterval: config.processingInterval || HB / PHI,
      ...config
    };
    
    this.queues = new Map();
    for (const priority of Object.values(QUEUE_PRIORITIES)) {
      this.queues.set(priority, []);
    }
    
    this.running = new Map();
    this.completed = [];
    this.failed = [];
    
    this.stats = {
      enqueued: 0,
      processed: 0,
      failed: 0,
      retried: 0
    };
  }
  
  /**
   * Enqueue a task
   */
  enqueue(handler, options = {}) {
    const task = handler instanceof DarkTask 
      ? handler 
      : new DarkTask(handler, options);
    
    // Check capacity
    if (this.size() >= this.config.maxSize) {
      // Drop lowest priority task
      this.dropLowest();
    }
    
    const queue = this.queues.get(task.priority);
    queue.push(task);
    this.stats.enqueued++;
    
    return task.id;
  }
  
  /**
   * Dequeue highest priority task
   */
  dequeue() {
    for (const priority of Object.values(QUEUE_PRIORITIES)) {
      const queue = this.queues.get(priority);
      if (queue.length > 0) {
        return queue.shift();
      }
    }
    return null;
  }
  
  /**
   * Drop lowest priority task
   */
  dropLowest() {
    for (let i = Object.values(QUEUE_PRIORITIES).length - 1; i >= 0; i--) {
      const queue = this.queues.get(i);
      if (queue.length > 0) {
        queue.pop();
        return true;
      }
    }
    return false;
  }
  
  /**
   * Process tasks
   */
  async process() {
    const available = this.config.concurrency - this.running.size;
    const tasks = [];
    
    for (let i = 0; i < available; i++) {
      const task = this.dequeue();
      if (!task) break;
      tasks.push(task);
    }
    
    // Execute tasks
    const promises = tasks.map(async (task) => {
      this.running.set(task.id, task);
      
      await task.execute();
      
      this.running.delete(task.id);
      
      if (task.state === TASK_STATES.COMPLETED) {
        this.completed.push(task);
        this.stats.processed++;
        
        // Limit completed history
        while (this.completed.length > 1000) {
          this.completed.shift();
        }
      } else if (task.state === TASK_STATES.FAILED) {
        if (task.canRetry()) {
          task.retry();
          this.enqueue(task);
          this.stats.retried++;
        } else {
          this.failed.push(task);
          this.stats.failed++;
        }
      }
      
      return task;
    });
    
    return Promise.all(promises);
  }
  
  /**
   * Get queue size
   */
  size() {
    let total = 0;
    for (const queue of this.queues.values()) {
      total += queue.length;
    }
    return total;
  }
  
  /**
   * Get task by ID
   */
  getTask(taskId) {
    // Check running
    if (this.running.has(taskId)) {
      return this.running.get(taskId);
    }
    
    // Check queues
    for (const queue of this.queues.values()) {
      const task = queue.find(t => t.id === taskId);
      if (task) return task;
    }
    
    // Check completed
    const completed = this.completed.find(t => t.id === taskId);
    if (completed) return completed;
    
    // Check failed
    const failed = this.failed.find(t => t.id === taskId);
    if (failed) return failed;
    
    return null;
  }
  
  /**
   * Cancel task
   */
  cancelTask(taskId) {
    const task = this.getTask(taskId);
    if (task) {
      return task.cancel();
    }
    return false;
  }
  
  /**
   * Clear all queues
   */
  clear() {
    for (const queue of this.queues.values()) {
      queue.length = 0;
    }
    this.completed = [];
    this.failed = [];
  }
  
  /**
   * Get statistics
   */
  getStats() {
    const queueSizes = {};
    for (const [priority, queue] of this.queues) {
      queueSizes[priority] = queue.length;
    }
    
    return {
      ...this.stats,
      queued: this.size(),
      running: this.running.size,
      completedHistory: this.completed.length,
      failedHistory: this.failed.length,
      byPriority: queueSizes
    };
  }
}

/**
 * Dark Queue Protocol
 */
export const DarkQueueProtocol = {
  id: 'DRK-010',
  name: 'Dark Queue Protocol',
  version: '1.0.0',
  category: 'dark-core',
  
  constants: { PHI, HB, THRESHOLD },
  priorities: QUEUE_PRIORITIES,
  states: TASK_STATES,
  
  createTask: (handler, options) => new DarkTask(handler, options),
  createQueue: (config) => new DarkPriorityQueue(config)
};

export default DarkQueueProtocol;
