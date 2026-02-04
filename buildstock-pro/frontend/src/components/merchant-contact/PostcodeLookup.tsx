'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { MapPin, Search, X } from 'lucide-react';
import { merchantContactApi } from '@/src/lib/api/merchantContact';
import { toast } from 'sonner';

interface PostcodeLookupProps {
  onPostcodeChange: (postcode: string) => void;
  onLocationChange?: (location: { latitude: number; longitude: number }) => void;
  initialValue?: string;
  placeholder?: string;
  className?: string;
}

export function PostcodeLookup({
  onPostcodeChange,
  onLocationChange,
  initialValue = '',
  placeholder = 'Enter your postcode (e.g., SW1A 1AA)',
  className = '',
}: PostcodeLookupProps) {
  const [postcode, setPostcode] = useState(initialValue);
  const [isValid, setIsValid] = useState(true);
  const [isGeolocating, setIsGeolocating] = useState(false);

  useEffect(() => {
    if (initialValue) {
      setPostcode(initialValue);
    }
  }, [initialValue]);

  const handlePostcodeChange = (value: string) => {
    // Auto-format as user types (uppercase)
    const formatted = value.toUpperCase();
    setPostcode(formatted);

    // Validate if not empty
    if (formatted.length > 0) {
      const validation = merchantContactApi.validateUKPostcode(formatted);
      setIsValid(validation.valid);

      if (validation.valid && validation.postcode) {
        onPostcodeChange(validation.postcode);
      }
    } else {
      setIsValid(true);
      onPostcodeChange('');
    }
  };

  const handleSubmit = () => {
    if (!postcode.trim()) {
      toast.error('Postcode required', {
        description: 'Please enter a UK postcode',
      });
      return;
    }

    const validation = merchantContactApi.validateUKPostcode(postcode);

    if (!validation.valid) {
      setIsValid(false);
      toast.error('Invalid postcode', {
        description: validation.error || 'Please enter a valid UK postcode',
      });
      return;
    }

    setIsValid(true);
    const formatted = merchantContactApi.formatPostcode(postcode);
    setPostcode(formatted);
    onPostcodeChange(formatted);

    toast.success('Postcode updated', {
      description: `Searching for branches near ${formatted}`,
    });
  };

  const handleUseCurrentLocation = () => {
    setIsGeolocating(true);

    if (!navigator.geolocation) {
      toast.error('Geolocation not supported', {
        description: 'Your browser does not support location services',
      });
      setIsGeolocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;

        if (onLocationChange) {
          onLocationChange({ latitude, longitude });
        }

        toast.success('Location found', {
          description: 'Using your current location',
        });

        setIsGeolocating(false);
      },
      (error) => {
        console.error('Geolocation error:', error);
        toast.error('Location access denied', {
          description: 'Please enable location services or enter your postcode manually',
        });
        setIsGeolocating(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000, // 5 minutes
      }
    );
  };

  const handleClear = () => {
    setPostcode('');
    setIsValid(true);
    onPostcodeChange('');
  };

  return (
    <div className={`flex gap-2 ${className}`}>
      <div className="relative flex-1">
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          type="text"
          value={postcode}
          onChange={(e) => handlePostcodeChange(e.target.value)}
          placeholder={placeholder}
          className={`pl-10 pr-10 ${!isValid ? 'border-destructive focus-visible:ring-destructive' : ''}`}
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
        />
        {postcode && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            type="button"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
      <Button
        onClick={handleSubmit}
        size="default"
        disabled={!postcode.trim() || !isValid}
      >
        <Search className="w-4 h-4 mr-2" />
        Search
      </Button>
      {onLocationChange && (
        <Button
          onClick={handleUseCurrentLocation}
          variant="outline"
          size="default"
          disabled={isGeolocating}
          title="Use my current location"
        >
          <MapPin className="w-4 h-4 mr-2" />
          {isGeolocating ? 'Locating...' : 'Use My Location'}
        </Button>
      )}
    </div>
  );
}
