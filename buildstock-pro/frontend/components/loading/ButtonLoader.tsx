'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Button Loader - Loading state for buttons
 * Used inside buttons during async operations
 */

export interface ButtonLoaderProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function ButtonLoader({ size = 'md', className }: ButtonLoaderProps) {
  const sizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  return <Loader2 className={cn('animate-spin', sizeClasses[size], className)} />;
}

// Full button with loading state
export interface LoadingButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  loadingText?: string;
  children: React.ReactNode;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

export function LoadingButton({
  loading = false,
  loadingText,
  children,
  disabled,
  className,
  ...props
}: LoadingButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        'disabled:pointer-events-none disabled:opacity-50',
        className
      )}
      {...props}
    >
      {loading && <ButtonLoader size="md" />}
      {loading && loadingText ? loadingText : children}
    </button>
  );
}

export default ButtonLoader;
