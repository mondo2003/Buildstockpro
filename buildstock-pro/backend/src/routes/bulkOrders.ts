/**
 * Bulk Orders API Routes
 * Endpoints for managing bulk construction material orders
 */

import { Elysia, t } from 'elysia';
import { successResponse, errorResponse, paginatedResponse } from '../utils/response';
import { bulkOrderService, type CreateBulkOrderData, type UpdateBulkOrderData, type BulkOrderFilters } from '../services/bulkOrderService';

export function bulkOrdersRoutes(app: Elysia) {
  return app.group('/api/v1/bulk-orders', (app) => {

    // ============================================
    // POST /api/v1/bulk-orders - Create new bulk order
    // ============================================
    app.post('/', async ({ body, jwt, bearer }) => {
      try {
        // Verify JWT token
        const token = bearer;
        if (!token) {
          return errorResponse('Unauthorized', 'JWT token is required');
        }

        const payload = await jwt.verify(token);
        if (!payload) {
          return errorResponse('Unauthorized', 'Invalid JWT token');
        }

        const userId = payload.sub as string;
        if (!userId) {
          return errorResponse('Unauthorized', 'User ID not found in token');
        }

        const orderData = body as CreateBulkOrderData;

        // Validate items if provided
        if (orderData.items && orderData.items.length > 0) {
          for (const item of orderData.items) {
            if (!item.scraped_price_id) {
              return errorResponse('Validation Error', 'scraped_price_id is required for each item');
            }
            if (!item.quantity || item.quantity < 1) {
              return errorResponse('Validation Error', 'quantity must be at least 1');
            }
          }
        }

        const result = await bulkOrderService.createBulkOrder(userId, orderData);

        if (!result) {
          return errorResponse('Failed to create bulk order', 'An error occurred while creating the order');
        }

        return successResponse(result, 'Bulk order created successfully');

      } catch (error) {
        console.error('[BulkOrders] Error creating order:', error);
        return errorResponse('Failed to create bulk order', (error as Error).message);
      }
    }, {
      body: t.Object({
        delivery_location: t.Optional(t.String()),
        delivery_postcode: t.Optional(t.String()),
        customer_notes: t.Optional(t.String()),
        items: t.Optional(t.Array(t.Object({
          scraped_price_id: t.String(),
          quantity: t.Number(),
          notes: t.Optional(t.String()),
        }))),
      }),
    });

    // ============================================
    // GET /api/v1/bulk-orders - List user's bulk orders
    // ============================================
    app.get('/', async ({ query, jwt, bearer }) => {
      try {
        // Verify JWT token
        const token = bearer;
        if (!token) {
          return errorResponse('Unauthorized', 'JWT token is required');
        }

        const payload = await jwt.verify(token);
        if (!payload) {
          return errorResponse('Unauthorized', 'Invalid JWT token');
        }

        const userId = payload.sub as string;
        if (!userId) {
          return errorResponse('Unauthorized', 'User ID not found in token');
        }

        // Parse filters
        const filters: BulkOrderFilters = {};
        if (query.status) {
          filters.status = query.status as any;
        }
        if (query.page) {
          filters.page = parseInt(query.page as string);
        }
        if (query.page_size) {
          filters.page_size = parseInt(query.page_size as string);
        }
        if (query.sort) {
          filters.sort = query.sort as any;
        }
        if (query.order) {
          filters.order = query.order as any;
        }

        const result = await bulkOrderService.getBulkOrders(userId, filters);

        return paginatedResponse(
          result.orders,
          result.page,
          result.pageSize,
          result.total
        );

      } catch (error) {
        console.error('[BulkOrders] Error fetching orders:', error);
        return errorResponse('Failed to fetch bulk orders', (error as Error).message);
      }
    });

    // ============================================
    // GET /api/v1/bulk-orders/:id - Get single bulk order
    // ============================================
    app.get('/:id', async ({ params, jwt, bearer }) => {
      try {
        // Verify JWT token
        const token = bearer;
        if (!token) {
          return errorResponse('Unauthorized', 'JWT token is required');
        }

        const payload = await jwt.verify(token);
        if (!payload) {
          return errorResponse('Unauthorized', 'Invalid JWT token');
        }

        const userId = payload.sub as string;
        if (!userId) {
          return errorResponse('Unauthorized', 'User ID not found in token');
        }

        const orderId = params.id;
        const result = await bulkOrderService.getBulkOrderById(orderId, userId);

        if (!result) {
          return errorResponse('Order not found', 'No order found with the provided ID');
        }

        return successResponse(result);

      } catch (error) {
        console.error('[BulkOrders] Error fetching order:', error);
        return errorResponse('Failed to fetch bulk order', (error as Error).message);
      }
    });

    // ============================================
    // PUT /api/v1/bulk-orders/:id - Update order
    // ============================================
    app.put('/:id', async ({ params, body, jwt, bearer }) => {
      try {
        // Verify JWT token
        const token = bearer;
        if (!token) {
          return errorResponse('Unauthorized', 'JWT token is required');
        }

        const payload = await jwt.verify(token);
        if (!payload) {
          return errorResponse('Unauthorized', 'Invalid JWT token');
        }

        const userId = payload.sub as string;
        if (!userId) {
          return errorResponse('Unauthorized', 'User ID not found in token');
        }

        const orderId = params.id;
        const updateData = body as UpdateBulkOrderData;

        const result = await bulkOrderService.updateBulkOrder(orderId, userId, updateData);

        if (!result) {
          return errorResponse('Order not found or update failed', 'Could not update the order');
        }

        return successResponse(result, 'Bulk order updated successfully');

      } catch (error) {
        console.error('[BulkOrders] Error updating order:', error);
        return errorResponse('Failed to update bulk order', (error as Error).message);
      }
    }, {
      body: t.Object({
        delivery_location: t.Optional(t.String()),
        delivery_postcode: t.Optional(t.String()),
        customer_notes: t.Optional(t.String()),
        status: t.Optional(t.Union([
          t.Literal('draft'),
          t.Literal('pending'),
          t.Literal('confirmed'),
          t.Literal('processing'),
          t.Literal('ready'),
          t.Literal('delivered'),
          t.Literal('cancelled'),
        ])),
      }),
    });

    // ============================================
    // POST /api/v1/bulk-orders/:id/items - Add item to order
    // ============================================
    app.post('/:id/items', async ({ params, body, jwt, bearer }) => {
      try {
        // Verify JWT token
        const token = bearer;
        if (!token) {
          return errorResponse('Unauthorized', 'JWT token is required');
        }

        const payload = await jwt.verify(token);
        if (!payload) {
          return errorResponse('Unauthorized', 'Invalid JWT token');
        }

        const userId = payload.sub as string;
        if (!userId) {
          return errorResponse('Unauthorized', 'User ID not found in token');
        }

        const orderId = params.id;

        // Check ownership
        const ownsOrder = await bulkOrderService.checkUserOwnsOrder(orderId, userId);
        if (!ownsOrder) {
          return errorResponse('Forbidden', 'You do not own this order');
        }

        const itemData = body as any;

        // Validate
        if (!itemData.scraped_price_id) {
          return errorResponse('Validation Error', 'scraped_price_id is required');
        }
        if (!itemData.quantity || itemData.quantity < 1) {
          return errorResponse('Validation Error', 'quantity must be at least 1');
        }

        const result = await bulkOrderService.addOrderItem(orderId, itemData);

        if (!result) {
          return errorResponse('Failed to add item', 'Could not add item to order');
        }

        return successResponse(result, 'Item added successfully');

      } catch (error) {
        console.error('[BulkOrders] Error adding item:', error);
        return errorResponse('Failed to add item', (error as Error).message);
      }
    }, {
      body: t.Object({
        scraped_price_id: t.String(),
        quantity: t.Number(),
        notes: t.Optional(t.String()),
      }),
    });

    // ============================================
    // PUT /api/v1/bulk-orders/:id/items/:itemId - Update item
    // ============================================
    app.put('/:id/items/:itemId', async ({ params, body, jwt, bearer }) => {
      try {
        // Verify JWT token
        const token = bearer;
        if (!token) {
          return errorResponse('Unauthorized', 'JWT token is required');
        }

        const payload = await jwt.verify(token);
        if (!payload) {
          return errorResponse('Unauthorized', 'Invalid JWT token');
        }

        const userId = payload.sub as string;
        if (!userId) {
          return errorResponse('Unauthorized', 'User ID not found in token');
        }

        const orderId = params.id;
        const itemId = params.itemId;

        // Check ownership
        const ownsOrder = await bulkOrderService.checkUserOwnsOrder(orderId, userId);
        if (!ownsOrder) {
          return errorResponse('Forbidden', 'You do not own this order');
        }

        const updateData = body as any;

        // Validate quantity if provided
        if (updateData.quantity !== undefined && updateData.quantity < 1) {
          return errorResponse('Validation Error', 'quantity must be at least 1');
        }

        const result = await bulkOrderService.updateOrderItem(itemId, updateData);

        if (!result) {
          return errorResponse('Failed to update item', 'Could not update item');
        }

        return successResponse(result, 'Item updated successfully');

      } catch (error) {
        console.error('[BulkOrders] Error updating item:', error);
        return errorResponse('Failed to update item', (error as Error).message);
      }
    }, {
      body: t.Object({
        quantity: t.Optional(t.Number()),
        notes: t.Optional(t.String()),
      }),
    });

    // ============================================
    // DELETE /api/v1/bulk-orders/:id/items/:itemId - Remove item
    // ============================================
    app.delete('/:id/items/:itemId', async ({ params, jwt, bearer }) => {
      try {
        // Verify JWT token
        const token = bearer;
        if (!token) {
          return errorResponse('Unauthorized', 'JWT token is required');
        }

        const payload = await jwt.verify(token);
        if (!payload) {
          return errorResponse('Unauthorized', 'Invalid JWT token');
        }

        const userId = payload.sub as string;
        if (!userId) {
          return errorResponse('Unauthorized', 'User ID not found in token');
        }

        const orderId = params.id;
        const itemId = params.itemId;

        // Check ownership
        const ownsOrder = await bulkOrderService.checkUserOwnsOrder(orderId, userId);
        if (!ownsOrder) {
          return errorResponse('Forbidden', 'You do not own this order');
        }

        const success = await bulkOrderService.removeOrderItem(itemId);

        if (!success) {
          return errorResponse('Failed to remove item', 'Could not remove item');
        }

        return successResponse({ itemId }, 'Item removed successfully');

      } catch (error) {
        console.error('[BulkOrders] Error removing item:', error);
        return errorResponse('Failed to remove item', (error as Error).message);
      }
    });

    // ============================================
    // GET /api/v1/bulk-orders/:id/retailers - Get retailer breakdown
    // ============================================
    app.get('/:id/retailers', async ({ params, jwt, bearer }) => {
      try {
        // Verify JWT token
        const token = bearer;
        if (!token) {
          return errorResponse('Unauthorized', 'JWT token is required');
        }

        const payload = await jwt.verify(token);
        if (!payload) {
          return errorResponse('Unauthorized', 'Invalid JWT token');
        }

        const userId = payload.sub as string;
        if (!userId) {
          return errorResponse('Unauthorized', 'User ID not found in token');
        }

        const orderId = params.id;

        // Check ownership
        const ownsOrder = await bulkOrderService.checkUserOwnsOrder(orderId, userId);
        if (!ownsOrder) {
          return errorResponse('Forbidden', 'You do not own this order');
        }

        const retailers = await bulkOrderService.groupByRetailer(orderId);

        return successResponse(retailers);

      } catch (error) {
        console.error('[BulkOrders] Error fetching retailers:', error);
        return errorResponse('Failed to fetch retailer breakdown', (error as Error).message);
      }
    });

    // ============================================
    // POST /api/v1/bulk-orders/:id/submit - Submit draft order
    // ============================================
    app.post('/:id/submit', async ({ params, jwt, bearer }) => {
      try {
        // Verify JWT token
        const token = bearer;
        if (!token) {
          return errorResponse('Unauthorized', 'JWT token is required');
        }

        const payload = await jwt.verify(token);
        if (!payload) {
          return errorResponse('Unauthorized', 'Invalid JWT token');
        }

        const userId = payload.sub as string;
        if (!userId) {
          return errorResponse('Unauthorized', 'User ID not found in token');
        }

        const orderId = params.id;

        const success = await bulkOrderService.submitBulkOrder(orderId, userId);

        if (!success) {
          return errorResponse('Failed to submit order', 'Could not submit order. It may not be in draft status or you may not own it.');
        }

        return successResponse({ orderId, status: 'pending' }, 'Order submitted successfully');

      } catch (error) {
        console.error('[BulkOrders] Error submitting order:', error);
        return errorResponse('Failed to submit order', (error as Error).message);
      }
    });

    // ============================================
    // DELETE /api/v1/bulk-orders/:id - Cancel/delete order
    // ============================================
    app.delete('/:id', async ({ params, jwt, bearer }) => {
      try {
        // Verify JWT token
        const token = bearer;
        if (!token) {
          return errorResponse('Unauthorized', 'JWT token is required');
        }

        const payload = await jwt.verify(token);
        if (!payload) {
          return errorResponse('Unauthorized', 'Invalid JWT token');
        }

        const userId = payload.sub as string;
        if (!userId) {
          return errorResponse('Unauthorized', 'User ID not found in token');
        }

        const orderId = params.id;

        const success = await bulkOrderService.cancelBulkOrder(orderId, userId);

        if (!success) {
          return errorResponse('Failed to cancel order', 'Could not cancel order. You may not own it.');
        }

        return successResponse({ orderId }, 'Order cancelled successfully');

      } catch (error) {
        console.error('[BulkOrders] Error cancelling order:', error);
        return errorResponse('Failed to cancel order', (error as Error).message);
      }
    });

    return app;
  });
}
