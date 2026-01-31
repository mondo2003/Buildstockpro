# Production Environment Variables Setup

**Created:** 2026-01-31
**Purpose:** Configure environment variables for Vercel (Frontend) and Railway (Backend)

---

## 📋 Overview

This guide lists all environment variables required for the production deployment of BuildStock Pro with live price scraping.

---

## 🔧 Frontend Environment Variables (Vercel)

### Required Variables

| Variable | Value | Description |
|----------|-------|-------------|
| `NEXT_PUBLIC_API_URL` | `https://buildstock-api.onrender.com` | Backend API URL |
| `NEXT_PUBLIC_SUPABASE_URL` | From Supabase dashboard | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | From Supabase dashboard | Supabase anonymous key |

### Optional Variables

| Variable | Value | Description |
|----------|-------|-------------|
| `NEXT_PUBLIC_GOOGLE_MAPS_KEY` | From Google Cloud | For maps integration |
| `NEXT_PUBLIC_GA_ID` | From Google Analytics | For analytics tracking |

---

## 🔧 Backend Environment Variables (Railway)

### Required Variables

| Variable | Value | Description |
|----------|-------|-------------|
| `DATABASE_URL` | From Supabase | PostgreSQL connection string |
| `SUPABASE_URL` | From Supabase dashboard | Supabase API URL |
| `SUPABASE_ANON_KEY` | From Supabase dashboard | Supabase anonymous key |
| `SUPABASE_SERVICE_ROLE_KEY` | From Supabase dashboard | Supabase service role key |
| `JWT_SECRET` | Generate secure secret | For API authentication |
| `PORT` | `10000` | Backend port |
| `NODE_ENV` | `production` | Environment |
| `CORS_ORIGIN` | `https://buildstock.pro` | Frontend URL |

### Scraper Configuration Variables

| Variable | Value | Description |
|----------|-------|-------------|
| `USE_MOCK_DATA` | `false` | Set to `false` in production for real scraping |
| `SCRAPER_RATE_LIMIT_MS` | `2000` | Milliseconds between requests (2 seconds) |
| `SCRAPER_MAX_CONCURRENT` | `3` | Maximum concurrent scraping requests |

### Optional Variables

| Variable | Value | Description |
|----------|-------|-------------|
| `SENTRY_DSN` | From Sentry dashboard | Error monitoring |
| `SENTRY_ENVIRONMENT` | `production` | Sentry environment name |
| `SYNC_API_KEY` | Generate secure key | For triggering merchant sync |

---

## 🚀 GitHub Actions Secrets

For the price sync workflow (`.github/workflows/price-sync.yml`), configure these secrets in GitHub:

| Secret Name | Value | Source |
|-------------|-------|--------|
| `DATABASE_URL` | Same as backend DATABASE_URL | Copy from Railway or Supabase |
| `SUPABASE_URL` | Same as backend SUPABASE_URL | Copy from backend |
| `SUPABASE_SERVICE_ROLE_KEY` | Same as backend SUPABASE_SERVICE_ROLE_KEY | Copy from backend |
| `SLACK_WEBHOOK_URL` | (Optional) From Slack app | For notifications |
| `NOTIFICATION_EMAIL` | (Optional) Your email | For failure alerts |
| `EMAIL_USERNAME` | (Optional) Gmail address | For sending email alerts |
| `EMAIL_PASSWORD` | (Optional) App password | For sending email alerts |

---

## 📝 Step-by-Step Setup

### Step 1: Get Supabase Credentials

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project: `xrhlumtimbmglzrfrnnk`
3. Go to **Settings → API**
4. Copy the following:
   - `Project URL` → `SUPABASE_URL`
   - `anon public` key → `SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY`
5. Go to **Settings → Database**
6. Copy the **Connection string** (URI format)
7. Replace `[YOUR-PASSWORD]` with your database password
8. This is your `DATABASE_URL`

### Step 2: Generate JWT Secret

```bash
# Generate a secure random string
openssl rand -base64 32
```

Use this as `JWT_SECRET`.

### Step 3: Configure Vercel (Frontend)

**Option A: Using Vercel CLI**
```bash
cd buildstock-pro/frontend

# Set environment variables
vercel env add NEXT_PUBLIC_API_URL production
# Value: https://buildstock-api.onrender.com

vercel env add NEXT_PUBLIC_SUPABASE_URL production
# Value: https://xrhlumtimbmglzrfrnnk.supabase.co

vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
# Value: (paste from Step 1)

vercel env add NEXT_PUBLIC_GA_ID production
# Value: (optional, your GA tracking ID)
```

**Option B: Using Vercel Dashboard**
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Go to **Settings → Environment Variables**
4. Add each variable with **Production** environment

### Step 4: Configure Railway (Backend)

**Option A: Using Railway CLI**
```bash
cd buildstock-pro/backend

# Link to Railway project
railway link

# Set environment variables
railway variables set DATABASE_URL="postgresql://..."
railway variables set SUPABASE_URL="https://..."
railway variables set SUPABASE_ANON_KEY="your-anon-key"
railway variables set SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
railway variables set JWT_SECRET="your-generated-secret"
railway variables set PORT=10000
railway variables set NODE_ENV=production
railway variables set CORS_ORIGIN="https://buildstock.pro"

# Scraper configuration
railway variables set USE_MOCK_DATA=false
railway variables set SCRAPER_RATE_LIMIT_MS=2000
railway variables set SCRAPER_MAX_CONCURRENT=3

# Optional: Error monitoring
railway variables set SENTRY_DSN="https://..."
railway variables set SENTRY_ENVIRONMENT=production
```

**Option B: Using Railway Dashboard**
1. Go to [Railway Dashboard](https://railway.app/dashboard)
2. Select your backend project
3. Go to **Variables** tab
4. Add each variable

### Step 5: Configure GitHub Secrets

1. Go to your GitHub repository
2. Go to **Settings → Secrets and variables → Actions**
3. Click **New repository secret**
4. Add each secret from the table above

**Required for Price Sync:**
- `DATABASE_URL`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

**Optional for Notifications:**
- `SLACK_WEBHOOK_URL`
- `NOTIFICATION_EMAIL`
- `EMAIL_USERNAME`
- `EMAIL_PASSWORD`

### Step 6: Verify Configuration

**Test Frontend:**
```bash
cd buildstock-pro/frontend
npm run build
```

**Test Backend:**
```bash
cd buildstock-pro/backend
bun run typecheck
```

**Test Price Sync Locally:**
```bash
cd buildstock-pro/backend
# Set environment variables
export DATABASE_URL="..."
export SUPABASE_URL="..."
export SUPABASE_SERVICE_ROLE_KEY="..."

# Run sync script
bun run sync-prices
```

---

## 🔍 Troubleshooting

### Issue: `DATABASE_URL` connection fails

**Solution:** Verify your password is URL-encoded
- `@` becomes `%40`
- `:` becomes `%3A`
- Spaces become `%20`

Example:
```
postgresql://postgres.xxxx:PASSWORD%40PASSWORD@aws-0-us-west-1.pooler.supabase.com:6543/postgres
```

### Issue: CORS errors in production

**Solution:** Ensure `CORS_ORIGIN` in backend matches your frontend URL exactly
```bash
# Correct
CORS_ORIGIN=https://buildstock.pro

# Incorrect
CORS_ORIGIN=https://buildstock.pro/
CORS_ORIGIN=https://www.buildstock.pro
```

### Issue: Scraper using mock data in production

**Solution:** Set `USE_MOCK_DATA=false` in Railway environment variables
```bash
railway variables set USE_MOCK_DATA=false
```

### Issue: Price sync workflow fails

**Solution:** Check that GitHub Secrets match Railway/Railway environment variables exactly
```bash
# In GitHub Actions, secrets must be set
DATABASE_URL: (same as Railway)
SUPABASE_URL: (same as Railway)
SUPABASE_SERVICE_ROLE_KEY: (same as Railway)
```

---

## 📊 Environment Variable Reference

### Development (.env.local)
```bash
# Frontend
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_SUPABASE_URL=https://xrhlumtimbmglzrfrnnk.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhb... (local dev key)

# Backend
DATABASE_URL=postgresql://... (local or dev database)
SUPABASE_URL=https://xrhlumtimbmglzrfrnnk.supabase.co
SUPABASE_ANON_KEY=eyJhb... (local dev key)
SUPABASE_SERVICE_ROLE_KEY=eyJhb... (local dev key)
JWT_SECRET=dev-secret-not-for-production
PORT=3001
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
USE_MOCK_DATA=true
```

### Production (Vercel + Railway)
```bash
# Frontend (Vercel)
NEXT_PUBLIC_API_URL=https://buildstock-api.onrender.com
NEXT_PUBLIC_SUPABASE_URL=https://xrhlumtimbmglzrfrnnk.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhb... (production anon key)

# Backend (Railway)
DATABASE_URL=postgresql://... (production database)
SUPABASE_URL=https://xrhlumtimbmglzrfrnnk.supabase.co
SUPABASE_ANON_KEY=eyJhb... (production anon key)
SUPABASE_SERVICE_ROLE_KEY=eyJhb... (production service role key)
JWT_SECRET=<generated-secure-secret>
PORT=10000
NODE_ENV=production
CORS_ORIGIN=https://buildstock.pro
USE_MOCK_DATA=false
SCRAPER_RATE_LIMIT_MS=2000
SCRAPER_MAX_CONCURRENT=3
SENTRY_DSN=https://... (optional)
SENTRY_ENVIRONMENT=production
```

---

## ✅ Pre-Deployment Checklist

- [ ] All Supabase credentials obtained
- [ ] JWT secret generated and saved
- [ ] Frontend environment variables set in Vercel
- [ ] Backend environment variables set in Railway
- [ ] GitHub Actions secrets configured
- [ ] `USE_MOCK_DATA=false` in Railway
- [ ] `CORS_ORIGIN` matches frontend URL
- [ ] `DATABASE_URL` is URL-encoded if needed
- [ ] Optional: Sentry DSN configured
- [ ] Optional: Slack webhook configured
- [ ] Tested locally with environment variables

---

## 📞 Getting Values

| Variable | How to Get |
|----------|------------|
| Supabase URL/Keys | Supabase Dashboard → Settings → API |
| Database URL | Supabase Dashboard → Settings → Database → Connection string |
| JWT Secret | Generate with `openssl rand -base64 32` |
| Sentry DSN | Sentry Dashboard → Settings → Client Keys (DSN) |
| Slack Webhook | Create Slack App → Enable Incoming Webhooks |
| Google Maps Key | Google Cloud Console → Maps JavaScript API |
| GA ID | Google Analytics → Admin → Property → Data Stream |

---

**Last Updated:** 2026-01-31
**Next Review:** After production deployment is complete
