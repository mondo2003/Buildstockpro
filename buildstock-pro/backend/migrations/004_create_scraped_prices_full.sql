-- Migration: Create scraped_prices table for live price data
-- This migration creates the table needed for storing live prices from retailers

-- Enable UUID extension if not exists
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create the scraped_prices table
CREATE TABLE IF NOT EXISTS public.scraped_prices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_name TEXT NOT NULL,
  retailer TEXT NOT NULL CHECK (retailer IS NOT NULL AND retailer != ''),
  retailer_product_id TEXT,
  price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
  currency TEXT DEFAULT 'GBP' CHECK (currency IN ('GBP', 'EUR', 'USD')),
  product_url TEXT,
  image_url TEXT,
  brand TEXT,
  category TEXT,
  in_stock BOOLEAN DEFAULT TRUE,
  stock_text TEXT,
  scraped_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_scraped_prices_retailer ON public.scraped_prices(retailer);
CREATE INDEX IF NOT EXISTS idx_scraped_prices_product_name ON public.scraped_prices USING GIN(to_tsvector('english', product_name));
CREATE INDEX IF NOT EXISTS idx_scraped_prices_scraped_at ON public.scraped_prices(scraped_at DESC);
CREATE INDEX IF NOT EXISTS idx_scraped_prices_category ON public.scraped_prices(category);
CREATE INDEX IF NOT EXISTS idx_scraped_prices_price ON public.scraped_prices(price);
CREATE INDEX IF NOT EXISTS idx_scraped_prices_retailer_product ON public.scraped_prices(retailer, retailer_product_id);
CREATE INDEX IF NOT EXISTS idx_scraped_prices_in_stock ON public.scraped_prices(in_stock);
CREATE INDEX IF NOT EXISTS idx_scraped_prices_brand ON public.scraped_prices(brand);

-- Create a composite index for common queries
CREATE INDEX IF NOT EXISTS idx_scraped_prices_retailer_category_stock ON public.scraped_prices(retailer, category, in_stock);

-- Add helpful comments
COMMENT ON TABLE public.scraped_prices IS 'Live price data scraped from various hardware retailers';
COMMENT ON COLUMN public.scraped_prices.retailer IS 'Name of the retailer (e.g., screwfix, wickes, bandq)';
COMMENT ON COLUMN public.scraped_prices.retailer_product_id IS 'Product ID from the retailer''s system';
COMMENT ON COLUMN public.scraped_prices.price IS 'Current price of the product';
COMMENT ON COLUMN public.scraped_prices.currency IS 'Currency code (GBP, EUR, USD)';
COMMENT ON COLUMN public.scraped_prices.in_stock IS 'Whether the product is currently in stock';
COMMENT ON COLUMN public.scraped_prices.stock_text IS 'Raw stock status text from the retailer';
COMMENT ON COLUMN public.scraped_prices.scraped_at IS 'When this price was last scraped/verified';

-- Enable Row Level Security
ALTER TABLE public.scraped_prices ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Service role can do anything with scraped_prices" ON public.scraped_prices;
DROP POLICY IF EXISTS "Public can view scraped_prices" ON public.scraped_prices;
DROP POLICY IF EXISTS "Authenticated users can view scraped_prices" ON public.scraped_prices;

-- Create RLS policies
-- Allow service role to do everything
CREATE POLICY "Service role can do anything with scraped_prices"
  ON public.scraped_prices
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Allow anon (public) to read prices
CREATE POLICY "Public can view scraped_prices"
  ON public.scraped_prices
  FOR SELECT
  TO anon
  USING (true);

-- Allow authenticated users to read prices
CREATE POLICY "Authenticated users can view scraped_prices"
  ON public.scraped_prices
  FOR SELECT
  TO authenticated
  USING (true);

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_scraped_prices_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
DROP TRIGGER IF EXISTS trigger_update_scraped_prices_updated_at ON public.scraped_prices;
CREATE TRIGGER trigger_update_scraped_prices_updated_at
  BEFORE UPDATE ON public.scraped_prices
  FOR EACH ROW
  EXECUTE FUNCTION update_scraped_prices_updated_at();

-- Create a view for latest prices by retailer product
CREATE OR REPLACE VIEW public.latest_prices AS
SELECT DISTINCT ON (retailer, retailer_product_id)
  id,
  product_name,
  retailer,
  retailer_product_id,
  price,
  currency,
  product_url,
  image_url,
  brand,
  category,
  in_stock,
  stock_text,
  scraped_at,
  updated_at,
  created_at
FROM public.scraped_prices
ORDER BY retailer, retailer_product_id, scraped_at DESC;

COMMENT ON VIEW public.latest_prices IS 'View showing the most recent price for each unique product';
