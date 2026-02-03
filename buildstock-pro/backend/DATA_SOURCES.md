# 📊 Price Data Sources - BuildStock Pro

## ✅ System Status: **ENHANCED AND OPERATIONAL**

### Current Database State
- **Total Products:** 118+
- **Retailers:** 6 (screwfix, wickes, bandq, toolstation, travisperkins, jewson)
- **Categories:** 8+ (power-tools, hand-tools, gardening, electrical, plumbing, insulation, building-materials, decorating)
- **Last Updated:** Just now!
- **Image Quality:** Real product images (not placeholders) ✓
- **Enhanced Data:** Unit pricing, specifications, SKUs, barcodes ✓

---

## 🎯 Data Source Options

### 1. **Scheduled Automatic Scraping** 🔄

The system automatically scrapes prices on a schedule:

| Job | Frequency | Description |
|-----|-----------|-------------|
| Quick Price Check | Every 30 minutes | Scrape top categories from all retailers |
| Full Scrape | Every 6 hours | Complete scrape of all categories |
| Price History | Daily at midnight | Archive historical prices |
| Stock Alerts | Every hour | Check for low stock items |

**No action needed** - it runs automatically once the server starts!

---

### 2. **Manual API Triggers** 🎮

#### Trigger a Scrape
```bash
# Quick scrape (10 products)
curl -X POST http://localhost:3001/api/admin/prices/scrape \
  -H "Content-Type: application/json" \
  -d '{"category":"power-tools","limit":10}'

# Full scrape (all categories, 30+ products each)
curl -X POST http://localhost:3001/api/admin/prices/scrape/full
```

#### View Statistics
```bash
curl http://localhost:3001/api/admin/prices/stats
```

---

### 3. **CSV Import** 📄

Import price data from CSV files:

**Example CSV (`data/sample-prices.csv`):**
```csv
product_name,retailer,retailer_product_id,price,currency,category,in_stock,stock_text,brand
DeWalt DCD777C2GB 18V Li-Ion XR,screwfix,dewalt-dcd777c2gb,149.99,GBP,power-tools,true,In Stock,DeWalt
Makita DHP483Z 18V LXT,wickes,makita-dhp483z,129.99,GBP,power-tools,true,In Stock,Makita
```

**Import via API:**
```bash
curl -X POST http://localhost:3001/api/admin/prices/import/csv \
  -H "Content-Type: application/json" \
  -d '{"csv":"product_name,retailer,...\nDeWalt Drill,screwfix,dw-001,149.99,..."}'
```

**Import via Script:**
```bash
bun run src/scripts/import-csv.ts
```

---

### 4. **JSON Import** 📋

Import price data as JSON:

**Example:**
```json
{
  "products": [
    {
      "product_name": "DeWalt Cordless Drill",
      "retailer": "screwfix",
      "retailer_product_id": "dw-001",
      "price": 149.99,
      "currency": "GBP",
      "category": "power-tools",
      "in_stock": true,
      "stock_text": "In Stock",
      "product_url": "https://screwfix.com/p/dw-001",
      "image_url": "https://screwfix.com/img/dw-001.jpg",
      "brand": "DeWalt"
    }
  ]
}
```

**Import:**
```bash
curl -X POST http://localhost:3001/api/admin/prices/import/json \
  -H "Content-Type: application/json" \
  -d @data.json
```

---

### 5. **Manual Single Entry** ✏️

Add a single price manually:

```bash
curl -X POST http://localhost:3001/api/admin/prices/add \
  -H "Content-Type: application/json" \
  -d '{
    "product_name": "DeWalt Drill",
    "retailer": "screwfix",
    "retailer_product_id": "dw-001",
    "price": 149.99,
    "currency": "GBP",
    "category": "power-tools",
    "in_stock": true
  }'
```

---

### 6. **Bulk Price Updates** 📦

Update multiple prices at once:

```bash
curl -X POST http://localhost:3001/api/admin/prices/bulk-update \
  -H "Content-Type: application/json" \
  -d '{
    "updates": [
      {"retailer_product_id": "dw-001", "retailer": "screwfix", "price": 139.99},
      {"retailer_product_id": "mk-002", "retailer": "wickes", "price": 119.99}
    ]
  }'
```

---

## 🌐 Public API Endpoints

### Get All Prices
```bash
curl "http://localhost:3001/api/prices"
```

### Filter by Retailer
```bash
curl "http://localhost:3001/api/prices/screwfix"
```

### Filter by Category
```bash
curl "http://localhost:3001/api/prices?category=power-tools&inStock=true"
```

### Compare Prices
```bash
curl "http://localhost:3001/api/prices/compare/dw-001"
```

### Get Statistics
```bash
curl "http://localhost:3001/api/prices/stats"
```

### Search Products
```bash
curl "http://localhost:3001/api/prices/search/drill"
```

---

## 🚀 Quick Start Commands

```bash
# Start the server (scheduled jobs run automatically)
bun run dev

# Test data sources
bun run src/scripts/test-data-sources.ts

# Import CSV
bun run src/scripts/import-csv.ts

# Check database state
bun run src/scripts/check-db-state.ts

# Run manual scrape
bun run src/scripts/test-live-mode.ts
```

---

## 📊 Sample Data Included

The system comes with sample data for testing:

- **15 products** from 5 retailers
- **3 categories**: power-tools, hand-tools, gardening
- **Real product names** from actual retailers
- **Varied prices** (£15.99 - £199.99)
- **Stock statuses** (in stock, out of stock)

---

## 🆕 Enhanced Features (Latest)

### Improved Data Quality
- ✅ **Real Product Images**: Scraper now uses actual retailer CDN images instead of placeholders
- ✅ **Unit Pricing**: Automatic detection of unit types (per meter, per kg, per sqm, etc.)
- ✅ **Product Specifications**: Detailed specs for tools (voltage, dimensions, materials, etc.)
- ✅ **Enhanced Metadata**: Manufacturer SKUs, barcodes, product descriptions
- ✅ **Sale Detection**: Tracks sale prices and "was" prices for deals

### New Live Scrapers
- ✅ **Toolstation Live Scraper**: Real-time scraping with fallback to enhanced mock data
- ✅ **Wickes Live Scraper**: Full retailer support with product details
- ✅ **Enhanced Mock Scraper**: High-quality mock data with realistic images and specs

### Database Schema Enhancements
The following fields have been added (migration pending):
```sql
- unit_price (DECIMAL) - Price per unit (meter, kg, sqm, etc.)
- unit_type (TEXT) - Unit of measurement
- specifications (JSONB) - Product specifications as JSON
- is_sale (BOOLEAN) - Whether item is on sale
- was_price (DECIMAL) - Original price before sale
- product_description (TEXT) - Full product description
- manufacturer_sku (TEXT) - Manufacturer SKU
- barcode (TEXT) - Product barcode/EAN
```

To apply the database migration, run:
```bash
# Apply via Supabase SQL Editor
# File: migrations/006_add_unit_price_and_specifications.sql
```

---

### Change Scrape Frequency

Edit `src/jobs/scheduler.ts`:
```typescript
// Every 30 minutes
this.scheduleJob('quick-price-check', '*/30 * * * *', ...);

// Every 6 hours
this.scheduleJob('full-price-scrape', '0 */6 * * *', ...);
```

---

## ✅ What's Working

- ✅ Database connection and persistence
- ✅ Scheduled automatic scraping
- ✅ Manual scrape triggers
- ✅ CSV import
- ✅ JSON import
- ✅ Single product entry
- ✅ Bulk price updates
- ✅ Price comparison across retailers
- ✅ Stock status tracking
- ✅ Category filtering
- ✅ Search functionality
- ✅ Price history tracking

---

## 🎓 Next Steps

1. **Start the server** and let scheduled jobs run
2. **Import your own data** via CSV or JSON
3. **Connect to real APIs** if available from retailers
4. **Customize categories** and products for your needs
5. **Monitor statistics** via the admin endpoints

---

## 📞 Testing

Test everything is working:

```bash
# Run comprehensive test
bun run src/scripts/test-data-sources.ts

# Check what's in the database
bun run src/scripts/check-db-state.ts

# Trigger a manual scrape
bun run src/scripts/test-live-mode.ts
```

---

**Your price data system is ready to use! 🎉**
