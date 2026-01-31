'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Filter, X, SlidersHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';
import { mockFacets } from '@/lib/mockData';
import { SearchFilters } from '@/lib/types';

interface FilterPanelProps {
  filters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
  className?: string;
}

export function FilterPanel({ filters, onFiltersChange, className }: FilterPanelProps) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [localFilters, setLocalFilters] = useState<SearchFilters>(filters);

  // Sync local filters with prop changes
  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const categories = mockFacets.categories;
  const certifications = mockFacets.certifications;
  const brands = mockFacets.brands;

  const handleFilterChange = (key: keyof SearchFilters, value: any) => {
    const updated = { ...localFilters, [key]: value };
    setLocalFilters(updated);
    onFiltersChange(updated);
  };

  const handleCategoryToggle = (categoryName: string) => {
    const current = localFilters.category || [];
    const updated = current.includes(categoryName)
      ? current.filter((c) => c !== categoryName)
      : [...current, categoryName];
    handleFilterChange('category', updated);
  };

  const handleCertificationToggle = (certName: string) => {
    const current = localFilters.certifications || [];
    const updated = current.includes(certName)
      ? current.filter((c) => c !== certName)
      : [...current, certName];
    handleFilterChange('certifications', updated);
  };

  const handleBrandToggle = (brandName: string) => {
    const current = localFilters.certifications || []; // Using certifications as brand filter for now
    const updated = current.includes(brandName)
      ? current.filter((c) => c !== brandName)
      : [...current, brandName];
    handleFilterChange('certifications', updated);
  };

  const handlePriceRangeChange = (value: number[]) => {
    handleFilterChange('priceRange', [value[0], value[1]]);
  };

  const handleDistanceChange = (value: number[]) => {
    console.log('🎚️ Distance slider changed to:', value[0], 'miles');
    handleFilterChange('distance', value[0]);
  };

  const handleInStockToggle = (checked: boolean) => {
    handleFilterChange('inStock', checked);
  };

  const clearAllFilters = () => {
    const cleared: SearchFilters = {};
    setLocalFilters(cleared);
    onFiltersChange(cleared);
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (localFilters.category?.length) count++;
    if (localFilters.priceRange) count++;
    if (localFilters.distance !== undefined) count++;
    if (localFilters.inStock) count++;
    if (localFilters.certifications?.length) count++;
    return count;
  };

  const activeFilterCount = getActiveFilterCount();

  const ActiveFiltersDisplay = () => {
    if (activeFilterCount === 0) return null;

    return (
      <div className="flex flex-wrap gap-2 mb-4">
        {localFilters.inStock && (
          <Badge variant="secondary" className="gap-1">
            In Stock
            <button
              onClick={() => handleInStockToggle(false)}
              className="hover:bg-destructive/20 rounded-full p-0.5"
              aria-label="Remove In Stock filter"
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        )}
        {localFilters.priceRange && (
          <Badge variant="secondary" className="gap-1">
            £{localFilters.priceRange[0]} - £{localFilters.priceRange[1]}
            <button
              onClick={() => handleFilterChange('priceRange', undefined)}
              className="hover:bg-destructive/20 rounded-full p-0.5"
              aria-label="Remove price filter"
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        )}
        {localFilters.distance !== undefined && (
          <Badge variant="secondary" className="gap-1">
            Within {localFilters.distance} miles
            <button
              onClick={() => handleFilterChange('distance', undefined)}
              className="hover:bg-destructive/20 rounded-full p-0.5"
              aria-label="Remove distance filter"
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        )}
        {localFilters.category?.map((cat) => (
          <Badge key={cat} variant="secondary" className="gap-1">
            {cat}
            <button
              onClick={() => handleCategoryToggle(cat)}
              className="hover:bg-destructive/20 rounded-full p-0.5"
              aria-label={`Remove ${cat} filter`}
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
      </div>
    );
  };

  const FilterContent = ({ filters: f, onFiltersChange: oc }: { filters?: SearchFilters; onFiltersChange?: (filters: SearchFilters) => void } = {}) => (
    <Card className={cn("sticky top-24", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Filter className="w-5 h-5" />
            Filters
            {activeFilterCount > 0 && (
              <Badge variant="secondary" className="ml-2">
                {activeFilterCount}
              </Badge>
            )}
          </CardTitle>
          {activeFilterCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllFilters}
              className="text-xs hover:text-destructive"
            >
              Clear all
            </Button>
          )}
        </div>
        <ActiveFiltersDisplay />
      </CardHeader>
      <CardContent>
        <Accordion
          type="multiple"
          defaultValue={['availability', 'category', 'price', 'distance']}
          className="w-full"
        >
          {/* Stock Availability */}
          <AccordionItem value="availability">
            <AccordionTrigger className="text-sm font-semibold hover:no-underline py-3">
              Availability
            </AccordionTrigger>
            <AccordionContent className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <label htmlFor="in-stock" className="text-sm font-medium cursor-pointer flex-1">
                  In Stock Only
                </label>
                <Switch
                  id="in-stock"
                  checked={localFilters.inStock || false}
                  onCheckedChange={handleInStockToggle}
                  aria-label="Toggle in-stock filter"
                />
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Categories */}
          <AccordionItem value="category">
            <AccordionTrigger className="text-sm font-semibold hover:no-underline py-3">
              Category
            </AccordionTrigger>
            <AccordionContent className="space-y-3 pt-2">
              <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                {categories.map((category) => {
                  const isChecked = localFilters.category?.includes(category.name);
                  return (
                    <div key={category.name} className="flex items-center space-x-2">
                      <Checkbox
                        id={`category-${category.name}`}
                        checked={isChecked}
                        onCheckedChange={() => handleCategoryToggle(category.name)}
                        aria-label={`Toggle ${category.name} category`}
                      />
                      <label
                        htmlFor={`category-${category.name}`}
                        className="flex-1 text-sm font-medium cursor-pointer leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {category.name}
                      </label>
                      <Badge variant="outline" className="text-xs">
                        {category.count}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Price Range */}
          <AccordionItem value="price">
            <AccordionTrigger className="text-sm font-semibold hover:no-underline py-3">
              Price Range
            </AccordionTrigger>
            <AccordionContent className="space-y-4 pt-2">
              <div className="px-1">
                <Slider
                  defaultValue={[localFilters.priceRange?.[0] || 0, localFilters.priceRange?.[1] || 500]}
                  max={1000}
                  step={10}
                  value={[localFilters.priceRange?.[0] || 0, localFilters.priceRange?.[1] || 500]}
                  onValueChange={handlePriceRangeChange}
                  className="w-full"
                  aria-label="Price range"
                />
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className="font-medium">£</span>
                  <input
                    type="number"
                    value={localFilters.priceRange?.[0] || 0}
                    onChange={(e) => {
                      const min = parseInt(e.target.value) || 0;
                      handlePriceRangeChange([min, localFilters.priceRange?.[1] || 500]);
                    }}
                    className="w-20 px-2 py-1 text-sm border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    aria-label="Minimum price"
                  />
                </div>
                <span className="text-muted-foreground">to</span>
                <div className="flex items-center gap-2">
                  <span className="font-medium">£</span>
                  <input
                    type="number"
                    value={localFilters.priceRange?.[1] || 500}
                    onChange={(e) => {
                      const max = parseInt(e.target.value) || 500;
                      handlePriceRangeChange([localFilters.priceRange?.[0] || 0, max]);
                    }}
                    className="w-20 px-2 py-1 text-sm border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    aria-label="Maximum price"
                  />
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Distance */}
          <AccordionItem value="distance">
            <AccordionTrigger className="text-sm font-semibold hover:no-underline py-3">
              Distance
            </AccordionTrigger>
            <AccordionContent className="space-y-4 pt-2">
              <div className="px-1">
                <Slider
                  defaultValue={[localFilters.distance || 10]}
                  max={50}
                  step={1}
                  value={[localFilters.distance || 10]}
                  onValueChange={handleDistanceChange}
                  className="w-full"
                  aria-label="Distance range"
                />
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Within</span>
                <span className="font-semibold text-primary">
                  {localFilters.distance || 10} miles
                </span>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Eco Rating */}
          <AccordionItem value="eco">
            <AccordionTrigger className="text-sm font-semibold hover:no-underline py-3">
              Eco Rating
            </AccordionTrigger>
            <AccordionContent className="space-y-3 pt-2">
              {['A', 'B', 'C', 'D', 'E'].map((rating) => {
                const isChecked = localFilters.ecoRating?.includes(rating as any);
                return (
                  <div key={rating} className="flex items-center space-x-2">
                    <Checkbox
                      id={`eco-${rating}`}
                      checked={isChecked}
                      onCheckedChange={(checked) => {
                        const current = localFilters.ecoRating || [];
                        const updated = checked
                          ? [...current, rating as any]
                          : current.filter((r) => r !== rating);
                        handleFilterChange('ecoRating', updated);
                      }}
                      aria-label={`Toggle ${rating} eco rating`}
                    />
                    <label
                      htmlFor={`eco-${rating}`}
                      className="flex items-center gap-2 text-sm font-medium cursor-pointer leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      <span className="w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold
                        ${rating === 'A' ? 'bg-accent text-white' : ''}
                        ${rating === 'B' ? 'bg-green-500 text-white' : ''}
                        ${rating === 'C' ? 'bg-yellow-500 text-white' : ''}
                        ${rating === 'D' ? 'bg-orange-500 text-white' : ''}
                        ${rating === 'E' ? 'bg-red-500 text-white' : ''}
                      ">
                        {rating}
                      </span>
                      Rating
                    </label>
                  </div>
                );
              })}
            </AccordionContent>
          </AccordionItem>

          {/* Certifications */}
          <AccordionItem value="certifications">
            <AccordionTrigger className="text-sm font-semibold hover:no-underline py-3">
              Certifications
            </AccordionTrigger>
            <AccordionContent className="space-y-3 pt-2">
              <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                {certifications.map((cert) => {
                  const isChecked = localFilters.certifications?.includes(cert.name);
                  return (
                    <div key={cert.name} className="flex items-center space-x-2">
                      <Checkbox
                        id={`cert-${cert.name}`}
                        checked={isChecked}
                        onCheckedChange={() => handleCertificationToggle(cert.name)}
                        aria-label={`Toggle ${cert.name} certification`}
                      />
                      <label
                        htmlFor={`cert-${cert.name}`}
                        className="flex-1 text-sm font-medium cursor-pointer leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {cert.name}
                      </label>
                      <Badge variant="outline" className="text-xs">
                        {cert.count}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Brand */}
          <AccordionItem value="brand">
            <AccordionTrigger className="text-sm font-semibold hover:no-underline py-3">
              Brand
            </AccordionTrigger>
            <AccordionContent className="space-y-3 pt-2">
              <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                {brands.map((brand) => {
                  const isChecked = localFilters.certifications?.includes(brand.name);
                  return (
                    <div key={brand.name} className="flex items-center space-x-2">
                      <Checkbox
                        id={`brand-${brand.name}`}
                        checked={isChecked}
                        onCheckedChange={() => handleBrandToggle(brand.name)}
                        aria-label={`Toggle ${brand.name} brand`}
                      />
                      <label
                        htmlFor={`brand-${brand.name}`}
                        className="flex-1 text-sm font-medium cursor-pointer leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {brand.name}
                      </label>
                      <Badge variant="outline" className="text-xs">
                        {brand.count}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );

  // Mobile version with collapsible behavior
  return (
    <>
      {/* Mobile Toggle Button */}
      <div className="lg:hidden mb-4">
        <Button
          variant="outline"
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="w-full justify-start"
          aria-expanded={isMobileOpen}
          aria-controls="mobile-filters"
        >
          <SlidersHorizontal className="mr-2 h-4 w-4" />
          Filters
          {activeFilterCount > 0 && (
            <Badge variant="secondary" className="ml-2">
              {activeFilterCount}
            </Badge>
          )}
        </Button>
      </div>

      {/* Mobile Filters */}
      {isMobileOpen && (
        <div
          id="mobile-filters"
          className="lg:hidden mb-4 animate-in slide-in-from-top-2 duration-300"
        >
          <FilterContent filters={filters} onFiltersChange={onFiltersChange} />
        </div>
      )}

      {/* Desktop Filters */}
      <div className="hidden lg:block">
        <FilterContent filters={filters} onFiltersChange={onFiltersChange} />
      </div>
    </>
  );
}
