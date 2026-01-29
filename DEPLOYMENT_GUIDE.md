# BuildStock Pro - Production Deployment Guide

## 🎯 Overview

This guide covers the complete production deployment of BuildStock Pro. All components have been prepared for deployment.

**Deployment Status:**
| Component | Status | Notes |
|-----------|--------|-------|
| Frontend (Vercel) | ✅ Ready | Deployment script created |
| Backend (Railway) | ✅ Ready | Deployment script created |
| Database (Supabase) | ✅ Ready | Migrations applied |
| Cron Jobs | ✅ Ready | GitHub Actions configured |
| DNS/SSL | ⏳ Pending | Requires domain |

---

## 📋 Prerequisites Checklist

Before deploying, ensure you have:

### Accounts
- [ ] GitHub account (for repository and Actions)
- [ ] Vercel account (free) - https://vercel.com
- [ ] Railway account (free) - https://railway.app
- [ ] Supabase account (free) - https://supabase.com
- [ ] Sentry account (optional) - https://sentry.io
- [ ] Clerk account (for auth) - https://clerk.com

### Credentials
- [ ] Clerk Publishable Key (`pk_test_...`)
- [ ] Clerk Secret Key (`sk_test_...`)
- [ ] Sentry DSN (optional)
- [ ] Custom domain (optional)

---

## 🚀 Deployment Order

**Deploy in this order:**

1. **Database** (Supabase) - ✅ Already done
2. **Backend** (Railway) - Deploy first
3. **Frontend** (Vercel) - Deploy after backend
4. **Cron Jobs** (GitHub Actions) - Deploy with backend
5. **DNS/SSL** (Custom domain) - Optional, last

---

## 📦 Step 1: Database (Supabase) ✅

**Status:** Already configured!

**Details:**
- **Project ID:** `xrhlumtimbmglzrfrnnk`
- **Region:** EU-West-1
- **Database:** PostgreSQL 17.6.1.063
- **Status:** Active and healthy

**Connection Strings:**
```bash
# Transaction Pooler (Recommended for Backend)
postgresql://postgres.xrhlumtimbmglzrfrnnk:[PASSWORD]@aws-0-eu-west-1.pooler.supabase.com:6543/postgres

# Session Pooler (For Migrations)
postgresql://postgres.xrhlumtimbmglzrfrnnk:[PASSWORD]@aws-0-eu-west-1.pooler.supabase.com:5432/postgres
```

**To get your password:**
Visit https://supabase.com/dashboard/project/xrhlumtimbmglzrfrnnk/settings/database

**Migrations Applied:** ✅ All 5 migrations
- Core tables (users, merchants, products)
- Analytics tables (price_history, user_activity)
- Alert tables (price_alerts, stock_alerts)
- User preferences

---

## 🔧 Step 2: Backend Deployment (Railway)

**Location:** `/Users/macbook/Desktop/buildstock.pro/Construction-RC/src/backend`

### Quick Deploy (Automated)

```bash
cd /Users/macbook/Desktop/buildstock.pro/Construction-RC/src/backend
./deploy-railway.sh
```

**The script will:**
1. Install Railway CLI
2. Guide you through authentication
3. Create/link your Railway project
4. Add PostgreSQL and Redis services
5. Generate secure JWT secret
6. Configure environment variables
7. Deploy the backend
8. Provide your backend URL

### Manual Deploy

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Initialize project
cd /Users/macbook/Desktop/buildstock.pro/Construction-RC/src/backend
railway init

# Add PostgreSQL
railway add postgresql

# Add Redis (optional)
railway add redis

# Set environment variables
railway variables set DATABASE_URL="postgresql://..."
railway variables set JWT_SECRET="your-secret-key"
railway variables set CORS_ORIGIN="https://your-app.vercel.app"
railway variables set SENTRY_DSN="https://..."

# Deploy
railway up
```

### Environment Variables Required

| Variable | Description | Source |
|----------|-------------|--------|
| `DATABASE_URL` | Supabase connection string | Step 1 |
| `JWT_SECRET` | JWT signing secret | Generate with `openssl rand -base64 32` |
| `CORS_ORIGIN` | Frontend URL | From Step 3 (after deployment) |
| `REDIS_URL` | Redis connection | Railway (auto) |
| `SENTRY_DSN` | Sentry DSN | Sentry dashboard |
| `PORT` | Server port | `3001` |

### Post-Deployment

1. **Get your backend URL:**
   ```bash
   railway domain
   ```
   Example: `https://buildstock-api.up.railway.app`

2. **Test health endpoint:**
   ```bash
   curl https://your-backend.up.railway.app/health
   ```

3. **Verify database connection:**
   Check Railway logs for any database errors.

---

## 🌐 Step 3: Frontend Deployment (Vercel)

**Location:** `/Users/macbook/Desktop/buildstock.pro/Construction-RC/src/frontend`

### Quick Deploy (Automated)

```bash
cd /Users/macbook/Desktop/buildstock.pro/Construction-RC/src/frontend
./deploy-vercel.sh
```

### Manual Deploy

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy to production
cd /Users/macbook/Desktop/buildstock.pro/Construction-RC/src/frontend
vercel --prod
```

### Environment Variables Required

Set these in Vercel Dashboard (Settings → Environment Variables):

| Variable | Description | Source |
|----------|-------------|--------|
| `NEXT_PUBLIC_API_URL` | Backend URL | From Step 2 |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk key | Clerk dashboard |
| `CLERK_SECRET_KEY` | Clerk secret | Clerk dashboard |
| `NEXT_PUBLIC_SENTRY_DSN` | Sentry DSN | Sentry dashboard |
| `NEXT_PUBLIC_SENTRY_ENVIRONMENT` | Environment | `production` |

### Post-Deployment

1. **Get your frontend URL:**
   From Vercel dashboard or deployment output.

2. **Update CORS on backend:**
   ```bash
   railway variables set CORS_ORIGIN="https://your-app.vercel.app"
   ```

3. **Test the deployment:**
   - Visit your Vercel URL
   - Test authentication
   - Test search functionality
   - Test all pages

---

## ⏰ Step 4: Cron Jobs (GitHub Actions)

**Status:** Already configured!

**Location:** `/Users/macbook/Desktop/buildstock.pro/Construction-RC/.github/workflows/merchant-sync.yml`

### What It Does

Automatically syncs merchant data twice daily:
- **Schedule:** 6:00 AM and 6:00 PM UTC
- **Merchants:** 6 UK construction suppliers
- **Duration:** 5-15 minutes per sync

### Setup Required

1. **Generate API Key:**
   ```bash
   openssl rand -base64 32
   ```

2. **Add GitHub Secrets:**
   Go to: Repository → Settings → Secrets and variables → Actions

   Add these secrets:
   ```
   DATABASE_URL=postgresql://...
   JWT_SECRET=your-jwt-secret
   CORS_ORIGIN=https://your-app.vercel.app
   SYNC_API_KEY=your-generated-api-key
   SENTRY_DSN=https://... (optional)
   SENTRY_ENVIRONMENT=production
   ```

3. **Test the workflow:**
   - Push to main branch
   - Go to Actions tab in GitHub
   - Select "Merchant Data Sync"
   - Click "Run workflow"

### Monitor Sync Jobs

View runs at: `https://github.com/YOUR_USERNAME/YOUR_REPO/actions/workflows/merchant-sync.yml`

---

## 🌍 Step 5: DNS & SSL (Custom Domain) - Optional

### For Vercel (Frontend)

1. **Go to Vercel Dashboard → Your Project → Settings → Domains**
2. **Add your domain:** `buildstock.pro`
3. **Configure DNS records:**

   ```
   Type: A
   Name: @
   Value: 76.76.21.21

   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
   ```

4. **Wait for propagation** (up to 24 hours)
5. **SSL is automatic** ✅

### For Railway (Backend)

1. **Go to Railway Dashboard → Your Project → Settings → Domains**
2. **Add custom domain:** `api.buildstock.pro`
3. **Configure DNS:**

   ```
   Type: CNAME
   Name: api
   Value: [your-railway-id].up.railway.app
   ```

4. **Wait for propagation**
5. **SSL is automatic** ✅

---

## ✅ Verification Checklist

After deployment, verify:

### Backend
- [ ] Health endpoint returns 200: `curl https://your-backend/health`
- [ ] Database connection working
- [ ] CORS allows frontend domain
- [ ] Sentry error tracking configured
- [ ] Redis connected (if used)

### Frontend
- [ ] Homepage loads correctly
- [ ] Authentication works (sign in/sign up)
- [ ] Search functionality working
- [ ] API calls successful
- [ ] No console errors
- [ ] Mobile responsive
- [ ] PWA installable

### Integration
- [ ] Frontend can communicate with backend
- [ ] Authentication tokens passed correctly
- [ ] File uploads work (if applicable)
- [ ] Real-time features work (if applicable)

### Cron Jobs
- [ ] First sync completed successfully
- [ ] Sync schedule active
- [ ] Error tracking configured
- [ ] Notifications working

---

## 📊 Production URL Structure

**Recommended URL structure:**

```
Frontend:  https://buildstock.pro (or https://buildstock.vercel.app)
Backend:   https://api.buildstock.pro (or https://buildstock-api.up.railway.app)
Database:  https://supabase.com/dashboard/project/xrhlumtimbmglzrfrnnk
```

---

## 🔐 Security Checklist

Before going live:

- [ ] All secrets in environment variables (never in code)
- [ ] CORS configured correctly
- [ ] Rate limiting enabled
- [ ] SQL injection protection (ORM parameterized queries)
- [ ] XSS protection (React escaping)
- [ ] CSRF protection (Clerk handles this)
- [ ] API key authentication on sync endpoints
- [ ] HTTPS enforced
- [ ] Security headers configured
- [ ] Row Level Security (RLS) enabled in Supabase

---

## 💰 Cost Estimation

### Monthly Costs (Production)

| Service | Tier | Cost |
|---------|------|------|
| Vercel (Frontend) | Free | $0 |
| Railway (Backend) | Free Tier | $0 |
| Railway (PostgreSQL) | Free Tier | $0 |
| Railway (Redis) | Free Tier | $0 |
| Supabase (Database) | Free Tier | $0 |
| GitHub Actions | Free | $0 |
| Clerk (Auth) | Free | $0 |
| Sentry (Error Tracking) | Free | $0 |
| **Total** | | **$0/month** |

**Free Tier Limits:**
- Vercel: 100GB bandwidth
- Railway: $5 free credit/month
- Supabase: 500MB database, 1GB bandwidth
- GitHub Actions: 2000 free minutes/month

**Upgrade Path:**
- Vercel Pro: $20/month (1TB bandwidth)
- Railway: ~$15/month for production
- Supabase Pro: $25/month

---

## 📈 Monitoring & Analytics

### Tools Configured

1. **Sentry** - Error tracking
   - Dashboard: https://sentry.io/
   - Monitors: Frontend errors, backend errors, performance

2. **Vercel Analytics** - Frontend analytics
   - Dashboard: https://vercel.com/analytics
   - Monitors: Page views, Core Web Vitals

3. **Railway Metrics** - Backend metrics
   - Dashboard: https://railway.app/
   - Monitors: CPU, memory, response times

4. **Supabase Dashboard** - Database metrics
   - Dashboard: https://supabase.com/dashboard
   - Monitors: Query performance, storage, bandwidth

5. **GitHub Actions** - Cron job monitoring
   - Dashboard: https://github.com/YOUR_REPO/actions
   - Monitors: Sync success/failure, duration

---

## 🚨 Troubleshooting

### Common Issues

#### 1. CORS Errors
**Symptom:** API calls blocked by CORS policy

**Solution:**
```bash
# Update CORS_ORIGIN on backend
railway variables set CORS_ORIGIN="https://your-frontend-domain.com"
```

#### 2. Database Connection Failed
**Symptom:** Backend can't connect to database

**Solution:**
- Verify DATABASE_URL is correct
- Check Supabase project is active
- Test connection: `psql $DATABASE_URL`

#### 3. Authentication Not Working
**Symptom:** Users can't sign in

**Solution:**
- Verify Clerk keys are correct
- Check Clerk dashboard configuration
- Ensure JWT templates are set up

#### 4. Build Failures
**Symptom:** Vercel/Railway deployment fails

**Solution:**
```bash
# Test build locally
cd /Users/macbook/Desktop/buildstock.pro/Construction-RC/src/frontend
npm run build

# Clear cache and retry
rm -rf .next node_modules
npm install
npm run build
```

#### 5. Cron Jobs Not Running
**Symptom:** GitHub Actions workflow not triggering

**Solution:**
- Verify workflow file is in `.github/workflows/`
- Check secrets are configured
- Ensure cron expression is valid
- Check Actions tab for errors

---

## 📚 Documentation Links

| Component | Documentation |
|-----------|---------------|
| Frontend | `Construction-RC/src/frontend/VERCEL_DEPLOYMENT.md` |
| Backend | `Construction-RC/src/backend/RAILWAY_DEPLOYMENT.md` |
| Database | `PRODUCTION-DATABASE-SETUP.md` |
| Cron Jobs | `Construction-RC/src/backend/CRON_SETUP.md` |
| Sentry | `SENTRY_SETUP.md` |

---

## 🎉 Go Live Checklist

Final checks before launch:

- [ ] All components deployed
- [ ] Environment variables configured
- [ ] Database migrated and seeded
- [ ] CORS configured correctly
- [ ] Authentication working
- [ ] All pages tested
- [ ] Mobile responsive verified
- [ ] Error tracking enabled
- [ ] Cron jobs running
- [ ] Custom domain configured (optional)
- [ ] SSL certificates active
- [ ] Monitoring set up
- [ ] Backup plan in place
- [ ] Team notified of launch

---

## 🚀 Quick Start Commands

```bash
# 1. Deploy Backend
cd /Users/macbook/Desktop/buildstock.pro/Construction-RC/src/backend
./deploy-railway.sh

# 2. Deploy Frontend
cd /Users/macbook/Desktop/buildstock.pro/Construction-RC/src/frontend
./deploy-vercel.sh

# 3. Configure GitHub Secrets (manual)
# Go to GitHub repo → Settings → Secrets

# 4. Test
curl https://your-backend.up.railway.app/health
curl https://your-frontend.vercel.app
```

---

## 📞 Support

If you need help:

1. **Check documentation** in each component folder
2. **Review logs** in Vercel/Railway dashboards
3. **Check Sentry** for error reports
4. **Consult official docs:**
   - Vercel: https://vercel.com/docs
   - Railway: https://docs.railway.app
   - Supabase: https://supabase.com/docs
   - Clerk: https://clerk.com/docs

---

**Status:** ✅ Ready for Production Deployment

**Project:** BuildStock Pro - UK Construction Materials Aggregator

**Last Updated:** January 29, 2026

---

🎊 **Congratulations! Your BuildStock Pro application is ready for production deployment!**
