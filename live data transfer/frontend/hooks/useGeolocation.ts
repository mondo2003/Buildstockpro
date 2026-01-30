import { useState, useEffect, useCallback } from 'react';

export interface UserLocation {
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp?: number;
}

export interface LocationError {
  code: number;
  message: string;
}

type LocationPermission = 'granted' | 'denied' | 'prompt' | 'unsupported';

interface UseGeolocationReturn {
  location: UserLocation | null;
  error: LocationError | null;
  permission: LocationPermission;
  loading: boolean;
  requestLocation: () => Promise<UserLocation | null>;
  clearLocation: () => void;
  hasLocation: boolean;
}

/**
 * React hook for geolocation with permission handling
 *
 * Usage:
 * const { location, loading, requestLocation, hasLocation } = useGeolocation();
 */
export function useGeolocation(autoRequest = false): UseGeolocationReturn {
  const [location, setLocation] = useState<UserLocation | null>(null);
  const [error, setError] = useState<LocationError | null>(null);
  const [permission, setPermission] = useState<LocationPermission>('prompt');
  const [loading, setLoading] = useState(false);

  // Check if geolocation is supported
  const supported = typeof navigator !== 'undefined' && 'geolocation' in navigator;

  useEffect(() => {
    if (!supported) {
      setPermission('unsupported');
      setError({
        code: 0,
        message: 'Geolocation is not supported by your browser'
      });
      return;
    }

    // Check permission status if API is available
    if ('permissions' in navigator) {
      navigator.permissions.query({ name: 'geolocation' as PermissionName })
        .then((result) => {
          setPermission(result.state as LocationPermission);
          result.addEventListener('change', () => {
            setPermission(result.state as LocationPermission);
          });
        })
        .catch(() => {
          // Permission API not fully supported, leave as 'prompt'
        });
    }

    // Load saved location from localStorage
    const savedLocation = localStorage.getItem('userLocation');
    if (savedLocation) {
      try {
        const parsed = JSON.parse(savedLocation);
        // Only use if less than 1 hour old
        const age = Date.now() - (parsed.timestamp || 0);
        if (age < 3600000) { // 1 hour
          setLocation(parsed);
        } else {
          localStorage.removeItem('userLocation');
        }
      } catch {
        localStorage.removeItem('userLocation');
      }
    }

    // Auto-request location if enabled
    if (autoRequest && !savedLocation) {
      requestLocation();
    }
  }, [autoRequest, supported]);

  const requestLocation = useCallback(async (): Promise<UserLocation | null> => {
    if (!supported) {
      setError({
        code: 0,
        message: 'Geolocation is not supported by your browser'
      });
      return null;
    }

    setLoading(true);
    setError(null);

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLocation: UserLocation = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: Date.now()
          };

          setLocation(userLocation);
          setPermission('granted');
          setLoading(false);

          // Save to localStorage
          localStorage.setItem('userLocation', JSON.stringify(userLocation));

          resolve(userLocation);
        },
        (err) => {
          const locationError: LocationError = {
            code: err.code,
            message: getErrorMessage(err.code)
          };

          setError(locationError);
          setPermission(err.code === 1 ? 'denied' : 'prompt');
          setLoading(false);

          resolve(null);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutes cache
        }
      );
    });
  }, [supported]);

  const clearLocation = useCallback(() => {
    setLocation(null);
    setError(null);
    localStorage.removeItem('userLocation');
  }, []);

  return {
    location,
    error,
    permission,
    loading,
    requestLocation,
    clearLocation,
    hasLocation: !!location
  };
}

/**
 * Get human-readable error message
 */
function getErrorMessage(code: number): string {
  switch (code) {
    case 1:
      return 'Location access denied. Please enable location permissions in your browser settings.';
    case 2:
      return 'Unable to determine your location. Please check your device settings.';
    case 3:
      return 'Location request timed out. Please try again.';
    default:
      return 'An unknown error occurred while getting your location.';
  }
}

/**
 * Calculate distance between two coordinates (Haversine formula)
 * Returns distance in kilometers
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
    Math.cos(toRadians(lat2)) *
    Math.sin(dLon / 2) *
    Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Format distance for display
 */
export function formatDistance(kilometers: number): string {
  if (kilometers < 1) {
    return `${Math.round(kilometers * 1000)}m away`;
  }
  if (kilometers < 10) {
    return `${kilometers.toFixed(1)}km away`;
  }
  return `${Math.round(kilometers)}km away`;
}
