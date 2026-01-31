# Live Price Scraping System - Complete Guide

## Overview

BuildStock Pro's live price scraping system enables real-time price tracking from multiple hardware retailers. This system scrapes product data, stores it in the database, and provides REST API endpoints for accessing the latest prices.

## Table of Contents

1. [Architecture](#architecture)
2. [Database Schema](#database-schema)
3. [Scraper System](#scraper-system)
4. [API Endpoints](#api-endpoints)
5. [How to Run](#how-to-run)
6. [Adding New Retailers](#adding-new-retailers)
7. [Rate Limiting & Best Practices](#rate-limiting--best-practices)
8. [Legal Considerations](#legal-considerations)
9. [Troubleshooting](#troubleshooting)

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     BuildStock Pro Backend                  │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────────┐      ┌──────────────────────┐       │
│  │  Scraper Service │ ───▶ │  Database Service    │       │
│  └──────────────────┘      └──────────────────────┘       │
│         │                           │                       │
│         │                           ▼                       │
│         │                  ┌──────────────────┐            │
│         │                  │  Supabase DB     │            │
│         │                  │  - scraped_prices │            │
│         │                  └──────────────────┘            │
│         │                                                   │
│         ▼                                                   │
│  ┌──────────────────┐      ┌──────────────────────┐       │
│  │  Price API Routes│ ◀─── │  Price Scraper Svc   │       │
│  └──────────────────┘      └──────────────────────┘       │
│         │                                                   │
│         ▼                                                   │
│  ┌──────────────────┐                                      │
│  │  REST API        │                                      │
│  │  - GET /prices   │                                      │
│  │  - POST /scrape  │                                      │
│  └──────────────────┘                                      │
│                                                             │
└─────────────────────────────────────────────────────────────┘

External Sources:
┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│ Screwfix    │  │ Wickes      │  │ B&Q         │
│ (Planned)   │  │ (Planned)   │  │ (Planned)   │
└─────────────┘  └─────────────┘  └─────────────┘
```

---

## Database Schema

### Table: `scraped_prices`

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key (auto-generated) |
| `product_name` | TEXT | Product name (required) |
| `retailer` | TEXT | Retailer name (e.g., 'screwfix') |
| `retailer_product_id` | TEXT | Product ID from retailer |
| `price` | DECIMAL(10,2) | Current price (required, ≥ 0) |
| `currency` | TEXT | Currency code (GBP, EUR, USD) |
| `product_url` | TEXT | URL to product page |
| `image_url` | TEXT | URL to product image |
| `brand` | TEXT | Product brand |
| `category` | TEXT | Product category |
| `in_stock` | BOOLEAN | Stock availability |
| `stock_text` | TEXT | Raw stock status text |
| `scraped_at` | TIMESTAMP | When this price was scraped |
| `updated_at` | TIMESTAMP | Auto-updated on row update |
| `created_at` | TIMESTAMP | When the record was created |

### Indexes

- `idx_scraped_prices_retailer` - For filtering by retailer
- `idx_scraped_prices_category` - For filtering by category
- `idx_scraped_prices_price` - For price range queries
- `idx_scraped_prices_scraped_at` - For time-based queries
- `idx_scraped_prices_retailer_product` - Composite index for lookups
- `idx_scraped_prices_product_name` - Full-text search on product names
- And more...

### Views & Functions

- **View `latest_prices`**: Returns the most recent price for each unique product
- **Function `get_price_history()`**: Get price history for a product over N days
- **Function `compare_prices()`**: Compare prices across retailers

---

## Scraper System

### Components

#### 1. Base Scraper (`src/scrapers/base.ts`)

Abstract base class that defines the interface for all scrapers:

```typescript
abstract class BaseScraper {
  abstract scrapeCategory(category: string, maxProducts: number): Promise<ScrapingResult>
  abstract scrapeProduct(url: string): Promise<ScrapedProduct | null>
  abstract searchProducts(query: string, maxResults: number): Promise<ScrapingResult>
}
```

#### 2. Mock Scraper (`src/scrapers/mock-scraper.ts`)

For testing and development. Generates realistic hardware store data.

**Categories:**
- power-tools
- hand-tools
- insulation
- plumbing
- electrical
- building-materials
- decorating
- gardening

**Sample Data:**
- 50+ product templates across categories
- Realistic pricing (£1.29 - £150.99)
- Multiple brands (DeWalt, Makita, Bosch, etc.)
- Stock status variations

#### 3. Screwfix Scraper (`src/scrapers/screwfix.ts`)

Real scraper for Screwfix (UK hardware retailer).

**Features:**
- Product page scraping
- Category page scraping
- Search functionality
- Robots.txt checking
- Rate limiting (2-second delays)
- Error handling

**Status:** In development. URL structure needs updating.

### Price Scraping Service (`src/services/priceScraper.ts`)

Main service that orchestrates scraping operations:

**Methods:**

| Method | Description |
|--------|-------------|
| `scrapeCategory(options)` | Scrape all products in a category |
| `scrapeProduct(url, retailer)` | Scrape a single product |
| `savePrices(prices[])` | Save/update prices in database |
| `getLatestPrices(filters)` | Get prices with filters |
| `getPricesByRetailer(retailer, category?)` | Get prices by retailer |
| `comparePrices(productId)` | Compare prices across retailers |
| `getPriceHistory(retailer, productId, days)` | Get price history |
| `searchProducts(query, filters)` | Search products by name |
| `getStatistics()` | Get database statistics |
| `triggerScrape(options)` | Trigger a scrape job |

---

## API Endpoints

Base URL: `http://localhost:3001/api/prices`

### 1. Get All Prices

```
GET /api/prices
```

**Query Parameters:**
- `retailer` (optional): Filter by retailer
- `category` (optional): Filter by category
- `minPrice` (optional): Minimum price
- `maxPrice` (optional): Maximum price
- `inStock` (optional): "true" or "false"
- `brand` (optional): Filter by brand
- `search` (optional): Search in product names

**Example:**
```bash
curl "http://localhost:3001/api/prices?retailer=screwfix&category=power-tools&minPrice=10&maxPrice=100&inStock=true"
```

**Response:**
```json
{
  "success": true,
  "count": 15,
  "data": [
    {
      "id": "uuid",
      "product_name": "DeWalt Cordless Drill Driver 18V",
      "retailer": "screwfix",
      "price": 89.99,
      "currency": "GBP",
      "brand": "DeWalt",
      "category": "power-tools",
      "in_stock": true,
      "scraped_at": "2025-01-31T10:30:00Z"
    }
  ]
}
```

### 2. Get Prices by Retailer

```
GET /api/prices/:retailer
```

**Example:**
```bash
curl "http://localhost:3001/api/prices/screwfix"
curl "http://localhost:3001/api/prices/screwfix?category=insulation"
```

### 3. Get Prices by Category

```
GET /api/prices/:retailer/:category
```

**Example:**
```bash
curl "http://localhost:3001/api/prices/screwfix/power-tools"
```

### 4. Compare Prices

```
GET /api/prices/compare/:productId
```

Compare prices across retailers for a product.

**Example:**
```bash
curl "http://localhost:3001/api/prices/compare/drill-18v"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "productId": "drill-18v",
    "productName": "Cordless Drill Driver 18V",
    "retailers": [
      {
        "retailer": "screwfix",
        "price": 89.99,
        "inStock": true,
        "productUrl": "https://...",
        "scrapedAt": "2025-01-31T10:30:00Z"
      },
      {
        "retailer": "wickes",
        "price": 84.99,
        "inStock": true,
        "productUrl": "https://...",
        "scrapedAt": "2025-01-31T10:25:00Z"
      }
    ],
    "lowestPrice": 84.99,
    "highestPrice": 89.99,
    "savings": 5.00
  }
}
```

### 5. Get Price History

```
GET /api/prices/history/:retailer/:productId
```

**Query Parameters:**
- `days` (optional): Number of days (default: 30)

**Example:**
```bash
curl "http://localhost:3001/api/prices/history/screwfix/drill-123?days=30"
```

### 6. Search Products

```
GET /api/prices/search/:query
```

**Example:**
```bash
curl "http://localhost:3001/api/prices/search/drill?retailer=screwfix&minPrice=50"
```

### 7. Trigger Scrape Job

```
POST /api/prices/scrape
```

**Body:**
```json
{
  "retailer": "screwfix",
  "category": "power-tools",
  "limit": 20,
  "useMockData": true
}
```

**Example:**
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

### 8. Scrape Single Product

```
POST /api/prices/product
```

**Body:**
```json
{
  "url": "https://www.screwfix.com/p/product-name",
  "retailer": "screwfix",
  "useMockData": true
}
```

### 9. Get Statistics

```
GET /api/prices/stats
```

**Example:**
```bash
curl "http://localhost:3001/api/prices/stats"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalProducts": 150,
    "retailers": ["screwfix", "wickes", "bandq"],
    "categories": ["power-tools", "hand-tools", "insulation"],
    "lastUpdated": "2025-01-31T10:30:00Z"
  }
}
```

---

## How to Run

### 1. Install Dependencies

```bash
cd buildstock-pro/backend
bun install
```

### 2. Configure Environment

Edit `.env`:

```env
# Supabase
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
DATABASE_URL=your_database_url

# API
PORT=3001
CORS_ORIGIN=http://localhost:3000
```

### 3. Run Database Migration

```bash
# Option 1: Run migration script
bun run src/scripts/apply-scraping-migration.ts

# Option 2: Apply manually in Supabase SQL Editor
# Copy and paste the content of:
# migrations/003_create_scraped_prices.sql
```

### 4. Start the Server

```bash
# Development mode (with hot reload)
bun run dev

# Production mode
bun start
```

Server will run on `http://localhost:3001`

### 5. Test the System

**Option A: Run integration tests (no server required)**
```bash
bun run src/scripts/test-scraper-mock.ts
```

**Option B: Run API tests (requires running server)**
```bash
# Start server in one terminal
bun run dev

# In another terminal, run tests
bash src/scripts/test-price-api.sh
```

**Option C: Manual testing**
```bash
# Trigger a scrape
curl -X POST "http://localhost:3001/api/prices/scrape" \
  -H "Content-Type: application/json" \
  -d '{"retailer":"screwfix","category":"power-tools","limit":10,"useMockData":true}'

# Get prices
curl "http://localhost:3001/api/prices?category=power-tools"

# Get statistics
curl "http://localhost:3001/api/prices/stats"
```

---

## Adding New Retailers

### Step 1: Create Scraper Class

Create a new file in `src/scrapers/`:

```typescript
// src/scrapers/new-retailer.ts
import type { ScrapedProduct, ScrapingResult } from './base';

export async function scrapeCategory(category: string, maxProducts: number): Promise<ScrapingResult> {
  // Implement scraping logic
}

export async function scrapeProduct(url: string): Promise<ScrapedProduct | null> {
  // Implement product scraping
}

export async function searchProducts(query: string, maxResults: number): Promise<ScrapingResult> {
  // Implement search
}
```

### Step 2: Update Price Scraper Service

Edit `src/services/priceScraper.ts`:

```typescript
import { newRetailerScraper } from '../scrapers/new-retailer';

async scrapeCategory(options: ScrapingOptions): Promise<ScrapingResult> {
  if (options.retailer === 'new-retailer') {
    return await newRetailerScraper.scrapeCategory(
      options.category || '',
      options.limit || 20
    );
  }
  // ... other retailers
}
```

### Step 3: Test

```bash
bun run src/scripts/test-scraper-mock.ts
```

### Step 4: Document

Add to this guide:
- Retailer name and URL
- Categories available
- Rate limits
- Any special considerations

---

## Rate Limiting & Best Practices

### Current Rate Limits

| Scraper | Delay | Concurrency | Max Requests/Hour |
|---------|-------|-------------|-------------------|
| Mock Scraper | 100ms | Unlimited | Unlimited |
| Screwfix (planned) | 2000ms | 1 | 1800 |
| Wickes (planned) | 2000ms | 1 | 1800 |

### Best Practices

1. **Always check robots.txt** before scraping
2. **Add delays between requests** (minimum 1-2 seconds)
3. **Cache results** to avoid repeated scraping
4. **Use appropriate User-Agent headers**
5. **Respect terms of service**
6. **Monitor for IP bans**
7. **Handle errors gracefully**
8. **Log all scraping activities**

### Example Rate Limiter

```typescript
class RateLimiter {
  private lastRequest = 0;
  private minDelay: number;

  constructor(minDelay: number) {
    this.minDelay = minDelay;
  }

  async throttle() {
    const now = Date.now();
    const elapsed = now - this.lastRequest;

    if (elapsed < this.minDelay) {
      const waitTime = this.minDelay - elapsed;
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }

    this.lastRequest = Date.now();
  }
}

// Usage
const limiter = new RateLimiter(2000); // 2 seconds
await limiter.throttle();
// Make request...
```

---

## Legal Considerations

### ⚠️ Important Legal Notes

1. **Terms of Service**: Always read and comply with website Terms of Service
2. **Copyright**: Product data may be copyrighted
3. **Database Rights**: Compiled databases may have database rights
4. **Computer Fraud and Abuse Act**: Unauthorized access may be illegal
5. **GDPR/Privacy**: Be careful with personal data
6. **Competition Law**: Price fixing and discrimination laws

### Best Practices for Legal Compliance

1. **Obtain permission** when possible (APIs are better than scraping)
2. **Only access publicly available data**
3. **Don't bypass authentication or paywalls**
4. **Respect robots.txt** (it's a legal signal in some jurisdictions)
5. **Don't cause harm** (don't overload servers)
6. **Use data responsibly** (don't republish without permission)
7. **Consider using official APIs** (more reliable and legal)

### Disclaimer

This scraping system is for educational purposes. Users are responsible for ensuring their use complies with all applicable laws and website terms of service.

---

## Troubleshooting

### Issue: "Invalid API key"

**Solution:**
1. Check `.env` file has correct Supabase credentials
2. Verify `SUPABASE_SERVICE_ROLE_KEY` is set (not `SUPABASE_ANON_KEY`)
3. Check key hasn't expired or been revoked

### Issue: No products in database

**Solution:**
1. Check database migration was applied successfully
2. Run `bun run src/scripts/test-scraper-mock.ts` to test scraper
3. Check server logs for errors
4. Verify Supabase RLS policies allow inserts

### Issue: Scraper returns 0 products

**Solution:**
1. Website structure may have changed
2. Check if website is blocking automated requests
3. Try updating CSS selectors in scraper
4. Check user-agent is set correctly

### Issue: Rate limiting / IP bans

**Solution:**
1. Increase delay between requests
2. Rotate user agents
3. Use proxy service (if legal)
4. Scrape during off-peak hours

### Issue: Database connection errors

**Solution:**
1. Check `DATABASE_URL` in `.env`
2. Verify Supabase project is active
3. Check network connectivity
4. Try connecting via Supabase SQL Editor

---

## Files Reference

### Core Files

| File | Description |
|------|-------------|
| `src/scrapers/base.ts` | Base scraper interface |
| `src/scrapers/mock-scraper.ts` | Mock scraper for testing |
| `src/scrapers/screwfix.ts` | Screwfix scraper (in development) |
| `src/services/priceScraper.ts` | Main scraping service |
| `src/routes/prices.ts` | API routes |
| `src/index.ts` | Main server (updated to include price routes) |

### Migration Files

| File | Description |
|------|-------------|
| `migrations/003_create_scraped_prices.sql` | Database schema |

### Test Files

| File | Description |
|------|-------------|
| `src/scripts/test-scraper-mock.ts` | Mock scraper tests |
| `src/scripts/test-scraper.ts` | Screwfix scraper tests |
| `src/scripts/test-price-integration.ts` | Integration tests |
| `src/scripts/test-price-api.sh` | API endpoint tests |

---

## Next Steps

1. ✅ **Mock scraper working** - Use this for development and testing
2. 🔄 **Screwfix scraper** - Update CSS selectors when ready for production
3. ⏳ **Add more retailers** - Wickes, B&Q, Jewson, Travis Perkins
4. ⏳ **Implement scheduled scraping** - Cron jobs for automatic updates
5. ⏳ **Add price alerts** - Notify users of price drops
6. ⏳ **Optimize database queries** - Add caching layer
7. ⏳ **Add monitoring** - Track scraping success rates

---

## Support

For issues or questions:
1. Check this guide first
2. Review test files for examples
3. Check server logs
4. Open an issue on GitHub

---

**Last Updated:** 2025-01-31
**Version:** 1.0.0
