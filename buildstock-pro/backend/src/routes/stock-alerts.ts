import { Elysia } from 'elysia';

export const stockAlertsRoutes = new Elysia({ prefix: '/api/stock-alerts' })
  .get('/', async () => {
    try {
      // Mock stock alerts
      return {
        success: true,
        data: [
          {
            id: 'alert-1',
            productId: 'prod-1',
            productName: 'Recycled Insulation Roll',
            merchantId: 'merchant-1',
            merchantName: 'BuildBase - Camden',
            stockLevel: 'low-stock',
            stockQuantity: 5,
            active: true,
            createdAt: new Date(Date.now() - 86400000).toISOString(),
          },
        ],
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Stock alerts error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch stock alerts',
        timestamp: new Date().toISOString(),
      };
    }
  });
