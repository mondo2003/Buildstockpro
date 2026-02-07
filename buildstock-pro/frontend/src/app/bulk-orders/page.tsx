'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { BulkOrderCard } from '@/src/components/bulk-orders/BulkOrderCard';
import { BulkOrderStatusBadge } from '@/src/components/bulk-orders/BulkOrderStatusBadge';
import { Loader2, Search, Plus, Filter } from 'lucide-react';
import { BulkOrder, BulkOrderSearchParams } from '@/src/types/bulkOrder';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function BulkOrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<BulkOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<BulkOrder['status'] | 'all'>('all');
  const [pagination, setPagination] = useState({
    page: 1,
    total: 0,
    totalPages: 0,
  });

  useEffect(() => {
    fetchOrders();
  }, [pagination.page, statusFilter]);

  const fetchOrders = async () => {
    try {
      setIsLoading(true);

      const params: BulkOrderSearchParams = {
        page: pagination.page,
        page_size: 10,
        sort: 'created_at',
        order: 'desc',
      };

      if (statusFilter !== 'all') {
        params.status = statusFilter;
      }

      const queryString = new URLSearchParams(
        Object.entries(params).reduce((acc, [key, value]) => {
          if (value !== undefined) {
            acc.push([key, String(value)]);
          }
          return acc;
        }, [] as [string, string][])
      ).toString();

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/v1/bulk-orders${queryString ? `?${queryString}` : ''}`
      );

      const result = await response.json();

      if (result.success && result.data) {
        setOrders(result.data.orders || []);
        setPagination({
          page: result.data.pagination.page,
          total: result.data.pagination.total,
          totalPages: result.data.pagination.total_pages,
        });
      } else {
        throw new Error(result.error || 'Failed to fetch orders');
      }
    } catch (error) {
      console.error('Error fetching bulk orders:', error);
      toast.error('Error', {
        description: 'Failed to load bulk orders',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Filter orders by search query
  const filteredOrders = orders.filter(order => {
    if (!searchQuery) return true;
    return (
      order.order_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.delivery_location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.delivery_postcode?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const statusOptions: Array<{ value: BulkOrder['status'] | 'all'; label: string }> = [
    { value: 'all', label: 'All' },
    { value: 'draft', label: 'Draft' },
    { value: 'pending', label: 'Pending' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'processing', label: 'Processing' },
    { value: 'ready', label: 'Ready' },
    { value: 'delivered', label: 'Delivered' },
    { value: 'cancelled', label: 'Cancelled' },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-gradient-to-b from-primary/5 to-background">
        <div className="container mx-auto px-4 md:px-6 py-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight mb-2">Bulk Orders</h1>
              <p className="text-muted-foreground">
                Manage your bulk orders from multiple retailers
              </p>
            </div>
            <Button
              size="lg"
              onClick={() => router.push('/bulk-orders/new')}
              className="gap-2"
            >
              <Plus className="w-5 h-5" />
              Create New Order
            </Button>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search orders..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="flex gap-2 flex-wrap">
              {statusOptions.map((option) => (
                <Button
                  key={option.value}
                  variant={statusFilter === option.value ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setStatusFilter(option.value)}
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Orders List */}
      <div className="container mx-auto px-4 md:px-6 py-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : filteredOrders.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Plus className="w-8 h-8 text-primary/30" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No Bulk Orders Yet</h3>
              <p className="text-sm text-muted-foreground text-center mb-6 max-w-md">
                {searchQuery || statusFilter !== 'all'
                  ? 'No orders match your search criteria'
                  : 'Create your first bulk order to easily purchase materials from multiple retailers'}
              </p>
              {!searchQuery && statusFilter === 'all' && (
                <Button onClick={() => router.push('/bulk-orders/new')} size="lg">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Bulk Order
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="mb-4 text-sm text-muted-foreground">
              Showing {filteredOrders.length} of {pagination.total} orders
            </div>

            <div className="space-y-4">
              {filteredOrders.map((order) => (
                <BulkOrderCard key={order.id} order={order} />
              ))}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-8">
                <Button
                  variant="outline"
                  onClick={() => setPagination((prev) => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                  disabled={pagination.page === 1}
                >
                  Previous
                </Button>
                <div className="flex items-center gap-2">
                  {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                    const pageNum = Math.max(1, Math.min(pagination.totalPages - 4, pagination.page - 2)) + i;
                    return (
                      <Button
                        key={pageNum}
                        variant={pagination.page === pageNum ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setPagination((prev) => ({ ...prev, page: pageNum }))}
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>
                <Button
                  variant="outline"
                  onClick={() => setPagination((prev) => ({ ...prev, page: Math.min(pagination.totalPages, prev.page + 1) }))}
                  disabled={pagination.page === pagination.totalPages}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
