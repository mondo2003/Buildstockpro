'use client';

import { useState, useEffect } from 'react';
import { Branch } from '@/types/merchantContact';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { PostcodeLookup } from './PostcodeLookup';
import { BranchCard } from './BranchCard';
import { merchantContactApi } from '@/lib/api/merchantContact';
import { MapPin, Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface BranchFinderProps {
  merchantId: string;
  merchantName?: string;
  onSelectBranch?: (branch: Branch) => void;
  selectedBranchId?: string;
  className?: string;
}

const RADIUS_OPTIONS = [
  { value: 5, label: '5 km' },
  { value: 10, label: '10 km' },
  { value: 25, label: '25 km' },
  { value: 50, label: '50 km' },
];

export function BranchFinder({
  merchantId,
  merchantName,
  onSelectBranch,
  selectedBranchId,
  className = '',
}: BranchFinderProps) {
  const [postcode, setPostcode] = useState('');
  const [radius, setRadius] = useState(25);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const searchBranches = async () => {
    if (!postcode.trim()) {
      toast.error('Postcode required', {
        description: 'Please enter a postcode to find branches',
      });
      return;
    }

    const validation = merchantContactApi.validateUKPostcode(postcode);
    if (!validation.valid) {
      toast.error('Invalid postcode', {
        description: validation.error || 'Please enter a valid UK postcode',
      });
      return;
    }

    setIsLoading(true);
    setHasSearched(true);

    try {
      const results = await merchantContactApi.findNearestBranches(merchantId, {
        postcode: validation.postcode || postcode,
        radius_km: radius,
      });

      setBranches(results);

      if (results.length === 0) {
        toast.info('No branches found', {
          description: `No branches found within ${radius}km of ${validation.postcode || postcode}. Try increasing the search radius.`,
        });
      } else {
        toast.success('Branches found', {
          description: `Found ${results.length} branch${results.length > 1 ? 'es' : ''} near ${validation.postcode || postcode}`,
        });
      }
    } catch (error) {
      console.error('Error finding branches:', error);
      toast.error('Failed to find branches', {
        description: error instanceof Error ? error.message : 'Please try again later',
      });
      setBranches([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePostcodeSubmit = (newPostcode: string) => {
    setPostcode(newPostcode);
    if (newPostcode) {
      searchBranches();
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="w-5 h-5" />
          Find Nearby Branches
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Postcode Search */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Your Location</label>
          <PostcodeLookup
            onPostcodeChange={setPostcode}
            initialValue={postcode}
            placeholder="Enter your postcode (e.g., SW1A 1AA)"
          />
        </div>

        {/* Radius Slider */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Search Radius</label>
            <Badge variant="secondary">{radius} km</Badge>
          </div>
          <Slider
            value={[radius]}
            onValueChange={(value) => setRadius(value[0])}
            min={5}
            max={50}
            step={5}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            {RADIUS_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => setRadius(option.value)}
                className={`hover:text-foreground transition-colors ${
                  radius === option.value ? 'text-primary font-medium' : ''
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Search Button */}
        <Button
          onClick={searchBranches}
          disabled={!postcode || isLoading}
          className="w-full"
          size="lg"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Searching...
            </>
          ) : (
            <>
              <MapPin className="w-4 h-4 mr-2" />
              Find Branches
            </>
          )}
        </Button>

        {/* Results */}
        {hasSearched && !isLoading && (
          <div className="space-y-4">
            {branches.length > 0 ? (
              <>
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">
                    {branches.length} Branch{branches.length > 1 ? 'es' : ''} Found
                  </h3>
                  <Badge variant="secondary">
                    Sorted by distance
                  </Badge>
                </div>

                <div className="space-y-3">
                  {branches.map((branch) => (
                    <BranchCard
                      key={branch.id}
                      branch={branch}
                      merchantName={merchantName}
                      onSelect={onSelectBranch}
                      showSelectButton={!!onSelectBranch}
                      className={selectedBranchId === branch.id ? 'ring-2 ring-primary' : ''}
                    />
                  ))}
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <AlertCircle className="w-12 h-12 text-muted-foreground mb-3" />
                <h3 className="font-semibold mb-1">No branches found</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  No branches found within {radius}km of your postcode. Try increasing the search radius.
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
