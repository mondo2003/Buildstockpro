# Frontend-Backend Connection - Quick Start Guide

This is a condensed version of the full connection guide for quick reference.

## Essential Steps (5-Minute Setup)

### 1. Get Backend URL (Railway)
```
Railway Dashboard → Your Project → Networking Tab
Copy: https://buildstock-api.railway.app
```

### 2. Set CORS Origin (Railway)
```
Railway → Variables Tab
Add: CORS_ORIGIN=https://buildstock.pro
Save → Auto-redeploys
```

### 3. Set API URL (Vercel)
```
Vercel → Settings → Environment Variables
Add: NEXT_PUBLIC_API_URL=https://buildstock-api.railway.app
Save → Redeploy
```

### 4. Test Connection
```bash
# Run the test script
./test-connection.sh

# Or test manually
curl https://buildstock-api.railway.app/health
curl "https://buildstock-api.railway.app/api/v1/search?q=concrete"
```

## Environment Variables Checklist

### Railway (Backend)
- [ ] `CORS_ORIGIN=https://buildstock.pro`
- [ ] `SUPABASE_URL=...`
- [ ] `SUPABASE_SERVICE_ROLE_KEY=...`
- [ ] `DATABASE_URL=...`
- [ ] `JWT_SECRET=...`
- [ ] `PORT=10000`

### Vercel (Frontend)
- [ ] `NEXT_PUBLIC_API_URL=https://buildstock-api.railway.app`
- [ ] `NEXT_PUBLIC_SUPABASE_URL=...`
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY=...`
- [ ] `NEXT_PUBLIC_SENTRY_DSN=...` (optional)

## Common Issues & Quick Fixes

### CORS Error
```
Error: blocked by CORS policy
```
**Fix:** Set `CORS_ORIGIN=https://buildstock.pro` in Railway

### API Not Found
```
Error: 404 Not Found
```
**Fix:** Check NEXT_PUBLIC_API_URL in Vercel, ensure no trailing slash

### Timeout
```
Error: ERR_CONNECTION_TIMED_OUT
```
**Fix:** Backend may be sleeping (Railway free tier), wait 30s and retry

### Environment Variables Not Loading
```
process.env.NEXT_PUBLIC_API_URL is undefined
```
**Fix:** Redeploy in Vercel → Deployments → Redeploy

## Verification Commands

```bash
# Test backend health
curl https://buildstock-api.railway.app/health

# Test CORS
curl -X OPTIONS https://buildstock-api.railway.app/api/v1 \
  -H "Origin: https://buildstock.pro" \
  -H "Access-Control-Request-Method: GET" \
  -v

# Test search endpoint
curl "https://buildstock-api.railway.app/api/v1/search?q=concrete&limit=5"

# Test from browser console
fetch('https://buildstock-api.railway.app/health')
  .then(r => r.json())
  .then(console.log)
```

## Architecture Diagram

```
User → Vercel (Frontend) → Railway (Backend) → Supabase (DB)
       buildstock.pro    buildstock-api      xrhlumtimbmglzrfrnnk
                          .railway.app        .supabase.co
```

## Support

- Full guide: `CONNECT_FRONTEND_BACKEND.md`
- Test script: `./test-connection.sh`
- Railway docs: https://docs.railway.app
- Vercel docs: https://vercel.com/docs
