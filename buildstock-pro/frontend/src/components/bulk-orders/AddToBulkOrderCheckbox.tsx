'use client';

import { Checkbox } from '@/components/ui/checkbox';
import { useBulkOrder } from '@/src/contexts/BulkOrderContext';
import { Check } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface AddToBulkOrderCheckboxProps {
  scrapedPriceId: string;
  productId: string;
  productName: string;
  retailer: string;
  price: number;
  imageUrl: string;
  category: string;
  inStock: boolean;
  disabled?: boolean;
}

export function AddToBulkOrderCheckbox({
  scrapedPriceId,
  productId,
  productName,
  retailer,
  price,
  imageUrl,
  category,
  inStock,
  disabled = false,
}: AddToBulkOrderCheckboxProps) {
  const { isItemSelected, addItem, removeItem } = useBulkOrder();
  const [isAnimating, setIsAnimating] = useState(false);

  const isSelected = isItemSelected(scrapedPriceId);

  const handleChange = (checked: boolean) => {
    if (checked) {
      if (!inStock) {
        toast.error('Out of Stock', {
          description: 'This item is currently out of stock',
        });
        return;
      }

      addItem({
        scraped_price_id: scrapedPriceId,
        product_id: productId,
        product_name: productName,
        retailer,
        price,
        image_url: imageUrl,
        category,
        quantity: 1,
        in_stock: inStock,
      });

      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 300);

      toast.success('Added to bulk order', {
        description: `${productName} has been added to your bulk order selection`,
        action: {
          label: 'View',
          onClick: () => {
            // Navigate to bulk order cart or show drawer
            window.dispatchEvent(new CustomEvent('open-bulk-order-cart'));
          },
        },
      });
    } else {
      removeItem(scrapedPriceId);
    }
  };

  return (
    <div className="relative">
      <Checkbox
        id={`bulk-select-${scrapedPriceId}`}
        checked={isSelected}
        onCheckedChange={handleChange}
        disabled={disabled || !inStock}
        className="cursor-pointer"
      />
      {isSelected && (
        <Check
          className={cn(
            'absolute -top-1 -right-1 w-3 h-3 text-primary transition-all',
            isAnimating && 'scale-125'
          )}
        />
      )}
    </div>
  );
}
