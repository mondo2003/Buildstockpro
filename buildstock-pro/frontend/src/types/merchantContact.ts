// Merchant Contact Types

export interface MerchantContactRequest {
  id: string;
  user_id: string;
  merchant_id: string;
  branch_id: string | null;
  scraped_price_id: string | null;
  product_name: string;
  inquiry_type: 'product_question' | 'stock_check' | 'bulk_quote' | 'general';
  message: string;
  contact_method: 'email' | 'phone' | 'visit';
  user_name: string;
  user_email: string;
  user_phone: string;
  status: 'pending' | 'sent' | 'responded' | 'resolved';
  created_at: string;
  updated_at: string;
  responses?: MerchantContactResponse[];
  branch?: Branch;
  merchant?: Merchant;
}

export interface MerchantContactResponse {
  id: string;
  contact_request_id: string;
  responder_name: string;
  response_message: string;
  created_at: string;
}

export interface Branch {
  id: string;
  merchant_id: string;
  name: string;
  address: string;
  postcode: string;
  phone: string | null;
  email: string | null;
  latitude: number | null;
  longitude: number | null;
  distance_km: number | null; // Calculated distance
}

export interface Merchant {
  id: string;
  name: string;
  logo_url: string | null;
  website: string | null;
}

export interface CreateContactRequest {
  merchant_id: string;
  branch_id?: string;
  scraped_price_id?: string;
  product_name?: string;
  inquiry_type: 'product_question' | 'stock_check' | 'bulk_quote' | 'general';
  message: string;
  user_name: string;
  user_email: string;
  user_phone?: string;
}

export interface ContactRequestsParams {
  status?: 'pending' | 'sent' | 'responded' | 'resolved';
  merchant_id?: string;
  page?: number;
  page_size?: number;
}

export interface ContactRequestsResponse {
  requests: MerchantContactRequest[];
  pagination: {
    page: number;
    page_size: number;
    total: number;
    total_pages: number;
  };
}

export interface AddResponseRequest {
  responder_name: string;
  response_message: string;
}

export interface FindBranchesParams {
  postcode: string;
  radius_km?: number;
}

export interface UKPostcodeValidation {
  valid: boolean;
  postcode?: string;
  error?: string;
}
