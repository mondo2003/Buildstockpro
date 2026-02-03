'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MapPin, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { SelectedBulkItem } from '@/types/bulkOrder';
import { BulkOrderItemRow } from './BulkOrderItemRow';

interface BulkOrderFormProps {
  selectedItems: SelectedBulkItem[];
  onSubmit: (data: { delivery_location: string; delivery_postcode: string; customer_notes?: string }) => void;
  onSaveDraft?: () => void;
  isSubmitting?: boolean;
}

export function BulkOrderForm({ selectedItems, onSubmit, onSaveDraft, isSubmitting = false }: BulkOrderFormProps) {
  const [deliveryLocation, setDeliveryLocation] = useState('');
  const [deliveryPostcode, setDeliveryPostcode] = useState('');
  const [customerNotes, setCustomerNotes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!deliveryLocation.trim()) {
      toast.error('Delivery location required', {
        description: 'Please enter your delivery location',
      });
      return;
    }

    if (!deliveryPostcode.trim()) {
      toast.error('Postcode required', {
        description: 'Please enter your delivery postcode',
      });
      return;
    }

    const postcodeRegex = /^[A-Z]{1,2}[0-9][A-Z0-9]? ?[0-9][A-Z]{2}$/i;
    if (!postcodeRegex.test(deliveryPostcode.trim())) {
      toast.error('Invalid postcode', {
        description: 'Please enter a valid UK postcode',
      });
      return;
    }

    if (selectedItems.length === 0) {
      toast.error('No items selected', {
        description: 'Please add at least one item to your bulk order',
      });
      return;
    }

    onSubmit({
      delivery_location: deliveryLocation.trim(),
      delivery_postcode: deliveryPostcode.trim().toUpperCase(),
      customer_notes: customerNotes.trim() || undefined,
    });
  };

  const estimatedTotal = selectedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const totalRetailers = new Set(selectedItems.map(item => item.retailer)).size;

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>Delivery Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Delivery Location */}
          <div className="space-y-2">
            <label htmlFor="delivery-location" className="text-sm font-medium">
              Delivery Location *
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="delivery-location"
                placeholder="123 Construction Site, Main Road"
                value={deliveryLocation}
                onChange={(e) => setDeliveryLocation(e.target.value)}
                className="pl-10"
                required
              />
            </div>
          </div>

          {/* Postcode */}
          <div className="space-y-2">
            <label htmlFor="postcode" className="text-sm font-medium">
              Postcode *
            </label>
            <Input
              id="postcode"
              placeholder="SW1A 1AA"
              value={deliveryPostcode}
              onChange={(e) => setDeliveryPostcode(e.target.value.toUpperCase())}
              required
              maxLength={8}
            />
            <p className="text-xs text-muted-foreground">
              Enter a valid UK postcode
            </p>
          </div>

          {/* Customer Notes */}
          <div className="space-y-2">
            <label htmlFor="notes" className="text-sm font-medium">
              Notes (Optional)
            </label>
            <div className="relative">
              <FileText className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
              <textarea
                id="notes"
                placeholder="Any special instructions for your order..."
                value={customerNotes}
                onChange={(e) => setCustomerNotes(e.target.value)}
                className="w-full min-h-[100px] pl-10 pr-4 py-2 text-sm rounded-md border border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
          </div>

          {/* Order Summary */}
          <div className="pt-4 border-t space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Total Items</span>
              <span className="font-medium">{selectedItems.reduce((sum, item) => sum + item.quantity, 0)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Retailers</span>
              <span className="font-medium">{totalRetailers}</span>
            </div>
            <div className="flex justify-between text-lg font-bold">
              <span>Estimated Total</span>
              <span className="text-green-600">£{estimatedTotal.toFixed(2)}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            {onSaveDraft && (
              <Button
                type="button"
                variant="outline"
                onClick={onSaveDraft}
                disabled={isSubmitting}
                className="flex-1"
              >
                Save as Draft
              </Button>
            )}
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Bulk Order'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
