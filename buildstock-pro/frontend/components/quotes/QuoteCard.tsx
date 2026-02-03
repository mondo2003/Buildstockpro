'use client';

import Link from 'next/link';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { QuoteStatusBadge } from './QuoteStatusBadge';
import { Quote } from '@/types/quote';
import { Calendar, Package, Building2, ChevronRight, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface QuoteCardProps {
  quote: Quote;
  className?: string;
}

export function QuoteCard({ quote, className }: QuoteCardProps) {
  // Calculate estimated total
  const estimatedTotal = quote.items?.reduce((sum, item) => sum + item.total_price, 0) || 0;

  // Count unique retailers
  const retailerCount = new Set(quote.items?.map(item => item.retailer)).size;

  // Check if quote is expired
  const isExpired = quote.expires_at && new Date(quote.expires_at) < new Date();

  // Format dates
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(date);
  };

  return (
    <Link href={`/quotes/${quote.id}`}>
      <Card
        className={cn(
          'group transition-all duration-300 hover:shadow-lg hover:border-primary/50 cursor-pointer',
          isExpired && 'opacity-60',
          className
        )}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-lg line-clamp-1 group-hover:text-primary transition-colors">
                {quote.title}
              </h3>
              <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                <Building2 className="w-4 h-4 flex-shrink-0" />
                <span className="line-clamp-1">{quote.delivery_location}</span>
              </div>
            </div>
            <QuoteStatusBadge status={isExpired ? 'expired' : quote.status} />
          </div>
        </CardHeader>

        <CardContent className="space-y-3 pb-3">
          {/* Quote Details */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Package className="w-3.5 h-3.5" />
                <span>Items</span>
              </div>
              <p className="font-semibold text-lg">
                {quote.items?.length || 0}
              </p>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Building2 className="w-3.5 h-3.5" />
                <span>Retailers</span>
              </div>
              <p className="font-semibold text-lg">
                {retailerCount}
              </p>
            </div>
          </div>

          {/* Estimated Total */}
          {estimatedTotal > 0 && (
            <div className="pt-3 border-t">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Estimated Total</span>
                <span className="text-xl font-bold">
                  £{estimatedTotal.toFixed(2)}
                </span>
              </div>
            </div>
          )}

          {/* Response Count */}
          {quote.status === 'sent' && (quote.responses?.length || 0) > 0 && (
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">
                {quote.responses?.length || 0} response{(quote.responses?.length || 0) !== 1 ? 's' : ''}
              </Badge>
            </div>
          )}
        </CardContent>

        <CardFooter className="pt-3 border-t">
          <div className="flex items-center justify-between w-full text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              <span>Created {formatDate(quote.created_at)}</span>
            </div>
            {quote.response_deadline && (
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                <span>
                  Deadline {formatDate(quote.response_deadline)}
                </span>
              </div>
            )}
          </div>
        </CardFooter>

        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none rounded-lg" />

        <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="bg-white shadow-lg rounded-full p-2">
            <ChevronRight className="w-5 h-5 text-primary" />
          </div>
        </div>
      </Card>
    </Link>
  );
}
