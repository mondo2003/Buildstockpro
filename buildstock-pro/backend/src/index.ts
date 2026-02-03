import * as Sentry from '@sentry/bun';
import { Elysia, t } from 'elysia';
import { cors } from '@elysiajs/cors';
import { jwt } from '@elysiajs/jwt';
import { bearer } from '@elysiajs/bearer';
import { productRoutes } from './routes/productRoutes';
import { searchRoutes } from './routes/search';
import { searchSuggestionsRoutes } from './routes/search-suggestions';
import { popularSearchesRoutes } from './routes/popular-searches';
import { analyticsRoutes } from './routes/analytics';
import { notificationRoutes } from './routes/notifications';
import { recommendationRoutes } from './routes/recommendations';
import { watchedProductsRoutes } from './routes/watched-products';
import { savedSearchesRoutes } from './routes/saved-searches';
import { priceAlertsRoutes } from './routes/price-alerts';
import { stockAlertsRoutes } from './routes/stock-alerts';
import { userRoutes } from './routes/user';
import { userPreferencesRoutes } from './routes/user-preferences';
import { adminRoutes } from './routes/adminRoutes';
import { merchantsRoutes } from './routes/merchants';
import { merchantContactRoutes } from './routes/merchantContact';
import { sentryTestRoutes } from './routes/sentry-test';
import { feedbackRoutes } from './routes/feedback';
import { pricesRoutes } from './routes/prices';
import { adminPricesRoutes } from './routes/admin-prices';
import { adminCacheRoutes } from './routes/admin-cache';
import { quoteRoutes } from './routes/quotes';
import { bulkOrdersRoutes } from './routes/bulkOrders';
import { syncService } from './services/sync.service';
import { jobScheduler } from './jobs/scheduler';
import { requireApiKey } from './middleware/api-key.middleware';

// Initialize Sentry
if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.SENTRY_ENVIRONMENT || process.env.NODE_ENV || 'development',

    // Performance monitoring
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

    // Filter out sensitive data
    beforeSend(event, hint) {
      // Don't send events in development if you prefer
      if (process.env.NODE_ENV === 'development') {
        console.error('Sentry Event:', event);
        console.error('Sentry Hint:', hint);
      }

      // Remove sensitive data from request headers
      if (event.request?.headers) {
        delete event.request.headers['authorization'];
        delete event.request.headers['cookie'];
        delete event.request.headers['x-api-key'];
      }

      // Remove sensitive data from user data
      if (event.user) {
        delete event.user.email;
        delete event.user.ip_address;
      }

      // Remove sensitive data from extra data
      if (event.extra) {
        delete event.extra.password;
        delete event.extra.token;
        delete event.extra.apiKey;
      }

      return event;
    },

    beforeSendTransaction(event) {
      if (event.request?.headers) {
        delete event.request.headers['authorization'];
        delete event.request.headers['cookie'];
        delete event.request.headers['x-api-key'];
      }
      return event;
    },
  });

  console.log('Sentry initialized successfully');
} else {
  console.warn('SENTRY_DSN not found - Sentry monitoring disabled');
}

const PORT = process.env.PORT || 3001;
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:3000';

const app = new Elysia()
  .onError(({ code, error, request }) => {
    Sentry.captureException(error instanceof Error ? error : new Error(String(error)), {
      level: 'error',
      tags: {
        error_code: code,
        method: request.method,
        path: new URL(request.url).pathname,
      },
    });

    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`Error (${code}):`, errorMessage);

    return {
      success: false,
      error: errorMessage || 'An unexpected error occurred',
      code,
    };
  })
  .use(cors({
    origin: CORS_ORIGIN,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }))
  .use(
    jwt({
      name: 'jwt',
      secret: process.env.JWT_SECRET || 'dev-secret-key',
    })
  )
  .use(bearer())
  .get('/', () => ({
    success: true,
    message: 'BuildStock Pro API',
    version: '0.1.0',
    timestamp: new Date().toISOString(),
  }))
  .get('/health', () => ({
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString(),
  }))
  .get('/api/v1', () => ({
    success: true,
    message: 'BuildStock Pro API v1',
    endpoints: {
      auth: '/api/v1/auth',
      users: '/api/v1/users',
      merchants: '/api/v1/merchants',
      products: '/api/products',
      search: '/api/v1/search',
      'search-suggestions': '/api/v1/search/suggestions',
      'popular-searches': '/api/v1/search/popular',
      searches: '/api/v1/searches',
      'saved-searches': '/api/v1/saved-searches',
      'watched-products': '/api/v1/user/watched-products',
      'price-alerts': '/api/price-alerts',
      'stock-alerts': '/api/stock-alerts',
      alerts: '/api/v1/alerts',
      preferences: '/api/v1/user/preferences',
      stats: '/api/v1/user/stats',
      analytics: '/api/analytics/search',
      feedback: '/api/v1/feedback',
      prices: '/api/prices',
      'admin-cache': '/api/v1/admin/cache',
      quotes: '/api/v1/quotes',
      'bulk-orders': '/api/v1/bulk-orders',
      'merchant-contact': '/api/v1/merchant/contact',
      'merchant-branches': '/api/v1/merchant/:merchantId/branches',
    },
  }))
  // Mount route groups
  .use(productRoutes)
  .use(searchRoutes)
  .use(searchSuggestionsRoutes)
  .use(popularSearchesRoutes)
  .use(analyticsRoutes)
  .use(notificationRoutes)
  .use(recommendationRoutes)
  .use(watchedProductsRoutes)
  .use(savedSearchesRoutes)
  .use(priceAlertsRoutes)
  .use(stockAlertsRoutes)
  .use(userRoutes)
  .use(userPreferencesRoutes)
  .use(adminRoutes)
  .use(sentryTestRoutes)
  .use(feedbackRoutes)
  .use(pricesRoutes)
  .use(adminPricesRoutes)
  .use(adminCacheRoutes)
  .use(merchantsRoutes)
  .use(merchantContactRoutes)
  .use(quoteRoutes)
  .use(bulkOrdersRoutes)
  // Auth routes (placeholder for future use)
  .group('/api/v1/auth', (app) =>
    app
      .post('/register', async ({ body }) => {
        return {
          success: false,
          error: 'Not implemented yet',
        };
      })
      .post('/login', async ({ body, jwt }) => {
        return {
          success: false,
          error: 'Not implemented yet',
        };
      })
  )
  // Sync routes (protected with API key)
  .group('/api/v1/sync', (app) =>
    app
      .use(requireApiKey)
      .post('/trigger', async () => {
        try {
          const results = await syncService.syncAllMerchants();
          return {
            success: true,
            data: results,
          };
        } catch (error) {
          console.error('Error triggering sync:', error);
          return {
            success: false,
            error: 'Failed to trigger sync',
          };
        }
      })
      .post('/trigger/:merchant', async ({ params }) => {
        try {
          const result = await syncService.syncMerchant(params.merchant);
          return {
            success: true,
            data: result,
          };
        } catch (error) {
          console.error('Error triggering merchant sync:', error);
          return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
          };
        }
      })
  )
  .listen(PORT);

// Start periodic sync
console.log('Starting merchant data sync service...');
syncService.startPeriodicSync();

// Start background jobs
console.log('Starting background job scheduler...');
jobScheduler.start().catch((error) => {
  console.error('Failed to start job scheduler:', error);
});

console.log(`🦊 Elysia is running at http://${app.server?.hostname}:${app.server?.port}`);

export default app;
