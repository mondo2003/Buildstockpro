'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { SelectedBulkItem } from '@/types/bulkOrder';

// Bulk Order Selection Context interface
interface BulkOrderContextType {
  selectedItems: SelectedBulkItem[];
  addItem: (item: SelectedBulkItem) => void;
  removeItem: (scrapedPriceId: string) => void;
  updateQuantity: (scrapedPriceId: string, quantity: number) => void;
  clearSelection: () => void;
  itemCount: number;
  totalRetailers: number;
  estimatedTotal: number;
  isItemSelected: (scrapedPriceId: string) => boolean;
}

// Create context
const BulkOrderContext = createContext<BulkOrderContextType | undefined>(undefined);

// Storage key
const BULK_ORDER_SELECTION_KEY = 'buildstock-bulk-order-selection';

// Provider component
export function BulkOrderProvider({ children }: { children: React.ReactNode }) {
  const [selectedItems, setSelectedItems] = useState<SelectedBulkItem[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load selection from localStorage on mount
  useEffect(() => {
    try {
      const storedSelection = localStorage.getItem(BULK_ORDER_SELECTION_KEY);
      if (storedSelection) {
        const parsedSelection = JSON.parse(storedSelection);
        setSelectedItems(parsedSelection);
      }
    } catch (error) {
      console.error('Failed to load bulk order selection from localStorage:', error);
    } finally {
      setIsInitialized(true);
    }
  }, []);

  // Save selection to localStorage whenever it changes
  useEffect(() => {
    if (isInitialized) {
      try {
        localStorage.setItem(BULK_ORDER_SELECTION_KEY, JSON.stringify(selectedItems));
      } catch (error) {
        console.error('Failed to save bulk order selection to localStorage:', error);
      }
    }
  }, [selectedItems, isInitialized]);

  // Calculate totals
  const itemCount = selectedItems.reduce((sum, item) => sum + item.quantity, 0);

  const totalRetailers = new Set(selectedItems.map(item => item.retailer)).size;

  const estimatedTotal = selectedItems.reduce(
    (sum, item) => sum + (item.price * item.quantity),
    0
  );

  // Add item to selection
  const addItem = useCallback((item: SelectedBulkItem) => {
    setSelectedItems((prevItems) => {
      // Check if item already exists
      const existingItemIndex = prevItems.findIndex(
        (i) => i.scraped_price_id === item.scraped_price_id
      );

      if (existingItemIndex > -1) {
        // Update quantity of existing item
        const newItems = [...prevItems];
        newItems[existingItemIndex] = {
          ...newItems[existingItemIndex],
          quantity: newItems[existingItemIndex].quantity + item.quantity,
        };
        return newItems;
      }

      // Add new item
      return [...prevItems, item];
    });
  }, []);

  // Remove item from selection
  const removeItem = useCallback((scrapedPriceId: string) => {
    setSelectedItems((prevItems) =>
      prevItems.filter((item) => item.scraped_price_id !== scrapedPriceId)
    );
  }, []);

  // Update item quantity
  const updateQuantity = useCallback((scrapedPriceId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(scrapedPriceId);
      return;
    }

    setSelectedItems((prevItems) =>
      prevItems.map((item) => {
        if (item.scraped_price_id === scrapedPriceId) {
          return { ...item, quantity };
        }
        return item;
      })
    );
  }, [removeItem]);

  // Clear selection
  const clearSelection = useCallback(() => {
    setSelectedItems([]);
  }, []);

  // Check if item is selected
  const isItemSelected = useCallback((scrapedPriceId: string) => {
    return selectedItems.some(item => item.scraped_price_id === scrapedPriceId);
  }, [selectedItems]);

  const value: BulkOrderContextType = {
    selectedItems,
    addItem,
    removeItem,
    updateQuantity,
    clearSelection,
    itemCount,
    totalRetailers,
    estimatedTotal,
    isItemSelected,
  };

  return <BulkOrderContext.Provider value={value}>{children}</BulkOrderContext.Provider>;
}

// Hook to use bulk order context
export function useBulkOrder() {
  const context = useContext(BulkOrderContext);
  if (context === undefined) {
    throw new Error('useBulkOrder must be used within a BulkOrderProvider');
  }
  return context;
}
