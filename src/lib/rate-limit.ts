// Simple in-memory rate limiting
interface RateLimitConfig {
  requests: number;
  windowMs: number;
}

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

class RateLimiter {
  private store: RateLimitStore = {};
  private config: RateLimitConfig;

  constructor(config: RateLimitConfig) {
    this.config = config;
  }

  check(key: string): {
    allowed: boolean;
    remaining: number;
    resetTime: number;
  } {
    const now = Date.now();
    const record = this.store[key];

    // Clean up old records periodically (simple garbage collection)
    if (Math.random() < 0.01) {
      // 1% chance to clean up
      this.cleanup();
    }

    if (!record || now > record.resetTime) {
      // New window or reset
      this.store[key] = {
        count: 1,
        resetTime: now + this.config.windowMs,
      };
      return {
        allowed: true,
        remaining: this.config.requests - 1,
        resetTime: now + this.config.windowMs,
      };
    }

    if (record.count >= this.config.requests) {
      // Rate limited
      return {
        allowed: false,
        remaining: 0,
        resetTime: record.resetTime,
      };
    }

    // Increment and allow
    record.count++;
    return {
      allowed: true,
      remaining: this.config.requests - record.count,
      resetTime: record.resetTime,
    };
  }

  private cleanup() {
    const now = Date.now();
    for (const key in this.store) {
      if (this.store[key].resetTime < now) {
        delete this.store[key];
      }
    }
  }
}

// Rate limit configurations - EASY TO CHANGE!
export const rateLimitConfig = {
  // AI Justify - more frequent
  aiJustify: {
    requests: 10, // 10 requests
    windowMs: 60000, // per minute (60,000 ms)
  },
  // AI Custom - less frequent (more expensive)
  aiCustom: {
    requests: 5, // 5 requests
    windowMs: 60000, // per minute
  },
};

// Create rate limiters
export const aiJustifyLimiter = new RateLimiter(rateLimitConfig.aiJustify);
export const aiCustomLimiter = new RateLimiter(rateLimitConfig.aiCustom);
