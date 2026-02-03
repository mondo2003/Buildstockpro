// Merchant Contact API Service

import {
  MerchantContactRequest,
  CreateContactRequest,
  ContactRequestsParams,
  ContactRequestsResponse,
  AddResponseRequest,
  MerchantContactResponse,
  FindBranchesParams,
  Branch,
  UKPostcodeValidation,
} from '@/types/merchantContact';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: string;
}

class MerchantContactApiClient {
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
      console.error(`Merchant Contact API request failed: ${url}`, error);
      throw error;
    }
  }

  /**
   * Create a new contact request
   * POST /api/v1/merchant/contact
   */
  async createContactRequest(data: CreateContactRequest): Promise<MerchantContactRequest> {
    return this.request<MerchantContactRequest>('/api/v1/merchant/contact', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * Get contact requests with optional filters
   * GET /api/v1/merchant/contact
   */
  async getContactRequests(params?: ContactRequestsParams): Promise<ContactRequestsResponse> {
    const queryParams = new URLSearchParams();

    if (params?.status) {
      queryParams.append('status', params.status);
    }
    if (params?.merchant_id) {
      queryParams.append('merchant_id', params.merchant_id);
    }
    if (params?.page) {
      queryParams.append('page', String(params.page));
    }
    if (params?.page_size) {
      queryParams.append('page_size', String(params.page_size));
    }

    const queryString = queryParams.toString();
    const endpoint = `/api/v1/merchant/contact${queryString ? `?${queryString}` : ''}`;

    return this.request<ContactRequestsResponse>(endpoint);
  }

  /**
   * Get a single contact request by ID
   * GET /api/v1/merchant/contact/:id
   */
  async getContactById(id: string): Promise<MerchantContactRequest> {
    return this.request<MerchantContactRequest>(`/api/v1/merchant/contact/${id}`);
  }

  /**
   * Delete a contact request
   * DELETE /api/v1/merchant/contact/:id
   */
  async deleteContactRequest(id: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/api/v1/merchant/contact/${id}`, {
      method: 'DELETE',
    });
  }

  /**
   * Add a response to a contact request
   * POST /api/v1/merchant/contact/:id/respond
   */
  async addResponse(id: string, response: AddResponseRequest): Promise<MerchantContactResponse> {
    return this.request<MerchantContactResponse>(`/api/v1/merchant/contact/${id}/respond`, {
      method: 'POST',
      body: JSON.stringify(response),
    });
  }

  /**
   * Find nearest branches for a merchant
   * GET /api/v1/merchant/:merchantId/branches
   */
  async findNearestBranches(merchantId: string, params: FindBranchesParams): Promise<Branch[]> {
    const queryParams = new URLSearchParams();

    if (params.postcode) {
      queryParams.append('postcode', params.postcode);
    }
    if (params.radius_km) {
      queryParams.append('radius_km', String(params.radius_km));
    }

    const queryString = queryParams.toString();
    const endpoint = `/api/v1/merchant/${merchantId}/branches${queryString ? `?${queryString}` : ''}`;

    return this.request<Branch[]>(endpoint);
  }

  /**
   * Get branch details
   * GET /api/v1/merchant/:merchantId/branches/:branchId
   */
  async getBranchDetails(merchantId: string, branchId: string): Promise<Branch> {
    return this.request<Branch>(`/api/v1/merchant/${merchantId}/branches/${branchId}`);
  }

  /**
   * Validate UK postcode format
   */
  validateUKPostcode(postcode: string): UKPostcodeValidation {
    // Remove any spaces and convert to uppercase
    const cleaned = postcode.replace(/\s+/g, '').toUpperCase();

    // UK postcode regex pattern
    const ukPostcodePattern =
      /^([A-Z]{1,2}\d[A-Z\d]?|ASCN|STHL|TDCU|BBND|[BFS]IQQ|PCRN|TKCA) ?\d[A-Z]{2}$/i;

    if (!cleaned) {
      return {
        valid: false,
        error: 'Postcode is required',
      };
    }

    // Format with space (e.g., SW1A1AA -> SW1A 1AA)
    const formatted = cleaned.length > 3
      ? cleaned.slice(0, -3) + ' ' + cleaned.slice(-3)
      : cleaned;

    if (!ukPostcodePattern.test(formatted)) {
      return {
        valid: false,
        error: 'Invalid UK postcode format',
      };
    }

    return {
      valid: true,
      postcode: formatted,
    };
  }

  /**
   * Format postcode with space
   */
  formatPostcode(postcode: string): string {
    const cleaned = postcode.replace(/\s+/g, '').toUpperCase();
    if (cleaned.length > 3) {
      return cleaned.slice(0, -3) + ' ' + cleaned.slice(-3);
    }
    return cleaned;
  }

  /**
   * Calculate distance between two coordinates (Haversine formula)
   */
  calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371; // Earth's radius in km
    const dLat = this.toRad(lat2 - lat1);
    const dLon = this.toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) *
        Math.cos(this.toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c;
    return d; // Distance in km
  }

  private toRad(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  /**
   * Format distance for display
   */
  formatDistance(distanceKm: number, useMiles: boolean = false): string {
    if (useMiles) {
      const miles = distanceKm * 0.621371;
      return miles < 1
        ? `${Math.round(miles * 1760)} yards away`
        : `${miles.toFixed(1)} miles away`;
    }
    return distanceKm < 1
      ? `${Math.round(distanceKm * 1000)}m away`
      : `${distanceKm.toFixed(1)}km away`;
  }
}

export const merchantContactApi = new MerchantContactApiClient();
