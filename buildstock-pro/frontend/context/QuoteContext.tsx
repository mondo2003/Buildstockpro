'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Quote, QuoteItem, CreateQuoteRequest, AddQuoteItemRequest } from '@/types/quote';
import { quoteApi } from '@/lib/api/quotes';
import { toast } from 'sonner';

// Temporary quote item (before saving)
export interface TemporaryQuoteItem {
  scraped_price_id: string;
  product_name: string;
  retailer: string;
  quantity: number;
  unit_price: number;
  notes?: string;
  product_image?: string;
  product_category?: string;
}

// Quote context interface
interface QuoteContextType {
  // Current quote being created
  currentQuote: {
    title: string;
    delivery_location: string;
    delivery_postcode: string;
    notes: string;
    response_deadline: string;
    items: TemporaryQuoteItem[];
  } | null;

  // User's quotes
  quotes: Quote[];
  isLoadingQuotes: boolean;
  currentQuoteDetail: Quote | null;
  isLoadingQuoteDetail: boolean;

  // Actions
  startNewQuote: () => void;
  updateCurrentQuote: (data: Partial<CreateQuoteRequest>) => void;
  addItemToCurrentQuote: (item: TemporaryQuoteItem) => void;
  removeItemFromCurrentQuote: (scrapedPriceId: string) => void;
  updateItemQuantity: (scrapedPriceId: string, quantity: number) => void;
  clearCurrentQuote: () => void;
  submitQuote: () => Promise<Quote | null>;

  // Quote management
  loadQuotes: () => Promise<void>;
  loadQuoteDetail: (id: string) => Promise<void>;
  cancelQuote: (id: string) => Promise<void>;
  markQuoteAsSent: (id: string) => Promise<void>;
  removeQuoteItem: (quoteId: string, itemId: string) => Promise<void>;
}

// Create context
const QuoteContext = createContext<QuoteContextType | undefined>(undefined);

// Storage key
const QUOTE_STORAGE_KEY = 'buildstock-current-quote';

// Provider component
export function QuoteProvider({ children }: { children: React.ReactNode }) {
  const [currentQuote, setCurrentQuote] = useState<QuoteContextType['currentQuote']>(null);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [isLoadingQuotes, setIsLoadingQuotes] = useState(false);
  const [currentQuoteDetail, setCurrentQuoteDetail] = useState<Quote | null>(null);
  const [isLoadingQuoteDetail, setIsLoadingQuoteDetail] = useState(false);

  // Load current quote from localStorage on mount
  useEffect(() => {
    try {
      const storedQuote = localStorage.getItem(QUOTE_STORAGE_KEY);
      if (storedQuote) {
        const parsedQuote = JSON.parse(storedQuote);
        setCurrentQuote(parsedQuote);
      }
    } catch (error) {
      console.error('Failed to load current quote from localStorage:', error);
    }
  }, []);

  // Save current quote to localStorage whenever it changes
  useEffect(() => {
    if (currentQuote) {
      try {
        localStorage.setItem(QUOTE_STORAGE_KEY, JSON.stringify(currentQuote));
      } catch (error) {
        console.error('Failed to save current quote to localStorage:', error);
      }
    } else {
      localStorage.removeItem(QUOTE_STORAGE_KEY);
    }
  }, [currentQuote]);

  // Start a new quote
  const startNewQuote = useCallback(() => {
    setCurrentQuote({
      title: '',
      delivery_location: '',
      delivery_postcode: '',
      notes: '',
      response_deadline: '',
      items: [],
    });
  }, []);

  // Update current quote details
  const updateCurrentQuote = useCallback((data: Partial<CreateQuoteRequest>) => {
    setCurrentQuote(prev => {
      if (!prev) return null;
      return {
        ...prev,
        ...data,
      };
    });
  }, []);

  // Add item to current quote
  const addItemToCurrentQuote = useCallback((item: TemporaryQuoteItem) => {
    setCurrentQuote(prev => {
      if (!prev) return null;

      // Check if item already exists
      const existingItemIndex = prev.items.findIndex(
        i => i.scraped_price_id === item.scraped_price_id
      );

      if (existingItemIndex > -1) {
        // Update quantity of existing item
        const newItems = [...prev.items];
        newItems[existingItemIndex] = {
          ...newItems[existingItemIndex],
          quantity: newItems[existingItemIndex].quantity + item.quantity,
        };
        return { ...prev, items: newItems };
      }

      // Add new item
      return {
        ...prev,
        items: [...prev.items, item],
      };
    });

    toast.success('Added to quote', {
      description: `${item.product_name} has been added to your quote`,
    });
  }, []);

  // Remove item from current quote
  const removeItemFromCurrentQuote = useCallback((scrapedPriceId: string) => {
    setCurrentQuote(prev => {
      if (!prev) return null;
      return {
        ...prev,
        items: prev.items.filter(item => item.scraped_price_id !== scrapedPriceId),
      };
    });
  }, []);

  // Update item quantity
  const updateItemQuantity = useCallback((scrapedPriceId: string, quantity: number) => {
    setCurrentQuote(prev => {
      if (!prev) return null;
      return {
        ...prev,
        items: prev.items.map(item =>
          item.scraped_price_id === scrapedPriceId
            ? { ...item, quantity }
            : item
        ),
      };
    });
  }, []);

  // Clear current quote
  const clearCurrentQuote = useCallback(() => {
    setCurrentQuote(null);
  }, []);

  // Submit quote
  const submitQuote = useCallback(async (): Promise<Quote | null> => {
    if (!currentQuote || currentQuote.items.length === 0) {
      toast.error('Cannot submit empty quote', {
        description: 'Please add at least one item to your quote',
      });
      return null;
    }

    try {
      const data: CreateQuoteRequest = {
        title: currentQuote.title,
        delivery_location: currentQuote.delivery_location,
        delivery_postcode: currentQuote.delivery_postcode,
        notes: currentQuote.notes || undefined,
        response_deadline: currentQuote.response_deadline || undefined,
        items: currentQuote.items.map(item => ({
          scraped_price_id: item.scraped_price_id,
          quantity: item.quantity,
          notes: item.notes,
        })),
      };

      const quote = await quoteApi.createQuote(data);

      // Clear current quote
      clearCurrentQuote();

      // Add to quotes list
      setQuotes(prev => [quote, ...prev]);

      toast.success('Quote created!', {
        description: 'Your quote request has been created successfully',
      });

      return quote;
    } catch (error) {
      console.error('Failed to create quote:', error);
      toast.error('Failed to create quote', {
        description: error instanceof Error ? error.message : 'Please try again',
      });
      return null;
    }
  }, [currentQuote, clearCurrentQuote]);

  // Load user's quotes
  const loadQuotes = useCallback(async () => {
    setIsLoadingQuotes(true);
    try {
      const result = await quoteApi.getQuotes();
      setQuotes(result.quotes);
    } catch (error) {
      console.error('Failed to load quotes:', error);
      toast.error('Failed to load quotes', {
        description: error instanceof Error ? error.message : 'Please try again',
      });
    } finally {
      setIsLoadingQuotes(false);
    }
  }, []);

  // Load quote detail
  const loadQuoteDetail = useCallback(async (id: string) => {
    setIsLoadingQuoteDetail(true);
    try {
      const quote = await quoteApi.getQuoteById(id);
      setCurrentQuoteDetail(quote);
    } catch (error) {
      console.error('Failed to load quote detail:', error);
      toast.error('Failed to load quote', {
        description: error instanceof Error ? error.message : 'Please try again',
      });
    } finally {
      setIsLoadingQuoteDetail(false);
    }
  }, []);

  // Cancel quote
  const cancelQuote = useCallback(async (id: string) => {
    try {
      await quoteApi.cancelQuote(id);

      // Update in list
      setQuotes(prev =>
        prev.map(q =>
          q.id === id ? { ...q, status: 'cancelled' as const } : q
        )
      );

      // Update detail if loaded
      if (currentQuoteDetail?.id === id) {
        setCurrentQuoteDetail(prev => prev ? { ...prev, status: 'cancelled' as const } : null);
      }

      toast.success('Quote cancelled', {
        description: 'The quote has been cancelled successfully',
      });
    } catch (error) {
      console.error('Failed to cancel quote:', error);
      toast.error('Failed to cancel quote', {
        description: error instanceof Error ? error.message : 'Please try again',
      });
    }
  }, [currentQuoteDetail]);

  // Mark quote as sent
  const markQuoteAsSent = useCallback(async (id: string) => {
    try {
      await quoteApi.markQuoteAsSent(id);

      // Update in list
      setQuotes(prev =>
        prev.map(q =>
          q.id === id ? { ...q, status: 'sent' as const } : q
        )
      );

      // Update detail if loaded
      if (currentQuoteDetail?.id === id) {
        setCurrentQuoteDetail(prev => prev ? { ...prev, status: 'sent' as const } : null);
      }

      toast.success('Quote sent!', {
        description: 'Your quote request has been sent to suppliers',
      });
    } catch (error) {
      console.error('Failed to send quote:', error);
      toast.error('Failed to send quote', {
        description: error instanceof Error ? error.message : 'Please try again',
      });
    }
  }, [currentQuoteDetail]);

  // Remove item from quote
  const removeQuoteItem = useCallback(async (quoteId: string, itemId: string) => {
    try {
      await quoteApi.removeQuoteItem(quoteId, itemId);

      // Reload quote detail
      await loadQuoteDetail(quoteId);

      toast.success('Item removed', {
        description: 'The item has been removed from your quote',
      });
    } catch (error) {
      console.error('Failed to remove item:', error);
      toast.error('Failed to remove item', {
        description: error instanceof Error ? error.message : 'Please try again',
      });
    }
  }, [loadQuoteDetail]);

  const value: QuoteContextType = {
    currentQuote,
    quotes,
    isLoadingQuotes,
    currentQuoteDetail,
    isLoadingQuoteDetail,
    startNewQuote,
    updateCurrentQuote,
    addItemToCurrentQuote,
    removeItemFromCurrentQuote,
    updateItemQuantity,
    clearCurrentQuote,
    submitQuote,
    loadQuotes,
    loadQuoteDetail,
    cancelQuote,
    markQuoteAsSent,
    removeQuoteItem,
  };

  return <QuoteContext.Provider value={value}>{children}</QuoteContext.Provider>;
}

// Hook to use quote context
export function useQuote() {
  const context = useContext(QuoteContext);
  if (context === undefined) {
    throw new Error('useQuote must be used within a QuoteProvider');
  }
  return context;
}
