# Live Data Transfer - BuildStock Pro
**Session Date:** 2026-01-30
**Status:** Complete - Ready for Deployment

---

## Overview

This folder contains all the code and implementation completed in this session for adding live data integration to BuildStock Pro. The implementation enables:

1. **Live Price Scraping** - Web scraping from UK merchant websites
2. **Distance-Based Sorting** - Find products closest to the user
3. **Same-Day Collection** - Show availability for local pickup

---

## Folder Structure

```
live data transfer/
├── backend/
│   ├── scrapers/              # Web scraping framework
│   │   ├── base-scraper.ts    # Base class with ethical scraping
│   │   ├── screwfix-scraper.ts # Screwfix merchant scraper
│   │   └── scraper-queue.ts   # Job queue management
│   ├── migrations/
│   │   └── 002_add_scraping_jobs.sql # Database schema updates
│   ├── scripts/
│   │   └── seed-branches.ts   # Real UK branch locations (21 branches)
│   └── services/
│       └── productService.ts  # Updated with distance sorting
│
├── frontend/
│   ├── hooks/
│   │   └── useGeolocation.ts  # Geolocation detection hook
│   ├── components/
│   │   └── ProductCard.tsx    # Updated with distance & badges
│   ├── app/search/
│   │   └── page.tsx           # Location-enabled search page
│   └── lib/
│       └── types.ts           # Updated type definitions
│
└── docs/
    └── LIVE_DATA_IMPLEMENTATION_SUMMARY.md # Full implementation guide
```

---

## Files Created (6 New Files)

### Backend

1. **`backend/scrapers/base-scraper.ts`** (310 lines)
   - Ethical web scraping with robots.txt compliance
   - Rate limiting (2 seconds between requests)
   - Retry logic with exponential backoff
   - Proxy rotation support
   - Price/stock parsing utilities

2. **`backend/scrapers/screwfix-scraper.ts`** (342 lines)
   - Screwfix merchant-specific scraper
   - Category-based product scraping
   - Individual product page scraping
   - Database integration for products & listings

3. **`backend/scrapers/scraper-queue.ts`** (397 lines)
   - Job queue with priority levels (low/normal/high/urgent)
   - Concurrent scraping (max 3 at once)
   - Job status tracking in database
   - Manual sync trigger endpoint
   - Queue statistics

4. **`backend/migrations/002_add_scraping_jobs.sql`** (223 lines)
   - `scraping_jobs` table for queue tracking
   - `user_locations` table for saved locations
   - PostGIS distance calculation functions
   - `find_nearest_branches_with_product()` function
   - Indexes for performance optimization

5. **`backend/scripts/seed-branches.ts`** (285 lines)
   - 21 real UK branch locations
   - 6 merchants: Screwfix, Travis Perkins, B&Q, Wickes, Jewson, Huws Gray
   - Cities: London, Birmingham, Manchester, Leeds
   - PostGIS geospatial data
   - Click & collect availability

### Frontend

6. **`frontend/hooks/useGeolocation.ts`** (175 lines)
   - Browser geolocation API integration
   - Permission handling (granted/denied/unsupported)
   - Location caching (1-hour expiry)
   - Distance calculation (Haversine formula)
   - Format distance utilities

---

## Files Modified (5 Files)

### Backend

1. **`backend/services/productService.ts`**
   - Added `userLocation` parameter to `getProducts()`
   - Added distance-based sorting with PostGIS
   - Updated `getProductListings()` with distance calculation
   - New: `ORDER BY distance` support

### Frontend

2. **`frontend/components/ProductCard.tsx`**
   - Added same-day collection badge (🚗 Same-day)
   - Updated distance display (formatDistance function)
   - Added `showDistance` prop
   - Green badge for click & collect items

3. **`frontend/app/search/page.tsx`**
   - Integrated `useGeolocation` hook
   - Location enable button with permission status
   - Auto-detect location on page load
   - Location badge display

4. **`frontend/lib/types.ts`**
   - Added `location?: { lat: number; lng: number }` to SearchFilters
   - Added `sameDayCollection?: boolean` filter
   - Added `sameDayCollection?: boolean` to Supplier interface

5. **`frontend/lib/mockData.ts`**
   - Added `sameDayCollection: true` to supplier data
   - Updated for same-day collection testing

---

## Installation Instructions

### Step 1: Install Dependencies

```bash
cd /Users/macbook/Desktop/buildstock.pro/buildstock-pro/backend
bun add cheerio undici
```

### Step 2: Run Database Migration

```bash
cd /Users/macbook/Desktop/buildstock.pro/buildstock-pro/backend
psql $DATABASE_URL -f migrations/002_add_scraping_jobs.sql
```

Or using Supabase CLI:
```bash
supabase db push
```

### Step 3: Seed Branch Locations

```bash
cd /Users/macbook/Desktop/buildstock.pro/buildstock-pro/backend
bun run src/scripts/seed-branches.ts
```

### Step 4: Update Environment Variables

Add to `buildstock-pro/backend/.env`:
```bash
# Scraper Configuration
SCRAPER_RATE_LIMIT_MS=2000
SCRAPER_MAX_CONCURRENT=3
SCRAPER_USE_PROXY=false

# API Key for manual sync triggers
SYNC_API_KEY=your-secret-key-here
```

### Step 5: Test Location Features

1. Open `http://localhost:3000/search`
2. Click "Enable location for distance sorting"
3. Allow browser permissions
4. Sort products by "Distance"

---

## API Usage Examples

### Search with Location (Cheapest + Closest)

```typescript
// Search products sorted by distance from user
const products = await getProducts(
  1,      // page
  20,     // limit
  'wood', // search query
  undefined, // category
  undefined, // brand
  'distance', // sortBy
  { lat: 51.5074, lng: -0.1278 } // user location (London)
);
```

### Find Nearest Branches with Product

```sql
SELECT * FROM find_nearest_branches_with_product(
  'product-uuid',
  51.5074, -- user latitude
  -0.1278, -- user longitude
  50,      -- max distance (km)
  10       -- limit results
);
```

### Trigger Scraping Job

```typescript
import { scraperQueue } from './scrapers/scraper-queue';

// Sync all merchants
await scraperQueue.triggerSync();

// Sync specific merchant and category
await scraperQueue.triggerSync('screwfix', 'electrical');

// Get queue stats
const stats = await scraperQueue.getStats();
console.log(stats);
// { queue: 0, running: 1, completed: 45, failed: 2, scrapers: ['screwfix'] }
```

---

## Database Schema Changes

### New Tables

**scraping_jobs**
```sql
CREATE TABLE scraping_jobs (
  id UUID PRIMARY KEY,
  merchant VARCHAR(100),
  job_type VARCHAR(50),
  priority INT,
  status VARCHAR(20),
  result JSONB,
  error TEXT,
  created_at TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ
);
```

**user_locations**
```sql
CREATE TABLE user_locations (
  id UUID PRIMARY KEY,
  user_id UUID,
  label VARCHAR(100),
  location GEOGRAPHY(POINT, 4326),
  is_default BOOLEAN
);
```

### New Functions

- `calculate_distance(user_lat, user_lng, branch_id)` - Returns distance in km
- `find_nearest_branches_with_product(...)` - Finds nearby branches with stock

---

## Testing Checklist

- [ ] Dependencies installed (`cheerio`, `undici`)
- [ ] Database migration applied
- [ ] Branch locations seeded (21 branches)
- [ ] Environment variables configured
- [ ] Scraper runs without errors
- [ ] Location detection works in browser
- [ ] Distance sorting displays correctly
- [ ] Same-day collection badges appear
- [ ] Products show accurate distances

---

## Performance Notes

### Rate Limiting
- Screwfix: 2 seconds between requests
- Travis Perkins: 3 seconds between requests
- B&Q: 2 seconds between requests

### Caching Strategy
- Product listings: 5 minutes
- Branch locations: 1 hour
- Distance calculations: 10 minutes
- Scraping results: 6 hours

### Database Indexes
- `idx_listings_price_stock_active` - Price/stock sorting
- `idx_branches_location` - PostGIS GIST index
- `idx_scraping_jobs_queue` - Job queue queries

---

## Troubleshooting

### Location permission denied
- Check browser permissions
- Use HTTPS (required for geolocation)
- Fallback to manual postcode entry

### Scraper returns 403
- Verify robots.txt compliance
- Increase rate limit
- Add proxy rotation

### Distance always NULL
- Check PostGIS is enabled: `CREATE EXTENSION postgis;`
- Verify branches have location data
- Ensure location is stored as GEOGRAPHY type

---

## Next Steps

1. ✅ Code complete - All files created and copied
2. 🔄 Install dependencies - Run `bun add cheerio undici`
3. 🔄 Apply migration - Run SQL script
4. 🔄 Seed branches - Run seed script
5. 🔄 Test locally - Verify features work
6. ⏳ Deploy to production

**Estimated time to go live:** 2 hours

---

## Contact & Support

For questions about this implementation, refer to:
- `docs/LIVE_DATA_IMPLEMENTATION_SUMMARY.md` - Complete implementation guide
- Original task list in chat history
- Code comments in each file

---

**Generated:** 2026-01-30
**Agent:** Claude Sonnet 4.5
**Project:** BuildStock Pro - Live Data Integration
