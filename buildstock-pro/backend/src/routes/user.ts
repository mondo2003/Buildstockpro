import { Elysia } from 'elysia';

export const userRoutes = new Elysia({ prefix: '/api/v1/user' })
  .get('/', async () => {
    try {
      // Mock user data
      return {
        success: true,
        data: {
          id: 'user-1',
          email: 'user@example.com',
          name: 'Demo User',
          createdAt: new Date().toISOString(),
        },
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('User error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch user',
        timestamp: new Date().toISOString(),
      };
    }
  })
  .get('/stats', async () => {
    try {
      // Mock user stats
      return {
        success: true,
        data: {
          totalSearches: 142,
          totalOrders: 8,
          totalSpent: 2450.00,
          carbonSaved: 450.5,
          favoriteCategories: ['Insulation', 'Flooring', 'Solar'],
          timestamp: new Date().toISOString(),
        },
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('User stats error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch user stats',
        timestamp: new Date().toISOString(),
      };
    }
  });
