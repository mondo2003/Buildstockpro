'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { MessageSquare } from 'lucide-react';
import { ContactModal } from './ContactModal';

interface ContactMerchantButtonProps {
  merchantId: string;
  merchantName?: string;
  productId?: string;
  productName?: string;
  buttonLabel?: string;
  variant?: 'default' | 'outline' | 'ghost' | 'secondary';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
}

export function ContactMerchantButton({
  merchantId,
  merchantName,
  productId,
  productName,
  buttonLabel = 'Contact Merchant',
  variant = 'default',
  size = 'default',
  className = '',
}: ContactMerchantButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button
        variant={variant}
        size={size}
        className={className}
        onClick={() => setIsOpen(true)}
      >
        <MessageSquare className="w-4 h-4 mr-2" />
        {buttonLabel}
      </Button>

      <ContactModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        merchantId={merchantId}
        merchantName={merchantName}
        productId={productId}
        productName={productName}
      />
    </>
  );
}
