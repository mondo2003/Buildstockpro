import { Elysia } from 'elysia';
import { successResponse, errorResponse, paginatedResponse } from '../utils/response';
import { supabase } from '../utils/database.js';

export function productRoutes(app: Elysia) {
  return app.group('/api/products', (app) => {
    // List products with pagination and filters
    app.get('/', async ({ query }) => {
      try {
        const page = query.page ? parseInt(query.page as string) : 1;
        const pageSize = query.limit ? parseInt(query.limit as string) : 20;
        const search = query.search as string;
        const category = query.category as string;
        const brand = query.brand as string;
        const sortBy = query.sortBy as string;

        const start = (page - 1) * pageSize;
        const end = start + pageSize - 1;

        // Build query
        let dbQuery = supabase
          .from('scraped_prices')
          .select('*', { count: 'exact' });

        // Apply filters
        if (search) {
          dbQuery = dbQuery.ilike('product_name', `%${search}%`);
        }

        if (category) {
          dbQuery = dbQuery.eq('category', category);
        }

        if (brand) {
          dbQuery = dbQuery.eq('brand', brand);
        }

        // Apply sorting
        switch (sortBy) {
          case 'price_asc':
            dbQuery = dbQuery.order('price', { ascending: true });
            break;
          case 'price_desc':
            dbQuery = dbQuery.order('price', { ascending: false });
            break;
          case 'name_asc':
            dbQuery = dbQuery.order('product_name', { ascending: true });
            break;
          case 'name_desc':
            dbQuery = dbQuery.order('product_name', { ascending: false });
            break;
          default:
            dbQuery = dbQuery.order('scraped_at', { ascending: false });
        }

        // Apply pagination
        dbQuery = dbQuery.range(start, end);

        const { data: products, error, count } = await dbQuery;

        if (error) {
          throw error;
        }

        const total = count || 0;

        // Format response to match frontend expectations
        const formattedData = (products || []).map((p: any) => ({
          product: {
            id: p.id,
            name: p.product_name,
            sku: p.retailer_product_id || '',
            category: p.category || '',
            description: p.stock_text || '',
            specifications: p.brand || '',
            images: p.image_url || '',
            created_at: p.created_at,
            updated_at: p.updated_at,
          },
          listing: {
            id: p.id,
            productId: p.id,
            merchantId: p.retailer,
            price: p.price?.toString() || '0',
            currency: p.currency || 'GBP',
            stockLevel: p.in_stock ? 1 : 0,
            lastUpdated: p.scraped_at,
            productUrl: p.product_url,
          },
          merchant: {
            id: p.retailer,
            name: p.retailer.charAt(0).toUpperCase() + p.retailer.slice(1),
            website: '',
            isActive: true,
          },
        }));

        return {
          success: true,
          data: formattedData,
          meta: {
            total,
            page,
            pageSize,
            totalPages: Math.ceil(total / pageSize),
          },
        };
      } catch (error) {
        console.error('Error fetching products:', error);
        return errorResponse('Failed to fetch products', (error as Error).message);
      }
    });

    // Get categories - must come before :id to avoid conflicts
    app.get('/meta/categories', async () => {
      try {
        const { data, error } = await supabase
          .from('scraped_prices')
          .select('category');

        if (error) {
          throw error;
        }

        // Extract unique categories
        const categories = [...new Set(data?.map((p: any) => p.category).filter(Boolean) || [])];

        return successResponse(categories);
      } catch (error) {
        console.error('Error fetching categories:', error);
        return errorResponse('Failed to fetch categories', (error as Error).message);
      }
    });

    // Get brands - must come before :id to avoid conflicts
    app.get('/meta/brands', async () => {
      try {
        const { data, error } = await supabase
          .from('scraped_prices')
          .select('brand');

        if (error) {
          throw error;
        }

        // Extract unique brands
        const brands = [...new Set(data?.map((p: any) => p.brand).filter(Boolean) || [])];

        return successResponse(brands);
      } catch (error) {
        console.error('Error fetching brands:', error);
        return errorResponse('Failed to fetch brands', (error as Error).message);
      }
    });

    // Get single product
    app.get('/:id', async ({ params }) => {
      try {
        const { data, error } = await supabase
          .from('scraped_prices')
          .select('*')
          .eq('id', params.id)
          .single();

        if (error || !data) {
          return errorResponse('Product not found', 'No product found with the provided ID');
        }

        const p = data;
        const formattedProduct = {
          product: {
            id: p.id,
            name: p.product_name,
            sku: p.retailer_product_id || '',
            category: p.category || '',
            description: p.stock_text || '',
            specifications: p.brand || '',
            images: p.image_url || '',
            created_at: p.created_at,
            updated_at: p.updated_at,
          },
          listing: {
            id: p.id,
            productId: p.id,
            merchantId: p.retailer,
            price: p.price?.toString() || '0',
            currency: p.currency || 'GBP',
            stockLevel: p.in_stock ? 1 : 0,
            lastUpdated: p.scraped_at,
            productUrl: p.product_url,
          },
          merchant: {
            id: p.retailer,
            name: p.retailer.charAt(0).toUpperCase() + p.retailer.slice(1),
            website: '',
            isActive: true,
          },
        };

        return successResponse(formattedProduct);
      } catch (error) {
        console.error('Error fetching product:', error);
        return errorResponse('Failed to fetch product', (error as Error).message);
      }
    });

    // Get product listings
    app.get('/:id/listings', async ({ params }) => {
      try {
        const { data, error } = await supabase
          .from('scraped_prices')
          .select('*')
          .eq('id', params.id);

        if (error) {
          throw error;
        }

        if (!data || data.length === 0) {
          return errorResponse('Listings not found', 'No listings found for this product');
        }

        const p = data[0];
        const listing = {
          id: p.id,
          productId: p.id,
          merchantId: p.retailer,
          price: p.price?.toString() || '0',
          currency: p.currency || 'GBP',
          stockLevel: p.in_stock ? 1 : 0,
          lastUpdated: p.scraped_at,
          productUrl: p.product_url,
        };

        return successResponse([listing]);
      } catch (error) {
        console.error('Error fetching listings:', error);
        return errorResponse('Failed to fetch listings', (error as Error).message);
      }
    });

    return app;
  });
}

export function merchantRoutes(app: Elysia) {
  return app.group('/api/merchants', (app) => {
    // List merchants
    app.get('/', async ({ query }) => {
      try {
        const page = query.page ? parseInt(query.page as string) : 1;
        const pageSize = query.limit ? parseInt(query.limit as string) : 20;

        const start = (page - 1) * pageSize;
        const end = start + pageSize - 1;

        // Get unique retailers from scraped_prices
        const { data, error, count } = await supabase
          .from('scraped_prices')
          .select('retailer', { count: 'exact' });

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
        };
      } catch (error) {
        console.error('Error fetching merchants:', error);
        return errorResponse('Failed to fetch merchants', (error as Error).message);
      }
    });

    // Get single merchant
    app.get('/:id', async ({ params }) => {
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
          return errorResponse('Merchant not found', 'No merchant found with the provided ID');
        }

        const merchant = {
          id: params.id,
          name: params.id.charAt(0).toUpperCase() + params.id.slice(1),
          website: '',
          isActive: true,
          syncStatus: 'active',
        };

        return successResponse(merchant);
      } catch (error) {
        console.error('Error fetching merchant:', error);
        return errorResponse('Failed to fetch merchant', (error as Error).message);
      }
    });

    return app;
  });
}
