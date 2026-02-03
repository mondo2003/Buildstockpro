-- Migration: Add unit_price and specifications fields
-- This migration enhances the scraped_prices table with unit pricing and product specifications

-- Add unit_price column for price per unit (e.g., per meter, per kg)
ALTER TABLE public.scraped_prices
ADD COLUMN IF NOT EXISTS unit_price DECIMAL(10,2);

-- Add unit_type column to specify what the price is per (e.g., 'each', 'meter', 'kg', 'sqm', 'litre')
ALTER TABLE public.scraped_prices
ADD COLUMN IF NOT EXISTS unit_type TEXT CHECK (unit_type IN ('each', 'meter', 'kg', 'sqm', 'litre', 'pack', 'pair', 'set', 'tonne', 'm2', 'm3'));

-- Add specifications column for JSON product details (dimensions, materials, etc.)
ALTER TABLE public.scraped_prices
ADD COLUMN IF NOT EXISTS specifications JSONB;

-- Add is_sale column to track if item is on sale
ALTER TABLE public.scraped_prices
ADD COLUMN IF NOT EXISTS is_sale BOOLEAN DEFAULT FALSE;

-- Add was_price column to show original price before sale
ALTER TABLE public.scraped_prices
ADD COLUMN IF NOT EXISTS was_price DECIMAL(10,2);

-- Add product_description for detailed product information
ALTER TABLE public.scraped_prices
ADD COLUMN IF NOT EXISTS product_description TEXT;

-- Add manufacturer_sku for better product identification
ALTER TABLE public.scraped_prices
ADD COLUMN IF NOT EXISTS manufacturer_sku TEXT;

-- Add barcode/EAN for product identification
ALTER TABLE public.scraped_prices
ADD COLUMN IF NOT EXISTS barcode TEXT;

-- Create indexes for new fields
CREATE INDEX IF NOT EXISTS idx_scraped_prices_unit_price ON public.scraped_prices(unit_price);
CREATE INDEX IF NOT EXISTS idx_scraped_prices_unit_type ON public.scraped_prices(unit_type);
CREATE INDEX IF NOT EXISTS idx_scraped_prices_is_sale ON public.scraped_prices(is_sale);
CREATE INDEX IF NOT EXISTS idx_scraped_prices_barcode ON public.scraped_prices(barcode);
CREATE INDEX IF NOT EXISTS idx_scraped_prices_manufacturer_sku ON public.scraped_prices(manufacturer_sku);

-- Create a GIN index for specifications JSONB
CREATE INDEX IF NOT EXISTS idx_scraped_prices_specifications ON public.scraped_prices USING GIN(specifications);

-- Add comments
COMMENT ON COLUMN public.scraped_prices.unit_price IS 'Unit price (e.g., price per meter, per kg)';
COMMENT ON COLUMN public.scraped_prices.unit_type IS 'Unit type: each, meter, kg, sqm, litre, pack, pair, set, tonne, m2, m3';
COMMENT ON COLUMN public.scraped_prices.specifications IS 'Product specifications as JSONB (dimensions, materials, features)';
COMMENT ON COLUMN public.scraped_prices.is_sale IS 'Whether the product is currently on sale';
COMMENT ON COLUMN public.scraped_prices.was_price IS 'Original price before sale (if applicable)';
COMMENT ON COLUMN public.scraped_prices.product_description IS 'Detailed product description';
COMMENT ON COLUMN public.scraped_prices.manufacturer_sku IS 'Manufacturer SKU for product identification';
COMMENT ON COLUMN public.scraped_prices.barcode IS 'Product barcode/EAN/UPC';
