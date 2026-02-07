'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CreateContactRequest, Branch } from '@/src/types/merchantContact';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ContactMethodSelector } from './ContactMethodSelector';
import { PostcodeLookup } from './PostcodeLookup';
import { BranchFinder } from './BranchFinder';
import { merchantContactApi } from '@/src/lib/api/merchantContact';
import { Loader2, Send, Package, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface ContactFormProps {
  merchantId: string;
  merchantName?: string;
  productId?: string;
  productName?: string;
  initialBranchId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
  className?: string;
  showBranchFinder?: boolean;
}

const INQUIRY_TYPES = [
  { value: 'product_question', label: 'Product Question', description: 'Ask about product details, specs, or usage' },
  { value: 'stock_check', label: 'Stock Check', description: 'Check availability at a local branch' },
  { value: 'bulk_quote', label: 'Bulk Quote', description: 'Request pricing for large quantities' },
  { value: 'general', label: 'General Inquiry', description: 'Other questions or feedback' },
] as const;

export function ContactForm({
  merchantId,
  merchantName,
  productId,
  productName,
  initialBranchId,
  onSuccess,
  onCancel,
  className = '',
  showBranchFinder = true,
}: ContactFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Form state
  const [inquiryType, setInquiryType] = useState<'product_question' | 'stock_check' | 'bulk_quote' | 'general'>('product_question');
  const [message, setMessage] = useState('');
  const [contactMethod, setContactMethod] = useState<'email' | 'phone' | 'visit'>('email');
  const [userEmail, setUserEmail] = useState('');
  const [userPhone, setUserPhone] = useState('');
  const [userName, setUserName] = useState('');
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
  const [internalShowBranchFinder, setInternalShowBranchFinder] = useState(false);

  // Pre-fill with user data from localStorage or session
  useEffect(() => {
    // Try to get user data from localStorage
    const storedEmail = localStorage.getItem('user_email');
    const storedName = localStorage.getItem('user_name');
    const storedPhone = localStorage.getItem('user_phone');

    if (storedEmail) setUserEmail(storedEmail);
    if (storedName) setUserName(storedName);
    if (storedPhone) setUserPhone(storedPhone);

    // Set initial message if product is provided
    if (productName) {
      setMessage(`Hi, I have a question about: ${productName}\n\n`);
    }
  }, [productName]);

  // Auto-set inquiry type to stock_check if branch is selected
  useEffect(() => {
    if (selectedBranch && inquiryType !== 'stock_check') {
      setInquiryType('stock_check');
    }
  }, [selectedBranch, inquiryType]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!userName.trim()) {
      toast.error('Name required', {
        description: 'Please enter your name',
      });
      return;
    }

    if (!userEmail.trim()) {
      toast.error('Email required', {
        description: 'Please enter your email address',
      });
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userEmail)) {
      toast.error('Invalid email', {
        description: 'Please enter a valid email address',
      });
      return;
    }

    if (contactMethod === 'phone' && !userPhone.trim()) {
      toast.error('Phone number required', {
        description: 'Please enter your phone number for callback',
      });
      return;
    }

    if (!message.trim()) {
      toast.error('Message required', {
        description: 'Please enter your inquiry message',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const data: CreateContactRequest = {
        merchant_id: merchantId,
        branch_id: selectedBranch?.id,
        scraped_price_id: productId,
        product_name: productName,
        inquiry_type: inquiryType,
        message: message.trim(),
        user_name: userName.trim(),
        user_email: userEmail.trim(),
        user_phone: userPhone.trim() || undefined,
      };

      const result = await merchantContactApi.createContactRequest(data);

      // Store user data for next time
      localStorage.setItem('user_email', userEmail.trim());
      localStorage.setItem('user_name', userName.trim());
      if (userPhone.trim()) {
        localStorage.setItem('user_phone', userPhone.trim());
      }

      setIsSuccess(true);

      toast.success('Inquiry submitted!', {
        description: 'Your message has been sent to the merchant. They will respond shortly.',
      });

      // Reset form or redirect after success
      setTimeout(() => {
        if (onSuccess) {
          onSuccess();
        } else {
          router.push(`/contact-requests/${result.id}`);
        }
      }, 1500);
    } catch (error) {
      console.error('Error submitting contact request:', error);
      toast.error('Failed to submit inquiry', {
        description: error instanceof Error ? error.message : 'Please try again later',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <Card className={className}>
        <CardContent className="p-8 text-center">
          <div className="flex flex-col items-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">Inquiry Submitted!</h3>
              <p className="text-muted-foreground">
                Your message has been sent to {merchantName || 'the merchant'}. They will respond to {contactMethod === 'email' ? 'your email' : contactMethod === 'phone' ? 'your phone' : 'you at the branch'} shortly.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Send className="w-5 h-5" />
          Contact {merchantName || 'Merchant'}
        </CardTitle>
        {productName && (
          <div className="flex items-center gap-2 mt-2">
            <Package className="w-4 h-4 text-muted-foreground" />
            <Badge variant="outline">{productName}</Badge>
          </div>
        )}
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Inquiry Type */}
          <div className="space-y-3">
            <Label>What is your inquiry about?</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {INQUIRY_TYPES.map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => setInquiryType(type.value)}
                  className={cn(
                    'text-left p-3 rounded-lg border transition-all',
                    inquiryType === type.value
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  )}
                >
                  <p className="font-medium text-sm">{type.label}</p>
                  <p className="text-xs text-muted-foreground mt-1">{type.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Message */}
          <div className="space-y-2">
            <Label htmlFor="message">Your Message *</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Describe your inquiry in detail..."
              rows={5}
              className="resize-none"
              required
            />
          </div>

          {/* Branch Finder (optional) */}
          {showBranchFinder && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Find a Branch (Optional)</Label>
                {selectedBranch && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedBranch(null)}
                  >
                    Clear Selection
                  </Button>
                )}
              </div>

              {selectedBranch ? (
                <Card className="border-primary/20 bg-primary/5">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{selectedBranch.name}</p>
                        <p className="text-xs text-muted-foreground">{selectedBranch.address}</p>
                        {selectedBranch.distance_km && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {merchantContactApi.formatDistance(selectedBranch.distance_km)}
                          </p>
                        )}
                      </div>
                      <Badge variant="secondary">Selected</Badge>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <>
                  {!showBranchFinder ? (
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      onClick={() => setInternalShowBranchFinder(true)}
                    >
                      Find a Branch Near Me
                    </Button>
                  ) : (
                    <BranchFinder
                      merchantId={merchantId}
                      merchantName={merchantName}
                      onSelectBranch={(branch) => {
                        setSelectedBranch(branch);
                        setInternalShowBranchFinder(false);
                      }}
                    />
                  )}
                </>
              )}
            </div>
          )}

          {/* Contact Method */}
          <div className="space-y-2">
            <Label>How would you like to be contacted?</Label>
            <ContactMethodSelector value={contactMethod} onChange={setContactMethod} />
          </div>

          {/* User Details */}
          <div className="space-y-4 pt-4 border-t">
            <h3 className="font-medium">Your Contact Information</h3>

            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="Your full name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
                placeholder="your.email@example.com"
                required
              />
            </div>

            {contactMethod === 'phone' && (
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={userPhone}
                  onChange={(e) => setUserPhone(e.target.value)}
                  placeholder="07123 456789"
                  required={contactMethod === 'phone'}
                />
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex gap-3 pt-4">
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isSubmitting}
                className="flex-1"
              >
                Cancel
              </Button>
            )}
            <Button
              type="submit"
              disabled={isSubmitting}
              className={cn('flex-1', !onCancel && 'w-full')}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Send Inquiry
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
