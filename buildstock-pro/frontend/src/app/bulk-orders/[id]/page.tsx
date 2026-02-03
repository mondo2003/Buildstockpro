'use client';

import { BulkOrderDetails } from '@/components/bulk-orders/BulkOrderDetails';
import { useParams } from 'next/navigation';

export default function BulkOrderDetailsPage() {
  const params = useParams();
  const orderId = params.id as string;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 md:px-6 py-8">
        <BulkOrderDetails orderId={orderId} />
      </div>
    </div>
  );
}
