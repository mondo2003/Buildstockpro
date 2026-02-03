# Migration 006 Status Report

**Date**: 2026-02-03
**Migration**: 006_add_unit_price_and_specifications.sql
**Status**: ⚠️ **PENDING MANUAL APPLICATION**

---

## Migration Details

The migration file exists at:
```
/Users/macbook/Desktop/buildstock.pro/buildstock-pro/backend/migrations/006_add_unit_price_and_specifications.sql
```

### Columns to be Added

| Column | Type | Description |
|--------|------|-------------|
| `unit_price` | DECIMAL(10,2) | Price per unit (e.g., per meter, per kg) |
| `unit_type` | TEXT | Unit type: each, meter, kg, sqm, litre, pack, pair, set, tonne, m2, m3 |
| `specifications` | JSONB | Product specifications as JSON (dimensions, materials, features) |
| `is_sale` | BOOLEAN | Whether the product is currently on sale |
| `was_price` | DECIMAL(10,2) | Original price before sale (if applicable) |
| `product_description` | TEXT | Detailed product description |
| `manufacturer_sku` | TEXT | Manufacturer SKU for product identification |
| `barcode` | TEXT | Product barcode/EAN/UPC |

### Indexes to be Created

- `idx_scraped_prices_unit_price` on `unit_price`
- `idx_scraped_prices_unit_type` on `unit_type`
- `idx_scraped_prices_is_sale` on `is_sale`
- `idx_scraped_prices_barcode` on `barcode`
- `idx_scraped_prices_manufacturer_sku` on `manufacturer_sku`
- `idx_scraped_prices_specifications` (GIN index) on `specifications`

---

## How to Apply

### Option 1: Via Supabase Dashboard (Recommended)

1. Go to: https://supabase.com/dashboard/project/xrhlumtimbmglzrfrnnk
2. Navigate to **SQL Editor**
3. Copy the contents of `migrations/006_add_unit_price_and_specifications.sql`
4. Paste and run the SQL
5. Verify columns were added

### Option 2: Via Supabase CLI

```bash
cd buildstock-pro/backend
supabase migration up
```

### Option 3: Via MCP Tool (Requires Access Token)

The Supabase MCP tool requires an access token. To use it:

```bash
export SUPABASE_ACCESS_TOKEN=your_token_here
```

Then run the migration through the MCP `execute_sql` or `apply_migration` function.

---

## Verification

After applying, verify the columns exist:

```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'scraped_prices'
  AND column_name IN (
    'unit_price', 'unit_type', 'specifications',
    'is_sale', 'was_price', 'product_description',
    'manufacturer_sku', 'barcode'
  )
ORDER BY ordinal_position;
```

Expected result: 8 rows returned

---

## Dependencies

This migration is required for:
- Enhanced product display with specifications
- Unit price comparison across retailers
- Sale price tracking and alerts
- Product identification via SKU/barcode

---

## Notes

- The migration uses `IF NOT EXISTS` clauses - safe to run multiple times
- All new columns are nullable (no existing data migration needed)
- Indexes are created for performance on new fields
- JSONB specification column enables flexible product attributes

---

**Action Required**: Please apply this migration manually via the Supabase Dashboard and update this file with "✅ APPLIED" status.
