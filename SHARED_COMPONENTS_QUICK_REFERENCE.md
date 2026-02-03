# BuildStock Pro - Shared Components Quick Reference

> Quick reference guide for all shared UI components

---

## 📦 Component Library

### Buttons (`/components/buttons/`)

| Component | Purpose | Import |
|-----------|---------|--------|
| `AddToQuoteButton` | Add to quote action | `@/components/buttons` |
| `AddToBulkOrderButton` | Bulk order selection | `@/components/buttons` |
| `ContactMerchantButton` | Contact merchant | `@/components/buttons` |
| `ProductActions` | Combined action group | `@/components/buttons` |

**Quick Example:**
```tsx
import { ProductActions } from '@/components/buttons';

<ProductActions
  compact
  onAddToQuote={handleQuote}
  onAddToBulk={handleBulk}
  onContact={handleContact}
/>
```

---

### Status (`/components/status/`)

| Component | Purpose | Import |
|-----------|---------|--------|
| `StatusBadge` | Generic status | `@/components/status` |
| `StockStatusBadge` | Stock levels | `@/components/status` |

**Quick Example:**
```tsx
import { StatusBadge, StockStatusBadge } from '@/components/status';

<StatusBadge status="pending" pulse />
<StockStatusBadge level="in-stock" quantity={50} />
```

---

### Modals (`/components/modals/`)

| Component | Purpose | Import |
|-----------|---------|--------|
| `Modal` | General modal | `@/components/modals` |
| `ConfirmModal` | Confirmation | `@/components/modals` |
| `ModalHeader`, `ModalBody`, `ModalFooter` | Custom layout | `@/components/modals` |

**Quick Example:**
```tsx
import { Modal, ConfirmModal } from '@/components/modals';

<Modal isOpen={open} onClose={close} title="Title">
  Content
</Modal>

<ConfirmModal
  isOpen={open}
  onConfirm={handleConfirm}
  title="Delete?"
  variant="danger"
/>
```

---

### Loading (`/components/loading/`)

| Component | Purpose | Import |
|-----------|---------|--------|
| `PageLoader` | Full page | `@/components/loading` |
| `CenteredLoader` | Centered | `@/components/loading` |
| `CardLoader` | Card skeleton | `@/components/loading` |
| `TableLoader` | Table skeleton | `@/components/loading` |

**Quick Example:**
```tsx
import { PageLoader, CardLoader, TableLoader } from '@/components/loading';

{loading && <PageLoader message="Loading..." />}
<CardLoader count={6} />
<TableLoader rows={10} columns={5} />
```

---

### Dashboard (`/components/dashboard/`)

| Component | Purpose | Import |
|-----------|---------|--------|
| `QuickActions` | Action widget | `@/components/dashboard/QuickActions` |
| `QuickActionsCompact` | Small widget | `@/components/dashboard/QuickActions` |
| `QuickActionsHorizontal` | Horizontal layout | `@/components/dashboard/QuickActions` |

---

## 🎣 Hooks (`/contexts/SelectionContext.tsx`)

| Hook | Purpose |
|------|---------|
| `useSelection()` | Generic selection |
| `useBulkOrder()` | Bulk order management |
| `useQuoteSelection()` | Quote management |

**Quick Example:**
```tsx
import { useBulkOrder } from '@/contexts/SelectionContext';

const {
  addToBulkOrder,
  removeFromBulkOrder,
  isInBulkOrder,
  getBulkOrderItems,
  getBulkOrderTotal,
  clearBulkOrder,
} = useBulkOrder();
```

---

## 🔧 Utilities (`/lib/api/errors.ts`)

| Function | Purpose |
|----------|---------|
| `safeApiCall()` | Safe API wrapper |
| `withRetry()` | Retry with backoff |
| `getToastForError()` | Error to toast |
| `parseApiError()` | Parse errors |
| `logError()` | Debug logging |

**Quick Example:**
```tsx
import { safeApiCall, getToastForError } from '@/lib/api/errors';

const { data, error } = await safeApiCall(
  () => api.getProducts(),
  {
    retry: { maxRetries: 3 },
    onError: (error) => {
      const toast = getToastForError(error);
      toast.error(toast.title, { description: toast.description });
    },
  }
);
```

---

## 🎨 Common Props

### Button Sizes
- `sm` - Small (compact)
- `md` - Medium (default)
- `lg` - Large

### Status Sizes
- `sm` - Small badge
- `md` - Medium badge (default)
- `lg` - Large badge

### Modal Sizes
- `sm` - Small (max-w-md)
- `md` - Medium (max-w-lg)
- `lg` - Large (max-w-2xl)
- `xl` - Extra large (max-w-4xl)
- `full` - Full width

### Status Variants
- `success` - Green (completed, approved)
- `warning` - Orange (pending, in-progress)
- `error` - Red (cancelled, failed)
- `info` - Blue (new, processing)
- `neutral` - Gray (default)

---

## 📝 Quick Integration Patterns

### Add Actions to Product Card
```tsx
import { ProductActions } from '@/components/buttons';
import { useBulkOrder } from '@/contexts/SelectionContext';

function ProductCard({ product }) {
  const bulkOrder = useBulkOrder();

  return (
    <Card>
      {/* Card content */}
      <CardFooter>
        <ProductActions
          compact
          onAddToQuote={() => addToQuote(product)}
          onAddToBulk={() => bulkOrder.addToBulkOrder(product, supplierId)}
          onContact={() => openContactModal(product)}
          bulkSelected={bulkOrder.isInBulkOrder(product.id)}
        />
      </CardFooter>
    </Card>
  );
}
```

### Show Loading State
```tsx
import { TableLoader } from '@/components/loading';

{loading ? (
  <TableLoader rows={10} columns={5} />
) : (
  <DataTable data={products} />
)}
```

### Display Status
```tsx
import { StatusBadge } from '@/components/status';

<StatusBadge
  status={quote.status}
  size="sm"
  pulse={['pending', 'in-progress'].includes(quote.status)}
/>
```

### Handle API Errors
```tsx
import { safeApiCall, getToastForError } from '@/lib/api/errors';

const handleSubmit = async () => {
  const { data, error } = await safeApiCall(() => api.submitQuote(quote));

  if (error) {
    const toast = getToastForError(error);
    toast.error(toast.title, { description: toast.description });
    return;
  }

  toast.success('Quote submitted!');
};
```

---

## 🧪 Testing

Visit `/integration-test` to see all components in action:

```bash
npm run dev
# Navigate to http://localhost:3000/integration-test
```

---

## 📚 Full Documentation

See `/FRONTEND_INTEGRATION_GUIDE.md` for complete documentation.

---

## ✅ Component Checklist

Use this checklist when integrating components:

- [ ] Import from correct path
- [ ] Pass required props
- [ ] Handle loading states
- [ ] Handle error states
- [ ] Test on mobile
- [ ] Test accessibility (keyboard, screen reader)
- [ ] Add ARIA labels if needed
- [ ] Use toast notifications for feedback
- [ ] Persist selections with context hooks
- [ ] Clear selections after use

---

**Last Updated:** 2026-02-03
**Version:** 1.0.0
