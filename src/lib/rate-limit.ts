import { NextRequest, NextResponse } from 'next/server';
import { createErrorResponse, ErrorType, RateLimitError } from './error-handling';

interface RateLimitConfig {
  interval: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per interval
}

class RateLimitStore {
  private store: Map<string, { count: number; resetTime: number }> = new Map();
  private cleanupInterval: NodeJS.Timeout;

  constructor(private config: RateLimitConfig) {
    // Clean up expired entries every minute
    this.cleanupInterval = setInterval(() => this.cleanup(), 60000);
  }

  private cleanup() {
    const now = Date.now();
    for (const [key, value] of this.store.entries()) {
      if (value.resetTime < now) {
        this.store.delete(key);
      }
    }
  }

  isRateLimited(key: string): boolean {
    const now = Date.now();
    const entry = this.store.get(key);

    if (!entry) {
      this.store.set(key, { count: 1, resetTime: now + this.config.interval });
      return false;
    }

    if (entry.resetTime < now) {
      this.store.set(key, { count: 1, resetTime: now + this.config.interval });
      return false;
    }

    if (entry.count >= this.config.maxRequests) {
      return true;
    }

    entry.count++;
    return false;
  }

  getRemainingTime(key: string): number {
    const entry = this.store.get(key);
    if (!entry) return 0;
    return Math.max(0, entry.resetTime - Date.now());
  }
}

// Create a singleton instance with configurable limits
const rateLimitStore = new RateLimitStore({
  interval: parseInt(process.env.RATE_LIMIT_INTERVAL || '60000', 10), // Default: 1 minute
  maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '60', 10), // Default: 60 requests per minute
});

// Create a stricter rate limit store for cron jobs
const cronRateLimitStore = new RateLimitStore({
  interval: parseInt(process.env.CRON_RATE_LIMIT_INTERVAL || '300000', 10), // Default: 5 minutes
  maxRequests: parseInt(process.env.CRON_RATE_LIMIT_MAX_REQUESTS || '10', 10), // Default: 10 requests per 5 minutes
});

export function withRateLimit(handler: (req: NextRequest) => Promise<NextResponse>) {
  return async (req: NextRequest) => {
    try {
      // Get client IP or use a default key
      const ip = req.headers.get('x-forwarded-for') || 'unknown';
      const key = `rate-limit:${ip}`;

      if (rateLimitStore.isRateLimited(key)) {
        const remainingTime = rateLimitStore.getRemainingTime(key);
        throw new RateLimitError(`Rate limit exceeded. Try again in ${Math.ceil(remainingTime / 1000)} seconds.`);
      }

      return await handler(req);
    } catch (error) {
      if (error instanceof RateLimitError) {
        return createErrorResponse(ErrorType.RATE_LIMIT, error.message);
      }
      throw error; // Re-throw other errors to be handled by the global error handler
    }
  };
}

export function withCronRateLimit(handler: (req: NextRequest) => Promise<NextResponse>) {
  return async (req: NextRequest) => {
    try {
      // Get client IP or use a default key
      const ip = req.headers.get('x-forwarded-for') || 'unknown';
      const key = `cron-rate-limit:${ip}`;

      if (cronRateLimitStore.isRateLimited(key)) {
        const remainingTime = cronRateLimitStore.getRemainingTime(key);
        throw new RateLimitError(`Cron job rate limit exceeded. Try again in ${Math.ceil(remainingTime / 1000)} seconds.`);
      }

      return await handler(req);
    } catch (error) {
      if (error instanceof RateLimitError) {
        return createErrorResponse(ErrorType.RATE_LIMIT, error.message);
      }
      throw error; // Re-throw other errors to be handled by the global error handler
    }
  };
} 