# Live Data Migration Tasks - Post Beta Testing

**Priority:** High
**When:** After beta testers confirm UI approval
**Estimated Time:** 2-3 days

---

## Phase 1: Database Setup (4 hours)

### Task 1.1: Create Supabase Tables
- [ ] Create `products` table with schema:
  ```sql
  id UUID PRIMARY KEY
  name TEXT NOT NULL
  description TEXT
  price DECIMAL(10,2) NOT NULL
  category TEXT
  subcategory TEXT
  image_url TEXT
  stock INTEGER DEFAULT 0
  specs JSONB
  brand TEXT
  rating DECIMAL(3,2)
  review_count INTEGER DEFAULT 0
  eco_rating TEXT
  carbon_footprint TEXT
  created_at TIMESTAMP DEFAULT NOW()
  ```

- [ ] Create `categories` table for hierarchical categories
- [ ] Create `merchants` table for store locations
- [ ] Create `inventory` table for stock tracking
- [ ] Enable Row Level Security (RLS) policies

### Task 1.2: Create Database Functions
- [ ] `search_products(query)` - Full-text search function
- [ ] `get_products_by_category(category)` - Filter by category
- [ ] `update_stock(product_id, quantity)` - Stock management
- [ ] `get_product_details(product_id)` - Product details with merchant info

---

## Phase 2: Backend API Updates (6 hours)

### Task 2.1: Product Management Endpoints
- [ ] Create `POST /api/products` - Add new product
- [ ] Create `PUT /api/products/:id` - Update product
- [ ] Create `DELETE /api/products/:id` - Delete product
- [ ] Create `GET /api/products/:id` - Get single product
- [ ] Update `GET /api/products` - Query from Supabase instead of mock data

### Task 2.2: Search Enhancement
- [ ] Update `POST /api/search` to use Supabase full-text search
- [ ] Add filters: price range, category, eco-rating, in-stock
- [ ] Add sorting: relevance, price, rating, newest
- [ ] Add pagination for large result sets

### Task 2.3: Inventory Management
- [ ] Create `GET /api/inventory/:product_id` - Check stock levels
- [ ] Create `POST /api/inventory/reserve` - Reserve items for cart
- [ ] Create `POST /api/inventory/release` - Release reserved items
- [ ] Add stock validation to prevent overselling

---

## Phase 3: Admin Panel (8 hours)

### Task 3.1: Authentication
- [ ] Implement admin authentication (Supabase Auth)
- [ ] Create admin role in Supabase
- [ ] Add login page `/admin/login`
- [ ] Add protected route middleware

### Task 3.2: Product Management UI
- [ ] Create `/admin/products` page
  - [ ] Product list table with search/filter
  - [ ] Add new product form
  - [ ] Edit product modal
  - [ ] Delete product with confirmation
  - [ ] Bulk import from CSV/JSON
  - [ ] Bulk update prices/stock

### Task 3.3: Image Upload System
- [ ] Integrate Supabase Storage for product images
- [ ] Create upload component with drag-and-drop
- [ ] Add image optimization (compression, resizing)
- [ ] Generate thumbnail versions
- [ ] Add alt text management for accessibility

### Task 3.4: Inventory Dashboard
- [ ] Create `/admin/inventory` page
  - [ ] Low stock alerts
  - [ ] Stock level indicators
  - [ ] Quick stock update interface
  - [ ] Inventory history log

---

## Phase 4: Real Product Data Import (4 hours)

### Task 4.1: Data Preparation
- [ ] Gather real product data from suppliers/merchants
- [ ] Clean and standardize data formats
- [ ] Validate all required fields
- [ ] Prepare images for upload

### Task 4.2: Data Migration Script
- [ ] Create migration script in `buildstock-pro/backend/src/scripts/`
- [ ] Import `mock-products.json` → Supabase
- [ ] Import real product CSV/JSON files
- [ ] Upload product images to Supabase Storage
- [ ] Update image URLs in database
- [ ] Run data validation checks

### Task 4.3: Data Verification
- [ ] Verify all products imported correctly
- [ ] Check image URLs are valid
- [ ] Test search with real data
- [ ] Verify category filters work
- [ ] Check stock levels are accurate

---

## Phase 5: Cart & Checkout Integration (10 hours)

### Task 5.1: Persistent Cart Backend
- [ ] Create `carts` table in Supabase
- [ ] Create `cart_items` table
- [ ] Implement API endpoints:
  - [ ] `POST /api/cart` - Create cart
  - [ ] `GET /api/cart/:id` - Get cart contents
  - [ ] `POST /api/cart/:id/items` - Add item
  - [ ] `PUT /api/cart/:id/items/:item_id` - Update quantity
  - [ ] `DELETE /api/cart/:id/items/:item_id` - Remove item
- [ ] Add cart validation (stock checks, price updates)

### Task 5.2: User Sessions (Optional but Recommended)
- [ ] Implement session management with Supabase Auth
- [ ] Create user accounts
- [ ] Link carts to user accounts
- [ ] Save cart across devices
- [ ] Guest checkout option

### Task 5.3: Payment Integration
- [ ] Choose payment processor (Stripe recommended)
- [ ] Create Stripe account and get API keys
- [ ] Install Stripe SDK
- [ ] Create checkout page `/checkout`
- [ ] Implement payment flow:
  - [ ] Shipping address form
  - [ ] Billing information
  - [ ] Payment method (Stripe Elements)
  - [ ] Order review
  - [ ] Submit payment
- [ ] Add webhook for payment confirmation
- [ ] Create order confirmation page

### Task 5.4: Order Management
- [ ] Create `orders` table
- [ ] Create `order_items` table
- [ ] Create order confirmation emails
- [ ] Create `/admin/orders` page for managing orders
- [ ] Add order status workflow (pending, processing, shipped, delivered)
- [ ] Create order tracking system

---

## Phase 6: Merchant Integration (6 hours)

### Task 6.1: Merchant Portal
- [ ] Create merchant registration flow
- [ ] Create merchant profile pages
- [ ] Add product management per merchant
- [ ] Add inventory management per merchant
- [ ] Create order fulfillment workflow

### Task 6.2: Location-Based Features
- [ ] Integrate Google Maps API
- [ ] Add geolocation for user's location
- [ ] Calculate distance to merchants
- [ ] Show closest merchants first
- [ ] Add "pickup" vs "delivery" options

### Task 6.3: Merchant Inventory Sync
- [ ] Create inventory sync endpoints
- [ ] Implement webhook for merchant stock updates
- [ ] Add automatic stock level updates
- [ ] Create low stock notifications for merchants

---

## Phase 7: Testing & QA (4 hours)

### Task 7.1: Functional Testing
- [ ] Test all product CRUD operations
- [ ] Test search with real data
- [ ] Test category filters
- [ ] Test cart add/remove/update
- [ ] Test checkout flow completely
- [ ] Test payment with Stripe test cards
- [ ] Test order creation and management

### Task 7.2: Load Testing
- [ ] Test search performance with 1000+ products
- [ ] Test cart performance with 100+ items
- [ ] Test checkout concurrency
- [ ] Stress test database queries
- [ ] Optimize slow queries

### Task 7.3: Security Testing
- [ ] Test RLS policies on all tables
- [ ] Test SQL injection prevention
- [ ] Test XSS prevention
- [ ] Test CSRF protection
- [ ] Test payment security (PCI compliance)

---

## Phase 8: Deployment & Monitoring (2 hours)

### Task 8.1: Production Setup
- [ ] Update production environment variables
- [ ] Deploy backend to Railway
- [ ] Deploy frontend to Vercel
- [ ] Run database migrations on production
- [ ] Import real product data to production
- [ ] Verify all API endpoints work

### Task 8.2: Monitoring Setup
- [ ] Setup error tracking (Sentry)
- [ ] Setup analytics (Google Analytics or Plausible)
- [ ] Create health check endpoint
- [ ] Setup uptime monitoring
- [ ] Create alerting for errors and downtime

### Task 8.3: Documentation
- [ ] Document all API endpoints
- [ ] Create admin user guide
- [ ] Create merchant integration guide
- [ ] Update deployment documentation
- [ ] Create runbook for common issues

---

## Phase 9: Launch Preparation (2 hours)

### Task 9.1: Pre-Launch Checklist
- [ ] All tests passing
- [ ] No console errors
- [ ] All images loading
- [ ] Payment processing working
- [ ] Email notifications working
- [ ] SSL certificates valid
- [ ] DNS configured correctly
- [ ] Backup systems in place

### Task 9.2: Soft Launch
- [ ] Launch to small audience (friends/family)
- [ ] Monitor for bugs and issues
- [ ] Fix any critical issues
- [ ] Gather feedback

### Task 9.3: Full Launch
- [ ] Announce launch to mailing list
- [ ] Social media announcement
- [ ] Monitor traffic and sales
- [ ] Have customer support ready
- [ ] Celebrate! 🎉

---

## Summary

**Total Estimated Time:** 44-56 hours (6-7 full days)

**Key Dependencies:**
1. Supabase project setup
2. Stripe account for payments
3. Real product data from suppliers
4. Merchant onboarding

**Recommended Order:**
1. Complete Phase 1-2 (Database + Backend)
2. Complete Phase 4 (Import real data)
3. Complete Phase 5.1-5.2 (Cart backend)
4. Soft launch with basic functionality
5. Complete Phase 3 (Admin Panel)
6. Complete Phase 5.3-5.4 (Payments + Orders)
7. Complete Phase 6 (Merchant Integration)
8. Full launch

**Optional Features (Future Enhancement):**
- User accounts and profiles
- Order history and reordering
- Wishlist/favorites
- Product reviews and ratings
- Email marketing integration
- SMS notifications
- Loyalty program
- Discount/coupon codes
- Advanced analytics dashboard
- Mobile apps (iOS/Android)
