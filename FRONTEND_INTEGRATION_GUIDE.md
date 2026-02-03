# Frontend Integration Guide

## Shared UI Components & Integration Points

This guide explains how to use the shared UI components created for BuildStock Pro. These components are designed to be reusable across the Quotes, Bulk Orders, and Contact Merchant features.

---

## Table of Contents

1. [Button Components](#button-components)
2. [Status Badges](#status-badges)
3. [Modals](#modals)
4. [Loading Components](#loading-components)
5. [Selection Context](#selection-context)
6. [Navigation Updates](#navigation-updates)
7. [API Error Handling](#api-error-handling)
8. [Integration Examples](#integration-examples)

---

## Button Components

**Location:** `/components/buttons/ActionButtons.tsx`

### Add to Quote Button

Used for adding products to quotes.

```tsx
import { AddToQuoteButton } from '@/components/buttons/ActionButtons';

function MyComponent() {
  const [added, setAdded] = useState(false);
  const [loading, setLoading] = useState(false);

  return (
    <AddToQuoteButton
      size="md"                    // sm | md | lg
      added={added}                // Show success state
      loading={loading}            // Show loading spinner
      disabled={false}             // Disable button
      showIcon={true}              // Show icon
      onClick={async () => {
        setLoading(true);
        await addToQuoteAPI();
        setAdded(true);
        setLoading(false);
      }}
    >
      Custom Text                  // Optional: overrides default text
    </AddToQuoteButton>
  );
}
```

### Add to Bulk Order Button

Used for adding products to bulk orders.

**Checkbox Mode (Compact):**
```tsx
import { AddToBulkOrderButton } from '@/components/buttons/ActionButtons';

function ProductCard() {
  const { isSelected, toggleProduct } = useBulkOrder();

  return (
    <AddToBulkOrderButton
      size="sm"
      checkboxMode={true}          // Shows as checkbox
      selected={isSelected(productId)}
      onToggle={() => toggleProduct(product, supplierId)}
    />
  );
}
```

**Button Mode:**
```tsx
<AddToBulkOrderButton
  checkboxMode={false}
  selected={false}
  onClick={handleAddToBulk}
/>
```

### Contact Merchant Button

Used for initiating contact with merchants.

```tsx
import { ContactMerchantButton } from '@/components/buttons/ActionButtons';

<ContactMerchantButton
  size="sm"                       // sm | md | lg
  variant="outline"               // default | outline | ghost | link
  loading={false}
  onClick={handleContact}
  merchantName="BuildBase"        // For accessibility
/>
```

### Product Actions Group

Combines all action buttons in one component.

```tsx
import { ProductActions } from '@/components/buttons/ActionButtons';

<ProductActions
  compact={true}                  // Compact mode for cards
  onAddToQuote={handleQuote}
  onAddToBulk={handleBulk}
  onContact={handleContact}
  quoteAdded={false}
  bulkSelected={false}
  loadingQuote={false}
  loadingBulk={false}
  loadingContact={false}
/>
```

---

## Status Badges

**Location:** `/components/status/StatusBadge.tsx`

### Basic Usage

```tsx
import { StatusBadge } from '@/components/status/StatusBadge';

<StatusBadge
  status="pending"                // Auto-detects variant
  size="md"                       // sm | md | lg
  showDot={true}                  // Show colored dot
  pulse={false}                   // Animate dot
/>
```

### Manual Variant

```tsx
<StatusBadge
  status="Custom Status"
  variant="success"               // success | warning | error | info | neutral
  size="md"
  showDot
  pulse
/>
```

### Pre-configured Badges

```tsx
import { StockStatusBadge } from '@/components/status/StatusBadge';

<StockStatusBadge
  level="in-stock"               // in-stock | low-stock | out-of-stock
  quantity={50}                  // Optional: show quantity
  size="sm"
/>
```

### Common Status Types

```tsx
// Quote statuses
<StatusBadge status="draft" />
<StatusBadge status="submitted" pulse />
<StatusBadge status="approved" />
<StatusBadge status="rejected" />

// Order statuses
<StatusBadge status="pending" pulse />
<StatusBadge status="in-progress" pulse />
<StatusBadge status="completed" />
<StatusBadge status="cancelled" />

// Contact request statuses
<StatusBadge status="new" />
<StatusBadge status="responded" />
```

---

## Modals

**Location:** `/components/modals/Modal.tsx`

### Basic Modal

```tsx
import { Modal } from '@/components/modals/Modal';

function MyComponent() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>Open Modal</Button>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Modal Title"
        description="Modal description"
        size="md"                   // sm | md | lg | xl | full
        showCloseButton={true}
        closeOnBackdropClick={true}
        closeOnEscape={true}
        footer={
          <>
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleConfirm}>
              Confirm
            </Button>
          </>
        }
      >
        <p>Modal body content goes here.</p>
      </Modal>
    </>
  );
}
```

### Confirm Modal

```tsx
import { ConfirmModal } from '@/components/modals/Modal';

<ConfirmModal
  isOpen={showConfirm}
  onClose={() => setShowConfirm(false)}
  onConfirm={async () => {
    await deleteItem();
    setShowConfirm(false);
  }}
  title="Delete Item?"
  message="This action cannot be undone."
  confirmText="Delete"
  cancelText="Cancel"
  variant="danger"                // danger | warning | info
  isLoading={deleting}
/>
```

### Custom Layout

```tsx
import { ModalHeader, ModalBody, ModalFooter } from '@/components/modals/Modal';

<Modal isOpen={isOpen} onClose={onClose} size="lg">
  <ModalHeader
    title="Custom Title"
    description="Custom description"
    onClose={onClose}
  />
  <ModalBody>
    <div>Your custom content</div>
  </ModalBody>
  <ModalFooter align="space-between">
    <div>Left content</div>
    <div className="flex gap-2">
      <Button variant="outline" onClick={onClose}>Cancel</Button>
      <Button onClick={onConfirm}>Confirm</Button>
    </div>
  </ModalFooter>
</Modal>
```

---

## Loading Components

**Location:** `/components/loading/`

### Page Loader

```tsx
import { PageLoader } from '@/components/loading/PageLoader';

{loading && <PageLoader message="Loading..." />}
```

### Centered Loader

```tsx
import { CenteredLoader } from '@/components/loading/PageLoader';

<div className="min-h-[200px]">
  {loading ? (
    <CenteredLoader message="Loading data..." />
  ) : (
    <div>Your content</div>
  )}
</div>
```

### Card Loader

```tsx
import { CardLoader } from '@/components/loading/CardLoader';

{loading ? (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
    <CardLoader count={6} />
  </div>
) : (
  <ProductGrid products={products} />
)}
```

### Table Loader

```tsx
import { TableLoader } from '@/components/loading/TableLoader';

{loading ? (
  <TableLoader rows={10} columns={5} showHeader />
) : (
  <DataTable data={data} />
)}
```

### Button Loader

```tsx
import { ButtonLoader } from '@/components/loading/ButtonLoader';

<Button disabled={loading}>
  {loading && <ButtonLoader size="md" />}
  {loading ? 'Loading...' : 'Submit'}
</Button>
```

---

## Selection Context

**Location:** `/contexts/SelectionContext.tsx`

The Selection Context is already wrapped in the app layout. Use these hooks:

### useSelection (Generic)

```tsx
import { useSelection } from '@/contexts/SelectionContext';

function MyComponent() {
  const {
    selectedCount,
    isSelected,
    selectProduct,
    deselectProduct,
    toggleProduct,
    clearSelection,
    getSelectedProducts,
    getTotalEstimatedCost,
  } = useSelection();

  return (
    <div>
      <p>Selected: {selectedCount}</p>
      <Button onClick={() => toggleProduct(product, supplierId)}>
        Toggle Selection
      </Button>
    </div>
  );
}
```

### useBulkOrder (Bulk Order Specific)

```tsx
import { useBulkOrder } from '@/contexts/SelectionContext';

function BulkOrderPage() {
  const {
    addToBulkOrder,
    removeFromBulkOrder,
    isInBulkOrder,
    getBulkOrderItems,
    getBulkOrderTotal,
    clearBulkOrder,
  } = useBulkOrder();

  return (
    <div>
      <p>Total: £{getBulkOrderTotal().toFixed(2)}</p>
      <p>Items: {getBulkOrderItems().length}</p>
    </div>
  );
}
```

### useQuoteSelection (Quote Specific)

```tsx
import { useQuoteSelection } from '@/contexts/SelectionContext';

function QuotePage() {
  const {
    addToQuote,
    removeFromQuote,
    isInQuote,
    getQuoteItems,
    getQuoteTotal,
    clearQuote,
  } = useQuoteSelection();

  // Similar API to useBulkOrder
}
```

---

## Navigation Updates

Navigation links have been added to the Header component:

**Location:** `/components/Header.tsx`

The header now includes an "Actions" dropdown with:
- Quotes (`/quotes`)
- Bulk Orders (`/bulk-orders`)
- Contact Requests (`/contact-requests`)

### Adding New Navigation Items

Edit `/components/Header.tsx`:

```tsx
const actionLinks = [
  { href: '/quotes', label: 'Quotes' },
  { href: '/bulk-orders', label: 'Bulk Orders' },
  { href: '/contact-requests', label: 'Contact Requests' },
  // Add new items here
];
```

---

## API Error Handling

**Location:** `/lib/api/errors.ts`

### Basic Usage

```tsx
import { safeApiCall, getToastForError } from '@/lib/api/errors';
import { toast } from 'sonner';

async function fetchData() {
  const { data, error } = await safeApiCall(
    () => api.getProducts(),
    {
      retry: { maxRetries: 3 },
      onError: (error) => {
        const toastConfig = getToastForError(error);
        toast.error(toastConfig.title, {
          description: toastConfig.description,
        });
      },
    }
  );

  if (data) {
    // Handle success
  }

  if (error) {
    // Handle error (toast already shown)
  }
}
```

### Manual Error Handling

```tsx
import { parseApiError, getUserFriendlyMessage, logError } from '@/lib/api/errors';

try {
  await api.createOrder(orderData);
} catch (error) {
  const apiError = parseApiError(error);
  logError(apiError, 'createOrder');

  toast.error(getUserFriendlyMessage(apiError));
}
```

---

## Integration Examples

### Example 1: Adding Actions to Product Card

Edit `/components/ProductCard.tsx`:

```tsx
import { ProductActions } from '@/components/buttons/ActionButtons';
import { useBulkOrder } from '@/contexts/SelectionContext';

export function ProductCard({ product }: ProductCardProps) {
  const bulkOrder = useBulkOrder();

  return (
    <Card>
      {/* Existing card content */}

      <CardFooter>
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            {/* Price display */}
          </div>

          {/* Add action buttons */}
          <ProductActions
            compact
            onAddToQuote={() => handleAddToQuote(product)}
            onAddToBulk={() => bulkOrder.addToBulkOrder(product, supplierId)}
            onContact={() => handleContactMerchant(product)}
            quoteAdded={isInQuote(product.id)}
            bulkSelected={bulkOrder.isInBulkOrder(product.id)}
          />
        </div>
      </CardFooter>
    </Card>
  );
}
```

### Example 2: Creating a Quote Page

```tsx
'use client';

import { useState } from 'react';
import { useQuoteSelection } from '@/contexts/SelectionContext';
import { StatusBadge } from '@/components/status/StatusBadge';
import { AddToQuoteButton } from '@/components/buttons/ActionButtons';
import { TableLoader } from '@/components/loading/TableLoader';
import { Modal } from '@/components/modals/Modal';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function QuotePage() {
  const {
    getQuoteItems,
    getQuoteTotal,
    clearQuote,
    removeFromQuote,
  } = useQuoteSelection();

  const [loading, setLoading] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const items = getQuoteItems();
  const total = getQuoteTotal();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">My Quote</h1>
        {items.length > 0 && (
          <Button onClick={() => setShowConfirmModal(true)}>
            Submit Quote
          </Button>
        )}
      </div>

      {loading ? (
        <TableLoader rows={5} columns={4} />
      ) : items.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No items in quote</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Quote Items ({items.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.product.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <h3 className="font-medium">{item.product.name}</h3>
                    <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <p className="font-semibold">£{(item.product.price * item.quantity).toFixed(2)}</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFromQuote(item.product.id)}
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-6 border-t">
              <div className="flex items-center justify-between">
                <span className="text-lg font-semibold">Total</span>
                <span className="text-2xl font-bold">£{total.toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <ConfirmModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={async () => {
          setLoading(true);
          await submitQuote(items);
          clearQuote();
          setLoading(false);
          setShowConfirmModal(false);
        }}
        title="Submit Quote?"
        message={`Are you sure you want to submit this quote for £${total.toFixed(2)}?`}
        confirmText="Submit Quote"
        variant="info"
        isLoading={loading}
      />
    </div>
  );
}
```

---

## Testing

Visit `/integration-test` to see all components in action:

```bash
# Start development server
cd buildstock-pro/frontend
npm run dev

# Navigate to
http://localhost:3000/integration-test
```

---

## File Structure

```
frontend/
├── components/
│   ├── buttons/
│   │   └── ActionButtons.tsx           # All action button components
│   ├── status/
│   │   └── StatusBadge.tsx             # Status badge components
│   ├── modals/
│   │   └── Modal.tsx                   # Modal components
│   ├── loading/
│   │   ├── PageLoader.tsx              # Page and centered loaders
│   │   ├── CardLoader.tsx              # Card skeleton loaders
│   │   ├── ButtonLoader.tsx            # Button loading spinner
│   │   └── TableLoader.tsx             # Table skeleton loaders
│   └── dashboard/
│       └── QuickActions.tsx            # Quick actions widget
├── contexts/
│   └── SelectionContext.tsx            # Product selection context
├── lib/
│   └── api/
│       └── errors.ts                   # Error handling utilities
└── app/
    └── integration-test/
        └── page.tsx                    # Component testing page
```

---

## Component Props Reference

### ActionButtons Props

| Component | Prop | Type | Default | Description |
|-----------|------|------|---------|-------------|
| `AddToQuoteButton` | `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Button size |
| | `loading` | `boolean` | `false` | Show loading state |
| | `added` | `boolean` | `false` | Show success state |
| | `showIcon` | `boolean` | `true` | Show icon |
| `AddToBulkOrderButton` | `checkboxMode` | `boolean` | `true` | Show as checkbox |
| | `selected` | `boolean` | `false` | Selection state |
| `ContactMerchantButton` | `variant` | `Button variant` | `'outline'` | Button style |
| | `merchantName` | `string` | - | For accessibility |
| `ProductActions` | `compact` | `boolean` | `true` | Compact layout |

### StatusBadge Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `status` | `string` | - | Status text |
| `variant` | `'success' \| 'warning' \| 'error' \| 'info' \| 'neutral'` | Auto-detected | Color variant |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Badge size |
| `showDot` | `boolean` | `true` | Show colored dot |
| `pulse` | `boolean` | `false` | Animate dot |

### Modal Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `isOpen` | `boolean` | - | Show modal |
| `onClose` | `() => void` | - | Close handler |
| `size` | `'sm' \| 'md' \| 'lg' \| 'xl' \| 'full'` | `'md'` | Modal size |
| `title` | `string` | - | Modal title |
| `closeOnBackdropClick` | `boolean` | `true` | Click outside to close |
| `closeOnEscape` | `boolean` | `true` | ESC to close |

---

## Best Practices

1. **Always provide loading states** - Users should see feedback during async operations
2. **Use appropriate button variants** - Match button style to action importance
3. **Add ARIA labels** - Improve accessibility for screen readers
4. **Handle errors gracefully** - Use toast notifications with clear messages
5. **Persist selections** - Selection context uses localStorage automatically
6. **Test on mobile** - All components are responsive by default
7. **Clear selection after use** - Call `clearSelection()` after submitting orders/quotes

---

## Support

For questions or issues:
1. Check the integration test page at `/integration-test`
2. Review component source code for detailed comments
3. Refer to this guide for usage examples

---

**Last Updated:** 2026-02-03
**Version:** 1.0.0
