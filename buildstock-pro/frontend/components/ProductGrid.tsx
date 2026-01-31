'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { ProductCard } from '@/components/ProductCard';
import { Card, CardContent, CardHeader, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Package, Loader2, Grid3x3, List, ChevronDown, AlertCircle } from 'lucide-react';
import { Product, SearchFilters } from '@/lib/types';
import { api } from '@/lib/api';
import { mockProducts } from '@/lib/mockData';
import { cn } from '@/lib/utils';

interface ProductGridProps {
  filters?: SearchFilters;
  initialProducts?: Product[];
  className?: string;
  onFiltersChange?: (filters: SearchFilters) => void;
}

type ViewMode = 'grid' | 'list';
type SortOption = 'relevance' | 'price-asc' | 'price-desc' | 'distance' | 'rating' | 'carbon';

const sortOptions: { value: SortOption; label: string }[] = [
  { value: 'relevance', label: 'Relevance' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'distance', label: 'Distance' },
  { value: 'rating', label: 'Customer Rating' },
  { value: 'carbon', label: 'Carbon Footprint' },
];

export function ProductGrid({ filters = {}, initialProducts, className, onFiltersChange }: ProductGridProps) {
  const [products, setProducts] = useState<Product[]>(initialProducts || mockProducts);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>(initialProducts || mockProducts);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortBy, setSortBy] = useState<SortOption>('relevance');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  const observerTarget = useRef<HTMLDivElement>(null);

  // Apply filters and sorting using API
  useEffect(() => {
    const fetchProducts = async () => {
      console.log('ProductGrid: Fetching products with filters:', filters, 'sortBy:', sortBy);
      setIsLoading(true);
      setError(null);

      try {
        const results = await api.searchProducts({ ...filters, sortBy });
        console.log('ProductGrid: Got results:', results.products.length, 'products');
        setFilteredProducts(results.products);
        setTotalCount(results.total);
        setHasMore(results.products.length < results.total);
        setPage(1);
      } catch (err) {
        // API failed - use mock data directly as fallback
        console.warn('ProductGrid: API failed, using mock data directly:', err);
        const { getFilteredProducts } = await import('@/lib/mockData');
        const mockResults = getFilteredProducts({ ...filters, sortBy });
        setFilteredProducts(mockResults.products);
        setTotalCount(mockResults.total);
        setHasMore(false);
        setPage(1);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, [filters, sortBy]);

  // Infinite scroll observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoading) {
          loadMore();
        }
      },
      { threshold: 1.0 }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [hasMore, isLoading, filteredProducts.length]);

  const loadMore = useCallback(async () => {
    if (!hasMore || isLoading) return;

    setIsLoading(true);
    try {
      // Fetch next page
      const nextPage = page + 1;
      const results = await api.searchProducts({
        ...filters,
        sortBy,
        page: nextPage,
      });

      // Append new products
      setFilteredProducts((prev) => [...prev, ...results.products]);
      setPage(nextPage);
      setHasMore(results.products.length > 0);
    } catch (err) {
      console.error('Error loading more products:', err);
      setError('Failed to load more products.');
    } finally {
      setIsLoading(false);
    }
  }, [hasMore, isLoading, page, filters, sortBy]);

  const handleReserve = async (productId: string, supplierId: string) => {
    // Simulate reserve action
    await new Promise((resolve) => setTimeout(resolve, 1000));
    alert(`Reserved product ${productId} from supplier ${supplierId}`);
  };

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <AlertCircle className="w-16 h-16 text-destructive mb-4" />
          <h3 className="text-xl font-semibold mb-2">Something went wrong</h3>
          <p className="text-muted-foreground text-center max-w-md mb-4">
            {error}
          </p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </CardContent>
      </Card>
    );
  }

  if (isLoading && filteredProducts.length === 0) {
    return <LoadingState viewMode={viewMode} className={className} />;
  }

  if (filteredProducts.length === 0 && !isLoading) {
    return (
      <EmptyState
        filters={filters}
        className={className}
        onCategoryClick={(category) => {
          console.log('EmptyState: Category clicked:', category);
          onFiltersChange?.({ ...filters, category: [category] });
        }}
      />
    );
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Results Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Search Results</h2>
          <p className="text-muted-foreground">
            {totalCount} {totalCount === 1 ? 'product' : 'products'} found
            {filters.query && ` for "${filters.query}"`}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* View Toggle */}
          <div className="hidden sm:flex items-center border rounded-lg p-1">
            <Button
              variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="h-8 px-3"
              aria-label="Grid view"
            >
              <Grid3x3 className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="h-8 px-3"
              aria-label="List view"
            >
              <List className="w-4 h-4" />
            </Button>
          </div>

          {/* Sort Dropdown */}
          <div className="relative group">
            <Button variant="outline" className="justify-between min-w-[200px]">
              Sort by: {sortOptions.find((o) => o.value === sortBy)?.label}
              <ChevronDown className="w-4 h-4 ml-2 opacity-50" />
            </Button>
            <div className="absolute right-0 mt-2 w-full bg-popover border rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
              {sortOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setSortBy(option.value)}
                  className={cn(
                    'w-full px-4 py-2 text-left text-sm hover:bg-accent transition-colors',
                    sortBy === option.value && 'bg-accent font-medium'
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Products Grid/List */}
      <div
        className={cn(
          'gap-6',
          viewMode === 'grid'
            ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
            : 'flex flex-col'
        )}
      >
        {filteredProducts.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            variant={viewMode === 'list' ? 'compact' : 'default'}
            onReserve={handleReserve}
          />
        ))}
      </div>

      {/* Loading More Indicator */}
      {isLoading && filteredProducts.length > 0 && (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
          <span className="ml-2 text-muted-foreground">Loading more products...</span>
        </div>
      )}

      {/* Infinite Scroll Observer Target */}
      <div ref={observerTarget} className="h-10" />

      {/* End of Results */}
      {!hasMore && filteredProducts.length > 0 && (
        <div className="text-center py-8">
          <p className="text-muted-foreground">
            You've reached the end of the results
          </p>
        </div>
      )}
    </div>
  );
}

// Loading State Component
function LoadingState({ viewMode, className }: { viewMode: ViewMode; className?: string }) {
  return (
    <div className={cn('space-y-6', className)}>
      <div className="flex items-center justify-between">
        <div>
          <div className="h-8 w-48 bg-muted animate-pulse rounded mb-2" />
          <div className="h-4 w-32 bg-muted animate-pulse rounded" />
        </div>
      </div>

      <div
        className={cn(
          'gap-6',
          viewMode === 'grid'
            ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
            : 'flex flex-col'
        )}
      >
        {[...Array(8)].map((_, i) => (
          <SkeletonCard key={i} variant={viewMode === 'list' ? 'compact' : 'default'} />
        ))}
      </div>
    </div>
  );
}

// Skeleton Card Component
function SkeletonCard({ variant }: { variant: 'default' | 'compact' }) {
  if (variant === 'compact') {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4">
            <div className="w-24 h-24 bg-muted animate-pulse rounded-lg" />
            <div className="flex-1 space-y-2">
              <div className="h-5 w-3/4 bg-muted animate-pulse rounded" />
              <div className="h-4 w-1/2 bg-muted animate-pulse rounded" />
              <div className="h-6 w-20 bg-muted animate-pulse rounded" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <div className="aspect-video bg-muted animate-pulse" />
      <CardHeader>
        <div className="h-6 w-3/4 bg-muted animate-pulse rounded mb-2" />
        <div className="h-4 w-full bg-muted animate-pulse rounded" />
        <div className="h-4 w-2/3 bg-muted animate-pulse rounded mt-2" />
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex justify-between">
          <div className="h-5 w-24 bg-muted animate-pulse rounded" />
          <div className="h-5 w-16 bg-muted animate-pulse rounded" />
        </div>
        <div className="h-4 w-full bg-muted animate-pulse rounded" />
        <div className="h-4 w-2/3 bg-muted animate-pulse rounded" />
      </CardContent>
      <CardFooter>
        <div className="flex justify-between w-full">
          <div className="h-8 w-20 bg-muted animate-pulse rounded" />
          <div className="h-10 w-24 bg-muted animate-pulse rounded" />
        </div>
      </CardFooter>
    </Card>
  );
}

// Empty State Component
function EmptyState({
  filters,
  className,
  onClearFilters,
  onCategoryClick,
}: {
  filters: SearchFilters;
  className?: string;
  onClearFilters?: () => void;
  onCategoryClick?: (category: string) => void;
}) {
  const hasActiveFilters = Object.keys(filters).some(
    (key) =>
      filters[key as keyof SearchFilters] !== undefined &&
      filters[key as keyof SearchFilters] !== '' &&
      (Array.isArray(filters[key as keyof SearchFilters])
        ? (filters[key as keyof SearchFilters] as any[]).length > 0
        : true)
  );

  return (
    <Card className={className}>
      <CardContent className="flex flex-col items-center justify-center py-16">
        <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-6">
          <Search className="w-12 h-12 text-muted-foreground" />
        </div>
        <h3 className="text-xl font-semibold mb-2">No products found</h3>
        <p className="text-muted-foreground text-center max-w-md mb-6">
          {hasActiveFilters
            ? 'Try adjusting your filters to find what you\'re looking for.'
            : 'Try searching for something specific or browse our categories.'}
        </p>

        {hasActiveFilters && (
          <Button variant="outline" onClick={onClearFilters}>
            Clear All Filters
          </Button>
        )}

        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-2xl">
          {['Insulation', 'Timber', 'Paints', 'Flooring'].map((category) => (
            <Badge
              key={category}
              variant="outline"
              className="justify-center py-2 cursor-pointer hover:bg-accent transition-colors"
              onClick={() => onCategoryClick?.(category)}
            >
              {category}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
