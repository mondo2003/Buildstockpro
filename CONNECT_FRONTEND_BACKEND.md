# BuildStock Pro - Frontend-Backend Connection Guide

This guide provides step-by-step instructions for connecting your Next.js frontend (deployed on Vercel) with your Bun/Elysia backend (deployed on Railway).

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Prerequisites](#prerequisites)
3. [Step-by-Step Configuration](#step-by-step-configuration)
4. [Verification Steps](#verification-steps)
5. [Troubleshooting](#troubleshooting)
6. [Visual Diagrams](#visual-diagrams)

---

## Architecture Overview

```
┌─────────────────┐         ┌─────────────────┐         ┌─────────────────┐
│                 │         │                 │         │                 │
│  Next.js        │────────▶│  Elysia API     │────────▶│   Supabase      │
│  (Vercel)       │         │  (Railway)      │         │   Database      │
│                 │         │                 │         │                 │
│  Frontend       │◀────────│  Backend        │◀────────│   PostgreSQL    │
│  Browser        │         │  Server         │         │                 │
│                 │         │                 │         │                 │
└─────────────────┘         └─────────────────┘         └─────────────────┘
     https://                https://                    https://
 buildstock.pro        buildstock-api            xrhlumtimbmglzrfrnnk
                       .railway.app              .supabase.co

Environment Variables:
- NEXT_PUBLIC_API_URL  - CORS_ORIGIN
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
```

---

## Prerequisites

Before starting, ensure you have:

- [ ] Backend deployed on Railway
- [ ] Frontend deployed on Vercel
- [ ] Supabase project configured
- [ ] Access to Railway dashboard
- [ ] Access to Vercel dashboard
- [ ] Terminal access with curl installed

---

## Step-by-Step Configuration

### Step 1: Get Backend URL from Railway

1. **Log in to Railway**
   - Go to https://railway.app/
   - Sign in to your account

2. **Navigate to Your Project**
   - Select your BuildStock Pro backend project
   - Click on the backend service

3. **Get the Backend URL**
   - Look for the "Networking" or "Domains" section
   - Copy the generated URL (e.g., `https://buildstock-api.railway.app`)
   - Or access via: Settings → Domains

   **Example URL:**
   ```
   https://buildstock-api.railway.app
   ```

4. **Test Backend Health**
   ```bash
   curl https://buildstock-api.railway.app/health
   ```

   Expected response:
   ```json
   {
     "success": true,
     "status": "healthy",
     "timestamp": "2026-01-30T12:00:00.000Z"
   }
   ```

---

### Step 2: Update CORS_ORIGIN in Railway

The `CORS_ORIGIN` environment variable tells the backend which frontend domains are allowed to make requests.

1. **Open Railway Project**
   - Go to your backend service in Railway

2. **Access Environment Variables**
   - Click on the "Variables" tab
   - Or go to Settings → Variables

3. **Add/Update CORS_ORIGIN**
   - Find or create the `CORS_ORIGIN` variable
   - Set it to your Vercel frontend URL

   **Production:**
   ```
   CORS_ORIGIN=https://buildstock.pro
   ```

   **Development (if needed):**
   ```
   CORS_ORIGIN=http://localhost:3000,https://buildstock.pro
   ```

4. **Multiple Origins (if needed)**
   ```
   CORS_ORIGIN=https://buildstock.pro,https://www.buildstock.pro
   ```

5. **Save and Redeploy**
   - Railway will automatically redeploy when variables change
   - Wait for the deployment to complete (check the "Deployments" tab)

---

### Step 3: Set NEXT_PUBLIC_API_URL in Vercel

The `NEXT_PUBLIC_API_URL` environment variable tells the frontend where to find the backend API.

1. **Log in to Vercel**
   - Go to https://vercel.com/
   - Sign in to your account

2. **Navigate to Your Project**
   - Select your BuildStock Pro frontend project

3. **Access Environment Variables**
   - Go to Settings → Environment Variables

4. **Add NEXT_PUBLIC_API_URL**
   - Click "Add New"
   - Name: `NEXT_PUBLIC_API_URL`
   - Value: Your Railway backend URL from Step 1
   - Environment: Select "Production", "Preview", and "Development"

   **Example:**
   ```
   NEXT_PUBLIC_API_URL=https://buildstock-api.railway.app
   ```

5. **Add Supabase Variables (if not already set)**
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://xrhlumtimbmglzrfrnnk.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
   ```

6. **Save and Redeploy**
   - Click "Save"
   - Go to the "Deployments" tab
   - Click the three dots on the latest production deployment
   - Select "Redeploy"

---

### Step 4: Configure Local Development (Optional)

For local development, create or update `.env.local` in your frontend:

```env
# Local Development
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_SUPABASE_URL=https://xrhlumtimbmglzrfrnnk.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

For local backend development, create or update `.env` in your backend:

```env
# Local Development
PORT=3001
CORS_ORIGIN=http://localhost:3000
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
DATABASE_URL=your_database_url
JWT_SECRET=dev-secret-key
NODE_ENV=development
```

---

## Verification Steps

### 1. Test Backend Health Endpoint

```bash
curl https://buildstock-api.railway.app/health
```

**Expected Response:**
```json
{
  "success": true,
  "status": "healthy",
  "timestamp": "2026-01-30T12:00:00.000Z"
}
```

---

### 2. Test Backend API Info

```bash
curl https://buildstock-api.railway.app/api/v1
```

**Expected Response:**
```json
{
  "success": true,
  "message": "BuildStock Pro API v1",
  "endpoints": {
    "auth": "/api/v1/auth",
    "users": "/api/v1/users",
    "merchants": "/api/v1/merchants",
    "products": "/api/products",
    "search": "/api/v1/search",
    ...
  }
}
```

---

### 3. Test CORS Configuration

```bash
curl -X OPTIONS https://buildstock-api.railway.app/api/v1 \
  -H "Origin: https://buildstock.pro" \
  -H "Access-Control-Request-Method: POST" \
  -v
```

**Expected Headers:**
```
Access-Control-Allow-Origin: https://buildstock.pro
Access-Control-Allow-Credentials: true
Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
```

---

### 4. Test API Endpoint from Browser

Open your browser's developer console (F12) on https://buildstock.pro:

```javascript
fetch('https://buildstock-api.railway.app/health')
  .then(response => response.json())
  .then(data => console.log('API Test:', data))
  .catch(error => console.error('API Error:', error));
```

**Expected Output:**
```javascript
{
  success: true,
  status: "healthy",
  timestamp: "2026-01-30T12:00:00.000Z"
}
```

---

### 5. Test Product Search Endpoint

```bash
curl "https://buildstock-api.railway.app/api/v1/search?q=concrete&limit=5"
```

**Expected Response:**
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "total": 100,
    "page": 1,
    "limit": 5
  }
}
```

---

### 6. Verify Environment Variables in Frontend

Add a test page or check the browser console:

```javascript
console.log('API URL:', process.env.NEXT_PUBLIC_API_URL);
console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
```

---

## Troubleshooting

### Issue 1: CORS Errors

**Symptoms:**
```
Access to fetch at 'https://buildstock-api.railway.app/api/v1/search'
from origin 'https://buildstock.pro' has been blocked by CORS policy
```

**Solutions:**

1. **Check CORS_ORIGIN in Railway**
   ```bash
   # Verify current CORS_ORIGIN
   curl https://buildstock-api.railway.app/health
   ```

2. **Update CORS_ORIGIN**
   - Go to Railway → Variables
   - Set `CORS_ORIGIN=https://buildstock.pro`
   - Redeploy backend

3. **Clear Browser Cache**
   - Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
   - Clear site data in DevTools → Application → Clear storage

4. **Check for Typos**
   - Ensure no trailing slashes: `https://buildstock.pro` ✓
   - Ensure HTTPS is used: `https://` ✓

---

### Issue 2: Backend URL Not Accessible

**Symptoms:**
```
curl: (6) Could not resolve host: buildstock-api.railway.app
```

**Solutions:**

1. **Verify Backend Deployment**
   - Check Railway dashboard
   - Ensure deployment is active (not suspended)
   - Check deployment logs for errors

2. **Check Service Status**
   ```bash
   # Test Railway service
   curl -I https://buildstock-api.railway.app
   ```

3. **Verify Domain**
   - Go to Railway → Settings → Domains
   - Ensure custom domain is properly configured
   - Check DNS settings

4. **Check Railway Logs**
   - Railway → View Logs
   - Look for startup errors or crashes

---

### Issue 3: API Returns 404 or 500

**Symptoms:**
```json
{
  "success": false,
  "error": "Not Found"
}
```

**Solutions:**

1. **Check Endpoint Path**
   - Verify correct API version: `/api/v1/...` vs `/api/...`
   - Check backend routes: `curl https://buildstock-api.railway.app/api/v1`

2. **Review Railway Logs**
   - Look for runtime errors
   - Check database connection issues

3. **Test Health Endpoint**
   ```bash
   curl https://buildstock-api.railway.app/health
   ```
   - If this fails, backend may be down

4. **Check Environment Variables**
   - Ensure `DATABASE_URL` is set correctly
   - Verify Supabase credentials

---

### Issue 4: Environment Variables Not Loading in Frontend

**Symptoms:**
```javascript
console.log(process.env.NEXT_PUBLIC_API_URL);
// Output: undefined
```

**Solutions:**

1. **Verify Variable Naming**
   - Must start with `NEXT_PUBLIC_`
   - Example: `NEXT_PUBLIC_API_URL` ✓ vs `API_URL` ✗

2. **Check Vercel Environment**
   - Go to Vercel → Settings → Environment Variables
   - Ensure variable is set for "Production"
   - Redeploy after adding variables

3. **Restart Dev Server**
   ```bash
   # Stop and restart
   Ctrl+C
   npm run dev
   ```

4. **Clear Next.js Cache**
   ```bash
   rm -rf .next
   npm run dev
   ```

5. **Rebuild Production**
   - Vercel → Deployments → Redeploy
   - Or push a new commit to trigger build

---

### Issue 5: Timeout Errors

**Symptoms:**
```
ERR_CONNECTION_TIMED_OUT
```

**Solutions:**

1. **Check Railway Service Status**
   - Service may be sleeping (free tier)
   - First request may take longer (~30 seconds)

2. **Verify Backend Logs**
   - Railway → View Logs
   - Check for database connection timeouts

3. **Test Network Connectivity**
   ```bash
   ping buildstock-api.railway.app
   traceroute buildstock-api.railway.app
   ```

4. **Increase Timeout (if applicable)**
   - Update fetch timeout in frontend
   - Check Vercel serverless function limits (10s for Hobby)

---

### Issue 6: Authentication Errors

**Symptoms:**
```json
{
  "success": false,
  "error": "Unauthorized"
}
```

**Solutions:**

1. **Check JWT Configuration**
   - Verify `JWT_SECRET` is set in Railway
   - Ensure token is being sent correctly

2. **Verify API Key (for sync endpoints)**
   ```bash
   curl -X POST https://buildstock-api.railway.app/api/v1/sync/trigger \
     -H "x-api-key: your-api-key"
   ```

3. **Check Supabase Auth**
   - Verify `SUPABASE_SERVICE_ROLE_KEY` is correct
   - Check Supabase project settings

---

## Visual Diagrams

### Connection Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                     User Browser Flow                           │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  1. User visits: https://buildstock.pro                         │
│     (Vercel serves Next.js frontend)                            │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  2. Frontend makes API request:                                 │
│     GET https://buildstock-api.railway.app/api/v1/search?q=x    │
│     (Uses NEXT_PUBLIC_API_URL environment variable)             │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  3. Backend checks CORS:                                        │
│     - Origin: https://buildstock.pro                            │
│     - Allowed? Yes (matches CORS_ORIGIN)                        │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  4. Backend queries Supabase:                                   │
│     SELECT * FROM products WHERE name LIKE '%x%'                │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  5. Supabase returns data:                                      │
│     [{ id: 1, name: "...", price: 10.99, ... }]                │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  6. Backend sends response:                                     │
│     { success: true, data: [...] }                              │
│     (With CORS headers: Access-Control-Allow-Origin)            │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  7. Frontend displays results to user                           │
└─────────────────────────────────────────────────────────────────┘
```

---

### Environment Variable Mapping

```
┌──────────────────────────────────────────────────────────────────┐
│                    Vercel (Frontend)                             │
├──────────────────────────────────────────────────────────────────┤
│  NEXT_PUBLIC_API_URL=https://buildstock-api.railway.app         │
│  NEXT_PUBLIC_SUPABASE_URL=https://...supabase.co                │
│  NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...                            │
│  NEXT_PUBLIC_SENTRY_DSN=https://...                              │
└──────────────────────────────────────────────────────────────────┘
                                  │
                                  │ Used by frontend code
                                  │
                                  ▼
┌──────────────────────────────────────────────────────────────────┐
│                    Railway (Backend)                             │
├──────────────────────────────────────────────────────────────────┤
│  CORS_ORIGIN=https://buildstock.pro                              │
│  SUPABASE_URL=https://...supabase.co                            │
│  SUPABASE_SERVICE_ROLE_KEY=eyJ...                                │
│  DATABASE_URL=postgresql://...                                   │
│  JWT_SECRET=strong-secret-key                                    │
│  SENTRY_DSN=https://...                                          │
│  PORT=10000                                                       │
└──────────────────────────────────────────────────────────────────┘
                                  │
                                  │ Used by backend code
                                  │
                                  ▼
┌──────────────────────────────────────────────────────────────────┐
│                    Supabase (Database)                           │
├──────────────────────────────────────────────────────────────────┤
│  Project URL: https://xrhlumtimbmglzrfrnnk.supabase.co          │
│  Anon Key: exposed to frontend                                   │
│  Service Role Key: server-side only (backend)                    │
└──────────────────────────────────────────────────────────────────┘
```

---

### Request Flow Diagram

```
User Request Flow (Example: Product Search)

┌──────────┐
│  Browser │
└────┬─────┘
     │
     │ 1. User types "concrete" in search box
     │
     ▼
┌─────────────────────────────────────────────────────────────────┐
│  Frontend (Vercel)                                              │
│  buildstock.pro                                                 │
│                                                                 │
│  const response = await fetch(                                  │
│    `${process.env.NEXT_PUBLIC_API_URL}/api/v1/search?q=concrete`│
│  );                                                             │
└─────────────────────────────────────────────────────────────────┘
     │
     │ 2. HTTP GET Request
     │    Headers:
     │      Origin: https://buildstock.pro
     │      Content-Type: application/json
     │
     ▼
┌─────────────────────────────────────────────────────────────────┐
│  CORS Check (Railway)                                           │
│                                                                 │
│  if (request.origin === CORS_ORIGIN) {                          │
│    // Allow request                                             │
│    response.headers['Access-Control-Allow-Origin'] = origin     │
│  }                                                              │
└─────────────────────────────────────────────────────────────────┘
     │
     │ 3. Request Allowed
     │
     ▼
┌─────────────────────────────────────────────────────────────────┐
│  Backend API (Railway)                                          │
│  buildstock-api.railway.app                                     │
│                                                                 │
│  GET /api/v1/search?q=concrete                                  │
│                                                                 │
│  - Parse query parameter                                        │
│  - Build SQL query                                              │
│  - Execute database query                                       │
└─────────────────────────────────────────────────────────────────┘
     │
     │ 4. Database Query
     │
     ▼
┌─────────────────────────────────────────────────────────────────┐
│  Supabase Database                                              │
│                                                                 │
│  SELECT * FROM products                                         │
│  WHERE name ILIKE '%concrete%'                                  │
│  LIMIT 20                                                       │
│                                                                 │
│  Result: 45 rows found                                          │
└─────────────────────────────────────────────────────────────────┘
     │
     │ 5. Return Data
     │    [{ id, name, price, merchant, ... }]
     │
     ▼
┌─────────────────────────────────────────────────────────────────┐
│  Backend Response                                                │
│                                                                 │
│  {                                                              │
│    success: true,                                               │
│    data: [...],                                                 │
│    pagination: { total: 45, page: 1, limit: 20 }               │
│  }                                                              │
│                                                                 │
│  Headers:                                                       │
│    Access-Control-Allow-Origin: https://buildstock.pro          │
│    Content-Type: application/json                               │
└─────────────────────────────────────────────────────────────────┘
     │
     │ 6. HTTP Response (200 OK)
     │
     ▼
┌─────────────────────────────────────────────────────────────────┐
│  Frontend (Vercel)                                              │
│                                                                 │
│  const data = await response.json();                            │
│  displayProducts(data.data);                                    │
└─────────────────────────────────────────────────────────────────┘
     │
     │ 7. Render UI
     │
     ▼
┌──────────┐
│  Browser │
│          │  Shows 20 concrete products
└──────────┘
```

---

## Quick Reference Commands

### Test Backend Health
```bash
curl https://buildstock-api.railway.app/health
```

### Test CORS
```bash
curl -X OPTIONS https://buildstock-api.railway.app/api/v1 \
  -H "Origin: https://buildstock.pro" \
  -H "Access-Control-Request-Method: GET" \
  -v
```

### Test Search Endpoint
```bash
curl "https://buildstock-api.railway.app/api/v1/search?q=concrete&limit=5"
```

### Test from Browser Console
```javascript
fetch('https://buildstock-api.railway.app/health')
  .then(r => r.json())
  .then(console.log);
```

### Check Environment Variables (Backend)
```bash
# View Railway variables
railway variables
```

### Check Environment Variables (Frontend)
```javascript
// Browser console
console.log({
  apiUrl: process.env.NEXT_PUBLIC_API_URL,
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL
});
```

---

## Security Checklist

- [ ] `JWT_SECRET` is strong and unique in Railway
- [ ] `SYNC_API_KEY` is set and protected in Railway
- [ ] `SUPABASE_SERVICE_ROLE_KEY` is only in backend (never in frontend)
- [ ] `SUPABASE_ANON_KEY` is safe to expose in frontend
- [ ] CORS_ORIGIN is set to specific domain (not `*`)
- [ ] HTTPS is enforced in production
- [ ] Environment variables are not committed to git
- [ ] `.env` files are in `.gitignore`
- [ ] Sentry DSN is configured for error tracking

---

## Additional Resources

- **Vercel Docs**: https://vercel.com/docs
- **Railway Docs**: https://docs.railway.app
- **Supabase Docs**: https://supabase.com/docs
- **CORS Guide**: https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS
- **Next.js Env Vars**: https://nextjs.org/docs/basic-features/environment-variables

---

## Support

If you encounter issues:

1. Check Railway logs: Railway → View Logs
2. Check Vercel logs: Vercel → Deployments → View Logs
3. Check Sentry: https://sentry.io (if configured)
4. Run the test script: `./test-connection.sh`
5. Review this guide's troubleshooting section

---

**Last Updated**: 2026-01-30
**Version**: 1.0.0
