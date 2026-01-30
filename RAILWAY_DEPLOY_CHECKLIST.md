# Railway Backend Deployment Checklist for BuildStock Pro

## Overview
This checklist provides step-by-step instructions for deploying the BuildStock Pro backend to Railway.

**Status:** Ready for Deployment
**Last Updated:** 2026-01-30
**Backend Path:** `/Users/macbook/Desktop/buildstock.pro/Construction-RC/src/backend`

---

## 1. Pre-Deployment Verification

### 1.1 File Status Checks
- [x] **Dockerfile** - Exists and configured correctly
  - Location: `/Users/macbook/Desktop/buildstock.pro/Construction-RC/src/backend/Dockerfile`
  - Uses official Bun image (oven/bun:1)
  - Multi-stage build for optimized production image
  - Exposes port 3001
  - Health check configured

- [x] **railway.json** - Exists and configured
  - Location: `/Users/macbook/Desktop/buildstock.pro/Construction-RC/src/backend/railway.json`
  - Dockerfile build configuration set
  - Health check path: `/health`
  - Restart policy: ON_FAILURE

- [x] **package.json** - Scripts verified
  - `start`: "bun run src/index.ts"
  - `build`: "bun build src/index.ts --outdir ./dist"
  - All dependencies are production-ready

- [x] **.dockerignore** - Configured correctly
  - Excludes: node_modules, dist, tests, .env files
  - Optimizes build context size

- [x] **Backend Source** - index.ts exists and is valid
  - Location: `/Users/macbook/Desktop/buildstock.pro/Construction-RC/src/backend/src/index.ts`
  - Elysia.js framework setup
  - Sentry integration ready
  - All routes imported correctly

### 1.2 Docker Build Test
- [ ] **Local Docker Build** (Optional but Recommended)
  ```bash
  cd /Users/macbook/Desktop/buildstock.pro/Construction-RC/src/backend
  docker build -t buildstock-backend-test .
  docker run -p 3001:3001 -e DATABASE_URL=your_test_db -e JWT_SECRET=test buildstock-backend-test
  ```
  - Expected: Build completes successfully
  - Expected: Container starts without errors
  - Expected: Health check passes

---

## 2. Railway Account Setup

### 2.1 Create Railway Account
- [ ] Sign up at https://railway.app/
- [ ] Verify email address
- [ ] Add payment method (required for PostgreSQL and Redis add-ons)
  - Free tier: $5 free credit/month
  - Estimated cost: ~$5-10/month for production

### 2.2 Install Railway CLI (Optional)
```bash
# macOS
brew install railway

# Or using npm
npm install -g @railway/cli

# Login
railway login
```

---

## 3. Create Railway Project

### 3.1 Using Railway Dashboard (Recommended)
1. [ ] Go to https://railway.app/
2. [ ] Click "New Project"
3. [ ] Select "Deploy from Dockerfile"
4. [ ] Connect GitHub repository
   - Repository: `mondo2003/Buildstockpro` (or your fork)
   - Branch: `main`
   - Root directory: `Construction-RC/src/backend`
   - Dockerfile path: `Dockerfile`

### 3.2 Using Railway CLI
```bash
# Initialize project
cd /Users/macbook/Desktop/buildstock.pro/Construction-RC/src/backend
railway init

# Set Dockerfile as build source
railway add --service backend
```

---

## 4. Add Required Services

### 4.1 PostgreSQL Database
1. [ ] In Railway project, click "New Service"
2. [ ] Select "Database" → "PostgreSQL"
3. [ ] Choose region (closest to your users)
4. [ ] Wait for database to provision
5. [ ] Copy DATABASE_URL from service variables

### 4.2 Redis Cache
1. [ ] In Railway project, click "New Service"
2. [ ] Select "Database" → "Redis"
3. [ ] Choose region (same as PostgreSQL)
4. [ ] Wait for Redis to provision
5. [ ] Copy REDIS_URL from service variables

---

## 5. Configure Environment Variables

### 5.1 Required Variables

Add these in Railway Dashboard → Settings → Variables:

#### Database & Cache
- [ ] **DATABASE_URL** (Auto-added by Railway)
  - Format: `postgresql://postgres:password@host:5432/railway`
  - Railway adds this automatically when you add PostgreSQL

- [ ] **REDIS_URL** (Auto-added by Railway)
  - Format: `redis://default:password@host:6379`
  - Railway adds this automatically when you add Redis

#### Authentication
- [ ] **JWT_SECRET**
  - Value: `O5hyG6Sb+dFGMbgr1rGlbLWjB79kXcKX5xlFUnsthfY=`
  - Location: Found in `/Users/macbook/Desktop/buildstock.pro/buildstock-pro/PRODUCTION_SECRETS.txt`
  - **IMPORTANT**: Keep this secret and never expose it

- [ ] **SYNC_API_KEY**
  - Value: `OAxy9Sb+CbNOAgZfpPFMWRSlUTbSiocuRyQp4slo6eU=`
  - Location: Found in `/Users/macbook/Desktop/buildstock.pro/buildstock-pro/PRODUCTION_SECRETS.txt`
  - Used for cron job authentication

#### Server Configuration
- [ ] **PORT**
  - Value: `3001`
  - Railway typically sets PORT automatically

- [ ] **NODE_ENV**
  - Value: `production`

- [ ] **HOST**
  - Value: `0.0.0.0` (required for Railway)

#### CORS Configuration
- [ ] **CORS_ORIGIN**
  - Value: Your Vercel frontend URL
  - Example: `https://buildstock-pro.vercel.app`
  - **IMPORTANT**: Must match your deployed frontend exactly

#### Rate Limiting
- [ ] **RATE_LIMIT_TTL**
  - Value: `60` (seconds)

- [ ] **RATE_LIMIT_MAX**
  - Value: `100` (requests per window)

#### Sentry Error Tracking (Optional)
- [ ] **SENTRY_DSN**
  - Get from: https://sentry.io/settings/projects/
  - Format: `https://examplePublicKey@o0.ingest.sentry.io/0`

- [ ] **SENTRY_ENVIRONMENT**
  - Value: `production`

### 5.2 Reference Variables (Don't set these)
These are automatically provided by Railway:
- RAILWAY_ENVIRONMENT
- RAILWAY_PROJECT_NAME
- RAILWAY_SERVICE_NAME
- RAILWAY_VOLUME_ID
- RAILWAY_REF_DOMAIN
- PORT (Railway assigns automatically)

---

## 6. Database Setup

### 6.1 Run Database Migrations
After deployment, you need to initialize the database schema:

**Option 1: Railway Console**
1. [ ] Go to PostgreSQL service in Railway
2. [ ] Click "Console" tab
3. [ ] Connect to database
4. [ ] Run migration commands (see 6.3)

**Option 2: Remote Connection**
```bash
# Get database connection string from Railway
# Add ?sslmode=require to the DATABASE_URL

# Run migrations from local machine
cd /Users/macbook/Desktop/buildstock.pro/Construction-RC/src/database
DATABASE_URL="your_railway_db_url" bun run drizzle-kit push:pg

# Or use migrate
DATABASE_URL="your_railway_db_url" bun run drizzle-kit migrate
```

### 6.2 Seed Initial Data (Optional)
```bash
# Seed products with images
DATABASE_URL="your_railway_db_url" bun run seed:images
```

### 6.3 Verify Database
```sql
-- Run in Railway console to check tables
\dt

-- Should show tables like:
-- products, product_images, merchants, popular_searches, etc.
```

---

## 7. Deploy the Backend

### 7.1 Automatic Deployment (GitHub Connected)
- [ ] Push changes to GitHub main branch
- [ ] Railway automatically detects changes and builds
- [ ] Monitor build logs in Railway dashboard
- [ ] Wait for deployment to complete (usually 2-5 minutes)

### 7.2 Manual Deployment (CLI)
```bash
# Deploy current directory
railway up

# Or deploy specific service
railway up --service backend
```

### 7.3 Verify Deployment
1. [ ] Check deployment logs in Railway dashboard
2. [ ] Look for: "Build successful" or "Deployment active"
3. [ ] Note the generated Railway URL
   - Format: `https://your-backend-name.railway.app`
4. [ ] Test health endpoint:
   ```bash
   curl https://your-backend-name.railway.app/health
   ```

---

## 8. Post-Deployment Verification

### 8.1 Health Check
- [ ] Test health endpoint: `GET /health`
  ```bash
  curl https://your-backend-name.railway.app/health
  ```
  Expected response: `{"status":"ok","timestamp":"..."}`

### 8.2 API Endpoints Test
- [ ] Test products endpoint: `GET /api/products`
  ```bash
  curl https://your-backend-name.railway.app/api/products?limit=10
  ```

- [ ] Test search endpoint: `GET /api/search`
  ```bash
  curl https://your-backend-name.railway.app/api/search?q=lumber
  ```

### 8.3 Database Connection
- [ ] Check Railway logs for database connection errors
- [ ] Verify queries are working in logs
- [ ] Test endpoint that queries database

### 8.4 Redis Connection
- [ ] Check Railway logs for Redis connection errors
- [ ] Verify cache is working (check logs for cache hits)

### 8.5 CORS Verification
- [ ] Test that frontend can call backend
  ```bash
  curl -H "Origin: https://your-frontend.vercel.app" \
       https://your-backend-name.railway.app/api/products
  ```
- [ ] Check response headers include correct CORS headers

---

## 9. Connect Frontend to Backend

### 9.1 Update Frontend Environment Variables
In Vercel dashboard for your frontend:

- [ ] **NEXT_PUBLIC_API_URL**
  - Value: `https://your-backend-name.railway.app`

- [ ] **NEXT_PUBLIC_API_WS_URL**
  - Value: `wss://your-backend-name.railway.app`

- [ ] **NEXT_PUBLIC_AUTH_COOKIE_NAME**
  - Value: `buildstock_token`

### 9.2 Redeploy Frontend
- [ ] Trigger Vercel deployment after updating environment variables
- [ ] Or push a small change to trigger auto-deploy

### 9.3 Test Integration
- [ ] Open frontend in browser
- [ ] Test product search
- [ ] Test product details
- [ ] Test user authentication
- [ ] Check browser console for CORS errors
- [ ] Check Network tab for API calls

---

## 10. Setup Cron Jobs (Optional)

Railway supports cron jobs for periodic tasks.

### 10.1 Create Cron Job for Merchant Sync
1. [ ] In Railway, create new service
2. [ ] Select "Cron Job"
3. [ ] Set schedule: `0 */6 * * *` (every 6 hours)
4. [ ] Set command:
  ```bash
  curl -H "X-API-Key: ${SYNC_API_KEY}" \
       https://your-backend-name.railway.app/api/sync/merchants
  ```
5. [ ] Add environment variables:
  - SYNC_API_KEY: `OAxy9Sb+CbNOAgZfpPFMWRSlUTbSiocuRyQp4slo6eU=`

### 10.2 Verify Cron Jobs
- [ ] Check cron job execution logs
- [ ] Verify merchants are being synced
- [ ] Monitor database for new/updated products

---

## 11. Monitor & Maintenance

### 11.1 Enable Railway Monitoring
- [ ] Check Metrics tab in Railway dashboard
- [ ] Monitor CPU, memory, and disk usage
- [ ] Set up alerts for high resource usage

### 11.2 View Logs
- [ ] Go to "Deployments" tab
- [ ] Click on active deployment
- [ ] View real-time logs
- [ ] Search logs for errors: `ERROR`, `FAIL`, `Exception`

### 11.3 Database Backups
- [ ] Enable automatic backups in PostgreSQL settings
- [ ] Set backup retention period (recommended: 7-30 days)
- [ ] Test backup restoration process

### 11.4 Update Deployment
- [ ] Merge changes to main branch
- [ ] Railway auto-deploys
- [ ] Monitor deployment logs
- [ ] Test critical features after deployment

---

## 12. Troubleshooting

### 12.1 Build Failures

**Issue: Docker build fails**
- Check Dockerfile syntax
- Verify package.json dependencies
- Check build logs in Railway dashboard
- Ensure bun.lockb is committed to git

**Issue: "Cannot find module" errors**
- Verify all dependencies in package.json
- Check if dependencies are production-ready (not devDependencies)
- Ensure build step creates dist/ directory

### 12.2 Runtime Errors

**Issue: Database connection refused**
- Verify DATABASE_URL environment variable
- Check PostgreSQL service is running
- Ensure database has migrated tables
- Check for SSL/TLS issues (add ?sslmode=require)

**Issue: Redis connection errors**
- Verify REDIS_URL environment variable
- Check Redis service is running
- Ensure Redis is accessible from backend

**Issue: JWT verification fails**
- Verify JWT_SECRET is set correctly
- Check JWT_SECRET matches between services
- Ensure token format is correct

**Issue: CORS errors**
- Verify CORS_ORIGIN matches frontend URL exactly
- Check for trailing slashes or protocol mismatches
- Example errors:
  - `http://` vs `https://`
  - `vercel.app` vs `www.vercel.app`
  - Missing port numbers

### 12.3 Health Check Failures

**Issue: Health check returns 503**
- Check service logs for startup errors
- Verify PORT is correctly set
- Ensure database and Redis are reachable
- Check for missing environment variables

**Issue: Health check timeout**
- Service may be taking too long to start
- Increase healthcheckTimeout in railway.json
- Check for blocking operations in startup code

### 12.4 Performance Issues

**Issue: Slow API responses**
- Check database query performance
- Enable Redis caching
- Add database indexes
- Scale up Railway service resources

**Issue: High memory usage**
- Check for memory leaks
- Monitor database connection pool size
- Adjust Bun runtime memory limits
- Consider upgrading Railway plan

### 12.5 Get Help

**Railway Documentation**
- https://docs.railway.app/

**Railway Discord Community**
- https://discord.gg/railway

**BuildStock Pro Documentation**
- `/Users/macbook/Desktop/buildstock.pro/Construction-RC/src/backend/RAILWAY_DEPLOYMENT.md`
- `/Users/macbook/Desktop/buildstock.pro/Construction-RC/src/backend/QUICK_START.md`

---

## 13. Security Checklist

### 13.1 Secrets Management
- [ ] Never commit secrets to git
- [ ] Rotate JWT_SECRET periodically (recommended: every 90 days)
- [ ] Rotate SYNC_API_KEY periodically
- [ ] Use Railway's encrypted variables for secrets
- [ ] Limit access to Railway dashboard

### 13.2 Access Control
- [ ] Enable Railway 2FA
- [ ] Restrict GitHub repository access
- [ ] Use branch protection rules
- [ ] Review access logs regularly

### 13.3 API Security
- [ ] Verify CORS_ORIGIN is set correctly
- [ ] Enable rate limiting (RATE_LIMIT_MAX)
- [ ] Use HTTPS only (Railway provides this)
- [ ] Implement request validation
- [ ] Sanitize database queries

### 13.4 Database Security
- [ ] Enable SSL for database connections
- [ ] Use strong database passwords
- [ ] Limit database user permissions
- [ ] Enable database query logging
- [ ] Regular security updates

---

## 14. Production Readiness Checklist

### 14.1 Before Going Live
- [ ] All tests passing locally
- [ ] Database migrations tested
- [ ] Environment variables verified
- [ ] Health checks working
- [ ] Error tracking enabled (Sentry)
- [ ] Logging configured
- [ ] CORS configured correctly
- [ ] Rate limiting enabled
- [ ] Database backups enabled
- [ ] Monitoring configured

### 14.2 Performance Optimization
- [ ] Response time < 500ms (p95)
- [ ] Database queries optimized
- [ ] Redis caching enabled
- [ ] CDN configured (if applicable)
- [ ] Image optimization enabled
- [ ] Gzip compression enabled

### 14.3 High Availability
- [ ] Health checks configured
- [ ] Automatic restarts enabled (ON_FAILURE)
- [ ] Database replication (optional)
- [ ] CDN for static assets (optional)
- [ ] Load balancing (Railway provides)

---

## 15. Cost Estimate

### Railway Pricing (as of 2026-01-30)

**Free Tier (per month)**
- $5 free credit
- 512 MB RAM
- 0.5 vCPU
- 1 GB storage

**Estimated Production Costs**
- Backend Service: ~$5-10/month
- PostgreSQL: ~$5-10/month
- Redis: ~$5-10/month
- **Total: ~$15-30/month**

**Scaling Costs**
- Higher CPU/RAM: +$5-20/month
- Additional storage: +$0.50/GB/month
- More replicas: +$5-10/replica/month

---

## 16. Next Steps After Deployment

### 16.1 Immediate
1. [ ] Test all critical API endpoints
2. [ ] Verify frontend-backend connection
3. [ ] Check error monitoring (Sentry)
4. [ ] Test authentication flow
5. [ ] Verify database operations

### 16.7 Short-term (First Week)
1. [ ] Monitor error rates
2. [ ] Review performance metrics
3. [ ] Test cron jobs
4. [ ] Backup database manually (verify backups work)
5. [ ] Load testing (optional)

### 16.3 Long-term (First Month)
1. [ ] Optimize slow queries
2. [ ] Review and adjust resource limits
3. [ ] Set up additional monitoring
4. [ ] Document any custom configurations
5. [ ] Plan scaling strategy

---

## 17. Rollback Plan

If critical issues arise after deployment:

### 17.1 Rollback Steps
1. [ ] Identify problematic commit
2. [ ] Revert commit in git
3. [ ] Push revert to main branch
4. [ ] Railway auto-deploys reverted version
5. [ ] Monitor rollback logs
6. [ ] Verify service is working

### 17.2 Emergency Rollback
```bash
# Using Railway CLI
railway versions
railway rollback <deployment-id>

# Or via dashboard:
# 1. Go to Deployments tab
# 2. Find previous successful deployment
# 3. Click "Redeploy"
```

---

## 18. Additional Resources

### Documentation
- Railway Docs: https://docs.railway.app/
- Bun Docs: https://bun.sh/docs
- Elysia Docs: https://elysiajs.com/
- Drizzle ORM: https://orm.drizzle.team/

### BuildStock Pro Files
- Backend Deployment: `/Users/macbook/Desktop/buildstock.pro/Construction-RC/src/backend/RAILWAY_DEPLOYMENT.md`
- Quick Start: `/Users/macbook/Desktop/buildstock.pro/Construction-RC/src/backend/QUICK_START.md`
- Cron Jobs: `/Users/macbook/Desktop/buildstock.pro/Construction-RC/src/backend/RAILWAY_CRON.md`
- Deployment Summary: `/Users/macbook/Desktop/buildstock.pro/Construction-RC/src/backend/DEPLOYMENT_SUMMARY.md`
- Render Deployment: `/Users/macbook/Desktop/buildstock.pro/Construction-RC/src/backend/RENDER_DEPLOYMENT.md`

### Environment Reference
- `.env.example`: `/Users/macbook/Desktop/buildstock.pro/Construction-RC/.env.example`
- Secrets: `/Users/macbook/Desktop/buildstock.pro/buildstock-pro/PRODUCTION_SECRETS.txt`

---

## Summary

**Deployment Status:** READY

**Verified Components:**
- Dockerfile configuration
- Railway configuration
- Package.json scripts
- Environment variables template
- JWT_SECRET and SYNC_API_KEY generated

**Ready to Deploy:** Yes

**Estimated Time to Deploy:** 30-45 minutes
- Account setup: 5-10 minutes
- Project creation: 5 minutes
- Database/Redis setup: 5-10 minutes
- Environment configuration: 5 minutes
- Deployment: 5-10 minutes
- Verification: 10 minutes

**Post-Deployment Monitoring Required:**
- Health checks
- Error logs
- Performance metrics
- Database connections

---

## Contact & Support

If you encounter issues:
1. Check Railway logs first
2. Review this checklist
3. Consult Railway documentation
4. Check BuildStock Pro documentation files
5. Open GitHub issue for bugs

---

**Last Updated:** 2026-01-30
**Version:** 1.0
**Maintained By:** BuildStock Pro Team
