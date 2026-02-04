'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BulkOrderStatusBadge } from './BulkOrderStatusBadge';
import { BulkOrder } from '@/src/types/bulkOrder';
import { Calendar, Package, Store, PoundSterling, ArrowRight } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface BulkOrderCardProps {
  order: BulkOrder;
}

export function BulkOrderCard({ order }: BulkOrderCardProps) {
  return (
    <Link href={`/bulk-orders/${order.id}`}>
      <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer hover:border-primary/50">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                  {order.order_number}
                </h3>
                <BulkOrderStatusBadge status={order.status} />
              </div>
              <p className="text-sm text-muted-foreground">
                Created {formatDistanceToNow(new Date(order.created_at), { addSuffix: true })}
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Items</p>
                <p className="font-semibold">{order.total_items}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Store className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Retailers</p>
                <p className="font-semibold">{order.total_retailers}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <PoundSterling className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Est. Total</p>
                <p className="font-semibold">£{order.estimated_total.toFixed(2)}</p>
              </div>
            </div>

            <div className="flex items-center justify-end">
              <Button variant="ghost" size="sm" className="group-hover:bg-primary group-hover:text-primary-foreground">
                View Details
                <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </div>

          {order.delivery_location && (
            <div className="mt-4 pt-4 border-t">
              <p className="text-sm text-muted-foreground">
                Delivery to: <span className="font-medium text-foreground">{order.delivery_location}</span>
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
