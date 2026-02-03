#!/usr/bin/env bun
/**
 * Apply unique constraint migration to scraped_prices table
 */

console.log(`
========================================
  Apply Unique Constraint Migration
========================================

Please run the following SQL in your Supabase SQL Editor:

https://app.supabase.com/project/xrhlumtimbmglzrfrnnk/sql

--- COPY FROM HERE ---

-- Add unique constraint on retailer and retailer_product_id
-- This enables the upsert functionality (ON CONFLICT)
ALTER TABLE public.scraped_prices
ADD CONSTRAINT scraped_prices_retailer_product_id_unique
UNIQUE (retailer, retailer_product_id);

--- END COPY ---

After running this SQL, the test script should work correctly!
`);

console.log("Opening browser...");
import { exec } from 'child_process';

// Try to open the SQL editor
const url = 'https://app.supabase.com/project/xrhlumtimbmglzrfrnnk/sql';
exec(`open "${url}"`);
