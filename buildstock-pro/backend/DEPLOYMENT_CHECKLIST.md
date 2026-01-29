# Render Deployment Checklist - BuildStock Pro Backend

## Pre-Deployment Checklist

### Files Created ✓
- [x] `/Users/macbook/Desktop/buildstock.pro/buildstock-pro/backend/render.yaml` - Render configuration
- [x] `/Users/macbook/Desktop/buildstock.pro/buildstock-pro/backend/.gitignore` - Git ignore rules
- [x] `/Users/macbook/Desktop/buildstock.pro/buildstock-pro/backend/.env.example` - Environment variable template
- [x] `/Users/macbook/Desktop/buildstock.pro/buildstock-pro/backend/DEPLOYMENT.md` - Deployment guide
- [x] `/Users/macbook/Desktop/buildstock.pro/buildstock-pro/backend/ENVIRONMENT_VARIABLES.md` - Environment variables reference

### Configuration Verified ✓
- [x] `package.json` has correct `start` script: `bun src/index.ts`
- [x] `package.json` has `dev` script for local development
- [x] Backend uses `process.env.PORT` for port configuration
- [x] Health check endpoint exists at `/health`
- [x] CORS configuration uses `CORS_ORIGIN` environment variable
- [x] Supabase client configured correctly
- [x] Sentry integration in place (optional but recommended)

### Local Testing ✓
- [x] Backend starts without errors: `bun run start`
- [x] Health endpoint responds: `http://localhost:3001/health`
- [x] Root endpoint responds: `http://localhost:3001/`
- [x] API info endpoint responds: `http://localhost:3001/api/v1`

## Deployment Steps

### 1. GitHub Repository
- [ ] Push backend code to GitHub repository
- [ ] Verify `render.yaml` is in the root of backend directory
- [ ] Confirm `.env` is NOT committed (check `.gitignore`)
- [ ] Confirm `node_modules/` is NOT committed (check `.gitignore`)

### 2. Render Account Setup
- [ ] Create Render account at https://render.com
- [ ] Verify email address
- [ ] (Optional) Add billing information for paid tier

### 3. Create Web Service
- [ ] Go to Render Dashboard
- [ ] Click "New +" → "Web Service"
- [ ] Connect GitHub repository
- [ ] Select repository
- [ ] Select branch (default: `main`)
- [ ] Set root directory to `backend` (if backend is in subdirectory)
- [ ] Verify Render detected `render.yaml`
- [ ] Review auto-filled settings:
  - Name: buildstock-pro-backend
  - Runtime: Node
  - Build Command: `bun install`
  - Start Command: `bun run start`

### 4. Configure Environment Variables
In Render Dashboard, add these environment variables:

#### Critical (Required)
- [ ] `NODE_ENV` = `production`
- [ ] `PORT` = `10000`
- [ ] `JWT_SECRET` = <generate new secret>
- [ ] `SYNC_API_KEY` = <generate new secret>
- [ ] `CORS_ORIGIN` = `https://buildstock.pro`

#### Supabase Configuration
Get from: https://supabase.com/dashboard → Your Project → Settings → API

- [ ] `SUPABASE_URL` = Your Supabase project URL
- [ ] `SUPABASE_ANON_KEY` = Your anon/public key
- [ ] `SUPABASE_SERVICE_ROLE_KEY` = Your service_role key

#### Database (Optional - if using Render PostgreSQL)
- [ ] `DATABASE_URL` = Auto-populated from Render database
- [ ] OR use Supabase connection string

#### Sentry (Recommended)
- [ ] `SENTRY_DSN` = Your Sentry DSN
- [ ] `SENTRY_ENVIRONMENT` = `production`

#### Optional - Merchant API Keys
- [ ] `SCREWFIX_API_KEY` (if available)
- [ ] `WICKES_API_KEY` (if available)
- [ ] `BANDQ_API_KEY` (if available)
- [ ] `JEWSON_API_KEY` (if available)

### 5. Deploy
- [ ] Click "Create Web Service" or "Update Existing Service"
- [ ] Watch build logs in Render Dashboard
- [ ] Wait for deployment to complete
- [ ] Note the deployed URL (e.g., `https://buildstock-pro-backend.onrender.com`)

### 6. Post-Deployment Verification
Test these endpoints with your deployed URL:

```bash
# Health Check
curl https://your-backend.onrender.com/health
# Expected: {"success":true,"status":"healthy","timestamp":"..."}

# Root Endpoint
curl https://your-backend.onrender.com/
# Expected: {"success":true,"message":"BuildStock Pro API","version":"0.1.0",...}

# API Info
curl https://your-backend.onrender.com/api/v1
# Expected: {"success":true,"message":"BuildStock Pro API v1",...}
```

- [ ] Health check returns 200 OK
- [ ] Root endpoint returns API info
- [ ] No errors in Render logs
- [ ] Background jobs started (check logs for "Starting merchant data sync service")

### 7. Frontend Integration
- [ ] Update frontend API URL to point to deployed backend
- [ ] Test frontend can connect to backend
- [ ] Verify CORS is working correctly
- [ ] Test authentication flow
- [ ] Test API endpoints from frontend

### 8. Monitoring Setup
- [ ] Enable Sentry error tracking (verify errors appear in Sentry)
- [ ] Set up Render alerts (CPU, memory, restarts)
- [ ] Configure log retention in Render
- [ ] Test error handling (trigger an intentional error)

### 9. Security Review
- [ ] JWT_SECRET is unique and strong (not default value)
- [ ] SYNC_API_KEY is unique and strong
- [ ] CORS_ORIGIN is set to production domain
- [ ] Supabase SERVICE_ROLE_KEY is only on backend (not frontend)
- [ ] No sensitive data in logs
- [ ] SSL is enabled (automatic on Render)

### 10. Performance Optimization
- [ ] Review Render plan (free vs paid)
- [ ] Check cold start times
- [ ] Monitor response times
- [ ] Review database query performance
- [ ] Consider enabling caching if needed

## Ongoing Maintenance

### Regular Tasks
- [ ] Monitor Render logs weekly
- [ ] Review Sentry errors weekly
- [ ] Check database usage in Supabase
- [ ] Update dependencies monthly
- [ ] Review API response times
- [ ] Check background job logs

### Security Tasks
- [ ] Rotate JWT_SECRET quarterly
- [ ] Rotate SYNC_API_KEY quarterly
- [ ] Review API access logs
- [ ] Update dependencies for security patches
- [ ] Audit Supabase RLS policies

## Troubleshooting Reference

### Common Issues

**Build Fails**
- Check `bun.lock` is committed
- Verify `package.json` is valid
- Review build logs in Render

**Service Won't Start**
- Check environment variables are set
- Verify `process.env.PORT` is used
- Review startup logs in Render

**Database Connection Errors**
- Verify DATABASE_URL is correct
- Check Supabase credentials
- Ensure database allows external connections

**CORS Errors**
- Verify CORS_ORIGIN is set correctly
- Check frontend URL matches CORS_ORIGIN
- Include both http and https if needed

**502/503 Errors**
- Check health endpoint: `/health`
- Review service logs for errors
- Verify service is running

### Useful Commands

```bash
# Test health endpoint
curl https://your-backend.onrender.com/health

# Check response time
time curl https://your-backend.onrender.com/health

# Test with verbose output
curl -v https://your-backend.onrender.com/api/v1

# Test sync endpoint (with API key)
curl -X POST https://your-backend.onrender.com/api/v1/sync/trigger \
  -H "X-API-Key: your-sync-api-key"
```

## Rollback Plan

If deployment fails:
1. Revert to previous commit in GitHub
2. Render will auto-deploy the reverted code
3. Or manually redeploy previous version in Render dashboard
4. Monitor logs for issues

## Success Criteria

Deployment is successful when:
- [ ] All health checks pass
- [ ] No errors in startup logs
- [ ] Frontend can connect to backend
- [ ] API endpoints respond correctly
- [ ] Background jobs are running
- [ ] Sentry is tracking errors (if enabled)
- [ ] Response times are acceptable (<500ms for most endpoints)

## Support Resources

- **Render Docs**: https://render.com/docs
- **Render Status**: https://status.render.com
- **Supabase Docs**: https://supabase.com/docs
- **Bun Docs**: https://bun.sh/docs
- **Elysia Docs**: https://elysiajs.com

## Next Steps After Deployment

1. **Set up custom domain** (optional)
2. **Configure CDN** (optional)
3. **Set up staging environment** (optional)
4. **Implement CI/CD pipeline** (optional)
5. **Add more comprehensive monitoring**
6. **Set up database backups**
7. **Document API endpoints** (if not done)
8. **Create runbook for common operations**
