'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Page Loader - Full page loading spinner
 * Used when loading entire pages or during major operations
 */

export interface PageLoaderProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function PageLoader({ message, size = 'md', className }: PageLoaderProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
  };

  return (
    <div
      className={cn(
        'fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm',
        className
      )}
    >
      <Loader2 className={cn('animate-spin text-primary', sizeClasses[size])} />
      {message && (
        <p className="mt-4 text-sm text-gray-600 dark:text-gray-400 animate-pulse">{message}</p>
      )}
    </div>
  );
}

// Centered loader (for use within containers)
export interface CenteredLoaderProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function CenteredLoader({ message, size = 'md', className }: CenteredLoaderProps) {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-14 h-14',
  };

  return (
    <div className={cn('flex flex-col items-center justify-center py-12', className)}>
      <Loader2 className={cn('animate-spin text-primary', sizeClasses[size])} />
      {message && (
        <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">{message}</p>
      )}
    </div>
  );
}

export default PageLoader;
