-- Migration: Bulk Orders System
-- This migration creates tables for managing bulk orders across multiple retailers

-- ============================================
-- Table: bulk_orders
-- Main orders table containing order metadata
-- ============================================
CREATE TABLE IF NOT EXISTS public.bulk_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  order_number TEXT UNIQUE NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'pending', 'confirmed', 'processing', 'ready', 'delivered', 'cancelled')),
  total_items INTEGER DEFAULT 0,
  total_retailers INTEGER DEFAULT 0,
  estimated_total DECIMAL(12,2) DEFAULT 0.00,
  delivery_location TEXT,
  delivery_postcode TEXT,
  customer_notes TEXT,
  internal_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for bulk_orders
CREATE INDEX IF NOT EXISTS idx_bulk_orders_user_id ON public.bulk_orders(user_id);
CREATE INDEX IF NOT EXISTS idx_bulk_orders_status ON public.bulk_orders(status);
CREATE INDEX IF NOT EXISTS idx_bulk_orders_order_number ON public.bulk_orders(order_number);
CREATE INDEX IF NOT EXISTS idx_bulk_orders_created_at ON public.bulk_orders(created_at DESC);

-- Add comments
COMMENT ON TABLE public.bulk_orders IS 'Bulk construction material orders across multiple retailers';
COMMENT ON COLUMN public.bulk_orders.order_number IS 'Auto-generated order number in format BULK-YYYY-######';
COMMENT ON COLUMN public.bulk_orders.status IS 'Order status: draft, pending, confirmed, processing, ready, delivered, cancelled';
COMMENT ON COLUMN public.bulk_orders.total_items IS 'Total number of items in the order';
COMMENT ON COLUMN public.bulk_orders.total_retailers IS 'Number of different retailers in the order';
COMMENT ON COLUMN public.bulk_orders.estimated_total IS 'Estimated total cost of all items';
COMMENT ON COLUMN public.bulk_orders.delivery_location IS 'Delivery address/location';
COMMENT ON COLUMN public.bulk_orders.delivery_postcode IS 'UK postcode for delivery';
COMMENT ON COLUMN public.bulk_orders.customer_notes IS 'Notes provided by the customer';
COMMENT ON COLUMN public.bulk_orders.internal_notes IS 'Internal notes for staff (not visible to customer)';

-- ============================================
-- Table: bulk_order_items
-- Individual items within a bulk order
-- ============================================
CREATE TABLE IF NOT EXISTS public.bulk_order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bulk_order_id UUID NOT NULL REFERENCES public.bulk_orders(id) ON DELETE CASCADE,
  scraped_price_id UUID NOT NULL REFERENCES public.scraped_prices(id) ON DELETE RESTRICT,
  product_name TEXT NOT NULL,
  retailer TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  in_stock BOOLEAN DEFAULT TRUE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for bulk_order_items
CREATE INDEX IF NOT EXISTS idx_bulk_order_items_bulk_order_id ON public.bulk_order_items(bulk_order_id);
CREATE INDEX IF NOT EXISTS idx_bulk_order_items_scraped_price_id ON public.bulk_order_items(scraped_price_id);
CREATE INDEX IF NOT EXISTS idx_bulk_order_items_retailer ON public.bulk_order_items(retailer);

-- Add comments
COMMENT ON TABLE public.bulk_order_items IS 'Individual items within a bulk order';
COMMENT ON COLUMN public.bulk_order_items.scraped_price_id IS 'Reference to the price listing this item is based on';
COMMENT ON COLUMN public.bulk_order_items.quantity IS 'Quantity ordered';
COMMENT ON COLUMN public.bulk_order_items.unit_price IS 'Price per unit at time of ordering';
COMMENT ON COLUMN public.bulk_order_items.total_price IS 'Total price for this item (quantity × unit_price)';
COMMENT ON COLUMN public.bulk_order_items.in_stock IS 'Stock status at time of ordering';
COMMENT ON COLUMN public.bulk_order_items.notes IS 'Item-specific notes (e.g., special requirements)';

-- ============================================
-- Table: bulk_order_retailers
-- Retailer groupings within bulk orders
-- ============================================
CREATE TABLE IF NOT EXISTS public.bulk_order_retailers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bulk_order_id UUID NOT NULL REFERENCES public.bulk_orders(id) ON DELETE CASCADE,
  retailer TEXT NOT NULL,
  item_count INTEGER NOT NULL DEFAULT 0,
  retailer_total DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  retailer_status TEXT NOT NULL DEFAULT 'pending' CHECK (retailer_status IN ('pending', 'acknowledged', 'preparing', 'ready')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for bulk_order_retailers
CREATE INDEX IF NOT EXISTS idx_bulk_order_retailers_bulk_order_id ON public.bulk_order_retailers(bulk_order_id);
CREATE INDEX IF NOT EXISTS idx_bulk_order_retailers_retailer ON public.bulk_order_retailers(retailer);
CREATE INDEX IF NOT EXISTS idx_bulk_order_retailers_status ON public.bulk_order_retailers(retailer_status);

-- Add unique constraint to prevent duplicate retailer entries per order
CREATE UNIQUE INDEX IF NOT EXISTS idx_bulk_order_retailers_unique ON public.bulk_order_retailers(bulk_order_id, retailer);

-- Add comments
COMMENT ON TABLE public.bulk_order_retailers IS 'Retailer groupings within bulk orders for tracking sub-orders';
COMMENT ON COLUMN public.bulk_order_retailers.item_count IS 'Number of items from this retailer';
COMMENT ON COLUMN public.bulk_order_retailers.retailer_total IS 'Total cost for this retailer';
COMMENT ON COLUMN public.bulk_order_retailers.retailer_status IS 'Status for this retailer: pending, acknowledged, preparing, ready';

-- ============================================
-- Trigger: Update updated_at timestamp
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_bulk_orders_updated_at
  BEFORE UPDATE ON public.bulk_orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bulk_order_retailers_updated_at
  BEFORE UPDATE ON public.bulk_order_retailers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Enable Row Level Security (RLS)
-- ============================================
ALTER TABLE public.bulk_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bulk_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bulk_order_retailers ENABLE ROW LEVEL SECURITY;

-- Users can only access their own orders
CREATE POLICY "Users can view own bulk orders"
  ON public.bulk_orders FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own bulk orders"
  ON public.bulk_orders FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own bulk orders"
  ON public.bulk_orders FOR UPDATE
  USING (user_id = auth.uid());

-- Users can view items from their own orders
CREATE POLICY "Users can view own bulk order items"
  ON public.bulk_order_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.bulk_orders
      WHERE bulk_orders.id = bulk_order_items.bulk_order_id
      AND bulk_orders.user_id = auth.uid()
    )
  );

-- Users can insert items into their own orders
CREATE POLICY "Users can insert items into own bulk orders"
  ON public.bulk_order_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.bulk_orders
      WHERE bulk_orders.id = bulk_order_items.bulk_order_id
      AND bulk_orders.user_id = auth.uid()
    )
  );

-- Users can update items in their own orders
CREATE POLICY "Users can update items in own bulk orders"
  ON public.bulk_order_items FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.bulk_orders
      WHERE bulk_orders.id = bulk_order_items.bulk_order_id
      AND bulk_orders.user_id = auth.uid()
    )
  );

-- Users can delete items from their own orders
CREATE POLICY "Users can delete items from own bulk orders"
  ON public.bulk_order_items FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.bulk_orders
      WHERE bulk_orders.id = bulk_order_items.bulk_order_id
      AND bulk_orders.user_id = auth.uid()
    )
  );

-- Users can view retailer groupings from their own orders
CREATE POLICY "Users can view own bulk order retailers"
  ON public.bulk_order_retailers FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.bulk_orders
      WHERE bulk_orders.id = bulk_order_retailers.bulk_order_id
      AND bulk_orders.user_id = auth.uid()
    )
  );

-- Service role has full access (for background jobs, etc.)
CREATE POLICY "Service role full access on bulk_orders"
  ON public.bulk_orders FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access on bulk_order_items"
  ON public.bulk_order_items FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access on bulk_order_retailers"
  ON public.bulk_order_retailers FOR ALL
  USING (auth.role() = 'service_role');
