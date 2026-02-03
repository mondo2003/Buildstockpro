// BuildStock Pro Quote Type Definitions

export interface Quote {
  id: string;
  user_id: string;
  status: 'pending' | 'sent' | 'responded' | 'expired' | 'cancelled';
  title: string;
  delivery_location: string;
  delivery_postcode: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
  expires_at: string | null;
  response_deadline: string | null;
  items?: QuoteItem[];
  responses?: QuoteResponse[];
}

export interface QuoteItem {
  id: string;
  quote_id: string;
  scraped_price_id: string;
  product_name: string;
  retailer: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  notes: string | null;
  product_image?: string;
  product_category?: string;
}

export interface QuoteResponse {
  id: string;
  quote_id: string;
  responder_name: string;
  responder_email: string;
  response_message: string;
  quoted_total: number;
  valid_until: string | null;
  created_at: string;
}

export interface CreateQuoteRequest {
  title: string;
  delivery_location: string;
  delivery_postcode: string;
  notes?: string;
  response_deadline?: string;
  items: {
    scraped_price_id: string;
    quantity: number;
    notes?: string;
  }[];
}

export interface UpdateQuoteRequest {
  title?: string;
  delivery_location?: string;
  delivery_postcode?: string;
  notes?: string;
  response_deadline?: string;
  status?: 'pending' | 'sent' | 'responded' | 'expired' | 'cancelled';
}

export interface AddQuoteItemRequest {
  scraped_price_id: string;
  quantity: number;
  notes?: string;
}

export interface AddQuoteResponseRequest {
  responder_name: string;
  responder_email: string;
  response_message: string;
  quoted_total: number;
  valid_until?: string;
}

export interface QuoteListParams {
  status?: 'pending' | 'sent' | 'responded' | 'expired' | 'cancelled';
  page?: number;
  page_size?: number;
  sort?: 'created_at' | 'updated_at' | 'title' | 'total';
}

export interface QuoteListResponse {
  quotes: Quote[];
  pagination: {
    page: number;
    page_size: number;
    total: number;
    total_pages: number;
  };
}
