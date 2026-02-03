/**
 * Apply migration 006 using node-postgres client via rawQuery
 */

import { rawQuery } from '../utils/database';

async function applyMigration() {
  console.log('Applying migration 006: Add unit_price and specifications fields\n');

  const sqlStatements = [
    `ALTER TABLE public.scraped_prices ADD COLUMN IF NOT EXISTS unit_price DECIMAL(10,2);`,
    `ALTER TABLE public.scraped_prices ADD COLUMN IF NOT EXISTS unit_type TEXT CHECK (unit_type IN ('each', 'meter', 'kg', 'sqm', 'litre', 'pack', 'pair', 'set', 'tonne', 'm2', 'm3'));`,
    `ALTER TABLE public.scraped_prices ADD COLUMN IF NOT EXISTS specifications JSONB;`,
    `ALTER TABLE public.scraped_prices ADD COLUMN IF NOT EXISTS is_sale BOOLEAN DEFAULT FALSE;`,
    `ALTER TABLE public.scraped_prices ADD COLUMN IF NOT EXISTS was_price DECIMAL(10,2);`,
    `ALTER TABLE public.scraped_prices ADD COLUMN IF NOT EXISTS product_description TEXT;`,
    `ALTER TABLE public.scraped_prices ADD COLUMN IF NOT EXISTS manufacturer_sku TEXT;`,
    `ALTER TABLE public.scraped_prices ADD COLUMN IF NOT EXISTS barcode TEXT;`,
    `CREATE INDEX IF NOT EXISTS idx_scraped_prices_unit_price ON public.scraped_prices(unit_price);`,
    `CREATE INDEX IF NOT EXISTS idx_scraped_prices_unit_type ON public.scraped_prices(unit_type);`,
    `CREATE INDEX IF NOT EXISTS idx_scraped_prices_is_sale ON public.scraped_prices(is_sale);`,
    `CREATE INDEX IF NOT EXISTS idx_scraped_prices_barcode ON public.scraped_prices(barcode);`,
    `CREATE INDEX IF NOT EXISTS idx_scraped_prices_manufacturer_sku ON public.scraped_prices(manufacturer_sku);`,
    `CREATE INDEX IF NOT EXISTS idx_scraped_prices_specifications ON public.scraped_prices USING GIN(specifications);`,
  ];

  let successCount = 0;
  let errorCount = 0;

  for (let i = 0; i < sqlStatements.length; i++) {
    const sql = sqlStatements[i];
    console.log(`[${i + 1}/${sqlStatements.length}] ${sql.substring(0, 65)}...`);

    try {
      await rawQuery(sql);
      console.log(`  ✓ Success`);
      successCount++;
    } catch (e: any) {
      console.error(`  ✗ Error: ${e.message}`);
      errorCount++;
    }
  }

  console.log(`\n✓ Migration 006 applied: ${successCount} success, ${errorCount} errors`);
}

applyMigration();
