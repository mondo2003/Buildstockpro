'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { FileText, ShoppingCart, MessageSquare, Check, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Shared Action Buttons for BuildStock Pro
 * Used across Quotes, Bulk Orders, and Contact Merchant features
 */

// Size variants
export type ButtonSize = 'sm' | 'md' | 'lg';

// Base action button props
interface BaseActionButtonProps {
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
  className?: string;
  fullWidth?: boolean;
  children?: React.ReactNode;
}

// Add to Quote Button
export interface AddToQuoteButtonProps extends BaseActionButtonProps {
  onClick?: () => void;
  added?: boolean;
  showIcon?: boolean;
}

export function AddToQuoteButton({
  size = 'md',
  loading = false,
  disabled = false,
  added = false,
  showIcon = true,
  className,
  fullWidth = false,
  onClick,
  children,
}: AddToQuoteButtonProps) {
  const sizeClasses = {
    sm: 'text-xs h-8 px-3',
    md: 'text-sm h-9 px-4',
    lg: 'text-base h-10 px-6',
  };

  return (
    <Button
      onClick={onClick}
      disabled={disabled || loading}
      variant={added ? 'secondary' : 'default'}
      className={cn(
        'gap-2 transition-all',
        sizeClasses[size],
        fullWidth && 'w-full',
        added && 'bg-accent hover:bg-accent text-white',
        className
      )}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : added ? (
        <Check className="w-4 h-4" />
      ) : showIcon ? (
        <FileText className="w-4 h-4" />
      ) : null}
      {children || (added ? 'Added to Quote' : 'Add to Quote')}
    </Button>
  );
}

// Add to Bulk Order Button
export interface AddToBulkOrderButtonProps extends Omit<BaseActionButtonProps, 'children'> {
  selected?: boolean;
  onToggle?: () => void;
  checkboxMode?: boolean;
}

export function AddToBulkOrderButton({
  size = 'sm',
  loading = false,
  disabled = false,
  selected = false,
  checkboxMode = true,
  className,
  fullWidth = false,
  onToggle,
}: AddToBulkOrderButtonProps) {
  if (checkboxMode) {
    return (
      <button
        onClick={onToggle}
        disabled={disabled || loading}
        className={cn(
          'flex items-center gap-2 rounded-md border transition-all',
          'hover:bg-accent/5 hover:border-accent/30',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          selected && 'bg-accent/10 border-accent text-accent',
          size === 'sm' && 'px-2 py-1 text-xs',
          size === 'md' && 'px-3 py-2 text-sm',
          size === 'lg' && 'px-4 py-3 text-base',
          fullWidth && 'w-full justify-center',
          className
        )}
        aria-label={selected ? 'Remove from bulk order' : 'Add to bulk order'}
      >
        {loading ? (
          <Loader2 className="w-3 h-3 animate-spin" />
        ) : (
          <div
            className={cn(
              'w-4 h-4 rounded border flex items-center justify-center transition-colors',
              selected
                ? 'bg-accent border-accent'
                : 'border-gray-300 bg-white'
            )}
          >
            {selected && <Check className="w-3 h-3 text-white" />}
          </div>
        )}
        <span className={selected ? 'font-medium' : ''}>
          {selected ? 'Selected' : 'Add to Bulk'}
        </span>
      </button>
    );
  }

  return (
    <Button
      onClick={onToggle}
      disabled={disabled || loading}
      variant={selected ? 'secondary' : 'outline'}
      className={cn(
        'gap-2 transition-all',
        size === 'sm' && 'text-xs h-8 px-3',
        size === 'md' && 'text-sm h-9 px-4',
        size === 'lg' && 'text-base h-10 px-6',
        selected && 'bg-accent hover:bg-accent text-white border-accent',
        fullWidth && 'w-full',
        className
      )}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : selected ? (
        <Check className="w-4 h-4" />
      ) : (
        <ShoppingCart className="w-4 h-4" />
      )}
      {selected ? 'Added to Bulk Order' : 'Add to Bulk Order'}
    </Button>
  );
}

// Contact Merchant Button
export interface ContactMerchantButtonProps extends BaseActionButtonProps {
  onClick?: () => void;
  variant?: 'default' | 'outline' | 'ghost' | 'link';
  merchantName?: string;
}

export function ContactMerchantButton({
  size = 'sm',
  loading = false,
  disabled = false,
  variant = 'outline',
  merchantName,
  className,
  fullWidth = false,
  onClick,
  children,
}: ContactMerchantButtonProps) {
  const sizeClasses = {
    sm: 'text-xs h-8 px-3',
    md: 'text-sm h-9 px-4',
    lg: 'text-base h-10 px-6',
  };

  return (
    <Button
      onClick={onClick}
      disabled={disabled || loading}
      variant={variant}
      className={cn(
        'gap-2 transition-all',
        sizeClasses[size],
        fullWidth && 'w-full',
        className
      )}
      aria-label={merchantName ? `Contact ${merchantName}` : 'Contact merchant'}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <MessageSquare className="w-4 h-4" />
      )}
      {children || 'Contact Merchant'}
    </Button>
  );
}

// Compact action button group (for product cards)
export interface ProductActionsProps {
  onAddToQuote?: () => void;
  onAddToBulk?: () => void;
  onContact?: () => void;
  quoteAdded?: boolean;
  bulkSelected?: boolean;
  loadingQuote?: boolean;
  loadingBulk?: boolean;
  loadingContact?: boolean;
  disabled?: boolean;
  compact?: boolean;
  className?: string;
}

export function ProductActions({
  onAddToQuote,
  onAddToBulk,
  onContact,
  quoteAdded = false,
  bulkSelected = false,
  loadingQuote = false,
  loadingBulk = false,
  loadingContact = false,
  disabled = false,
  compact = true,
  className,
}: ProductActionsProps) {
  if (compact) {
    return (
      <div className={cn('flex items-center gap-1.5', className)}>
        {onAddToBulk && (
          <AddToBulkOrderButton
            size="sm"
            checkboxMode
            selected={bulkSelected}
            loading={loadingBulk}
            disabled={disabled}
            onToggle={onAddToBulk}
          />
        )}
        {onContact && (
          <ContactMerchantButton
            size="sm"
            variant="ghost"
            loading={loadingContact}
            disabled={disabled}
            onClick={onContact}
          />
        )}
        {onAddToQuote && (
          <AddToQuoteButton
            size="sm"
            variant="outline"
            added={quoteAdded}
            loading={loadingQuote}
            disabled={disabled}
            onClick={onAddToQuote}
            showIcon={!quoteAdded}
          >
            {quoteAdded ? <Check className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
          </AddToQuoteButton>
        )}
      </div>
    );
  }

  return (
    <div className={cn('flex items-center gap-2 flex-wrap', className)}>
      {onAddToQuote && (
        <AddToQuoteButton
          size="md"
          added={quoteAdded}
          loading={loadingQuote}
          disabled={disabled}
          onClick={onAddToQuote}
        />
      )}
      {onAddToBulk && (
        <AddToBulkOrderButton
          size="md"
          selected={bulkSelected}
          loading={loadingBulk}
          disabled={disabled}
          checkboxMode={false}
          onToggle={onAddToBulk}
        />
      )}
      {onContact && (
        <ContactMerchantButton
          size="md"
          loading={loadingContact}
          disabled={disabled}
          onClick={onContact}
        />
      )}
    </div>
  );
}

// Export all components
export default {
  AddToQuoteButton,
  AddToBulkOrderButton,
  ContactMerchantButton,
  ProductActions,
};
