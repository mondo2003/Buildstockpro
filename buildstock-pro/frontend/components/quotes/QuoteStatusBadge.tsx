'use client';

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Quote } from '@/types/quote';

interface QuoteStatusBadgeProps {
  status: Quote['status'];
  className?: string;
}

export function QuoteStatusBadge({ status, className }: QuoteStatusBadgeProps) {
  const getStatusConfig = (status: Quote['status']) => {
    switch (status) {
      case 'pending':
        return {
          label: 'Pending',
          className: 'bg-yellow-500/10 text-yellow-700 border-yellow-500/20 hover:bg-yellow-500/20',
        };
      case 'sent':
        return {
          label: 'Sent',
          className: 'bg-blue-500/10 text-blue-700 border-blue-500/20 hover:bg-blue-500/20',
        };
      case 'responded':
        return {
          label: 'Responded',
          className: 'bg-green-500/10 text-green-700 border-green-500/20 hover:bg-green-500/20',
        };
      case 'expired':
        return {
          label: 'Expired',
          className: 'bg-red-500/10 text-red-700 border-red-500/20 hover:bg-red-500/20',
        };
      case 'cancelled':
        return {
          label: 'Cancelled',
          className: 'bg-gray-500/10 text-gray-700 border-gray-500/20 hover:bg-gray-500/20',
        };
      default:
        return {
          label: status,
          className: 'bg-gray-500/10 text-gray-700 border-gray-500/20',
        };
    }
  };

  const config = getStatusConfig(status);

  return (
    <Badge variant="outline" className={cn('text-xs font-medium', config.className, className)}>
      {config.label}
    </Badge>
  );
}
