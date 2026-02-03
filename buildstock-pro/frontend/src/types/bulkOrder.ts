// BuildStock Pro Bulk Order Type Definitions

export interface BulkOrder {
  id: string;
  user_id: string;
  order_number: string;
  status: 'draft' | 'pending' | 'confirmed' | 'processing' | 'ready' | 'delivered' | 'cancelled';
  total_items: number;
  total_retailers: number;
  estimated_total: number;
  delivery_location: string;
  delivery_postcode: string;
  customer_notes: string | null;
  internal_notes: string | null;
  created_at: string;
  updated_at: string;
  items?: BulkOrderItem[];
  retailers?: BulkOrderRetailer[];
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
  notes: string | null;
  product?: {
    image_url: string;
    category: string;
    brand: string;
  };
}

export interface BulkOrderRetailer {
  id: string;
  bulk_order_id: string;
  retailer: string;
  item_count: number;
  retailer_total: number;
  retailer_status: 'pending' | 'acknowledged' | 'preparing' | 'ready';
}

export interface CreateBulkOrderRequest {
  delivery_location: string;
  delivery_postcode: string;
  customer_notes?: string;
  items: {
    scraped_price_id: string;
    quantity: number;
    notes?: string;
  }[];
}

export interface UpdateBulkOrderRequest {
  delivery_location?: string;
  delivery_postcode?: string;
  customer_notes?: string;
  status?: BulkOrder['status'];
}

export interface AddOrderItemRequest {
  scraped_price_id: string;
  quantity: number;
  notes?: string;
}

export interface UpdateOrderItemRequest {
  quantity?: number;
  notes?: string;
}

export interface BulkOrderSearchParams {
  status?: BulkOrder['status'];
  page?: number;
  page_size?: number;
  sort?: 'created_at' | 'updated_at' | 'estimated_total' | 'order_number';
  order?: 'asc' | 'desc';
}

export interface BulkOrderListResponse {
  orders: BulkOrder[];
  pagination: {
    page: number;
    page_size: number;
    total: number;
    total_pages: number;
  };
}

// Selected item for bulk order creation (stored in context/localStorage)
export interface SelectedBulkItem {
  scraped_price_id: string;
  product_id: string;
  product_name: string;
  retailer: string;
  price: number;
  image_url: string;
  category: string;
  quantity: number;
  in_stock: boolean;
}
