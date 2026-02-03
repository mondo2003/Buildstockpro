'use client';

import { useState } from 'react';
import { ProductCard } from '@/components/ProductCard';
import { Product } from '@/lib/types';
import { QuoteModal } from './QuoteModal';
import { FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ProductCardWithQuoteProps {
  product: Product;
  variant?: 'default' | 'compact';
  showSupplier?: boolean;
  showDistance?: boolean;
  onReserve?: (productId: string, supplierId: string) => void;
}

export function ProductCardWithQuote(props: ProductCardWithQuoteProps) {
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);

  // Get the nearest supplier for quote
  const nearestSupplier = props.product.suppliers.sort((a, b) => a.distance - b.distance)[0];

  const handleAddToQuote = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsQuoteModalOpen(true);
  };

  return (
    <>
      <div className="relative group">
        <ProductCard {...props} />

        {/* Add to Quote Button - Absolute positioned on hover */}
        {props.variant === 'default' && nearestSupplier && props.product.stock.level !== 'out-of-stock' && (
          <Button
            size="sm"
            variant="secondary"
            onClick={handleAddToQuote}
            className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity shadow-md bg-white/90 backdrop-blur-sm hover:bg-white"
          >
            <FileText className="w-4 h-4 mr-1.5" />
            Quote
          </Button>
        )}
      </div>

      {/* Quote Modal */}
      {nearestSupplier && (
        <QuoteModal
          isOpen={isQuoteModalOpen}
          onClose={() => setIsQuoteModalOpen(false)}
          product={{
            id: props.product.id,
            name: props.product.name,
            price: nearestSupplier.price || props.product.price,
            image: props.product.images[0],
            category: props.product.category,
            retailer: nearestSupplier.name,
          }}
        />
      )}
    </>
  );
}
