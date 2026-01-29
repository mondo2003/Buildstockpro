import { Elysia } from 'elysia';

export const watchedProductsRoutes = new Elysia({ prefix: '/api/v1/user/watched-products' })
  .get('/', async () => {
    try {
      // Mock watched products
      return {
        success: true,
        data: [
          {
            id: 'prod-1',
            name: 'Recycled Insulation Roll',
            watchedAt: new Date(Date.now() - 86400000).toISOString(),
          },
        ],
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Watched products error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch watched products',
        timestamp: new Date().toISOString(),
      };
    }
  })
  .post('/:id', async ({ params }) => {
    try {
      return {
        success: true,
        message: 'Product added to watchlist',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to add product to watchlist',
        timestamp: new Date().toISOString(),
      };
    }
  })
  .delete('/:id', async ({ params }) => {
    try {
      return {
        success: true,
        message: 'Product removed from watchlist',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to remove product from watchlist',
        timestamp: new Date().toISOString(),
      };
    }
  });
