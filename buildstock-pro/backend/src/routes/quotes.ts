import { Elysia, t } from 'elysia';
import { quoteService } from '../services/quoteService';
import { successResponse, errorResponse } from '../utils/response';

// Validation schemas
const quoteItemSchema = t.Object({
  scraped_price_id: t.Optional(t.String()),
  product_name: t.String(),
  retailer: t.String(),
  quantity: t.Integer({ minimum: 1 }),
  unit_price: t.Number({ minimum: 0 }),
  total_price: t.Number({ minimum: 0 }),
  notes: t.Optional(t.String()),
});

const createQuoteSchema = t.Object({
  title: t.String(),
  delivery_location: t.Optional(t.String()),
  delivery_postcode: t.Optional(t.String()),
  notes: t.Optional(t.String()),
  expires_at: t.Optional(t.String()),
  response_deadline: t.Optional(t.String()),
  items: t.Optional(t.Array(quoteItemSchema)),
});

const updateQuoteSchema = t.Object({
  title: t.Optional(t.String()),
  delivery_location: t.Optional(t.String()),
  delivery_postcode: t.Optional(t.String()),
  notes: t.Optional(t.String()),
  expires_at: t.Optional(t.String()),
  response_deadline: t.Optional(t.String()),
});

const addQuoteItemSchema = t.Object({
  scraped_price_id: t.Optional(t.String()),
  product_name: t.String(),
  retailer: t.String(),
  quantity: t.Integer({ minimum: 1 }),
  unit_price: t.Number({ minimum: 0 }),
  total_price: t.Number({ minimum: 0 }),
  notes: t.Optional(t.String()),
});

const quoteResponseSchema = t.Object({
  responder_name: t.String(),
  responder_email: t.String({ format: 'email' }),
  response_message: t.Optional(t.String()),
  quoted_total: t.Optional(t.Number({ minimum: 0 })),
  valid_until: t.Optional(t.String()),
});

const updateStatusSchema = t.Object({
  status: t.Enum({
    pending: 'pending',
    sent: 'sent',
    responded: 'responded',
    expired: 'expired',
    cancelled: 'cancelled',
  }),
});

export function quoteRoutes(app: Elysia) {
  return app.group('/api/v1/quotes', (app) => {
    // Create a new quote
    app.post('/', async ({ body, bearertoken }) => {
      try {
        // TODO: Extract user_id from JWT token
        // For now, using a mock user ID
        const userId = 'mock-user-id';

        const quoteData = body as any;

        // Add user_id to the data
        quoteData.user_id = userId;

        const quote = await quoteService.createQuote(quoteData);

        if (!quote) {
          return errorResponse('Failed to create quote', 'Could not create quote');
        }

        return successResponse(quote, 'Quote created successfully');

      } catch (error) {
        console.error('Error creating quote:', error);
        return errorResponse(
          'Failed to create quote',
          error instanceof Error ? error.message : 'Unknown error'
        );
      }
    }, {
      body: createQuoteSchema,
      detail: {
        description: 'Create a new quote request with items',
        tags: ['Quotes'],
      }
    });

    // List user's quotes with pagination and filters
    app.get('/', async ({ query, bearertoken }) => {
      try {
        // TODO: Extract user_id from JWT token
        const userId = 'mock-user-id';

        const filters = {
          status: query.status as any,
          page: query.page ? parseInt(query.page as string) : undefined,
          page_size: query.page_size ? parseInt(query.page_size as string) : undefined,
          sort: query.sort as any,
          order: query.order as any,
        };

        const result = await quoteService.getQuotes(userId, filters);

        return successResponse(result.data, 'Quotes retrieved successfully');

      } catch (error) {
        console.error('Error fetching quotes:', error);
        return errorResponse(
          'Failed to fetch quotes',
          error instanceof Error ? error.message : 'Unknown error'
        );
      }
    }, {
      query: t.Object({
        status: t.Optional(t.Enum({
          pending: 'pending',
          sent: 'sent',
          responded: 'responded',
          expired: 'expired',
          cancelled: 'cancelled',
        })),
        page: t.Optional(t.String()),
        page_size: t.Optional(t.String()),
        sort: t.Optional(t.Enum({
          created_at: 'created_at',
          updated_at: 'updated_at',
          expires_at: 'expires_at',
          title: 'title',
        })),
        order: t.Optional(t.Enum({
          asc: 'asc',
          desc: 'desc',
        })),
      }),
      detail: {
        description: 'Get all quotes for the current user with pagination and filters',
        tags: ['Quotes'],
      }
    });

    // Get a single quote by ID
    app.get('/:id', async ({ params, bearertoken }) => {
      try {
        // TODO: Extract user_id from JWT token
        const userId = 'mock-user-id';

        const quote = await quoteService.getQuoteById(params.id, userId);

        if (!quote) {
          return errorResponse('Quote not found', 'No quote found with the provided ID');
        }

        return successResponse(quote, 'Quote retrieved successfully');

      } catch (error) {
        console.error('Error fetching quote:', error);
        return errorResponse(
          'Failed to fetch quote',
          error instanceof Error ? error.message : 'Unknown error'
        );
      }
    }, {
      params: t.Object({
        id: t.String(),
      }),
      detail: {
        description: 'Get a single quote by ID',
        tags: ['Quotes'],
      }
    });

    // Update a quote
    app.put('/:id', async ({ params, body, bearertoken }) => {
      try {
        // TODO: Extract user_id from JWT token
        const userId = 'mock-user-id';

        const updates = body as any;

        const quote = await quoteService.updateQuote(params.id, userId, updates);

        if (!quote) {
          return errorResponse('Quote not found', 'No quote found with the provided ID');
        }

        return successResponse(quote, 'Quote updated successfully');

      } catch (error) {
        console.error('Error updating quote:', error);
        return errorResponse(
          'Failed to update quote',
          error instanceof Error ? error.message : 'Unknown error'
        );
      }
    }, {
      params: t.Object({
        id: t.String(),
      }),
      body: updateQuoteSchema,
      detail: {
        description: 'Update quote details',
        tags: ['Quotes'],
      }
    });

    // Update quote status
    app.patch('/:id/status', async ({ params, body, bearertoken }) => {
      try {
        // TODO: Extract user_id from JWT token
        const userId = 'mock-user-id';

        const statusData = body as any;

        const quote = await quoteService.updateQuoteStatus(params.id, userId, statusData.status);

        if (!quote) {
          return errorResponse('Quote not found', 'No quote found with the provided ID');
        }

        return successResponse(quote, 'Quote status updated successfully');

      } catch (error) {
        console.error('Error updating quote status:', error);
        return errorResponse(
          'Failed to update quote status',
          error instanceof Error ? error.message : 'Unknown error'
        );
      }
    }, {
      params: t.Object({
        id: t.String(),
      }),
      body: updateStatusSchema,
      detail: {
        description: 'Update the status of a quote',
        tags: ['Quotes'],
      }
    });

    // Delete/cancel a quote
    app.delete('/:id', async ({ params, bearertoken }) => {
      try {
        // TODO: Extract user_id from JWT token
        const userId = 'mock-user-id';

        const success = await quoteService.deleteQuote(params.id, userId);

        if (!success) {
          return errorResponse('Quote not found', 'No quote found with the provided ID');
        }

        return successResponse(null, 'Quote deleted successfully');

      } catch (error) {
        console.error('Error deleting quote:', error);
        return errorResponse(
          'Failed to delete quote',
          error instanceof Error ? error.message : 'Unknown error'
        );
      }
    }, {
      params: t.Object({
        id: t.String(),
      }),
      detail: {
        description: 'Delete/cancel a quote',
        tags: ['Quotes'],
      }
    });

    // Add an item to a quote
    app.post('/:id/items', async ({ params, body, bearertoken }) => {
      try {
        // TODO: Extract user_id from JWT token
        const userId = 'mock-user-id';

        // First check user owns the quote
        const ownsQuote = await quoteService.checkUserOwnsQuote(params.id, userId);
        if (!ownsQuote) {
          return errorResponse('Unauthorized', 'You do not own this quote');
        }

        const itemData = body as any;
        const item = await quoteService.addQuoteItem(params.id, itemData);

        if (!item) {
          return errorResponse('Failed to add item', 'Could not add item to quote');
        }

        return successResponse(item, 'Item added successfully');

      } catch (error) {
        console.error('Error adding quote item:', error);
        return errorResponse(
          'Failed to add item',
          error instanceof Error ? error.message : 'Unknown error'
        );
      }
    }, {
      params: t.Object({
        id: t.String(),
      }),
      body: addQuoteItemSchema,
      detail: {
        description: 'Add an item to a quote',
        tags: ['Quotes', 'Items'],
      }
    });

    // Remove an item from a quote
    app.delete('/:id/items/:itemId', async ({ params, bearertoken }) => {
      try {
        // TODO: Extract user_id from JWT token
        const userId = 'mock-user-id';

        const success = await quoteService.removeQuoteItem(params.itemId, userId);

        if (!success) {
          return errorResponse('Item not found', 'No item found with the provided ID');
        }

        return successResponse(null, 'Item removed successfully');

      } catch (error) {
        console.error('Error removing quote item:', error);
        return errorResponse(
          'Failed to remove item',
          error instanceof Error ? error.message : 'Unknown error'
        );
      }
    }, {
      params: t.Object({
        id: t.String(),
        itemId: t.String(),
      }),
      detail: {
        description: 'Remove an item from a quote',
        tags: ['Quotes', 'Items'],
      }
    });

    // Add a merchant response to a quote (public endpoint)
    app.post('/:id/respond', async ({ params, body }) => {
      try {
        const responseData = body as any;
        const response = await quoteService.addQuoteResponse(params.id, responseData);

        if (!response) {
          return errorResponse('Quote not found', 'No quote found with the provided ID');
        }

        return successResponse(response, 'Response added successfully');

      } catch (error) {
        console.error('Error adding quote response:', error);
        return errorResponse(
          'Failed to add response',
          error instanceof Error ? error.message : 'Unknown error'
        );
      }
    }, {
      params: t.Object({
        id: t.String(),
      }),
      body: quoteResponseSchema,
      detail: {
        description: 'Add a merchant response to a quote (public endpoint)',
        tags: ['Quotes', 'Responses'],
      }
    });

    // Get quote statistics
    app.get('/stats/summary', async ({ bearertoken }) => {
      try {
        // TODO: Extract user_id from JWT token
        const userId = 'mock-user-id';

        const stats = await quoteService.getQuoteStats(userId);

        return successResponse(stats, 'Quote statistics retrieved successfully');

      } catch (error) {
        console.error('Error fetching quote stats:', error);
        return errorResponse(
          'Failed to fetch statistics',
          error instanceof Error ? error.message : 'Unknown error'
        );
      }
    }, {
      detail: {
        description: 'Get quote statistics for the current user',
        tags: ['Quotes', 'Stats'],
      }
    });

    return app;
  });
}
