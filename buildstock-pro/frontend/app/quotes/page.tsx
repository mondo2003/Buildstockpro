'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuote } from '@/context/QuoteContext';
import { QuoteCard } from '@/components/quotes/QuoteCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Loader2, FileText, Plus, Search, Filter } from 'lucide-react';
import { Quote } from '@/types/quote';
import { toast } from 'sonner';

export default function QuotesPage() {
  const router = useRouter();
  const { quotes, isLoadingQuotes, loadQuotes } = useQuote();
  const [filter, setFilter] = useState<Quote['status'] | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadQuotes();
  }, [loadQuotes]);

  // Filter quotes
  const filteredQuotes = quotes.filter(quote => {
    const matchesFilter = filter === 'all' || quote.status === filter;
    const matchesSearch = !searchQuery ||
      quote.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      quote.delivery_location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      quote.delivery_postcode.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleCreateQuote = () => {
    router.push('/quotes/new');
  };

  const filterOptions: Array<{ value: Quote['status'] | 'all'; label: string; count?: number }> = [
    { value: 'all', label: 'All', count: quotes.length },
    { value: 'pending', label: 'Pending', count: quotes.filter(q => q.status === 'pending').length },
    { value: 'sent', label: 'Sent', count: quotes.filter(q => q.status === 'sent').length },
    { value: 'responded', label: 'Responded', count: quotes.filter(q => q.status === 'responded').length },
    { value: 'expired', label: 'Expired', count: quotes.filter(q => q.status === 'expired').length },
    { value: 'cancelled', label: 'Cancelled', count: quotes.filter(q => q.status === 'cancelled').length },
  ];

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">My Quotes</h1>
            <p className="text-muted-foreground">
              Manage your quote requests and track supplier responses
            </p>
          </div>
          <Button onClick={handleCreateQuote} size="lg" className="md:w-auto w-full">
            <Plus className="w-5 h-5 mr-2" />
            Create New Quote
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Search quotes by title, location, or postcode..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Status Filters */}
        <div className="flex flex-wrap gap-2">
          <Filter className="w-5 h-5 text-muted-foreground mr-2" />
          {filterOptions.map(option => (
            <button
              key={option.value}
              onClick={() => setFilter(option.value)}
              className={`
                px-4 py-2 rounded-lg text-sm font-medium transition-all
                ${filter === option.value
                  ? 'bg-primary text-primary-foreground shadow-md'
                  : 'bg-muted hover:bg-muted/80'
                }
              `}
            >
              {option.label}
              {option.count !== undefined && (
                <Badge
                  variant={filter === option.value ? 'secondary' : 'outline'}
                  className="ml-2"
                >
                  {option.count}
                </Badge>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Quotes List */}
      {isLoadingQuotes ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : filteredQuotes.length === 0 ? (
        <div className="text-center py-20">
          <FileText className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">
            {searchQuery || filter !== 'all' ? 'No quotes found' : 'No quotes yet'}
          </h3>
          <p className="text-muted-foreground mb-6">
            {searchQuery || filter !== 'all'
              ? 'Try adjusting your search or filters'
              : 'Create your first quote request to get started'
            }
          </p>
          {!searchQuery && filter === 'all' && (
            <Button onClick={handleCreateQuote} size="lg">
              <Plus className="w-5 h-5 mr-2" />
              Create Your First Quote
            </Button>
          )}
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredQuotes.map(quote => (
            <QuoteCard key={quote.id} quote={quote} />
          ))}
        </div>
      )}
    </div>
  );
}
