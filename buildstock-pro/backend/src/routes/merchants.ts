import { Elysia } from 'elysia';
import { supabase } from '../utils/database.js';

export const merchantsRoutes = new Elysia({ prefix: '/api/v1/merchants' })
  .get('/', async ({ query }) => {
    try {
      const page = query.page ? parseInt(query.page as string) : 1;
      const pageSize = query.limit ? parseInt(query.limit as string) : 20;

      const start = (page - 1) * pageSize;
      const end = start + pageSize - 1;

      // Get unique retailers from scraped_prices
      const { data, error } = await supabase
        .from('scraped_prices')
        .select('retailer');

      if (error) {
        throw error;
      }

      // Extract unique retailers
      const uniqueRetailers = [...new Set(data?.map((p: any) => p.retailer) || [])];

      // Pagination for unique retailers
      const paginatedRetailers = uniqueRetailers.slice(start, end + 1);

      const merchants = paginatedRetailers.map(retailer => ({
        id: retailer,
        name: retailer.charAt(0).toUpperCase() + retailer.slice(1),
        website: '',
        isActive: true,
        syncStatus: 'active',
      }));

      const total = uniqueRetailers.length;

      return {
        success: true,
        data: merchants,
        meta: {
          total,
          page,
          pageSize,
          totalPages: Math.ceil(total / pageSize),
        },
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
      // Check if retailer exists in scraped_prices
      const { data, error } = await supabase
        .from('scraped_prices')
        .select('retailer')
        .eq('retailer', params.id)
        .limit(1);

      if (error) {
        throw error;
      }

      if (!data || data.length === 0) {
        return {
          success: false,
          error: 'Merchant not found',
          timestamp: new Date().toISOString(),
        };
      }

      const merchant = {
        id: params.id,
        name: params.id.charAt(0).toUpperCase() + params.id.slice(1),
        website: '',
        isActive: true,
        syncStatus: 'active',
      };

      return {
        success: true,
        data: merchant,
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
