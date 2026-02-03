'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Product } from '@/lib/types';

/**
 * Selection Context for Bulk Operations
 * Manages product selection across the app for bulk order multi-select and quote product lists
 */

// Selected item interface
export interface SelectedProduct {
  product: Product;
  supplierId: string;
  quantity: number;
  selectedAt: string;
}

// Selection context interface
interface SelectionContextType {
  // State
  selectedProducts: Map<string, SelectedProduct>;
  selectedCount: number;

  // Actions
  selectProduct: (product: Product, supplierId: string, quantity?: number) => void;
  deselectProduct: (productId: string) => void;
  toggleProduct: (product: Product, supplierId: string, quantity?: number) => void;
  isSelected: (productId: string) => boolean;
  getSelectedProduct: (productId: string) => SelectedProduct | undefined;
  clearSelection: () => void;
  clearSelectionBySupplier: (supplierId: string) => void;

  // Bulk operations
  selectMultiple: (products: Product[], supplierId: string, quantity?: number) => void;
  deselectMultiple: (productIds: string[]) => void;

  // Utilities
  getSelectedProducts: () => SelectedProduct[];
  getSelectedProductsBySupplier: (supplierId: string) => SelectedProduct[];
  getTotalEstimatedCost: () => number;
  exportSelection: () => string;
  importSelection: (data: string) => void;
}

// Create context
const SelectionContext = createContext<SelectionContextType | undefined>(undefined);

// Storage key
const SELECTION_STORAGE_KEY = 'buildstock-selection';

// Provider component
export function SelectionProvider({ children }: { children: React.ReactNode }) {
  const [selectedProducts, setSelectedProducts] = useState<Map<string, SelectedProduct>>(new Map());
  const [isInitialized, setIsInitialized] = useState(false);

  // Load selection from localStorage on mount
  useEffect(() => {
    try {
      const storedSelection = localStorage.getItem(SELECTION_STORAGE_KEY);
      if (storedSelection) {
        const parsed = JSON.parse(storedSelection);
        const map = new Map<string, SelectedProduct>();
        Object.entries(parsed).forEach(([key, value]) => {
          map.set(key, value as SelectedProduct);
        });
        setSelectedProducts(map);
      }
    } catch (error) {
      console.error('Failed to load selection from localStorage:', error);
    } finally {
      setIsInitialized(true);
    }
  }, []);

  // Save selection to localStorage whenever it changes
  useEffect(() => {
    if (isInitialized) {
      try {
        const obj = Object.fromEntries(selectedProducts);
        localStorage.setItem(SELECTION_STORAGE_KEY, JSON.stringify(obj));
      } catch (error) {
        console.error('Failed to save selection to localStorage:', error);
      }
    }
  }, [selectedProducts, isInitialized]);

  // Calculate selected count
  const selectedCount = selectedProducts.size;

  // Select a product
  const selectProduct = useCallback(
    (product: Product, supplierId: string, quantity: number = 1) => {
      setSelectedProducts((prev) => {
        const newMap = new Map(prev);
        newMap.set(product.id, {
          product,
          supplierId,
          quantity,
          selectedAt: new Date().toISOString(),
        });
        return newMap;
      });
    },
    []
  );

  // Deselect a product
  const deselectProduct = useCallback((productId: string) => {
    setSelectedProducts((prev) => {
      const newMap = new Map(prev);
      newMap.delete(productId);
      return newMap;
    });
  }, []);

  // Toggle product selection
  const toggleProduct = useCallback(
    (product: Product, supplierId: string, quantity: number = 1) => {
      setSelectedProducts((prev) => {
        const newMap = new Map(prev);
        if (newMap.has(product.id)) {
          newMap.delete(product.id);
        } else {
          newMap.set(product.id, {
            product,
            supplierId,
            quantity,
            selectedAt: new Date().toISOString(),
          });
        }
        return newMap;
      });
    },
    []
  );

  // Check if product is selected
  const isSelected = useCallback(
    (productId: string) => {
      return selectedProducts.has(productId);
    },
    [selectedProducts]
  );

  // Get selected product
  const getSelectedProduct = useCallback(
    (productId: string) => {
      return selectedProducts.get(productId);
    },
    [selectedProducts]
  );

  // Clear all selections
  const clearSelection = useCallback(() => {
    setSelectedProducts(new Map());
  }, []);

  // Clear selections by supplier
  const clearSelectionBySupplier = useCallback((supplierId: string) => {
    setSelectedProducts((prev) => {
      const newMap = new Map(prev);
      for (const [productId, item] of prev.entries()) {
        if (item.supplierId === supplierId) {
          newMap.delete(productId);
        }
      }
      return newMap;
    });
  }, []);

  // Select multiple products
  const selectMultiple = useCallback(
    (products: Product[], supplierId: string, quantity: number = 1) => {
      setSelectedProducts((prev) => {
        const newMap = new Map(prev);
        products.forEach((product) => {
          newMap.set(product.id, {
            product,
            supplierId,
            quantity,
            selectedAt: new Date().toISOString(),
          });
        });
        return newMap;
      });
    },
    []
  );

  // Deselect multiple products
  const deselectMultiple = useCallback((productIds: string[]) => {
    setSelectedProducts((prev) => {
      const newMap = new Map(prev);
      productIds.forEach((id) => {
        newMap.delete(id);
      });
      return newMap;
    });
  }, []);

  // Get all selected products as array
  const getSelectedProducts = useCallback(() => {
    return Array.from(selectedProducts.values());
  }, [selectedProducts]);

  // Get selected products by supplier
  const getSelectedProductsBySupplier = useCallback(
    (supplierId: string) => {
      return Array.from(selectedProducts.values()).filter(
        (item) => item.supplierId === supplierId
      );
    },
    [selectedProducts]
  );

  // Calculate total estimated cost
  const getTotalEstimatedCost = useCallback(() => {
    return Array.from(selectedProducts.values()).reduce((total, item) => {
      return total + item.product.price * item.quantity;
    }, 0);
  }, [selectedProducts]);

  // Export selection to JSON string
  const exportSelection = useCallback(() => {
    const obj = Object.fromEntries(selectedProducts);
    return JSON.stringify(obj, null, 2);
  }, [selectedProducts]);

  // Import selection from JSON string
  const importSelection = useCallback((data: string) => {
    try {
      const parsed = JSON.parse(data);
      const map = new Map<string, SelectedProduct>();
      Object.entries(parsed).forEach(([key, value]) => {
        map.set(key, value as SelectedProduct);
      });
      setSelectedProducts(map);
    } catch (error) {
      console.error('Failed to import selection:', error);
      throw new Error('Invalid selection data');
    }
  }, []);

  const value: SelectionContextType = {
    selectedProducts,
    selectedCount,
    selectProduct,
    deselectProduct,
    toggleProduct,
    isSelected,
    getSelectedProduct,
    clearSelection,
    clearSelectionBySupplier,
    selectMultiple,
    deselectMultiple,
    getSelectedProducts,
    getSelectedProductsBySupplier,
    getTotalEstimatedCost,
    exportSelection,
    importSelection,
  };

  return <SelectionContext.Provider value={value}>{children}</SelectionContext.Provider>;
}

// Hook to use selection context
export function useSelection() {
  const context = useContext(SelectionContext);
  if (context === undefined) {
    throw new Error('useSelection must be used within a SelectionProvider');
  }
  return context;
}

// Hook for bulk order operations
export function useBulkOrder() {
  const selection = useSelection();

  return {
    ...selection,
    // Bulk order specific helpers
    addToBulkOrder: (product: Product, supplierId: string, quantity?: number) => {
      selection.selectProduct(product, supplierId, quantity);
    },
    removeFromBulkOrder: (productId: string) => {
      selection.deselectProduct(productId);
    },
    isInBulkOrder: (productId: string) => selection.isSelected(productId),
    getBulkOrderItems: () => selection.getSelectedProducts(),
    getBulkOrderTotal: () => selection.getTotalEstimatedCost(),
    clearBulkOrder: () => selection.clearSelection(),
  };
}

// Hook for quote operations
export function useQuoteSelection() {
  const selection = useSelection();

  return {
    ...selection,
    // Quote specific helpers
    addToQuote: (product: Product, supplierId: string, quantity?: number) => {
      selection.selectProduct(product, supplierId, quantity);
    },
    removeFromQuote: (productId: string) => {
      selection.deselectProduct(productId);
    },
    isInQuote: (productId: string) => selection.isSelected(productId),
    getQuoteItems: () => selection.getSelectedProducts(),
    getQuoteTotal: () => selection.getTotalEstimatedCost(),
    clearQuote: () => selection.clearSelection(),
  };
}

export default SelectionProvider;
