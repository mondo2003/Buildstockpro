'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AddToQuoteButton, AddToBulkOrderButton, ContactMerchantButton, ProductActions } from '@/components/buttons/ActionButtons';
import { StatusBadge, StockStatusBadge } from '@/components/status/StatusBadge';
import { Modal, ConfirmModal } from '@/components/modals/Modal';
import { PageLoader, CardLoader, TableLoader, CenteredLoader } from '@/components/loading';
import { useSelection, useBulkOrder, useQuoteSelection } from '@/contexts/SelectionContext';
import { toast } from 'sonner';
import { Check, X, ShoppingCart, FileText, MessageSquare, Loader2 } from 'lucide-react';

/**
 * Integration Test Page
 * Development testing page for all shared components
 * Remove this in production
 */

export default function IntegrationTestPage() {
  const [loadingStates, setLoadingStates] = useState({
    quote: false,
    bulk: false,
    contact: false,
  });
  const [modals, setModals] = useState({
    basic: false,
    confirm: false,
    large: false,
  });
  const [showLoaders, setShowLoaders] = useState({
    page: false,
    centered: false,
  });

  const selection = useSelection();
  const bulkOrder = useBulkOrder();
  const quote = useQuoteSelection();

  // Test product (mock)
  const testProduct = {
    id: 'test-1',
    name: 'Test Product',
    description: 'A test product for integration testing',
    category: 'Test',
    images: [],
    price: 100,
    unit: 'unit',
    stock: { level: 'in-stock' as const, quantity: 50, lastUpdated: new Date().toISOString() },
    eco: { carbonFootprint: 10, carbonFootprintUnit: 'kg CO2e', rating: 'A' as const, certifications: [] },
    rating: { average: 4.5, count: 100 },
    suppliers: [],
    location: { latitude: 0, longitude: 0 },
    tags: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  // Handlers
  const handleAddToQuote = async () => {
    setLoadingStates((prev) => ({ ...prev, quote: true }));
    await new Promise((resolve) => setTimeout(resolve, 1500));
    toast.success('Added to quote!');
    setLoadingStates((prev) => ({ ...prev, quote: false }));
  };

  const handleAddToBulk = async () => {
    setLoadingStates((prev) => ({ ...prev, bulk: true }));
    await new Promise((resolve) => setTimeout(resolve, 1500));
    toast.success('Added to bulk order!');
    setLoadingStates((prev) => ({ ...prev, bulk: false }));
  };

  const handleContact = async () => {
    setLoadingStates((prev) => ({ ...prev, contact: true }));
    await new Promise((resolve) => setTimeout(resolve, 1500));
    toast.success('Contact request sent!');
    setLoadingStates((prev) => ({ ...prev, contact: false }));
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Integration Test Page</h1>
        <p className="text-muted-foreground">
          Development testing page for all shared components. Remove in production.
        </p>
        <Badge variant="outline" className="mt-2">
          Development Only
        </Badge>
      </div>

      <div className="space-y-8">
        {/* Action Buttons Section */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Action Buttons</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Individual Buttons */}
            <Card>
              <CardHeader>
                <CardTitle>Individual Action Buttons</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <AddToQuoteButton onClick={handleAddToQuote} loading={loadingStates.quote} />
                  <AddToQuoteButton size="sm" onClick={handleAddToQuote} />
                  <AddToQuoteButton size="lg" onClick={handleAddToQuote} />
                </div>

                <div className="flex flex-wrap gap-2">
                  <AddToBulkOrderButton onClick={handleAddToBulk} loading={loadingStates.bulk} />
                  <AddToBulkOrderButton
                    checkboxMode
                    selected={bulkOrder.isSelected('test-1')}
                    onToggle={() => bulkOrder.toggleProduct(testProduct, 'supplier-1')}
                  />
                </div>

                <div className="flex flex-wrap gap-2">
                  <ContactMerchantButton onClick={handleContact} loading={loadingStates.contact} />
                  <ContactMerchantButton size="sm" variant="ghost" />
                  <ContactMerchantButton size="lg" variant="outline" />
                </div>

                <div className="pt-4 border-t">
                  <p className="text-sm text-muted-foreground mb-2">Disabled States:</p>
                  <div className="flex flex-wrap gap-2">
                    <AddToQuoteButton disabled />
                    <AddToBulkOrderButton disabled />
                    <ContactMerchantButton disabled />
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <p className="text-sm text-muted-foreground mb-2">Success States:</p>
                  <div className="flex flex-wrap gap-2">
                    <AddToQuoteButton added />
                    <AddToBulkOrderButton selected />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Product Actions Group */}
            <Card>
              <CardHeader>
                <CardTitle>Product Actions Group</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Compact Mode:</p>
                  <ProductActions
                    compact
                    onAddToQuote={handleAddToQuote}
                    onAddToBulk={() => bulkOrder.toggleProduct(testProduct, 'supplier-1')}
                    onContact={handleContact}
                    quoteAdded={false}
                    bulkSelected={bulkOrder.isSelected('test-1')}
                    loadingQuote={loadingStates.quote}
                    loadingBulk={loadingStates.bulk}
                    loadingContact={loadingStates.contact}
                  />
                </div>

                <div className="pt-4 border-t">
                  <p className="text-sm text-muted-foreground mb-2">Full Mode:</p>
                  <ProductActions
                    compact={false}
                    onAddToQuote={handleAddToQuote}
                    onAddToBulk={() => bulkOrder.toggleProduct(testProduct, 'supplier-1')}
                    onContact={handleContact}
                    quoteAdded={false}
                    bulkSelected={bulkOrder.isSelected('test-1')}
                    loadingQuote={loadingStates.quote}
                    loadingBulk={loadingStates.bulk}
                    loadingContact={loadingStates.contact}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Status Badges Section */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Status Badges</h2>
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-6">
                <div>
                  <p className="text-sm font-medium mb-3">Different Variants:</p>
                  <div className="flex flex-wrap gap-2">
                    <StatusBadge status="success" variant="success" />
                    <StatusBadge status="warning" variant="warning" />
                    <StatusBadge status="error" variant="error" />
                    <StatusBadge status="info" variant="info" />
                    <StatusBadge status="neutral" variant="neutral" />
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium mb-3">Different Sizes:</p>
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusBadge status="pending" size="sm" />
                    <StatusBadge status="pending" size="md" />
                    <StatusBadge status="pending" size="lg" />
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium mb-3">Quick Status Types:</p>
                  <div className="flex flex-wrap gap-2">
                    <StatusBadge status="pending" pulse />
                    <StatusBadge status="in-progress" pulse />
                    <StatusBadge status="completed" />
                    <StatusBadge status="cancelled" />
                    <StatusBadge status="draft" />
                    <StatusBadge status="submitted" />
                    <StatusBadge status="approved" />
                    <StatusBadge status="rejected" />
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium mb-3">Stock Status:</p>
                  <div className="flex flex-wrap gap-2">
                    <StockStatusBadge level="in-stock" quantity={50} />
                    <StockStatusBadge level="low-stock" quantity={5} />
                    <StockStatusBadge level="out-of-stock" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Modals Section */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Modals</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button onClick={() => setModals((prev) => ({ ...prev, basic: true }))}>
              Open Basic Modal
            </Button>
            <Button onClick={() => setModals((prev) => ({ ...prev, confirm: true }))} variant="outline">
              Open Confirm Modal
            </Button>
            <Button onClick={() => setModals((prev) => ({ ...prev, large: true }))} variant="secondary">
              Open Large Modal
            </Button>
          </div>

          <Modal
            isOpen={modals.basic}
            onClose={() => setModals((prev) => ({ ...prev, basic: false }))}
            title="Basic Modal"
            description="This is a basic modal with title and description"
            footer={
              <>
                <Button variant="outline" onClick={() => setModals((prev) => ({ ...prev, basic: false }))}>
                  Cancel
                </Button>
                <Button onClick={() => setModals((prev) => ({ ...prev, basic: false }))}>
                  Confirm
                </Button>
              </>
            }
          >
            <p>This is the modal body content. You can put anything here.</p>
          </Modal>

          <ConfirmModal
            isOpen={modals.confirm}
            onClose={() => setModals((prev) => ({ ...prev, confirm: false }))}
            onConfirm={() => {
              toast.success('Confirmed!');
              setModals((prev) => ({ ...prev, confirm: false }));
            }}
            title="Confirm Action"
            message="Are you sure you want to proceed? This action cannot be undone."
            confirmText="Yes, Confirm"
            variant="danger"
          />

          <Modal
            isOpen={modals.large}
            onClose={() => setModals((prev) => ({ ...prev, large: false }))}
            title="Large Modal"
            size="lg"
            footer={
              <>
                <Button variant="outline" onClick={() => setModals((prev) => ({ ...prev, large: false }))}>
                  Close
                </Button>
              </>
            }
          >
            <div className="space-y-4">
              <p>This is a large modal with more content.</p>
              <div className="bg-muted p-4 rounded-lg">
                <p className="text-sm">You can put forms, tables, or any other content here.</p>
              </div>
            </div>
          </Modal>
        </section>

        {/* Loading Components Section */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Loading Components</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Page Loaders</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => setShowLoaders((prev) => ({ ...prev, page: true }))}>
                    Show Page Loader
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setShowLoaders((prev) => ({ ...prev, centered: true }))}>
                    Show Centered Loader
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Card Loader</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <CardLoader count={1} />
                  <CardLoader count={1} showFooter={false} />
                </div>
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Table Loader</CardTitle>
              </CardHeader>
              <CardContent>
                <TableLoader rows={4} columns={5} />
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Selection Context Section */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Selection Context</h2>
          <Card>
            <CardHeader>
              <CardTitle>Bulk Order Selection State</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-muted p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground">Selected Count</p>
                  <p className="text-2xl font-bold">{bulkOrder.selectedCount}</p>
                </div>
                <div className="bg-muted p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground">Total Cost</p>
                  <p className="text-2xl font-bold">£{bulkOrder.getTotalEstimatedCost().toFixed(2)}</p>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={() => {
                    bulkOrder.addToBulkOrder(testProduct, 'supplier-1');
                    toast.success('Added to bulk order!');
                  }}
                >
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Add Test Product
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    bulkOrder.clearBulkOrder();
                    toast.success('Cleared bulk order!');
                  }}
                >
                  Clear Selection
                </Button>
              </div>

              {bulkOrder.selectedCount > 0 && (
                <div className="bg-accent/10 p-4 rounded-lg">
                  <p className="text-sm font-medium mb-2">Selected Products:</p>
                  <ul className="space-y-1">
                    {bulkOrder.getBulkOrderItems().map((item) => (
                      <li key={item.product.id} className="text-sm flex items-center gap-2">
                        <Check className="w-4 h-4 text-accent" />
                        {item.product.name} - Qty: {item.quantity}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        </section>
      </div>

      {/* Page Loaders (rendered conditionally) */}
      {showLoaders.page && (
        <PageLoader
          message="Loading page..."
          onClose={() => setShowLoaders((prev) => ({ ...prev, page: false }))}
        />
      )}
    </div>
  );
}
