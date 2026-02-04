'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BulkOrderStatusBadge } from './BulkOrderStatusBadge';
import { BulkOrderSummary } from './BulkOrderSummary';
import { BulkOrderRetailerGroup } from './BulkOrderRetailerGroup';
import { BulkOrder } from '@/src/types/bulkOrder';
import { ArrowLeft, Edit, Trash2, Send, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import Link from 'next/link';

interface BulkOrderDetailsProps {
  orderId: string;
}

export function BulkOrderDetails({ orderId }: BulkOrderDetailsProps) {
  const router = useRouter();
  const [order, setOrder] = useState<BulkOrder | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCancelling, setIsCancelling] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchOrder();
  }, [orderId]);

  const fetchOrder = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/v1/bulk-orders/${orderId}`);
      const result = await response.json();

      if (result.success && result.data) {
        setOrder(result.data);
      } else {
        throw new Error(result.error || 'Failed to fetch order');
      }
    } catch (error) {
      console.error('Error fetching bulk order:', error);
      toast.error('Error', {
        description: 'Failed to load bulk order details',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!order) return;

    if (!confirm('Are you sure you want to cancel this bulk order?')) {
      return;
    }

    try {
      setIsCancelling(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/v1/bulk-orders/${orderId}/cancel`, {
        method: 'POST',
      });
      const result = await response.json();

      if (result.success) {
        toast.success('Order cancelled', {
          description: 'Bulk order has been cancelled successfully',
        });
        fetchOrder();
      } else {
        throw new Error(result.error || 'Failed to cancel order');
      }
    } catch (error) {
      console.error('Error cancelling bulk order:', error);
      toast.error('Error', {
        description: 'Failed to cancel bulk order',
      });
    } finally {
      setIsCancelling(false);
    }
  };

  const handleSubmit = async () => {
    if (!order) return;

    try {
      setIsSubmitting(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/v1/bulk-orders/${orderId}/submit`, {
        method: 'POST',
      });
      const result = await response.json();

      if (result.success) {
        toast.success('Order submitted', {
          description: 'Bulk order has been submitted for processing',
        });
        fetchOrder();
      } else {
        throw new Error(result.error || 'Failed to submit order');
      }
    } catch (error) {
      console.error('Error submitting bulk order:', error);
      toast.error('Error', {
        description: 'Failed to submit bulk order',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Order not found</p>
        <Link href="/bulk-orders">
          <Button variant="outline" className="mt-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Bulk Orders
          </Button>
        </Link>
      </div>
    );
  }

  // Group items by retailer
  const itemsByRetailer = order.items?.reduce((acc, item) => {
    if (!acc[item.retailer]) {
      acc[item.retailer] = [];
    }
    acc[item.retailer].push(item);
    return acc;
  }, {} as Record<string, typeof order.items>) || {};

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/bulk-orders">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">{order.order_number}</h1>
            <p className="text-sm text-muted-foreground">
              Created {new Date(order.created_at).toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <BulkOrderStatusBadge status={order.status} />
          {order.status === 'draft' && (
            <>
              <Button
                variant="outline"
                onClick={handleCancel}
                disabled={isCancelling}
                className="text-destructive hover:text-destructive"
              >
                {isCancelling ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Submit Order
                  </>
                )}
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Order Items</CardTitle>
            </CardHeader>
            <CardContent>
              {Object.entries(itemsByRetailer).length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No items in this order</p>
              ) : (
                <div className="space-y-4">
                  {Object.entries(itemsByRetailer).map(([retailer, items]) => (
                    <BulkOrderRetailerGroup
                      key={retailer}
                      retailer={{
                        id: retailer,
                        bulk_order_id: order.id,
                        retailer,
                        item_count: items.length,
                        retailer_total: items.reduce((sum, item) => sum + item.total_price, 0),
                        retailer_status: order.status === 'draft' ? 'pending' : 'acknowledged',
                      }}
                      items={items}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div>
          <BulkOrderSummary order={order} retailers={order.retailers} />
        </div>
      </div>
    </div>
  );
}
