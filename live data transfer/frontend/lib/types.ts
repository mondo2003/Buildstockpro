// BuildStock Pro Type Definitions

export interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  images: string[];
  price: number;
  unit: string;
  stock: {
    level: 'in-stock' | 'low-stock' | 'out-of-stock';
    quantity: number;
    lastUpdated: string;
  };
  eco: {
    carbonFootprint: number;
    carbonFootprintUnit: string;
    rating: 'A' | 'B' | 'C' | 'D' | 'E';
    certifications: string[];
  };
  rating: {
    average: number;
    count: number;
  };
  suppliers: Supplier[];
  location: {
    latitude: number;
    longitude: number;
  };
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Supplier {
  id: string;
  name: string;
  address: string;
  distance: number; // in miles
  phone?: string;
  website?: string;
  stock: number;
  sameDayCollection?: boolean;
}

export interface SearchFilters {
  query?: string;
  category?: string[];
  priceRange?: [number, number];
  distance?: number;
  inStock?: boolean;
  ecoRating?: ('A' | 'B' | 'C' | 'D' | 'E')[];
  carbonFootprint?: [number, number];
  certifications?: string[];
  minRating?: number;
  sortBy?: 'relevance' | 'price-asc' | 'price-desc' | 'distance' | 'rating' | 'carbon';
  page?: number;
  location?: { lat: number; lng: number };
  sameDayCollection?: boolean;
}

export interface SearchResults {
  products: Product[];
  total: number;
  page: number;
  pageSize: number;
  facets: {
    categories: { name: string; count: number }[];
    priceRange: { min: number; max: number };
    certifications: { name: string; count: number }[];
  };
}

export interface User {
  id: string;
  name: string;
  email: string;
  location?: {
    latitude: number;
    longitude: number;
    address: string;
  };
  preferences: {
    maxDistance: number;
    preferredCategories: string[];
    notifications: boolean;
  };
}

export interface CartItem {
  id: string;
  product: Product;
  quantity: number;
  supplierId: string;
}

export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  supplier: Supplier;
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'completed' | 'cancelled';
  fulfillmentType: 'pickup' | 'delivery';
  subtotal: number;
  fee: number;
  total: number;
  customerDetails: {
    name: string;
    email: string;
    phone: string;
    company?: string;
    notes?: string;
    deliveryAddress?: {
      street: string;
      city: string;
      state: string;
      zipCode: string;
      instructions?: string;
    };
  };
  estimatedPickupTime?: string;
  estimatedDeliveryTime?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface CheckoutFormData {
  name: string;
  email: string;
  phone: string;
  company?: string;
  notes?: string;
  fulfillmentType: 'pickup' | 'delivery';
  deliveryAddress?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    instructions?: string;
  };
}
