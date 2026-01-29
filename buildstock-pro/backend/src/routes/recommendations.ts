import { Elysia } from 'elysia';

export const recommendationRoutes = new Elysia({ prefix: '/api/v1/recommendations' })
  .get('/', async () => {
    try {
      // Mock recommendations
      return {
        success: true,
        data: [
          {
            id: 'prod-1',
            name: 'Recycled Insulation Roll',
            category: 'Insulation',
            reason: 'Based on your recent searches',
            score: 0.95,
          },
          {
            id: 'prod-2',
            name: 'Bamboo Flooring',
            category: 'Flooring',
            reason: 'Trending in your area',
            score: 0.88,
          },
        ],
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Recommendations error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch recommendations',
        timestamp: new Date().toISOString(),
      };
    }
  });
