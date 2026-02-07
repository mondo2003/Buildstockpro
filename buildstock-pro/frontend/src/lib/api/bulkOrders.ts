// BuildStock Pro Bulk Orders API Client

import {
  BulkOrder,
  BulkOrderListResponse,
  BulkOrderSearchParams,
  CreateBulkOrderRequest,
  UpdateBulkOrderRequest,
  AddOrderItemRequest,
  UpdateOrderItemRequest,
  BulkOrderRetailer,
} from '@/src/types/bulkOrder';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: string;
}

class BulkOrdersApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result: ApiResponse<T> = await response.json();

      if (!result.success) {
        throw new Error(result.error || result.message || 'Request failed');
      }

      return result.data as T;
    } catch (error) {
      console.error(`Bulk Orders API request failed: ${url}`, error);
      throw error;
    }
  }

  /**
   * Create a new bulk order
   */
  async createBulkOrder(data: CreateBulkOrderRequest): Promise<BulkOrder> {
    return this.request<BulkOrder>('/api/v1/bulk-orders', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * Get all bulk orders for the current user
   */
  async getBulkOrders(params?: BulkOrderSearchParams): Promise<BulkOrderListResponse> {
    const searchParams = new URLSearchParams();

    if (params?.status) {
      searchParams.append('status', params.status);
    }
    if (params?.page) {
      searchParams.append('page', String(params.page));
    }
    if (params?.page_size) {
      searchParams.append('page_size', String(params.page_size));
    }
    if (params?.sort) {
      searchParams.append('sort', params.sort);
    }
    if (params?.order) {
      searchParams.append('order', params.order);
    }

    const queryString = searchParams.toString();
    return this.request<BulkOrderListResponse>(
      `/api/v1/bulk-orders${queryString ? `?${queryString}` : ''}`
    );
  }

  /**
   * Get a single bulk order by ID
   */
  async getBulkOrderById(id: string): Promise<BulkOrder> {
    return this.request<BulkOrder>(`/api/v1/bulk-orders/${id}`);
  }

  /**
   * Update a bulk order
   */
  async updateBulkOrder(id: string, data: UpdateBulkOrderRequest): Promise<BulkOrder> {
    return this.request<BulkOrder>(`/api/v1/bulk-orders/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  /**
   * Delete a bulk order
   */
  async deleteBulkOrder(id: string): Promise<void> {
    return this.request<void>(`/api/v1/bulk-orders/${id}`, {
      method: 'DELETE',
    });
  }

  /**
   * Add an item to a bulk order
   */
  async addOrderItem(orderId: string, item: AddOrderItemRequest): Promise<BulkOrder> {
    return this.request<BulkOrder>(`/api/v1/bulk-orders/${orderId}/items`, {
      method: 'POST',
      body: JSON.stringify(item),
    });
  }

  /**
   * Update an item in a bulk order
   */
  async updateOrderItem(
    orderId: string,
    itemId: string,
    data: UpdateOrderItemRequest
  ): Promise<BulkOrder> {
    return this.request<BulkOrder>(
      `/api/v1/bulk-orders/${orderId}/items/${itemId}`,
      {
        method: 'PUT',
        body: JSON.stringify(data),
      }
    );
  }

  /**
   * Remove an item from a bulk order
   */
  async removeOrderItem(orderId: string, itemId: string): Promise<BulkOrder> {
    return this.request<BulkOrder>(
      `/api/v1/bulk-orders/${orderId}/items/${itemId}`,
      {
        method: 'DELETE',
      }
    );
  }

  /**
   * Get retailer breakdown for a bulk order
   */
  async getRetailerBreakdown(orderId: string): Promise<BulkOrderRetailer[]> {
    return this.request<BulkOrderRetailer[]>(
      `/api/v1/bulk-orders/${orderId}/retailers`
    );
  }

  /**
   * Submit a bulk order (change status from draft to pending)
   */
  async submitBulkOrder(id: string): Promise<BulkOrder> {
    return this.request<BulkOrder>(`/api/v1/bulk-orders/${id}/submit`, {
      method: 'POST',
    });
  }

  /**
   * Cancel a bulk order
   */
  async cancelBulkOrder(id: string): Promise<BulkOrder> {
    return this.request<BulkOrder>(`/api/v1/bulk-orders/${id}/cancel`, {
      method: 'POST',
    });
  }
}

export const bulkOrdersApi = new BulkOrdersApiClient();
