'use client';

import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardFooter } from '@/components/ui/card';
import { cn } from '@/lib/utils';

/**
 * Card Loader - Skeleton/card placeholder loader
 * Used when loading product cards or any card-based content
 */

export interface CardLoaderProps {
  count?: number;
  showImage?: boolean;
  showFooter?: boolean;
  className?: string;
}

export function CardLoader({
  count = 1,
  showImage = true,
  showFooter = true,
  className,
}: CardLoaderProps) {
  const cards = Array.from({ length: count }, (_, i) => i);

  return (
    <>
      {cards.map((i) => (
        <Card key={i} className={cn('overflow-hidden', className)}>
          {showImage && (
            <Skeleton className="w-full aspect-video rounded-t-lg" />
          )}

          <CardHeader className="pb-3">
            <Skeleton className="h-6 w-3/4 mb-2" />
            <Skeleton className="h-4 w-full mb-1" />
            <Skeleton className="h-4 w-1/2" />
          </CardHeader>

          <CardContent className="space-y-3 pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-12" />
              </div>
              <Skeleton className="h-6 w-16 rounded-full" />
            </div>

            <div className="flex items-start gap-2">
              <Skeleton className="h-4 w-4 mt-0.5" />
              <div className="flex-1 space-y-1">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-3 w-2/3" />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Skeleton className="h-2 w-2 rounded-full" />
              <Skeleton className="h-4 w-24" />
            </div>
          </CardContent>

          {showFooter && (
            <CardFooter className="pt-3 border-t">
              <div className="flex items-center justify-between w-full">
                <div className="space-y-1">
                  <Skeleton className="h-6 w-20" />
                  <Skeleton className="h-3 w-16" />
                </div>
                <div className="flex gap-2">
                  <Skeleton className="h-9 w-9" />
                  <Skeleton className="h-9 w-24" />
                </div>
              </div>
            </CardFooter>
          )}
        </Card>
      ))}
    </>
  );
}

// Compact card loader (for list view)
export interface CompactCardLoaderProps {
  count?: number;
  className?: string;
}

export function CompactCardLoader({ count = 1, className }: CompactCardLoaderProps) {
  const cards = Array.from({ length: count }, (_, i) => i);

  return (
    <>
      {cards.map((i) => (
        <Card key={i} className={className}>
          <CardContent className="p-4">
            <div className="flex gap-4">
              <Skeleton className="w-24 h-24 rounded-lg flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-3/4" />
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-3 w-8" />
                </div>
                <div className="flex items-center justify-between">
                  <Skeleton className="h-5 w-20" />
                  <Skeleton className="h-6 w-20 rounded-full" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </>
  );
}

export default CardLoader;
