/**
 * Dark Rate Limiter Protocol (DRK-028)
 * 
 * Rate limiting for the dark layer. Silent throttling
 * without revealing protection mechanisms.
 * 
 * Protocol ID: DRK-028
 * Category: Dark Operations
 * Status: Active
 */

const PHI = 1.618033988749895;
const HB = 873;
const THRESHOLD = 1 / PHI;

/**
 * Rate limit strategies
 */
export const RATE_STRATEGIES = {
  FIXED_WINDOW: 'fixed-window',
  SLIDING_WINDOW: 'sliding-window',
  TOKEN_BUCKET: 'token-bucket',
  LEAKY_BUCKET: 'leaky-bucket'
};

/**
 * Rate limit actions
 */
export const RATE_ACTIONS = {
  ALLOW: 'allow',
  THROTTLE: 'throttle',
  BLOCK: 'block',
  QUEUE: 'queue'
};

/**
 * Fixed Window Rate Limiter
 */
export class FixedWindowLimiter {
  constructor(limit, windowMs) {
    this.limit = limit;
    this.windowMs = windowMs;
    this.windows = new Map();
  }
  
  check(key) {
    const now = Date.now();
    const windowStart = Math.floor(now / this.windowMs) * this.windowMs;
    const windowKey = `${key}:${windowStart}`;
    
    const current = this.windows.get(windowKey) || 0;
    
    // Cleanup old windows
    for (const [k] of this.windows) {
      const ts = parseInt(k.split(':')[1]);
      if (ts < windowStart - this.windowMs) {
        this.windows.delete(k);
      }
    }
    
    if (current >= this.limit) {
      return {
        allowed: false,
        remaining: 0,
        resetAt: windowStart + this.windowMs
      };
    }
    
    this.windows.set(windowKey, current + 1);
    
    return {
      allowed: true,
      remaining: this.limit - current - 1,
      resetAt: windowStart + this.windowMs
    };
  }
}

/**
 * Sliding Window Rate Limiter
 */
export class SlidingWindowLimiter {
  constructor(limit, windowMs) {
    this.limit = limit;
    this.windowMs = windowMs;
    this.requests = new Map();
  }
  
  check(key) {
    const now = Date.now();
    const windowStart = now - this.windowMs;
    
    // Get or create request list
    if (!this.requests.has(key)) {
      this.requests.set(key, []);
    }
    
    const reqs = this.requests.get(key);
    
    // Remove old requests
    while (reqs.length > 0 && reqs[0] < windowStart) {
      reqs.shift();
    }
    
    if (reqs.length >= this.limit) {
      return {
        allowed: false,
        remaining: 0,
        resetAt: reqs[0] + this.windowMs
      };
    }
    
    reqs.push(now);
    
    return {
      allowed: true,
      remaining: this.limit - reqs.length,
      resetAt: now + this.windowMs
    };
  }
}

/**
 * Token Bucket Rate Limiter
 */
export class TokenBucketLimiter {
  constructor(capacity, refillRate, refillInterval) {
    this.capacity = capacity;
    this.refillRate = refillRate;
    this.refillInterval = refillInterval;
    this.buckets = new Map();
  }
  
  getBucket(key) {
    if (!this.buckets.has(key)) {
      this.buckets.set(key, {
        tokens: this.capacity,
        lastRefill: Date.now()
      });
    }
    return this.buckets.get(key);
  }
  
  refill(bucket) {
    const now = Date.now();
    const elapsed = now - bucket.lastRefill;
    const refills = Math.floor(elapsed / this.refillInterval);
    
    if (refills > 0) {
      bucket.tokens = Math.min(this.capacity, bucket.tokens + refills * this.refillRate);
      bucket.lastRefill = now;
    }
  }
  
  check(key, cost = 1) {
    const bucket = this.getBucket(key);
    this.refill(bucket);
    
    if (bucket.tokens >= cost) {
      bucket.tokens -= cost;
      return {
        allowed: true,
        remaining: bucket.tokens,
        resetAt: Date.now() + this.refillInterval
      };
    }
    
    return {
      allowed: false,
      remaining: bucket.tokens,
      resetAt: bucket.lastRefill + this.refillInterval
    };
  }
}

/**
 * Dark Rate Limiter
 */
export class DarkRateLimiter {
  constructor(config = {}) {
    this.config = {
      strategy: config.strategy || RATE_STRATEGIES.SLIDING_WINDOW,
      limit: config.limit || 100,
      windowMs: config.windowMs || 60000,
      ...config
    };
    
    this.limiter = this.createLimiter();
    
    this.stats = {
      total: 0,
      allowed: 0,
      blocked: 0,
      byKey: new Map()
    };
  }
  
  createLimiter() {
    switch (this.config.strategy) {
      case RATE_STRATEGIES.FIXED_WINDOW:
        return new FixedWindowLimiter(this.config.limit, this.config.windowMs);
      
      case RATE_STRATEGIES.SLIDING_WINDOW:
        return new SlidingWindowLimiter(this.config.limit, this.config.windowMs);
      
      case RATE_STRATEGIES.TOKEN_BUCKET:
        return new TokenBucketLimiter(
          this.config.capacity || this.config.limit,
          this.config.refillRate || 1,
          this.config.refillInterval || 1000
        );
      
      default:
        return new SlidingWindowLimiter(this.config.limit, this.config.windowMs);
    }
  }
  
  /**
   * Check rate limit
   */
  check(key) {
    this.stats.total++;
    
    const result = this.limiter.check(key);
    
    if (result.allowed) {
      this.stats.allowed++;
    } else {
      this.stats.blocked++;
    }
    
    // Track by key
    if (!this.stats.byKey.has(key)) {
      this.stats.byKey.set(key, { allowed: 0, blocked: 0 });
    }
    const keyStats = this.stats.byKey.get(key);
    if (result.allowed) {
      keyStats.allowed++;
    } else {
      keyStats.blocked++;
    }
    
    return {
      ...result,
      action: result.allowed ? RATE_ACTIONS.ALLOW : RATE_ACTIONS.BLOCK
    };
  }
  
  /**
   * Get stats for key
   */
  getKeyStats(key) {
    return this.stats.byKey.get(key) || { allowed: 0, blocked: 0 };
  }
  
  /**
   * Get overall statistics
   */
  getStats() {
    return {
      total: this.stats.total,
      allowed: this.stats.allowed,
      blocked: this.stats.blocked,
      blockRate: this.stats.total > 0
        ? (this.stats.blocked / this.stats.total * 100).toFixed(2) + '%'
        : 'N/A',
      uniqueKeys: this.stats.byKey.size
    };
  }
}

/**
 * Multi-Tier Rate Limiter
 */
export class MultiTierRateLimiter {
  constructor(tiers = []) {
    this.tiers = tiers.length > 0 ? tiers : [
      { name: 'second', limit: 10, windowMs: 1000 },
      { name: 'minute', limit: 100, windowMs: 60000 },
      { name: 'hour', limit: 1000, windowMs: 3600000 }
    ];
    
    this.limiters = this.tiers.map(tier => ({
      name: tier.name,
      limiter: new DarkRateLimiter({
        strategy: RATE_STRATEGIES.SLIDING_WINDOW,
        limit: tier.limit,
        windowMs: tier.windowMs
      })
    }));
  }
  
  /**
   * Check all tiers
   */
  check(key) {
    for (const { name, limiter } of this.limiters) {
      const result = limiter.check(key);
      if (!result.allowed) {
        return {
          allowed: false,
          blockedBy: name,
          ...result
        };
      }
    }
    
    return {
      allowed: true,
      remaining: Math.min(...this.limiters.map(l => l.limiter.check(key).remaining))
    };
  }
  
  /**
   * Get all stats
   */
  getStats() {
    return this.limiters.map(({ name, limiter }) => ({
      tier: name,
      ...limiter.getStats()
    }));
  }
}

/**
 * Dark Rate Limiter Protocol
 */
export const DarkRateLimiterProtocol = {
  id: 'DRK-028',
  name: 'Dark Rate Limiter Protocol',
  version: '1.0.0',
  category: 'dark-operations',
  
  constants: { PHI, HB, THRESHOLD },
  strategies: RATE_STRATEGIES,
  actions: RATE_ACTIONS,
  
  createLimiter: (config) => new DarkRateLimiter(config),
  createMultiTier: (tiers) => new MultiTierRateLimiter(tiers),
  createFixedWindow: (limit, windowMs) => new FixedWindowLimiter(limit, windowMs),
  createSlidingWindow: (limit, windowMs) => new SlidingWindowLimiter(limit, windowMs),
  createTokenBucket: (capacity, rate, interval) => new TokenBucketLimiter(capacity, rate, interval)
};

export default DarkRateLimiterProtocol;
