import { Elysia } from 'elysia';

export const popularSearchesRoutes = new Elysia({ prefix: '/api/v1/search/popular' })
  .get('/', async () => {
    try {
      // Mock popular searches for now
      const popularSearches = [
        { query: 'insulation', count: 1250 },
        { query: 'solar panels', count: 980 },
        { query: 'bamboo flooring', count: 756 },
        { query: 'recycled materials', count: 643 },
        { query: 'low VOC paint', count: 521 },
        { query: 'energy efficient windows', count: 498 },
        { query: 'green roof', count: 432 },
        { query: 'rainwater harvesting', count: 387 },
      ];

      return {
        success: true,
        data: popularSearches,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Popular searches error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch popular searches',
        timestamp: new Date().toISOString(),
      };
    }
  });
