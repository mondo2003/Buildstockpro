'use client';

import Link from 'next/link';
import { MerchantContactRequest } from '@/src/types/merchantContact';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ContactStatusBadge } from './ContactStatusBadge';
import { Building2, Package, MessageSquare, Clock, ChevronRight } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

interface ContactRequestCardProps {
  request: MerchantContactRequest;
  className?: string;
}

export function ContactRequestCard({ request, className = '' }: ContactRequestCardProps) {
  const responseCount = request.responses?.length || 0;

  return (
    <Link href={`/contact-requests/${request.id}`}>
      <Card
        className={cn(
          'group transition-all hover:shadow-md hover:border-primary/50 cursor-pointer',
          className
        )}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                {request.product_name && (
                  <>
                    <Package className="w-4 h-4 text-muted-foreground" />
                    <h3 className="font-semibold truncate">{request.product_name}</h3>
                  </>
                )}
                {!request.product_name && (
                  <>
                    <Building2 className="w-4 h-4 text-muted-foreground" />
                    <h3 className="font-semibold">General Inquiry</h3>
                  </>
                )}
              </div>
              {request.merchant && (
                <p className="text-sm text-muted-foreground">{request.merchant.name}</p>
              )}
            </div>
            <ContactStatusBadge status={request.status} />
          </div>
        </CardHeader>

        <CardContent className="pb-3">
          {/* Inquiry Type Badge */}
          <Badge variant="outline" className="capitalize mb-2">
            {request.inquiry_type.replace('_', ' ')}
          </Badge>

          {/* Message Preview */}
          <p className="text-sm text-muted-foreground line-clamp-2">
            {request.message}
          </p>
        </CardContent>

        <CardFooter className="pt-3 border-t">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {formatDistanceToNow(new Date(request.created_at), { addSuffix: true })}
              </div>
              {responseCount > 0 && (
                <div className="flex items-center gap-1">
                  <MessageSquare className="w-3 h-3" />
                  {responseCount} response{responseCount > 1 ? 's' : ''}
                </div>
              )}
            </div>

            <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
}
