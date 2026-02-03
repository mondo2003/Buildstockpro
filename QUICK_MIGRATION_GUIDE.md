# Quick Migration Guide - Apply All 4 Migrations

**Time Required:** 5 minutes

---

## Step 1: Open Supabase SQL Editor

Click this link or copy/paste into browser:
```
https://supabase.com/dashboard/project/xrhlumtimbmglzrfrnnk/editor
```

---

## Step 2: Apply Migration 006

1. Open file: `/Users/macbook/Desktop/buildstock.pro/buildstock-pro/backend/migrations/006_add_unit_price_and_specifications.sql`
2. Copy ALL contents (Cmd+A, Cmd+C)
3. Paste in Supabase SQL Editor
4. Click **Run** button
5. ✅ Verify: Check `scraped_prices` table has new columns (unit_price, specifications, etc.)

---

## Step 3: Apply Migration 007

1. Open file: `/Users/macbook/Desktop/buildstock.pro/buildstock-pro/backend/migrations/007_quote_system.sql`
2. Copy ALL contents
3. Paste in Supabase SQL Editor
4. Click **Run** button
5. ✅ Verify: Check 3 new tables exist: `quotes`, `quote_items`, `quote_responses`

---

## Step 4: Apply Migration 008

1. Open file: `/Users/macbook/Desktop/buildstock.pro/buildstock-pro/backend/migrations/008_bulk_orders.sql`
2. Copy ALL contents
3. Paste in Supabase SQL Editor
4. Click **Run** button
5. ✅ Verify: Check 3 new tables exist: `bulk_orders`, `bulk_order_items`, `bulk_order_retailers`

---

## Step 5: Apply Migration 009

1. Open file: `/Users/macbook/Desktop/buildstock.pro/buildstock-pro/backend/migrations/009_merchant_contact.sql`
2. Copy ALL contents
3. Paste in Supabase SQL Editor
4. Click **Run** button
5. ✅ Verify: Check 2 new tables exist: `merchant_contact_requests`, `merchant_contact_responses`

---

## Step 6: Verify All Tables

In Supabase, go to **Table Editor** and confirm these tables exist:

### Existing Tables:
- ✅ users
- ✅ merchants
- ✅ merchant_branches
- ✅ scraped_prices
- ✅ products
- ✅ listings

### New Tables (from migrations):
- ✅ quotes
- ✅ quote_items
- ✅ quote_responses
- ✅ bulk_orders
- ✅ bulk_order_items
- ✅ bulk_order_retailers
- ✅ merchant_contact_requests
- ✅ merchant_contact_responses

---

## What Each Migration Does

**Migration 006:**
- Adds unit pricing to products (price per meter/kg/etc)
- Adds specifications (JSON field for dimensions, materials)
- Adds sale tracking (is_sale, was_price)
- Adds product descriptions, SKUs, barcodes

**Migration 007:**
- Creates quote request system
- Users can request quotes from suppliers
- Track items in each quote
- Merchant responses

**Migration 008:**
- Creates bulk order system
- Multi-retailer orders
- Automatic retailer grouping
- Order status tracking

**Migration 009:**
- Creates merchant contact system
- Contact merchants about products
- Find nearest branches
- Track conversations

---

## Done!

Once all 4 migrations are applied, return here and the backend server will be ready for testing.
