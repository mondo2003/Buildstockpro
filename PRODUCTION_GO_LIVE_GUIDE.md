# BuildStock Pro - Production Go-Live Guide

**Version:** 1.0
**Last Updated:** 2026-01-30
**Status:** Ready for Production Deployment
**Estimated Time to Go Live:** 30-45 minutes

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Prerequisites Checklist](#prerequisites-checklist)
3. [Production Credentials](#production-credentials)
4. [Deployment Instructions](#deployment-instructions)
5. [Connection Verification](#connection-verification)
6. [Beta Testing Kick-off](#beta-testing-kick-off)
7. [Troubleshooting Guide](#troubleshooting-guide)
8. [Rollback Procedures](#rollback-procedures)
9. [Post-Deployment Tasks](#post-deployment-tasks)
10. [Support & Contact Information](#support--contact-information)

---

## Executive Summary

BuildStock Pro is a UK construction materials aggregator that compares prices across 6 major merchants (Travis Perkins, Screwfix, Jewson, Wickes, Huws Gray, B&Q). The application consists of:

- **Frontend:** Next.js application (deploy to Vercel)
- **Backend:** Bun + Elysia API (deploy to Railway)
- **Database:** PostgreSQL on Supabase (already configured)
- **Cron Jobs:** GitHub Actions for merchant sync

### Current Status
- ✅ Development: 100% Complete
- ✅ Database: Configured and ready (Supabase Project ID: xrhlumtimbmglzrfrnnk)
- ✅ Migrations: All applied
- ✅ Deployment Configs: Created
- ⏳ Deployment: Ready to execute

### Deployment Architecture
```
Users → Vercel (Frontend) → Railway (Backend API) → Supabase (Database)
                                    ↓
                            GitHub Actions (Cron Jobs)
```

---

## Prerequisites Checklist

### Accounts Required

Before starting deployment, ensure you have accounts for:

- [ ] **GitHub** - Repository and GitHub Actions
  - Link: https://github.com
  - Cost: Free
  - Purpose: Code hosting, CI/CD, cron jobs

- [ ] **Vercel** - Frontend hosting
  - Link: https://vercel.com
  - Cost: Free tier available
  - Purpose: Frontend deployment
  - **Required for:** Frontend deployment

- [ ] **Railway** - Backend hosting
  - Link: https://railway.app
  - Cost: Free tier available ($5 credit/month)
  - Purpose: Backend deployment
  - **Required for:** Backend deployment

- [ ] **Supabase** - Database hosting
  - Link: https://supabase.com
  - Cost: Free tier available
  - Project ID: `xrhlumtimbmglzrfrnnk`
  - Status: ✅ Already configured
  - Region: EU-West-1

- [ ] **Clerk** - Authentication
  - Link: https://clerk.com
  - Cost: Free tier available
  - Purpose: User authentication
  - **Required:** Production API keys

- [ ] **Sentry** (Optional) - Error tracking
  - Link: https://sentry.io
  - Cost: Free tier available
  - Purpose: Error monitoring and tracking

### Tools Required

- [ ] **Git** - Version control
  - Install: https://git-scm.com/downloads
  - Verify: `git --version`

- [ ] **Node.js** (v18+) - Frontend runtime
  - Install: https://nodejs.org
  - Verify: `node --version`

- [ ] **Bun** - Backend runtime
  - Install: `curl -fsSL https://bun.sh/install | bash`
  - Verify: `bun --version`

- [ ] **OpenSSL** - Secret generation
  - Built-in on macOS/Linux
  - Windows: Install Git Bash

### Information Gathered

Before deployment, have ready:

- [ ] Domain name (optional, for custom domain)
- [ ] Clerk Publishable Key (`pk_test_...` or `pk_live_...`)
- [ ] Clerk Secret Key (`sk_test_...` or `sk_live_...`)
- [ ] Sentry DSN (if using Sentry)
- [ ] Contact email for support

---

## Production Credentials

### Database (Supabase)

**Project Details:**
- **Project ID:** `xrhlumtimbmglzrfrnnk`
- **Project URL:** https://supabase.com/dashboard/project/xrhlumtimbmglzrfrnnk
- **Region:** EU-West-1
- **Database Version:** PostgreSQL 17.6.1.063
- **Status:** Active and Healthy

**Connection Strings:**
```bash
# Transaction Pooler (Recommended for Backend)
postgresql://postgres.xrhlumtimbmglzrfrnnk:[PASSWORD]@aws-0-eu-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true

# Session Pooler (For Migrations)
postgresql://postgres.xrhlumtimbmglzrfrnnk:[PASSWORD]@aws-0-eu-west-1.pooler.supabase.com:5432/postgres

# API URL
https://xrhlumtimbmglzrfrnnk.supabase.co
```

**API Keys:**
```bash
# Anon Key (Public - safe to expose)
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhyaGx1bXRpbWJtZ2x6cmZybm5rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk1MTc1MDgsImV4cCI6MjA4NTA5MzUwOH0.fvE4LYnPQ0HI7JiChZdDgLKcnyk3WdeS2iLLn4cYMRw

# Service Role Key (Secret - backend only)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhyaGx1bXRpbWJtZ2x6cmZybm5rIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTUxNzUwOCwiZXhwIjoyMDg1MDkzNTA4fQ.qZ1MJN8LY8xI_HFqJH3vC6OW2PHGB0uPkLPLcKV8qmE
```

**Getting Your Database Password:**
1. Visit: https://supabase.com/dashboard/project/xrhlumtimbmglzrfrnnk/settings/database
2. Scroll to "Database Password" section
3. Click "Show" to reveal password
4. Copy and store securely (password manager)

### Application Secrets

**Generated Secrets (already created):**
```bash
# JWT Secret (for authentication)
JWT_SECRET=lUhYmXXdt8U8JqgDjyeXrkt9IiRJu7gJQR6NRHoN/oU=

# Sync API Key (for cron job security)
SYNC_API_KEY=30kH8aXQECPjGZsBSqROode5oOS4CG7BEv/lLdaiiXQ=
```

**Where to Use These Secrets:**
- `JWT_SECRET`: Railway backend environment variable
- `SYNC_API_KEY`:
  - Railway backend environment variable
  - GitHub Actions secret

### Clerk Authentication Keys

**To Get Production Keys:**
1. Log in to https://dashboard.clerk.com
2. Select your application
3. Navigate to **API Keys** (left sidebar)
4. Copy the following keys:

```bash
# Frontend Environment Variable
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_[your-key-here]

# Backend Environment Variable
CLERK_SECRET_KEY=sk_test_[your-secret-here]
```

**Note:** For production, use keys that start with `pk_live_` and `sk_live_`

### Sentry (Optional)

**To Get Sentry DSN:**
1. Log in to https://sentry.io
2. Create a new project (platform: Next.js)
3. Go to **Project Settings → Client Keys (DSN)**
4. Copy the DSN URL

```bash
# Frontend & Backend Environment Variable
SENTRY_DSN=https://[your-dsn]@sentry.io/[project-id]
NEXT_PUBLIC_SENTRY_ENVIRONMENT=production
```

---

## Deployment Instructions

### Overview

Deploy components in this order:
1. ✅ Database (Supabase) - Already done
2. ⏳ Backend (Railway) - Deploy first
3. ⏳ Frontend (Vercel) - Deploy after backend
4. ⏳ Cron Jobs (GitHub Actions) - Configure with backend
5. ⏳ Custom Domain (Optional) - Configure last

---

## Step 1: Backend Deployment (Railway)

**Time Required:** 10-15 minutes

### Option A: Automated Deployment (Recommended)

```bash
# Navigate to backend directory
cd /Users/macbook/Desktop/buildstock.pro/Construction-RC/src/backend

# Run deployment script
chmod +x deploy-railway.sh
./deploy-railway.sh
```

**What the script does:**
1. Installs Railway CLI
2. Authenticates you (opens browser)
3. Creates or links Railway project
4. Adds PostgreSQL plugin
5. Adds Redis plugin (optional)
6. Sets environment variables
7. Deploys backend
8. Displays your backend URL

### Option B: Manual Deployment

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login (opens browser)
railway login

# Navigate to backend
cd /Users/macbook/Desktop/buildstock.pro/Construction-RC/src/backend

# Initialize project
railway init

# Add PostgreSQL (if not using Supabase)
railway add postgresql

# Add Redis (optional)
railway add redis

# Set environment variables
railway variables set DATABASE_URL="postgresql://postgres.xrhlumtimbmglzrfrnnk:[PASSWORD]@aws-0-eu-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
railway variables set JWT_SECRET="lUhYmXXdt8U8JqgDjyeXrkt9IiRJu7gJQR6NRHoN/oU="
railway variables set SYNC_API_KEY="30kH8aXQECPjGZsBSqROode5oOS4CG7BEv/lLdaiiXQ="
railway variables set SUPABASE_URL="https://xrhlumtimbmglzrfrnnk.supabase.co"
railway variables set SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhyaGx1bXRpbWJtZ2x6cmZybm5rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk1MTc1MDgsImV4cCI6MjA4NTA5MzUwOH0.fvE4LYnPQ0HI7JiChZdDgLKcnyk3WdeS2iLLn4cYMRw"
railway variables set SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhyaGx1bXRpbWJtZ2x6cmZybm5rIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTUxNzUwOCwiZXhwIjoyMDg1MDkzNTA4fQ.qZ1MJN8LY8xI_HFqJH3vC6OW2PHGB0uPkLPLcKV8qmE"
railway variables set CLERK_SECRET_KEY="sk_test_[your-clerk-secret]"
railway variables set PORT="3001"

# Deploy
railway up
```

### Backend Environment Variables

**Required Variables:**

| Variable | Value | Description |
|----------|-------|-------------|
| `DATABASE_URL` | Supabase connection string | PostgreSQL connection |
| `JWT_SECRET` | `lUhYmXXdt8U8JqgDjyeXrkt9IiRJu7gJQR6NRHoN/oU=` | JWT signing secret |
| `SYNC_API_KEY` | `30kH8aXQECPjGZsBSqROode5oOS4CG7BEv/lLdaiiXQ=` | Sync endpoint security |
| `SUPABASE_URL` | `https://xrhlumtimbmglzrfrnnk.supabase.co` | Supabase API URL |
| `SUPABASE_ANON_KEY` | `eyJhbG...` (see above) | Supabase public key |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJhbG...` (see above) | Supabase admin key |
| `CLERK_SECRET_KEY` | From Clerk dashboard | Clerk authentication |
| `CORS_ORIGIN` | Frontend URL (set after frontend deployed) | CORS whitelist |
| `PORT` | `3001` | Server port |
| `NODE_ENV` | `production` | Environment |

**Optional Variables:**
- `SENTRY_DSN` - Sentry error tracking
- `REDIS_URL` - Redis cache (auto-set by Railway if Redis added)
- `LOG_LEVEL` - Logging verbosity (default: `info`)

### Post-Deployment Steps

1. **Get your backend URL:**
   ```bash
   railway domain
   ```
   Example output: `https://buildstock-api.up.railway.app`

2. **Test health endpoint:**
   ```bash
   curl https://your-backend.up.railway.app/health
   ```
   Expected response: `{"status":"ok","timestamp":"..."}`

3. **Check Railway logs:**
   ```bash
   railway logs
   ```
   Look for any errors or warnings

4. **Save backend URL** - You'll need this for frontend deployment

---

## Step 2: Frontend Deployment (Vercel)

**Time Required:** 10-15 minutes

### Option A: Automated Deployment (Recommended)

```bash
# Navigate to frontend directory
cd /Users/macbook/Desktop/buildstock.pro/Construction-RC/src/frontend

# Run deployment script
chmod +x deploy-vercel.sh
./deploy-vercel.sh
```

### Option B: Manual Deployment via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login (opens browser)
vercel login

# Navigate to frontend
cd /Users/macbook/Desktop/buildstock.pro/Construction-RC/src/frontend

# Deploy to production
vercel --prod
```

### Option C: Manual Deployment via Vercel Dashboard

1. **Import GitHub Repository:**
   - Go to https://vercel.com/dashboard
   - Click "Add New Project"
   - Import your GitHub repository
   - Set root directory to: `Construction-RC/src/frontend`

2. **Configure Project:**
   - Framework Preset: Next.js
   - Build Command: `npm run build`
   - Output Directory: `.next`
   - Install Command: `npm install`

3. **Add Environment Variables** (in Settings → Environment Variables):

| Variable | Value | Environments |
|----------|-------|--------------|
| `NEXT_PUBLIC_API_URL` | Your Railway backend URL | Production, Preview, Development |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://xrhlumtimbmglzrfrnnk.supabase.co` | All |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbG...` (see above) | All |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | From Clerk dashboard | All |
| `NEXT_PUBLIC_SENTRY_DSN` | From Sentry dashboard | All |
| `NEXT_PUBLIC_SENTRY_ENVIRONMENT` | `production` | Production |

4. **Deploy:**
   - Click "Deploy"
   - Wait for build to complete (~2-3 minutes)
   - Vercel will provide your frontend URL

### Post-Deployment Steps

1. **Get your frontend URL** from Vercel dashboard
2. **Update backend CORS:**
   ```bash
   railway variables set CORS_ORIGIN="https://your-frontend.vercel.app"
   railway up  # Redeploy backend
   ```

3. **Test the frontend:**
   - Visit your Vercel URL
   - Check homepage loads
   - Test navigation
   - Open browser console (F12) - check for errors

4. **Test API connectivity:**
   - Sign in/sign up (test Clerk authentication)
   - Perform a search (test backend connection)
   - Check Network tab in browser DevTools

---

## Step 3: Cron Jobs Configuration (GitHub Actions)

**Time Required:** 5-10 minutes

Cron jobs automatically sync merchant data twice daily (6:00 AM and 6:00 PM UTC).

### Configure GitHub Secrets

1. **Go to GitHub Repository:**
   - Visit: https://github.com/YOUR_USERNAME/YOUR_REPO
   - Navigate to: **Settings → Secrets and variables → Actions**

2. **Click "New repository secret"** and add:

| Secret Name | Value |
|-------------|-------|
| `DATABASE_URL` | Supabase connection string (same as backend) |
| `JWT_SECRET` | `lUhYmXXdt8U8JqgDjyeXrkt9IiRJu7gJQR6NRHoN/oU=` |
| `SYNC_API_KEY` | `30kH8aXQECPjGZsBSqROode5oOS4CG7BEv/lLdaiiXQ=` |
| `CORS_ORIGIN` | Your frontend URL |
| `SUPABASE_URL` | `https://xrhlumtimbmglzrfrnnk.supabase.co` |
| `SUPABASE_ANON_KEY` | `eyJhbG...` (anon key) |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJhbG...` (service role key) |

### Test Cron Job Manually

1. **Go to Actions tab** in GitHub
2. **Select "Merchant Data Sync"** workflow
3. **Click "Run workflow"**
4. **Select branch:** `main`
5. **Click "Run workflow"**
6. **Monitor execution** - Should complete in 5-15 minutes

### Verify Cron Schedule

1. Check workflow file: `.github/workflows/merchant-sync.yml`
2. Verify cron expression: `0 6,18 * * *` (6:00 AM and 6:00 PM UTC)
3. View recent runs: Actions tab → Merchant Data Sync

---

## Step 4: Custom Domain Configuration (Optional)

**Time Required:** 10-30 minutes (DNS propagation)

### Frontend Domain (Vercel)

1. **Go to Vercel Dashboard → Your Project → Settings → Domains**
2. **Add your domain:** `buildstock.pro` (or your custom domain)
3. **Configure DNS records** at your domain registrar:

   ```
   Type: A
   Name: @
   Value: 76.76.21.21

   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
   ```

4. **Wait for DNS propagation** (up to 24 hours, typically 10-30 minutes)
5. **SSL is automatic** - Vercel provisions SSL certificates automatically

### Backend Domain (Railway)

1. **Go to Railway Dashboard → Your Project → Settings → Domains**
2. **Add custom domain:** `api.buildstock.pro`
3. **Configure DNS:**

   ```
   Type: CNAME
   Name: api
   Value: [your-railway-id].up.railway.app
   ```

4. **Wait for propagation**
5. **Update environment variables:**
   - Frontend: `NEXT_PUBLIC_API_URL=https://api.buildstock.pro`
   - Backend: `CORS_ORIGIN=https://buildstock.pro`

---

## Connection Verification

After deploying all components, verify connections:

### 1. Backend Health Check

```bash
curl https://your-backend.up.railway.app/health
```

**Expected Output:**
```json
{
  "status": "ok",
  "timestamp": "2026-01-30T10:00:00Z",
  "database": "connected",
  "redis": "connected"
}
```

### 2. Frontend Load Test

```bash
curl -I https://your-frontend.vercel.app
```

**Expected Output:**
```
HTTP/2 200
content-type: text/html; charset=utf-8
```

### 3. Database Connection Test

1. **Go to Supabase Dashboard**
2. **Check database status** (should be "Active")
3. **Open SQL Editor** and run:
   ```sql
   SELECT COUNT(*) FROM users;
   SELECT COUNT(*) FROM merchants;
   ```
4. **Verify tables exist** (16 tables total)

### 4. API Integration Test

1. **Open frontend in browser**
2. **Open DevTools** (F12) → Network tab
3. **Perform a search**
4. **Verify API call succeeds:**
   - Status: 200 OK
   - Response contains product data
   - No CORS errors

### 5. Authentication Test

1. **Click "Sign In"**
2. **Sign in with Clerk** (email/password or OAuth)
3. **Verify session persists** (refresh page)
4. **Check protected routes** (dashboard, profile)

### 6. Cron Job Test

1. **Go to GitHub Actions tab**
2. **Run "Merchant Data Sync" workflow manually**
3. **Monitor execution**
4. **Check for success status** (green checkmark)

---

## Beta Testing Kick-off

### Pre-Launch Checklist

Before inviting beta testers:

- [ ] All components deployed and verified
- [ ] Database seeded with test data
- [ ] Authentication working correctly
- [ ] Error tracking enabled (Sentry)
- [ ] Monitoring configured (Vercel/Railway dashboards)
- [ ] Backup plan documented
- [ ] Support email configured

### Beta Tester Recruitment

**Target Number:** 10-20 beta testers

**Ideal Profile:**
- UK-based construction industry professionals
- Tradespeople (builders, plumbers, electricians)
- DIY enthusiasts
- Construction material buyers

**Recruitment Channels:**
- Industry forums (Builder's UK, Screwfix Community)
- Social media (LinkedIn, Twitter/X)
- Personal network
- Trade associations

### Beta Tester Onboarding

1. **Send Welcome Email:**
   - Introduction to BuildStock Pro
   - Beta testing goals
   - How to access the application
   - What to test
   - How to provide feedback

2. **Provide Testing Guide:**
   - Key features to test
   - Known issues (if any)
   - Bug reporting process
   - Feedback channels

3. **Set Expectations:**
   - Beta period duration (4 weeks)
   - Response time for issues
   - Incentives (if any)

### Beta Testing Timeline

**Week 1: Onboarding & Smoke Testing**
- Day 1-2: Tester registration and onboarding
- Day 3-7: Basic functionality testing (search, authentication)

**Week 2: Core Features**
- Price alerts
- Stock alerts
- Saved searches
- Watched products

**Week 3: Edge Cases & Stress Testing**
- Large result sets
- Concurrent users
- Mobile devices
- Different browsers

**Week 4: Feedback & Polish**
- Bug fixes
- Performance improvements
- UI/UX refinements

### Feedback Collection

**Channels:**
1. **GitHub Issues** - Bug reports
2. **Google Forms** - Structured feedback
3. **Email** - Private feedback
4. **Discord/Slack** - Real-time chat (optional)

**Feedback Form Questions:**
- Overall satisfaction (1-5)
- Features used
- Bugs encountered
- Suggestions for improvement
- Would you recommend to colleagues?

### Success Metrics

**Target Metrics:**
- 70%+ tester retention rate
- 4+ star average satisfaction
- <5% critical bug rate
- 90%+ uptime
- <2 second average page load

**Data to Track:**
- Daily active users
- Search queries per user
- Alerts created
- Products viewed
- Conversion rate (save/alert actions)

---

## Troubleshooting Guide

### Backend Issues

#### Issue: Backend Won't Start

**Symptoms:**
- Railway deployment fails
- Health endpoint returns 500 error
- Logs show database connection errors

**Solutions:**

1. **Check DATABASE_URL:**
   ```bash
   railway variables get DATABASE_URL
   ```
   Verify:
   - Correct password
   - Correct host (pooler.supabase.com)
   - Correct port (6543 for transaction pooler)
   - `?pgbouncer=true` parameter present

2. **Test database connection:**
   ```bash
   psql "postgresql://postgres.xrhlumtimbmglzrfrnnk:[PASSWORD]@aws-0-eu-west-1.pooler.supabase.com:5432/postgres"
   ```

3. **Check Railway logs:**
   ```bash
   railway logs --tail
   ```

4. **Redeploy:**
   ```bash
   railway up
   ```

#### Issue: CORS Errors

**Symptoms:**
- Browser console shows CORS policy errors
- API calls blocked

**Solutions:**

1. **Verify CORS_ORIGIN:**
   ```bash
   railway variables get CORS_ORIGIN
   ```
   Should match your frontend URL exactly (including https://)

2. **Update CORS_ORIGIN:**
   ```bash
   railway variables set CORS_ORIGIN="https://your-frontend.vercel.app"
   railway up
   ```

3. **Test CORS:**
   ```bash
   curl -H "Origin: https://your-frontend.vercel.app" \
        -H "Access-Control-Request-Method: GET" \
        -X OPTIONS \
        https://your-backend.up.railway.app/api/v1/products
   ```

#### Issue: Slow API Response Times

**Symptoms:**
- API calls take >5 seconds
- Timeout errors

**Solutions:**

1. **Check database pooler stats** (Supabase Dashboard)
2. **Enable Redis caching** (if not enabled)
3. **Add database indexes** (check migration logs)
4. **Scale Railway plan** (if hitting free tier limits)

### Frontend Issues

#### Issue: Frontend Build Fails

**Symptoms:**
- Vercel deployment fails
- Build errors in logs

**Solutions:**

1. **Test build locally:**
   ```bash
   cd /Users/macbook/Desktop/buildstock.pro/Construction-RC/src/frontend
   npm run build
   ```

2. **Clear cache and rebuild:**
   ```bash
   rm -rf .next node_modules
   npm install
   npm run build
   ```

3. **Check environment variables:**
   - All required variables set in Vercel
   - Variable names match exactly (case-sensitive)
   - No typos in values

4. **Check Vercel build logs:**
   - Vercel Dashboard → Project → Deployments
   - Click on failed deployment
   - Review error messages

#### Issue: API Calls Fail from Frontend

**Symptoms:**
- Network errors in browser console
- No data returned from API

**Solutions:**

1. **Verify NEXT_PUBLIC_API_URL:**
   - Should include https://
   - Should point to Railway backend URL
   - No trailing slash

2. **Test backend directly:**
   ```bash
   curl https://your-backend.up.railway.app/api/v1/products
   ```

3. **Check Network tab:**
   - Request URL correct?
   - Request headers present?
   - Response status code?

4. **Verify CORS configuration** (see backend CORS issues above)

#### Issue: Authentication Not Working

**Symptoms:**
- Can't sign in
- Session not persisting
- Protected routes inaccessible

**Solutions:**

1. **Verify Clerk keys:**
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` correct
   - `CLERK_SECRET_KEY` correct
   - Using test keys for test environment

2. **Check Clerk Dashboard:**
   - Application status active
   - Allowed domains configured
   - JWT templates set up

3. **Test Clerk integration:**
   - Sign in with email/password
   - Sign in with Google (if enabled)
   - Check session token in localStorage

### Database Issues

#### Issue: Database Connection Refused

**Symptoms:**
- Backend can't connect to database
- Connection timeout errors

**Solutions:**

1. **Verify Supabase project status:**
   - Dashboard → Settings → General
   - Status should be "Active"

2. **Check connection string:**
   - Password correct
   - Host correct
   - Port correct (6543 for transaction pooler)

3. **Test connection:**
   ```bash
   psql "postgresql://postgres.xrhlumtimbmglzrfrnnk:[PASSWORD]@aws-0-eu-west-1.pooler.supabase.com:5432/postgres"
   ```

4. **Check Supabase logs:**
   - Dashboard → Logs
   - Look for connection errors

#### Issue: Migration Failed

**Symptoms:**
- Tables missing
- Schema errors

**Solutions:**

1. **Check applied migrations:**
   ```bash
   # In Supabase SQL Editor
   SELECT * FROM supabase_migrations.schema_migrations;
   ```

2. **Run missing migrations:**
   ```bash
   cd /Users/macbook/Desktop/buildstock.pro/Construction-RC/src/backend
   bun run migrate:up
   ```

3. **Verify tables:**
   ```sql
   SELECT table_name FROM information_schema.tables
   WHERE table_schema = 'public';
   ```
   Should show 16 tables

### Cron Job Issues

#### Issue: GitHub Actions Workflow Fails

**Symptoms:**
- Workflow shows red X
- Sync not running

**Solutions:**

1. **Check secrets configured:**
   - Repository → Settings → Secrets
   - All required secrets present
   - Values correct

2. **View workflow logs:**
   - Actions tab → Merchant Data Sync
   - Click on failed run
   - Review error messages

3. **Test workflow manually:**
   - Click "Run workflow"
   - Select branch: main
   - Monitor execution

4. **Check cron expression:**
   ```yaml
   schedule:
     - cron: '0 6,18 * * *'  # 6:00 AM and 6:00 PM UTC
   ```

---

## Rollback Procedures

### When to Rollback

Consider rollback if:
- Critical bug affecting all users
- Security vulnerability discovered
- Data corruption or loss
- Performance degradation (50%+ slowdown)
- Payment processing failure (if applicable)

### Frontend Rollback (Vercel)

**Option 1: Instant Rollback via Dashboard**

1. **Go to Vercel Dashboard**
2. **Select your project**
3. **Click "Deployments" tab**
4. **Find last successful deployment**
5. **Click "Promote to Production"**

**Option 2: Git Revert**

```bash
# Revert last commit
git revert HEAD

# Push to GitHub (triggers redeploy)
git push origin main
```

**Option 3: Deploy Previous Commit**

```bash
# List recent commits
git log --oneline

# Checkout previous commit
git checkout [commit-hash]

# Push to GitHub (triggers redeploy)
git push origin main --force
```

### Backend Rollback (Railway)

**Option 1: Redeploy Previous Commit**

1. **Go to Railway Dashboard**
2. **Select your backend service**
3. **Click "Deployments" tab**
4. **Find previous successful deployment**
5. **Click "Redeploy"**

**Option 2: Git Revert**

```bash
# Revert last commit
git revert HEAD

# Push to GitHub (triggers redeploy)
git push origin main
```

**Option 3: Rollback via CLI**

```bash
# View deployment history
railway status

# Redeploy specific commit
railway up -- [commit-hash]
```

### Database Rollback (Supabase)

**WARNING:** Database rollback can result in data loss. Proceed with caution.

**Option 1: Supabase Point-in-Time Recovery**

1. **Go to Supabase Dashboard**
2. **Database → Backups**
3. **Select backup point**
4. **Click "Restore"**

**Option 2: Manual Migration Rollback**

```bash
# Rollback last migration
cd /Users/macbook/Desktop/buildstock.pro/Construction-RC/src/backend
bun run migrate:down

# Rollback multiple migrations
bun run migrate:down --steps=3
```

**Option 3: SQL Restore from Backup**

```bash
# Download backup
psql "postgresql://..." -f backup.sql

# Or restore specific tables
psql "postgresql://..." -f products_backup.sql
```

### Emergency Rollback Procedure

**If everything is failing:**

1. **Put up maintenance page** (Vercel)
   - Create `maintenance.html`
   - Set as root page
   - Deploy immediately

2. **Disable cron jobs** (GitHub)
   - Rename workflow file: `.github/workflows/merchant-sync.yml.disabled`
   - Commit and push

3. **Notify users**
   - Post status on social media
   - Send email to active users
   - Update status page (if you have one)

4. **Investigate issue**
   - Check logs (Vercel, Railway, Sentry)
   - Reproduce locally
   - Identify root cause

5. **Fix and redeploy**
   - Create fix branch
   - Test thoroughly
   - Merge to main
   - Monitor deployment

---

## Post-Deployment Tasks

### Immediate (Day 1)

- [ ] **Monitor logs** for first 24 hours
- [ ] **Test all critical user flows** (search, auth, alerts)
- [ ] **Set up uptime monitoring** (UptimeRobot, Pingdom)
- [ ] **Configure error alerts** (Sentry)
- [ ] **Test backup and restore procedures**
- [ ] **Document all production URLs and credentials**
- [ ] **Notify team of successful deployment**

### Week 1

- [ ] **Review analytics** (Vercel Analytics, Google Analytics)
- [ ] **Optimize performance** (Core Web Vitals, load times)
- [ ] **Fix any critical bugs** reported by users
- [ ] **Set up recurring backups** (Supabase automated backups)
- [ ] **Review security advisor** (Supabase Dashboard)
- [ ] **Enable Row Level Security (RLS)** if not already enabled
- [ ] **Monitor costs** (Vercel, Railway, Supabase dashboards)

### Month 1

- [ ] **Conduct security audit**
- [ ] **Review and rotate secrets** (JWT_SECRET, SYNC_API_KEY)
- [ ] **Optimize database queries** (check slow query logs)
- [ ] **Scale infrastructure if needed** (upgrade from free tiers)
- [ ] **Set up custom domain** (if not done during deployment)
- [ ] **Create user documentation** (help center, FAQ)
- [ ] **Plan feature roadmap** based on beta feedback

### Ongoing

- [ ] **Weekly:** Review error reports (Sentry)
- [ ] **Weekly:** Check uptime and performance metrics
- [ ] **Monthly:** Review and update dependencies
- [ ] **Monthly:** Backup database locally
- [ ] **Quarterly:** Rotate secrets and API keys
- [ ] **Quarterly:** Security audit and penetration testing
- [ ] **Annually:** Disaster recovery drill

---

## Support & Contact Information

### Internal Support

**Project Lead:** [Your Name]
**Email:** [your-email@example.com]
**Role:** Deployment coordinator, technical decisions

**Developer:** [Developer Name]
**Email:** [dev-email@example.com]
**Role:** Code fixes, bug reports

**DevOps:** [DevOps Name]
**Email:** [devops-email@example.com]
**Role:** Infrastructure issues, scaling

### External Support

**Platform Documentation:**

- **Vercel:** https://vercel.com/docs
  - Status: https://www.vercel-status.com
  - Support: support@vercel.com

- **Railway:** https://docs.railway.app
  - Status: https://status.railway.app
  - Support: support@railway.app
  - Community: https://discord.gg/railway

- **Supabase:** https://supabase.com/docs
  - Status: https://status.supabase.com
  - Support: support@supabase.com
  - Community: https://github.com/supabase/supabase/discussions

- **Clerk:** https://clerk.com/docs
  - Status: https://status.clerk.com
  - Support: support@clerk.com

- **Sentry:** https://docs.sentry.io
  - Status: https://status.sentry.io
  - Support: support@sentry.io

### Emergency Contacts

**For Production Outages (P0):**
1. Check platform status pages (above)
2. Review error logs (Sentry, Vercel, Railway)
3. Implement rollback if needed
4. Notify users via status page or email

**For Security Issues (P0):**
1. Disable affected features immediately
2. Review security logs (Supabase, Clerk)
3. Rotate compromised secrets
4. Contact platform security teams if needed
5. Document incident and post-mortem

### Community Resources

**GitHub Repository:**
- Issues: https://github.com/mondo2003/Buildstockpro/issues
- Discussions: https://github.com/mondo2003/Buildstockpro/discussions

**Documentation:**
- Quick Start: `/Users/macbook/Desktop/buildstock.pro/QUICK_START.md`
- Deployment Guide: `/Users/macbook/Desktop/buildstock.pro/DEPLOYMENT_GUIDE.md`
- Checkpoint Summary: `/Users/macbook/Desktop/buildstock.pro/CHECKPOINT-SUMMARY.md`
- Production Secrets: `/Users/macbook/Desktop/buildstock.pro/PRODUCTION_SECREDS.txt`

### Getting Help

**Before asking for help:**
1. Check logs (Vercel, Railway, Sentry)
2. Search existing GitHub issues
3. Read platform documentation
4. Try reproducing locally

**When asking for help, include:**
- What you were trying to do
- What happened (error messages, logs)
- What you expected to happen
- Steps to reproduce
- Environment (production/development)
- Relevant configuration (sanitized)

---

## Appendix A: Production URLs and Credentials

**Save this information securely (password manager):**

### Deployment URLs

**Frontend (Vercel):**
- URL: [To be filled after deployment]
- Dashboard: https://vercel.com/dashboard
- Console: https://vercel.com/USERNAME/PROJECT

**Backend (Railway):**
- URL: [To be filled after deployment]
- Dashboard: https://railway.app
- Service: [To be filled after deployment]

**Database (Supabase):**
- Dashboard: https://supabase.com/dashboard/project/xrhlumtimbmglzrfrnnk
- API URL: https://xrhlumtimbmglzrfrnnk.supabase.co
- Connection: postgresql://postgres.xrhlumtimbmglzrfrnnk:[PASSWORD]@aws-0-eu-west-1.pooler.supabase.com:6543/postgres

### Critical Secrets

**Store in password manager:**

```bash
# Database Password
SUPABASE_DB_PASSWORD=[Get from Supabase Dashboard]

# JWT Secret
JWT_SECRET=lUhYmXXdt8U8JqgDjyeXrkt9IiRJu7gJQR6NRHoN/oU=

# Sync API Key
SYNC_API_KEY=30kH8aXQECPjGZsBSqROode5oOS4CG7BEv/lLdaiiXQ=

# Clerk Keys
CLERK_PUBLISHABLE_KEY=pk_test_[your-key]
CLERK_SECRET_KEY=sk_test_[your-secret]

# Supabase Keys
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhyaGx1bXRpbWJtZ2x6cmZybm5rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk1MTc1MDgsImV4cCI6MjA4NTA5MzUwOH0.fvE4LYnPQ0HI7JiChZdDgLKcnyk3WdeS2iLLn4cYMRw

SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhyaGx1bXRpbWJtZ2x6cmZybm5rIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTUxNzUwOCwiZXhwIjoyMDg1MDkzNTA4fQ.qZ1MJN8LY8xI_HFqJH3vC6OW2PHGB0uPkLPLcKV8qmE
```

---

## Appendix B: Quick Reference Commands

### Backend

```bash
# Deploy backend
cd /Users/macbook/Desktop/buildstock.pro/Construction-RC/src/backend
./deploy-railway.sh

# View logs
railway logs

# Set environment variable
railway variables set KEY="value"

# Get backend URL
railway domain

# Redeploy
railway up
```

### Frontend

```bash
# Deploy frontend
cd /Users/macbook/Desktop/buildstock.pro/Construction-RC/src/frontend
./deploy-vercel.sh

# View logs
vercel logs

# Set environment variable (via dashboard)
# Go to: https://vercel.com/dashboard → Project → Settings → Environment Variables

# Redeploy
vercel --prod
```

### Database

```bash
# Connect to database
psql "postgresql://postgres.xrhlumtimbmglzrfrnnk:[PASSWORD]@aws-0-eu-west-1.pooler.supabase.com:5432/postgres"

# Run migration
cd /Users/macbook/Desktop/buildstock.pro/Construction-RC/src/backend
bun run migrate:up

# Check tables
psql "..." -c "\dt"

# Backup database
pg_dump "postgresql://..." > backup.sql
```

### Testing

```bash
# Test backend health
curl https://your-backend.up.railway.app/health

# Test frontend
curl -I https://your-frontend.vercel.app

# Test API endpoint
curl https://your-backend.up.railway.app/api/v1/products

# Test with authentication
curl -H "Authorization: Bearer [token]" \
     https://your-backend.up.railway.app/api/v1/user/profile
```

### Secrets Generation

```bash
# Generate JWT secret
openssl rand -base64 32

# Generate API key
openssl rand -base64 32

# Generate password
openssl rand -base64 16
```

---

## Appendix C: Monitoring Checklist

### Daily Checks

- [ ] Check error rate in Sentry
- [ ] Check uptime (should be 99%+)
- [ ] Review recent deployments
- [ ] Check disk space usage (Supabase)
- [ ] Monitor API response times

### Weekly Checks

- [ ] Review performance metrics (Vercel Analytics)
- [ ] Check database query performance
- [ ] Review security logs (Supabase, Clerk)
- [ ] Monitor costs (Vercel, Railway, Supabase)
- [ ] Review GitHub issues and PRs

### Monthly Checks

- [ ] Review and update dependencies
- [ ] Security audit (run `npm audit`, `bun audit`)
- [ ] Review backup retention
- [ ] Optimize database (vacuum, analyze)
- [ ] Review and update documentation

---

## Conclusion

This guide provides everything needed to deploy BuildStock Pro to production. Follow the steps in order, verify each component before proceeding to the next, and don't hesitate to rollback if issues arise.

**Key Points:**
- Deploy in order: Database → Backend → Frontend → Cron Jobs
- Test thoroughly at each step
- Monitor logs and metrics closely
- Have rollback plan ready
- Ask for help when needed

**Estimated Total Time:** 30-45 minutes for initial deployment

**Support:** See "Support & Contact Information" section above

**Good luck with your deployment!**

---

**Document Version:** 1.0
**Last Updated:** 2026-01-30
**Next Review:** After first production deployment
