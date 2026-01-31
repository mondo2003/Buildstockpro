-- Migration: Create scraped_prices table
-- Description: Store live price data from various retailers

-- Create the scraped_prices table
CREATE TABLE IF NOT EXISTS scraped_prices (
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
CREATE INDEX IF NOT EXISTS idx_scraped_prices_retailer ON scraped_prices(retailer);
CREATE INDEX IF NOT EXISTS idx_scraped_prices_product_name ON scraped_prices USING GIN(to_tsvector('english', product_name));
CREATE INDEX IF NOT EXISTS idx_scraped_prices_scraped_at ON scraped_prices(scraped_at DESC);
CREATE INDEX IF NOT EXISTS idx_scraped_prices_category ON scraped_prices(category);
CREATE INDEX IF NOT EXISTS idx_scraped_prices_price ON scraped_prices(price);
CREATE INDEX IF NOT EXISTS idx_scraped_prices_retailer_product ON scraped_prices(retailer, retailer_product_id);
CREATE INDEX IF NOT EXISTS idx_scraped_prices_in_stock ON scraped_prices(in_stock);
CREATE INDEX IF NOT EXISTS idx_scraped_prices_brand ON scraped_prices(brand);

-- Create a composite index for common queries
CREATE INDEX IF NOT EXISTS idx_scraped_prices_retailer_category_stock ON scraped_prices(retailer, category, in_stock);

-- Add helpful comments
COMMENT ON TABLE scraped_prices IS 'Live price data scraped from various hardware retailers';
COMMENT ON COLUMN scraped_prices.retailer IS 'Name of the retailer (e.g., screwfix, wickes, bandq)';
COMMENT ON COLUMN scraped_prices.retailer_product_id IS 'Product ID from the retailer\'s system';
COMMENT ON COLUMN scraped_prices.price IS 'Current price of the product';
COMMENT ON COLUMN scraped_prices.currency IS 'Currency code (GBP, EUR, USD)';
COMMENT ON COLUMN scraped_prices.in_stock IS 'Whether the product is currently in stock';
COMMENT ON COLUMN scraped_prices.stock_text IS 'Raw stock status text from the retailer';
COMMENT ON COLUMN scraped_prices.scraped_at IS 'When this price was last scraped/verified';

-- Enable Row Level Security
ALTER TABLE scraped_prices ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Allow service role to do everything
CREATE POLICY "Service role can do anything with scraped_prices"
  ON scraped_prices
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Allow anon (public) to read prices
CREATE POLICY "Public can view scraped_prices"
  ON scraped_prices
  FOR SELECT
  TO anon
  USING (true);

-- Allow authenticated users to read prices
CREATE POLICY "Authenticated users can view scraped_prices"
  ON scraped_prices
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
CREATE TRIGGER trigger_update_scraped_prices_updated_at
  BEFORE UPDATE ON scraped_prices
  FOR EACH ROW
  EXECUTE FUNCTION update_scraped_prices_updated_at();

-- Create a view for latest prices by retailer product
CREATE OR REPLACE VIEW latest_prices AS
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
FROM scraped_prices
ORDER BY retailer, retailer_product_id, scraped_at DESC;

COMMENT ON VIEW latest_prices IS 'View showing the most recent price for each unique product';

-- Create a function to get price history for a product
CREATE OR REPLACE FUNCTION get_price_history(
  p_retailer TEXT,
  p_product_id TEXT,
  p_days INTEGER DEFAULT 30
)
RETURNS TABLE (
  price DECIMAL,
  scraped_at TIMESTAMP WITH TIME ZONE,
  in_stock BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    sp.price,
    sp.scraped_at,
    sp.in_stock
  FROM scraped_prices sp
  WHERE sp.retailer = p_retailer
    AND sp.retailer_product_id = p_product_id
    AND sp.scraped_at > NOW() - (p_days || ' days')::INTERVAL
  ORDER BY sp.scraped_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Create a function to compare prices across retailers
CREATE OR REPLACE FUNCTION compare_prices(
  p_product_name TEXT
)
RETURNS TABLE (
  retailer TEXT,
  price DECIMAL,
  in_stock BOOLEAN,
  product_url TEXT,
  scraped_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT DISTINCT ON (retailer)
    sp.retailer,
    sp.price,
    sp.in_stock,
    sp.product_url,
    sp.scraped_at
  FROM scraped_prices sp
  WHERE sp.product_name ILIKE '%' || p_product_name || '%'
    AND sp.scraped_at > NOW() - INTERVAL '7 days'
  ORDER BY sp.retailer, sp.scraped_at DESC, sp.price ASC;
END;
$$ LANGUAGE plpgsql;
