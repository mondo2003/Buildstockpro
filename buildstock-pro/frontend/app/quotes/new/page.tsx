'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useQuote } from '@/context/QuoteContext';
import { QuoteRequestForm } from '@/components/quotes/QuoteRequestForm';
import { QuoteItemList } from '@/components/quotes/QuoteItemList';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Package, Loader2 } from 'lucide-react';
import { CreateQuoteRequest } from '@/types/quote';
import { toast } from 'sonner';

export default function NewQuotePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { startNewQuote, currentQuote, submitQuote, clearCurrentQuote } = useQuote();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get product from query params if coming from product page
  const productId = searchParams.get('product');
  const productName = searchParams.get('productName');
  const productImage = searchParams.get('productImage');
  const productPrice = searchParams.get('productPrice');
  const productRetailer = searchParams.get('productRetailer');
  const productCategory = searchParams.get('productCategory');

  useEffect(() => {
    // Initialize quote
    startNewQuote();

    // If product info provided, add it to the quote
    if (productId && productName && productPrice && productRetailer) {
      const item = {
        scraped_price_id: productId,
        product_name: productName,
        retailer: productRetailer,
        quantity: 1,
        unit_price: parseFloat(productPrice),
        product_image: productImage || undefined,
        product_category: productCategory || undefined,
      };

      // Use setTimeout to ensure context is ready
      setTimeout(() => {
        const { addItemToCurrentQuote } = require('@/context/QuoteContext');
        // Note: We'll handle this through the context
      }, 100);
    }

    return () => {
      // Cleanup if user navigates away without saving
      if (currentQuote?.items.length === 0) {
        clearCurrentQuote();
      }
    };
  }, []);

  const handleBack = () => {
    router.back();
  };

  const handleSubmit = async (data: CreateQuoteRequest) => {
    setIsSubmitting(true);
    try {
      const quote = await submitQuote();
      if (quote) {
        router.push(`/quotes/${quote.id}`);
      }
    } catch (error) {
      console.error('Failed to create quote:', error);
      toast.error('Failed to create quote', {
        description: error instanceof Error ? error.message : 'Please try again',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const itemCount = currentQuote?.items.length || 0;
  const estimatedTotal = currentQuote?.items.reduce(
    (sum, item) => sum + (item.unit_price * item.quantity),
    0
  ) || 0;

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <Button
          variant="ghost"
          onClick={handleBack}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <h1 className="text-3xl font-bold mb-2">Create New Quote</h1>
        <p className="text-muted-foreground">
          Add products and delivery details to create your quote request
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Quote Form */}
        <div className="lg:col-span-2">
          <QuoteRequestForm
            onSubmit={handleSubmit}
            onCancel={handleBack}
            isLoading={isSubmitting}
          />
        </div>

        {/* Quote Summary */}
        <div className="lg:col-span-1">
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Package className="w-5 h-5" />
                Quote Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Items Count */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Items</span>
                <span className="font-semibold">{itemCount}</span>
              </div>

              {/* Estimated Total */}
              <div className="pt-4 border-t">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Estimated Total</span>
                  <span className="text-2xl font-bold">£{estimatedTotal.toFixed(2)}</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Final prices may vary based on supplier responses
                </p>
              </div>

              {/* Current Items Preview */}
              {currentQuote && currentQuote.items.length > 0 && (
                <div className="pt-4 border-t">
                  <p className="text-sm font-medium mb-3">Items in Quote</p>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {currentQuote.items.map((item, index) => (
                      <div key={index} className="text-sm p-2 bg-muted/50 rounded">
                        <p className="font-medium line-clamp-1">{item.product_name}</p>
                        <div className="flex items-center justify-between mt-1 text-xs text-muted-foreground">
                          <span>Qty: {item.quantity}</span>
                          <span>£{item.unit_price.toFixed(2)} each</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Info */}
              {currentQuote && currentQuote.items.length === 0 && (
                <div className="pt-4 border-t text-center text-sm text-muted-foreground">
                  <p>Add products from search results to build your quote</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
