'use client';

import { useState, Suspense, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { SearchBar } from '@/components/SearchBar';
import { FilterPanel } from '@/components/FilterPanel';
import { ProductGrid } from '@/components/ProductGrid';
import { SearchFilters } from '@/lib/types';

function SearchPageContent() {
  const searchParams = useSearchParams();
  const queryParam = searchParams.get('q') || '';
  const [filters, setFilters] = useState<SearchFilters>({ query: queryParam, sortBy: 'relevance' });

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
