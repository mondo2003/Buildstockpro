-- Migration: Add unique constraint for upsert functionality
-- This enables the ON CONFLICT clause to work properly

-- Add unique constraint on retailer and retailer_product_id
-- This allows upserts to work: if the same product from the same retailer exists, update it
ALTER TABLE public.scraped_prices
ADD CONSTRAINT scraped_prices_retailer_product_id_unique
UNIQUE (retailer, retailer_product_id);

-- Note: This constraint ensures that we can only have one record per retailer-product combination
-- The upsert operation will update existing records instead of creating duplicates
