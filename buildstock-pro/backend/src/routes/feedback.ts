import { Elysia, t } from 'elysia';

export const feedbackRoutes = new Elysia({ prefix: '/api/v1/feedback' })
  .post('/', async ({ body }) => {
    try {
      // In production, this would save feedback to database
      console.log('Feedback received:', body);

      return {
        success: true,
        message: 'Thank you for your feedback!',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Feedback error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to submit feedback',
        timestamp: new Date().toISOString(),
      };
    }
  }, {
    body: t.Object({
      type: t.String(),
      rating: t.Optional(t.Number()),
      message: t.String(),
      email: t.Optional(t.String()),
    }),
  });
