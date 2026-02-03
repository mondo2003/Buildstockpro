import { Elysia, t } from 'elysia';
import { cacheService } from '../services/cacheService.js';

/**
 * Admin routes for cache management
 * Requires Bearer token for authentication
 */
export const adminCacheRoutes = new Elysia({ prefix: '/api/v1/admin/cache' })
  .get('/', async () => {
    try {
      const info = cacheService.getCacheInfo();

      return {
        success: true,
        data: {
          stats: info.stats,
          metrics: info.metrics,
          entries: info.entries.length,
          topEntries: info.entries
            .sort((a, b) => b.hits - a.hits)
            .slice(0, 10)
            .map(({ key, age, hits }) => ({ key, age: `${Math.round(age / 1000)}s`, hits })),
        },
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('[AdminCache] Error getting cache info:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get cache info',
        timestamp: new Date().toISOString(),
      };
    }
  })

  .delete('/', async () => {
    try {
      cacheService.clear();

      return {
        success: true,
        message: 'Cache cleared successfully',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('[AdminCache] Error clearing cache:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to clear cache',
        timestamp: new Date().toISOString(),
      };
    }
  })

  .delete(
    '/prefix/:prefix',
    async ({ params }) => {
      try {
        const { prefix } = params;
        const count = cacheService.clearPrefix(prefix);

        return {
          success: true,
          message: `Cleared ${count} cache entries with prefix: ${prefix}`,
          data: { count },
          timestamp: new Date().toISOString(),
        };
      } catch (error) {
        console.error('[AdminCache] Error clearing cache prefix:', error);
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Failed to clear cache prefix',
          timestamp: new Date().toISOString(),
        };
      }
    },
    {
      params: t.Object({
        prefix: t.String(),
      }),
    }
  );
