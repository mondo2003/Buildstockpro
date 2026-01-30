# BuildStock Pro - Production One-Pager

**Quick Reference for Production Deployment**
**Version:** 1.0 | **Last Updated:** 2026-01-30

---

## CRITICAL URLS

### Deployment Platforms

| Service | URL | Purpose |
|---------|-----|---------|
| **Frontend** | [To be filled] | Vercel deployment |
| **Backend** | [To be filled] | Railway deployment |
| **Database** | https://supabase.com/dashboard/project/xrhlumtimbmglzrfrnnk | Supabase database |
| **Repository** | https://github.com/mondo2003/Buildstockpro | Source code |

### Project Details

- **Supabase Project ID:** `xrhlumtimbmglzrfrnnk`
- **Region:** EU-West-1
- **Database:** PostgreSQL 17.6.1.063
- **Status:** Active and Healthy

---

## CRITICAL CREDENTIALS

### Database Connection

**Transaction Pooler (Backend):**
```
postgresql://postgres.xrhlumtimbmglzrfrnnk:[PASSWORD]@aws-0-eu-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true
```

**API URL:** `https://xrhlumtimbmglzrfrnnk.supabase.co`

**Get Password:** https://supabase.com/dashboard/project/xrhlumtimbmglzrfrnnk/settings/database

### Application Secrets

```bash
# JWT Secret (Authentication)
JWT_SECRET=lUhYmXXdt8U8JqgDjyeXrkt9IiRJu7gJQR6NRHoN/oU=

# Sync API Key (Cron Jobs)
SYNC_API_KEY=30kH8aXQECPjGZsBSqROode5oOS4CG7BEv/lLdaiiXQ=

# Supabase Keys
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhyaGx1bXRpbWJtZ2x6cmZybm5rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk1MTc1MDgsImV4cCI6MjA4NTA5MzUwOH0.fvE4LYnPQ0HI7JiChZdDgLKcnyk3WdeS2iLLn4cYMRw

SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhyaGx1bXRpbWJtZ2x6cmZybm5rIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTUxNzUwOCwiZXhwIjoyMDg1MDkzNTA4fQ.qZ1MJN8LY8xI_HFqJH3vC6OW2PHGB0uPkLPLcKV8qmE
```

### Clerk Authentication

**Get your keys:** https://dashboard.clerk.com → API Keys

```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_[your-key]
CLERK_SECRET_KEY=sk_test_[your-secret]
```

---

## DEPLOYMENT COMMANDS

### Backend (Railway) - Deploy First

```bash
cd /Users/macbook/Desktop/buildstock.pro/Construction-RC/src/backend
./deploy-railway.sh
```

**Backend Environment Variables:**
```bash
DATABASE_URL=[Supabase connection string]
JWT_SECRET=lUhYmXXdt8U8JqgDjyeXrkt9IiRJu7gJQR6NRHoN/oU=
SYNC_API_KEY=30kH8aXQECPjGZsBSqROode5oOS4CG7BEv/lLdaiiXQ=
SUPABASE_URL=https://xrhlumtimbmglzrfrnnk.supabase.co
SUPABASE_ANON_KEY=[see above]
SUPABASE_SERVICE_ROLE_KEY=[see above]
CLERK_SECRET_KEY=[from Clerk dashboard]
CORS_ORIGIN=[add after frontend deployed]
PORT=3001
NODE_ENV=production
```

### Frontend (Vercel) - Deploy Second

```bash
cd /Users/macbook/Desktop/buildstock.pro/Construction-RC/src/frontend
./deploy-vercel.sh
```

**Frontend Environment Variables:**
```bash
NEXT_PUBLIC_API_URL=[Railway backend URL]
NEXT_PUBLIC_SUPABASE_URL=https://xrhlumtimbmglzrfrnnk.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[see above]
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=[from Clerk dashboard]
```

### Update CORS (After Both Deployed)

```bash
# Get backend URL from Railway
railway domain

# Set CORS origin to frontend URL
railway variables set CORS_ORIGIN="https://your-frontend.vercel.app"

# Redeploy backend
railway up
```

---

## VERIFICATION COMMANDS

```bash
# Test backend health
curl https://your-backend.up.railway.app/health

# Test frontend
curl -I https://your-frontend.vercel.app

# Test API
curl https://your-backend.up.railway.app/api/v1/products

# View backend logs
railway logs

# View frontend logs
vercel logs
```

---

## CRON JOBS (GitHub Actions)

**Configure Secrets:**
Repository → Settings → Secrets and variables → Actions

**Required Secrets:**
```bash
DATABASE_URL=[Supabase connection string]
JWT_SECRET=lUhYmXXdt8U8JqgDjyeXrkt9IiRJu7gJQR6NRHoN/oU=
SYNC_API_KEY=30kH8aXQECPjGZsBSqROode5oOS4CG7BEv/lLdaiiXQ=
CORS_ORIGIN=[frontend URL]
SUPABASE_URL=https://xrhlumtimbmglzrfrnnk.supabase.co
SUPABASE_ANON_KEY=[see above]
SUPABASE_SERVICE_ROLE_KEY=[see above]
```

**Schedule:** Twice daily (6:00 AM and 6:00 PM UTC)

**Test:** Actions tab → Merchant Data Sync → Run workflow

---

## QUICK TROUBLESHOOTING

### Backend Won't Start

**Check:** `railway logs`

**Fix:**
```bash
# Verify DATABASE_URL
railway variables get DATABASE_URL

# Test connection
psql "[DATABASE_URL]"

# Redeploy
railway up
```

### Frontend Build Fails

**Check:** Vercel Dashboard → Deployments

**Fix:**
```bash
# Test locally
cd /Users/macbook/Desktop/buildstock.pro/Construction-RC/src/frontend
npm run build

# Clear cache
rm -rf .next node_modules
npm install
npm run build
```

### CORS Errors

**Symptoms:** API calls blocked by CORS policy

**Fix:**
```bash
# Update CORS origin
railway variables set CORS_ORIGIN="https://your-frontend.vercel.app"
railway up
```

### Database Connection Failed

**Check:** Supabase Dashboard → Settings → Database

**Fix:**
```bash
# Test connection
psql "postgresql://postgres.xrhlumtimbmglzrfrnnk:[PASSWORD]@aws-0-eu-west-1.pooler.supabase.com:5432/postgres"

# Verify password
# Visit: https://supabase.com/dashboard/project/xrhlumtimbmglzrfrnnk/settings/database
```

### Authentication Not Working

**Check:** Clerk Dashboard → API Keys

**Fix:**
- Verify `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` correct
- Verify `CLERK_SECRET_KEY` correct
- Check Clerk application status
- Clear browser cache/cookies

---

## ROLLBACK PROCEDURES

### Frontend Rollback

**Vercel Dashboard → Deployments**
1. Find last successful deployment
2. Click "Promote to Production"

**Or via Git:**
```bash
git revert HEAD
git push origin main
```

### Backend Rollback

**Railway Dashboard → Deployments**
1. Find last successful deployment
2. Click "Redeploy"

**Or via Git:**
```bash
git revert HEAD
git push origin main
```

### Emergency Rollback

```bash
# Put up maintenance page
# Disable cron jobs (rename workflow file)
# Notify users
# Investigate issue
# Fix and redeploy
```

---

## EMERGENCY CONTACTS

### Platform Support

| Service | Status Page | Support Email |
|---------|-------------|---------------|
| **Vercel** | https://www.vercel-status.com | support@vercel.com |
| **Railway** | https://status.railway.app | support@railway.app |
| **Supabase** | https://status.supabase.com | support@supabase.com |
| **Clerk** | https://status.clerk.com | support@clerk.com |
| **Sentry** | https://status.sentry.io | support@sentry.io |

### Documentation

- **Full Guide:** `/Users/macbook/Desktop/buildstock.pro/PRODUCTION_GO_LIVE_GUIDE.md`
- **Quick Start:** `/Users/macbook/Desktop/buildstock.pro/QUICK_START.md`
- **Checkpoint:** `/Users/macbook/Desktop/buildstock.pro/CHECKPOINT-SUMMARY.md`
- **Secrets:** `/Users/macbook/Desktop/buildstock.pro/PRODUCTION_SECREDS.txt`

---

## DASHBOARD LINKS

**Quick Access to Production Dashboards:**

- **Vercel:** https://vercel.com/dashboard
- **Railway:** https://railway.app/dashboard
- **Supabase:** https://supabase.com/dashboard/project/xrhlumtimbmglzrfrnnk
- **Clerk:** https://dashboard.clerk.com
- **Sentry:** https://sentry.io (if configured)
- **GitHub Actions:** https://github.com/mondo2003/Buildstockpro/actions

---

## DEPLOYMENT CHECKLIST

**Before Deployment:**
- [ ] All accounts created (Vercel, Railway, Clerk)
- [ ] Clerk API keys obtained
- [ ] Database password retrieved
- [ ] Secrets stored securely

**Backend Deployment:**
- [ ] Run `./deploy-railway.sh`
- [ ] Set environment variables
- [ ] Test `/health` endpoint
- [ ] Save backend URL

**Frontend Deployment:**
- [ ] Run `./deploy-vercel.sh`
- [ ] Set environment variables
- [ ] Test homepage loads
- [ ] Update backend CORS

**Post-Deployment:**
- [ ] Test authentication
- [ ] Test search functionality
- [ ] Test API calls
- [ ] Configure GitHub Actions
- [ ] Test cron job manually
- [ ] Monitor logs for 24 hours

---

## COST SUMMARY

**All on Free Tiers:** $0/month

| Service | Cost | Free Tier Limits |
|---------|------|------------------|
| Vercel | $0 | 100GB bandwidth |
| Railway | $0 | $5 credit/month |
| Supabase | $0 | 500MB DB, 1GB bandwidth |
| GitHub Actions | $0 | 2000 minutes/month |
| Clerk | $0 | 5,000 active users/month |

**Total:** $0/month

**Upgrade Path:** ~$40-60/month for production tiers

---

## KEY STATISTICS

**Database:**
- 16 tables
- 100 products
- 205 product listings
- 6 UK merchants
- 30 merchant branches

**Application:**
- Frontend: Next.js 14
- Backend: Bun + Elysia
- Database: PostgreSQL 17.6
- Authentication: Clerk
- Error Tracking: Sentry (optional)

**Performance:**
- API response time: 9-15ms
- Build time: ~2-3 minutes
- Uptime target: 99%+

---

## ONE-LINER COMMANDS

```bash
# Deploy everything
cd /Users/macbook/Desktop/buildstock.pro/Construction-RC/src/backend && ./deploy-railway.sh && \
cd ../frontend && ./deploy-vercel.sh

# Test deployment
curl https://your-backend.up.railway.app/health && \
curl -I https://your-frontend.vercel.app

# Generate new secret
openssl rand -base64 32

# View logs
railway logs --tail
vercel logs --follow

# Connect to database
psql "postgresql://postgres.xrhlumtimbmglzrfrnnk:[PASSWORD]@aws-0-eu-west-1.pooler.supabase.com:5432/postgres"
```

---

**Remember:** Deploy in order: Database → Backend → Frontend → Cron Jobs

**Questions?** See full guide: `/Users/macbook/Desktop/buildstock.pro/PRODUCTION_GO_LIVE_GUIDE.md`

---

**Document Version:** 1.0
**Last Updated:** 2026-01-30
**Status:** Ready for Production
