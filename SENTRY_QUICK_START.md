# Sentry Quick Start - BuildStock Pro

## Setup Checklist

### 1. Create Sentry Account (5 minutes)
- Go to https://sentry.io
- Sign up for free account
- Create organization: `BuildStock`

### 2. Create Two Projects
- **Frontend:** Next.js project → `buildstock-frontend`
- **Backend:** Bun/Node.js project → `buildstock-backend`

### 3. Get Your DSNs
- Frontend DSN: Settings → Projects → buildstock-frontend → Client Keys (DSN)
- Backend DSN: Settings → Projects → buildstock-backend → Client Keys (DSN)

Format: `https://examplePublicKey@o0.ingest.sentry.io/0`

### 4. Update Environment Variables

#### Frontend (Vercel)
```bash
NEXT_PUBLIC_SENTRY_DSN=https://your-dsn@sentry.io/project-id
NEXT_PUBLIC_SENTRY_ENVIRONMENT=production
```

Add in: Vercel Dashboard → Settings → Environment Variables

#### Backend (Render)
```bash
SENTRY_DSN=https://your-dsn@sentry.io/project-id
SENTRY_ENVIRONMENT=production
```

Add in: Render Dashboard → Services → BuildStock Pro Backend → Environment

### 5. Deploy
```bash
# Frontend
cd buildstock-pro/frontend
vercel --prod

# Backend (automatically deploys on git push)
git push origin main
```

### 6. Test
```bash
# Test backend
curl https://buildstock-api.onrender.com/api/v1/test/sentry

# Check Sentry dashboard for errors
```

## What's Been Configured

### Frontend
- ✅ `@sentry/nextjs` installed
- ✅ `sentry.client.config.ts` - Client-side tracking
- ✅ `sentry.server.config.ts` - Server-side tracking
- ✅ `sentry.edge.config.ts` - Edge runtime tracking
- ✅ `next.config.ts` - Webpack configuration
- ✅ `.env.production` - Environment variables placeholder

### Backend
- ✅ `@sentry/bun` installed
- ✅ `src/index.ts` - Sentry initialization
- ✅ Error capture from all routes
- ✅ Sensitive data filtering
- ✅ Test endpoint: `/api/v1/test/sentry`

### Configuration Features
- Automatic error tracking
- Performance monitoring (10% sample rate in production)
- Sensitive data filtering (headers, tokens, emails)
- Session replay (frontend)
- Custom error filtering

## Testing Sentry

### Backend Test
```bash
curl https://buildstock-api.onrender.com/api/v1/test/sentry
```

### Frontend Test
Open browser console on production site:
```javascript
throw new Error("Test Sentry - Production");
```

## Recommended Alerts

### Critical (Immediate)
- High-volume errors (>50 in 5 min)
- Auth failures spike
- Database connection errors

### Warning (Hourly)
- New issues in production
- Performance degradation (>3s response time)

## Next Steps

1. Create Sentry account
2. Get DSNs for both projects
3. Add DSNs to deployment platforms (Vercel & Render)
4. Deploy applications
5. Test with test endpoints
6. Verify errors appear in Sentry dashboard
7. Configure alert rules

## Troubleshooting

**No errors appearing?**
- Check DSN is correct (no typos)
- Verify environment variables are set in deployment platform
- Redeploy after adding variables
- Check browser console for Sentry errors

**Too many errors?**
- Reduce `tracesSampleRate` to 0.01 (1%)
- Add more ignore patterns
- Set up inbound filters in Sentry dashboard

**Need help?**
- Full guide: `SENTRY_PRODUCTION_GUIDE.md`
- Sentry docs: https://docs.sentry.io/
- Original setup: `SENTRY_SETUP.md`

## Files Created/Modified

### Frontend
- `/buildstock-pro/frontend/sentry.client.config.ts` (NEW)
- `/buildstock-pro/frontend/sentry.server.config.ts` (NEW)
- `/buildstock-pro/frontend/sentry.edge.config.ts` (NEW)
- `/buildstock-pro/frontend/next.config.ts` (MODIFIED)
- `/buildstock-pro/frontend/.env.production` (MODIFIED)

### Backend
- `/buildstock-pro/backend/.env.production.example` (NEW)
- `/buildstock-pro/backend/src/index.ts` (ALREADY CONFIGURED)

### Documentation
- `/SENTRY_PRODUCTION_GUIDE.md` (NEW)
- `/SENTRY_QUICK_START.md` (NEW - THIS FILE)
