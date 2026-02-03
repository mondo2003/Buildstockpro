// BuildStock Pro Quote API Service

import {
  Quote,
  QuoteItem,
  QuoteResponse,
  CreateQuoteRequest,
  UpdateQuoteRequest,
  AddQuoteItemRequest,
  AddQuoteResponseRequest,
  QuoteListParams,
  QuoteListResponse,
} from '@/types/quote';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: string;
}

class QuoteApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    // Get auth token from localStorage (set by Supabase auth)
    let headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Add auth token if available
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('sb-access-token');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...headers,
          ...options.headers,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || errorData.message || `HTTP ${response.status}: ${response.statusText}`
        );
      }

      const result: ApiResponse<T> = await response.json();

      if (!result.success) {
        throw new Error(result.error || result.message || 'Request failed');
      }

      return result.data as T;
    } catch (error) {
      console.error(`Quote API request failed: ${url}`, error);
      throw error;
    }
  }

  /**
   * Create a new quote request
   */
  async createQuote(data: CreateQuoteRequest): Promise<Quote> {
    return this.request<Quote>('/api/v1/quotes', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * Get list of user's quotes with optional filters
   */
  async getQuotes(params?: QuoteListParams): Promise<QuoteListResponse> {
    const queryParams = new URLSearchParams();

    if (params?.status) {
      queryParams.append('status', params.status);
    }
    if (params?.page) {
      queryParams.append('page', String(params.page));
    }
    if (params?.page_size) {
      queryParams.append('page_size', String(params.page_size));
    }
    if (params?.sort) {
      queryParams.append('sort', params.sort);
    }

    const queryString = queryParams.toString();
    const endpoint = `/api/v1/quotes${queryString ? `?${queryString}` : ''}`;

    return this.request<QuoteListResponse>(endpoint);
  }

  /**
   * Get a single quote by ID
   */
  async getQuoteById(id: string): Promise<Quote> {
    return this.request<Quote>(`/api/v1/quotes/${id}`);
  }

  /**
   * Update a quote
   */
  async updateQuote(id: string, data: UpdateQuoteRequest): Promise<Quote> {
    return this.request<Quote>(`/api/v1/quotes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  /**
   * Delete/cancel a quote
   */
  async deleteQuote(id: string): Promise<void> {
    return this.request<void>(`/api/v1/quotes/${id}`, {
      method: 'DELETE',
    });
  }

  /**
   * Add an item to a quote
   */
  async addQuoteItem(quoteId: string, item: AddQuoteItemRequest): Promise<QuoteItem> {
    return this.request<QuoteItem>(`/api/v1/quotes/${quoteId}/items`, {
      method: 'POST',
      body: JSON.stringify(item),
    });
  }

  /**
   * Remove an item from a quote
   */
  async removeQuoteItem(quoteId: string, itemId: string): Promise<void> {
    return this.request<void>(`/api/v1/quotes/${quoteId}/items/${itemId}`, {
      method: 'DELETE',
    });
  }

  /**
   * Add a response to a quote (for merchants)
   */
  async addQuoteResponse(quoteId: string, response: AddQuoteResponseRequest): Promise<QuoteResponse> {
    return this.request<QuoteResponse>(`/api/v1/quotes/${quoteId}/respond`, {
      method: 'POST',
      body: JSON.stringify(response),
    });
  }

  /**
   * Mark a quote as sent
   */
  async markQuoteAsSent(id: string): Promise<Quote> {
    return this.updateQuote(id, { status: 'sent' });
  }

  /**
   * Cancel a quote
   */
  async cancelQuote(id: string): Promise<Quote> {
    return this.updateQuote(id, { status: 'cancelled' });
  }
}

export const quoteApi = new QuoteApiClient();
