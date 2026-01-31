# BuildStock Pro - Live Data Transition Roadmap
**Date:** 2026-01-30
**Status:** ✅ Beta Ready - All Core Features Working

---

## 🎉 Current State - What's Working

### ✅ Fully Functional Features
- **Search:** Real-time search with 100+ products
- **Filtering:** Category, price range, stock status
- **Sorting:** Price, relevance, rating, carbon footprint
- **Cart:** Add/remove items, quantity adjustment
- **Geolocation:** Location detection (ready to use)
- **Distance Sorting:** Infrastructure in place (needs branches)
- **Same-Day Collection:** Badges displaying (ready for live data)

### 📊 Current Data
- **Products:** 100+ mock products
- **Categories:** 10 (Insulation, Timber, Paints, Tools, Safety, etc.)
- **Merchants:** 6 UK suppliers configured
- **Branch Locations:** 21 real branches ready to seed
- **Data Source:** Mock data (static)

---

## 🚀 Phase 1: Beta Testing (Week 1)

### Goal: Validate user experience with mock data

**Tasks:**
- [ ] Recruit 5-10 beta testers
- [ ] Test all user flows (search → filter → add to cart)
- [ ] Gather feedback on UX
- [ ] Identify any bugs
- [ ] Document feature requests

**Test Checklist for Beta Testers:**
```
□ Search for "wood" - results show correctly
□ Filter by category "Insulation" - works
□ Sort by price (low to high) - works
□ Add item to cart - drawer opens
□ Adjust quantity in cart - works
□ Remove item from cart - works
□ View product details - works
□ Click "View on Supplier Website" - opens new tab
```

**Deliverable:** Beta testing report with feedback

---

## 🚀 Phase 2: Database Setup (Week 1-2)

### Goal: Prepare database for live merchant data

### Step 1: Apply Database Migration
```bash
cd /Users/macbook/Desktop/buildstock.pro/buildstock-pro/backend

# Using psql
psql $DATABASE_URL -f migrations/002_add_scraping_jobs.sql

# OR using Supabase CLI
supabase db push
```

**What this creates:**
- `scraping_jobs` table (track web scraping)
- `user_locations` table (save user addresses)
- PostGIS functions (distance calculations)
- `merchant_branches` table (branch locations)

### Step 2: Seed Merchant Branches
```bash
cd /Users/macbook/Desktop/buildstock.pro/buildstock-pro/backend

# Install scraping dependencies
bun add cheerio undici

# Seed 21 UK branch locations
bun run src/scripts/seed-branches.ts
```

**What this does:**
- Adds 21 real branch locations
- 6 merchants: Screwfix, Travis Perkins, B&Q, Wickes, Jewson, Huws Gray
- Cities: London, Birmingham, Manchester, Leeds
- Includes lat/lng for distance calculations

### Step 3: Configure Environment Variables

**Backend `.env`:**
```bash
# Database (already configured)
DATABASE_URL=postgresql://...
SUPABASE_URL=https://...
SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...

# Scraper Configuration
SCRAPER_RATE_LIMIT_MS=2000
SCRAPER_MAX_CONCURRENT=3
SCRAPER_USE_PROXY=false

# API Keys (add these)
SYNC_API_KEY=your-random-secret-key-here
```

---

## 🚀 Phase 3: Web Scraping Setup (Week 2)

### Goal: Start collecting live data from merchants

### Option A: Quick Start (Mock Data with Real Prices)

**Best for:** Fast launch, learning the system

**Approach:**
1. Keep using mock product data (names, descriptions, images)
2. Scrape ONLY prices and stock levels from merchants
3. Update prices every 6 hours
4. Show "Live Price" badge on products

**Implementation:**
```bash
# Run scraper for pricing only
cd /Users/macbook/Desktop/buildstock.pro/buildstock-pro/backend

# Test Screwfix scraper
bun run -e "
import { scraperQueue } from './src/scrapers/scraper-queue.ts';
await scraperQueue.triggerSync('screwfix', 'electrical');
"
```

**Time to launch:** 2-3 days

---

### Option B: Full Scraping (Complete Live Data)

**Best for:** Full control, richest data

**Approach:**
1. Scrape complete product data (name, price, stock, specs)
2. Sync with 6 merchant APIs
3. Update every 6 hours automatically
4. Real-time stock tracking

**Implementation:**
```bash
# Full sync all merchants
await scraperQueue.triggerSync();

# Schedule via GitHub Actions (runs every 6 hours)
# .github/workflows/merchant-sync.yml
```

**Time to launch:** 1-2 weeks (need to test each merchant scraper)

---

## 🚀 Phase 4: Go Live Decision Matrix

| Feature | Mock Data | Live Scraping | Merchant API |
|---------|-----------|---------------|--------------|
| **Speed to Launch** | ✅ Now (0 days) | ⏳ 3-7 days | ⏳ 30+ days |
| **Data Accuracy** | ⚠️ Static | ✅ Real-time | ✅ Real-time |
| **Stock Levels** | ❌ Fake | ✅ Real (6hr delay) | ✅ Live |
| **Setup Complexity** | ✅ None | ⚠️ Medium | ❌ High |
| **Maintenance** | ✅ Low | ⚠️ Medium | ❌ Low |
| **Legal Risk** | ✅ None | ⚠️ Medium (TOS) | ✅ None |

---

## 🚀 Phase 5: Recommended Launch Strategy

### Week 1: Beta Testing (Mock Data)
- Testers use current app
- Validate UX flows
- Fix bugs

### Week 2: Database + Branches
- Apply migration
- Seed branch locations
- Test geolocation features

### Week 3: Hybrid Launch
- **Launch with:** Mock product data + Real prices
- **Scrape:** Prices and stock levels only
- **Update:** Every 6 hours via GitHub Actions

### Week 4+: Full Live Data
- Build out merchant-specific scrapers
- Add complete product data
- Implement real-time stock updates

---

## 🎯 Critical Path to Live Data

### MUST DO (In Order):

1. **✅ Done:** Core features working
2. **✅ Done:** Infrastructure in place
3. **🔄 Next:** Apply database migration
   ```bash
   cd /Users/macbook/Desktop/buildstock.pro/buildstock-pro/backend
   psql $DATABASE_URL -f migrations/002_add_scraping_jobs.sql
   ```

4. **🔄 Next:** Seed branch locations
   ```bash
   bun add cheerio undici
   bun run src/scripts/seed-branches.ts
   ```

5. **🔄 Next:** Test geolocation
   - Open http://localhost:3000/search
   - Click "Enable location"
   - Verify it works

6. **🔄 Next:** Deploy to production
   ```bash
   git push origin main
   ```

7. **🔄 Next:** Test live scraping
   ```bash
   # Test Screwfix scraper locally
   bun run -e "
   import { ScrewfixScraper } from './src/scrapers/screwfix-scraper.ts';
   const scraper = new ScrewfixScraper();
   await scraper.initialize();
   const result = await scraper.scrapeProducts('electrical');
   console.log(result);
   "
   ```

---

## 📋 Live Data Checklist

### Database (Required for any live data)
- [ ] Migration `002_add_scraping_jobs.sql` applied
- [ ] `merchant_branches` table has data
- [ ] PostGIS extension enabled
- [ ] Distance functions working

### Backend (Required for live data)
- [ ] Scraper dependencies installed (`cheerio`, `undici`)
- [ ] Environment variables configured
- [ ] Scrapers tested locally
- [ ] GitHub Actions workflow works

### Frontend (Optional enhancements)
- [ ] Location detection tested
- [ ] Distance sorting tested
- [ ] Same-day collection badges visible

### Production (Required for go-live)
- [ ] Frontend deployed (Vercel)
- [ ] Backend deployed (Railway/Render)
- [ ] Database configured (Supabase)
- [ ] Environment variables set in production

---

## 🚨 Important Considerations

### Web Scraping Legal Issues

**⚠️ IMPORTANT:** Web scraping may violate Terms of Service
- Check each merchant's `robots.txt`
- Respect rate limits
- Consider official API access instead
- Talk to legal before scraping at scale

### Alternative: Official APIs

**Recommended for production:**
1. **Affiliate Window** - Product feeds from UK merchants
2. **Google Shopping API** - Aggregated product data
3. **Direct Partnerships** - Contact merchants directly

---

## 💡 Quick Start: Hybrid Approach

**Fastest path to live data:**

1. **Week 1:** Launch with mock data (✅ DONE)
2. **Week 2:** Add real prices via scraping/API
3. **Week 3:** Add real stock levels
4. **Week 4:** Add complete product data

**This lets you:**
- Launch NOW with working app
- Get user feedback immediately
- Add live data incrementally
- Adjust strategy based on real usage

---

## 📞 Support Resources

### Documentation Files
- `LIVE_DATA_IMPLEMENTATION_SUMMARY.md` - Full technical guide
- `LOCAL_TESTING_GUIDE.md` - Testing checklist
- `live data transfer/README.md` - All code backup

### Key Files Reference
- Scraping: `backend/src/scrapers/`
- Branches: `backend/src/scripts/seed-branches.ts`
- Migration: `backend/migrations/002_add_scraping_jobs.sql`
- Location: `frontend/hooks/useGeolocation.ts`

---

## 🎯 Summary: Your Next Steps

### Immediate (This Week)
1. ✅ **Beta testing** - Testers use current app
2. **Database setup** - Run migration
3. **Seed branches** - Add location data

### Short Term (Next 2 Weeks)
4. **Install scraper deps** - `bun add cheerio undici`
5. **Test scraping** - Try Screwfix scraper
6. **Decide approach** - Mock+LivePrices vs Full Scraping

### Long Term (Month 1+)
7. **Implement chosen strategy**
8. **Monitor and iterate**
9. **Consider official APIs**

---

**You're ready for beta testing!** 🎉

All core features work. The infrastructure is in place. You can:
- **Launch with mock data now** (week 1)
- **Add live data incrementally** (weeks 2-4)
- **Adjust based on real user feedback**

**What would you like to tackle first?**
