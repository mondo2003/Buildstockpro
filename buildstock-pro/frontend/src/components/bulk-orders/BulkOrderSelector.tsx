'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Package, Store, PoundSterling, X } from 'lucide-react';
import { SelectedBulkItem } from '@/types/bulkOrder';
import { BulkOrderItemRow } from './BulkOrderItemRow';
import { cn } from '@/lib/utils';

interface BulkOrderSelectorProps {
  selectedItems: SelectedBulkItem[];
  onUpdateQuantity: (scrapedPriceId: string, quantity: number) => void;
  onRemoveItem: (scrapedPriceId: string) => void;
  onClearSelection: () => void;
}

export function BulkOrderSelector({
  selectedItems,
  onUpdateQuantity,
  onRemoveItem,
  onClearSelection,
}: BulkOrderSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');

  // Group items by retailer
  const itemsByRetailer = selectedItems.reduce((acc, item) => {
    if (!acc[item.retailer]) {
      acc[item.retailer] = [];
    }
    acc[item.retailer].push(item);
    return acc;
  }, {} as Record<string, SelectedBulkItem[]>);

  // Filter items by search query
  const filteredRetailers = Object.entries(itemsByRetailer).filter(([retailer, items]) => {
    if (!searchQuery) return true;

    const matchesRetailer = retailer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesItem = items.some(item =>
      item.product_name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return matchesRetailer || matchesItem;
  });

  const estimatedTotal = selectedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  if (selectedItems.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Package className="w-16 h-16 text-muted-foreground/30 mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Items Selected</h3>
          <p className="text-sm text-muted-foreground text-center max-w-md">
            Select products from the search results to add them to your bulk order
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search and Summary */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Selected Items ({selectedItems.length})</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearSelection}
              className="text-destructive hover:text-destructive"
            >
              <X className="w-4 h-4 mr-1" />
              Clear All
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search selected items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <Package className="w-5 h-5 mx-auto mb-1 text-primary" />
              <p className="text-2xl font-bold">{selectedItems.reduce((sum, item) => sum + item.quantity, 0)}</p>
              <p className="text-xs text-muted-foreground">Items</p>
            </div>
            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <Store className="w-5 h-5 mx-auto mb-1 text-primary" />
              <p className="text-2xl font-bold">{Object.keys(itemsByRetailer).length}</p>
              <p className="text-xs text-muted-foreground">Retailers</p>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <PoundSterling className="w-5 h-5 mx-auto mb-1 text-green-600" />
              <p className="text-2xl font-bold text-green-600">£{estimatedTotal.toFixed(0)}</p>
              <p className="text-xs text-muted-foreground">Est. Total</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Items by Retailer */}
      <div className="space-y-4">
        {filteredRetailers.map(([retailer, items]) => (
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
                <div key={item.scraped_price_id} className="flex gap-3 p-2 hover:bg-muted/50 rounded-lg transition-colors">
                  {/* Image */}
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

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm line-clamp-2">{item.product_name}</p>
                    <p className="text-sm font-bold text-primary">£{item.price.toFixed(2)}</p>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onUpdateQuantity(item.scraped_price_id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                          className="w-7 h-7 rounded-md border flex items-center justify-center hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                        >
                          -
                        </button>
                        <span className="w-10 text-center font-medium">{item.quantity}</span>
                        <button
                          onClick={() => onUpdateQuantity(item.scraped_price_id, item.quantity + 1)}
                          className="w-7 h-7 rounded-md border flex items-center justify-center hover:bg-muted text-sm"
                        >
                          +
                        </button>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onRemoveItem(item.scraped_price_id)}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10 h-7 px-2"
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
    </div>
  );
}
