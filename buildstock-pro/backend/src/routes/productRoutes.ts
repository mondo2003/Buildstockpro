import { Elysia } from 'elysia';
import { successResponse, errorResponse, paginatedResponse } from '../utils/response';
import * as productService from '../services/productService';

export function productRoutes(app: Elysia) {
  return app.group('/api/products', (app) => {
    // List products with pagination and filters
    app.get('/', async ({ query }) => {
      try {
        const page = query.page ? parseInt(query.page as string) : 1;
        const limit = query.limit ? parseInt(query.limit as string) : 20;
        const search = query.search as string;
        const category = query.category as string;
        const brand = query.brand as string;
        const sortBy = query.sortBy as string;

        const { products, total } = await productService.getProducts(
          page,
          limit,
          search,
          category,
          brand,
          sortBy
        );

        return paginatedResponse(products, page, limit, total);
      } catch (error) {
        console.error('Error fetching products:', error);
        return errorResponse('Failed to fetch products', (error as Error).message);
      }
    });

    // Get categories - must come before :id to avoid conflicts
    app.get('/meta/categories', async () => {
      try {
        const categories = await productService.getCategories();
        return successResponse(categories);
      } catch (error) {
        console.error('Error fetching categories:', error);
        return errorResponse('Failed to fetch categories', (error as Error).message);
      }
    });

    // Get brands - must come before :id to avoid conflicts
    app.get('/meta/brands', async () => {
      try {
        const brands = await productService.getBrands();
        return successResponse(brands);
      } catch (error) {
        console.error('Error fetching brands:', error);
        return errorResponse('Failed to fetch brands', (error as Error).message);
      }
    });

    // Get product by slug - must come before :id
    app.get('/slug/:slug', async ({ params }) => {
      try {
        const product = await productService.getProductBySlug(params.slug);

        if (!product) {
          return errorResponse('Product not found', 'No product found with the provided slug');
        }

        return successResponse(product);
      } catch (error) {
        console.error('Error fetching product:', error);
        return errorResponse('Failed to fetch product', (error as Error).message);
      }
    });

    // Get single product
    app.get('/:id', async ({ params, query }) => {
      try {
        const includeListings = query.includeListings === 'true';

        if (includeListings) {
          const product = await productService.getProductWithListings(params.id);

          if (!product) {
            return errorResponse('Product not found', 'No product found with the provided ID');
          }

          return successResponse(product);
        } else {
          const product = await productService.getProductById(params.id);

          if (!product) {
            return errorResponse('Product not found', 'No product found with the provided ID');
          }

          return successResponse(product);
        }
      } catch (error) {
        console.error('Error fetching product:', error);
        return errorResponse('Failed to fetch product', (error as Error).message);
      }
    });

    // Get product listings
    app.get('/:id/listings', async ({ params }) => {
      try {
        const listings = await productService.getProductListings(params.id);
        return successResponse(listings);
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
        const limit = query.limit ? parseInt(query.limit as string) : 20;
        const syncStatus = query.syncStatus as string;

        const { merchants, total } = await productService.getMerchants(
          page,
          limit,
          syncStatus
        );

        return paginatedResponse(merchants, page, limit, total);
      } catch (error) {
        console.error('Error fetching merchants:', error);
        return errorResponse('Failed to fetch merchants', (error as Error).message);
      }
    });

    // Get single merchant
    app.get('/:id', async ({ params }) => {
      try {
        const merchant = await productService.getMerchantById(params.id);

        if (!merchant) {
          return errorResponse('Merchant not found', 'No merchant found with the provided ID');
        }

        return successResponse(merchant);
      } catch (error) {
        console.error('Error fetching merchant:', error);
        return errorResponse('Failed to fetch merchant', (error as Error).message);
      }
    });

    // Trigger sync
    app.post('/:id/sync', async ({ params }) => {
      try {
        const syncJob = await productService.triggerMerchantSync(params.id);
        return successResponse(syncJob, 'Sync job created');
      } catch (error) {
        console.error('Error triggering sync:', error);
        return errorResponse('Failed to trigger sync', (error as Error).message);
      }
    });

    // Get merchant sync jobs
    app.get('/:id/sync-jobs', async ({ params, query }) => {
      try {
        const page = query.page ? parseInt(query.page as string) : 1;
        const limit = query.limit ? parseInt(query.limit as string) : 20;
        const offset = (page - 1) * limit;

        const db = await import('../utils/database.js');

        const countResult = await db.queryOne(
          'SELECT COUNT(*) as count FROM sync_jobs WHERE merchant_id = $1',
          [params.id]
        );

        const total = Number(countResult?.count || 0);

        const jobs = await db.query(
          `SELECT * FROM sync_jobs
           WHERE merchant_id = $1
           ORDER BY created_at DESC
           LIMIT $2 OFFSET $3`,
          [params.id, limit, offset]
        );

        return paginatedResponse(jobs, page, limit, total);
      } catch (error) {
        console.error('Error fetching sync jobs:', error);
        return errorResponse('Failed to fetch sync jobs', (error as Error).message);
      }
    });

    return app;
  });
}
