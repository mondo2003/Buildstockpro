'use client';

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { BulkOrder } from '@/src/types/bulkOrder';

interface BulkOrderStatusBadgeProps {
  status: BulkOrder['status'];
  className?: string;
}

export function BulkOrderStatusBadge({ status, className }: BulkOrderStatusBadgeProps) {
  const getStatusConfig = (status: BulkOrder['status']) => {
    switch (status) {
      case 'draft':
        return {
          label: 'Draft',
          className: 'bg-gray-100 text-gray-800 border-gray-200',
        };
      case 'pending':
        return {
          label: 'Pending',
          className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        };
      case 'confirmed':
        return {
          label: 'Confirmed',
          className: 'bg-blue-100 text-blue-800 border-blue-200',
        };
      case 'processing':
        return {
          label: 'Processing',
          className: 'bg-purple-100 text-purple-800 border-purple-200',
        };
      case 'ready':
        return {
          label: 'Ready for Pickup',
          className: 'bg-green-100 text-green-800 border-green-200',
        };
      case 'delivered':
        return {
          label: 'Delivered',
          className: 'bg-green-100 text-green-900 border-green-300',
        };
      case 'cancelled':
        return {
          label: 'Cancelled',
          className: 'bg-red-100 text-red-800 border-red-200',
        };
      default:
        return {
          label: status,
          className: 'bg-gray-100 text-gray-800 border-gray-200',
        };
    }
  };

  const config = getStatusConfig(status);

  return (
    <Badge variant="outline" className={cn(config.className, className)}>
      {config.label}
    </Badge>
  );
}
