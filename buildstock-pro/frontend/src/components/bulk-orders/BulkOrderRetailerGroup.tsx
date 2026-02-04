'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Store, Package, PoundSterling, Clock } from 'lucide-react';
import { BulkOrderRetailer } from '@/src/types/bulkOrder';
import { cn } from '@/lib/utils';
import { BulkOrderItem } from '@/src/types/bulkOrder';

interface BulkOrderRetailerGroupProps {
  retailer: BulkOrderRetailer;
  items: BulkOrderItem[];
}

export function BulkOrderRetailerGroup({ retailer, items }: BulkOrderRetailerGroupProps) {
  const getRetailerStatusConfig = (status: BulkOrderRetailer['retailer_status']) => {
    switch (status) {
      case 'pending':
        return {
          label: 'Pending',
          className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
          icon: Clock,
        };
      case 'acknowledged':
        return {
          label: 'Acknowledged',
          className: 'bg-blue-100 text-blue-800 border-blue-200',
          icon: Clock,
        };
      case 'preparing':
        return {
          label: 'Preparing',
          className: 'bg-purple-100 text-purple-800 border-purple-200',
          icon: Package,
        };
      case 'ready':
        return {
          label: 'Ready',
          className: 'bg-green-100 text-green-800 border-green-200',
          icon: Package,
        };
      default:
        return {
          label: status,
          className: 'bg-gray-100 text-gray-800 border-gray-200',
          icon: Clock,
        };
    }
  };

  const statusConfig = getRetailerStatusConfig(retailer.retailer_status);
  const StatusIcon = statusConfig.icon;

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Store className="w-5 h-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">{retailer.retailer}</CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className={cn('text-xs', statusConfig.className)}>
                  <StatusIcon className="w-3 h-3 mr-1" />
                  {statusConfig.label}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {retailer.item_count} {retailer.item_count === 1 ? 'item' : 'items'}
                </span>
              </div>
            </div>
          </div>

          <div className="text-right">
            <div className="flex items-center gap-1 text-muted-foreground">
              <PoundSterling className="w-4 h-4" />
              <span className="text-sm">Subtotal</span>
            </div>
            <p className="text-2xl font-bold">£{retailer.retailer_total.toFixed(2)}</p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 space-y-3">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between py-2 border-b last:border-0"
          >
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm line-clamp-1">{item.product_name}</p>
              <p className="text-xs text-muted-foreground">
                Qty: {item.quantity} × £{item.unit_price.toFixed(2)}
              </p>
            </div>
            <div className="ml-4 text-right">
              <p className="font-semibold">£{item.total_price.toFixed(2)}</p>
              {!item.in_stock && (
                <Badge variant="destructive" className="text-xs mt-1">
                  Out of Stock
                </Badge>
              )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
