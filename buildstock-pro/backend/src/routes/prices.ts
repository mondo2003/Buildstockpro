/**
 * Price API Routes
 * Provides endpoints for accessing and managing scraped price data
 */

import { Elysia, t } from 'elysia';
import { priceScraper } from '../services/priceScraper';
import type { PriceFilters, ScrapingOptions } from '../services/priceScraper';

export const pricesRoutes = new Elysia({ prefix: '/api/prices' })
  .get('/', async ({ query }) => {
    try {
      const filters: PriceFilters = {
        retailer: query.retailer,
        category: query.category,
        minPrice: query.minPrice ? parseFloat(query.minPrice) : undefined,
        maxPrice: query.maxPrice ? parseFloat(query.maxPrice) : undefined,
        inStock: query.inStock === 'true' ? true : query.inStock === 'false' ? false : undefined,
        brand: query.brand,
        search: query.search,
      };

      const prices = await priceScraper.getLatestPrices(filters);

      return {
        success: true,
        count: prices.length,
        data: prices,
      };

    } catch (error) {
      console.error('[API] Error fetching prices:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch prices',
      };
    }
  }, {
    query: t.Object({
      retailer: t.Optional(t.String()),
      category: t.Optional(t.String()),
      minPrice: t.Optional(t.String()),
      maxPrice: t.Optional(t.String()),
      inStock: t.Optional(t.String()),
      brand: t.Optional(t.String()),
      search: t.Optional(t.String()),
    }),
  })

  .get('/stats', async () => {
    try {
      const stats = await priceScraper.getStatistics();

      return {
        success: true,
        data: stats,
      };

    } catch (error) {
      console.error('[API] Error fetching statistics:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch statistics',
      };
    }
  })

  .get('/:retailer', async ({ params, query }) => {
    try {
      const { retailer } = params;
      const { category } = query;

      const prices = await priceScraper.getPricesByRetailer(
        retailer,
        category as string | undefined
      );

      return {
        success: true,
        retailer,
        category: category || 'all',
        count: prices.length,
        data: prices,
      };

    } catch (error) {
      console.error('[API] Error fetching retailer prices:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch retailer prices',
      };
    }
  }, {
    params: t.Object({
      retailer: t.String(),
    }),
    query: t.Object({
      category: t.Optional(t.String()),
    }),
  })

  .get('/:retailer/:category', async ({ params }) => {
    try {
      const { retailer, category } = params;

      const prices = await priceScraper.getPricesByRetailer(retailer, category);

      return {
        success: true,
        retailer,
        category,
        count: prices.length,
        data: prices,
      };

    } catch (error) {
      console.error('[API] Error fetching category prices:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch category prices',
      };
    }
  }, {
    params: t.Object({
      retailer: t.String(),
      category: t.String(),
    }),
  })

  .get('/compare/:productId', async ({ params }) => {
    try {
      const { productId } = params;

      const comparison = await priceScraper.comparePrices(productId);

      if (!comparison) {
        return {
          success: false,
          error: 'No price data found for this product',
        };
      }

      return {
        success: true,
        data: comparison,
      };

    } catch (error) {
      console.error('[API] Error comparing prices:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to compare prices',
      };
    }
  }, {
    params: t.Object({
      productId: t.String(),
    }),
  })

  .get('/history/:retailer/:productId', async ({ params, query }) => {
    try {
      const { retailer, productId } = params;
      const days = query.days ? parseInt(query.days) : 30;

      const history = await priceScraper.getPriceHistory(retailer, productId, days);

      return {
        success: true,
        retailer,
        productId,
        days,
        count: history.length,
        data: history,
      };

    } catch (error) {
      console.error('[API] Error fetching price history:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch price history',
      };
    }
  }, {
    params: t.Object({
      retailer: t.String(),
      productId: t.String(),
    }),
    query: t.Object({
      days: t.Optional(t.String()),
    }),
  })

  .post('/scrape', async ({ body }) => {
    try {
      const options: ScrapingOptions = {
        retailer: body.retailer || 'screwfix',
        category: body.category,
        limit: body.limit || 20,
        useMockData: body.useMockData !== false, // Default to true for now
      };

      console.log('[API] Triggering scrape:', options);

      const result = await priceScraper.triggerScrape(options);

      return result;

    } catch (error) {
      console.error('[API] Error triggering scrape:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to trigger scrape',
      };
    }
  }, {
    body: t.Object({
      retailer: t.Optional(t.String()),
      category: t.Optional(t.String()),
      limit: t.Optional(t.Number()),
      useMockData: t.Optional(t.Boolean()),
    }),
  })

  .post('/product', async ({ body }) => {
    try {
      const { url, retailer, useMockData } = body;

      if (!url || !retailer) {
        return {
          success: false,
          error: 'URL and retailer are required',
        };
      }

      const product = await priceScraper.scrapeProduct(
        url,
        retailer,
        useMockData !== false
      );

      if (!product) {
        return {
          success: false,
          error: 'Failed to scrape product',
        };
      }

      return {
        success: true,
        data: product,
      };

    } catch (error) {
      console.error('[API] Error scraping product:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to scrape product',
      };
    }
  }, {
    body: t.Object({
      url: t.String(),
      retailer: t.String(),
      useMockData: t.Optional(t.Boolean()),
    }),
  })

  .get('/check-batch', async ({ query }) => {
    try {
      const ids = query.ids?.split(',') || [];

      if (ids.length === 0) {
        return {
          success: true,
          data: [],
        };
      }

      // Use mock data for now since database connection has issues
      // When database is fixed, this will use: getPricesBatch(ids)
      const mockPrices = ids.map(id => ({
        product_id: id,
        merchant_id: id.split('-')[0] || 'screwfix',
        price: 20 + Math.random() * 100,
        stock_level: Math.random() > 0.2 ? 'in_stock' : 'out_of_stock',
        scraped_at: new Date().toISOString(),
      }));

      return {
        success: true,
        data: mockPrices,
      };

    } catch (error) {
      console.error('[API] Error checking batch prices:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to check batch prices',
      };
    }
  }, {
    query: t.Object({
      ids: t.Optional(t.String()),
    }),
  })

  .get('/search/:query', async ({ params, query }) => {
    try {
      const { query: searchQuery } = params;
      const filters: PriceFilters = {
        retailer: query.retailer,
        category: query.category,
        minPrice: query.minPrice ? parseFloat(query.minPrice) : undefined,
        maxPrice: query.maxPrice ? parseFloat(query.maxPrice) : undefined,
        inStock: query.inStock === 'true' ? true : query.inStock === 'false' ? false : undefined,
        brand: query.brand,
      };

      const prices = await priceScraper.searchProducts(searchQuery, filters);

      return {
        success: true,
        query: searchQuery,
        count: prices.length,
        data: prices,
      };

    } catch (error) {
      console.error('[API] Error searching products:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to search products',
      };
    }
  }, {
    params: t.Object({
      query: t.String(),
    }),
    query: t.Object({
      retailer: t.Optional(t.String()),
      category: t.Optional(t.String()),
      minPrice: t.Optional(t.String()),
      maxPrice: t.Optional(t.String()),
      inStock: t.Optional(t.String()),
      brand: t.Optional(t.String()),
    }),
  });
