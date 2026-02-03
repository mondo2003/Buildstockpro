'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BulkOrderSelector } from '@/components/bulk-orders/BulkOrderSelector';
import { BulkOrderForm } from '@/components/bulk-orders/BulkOrderForm';
import { useBulkOrder } from '@/contexts/BulkOrderContext';
import { ArrowLeft, Package, Search } from 'lucide-react';
import { bulkOrdersApi } from '@/lib/api/bulkOrders';
import { toast } from 'sonner';
import Link from 'next/link';
import { api } from '@/lib/api';

export default function NewBulkOrderPage() {
  const router = useRouter();
  const { selectedItems, updateQuantity, removeItem, clearSelection } = useBulkOrder();
  const [step, setStep] = useState<'select' | 'details' | 'review'>('select');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async (query: string) => {
    setSearchQuery(query);

    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      setIsSearching(true);
      const results = await api.searchProducts({
        query,
        page: 1,
      });
      setSearchResults(results.products);
    } catch (error) {
      console.error('Error searching products:', error);
      toast.error('Search failed', {
        description: 'Failed to search products',
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleSubmitOrder = async (data: { delivery_location: string; delivery_postcode: string; customer_notes?: string }) => {
    try {
      setIsSubmitting(true);

      const orderData = {
        delivery_location: data.delivery_location,
        delivery_postcode: data.delivery_postcode,
        customer_notes: data.customer_notes,
        items: selectedItems.map((item) => ({
          scraped_price_id: item.scraped_price_id,
          quantity: item.quantity,
        })),
      };

      const result = await bulkOrdersApi.createBulkOrder(orderData);

      toast.success('Bulk order created!', {
        description: `Order ${result.order_number} has been created successfully`,
      });

      // Clear selection and redirect to order details
      clearSelection();
      router.push(`/bulk-orders/${result.id}`);
    } catch (error) {
      console.error('Error creating bulk order:', error);
      toast.error('Failed to create order', {
        description: error instanceof Error ? error.message : 'An error occurred',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveDraft = async () => {
    toast.info('Draft feature', {
      description: 'Draft saving will be available soon',
    });
  };

  if (selectedItems.length === 0 && step !== 'select') {
    setStep('select');
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-gradient-to-b from-primary/5 to-background">
        <div className="container mx-auto px-4 md:px-6 py-6">
          <div className="flex items-center gap-4 mb-4">
            <Link href="/bulk-orders">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold">Create Bulk Order</h1>
              <p className="text-sm text-muted-foreground">
                Step {step === 'select' ? 1 : step === 'details' ? 2 : 3} of 3:{' '}
                {step === 'select' ? 'Select Products' : step === 'details' ? 'Delivery Details' : 'Review & Submit'}
              </p>
            </div>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center gap-2 max-w-2xl">
            <div className={`flex-1 h-2 rounded-full ${step === 'select' ? 'bg-primary' : 'bg-primary/30'}`} />
            <div className={`flex-1 h-2 rounded-full ${step === 'details' || step === 'review' ? 'bg-primary' : 'bg-muted'}`} />
            <div className={`flex-1 h-2 rounded-full ${step === 'review' ? 'bg-primary' : 'bg-muted'}`} />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 md:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {step === 'select' && (
              <Card>
                <CardHeader>
                  <CardTitle>Search Products</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Search Input */}
                  <div className="relative">
                    <Package className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Search for products to add..."
                      value={searchQuery}
                      onChange={(e) => handleSearch(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>

                  {/* Search Results */}
                  {searchQuery && (
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">
                        {isSearching
                          ? 'Searching...'
                          : `Found ${searchResults.length} products`}
                      </p>
                      <div className="space-y-2 max-h-[400px] overflow-y-auto">
                        {searchResults.slice(0, 10).map((product) => (
                          <div
                            key={product.id}
                            className="p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                          >
                            <p className="font-medium">{product.name}</p>
                            <p className="text-sm text-muted-foreground">{product.category}</p>
                            <p className="font-bold text-primary">£{product.price.toFixed(2)}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              Use the product page to add to bulk order
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {!searchQuery && (
                    <div className="text-center py-8 text-muted-foreground">
                      <Package className="w-12 h-12 mx-auto mb-3 opacity-30" />
                      <p>Search for products above or browse the catalog</p>
                      <Link href="/search">
                        <Button variant="outline" className="mt-4">
                          <Search className="w-4 h-4 mr-2" />
                          Browse Products
                        </Button>
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {step === 'details' && (
              <BulkOrderForm
                selectedItems={selectedItems}
                onSubmit={handleSubmitOrder}
                onSaveDraft={handleSaveDraft}
                isSubmitting={isSubmitting}
              />
            )}

            {step === 'review' && (
              <Card>
                <CardHeader>
                  <CardTitle>Review Order</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Review your order before submitting</p>
                  {/* Review content would go here */}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div>
            <BulkOrderSelector
              selectedItems={selectedItems}
              onUpdateQuantity={updateQuantity}
              onRemoveItem={removeItem}
              onClearSelection={clearSelection}
            />

            {/* Action Buttons */}
            {selectedItems.length > 0 && (
              <Card className="mt-4">
                <CardContent className="pt-6">
                  {step === 'select' && (
                    <Button
                      className="w-full"
                      size="lg"
                      onClick={() => setStep('details')}
                    >
                      Continue to Delivery Details
                    </Button>
                  )}
                  {step === 'details' && (
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => setStep('select')}
                    >
                      Back to Select Products
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
