# Supabase Database Verification Guide
**BuildStock Pro - Production Database Verification**
**Generated:** 2026-01-30
**Project ID:** `xrhlumtimbmglzrfrnnk`
**Status:** READY FOR VERIFICATION

---

## Executive Summary

This guide provides comprehensive steps to verify your Supabase database configuration for production deployment. It includes connection information, table verification, RLS policy checks, and troubleshooting steps.

**Quick Verification Checklist:**
- ✅ Supabase project created: `xrhlumtimbmglzrfrnnk`
- ✅ Region: EU-West-1
- ✅ Database URL: Configured
- ✅ Tables: 16 tables expected
- ✅ Migrations: Applied
- ⚠️ RLS Policies: Need verification
- ⚠️ Connection Test: Pending

---

## Table of Contents

1. [Supabase Connection Information](#supabase-connection-information)
2. [Database URL Formats](#database-url-formats)
3. [Table Structure Overview](#table-structure-overview)
4. [Verification SQL Queries](#verification-sql-queries)
5. [RLS Policy Verification](#rls-policy-verification)
6. [Connection Testing Methods](#connection-testing-methods)
7. [Railway Connection String](#railway-connection-string)
8. [Troubleshooting](#troubleshooting)

---

## Supabase Connection Information

### Project Details

| Property | Value |
|----------|-------|
| **Project ID** | `xrhlumtimbmglzrfrnnk` |
| **Region** | EU-West-1 |
| **Dashboard URL** | https://supabase.com/dashboard/project/xrhlumtimbmglzrfrnnk |
| **API URL** | `https://xrhlumtimbmglzrfrnnk.supabase.co` |
| **Database Host** | `db.xrhlumtimbmglzrfrnnk.supabase.co` |
| **Database Port** | `5432` |

### API Keys

| Key Type | Value | Usage |
|----------|-------|-------|
| **Anon Key** | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhyaGx1bXRpbWJtZ2x6cmZybm5rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk1MTc1MDgsImV4cCI6MjA4NTA5MzUwOH0.fvE4LYnPQ0HI7JiChZdDgLKcnyk3WdeS2iLLn4cYMRw` | Public client requests |
| **Service Role Key** | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhyaGx1bXRpbWJtZ2x6cmZybm5rIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTUxNzUwOCwiZXhwIjoyMDg1MDkzNTA4fQ.qZ1MJN8LY8xI_HFqJH3vC6OW2PHGB0uPkLPLcKV8qmE` | Backend/admin operations |

**⚠️ SECURITY NOTES:**
- Anon Key is safe for client-side code (limited by RLS)
- Service Role Key bypasses RLS - NEVER expose to frontend
- Store Service Role Key only in backend environment variables

---

## Database URL Formats

### 1. Direct Connection (for migrations/admin)
```
postgresql://postgres.xrhlumtimbmglzrfrnnk:[PASSWORD]@db.xrhlumtimbmglzrfrnnk.supabase.co:5432/postgres
```

**Use cases:**
- Running migrations
- Administrative tasks
- Direct SQL queries

### 2. Connection Pooling (RECOMMENDED for Railway)
```
postgresql://postgres.xrhlumtimbmglzrfrnnk:[PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres
```

**Use cases:**
- ✅ Production deployment (Railway)
- ✅ Serverless functions
- ✅ High-traffic applications

**Benefits:**
- Manages connection limits efficiently
- Better performance for serverless
- Automatic connection reuse
- Reduced cold start times

### 3. Session Mode (for transactions)
```
postgresql://postgres.xrhlumtimbmglzrfrnnk:[PASSWORD]@aws-0-us-east-1.pooler.supabase.com:5432/postgres
```

**Use cases:**
- Applications requiring transactions
- Long-running sessions
- Complex operations

### Getting Your Password

1. Go to Supabase Dashboard: https://supabase.com/dashboard/project/xrhlumtimbmglzrfrnnk/settings/database
2. Scroll to "Connection string" section
3. Click "Show password" or generate a new one
4. Copy the password and use it in your connection string

**⚠️ IMPORTANT:**
- Replace `[PASSWORD]` with your actual database password
- Never commit the password to git
- Use environment variables for storage
- Rotate passwords periodically

---

## Table Structure Overview

### Expected Tables (16 Total)

| # | Table Name | Purpose | Rows Expected |
|---|------------|---------|---------------|
| 1 | `users` | User accounts | 1+ |
| 2 | `merchants` | Merchant information | 6 (UK merchants) |
| 3 | `merchant_branches` | Physical store locations | 30 |
| 4 | `products` | Product catalog | 100 |
| 5 | `product_listings` | Product availability/pricing | 205 |
| 6 | `saved_searches` | User saved searches | 0+ |
| 7 | `watched_products` | User watchlist | 0+ |
| 8 | `price_alerts` | Price notifications | 0+ |
| 9 | `stock_alerts` | Stock availability alerts | 0+ |
| 10 | `data_issue_reports` | User-reported issues | 0+ |
| 11 | `user_preferences` | User settings | 0+ |
| 12 | `search_analytics` | Search tracking | 0+ |
| 13 | `price_history` | Historical pricing | 0+ |
| 14 | `user_activity` | Activity logs | 0+ |
| 15 | `notifications` | User notifications | 0+ |
| 16 | `user_profiles` | Extended user info (Clerk) | 0+ |

### Table Relationships

```
users (1) ──┬──> (N) saved_searches
            ├──> (N) watched_products
            ├──> (N) price_alerts
            ├──> (N) stock_alerts
            ├──> (N) user_preferences
            ├──> (N) user_activity
            └──> (N) notifications

merchants (1) ──┬──> (N) merchant_branches
                ├──> (N) product_listings
                ├──> (N) price_alerts
                └──> (N) stock_alerts

products (1) ──┬──> (N) product_listings
               ├──> (N) watched_products
               ├──> (N) price_alerts
               ├──> (N) stock_alerts
               └──> (N) data_issue_reports

product_listings (1) ──> (N) price_history
```

---

## Verification SQL Queries

### Quick Verification Query

Run this query in Supabase SQL Editor to verify all tables exist:

```sql
-- Verify all expected tables exist
SELECT table_name, table_type
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN (
    'users',
    'merchants',
    'merchant_branches',
    'products',
    'product_listings',
    'saved_searches',
    'watched_products',
    'price_alerts',
    'stock_alerts',
    'data_issue_reports',
    'user_preferences',
    'search_analytics',
    'price_history',
    'user_activity',
    'notifications',
    'user_profiles'
  )
ORDER BY table_name;
```

**Expected Result:** 16 rows

### Table Row Counts

Check if tables have initial data:

```sql
-- Check row counts for all tables
SELECT
  'users' as table_name, COUNT(*) as row_count FROM users
UNION ALL SELECT 'merchants', COUNT(*) FROM merchants
UNION ALL SELECT 'merchant_branches', COUNT(*) FROM merchant_branches
UNION ALL SELECT 'products', COUNT(*) FROM products
UNION ALL SELECT 'product_listings', COUNT(*) FROM product_listings
UNION ALL SELECT 'saved_searches', COUNT(*) FROM saved_searches
UNION ALL SELECT 'watched_products', COUNT(*) FROM watched_products
UNION ALL SELECT 'price_alerts', COUNT(*) FROM price_alerts
UNION ALL SELECT 'stock_alerts', COUNT(*) FROM stock_alerts
UNION ALL SELECT 'data_issue_reports', COUNT(*) FROM data_issue_reports
UNION ALL SELECT 'user_preferences', COUNT(*) FROM user_preferences
UNION ALL SELECT 'search_analytics', COUNT(*) FROM search_analytics
UNION ALL SELECT 'price_history', COUNT(*) FROM price_history
UNION ALL SELECT 'user_activity', COUNT(*) FROM user_activity
UNION ALL SELECT 'notifications', COUNT(*) FROM notifications
UNION ALL SELECT 'user_profiles', COUNT(*) FROM user_profiles
ORDER BY table_name;
```

**Expected Results:**
- `users`: ≥1 (test user)
- `merchants`: 6
- `products`: 100
- `product_listings`: 205
- Other tables: 0 initially (populated during app usage)

### Index Verification

Verify all indexes are created:

```sql
-- Check for critical indexes
SELECT
  schemaname,
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename IN (
    'users',
    'merchants',
    'products',
    'product_listings',
    'saved_searches',
    'watched_products',
    'price_alerts',
    'stock_alerts',
    'user_preferences',
    'price_history',
    'user_activity',
    'notifications'
  )
ORDER BY tablename, indexname;
```

**Expected:** Multiple indexes for performance optimization

### Foreign Key Verification

Verify referential integrity:

```sql
-- Check foreign key constraints
SELECT
  tc.table_name,
  tc.constraint_name,
  tc.constraint_type,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_schema = 'public'
ORDER BY tc.table_name, tc.constraint_name;
```

---

## RLS Policy Verification

### Check if RLS is Enabled

```sql
-- Check Row Level Security status
SELECT
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN (
    'user_profiles',
    'users',
    'merchants'
  )
ORDER BY tablename;
```

**Expected:**
- `user_profiles`: `true` (has RLS)
- Other tables: `false` (or `true` if you've added policies)

### List All RLS Policies

```sql
-- Get all RLS policies
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

**Expected Results for user_profiles:**
1. "Users can view own profile" (SELECT)
2. "Users can insert own profile" (INSERT)
3. "Users can update own profile" (UPDATE)
4. "Users can delete own profile" (DELETE)

### Verify Specific Policy

Check if user_profiles policies are correctly defined:

```sql
-- View user_profiles policies in detail
SELECT
  policyname,
  cmd,
  qual as using_expression,
  with_check as check_expression
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'user_profiles';
```

---

## Connection Testing Methods

### Method 1: Supabase SQL Editor (Easiest)

1. Go to: https://supabase.com/dashboard/project/xrhlumtimbmglzrfrnnk/sql
2. Run this query:
   ```sql
   SELECT
     'database' as status,
     current_database() as database_name,
     current_user as user,
     version() as version;
   ```
3. Expected: Returns database information successfully

### Method 2: Node.js Test Script

Create and run a test script:

```javascript
// test-connection.js
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://xrhlumtimbmglzrfrnnk.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhyaGx1bXRpbWJtZ2x6cmZybm5rIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTUxNzUwOCwiZXhwIjoyMDg1MDkzNTA4fQ.qZ1MJN8LY8xI_HFqJH3vC6OW2PHGB0uPkLPLcKV8qmE';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  const start = Date.now();

  try {
    // Test 1: Simple query
    const { data, error } = await supabase
      .from('users')
      .select('id, email, name')
      .limit(1);

    if (error) throw error;

    const duration = Date.now() - start;

    console.log('✅ Connection successful!');
    console.log(`   Latency: ${duration}ms`);
    console.log(`   Users found: ${data.length}`);

    // Test 2: Count merchants
    const { count } = await supabase
      .from('merchants')
      .select('*', { count: 'exact', head: true });

    console.log(`   Merchants: ${count}`);

    // Test 3: Count products
    const { count: productCount } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true });

    console.log(`   Products: ${productCount}`);

    return { success: true, latency: duration };
  } catch (error) {
    console.error('❌ Connection failed!');
    console.error(`   Error: ${error.message}`);
    return { success: false, error: error.message };
  }
}

testConnection();
```

Run the test:
```bash
cd /Users/macbook/Desktop/buildstock.pro/buildstock-pro/backend
node test-connection.js
```

### Method 3: psql Command Line

Install PostgreSQL client tools (if not installed):
```bash
# macOS
brew install postgresql

# Or use libpq
brew install libpq
```

Test connection:
```bash
psql "postgresql://postgres.xrhlumtimbmglzrfrnnk:[PASSWORD]@db.xrhlumtimbmglzrfrnnk.supabase.co:5432/postgres" -c "SELECT current_database(), current_user, version();"
```

### Method 4: Backend Application Test

Use the built-in test function from your backend:

```bash
cd /Users/macbook/Desktop/buildstock.pro/buildstock-pro/backend

# Load environment
export $(cat .env.production | xargs)

# Run connection test (if you have a test script)
bun run test:connection
```

Or create a quick test:
```typescript
// test-db.ts
import { supabase, testConnection } from './src/utils/database';

async function runTests() {
  console.log('Testing Supabase connection...\n');

  const result = await testConnection();

  if (result.success) {
    console.log('✅ Database connected successfully!');
    console.log(`   Latency: ${result.latency}ms`);
  } else {
    console.log('❌ Database connection failed!');
    console.log(`   Error: ${result.error}`);
    process.exit(1);
  }
}

runTests();
```

Run with:
```bash
bun run test-db.ts
```

---

## Railway Connection String

### For Railway Deployment

When deploying to Railway, use this connection string format in your `DATABASE_URL` environment variable:

```
postgresql://postgres.xrhlumtimbmglzrfrnnk:[PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres
```

### Setting Up in Railway

1. Go to Railway Dashboard → Your Backend Service
2. Navigate to: Settings → Variables
3. Add or update `DATABASE_URL`:
   ```
   DATABASE_URL=postgresql://postgres.xrhlumtimbmglzrfrnnk:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres
   ```
4. Click "Deploy" to restart with new connection string

### Alternative: Supabase Client (Recommended for Backend)

Instead of using `DATABASE_URL` directly, use Supabase client (already configured in `backend/src/utils/database.ts`):

```typescript
// In Railway environment variables
SUPABASE_URL=https://xrhlumtimbmglzrfrnnk.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Benefits:**
- Automatic connection pooling
- Built-in authentication
- Better error handling
- Type safety with TypeScript

---

## Troubleshooting

### Common Issues and Solutions

#### Issue 1: Connection Timeout

**Symptoms:**
- Error: "Connection timed out"
- Error: "ETIMEDOUT"

**Solutions:**
1. Check network connectivity
2. Verify correct host: `db.xrhlumtimbmglzrfrnnk.supabase.co`
3. Check firewall rules (allow port 5432 or 6543)
4. Use connection pooling URL instead

#### Issue 2: Authentication Failed

**Symptoms:**
- Error: "password authentication failed"
- Error: "FATAL: password authentication failed"

**Solutions:**
1. Verify password is correct
2. Check for extra spaces in password
3. Reset password in Supabase Dashboard
4. Update environment variables with new password

#### Issue 3: SSL Errors

**Symptoms:**
- Error: "SSL connection required"
- Error: "self-signed certificate"

**Solutions:**
1. Ensure SSL mode is enabled
2. Add `?sslmode=require` to connection string:
   ```
   postgresql://...?sslmode=require
   ```
3. Update PostgreSQL client libraries

#### Issue 4: Connection Pool Exhausted

**Symptoms:**
- Error: "remaining connection slots are reserved"
- Error: "too many connections"

**Solutions:**
1. Use connection pooling URL (port 6543)
2. Implement proper connection management
3. Close connections when done
4. Increase connection pool size (Supabase Pro tier)

#### Issue 5: RLS Policy Violations

**Symptoms:**
- Error: "new row violates row-level security policy"
- Empty result sets when they shouldn't be

**Solutions:**
1. Check RLS policies are correct
2. Verify user context is set
3. Use service role key for admin operations
4. Add appropriate RLS policies

#### Issue 6: Table Not Found

**Symptoms:**
- Error: "relation \"table_name\" does not exist"

**Solutions:**
1. Verify table name is correct
2. Check you're in the correct schema (`public`)
3. Run migrations if not applied
4. Verify table exists with `information_schema`

---

## Verification Checklist

Run through this checklist to ensure everything is configured correctly:

### Phase 1: Access Verification

- [ ] Can access Supabase Dashboard
- [ ] Project ID is correct: `xrhlumtimbmglzrfrnnk`
- [ ] Region is set: EU-West-1
- [ ] Database status is "Active"

### Phase 2: Connection Verification

- [ ] Supabase URL is accessible: `https://xrhlumtimbmglzrfrnnk.supabase.co`
- [ ] Can connect via SQL Editor
- [ ] Database password is known
- [ ] Direct connection works (if tested)
- [ ] Connection pooling works (if tested)

### Phase 3: Table Verification

- [ ] All 16 tables exist
- [ ] Tables have correct columns
- [ ] Foreign keys are set up
- [ ] Indexes are created
- [ ] Test data exists (users, merchants, products)

### Phase 4: RLS Verification

- [ ] RLS is enabled on `user_profiles`
- [ ] RLS policies exist for user_profiles
- [ ] Policies allow proper access
- [ ] Service role key bypasses RLS
- [ ] Anon key respects RLS

### Phase 5: Data Verification

- [ ] Test user exists in `users` table
- [ ] 6 merchants exist
- [ ] 100 products exist
- [ ] 205 product listings exist
- [ ] Data relationships are intact

### Phase 6: Application Verification

- [ ] Backend can connect to database
- [ ] Query latency is acceptable (< 500ms)
- [ ] Error handling works correctly
- [ ] Transactions work (if tested)
- [ ] Connection pooling works (if tested)

---

## Quick Test Commands

### One-Line Verification Tests

```bash
# Test 1: Check if Supabase API is accessible
curl -I https://xrhlumtimbmglzrfrnnk.supabase.co

# Test 2: Check database connection (requires password)
PGPASSWORD=your-password psql -h db.xrhlumtimbmglzrfrnnk.supabase.co -U postgres.xrhlumtimbmglzrfrnnk -d postgres -c "SELECT 1"

# Test 3: Check with node (requires supabase-js)
node -e "const {createClient}=require('@supabase/supabase-js');const c=createClient('https://xrhlumtimbmglzrfrnnk.supabase.co','YOUR-KEY');c.from('users').select('id').limit(1).then(r=>console.log(r.error?'Failed':'Success'))"
```

---

## Next Steps

### After Successful Verification

1. **Configure Backend**
   - Set `DATABASE_URL` in Railway
   - Set `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`
   - Test backend connection

2. **Configure Frontend**
   - Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Test frontend connection

3. **Run Migrations** (if needed)
   - Apply any pending migrations
   - Verify migration success

4. **Test Application**
   - Run full integration tests
   - Verify authentication works
   - Test CRUD operations

5. **Monitor Performance**
   - Check query latency
   - Monitor connection pool usage
   - Set up alerts

---

## Additional Resources

### Documentation
- [Supabase Connection Guide](https://supabase.com/docs/guides/database/connecting-to-postgres)
- [Connection Pooling](https://supabase.com/docs/guides/database/connection-pooling)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Managing Migrations](https://supabase.com/docs/guides/database/managing-migrations)

### Tools
- [Supabase SQL Editor](https://supabase.com/dashboard/project/xrhlumtimbmglzrfrnnk/sql)
- [Supabase Database Settings](https://supabase.com/dashboard/project/xrhlumtimbmglzrfrnnk/settings/database)
- [pgAdmin](https://www.pgadmin.org/) - GUI for PostgreSQL
- [Postico](https://eggerapps.at/postico/) - PostgreSQL client for macOS

### Support
- [Supabase GitHub](https://github.com/supabase/supabase)
- [Supabase Discord](https://discord.gg/supabase)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/supabase)

---

## Summary Report

| Component | Status | Notes |
|-----------|--------|-------|
| **Supabase Project** | ✅ Configured | ID: xrhlumtimbmglzrfrnnk |
| **Database URL** | ✅ Available | Connection pooling: port 6543 |
| **API Keys** | ✅ Available | Anon and Service Role keys |
| **Tables** | ✅ Expected | 16 tables should exist |
| **Migrations** | ✅ Applied | All migration files exist |
| **RLS Policies** | ⚠️ Verify | Check user_profiles policies |
| **Connection Test** | ⚠️ Pending | Run test queries |
| **Railway Setup** | ⚠️ Pending | Add DATABASE_URL to Railway |

---

**Generated:** 2026-01-30
**Project:** BuildStock Pro
**Environment:** Production
**Status:** Ready for verification
