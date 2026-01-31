# BuildStock Pro - Parallel Agent Task Plan
**Date:** 2026-01-31
**Goal:** Live data integration in < 1 week (streamlined approach)
**Strategy:** Hybrid Launch - Mock products + Real prices + Real stock levels

---

## 🚀 Mission: 3 Agents, 1 Week, Live Data

### Executive Summary
We're launching with a **hybrid approach** for maximum speed:
- **Keep:** Mock product data (names, descriptions, images, categories)
- **Add:** Real-time pricing (scraped every 6 hours)
- **Add:** Real stock levels (scraped every 6 hours)
- **Timeline:** 3-5 days to live (vs 2-4 weeks for full scraping)

**Why this approach:**
- ✅ Launch NOW with working app
- ✅ Get real prices quickly
- ✅ Test infrastructure with minimal risk
- ✅ Incremental upgrade path to full scraping

---

## 👥 Agent 1: Database & Infrastructure Setup

**Role:** Database Architect
**Focus:** Prepare database for live data storage
**Dependencies:** None (can start immediately)
**Timeline:** 4-6 hours

### Phase 1: Database Migration (2 hours)

**Task 1.1: Apply Database Migration**
```bash
cd /Users/macbook/Desktop/buildstock.pro/buildstock-pro/backend

# Check current database state
psql $DATABASE_URL -c "\dt"

# Apply migration
psql $DATABASE_URL -f migrations/002_add_scraping_jobs.sql

# Verify tables created
psql $DATABASE_URL -c "\dt scraping*"
psql $DATABASE_URL -c "\dt user_locations"
psql $DATABASE_URL -c "\dt merchant_branches"
```

**Expected Results:**
- `scraping_jobs` table exists
- `user_locations` table exists
- `merchant_branches` table exists
- PostGIS functions created

**Deliverable:** Screenshot of `\dt` output showing all tables

---

**Task 1.2: Verify PostGIS Extension**
```bash
psql $DATABASE_URL -c "SELECT PostGIS_Version();"

# Should return version number like "3.4.x"
# If error: CREATE EXTENSION postgis;
```

**Deliverable:** PostGIS version confirmed

---

### Phase 2: Seed Branch Locations (2 hours)

**Task 2.1: Install Scraper Dependencies**
```bash
cd /Users/macbook/Desktop/buildstock.pro/buildstock-pro/backend

bun add cheerio undici
```

**Expected:** `package.json` updated with dependencies

---

**Task 2.2: Seed 21 UK Branches**
```bash
bun run src/scripts/seed-branches.ts
```

**Expected Output:**
```
✅ Seeded 6 merchants
✅ Seeded 21 branches total
✅ PostGIS coordinates added
```

**Verification:**
```bash
psql $DATABASE_URL -c "SELECT merchant_id, COUNT(*) FROM merchant_branches GROUP BY merchant_id;"
```

**Expected:**
- screwfix: 4 branches
- travis_perkins: 4 branches
- bq: 3 branches
- wickes: 3 branches
- jewson: 4 branches
- huws_gray: 3 branches

**Deliverable:** Screenshot of branch counts

---

### Phase 3: Distance Calculation Testing (2 hours)

**Task 3.1: Test PostGIS Distance Function**
```sql
-- Find branches within 10km of London
SELECT
  mb.branch_name,
  mb.merchant_id,
  ST_Distance(
    mb.location,
    ST_SetSRID(ST_MakePoint(-0.1276, 51.5074), 4326)::geography
  ) / 1000 as distance_km
FROM merchant_branches mb
WHERE ST_DWithin(
  mb.location,
  ST_SetSRID(ST_MakePoint(-0.1276, 51.5074), 4326)::geography,
  10000  -- 10km
)
ORDER BY distance_km;
```

**Expected:** 5-10 branches within 10km of London

**Deliverable:** Query results showing distances

---

**Task 3.2: Verify Backend API Returns Distance**

Create test file `test-distance-api.ts`:
```typescript
import { rawQuery } from './src/utils/database';

async function testDistance() {
  const userLat = 51.5074; // London
  const userLng = -0.1276;

  const result = await rawQuery(`
    SELECT
      p.id,
      p.name,
      MIN(ST_Distance(
        mb.location,
        ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography
      ) / 1000) as distance_km
    FROM products p
    JOIN merchant_branches mb ON mb.merchant_id = ANY (
      SELECT DISTINCT merchant_id FROM product_listings WHERE product_id = p.id
    )
    GROUP BY p.id, p.name
    ORDER BY distance_km
    LIMIT 5
  `, [userLng, userLat]);

  console.log('Products by distance:', result);
}

testDistance();
```

Run: `bun run test-distance-api.ts`

**Deliverable:** JSON output showing products sorted by distance

---

### ✅ Agent 1 Completion Checklist

- [ ] Migration applied (all tables exist)
- [ ] PostGIS extension enabled
- [ ] Branches seeded (21 locations)
- [ ] Distance calculation works
- [ ] Backend API can query by distance
- [ ] Documentation updated with test results

**Handoff:** Provide database connection details and branch data summary to Agent 2

---

## 👥 Agent 2: Scraper Testing & Price Integration

**Role:** Data Integration Specialist
**Focus:** Implement price scraping from Screwfix
**Dependencies:** Agent 1 (must complete database setup first)
**Timeline:** 6-8 hours

### Phase 1: Scraper Setup (2 hours)

**Task 1.1: Test Screwfix Scraper Locally**

Create test file `test-scraper.ts`:
```typescript
import { ScrewfixScraper } from './src/scrapers/screwfix-scraper';

async function testScraper() {
  const scraper = new ScrewfixScraper();

  console.log('🔍 Testing robots.txt parser...');
  const canFetch = await scraper.isAllowed('https://www.screwfix.com/p/something');
  console.log('Can fetch:', canFetch);

  console.log('\n🔍 Testing category scrape...');
  const products = await scraper.scrapeProducts('electrical');
  console.log(`Found ${products.length} products`);

  if (products.length > 0) {
    console.log('\nSample product:', products[0]);
  }
}

testScraper().catch(console.error);
```

Run: `bun run test-scraper.ts`

**Expected Output:**
```
✅ Robots.txt parsed: Allowed
✅ Scraped 45 products from electrical category
Sample product: {
  name: "Ashley 45A 20 Module Consumer Unit",
  price: 24.99,
  stock: "in_stock",
  ...
}
```

**Deliverable:** Screenshot of successful scrape

---

**Task 1.2: Test Rate Limiting**

Modify test to scrape 10 products and verify 2-second delays:
```typescript
// Add timestamp logging
const startTime = Date.now();
for (let i = 0; i < 10; i++) {
  await fetchWithRateLimit(url);
  console.log(`Request ${i+1}: ${Date.now() - startTime}ms`);
}
```

**Expected:** Each request takes ~2000ms (2 seconds)

**Deliverable:** Timestamp logs showing rate limiting

---

### Phase 2: Price Database Integration (3 hours)

**Task 2.1: Create Price Update Table**

Run migration:
```sql
CREATE TABLE IF NOT EXISTS product_prices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  merchant_id TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  stock_level TEXT NOT NULL, -- 'in_stock', 'low_stock', 'out_of_stock'
  stock_quantity INT DEFAULT 0,
  currency TEXT DEFAULT 'GBP',
  scraped_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  source_url TEXT,
  UNIQUE(product_id, merchant_id)
);

CREATE INDEX idx_product_prices_product_id ON product_prices(product_id);
CREATE INDEX idx_product_prices_merchant_id ON product_prices(merchant_id);
CREATE INDEX idx_product_prices_scraped_at ON product_prices(scraped_at);
```

**Deliverable:** Table created with indexes

---

**Task 2.2: Update Scraper to Save Prices**

Modify `screwfix-scraper.ts` save method:
```typescript
async savePriceData(productId: string, merchantId: string, priceData: any) {
  await rawQuery(`
    INSERT INTO product_prices (product_id, merchant_id, price, stock_level, scraped_at, source_url)
    VALUES ($1, $2, $3, $4, NOW(), $5)
    ON CONFLICT (product_id, merchant_id)
    DO UPDATE SET
      price = EXCLUDED.price,
      stock_level = EXCLUDED.stock_level,
      scraped_at = NOW(),
      source_url = EXCLUDED.source_url
  `, [productId, merchantId, priceData.price, priceData.stock, priceData.url]);
}
```

**Deliverable:** Scraper saves to database

---

**Task 2.3: Test Price Scraping End-to-End**

```bash
# Scrape prices for 10 products
bun run -e "
import { ScrewfixScraper } from './src/scrapers/screwfix-scraper';
const scraper = new ScrewfixScraper();
await scraper.initialize();
const products = await scraper.scrapeProducts('electrical', 10);
console.log(\`Scraped \${products.length} products\`);
for (const p of products) {
  await scraper.savePriceData(p.id, 'screwfix', p);
  console.log(\`✅ Saved price for \${p.name}\`);
}
"
```

**Verify in database:**
```bash
psql $DATABASE_URL -c "SELECT product_id, price, stock_level FROM product_prices LIMIT 5;"
```

**Expected:** 5 price records with current data

**Deliverable:** Screenshot of database query

---

### Phase 3: Backend API Enhancement (3 hours)

**Task 3.1: Add Price Endpoint to Backend**

Create `backend/src/routes/prices.ts`:
```typescript
import { Elysia, t } from 'elysia';
import { rawQuery } from '../utils/database';

export const priceRoutes = new Elysia({ prefix: '/prices' })
  .get('/latest/:productId', async ({ params }) => {
    const prices = await rawQuery(`
      SELECT
        merchant_id,
        price,
        stock_level,
        scraped_at
      FROM product_prices
      WHERE product_id = $1
      ORDER BY scraped_at DESC
      LIMIT 6
    `, [params.productId]);

    return {
      success: true,
      data: prices,
    };
  })
  .get('/check-batch', async ({ query }) => {
    const productIds = query.ids?.split(',') || [];
    const prices = await rawQuery(`
      SELECT DISTINCT ON (product_id)
        product_id,
        merchant_id,
        price,
        stock_level
      FROM product_prices
      WHERE product_id = ANY($1)
      ORDER BY product_id, scraped_at DESC
    `, [productIds]);

    return {
      success: true,
      data: prices,
    };
  });
```

Register in `backend/src/index.ts`:
```typescript
import { priceRoutes } from './routes/prices';
app.use(priceRoutes);
```

**Test:**
```bash
curl http://localhost:3001/prices/latest/[product-id]
```

**Expected:** JSON with prices from all merchants

**Deliverable:** API returns live prices

---

**Task 3.2: Update Search Endpoint to Include Prices**

Modify `backend/src/routes/search.ts` to join with prices:
```typescript
const products = await rawQuery(`
  SELECT
    p.*,
    json_agg(
      json_build_object(
        'merchant_id', pp.merchant_id,
        'price', pp.price,
        'stock_level', pp.stock_level,
        'scraped_at', pp.scraped_at
      )
    ) as live_prices
  FROM products p
  LEFT JOIN LATERAL (
    SELECT merchant_id, price, stock_level, scraped_at
    FROM product_prices
    WHERE product_id = p.id
    ORDER BY scraped_at DESC
    LIMIT 6
  ) pp ON true
  WHERE p.name ILIKE $1
  GROUP BY p.id
  LIMIT $2
`, [`%${search}%`, limit]);
```

**Deliverable:** Search results include `live_prices` array

---

### ✅ Agent 2 Completion Checklist

- [ ] Screwfix scraper tested locally
- [ ] Price database table created
- [ ] Scraper saves prices to database
- [ ] Backend API serves live prices
- [ ] Search endpoint includes price data
- [ ] Price updates every 6 hours (verified)

**Handoff:** Provide API documentation and price update schedule to Agent 3

---

## 👥 Agent 3: Production Deployment & Frontend Integration

**Role:** DevOps Engineer
**Focus:** Deploy to production + connect frontend to live prices
**Dependencies:** Agent 2 (must have price API working)
**Timeline:** 6-8 hours

### Phase 1: Frontend Integration (3 hours)

**Task 1.1: Update Frontend API Client**

Modify `frontend/lib/api.ts` to fetch live prices:
```typescript
async searchProducts(filters: SearchFilters): Promise<SearchResults> {
  // ... existing search code ...

  // After getting products, fetch live prices
  const productIds = products.map(p => p.id);
  if (productIds.length > 0) {
    try {
      const priceResponse = await this.request<any[]>(
        `/prices/check-batch?ids=${productIds.join(',')}`
      );

      // Merge live prices into products
      products = products.map(product => {
        const livePrices = priceResponse.filter((p: any) => p.product_id === product.id);
        return {
          ...product,
          suppliers: product.suppliers.map(supplier => {
            const livePrice = livePrices.find((p: any) => p.merchant_id === supplier.id);
            return livePrice ? {
              ...supplier,
              price: livePrice.price,
              stock: livePrice.stock_level === 'in_stock' ? 'in-stock' :
                     livePrice.stock_level === 'low_stock' ? 'low-stock' : 'out-of-stock',
              lastUpdated: livePrice.scraped_at,
              livePrice: true,
            } : supplier;
          }),
        };
      });

      console.log(`✅ Loaded live prices for ${priceResponse.length} products`);
    } catch (err) {
      console.warn('⚠️ Could not fetch live prices, using mock data:', err);
    }
  }

  return { products, total, ... };
}
```

**Deliverable:** Frontend shows "Live Price" badge

---

**Task 1.2: Add Live Price Badge to ProductCard**

Modify `frontend/components/ProductCard.tsx`:
```typescript
// In the product card, add live price indicator
{product.suppliers[0].livePrice && (
  <Badge variant="secondary" className="gap-1 animate-pulse">
    <span className="w-2 h-2 bg-green-500 rounded-full" />
    Live Price
  </Badge>
)}
```

**Deliverable:** Green "Live Price" badge appears on products

---

**Task 1.3: Add "Last Updated" Timestamp**

```typescript
<div className="text-xs text-muted-foreground">
  Updated {formatDistanceToNow(new Date(product.suppliers[0].lastUpdated))} ago
</div>
```

**Deliverable:** Shows "Updated 2 hours ago"

---

### Phase 2: Environment Configuration (2 hours)

**Task 2.1: Set Up GitHub Actions for Scraping**

Create `.github/workflows/price-sync.yml`:
```yaml
name: Price Sync

on:
  schedule:
    - cron: '0 */6 * * *'  # Every 6 hours
  workflow_dispatch:  # Allow manual trigger

jobs:
  sync-prices:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: oven-sh/setup-bun@v2
        with:
          bun-version: latest

      - name: Install dependencies
        run: |
          cd buildstock-pro/backend
          bun install

      - name: Run price scraper
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
          SUPABASE_SERVICE_ROLE_KEY: ${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}
        run: |
          cd buildstock-pro/backend
          bun run src/scripts/sync-prices.ts

      - name: Log results
        run: |
          echo "✅ Price sync completed at $(date)"
```

**Deliverable:** Workflow file created in GitHub

---

**Task 2.2: Configure Production Secrets**

**Frontend (Vercel):**
```bash
vercel env add NEXT_PUBLIC_API_URL production
# Value: https://your-backend.railway.app

vercel env add NEXT_PUBLIC_SUPABASE_URL production
# Value: https://your-project.supabase.co

vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
# Value: your-anon-key
```

**Backend (Railway):**
```bash
railway variables set DATABASE_URL=postgresql://...
railway variables set SUPABASE_URL=https://...
railway variables set SUPABASE_SERVICE_ROLE_KEY=your-key
railway variables set SCRAPER_RATE_LIMIT_MS=2000
railway variables set SCRAPER_MAX_CONCURRENT=3
```

**Deliverable:** All environment variables set

---

### Phase 3: Deployment & Testing (3 hours)

**Task 3.1: Deploy Backend to Railway**

```bash
cd /Users/macbook/Desktop/buildstock.pro/buildstock-pro/backend

# Link to Railway project
railway link

# Deploy
railway up

# Get deployment URL
railway domain
```

**Test:**
```bash
# Wait for deployment to complete
railway logs

# Test health endpoint
curl https://your-backend.railway.app/health
```

**Expected:** `{"status":"ok","timestamp":"..."}`

**Deliverable:** Backend deployed and responding

---

**Task 3.2: Deploy Frontend to Vercel**

```bash
cd /Users/macbook/Desktop/buildstock.pro/buildstock-pro/frontend

# Deploy to Vercel
vercel --prod

# Note the deployment URL
```

**Test:**
1. Open deployed URL
2. Search for "insulation"
3. Check browser console for "✅ Loaded live prices"
4. Verify "Live Price" badge appears

**Deliverable:** Frontend deployed and showing live prices

---

**Task 3.3: Enable GitHub Actions**

```bash
# Push workflow file
git add .github/workflows/price-sync.yml
git commit -m "Add automated price sync workflow"
git push origin main

# Verify workflow appears in GitHub Actions tab
```

**Test manual trigger:**
1. Go to GitHub → Actions → "Price Sync"
2. Click "Run workflow"
3. Watch logs
4. Verify prices update in database

**Deliverable:** Workflow runs successfully

---

**Task 3.4: End-to-End Production Test**

**Test Checklist:**
```
□ Frontend loads at production URL
□ Search returns results
□ "Live Price" badge appears
□ Prices match scraped data
□ Stock levels accurate
□ Distance slider works (with Agent 1's branch data)
□ Same-day collection badges visible
□ GitHub Actions workflow runs every 6 hours
□ Health check endpoint responds
□ Error monitoring configured (Sentry)
```

**Deliverable:** All tests passing, signed-off checklist

---

### ✅ Agent 3 Completion Checklist

- [ ] Frontend fetches live prices
- [ ] Live price badge displays
- [ ] "Last updated" timestamp shows
- [ ] GitHub Actions workflow created
- [ ] Backend deployed to Railway
- [ ] Frontend deployed to Vercel
- [ ] All environment variables configured
- [ ] End-to-end test passing
- [ ] Price sync automation working

**Handoff:** Production URLs and monitoring dashboard

---

## 🎯 Parallel Execution Plan

### Hour 0-2: Setup Phase
- **Agent 1:** Apply database migration, verify PostGIS
- **Agent 2:** Wait for Agent 1 (review scraper code)
- **Agent 3:** Wait for Agent 2 (review deployment docs)

### Hour 2-4: Core Development
- **Agent 1:** Seed branches, test distance calculations
- **Agent 2:** Install scraper dependencies, test scraper locally
- **Agent 3:** Wait for Agent 2

### Hour 4-8: Integration & Testing
- **Agent 1:** Complete database testing, handoff to Agent 2
- **Agent 2:** Implement price database integration
- **Agent 3:** Update frontend API client, prepare deployment

### Hour 8-12: Final Integration
- **Agent 1:** Documentation and cleanup
- **Agent 2:** Backend API endpoints, handoff to Agent 3
- **Agent 3:** Deploy to production, configure GitHub Actions

### Hour 12-16: Testing & Launch
- **Agent 1:** Final verification testing
- **Agent 2:** Monitor scraper performance
- **Agent 3:** End-to-end production testing

---

## 📊 Status Tracking

### Agent 1 Progress
- [ ] Phase 1: Database Migration
- [ ] Phase 2: Seed Branches
- [ ] Phase 3: Distance Testing
- [ ] ✅ COMPLETED

### Agent 2 Progress
- [ ] Phase 1: Scraper Setup
- [ ] Phase 2: Price Integration
- [ ] Phase 3: Backend API
- [ ] ✅ COMPLETED

### Agent 3 Progress
- [ ] Phase 1: Frontend Integration
- [ ] Phase 2: Environment Config
- [ ] Phase 3: Deployment
- [ ] ✅ COMPLETED

---

## 🚨 Known Issues & Solutions

### Issue 1: Distance Slider Not Working
**Status:** Debug code added, investigating
**Expected:** Filter reduces product count
**Actual:** No change in results
**Next:** Check browser console logs after testing

### Issue 2: Rate Limiting May Be Too Slow
**Status:** Configured for 2 seconds/request
**Impact:** Scraping 100 products takes ~3 minutes
**Solution:** Parallelize with concurrent=3 (already configured)

### Issue 3: PostGIS Function Returns Error
**Symptom:** "ST_DWithin not found"
**Fix:** `CREATE EXTENSION postgis;` (Agent 1 Task 1.2)

---

## 📞 Communication Protocol

### Agent Coordination
- **Handoffs:** Document in `HANDOFF_LOG.md`
- **Issues:** Tag in Slack/Discord with `@all`
- **Progress:** Update status checkboxes every 2 hours

### Rollback Plan
If any agent's work breaks production:
1. Revert last commit: `git revert HEAD`
2. Redeploy previous version
3. Document issue in `INCIDENT_REPORT.md`
4. Resume after fix

---

## 🎉 Success Criteria

### Go-Live Checklist
- [ ] All 3 agents completed their tasks
- [ ] Frontend shows live prices with badges
- [ ] Stock levels accurate for >80% products
- [ ] Distance sorting works
- [ ] GitHub Actions syncing prices every 6 hours
- [ ] No critical bugs in production
- [ ] Performance: Search <2s, Page load <3s

### Launch Day
1. Final smoke test: All features working
2. Enable GitHub Actions workflow
3. Announce launch to beta testers
4. Monitor logs for 24 hours
5. Address any issues within 1 hour

---

## 📚 Quick Reference Commands

### Database
```bash
# Check tables
psql $DATABASE_URL -c "\dt"

# View branches
psql $DATABASE_URL -c "SELECT * FROM merchant_branches LIMIT 5;"

# Check prices
psql $DATABASE_URL -c "SELECT * FROM product_prices ORDER BY scraped_at DESC LIMIT 10;"
```

### Scraper
```bash
# Test scraper
cd backend
bun run test-scraper.ts

# Sync prices
bun run src/scripts/sync-praces.ts
```

### Deployment
```bash
# Backend
railway up
railway logs
railway domain

# Frontend
vercel --prod
vercel logs
```

### Monitoring
```bash
# GitHub Actions
gh run list --workflow=price-sync.yml

# View last workflow run
gh run view
```

---

**Generated:** 2026-01-31
**Next Review:** After Agent 1 completes Phase 1
**Questions?** Check `GO_LIVE_ROADMAP.md` for full context
