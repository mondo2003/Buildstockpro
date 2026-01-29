'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Product } from '@/lib/types';

// Cart item interface
export interface CartItem {
  product: Product;
  supplierId: string;
  quantity: number;
}

// Cart context interface
interface CartContextType {
  items: CartItem[];
  addItem: (product: Product, supplierId: string, quantity?: number) => void;
  removeItem: (productId: string, supplierId: string) => void;
  updateQuantity: (productId: string, supplierId: string, quantity: number) => void;
  clearCart: () => void;
  itemCount: number;
  subtotal: number;
  tax: number;
  shippingEstimate: number;
  total: number;
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
}

// Create context
const CartContext = createContext<CartContextType | undefined>(undefined);

// Tax rate (20% UK VAT)
const TAX_RATE = 0.2;

// Storage key
const CART_STORAGE_KEY = 'buildstock-cart';

// Provider component
export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const storedCart = localStorage.getItem(CART_STORAGE_KEY);
      if (storedCart) {
        const parsedCart = JSON.parse(storedCart);
        setItems(parsedCart);
      }
    } catch (error) {
      console.error('Failed to load cart from localStorage:', error);
    } finally {
      setIsInitialized(true);
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (isInitialized) {
      try {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
      } catch (error) {
        console.error('Failed to save cart to localStorage:', error);
      }
    }
  }, [items, isInitialized]);

  // Calculate totals
  const subtotal = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  const tax = subtotal * TAX_RATE;

  const shippingEstimate = items.length > 0 ? (subtotal > 500 ? 0 : 25) : 0;

  const total = subtotal + tax + shippingEstimate;

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  // Add item to cart
  const addItem = useCallback(
    (product: Product, supplierId: string, quantity: number = 1) => {
      setItems((prevItems) => {
        // Check if item already exists with same product and supplier
        const existingItemIndex = prevItems.findIndex(
          (item) => item.product.id === product.id && item.supplierId === supplierId
        );

        if (existingItemIndex > -1) {
          // Update quantity of existing item
          const newItems = [...prevItems];
          newItems[existingItemIndex] = {
            ...newItems[existingItemIndex],
            quantity: Math.min(
              newItems[existingItemIndex].quantity + quantity,
              product.stock.quantity
            ),
          };
          return newItems;
        }

        // Add new item
        return [
          ...prevItems,
          {
            product,
            supplierId,
            quantity: Math.min(quantity, product.stock.quantity),
          },
        ];
      });

      // Open cart to show feedback
      setIsOpen(true);
    },
    []
  );

  // Remove item from cart
  const removeItem = useCallback((productId: string, supplierId: string) => {
    setItems((prevItems) =>
      prevItems.filter(
        (item) => !(item.product.id === productId && item.supplierId === supplierId)
      )
    );
  }, []);

  // Update item quantity
  const updateQuantity = useCallback(
    (productId: string, supplierId: string, quantity: number) => {
      if (quantity <= 0) {
        removeItem(productId, supplierId);
        return;
      }

      setItems((prevItems) =>
        prevItems.map((item) => {
          if (item.product.id === productId && item.supplierId === supplierId) {
            const product = item.product;
            return {
              ...item,
              quantity: Math.min(quantity, product.stock.quantity),
            };
          }
          return item;
        })
      );
    },
    [removeItem]
  );

  // Clear cart
  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  // Cart drawer controls
  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);
  const toggleCart = useCallback(() => setIsOpen((prev) => !prev), []);

  const value: CartContextType = {
    items,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    itemCount,
    subtotal,
    tax,
    shippingEstimate,
    total,
    isOpen,
    openCart,
    closeCart,
    toggleCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

// Hook to use cart context
export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
