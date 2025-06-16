/**
 * Caching utility for the application
 * Provides different caching strategies and cache management
 */

interface CacheOptions {
  ttl?: number // Time to live in milliseconds
  maxSize?: number // Maximum number of items in cache
}

interface CacheEntry<T> {
  value: T
  timestamp: number
  expiresAt?: number
}

class Cache {
  private static instance: Cache
  private cache: Map<string, CacheEntry<any>>
  private readonly defaultTTL: number = 5 * 60 * 1000 // 5 minutes
  private readonly defaultMaxSize: number = 1000

  private constructor() {
    this.cache = new Map()
  }

  /**
   * Get the singleton instance of the cache
   */
  public static getInstance(): Cache {
    if (!Cache.instance) {
      Cache.instance = new Cache()
    }
    return Cache.instance
  }

  /**
   * Get a value from the cache
   * @param key - The cache key
   * @returns The cached value or undefined if not found or expired
   */
  public get<T>(key: string): T | undefined {
    const entry = this.cache.get(key)
    
    if (!entry) {
      return undefined
    }

    // Check if entry has expired
    if (entry.expiresAt && entry.expiresAt < Date.now()) {
      this.cache.delete(key)
      return undefined
    }

    return entry.value
  }

  /**
   * Set a value in the cache
   * @param key - The cache key
   * @param value - The value to cache
   * @param options - Cache options
   */
  public set<T>(key: string, value: T, options: CacheOptions = {}): void {
    const { ttl = this.defaultTTL, maxSize = this.defaultMaxSize } = options

    // Check if we need to remove old entries
    if (this.cache.size >= maxSize) {
      this.evictOldest()
    }

    const entry: CacheEntry<T> = {
      value,
      timestamp: Date.now(),
      expiresAt: ttl ? Date.now() + ttl : undefined,
    }

    this.cache.set(key, entry)
  }

  /**
   * Remove a value from the cache
   * @param key - The cache key
   */
  public delete(key: string): void {
    this.cache.delete(key)
  }

  /**
   * Clear all values from the cache
   */
  public clear(): void {
    this.cache.clear()
  }

  /**
   * Get the current size of the cache
   */
  public size(): number {
    return this.cache.size
  }

  /**
   * Check if a key exists in the cache and is not expired
   * @param key - The cache key
   */
  public has(key: string): boolean {
    const entry = this.cache.get(key)
    if (!entry) {
      return false
    }
    if (entry.expiresAt && entry.expiresAt < Date.now()) {
      this.cache.delete(key)
      return false
    }
    return true
  }

  /**
   * Get all keys in the cache
   */
  public keys(): string[] {
    return Array.from(this.cache.keys())
  }

  /**
   * Remove the oldest entry from the cache
   */
  private evictOldest(): void {
    let oldestKey: string | undefined
    let oldestTimestamp = Infinity

    for (const [key, entry] of this.cache.entries()) {
      if (entry.timestamp < oldestTimestamp) {
        oldestTimestamp = entry.timestamp
        oldestKey = key
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey)
    }
  }
}

// Export a singleton instance
export const cache = Cache.getInstance()

/**
 * Create a memoized function that caches its results
 * @param fn - The function to memoize
 * @param options - Cache options
 * @returns A memoized version of the function
 */
export function memoize<T extends (...args: any[]) => any>(
  fn: T,
  options: CacheOptions = {}
): T {
  return ((...args: Parameters<T>): ReturnType<T> => {
    const key = JSON.stringify(args)
    const cached = cache.get<ReturnType<T>>(key)
    
    if (cached !== undefined) {
      return cached
    }

    const result = fn(...args)
    cache.set(key, result, options)
    return result
  }) as T
} 