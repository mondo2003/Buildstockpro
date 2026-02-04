'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Package, Store, PoundSterling, MapPin } from 'lucide-react';
import { BulkOrder, BulkOrderRetailer } from '@/src/types/bulkOrder';
import { cn } from '@/lib/utils';

interface BulkOrderSummaryProps {
  order: BulkOrder;
  retailers?: BulkOrderRetailer[];
}

export function BulkOrderSummary({ order, retailers }: BulkOrderSummaryProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Order Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Order Number */}
        <div className="flex items-center justify-between pb-3 border-b">
          <span className="text-sm text-muted-foreground">Order Number</span>
          <span className="font-semibold">{order.order_number}</span>
        </div>

        {/* Items Count */}
        <div className="flex items-center gap-3 pb-3 border-b">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Package className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-muted-foreground">Total Items</p>
            <p className="font-semibold">{order.total_items}</p>
          </div>
        </div>

        {/* Retailers Count */}
        <div className="flex items-center gap-3 pb-3 border-b">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Store className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-muted-foreground">Retailers</p>
            <p className="font-semibold">{order.total_retailers}</p>
          </div>
        </div>

        {/* Estimated Total */}
        <div className="flex items-center gap-3 pb-3 border-b">
          <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
            <PoundSterling className="w-5 h-5 text-green-600" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-muted-foreground">Estimated Total</p>
            <p className="text-2xl font-bold text-green-600">£{order.estimated_total.toFixed(2)}</p>
          </div>
        </div>

        {/* Delivery Location */}
        {order.delivery_location && (
          <div className="flex items-center gap-3 pb-3 border-b">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <MapPin className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">Delivery Location</p>
              <p className="font-medium">{order.delivery_location}</p>
              <p className="text-sm text-muted-foreground">{order.delivery_postcode}</p>
            </div>
          </div>
        )}

        {/* Retailer Breakdown */}
        {retailers && retailers.length > 0 && (
          <div className="pt-3">
            <p className="text-sm font-medium mb-3">Retailer Breakdown</p>
            <div className="space-y-2">
              {retailers.map((retailer) => (
                <div
                  key={retailer.id}
                  className="flex items-center justify-between p-2 bg-muted/50 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-sm">{retailer.retailer}</p>
                    <p className="text-xs text-muted-foreground">
                      {retailer.item_count} {retailer.item_count === 1 ? 'item' : 'items'}
                    </p>
                  </div>
                  <p className="font-semibold">£{retailer.retailer_total.toFixed(2)}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Notes */}
        {order.customer_notes && (
          <div className="pt-3 border-t">
            <p className="text-sm font-medium mb-2">Customer Notes</p>
            <p className="text-sm text-muted-foreground">{order.customer_notes}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
