-- Migration: Quote/Request System
-- This migration creates the database schema for the quote and request system
-- allowing users to create quotes, add items, and receive responses from merchants

-- Create quotes table
CREATE TABLE IF NOT EXISTS quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'responded', 'expired', 'cancelled')),
  title TEXT NOT NULL,
  delivery_location TEXT,
  delivery_postcode VARCHAR(20),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  response_deadline TIMESTAMP WITH TIME ZONE
);

-- Create quote_items table
CREATE TABLE IF NOT EXISTS quote_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_id UUID NOT NULL REFERENCES quotes(id) ON DELETE CASCADE,
  scraped_price_id UUID REFERENCES scraped_prices(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  retailer TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  unit_price DECIMAL(10, 2) NOT NULL CHECK (unit_price >= 0),
  total_price DECIMAL(10, 2) NOT NULL CHECK (total_price >= 0),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create quote_responses table
CREATE TABLE IF NOT EXISTS quote_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_id UUID NOT NULL REFERENCES quotes(id) ON DELETE CASCADE,
  responder_name TEXT NOT NULL,
  responder_email TEXT NOT NULL,
  response_message TEXT,
  quoted_total DECIMAL(10, 2) CHECK (quoted_total >= 0),
  valid_until TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for quotes
CREATE INDEX IF NOT EXISTS idx_quotes_user_id ON quotes(user_id);
CREATE INDEX IF NOT EXISTS idx_quotes_status ON quotes(status);
CREATE INDEX IF NOT EXISTS idx_quotes_created_at ON quotes(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_quotes_expires_at ON quotes(expires_at);

-- Create indexes for quote_items
CREATE INDEX IF NOT EXISTS idx_quote_items_quote_id ON quote_items(quote_id);
CREATE INDEX IF NOT EXISTS idx_quote_items_scraped_price_id ON quote_items(scraped_price_id);

-- Create indexes for quote_responses
CREATE INDEX IF NOT EXISTS idx_quote_responses_quote_id ON quote_responses(quote_id);
CREATE INDEX IF NOT EXISTS idx_quote_responses_created_at ON quote_responses(created_at DESC);

-- Add trigger to update updated_at timestamp on quotes
CREATE OR REPLACE FUNCTION update_quotes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_quotes_updated_at
  BEFORE UPDATE ON quotes
  FOR EACH ROW
  EXECUTE FUNCTION update_quotes_updated_at();

-- Add comments for documentation
COMMENT ON TABLE quotes IS 'Stores quote requests from users for construction materials';
COMMENT ON TABLE quote_items IS 'Stores individual items within a quote request';
COMMENT ON TABLE quote_responses IS 'Stores responses from merchants to quote requests';

COMMENT ON COLUMN quotes.status IS 'pending: draft, sent: sent to merchants, responded: has merchant response, expired: past expiration date, cancelled: cancelled by user';
COMMENT ON COLUMN quotes.expires_at IS 'Optional expiration date for the quote request';
COMMENT ON COLUMN quotes.response_deadline IS 'Deadline for merchants to respond';

COMMENT ON COLUMN quote_items.scraped_price_id IS 'Reference to the scraped price if item is from our database';
COMMENT ON COLUMN quote_items.total_price IS 'Calculated as quantity * unit_price';

COMMENT ON COLUMN quote_responses.quoted_total IS 'Total price quoted by the merchant';
COMMENT ON COLUMN quote_responses.valid_until IS 'Expiration date for the quoted price';
