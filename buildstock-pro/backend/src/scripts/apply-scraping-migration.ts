#!/usr/bin/env bun
/**
 * Apply scraped_prices migration to database
 */

import { rawQuery } from '../utils/database';

console.log('Applying scraped_prices migration...\n');

const statements = [
  // Create table
  `CREATE TABLE IF NOT EXISTS scraped_prices (
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
  )`,

  // Create indexes
  `CREATE INDEX IF NOT EXISTS idx_scraped_prices_retailer ON scraped_prices(retailer)`,
  `CREATE INDEX IF NOT EXISTS idx_scraped_prices_product_name ON scraped_prices USING GIN(to_tsvector('english', product_name))`,
  `CREATE INDEX IF NOT EXISTS idx_scraped_prices_scraped_at ON scraped_prices(scraped_at DESC)`,
  `CREATE INDEX IF NOT EXISTS idx_scraped_prices_category ON scraped_prices(category)`,
  `CREATE INDEX IF NOT EXISTS idx_scraped_prices_price ON scraped_prices(price)`,
  `CREATE INDEX IF NOT EXISTS idx_scraped_prices_retailer_product ON scraped_prices(retailer, retailer_product_id)`,
  `CREATE INDEX IF NOT EXISTS idx_scraped_prices_in_stock ON scraped_prices(in_stock)`,
  `CREATE INDEX IF NOT EXISTS idx_scraped_prices_brand ON scraped_prices(brand)`,
  `CREATE INDEX IF NOT EXISTS idx_scraped_prices_retailer_category_stock ON scraped_prices(retailer, category, in_stock)`,

  // Enable RLS
  `ALTER TABLE scraped_prices ENABLE ROW LEVEL SECURITY`,

  // RLS policies
  `DROP POLICY IF EXISTS "Service role can do anything with scraped_prices" ON scraped_prices`,
  `CREATE POLICY "Service role can do anything with scraped_prices"
    ON scraped_prices
    TO service_role
    USING (true)
    WITH CHECK (true)`,

  `DROP POLICY IF EXISTS "Public can view scraped_prices" ON scraped_prices`,
  `CREATE POLICY "Public can view scraped_prices"
    ON scraped_prices
    FOR SELECT
    TO anon
    USING (true)`,

  `DROP POLICY IF EXISTS "Authenticated users can view scraped_prices" ON scraped_prices`,
  `CREATE POLICY "Authenticated users can view scraped_prices"
    ON scraped_prices
    FOR SELECT
    TO authenticated
    USING (true)`,
];

for (let i = 0; i < statements.length; i++) {
  try {
    console.log(`[${i + 1}/${statements.length}] Executing...`);
    await rawQuery(statements[i]);
    console.log(`[${i + 1}/${statements.length}] Success`);
  } catch (error) {
    console.error(`[${i + 1}/${statements.length}] Error:`, (error as Error).message);
  }
}

console.log('\nMigration complete!');
console.log('Note: Some functions and views need to be created manually in Supabase SQL Editor.');
console.log('See: migrations/003_create_scraped_prices.sql');
