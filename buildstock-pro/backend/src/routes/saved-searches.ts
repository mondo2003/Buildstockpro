import { Elysia } from 'elysia';

export const savedSearchesRoutes = new Elysia({ prefix: '/api/v1/saved-searches' })
  .get('/', async () => {
    try {
      // Mock saved searches
      return {
        success: true,
        data: [
          {
            id: 'search-1',
            query: 'insulation',
            filters: { category: 'Insulation', ecoRating: 'A' },
            createdAt: new Date(Date.now() - 86400000).toISOString(),
          },
        ],
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Saved searches error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch saved searches',
        timestamp: new Date().toISOString(),
      };
    }
  })
  .post('/', async () => {
    try {
      return {
        success: true,
        message: 'Search saved',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to save search',
        timestamp: new Date().toISOString(),
      };
    }
  })
  .delete('/:id', async ({ params }) => {
    try {
      return {
        success: true,
        message: 'Saved search deleted',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete saved search',
        timestamp: new Date().toISOString(),
      };
    }
  });
