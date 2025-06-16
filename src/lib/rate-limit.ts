import { NextRequest, NextResponse } from 'next/server';

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

// Create a singleton instance
const rateLimitStore = new RateLimitStore({
  interval: 60 * 1000, // 1 minute
  maxRequests: 60, // 60 requests per minute
});

export function withRateLimit(handler: (req: NextRequest) => Promise<NextResponse>) {
  return async (req: NextRequest) => {
    // Get client IP or use a default key
    const ip = req.headers.get('x-forwarded-for') || 'unknown';
    const key = `rate-limit:${ip}`;

    if (rateLimitStore.isRateLimited(key)) {
      const remainingTime = rateLimitStore.getRemainingTime(key);
      return NextResponse.json(
        { error: 'Too many requests' },
        {
          status: 429,
          headers: {
            'Retry-After': Math.ceil(remainingTime / 1000).toString(),
          },
        }
      );
    }

    return handler(req);
  };
} 