'use client';

import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { FileText, Loader2 } from 'lucide-react';
import { useState } from 'react';

interface AddToQuoteButtonProps {
  productId: string;
  productName: string;
  productImage?: string;
  unitPrice?: number;
  retailer?: string;
  category?: string;
  onClick?: () => void;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg';
  className?: string;
}

export function AddToQuoteButton({
  productId,
  productName,
  productImage,
  unitPrice,
  retailer,
  category,
  onClick,
  variant = 'outline',
  size = 'sm',
  className,
}: AddToQuoteButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async () => {
    setIsLoading(true);
    try {
      // Call the onClick handler passed from parent
      if (onClick) {
        onClick();
      }

      toast.success('Added to quote', {
        description: `${productName} has been added to your quote`,
        duration: 3000,
      });
    } catch (error) {
      console.error('Error adding to quote:', error);
      toast.error('Error', {
        description: 'Failed to add item to quote. Please try again.',
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleClick}
      disabled={isLoading}
      className={className}
    >
      {isLoading ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          Adding...
        </>
      ) : (
        <>
          <FileText className="w-4 h-4 mr-2" />
          Add to Quote
        </>
      )}
    </Button>
  );
}
