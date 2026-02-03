/**
 * Cache Service
 * Provides in-memory caching with TTL support for improved search performance
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  hits: number;
}

interface CacheStats {
  hits: number;
  misses: number;
  sets: number;
  deletes: number;
  size: number;
}

interface CacheMetrics {
  hitRate: number;
  avgHitTime: number;
  avgMissTime: number;
  totalRequests: number;
}

export class CacheService {
  private cache: Map<string, CacheEntry<any>>;
  private stats: CacheStats;
  private timings: { hits: number[]; misses: number[] };

  constructor() {
    this.cache = new Map();
    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0,
      size: 0,
    };
    this.timings = {
      hits: [],
      misses: [],
    };

    // Cleanup expired entries every 5 minutes
    setInterval(() => this.cleanup(), 5 * 60 * 1000);

    // Log stats every minute
    setInterval(() => this.logStats(), 60 * 1000);

    console.log('[CacheService] Initialized with TTL=10 minutes');
  }

  /**
   * Generate cache key from query parameters
   */
  generateKey(prefix: string, params: Record<string, any>): string {
    const sortedParams = Object.keys(params)
      .sort()
      .map(key => `${key}=${JSON.stringify(params[key])}`)
      .join('&');

    return `${prefix}:${sortedParams}`;
  }

  /**
   * Get value from cache
   */
  get<T>(key: string, ttl: number = 10 * 60 * 1000): T | null {
    const startTime = Date.now();

    const entry = this.cache.get(key);

    if (!entry) {
      this.stats.misses++;
      const missTime = Date.now() - startTime;
      this.timings.misses.push(missTime);
      if (this.timings.misses.length > 100) this.timings.misses.shift();
      return null;
    }

    const age = Date.now() - entry.timestamp;

    // Check if expired
    if (age > ttl) {
      this.cache.delete(key);
      this.stats.misses++;
      this.stats.deletes++;
      const missTime = Date.now() - startTime;
      this.timings.misses.push(missTime);
      if (this.timings.misses.length > 100) this.timings.misses.shift();
      return null;
    }

    // Cache hit
    this.stats.hits++;
    entry.hits++;
    const hitTime = Date.now() - startTime;
    this.timings.hits.push(hitTime);
    if (this.timings.hits.length > 100) this.timings.hits.shift();

    console.log(`[CacheService] HIT: ${key} (age: ${Math.round(age / 1000)}s, hits: ${entry.hits})`);
    return entry.data as T;
  }

  /**
   * Set value in cache
   */
  set<T>(key: string, data: T): void {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      hits: 0,
    };

    this.cache.set(key, entry);
    this.stats.sets++;
    this.stats.size = this.cache.size;

    console.log(`[CacheService] SET: ${key} (total entries: ${this.cache.size})`);
  }

  /**
   * Delete specific key from cache
   */
  delete(key: string): boolean {
    const deleted = this.cache.delete(key);
    if (deleted) {
      this.stats.deletes++;
      this.stats.size = this.cache.size;
      console.log(`[CacheService] DELETE: ${key}`);
    }
    return deleted;
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    const size = this.cache.size;
    this.cache.clear();
    this.stats.deletes += size;
    this.stats.size = 0;
    console.log(`[CacheService] CLEAR: removed ${size} entries`);
  }

  /**
   * Clear cache entries by prefix
   */
  clearPrefix(prefix: string): number {
    let count = 0;
    for (const key of this.cache.keys()) {
      if (key.startsWith(prefix)) {
        this.cache.delete(key);
        count++;
      }
    }
    this.stats.deletes += count;
    this.stats.size = this.cache.size;
    console.log(`[CacheService] CLEAR_PREFIX: ${prefix} - removed ${count} entries`);
    return count;
  }

  /**
   * Cleanup expired entries
   */
  private cleanup(ttl: number = 10 * 60 * 1000): void {
    const now = Date.now();
    let cleaned = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > ttl) {
        this.cache.delete(key);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      this.stats.deletes += cleaned;
      this.stats.size = this.cache.size;
      console.log(`[CacheService] CLEANUP: removed ${cleaned} expired entries`);
    }
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    return { ...this.stats };
  }

  /**
   * Get cache metrics
   */
  getMetrics(): CacheMetrics {
    const totalRequests = this.stats.hits + this.stats.misses;
    const hitRate = totalRequests > 0 ? (this.stats.hits / totalRequests) * 100 : 0;

    const avgHitTime =
      this.timings.hits.length > 0
        ? this.timings.hits.reduce((a, b) => a + b, 0) / this.timings.hits.length
        : 0;

    const avgMissTime =
      this.timings.misses.length > 0
        ? this.timings.misses.reduce((a, b) => a + b, 0) / this.timings.misses.length
        : 0;

    return {
      hitRate: Math.round(hitRate * 100) / 100,
      avgHitTime: Math.round(avgHitTime * 100) / 100,
      avgMissTime: Math.round(avgMissTime * 100) / 100,
      totalRequests,
    };
  }

  /**
   * Log current cache statistics
   */
  logStats(): void {
    const metrics = this.getMetrics();
    console.log('[CacheService] Stats:', {
      entries: this.stats.size,
      hits: this.stats.hits,
      misses: this.stats.misses,
      hitRate: `${metrics.hitRate}%`,
      avgHitTime: `${metrics.avgHitTime}ms`,
      avgMissTime: `${metrics.avgMissTime}ms`,
    });
  }

  /**
   * Get detailed cache information
   */
  getCacheInfo(): {
    stats: CacheStats;
    metrics: CacheMetrics;
    entries: Array<{ key: string; age: number; hits: number }>;
  } {
    const entries = Array.from(this.cache.entries()).map(([key, entry]) => ({
      key,
      age: Date.now() - entry.timestamp,
      hits: entry.hits,
    }));

    return {
      stats: this.getStats(),
      metrics: this.getMetrics(),
      entries,
    };
  }
}

// Export singleton instance
export const cacheService = new CacheService();

// Export convenience functions for search caching
export function createSearchCacheKey(params: {
  query?: string;
  category?: string;
  min_price?: number;
  max_price?: number;
  in_stock?: boolean;
  sort_by?: string;
  page?: number;
  page_size?: number;
}): string {
  return cacheService.generateKey('search', params);
}
