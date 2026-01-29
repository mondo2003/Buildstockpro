import { Elysia } from 'elysia';

export const priceAlertsRoutes = new Elysia({ prefix: '/api/price-alerts' })
  .get('/', async () => {
    try {
      // Mock price alerts
      return {
        success: true,
        data: [
          {
            id: 'alert-1',
            productId: 'prod-1',
            productName: 'Recycled Insulation Roll',
            targetPrice: 25,
            currentPrice: 28.50,
            active: true,
            createdAt: new Date(Date.now() - 86400000).toISOString(),
          },
        ],
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Price alerts error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch price alerts',
        timestamp: new Date().toISOString(),
      };
    }
  })
  .post('/', async () => {
    try {
      return {
        success: true,
        message: 'Price alert created',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create price alert',
        timestamp: new Date().toISOString(),
      };
    }
  });
