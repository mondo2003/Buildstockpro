/**
 * Merchant Contact Routes
 * API endpoints for users to contact merchants/branches
 */

import { Elysia, t } from 'elysia';
import { merchantContactService } from '../services/merchantContactService';
import { successResponse, errorResponse, paginatedResponse } from '../utils/response';

export const merchantContactRoutes = new Elysia({ prefix: '/api/v1/merchant' })

  // ========================================================================
  // CONTACT REQUEST ENDPOINTS
  // ========================================================================

  /**
   * POST /api/v1/merchant/contact
   * Submit a new contact request
   * Auth: Required
   */
  .post('/contact', async ({ body, bearer }) => {
    try {
      // In production, verify JWT and extract user_id
      // For now, use a mock user_id or extract from bearer token
      const userId = 'mock-user-id'; // TODO: Extract from JWT

      const contactRequest = await merchantContactService.createContactRequest(userId, body);

      return successResponse(contactRequest, 'Contact request created successfully');

    } catch (error) {
      console.error('Error creating contact request:', error);
      return errorResponse(
        'Failed to create contact request',
        error instanceof Error ? error.message : 'Unknown error'
      );
    }
  }, {
    body: t.Object({
      merchant_id: t.String(),
      branch_id: t.Optional(t.String()),
      scraped_price_id: t.Optional(t.String()),
      product_name: t.String(),
      product_sku: t.Optional(t.String()),
      inquiry_type: t.Union([
        t.Literal('product_question'),
        t.Literal('stock_check'),
        t.Literal('bulk_quote'),
        t.Literal('general')
      ]),
      message: t.String(),
      contact_method: t.Union([
        t.Literal('email'),
        t.Literal('phone'),
        t.Literal('visit')
      ]),
      user_name: t.String(),
      user_email: t.String(),
      user_phone: t.Optional(t.String()),
      metadata: t.Optional(t.Object({}, { additionalProperties: true })),
    }),
    detail: {
      description: 'Submit a contact request to a merchant',
      tags: ['Merchant Contact'],
    }
  })

  /**
   * GET /api/v1/merchant/contact
   * List user's contact requests
   * Auth: Required
   */
  .get('/contact', async ({ query, bearer }) => {
    try {
      const userId = 'mock-user-id'; // TODO: Extract from JWT

      const result = await merchantContactService.getContactRequests(userId, {
        status: query.status,
        merchant_id: query.merchant_id,
        inquiry_type: query.inquiry_type,
        page: query.page ? parseInt(query.page as string) : 1,
        page_size: query.page_size ? parseInt(query.page_size as string) : 20,
      });

      return {
        success: true,
        data: result.requests,
        meta: {
          total: result.total,
          page: result.page,
          page_size: result.page_size,
          total_pages: result.total_pages,
        },
        timestamp: new Date().toISOString(),
      };

    } catch (error) {
      console.error('Error fetching contact requests:', error);
      return errorResponse(
        'Failed to fetch contact requests',
        error instanceof Error ? error.message : 'Unknown error'
      );
    }
  }, {
    query: t.Object({
      status: t.Optional(t.String()),
      merchant_id: t.Optional(t.String()),
      inquiry_type: t.Optional(t.String()),
      page: t.Optional(t.String()),
      page_size: t.Optional(t.String()),
    }),
    detail: {
      description: 'List user contact requests',
      tags: ['Merchant Contact'],
    }
  })

  /**
   * GET /api/v1/merchant/contact/:id
   * Get single contact request with details
   * Auth: Required
   */
  .get('/contact/:id', async ({ params, bearer }) => {
    try {
      const userId = 'mock-user-id'; // TODO: Extract from JWT

      const contactRequest = await merchantContactService.getContactById(params.id, userId);

      if (!contactRequest) {
        return errorResponse('Contact request not found', 'No contact request found with the provided ID');
      }

      // Get responses for this request
      const responses = await merchantContactService.getContactResponses(params.id, userId);

      return successResponse({
        ...contactRequest,
        responses,
      });

    } catch (error) {
      console.error('Error fetching contact request:', error);
      return errorResponse(
        'Failed to fetch contact request',
        error instanceof Error ? error.message : 'Unknown error'
      );
    }
  }, {
    params: t.Object({
      id: t.String(),
    }),
    detail: {
      description: 'Get contact request details',
      tags: ['Merchant Contact'],
    }
  })

  /**
   * DELETE /api/v1/merchant/contact/:id
   * Cancel/delete a contact request
   * Auth: Required
   */
  .delete('/contact/:id', async ({ params, bearer }) => {
    try {
      const userId = 'mock-user-id'; // TODO: Extract from JWT

      const success = await merchantContactService.deleteContactRequest(params.id, userId);

      if (!success) {
        return errorResponse('Contact request not found', 'No contact request found with the provided ID');
      }

      return successResponse(null, 'Contact request cancelled successfully');

    } catch (error) {
      console.error('Error cancelling contact request:', error);
      return errorResponse(
        'Failed to cancel contact request',
        error instanceof Error ? error.message : 'Unknown error'
      );
    }
  }, {
    params: t.Object({
      id: t.String(),
    }),
    detail: {
      description: 'Cancel a contact request',
      tags: ['Merchant Contact'],
    }
  })

  /**
   * POST /api/v1/merchant/contact/:id/respond
   * Add a merchant response to a contact request
   * Auth: Optional (for merchant use)
   */
  .post('/contact/:id/respond', async ({ params, body }) => {
    try {
      const response = await merchantContactService.addResponse(params.id, body);

      if (!response) {
        return errorResponse('Contact request not found', 'No contact request found with the provided ID');
      }

      return successResponse(response, 'Response added successfully');

    } catch (error) {
      console.error('Error adding response:', error);
      return errorResponse(
        'Failed to add response',
        error instanceof Error ? error.message : 'Unknown error'
      );
    }
  }, {
    params: t.Object({
      id: t.String(),
    }),
    body: t.Object({
      responder_name: t.String(),
      responder_role: t.Optional(t.String()),
      response_message: t.String(),
      responder_email: t.Optional(t.String()),
      responder_phone: t.Optional(t.String()),
      metadata: t.Optional(t.Object({}, { additionalProperties: true })),
    }),
    detail: {
      description: 'Add a merchant response to a contact request',
      tags: ['Merchant Contact'],
    }
  })

  // ========================================================================
  // BRANCH ENDPOINTS
  // ========================================================================

  /**
   * GET /api/v1/merchant/:merchantId/branches
   * Find merchant branches near a postcode
   * Auth: Optional
   */
  .get('/:merchantId/branches', async ({ params, query }) => {
    try {
      if (!query.postcode) {
        return errorResponse('Missing postcode', 'Postcode parameter is required');
      }

      const branches = await merchantContactService.findNearestBranches(
        params.merchantId,
        query.postcode,
        query.radius_km ? parseInt(query.radius_km as string) : 50
      );

      return successResponse(branches, `Found ${branches.length} branches`);

    } catch (error) {
      console.error('Error finding branches:', error);
      return errorResponse(
        'Failed to find branches',
        error instanceof Error ? error.message : 'Unknown error'
      );
    }
  }, {
    params: t.Object({
      merchantId: t.String(),
    }),
    query: t.Object({
      postcode: t.String(),
      radius_km: t.Optional(t.String()),
    }),
    detail: {
      description: 'Find merchant branches near a postcode',
      tags: ['Merchant Branches'],
    }
  })

  /**
   * GET /api/v1/merchant/:merchantId/branches/:branchId
   * Get branch details
   * Auth: Optional
   */
  .get('/:merchantId/branches/:branchId', async ({ params }) => {
    try {
      const branch = await merchantContactService.getBranchDetails(params.branchId);

      if (!branch) {
        return errorResponse('Branch not found', 'No branch found with the provided ID');
      }

      // Verify branch belongs to merchant
      if (branch.merchant_id !== params.merchantId) {
        return errorResponse('Branch not found', 'Branch does not belong to the specified merchant');
      }

      return successResponse(branch);

    } catch (error) {
      console.error('Error fetching branch details:', error);
      return errorResponse(
        'Failed to fetch branch details',
        error instanceof Error ? error.message : 'Unknown error'
      );
    }
  }, {
    params: t.Object({
      merchantId: t.String(),
      branchId: t.String(),
    }),
    detail: {
      description: 'Get branch contact information',
      tags: ['Merchant Branches'],
    }
  })

  /**
   * PATCH /api/v1/merchant/contact/:id/status
   * Update contact request status
   * Auth: Optional (for merchant use)
   */
  .patch('/contact/:id/status', async ({ params, body }) => {
    try {
      const validStatuses = ['pending', 'sent', 'responded', 'resolved', 'cancelled'];

      if (!validStatuses.includes(body.status)) {
        return errorResponse('Invalid status', `Status must be one of: ${validStatuses.join(', ')}`);
      }

      const contactRequest = await merchantContactService.updateContactStatus(
        params.id,
        body.status
      );

      if (!contactRequest) {
        return errorResponse('Contact request not found', 'No contact request found with the provided ID');
      }

      return successResponse(contactRequest, 'Status updated successfully');

    } catch (error) {
      console.error('Error updating status:', error);
      return errorResponse(
        'Failed to update status',
        error instanceof Error ? error.message : 'Unknown error'
      );
    }
  }, {
    params: t.Object({
      id: t.String(),
    }),
    body: t.Object({
      status: t.Union([
        t.Literal('pending'),
        t.Literal('sent'),
        t.Literal('responded'),
        t.Literal('resolved'),
        t.Literal('cancelled')
      ]),
    }),
    detail: {
      description: 'Update contact request status',
      tags: ['Merchant Contact'],
    }
  });
