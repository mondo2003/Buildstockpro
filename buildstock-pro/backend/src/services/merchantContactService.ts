/**
 * Merchant Contact Service
 * Handles contact requests between users and merchants/branches
 */

import { supabase } from '../utils/database';

// ============================================================================
// TYPES
// ============================================================================

export interface ContactRequest {
  id: string;
  user_id: string;
  merchant_id: string;
  branch_id?: string;
  scraped_price_id?: string;
  product_name: string;
  product_sku?: string;
  inquiry_type: 'product_question' | 'stock_check' | 'bulk_quote' | 'general';
  message: string;
  contact_method: 'email' | 'phone' | 'visit';
  user_name: string;
  user_email: string;
  user_phone?: string;
  status: 'pending' | 'sent' | 'responded' | 'resolved' | 'cancelled';
  sent_at?: string;
  first_response_at?: string;
  resolved_at?: string;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface ContactResponse {
  id: string;
  contact_request_id: string;
  responder_name: string;
  responder_role?: string;
  response_message: string;
  responder_email?: string;
  responder_phone?: string;
  metadata?: Record<string, any>;
  created_at: string;
}

export interface ContactRequestWithDetails extends ContactRequest {
  merchant_name?: string;
  merchant_slug?: string;
  merchant_logo?: string;
  branch_name?: string;
  branch_address?: string;
  branch_city?: string;
  branch_postcode?: string;
  branch_phone?: string;
  branch_email?: string;
  branch_opens_at?: string;
  branch_closes_at?: string;
  product_url?: string;
  product_price?: number;
  product_in_stock?: boolean;
  response_count?: number;
}

export interface BranchInfo {
  id: string;
  merchant_id: string;
  branch_name: string;
  branch_code?: string;
  address?: string;
  city?: string;
  postcode?: string;
  phone?: string;
  email?: string;
  location?: {
    latitude: number;
    longitude: number;
  };
  opens_at?: string;
  closes_at?: string;
  click_and_collect?: boolean;
  is_active: boolean;
  distance_km?: number;
}

export interface CreateContactRequestData {
  merchant_id: string;
  branch_id?: string;
  scraped_price_id?: string;
  product_name: string;
  product_sku?: string;
  inquiry_type: 'product_question' | 'stock_check' | 'bulk_quote' | 'general';
  message: string;
  contact_method: 'email' | 'phone' | 'visit';
  user_name: string;
  user_email: string;
  user_phone?: string;
  metadata?: Record<string, any>;
}

export interface ContactRequestFilters {
  status?: string;
  merchant_id?: string;
  inquiry_type?: string;
  page?: number;
  page_size?: number;
}

export interface AddResponseData {
  responder_name: string;
  responder_role?: string;
  response_message: string;
  responder_email?: string;
  responder_phone?: string;
  metadata?: Record<string, any>;
}

// ============================================================================
// MAIN SERVICE
// ============================================================================

export class MerchantContactService {
  private readonly contactRequestsTable = 'merchant_contact_requests';
  private readonly contactResponsesTable = 'merchant_contact_responses';
  private readonly branchesTable = 'merchant_branches';
  private readonly merchantsTable = 'merchants';

  /**
   * Create a new contact request
   */
  async createContactRequest(userId: string, data: CreateContactRequestData): Promise<ContactRequest | null> {
    try {
      console.log(`[MerchantContact] Creating contact request for user ${userId}`);

      // Validate merchant exists
      const { data: merchant, error: merchantError } = await supabase
        .from(this.merchantsTable)
        .select('id, name')
        .eq('id', data.merchant_id)
        .single();

      if (merchantError || !merchant) {
        console.error('[MerchantContact] Merchant not found:', data.merchant_id);
        throw new Error('Merchant not found');
      }

      // If branch_id provided, validate it exists and belongs to merchant
      if (data.branch_id) {
        const { data: branch, error: branchError } = await supabase
          .from(this.branchesTable)
          .select('id, merchant_id')
          .eq('id', data.branch_id)
          .single();

        if (branchError || !branch) {
          console.error('[MerchantContact] Branch not found:', data.branch_id);
          throw new Error('Branch not found');
        }

        if (branch.merchant_id !== data.merchant_id) {
          console.error('[MerchantContact] Branch does not belong to merchant');
          throw new Error('Branch does not belong to the specified merchant');
        }
      }

      // Create contact request
      const { data: contactRequest, error } = await supabase
        .from(this.contactRequestsTable)
        .insert({
          user_id: userId,
          merchant_id: data.merchant_id,
          branch_id: data.branch_id || null,
          scraped_price_id: data.scraped_price_id || null,
          product_name: data.product_name,
          product_sku: data.product_sku || null,
          inquiry_type: data.inquiry_type,
          message: data.message,
          contact_method: data.contact_method,
          user_name: data.user_name,
          user_email: data.user_email,
          user_phone: data.user_phone || null,
          metadata: data.metadata || {},
        })
        .select()
        .single();

      if (error) {
        console.error('[MerchantContact] Error creating contact request:', error);
        throw error;
      }

      console.log(`[MerchantContact] ✅ Contact request created: ${contactRequest.id}`);
      return contactRequest as ContactRequest;

    } catch (error) {
      console.error('[MerchantContact] Error in createContactRequest:', error);
      throw error;
    }
  }

  /**
   * Get user's contact requests with filters
   */
  async getContactRequests(userId: string, filters: ContactRequestFilters = {}): Promise<{
    requests: ContactRequestWithDetails[];
    total: number;
    page: number;
    page_size: number;
    total_pages: number;
  }> {
    try {
      const page = filters.page || 1;
      const pageSize = filters.page_size || 20;
      const start = (page - 1) * pageSize;
      const end = start + pageSize - 1;

      let query = supabase
        .from('contact_requests_detail_view')
        .select('*', { count: 'exact' })
        .eq('user_id', userId);

      // Apply filters
      if (filters.status) {
        query = query.eq('status', filters.status);
      }

      if (filters.merchant_id) {
        query = query.eq('merchant_id', filters.merchant_id);
      }

      if (filters.inquiry_type) {
        query = query.eq('inquiry_type', filters.inquiry_type);
      }

      // Order by created_at descending
      query = query.order('created_at', { ascending: false });

      // Apply pagination
      query = query.range(start, end);

      const { data, error, count } = await query;

      if (error) {
        console.error('[MerchantContact] Error fetching contact requests:', error);
        throw error;
      }

      const total = count || 0;

      return {
        requests: (data as ContactRequestWithDetails[]) || [],
        total,
        page,
        page_size: pageSize,
        total_pages: Math.ceil(total / pageSize),
      };

    } catch (error) {
      console.error('[MerchantContact] Error in getContactRequests:', error);
      throw error;
    }
  }

  /**
   * Get single contact request by ID
   */
  async getContactById(id: string, userId: string): Promise<ContactRequestWithDetails | null> {
    try {
      const { data, error } = await supabase
        .from('contact_requests_detail_view')
        .select('*')
        .eq('id', id)
        .eq('user_id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // Not found
        }
        console.error('[MerchantContact] Error fetching contact request:', error);
        throw error;
      }

      return data as ContactRequestWithDetails;

    } catch (error) {
      console.error('[MerchantContact] Error in getContactById:', error);
      throw error;
    }
  }

  /**
   * Get responses for a contact request
   */
  async getContactResponses(contactRequestId: string, userId?: string): Promise<ContactResponse[]> {
    try {
      let query = supabase
        .from(this.contactResponsesTable)
        .select('*')
        .eq('contact_request_id', contactRequestId)
        .order('created_at', { ascending: true });

      // If userId provided, verify they own the contact request
      if (userId) {
        const { data: contactRequest } = await supabase
          .from(this.contactRequestsTable)
          .select('user_id')
          .eq('id', contactRequestId)
          .single();

        if (!contactRequest || contactRequest.user_id !== userId) {
          throw new Error('Access denied');
        }
      }

      const { data, error } = await query;

      if (error) {
        console.error('[MerchantContact] Error fetching responses:', error);
        throw error;
      }

      return (data as ContactResponse[]) || [];

    } catch (error) {
      console.error('[MerchantContact] Error in getContactResponses:', error);
      throw error;
    }
  }

  /**
   * Find nearest branches to a postcode
   * Uses simplified distance calculation (Haversine formula)
   */
  async findNearestBranches(
    merchantId: string,
    postcode: string,
    radiusKm: number = 50
  ): Promise<BranchInfo[]> {
    try {
      console.log(`[MerchantContact] Finding branches for merchant ${merchantId} near ${postcode} (${radiusKm}km)`);

      // Get coordinates from postcode (simplified - using lookup)
      const centerCoords = await this.getPostcodeCoordinates(postcode);

      if (!centerCoords) {
        console.warn('[MerchantContact] Could not get coordinates for postcode:', postcode);
        // Return all branches for the merchant without distance calculation
        const { data: branches } = await supabase
          .from(this.branchesTable)
          .select('*')
          .eq('merchant_id', merchantId)
          .eq('is_active', true);

        return (branches || []).map((b: any) => this.mapBranchInfo(b));
      }

      // Get all active branches for the merchant
      const { data: branches, error } = await supabase
        .from(this.branchesTable)
        .select('*')
        .eq('merchant_id', merchantId)
        .eq('is_active', true);

      if (error) {
        throw error;
      }

      if (!branches || branches.length === 0) {
        return [];
      }

      // Calculate distances and filter by radius
      const branchesWithDistance = branches
        .map((branch: any) => {
          const branchCoords = this.extractCoordinates(branch);
          if (!branchCoords) {
            return null;
          }

          const distance = this.calculateDistance(
            centerCoords.latitude,
            centerCoords.longitude,
            branchCoords.latitude,
            branchCoords.longitude
          );

          return {
            ...branch,
            distance_km: Math.round(distance * 10) / 10, // Round to 1 decimal
          };
        })
        .filter((branch): branch is any => branch !== null && branch.distance_km <= radiusKm)
        .sort((a, b) => a.distance_km - b.distance_km);

      console.log(`[MerchantContact] Found ${branchesWithDistance.length} branches within ${radiusKm}km`);
      return branchesWithDistance.map((b: any) => this.mapBranchInfo(b));

    } catch (error) {
      console.error('[MerchantContact] Error in findNearestBranches:', error);
      throw error;
    }
  }

  /**
   * Get branch details by ID
   */
  async getBranchDetails(branchId: string): Promise<BranchInfo | null> {
    try {
      const { data, error } = await supabase
        .from(this.branchesTable)
        .select('*')
        .eq('id', branchId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null;
        }
        throw error;
      }

      return this.mapBranchInfo(data);

    } catch (error) {
      console.error('[MerchantContact] Error in getBranchDetails:', error);
      throw error;
    }
  }

  /**
   * Update contact request status
   */
  async updateContactStatus(
    id: string,
    status: 'pending' | 'sent' | 'responded' | 'resolved' | 'cancelled',
    userId?: string
  ): Promise<ContactRequest | null> {
    try {
      let query = supabase
        .from(this.contactRequestsTable)
        .update({ status })
        .eq('id', id);

      // If userId provided, verify ownership
      if (userId) {
        query = query.eq('user_id', userId);
      }

      const { data, error } = await query.select().single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null;
        }
        console.error('[MerchantContact] Error updating status:', error);
        throw error;
      }

      console.log(`[MerchantContact] ✅ Updated contact request ${id} status to ${status}`);
      return data as ContactRequest;

    } catch (error) {
      console.error('[MerchantContact] Error in updateContactStatus:', error);
      throw error;
    }
  }

  /**
   * Add a response to a contact request
   */
  async addResponse(
    contactRequestId: string,
    responseData: AddResponseData
  ): Promise<ContactResponse | null> {
    try {
      console.log(`[MerchantContact] Adding response to contact request ${contactRequestId}`);

      // Verify contact request exists
      const { data: contactRequest } = await supabase
        .from(this.contactRequestsTable)
        .select('id, status')
        .eq('id', contactRequestId)
        .single();

      if (!contactRequest) {
        throw new Error('Contact request not found');
      }

      // Create response
      const { data: response, error } = await supabase
        .from(this.contactResponsesTable)
        .insert({
          contact_request_id: contactRequestId,
          responder_name: responseData.responder_name,
          responder_role: responseData.responder_role || null,
          response_message: responseData.response_message,
          responder_email: responseData.responder_email || null,
          responder_phone: responseData.responder_phone || null,
          metadata: responseData.metadata || {},
        })
        .select()
        .single();

      if (error) {
        console.error('[MerchantContact] Error adding response:', error);
        throw error;
      }

      // Update contact request status if it was pending/sent
      if (contactRequest.status === 'pending' || contactRequest.status === 'sent') {
        await this.updateContactStatus(contactRequestId, 'responded');
      }

      console.log(`[MerchantContact] ✅ Response added: ${response.id}`);
      return response as ContactResponse;

    } catch (error) {
      console.error('[MerchantContact] Error in addResponse:', error);
      throw error;
    }
  }

  /**
   * Delete/cancel a contact request
   */
  async deleteContactRequest(id: string, userId: string): Promise<boolean> {
    try {
      // First verify ownership
      const { data: contactRequest } = await supabase
        .from(this.contactRequestsTable)
        .select('user_id, status')
        .eq('id', id)
        .single();

      if (!contactRequest) {
        return false;
      }

      if (contactRequest.user_id !== userId) {
        throw new Error('Access denied');
      }

      // Only allow deletion of pending requests
      if (contactRequest.status !== 'pending') {
        throw new Error('Can only cancel pending requests');
      }

      // Update status to cancelled instead of deleting
      const { error } = await supabase
        .from(this.contactRequestsTable)
        .update({ status: 'cancelled' })
        .eq('id', id)
        .eq('user_id', userId);

      if (error) {
        console.error('[MerchantContact] Error cancelling contact request:', error);
        throw error;
      }

      console.log(`[MerchantContact] ✅ Contact request ${id} cancelled`);
      return true;

    } catch (error) {
      console.error('[MerchantContact] Error in deleteContactRequest:', error);
      throw error;
    }
  }

  // ============================================================================
  // HELPER METHODS
  // ============================================================================

  /**
   * Calculate distance between two coordinates using Haversine formula
   * Returns distance in kilometers
   */
  private calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371; // Earth's radius in km
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) *
      Math.cos(this.toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  /**
   * Convert degrees to radians
   */
  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  /**
   * Get coordinates from UK postcode (simplified version)
   * In production, use a proper postcode lookup service
   */
  private async getPostcodeCoordinates(postcode: string): Promise<{ latitude: number; longitude: number } | null> {
    try {
      // Strip spaces and convert to uppercase
      const cleanPostcode = postcode.replace(/\s+/g, '').toUpperCase();

      // Simple lookup for major UK cities (in production, use a proper API)
      const cityCoords: Record<string, { latitude: number; longitude: number }> = {
        // London
        'NW19NE': { latitude: 51.5412, longitude: -0.1468 },
        'N79AP': { latitude: 51.5375, longitude: -0.1245 },
        'N78JL': { latitude: 51.5580, longitude: -0.1180 },
        'NW19QB': { latitude: 51.5470, longitude: -0.1420 },
        'N195QE': { latitude: 51.5620, longitude: -0.1380 },
        'EN13JS': { latitude: 51.6520, longitude: -0.0680 },
        // Birmingham
        'B57AA': { latitude: 52.4767, longitude: -1.9025 },
        'B347QU': { latitude: 52.5025, longitude: -1.7980 },
        'B6203BN': { latitude: 52.4630, longitude: -1.8540 },
        'B203LJ': { latitude: 52.5030, longitude: -1.8670 },
        // Manchester
        'M88EP': { latitude: 53.4974, longitude: -2.2450 },
        'M171PP': { latitude: 53.4480, longitude: -2.3020 },
        'M84LW': { latitude: 53.5080, longitude: -2.2340 },
        'M160PG': { latitude: 53.4580, longitude: -2.2800 },
        'M54LW': { latitude: 53.4810, longitude: -2.2610 },
        // Leeds
        'LS107EX': { latitude: 53.7930, longitude: -1.5281 },
        'LS104NW': { latitude: 53.7680, longitude: -1.5850 },
      };

      // Check for exact match
      if (cityCoords[cleanPostcode]) {
        return cityCoords[cleanPostcode];
      }

      // Try to match outward code (first part of postcode)
      const outwardCode = cleanPostcode.slice(0, -3);
      const matchingKey = Object.keys(cityCoords).find(key => key.startsWith(outwardCode));

      if (matchingKey) {
        return cityCoords[matchingKey];
      }

      // Default to London if not found
      console.warn(`[MerchantContact] Postcode not found in lookup: ${postcode}`);
      return null;

    } catch (error) {
      console.error('[MerchantContact] Error getting postcode coordinates:', error);
      return null;
    }
  }

  /**
   * Extract coordinates from branch data
   */
  private extractCoordinates(branch: any): { latitude: number; longitude: number } | null {
    try {
      // Check if location is a PostGIS geography object
      if (branch.location) {
        // PostGIS returns ST_AsGeoJSON or similar
        // For now, assume we have latitude/longitude columns or parse from location
        if (typeof branch.location === 'object') {
          return branch.location;
        }
      }

      // Fallback: check if we have latitude/longitude in the branch data
      // (might need to be added to schema or queried separately)
      return null;

    } catch (error) {
      console.error('[MerchantContact] Error extracting coordinates:', error);
      return null;
    }
  }

  /**
   * Map database branch to BranchInfo
   */
  private mapBranchInfo(branch: any): BranchInfo {
    return {
      id: branch.id,
      merchant_id: branch.merchant_id,
      branch_name: branch.branch_name,
      branch_code: branch.branch_code,
      address: branch.address,
      city: branch.city,
      postcode: branch.postcode,
      phone: branch.phone,
      email: branch.email,
      opens_at: branch.opens_at,
      closes_at: branch.closes_at,
      click_and_collect: branch.click_and_collect,
      is_active: branch.is_active,
      distance_km: branch.distance_km,
      location: branch.location ? {
        latitude: branch.location.latitude || branch.location.y,
        longitude: branch.location.longitude || branch.location.x,
      } : undefined,
    };
  }
}

// Export singleton instance
export const merchantContactService = new MerchantContactService();
