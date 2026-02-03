'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { QuoteItem } from '@/types/quote';
import { Trash2, Package, Building2, Image as ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { useState } from 'react';

interface QuoteItemListProps {
  items: QuoteItem[];
  onRemove?: (itemId: string) => void;
  onUpdateQuantity?: (itemId: string, quantity: number) => void;
  editable?: boolean;
  className?: string;
}

export function QuoteItemList({
  items,
  onRemove,
  onUpdateQuantity,
  editable = false,
  className,
}: QuoteItemListProps) {
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());

  const handleImageError = (itemId: string) => {
    setImageErrors(prev => new Set(prev).add(itemId));
  };

  if (items.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="py-12">
          <div className="flex flex-col items-center justify-center text-center">
            <Package className="w-12 h-12 text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground">No items in this quote yet</p>
            <p className="text-sm text-muted-foreground mt-1">
              Add products from search results to create your quote
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={cn('space-y-3', className)}>
      {items.map((item) => {
        const hasImage = item.product_image && !imageErrors.has(item.id);

        return (
          <Card key={item.id} className="overflow-hidden">
            <CardContent className="p-4">
              <div className="flex gap-4">
                {/* Product Image */}
                <div className="relative w-20 h-20 flex-shrink-0 bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg overflow-hidden">
                  {hasImage ? (
                    <Image
                      src={item.product_image}
                      alt={item.product_name}
                      fill
                      className="object-cover"
                      sizes="80px"
                      onError={() => handleImageError(item.id)}
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <ImageIcon className="w-8 h-8 text-primary/30" />
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-base line-clamp-1">
                        {item.product_name}
                      </h4>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          <Building2 className="w-3 h-3 mr-1" />
                          {item.retailer}
                        </Badge>
                        {item.product_category && (
                          <Badge variant="secondary" className="text-xs">
                            {item.product_category}
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Remove Button */}
                    {editable && onRemove && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onRemove(item.id)}
                        className="flex-shrink-0 hover:bg-destructive/10 hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>

                  {/* Notes */}
                  {item.notes && (
                    <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                      {item.notes}
                    </p>
                  )}

                  {/* Quantity and Price */}
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center gap-3">
                      <div className="text-sm">
                        <span className="text-muted-foreground">Qty:</span>{' '}
                        <span className="font-semibold">{item.quantity}</span>
                      </div>
                      <div className="text-sm">
                        <span className="text-muted-foreground">Unit:</span>{' '}
                        <span className="font-semibold">£{item.unit_price.toFixed(2)}</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-lg font-bold">£{item.total_price.toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
