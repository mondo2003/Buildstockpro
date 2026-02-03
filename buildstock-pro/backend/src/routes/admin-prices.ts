/**
 * Admin Price Data Source Routes
 * Manual triggers, CSV import, and data source management
 */

import { Elysia, t } from 'elysia';
import { priceScraperJobs } from '../jobs/price-scraper-job';
import { savePricesToDatabase, getPriceStatistics } from '../services/priceDatabase';

export const adminPricesRoutes = new Elysia({ prefix: '/api/admin/prices' })

  // Trigger immediate price scrape
  .post('/scrape', async ({ body }) => {
    try {
      const { category, retailers, limit } = body;

      console.log('[Admin] Manual scrape triggered:', { category, retailers, limit });

      let result;
      if (category) {
        result = await priceScraperJobs.scrapeCategory(category, limit || 20);
      } else {
        result = await priceScraperJobs.quickPriceCheck();
      }

      return {
        success: true,
        message: 'Price scrape completed',
        data: result,
      };

    } catch (error) {
      console.error('[Admin] Scrape error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Scrape failed',
      };
    }
  }, {
    body: t.Object({
      category: t.Optional(t.String()),
      retailers: t.Optional(t.Array(t.String())),
      limit: t.Optional(t.Number()),
    }),
  })

  // Trigger full scrape (all categories, all retailers)
  .post('/scrape/full', async () => {
    try {
      console.log('[Admin] Full scrape triggered');

      const result = await priceScraperJobs.fullScrape();

      return {
        success: true,
        message: 'Full scrape completed',
        data: result,
      };

    } catch (error) {
      console.error('[Admin] Full scrape error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Full scrape failed',
      };
    }
  })

  // Import prices from JSON
  .post('/import/json', async ({ body }) => {
    try {
      const { products } = body as { products: any[] };

      console.log(`[Admin] Importing ${products.length} products from JSON`);

      const saved = await savePricesToDatabase(products);

      return {
        success: true,
        message: `Successfully imported ${saved.length}/${products.length} products`,
        imported: saved.length,
        total: products.length,
      };

    } catch (error) {
      console.error('[Admin] JSON import error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Import failed',
      };
    }
  })

  // Import prices from CSV
  .post('/import/csv', async ({ body }) => {
    try {
      const { csv } = body as { csv: string };

      console.log('[Admin] Importing products from CSV');

      const lines = csv.split('\n').filter(line => line.trim());
      const headers = lines[0].split(',').map(h => h.trim());

      const products = [];
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim());
        const product: any = {};

        headers.forEach((header, index) => {
          const value = values[index];
          // Convert to appropriate types
          if (header === 'price') {
            product[header] = parseFloat(value);
          } else if (header === 'in_stock') {
            product[header] = value.toLowerCase() === 'true';
          } else {
            product[header] = value;
          }
        });

        // Validate required fields
        if (product.product_name && product.retailer && product.price) {
          products.push(product);
        }
      }

      console.log(`[Admin] Parsed ${products.length} products from CSV`);

      const saved = await savePricesToDatabase(products);

      return {
        success: true,
        message: `Successfully imported ${saved.length}/${products.length} products`,
        imported: saved.length,
        total: products.length,
      };

    } catch (error) {
      console.error('[Admin] CSV import error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'CSV import failed',
      };
    }
  })

  // Get scraper statistics
  .get('/stats', async () => {
    try {
      const jobStats = priceScraperJobs.getStatistics();
      const dbStats = await getPriceStatistics();

      return {
        success: true,
        data: {
          jobs: jobStats,
          database: dbStats,
        },
      };

    } catch (error) {
      console.error('[Admin] Stats error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get stats',
      };
    }
  })

  // Get scraping schedule
  .get('/schedule', async () => {
    return {
      success: true,
      data: {
        quickPriceCheck: {
          interval: '*/30 * * * *',
          description: 'Every 30 minutes',
          enabled: true,
        },
        fullScrape: {
          interval: '0 */6 * * *',
          description: 'Every 6 hours',
          enabled: true,
        },
        priceHistory: {
          interval: '0 0 * * *',
          description: 'Daily at midnight',
          enabled: true,
        },
        stockAlerts: {
          interval: '0 * * * *',
          description: 'Every hour',
          enabled: true,
        },
      },
    };
  })

  // Add single price manually
  .post('/add', async ({ body }) => {
    try {
      const product = body;

      console.log('[Admin] Adding single product:', product.product_name);

      const saved = await savePricesToDatabase([product]);

      if (saved.length === 0) {
        throw new Error('Failed to save product');
      }

      return {
        success: true,
        message: 'Product added successfully',
        data: saved[0],
      };

    } catch (error) {
      console.error('[Admin] Add product error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to add product',
      };
    }
  }, {
    body: t.Object({
      product_name: t.String(),
      retailer: t.String(),
      retailer_product_id: t.String(),
      price: t.Number(),
      currency: t.Optional(t.String()),
      product_url: t.Optional(t.String()),
      image_url: t.Optional(t.String()),
      brand: t.Optional(t.String()),
      category: t.Optional(t.String()),
      in_stock: t.Optional(t.Boolean()),
      stock_text: t.Optional(t.String()),
    }),
  })

  // Bulk update prices
  .post('/bulk-update', async ({ body }) => {
    try {
      const { updates } = body as { updates: Array<{ retailer_product_id: string; price: number; retailer: string }> };

      console.log(`[Admin] Bulk updating ${updates.length} prices`);

      const products = updates.map(u => ({
        product_name: 'Updated Price', // Will be updated by upsert
        retailer: u.retailer,
        retailer_product_id: u.retailer_product_id,
        price: u.price,
        currency: 'GBP',
        product_url: '',
        image_url: '',
        brand: '',
        category: '',
        in_stock: true,
        stock_text: '',
      }));

      const saved = await savePricesToDatabase(products);

      return {
        success: true,
        message: `Successfully updated ${saved.length}/${updates.length} prices`,
        updated: saved.length,
        total: updates.length,
      };

    } catch (error) {
      console.error('[Admin] Bulk update error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Bulk update failed',
      };
    }
  });
