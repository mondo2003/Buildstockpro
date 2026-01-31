# Price Scraping System - Visual Architecture

## System Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          BuildStock Pro Frontend                            │
│                        (Next.js / React App)                                │
│                                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │
│  │ Product List │  │ Search Page  │  │ Compare Page │  │ Alerts Page  │   │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘   │
│         │                  │                  │                  │           │
│         └──────────────────┼──────────────────┼──────────────────┘           │
│                            │                  │                              │
└────────────────────────────┼──────────────────┼──────────────────────────────┘
                             │                  │
                             ▼                  ▼
                    ┌──────────────────────────────────────┐
                    │     REST API (Bun + Elysia)          │
                    │      http://localhost:3001           │
                    └──────────────────────────────────────┘
                                             │
                    ┌────────────────────────┼────────────────────────┐
                    │                        │                        │
                    ▼                        ▼                        ▼
        ┌───────────────────┐   ┌───────────────────┐   ┌───────────────────┐
        │  Price Routes     │   │  Product Routes   │   │  Search Routes    │
        │  /api/prices/*    │   │  /api/products/*  │   │  /api/search/*    │
        └─────────┬─────────┘   └───────────────────┘   └───────────────────┘
                  │
                  ▼
        ┌─────────────────────────────────────────┐
        │     Price Scraping Service              │
        │     (priceScraper.ts)                   │
        │                                          │
        │  • scrapeCategory()                      │
        │  • scrapeProduct()                       │
        │  • savePrices()                          │
        │  • getLatestPrices()                     │
        │  • comparePrices()                       │
        │  • getPriceHistory()                     │
        │  • searchProducts()                      │
        │  • getStatistics()                       │
        └──────────────┬──────────────────────────┘
                       │
        ┌──────────────┼──────────────┬──────────────┐
        │              │              │              │
        ▼              ▼              ▼              ▼
  ┌───────────┐  ┌───────────┐  ┌───────────┐  ┌───────────┐
  │   Mock    │  │ Screwfix  │  │  Wickes   │  │    B&Q    │
  │ Scraper   │  │ Scraper   │  │ Scraper   │  │ Scraper   │
  │   ✓       │  │   (WIP)   │  │  (Planned)│  │  (Planned)│
  └─────┬─────┘  └─────┬─────┘  └─────┬─────┘  └─────┬─────┘
        │              │              │              │
        └──────────────┼──────────────┼──────────────┘
                       │              │
                       ▼              ▼
            ┌──────────────────────────────────┐
            │    Supabase PostgreSQL Database   │
            │                                   │
            │  Table: scraped_prices            │
            │  • id (UUID)                      │
            │  • product_name                   │
            │  • retailer                       │
            │  • price                          │
            │  • brand                          │
            │  • category                       │
            │  • in_stock                       │
            │  • scraped_at                     │
            │                                   │
            │  Indexes:                         │
            │  • retailer                       │
            │  • category                       │
            │  • price                          │
            │  • product_name (full-text)       │
            │                                   │
            │  Views:                           │
            │  • latest_prices                  │
            │                                   │
            │  Functions:                       │
            │  • get_price_history()            │
            │  • compare_prices()               │
            └──────────────────────────────────┘
```

## Data Flow Example

### Scenario: User searches for "cordless drill"

```
1. User types "cordless drill" in search box
   ↓
2. Frontend calls: GET /api/prices/search/cordless+drill
   ↓
3. API receives request at prices route
   ↓
4. PriceScraper.searchProducts("cordless drill")
   ↓
5. Query database: SELECT * FROM scraped_prices WHERE product_name ILIKE '%cordless drill%'
   ↓
6. Supabase returns matching products
   ↓
7. API returns JSON response with products
   ↓
8. Frontend displays results to user
```

### Scenario: Automatic price scraping

```
1. Cron job triggers every 6 hours
   ↓
2. POST /api/prices/scrape
   Body: {
     "retailer": "screwfix",
     "category": "power-tools",
     "limit": 50
   }
   ↓
3. PriceScraper.scrapeCategory()
   ↓
4. Scraper fetches category page
   ↓
5. Extracts product URLs (with 2s delays)
   ↓
6. For each URL:
   - Fetch product page
   - Extract data (name, price, brand, etc.)
   - Save to database (insert or update)
   ↓
7. Returns: {
     "success": true,
     "total": 50,
     "products": [...]
   }
   ↓
8. Database now has latest prices
   ↓
9. Users see updated prices on next page load
```

## Component Interactions

### Mock Scraper (Current - Working)

```
┌─────────────────────────────────────────┐
│         Mock Scraper                    │
├─────────────────────────────────────────┤
│                                         │
│  Categories:                            │
│  • power-tools (15 templates)           │
│  • hand-tools (5 templates)             │
│  • insulation (4 templates)             │
│  • plumbing (4 templates)               │
│  • electrical (4 templates)             │
│  • building-materials (4 templates)     │
│  • decorating (4 templates)             │
│  • gardening (4 templates)              │
│                                         │
│  Retailers:                             │
│  • screwfix, wickes, bandq              │
│  • jewson, travisperkins                │
│                                         │
│  Features:                              │
│  • Realistic pricing                    │
│  • Stock variations                     │
│  • Brand data                           │
│  • Product URLs                         │
│  • Image URLs                           │
│                                         │
└──────────────┬──────────────────────────┘
               │
               ▼
        ┌─────────────┐
        │  Generated  │
        │    Data     │
        └─────────────┘
```

### Real Scraper (Planned - Screwfix)

```
┌─────────────────────────────────────────┐
│      Real Scraper (Screwfix)            │
├─────────────────────────────────────────┤
│                                         │
│  1. Check robots.txt                    │
│  2. Fetch category page                 │
│  3. Extract product links               │
│  4. For each product:                   │
│     • Wait 2 seconds (rate limit)       │
│     • Fetch product page                │
│     • Parse HTML with Cheerio           │
│     • Extract data                      │
│     • Handle errors                     │
│  5. Return results                      │
│                                         │
│  Challenges:                            │
│  • CSS selectors may change             │
│  • IP bans                              │
│  • Rate limits                          │
│  • Legal issues                         │
│                                         │
└──────────────┬──────────────────────────┘
               │
               ▼
        ┌─────────────┐
        │   Real      │
        │    Data     │
        └─────────────┘
```

## Database Schema Visual

```
┌─────────────────────────────────────────────────────────────┐
│                    scraped_prices                           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │    id    │  │product   │  │ retailer │  │   price  │  │
│  │  (UUID)  │  │  _name   │  │ (TEXT)   │  │ (DECIMAL)│  │
│  │   PK     │  │  (TEXT)  │  │          │  │          │  │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘  │
│                                                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │  brand   │  │ category │  │ in_stock │  │product   │  │
│  │  (TEXT)  │  │  (TEXT)  │  │(BOOLEAN) │  │   _url   │  │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘  │
│                                                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                 │
│  │image_url │  │stock_text│  │scraped_at│                 │
│  │  (TEXT)  │  │  (TEXT)  │  │(TIMESTAMP)│                 │
│  └──────────┘  └──────────┘  └──────────┘                 │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ Indexes
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  Indexes (10 total):                                        │
│  • idx_retailer              (retailer)                     │
│  • idx_category              (category)                     │
│  • idx_price                 (price)                        │
│  • idx_scraped_at            (scraped_at DESC)              │
│  • idx_brand                 (brand)                        │
│  • idx_in_stock              (in_stock)                     │
│  • idx_retailer_product      (retailer, retailer_product_id)│
│  • idx_retailer_category_stock (retailer, category, stock)  │
│  • idx_product_name          (GIN full-text search)         │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## API Endpoint Map

```
/api/prices
│
├── GET /                        (List all with filters)
│   └── Query: retailer, category, minPrice, maxPrice, inStock, brand, search
│
├── GET /stats                   (Statistics)
│
├── GET /:retailer               (By retailer)
│   └── Query: category
│
├── GET /:retailer/:category     (By category)
│
├── GET /search/:query           (Search)
│   └── Query: retailer, category, minPrice, maxPrice, inStock, brand
│
├── GET /compare/:productId      (Compare prices)
│
├── GET /history/:retailer/:productId  (Price history)
│   └── Query: days
│
├── POST /scrape                 (Trigger scrape)
│   └── Body: retailer, category, limit, useMockData
│
└── POST /product                (Scrape single)
    └── Body: url, retailer, useMockData
```

## Rate Limiting Visual

```
┌─────────────────────────────────────────────────┐
│          Rate Limiter                            │
├─────────────────────────────────────────────────┤
│                                                 │
│  Request ──▶ [Check Time] ──▶ [Wait if needed] │
│                     │                           │
│                     ▼                           │
│              [Make Request]                     │
│                     │                           │
│                     ▼                           │
│              [Update Last Request]              │
│                                                 │
│  Delays:                                        │
│  • Mock Scraper:  100ms                         │
│  • Screwfix:      2000ms (2 seconds)            │
│  • Wickes:        2000ms                        │
│  • B&Q:           2000ms                        │
│                                                 │
│  Max Requests/Hour:                             │
│  • Mock Scraper:  Unlimited                     │
│  • Real Scrapers: 1800 requests/hour           │
│                                                 │
└─────────────────────────────────────────────────┘
```

## Error Handling Flow

```
┌────────────────────────────────────────────────┐
│         Error Handling Strategy                │
├────────────────────────────────────────────────┤
│                                                │
│  1. Scraping Errors                            │
│     • Log error                                │
│     • Continue with next product               │
│     • Return partial results                   │
│     • Don't crash on single failure            │
│                                                │
│  2. Database Errors                            │
│     • Log error                                │
│     • Return error response                    │
│     • Don't save invalid data                  │
│                                                │
│  3. API Errors                                 │
│     • Validate input                           │
│     • Return meaningful error messages         │
│     • Log to Sentry (if enabled)               │
│                                                │
│  4. Network Errors                             │
│     • Retry with exponential backoff           │
│     • Timeout after 3 attempts                 │
│     • Log failures                             │
│                                                │
└────────────────────────────────────────────────┘
```

## Security Layers

```
┌────────────────────────────────────────────────┐
│            Security Stack                      │
├────────────────────────────────────────────────┤
│                                                │
│  Layer 1: API Validation                       │
│  • Input validation with TypeScript            │
│  • Elysia schema validation                    │
│  • Type checking                               │
│                                                │
│  Layer 2: Database Security                    │
│  • Row Level Security (RLS)                    │
│  • Service role for admin                      │
│  • Anon key for public read                    │
│  • Parameterized queries (no SQL injection)    │
│                                                │
│  Layer 3: Rate Limiting                        │
│  • 2-second delays between requests            │
│  • Respect robots.txt                          │
│  • User-agent headers                          │
│                                                │
│  Layer 4: Error Handling                       │
│  • No sensitive data in logs                   │
│  • Sentry error tracking                       │
│  • Generic error messages to users            │
│                                                │
└────────────────────────────────────────────────┘
```

---

**Last Updated:** 2025-01-31
**Version:** 1.0.0
