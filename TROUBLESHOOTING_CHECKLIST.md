# Connection Troubleshooting Checklist

Use this checklist to diagnose and fix frontend-backend connection issues.

## Issue Diagnosis

| Symptom | Most Likely Cause | Quick Test | Solution |
|---------|------------------|------------|----------|
| **CORS error in browser** | `CORS_ORIGIN` not set correctly | `curl -X OPTIONS [backend-url]/api/v1 -H "Origin: [frontend-url]" -v` | Set `CORS_ORIGIN=https://buildstock.pro` in Railway → Redeploy |
| **Backend unreachable** | Backend not deployed or suspended | `curl [backend-url]/health` | Check Railway dashboard → Deployments tab → Ensure active |
| **API returns 404** | Wrong endpoint path or backend version mismatch | `curl [backend-url]/api/v1` | Verify endpoint paths in API documentation |
| **Timeout on first request** | Backend cold start (free tier) | `curl [backend-url]/health` (wait 30s) | Normal for free tier, subsequent requests will be faster |
| **Environment variable undefined** | Variable not set or wrong name | Check browser console: `console.log(process.env.NEXT_PUBLIC_API_URL)` | Ensure `NEXT_PUBLIC_` prefix in Vercel → Redeploy |
| **Authentication error** | Missing or invalid JWT/API key | Check if endpoint requires auth | Verify `JWT_SECRET` in Railway, add API key if needed |
| **Database connection error** | `DATABASE_URL` not set or invalid | Check Railway logs | Set `DATABASE_URL` in Railway variables |
| **SSL certificate error** | HTTPS not configured | `curl -I [backend-url]/health` | Ensure using HTTPS, not HTTP |

## Step-by-Step Diagnosis Flow

### Step 1: Is the Backend Running?

```bash
# Test backend health
curl https://buildstock-api.railway.app/health

# Expected response:
# {"success":true,"status":"healthy","timestamp":"..."}
```

**✓ If successful:** Backend is running → Go to Step 2
**✗ If failed:** Backend is down → Check Railway deployment status

---

### Step 2: Is CORS Configured?

```bash
# Test CORS preflight
curl -X OPTIONS https://buildstock-api.railway.app/api/v1 \
  -H "Origin: https://buildstock.pro" \
  -H "Access-Control-Request-Method: GET" \
  -v 2>&1 | grep -i "access-control-allow-origin"
```

**✓ If returns your origin:** CORS is working → Go to Step 3
**✗ If missing or wrong:** Update `CORS_ORIGIN` in Railway

---

### Step 3: Can Frontend Reach Backend?

Open browser console (F12) on https://buildstock.pro:

```javascript
fetch('https://buildstock-api.railway.app/health')
  .then(r => r.json())
  .then(console.log)
  .catch(console.error);
```

**✓ If returns data:** Connection working → Go to Step 4
**✗ If CORS error:** Go back to Step 2
**✗ If network error:** Check `NEXT_PUBLIC_API_URL` in Vercel

---

### Step 4: Are API Endpoints Working?

```bash
# Test search endpoint
curl "https://buildstock-api.railway.app/api/v1/search?q=concrete&limit=5"

# Expected response:
# {"success":true,"data":[...],"pagination":{...}}
```

**✓ If successful:** APIs working → Connection complete!
**✗ If failed:** Check Railway logs for errors

---

## Platform-Specific Checks

### Railway (Backend) Checks

| Check | Command/Action | Expected Result |
|-------|----------------|-----------------|
| Service status | Railway Dashboard → Deployments | Green checkmark (active) |
| Environment variables | Railway → Variables Tab | See required variables below |
| Logs | Railway → View Logs | No errors, should see "Elysia is running" |
| Domain | Railway → Settings → Domains | Shows your backend URL |
| Build status | Railway → Deployments | Latest deployment successful |

**Required Railway Variables:**
```
CORS_ORIGIN=https://buildstock.pro
SUPABASE_URL=https://xrhlumtimbmglzrfrnnk.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...
DATABASE_URL=postgresql://...
JWT_SECRET=strong-random-string
PORT=10000
NODE_ENV=production
```

---

### Vercel (Frontend) Checks

| Check | Command/Action | Expected Result |
|-------|----------------|-----------------|
| Deployment status | Vercel Dashboard → Deployments | Green checkmark (ready) |
| Environment variables | Vercel → Settings → Environment Variables | See required variables below |
| Build logs | Vercel → Deployments → View Logs | No build errors |
| Domain | Vercel → Settings → Domains | Shows buildstock.pro |
| Function logs | Vercel → Functions tab | No runtime errors |

**Required Vercel Variables:**
```
NEXT_PUBLIC_API_URL=https://buildstock-api.railway.app
NEXT_PUBLIC_SUPABASE_URL=https://xrhlumtimbmglzrfrnnk.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

---

## Quick Fixes by Issue Type

### CORS Issues

1. **Update CORS_ORIGIN in Railway**
   ```
   CORS_ORIGIN=https://buildstock.pro
   ```

2. **Redeploy backend**
   - Railway → Deployments → Click latest deployment → Redeploy

3. **Clear browser cache**
   - Chrome: Ctrl+Shift+Delete → Clear cached images and files
   - Mac: Cmd+Shift+Delete

---

### Environment Variable Issues

1. **Check variable names**
   - Must start with `NEXT_PUBLIC_` in Vercel
   - No `NEXT_PUBLIC_` prefix in Railway (except for Supabase URL)

2. **Redeploy after changes**
   - Vercel: Deployments → Redeploy
   - Railway: Variables auto-redeploy on save

3. **Verify variable scope**
   - Vercel: Select Production, Preview, and Development
   - Railway: Variables apply to all environments

---

### Network Issues

1. **Test DNS resolution**
   ```bash
   nslookup buildstock-api.railway.app
   ```

2. **Test SSL certificate**
   ```bash
   openssl s_client -connect buildstock-api.railway.app:443
   ```

3. **Check firewall/proxy**
   - Try from different network
   - Disable VPN temporarily
   - Check browser extensions

---

### Performance Issues

1. **Check response time**
   ```bash
   time curl https://buildstock-api.railway.app/health
   ```

2. **Monitor Railway resources**
   - Railway → Metrics tab
   - Check CPU/Memory usage

3. **Enable caching**
   - Consider using CDN for static assets
   - Implement response caching in backend

---

## Common Error Messages

### "Network request failed"

**Cause:** Backend URL incorrect or backend down
**Fix:**
1. Verify `NEXT_PUBLIC_API_URL` in Vercel
2. Check Railway deployment status
3. Test backend health endpoint

---

### "CORS policy: No 'Access-Control-Allow-Origin' header"

**Cause:** CORS not configured
**Fix:**
1. Set `CORS_ORIGIN` in Railway
2. Redeploy backend
3. Clear browser cache

---

### "Cannot read property of undefined"

**Cause:** API response structure changed
**Fix:**
1. Check API documentation
2. Verify backend version
3. Update frontend code to match response structure

---

### "404 Not Found"

**Cause:** Wrong endpoint path
**Fix:**
1. Check API endpoint list: `curl [backend-url]/api/v1`
2. Verify path in frontend code
3. Ensure no typos in URL

---

### "500 Internal Server Error"

**Cause:** Backend error (database, logic, etc.)
**Fix:**
1. Check Railway logs for stack trace
2. Verify database connection
3. Test endpoint in isolation

---

## Prevention Tips

1. **Use environment-specific configs**
   - Development: `localhost:3001`
   - Production: Railway URL

2. **Implement health checks**
   - Test `/health` endpoint regularly
   - Set up uptime monitoring

3. **Monitor logs**
   - Check Railway logs daily
   - Set up Sentry for error tracking

4. **Version your APIs**
   - Use `/api/v1/` prefix
   - Document breaking changes

5. **Test changes locally first**
   - Run backend locally: `bun run dev`
   - Test with local frontend
   - Deploy to production after verification

---

## Diagnostic Commands Reference

```bash
# Backend health
curl https://buildstock-api.railway.app/health

# API info
curl https://buildstock-api.railway.app/api/v1

# CORS test
curl -X OPTIONS https://buildstock-api.railway.app/api/v1 \
  -H "Origin: https://buildstock.pro" \
  -H "Access-Control-Request-Method: GET" \
  -v

# Search test
curl "https://buildstock-api.railway.app/api/v1/search?q=test&limit=5"

# DNS check
nslookup buildstock-api.railway.app

# SSL check
openssl s_client -connect buildstock-api.railway.app:443

# Response time
time curl https://buildstock-api.railway.app/health

# Headers check
curl -I https://buildstock-api.railway.app/health

# Run full test suite
./test-connection.sh
```

---

## Escalation Path

1. **First:** Run `./test-connection.sh`
2. **Then:** Check relevant section above
3. **If still failing:** Check platform logs (Railway/Vercel)
4. **Finally:** Consult full guide: `CONNECT_FRONTEND_BACKEND.md`

---

**Last Updated:** 2026-01-30
**Version:** 1.0.0
