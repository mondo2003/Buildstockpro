'use client';

import { ProductCard } from '@/components/ProductCard';
import { AddToBulkOrderCheckbox } from '@/components/bulk-orders/AddToBulkOrderCheckbox';
import { Product } from '@/lib/types';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface ProductCardWithBulkSelectProps {
  product: Product;
  variant?: 'default' | 'compact';
  showSupplier?: boolean;
  showDistance?: boolean;
  onReserve?: (productId: string, supplierId: string) => void;
  showBulkSelect?: boolean;
  scrapedPriceId?: string;
  retailer?: string;
  inStock?: boolean;
}

export function ProductCardWithBulkSelect({
  product,
  showBulkSelect = true,
  scrapedPriceId,
  retailer,
  inStock = true,
  ...props
}: ProductCardWithBulkSelectProps) {
  // For bulk select, we need scraped_price_id and retailer info
  // This would come from the live price data
  const nearestSupplier = product.suppliers.sort((a, b) => a.distance - b.distance)[0];

  return (
    <div className="relative">
      {/* Bulk Order Checkbox */}
      {showBulkSelect && scrapedPriceId && (
        <div className="absolute top-3 left-3 z-20">
          <div className="bg-white/90 backdrop-blur-sm rounded-md p-2 shadow-md border">
            <AddToBulkOrderCheckbox
              scrapedPriceId={scrapedPriceId}
              productId={product.id}
              productName={product.name}
              retailer={retailer || nearestSupplier?.name || 'Unknown'}
              price={product.price}
              imageUrl={product.images?.[0] || ''}
              category={product.category}
              inStock={inStock}
            />
          </div>
        </div>
      )}

      {/* Original Product Card */}
      <ProductCard
        product={product}
        {...props}
      />
    </div>
  );
}
