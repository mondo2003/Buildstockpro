# Price Scraping System - Quick Reference

## 🚀 Quick Start

```bash
# Run demo
cd buildstock-pro/backend
bun run src/scripts/quick-test.ts

# Start server
bun run dev

# Test scraper
bun run src/scripts/test-scraper-mock.ts
```

## 📡 API Endpoints

Base URL: `http://localhost:3001/api/prices`

### Get Prices
```bash
# All prices
curl "http://localhost:3001/api/prices"

# Filter by retailer
curl "http://localhost:3001/api/prices/screwfix"

# Filter by category
curl "http://localhost:3001/api/prices/screwfix/power-tools"

# Filter by price range
curl "http://localhost:3001/api/prices?minPrice=10&maxPrice=100&inStock=true"

# Search
curl "http://localhost:3001/api/prices/search/drill"

# Compare prices
curl "http://localhost:3001/api/prices/compare/drill-18v"

# Statistics
curl "http://localhost:3001/api/prices/stats"
```

### Trigger Scrape
```bash
curl -X POST "http://localhost:3001/api/prices/scrape" \
  -H "Content-Type: application/json" \
  -d '{
    "retailer": "screwfix",
    "category": "power-tools",
    "limit": 10,
    "useMockData": true
  }'
```

## 🗄️ Database

Table: `scraped_prices`

Apply migration:
```sql
-- Run in Supabase SQL Editor
-- Copy content from: migrations/003_create_scraped_prices.sql
```

## 🔧 Configuration

`.env` file:
```env
SUPABASE_URL=your_url
SUPABASE_SERVICE_ROLE_KEY=your_key
DATABASE_URL=your_db_url
PORT=3001
```

## 📊 Available Categories

- power-tools
- hand-tools
- insulation
- plumbing
- electrical
- building-materials
- decorating
- gardening

## 🏪 Supported Retailers

- screwfix
- wickes
- bandq
- jewson
- travisperkins

## 🧪 Testing

```bash
# Mock scraper tests
bun run src/scripts/test-scraper-mock.ts

# Integration tests
bun run src/scripts/test-price-integration.ts

# API tests (requires running server)
bash src/scripts/test-price-api.sh

# Quick demo
bun run src/scripts/quick-test.ts
```

## 📖 Documentation

- `LIVE_PRICE_SCRAPING_GUIDE.md` - Complete guide
- `PRICE_SCRAPING_SUMMARY.md` - Implementation summary
- `PRICE_SCRAPING_QUICK_REF.md` - This file

## 🐛 Troubleshooting

### API Key Error
```bash
# Check .env
cat .env | grep SUPABASE

# Update keys from Supabase dashboard
# https://app.supabase.com/project/YOUR_PROJECT_ID/settings/api
```

### No Products in Database
```bash
# Check migration applied
# Run in Supabase SQL Editor:
SELECT COUNT(*) FROM scraped_prices;

# Trigger scrape
curl -X POST "http://localhost:3001/api/prices/scrape" \
  -H "Content-Type: application/json" \
  -d '{"retailer":"screwfix","category":"power-tools","limit":5,"useMockData":true}'
```

### Scraper Returns 0 Products
- Check website structure hasn't changed
- Update CSS selectors in scraper file
- Check robots.txt allows scraping
- Verify User-Agent header is set

## 📝 Code Examples

### Using the Service Directly

```typescript
import { priceScraper } from './services/priceScraper';

// Scrape products
const result = await priceScraper.scrapeCategory({
  retailer: 'screwfix',
  category: 'power-tools',
  limit: 10,
  useMockData: true,
});

// Get prices
const prices = await priceScraper.getLatestPrices({
  retailer: 'screwfix',
  category: 'power-tools',
  maxPrice: 100,
  inStock: true,
});

// Search
const results = await priceScraper.searchProducts('drill');

// Compare
const comparison = await priceScraper.comparePrices('drill-18v');

// Statistics
const stats = await priceScraper.getStatistics();
```

## 🔍 Rate Limits

| Scraper | Delay | Max/Hour |
|---------|-------|----------|
| Mock | 100ms | Unlimited |
| Screwfix | 2000ms | 1800 |
| Wickes | 2000ms | 1800 |
| B&Q | 2000ms | 1800 |

## ⚖️ Legal

⚠️ **Important:**
- Check robots.txt
- Respect terms of service
- Don't overload servers
- Consider official APIs
- Don't republish without permission

## 📞 Support

1. Check documentation
2. Review test files
3. Check server logs
4. Open GitHub issue

---

**Last Updated:** 2025-01-31
**Version:** 1.0.0
