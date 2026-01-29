import { Elysia } from 'elysia';
import { query } from '../utils/database.js';

export const searchSuggestionsRoutes = new Elysia({ prefix: '/api/v1/search/suggestions' })
  .get('/', async ({ query }) => {
    try {
      const { q = '' } = query as any;

      if (!q || q.length < 2) {
        return {
          success: true,
          data: [],
          timestamp: new Date().toISOString(),
        };
      }

      const suggestions = await query(`
        SELECT DISTINCT 
          p.id,
          p.name as text,
          p.category
        FROM products p
        WHERE p.name ILIKE $1 OR p.category ILIKE $1
        ORDER BY p.name
        LIMIT 10
      `, [`%${q}%`]);

      return {
        success: true,
        data: suggestions,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Search suggestions error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch suggestions',
        timestamp: new Date().toISOString(),
      };
    }
  });
