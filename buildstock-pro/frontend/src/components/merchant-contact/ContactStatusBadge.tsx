'use client';

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Clock, Send, MessageSquare, CheckCircle2 } from 'lucide-react';

interface ContactStatusBadgeProps {
  status: 'pending' | 'sent' | 'responded' | 'resolved';
  showIcon?: boolean;
  className?: string;
}

export function ContactStatusBadge({
  status,
  showIcon = true,
  className = '',
}: ContactStatusBadgeProps) {
  const config = {
    pending: {
      label: 'Pending',
      variant: 'secondary' as const,
      icon: Clock,
      className: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20 hover:bg-yellow-500/20',
    },
    sent: {
      label: 'Sent',
      variant: 'secondary' as const,
      icon: Send,
      className: 'bg-blue-500/10 text-blue-500 border-blue-500/20 hover:bg-blue-500/20',
    },
    responded: {
      label: 'Responded',
      variant: 'secondary' as const,
      icon: MessageSquare,
      className: 'bg-green-500/10 text-green-500 border-green-500/20 hover:bg-green-500/20',
    },
    resolved: {
      label: 'Resolved',
      variant: 'secondary' as const,
      icon: CheckCircle2,
      className: 'bg-gray-500/10 text-gray-500 border-gray-500/20 hover:bg-gray-500/20',
    },
  };

  const { label, icon: Icon, className: configClassName } = config[status];

  return (
    <Badge
      variant="secondary"
      className={cn('gap-1.5 font-medium', configClassName, className)}
    >
      {showIcon && <Icon className="w-3 h-3" />}
      {label}
    </Badge>
  );
}
