'use client';

import { useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ContactForm } from './ContactForm';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  merchantId: string;
  merchantName?: string;
  productId?: string;
  productName?: string;
}

export function ContactModal({
  isOpen,
  onClose,
  merchantId,
  merchantName,
  productId,
  productName,
}: ContactModalProps) {
  useEffect(() => {
    // Prevent body scroll when modal is open
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div
        className="relative bg-background rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-background border-b p-4 flex items-center justify-between z-10">
          <h2 className="text-xl font-semibold">Contact Merchant</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="shrink-0"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-4">
          <ContactForm
            merchantId={merchantId}
            merchantName={merchantName}
            productId={productId}
            productName={productName}
            onSuccess={onClose}
            onCancel={onClose}
          />
        </div>
      </div>
    </div>
  );
}
