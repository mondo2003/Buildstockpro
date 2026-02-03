'use client';

import { useState } from 'react';
import { MerchantContactRequest, Branch } from '@/types/merchantContact';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ContactStatusBadge } from './ContactStatusBadge';
import { ContactThread } from './ContactThread';
import { BranchCard } from './BranchCard';
import { Building2, Package, MapPin, User, Mail, Phone, Clock, ArrowLeft } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useRouter } from 'next/navigation';

interface ContactRequestDetailsProps {
  request: MerchantContactRequest;
  onClose?: () => void;
  className?: string;
}

export function ContactRequestDetails({ request, onClose, className = '' }: ContactRequestDetailsProps) {
  const router = useRouter();
  const [showBranch, setShowBranch] = useState(true);

  const handleBack = () => {
    if (onClose) {
      onClose();
    } else {
      router.back();
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleBack}
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">Contact Request Details</h1>
          <p className="text-sm text-muted-foreground mt-1">
            ID: {request.id}
          </p>
        </div>
        <ContactStatusBadge status={request.status} showIcon />
      </div>

      {/* Main Info Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            {request.product_name || 'General Inquiry'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Merchant Info */}
          {request.merchant && (
            <div className="flex items-center gap-2 text-sm">
              <Building2 className="w-4 h-4 text-muted-foreground" />
              <span className="font-medium">{request.merchant.name}</span>
            </div>
          )}

          {/* Inquiry Type */}
          <div>
            <p className="text-xs text-muted-foreground mb-1">Inquiry Type</p>
            <Badge variant="outline" className="capitalize">
              {request.inquiry_type.replace('_', ' ')}
            </Badge>
          </div>

          {/* Created At */}
          <div>
            <p className="text-xs text-muted-foreground mb-1">Submitted</p>
            <div className="flex items-center gap-2 text-sm">
              <Clock className="w-4 h-4 text-muted-foreground" />
              {new Date(request.created_at).toLocaleString('en-GB', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
              <span className="text-muted-foreground">
                ({formatDistanceToNow(new Date(request.created_at), { addSuffix: true })})
              </span>
            </div>
          </div>

          {/* Contact Method */}
          {request.contact_method && (
            <div>
              <p className="text-xs text-muted-foreground mb-1">Preferred Contact Method</p>
              <Badge variant="secondary" className="capitalize">
                {request.contact_method}
              </Badge>
            </div>
          )}
        </CardContent>
      </Card>

      {/* User Info Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <User className="w-5 h-5" />
            Your Contact Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2 text-sm">
            <User className="w-4 h-4 text-muted-foreground" />
            <span className="font-medium">{request.user_name}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Mail className="w-4 h-4 text-muted-foreground" />
            <a
              href={`mailto:${request.user_email}`}
              className="hover:text-primary transition-colors"
            >
              {request.user_email}
            </a>
          </div>
          {request.user_phone && (
            <div className="flex items-center gap-2 text-sm">
              <Phone className="w-4 h-4 text-muted-foreground" />
              <a
                href={`tel:${request.user_phone}`}
                className="hover:text-primary transition-colors"
              >
                {request.user_phone}
              </a>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Branch Info */}
      {request.branch && showBranch && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <MapPin className="w-5 h-5" />
              Selected Branch
            </CardTitle>
          </CardHeader>
          <CardContent>
            <BranchCard branch={request.branch} merchantName={request.merchant?.name} showSelectButton={false} />
          </CardContent>
        </Card>
      )}

      {/* Conversation Thread */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Conversation</CardTitle>
        </CardHeader>
        <CardContent>
          <ContactThread request={request} />
        </CardContent>
      </Card>
    </div>
  );
}
