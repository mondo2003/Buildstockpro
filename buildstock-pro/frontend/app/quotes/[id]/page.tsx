'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useQuote } from '@/context/QuoteContext';
import { QuoteDetails } from '@/components/quotes/QuoteDetails';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

export default function QuoteDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { id } = params;
  const {
    currentQuoteDetail,
    isLoadingQuoteDetail,
    loadQuoteDetail,
    cancelQuote,
    markQuoteAsSent,
    removeQuoteItem,
  } = useQuote();

  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (id && typeof id === 'string') {
      loadQuoteDetail(id);
    }
  }, [id, loadQuoteDetail]);

  const handleBack = () => {
    router.push('/quotes');
  };

  const handleEdit = () => {
    router.push(`/quotes/${id}/edit`);
  };

  const handleSend = async () => {
    if (!currentQuoteDetail) return;

    try {
      await markQuoteAsSent(currentQuoteDetail.id);
    } catch (error) {
      toast.error('Failed to send quote', {
        description: error instanceof Error ? error.message : 'Please try again',
      });
    }
  };

  const handleCancel = async () => {
    if (!currentQuoteDetail) return;

    if (!confirm('Are you sure you want to cancel this quote?')) {
      return;
    }

    setIsDeleting(true);
    try {
      await cancelQuote(currentQuoteDetail.id);
      router.push('/quotes');
    } catch (error) {
      toast.error('Failed to cancel quote', {
        description: error instanceof Error ? error.message : 'Please try again',
      });
      setIsDeleting(false);
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    if (!currentQuoteDetail) return;

    if (!confirm('Are you sure you want to remove this item from the quote?')) {
      return;
    }

    try {
      await removeQuoteItem(currentQuoteDetail.id, itemId);
    } catch (error) {
      toast.error('Failed to remove item', {
        description: error instanceof Error ? error.message : 'Please try again',
      });
    }
  };

  if (isLoadingQuoteDetail) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!currentQuoteDetail) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="text-center py-20">
          <h2 className="text-2xl font-bold mb-4">Quote Not Found</h2>
          <p className="text-muted-foreground mb-6">
            The quote you're looking for doesn't exist or you don't have access to it.
          </p>
          <Button onClick={handleBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Quotes
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      {/* Back Button */}
      <Button
        variant="ghost"
        onClick={handleBack}
        className="mb-6"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Quotes
      </Button>

      {/* Quote Details */}
      <QuoteDetails
        quote={currentQuoteDetail}
        onEdit={currentQuoteDetail.status === 'pending' ? handleEdit : undefined}
        onSend={currentQuoteDetail.status === 'pending' ? handleSend : undefined}
        onCancel={isDeleting ? undefined : (currentQuoteDetail.status === 'pending' || currentQuoteDetail.status === 'sent') ? handleCancel : undefined}
        onRemoveItem={currentQuoteDetail.status === 'pending' ? handleRemoveItem : undefined}
      />
    </div>
  );
}
