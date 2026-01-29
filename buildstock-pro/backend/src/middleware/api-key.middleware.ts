import { Elysia } from 'elysia';

export const requireApiKey = new Elysia({ name: 'require-api-key' })
  .derive(({ request }) => {
    return {
      requireApiKey: () => {
        const apiKey = request.headers.get('x-api-key');

        if (!apiKey) {
          throw new Error('API key is required');
        }

        if (apiKey !== process.env.API_SECRET_KEY) {
          throw new Error('Invalid API key');
        }

        return true;
      }
    };
  })
  .onBeforeHandle(({ requireApiKey }) => {
    requireApiKey();
  });
