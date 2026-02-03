'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ShoppingCart, X, Package, Store, PoundSterling, ChevronRight } from 'lucide-react';
import { useBulkOrder } from '@/contexts/BulkOrderContext';
import { SelectedBulkItem } from '@/types/bulkOrder';
import { BulkOrderItemRow } from './BulkOrderItemRow';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface BulkOrderCartProps {
  className?: string;
}

export function BulkOrderCart({ className }: BulkOrderCartProps) {
  const { selectedItems, removeItem, updateQuantity, clearSelection, itemCount, totalRetailers, estimatedTotal } = useBulkOrder();
  const [isOpen, setIsOpen] = useState(false);

  // Listen for custom event to open cart
  useEffect(() => {
    const handleOpenCart = () => setIsOpen(true);
    window.addEventListener('open-bulk-order-cart', handleOpenCart);
    return () => window.removeEventListener('open-bulk-order-cart', handleOpenCart);
  }, []);

  // Group items by retailer
  const itemsByRetailer = selectedItems.reduce((acc, item) => {
    if (!acc[item.retailer]) {
      acc[item.retailer] = [];
    }
    acc[item.retailer].push(item);
    return acc;
  }, {} as Record<string, SelectedBulkItem[]>);

  if (selectedItems.length === 0) {
    return null;
  }

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'fixed bottom-6 right-6 z-40 bg-primary text-primary-foreground rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105',
          isOpen && 'scale-0 opacity-0',
          className
        )}
      >
        <div className="flex items-center gap-2 px-4 py-3">
          <ShoppingCart className="w-5 h-5" />
          <div className="text-left">
            <p className="text-xs font-medium">Bulk Order</p>
            <p className="text-sm font-bold">{itemCount} items</p>
          </div>
          <Badge variant="secondary" className="ml-1 bg-white/20 text-white border-0">
            {totalRetailers} retailers
          </Badge>
        </div>
      </button>

      {/* Slide-out Panel */}
      <div
        className={cn(
          'fixed inset-y-0 right-0 z-50 w-full md:w-[480px] bg-background shadow-2xl transition-transform duration-300 ease-in-out',
          isOpen ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <div>
              <h2 className="text-xl font-bold flex items-center gap-2">
                <ShoppingCart className="w-5 h-5" />
                Bulk Order Cart
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                {itemCount} items from {totalRetailers} retailers
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              className="shrink-0"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Retailer Groups */}
            {Object.entries(itemsByRetailer).map(([retailer, items]) => (
              <Card key={retailer}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Store className="w-4 h-4" />
                      {retailer}
                    </CardTitle>
                    <Badge variant="secondary">{items.length} items</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {items.map((item) => (
                    <div key={item.scraped_price_id} className="flex gap-3">
                      <div className="relative w-16 h-16 flex-shrink-0 bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg overflow-hidden">
                        {item.image_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={item.image_url}
                            alt={item.product_name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Package className="w-6 h-6 text-primary/30" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm line-clamp-2">{item.product_name}</p>
                        <p className="text-lg font-bold text-primary">£{item.price.toFixed(2)}</p>
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => updateQuantity(item.scraped_price_id, item.quantity - 1)}
                              disabled={item.quantity <= 1}
                              className="w-6 h-6 rounded border flex items-center justify-center hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              -
                            </button>
                            <span className="w-8 text-center font-medium">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.scraped_price_id, item.quantity + 1)}
                              className="w-6 h-6 rounded border flex items-center justify-center hover:bg-muted"
                            >
                              +
                            </button>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeItem(item.scraped_price_id)}
                            className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 px-2"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Footer */}
          <div className="border-t p-4 space-y-4 bg-muted/30">
            {/* Summary */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total Items</span>
                <span className="font-medium">{itemCount}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Retailers</span>
                <span className="font-medium">{totalRetailers}</span>
              </div>
              <div className="flex justify-between text-lg font-bold pt-2 border-t">
                <span>Estimated Total</span>
                <span className="text-green-600">£{estimatedTotal.toFixed(2)}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-2">
              <Link href="/bulk-orders/new" className="block">
                <Button
                  className="w-full"
                  size="lg"
                  onClick={() => setIsOpen(false)}
                >
                  Proceed to Checkout
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  clearSelection();
                  setIsOpen(false);
                }}
              >
                Clear Selection
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
