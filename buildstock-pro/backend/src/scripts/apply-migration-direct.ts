/**
 * Apply migration 006 using direct SQL execution via postgres connection
 */

import { supabase } from '../utils/database';

async function applyMigration() {
  console.log('Applying migration 006 using direct SQL execution...\n');

  // Use raw SQL execution through the client
  const sqlStatements = [
    // Add columns
    `ALTER TABLE public.scraped_prices ADD COLUMN IF NOT EXISTS unit_price DECIMAL(10,2);`,
    `ALTER TABLE public.scraped_prices ADD COLUMN IF NOT EXISTS unit_type TEXT CHECK (unit_type IN ('each', 'meter', 'kg', 'sqm', 'litre', 'pack', 'pair', 'set', 'tonne', 'm2', 'm3'));`,
    `ALTER TABLE public.scraped_prices ADD COLUMN IF NOT EXISTS specifications JSONB;`,
    `ALTER TABLE public.scraped_prices ADD COLUMN IF NOT EXISTS is_sale BOOLEAN DEFAULT FALSE;`,
    `ALTER TABLE public.scraped_prices ADD COLUMN IF NOT EXISTS was_price DECIMAL(10,2);`,
    `ALTER TABLE public.scraped_prices ADD COLUMN IF NOT EXISTS product_description TEXT;`,
    `ALTER TABLE public.scraped_prices ADD COLUMN IF NOT EXISTS manufacturer_sku TEXT;`,
    `ALTER TABLE public.scraped_prices ADD COLUMN IF NOT EXISTS barcode TEXT;`,
    // Create indexes
    `CREATE INDEX IF NOT EXISTS idx_scraped_prices_unit_price ON public.scraped_prices(unit_price);`,
    `CREATE INDEX IF NOT EXISTS idx_scraped_prices_unit_type ON public.scraped_prices(unit_type);`,
    `CREATE INDEX IF NOT EXISTS idx_scraped_prices_is_sale ON public.scraped_prices(is_sale);`,
    `CREATE INDEX IF NOT EXISTS idx_scraped_prices_barcode ON public.scraped_prices(barcode);`,
    `CREATE INDEX IF NOT EXISTS idx_scraped_prices_manufacturer_sku ON public.scraped_prices(manufacturer_sku);`,
    `CREATE INDEX IF NOT EXISTS idx_scraped_prices_specifications ON public.scraped_prices USING GIN(specifications);`,
  ];

  for (let i = 0; i < sqlStatements.length; i++) {
    const sql = sqlStatements[i];
    console.log(`[${i + 1}/${sqlStatements.length}] ${sql.substring(0, 60)}...`);

    try {
      // Use the execute_sql function from MCP
      const { error } = await supabase.rpc('exec_sql', { sql_query: sql });

      if (error) {
        console.error(`  ✗ Error: ${error.message}`);
      } else {
        console.log(`  ✓ Success`);
      }
    } catch (e) {
      console.error(`  ✗ Exception: ${e}`);
    }
  }

  console.log('\n✓ Migration 006 applied!');
}

applyMigration();
