'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useQuote } from '@/context/QuoteContext';
import { toast } from 'sonner';
import { Loader2, Package } from 'lucide-react';
import Image from 'next/image';

interface QuoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: {
    id: string;
    name: string;
    price: number;
    image?: string;
    category?: string;
    retailer?: string;
  };
}

export function QuoteModal({ isOpen, onClose, product }: QuoteModalProps) {
  const router = useRouter();
  const { addItemToCurrentQuote } = useQuote();
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const handleAddToQuote = () => {
    setIsAdding(true);

    try {
      addItemToCurrentQuote({
        scraped_price_id: product.id,
        product_name: product.name,
        retailer: product.retailer || 'Unknown',
        quantity,
        unit_price: product.price,
        notes: notes.trim() || undefined,
        product_image: product.image,
        product_category: product.category,
      });

      // Reset form
      setQuantity(1);
      setNotes('');

      // Close modal after a short delay
      setTimeout(() => {
        onClose();
        setIsAdding(false);
      }, 500);
    } catch (error) {
      console.error('Error adding to quote:', error);
      toast.error('Error', {
        description: 'Failed to add item to quote',
      });
      setIsAdding(false);
    }
  };

  const handleStartNewQuote = () => {
    // Navigate to new quote page with product info
    const params = new URLSearchParams({
      product: product.id,
      productName: product.name,
      productPrice: product.price.toString(),
      productRetailer: product.retailer || 'Unknown',
    });

    if (product.image) {
      params.append('productImage', product.image);
    }
    if (product.category) {
      params.append('productCategory', product.category);
    }

    router.push(`/quotes/new?${params.toString()}`);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add to Quote</DialogTitle>
          <DialogDescription>
            Add this product to a new or existing quote
          </DialogDescription>
        </DialogHeader>

        {/* Product Info */}
        <div className="flex gap-4 p-4 bg-muted/50 rounded-lg">
          <div className="relative w-16 h-16 flex-shrink-0 bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg overflow-hidden">
            {product.image ? (
              <Image
                src={product.image}
                alt={product.name}
                fill
                className="object-cover"
                sizes="64px"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <Package className="w-8 h-8 text-primary/30" />
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <h4 className="font-semibold line-clamp-1">{product.name}</h4>
            <p className="text-sm text-muted-foreground">{product.retailer || 'Unknown'}</p>
            <p className="text-lg font-bold mt-1">£{product.price.toFixed(2)}</p>
          </div>
        </div>

        {/* Quantity and Notes */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="quantity">Quantity</Label>
            <Input
              id="quantity"
              type="number"
              min="1"
              max="999"
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
              className="w-24"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optional)</Label>
            <textarea
              id="notes"
              placeholder="Add any special requirements..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-y"
            />
          </div>

          {/* Price Summary */}
          <div className="pt-2 border-t">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Item Total</span>
              <span className="text-lg font-bold">
                £{(product.price * quantity).toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-col gap-2">
          <Button
            onClick={handleAddToQuote}
            disabled={isAdding}
            className="w-full"
          >
            {isAdding ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Adding...
              </>
            ) : (
              'Add to Current Quote'
            )}
          </Button>
          <Button
            onClick={handleStartNewQuote}
            variant="outline"
            className="w-full"
          >
            Create New Quote
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
