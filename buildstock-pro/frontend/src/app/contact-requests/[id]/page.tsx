'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { MerchantContactRequest } from '@/types/merchantContact';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ContactRequestDetails } from '@/components/merchant-contact/ContactRequestDetails';
import { Loader2 } from 'lucide-react';
import { merchantContactApi } from '@/lib/api/merchantContact';
import { toast } from 'sonner';

export default function ContactRequestDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [request, setRequest] = useState<MerchantContactRequest | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [responseMessage, setResponseMessage] = useState('');

  const fetchRequest = async () => {
    setIsLoading(true);
    try {
      const data = await merchantContactApi.getContactById(params.id as string);
      setRequest(data);
    } catch (error) {
      console.error('Error fetching contact request:', error);
      toast.error('Failed to load contact request', {
        description: error instanceof Error ? error.message : 'Please try again later',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (params.id) {
      fetchRequest();
    }
  }, [params.id]);

  const handleAddResponse = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!responseMessage.trim()) {
      toast.error('Message required', {
        description: 'Please enter your response message',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await merchantContactApi.addResponse(params.id as string, {
        responder_name: 'You', // In a real app, this would be the authenticated user's name
        response_message: responseMessage.trim(),
      });

      toast.success('Response added', {
        description: 'Your response has been sent',
      });

      setResponseMessage('');
      fetchRequest(); // Refresh to show the new response
    } catch (error) {
      console.error('Error adding response:', error);
      toast.error('Failed to add response', {
        description: error instanceof Error ? error.message : 'Please try again later',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card>
          <CardContent className="p-12 flex items-center justify-center">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">Loading contact request details...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card>
          <CardContent className="p-12 text-center">
            <h2 className="text-xl font-semibold mb-2">Contact Request Not Found</h2>
            <p className="text-muted-foreground mb-6">
              The contact request you're looking for doesn't exist or you don't have access to it.
            </p>
            <div className="flex gap-3 justify-center">
              <Button variant="outline" onClick={() => router.back()}>
                Go Back
              </Button>
              <Button onClick={() => router.push('/contact-requests')}>
                View All Requests
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <ContactRequestDetails request={request} />

      {/* Add Response Form (for merchants/admins) */}
      <Card className="mt-6">
        <CardHeader>
          <h2 className="text-lg font-semibold">Add a Response</h2>
          <p className="text-sm text-muted-foreground">
            Respond to this inquiry (merchant/admin only)
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddResponse} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="response">Your Response *</Label>
              <Textarea
                id="response"
                value={responseMessage}
                onChange={(e) => setResponseMessage(e.target.value)}
                placeholder="Type your response to the customer..."
                rows={5}
                required
              />
            </div>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                'Send Response'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
