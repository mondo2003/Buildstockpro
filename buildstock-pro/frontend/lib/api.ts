// BuildStock Pro API Client

import { Product, SearchFilters, SearchResults, Order, CheckoutFormData } from './types';
import { mockProducts, getFilteredProducts } from './mockData';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: string;
}

interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

class ApiClient {
  private baseUrl: string;
  private useMockData: boolean = false;

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
      console.error(`API request failed: ${url}`, error);
      throw error;
    }
  }

  // Search products with fallback to mock data
  async searchProducts(filters: SearchFilters): Promise<SearchResults> {
    const params = new URLSearchParams();

    // Map frontend filters to backend query params
    if (filters.query) params.append('search', filters.query);
    if (filters.category?.length) {
      console.log('API: Filtering by category:', filters.category);
      params.append('category', filters.category[0]); // Backend expects single category
    }
    if (filters.sortBy) {
      // Map frontend sort values to backend
      const sortMap: Record<string, string> = {
        'price-asc': 'price_asc',
        'price-desc': 'price_desc',
        'distance': 'distance',
        'rating': 'rating',
        'carbon': 'carbon_footprint',
        'relevance': 'relevance',
      };
      params.append('sortBy', sortMap[filters.sortBy] || filters.sortBy);
    }
    params.append('page', String(filters.page || 1));
    params.append('limit', '20');

    try {
      console.log('API: Fetching from backend with params:', params.toString());
      const result = await this.request<any[]>(`/api/v1/search?${params.toString()}`);

      // Transform backend response to frontend format
      const products = result.map(this.transformBackendProduct);
      const total = products.length;

      console.log('API: Backend returned', products.length, 'products');

      return {
        products,
        total,
        page: 1,
        pageSize: 20,
        facets: {
          categories: [],
          priceRange: { min: 0, max: 1000 },
          certifications: [],
        },
      };
    } catch (error) {
      console.warn('API: Backend request failed, falling back to mock data', error);
      // Fallback to mock data
      return getFilteredProducts(filters);
    }
  }

  // Get single product with fallback
  async getProduct(id: string): Promise<Product> {
    try {
      const result = await this.request<any>(`/api/products/${id}`);
      return this.transformBackendProduct(result);
    } catch (error) {
      console.warn('Failed to fetch product from API, falling back to mock data', error);
      const mockProduct = mockProducts.find(p => p.id === id);
      if (mockProduct) return mockProduct;
      throw error;
    }
  }

  // Get categories with fallback
  async getCategories(): Promise<{ name: string; count: number }[]> {
    try {
      const result = await this.request<string[]>('/api/products/meta/categories');
      return result.map(name => ({ name, count: 0 }));
    } catch (error) {
      console.warn('Failed to fetch categories from API, falling back to mock data', error);
      // Extract unique categories from mock data
      const categories = Array.from(new Set(mockProducts.map(p => p.category)));
      return categories.map(name => ({ name, count: mockProducts.filter(p => p.category === name).length }));
    }
  }

  // Get brands with fallback
  async getBrands(): Promise<{ name: string; count: number }[]> {
    try {
      const result = await this.request<string[]>('/api/products/meta/brands');
      return result.map(name => ({ name, count: 0 }));
    } catch (error) {
      console.warn('Failed to fetch brands from API, falling back to mock data', error);
      // Extract unique brands from mock data (from suppliers)
      const brands = Array.from(new Set(mockProducts.flatMap(p => p.suppliers.map(s => s.name))));
      return brands.map(name => ({ name, count: 0 }));
    }
  }

  // Transform backend product format to frontend format
  private transformBackendProduct(backendProduct: any): Product {
    // This transforms the backend database schema to match frontend expectations
    return {
      id: backendProduct.id,
      name: backendProduct.name,
      description: backendProduct.description || '',
      category: backendProduct.category || 'Other',
      images: backendProduct.images || [],
      price: backendProduct.base_price || 0,
      unit: backendProduct.unit || 'unit',
      stock: {
        level: backendProduct.total_stock > 10 ? 'in-stock' : backendProduct.total_stock > 0 ? 'low-stock' : 'out-of-stock',
        quantity: backendProduct.total_stock || 0,
        lastUpdated: new Date().toISOString(),
      },
      eco: {
        carbonFootprint: backendProduct.carbon_footprint || 0,
        carbonFootprintUnit: 'kg CO2e',
        rating: (backendProduct.eco_rating || 'C') as 'A' | 'B' | 'C' | 'D' | 'E',
        certifications: backendProduct.certifications || [],
      },
      rating: {
        average: backendProduct.average_rating || 0,
        count: backendProduct.rating_count || 0,
      },
      suppliers: [], // Would be populated from listings
      location: {
        latitude: 0,
        longitude: 0,
      },
      tags: backendProduct.tags || [],
      createdAt: backendProduct.created_at || new Date().toISOString(),
      updatedAt: backendProduct.updated_at || new Date().toISOString(),
    };
  }

  // Force use of mock data (for testing)
  enableMockMode() {
    this.useMockData = true;
  }

  disableMockMode() {
    this.useMockData = false;
  }

  // Create order
  async createOrder(checkoutData: CheckoutFormData & { items: any[]; supplierId: string }): Promise<Order> {
    try {
      const result = await this.request<Order>('/api/orders', {
        method: 'POST',
        body: JSON.stringify(checkoutData),
      });
      return result;
    } catch (error) {
      console.warn('Failed to create order, using mock response', error);
      // Mock order creation
      const subtotal = checkoutData.items.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);
      const deliveryFee = checkoutData.fulfillmentType === 'delivery' ? 15 : 0;

      return {
        id: `ORD-${Date.now()}`,
        userId: 'mock-user-id',
        items: checkoutData.items.map((item: any, index: number) => ({
          id: `item-${index}`,
          productId: item.id,
          productName: item.name,
          quantity: item.quantity,
          unitPrice: item.price,
          totalPrice: item.price * item.quantity,
        })),
        supplier: {
          id: checkoutData.supplierId,
          name: 'Mock Supplier',
          address: '123 Mock St, San Francisco, CA',
          distance: 3.5,
          stock: 100,
        },
        status: 'confirmed',
        fulfillmentType: checkoutData.fulfillmentType,
        subtotal,
        fee: deliveryFee,
        total: subtotal + deliveryFee,
        customerDetails: checkoutData,
        estimatedPickupTime: checkoutData.fulfillmentType === 'pickup' ? new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString() : undefined,
        estimatedDeliveryTime: checkoutData.fulfillmentType === 'delivery' ? new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() : undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    }
  }

  // Get user orders
  async getUserOrders(): Promise<Order[]> {
    try {
      const result = await this.request<Order[]>('/api/orders');
      return result;
    } catch (error) {
      console.warn('Failed to fetch orders, returning empty array', error);
      return [];
    }
  }

  // Get single order
  async getOrder(orderId: string): Promise<Order> {
    try {
      const result = await this.request<Order>(`/api/orders/${orderId}`);
      return result;
    } catch (error) {
      console.warn('Failed to fetch order', error);
      throw error;
    }
  }

  // Cancel order
  async cancelOrder(orderId: string): Promise<Order> {
    try {
      const result = await this.request<Order>(`/api/orders/${orderId}/cancel`, {
        method: 'POST',
      });
      return result;
    } catch (error) {
      console.warn('Failed to cancel order', error);
      throw error;
    }
  }
}

export const api = new ApiClient();
