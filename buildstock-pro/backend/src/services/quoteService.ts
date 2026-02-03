/**
 * Quote Service
 * Manages quote requests, items, and merchant responses
 */

import { supabase } from '../utils/database';

// Type definitions
export type QuoteStatus = 'pending' | 'sent' | 'responded' | 'expired' | 'cancelled';

export interface QuoteItem {
  id?: string;
  quote_id?: string;
  scraped_price_id?: string;
  product_name: string;
  retailer: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  notes?: string;
  created_at?: string;
}

export interface QuoteResponse {
  id?: string;
  quote_id?: string;
  responder_name: string;
  responder_email: string;
  response_message?: string;
  quoted_total?: number;
  valid_until?: string;
  created_at?: string;
}

export interface Quote {
  id?: string;
  user_id: string;
  status: QuoteStatus;
  title: string;
  delivery_location?: string;
  delivery_postcode?: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
  expires_at?: string;
  response_deadline?: string;
  items?: QuoteItem[];
  responses?: QuoteResponse[];
}

export interface CreateQuoteData {
  user_id: string;
  title: string;
  delivery_location?: string;
  delivery_postcode?: string;
  notes?: string;
  expires_at?: string;
  response_deadline?: string;
  items?: Omit<QuoteItem, 'id' | 'quote_id' | 'created_at'>[];
}

export interface QuoteFilters {
  status?: QuoteStatus;
  page?: number;
  page_size?: number;
  sort?: 'created_at' | 'updated_at' | 'expires_at' | 'title';
  order?: 'asc' | 'desc';
}

export interface PaginatedQuotes {
  data: Quote[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

/**
 * Main Quote Service
 */
export class QuoteService {
  private readonly quotesTable = 'quotes';
  private readonly quoteItemsTable = 'quote_items';
  private readonly quoteResponsesTable = 'quote_responses';

  /**
   * Create a new quote with items
   */
  async createQuote(data: CreateQuoteData): Promise<Quote | null> {
    console.log('[QuoteService] Creating quote:', { title: data.title, userId: data.user_id });

    try {
      // Start a transaction by creating the quote first
      const { data: quote, error: quoteError } = await supabase
        .from(this.quotesTable)
        .insert({
          user_id: data.user_id,
          status: 'pending',
          title: data.title,
          delivery_location: data.delivery_location,
          delivery_postcode: data.delivery_postcode,
          notes: data.notes,
          expires_at: data.expires_at,
          response_deadline: data.response_deadline,
        })
        .select()
        .single();

      if (quoteError) {
        console.error('[QuoteService] Error creating quote:', quoteError);
        throw quoteError;
      }

      if (!quote) {
        throw new Error('Failed to create quote');
      }

      // Create items if provided
      let items: QuoteItem[] = [];
      if (data.items && data.items.length > 0) {
        for (const item of data.items) {
          const createdItem = await this.addQuoteItem(quote.id, item);
          if (createdItem) {
            items.push(createdItem);
          }
        }
      }

      // Fetch the complete quote with items
      const completeQuote = await this.getQuoteById(quote.id, data.user_id);

      console.log('[QuoteService] Quote created successfully:', quote.id);
      return completeQuote;

    } catch (error) {
      console.error('[QuoteService] Error in createQuote:', error);
      throw error;
    }
  }

  /**
   * Get all quotes for a user with pagination and filters
   */
  async getQuotes(userId: string, filters: QuoteFilters = {}): Promise<PaginatedQuotes> {
    console.log('[QuoteService] Fetching quotes for user:', userId, filters);

    try {
      const page = filters.page || 1;
      const pageSize = filters.page_size || 20;
      const start = (page - 1) * pageSize;
      const end = start + pageSize - 1;

      // Build query
      let query = supabase
        .from(this.quotesTable)
        .select('*', { count: 'exact' })
        .eq('user_id', userId);

      // Apply status filter
      if (filters.status) {
        query = query.eq('status', filters.status);
      }

      // Apply sorting
      const sortColumn = filters.sort || 'created_at';
      const sortOrder = filters.order || 'desc';
      query = query.order(sortColumn, { ascending: sortOrder === 'asc' });

      // Apply pagination
      query = query.range(start, end);

      const { data: quotes, error, count } = await query;

      if (error) {
        console.error('[QuoteService] Error fetching quotes:', error);
        throw error;
      }

      // Fetch items for each quote
      const quotesWithItems = await Promise.all(
        (quotes || []).map(async (quote: any) => {
          const items = await this.getQuoteItems(quote.id);
          const responses = await this.getQuoteResponses(quote.id);
          return {
            ...quote,
            items,
            responses,
          };
        })
      );

      const total = count || 0;

      console.log('[QuoteService] Fetched', quotesWithItems.length, 'quotes');

      return {
        data: quotesWithItems,
        total,
        page,
        page_size: pageSize,
        total_pages: Math.ceil(total / pageSize),
      };

    } catch (error) {
      console.error('[QuoteService] Error in getQuotes:', error);
      throw error;
    }
  }

  /**
   * Get a single quote by ID
   */
  async getQuoteById(quoteId: string, userId: string): Promise<Quote | null> {
    console.log('[QuoteService] Fetching quote:', quoteId);

    try {
      const { data: quote, error } = await supabase
        .from(this.quotesTable)
        .select('*')
        .eq('id', quoteId)
        .eq('user_id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No rows returned
          return null;
        }
        console.error('[QuoteService] Error fetching quote:', error);
        throw error;
      }

      if (!quote) {
        return null;
      }

      // Fetch items and responses
      const items = await this.getQuoteItems(quoteId);
      const responses = await this.getQuoteResponses(quoteId);

      return {
        ...quote,
        items,
        responses,
      };

    } catch (error) {
      console.error('[QuoteService] Error in getQuoteById:', error);
      throw error;
    }
  }

  /**
   * Update quote details
   */
  async updateQuote(
    quoteId: string,
    userId: string,
    updates: Partial<Pick<Quote, 'title' | 'delivery_location' | 'delivery_postcode' | 'notes' | 'expires_at' | 'response_deadline'>>
  ): Promise<Quote | null> {
    console.log('[QuoteService] Updating quote:', quoteId, updates);

    try {
      // Check user owns this quote
      const ownsQuote = await this.checkUserOwnsQuote(quoteId, userId);
      if (!ownsQuote) {
        throw new Error('User does not own this quote');
      }

      const { data: quote, error } = await supabase
        .from(this.quotesTable)
        .update(updates)
        .eq('id', quoteId)
        .select()
        .single();

      if (error) {
        console.error('[QuoteService] Error updating quote:', error);
        throw error;
      }

      if (!quote) {
        return null;
      }

      // Fetch complete quote with items
      return await this.getQuoteById(quoteId, userId);

    } catch (error) {
      console.error('[QuoteService] Error in updateQuote:', error);
      throw error;
    }
  }

  /**
   * Update quote status
   */
  async updateQuoteStatus(quoteId: string, userId: string, status: QuoteStatus): Promise<Quote | null> {
    console.log('[QuoteService] Updating quote status:', quoteId, status);

    try {
      // Check user owns this quote
      const ownsQuote = await this.checkUserOwnsQuote(quoteId, userId);
      if (!ownsQuote) {
        throw new Error('User does not own this quote');
      }

      const { data: quote, error } = await supabase
        .from(this.quotesTable)
        .update({ status })
        .eq('id', quoteId)
        .select()
        .single();

      if (error) {
        console.error('[QuoteService] Error updating quote status:', error);
        throw error;
      }

      if (!quote) {
        return null;
      }

      // Fetch complete quote with items
      return await this.getQuoteById(quoteId, userId);

    } catch (error) {
      console.error('[QuoteService] Error in updateQuoteStatus:', error);
      throw error;
    }
  }

  /**
   * Delete/cancel a quote
   */
  async deleteQuote(quoteId: string, userId: string): Promise<boolean> {
    console.log('[QuoteService] Deleting quote:', quoteId);

    try {
      // Check user owns this quote
      const ownsQuote = await this.checkUserOwnsQuote(quoteId, userId);
      if (!ownsQuote) {
        throw new Error('User does not own this quote');
      }

      const { error } = await supabase
        .from(this.quotesTable)
        .delete()
        .eq('id', quoteId);

      if (error) {
        console.error('[QuoteService] Error deleting quote:', error);
        throw error;
      }

      console.log('[QuoteService] Quote deleted successfully');
      return true;

    } catch (error) {
      console.error('[QuoteService] Error in deleteQuote:', error);
      throw error;
    }
  }

  /**
   * Add an item to a quote
   */
  async addQuoteItem(quoteId: string, item: Omit<QuoteItem, 'id' | 'quote_id' | 'created_at'>): Promise<QuoteItem | null> {
    console.log('[QuoteService] Adding item to quote:', quoteId);

    try {
      const { data, error } = await supabase
        .from(this.quoteItemsTable)
        .insert({
          quote_id: quoteId,
          scraped_price_id: item.scraped_price_id,
          product_name: item.product_name,
          retailer: item.retailer,
          quantity: item.quantity,
          unit_price: item.unit_price,
          total_price: item.total_price,
          notes: item.notes,
        })
        .select()
        .single();

      if (error) {
        console.error('[QuoteService] Error adding quote item:', error);
        throw error;
      }

      console.log('[QuoteService] Item added successfully');
      return data as QuoteItem;

    } catch (error) {
      console.error('[QuoteService] Error in addQuoteItem:', error);
      throw error;
    }
  }

  /**
   * Remove an item from a quote
   */
  async removeQuoteItem(itemId: string, userId: string): Promise<boolean> {
    console.log('[QuoteService] Removing item:', itemId);

    try {
      // First get the item to check user owns the quote
      const { data: item, error: fetchError } = await supabase
        .from(this.quoteItemsTable)
        .select('quote_id')
        .eq('id', itemId)
        .single();

      if (fetchError || !item) {
        throw new Error('Item not found');
      }

      // Check user owns the quote
      const ownsQuote = await this.checkUserOwnsQuote(item.quote_id, userId);
      if (!ownsQuote) {
        throw new Error('User does not own this quote');
      }

      // Delete the item
      const { error } = await supabase
        .from(this.quoteItemsTable)
        .delete()
        .eq('id', itemId);

      if (error) {
        console.error('[QuoteService] Error removing quote item:', error);
        throw error;
      }

      console.log('[QuoteService] Item removed successfully');
      return true;

    } catch (error) {
      console.error('[QuoteService] Error in removeQuoteItem:', error);
      throw error;
    }
  }

  /**
   * Add a merchant response to a quote
   */
  async addQuoteResponse(quoteId: string, response: Omit<QuoteResponse, 'id' | 'quote_id' | 'created_at'>): Promise<QuoteResponse | null> {
    console.log('[QuoteService] Adding response to quote:', quoteId);

    try {
      const { data, error } = await supabase
        .from(this.quoteResponsesTable)
        .insert({
          quote_id: quoteId,
          responder_name: response.responder_name,
          responder_email: response.responder_email,
          response_message: response.response_message,
          quoted_total: response.quoted_total,
          valid_until: response.valid_until,
        })
        .select()
        .single();

      if (error) {
        console.error('[QuoteService] Error adding quote response:', error);
        throw error;
      }

      // Update quote status to responded
      await supabase
        .from(this.quotesTable)
        .update({ status: 'responded' })
        .eq('id', quoteId);

      console.log('[QuoteService] Response added successfully');
      return data as QuoteResponse;

    } catch (error) {
      console.error('[QuoteService] Error in addQuoteResponse:', error);
      throw error;
    }
  }

  /**
   * Get all items for a quote
   */
  async getQuoteItems(quoteId: string): Promise<QuoteItem[]> {
    try {
      const { data, error } = await supabase
        .from(this.quoteItemsTable)
        .select('*')
        .eq('quote_id', quoteId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('[QuoteService] Error fetching quote items:', error);
        throw error;
      }

      return (data as QuoteItem[]) || [];

    } catch (error) {
      console.error('[QuoteService] Error in getQuoteItems:', error);
      return [];
    }
  }

  /**
   * Get all responses for a quote
   */
  async getQuoteResponses(quoteId: string): Promise<QuoteResponse[]> {
    try {
      const { data, error } = await supabase
        .from(this.quoteResponsesTable)
        .select('*')
        .eq('quote_id', quoteId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('[QuoteService] Error fetching quote responses:', error);
        throw error;
      }

      return (data as QuoteResponse[]) || [];

    } catch (error) {
      console.error('[QuoteService] Error in getQuoteResponses:', error);
      return [];
    }
  }

  /**
   * Check if a user owns a quote
   */
  async checkUserOwnsQuote(quoteId: string, userId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from(this.quotesTable)
        .select('id')
        .eq('id', quoteId)
        .eq('user_id', userId)
        .maybeSingle();

      if (error) {
        console.error('[QuoteService] Error checking quote ownership:', error);
        return false;
      }

      return data !== null;

    } catch (error) {
      console.error('[QuoteService] Error in checkUserOwnsQuote:', error);
      return false;
    }
  }

  /**
   * Get quote statistics for a user
   */
  async getQuoteStats(userId: string): Promise<{
    total: number;
    pending: number;
    sent: number;
    responded: number;
    expired: number;
    cancelled: number;
  }> {
    try {
      const { data, error } = await supabase
        .from(this.quotesTable)
        .select('status')
        .eq('user_id', userId);

      if (error) {
        console.error('[QuoteService] Error fetching quote stats:', error);
        throw error;
      }

      const stats = {
        total: data?.length || 0,
        pending: 0,
        sent: 0,
        responded: 0,
        expired: 0,
        cancelled: 0,
      };

      (data || []).forEach((quote: any) => {
        if (quote.status in stats) {
          (stats as any)[quote.status]++;
        }
      });

      return stats;

    } catch (error) {
      console.error('[QuoteService] Error in getQuoteStats:', error);
      return {
        total: 0,
        pending: 0,
        sent: 0,
        responded: 0,
        expired: 0,
        cancelled: 0,
      };
    }
  }
}

// Export singleton instance
export const quoteService = new QuoteService();
