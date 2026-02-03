# Action Features Implementation Plan
## BuildStock Pro - Quote Requests, Bulk Orders, and Merchant Contact

**Document Version:** 1.0
**Date Created:** 2026-02-03
**Last Updated:** 2026-02-03

---

## Executive Summary

This document outlines the implementation plan for three core action features that will transform BuildStock Pro from a passive search platform into an active procurement tool:

1. **Quote Request System** - Users can request custom quotes for products
2. **Bulk Order Management** - Multi-select products for bulk ordering across merchants
3. **Merchant Contact Actions** - Direct contact with local branches, distance-aware

**Priority Implementation Order:**
1. Merchant Contact Actions (Priority 1) - Leverages existing branch/location infrastructure
2. Quote Request System (Priority 2) - Foundation for bulk orders
3. Bulk Order Management (Priority 3) - Builds on quote system

---

## Current System Analysis

### Authentication Infrastructure
- **Frontend:** Clerk authentication (`@clerk/nextjs`) in `/Construction-RC/src/frontend/src/app/layout.tsx`
- **Backend:** JWT-based auth configured in `/buildstock-pro/backend/src/index.ts` (lines 114-120)
- **User Hook:** `useUser()` from Clerk provides current user data
- **User Data:** Stored in `public.users` table with Clerk integration

### Product & Search System
- **Product Route:** `/buildstock-pro/backend/src/routes/productRoutes.ts`
  - GET `/api/products` - List products with filters
  - GET `/api/products/:id` - Single product details
  - GET `/api/products/:id/listings` - Product listings
- **Search Route:** `/buildstock-pro/backend/src/routes/search.ts`
  - GET `/api/v1/search` - Advanced search with filtering
  - Supports: category, price range, in-stock, merchant IDs, sorting
- **Data Source:** `scraped_prices` table with product/merchant/listing structure

### Location & Distance Infrastructure
- **Database Schema:** `public.merchant_branches` table (PostGIS enabled)
  - Location stored as `GEOGRAPHY(POINT, 4326)` for geospatial queries
  - Fields: `merchant_id`, `branch_name`, `address`, `city`, `postcode`, `phone`, `email`, `click_and_collect`, `opens_at`, `closes_at`
- **Distance Functions:** `calculate_distance()` and `find_nearest_branches_with_product()` in migrations
- **Branch Seeding:** `/buildstock-pro/backend/src/scripts/seed-branches.ts` with real UK locations
- **Frontend Filter:** Distance slider already implemented in ProductGrid component
- **User Locations:** `public.user_locations` table for storing user coordinates

### Merchant System
- **Merchants Table:** `public.merchants` with merchant metadata
- **Merchant Routes:** `/buildstock-pro/backend/src/routes/merchants.ts`
  - GET `/api/v1/merchants` - List all merchants
  - GET `/api/v1/merchants/:id` - Single merchant details
- **Current Merchants:** Screwfix, Travis Perkins, B&Q, Wickes, Jewson, Huws Gray

### Existing Cart/Order System
- **Cart Implementation:** Frontend-only cart in `/buildstock-pro/frontend/` (CART_IMPLEMENTATION_SUMMARY.md)
- **Cart Context:** `CartContext.tsx` with localStorage persistence
- **Gap:** No backend order/quote tables yet

---

## Feature 1: Quote Request System (Priority 2)

### Overview
Users can request custom quotes for products with specific quantities, delivery locations, and notes. Quote history is tracked with status updates and email notifications.

### Database Schema Required

```sql
-- Migration: 007_create_quote_requests.sql

-- Quote requests table
CREATE TABLE IF NOT EXISTS public.quote_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    product_id UUID NOT NULL,
    merchant_id UUID REFERENCES public.merchants(id) ON DELETE CASCADE,
    branch_id UUID REFERENCES public.merchant_branches(id) ON DELETE SET NULL,

    -- Quote details
    quantity_requested INT NOT NULL DEFAULT 1,
    unit VARCHAR(50), -- e.g., "sheets", "meters", "bags"
    delivery_location TEXT,
    delivery_postcode VARCHAR(20),
    delivery_coordinates GEOGRAPHY(POINT, 4326),
    notes TEXT,

    -- Pricing (if provided by merchant)
    quoted_price DECIMAL(10, 2),
    quoted_currency VARCHAR(3) DEFAULT 'GBP',
    quoted_delivery_cost DECIMAL(10, 2),
    quoted_lead_time_days INT,
    quoted_valid_until TIMESTAMP WITH TIME ZONE,

    -- Status tracking
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN (
        'pending',      -- Awaiting merchant review
        'sent',         -- Sent to merchant
        'responded',    -- Merchant responded
        'expired',      -- Quote expired
        'accepted',     -- User accepted
        'rejected'      -- User declined
    )),

    -- Response from merchant
    merchant_response TEXT,
    response_timestamp TIMESTAMP WITH TIME ZONE,

    -- Metadata
    reference_number VARCHAR(50) UNIQUE,
    ip_address INET,
    user_agent TEXT,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Quote notifications table
CREATE TABLE IF NOT EXISTS public.quote_notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    quote_request_id UUID REFERENCES public.quote_requests(id) ON DELETE CASCADE,
    notification_type VARCHAR(50) CHECK (notification_type IN (
        'email', 'sms', 'push', 'in_app'
    )),
    recipient VARCHAR(255), -- Email or phone
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN (
        'pending', 'sent', 'delivered', 'failed'
    )),
    sent_at TIMESTAMP WITH TIME ZONE,
    delivered_at TIMESTAMP WITH TIME ZONE,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_quote_requests_user_id ON public.quote_requests(user_id);
CREATE INDEX idx_quote_requests_product_id ON public.quote_requests(product_id);
CREATE INDEX idx_quote_requests_merchant_id ON public.quote_requests(merchant_id);
CREATE INDEX idx_quote_requests_status ON public.quote_requests(status);
CREATE INDEX idx_quote_requests_created_at ON public.quote_requests(created_at DESC);
CREATE INDEX idx_quote_requests_reference ON public.quote_requests(reference_number);
CREATE INDEX idx_quote_notifications_quote_id ON public.quote_notifications(quote_request_id);

-- Trigger for updated_at
CREATE TRIGGER quote_requests_updated_at
    BEFORE UPDATE ON public.quote_requests
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to generate reference number
CREATE OR REPLACE FUNCTION generate_quote_reference()
RETURNS VARCHAR(50) AS $$
DECLARE
    ref VARCHAR(50);
    exists BOOLEAN;
BEGIN
    LOOP
        ref := 'QTE-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || UPPER(SUBSTR(ENCODE(GEN_RANDOM_BYTES(4), 'base64'), 1, 6));
        SELECT EXISTS(SELECT 1 FROM public.quote_requests WHERE reference_number = ref) INTO exists;
        IF NOT EXISTS THEN
            RETURN ref;
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate reference
CREATE TRIGGER quote_requests_generate_reference
    BEFORE INSERT ON public.quote_requests
    FOR EACH ROW
    WHEN (NEW.reference_number IS NULL)
    EXECUTE FUNCTION generate_quote_reference();

-- RLS Policies
ALTER TABLE public.quote_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quote_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own quotes"
    ON public.quote_requests FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create quotes"
    ON public.quote_requests FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own quotes"
    ON public.quote_requests FOR UPDATE
    USING (auth.uid() = user_id);

-- Admin policy for managing all quotes
CREATE POLICY "Admins can manage all quotes"
    ON public.quote_requests FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE id = auth.uid() AND role = 'admin'
        )
    );
```

### API Endpoints Required

**File:** `/buildstock-pro/backend/src/routes/quoteRequests.ts`

```typescript
import { Elysia, t } from 'elysia';
import { supabase } from '../utils/database.js';

export const quoteRequestsRoutes = new Elysia({ prefix: '/api/v1/quotes' })

// GET /api/v1/quotes - List user's quote requests with pagination
.get('/', async ({ query, bearer }) => {
    // Authentication: Extract user_id from JWT token
    const userId = getUserIdFromToken(bearer);

    const page = parseInt(query.page as string) || 1;
    const pageSize = parseInt(query.page_size as string) || 20;
    const status = query.status as string;
    const start = (page - 1) * pageSize;
    const end = start + pageSize - 1;

    let dbQuery = supabase
        .from('quote_requests')
        .select('*', { count: 'exact' })
        .eq('user_id', userId);

    if (status) {
        dbQuery = dbQuery.eq('status', status);
    }

    dbQuery = dbQuery.order('created_at', { ascending: false }).range(start, end);

    const { data, error, count } = await dbQuery;

    return {
        success: true,
        data: data || [],
        meta: {
            total: count || 0,
            page,
            pageSize,
            totalPages: Math.ceil((count || 0) / pageSize)
        }
    };
})

// GET /api/v1/quotes/:id - Get single quote request
.get('/:id', async ({ params, bearer }) => {
    const userId = getUserIdFromToken(bearer);

    const { data, error } = await supabase
        .from('quote_requests')
        .select(`
            *,
            products (*),
            merchants (*),
            merchant_branches (*)
        `)
        .eq('id', params.id)
        .eq('user_id', userId)
        .single();

    if (error) {
        return { success: false, error: error.message };
    }

    return { success: true, data };
})

// POST /api/v1/quotes - Create new quote request
.post('/', async ({ body, bearer }) => {
    const userId = getUserIdFromToken(bearer);

    const {
        product_id,
        merchant_id,
        branch_id,
        quantity_requested,
        unit,
        delivery_location,
        delivery_postcode,
        delivery_coordinates,
        notes
    } = body as any;

    // Validate product exists
    const { data: product } = await supabase
        .from('scraped_prices')
        .select('product_name, price')
        .eq('id', product_id)
        .single();

    if (!product) {
        return { success: false, error: 'Product not found' };
    }

    // Create quote request
    const { data, error } = await supabase
        .from('quote_requests')
        .insert({
            user_id: userId,
            product_id,
            merchant_id,
            branch_id,
            quantity_requested,
            unit,
            delivery_location,
            delivery_postcode,
            delivery_coordinates: delivery_coordinates
                ? `SRID=4326;POINT(${delivery_coordinates.longitude} ${delivery_coordinates.latitude})`
                : null,
            notes,
            status: 'pending',
            ip_address: null, // Set from request context
            user_agent: null
        })
        .select(`
            *,
            products (*),
            merchants (*),
            merchant_branches (*)
        `)
        .single();

    if (error) {
        return { success: false, error: error.message };
    }

    // Trigger email notification (background job)
    await sendQuoteEmailNotification(data);

    return {
        success: true,
        data,
        message: 'Quote request submitted successfully'
    };
})

// PUT /api/v1/quotes/:id - Update quote request
.put('/:id', async ({ params, body, bearer }) => {
    const userId = getUserIdFromToken(bearer);

    const { quantity_requested, delivery_location, notes, status } = body as any;

    // Validate ownership
    const { data: existing } = await supabase
        .from('quote_requests')
        .select('user_id')
        .eq('id', params.id)
        .single();

    if (!existing || existing.user_id !== userId) {
        return { success: false, error: 'Quote request not found' };
    }

    const { data, error } = await supabase
        .from('quote_requests')
        .update({
            quantity_requested,
            delivery_location,
            notes,
            status,
            updated_at: new Date().toISOString()
        })
        .eq('id', params.id)
        .select()
        .single();

    if (error) {
        return { success: false, error: error.message };
    }

    return { success: true, data };
})

// POST /api/v1/quotes/:id/accept - Accept quote
.post('/:id/accept', async ({ params, bearer }) => {
    const userId = getUserIdFromToken(bearer);

    const { data, error } = await supabase
        .from('quote_requests')
        .update({ status: 'accepted', updated_at: new Date().toISOString() })
        .eq('id', params.id)
        .eq('user_id', userId)
        .select()
        .single();

    if (error) {
        return { success: false, error: error.message };
    }

    // Create order from accepted quote
    await createOrderFromQuote(params.id);

    return { success: true, data };
})

// DELETE /api/v1/quotes/:id - Cancel/delete quote request
.delete('/:id', async ({ params, bearer }) => {
    const userId = getUserIdFromToken(bearer);

    const { error } = await supabase
        .from('quote_requests')
        .delete()
        .eq('id', params.id)
        .eq('user_id', userId);

    if (error) {
        return { success: false, error: error.message };
    }

    return { success: true, message: 'Quote request cancelled' };
});
```

### Frontend Components Required

**1. Quote Request Dialog**
- **Location:** `/Construction-RC/src/frontend/src/components/quote/quote-request-dialog.tsx`
- **Features:**
  - Modal dialog triggered from product card
  - Product details display (name, current price, merchant)
  - Quantity input with validation
  - Unit selector (sheet, meter, bag, pack)
  - Delivery location input
  - Postcode lookup with coordinates
  - Notes textarea
  - Submit/Cancel buttons
  - Loading states during submission
  - Success confirmation with reference number

```typescript
interface QuoteRequestDialogProps {
  productId: string;
  productName: string;
  merchantId: string;
  merchantName: string;
  currentPrice: number;
  onClose: () => void;
  onSuccess: (quote: QuoteRequest) => void;
}
```

**2. Quote History Page**
- **Location:** `/Construction-RC/src/frontend/src/app/profile/quotes/page.tsx`
- **Features:**
  - List of all user's quote requests
  - Status badges (pending, sent, responded, expired, accepted, rejected)
  - Filter by status
  - Sort by date, status
  - Quote details expansion
  - Accept/reject buttons for responded quotes
  - Reference number display
  - Merchant response display
  - Pagination
  - Empty state

**3. Quote Status Badge**
- **Location:** `/Construction-RC/src/frontend/src/components/quote/quote-status-badge.tsx`
- **Features:**
  - Color-coded status display
  - Status icons
  - Responsive design
  - Tooltip with status description

**4. Quote Summary Card**
- **Location:** `/Construction-RC/src/frontend/src/components/quote/quote-summary-card.tsx`
- **Features:**
  - Compact quote display
  - Product image and name
  - Quantity and unit
  - Price (if quoted)
  - Status badge
  - Action buttons (view, accept, reject)
  - Click to expand details

### Integration Points

**Product Card Integration:**
- Add "Request Quote" button to `/Construction-RC/src/frontend/src/components/product/product-card.tsx`
- Position: Next to "Add to Cart" or in action menu
- Condition: Show when logged in

**Search Results Integration:**
- Add quote request option to product listings
- Quick quote button on hover/click

**Dashboard Integration:**
- Add "Recent Quotes" section to `/Construction-RC/src/frontend/src/app/dashboard/page.tsx`
- Show pending quotes requiring action
- Quick stats: Total quotes, pending, responded

**Navigation Integration:**
- Add "Quotes" to profile navigation in `/Construction-RC/src/frontend/src/components/layout/profile-nav.tsx`

### Email Notifications

**Email Service:**
- Use Resend, SendGrid, or AWS SES
- Templates in `/buildstock-pro/backend/src/email-templates/`

**Required Emails:**
1. **Quote Confirmation** - Sent to user after submission
   - Quote reference number
   - Product and quantity details
   - Merchant info
   - Estimated response time

2. **Quote Response** - Sent to user when merchant responds
   - Quoted price
   - Delivery cost and lead time
   - Expiration date
   - Accept/reject links

3. **Quote Reminder** - Sent if no response after 48 hours
   - Gentle reminder to merchant
   - Quote details

4. **Quote Expired** - Sent when quote expires
   - Notification that quote is no longer valid
   - Option to request new quote

---

## Feature 2: Bulk Order Management (Priority 3)

### Overview
Users can multi-select products for bulk ordering across multiple retailers. System validates availability, calculates totals, and tracks order status.

### Database Schema Required

```sql
-- Migration: 008_create_bulk_orders.sql

-- Bulk orders table (header)
CREATE TABLE IF NOT EXISTS public.bulk_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,

    -- Order details
    order_number VARCHAR(50) UNIQUE NOT NULL,
    status VARCHAR(50) DEFAULT 'draft' CHECK (status IN (
        'draft',        -- Being prepared
        'submitted',    -- Sent to merchants
        'processing',   -- Merchants reviewing
        'confirmed',    -- All merchants confirmed
        'partial',      -- Some items confirmed
        'ready',        -- Ready for pickup/delivery
        'completed',    -- Fulfilled
        'cancelled'     -- Cancelled
    )),

    -- Delivery
    delivery_method VARCHAR(50) CHECK (delivery_method IN (
        'pickup', 'delivery', 'mixed'
    )),
    delivery_location TEXT,
    delivery_postcode VARCHAR(20),
    delivery_coordinates GEOGRAPHY(POINT, 4326),
    delivery_date DATE,

    -- Pricing
    subtotal DECIMAL(10, 2) DEFAULT 0,
    delivery_cost DECIMAL(10, 2) DEFAULT 0,
    vat_amount DECIMAL(10, 2) DEFAULT 0,
    total_amount DECIMAL(10, 2) DEFAULT 0,
    currency VARCHAR(3) DEFAULT 'GBP',

    -- Notes
    user_notes TEXT,
    internal_notes TEXT,

    -- Timestamps
    submitted_at TIMESTAMP WITH TIME ZONE,
    confirmed_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    cancelled_at TIMESTAMP WITH TIME ZONE,

    created_at TIMESTAMP WITH TIME ZIZE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bulk order items (line items)
CREATE TABLE IF NOT EXISTS public.bulk_order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    bulk_order_id UUID REFERENCES public.bulk_orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL,
    merchant_id UUID REFERENCES public.merchants(id) ON DELETE CASCADE,
    branch_id UUID REFERENCES public.merchant_branches(id) ON DELETE SET NULL,

    -- Product details (snapshot)
    product_name VARCHAR(500) NOT NULL,
    product_sku VARCHAR(100),
    unit_price DECIMAL(10, 2) NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    unit VARCHAR(50),

    -- Status per item
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN (
        'pending',      -- Awaiting confirmation
        'confirmed',    -- Merchant confirmed
        'out_of_stock', -- Not available
        'cancelled',    -- Item cancelled
        'ready',        -- Ready for pickup
        'picked_up'     -- Collected
    )),

    -- Response from merchant
    available_quantity INT,
    quoted_price DECIMAL(10, 2),
    quoted_lead_time_days INT,
    merchant_notes TEXT,

    -- Pricing
    line_total DECIMAL(10, 2) GENERATED ALWAYS AS (quantity * unit_price) STORED,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bulk order notifications
CREATE TABLE IF NOT EXISTS public.bulk_order_notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    bulk_order_id UUID REFERENCES public.bulk_orders(id) ON DELETE CASCADE,
    notification_type VARCHAR(50) CHECK (notification_type IN (
        'email', 'sms', 'push', 'in_app'
    )),
    recipient VARCHAR(255),
    subject VARCHAR(255),
    message TEXT,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN (
        'pending', 'sent', 'delivered', 'failed'
    )),
    sent_at TIMESTAMP WITH TIME ZONE,
    delivered_at TIMESTAMP WITH TIME ZONE,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_bulk_orders_user_id ON public.bulk_orders(user_id);
CREATE INDEX idx_bulk_orders_status ON public.bulk_orders(status);
CREATE INDEX idx_bulk_orders_created_at ON public.bulk_orders(created_at DESC);
CREATE INDEX idx_bulk_orders_order_number ON public.bulk_orders(order_number);
CREATE INDEX idx_bulk_order_items_bulk_order_id ON public.bulk_order_items(bulk_order_id);
CREATE INDEX idx_bulk_order_items_product_id ON public.bulk_order_items(product_id);
CREATE INDEX idx_bulk_order_items_merchant_id ON public.bulk_order_items(merchant_id);
CREATE INDEX idx_bulk_order_items_status ON public.bulk_order_items(status);

-- Trigger for updated_at
CREATE TRIGGER bulk_orders_updated_at
    BEFORE UPDATE ON public.bulk_orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER bulk_order_items_updated_at
    BEFORE UPDATE ON public.bulk_order_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to generate order number
CREATE OR REPLACE FUNCTION generate_bulk_order_number()
RETURNS VARCHAR(50) AS $$
DECLARE
    order_num VARCHAR(50);
    exists BOOLEAN;
BEGIN
    LOOP
        order_num := 'ORD-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || UPPER(SUBSTR(ENCODE(GEN_RANDOM_BYTES(4), 'base64'), 1, 6));
        SELECT EXISTS(SELECT 1 FROM public.bulk_orders WHERE order_number = order_num) INTO exists;
        IF NOT EXISTS THEN
            RETURN order_num;
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate order number
CREATE TRIGGER bulk_orders_generate_order_number
    BEFORE INSERT ON public.bulk_orders
    FOR EACH ROW
    WHEN (NEW.order_number IS NULL)
    EXECUTE FUNCTION generate_bulk_order_number();

-- RLS Policies
ALTER TABLE public.bulk_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bulk_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bulk_order_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own orders"
    ON public.bulk_orders FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create orders"
    ON public.bulk_orders FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own orders"
    ON public.bulk_orders FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all orders"
    ON public.bulk_orders FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE id = auth.uid() AND role = 'admin'
        )
    );
```

### API Endpoints Required

**File:** `/buildstock-pro/backend/src/routes/bulkOrders.ts`

```typescript
import { Elysia, t } from 'elysia';
import { supabase } from '../utils/database.js';

export const bulkOrdersRoutes = new Elysia({ prefix: '/api/v1/bulk-orders' })

// GET /api/v1/bulk-orders - List user's bulk orders
.get('/', async ({ query, bearer }) => {
    const userId = getUserIdFromToken(bearer);
    const page = parseInt(query.page as string) || 1;
    const pageSize = parseInt(query.page_size as string) || 20;
    const status = query.status as string;

    let dbQuery = supabase
        .from('bulk_orders')
        .select('*', { count: 'exact' })
        .eq('user_id', userId);

    if (status) {
        dbQuery = dbQuery.eq('status', status);
    }

    dbQuery = dbQuery.order('created_at', { ascending: false })
        .range((page - 1) * pageSize, page * pageSize - 1);

    const { data, error, count } = await dbQuery;

    return {
        success: true,
        data: data || [],
        meta: { total: count || 0, page, pageSize }
    };
})

// GET /api/v1/bulk-orders/:id - Get single bulk order with items
.get('/:id', async ({ params, bearer }) => {
    const userId = getUserIdFromToken(bearer);

    const { data, error } = await supabase
        .from('bulk_orders')
        .select(`
            *,
            bulk_order_items (*),
            user:user_id (id, email, full_name)
        `)
        .eq('id', params.id)
        .eq('user_id', userId)
        .single();

    if (error) {
        return { success: false, error: error.message };
    }

    return { success: true, data };
})

// POST /api/v1/bulk-orders - Create new bulk order
.post('/', async ({ body, bearer }) => {
    const userId = getUserIdFromToken(bearer);
    const { items, delivery_method, delivery_location, delivery_postcode, user_notes } = body as any;

    // Validate items
    if (!items || items.length === 0) {
        return { success: false, error: 'At least one item required' };
    }

    // Start transaction
    const { data: order, error: orderError } = await supabase
        .from('bulk_orders')
        .insert({
            user_id: userId,
            delivery_method,
            delivery_location,
            delivery_postcode,
            delivery_coordinates: null, // Calculate from postcode
            user_notes,
            status: 'draft'
        })
        .select()
        .single();

    if (orderError) {
        return { success: false, error: orderError.message };
    }

    // Insert items
    const itemsToInsert = items.map((item: any) => ({
        bulk_order_id: order.id,
        product_id: item.product_id,
        merchant_id: item.merchant_id,
        branch_id: item.branch_id || null,
        product_name: item.product_name,
        product_sku: item.product_sku,
        unit_price: item.unit_price,
        quantity: item.quantity,
        unit: item.unit
    }));

    const { error: itemsError } = await supabase
        .from('bulk_order_items')
        .insert(itemsToInsert);

    if (itemsError) {
        // Rollback order
        await supabase.from('bulk_orders').delete().eq('id', order.id);
        return { success: false, error: itemsError.message };
    }

    // Calculate totals
    await calculateOrderTotals(order.id);

    return { success: true, data: order };
})

// PUT /api/v1/bulk-orders/:id - Update bulk order
.put('/:id', async ({ params, body, bearer }) => {
    const userId = getUserIdFromToken(bearer);
    const { delivery_method, delivery_location, user_notes } = body as any;

    const { data, error } = await supabase
        .from('bulk_orders')
        .update({
            delivery_method,
            delivery_location,
            user_notes,
            updated_at: new Date().toISOString()
        })
        .eq('id', params.id)
        .eq('user_id', userId)
        .select()
        .single();

    if (error) {
        return { success: false, error: error.message };
    }

    return { success: true, data };
})

// POST /api/v1/bulk-orders/:id/submit - Submit order to merchants
.post('/:id/submit', async ({ params, bearer }) => {
    const userId = getUserIdFromToken(bearer);

    // Validate ownership and status
    const { data: order } = await supabase
        .from('bulk_orders')
        .select('*')
        .eq('id', params.id)
        .eq('user_id', userId)
        .single();

    if (!order || order.status !== 'draft') {
        return { success: false, error: 'Order cannot be submitted' };
    }

    // Update status
    const { data, error } = await supabase
        .from('bulk_orders')
        .update({
            status: 'submitted',
            submitted_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        })
        .eq('id', params.id)
        .select()
        .single();

    if (error) {
        return { success: false, error: error.message };
    }

    // Send notifications to merchants
    await notifyMerchantsAboutOrder(params.id);

    return { success: true, data };
})

// POST /api/v1/bulk-orders/:id/items/:itemId - Update item status
.post('/:id/items/:itemId', async ({ params, body, bearer }) => {
    const userId = getUserIdFromToken(bearer);

    const { available_quantity, quoted_price, status, merchant_notes } = body as any;

    const { data, error } = await supabase
        .from('bulk_order_items')
        .update({
            available_quantity,
            quoted_price,
            status,
            merchant_notes,
            updated_at: new Date().toISOString()
        })
        .eq('id', params.itemId)
        .eq('bulk_order_id', params.id)
        .select()
        .single();

    if (error) {
        return { success: false, error: error.message };
    }

    // Recalculate order totals
    await calculateOrderTotals(params.id);

    return { success: true, data };
})

// DELETE /api/v1/bulk-orders/:id - Cancel order
.delete('/:id', async ({ params, bearer }) => {
    const userId = getUserIdFromToken(bearer);

    const { error } = await supabase
        .from('bulk_orders')
        .update({
            status: 'cancelled',
            cancelled_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        })
        .eq('id', params.id)
        .eq('user_id', userId);

    if (error) {
        return { success: false, error: error.message };
    }

    return { success: true, message: 'Order cancelled' };
});

// Helper function to calculate order totals
async function calculateOrderTotals(orderId: string) {
    const { data: items } = await supabase
        .from('bulk_order_items')
        .select('unit_price, quantity')
        .eq('bulk_order_id', orderId);

    const subtotal = items?.reduce((sum, item) =>
        sum + (item.unit_price * item.quantity), 0) || 0;

    const delivery_cost = 0; // Calculate based on delivery method
    const vat_amount = subtotal * 0.20; // 20% VAT
    const total_amount = subtotal + delivery_cost + vat_amount;

    await supabase
        .from('bulk_orders')
        .update({ subtotal, delivery_cost, vat_amount, total_amount })
        .eq('id', orderId);
}
```

### Frontend Components Required

**1. Bulk Order Builder**
- **Location:** `/Construction-RC/src/frontend/src/components/bulk-order/bulk-order-builder.tsx`
- **Features:**
  - Multi-select products from search results
  - Add to bulk order cart
  - Quantity adjustment per product
  - Branch selection per product
  - Remove items
  - Live order summary
  - Merchant grouping
  - Validation (stock, distance)
  - Save as draft
  - Submit order button

**2. Bulk Order Summary Panel**
- **Location:** `/Construction-RC/src/frontend/src/components/bulk-order/bulk-order-summary.tsx`
- **Features:**
  - Sticky sidebar panel
  - Item count
  - Subtotal, VAT, delivery, total
  - Merchant breakdown
  - Delivery method selector
  - Location picker
  - Notes input
  - Submit button with loading state

**3. Bulk Orders History Page**
- **Location:** `/Construction-RC/src/frontend/src/app/profile/orders/page.tsx`
- **Features:**
  - List of all bulk orders
  - Status badges
  - Filter by status
  - Sort by date, total
  - Order number display
  - Quick view summary
  - Click to view details
  - Pagination
  - Empty state

**4. Bulk Order Details Page**
- **Location:** `/Construction-RC/src/frontend/src/app/profile/orders/[id]/page.tsx`
- **Features:**
  - Full order details
  - Items list with status
  - Merchant grouping
  - Pricing breakdown
  - Delivery information
  - Timeline/status tracker
  - Action buttons (cancel, modify)
  - Print/export PDF
  - Share with merchant

**5. Order Status Tracker**
- **Location:** `/Construction-RC/src/frontend/src/components/bulk-order/order-status-tracker.tsx`
- **Features:**
  - Visual timeline
  - Status steps with icons
  - Progress bar
  - Estimated completion
  - Status descriptions

**6. Product Selectable Card**
- **Location:** `/Construction-RC/src/frontend/src/components/product/selectable-product-card.tsx`
- **Features:**
  - Checkbox for selection
  - Quantity input
  - Add to bulk order button
  - Bulk mode toggle
  - Batch selection
  - Select all functionality

### Integration Points

**Search Results Integration:**
- Add "Bulk Select" mode toggle to search page
- Show checkboxes on product cards in bulk mode
- "Add Selected to Bulk Order" button

**Cart Integration:**
- "Create Bulk Order from Cart" option
- Transfer cart items to bulk order

**Dashboard Integration:**
- "Active Orders" section
- Quick stats: Orders pending, ready, completed

**Navigation Integration:**
- Add "Orders" to profile navigation

### Order Validation

**Stock Validation:**
- Check real-time stock for each item
- Warn about low/out of stock items
- Suggest alternatives

**Merchant Validation:**
- Group items by merchant
- Check merchant distance
- Validate pickup/delivery options

**Location Validation:**
- Calculate distances to branches
- Validate delivery postcode
- Check if items available within radius

---

## Feature 3: Merchant Contact Actions (Priority 1)

### Overview
Users can contact merchants about specific products, find local branches by location with distance filtering, view branch contact details, and use click-to-call or email functionality.

### Database Schema Enhancements

**No new tables required** - Uses existing:
- `public.merchant_branches` (already exists with all required fields)
- `public.user_locations` (for storing user's preferred locations)
- `public.merchant_contact_log` (new - for tracking contact attempts)

```sql
-- Migration: 010_create_merchant_contact_log.sql

-- Optional: Track contact attempts for analytics
CREATE TABLE IF NOT EXISTS public.merchant_contact_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    merchant_id UUID REFERENCES public.merchants(id) ON DELETE CASCADE,
    branch_id UUID REFERENCES public.merchant_branches(id) ON DELETE SET NULL,
    product_id UUID,

    contact_method VARCHAR(50) CHECK (contact_method IN (
        'email', 'phone', 'directions', 'website'
    )),

    -- Context
    referring_product_name VARCHAR(500),
    user_location GEOGRAPHY(POINT, 4326),
    distance_to_branch_km DECIMAL(10, 2),

    -- Analytics
    ip_address INET,
    user_agent TEXT,
    referrer TEXT,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_merchant_contact_log_user_id ON public.merchant_contact_log(user_id);
CREATE INDEX idx_merchant_contact_log_merchant_id ON public.merchant_contact_log(merchant_id);
CREATE INDEX idx_merchant_contact_log_created_at ON public.merchant_contact_log(created_at DESC);

-- RLS
ALTER TABLE public.merchant_contact_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own contact logs"
    ON public.merchant_contact_log FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create contact logs"
    ON public.merchant_contact_log FOR INSERT
    WITH CHECK (auth.uid() = user_id);
```

### API Endpoints Required

**File:** `/buildstock-pro/backend/src/routes/merchantContact.ts`

```typescript
import { Elysia } from 'elysia';
import { supabase } from '../utils/database.js';

export const merchantContactRoutes = new Elysia({ prefix: '/api/v1/merchant-contact' })

// GET /api/v1/merchant-contact/branches - Find branches near location
.get('/branches', async ({ query }) => {
    const {
        merchant_id,
        latitude,
        longitude,
        radius_km = 50,
        limit = 10
    } = query as any;

    if (!latitude || !longitude) {
        return { success: false, error: 'Latitude and longitude required' };
    }

    // PostGIS distance query
    const { data, error } = await supabase.rpc('find_branches_by_distance', {
        merchant_id_param: merchant_id,
        user_lat: latitude,
        user_lng: longitude,
        max_distance_km: radius_km,
        limit_count: limit
    });

    if (error) {
        return { success: false, error: error.message };
    }

    return {
        success: true,
        data: data || [],
        meta: {
            center: { latitude, longitude },
            radius: radius_km
        }
    };
})

// GET /api/v1/merchant-contact/branches/:id - Get branch details
.get('/branches/:id', async ({ params }) => {
    const { data, error } = await supabase
        .from('merchant_branches')
        .select(`
            *,
            merchants (*)
        `)
        .eq('id', params.id)
        .single();

    if (error) {
        return { success: false, error: error.message };
    }

    return { success: true, data };
})

// GET /api/v1/merchant-contact/nearest/:productId - Find nearest branches with product
.get('/nearest/:productId', async ({ params, query }) => {
    const {
        latitude,
        longitude,
        radius_km = 50,
        limit = 5
    } = query as any;

    if (!latitude || !longitude) {
        return { success: false, error: 'Latitude and longitude required' };
    }

    // Use existing function find_nearest_branches_with_product
    const { data, error } = await supabase.rpc(
        'find_nearest_branches_with_product',
        {
            user_lat: latitude,
            user_lng: longitude,
            product_id_param: params.productId,
            max_distance_km: radius_km,
            limit_count: limit
        }
    );

    if (error) {
        return { success: false, error: error.message };
    }

    return { success: true, data: data || [] };
})

// POST /api/v1/merchant-contact/log - Log contact attempt
.post('/log', async ({ body, bearer }) => {
    const userId = getUserIdFromToken(bearer);
    const {
        merchant_id,
        branch_id,
        product_id,
        contact_method,
        referring_product_name,
        user_location
    } = body as any;

    const { data, error } = await supabase
        .from('merchant_contact_log')
        .insert({
            user_id: userId,
            merchant_id,
            branch_id,
            product_id,
            contact_method,
            referring_product_name,
            user_location: user_location
                ? `SRID=4326;POINT(${user_location.longitude} ${user_location.latitude})`
                : null,
            ip_address: null,
            user_agent: null
        })
        .select()
        .single();

    if (error) {
        return { success: false, error: error.message };
    }

    return { success: true, data };
});
```

**PostGIS Function (if not exists):**

```sql
-- Add to migrations if not present
CREATE OR REPLACE FUNCTION find_branches_by_distance(
    merchant_id_param UUID,
    user_lat DECIMAL,
    user_lng DECIMAL,
    max_distance_km INT DEFAULT 50,
    limit_count INT DEFAULT 10
)
RETURNS TABLE (
    branch_id UUID,
    branch_name VARCHAR,
    merchant_id UUID,
    merchant_name VARCHAR,
    address TEXT,
    city VARCHAR,
    postcode VARCHAR,
    phone VARCHAR,
    email VARCHAR,
    opens_at TIME,
    closes_at TIME,
    click_and_collect BOOLEAN,
    distance_km DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        mb.id as branch_id,
        mb.branch_name,
        mb.merchant_id,
        m.name as merchant_name,
        mb.address,
        mb.city,
        mb.postcode,
        mb.phone,
        mb.email,
        mb.opens_at,
        mb.closes_at,
        mb.click_and_collect,
        ST_Distance(
            mb.location,
            ST_SetSRID(ST_MakePoint(user_lng, user_lat), 4326)::geography
        ) / 1000 as distance_km
    FROM merchant_branches mb
    JOIN merchants m ON mb.merchant_id = m.id
    WHERE mb.merchant_id = merchant_id_param
        AND mb.is_active = true
        AND mb.location IS NOT NULL
        AND ST_DWithin(
            mb.location,
            ST_SetSRID(ST_MakePoint(user_lng, user_lat), 4326)::geography,
            max_distance_km * 1000
        )
    ORDER BY mb.location <-> ST_SetSRID(ST_MakePoint(user_lng, user_lat), 4326)::geography
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;
```

### Frontend Components Required

**1. Branch Finder Component**
- **Location:** `/Construction-RC/src/frontend/src/components/merchant/branch-finder.tsx`
- **Features:**
  - Location picker (use existing `location-picker.tsx`)
  - Merchant selector dropdown
  - Distance radius slider (5, 10, 25, 50, 100 km)
  - Search button
  - Loading state
  - Results list with distances
  - Sort by distance
  - Map view (optional, using Leaflet or Google Maps)
  - "Get Directions" button (opens Google Maps)

```typescript
interface BranchFinderProps {
  merchantId?: string;
  onBranchSelect?: (branch: Branch) => void;
  initialLatitude?: number;
  initialLongitude?: number;
}
```

**2. Branch Contact Card**
- **Location:** `/Construction-RC/src/frontend/src/components/merchant/branch-contact-card.tsx`
- **Features:**
  - Branch name and merchant logo
  - Address with map link
  - Phone number with "Click to Call"
  - Email with "Send Email"
  - Opening hours display
  - Distance badge
  - Click & collect badge
  - "Get Directions" button
  - "View Products at This Branch" link

**3. Product Branch Availability**
- **Location:** `/Construction-RC/src/frontend/src/components/merchant/product-branch-availability.tsx`
- **Features:**
  - Shows which branches have product
  - Stock levels per branch
  - Distances to branches
  - Contact buttons per branch
  - Reserve at branch button
  - Expandable branch details

```typescript
interface ProductBranchAvailabilityProps {
  productId: string;
  productName: string;
  userLatitude: number;
  userLongitude: number;
  radiusKm?: number;
}
```

**4. Merchant Contact Dialog**
- **Location:** `/Construction-RC/src/frontend/src/components/merchant/merchant-contact-dialog.tsx`
- **Features:**
  - Modal dialog
  - Product context (name, SKU)
  - Contact reason selector
  - Message textarea
  - Contact method (email/phone preference)
  - Branch selector
  - Send button
  - Success confirmation

```typescript
interface MerchantContactDialogProps {
  productId: string;
  productName: string;
  merchantId: string;
  merchantName: string;
  onClose: () => void;
}
```

**5. Click-to-Call Button**
- **Location:** `/Construction-RC/src/frontend/src/components/merchant/click-to-call-button.tsx`
- **Features:**
  - Phone number display
  - Click initiates call (`tel:`)
  - Desktop: shows number
  - Mobile: tap to call
  - Tracks contact attempt
  - Loading state during log

**6. Branch Selector Dropdown**
- **Location:** `/Construction-RC/src/frontend/src/components/merchant/branch-selector.tsx`
- **Features:**
  - Searchable dropdown
  - Shows distance
  - Shows stock status
  - Shows address
  - Grouped by distance (nearby, other)

### Integration Points

**Product Page Integration:**
- Add "Find Local Branches" section to product detail page
- Show nearest branches with stock
- Add "Contact Merchant" button
- Integrate with existing `/Construction-RC/src/frontend/src/app/product/[id]/page.tsx`

**Search Results Integration:**
- Add "View at Branch" button to product cards
- Show distance badge to nearest branch
- Quick contact actions in hover menu

**Merchant Page Integration:**
- Add branch finder to merchant detail pages
- List all branches with map
- Filter by distance

**Profile/Settings Integration:**
- Add "Default Location" to user preferences
- Save frequently used locations (home, work, sites)
- Use saved location for distance calculations

**Header Integration:**
- Add location selector to header
- Quick access to change search location
- Affects all distance calculations

### Maps Integration (Optional Enhancement)

**Using Leaflet (Free, Open Source):**
- Component: `/Construction-RC/src/frontend/src/components/maps/branch-map.tsx`
- Features:
  - Interactive map with branch markers
  - User location marker
  - Click marker for branch details
  - Cluster markers for zoom
  - Radius circle
  - Draw delivery area

**Using Google Maps API:**
- More features but requires API key
- Better mobile experience
- Street view integration
- Real-time traffic for directions

### Distance Calculation Flow

1. **User Location Detection:**
   - Browser Geolocation API
   - Manual postcode entry
   - Saved user locations

2. **Distance Query:**
   - Send user lat/lng to API
   - PostGIS calculates distances
   - Returns sorted branches

3. **Display:**
   - Show distance badges (e.g., "2.3 km away")
   - Sort results by distance
   - Filter by radius

4. **Interaction:**
   - Click "Get Directions" → Opens Google Maps with directions
   - Click "Call Branch" → Initiates phone call
   - Click "Email Branch" → Opens mail client

---

## Shared Components & Utilities

### Authentication Hook
**Location:** `/Construction-RC/src/frontend/src/hooks/use-auth.ts`

```typescript
import { useUser } from '@clerk/nextjs';
import { useQuery } from '@tanstack/react-query';

export function useAuth() {
  const { user, isLoaded: isUserLoaded } = useUser();

  const { data: dbUser, isLoading } = useQuery({
    queryKey: ['current-user', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const response = await fetch('/api/v1/user/me', {
        headers: {
          Authorization: `Bearer ${await user.getToken()}`
        }
      });
      return response.json();
    },
    enabled: !!user?.id
  });

  return {
    user: dbUser,
    clerkUser: user,
    isAuthenticated: !!user,
    isLoading: isLoading || !isUserLoaded,
    token: user?.getToken ? () => user.getToken() : null
  };
}
```

### API Client with Auth
**Location:** `/Construction-RC/src/frontend/src/lib/api-client.ts`

```typescript
import { useAuth } from '@/hooks/use-auth';

export async function authenticatedFetch(url: string, options?: RequestInit) {
  const { token } = useAuth();
  const authToken = await token?.();

  return fetch(url, {
    ...options,
    headers: {
      ...options?.headers,
      Authorization: `Bearer ${authToken}`
    }
  });
}
```

### Toast Notifications
Use existing Sonner toast from cart implementation

### Loading States
Use existing Skeleton components

### Error Handling
Use existing error boundary and error states

---

## Implementation Timeline

### Phase 1: Merchant Contact Actions (Priority 1) - 2 Weeks
**Week 1:**
- Database migration for contact log
- API endpoints for branch finder
- Branch Finder component
- Branch Contact Card component
- Click-to-call button

**Week 2:**
- Product Branch Availability component
- Merchant Contact Dialog
- Integration with product pages
- Integration with search results
- Testing and bug fixes

### Phase 2: Quote Request System (Priority 2) - 3 Weeks
**Week 1:**
- Database migration for quote requests
- API endpoints for quotes
- Quote Request Dialog component
- Basic email templates

**Week 2:**
- Quote History page
- Quote Status Badge component
- Quote Summary Card component
- Integration with product cards
- Dashboard integration

**Week 3:**
- Email notification service setup
- All email templates
- Notification tracking
- Testing end-to-end flow
- Bug fixes and refinements

### Phase 3: Bulk Order Management (Priority 3) - 4 Weeks
**Week 1:**
- Database migration for bulk orders
- API endpoints for bulk orders
- Bulk Order Builder component
- Product selectable cards

**Week 2:**
- Bulk Order Summary Panel
- Bulk Orders History page
- Order Status Tracker
- Validation logic

**Week 3:**
- Bulk Order Details page
- Email notifications for orders
- Merchant notification system
- Order management features

**Week 4:**
- Integration with search results
- Integration with cart
- Dashboard integration
- Testing and bug fixes
- Performance optimization

---

## Dependencies

### New Backend Dependencies
```json
{
  "@sendgrid/mail": "^8.0.0",
  "nodemailer": "^6.9.0",
  "@aws-sdk/client-ses": "^3.0.0"
}
```

### New Frontend Dependencies
```json
{
  "leaflet": "^1.9.0",
  "react-leaflet": "^4.2.0",
  "@types/leaflet": "^1.9.0"
}
```

---

## Security Considerations

### Authentication
- All quote and order endpoints require valid JWT token
- Clerk provides user authentication
- Token validation on every protected endpoint

### Authorization
- Users can only access their own quotes/orders
- RLS policies enforced at database level
- Admin role check for admin functions

### Data Privacy
- User locations stored securely
- Contact details not exposed publicly
- IP addresses logged for fraud prevention
- GDPR compliance for personal data

### Input Validation
- Validate all user inputs
- Sanitize notes and messages
- Prevent SQL injection (parameterized queries)
- Rate limiting on quote/order creation

### Payment Security (Future)
- Never store full card details
- Use Stripe/PayPal for payment processing
- PCI compliance if handling payments
- Secure order confirmation emails

---

## Performance Optimization

### Database Indexes
- All foreign keys indexed
- Composite indexes for common queries
- PostGIS GIST indexes for location queries
- Partial indexes for filtered queries

### Caching
- Cache product details in Redis
- Cache branch location results
- Cache user permissions
- CDN for static assets

### Pagination
- All list endpoints paginate
- Limit to 20-50 items per page
- Cursor-based pagination for large datasets

### Lazy Loading
- Load quote/order details on demand
- Infinite scroll for history pages
- Lazy load images in lists

### Background Jobs
- Email notifications sent asynchronously
- Order totals calculated in background
- Merchant notifications queued

---

## Testing Strategy

### Unit Tests
- Quote/order validation logic
- Distance calculations
- Status transitions
- Email templates

### Integration Tests
- API endpoint testing
- Database operations
- Authentication flow
- Notification sending

### E2E Tests
- Complete quote request flow
- Complete bulk order flow
- Merchant contact flow
- Multi-user scenarios

### Load Tests
- 1000+ concurrent quote requests
- Bulk order with 100+ items
- Branch finder with 10,000+ branches
- Email notification throughput

---

## Success Metrics

### User Engagement
- Number of quote requests per week
- Quote acceptance rate
- Bulk order conversion rate
- Merchant contact attempts

### Business Metrics
- Average quote value
- Average order value
- Merchant response time
- User satisfaction scores

### Technical Metrics
- API response time < 200ms
- Email delivery rate > 99%
- Database query optimization
- Error rate < 0.1%

---

## Future Enhancements

### Phase 4 Features
- **Multi-merchant quotes** - Request quotes from multiple merchants simultaneously
- **Quote comparison** - Side-by-side quote comparison tool
- **Order scheduling** - Schedule future orders and deliveries
- **Recurring orders** - Auto-repeat bulk orders
- **Merchant messaging** - In-app messaging with merchants
- **Document generation** - PDF quotes, invoices, purchase orders
- **Payment integration** - Stripe/PayPal for online payments
- **Inventory sync** - Real-time inventory updates from merchants
- **Delivery tracking** - Track delivery status
- **Mobile apps** - Native iOS and Android apps

### Advanced Features
- **AI-powered recommendations** - Suggest products based on order history
- **Price predictions** - Predict price changes using ML
- **Bulk upload** - CSV upload for bulk orders
- **API access** - REST API for B2B integration
- **Webhooks** - Real-time notifications for merchants
- **White-label** - Custom branding for merchants
- **Multi-currency** - Support for international orders
- **Multi-language** - Support for non-UK merchants

---

## Conclusion

This implementation plan provides a comprehensive roadmap for adding quote requests, bulk orders, and merchant contact features to BuildStock Pro. The features are designed to:

1. **Leverage existing infrastructure** - Use current authentication, product, and location systems
2. **Prioritize for quick wins** - Start with merchant contacts (easiest, highest value)
3. **Build incrementally** - Each feature builds on the previous one
4. **Maintain scalability** - Database schema and APIs designed for growth
5. **Ensure security** - Authentication, authorization, and data privacy throughout
6. **Optimize performance** - Indexing, caching, and async operations
7. **Enable testing** - Clear testing strategy at all levels

The suggested implementation timeline is 9 weeks total, with features delivered incrementally to allow for user feedback and iteration.

---

**Next Steps:**
1. Review and approve this plan
2. Set up development/test environments
3. Begin Phase 1: Merchant Contact Actions
4. Establish code review processes
5. Create issue tickets in project management tool
6. Assign tasks to development team

**Questions or Clarifications:**
- Email service preference (SendGrid, AWS SES, Resend)?
- Maps provider preference (Google Maps, Leaflet)?
- Priority adjustments based on business needs?
- Additional features or requirements?
