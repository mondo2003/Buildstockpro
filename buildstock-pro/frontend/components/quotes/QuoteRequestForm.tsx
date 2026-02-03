'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CreateQuoteRequest } from '@/types/quote';
import { Loader2, Plus } from 'lucide-react';
import { toast } from 'sonner';

interface QuoteRequestFormProps {
  onSubmit: (data: CreateQuoteRequest) => Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
  className?: string;
}

export function QuoteRequestForm({
  onSubmit,
  onCancel,
  isLoading = false,
  className,
}: QuoteRequestFormProps) {
  const [formData, setFormData] = useState({
    title: '',
    delivery_location: '',
    delivery_postcode: '',
    notes: '',
    response_deadline: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.title.trim()) {
      toast.error('Title required', {
        description: 'Please enter a title for your quote request',
      });
      return;
    }

    if (!formData.delivery_location.trim()) {
      toast.error('Delivery location required', {
        description: 'Please enter the delivery location',
      });
      return;
    }

    if (!formData.delivery_postcode.trim()) {
      toast.error('Postcode required', {
        description: 'Please enter the delivery postcode',
      });
      return;
    }

    // UK postcode validation (basic)
    const postcodeRegex = /^[A-Z]{1,2}[0-9][A-Z0-9]? ?[0-9][A-Z]{2}$/i;
    if (!postcodeRegex.test(formData.delivery_postcode.trim())) {
      toast.error('Invalid postcode', {
        description: 'Please enter a valid UK postcode',
      });
      return;
    }

    // Submit data
    const submitData: CreateQuoteRequest = {
      title: formData.title.trim(),
      delivery_location: formData.delivery_location.trim(),
      delivery_postcode: formData.delivery_postcode.trim().toUpperCase(),
      notes: formData.notes.trim() || undefined,
      response_deadline: formData.response_deadline || undefined,
      items: [],
    };

    await onSubmit(submitData);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Create Quote Request</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">
              Title <span className="text-destructive">*</span>
            </Label>
            <Input
              id="title"
              placeholder="e.g., Kitchen Renovation Materials"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              disabled={isLoading}
              required
            />
          </div>

          {/* Delivery Location */}
          <div className="space-y-2">
            <Label htmlFor="delivery_location">
              Delivery Location <span className="text-destructive">*</span>
            </Label>
            <Input
              id="delivery_location"
              placeholder="e.g., 123 High Street, London"
              value={formData.delivery_location}
              onChange={(e) => handleInputChange('delivery_location', e.target.value)}
              disabled={isLoading}
              required
            />
          </div>

          {/* Delivery Postcode */}
          <div className="space-y-2">
            <Label htmlFor="delivery_postcode">
              Postcode <span className="text-destructive">*</span>
            </Label>
            <Input
              id="delivery_postcode"
              placeholder="e.g., SW1A 1AA"
              value={formData.delivery_postcode}
              onChange={(e) => handleInputChange('delivery_postcode', e.target.value.toUpperCase())}
              disabled={isLoading}
              required
              maxLength={8}
            />
            <p className="text-xs text-muted-foreground">
              Enter a valid UK postcode for delivery
            </p>
          </div>

          {/* Response Deadline (Optional) */}
          <div className="space-y-2">
            <Label htmlFor="response_deadline">
              Response Deadline <span className="text-muted-foreground">(optional)</span>
            </Label>
            <Input
              id="response_deadline"
              type="date"
              value={formData.response_deadline}
              onChange={(e) => handleInputChange('response_deadline', e.target.value)}
              disabled={isLoading}
              min={new Date().toISOString().split('T')[0]}
            />
            <p className="text-xs text-muted-foreground">
              Set a deadline for suppliers to respond to your quote
            </p>
          </div>

          {/* Notes (Optional) */}
          <div className="space-y-2">
            <Label htmlFor="notes">
              Notes <span className="text-muted-foreground">(optional)</span>
            </Label>
            <textarea
              id="notes"
              placeholder="Add any additional notes or requirements..."
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              disabled={isLoading}
              rows={3}
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-y"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isLoading}
                className="flex-1"
              >
                Cancel
              </Button>
            )}
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Quote
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
