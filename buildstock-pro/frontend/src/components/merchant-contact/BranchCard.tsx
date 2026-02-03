'use client';

import { Branch } from '@/types/merchantContact';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Phone, Mail, Navigation, ExternalLink } from 'lucide-react';
import { merchantContactApi } from '@/lib/api/merchantContact';
import { cn } from '@/lib/utils';

interface BranchCardProps {
  branch: Branch;
  merchantName?: string;
  onSelect?: (branch: Branch) => void;
  showSelectButton?: boolean;
  className?: string;
}

export function BranchCard({
  branch,
  merchantName,
  onSelect,
  showSelectButton = true,
  className = '',
}: BranchCardProps) {
  const { formatDistance } = merchantContactApi;

  const getDirections = () => {
    if (!branch.latitude || !branch.longitude) return null;

    // Use Google Maps for directions
    const url = `https://www.google.com/maps/dir/?api=1&destination=${branch.latitude},${branch.longitude}`;
    return url;
  };

  const openDirections = () => {
    const url = getDirections();
    if (url) {
      window.open(url, '_blank');
    }
  };

  return (
    <Card className={cn('transition-all hover:shadow-md', className)}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h3 className="font-semibold text-lg leading-tight">{branch.name}</h3>
            {merchantName && (
              <p className="text-sm text-muted-foreground mt-1">{merchantName}</p>
            )}
          </div>
          {branch.distance_km !== null && (
            <Badge variant="secondary" className="flex-shrink-0">
              {formatDistance(branch.distance_km)}
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-3 pb-3">
        {/* Address */}
        <div className="flex items-start gap-2">
          <MapPin className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm">{branch.address}</p>
            <p className="text-sm font-medium">{branch.postcode}</p>
          </div>
        </div>

        {/* Phone */}
        {branch.phone && (
          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            <a
              href={`tel:${branch.phone}`}
              className="text-sm hover:text-primary transition-colors"
            >
              {branch.phone}
            </a>
          </div>
        )}

        {/* Email */}
        {branch.email && (
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            <a
              href={`mailto:${branch.email}`}
              className="text-sm hover:text-primary transition-colors truncate"
            >
              {branch.email}
            </a>
          </div>
        )}
      </CardContent>

      <CardFooter className="pt-3 gap-2">
        {/* Call button */}
        {branch.phone && (
          <Button
            size="sm"
            variant="outline"
            className="flex-1"
            onClick={() => window.location.href = `tel:${branch.phone}`}
          >
            <Phone className="w-4 h-4 mr-2" />
            Call
          </Button>
        )}

        {/* Directions button */}
        <Button
          size="sm"
          variant="outline"
          className="flex-1"
          onClick={openDirections}
          disabled={!branch.latitude || !branch.longitude}
        >
          <Navigation className="w-4 h-4 mr-2" />
          Directions
        </Button>

        {/* Select button */}
        {showSelectButton && onSelect && (
          <Button
            size="sm"
            className="flex-1"
            onClick={() => onSelect(branch)}
          >
            Select Branch
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
