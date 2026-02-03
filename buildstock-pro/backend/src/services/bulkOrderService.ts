/**
 * Bulk Order Service
 * Manages bulk construction material orders across multiple retailers
 */

import { supabase } from '../utils/database';

// ============================================
// Type Definitions
// ============================================

export type BulkOrderStatus = 'draft' | 'pending' | 'confirmed' | 'processing' | 'ready' | 'delivered' | 'cancelled';
export type RetailerStatus = 'pending' | 'acknowledged' | 'preparing' | 'ready';

export interface BulkOrder {
  id: string;
  user_id: string;
  order_number: string;
  status: BulkOrderStatus;
  total_items: number;
  total_retailers: number;
  estimated_total: number;
  delivery_location?: string;
  delivery_postcode?: string;
  customer_notes?: string;
  internal_notes?: string;
  created_at: string;
  updated_at: string;
}

export interface BulkOrderItem {
  id: string;
  bulk_order_id: string;
  scraped_price_id: string;
  product_name: string;
  retailer: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  in_stock: boolean;
  notes?: string;
  created_at: string;
}

export interface BulkOrderRetailer {
  id: string;
  bulk_order_id: string;
  retailer: string;
  item_count: number;
  retailer_total: number;
  retailer_status: RetailerStatus;
  created_at: string;
  updated_at: string;
}

export interface CreateBulkOrderData {
  delivery_location?: string;
  delivery_postcode?: string;
  customer_notes?: string;
  items?: CreateBulkOrderItemData[];
}

export interface CreateBulkOrderItemData {
  scraped_price_id: string;
  quantity: number;
  notes?: string;
}

export interface UpdateBulkOrderData {
  delivery_location?: string;
  delivery_postcode?: string;
  customer_notes?: string;
  status?: BulkOrderStatus;
}

export interface UpdateBulkOrderItemData {
  quantity?: number;
  notes?: string;
}

export interface BulkOrderWithDetails extends BulkOrder {
  items: BulkOrderItem[];
  retailers: BulkOrderRetailer[];
}

export interface BulkOrderFilters {
  status?: BulkOrderStatus;
  page?: number;
  page_size?: number;
  sort?: 'created_at' | 'updated_at' | 'estimated_total' | 'order_number';
  order?: 'asc' | 'desc';
}

// ============================================
// Bulk Order Service
// ============================================

export class BulkOrderService {
  private readonly ordersTable = 'bulk_orders';
  private readonly itemsTable = 'bulk_order_items';
  private readonly retailersTable = 'bulk_order_retailers';

  /**
   * Generate a unique order number
   * Format: BULK-YYYY-######
   */
  async generateOrderNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
    return `BULK-${year}-${random}`;
  }

  /**
   * Check if user owns the order
   */
  async checkUserOwnsOrder(orderId: string, userId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from(this.ordersTable)
        .select('id')
        .eq('id', orderId)
        .eq('user_id', userId)
        .maybeSingle();

      if (error || !data) {
        return false;
      }

      return true;
    } catch (error) {
      console.error('[BulkOrderService] Error checking order ownership:', error);
      return false;
    }
  }

  /**
   * Create a new bulk order
   */
  async createBulkOrder(userId: string, data: CreateBulkOrderData): Promise<BulkOrderWithDetails | null> {
    console.log('[BulkOrderService] Creating bulk order for user:', userId);

    try {
      // Generate unique order number
      let orderNumber = await this.generateOrderNumber();

      // Ensure order number is unique
      let attempts = 0;
      while (attempts < 10) {
        const { data: existing } = await supabase
          .from(this.ordersTable)
          .select('order_number')
          .eq('order_number', orderNumber)
          .maybeSingle();

        if (!existing) {
          break;
        }

        orderNumber = await this.generateOrderNumber();
        attempts++;
      }

      // Create the order
      const { data: order, error: orderError } = await supabase
        .from(this.ordersTable)
        .insert({
          user_id: userId,
          order_number: orderNumber,
          status: 'draft',
          total_items: 0,
          total_retailers: 0,
          estimated_total: 0,
          delivery_location: data.delivery_location,
          delivery_postcode: data.delivery_postcode,
          customer_notes: data.customer_notes,
        })
        .select()
        .single();

      if (orderError || !order) {
        console.error('[BulkOrderService] Error creating order:', orderError);
        return null;
      }

      console.log('[BulkOrderService] Order created:', orderNumber);

      // Add items if provided
      let items: BulkOrderItem[] = [];
      let retailers: BulkOrderRetailer[] = [];

      if (data.items && data.items.length > 0) {
        for (const itemData of data.items) {
          const item = await this.addOrderItem(order.id, itemData);
          if (item) {
            items.push(item);
          }
        }

        // Recalculate totals
        await this.calculateOrderTotals(order.id);

        // Get retailer breakdown
        retailers = await this.groupByRetailer(order.id);
      }

      return {
        ...order,
        items,
        retailers,
      };

    } catch (error) {
      console.error('[BulkOrderService] Error creating bulk order:', error);
      return null;
    }
  }

  /**
   * Get bulk orders for a user with filters
   */
  async getBulkOrders(userId: string, filters: BulkOrderFilters = {}): Promise<{
    orders: BulkOrder[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  }> {
    console.log('[BulkOrderService] Fetching bulk orders for user:', userId, 'filters:', filters);

    try {
      const page = filters.page || 1;
      const pageSize = filters.page_size || 20;
      const start = (page - 1) * pageSize;
      const end = start + pageSize - 1;

      // Build query
      let query = supabase
        .from(this.ordersTable)
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

      const { data: orders, error, count } = await query;

      if (error) {
        console.error('[BulkOrderService] Error fetching orders:', error);
        return { orders: [], total: 0, page, pageSize, totalPages: 0 };
      }

      const total = count || 0;

      console.log('[BulkOrderService] Found', total, 'orders');

      return {
        orders: (orders as BulkOrder[]) || [],
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      };

    } catch (error) {
      console.error('[BulkOrderService] Error fetching bulk orders:', error);
      return { orders: [], total: 0, page: 1, pageSize: 20, totalPages: 0 };
    }
  }

  /**
   * Get a single bulk order with details
   */
  async getBulkOrderById(orderId: string, userId: string): Promise<BulkOrderWithDetails | null> {
    console.log('[BulkOrderService] Fetching bulk order:', orderId);

    try {
      // Check ownership
      const ownsOrder = await this.checkUserOwnsOrder(orderId, userId);
      if (!ownsOrder) {
        console.warn('[BulkOrderService] User does not own order:', orderId);
        return null;
      }

      // Get order
      const { data: order, error: orderError } = await supabase
        .from(this.ordersTable)
        .select('*')
        .eq('id', orderId)
        .single();

      if (orderError || !order) {
        console.error('[BulkOrderService] Error fetching order:', orderError);
        return null;
      }

      // Get items
      const { data: items } = await supabase
        .from(this.itemsTable)
        .select('*')
        .eq('bulk_order_id', orderId)
        .order('created_at', { ascending: true });

      // Get retailer breakdown
      const retailers = await this.groupByRetailer(orderId);

      return {
        ...order,
        items: (items as BulkOrderItem[]) || [],
        retailers,
      };

    } catch (error) {
      console.error('[BulkOrderService] Error fetching bulk order:', error);
      return null;
    }
  }

  /**
   * Add an item to a bulk order
   */
  async addOrderItem(orderId: string, itemData: CreateBulkOrderItemData): Promise<BulkOrderItem | null> {
    console.log('[BulkOrderService] Adding item to order:', orderId);

    try {
      // Get the scraped price details
      const { data: priceData, error: priceError } = await supabase
        .from('scraped_prices')
        .select('*')
        .eq('id', itemData.scraped_price_id)
        .single();

      if (priceError || !priceData) {
        console.error('[BulkOrderService] Price data not found:', priceError);
        return null;
      }

      const totalPrice = priceData.price * itemData.quantity;

      // Create the item
      const { data: item, error: itemError } = await supabase
        .from(this.itemsTable)
        .insert({
          bulk_order_id: orderId,
          scraped_price_id: itemData.scraped_price_id,
          product_name: priceData.product_name,
          retailer: priceData.retailer,
          quantity: itemData.quantity,
          unit_price: priceData.price,
          total_price: totalPrice,
          in_stock: priceData.in_stock,
          notes: itemData.notes,
        })
        .select()
        .single();

      if (itemError || !item) {
        console.error('[BulkOrderService] Error creating item:', itemError);
        return null;
      }

      // Update retailer grouping
      await this.updateRetailerGrouping(orderId, priceData.retailer);

      // Recalculate order totals
      await this.calculateOrderTotals(orderId);

      console.log('[BulkOrderService] Item added:', item.id);

      return item as BulkOrderItem;

    } catch (error) {
      console.error('[BulkOrderService] Error adding item:', error);
      return null;
    }
  }

  /**
   * Remove an item from a bulk order
   */
  async removeOrderItem(itemId: string): Promise<boolean> {
    console.log('[BulkOrderService] Removing item:', itemId);

    try {
      // Get the item first to get order ID and retailer
      const { data: item, error: itemError } = await supabase
        .from(this.itemsTable)
        .select('bulk_order_id, retailer')
        .eq('id', itemId)
        .single();

      if (itemError || !item) {
        console.error('[BulkOrderService] Item not found:', itemError);
        return false;
      }

      const retailer = item.retailer;
      const orderId = item.bulk_order_id;

      // Delete the item
      const { error: deleteError } = await supabase
        .from(this.itemsTable)
        .delete()
        .eq('id', itemId);

      if (deleteError) {
        console.error('[BulkOrderService] Error deleting item:', deleteError);
        return false;
      }

      // Update retailer grouping
      await this.updateRetailerGrouping(orderId, retailer);

      // Recalculate order totals
      await this.calculateOrderTotals(orderId);

      console.log('[BulkOrderService] Item removed:', itemId);

      return true;

    } catch (error) {
      console.error('[BulkOrderService] Error removing item:', error);
      return false;
    }
  }

  /**
   * Update an item in a bulk order
   */
  async updateOrderItem(itemId: string, data: UpdateBulkOrderItemData): Promise<BulkOrderItem | null> {
    console.log('[BulkOrderService] Updating item:', itemId);

    try {
      // Get current item
      const { data: currentItem, error: fetchError } = await supabase
        .from(this.itemsTable)
        .select('*')
        .eq('id', itemId)
        .single();

      if (fetchError || !currentItem) {
        console.error('[BulkOrderService] Item not found:', fetchError);
        return null;
      }

      // Calculate new total if quantity changed
      const updateData: any = {};
      if (data.quantity !== undefined) {
        updateData.quantity = data.quantity;
        updateData.total_price = currentItem.unit_price * data.quantity;
      }
      if (data.notes !== undefined) {
        updateData.notes = data.notes;
      }

      // Update the item
      const { data: item, error: updateError } = await supabase
        .from(this.itemsTable)
        .update(updateData)
        .eq('id', itemId)
        .select()
        .single();

      if (updateError || !item) {
        console.error('[BulkOrderService] Error updating item:', updateError);
        return null;
      }

      // Recalculate order totals
      await this.calculateOrderTotals(currentItem.bulk_order_id);

      console.log('[BulkOrderService] Item updated:', itemId);

      return item as BulkOrderItem;

    } catch (error) {
      console.error('[BulkOrderService] Error updating item:', error);
      return null;
    }
  }

  /**
   * Update bulk order status
   */
  async updateOrderStatus(orderId: string, status: BulkOrderStatus): Promise<boolean> {
    console.log('[BulkOrderService] Updating order status:', orderId, 'to:', status);

    try {
      const { error } = await supabase
        .from(this.ordersTable)
        .update({ status })
        .eq('id', orderId);

      if (error) {
        console.error('[BulkOrderService] Error updating status:', error);
        return false;
      }

      console.log('[BulkOrderService] Order status updated');

      return true;

    } catch (error) {
      console.error('[BulkOrderService] Error updating order status:', error);
      return false;
    }
  }

  /**
   * Update bulk order details
   */
  async updateBulkOrder(orderId: string, userId: string, data: UpdateBulkOrderData): Promise<BulkOrder | null> {
    console.log('[BulkOrderService] Updating bulk order:', orderId);

    try {
      // Check ownership
      const ownsOrder = await this.checkUserOwnsOrder(orderId, userId);
      if (!ownsOrder) {
        console.warn('[BulkOrderService] User does not own order:', orderId);
        return null;
      }

      // Update the order
      const { data: order, error } = await supabase
        .from(this.ordersTable)
        .update(data)
        .eq('id', orderId)
        .select()
        .single();

      if (error || !order) {
        console.error('[BulkOrderService] Error updating order:', error);
        return null;
      }

      console.log('[BulkOrderService] Order updated');

      return order as BulkOrder;

    } catch (error) {
      console.error('[BulkOrderService] Error updating bulk order:', error);
      return null;
    }
  }

  /**
   * Calculate and update order totals
   */
  async calculateOrderTotals(orderId: string): Promise<void> {
    console.log('[BulkOrderService] Calculating totals for order:', orderId);

    try {
      // Get all items
      const { data: items, error: itemsError } = await supabase
        .from(this.itemsTable)
        .select('quantity, total_price')
        .eq('bulk_order_id', orderId);

      if (itemsError) {
        console.error('[BulkOrderService] Error fetching items for totals:', itemsError);
        return;
      }

      // Calculate totals
      const totalItems = items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
      const estimatedTotal = items?.reduce((sum, item) => sum + parseFloat(item.total_price.toString()), 0) || 0;

      // Get unique retailer count
      const { data: retailers, error: retailersError } = await supabase
        .from(this.retailersTable)
        .select('retailer')
        .eq('bulk_order_id', orderId);

      const totalRetailers = retailers?.length || 0;

      // Update order
      const { error: updateError } = await supabase
        .from(this.ordersTable)
        .update({
          total_items: totalItems,
          total_retailers: totalRetailers,
          estimated_total: estimatedTotal,
        })
        .eq('id', orderId);

      if (updateError) {
        console.error('[BulkOrderService] Error updating order totals:', updateError);
      }

      console.log('[BulkOrderService] Totals calculated:', { totalItems, totalRetailers, estimatedTotal });

    } catch (error) {
      console.error('[BulkOrderService] Error calculating totals:', error);
    }
  }

  /**
   * Group items by retailer
   */
  async groupByRetailer(orderId: string): Promise<BulkOrderRetailer[]> {
    console.log('[BulkOrderService] Grouping items by retailer for order:', orderId);

    try {
      const { data, error } = await supabase
        .from(this.retailersTable)
        .select('*')
        .eq('bulk_order_id', orderId)
        .order('retailer', { ascending: true });

      if (error) {
        console.error('[BulkOrderService] Error fetching retailer groupings:', error);
        return [];
      }

      return (data as BulkOrderRetailer[]) || [];

    } catch (error) {
      console.error('[BulkOrderService] Error grouping by retailer:', error);
      return [];
    }
  }

  /**
   * Update retailer grouping after item changes
   */
  private async updateRetailerGrouping(orderId: string, retailer: string): Promise<void> {
    console.log('[BulkOrderService] Updating retailer grouping:', retailer);

    try {
      // Get all items for this retailer
      const { data: items, error: itemsError } = await supabase
        .from(this.itemsTable)
        .select('quantity, total_price')
        .eq('bulk_order_id', orderId)
        .eq('retailer', retailer);

      if (itemsError) {
        console.error('[BulkOrderService] Error fetching retailer items:', itemsError);
        return;
      }

      if (!items || items.length === 0) {
        // No items left for this retailer, remove the grouping
        await supabase
          .from(this.retailersTable)
          .delete()
          .eq('bulk_order_id', orderId)
          .eq('retailer', retailer);

        console.log('[BulkOrderService] Removed retailer grouping:', retailer);
        return;
      }

      const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
      const retailerTotal = items.reduce((sum, item) => sum + parseFloat(item.total_price.toString()), 0);

      // Check if grouping exists
      const { data: existing } = await supabase
        .from(this.retailersTable)
        .select('id')
        .eq('bulk_order_id', orderId)
        .eq('retailer', retailer)
        .maybeSingle();

      if (existing) {
        // Update existing grouping
        await supabase
          .from(this.retailersTable)
          .update({
            item_count: itemCount,
            retailer_total: retailerTotal,
          })
          .eq('id', existing.id);
      } else {
        // Create new grouping
        await supabase
          .from(this.retailersTable)
          .insert({
            bulk_order_id: orderId,
            retailer,
            item_count: itemCount,
            retailer_total: retailerTotal,
            retailer_status: 'pending',
          });
      }

      console.log('[BulkOrderService] Retailer grouping updated:', retailer);

    } catch (error) {
      console.error('[BulkOrderService] Error updating retailer grouping:', error);
    }
  }

  /**
   * Cancel/delete a bulk order
   */
  async cancelBulkOrder(orderId: string, userId: string): Promise<boolean> {
    console.log('[BulkOrderService] Cancelling order:', orderId);

    try {
      // Check ownership
      const ownsOrder = await this.checkUserOwnsOrder(orderId, userId);
      if (!ownsOrder) {
        console.warn('[BulkOrderService] User does not own order:', orderId);
        return false;
      }

      // Delete the order (cascade will delete items and retailers)
      const { error } = await supabase
        .from(this.ordersTable)
        .delete()
        .eq('id', orderId);

      if (error) {
        console.error('[BulkOrderService] Error cancelling order:', error);
        return false;
      }

      console.log('[BulkOrderService] Order cancelled');

      return true;

    } catch (error) {
      console.error('[BulkOrderService] Error cancelling order:', error);
      return false;
    }
  }

  /**
   * Submit a draft order for processing
   */
  async submitBulkOrder(orderId: string, userId: string): Promise<boolean> {
    console.log('[BulkOrderService] Submitting order:', orderId);

    try {
      // Check ownership
      const ownsOrder = await this.checkUserOwnsOrder(orderId, userId);
      if (!ownsOrder) {
        console.warn('[BulkOrderService] User does not own order:', orderId);
        return false;
      }

      // Get order to check status
      const { data: order, error: orderError } = await supabase
        .from(this.ordersTable)
        .select('status')
        .eq('id', orderId)
        .single();

      if (orderError || !order) {
        console.error('[BulkOrderService] Order not found:', orderError);
        return false;
      }

      if (order.status !== 'draft') {
        console.warn('[BulkOrderService] Order is not in draft status:', order.status);
        return false;
      }

      // Update status to pending
      const { error: updateError } = await supabase
        .from(this.ordersTable)
        .update({ status: 'pending' })
        .eq('id', orderId);

      if (updateError) {
        console.error('[BulkOrderService] Error submitting order:', updateError);
        return false;
      }

      console.log('[BulkOrderService] Order submitted');

      return true;

    } catch (error) {
      console.error('[BulkOrderService] Error submitting order:', error);
      return false;
    }
  }
}

// Export singleton instance
export const bulkOrderService = new BulkOrderService();
