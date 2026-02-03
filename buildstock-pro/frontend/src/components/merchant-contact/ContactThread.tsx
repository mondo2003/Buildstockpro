'use client';

import { MerchantContactRequest, MerchantContactResponse } from '@/types/merchantContact';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User, Building2, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ContactStatusBadge } from './ContactStatusBadge';

interface ContactThreadProps {
  request: MerchantContactRequest;
  className?: string;
}

export function ContactThread({ request, className = '' }: ContactThreadProps) {
  return (
    <div className={`space-y-4 ${className}`}>
      {/* Original Request */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="p-4 space-y-3">
          {/* Header */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-2">
              <User className="w-5 h-5 text-primary" />
              <div>
                <p className="font-semibold">{request.user_name}</p>
                <p className="text-xs text-muted-foreground">{request.user_email}</p>
              </div>
            </div>
            <ContactStatusBadge status={request.status} />
          </div>

          {/* Metadata */}
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="capitalize">
              {request.inquiry_type.replace('_', ' ')}
            </Badge>
            {request.product_name && (
              <Badge variant="outline">{request.product_name}</Badge>
            )}
            <Badge variant="outline" className="gap-1">
              <Clock className="w-3 h-3" />
              {formatDistanceToNow(new Date(request.created_at), { addSuffix: true })}
            </Badge>
          </div>

          {/* Message */}
          <div className="bg-background rounded-lg p-3">
            <p className="text-sm whitespace-pre-wrap">{request.message}</p>
          </div>

          {/* Contact Method */}
          {request.contact_method && (
            <p className="text-xs text-muted-foreground">
              Preferred contact: <span className="font-medium capitalize">{request.contact_method}</span>
            </p>
          )}
        </CardContent>
      </Card>

      {/* Responses */}
      {request.responses && request.responses.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-semibold text-sm text-muted-foreground">
            Responses ({request.responses.length})
          </h3>
          {request.responses.map((response) => (
            <Card key={response.id} className="border-accent/20 bg-accent/5">
              <CardContent className="p-4 space-y-3">
                {/* Header */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-accent" />
                    <div>
                      <p className="font-semibold">{response.responder_name}</p>
                      <p className="text-xs text-muted-foreground">Merchant Response</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="gap-1">
                    <Clock className="w-3 h-3" />
                    {formatDistanceToNow(new Date(response.created_at), { addSuffix: true })}
                  </Badge>
                </div>

                {/* Response Message */}
                <div className="bg-background rounded-lg p-3">
                  <p className="text-sm whitespace-pre-wrap">{response.response_message}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* No responses */}
      {(!request.responses || request.responses.length === 0) && (
        <Card className="border-dashed">
          <CardContent className="p-6 text-center">
            <p className="text-sm text-muted-foreground">
              No responses yet. The merchant will respond to your inquiry soon.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
