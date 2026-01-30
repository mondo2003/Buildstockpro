'use client';

import { useState, Suspense, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { SearchBar } from '@/components/SearchBar';
import { FilterPanel } from '@/components/FilterPanel';
import { ProductGrid } from '@/components/ProductGrid';
import { SearchFilters } from '@/lib/types';
import { useGeolocation } from '@/hooks/useGeolocation';
import { Badge } from '@/components/ui/badge';
import { MapPin, Loader2 } from 'lucide-react';

function SearchPageContent() {
  const searchParams = useSearchParams();
  const queryParam = searchParams.get('q') || '';
  const [filters, setFilters] = useState<SearchFilters>({ query: queryParam, sortBy: 'relevance' });
  const { location, loading: locationLoading, requestLocation, hasLocation, permission } = useGeolocation();

  // Update filters when URL query parameter changes
  useEffect(() => {
    if (queryParam) {
      setFilters((prev) => ({ ...prev, query: queryParam }));
    }
  }, [queryParam]);

  const handleFiltersChange = (newFilters: SearchFilters) => {
    console.log('SearchPage: handleFiltersChange called with:', newFilters);
    setFilters(newFilters);
  };

  // Update filters with location when available
  useEffect(() => {
    if (location) {
      setFilters((prev) => ({
        ...prev,
        location: { lat: location.latitude, lng: location.longitude }
      }));
    }
  }, [location]);

  const handleRequestLocation = async () => {
    await requestLocation();
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-b from-primary/5 to-background border-b">
        <div className="container mx-auto px-4 md:px-6 py-8">
          <div className="max-w-3xl mx-auto text-center mb-6">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">
              Search Building Materials
            </h1>
            <p className="text-muted-foreground">
              Find sustainable construction materials near you
            </p>
          </div>
          <div className="max-w-2xl mx-auto">
            <SearchBar defaultValue={queryParam} />
          </div>

          {/* Location Status */}
          <div className="max-w-2xl mx-auto mt-4 flex items-center justify-center gap-2">
            {hasLocation ? (
              <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
                <MapPin className="w-3 h-3 mr-1" />
                Location enabled • Sort by distance available
              </Badge>
            ) : permission === 'denied' ? (
              <Badge variant="outline" className="text-orange-600 border-orange-300">
                <MapPin className="w-3 h-3 mr-1" />
                Location denied • Distance sorting unavailable
              </Badge>
            ) : permission === 'unsupported' ? null : (
              <button
                onClick={handleRequestLocation}
                disabled={locationLoading}
                className="text-sm text-primary hover:underline flex items-center gap-1 disabled:opacity-50"
              >
                {locationLoading ? (
                  <>
                    <Loader2 className="w-3 h-3 animate-spin" />
                    Detecting location...
                  </>
                ) : (
                  <>
                    <MapPin className="w-3 h-3" />
                    Enable location for distance sorting
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Search Results */}
      <div className="container mx-auto px-4 md:px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters */}
          <aside className="lg:col-span-1">
            <FilterPanel filters={filters} onFiltersChange={handleFiltersChange} />
          </aside>

          {/* Results */}
          <div className="lg:col-span-3">
            <ProductGrid filters={filters} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    }>
      <SearchPageContent />
    </Suspense>
  );
}
