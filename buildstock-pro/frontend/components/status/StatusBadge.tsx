'use client';

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

/**
 * Reusable Status Badge Component
 * Used for displaying status indicators across Quotes, Bulk Orders, and Contact Requests
 */

// Status variants
export type StatusVariant = 'success' | 'warning' | 'error' | 'info' | 'neutral';

// Size variants
export type StatusSize = 'sm' | 'md' | 'lg';

// Special status types for quick usage
export type StatusType =
  | 'pending'
  | 'in-progress'
  | 'completed'
  | 'cancelled'
  | 'failed'
  | 'draft'
  | 'submitted'
  | 'approved'
  | 'rejected'
  | 'expired'
  | 'active'
  | 'archived'
  | 'custom';

export interface StatusBadgeProps {
  status: StatusType | string;
  variant?: StatusVariant;
  size?: StatusSize;
  showDot?: boolean;
  pulse?: boolean;
  className?: string;
  children?: React.ReactNode;
}

// Map status types to variants
const getStatusVariant = (status: StatusType | string): StatusVariant => {
  const statusLower = status.toLowerCase().replace(/[_\s]/g, '-');

  // Success states
  if (
    ['completed', 'approved', 'active', 'confirmed', 'paid', 'delivered', 'success'].includes(
      statusLower
    )
  ) {
    return 'success';
  }

  // Warning states
  if (
    ['pending', 'in-progress', 'in-progress', 'draft', 'submitted', 'expiring', 'low-stock'].includes(
      statusLower
    )
  ) {
    return 'warning';
  }

  // Error states
  if (
    ['cancelled', 'failed', 'rejected', 'expired', 'error', 'archived', 'out-of-stock'].includes(
      statusLower
    )
  ) {
    return 'error';
  }

  // Info states
  if (['new', 'info', 'processing', 'transit', 'scheduled'].includes(statusLower)) {
    return 'info';
  }

  // Default to neutral
  return 'neutral';
};

// Get variant colors
const getVariantClasses = (variant: StatusVariant, pulse: boolean) => {
  const baseClasses = 'font-medium transition-all';

  const variants = {
    success: cn(
      'bg-accent/10 text-accent border-accent/20',
      pulse && 'animate-pulse'
    ),
    warning: cn(
      'bg-orange-500/10 text-orange-600 border-orange-500/20 dark:text-orange-400',
      pulse && 'animate-pulse'
    ),
    error: cn(
      'bg-destructive/10 text-destructive border-destructive/20',
      pulse && 'animate-pulse'
    ),
    info: cn(
      'bg-blue-500/10 text-blue-600 border-blue-500/20 dark:text-blue-400',
      pulse && 'animate-pulse'
    ),
    neutral: cn('bg-muted text-muted-foreground border-border'),
  };

  return cn(baseClasses, variants[variant]);
};

// Get size classes
const getSizeClasses = (size: StatusSize) => {
  const sizes = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-sm px-2.5 py-1 gap-1.5',
    lg: 'text-base px-3 py-1.5 gap-2',
  };

  return sizes[size];
};

// Get dot size
const getDotSize = (size: StatusSize) => {
  const sizes = {
    sm: 'w-1.5 h-1.5',
    md: 'w-2 h-2',
    lg: 'w-2.5 h-2.5',
  };

  return sizes[size];
};

// Format status text for display
const formatStatusText = (status: string): string => {
  return status
    .split(/[_\s-]/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

export function StatusBadge({
  status,
  variant,
  size = 'md',
  showDot = true,
  pulse = false,
  className,
  children,
}: StatusBadgeProps) {
  // Auto-determine variant if not provided
  const detectedVariant = variant || getStatusVariant(status);

  // Determine if pulse should be applied
  const shouldPulse = pulse || ['pending', 'in-progress'].includes(status.toLowerCase());

  const classes = cn(
    'inline-flex items-center border rounded-full',
    getVariantClasses(detectedVariant, shouldPulse),
    getSizeClasses(size),
    className
  );

  return (
    <Badge className={classes} variant="outline">
      {showDot && (
        <span
          className={cn(
            'rounded-full bg-current',
            getDotSize(size),
            shouldPulse && 'animate-pulse'
          )}
        />
      )}
      {children || formatStatusText(status)}
    </Badge>
  );
}

// Pre-configured status badges for common use cases
export interface QuickStatusBadgeProps extends Omit<StatusBadgeProps, 'status'> {
  // Status is implicitly set by the component name
}

// Quote status badges
export function QuoteStatusBadge({ className, ...props }: QuickStatusBadgeProps) {
  return <StatusBadge status="draft" className={className} {...props} />;
}

// Order status badges
export function OrderStatusBadge({ status, ...props }: Omit<StatusBadgeProps, 'variant'>) {
  return <StatusBadge status={status} {...props} />;
}

// Contact request status badges
export function ContactStatusBadge({ status, ...props }: Omit<StatusBadgeProps, 'variant'>) {
  return <StatusBadge status={status} {...props} />;
}

// Stock status badge (special variant for product stock)
export interface StockStatusBadgeProps {
  level: 'in-stock' | 'low-stock' | 'out-of-stock';
  quantity?: number;
  size?: StatusSize;
  showDot?: boolean;
  className?: string;
}

export function StockStatusBadge({
  level,
  quantity,
  size = 'sm',
  showDot = true,
  className,
}: StockStatusBadgeProps) {
  const statusMap = {
    'in-stock': { text: 'In Stock', variant: 'success' as StatusVariant, pulse: true },
    'low-stock': { text: 'Low Stock', variant: 'warning' as StatusVariant, pulse: false },
    'out-of-stock': { text: 'Out of Stock', variant: 'error' as StatusVariant, pulse: false },
  };

  const config = statusMap[level];

  return (
    <StatusBadge
      status={quantity ? `${config.text} (${quantity})` : config.text}
      variant={config.variant}
      size={size}
      showDot={showDot}
      pulse={config.pulse}
      className={className}
    />
  );
}

// Export all components
export default {
  StatusBadge,
  QuoteStatusBadge,
  OrderStatusBadge,
  ContactStatusBadge,
  StockStatusBadge,
};
