'use client';

import { useState, useEffect } from 'react';
import { MerchantContactRequest, ContactRequestsParams } from '@/types/merchantContact';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ContactRequestCard } from '@/components/merchant-contact/ContactRequestCard';
import { Loader2, MessageSquare, Filter } from 'lucide-react';
import { merchantContactApi } from '@/lib/api/merchantContact';
import { toast } from 'sonner';

const STATUS_FILTERS: { value: 'all' | 'pending' | 'sent' | 'responded' | 'resolved'; label: string }[] = [
  { value: 'all', label: 'All Requests' },
  { value: 'pending', label: 'Pending' },
  { value: 'sent', label: 'Sent' },
  { value: 'responded', label: 'Responded' },
  { value: 'resolved', label: 'Resolved' },
];

export default function ContactRequestsPage() {
  const [requests, setRequests] = useState<MerchantContactRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'sent' | 'responded' | 'resolved'>('all');
  const [pagination, setPagination] = useState({
    page: 1,
    page_size: 10,
    total: 0,
    total_pages: 0,
  });

  const fetchRequests = async () => {
    setIsLoading(true);
    try {
      const params: ContactRequestsParams = {
        page: pagination.page,
        page_size: pagination.page_size,
      };

      if (statusFilter !== 'all') {
        params.status = statusFilter;
      }

      const response = await merchantContactApi.getContactRequests(params);
      setRequests(response.requests);
      setPagination(response.pagination);
    } catch (error) {
      console.error('Error fetching contact requests:', error);
      toast.error('Failed to load contact requests', {
        description: error instanceof Error ? error.message : 'Please try again later',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [statusFilter, pagination.page]);

  const handleStatusChange = (status: typeof statusFilter) => {
    setStatusFilter(status);
    setPagination((prev) => ({ ...prev, page: 1 })); // Reset to first page
  };

  const handleDeleteRequest = async (id: string) => {
    if (!confirm('Are you sure you want to delete this contact request?')) {
      return;
    }

    try {
      await merchantContactApi.deleteContactRequest(id);
      toast.success('Request deleted', {
        description: 'The contact request has been deleted',
      });
      fetchRequests(); // Refresh list
    } catch (error) {
      console.error('Error deleting contact request:', error);
      toast.error('Failed to delete request', {
        description: error instanceof Error ? error.message : 'Please try again later',
      });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">My Contact Requests</h1>
        <p className="text-muted-foreground">
          Manage your inquiries and track merchant responses
        </p>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Filter className="w-4 h-4" />
            Filter Requests
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {STATUS_FILTERS.map((filter) => (
              <Button
                key={filter.value}
                variant={statusFilter === filter.value ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleStatusChange(filter.value)}
              >
                {filter.label}
                {filter.value !== 'all' && (
                  <Badge
                    variant="secondary"
                    className="ml-2"
                  >
                    {requests.filter((r) => r.status === filter.value).length}
                  </Badge>
                )}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Requests List */}
      {isLoading ? (
        <Card>
          <CardContent className="p-12 flex items-center justify-center">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">Loading contact requests...</p>
            </div>
          </CardContent>
        </Card>
      ) : requests.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <MessageSquare className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No contact requests yet</h3>
            <p className="text-muted-foreground mb-6">
              {statusFilter === 'all'
                ? "You haven't made any contact requests yet. Browse products and reach out to merchants!"
                : `No ${statusFilter} contact requests found.`}
            </p>
            <Button onClick={() => (window.location.href = '/')}>
              Browse Products
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="mb-4 text-sm text-muted-foreground">
            Showing {requests.length} of {pagination.total} request{pagination.total !== 1 ? 's' : ''}
          </div>

          <div className="space-y-4">
            {requests.map((request) => (
              <ContactRequestCard key={request.id} request={request} />
            ))}
          </div>

          {/* Pagination */}
          {pagination.total_pages > 1 && (
            <div className="mt-6 flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.page === 1}
                onClick={() =>
                  setPagination((prev) => ({ ...prev, page: prev.page - 1 }))
                }
              >
                Previous
              </Button>
              <div className="text-sm text-muted-foreground px-4">
                Page {pagination.page} of {pagination.total_pages}
              </div>
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.page === pagination.total_pages}
                onClick={() =>
                  setPagination((prev) => ({ ...prev, page: prev.page + 1 }))
                }
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
