// Utility functions for checkout flow testing and development

import { CartItem, Product } from './types';

/**
 * Creates mock cart items for testing the checkout flow
 */
export function createMockCartItems(products: Product[]): CartItem[] {
  return products.slice(0, 3).map((product) => ({
    id: `cart-${product.id}`,
    product,
    quantity: Math.floor(Math.random() * 10) + 1,
    supplierId: product.suppliers[0]?.id || 'default-supplier',
  }));
}

/**
 * Calculate cart totals
 */
export function calculateCartTotals(items: CartItem[]) {
  const subtotal = items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  return { subtotal, itemCount };
}

/**
 * Validate checkout step
 */
export function validateCheckoutStep(
  step: string,
  data: any
): { isValid: boolean; errors?: Record<string, string> } {
  const errors: Record<string, string> = {};

  switch (step) {
    case 'review':
      if (!data.items || data.items.length === 0) {
        errors.items = 'Your cart is empty';
      }
      break;

    case 'supplier':
      if (!data.selectedSupplier) {
        errors.supplier = 'Please select a supplier';
      }
      break;

    case 'details':
      if (!data.name?.trim()) errors.name = 'Name is required';
      if (!data.email?.trim()) errors.email = 'Email is required';
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
        errors.email = 'Invalid email address';
      }
      if (!data.phone?.trim()) errors.phone = 'Phone is required';
      if (data.fulfillmentType === 'delivery' && !data.deliveryAddress?.street) {
        errors.street = 'Street address is required for delivery';
      }
      break;

    default:
      break;
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors: Object.keys(errors).length > 0 ? errors : undefined,
  };
}

/**
 * Format currency
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

/**
 * Format date for display
 */
export function formatOrderDate(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

/**
 * Get status color class
 */
export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-blue-100 text-blue-800',
    preparing: 'bg-purple-100 text-purple-800',
    ready: 'bg-green-100 text-green-800',
    completed: 'bg-gray-100 text-gray-800',
    cancelled: 'bg-red-100 text-red-800',
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
}

/**
 * Get eco rating color
 */
export function getEcoRatingColor(rating: string): string {
  const colors: Record<string, string> = {
    A: 'bg-green-100 text-green-800',
    B: 'bg-green-50 text-green-700',
    C: 'bg-yellow-100 text-yellow-800',
    D: 'bg-orange-100 text-orange-800',
    E: 'bg-red-100 text-red-800',
  };
  return colors[rating] || 'bg-gray-100 text-gray-800';
}

/**
 * Check if all items are in stock
 */
export function areAllItemsInStock(items: CartItem[]): boolean {
  return items.every((item) => item.product.stock.level !== 'out-of-stock');
}

/**
 * Check if any items are low stock
 */
export function hasLowStockItems(items: CartItem[]): boolean {
  return items.some((item) => item.product.stock.level === 'low-stock');
}

/**
 * Calculate distance between two coordinates (Haversine formula)
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 3959; // Earth's radius in miles
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Find nearest supplier
 */
export function findNearestSupplier(
  suppliers: Array<{ id: string; distance: number }>
): string {
  if (suppliers.length === 0) return '';
  return suppliers.reduce((nearest, current) =>
    current.distance < nearest.distance ? current : nearest
  ).id;
}

/**
 * Generate order ID
 */
export function generateOrderId(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `ORD-${timestamp}-${random}`;
}
