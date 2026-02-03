'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { Trash2, Plus, Minus } from 'lucide-react';
import { BulkOrderItem } from '@/types/bulkOrder';
import { cn } from '@/lib/utils';

interface BulkOrderItemRowProps {
  item: BulkOrderItem;
  quantity?: number;
  onQuantityChange?: (itemId: string, newQuantity: number) => void;
  onRemove?: (itemId: string) => void;
  showActions?: boolean;
  retailer?: string;
}

export function BulkOrderItemRow({
  item,
  quantity,
  onQuantityChange,
  onRemove,
  showActions = true,
  retailer,
}: BulkOrderItemRowProps) {
  const displayQuantity = quantity ?? item.quantity;

  const handleIncrement = () => {
    if (onQuantityChange) {
      onQuantityChange(item.id, displayQuantity + 1);
    }
  };

  const handleDecrement = () => {
    if (onQuantityChange && displayQuantity > 1) {
      onQuantityChange(item.id, displayQuantity - 1);
    }
  };

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4">
        <div className="flex gap-4">
          {/* Product Image */}
          <div className="relative w-20 h-20 flex-shrink-0 bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg overflow-hidden">
            {item.product?.image_url ? (
              <Image
                src={item.product.image_url}
                alt={item.product_name}
                fill
                className="object-cover"
                sizes="80px"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-8 h-8 rounded-full bg-primary/20" />
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-base mb-1 line-clamp-2">{item.product_name}</h4>
                <div className="flex items-center gap-2 flex-wrap">
                  {retailer && (
                    <Badge variant="outline" className="text-xs">
                      {retailer}
                    </Badge>
                  )}
                  {item.product?.category && (
                    <Badge variant="secondary" className="text-xs">
                      {item.product.category}
                    </Badge>
                  )}
                  {!item.in_stock && (
                    <Badge variant="destructive" className="text-xs">
                      Out of Stock
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-lg font-bold">£{item.unit_price.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground">per unit</p>
              </div>

              {showActions && (
                <div className="flex items-center gap-2">
                  {/* Quantity Controls */}
                  <div className="flex items-center border rounded-lg">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleDecrement}
                      disabled={displayQuantity <= 1 || !onQuantityChange}
                      className="h-8 w-8 p-0"
                    >
                      <Minus className="w-3 h-3" />
                    </Button>
                    <span className="w-12 text-center font-medium">{displayQuantity}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleIncrement}
                      disabled={!onQuantityChange}
                      className="h-8 w-8 p-0"
                    >
                      <Plus className="w-3 h-3" />
                    </Button>
                  </div>

                  {/* Remove Button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onRemove?.(item.id)}
                    disabled={!onRemove}
                    className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              )}

              {!showActions && (
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Quantity: {displayQuantity}</p>
                  <p className="text-lg font-bold">£{item.total_price.toFixed(2)}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {item.notes && (
          <div className="mt-3 pt-3 border-t">
            <p className="text-sm text-muted-foreground">
              <span className="font-medium">Notes:</span> {item.notes}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
