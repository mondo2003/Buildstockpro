'use client';

import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

/**
 * Table Loader - Table skeleton loader
 * Used when loading table data for quotes, orders, contact requests, etc.
 */

export interface TableLoaderProps {
  rows?: number;
  columns?: number;
  showHeader?: boolean;
  className?: string;
}

export function TableLoader({
  rows = 5,
  columns = 4,
  showHeader = true,
  className,
}: TableLoaderProps) {
  return (
    <div className={cn('w-full', className)}>
      {/* Table Header */}
      {showHeader && (
        <div className="flex gap-4 pb-3 border-b mb-3">
          {Array.from({ length: columns }).map((_, i) => (
            <Skeleton key={`header-${i}`} className="h-5 flex-1" />
          ))}
        </div>
      )}

      {/* Table Rows */}
      <div className="space-y-3">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={`row-${rowIndex}`} className="flex gap-4 items-center">
            {Array.from({ length: columns }).map((_, colIndex) => (
              <Skeleton key={`cell-${rowIndex}-${colIndex}`} className="h-10 flex-1" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

// Row loader (for infinite scroll tables)
export interface TableRowLoaderProps {
  columns?: number;
  className?: string;
}

export function TableRowLoader({ columns = 4, className }: TableRowLoaderProps) {
  return (
    <div className={cn('flex gap-4 items-center', className)}>
      {Array.from({ length: columns }).map((_, i) => (
        <Skeleton key={`cell-${i}`} className="h-10 flex-1" />
      ))}
    </div>
  );
}

// List loader (for list-style rows)
export interface ListLoaderProps {
  rows?: number;
  showAvatar?: boolean;
  className?: string;
}

export function ListLoader({ rows = 5, showAvatar = true, className }: ListLoaderProps) {
  return (
    <div className={cn('space-y-4', className)}>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={`row-${i}`} className="flex items-center gap-4">
          {showAvatar && <Skeleton className="w-12 h-12 rounded-full flex-shrink-0" />}
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
          <Skeleton className="h-8 w-20 flex-shrink-0" />
        </div>
      ))}
    </div>
  );
}

export default TableLoader;
