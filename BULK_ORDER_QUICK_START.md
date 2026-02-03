# Bulk Order Frontend - Quick Start Guide

## Overview
Complete bulk order system for BuildStock Pro allowing users to select products from multiple retailers and create consolidated orders.

## File Locations

### Types
- `/buildstock-pro/frontend/src/types/bulkOrder.ts` - All TypeScript interfaces

### API Service
- `/buildstock-pro/frontend/src/lib/api/bulkOrders.ts` - API client for bulk orders

### Context/State Management
- `/buildstock-pro/frontend/src/contexts/BulkOrderContext.tsx` - React context provider

### Components (11 total)
Location: `/buildstock-pro/frontend/src/components/bulk-orders/`

1. `BulkOrderStatusBadge.tsx` - Color-coded status badges
2. `AddToBulkOrderCheckbox.tsx` - Product selection checkbox
3. `BulkOrderCard.tsx` - Order card for list views
4. `BulkOrderCart.tsx` - Floating slide-out cart
5. `BulkOrderDetails.tsx` - Full order details view
6. `BulkOrderForm.tsx` - Delivery details form
7. `BulkOrderItemRow.tsx` - Individual item display
8. `BulkOrderRetailerGroup.tsx` - Items grouped by retailer
9. `BulkOrderSelector.tsx` - Product selection interface
10. `BulkOrderSummary.tsx` - Order summary sidebar
11. `ProductCardWithBulkSelect.tsx` - Enhanced product card

### Pages (3 total)
Location: `/buildstock-pro/frontend/src/app/bulk-orders/`

1. `page.tsx` - Orders list with filters and search
2. `[id]/page.tsx` - Single order details
3. `new/page.tsx` - Create new bulk order wizard

## How to Use

### 1. Import and Use Components

```tsx
// Import bulk order components
import { 
  BulkOrderCart,
  AddToBulkOrderCheckbox,
  BulkOrderCard,
  BulkOrderStatusBadge 
} from '@/components/bulk-orders';

// Import context hook
import { useBulkOrder } from '@/contexts/BulkOrderContext';

// Use in your component
function MyComponent() {
  const { selectedItems, addItem, removeItem } = useBulkOrder();
  // ...
}
```

### 2. Add to Product Cards

To enable bulk selection on product pages:

```tsx
import { ProductCardWithBulkSelect } from '@/components/bulk-orders/ProductCardWithBulkSelect';

<ProductCardWithBulkSelect
  product={product}
  showBulkSelect={true}
  scrapedPriceId={priceData.id}
  retailer={priceData.merchant}
  inStock={priceData.stock_level === 'in_stock'}
/>
```

### 3. Navigate to Bulk Orders

- **List all orders:** `Link href="/bulk-orders"`
- **Create new order:** `Link href="/bulk-orders/new"`
- **View order:** `Link href="/bulk-orders/[id]"`

### 4. API Usage

```typescript
import { bulkOrdersApi } from '@/lib/api/bulkOrders';

// Create order
const order = await bulkOrdersApi.createBulkOrder({
  delivery_location: '123 Construction Site',
  delivery_postcode: 'SW1A 1AA',
  items: [{
    scraped_price_id: 'xxx',
    quantity: 5
  }]
});

// Get all orders
const orders = await bulkOrdersApi.getBulkOrders({
  status: 'pending',
  page: 1
});

// Get single order
const order = await bulkOrdersApi.getBulkOrderById('order-id');
```

## Features

### Selection Flow
1. User checks products they want to add
2. Selected items appear in floating cart
3. User adjusts quantities in cart
4. User clicks "Proceed to Checkout"
5. User fills delivery details
6. User reviews retailer breakdown
7. User submits order

### Status Colors
- **Draft** (Gray) - Order being created
- **Pending** (Yellow) - Submitted to retailers
- **Confirmed** (Blue) - Retailers acknowledged
- **Processing** (Purple) - Being prepared
- **Ready** (Green) - Ready for pickup/delivery
- **Delivered** (Dark Green) - Completed
- **Cancelled** (Red) - Cancelled

### Form Validation
- Delivery location required
- UK postcode format validated
- At least one item required

## Testing

```bash
# Start backend
cd buildstock-pro/backend
bun run src/index.ts

# Start frontend (new terminal)
cd buildstock-pro/frontend
npm run dev

# Navigate to
http://localhost:3000/bulk-orders
```

## Integration Checklist

- [x] Types defined
- [x] API service created
- [x] Context provider added to layout
- [x] BulkOrderCart added to layout
- [ ] Product cards updated with checkboxes
- [ ] Navigation link added to header
- [ ] Authentication integrated (Clerk JWT)
- [ ] Tested with live backend

## Notes

- **State Persistence:** Selected items stored in localStorage
- **Backend API:** Works with `/api/v1/bulk-orders` endpoints
- **Responsive:** Mobile-friendly cart and forms
- **Styling:** Tailwind CSS matching existing design
- **No new dependencies:** Uses existing packages

## Support

See `/BULK_ORDER_FRONTEND_COMPLETE.md` for full documentation.
