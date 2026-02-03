'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { QuoteStatusBadge } from './QuoteStatusBadge';
import { QuoteItemList } from './QuoteItemList';
import { Quote } from '@/types/quote';
import {
  Calendar,
  Clock,
  MapPin,
  Building2,
  User,
  Mail,
  MessageSquare,
  DollarSign,
  Trash2,
  Send,
  Edit,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface QuoteDetailsProps {
  quote: Quote;
  onEdit?: () => void;
  onCancel?: () => void;
  onSend?: () => void;
  onRemoveItem?: (itemId: string) => void;
  className?: string;
}

export function QuoteDetails({
  quote,
  onEdit,
  onCancel,
  onSend,
  onRemoveItem,
  className,
}: QuoteDetailsProps) {
  const estimatedTotal = quote.items?.reduce((sum, item) => sum + item.total_price, 0) || 0;

  const formatDate = (dateString: string | null) => {
    if (!dateString) return null;
    return new Intl.DateTimeFormat('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(new Date(dateString));
  };

  const isExpired = quote.expires_at && new Date(quote.expires_at) < new Date();

  return (
    <div className={className}>
      {/* Header Card */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <CardTitle className="text-2xl">{quote.title}</CardTitle>
                <QuoteStatusBadge status={isExpired ? 'expired' : quote.status} />
              </div>
              <p className="text-sm text-muted-foreground">
                Quote ID: {quote.id}
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              {quote.status === 'pending' && onSend && (
                <Button
                  onClick={onSend}
                  size="sm"
                  variant="default"
                >
                  <Send className="w-4 h-4 mr-2" />
                  Send Quote
                </Button>
              )}
              {quote.status === 'pending' && onEdit && (
                <Button
                  onClick={onEdit}
                  size="sm"
                  variant="outline"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
              )}
              {(quote.status === 'pending' || quote.status === 'sent') && onCancel && (
                <Button
                  onClick={onCancel}
                  size="sm"
                  variant="destructive"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Delivery Details */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium">
                <MapPin className="w-4 h-4 text-primary" />
                <span>Delivery Location</span>
              </div>
              <p className="text-sm ml-6">{quote.delivery_location}</p>
              <p className="text-sm text-muted-foreground ml-6">{quote.delivery_postcode}</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Calendar className="w-4 h-4 text-primary" />
                <span>Dates</span>
              </div>
              <div className="ml-6 space-y-1">
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground">Created:</span>
                  <span>{formatDate(quote.created_at)}</span>
                  <span className="text-xs text-muted-foreground">
                    ({formatDistanceToNow(new Date(quote.created_at), { addSuffix: true })})
                  </span>
                </div>
                {quote.response_deadline && (
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="w-3.5 h-3.5" />
                    <span className="text-muted-foreground">Deadline:</span>
                    <span>{formatDate(quote.response_deadline)}</span>
                  </div>
                )}
                {quote.expires_at && (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-muted-foreground">Expires:</span>
                    <span className={isExpired ? 'text-destructive' : ''}>
                      {formatDate(quote.expires_at)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Notes */}
          {quote.notes && (
            <div className="pt-4 border-t">
              <div className="flex items-center gap-2 text-sm font-medium mb-2">
                <MessageSquare className="w-4 h-4 text-primary" />
                <span>Notes</span>
              </div>
              <p className="text-sm ml-6 text-muted-foreground">{quote.notes}</p>
            </div>
          )}

          {/* Summary Stats */}
          <div className="pt-4 border-t">
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <p className="text-2xl font-bold">{quote.items?.length || 0}</p>
                <p className="text-xs text-muted-foreground">Items</p>
              </div>
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <p className="text-2xl font-bold">
                  {new Set(quote.items?.map(item => item.retailer)).size}
                </p>
                <p className="text-xs text-muted-foreground">Retailers</p>
              </div>
              <div className="text-center p-4 bg-primary/10 rounded-lg">
                <p className="text-2xl font-bold text-primary">£{estimatedTotal.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground">Est. Total</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quote Items */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-4">Quote Items</h3>
        <QuoteItemList
          items={quote.items || []}
          onRemove={quote.status === 'pending' ? onRemoveItem : undefined}
          editable={quote.status === 'pending'}
        />
      </div>

      {/* Quote Responses */}
      {quote.responses && quote.responses.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4">Responses ({quote.responses.length})</h3>
          <div className="space-y-3">
            {quote.responses.map((response) => (
              <Card key={response.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-primary" />
                        <p className="font-semibold">{response.responder_name}</p>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Mail className="w-3.5 h-3.5" />
                        <span>{response.responder_email}</span>
                      </div>
                    </div>
                    <Badge variant="secondary" className="text-sm">
                      <DollarSign className="w-3 h-3 mr-1" />
                      £{response.quoted_total.toFixed(2)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm mb-3">{response.response_message}</p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>
                        Received {formatDate(response.created_at)}
                      </span>
                    </div>
                    {response.valid_until && (
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>
                          Valid until {formatDate(response.valid_until)}
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
