import { Elysia } from 'elysia';
import { query } from '../utils/database.js';

export const notificationRoutes = new Elysia({ prefix: '/api/v1/notifications' })
  .get('/', async () => {
    try {
      // Mock notifications
      return {
        success: true,
        data: [
          {
            id: '1',
            type: 'price_drop',
            title: 'Price Drop Alert',
            message: 'Recycled Insulation Roll price dropped by 15%',
            productId: 'prod-1',
            read: false,
            createdAt: new Date().toISOString(),
          },
          {
            id: '2',
            type: 'back_in_stock',
            title: 'Back in Stock',
            message: 'Bamboo Flooring is now available at BuildBase - Camden',
            productId: 'prod-2',
            read: true,
            createdAt: new Date(Date.now() - 86400000).toISOString(),
          },
        ],
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Notifications error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch notifications',
        timestamp: new Date().toISOString(),
      };
    }
  })
  .post('/:id/read', async ({ params }) => {
    try {
      return {
        success: true,
        message: 'Notification marked as read',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to mark notification as read',
        timestamp: new Date().toISOString(),
      };
    }
  });
