# Production PostgreSQL Database Setup - BuildStock Pro

**Setup Date:** 2026-01-29
**Database Provider:** Supabase (Production)
**Status:** ✅ Active and Healthy

---

## Database Connection Information

### Connection Details

- **Project ID:** `xrhlumtimbmglzrfrnnk`
- **Project Name:** mondo2003's Project
- **Region:** EU-West-1
- **Database Host:** `db.xrhlumtimbmglzrfrnnk.supabase.co`
- **Database Version:** PostgreSQL 17.6.1.063
- **Status:** ACTIVE_HEALTHY

### Connection Strings

#### 1. Direct Connection (IPv6 required)
```
postgresql://postgres.xrhlumtimbmglzrfrnnk:[YOUR-PASSWORD]@db.xrhlumtimbmglzrfrnnk.supabase.co:5432/postgres
```

#### 2. Session Pooler (Recommended for persistent backends)
```
postgresql://postgres.xrhlumtimbmglzrfrnnk:[YOUR-PASSWORD]@aws-0-eu-west-1.pooler.supabase.com:5432/postgres
```

#### 3. Transaction Pooler (Recommended for serverless/functions)
```
postgresql://postgres.xrhlumtimbmglzrfrnnk:[YOUR-PASSWORD]@aws-0-eu-west-1.pooler.supabase.com:6543/postgres
```

**Note:** Replace `[YOUR-PASSWORD]` with your actual database password from the Supabase Dashboard.

### Supabase API URLs

- **API URL:** `https://xrhlumtimbmglzrfrnnk.supabase.co`
- **Anon Key:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhyaGx1bXRpbWJtZ2x6cmZybm5rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk1MTc1MDgsImV4cCI6MjA4NTA5MzUwOH0.fvE4LYnPQ0HI7JiChZdDgLKcnyk3WdeS2iLLn4cYMRw`
- **Service Role Key:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhyaGx1bXRpbWJtZ2x6cmZybm5rIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTUxNzUwOCwiZXhwIjoyMDg1MDkzNTA4fQ.qZ1MJN8LY8xI_HFqJH3vC6OW2PHGB0uPkLPLcKV8qmE`

---

## Database Schema

### Tables Created (16 total)

| Table Name | Columns | Purpose |
|------------|---------|---------|
| `users` | 12 | User accounts and authentication |
| `merchants` | 16 | Merchant/supplier information |
| `merchant_branches` | 9 | Physical store locations |
| `products` | 22 | Product catalog |
| `product_listings` | 22 | Product availability by merchant |
| `price_history` | 6 | Historical price tracking |
| `price_alerts` | 10 | User price drop alerts |
| `stock_alerts` | 12 | User stock availability alerts |
| `notifications` | 10 | User notifications |
| `saved_searches` | 7 | User-saved search queries |
| `watched_products` | 6 | Product watchlist |
| `data_issue_reports` | 9 | Data quality reports |
| `search_analytics` | 8 | Search query analytics |
| `user_activity` | 9 | User activity logging |
| `user_preferences` | 7 | User settings and preferences |
| `sync_jobs` | 16 | Merchant sync job tracking |
| `system_logs` | 9 | Application system logs |

### Indexes

All critical tables have proper indexes for:
- Foreign key lookups
- Timestamp-based queries (DESC)
- User-based queries
- Status-based filters
- Full-text search capabilities

---

## Migration Status

### Applied Migrations

1. ✅ `init_schema` (20260128094933) - Initial schema creation
2. ✅ `add_alert_tables` (20260129140733) - Price and stock alerts
3. ✅ `add_user_preferences` (20260129140737) - User preferences

### Manually Created Tables

The following tables were manually created to complete the schema:
- `price_history`
- `notifications`
- `saved_searches`
- `watched_products`
- `data_issue_reports`
- `search_analytics`

---

## Current Data Status

| Table | Row Count | Status |
|-------|-----------|--------|
| users | 1 | ✅ Test user present |
| merchants | 4 | ✅ Sample merchants (Home Depot, Lowe's, Ace Hardware, True Value) |
| merchant_branches | 12 | ✅ Multiple locations per merchant |
| products | 0 | ⚠️ Pending data migration |
| product_listings | 0 | ⚠️ Pending data migration |
| All other tables | 0 | ✅ Ready for data |

---

## Security Notes

### Current Security Advisors (Warnings)

The Supabase security advisor has identified the following items:

1. **Row Level Security (RLS) Disabled** - All tables
   - **Level:** ERROR
   - **Recommendation:** Enable RLS on all public tables for production use
   - **Impact:** Without RLS, authenticated users could potentially access all data
   - **Action Required:** Enable RLS and create policies before public launch

2. **Function Search Path Mutable**
   - **Level:** WARN
   - **Affected Functions:**
     - `update_price_alerts_updated_at()`
     - `update_stock_alerts_updated_at()`
   - **Recommendation:** Set `search_path` in function definitions

### Recommended Security Actions

1. Enable Row Level Security (RLS) on all tables
2. Create RLS policies for user-specific data access
3. Set function search paths to `public`
4. Review and test all security policies before production launch

---

## Environment Configuration

### Backend `.env` File

Located at: `/Users/macbook/Desktop/buildstock.pro/buildstock-pro/backend/src/.env`

```bash
# Supabase Configuration
SUPABASE_URL=https://xrhlumtimbmglzrfrnnk.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Database
DATABASE_URL=postgresql://postgres.xrhlumtimbmglzrfrnnk:[PASSWORD]@aws-0-eu-west-1.pooler.supabase.com:6543/postgres
```

### Project Root `.env.supabase` File

Located at: `/Users/macbook/Desktop/buildstock.pro/.env.supabase`

```bash
SUPABASE_PROJECT_REF=xrhlumtimbmglzrfrnnk
SUPABASE_URL=https://xrhlumtimbmglzrfrnnk.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_ACCESS_TOKEN=sbp_c5655a4b865cb74936186039ba60eb75e0cacc43
```

---

## Connection Recommendations

### For Backend API (Railway)

Use the **Transaction Pooler** (port 6543) for optimal performance:

```
DATABASE_URL=postgresql://postgres.xrhlumtimbmglzrfrnnk:[PASSWORD]@aws-0-eu-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true
```

Add `?pgbouncer=true` to disable prepared statements (required for transaction mode).

### For Migrations

Use **Session Pooler** (port 5432):

```
DIRECT_URL=postgresql://postgres.xrhlumtimbmglzrfrnnk:[PASSWORD]@aws-0-eu-west-1.pooler.supabase.com:5432/postgres
```

---

## Next Steps

1. **Retrieve Database Password:**
   - Go to [Supabase Dashboard](https://supabase.com/dashboard/project/xrhlumtimbmglzrfrnnk/settings/database)
   - Scroll to "Database Password" section
   - Copy the password and update `.env` files

2. **Test Connection:**
   ```bash
   psql "postgresql://postgres.xrhlumtimbmglzrfrnnk:[PASSWORD]@aws-0-eu-west-1.pooler.supabase.com:5432/postgres"
   ```

3. **Enable RLS (Critical for Production):**
   ```sql
   ALTER TABLE users ENABLE ROW LEVEL SECURITY;
   ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
   -- Repeat for all tables
   ```

4. **Migrate Product Data:**
   - Export from local Docker database
   - Import to Supabase production database

5. **Update Application Configuration:**
   - Update Railway backend environment variables
   - Update Vercel frontend environment variables

---

## Database Management

### Supabase Dashboard

- **Project URL:** https://supabase.com/dashboard/project/xrhlumtimbmglzrfrnnk
- **Table Editor:** https://supabase.com/dashboard/project/xrhlumtimbmglzrfrnnk/editor
- **SQL Editor:** https://supabase.com/dashboard/project/xrhlumtimbmglzrfrnnk/sql/new

### Monitoring

- **Database Logs:** Available in Supabase Dashboard
- **Observability:** https://supabase.com/dashboard/project/xrhlumtimbmglzrfrnnk/observability/database
- **Connection Usage:** Monitor active connections and pooler stats

---

## Support & Documentation

- [Supabase Database Connection Guide](https://supabase.com/docs/guides/database/connecting-to-postgres)
- [Supabase Connection Pooling](https://supabase.com/docs/guides/database/connecting-to-postgres#connection-pooler)
- [PostgreSQL 17 Documentation](https://www.postgresql.org/docs/17/)

---

**Summary:**
- ✅ Production database: Supabase PostgreSQL 17.6.1
- ✅ All tables and indexes created
- ✅ Sample data loaded (4 merchants, 12 branches, 1 test user)
- ⚠️ Password retrieval required
- ⚠️ RLS policies need to be enabled before production launch
- ⏳ Product data migration pending
