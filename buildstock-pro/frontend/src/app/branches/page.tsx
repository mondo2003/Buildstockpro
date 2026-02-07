'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/card';
import { BranchFinder } from '@/src/components/merchant-contact/BranchFinder';
import { MapPin, Search } from 'lucide-react';
import { toast } from 'sonner';

export default function BranchesPage() {
  const [selectedMerchantId, setSelectedMerchantId] = useState<string>('');
  const [merchantName, setMerchantName] = useState<string>('');
  const [showFinder, setShowFinder] = useState(false);

  // Demo merchant data - in a real app, this would come from an API
  const merchants = [
    { id: 'merchant-1', name: 'Screwfix' },
    { id: 'merchant-2', name: 'Toolstation' },
    { id: 'merchant-3', name: 'Wickes' },
    { id: 'merchant-4', name: 'B&Q' },
    { id: 'merchant-5', name: 'Homebase' },
  ];

  const handleSelectMerchant = (merchantId: string, name: string) => {
    setSelectedMerchantId(merchantId);
    setMerchantName(name);
    setShowFinder(true);
  };

  const handleBack = () => {
    setShowFinder(false);
    setSelectedMerchantId('');
    setMerchantName('');
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <MapPin className="w-8 h-8" />
          Find Merchant Branches
        </h1>
        <p className="text-muted-foreground">
          Locate your nearest merchant branches and get directions
        </p>
      </div>

      {!showFinder ? (
        /* Merchant Selection */
        <Card>
          <CardHeader>
            <CardTitle>Select a Merchant</CardTitle>
            <p className="text-sm text-muted-foreground">
              Choose a merchant to find their nearest branches
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {merchants.map((merchant) => (
                <button
                  key={merchant.id}
                  onClick={() => handleSelectMerchant(merchant.id, merchant.name)}
                  className="p-4 border rounded-lg hover:border-primary hover:bg-primary/5 transition-all text-left group"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold group-hover:text-primary transition-colors">
                        {merchant.name}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-1">View branches</p>
                    </div>
                    <Search className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : (
        /* Branch Finder */
        <div className="space-y-4">
          <Button variant="outline" onClick={handleBack}>
            ← Back to Merchants
          </Button>
          <BranchFinder
            merchantId={selectedMerchantId}
            merchantName={merchantName}
            className="w-full"
          />
        </div>
      )}

      {/* Info Card */}
      <Card className="mt-8 bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
        <CardContent className="p-6">
          <h3 className="font-semibold mb-2">How it works</h3>
          <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
            <li>Select a merchant from the list above</li>
            <li>Enter your postcode or use your current location</li>
            <li>Adjust the search radius if needed</li>
            <li>View branches sorted by distance with contact details</li>
            <li>Get directions or call the branch directly</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}
