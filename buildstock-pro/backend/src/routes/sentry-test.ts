import { Elysia } from 'elysia';
import * as Sentry from '@sentry/bun';

export const sentryTestRoutes = new Elysia({ prefix: '/api/v1/test' })
  .get('/sentry', async () => {
    try {
      // Test Sentry by capturing an exception
      Sentry.captureException(new Error('Test Sentry error from /api/v1/test/sentry'));

      return {
        success: true,
        message: 'Sentry test error sent',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Sentry test error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Sentry test failed',
        timestamp: new Date().toISOString(),
      };
    }
  });
