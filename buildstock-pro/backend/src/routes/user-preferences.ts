import { Elysia } from 'elysia';

export const userPreferencesRoutes = new Elysia({ prefix: '/api/v1/user/preferences' })
  .get('/', async () => {
    try {
      // Mock user preferences
      return {
        success: true,
        data: {
          notifications: {
            priceDrops: true,
            backInStock: true,
            stockAlerts: false,
            recommendations: true,
          },
          search: {
            defaultSort: 'relevance',
            resultsPerPage: 20,
          },
          location: {
            latitude: 51.5074,
            longitude: -0.1278,
            radius: 50,
          },
        },
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('User preferences error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch user preferences',
        timestamp: new Date().toISOString(),
      };
    }
  })
  .put('/', async () => {
    try {
      return {
        success: true,
        message: 'Preferences updated',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update preferences',
        timestamp: new Date().toISOString(),
      };
    }
  });
