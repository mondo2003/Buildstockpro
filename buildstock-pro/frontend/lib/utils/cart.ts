// Cart utility functions for localStorage management

const CART_STORAGE_KEY = 'buildstock-cart';

export interface StorageCartItem {
  product: any;
  supplierId: string;
  quantity: number;
}

/**
 * Safely parse JSON from localStorage
 */
export function safeParseJSON<T>(value: string | null, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch (error) {
    console.error('Failed to parse JSON from localStorage:', error);
    return fallback;
  }
}

/**
 * Safely stringify JSON for localStorage
 */
export function safeStringifyJSON(value: any): string | null {
  try {
    return JSON.stringify(value);
  } catch (error) {
    console.error('Failed to stringify JSON for localStorage:', error);
    return null;
  }
}

/**
 * Load cart from localStorage
 */
export function loadCartFromStorage(): StorageCartItem[] {
  if (typeof window === 'undefined') return [];

  try {
    const storedCart = localStorage.getItem(CART_STORAGE_KEY);
    return safeParseJSON(storedCart, []);
  } catch (error) {
    console.error('Failed to load cart from localStorage:', error);
    return [];
  }
}

/**
 * Save cart to localStorage
 */
export function saveCartToStorage(items: StorageCartItem[]): boolean {
  if (typeof window === 'undefined') return false;

  try {
    const jsonString = safeStringifyJSON(items);
    if (jsonString) {
      localStorage.setItem(CART_STORAGE_KEY, jsonString);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Failed to save cart to localStorage:', error);
    return false;
  }
}

/**
 * Clear cart from localStorage
 */
export function clearCartFromStorage(): boolean {
  if (typeof window === 'undefined') return false;

  try {
    localStorage.removeItem(CART_STORAGE_KEY);
    return true;
  } catch (error) {
    console.error('Failed to clear cart from localStorage:', error);
    return false;
  }
}

/**
 * Get cart storage size in bytes
 */
export function getCartStorageSize(): number {
  if (typeof window === 'undefined') return 0;

  try {
    const storedCart = localStorage.getItem(CART_STORAGE_KEY);
    return storedCart ? new Blob([storedCart]).size : 0;
  } catch (error) {
    console.error('Failed to get cart storage size:', error);
    return 0;
  }
}
