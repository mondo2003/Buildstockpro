'use client';

import { useState, Suspense } from 'react';
import { SearchBar } from '@/components/SearchBar';
import { FilterPanel } from '@/components/FilterPanel';
import { ProductGrid } from '@/components/ProductGrid';
import { SearchFilters } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';

function DemoContent() {
  const [filters, setFilters] = useState<SearchFilters>({});

  const handleFiltersChange = (newFilters: SearchFilters) => {
    setFilters(newFilters);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header with Search */}
      <header className="bg-gradient-to-b from-primary/10 to-background border-b sticky top-0 z-40 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-6">
            <h1 className="text-4xl font-bold text-center mb-2">BuildStock Pro</h1>
            <p className="text-center text-muted-foreground">
              Find sustainable building materials near you
            </p>
          </div>
          <SearchBar className="max-w-3xl mx-auto" />
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* Filters Sidebar */}
          <aside className="w-full lg:w-80 flex-shrink-0">
            <FilterPanel filters={filters} onFiltersChange={handleFiltersChange} />
          </aside>

          {/* Products Grid */}
          <div className="flex-1 min-w-0">
            <ProductGrid filters={filters} />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t mt-16">
        <div className="container mx-auto px-4 py-8 text-center text-muted-foreground">
          <p>BuildStock Pro Demo - Frontend UI Components</p>
          <p className="text-sm mt-2">
            This is a demonstration of the core UI components with mock data
          </p>
        </div>
      </footer>
    </div>
  );
}

export default function DemoPage() {
  return (
    <Suspense fallback={
      <Card className="min-h-screen flex items-center justify-center m-4">
        <CardContent>
          <div className="animate-pulse text-muted-foreground">Loading...</div>
        </CardContent>
      </Card>
    }>
      <DemoContent />
    </Suspense>
  );
}
