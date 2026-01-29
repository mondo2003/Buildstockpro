# BuildStock Pro - Product Requirements Document (PRD)

**Project:** Real-time Building Materials Aggregator for UK Builders
**Document Version:** 2.0
**Last Updated:** January 28, 2026
**Status:** Phase 2 - Strategic Planning

---

## 1. Product Overview

### 1.1 Vision Statement

BuildStock Pro is the leading real-time aggregation platform for UK builders to find, compare, and source building materials across multiple merchants. We eliminate the 2-5 hours per week builders waste calling around to check stock and compare prices by providing instant, accurate results sorted by price, filtered by availability, and contextualized by location.

### 1.2 Mission

**Empower UK builders to source materials smarter, faster, and cheaper.**

### 1.3 Product Goals

**Primary Goal:** Reduce material sourcing time from hours to minutes per project.

**Secondary Goals:**
- Save builders 10-20% on material costs through price comparison
- Eliminate project delays caused by material stockouts
- Become the default tool for UK professional builders (target: 25% market share)

### 1.4 Success Criteria

**Phase 1 - Validation (Months 1-3):**
- 70%+ of interviewed builders commit to beta testing
- At least one merchant API partnership signed
- Technical architecture approved
- Go/no-go decision

**Phase 2 - MVP (Months 4-9):**
- 3-5 merchant integrations live
- 95%+ data accuracy
- Beta users report 2+ hours/week time savings
- NPS 50+

**Phase 3 - Growth (Months 10-18):**
- 1,000 paying customers
- £600K ARR
- <10% monthly churn
- Break-even cash flow

---

## 2. User Stories

### 2.1 Primary User: Professional Builder

**Epic 1: Search and Compare Materials**

**Story 1.1: Basic Search**
> As a professional builder,
> I want to search for building materials by name, category, or brand,
> So that I can quickly find what I need for my current project.

**Acceptance Criteria:**
- Search bar is prominent on home screen
- Autocomplete suggests materials as user types
- Search results appear within 500ms
- Results can be filtered by category, brand, merchant
- Search history is saved for quick re-search

**Story 1.2: In-Stock Filter**
> As a professional builder,
> I want to filter search results to show only in-stock items,
> So that I don't waste time driving to stores that don't have what I need.

**Acceptance Criteria:**
- "In-stock only" toggle switch is prominent
- Filter hides all out-of-stock items from results
- Stock levels are shown for each result (e.g., "45 in stock")
- Stock data is no older than 4 hours
- "Last updated" timestamp is visible

**Story 1.3: Price Sorting**
> As a professional builder,
> I want to sort results by price (cheapest to most expensive),
> So that I can minimize my material costs.

**Acceptance Criteria:**
- Results default to sorting by price (ascending)
- Unit price is clearly displayed (£/sheet, £/meter, etc.)
- Trade price is shown if user has linked trade account
- VAT is included or clearly excluded
- Bulk pricing tiers are displayed (e.g., "10+ sheets: £11.50 each")

**Story 1.4: Location Context**
> As a professional builder,
> I want to see the distance to each merchant branch,
> So that I can factor travel time/cost into my decision.

**Acceptance Criteria:**
- Distance is shown for each result (e.g., "3.2 miles away")
- Results can be sorted by distance
- Map view shows branch locations relative to user
- Delivery options are displayed (Click & Collect, delivery, lead time)
- Estimated delivery cost is calculated and shown

**Story 1.5: Combined Search**
> As a professional builder,
> I want to search for materials that match my criteria (in-stock, nearby, cheap),
> So that I can find the best overall option in one search.

**Acceptance Criteria:**
- Smart sorting considers price + stock + distance
- User can set radius filter (e.g., "within 10 miles")
- Results show weighted score (e.g., "Best match: 95%")
- User can adjust priority sliders (price vs. distance vs. stock)

---

**Epic 2: Save and Organize**

**Story 2.1: Save Materials**
> As a professional builder,
> I want to save materials to a project list,
> So that I can quickly access them later or share with my team.

**Acceptance Criteria:**
- Heart/bookmark icon on each result
- Material is saved to default "Favorites" list
- User can create custom project lists (e.g., "Smith House Job")
- Saved materials show current price/stock (real-time)
- Lists can be shared via link or email

**Story 2.2: Compare Materials**
> As a professional builder,
> I want to compare multiple materials side-by-side,
> So that I can make an informed decision.

**Acceptance Criteria:**
- Up to 4 materials can be selected for comparison
- Comparison table shows: price, stock, distance, brand, specs
- Differences are highlighted
- Best option for each criterion is highlighted
- Comparison can be saved or shared

---

**Epic 3: Place Orders**

**Story 3.1: Reserve for Collection**
> As a professional builder,
> I want to reserve an item for Click & Collect,
> So that it's waiting for me when I arrive.

**Acceptance Criteria:**
- "Reserve" button on in-stock items
- User selects quantity and collection time
- Reservation confirmation is shown (with reference number)
- Reminder notification is sent before collection time
- Reservation expires after 24 hours

**Story 3.2: Order for Delivery**
> As a professional builder,
> I want to order materials for delivery,
> So that I don't have to leave the job site.

**Acceptance Criteria:**
- "Order delivery" button on all items
- Delivery cost is calculated and shown
- Expected delivery date/time is displayed
- User enters delivery address (saved for future)
- Order confirmation is sent via email and in-app
- Order tracking shows status (confirmed, dispatched, delivered)

**Story 3.3: Trade Account Integration**
> As a professional builder,
> I want to link my trade accounts (Travis Perkins, Jewson, etc.),
> So that I see trade pricing and can use my credit terms.

**Acceptance Criteria:**
- User can link trade accounts via merchant login
- Trade pricing is displayed instead of retail price
- 30-day payment option is shown (if eligible)
- Order history from trade account is imported
- Invoices are accessible in-app

---

**Epic 4: Stay Informed**

**Story 4.1: Price Drop Alerts**
> As a professional builder,
> I want to receive notifications when prices drop for my saved materials,
> So that I can buy at the best time.

**Acceptance Criteria:**
- User can enable alerts for saved materials
- Notification is sent when price drops by >5%
- Notification shows old vs. new price
- User can tap to view/buy the material
- Alerts can be customized (threshold, frequency)

**Story 4.2: Stock Alerts**
> As a professional builder,
> I want to be notified when an out-of-stock item becomes available,
> So that I can buy it before it sells out again.

**Acceptance Criteria:**
- User can enable alerts for any material
- Notification is sent immediately when stock is detected
- Notification shows merchant, price, quantity available
- User can tap to reserve the item
- Alert auto-expires after 24 hours

**Story 4.3: Data Freshness Indicator**
> As a professional builder,
> I want to see how recent the stock/price data is,
> So that I can trust the accuracy.

**Acceptance Criteria:**
- "Last updated: 23 minutes ago" shown on each result
- Color-coded freshness indicator (green <1hr, yellow 1-4hr, red >4hr)
- Manual refresh button (pull-to-refresh)
- Data source is shown (e.g., "via Travis Perkins API")

---

### 2.2 Secondary User: Property Developer

**Epic 5: Project Management**

**Story 5.1: Create Project Budgets**
> As a property developer,
> I want to create project material budgets,
> So that I can track costs and avoid overruns.

**Acceptance Criteria:**
- User can create a project with budget target
- Materials can be added to project with estimated costs
- Real-time price updates show budget impact
- Alerts are sent when budget is at risk
- Budget vs. actual report is available

**Story 5.2: Bulk Order Optimization**
> As a property developer,
> I want to find the best combination of merchants for a bulk order,
> So that I minimize total cost (materials + delivery).

**Acceptance Criteria:**
- User can upload a materials list (CSV, PDF)
- System suggests optimal merchant combination
- Breakdown shows per-merchant orders and costs
- User can adjust suggestions (add/remove merchants)
- Total cost includes delivery and fees

**Story 5.3: Team Collaboration**
> As a property developer,
> I want to share projects with my team,
> So that everyone is aligned on materials and budgets.

**Acceptance Criteria:**
- Projects can be shared with team members
- Permission levels: view, edit, admin
- Activity log shows who made changes
- Comments can be added to materials
- @mentions notify team members

---

### 2.3 Tertiary User: DIYer

**Epic 6: Simplified Discovery**

**Story 6.1: Guided Search**
> As a DIYer,
> I want to be guided to find the right materials for my project,
> So that I don't buy the wrong thing.

**Acceptance Criteria:**
- Project templates available (e.g., "Decking," "Bathroom," "Kitchen")
- Step-by-step material checklist for each project type
- Quantity calculator built in (e.g., "How many decks boards do you need?")
- Educational content linked (e.g., "How to choose the right cement")
- Video tutorials from tradespeople

**Story 6.2: Price Comparison**
> As a DIYer,
> I want to compare prices across merchants,
> So that I don't overpay for materials.

**Acceptance Criteria:**
- Retail pricing is displayed (no trade pricing)
- Price history chart shows if current price is good
- Similar products are suggested for comparison
- Reviews and ratings from other users
- "Best value" badge for low-priced, high-rated items

---

## 3. MVP Features

### 3.1 Must-Have Features (MVP - Version 1.0)

**Core Search & Filter:**
- ✅ Material search (by name, category, brand, SKU)
- ✅ In-stock only filter
- ✅ Price sorting (cheapest to most expensive)
- ✅ Location context (merchant name, distance, delivery)
- ✅ Search autocomplete/suggestions
- ✅ Category browsing (timber, insulation, cement, etc.)

**Data & Accuracy:**
- ✅ Real-time stock levels (or hourly updates)
- ✅ Real-time pricing
- ✅ "Last updated" timestamps
- ✅ Data freshness indicators
- ✅ Multi-merchant aggregation (3-5 merchants)

**User Accounts:**
- ✅ Sign up/login (email/password, Google Sign-In)
- ✅ User profile (name, company, location)
- ✅ Save materials to favorites
- ✅ View search history

**Ordering:**
- ✅ Link to merchant website/app for purchase
- ✅ Affiliate tracking (for revenue)
- ✅ Click & Collect information
- ✅ Delivery options display

**Platforms:**
- ✅ Web app (responsive, mobile-optimized)
- ✅ iOS app (App Store)
- ✅ Android app (Play Store)

**Performance:**
- ✅ Search latency <500ms (95th percentile)
- ✅ Data freshness <4 hours
- ✅ 99% uptime

### 3.2 Should-Have Features (Version 1.5)

**Enhanced Search:**
- ✅ Advanced filters (brand, price range, radius, rating)
- ✅ Save custom filter presets
- ✅ Bulk search (upload CSV/PDF)
- ✅ Barcode/QR scanner (in mobile apps)

**Organization:**
- ✅ Project lists (create, name, share)
- ✅ Compare materials side-by-side
- ✅ Export lists (PDF, CSV, email)
- ✅ Share lists via link

**Alerts:**
- ✅ Price drop notifications
- ✅ Stock availability notifications
- ✅ Push notification settings

**Trade Features:**
- ✅ Trade account linking (1-2 merchants)
- ✅ Trade pricing display
- ✅ 30-day payment terms indicator

**Geolocation:**
- ✅ "Use my location" button
- ✅ Radius filter (within X miles)
- ✅ Map view of branches
- ✅ Route calculation to merchant

### 3.3 Nice-to-Have Features (Version 2.0+)

**AI Features:**
- ➕ Alternative material recommendations ("This is out of stock, try...")
- ➕ Price trend predictions ("This price typically drops in February")
- ➕ Material quantity optimization ("Buy in bulk to save 15%")
- ➕ Project material suggestions based on photos

**Advanced Features:**
- ➕ Bulk order optimization (split across merchants for lowest cost)
- ➕ Budget tracking and alerts
- ➕ Team collaboration (shared projects, permissions)
- ➕ Order tracking (in-app, multi-merchant)
- ➕ In-app payments (direct from app)
- ➕ AR preview (visualize materials on-site)

**Marketplace:**
- ➕ Merchant ratings and reviews
- ➕ User-generated material reviews
- ➕ Community tips and tricks
- ➕ Tradesperson marketplace (hire help)

**Sustainability:**
- ➕ Carbon footprint scoring
- ➕ Eco-friendly material filtering
- ➕ Local merchant prioritization

---

## 4. Functional Requirements

### 4.1 Search & Filter (FR-001 to FR-008)

**FR-001: Material Search**
- System shall provide a search bar on home screen
- System shall support search by: material name, SKU, category, brand
- System shall provide autocomplete suggestions as user types
- System shall display search results within 500ms
- System shall handle spelling errors and typos

**FR-002: Category Browsing**
- System shall display material categories on home screen
- System shall support hierarchical categories (e.g., Timber → Softwood → CLS)
- System shall show item count per category
- System shall allow filtering by category

**FR-003: In-Stock Filter**
- System shall provide "In-stock only" toggle switch
- System shall hide out-of-stock items when filter is enabled
- System shall display stock levels for each result
- System shall update stock levels at least hourly
- System shall show "Last updated" timestamp

**FR-004: Price Sorting**
- System shall default to sorting by price (ascending)
- System shall allow user to change sort order (price desc, distance, relevance)
- System shall display unit price clearly (£/unit)
- System shall handle multiple unit types (each, sheet, meter, kg)

**FR-005: Location Context**
- System shall detect user location (with permission)
- System shall allow manual location entry
- System shall display distance to each merchant branch
- System shall sort results by distance if selected
- System shall show delivery options and costs

**FR-006: Advanced Filters**
- System shall allow filtering by: brand, merchant, price range, distance radius
- System shall allow combining multiple filters
- System shall persist filter preferences
- System shall allow saving custom filter presets

**FR-007: Search History**
- System shall save last 50 searches
- System shall allow quick re-search from history
- System shall allow clearing search history
- System shall sync history across devices

**FR-008: Bulk Search**
- System shall allow uploading CSV/PDF with material list
- System shall parse and search for each material
- System shall display results in table format
- System shall allow bulk actions (add to list, export)

---

### 4.2 Data Management (FR-009 to FR-014)

**FR-009: Merchant Data Integration**
- System shall integrate with merchant APIs (minimum 3 for MVP)
- System shall fetch stock levels at least hourly
- System shall fetch pricing at least hourly
- System shall handle API failures gracefully
- System shall cache data to minimize API calls

**FR-010: Data Freshness**
- System shall display "Last updated" timestamp for each result
- System shall use color-coded freshness indicators (green <1hr, yellow 1-4hr, red >4hr)
- System shall allow manual refresh (pull-to-refresh)
- System shall prioritize fresh data in search results

**FR-011: Data Accuracy**
- System shall achieve 95%+ data accuracy (stock/price matches merchant)
- System shall validate data against merchant websites
- System shall allow users to report inaccuracies
- System shall investigate and correct reported errors within 24 hours

**FR-012: Product Catalog**
- System shall store minimum 10,000 SKUs
- System shall include product: name, SKU, category, brand, description, images, specs
- System shall support multiple units per product (sheet, pack, pallet)
- System shall link products to merchants (many-to-many)

**FR-013: Merchant Data**
- System shall store merchant: name, logo, branches, contact info
- System shall store branch: address, coordinates, hours, phone, email
- System shall calculate distance between user and branch
- System shall support geospatial queries (within radius)

**FR-014: Price History**
- System shall store historical prices (minimum 90 days)
- System shall display price trend charts
- System shall alert on price drops (>5%)
- System shall predict price trends (future feature)

---

### 4.3 User Accounts (FR-015 to FR-020)

**FR-015: Authentication**
- System shall support sign up via email/password
- System shall support sign in via Google Sign-In
- System shall require email verification
- System shall support password reset via email
- System shall maintain secure session (JWT tokens)

**FR-016: User Profiles**
- System shall store user: name, email, company, phone, location
- System shall allow users to edit profile
- System shall allow users to set preferences (radius, units, notifications)
- System shall allow users to delete account

**FR-017: Saved Materials**
- System shall allow users to save materials to favorites
- System shall allow users to create custom lists
- System shall update saved materials with current price/stock
- System shall allow sharing lists via link or email

**FR-018: Trade Account Integration**
- System shall allow users to link trade accounts
- System shall authenticate via merchant login (OAuth)
- System shall fetch and display trade pricing
- System shall show 30-day payment terms if eligible

**FR-019: Notification Preferences**
- System shall allow users to opt-in to push notifications
- System shall allow users to customize alert types (price drops, stock)
- System shall allow users to set alert frequency (immediate, daily, weekly)
- System shall allow users to disable notifications

**FR-020: Subscription Management**
- System shall support free tier (5 searches/day, web-only)
- System shall support paid tier (unlimited searches, all features)
- System shall accept payment via credit card (Stripe)
- System shall handle subscription upgrades/downgrades/cancellations
- System shall send payment receipts and renewal reminders

---

### 4.4 Ordering (FR-021 to FR-024)

**FR-021: Click & Collect**
- System shall show "Click & Collect" availability
- System shall allow users to reserve items for collection
- System shall generate reservation confirmation (reference number)
- System shall send reminder notification before collection time
- System shall link to merchant reservation system

**FR-022: Delivery Options**
- System shall display delivery options for each merchant
- System shall calculate and show delivery cost
- System shall show expected delivery date/time
- System shall allow users to enter delivery address
- System shall save delivery addresses for future use

**FR-023: External Linking**
- System shall link to merchant website/app for purchase
- System shall use affiliate links for revenue tracking
- System shall open merchant site in new tab/window
- System shall pass material context (SKU, quantity)

**FR-024: In-App Ordering (Future)**
- System shall allow users to place orders directly in app
- System shall integrate with merchant checkout APIs
- System shall support trade account payments (30-day terms)
- System shall provide order tracking in-app

---

### 4.5 Notifications (FR-025 to FR-028)

**FR-025: Price Drop Alerts**
- System shall monitor prices for saved materials
- System shall send notification when price drops >5%
- System shall show old vs. new price in notification
- System shall allow user to tap to view/buy material
- System shall allow customizing drop threshold

**FR-026: Stock Alerts**
- System shall monitor stock for saved materials
- System shall send notification when out-of-stock item becomes available
- System shall show merchant, price, quantity in notification
- System shall allow user to tap to reserve item
- System shall expire alert after 24 hours

**FR-027: Push Notifications**
- System shall send push notifications for alerts
- System shall respect user notification preferences
- System shall group notifications to avoid spam
- System shall allow users to unsubscribe from notifications

**FR-028: Email Notifications**
- System shall send email digest of saved materials (weekly)
- System shall send summary of price drops (weekly)
- System shall allow users to customize email frequency

---

### 4.6 Platform Requirements (FR-029 to FR-032)

**FR-029: Web Application**
- System shall be responsive (mobile, tablet, desktop)
- System shall work in all major browsers (Chrome, Safari, Firefox, Edge)
- System shall be accessible (WCAG 2.1 AA compliant)
- System shall load within 3 seconds on 3G connection

**FR-030: iOS Application**
- System shall be compatible with iOS 15+
- System shall follow iOS Human Interface Guidelines
- System shall support iPhone and iPad
- System shall pass App Store review

**FR-031: Android Application**
- System shall be compatible with Android 10+
- System shall follow Material Design guidelines
- System shall support phones and tablets
- System shall pass Play Store review

**FR-032: Cross-Platform Sync**
- System shall sync user data across devices (web, iOS, Android)
- System shall support offline mode (view cached data)
- System shall sync changes when connection restored
- System shall handle sync conflicts (last-write-wins)

---

## 5. Non-Functional Requirements

### 5.1 Performance

**NFR-001: Search Latency**
- 95th percentile search response time <500ms
- 99th percentile search response time <1s
- Average search response time <300ms

**NFR-002: Data Freshness**
- Stock levels updated at least hourly
- Pricing updated at least hourly
- Critical items (high-demand) updated every 15 minutes

**NFR-003: API Performance**
- Merchant API calls complete within 2 seconds
- Internal API calls complete within 200ms
- Database queries complete within 100ms (95th percentile)

**NFR-004: Scalability**
- System shall support 1,000 concurrent users (MVP)
- System shall support 10,000 concurrent users (Year 1)
- System shall scale horizontally (auto-scaling)

### 5.2 Reliability

**NFR-005: Uptime**
- 99% uptime during beta
- 99.5% uptime after public launch
- 99.9% uptime (target Year 1)

**NFR-006: Data Accuracy**
- 95%+ stock accuracy (matches merchant sites)
- 98%+ price accuracy (matches merchant sites)
- Inaccuracies investigated and resolved within 24 hours

**NFR-007: Error Handling**
- System shall handle API failures gracefully (show cached data with warning)
- System shall retry failed requests (exponential backoff)
- System shall log all errors for monitoring

### 5.3 Security

**NFR-008: Authentication**
- All user passwords hashed (bcrypt)
- JWT tokens for session management
- OAuth 2.0 for third-party sign-in

**NFR-009: Data Protection**
- All data encrypted in transit (TLS 1.3)
- All data encrypted at rest (AES-256)
- GDPR compliant (UK data hosting)

**NFR-010: Trade Account Security**
- Trade credentials encrypted and stored separately
- OAuth for merchant integrations (no password storage)
- Users can revoke merchant access anytime

**NFR-011: API Security**
- Rate limiting (100 requests/minute per user)
- API keys for merchant integrations
- IP whitelisting for admin access

### 5.4 Usability

**NFR-012: Mobile-First Design**
- Primary use case is mobile phone (on-site)
- Touch-optimized UI (large buttons, readable text)
- Works offline (view cached data)

**NFR-013: Accessibility**
- WCAG 2.1 AA compliant
- Screen reader compatible
- Keyboard navigation support
- Color contrast ratio 4.5:1 minimum

**NFR-014: Internationalization**
- UK English (primary)
- Currency: GBP (£)
- Units: metric and imperial
- Date/time: UK format (DD/MM/YYYY)

### 5.5 Compatibility

**NFR-015: Browser Support**
- Chrome 90+, Safari 14+, Firefox 88+, Edge 90+
- Progressive enhancement for older browsers
- Graceful degradation for JavaScript disabled

**NFR-016: Device Support**
- iOS 15+, Android 10+
- Responsive design (mobile, tablet, desktop)
- Screen sizes: 320px - 2560px width

### 5.6 Maintainability

**NFR-017: Code Quality**
- TypeScript for type safety
- ESLint for code linting
- Unit tests (80%+ coverage)
- Integration tests for critical paths

**NFR-018: Monitoring**
- Application performance monitoring (APM)
- Error tracking (Sentry or similar)
- Uptime monitoring (Pingdom or similar)
- Analytics (user behavior, feature usage)

### 5.7 Compliance

**NFR-019: GDPR Compliance**
- Privacy by design (minimal data collection)
- Explicit consent for location data
- Right to data deletion
- Data retention policy (auto-delete old data)

**NFR-020: Legal Compliance**
- Computer Misuse Act 1990 compliance (ethical scraping)
- Merchant Terms of Service compliance
- ASA compliance (price comparison advertising)

---

## 6. Data Model

### 6.1 Core Entities

**Users**
```
- id: UUID (PK)
- email: string (unique)
- password_hash: string
- name: string
- company: string (optional)
- location_lat: float (optional)
- location_lng: float (optional)
- subscription_tier: enum (free, individual, team, company)
- created_at: timestamp
- updated_at: timestamp
```

**Products**
```
- id: UUID (PK)
- sku: string (unique)
- name: string
- category: string
- brand: string
- description: text
- unit_type: enum (each, sheet, meter, kg, liter)
- image_url: string
- attributes: JSONB (specs, dimensions, etc.)
- created_at: timestamp
- updated_at: timestamp
```

**Merchants**
```
- id: UUID (PK)
- name: string
- logo_url: string
- website: string
- trade_account_available: boolean
- created_at: timestamp
- updated_at: timestamp
```

**Branches**
```
- id: UUID (PK)
- merchant_id: UUID (FK)
- name: string
- address: string
- city: string
- postcode: string
- location: geography (PostGIS)
- phone: string
- email: string
- opening_hours: JSONB
- delivery_radius_km: integer
- created_at: timestamp
- updated_at: timestamp
```

**Stock Levels**
```
- id: UUID (PK)
- product_id: UUID (FK)
- branch_id: UUID (FK)
- quantity: integer
- status: enum (in_stock, low_stock, out_of_stock)
- last_updated: timestamp
- created_at: timestamp
- updated_at: timestamp
```

**Prices**
```
- id: UUID (PK)
- product_id: UUID (FK)
- branch_id: UUID (FK)
- unit_price: decimal(10,2)
- currency: string (GBP)
- vat_included: boolean
- valid_from: timestamp
- valid_to: timestamp
- created_at: timestamp
- updated_at: timestamp
```

**User Lists**
```
- id: UUID (PK)
- user_id: UUID (FK)
- name: string
- type: enum (favorites, project)
- shared: boolean
- created_at: timestamp
- updated_at: timestamp
```

**User List Items**
```
- id: UUID (PK)
- list_id: UUID (FK)
- product_id: UUID (FK)
- quantity: integer
- notes: text
- created_at: timestamp
- updated_at: timestamp
```

**Price Alerts**
```
- id: UUID (PK)
- user_id: UUID (FK)
- product_id: UUID (FK)
- alert_type: enum (price_drop, stock_available)
- threshold_percent: integer (for price_drop)
- active: boolean
- created_at: timestamp
- updated_at: timestamp
```

**Search History**
```
- id: UUID (PK)
- user_id: UUID (FK)
- query: string
- filters: JSONB
- results_count: integer
- created_at: timestamp
```

### 6.2 Indexes

**Performance Indexes:**
```sql
-- Product search
CREATE INDEX idx_products_name ON products USING GIN(to_tsvector('english', name));
CREATE INDEX idx_products_category_brand ON products(category, brand);

-- Stock lookup (in-stock only)
CREATE INDEX idx_stock_in_stock ON stock_levels(product_id, branch_id)
WHERE quantity > 0;

-- Price lookup (current)
CREATE INDEX idx_prices_current ON prices(product_id, branch_id)
WHERE valid_from <= NOW() AND valid_to > NOW();

-- Geospatial (branches within radius)
CREATE INDEX idx_branches_location ON branches USING GIST(location);

-- User lists
CREATE INDEX idx_lists_user ON user_lists(user_id);
```

---

## 7. API Specifications

### 7.1 Search API

**GET /api/v1/search**
```json
// Request
{
  "q": "plasterboard 12.5mm",
  "category": "drylining",
  "brand": "british gypsum",
  "in_stock_only": true,
  "price_min": 10,
  "price_max": 20,
  "radius_km": 10,
  "sort": "price_asc", // price_asc, price_desc, distance_asc, relevance
  "limit": 20,
  "offset": 0
}

// Response
{
  "results": [
    {
      "product": {
        "id": "uuid",
        "sku": "BG-PLASTER-12.5",
        "name": "Gyproc WallBoard Plasterboard 12.5mm",
        "category": "Drylining",
        "brand": "British Gypsum",
        "image_url": "https://...",
        "unit_type": "sheet"
      },
      "stock": [
        {
          "branch": {
            "id": "uuid",
            "name": "Travis Perkins - Lewisham",
            "merchant": "Travis Perkins",
            "distance_km": 3.2,
            "address": "123 High St, London SE13 5JY"
          },
          "quantity": 45,
          "status": "in_stock",
          "last_updated": "2026-01-28T14:30:00Z"
        }
      ],
      "prices": [
        {
          "branch_id": "uuid",
          "unit_price": 12.50,
          "currency": "GBP",
          "vat_included": true,
          "delivery_cost": 15.00,
          "delivery_available": true,
          "click_collect_available": true
        }
      ],
      "best_price": 12.50,
      "best_distance_km": 3.2,
      "in_stock": true,
      "score": 0.95
    }
  ],
  "total": 156,
  "filters": {
    "categories": ["Drylining", "Insulation"],
    "brands": ["British Gypsum", "Knauf"],
    "merchants": ["Travis Perkins", "Screwfix"]
  }
}
```

### 7.2 Product API

**GET /api/v1/products/:id**
```json
// Response
{
  "product": {
    "id": "uuid",
    "sku": "BG-PLASTER-12.5",
    "name": "Gyproc WallBoard Plasterboard 12.5mm",
    "description": "Standard plasterboard for walls and ceilings...",
    "category": "Drylining",
    "brand": "British Gypsum",
    "image_url": "https://...",
    "unit_type": "sheet",
    "attributes": {
      "thickness": "12.5mm",
      "size": "2400mm x 1200mm",
      "edge": "Tapered"
    }
  },
  "stock": [
    {
      "branch": { ... },
      "quantity": 45,
      "status": "in_stock",
      "last_updated": "2026-01-28T14:30:00Z"
    }
  ],
  "prices": [
    {
      "branch": { ... },
      "unit_price": 12.50,
      "currency": "GBP",
      "vat_included": true
    }
  ],
  "price_history": [
    {
      "date": "2026-01-28",
      "avg_price": 12.50,
      "min_price": 11.95,
      "max_price": 13.99
    }
  ]
}
```

### 7.3 User Lists API

**GET /api/v1/lists**
```json
// Response
{
  "lists": [
    {
      "id": "uuid",
      "name": "Smith House Job",
      "type": "project",
      "shared": true,
      "items_count": 23,
      "total_estimated_cost": 1250.00,
      "created_at": "2026-01-20T10:00:00Z"
    }
  ]
}
```

**POST /api/v1/lists**
```json
// Request
{
  "name": "Smith House Job",
  "type": "project",
  "shared": true
}

// Response
{
  "list": {
    "id": "uuid",
    "name": "Smith House Job",
    "type": "project",
    "shared": true,
    "created_at": "2026-01-28T15:00:00Z"
  }
}
```

**POST /api/v1/lists/:id/items**
```json
// Request
{
  "product_id": "uuid",
  "quantity": 50,
  "notes": "For master bedroom ceiling"
}
```

### 7.4 Notifications API

**POST /api/v1/alerts**
```json
// Request
{
  "product_id": "uuid",
  "alert_type": "price_drop",
  "threshold_percent": 5
}
```

**GET /api/v1/alerts**
```json
// Response
{
  "alerts": [
    {
      "id": "uuid",
      "product": { ... },
      "alert_type": "price_drop",
      "threshold_percent": 5,
      "active": true,
      "created_at": "2026-01-28T10:00:00Z"
    }
  ]
}
```

---

## 8. Success Metrics

### 8.1 User Engagement Metrics

**Daily Active Users (DAU):**
- Beta: 10+ (construction company)
- Month 6: 100+
- Month 12: 1,000+
- Month 18: 3,000+

**Weekly Active Users (WAU):**
- Target: 60%+ of registered users
- Measure: Users who performed 1+ searches in last 7 days

**Search Frequency:**
- Target: 10+ searches per active user per week
- Measure: Average searches per user per week

**Session Duration:**
- Target: 3-5 minutes per session
- Measure: Time from app open to close

**Retention:**
- Day 7 retention: 40%+
- Day 30 retention: 20%+
- Day 90 retention: 10%+

### 8.2 Business Metrics

**Conversion Rate:**
- Free to paid: 20%+ within 30 days
- Trial to paid: 40%+
- Upgrade rate: 5%+ per month

**Churn Rate:**
- Monthly churn: <10%
- Annual churn: <30%

**Average Revenue Per User (ARPU):**
- Target: £40-60/month
- Measure: Total MRR / paying customers

**Customer Acquisition Cost (CAC):**
- Target: <£100 per paying customer
- Measure: Total marketing spend / new customers

**Lifetime Value (LTV):**
- Target: >£600
- Measure: ARPU × average customer lifetime (months)

### 8.3 Product Metrics

**Data Accuracy:**
- Stock accuracy: 95%+ (matches merchant sites)
- Price accuracy: 98%+ (matches merchant sites)

**Performance:**
- Search latency: <500ms (95th percentile)
- App load time: <3 seconds on 3G
- API uptime: 99.5%+

**Feature Adoption:**
- In-stock filter: Used by 80%+ of searches
- Save materials: Used by 40%+ of users
- Price alerts: Used by 20%+ of users
- Trade accounts: Linked by 30%+ of eligible users

### 8.4 Satisfaction Metrics

**Net Promoter Score (NPS):**
- Target: 50+ (excellent)
- Measure: "How likely are you to recommend BuildStock Pro?"

**Customer Satisfaction (CSAT):**
- Target: 4.5/5
- Measure: Post-interaction surveys

**Time Savings:**
- Target: 2+ hours/week saved
- Measure: User surveys after 30 days

**Cost Savings:**
- Target: 10-20% savings on material costs
- Measure: User surveys after 90 days

---

## 9. Open Questions & Risks

### 9.1 Open Questions

**Q1: Will builders switch from individual merchant apps?**
- **Status:** Unproven
- **Validation:** User interviews (50 planned) + beta testing
- **Risk Level:** HIGH

**Q2: Will merchants provide API access?**
- **Status:** Unproven
- **Validation:** Partnership discussions (Months 1-3)
- **Risk Level:** HIGH

**Q3: What is the optimal price point?**
- **Status:** Unproven
- **Validation:** Willingness-to-pay questions in interviews
- **Risk Level:** MEDIUM

**Q4: Is hourly data fresh enough?**
- **Status:** Unproven
- **Validation:** User feedback during beta
- **Risk Level:** LOW

**Q5: Should we build in-app payments or link to merchants?**
- **Status:** MVP = external links, future = in-app
- **Validation:** User preference in beta
- **Risk Level:** LOW

### 9.2 Technical Risks

**Risk 1: Data Access Blocked**
- **Impact:** HIGH
- **Probability:** MEDIUM
- **Mitigation:** Partnerships + ethical scraping + user-generated data

**Risk 2: Scalability Bottlenecks**
- **Impact:** MEDIUM
- **Probability:** LOW
- **Mitigation:** Scalable architecture (PostgreSQL + Redis + serverless)

**Risk 3: Data Accuracy Issues**
- **Impact:** MEDIUM
- **Probability:** MEDIUM
- **Mitigation:** Multi-source verification + user reporting

### 9.3 Business Risks

**Risk 4: Slow User Adoption**
- **Impact:** HIGH
- **Probability:** LOW
- **Mitigation:** Beta partner + freemium model + incentives

**Risk 5: Competition Copying Features**
- **Impact:** MEDIUM
- **Probability:** MEDIUM
- **Mitigation:** First-mover advantage + merchant relationships

---

## 10. Appendix

### 10.1 Glossary

- **Stock Level:** Quantity of a product available at a branch
- **In-Stock Only:** Filter that hides out-of-stock items
- **Trade Account:** Business account with payment terms (30-day credit)
- **Click & Collect:** Order online, collect in-store
- **SKU:** Stock Keeping Unit (unique product identifier)
- **NPS:** Net Promoter Score (loyalty metric)
- **ARPU:** Average Revenue Per User
- **CAC:** Customer Acquisition Cost
- **LTV:** Lifetime Value
- **DAU:** Daily Active Users
- **WAU:** Weekly Active Users
- **MAU:** Monthly Active Users

### 10.2 References

- Project Brief: `/buildstock-pro/docs/01-project-brief.md`
- Technical Architecture: `/buildstock-pro/docs/03-architecture.md`
- Validation Report: `/buildstock-pro/docs/04-validation.md`
- Competitor Research: `/Construction-RC/.blackbox5/research/building-materials-app/`
- Feature Matrix: `/prd/02-feature-matrix.md`
- Gap Analysis: `/prd/04-gap-analysis.md`

### 10.3 Document History

- **Version 1.0:** Initial PRD based on research findings (January 20, 2026)
- **Version 2.0:** Updated with technical decisions and detailed requirements (January 28, 2026)

---

**End of PRD**

**Next Steps:**
1. Approve PRD and technical architecture
2. Secure validation phase funding (£75K)
3. Begin builder interviews (50 planned)
4. Start merchant partnership discussions
5. Build clickable prototype for testing
