import { Elysia } from 'elysia';
import { query } from '../utils/database.js';

export const merchantsRoutes = new Elysia({ prefix: '/api/v1/merchants' })
  .get('/', async () => {
    try {
      const merchants = await query(`
        SELECT 
          id, name, email, phone, website, address, latitude, longitude,
          sync_enabled, sync_url, last_sync_at, created_at, updated_at
        FROM merchants
        ORDER BY name
      `);

      return {
        success: true,
        data: merchants,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Merchants error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch merchants',
        timestamp: new Date().toISOString(),
      };
    }
  })
  .get('/:id', async ({ params }) => {
    try {
      const merchant = await query(`
        SELECT 
          id, name, email, phone, website, address, latitude, longitude,
          sync_enabled, sync_url, last_sync_at, created_at, updated_at
        FROM merchants
        WHERE id = $1
      `, [params.id]);

      if (!merchant || merchant.length === 0) {
        return {
          success: false,
          error: 'Merchant not found',
          timestamp: new Date().toISOString(),
        };
      }

      return {
        success: true,
        data: merchant[0],
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Merchant error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch merchant',
        timestamp: new Date().toISOString(),
      };
    }
  });
