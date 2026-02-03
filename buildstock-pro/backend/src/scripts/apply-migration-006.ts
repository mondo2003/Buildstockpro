/**
 * Apply migration 006: Add unit_price and specifications fields
 */

import { supabase } from '../utils/database';

async function applyMigration() {
  console.log('Applying migration 006: Add unit_price and specifications fields...\n');

  const migrations = [
    // Add unit_price column
    `ALTER TABLE public.scraped_prices
     ADD COLUMN IF NOT EXISTS unit_price DECIMAL(10,2);`,

    // Add unit_type column
    `ALTER TABLE public.scraped_prices
     ADD COLUMN IF NOT EXISTS unit_type TEXT CHECK (unit_type IN ('each', 'meter', 'kg', 'sqm', 'litre', 'pack', 'pair', 'set', 'tonne', 'm2', 'm3'));`,

    // Add specifications column
    `ALTER TABLE public.scraped_prices
     ADD COLUMN IF NOT EXISTS specifications JSONB;`,

    // Add is_sale column
    `ALTER TABLE public.scraped_prices
     ADD COLUMN IF NOT EXISTS is_sale BOOLEAN DEFAULT FALSE;`,

    // Add was_price column
    `ALTER TABLE public.scraped_prices
     ADD COLUMN IF NOT EXISTS was_price DECIMAL(10,2);`,

    // Add product_description column
    `ALTER TABLE public.scraped_prices
     ADD COLUMN IF NOT EXISTS product_description TEXT;`,

    // Add manufacturer_sku column
    `ALTER TABLE public.scraped_prices
     ADD COLUMN IF NOT EXISTS manufacturer_sku TEXT;`,

    // Add barcode column
    `ALTER TABLE public.scraped_prices
     ADD COLUMN IF NOT EXISTS barcode TEXT;`,

    // Create indexes
    `CREATE INDEX IF NOT EXISTS idx_scraped_prices_unit_price ON public.scraped_prices(unit_price);`,
    `CREATE INDEX IF NOT EXISTS idx_scraped_prices_unit_type ON public.scraped_prices(unit_type);`,
    `CREATE INDEX IF NOT EXISTS idx_scraped_prices_is_sale ON public.scraped_prices(is_sale);`,
    `CREATE INDEX IF NOT EXISTS idx_scraped_prices_barcode ON public.scraped_prices(barcode);`,
    `CREATE INDEX IF NOT EXISTS idx_scraped_prices_manufacturer_sku ON public.scraped_prices(manufacturer_sku);`,
    `CREATE INDEX IF NOT EXISTS idx_scraped_prices_specifications ON public.scraped_prices USING GIN(specifications);`,

    // Add comments
    `COMMENT ON COLUMN public.scraped_prices.unit_price IS 'Unit price (e.g., price per meter, per kg)';`,
    `COMMENT ON COLUMN public.scraped_prices.unit_type IS 'Unit type: each, meter, kg, sqm, litre, pack, pair, set, tonne, m2, m3';`,
    `COMMENT ON COLUMN public.scraped_prices.specifications IS 'Product specifications as JSONB (dimensions, materials, features)';`,
    `COMMENT ON COLUMN public.scraped_prices.is_sale IS 'Whether the product is currently on sale';`,
    `COMMENT ON COLUMN public.scraped_prices.was_price IS 'Original price before sale (if applicable)';`,
    `COMMENT ON COLUMN public.scraped_prices.product_description IS 'Detailed product description';`,
    `COMMENT ON COLUMN public.scraped_prices.manufacturer_sku IS 'Manufacturer SKU for product identification';`,
    `COMMENT ON COLUMN public.scraped_prices.barcode IS 'Product barcode/EAN/UPC';`,
  ];

  for (let i = 0; i < migrations.length; i++) {
    const sql = migrations[i];
    console.log(`[${i + 1}/${migrations.length}] Executing: ${sql.substring(0, 80)}...`);

    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });

    if (error) {
      console.error(`  ✗ Error:`, error);
      // Continue with next migration
    } else {
      console.log(`  ✓ Success`);
    }
  }

  console.log('\n✓ Migration 006 applied successfully!');
}

applyMigration();
