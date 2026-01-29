import { Elysia } from 'elysia';

export const analyticsRoutes = new Elysia({ prefix: '/api/analytics' })
  .get('/search', async () => {
    try {
      // Mock analytics data
      return {
        success: true,
        data: {
          totalSearches: 15420,
          uniqueUsers: 3280,
          topSearches: [
            { term: 'insulation', count: 1250 },
            { term: 'solar panels', count: 980 },
            { term: 'bamboo flooring', count: 756 },
          ],
          averageResultsPerSearch: 23.4,
          timestamp: new Date().toISOString(),
        },
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Analytics error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch analytics',
        timestamp: new Date().toISOString(),
      };
    }
  });
