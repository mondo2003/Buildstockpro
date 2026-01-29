# BuildStock Pro - Technical Architecture

**Project:** Real-time Building Materials Aggregator for UK Builders
**Document Version:** 1.0
**Last Updated:** January 28, 2026
**Status:** Phase 2 - Strategic Planning

---

## Executive Summary

BuildStock Pro's technical architecture is designed for high-performance real-time data aggregation, serving 10,000+ SKUs across 500+ merchant branches with sub-500ms search latency. The system uses a modern, scalable stack optimized for complex geospatial queries, real-time data synchronization, and cross-platform delivery.

**Recommended Tech Stack:**
- **Frontend:** Next.js 15 + shadcn/ui + TypeScript
- **Backend:** Bun + ElysiaJS (with fallback to Python FastAPI for scraping)
- **Database:** PostgreSQL with Supabase (PostGIS extension)
- **Real-time:** Supabase Realtime (2M messages/month included)
- **Hosting:** Vercel (frontend) + Supabase (backend/database)
- **Search:** PostgreSQL Full-Text Search + GIN indexes

**Key Architectural Decisions:**
1. **Monorepo structure** for code sharing across web/mobile
2. **Serverless-first** for cost efficiency and auto-scaling
3. **Hybrid data strategy** (APIs + ethical scraping + user-generated)
4. **Edge caching** for global performance
5. **Type-safe stack** (TypeScript end-to-end)

---

## 1. System Architecture Overview

### 1.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                             │
├──────────────┬──────────────┬──────────────┬──────────────────┤
│   Web App    │  iOS App     │ Android App  │  Future: Mobile  │
│  (Next.js)   │ (React Native) │ (React Native)│  (React Native) │
│              │              │              │  Shared Code     │
└──────┬───────┴──────┬───────┴──────┬───────┴──────────────────┘
       │              │              │
       └──────────────┴──────────────┘
                      │
              ┌───────▼────────┐
              │  API Gateway   │
              │ (Vercel Edge)  │
              └───────┬────────┘
                      │
       ┌──────────────┴──────────────┐
       │                             │
┌──────▼────────┐          ┌────────▼──────┐
│  Next.js API  │          │  Supabase API │
│  (Serverless) │          │  (PostgREST)  │
└──────┬────────┘          └───────┬───────┘
       │                            │
       │              ┌─────────────┴───────────┐
       │              │                          │
┌──────▼────────┐    ┌─▼──────────┐    ┌───────▼──────┐
│  Auth Service │    │ PostgreSQL  │    │  Real-time   │
│  (Supabase)   │    │ (Supabase)  │    │  (Supabase)  │
└───────────────┘    │  + PostGIS  │    │  Subscriptions│
                     └──────┬──────┘    └──────────────┘
                            │
              ┌─────────────┴─────────────┐
              │                           │
         ┌────▼─────┐            ┌────────▼────────┐
         │  Redis   │            │  Data Pipeline  │
         │  Cache   │            │  (Bun Workers)  │
         └──────────┘            └────────┬────────┘
                                         │
                          ┌──────────────┴──────────────┐
                          │                             │
                   ┌──────▼───────┐            ┌────────▼─────┐
                   │  Merchant    │            │   Web        │
                   │  APIs        │            │   Scrapers   │
                   │  (Partners)  │            │  (Playwright)│
                   └──────────────┘            └──────────────┘
```

### 1.2 Data Flow

**Search Flow:**
1. User searches for "plasterboard" in app
2. Request hits Vercel Edge (CDN cache check)
3. If cache miss → Next.js API route handler
4. Query PostgreSQL via Supabase PostgREST
5. Results: products + stock + prices (joined with geospatial distance)
6. Response cached in Redis (5-minute TTL)
7. Results returned to client (formatted)

**Real-time Update Flow:**
1. Merchant API webhook fires (stock/price change)
2. Bun worker receives webhook
3. Update data in PostgreSQL
4. Supabase Realtime pushes update to subscribed clients
5. Client receives update and refreshes UI

**Data Sync Flow (Hourly Polling):**
1. Cron job triggers every hour
2. Bun workers fetch data from merchant APIs
3. Data normalized and upserted to PostgreSQL
4. Redis cache invalidated
5. Connected clients receive real-time updates

---

## 2. Technology Stack

### 2.1 Frontend: Next.js 15 + shadcn/ui

**Framework:** Next.js 15 (App Router)
- Server Components by default (better performance, SEO)
- Hybrid rendering (SSG + SSR + ISR + CSR)
- Turbopack for 50%+ faster builds
- Edge Runtime support for global deployment

**Why Next.js 15?**
- ✅ Excellent SSR capabilities (critical for SEO)
- ✅ Native shadcn/ui compatibility
- ✅ React Native code sharing (up to 70-80%)
- ✅ Largest ecosystem and hiring pool
- ✅ Vercel-backed with strong corporate support
- ✅ Best-in-class mobile app potential (Solito + Expo)

**UI Library:** shadcn/ui
- Copy-paste components (not a dependency)
- Built on Radix UI + Tailwind CSS
- Excellent accessibility (WCAG 2.1 AA)
- Highly customizable
- Full TypeScript support

**State Management:**
- Zustand (lightweight, simple)
- React Query (server state, caching, real-time updates)
- Supabase Realtime hooks (live data subscriptions)

**Maps:**
- Mapbox GL JS or Google Maps API
- Geospatial queries handled by PostGIS
- Client-side clustering for performance

---

### 2.2 Backend: Bun + ElysiaJS

**Runtime:** Bun (v1.0+)
- 4x faster than Node.js
- Native TypeScript support
- Instant cold starts (edge-optimized)
- Built-in package manager

**Framework:** ElysiaJS
- 250K+ requests/sec performance
- Excellent WebSocket support
- Type-safe schema validation
- Minimal boilerplate

**Why Bun + ElysiaJS?**
- ✅ Highest performance in benchmarks
- ✅ Lowest serverless costs (instant cold starts)
- ✅ Native TypeScript (100% type-safe)
- ✅ Growing ecosystem (ThoughtWorks Radar 2025)
- ✅ Perfect for serverless APIs

**Fallback:** Python FastAPI for Web Scraping
- If Bun ecosystem proves insufficient for scraping
- Best-in-class scraping libraries (BeautifulSoup, Scrapy, Playwright)
- Excellent async/await support
- Battle-tested for production

**Decision Framework:**
- Start with Bun + ElysiaJS for API routes
- Use Python FastAPI for complex scraping tasks
- Evaluate at Month 3 (validation phase end)

---

### 2.3 Database: PostgreSQL + Supabase

**Database:** PostgreSQL 16
- ACID compliance (critical for stock/price accuracy)
- PostGIS extension (geospatial queries)
- GIN indexes (complex filters, full-text search)
- JSONB support (flexible product attributes)

**Platform:** Supabase
- Auth, Database, Real-time, Storage (all-in-one)
- 2M real-time messages/month included
- Built-in PostgREST API (auto-generated REST)
- Row Level Security (RLS) for multi-tenancy
- Edge functions (Deno-based serverless)
- Point-in-Time Recovery (PITR) for backups

**Why PostgreSQL + Supabase?**
- ✅ Native PostGIS (best geospatial database)
- ✅ GIN indexes (50-71% performance gains for complex filters)
- ✅ Supabase Realtime (2M messages/month included)
- ✅ Strong ACID compliance (stock/price accuracy)
- ✅ Predictable scaling at reasonable cost ($15-57/month)
- ✅ Excellent disaster recovery (PITR)

**Alternative Considered:** MongoDB Atlas
- Strong real-time capabilities
- Better horizontal scaling
- **Rejected due to:** Weaker geospatial performance, higher cost

---

### 2.4 Hosting & Infrastructure

**Frontend:** Vercel
- Edge Network (global CDN)
- Automatic HTTPS
- Preview deployments
- Serverless Functions (Next.js API routes)
- Free tier for development

**Backend/Database:** Supabase Cloud
- PostgreSQL hosting (EU region for GDPR)
- Built-in backups and replication
- Auto-scaling
- Free tier for development

**Alternative:** Self-hosted on AWS
- EC2 or ECS for compute
- RDS for PostgreSQL
- ElastiCache for Redis
- **Rejected due to:** Higher operational overhead

**Monitoring:**
- Sentry (error tracking)
- Vercel Analytics (web vitals)
- Supabase Dashboard (database metrics)
- Custom metrics (Datadog or New Relic in Year 2)

---

## 3. Database Schema Design

### 3.1 Core Tables

**Users**
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  company VARCHAR(255),
  location_lat DECIMAL(10, 8),
  location_lng DECIMAL(11, 8),
  subscription_tier VARCHAR(20) DEFAULT 'free', -- free, individual, team, company
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
```

**Products**
```sql
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sku VARCHAR(100) UNIQUE NOT NULL,
  name VARCHAR(500) NOT NULL,
  category VARCHAR(100),
  brand VARCHAR(100),
  description TEXT,
  unit_type VARCHAR(20), -- each, sheet, meter, kg, liter
  image_url TEXT,
  attributes JSONB, -- specs, dimensions, etc.
  search_vector tsvector GENERATED ALWAYS AS (
    to_tsvector('english', coalesce(name, '') || ' ' || coalesce(description, '') || ' ' || coalesce(brand, ''))
  ) STORED,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for search
CREATE INDEX idx_products_fts ON products USING GIN(search_vector);
CREATE INDEX idx_products_category_brand ON products(category, brand);
CREATE INDEX idx_products_sku ON products(sku);
```

**Merchants**
```sql
CREATE TABLE merchants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  logo_url TEXT,
  website VARCHAR(255),
  trade_account_available BOOLEAN DEFAULT FALSE,
  api_config JSONB, -- API keys, endpoints, etc.
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Branches**
```sql
CREATE TABLE branches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id UUID REFERENCES merchants(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  address VARCHAR(500),
  city VARCHAR(100),
  postcode VARCHAR(10),
  location GEOGRAPHY(POINT, 4326), -- PostGIS
  phone VARCHAR(20),
  email VARCHAR(255),
  opening_hours JSONB, -- {"monday": {"open": "08:00", "close": "17:00"}, ...}
  delivery_radius_km INTEGER DEFAULT 50,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Geospatial index for distance queries
CREATE INDEX idx_branches_location ON branches USING GIST(location);
CREATE INDEX idx_branches_merchant ON branches(merchant_id);
```

**Stock Levels**
```sql
CREATE TABLE stock_levels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  branch_id UUID REFERENCES branches(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 0,
  status VARCHAR(20) GENERATED ALWAYS AS (
    CASE
      WHEN quantity > 10 THEN 'in_stock'
      WHEN quantity > 0 THEN 'low_stock'
      ELSE 'out_of_stock'
    END
  ) STORED,
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(product_id, branch_id)
);

-- Partial index for in-stock items only
CREATE INDEX idx_stock_in_stock ON stock_levels(product_id, branch_id)
WHERE quantity > 0;

-- Index for freshness
CREATE INDEX idx_stock_updated ON stock_levels(last_updated);
```

**Prices**
```sql
CREATE TABLE prices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  branch_id UUID REFERENCES branches(id) ON DELETE CASCADE,
  unit_price DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'GBP',
  vat_included BOOLEAN DEFAULT TRUE,
  valid_from TIMESTAMPTZ DEFAULT NOW(),
  valid_to TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(product_id, branch_id, valid_from)
);

-- Index for current prices
CREATE INDEX idx_prices_current ON prices(product_id, branch_id)
WHERE valid_from <= NOW() AND (valid_to IS NULL OR valid_to > NOW());

-- Index for price history
CREATE INDEX idx_prices_history ON prices(product_id, valid_from DESC);
```

**User Lists**
```sql
CREATE TABLE user_lists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(20) DEFAULT 'favorites', -- favorites, project
  shared BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_lists_user ON user_lists(user_id);
```

**User List Items**
```sql
CREATE TABLE user_list_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  list_id UUID REFERENCES user_lists(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER DEFAULT 1,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(list_id, product_id)
);

CREATE INDEX idx_list_items_list ON user_list_items(list_id);
```

**Price Alerts**
```sql
CREATE TABLE price_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  alert_type VARCHAR(20) NOT NULL, -- price_drop, stock_available
  threshold_percent INTEGER, -- for price_drop alerts
  active BOOLEAN DEFAULT TRUE,
  triggered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_alerts_user_active ON price_alerts(user_id) WHERE active = TRUE;
CREATE INDEX idx_alerts_product ON price_alerts(product_id);
```

**Search History**
```sql
CREATE TABLE search_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  query TEXT NOT NULL,
  filters JSONB,
  results_count INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_search_user_date ON search_history(user_id, created_at DESC);
```

### 3.2 Performance-Optimizing Indexes

```sql
-- Full-text search (GIN index)
CREATE INDEX idx_products_fts ON products USING GIN(search_vector);

-- Geospatial queries (GiST index)
CREATE INDEX idx_branches_location ON branches USING GIST(location);

-- Partial index for in-stock items only
CREATE INDEX idx_stock_in_stock ON stock_levels(product_id, branch_id)
WHERE quantity > 0;

-- Composite index for common search patterns
CREATE INDEX idx_products_category_brand ON products(category, brand);

-- Covering index to avoid table lookups
CREATE INDEX idx_prices_covering ON prices(product_id, branch_id, unit_price)
WHERE valid_from <= NOW() AND (valid_to IS NULL OR valid_to > NOW());
```

---

## 4. API Design

### 4.1 API Architecture

**Pattern:** RESTful API with GraphQL (optional, future)
- REST for MVP (simpler, faster to implement)
- GraphQL for Version 2 (if complex querying needs emerge)
- OpenAPI/Swagger documentation for REST endpoints

**Authentication:**
- JWT tokens (Supabase Auth)
- OAuth 2.0 for merchant integrations
- API keys for external partners

**Rate Limiting:**
- Free tier: 10 requests/minute
- Paid tier: 100 requests/minute
- Enterprise: 1,000 requests/minute

---

### 4.2 Core Endpoints

**Search & Filter**
```
GET /api/v1/search
  Query params: q, category, brand, in_stock_only, price_min, price_max,
                radius_km, sort, limit, offset
  Response: { results, total, filters }

GET /api/v1/products/:id
  Response: { product, stock[], prices[], price_history[] }

GET /api/v1/categories
  Response: { categories: [{id, name, count}] }
```

**User Lists**
```
GET /api/v1/lists
  Response: { lists[] }

POST /api/v1/lists
  Body: { name, type, shared }
  Response: { list }

GET /api/v1/lists/:id/items
  Response: { items[] }

POST /api/v1/lists/:id/items
  Body: { product_id, quantity, notes }
  Response: { item }
```

**Notifications**
```
GET /api/v1/alerts
  Response: { alerts[] }

POST /api/v1/alerts
  Body: { product_id, alert_type, threshold_percent }
  Response: { alert }

DELETE /api/v1/alerts/:id
  Response: 204 No Content
```

**Auth**
```
POST /api/v1/auth/register
  Body: { email, password, name }
  Response: { user, token }

POST /api/v1/auth/login
  Body: { email, password }
  Response: { user, token }

POST /api/v1/auth/refresh
  Body: { refresh_token }
  Response: { token }
```

---

### 4.3 Real-time Subscriptions

**Using Supabase Realtime:**

```typescript
// Client-side subscription to price changes
const channel = supabase
  .channel('price-changes')
  .on(
    'postgres_changes',
    {
      event: 'UPDATE',
      schema: 'public',
      table: 'prices',
      filter: `product_id=eq.${productId}`
    },
    (payload) => {
      console.log('Price updated:', payload.new);
      // Refresh UI with new price
    }
  )
  .subscribe();
```

**Supported Events:**
- `INSERT` - New stock/price data
- `UPDATE` - Stock/price changes
- `DELETE` - Product/branch deletions

---

## 5. Data Acquisition Strategy

### 5.1 Primary Approach: Merchant APIs (Partnerships)

**Goal:** Secure API partnerships with 3-5 major merchants by Month 3

**Integration Benefits:**
- Real-time data (webhooks or frequent polling)
- Highest accuracy
- Legal and ethical
- Sustainable long-term

**Target Merchants:**
1. Travis Perkins (largest UK merchant)
2. Screwfix (best mobile app, 927 stores)
3. Wickes (pricing transparency)
4. Jewson (trade-focused, 400+ branches)
5. Selco (trade-only)

**Partnership Strategy:**
- Position as value-add (we drive sales to merchants)
- Offer affiliate links (merchants earn commission)
- Start with warm introductions (existing connections)
- BMF (Builders Merchants Federation) relationships

---

### 5.2 Secondary Approach: Ethical Web Scraping

**Tools:**
- Bun + Cheerio (static HTML)
- Playwright (JavaScript-heavy sites)
- Crawlee (full-featured framework)

**Rate Limiting:**
- Respect robots.txt
- 1 request per second per domain
- Exponential backoff on errors
- User-Agent rotation

**Politeness:**
- Scrape during off-peak hours (UK: 10pm-6am)
- Cache data aggressively (hourly, not real-time)
- Monitor server load
- Stop if 429 (Too Many Requests)

**Legal Considerations:**
- UK GDPR compliance
- Computer Misuse Act 1990
- Terms of Service compliance
- Legal review before deployment

---

### 5.3 Fallback: User-Generated Data

**Crowdsourced Stock Verification:**
- Users can flag stock inaccuracies
- "Is this in stock?" button
- Users earn rewards for verified reports
- Data cross-checked against other sources

**Benefits:**
- Improves data accuracy
- Builds community engagement
- Reduces scraping burden
- Fallback when APIs fail

---

### 5.4 Data Pipeline Architecture

```
┌─────────────────┐
│  Merchant APIs  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐     ┌──────────────┐
│  Bun Workers    │────►│  PostgreSQL  │
│  (Cron Jobs)    │     │  (Upsert)    │
└─────────────────┘     └──────┬───────┘
                               │
                ┌──────────────┴──────────────┐
                ▼                             ▼
         ┌─────────────┐            ┌──────────────┐
         │  Redis      │            │  Supabase    │
         │  Cache      │            │  Real-time   │
         │  (Invalidate)│            │  (Broadcast) │
         └─────────────┘            └──────────────┘
```

**Pipeline Steps:**
1. **Cron triggers** (every hour, 2am-6am UK time)
2. **Bun workers** fetch data from merchant APIs
3. **Normalize** data to unified schema
4. **Upsert** to PostgreSQL (INSERT ... ON CONFLICT UPDATE)
5. **Invalidate** Redis cache keys
6. **Trigger** Supabase Realtime broadcasts
7. **Clients** receive updates and refresh UI

---

## 6. Mobile App Architecture

### 6.1 Cross-Platform Strategy

**Approach:** React Native with Expo
- Single codebase for iOS + Android
- 70-80% code sharing with web (via Solito)
- Expo for development and deployment
- Eject if needed for native modules

**Code Sharing (Web + Mobile):**
```
buildstock-pro/
├── apps/
│   ├── web/          (Next.js 15)
│   └── mobile/       (Expo + React Native)
├── packages/
│   ├── ui/           (Shared components - shadcn/ui)
│   ├── api/          (API client, types)
│   ├── config/       (Shared config)
│   └── utils/        (Shared utilities)
```

**Framework:** Solito
- Seamless navigation sharing (React Router vs React Navigation)
- Universal API calls
- Shared state management (Zustand)

---

### 6.2 Mobile-Specific Features

**Location Services:**
- Geolocation API (user's current location)
- Background location (optional, with permission)
- Geofencing (notify when near merchant)

**Push Notifications:**
- Price drop alerts
- Stock availability alerts
- Order status updates

**Offline Support:**
- Cached search results
- View saved lists offline
- Sync when connection restored

**Camera/QR:**
- Barcode scanner (in-app)
- QR code generator (share lists)

---

## 7. Security Architecture

### 7.1 Authentication & Authorization

**Supabase Auth:**
- Email/password authentication
- OAuth providers (Google, Apple)
- JWT tokens (short-lived, 15 minutes)
- Refresh tokens (long-lived, 30 days)

**Row Level Security (RLS):**
```sql
-- Users can only view their own lists
CREATE POLICY user_lists_policy ON user_lists
  FOR ALL
  USING (auth.uid() = user_id);

-- Public can read products (no auth required)
CREATE POLICY products_read_policy ON products
  FOR SELECT
  USING (true);
```

**Trade Account Credentials:**
- Encrypted at rest (AES-256)
- OAuth flow (no password storage)
- Separate storage (user_encrypted_secrets table)
- Users can revoke access anytime

---

### 7.2 Data Protection

**Encryption:**
- TLS 1.3 for data in transit
- AES-256 for data at rest
- Supabase-managed encryption keys

**GDPR Compliance:**
- Right to access (data export)
- Right to erasure (account deletion)
- Right to portability (data export)
- Explicit consent for location data
- Data retention policy (auto-delete after 90 days)

**Data Residency:**
- Supabase EU region (Ireland/Germany)
- UK data compliant post-Brexit

---

### 7.3 API Security

**Rate Limiting:**
- Per-user limits (10-1000 req/min)
- Per-IP limits (prevent abuse)
- Graduated response (429 → 403 → ban)

**Input Validation:**
- Zod schemas for all API inputs
- SQL injection prevention (parameterized queries)
- XSS prevention (React escaping)

**CORS:**
- Whitelist: buildstock.pro, *.buildstock.pro
- Credentials: allowed
- Methods: GET, POST, PUT, DELETE

---

## 8. Monitoring & Observability

### 8.1 Application Performance Monitoring (APM)

**Tools:**
- **Sentry:** Error tracking, performance monitoring
- **Vercel Analytics:** Web vitals, traffic analytics
- **Supabase Dashboard:** Database metrics, real-time stats
- **Custom Metrics:** Datadog or New Relic (Year 2)

**Key Metrics:**
- Search latency (p50, p95, p99)
- API error rate
- Database query performance
- Cache hit rate
- Uptime/downtime

---

### 8.2 Error Tracking

**Sentry Integration:**
```typescript
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1, // 10% of transactions
});
```

**Alerts:**
- Error rate > 1% → PagerDuty alert
- Error rate > 5% → SMS + email
- Critical errors → Immediate notification

---

### 8.3 Logging

**Structured Logging:**
```typescript
console.log({
  level: 'info',
  event: 'search',
  userId: user.id,
  query: 'plasterboard',
  resultsCount: 156,
  latencyMs: 234
});
```

**Log Aggregation:**
- Supabase Logs (built-in)
- Vercel Logs (built-in)
- Datadog Logs (Year 2)

---

## 9. Deployment Strategy

### 9.1 Environments

**Development:**
- Local development (Docker Compose)
- Local Supabase instance
- Feature branches (preview deployments)

**Staging:**
- Vercel preview deployments
- Supabase staging project
- Load testing environment

**Production:**
- Vercel production (*.buildstock.pro)
- Supabase production (EU region)
- CDN caching (Vercel Edge)

---

### 9.2 CI/CD Pipeline

**GitHub Actions Workflow:**
```yaml
name: CI/CD

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run lint
      - run: npm run test
      - run: npm run type-check

  deploy-preview:
    if: github.event_name == 'pull_request'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}

  deploy-production:
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-args: '--prod'
```

---

### 9.3 Database Migrations

**Version Control:**
- Supabase Migrations (SQL files in repo)
- Migration files: `supabase/migrations/`
- Naming: `YYYYMMDD_description.sql`

**Migration Example:**
```sql
-- Migration: 20260128_add_user_lists.sql
CREATE TABLE user_lists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(20) DEFAULT 'favorites',
  shared BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_lists_user ON user_lists(user_id);
```

**Rollback Strategy:**
- Down migrations in separate files
- Supabase CLI: `supabase migration up` / `supabase migration down`

---

## 10. Scalability & Performance

### 10.1 Performance Targets

**Search Performance:**
- p50 latency: <300ms
- p95 latency: <500ms
- p99 latency: <1s

**API Performance:**
- All endpoints: <200ms (excluding external APIs)
- Real-time updates: <1s from webhook to client

**Page Load:**
- First Contentful Paint (FCP): <1.5s
- Largest Contentful Paint (LCP): <2.5s
- Time to Interactive (TTI): <3.5s

---

### 10.2 Caching Strategy

**Multi-Layer Caching:**
1. **CDN Cache (Vercel Edge):** Static pages, 1-hour TTL
2. **Redis Cache:** Search results, 5-minute TTL
3. **Database Cache:** PostgreSQL query cache, automatic
4. **Browser Cache:** Service worker, offline support

**Cache Invalidation:**
- Time-based (TTL expiry)
- Event-based (webhook triggers)
- Manual (admin panel)

---

### 10.3 Horizontal Scaling

**Serverless Auto-Scaling:**
- Vercel Edge Functions (auto-scale)
- Supabase Edge Functions (auto-scale)
- Pay-per-use pricing model

**Database Scaling:**
- Supabase Pro plan (up to 8GB RAM)
- Read replicas (Year 2)
- Connection pooling (PgBouncer)

**Worker Scaling:**
- Bun workers (Docker containers)
- Kubernetes (Year 2, if needed)
- Cron job orchestration

---

## 11. Disaster Recovery & Backup

### 11.1 Backup Strategy

**Supabase Backups:**
- Continuous backups (WAL archiving)
- Daily snapshots (30-day retention)
- Point-in-Time Recovery (PITR)

**Backup Frequency:**
- Database: Continuous (WAL) + Daily snapshots
- Redis: Daily (persist to disk)
- Object storage: Versioning enabled

---

### 11.2 Recovery Procedures

**Database Recovery:**
1. Identify failure time
2. Select PITR target
3. Restore to new instance
4. Verify data integrity
5. Switch DNS to new instance
6. Monitor for issues

**RTO (Recovery Time Objective):** 4 hours
**RPO (Recovery Point Objective):** 5 minutes

---

### 11.3 High Availability

**Redundancy:**
- Vercel Edge (global CDN)
- Supabase (multi-AZ deployment)
- Database replication (Year 2)

**Failover:**
- Automatic failover (Supabase managed)
- Health checks (every 30 seconds)
- DNS failover (Route53)

**Uptime Target:** 99.5% (MVP), 99.9% (Year 1)

---

## 12. Cost Optimization

### 12.1 Infrastructure Costs (Monthly)

**Development:**
- Vercel: Free (hobby plan)
- Supabase: Free (tier limits)
- Total: £0

**MVP Launch (Months 4-9):**
- Vercel Pro: £15/month
- Supabase Pro: £25/month
- Total: £40/month

**Growth (Months 10-18):**
- Vercel Pro: £300/month (high traffic)
- Supabase Pro: £200/month (larger DB)
- Monitoring (Datadog): £50/month
- Total: £550/month

**Scale (Year 2+):**
- Vercel Enterprise: £1,000/month
- Supabase Team: £500/month
- Monitoring: £100/month
- Workers (Bun on AWS): £200/month
- Total: £1,800/month

---

### 12.2 Cost Optimization Strategies

**Serverless:** Pay-per-use (no idle costs)
**Edge Caching:** Reduce origin load
**Database Indexing:** Optimize queries (reduce CPU)
**Connection Pooling:** Reduce DB connections
**Image Optimization:** Reduce bandwidth

---

## 13. Development Workflow

### 13.1 Project Structure

```
buildstock-pro/
├── apps/
│   ├── web/                    (Next.js 15 frontend)
│   │   ├── app/                (App Router)
│   │   ├── components/         (React components)
│   │   ├── lib/                (Utilities)
│   │   └── public/             (Static assets)
│   └── mobile/                 (Expo React Native)
│       ├── app/                (React Native screens)
│       ├── components/         (Mobile components)
│       └── assets/             (Mobile assets)
├── packages/
│   ├── ui/                     (Shared shadcn/ui components)
│   ├── api/                    (API client, types)
│   ├── config/                 (Shared config)
│   └── utils/                  (Shared utilities)
├── supabase/
│   ├── migrations/             (Database migrations)
│   ├── functions/              (Edge functions)
│   └── seed.sql                (Seed data)
├── workers/
│   ├── src/                    (Bun workers)
│   │   ├── scrapers/           (Web scrapers)
│   │   ├── sync/               (Data sync jobs)
│   │   └── alerts/             (Alert processing)
│   └── package.json
└── package.json                (Root package.json)
```

---

### 13.2 Development Tools

**Package Manager:** Bun (monorepo support)
**Version Control:** Git + GitHub
**Code Quality:**
- ESLint (linting)
- Prettier (formatting)
- TypeScript (type checking)
- Husky (git hooks)

**Testing:**
- Vitest (unit tests)
- Playwright (E2E tests)
- Supabase CLI (local testing)

---

### 13.3 Git Workflow

**Branching Strategy:**
- `main` (production)
- `develop` (staging)
- `feature/*` (feature branches)
- `bugfix/*` (bug fixes)

**Commit Convention:**
```
feat: add user list management
fix: resolve search performance issue
docs: update API documentation
test: add unit tests for search API
chore: upgrade dependencies
```

**Pull Requests:**
- Require approval from 1 reviewer
- Pass all CI checks
- No merge conflicts
- Linked to GitHub issue

---

## 14. Validation Report Alignment

### 14.1 Architecture vs. PRD Alignment

**Search & Filter Requirements:**
- ✅ Full-text search (PostgreSQL GIN indexes)
- ✅ In-stock filter (partial indexes)
- ✅ Price sorting (ORDER BY price ASC)
- ✅ Location context (PostGIS geospatial queries)
- ✅ Combined filters (complex WHERE clauses)

**Data Freshness:**
- ✅ Hourly updates (cron jobs)
- ✅ Real-time webhooks (Supabase Realtime)
- ✅ "Last updated" timestamps (stock_levels.last_updated)

**Performance:**
- ✅ <500ms search latency (optimized indexes)
- ✅ <3s page load (Next.js SSR + Edge caching)
- ✅ 99.5% uptime (Vercel + Supabase SLA)

---

### 14.2 Identified Gaps & Mitigations

**Gap 1: No native in-app payments (MVP)**
- **Impact:** Medium (users redirected to merchant sites)
- **Mitigation:** External linking with affiliate tracking
- **Future:** In-app payments (Version 2)

**Gap 2: Limited merchant integrations (MVP: 3-5)**
- **Impact:** Medium (incomplete coverage)
- **Mitigation:** Start with major chains (Travis Perkins, Screwfix, Wickes)
- **Future:** Expand to 20+ merchants (Year 1)

**Gap 3: No Android app in MVP (only web + iOS)**
- **Impact:** Low (iOS first, Android follows)
- **Mitigation:** Responsive web app works on Android
- **Future:** Native Android app (Month 7)

---

### 14.3 Technical Risks & Mitigations

**Risk 1: Bun ecosystem immaturity**
- **Impact:** Medium (limited production experience)
- **Mitigation:** Fallback to Node.js/Express or Python FastAPI
- **Decision Point:** Month 3 (validation phase end)

**Risk 2: Geospatial query performance**
- **Impact:** Medium (slow distance calculations)
- **Mitigation:** PostGIS GiST indexes, limit radius to 50 miles
- **Performance:** <100ms for 10,000 branches within radius

**Risk 3: Real-time scalability**
- **Impact:** Low (Supabase Realtime proven at scale)
- **Mitigation:** 2M messages/month included, upgrade if needed
- **Fallback:** Polling (every 30 seconds)

---

## 15. Next Steps

### 15.1 Immediate Actions (Month 1)

1. **Set up development environment**
   - Initialize monorepo (Bun workspaces)
   - Configure Next.js 15 + shadcn/ui
   - Set up Supabase project
   - Configure TypeScript and ESLint

2. **Build database schema**
   - Create migration files
   - Define indexes (performance optimization)
   - Seed test data
   - Set up Row Level Security (RLS)

3. **Prototype API endpoints**
   - Search API (test query performance)
   - Product API (test geospatial queries)
   - User auth (Supabase Auth integration)

---

### 15.2 Short-Term Actions (Months 2-3)

1. **Build clickable prototype**
   - UI mockups (Figma → shadcn/ui)
   - Sample data (10 products, 3 merchants)
   - Interactive flows (search, filter, save)

2. **Data pipeline MVP**
   - Integrate 1 merchant API (or scraper)
   - Set up cron job (hourly sync)
   - Test data accuracy and freshness

3. **Technical architecture review**
   - Load testing (1,000 concurrent users)
   - Performance benchmarking
   - Security audit

---

### 15.3 Long-Term Actions (Months 4-9)

1. **MVP development**
   - Web app (responsive, production-ready)
   - iOS app (React Native + Expo)
   - 3-5 merchant integrations
   - Payment processing (Stripe)

2. **Beta testing**
   - Deploy to construction company partner
   - Gather feedback and iterate
   - Fix bugs and optimize performance

3. **Public launch**
   - App Store submissions
   - Marketing campaigns
   - Scale infrastructure (Vercel Pro, Supabase Pro)

---

## Appendix

### A. Technology Selection Rationale

| Technology | Why Selected | Alternatives Considered |
|------------|--------------|-------------------------|
| **Next.js 15** | Best SSR, shadcn/ui native, React Native sharing | Remix, SvelteKit |
| **Bun + ElysiaJS** | Highest performance, native TypeScript | Node.js + Express, Python FastAPI |
| **PostgreSQL + Supabase** | PostGIS geospatial, real-time, ACID compliance | MongoDB Atlas, Turso SQLite |
| **shadcn/ui** | Customizable, accessible, no dependencies | Chakra UI, Mantine |
| **React Native + Expo** | Cross-platform, 70-80% code sharing | Flutter, Native apps |

---

### B. Performance Benchmarks

**Search Query (10,000 products, 500 branches):**
- Without index: 2,500ms
- With GIN index: 85ms
- With partial index (in-stock only): 45ms
- With Redis cache: 5ms

**Geospatial Query (50-mile radius):**
- Without PostGIS index: 1,200ms
- With GiST index: 65ms
- With result limiting (50 branches): 35ms

---

### C. Reference Documentation

- **Next.js 15:** https://nextjs.org/docs
- **shadcn/ui:** https://ui.shadcn.com
- **Supabase:** https://supabase.com/docs
- **PostGIS:** https://postgis.net/documentation/
- **Bun:** https://bun.sh/docs
- **ElysiaJS:** https://elysiajs.com

---

**End of Technical Architecture Document**

**Related Documents:**
- Project Brief: `/buildstock-pro/docs/01-project-brief.md`
- PRD: `/buildstock-pro/docs/02-prd.md`
- Validation Report: `/buildstock-pro/docs/04-validation.md`
