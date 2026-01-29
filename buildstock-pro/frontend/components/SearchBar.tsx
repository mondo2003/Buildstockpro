'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, X, Clock, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';

const RECENT_SEARCHES_KEY = 'buildstock-recent-searches';
const MAX_RECENT_SEARCHES = 5;

interface SearchBarProps {
  defaultValue?: string;
  className?: string;
}

export function SearchBar({ defaultValue = '', className }: SearchBarProps) {
  const [query, setQuery] = useState(defaultValue);
  const [suggestions, setSuggestions] = useState<Array<{ id: string; text: string; category?: string }>>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load recent searches from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
    if (stored) {
      try {
        setRecentSearches(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to parse recent searches:', e);
      }
    }
  }, []);

  // Update suggestions when query changes
  useEffect(() => {
    if (query.trim().length > 0) {
      setIsLoading(true);
      const timer = setTimeout(async () => {
        try {
          // Fetch products matching the query for suggestions
          const results = await api.searchProducts({ query, sortBy: 'relevance' });

          // Transform products into suggestions
          const productSuggestions = results.products.slice(0, 5).map(product => ({
            id: product.id,
            text: product.name,
            category: product.category,
          }));

          setSuggestions(productSuggestions);
        } catch (error) {
          console.warn('Failed to fetch search suggestions, using fallback', error);
          // Fallback to basic text-based suggestions
          const fallbackSuggestions = [
            { id: '1', text: `${query} insulation`, category: 'Insulation' },
            { id: '2', text: `${query} materials`, category: 'Building Materials' },
            { id: '3', text: `eco-friendly ${query}`, category: 'Sustainable' },
          ];
          setSuggestions(fallbackSuggestions);
        } finally {
          setIsLoading(false);
        }
      }, 300); // Debounce for 300ms
      return () => clearTimeout(timer);
    } else {
      setSuggestions([]);
      setIsLoading(false);
    }
  }, [query]);

  // Close suggestions when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Save search to localStorage
  const saveRecentSearch = (searchQuery: string) => {
    const trimmed = searchQuery.trim();
    if (!trimmed) return;

    const updated = [trimmed, ...recentSearches.filter((s) => s !== trimmed)].slice(
      0,
      MAX_RECENT_SEARCHES
    );
    setRecentSearches(updated);
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
  };

  const handleSearch = (searchQuery: string = query) => {
    const trimmed = searchQuery.trim();
    if (trimmed) {
      saveRecentSearch(trimmed);
      setShowSuggestions(false);
      router.push(`/search?q=${encodeURIComponent(trimmed)}`);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch();
  };

  const handleClear = () => {
    setQuery('');
    setSuggestions([]);
    setActiveIndex(-1);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    const items = query.trim().length > 0 ? suggestions : recentSearches;
    const itemCount = items.length;

    if (!showSuggestions || itemCount === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setActiveIndex((prev) => (prev < itemCount - 1 ? prev + 1 : 0));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setActiveIndex((prev) => (prev > 0 ? prev - 1 : itemCount - 1));
        break;
      case 'Enter':
        e.preventDefault();
        if (activeIndex >= 0) {
          const item = items[activeIndex];
          handleSearch(typeof item === 'string' ? item : item.text);
        } else {
          handleSearch();
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setActiveIndex(-1);
        break;
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    handleSearch(suggestion);
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem(RECENT_SEARCHES_KEY);
  };

  const displayItems = query.trim().length > 0 ? suggestions : recentSearches;
  const hasItems = displayItems.length > 0;

  return (
    <div
      ref={searchContainerRef}
      className={cn('w-full relative', className)}
    >
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative flex items-center gap-2">
          <div className="relative flex-1">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              ref={inputRef}
              type="search"
              placeholder="Search for building materials..."
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setShowSuggestions(true);
                setActiveIndex(-1);
              }}
              onFocus={() => setShowSuggestions(true)}
              onKeyDown={handleKeyDown}
              aria-label="Search products"
              aria-autocomplete="list"
              aria-controls="search-suggestions"
              aria-expanded={showSuggestions && hasItems}
              className={cn(
                "h-14 pl-12 pr-10 text-base rounded-full border-2",
                "border-primary/20 focus:border-primary shadow-lg",
                "transition-all duration-200"
              )}
            />
            {query && (
              <button
                type="button"
                onClick={handleClear}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1"
                aria-label="Clear search"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <Button
            type="submit"
            size="lg"
            disabled={!query.trim() || isLoading}
            className={cn(
              "h-14 px-8 rounded-full",
              "bg-gradient-to-r from-primary to-primary/90",
              "hover:from-primary/90 hover:to-primary",
              "shadow-lg hover:shadow-xl",
              "transition-all duration-200"
            )}
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <span className="font-semibold">Search</span>
            )}
          </Button>
        </div>
      </form>

      {/* Suggestions Dropdown */}
      {showSuggestions && hasItems && (
        <div
          id="search-suggestions"
          className={cn(
            "absolute z-50 w-full mt-2 bg-background",
            "border border-border rounded-xl shadow-xl",
            "overflow-hidden animate-in fade-in slide-in-from-top-2",
            "duration-200"
          )}
          role="listbox"
        >
          {/* Header */}
          <div className="px-4 py-2 bg-muted/50 border-b border-border">
            <p className="text-xs font-medium text-muted-foreground">
              {query.trim().length > 0 ? 'Suggestions' : 'Recent Searches'}
            </p>
          </div>

          {/* Items */}
          <ul className="max-h-64 overflow-y-auto py-1" role="presentation">
            {displayItems.map((item, index) => {
              const text = typeof item === 'string' ? item : item.text;
              const category = typeof item === 'string' ? null : item.category;
              const isActive = index === activeIndex;

              return (
                <li
                  key={typeof item === 'string' ? item : item.id}
                  role="option"
                  aria-selected={isActive}
                >
                  <button
                    type="button"
                    onClick={() => handleSuggestionClick(text)}
                    className={cn(
                      "w-full px-4 py-3 flex items-center gap-3",
                      "hover:bg-accent transition-colors",
                      isActive && "bg-accent",
                      "focus:outline-none focus:bg-accent"
                  )}
                  >
                    <Clock
                      className={cn(
                        "h-4 w-4 flex-shrink-0",
                        query.trim().length > 0 ? "text-muted-foreground" : "text-primary"
                      )}
                      aria-hidden="true"
                    />
                    <div className="flex-1 text-left">
                      <span className="text-sm font-medium">{text}</span>
                      {category && (
                        <span className="ml-2 text-xs text-muted-foreground">
                          in {category}
                        </span>
                      )}
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>

          {/* Footer - Clear recent searches */}
          {query.trim().length === 0 && recentSearches.length > 0 && (
            <div className="px-4 py-2 bg-muted/30 border-t border-border">
              <button
                type="button"
                onClick={clearRecentSearches}
                className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Clear recent searches
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
