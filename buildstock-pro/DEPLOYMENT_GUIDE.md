# BuildStock Pro Deployment Guide

Complete guide for deploying BuildStock Pro to production on Vercel (frontend) and Render (backend).

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Architecture Overview](#architecture-overview)
3. [Environment Variables Reference](#environment-variables-reference)
4. [Supabase Setup](#supabase-setup)
5. [Backend Deployment (Render)](#backend-deployment-render)
6. [Frontend Deployment (Vercel)](#frontend-deployment-vercel)
7. [Post-Deployment Configuration](#post-deployment-configuration)
8. [Post-Deployment Checklist](#post-deployment-checklist)
9. [Troubleshooting](#troubleshooting)
10. [Quick Reference](#quick-reference)

---

## Prerequisites

### Required Accounts

- [GitHub](https://github.com) - For code repository
- [Vercel](https://vercel.com) - For frontend deployment
- [Render](https://render.com) - For backend deployment
- [Supabase](https://supabase.com) - For database and authentication

### Required Tools

Install these tools locally before starting:

```bash
# Node.js (v18 or higher)
node --version

# Git
git --version

# Bun (for local backend testing)
bun --version

# Optional: Vercel CLI
npm install -g vercel
```

### Before You Begin

1. Ensure your code is pushed to GitHub
2. Have your Supabase project URL and keys ready
3. Generate secure values for production secrets (JWT secret, API keys)

---

## Architecture Overview

```
┌─────────────────┐         ┌─────────────────┐         ┌─────────────────┐
│                 │         │                 │         │                 │
│   Frontend      │────▶    │   Backend       │────▶    │   Supabase      │
│   (Vercel)      │         │   (Render)      │         │   Database      │
│   Next.js 16    │         │   Bun + Elysia  │         │   PostgreSQL    │
│                 │         │                 │         │                 │
└─────────────────┘         └─────────────────┘         └─────────────────┘
     Port 443/80                   Port 443                   Port 5432
```

**Project Structure:**

```
buildstock-pro/
├── frontend/           # Next.js app → Vercel
│   ├── .env.example
│   ├── next.config.ts
│   └── package.json
├── backend/            # Bun API → Render
│   ├── .env
│   ├── src/
│   │   └── index.ts
│   ├── migrations/
│   └── package.json
└── DEPLOYMENT_GUIDE.md
```

---

## Environment Variables Reference

### Frontend Environment Variables (Vercel)

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Yes | Backend API URL | `https://buildstock-api.onrender.com` |
| `NEXT_PUBLIC_GOOGLE_MAPS_KEY` | No | Google Maps API key | `AIzaSy...` |
| `NEXT_PUBLIC_GA_ID` | No | Google Analytics ID | `G-XXXXXXXXXX` |
| `NODE_ENV` | Yes | Environment | `production` |

### Backend Environment Variables (Render)

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `SUPABASE_URL` | Yes | Supabase project URL | `https://xxx.supabase.co` |
| `SUPABASE_ANON_KEY` | Yes | Supabase anonymous key | `eyJhbGci...` |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Supabase service role key | `eyJhbGci...` |
| `DATABASE_URL` | Yes | PostgreSQL connection string | `postgresql://...` |
| `PORT` | Yes | Server port | `3001` |
| `NODE_ENV` | Yes | Environment | `production` |
| `CORS_ORIGIN` | Yes | Frontend URL for CORS | `https://buildstock.vercel.app` |
| `JWT_SECRET` | Yes | Secret for JWT tokens | `your-super-secret-key` |
| `SENTRY_DSN` | No | Sentry DSN for error tracking | `https://...@sentry.io/...` |
| `SENTRY_ENVIRONMENT` | No | Sentry environment name | `production` |
| `SCREWFIX_API_KEY` | No | Screwfix API key | `your-key` |
| `WICKES_API_KEY` | No | Wickes API key | `your-key` |
| `BANDQ_API_KEY` | No | B&Q API key | `your-key` |
| `JEWSON_API_KEY` | No | Jewson API key | `your-key` |

---

## Supabase Setup

### Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click "New Project"
3. Configure:
   - **Name**: `buildstock-pro`
   - **Database Password**: Generate and save securely
   - **Region**: Choose closest to your users
4. Wait for project to be provisioned (2-3 minutes)

### Step 2: Get Database Connection String

1. In Supabase dashboard, go to **Settings → Database**
2. Find **Connection String** section
3. Select **URI** format
4. Copy the connection string
5. Replace `[YOUR-PASSWORD]` with your database password

**Example:**
```
postgresql://postgres.xrhlumtimbmglzrfrnnk:YOUR-PASSWORD@aws-0-us-east-1.pooler.supabase.com:6543/postgres
```

### Step 3: Get API Keys

1. In Supabase dashboard, go to **Settings → API**
2. Copy these values:
   - **Project URL** → `SUPABASE_URL`
   - **anon/public key** → `SUPABASE_ANON_KEY`
   - **service_role key** → `SUPABASE_SERVICE_ROLE_KEY`

⚠️ **Security Note**: Never commit the service role key to public repositories.

### Step 4: Run Database Migrations

1. In Supabase dashboard, go to **SQL Editor**
2. Open the migration file: `/Users/macbook/Desktop/buildstock.pro/buildstock-pro/backend/migrations/001_initial_schema.sql`
3. Copy the entire content
4. Paste into SQL Editor
5. Click **Run** to execute

Alternatively, run locally:
```bash
cd backend
psql $DATABASE_URL < migrations/001_initial_schema.sql
```

### Step 5: Configure Row Level Security (Optional)

If using Supabase Auth, configure RLS policies:

```sql
-- Example: Enable RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Create policy (adjust based on your needs)
CREATE POLICY "Public read access" ON products
  FOR SELECT USING (true);
```

---

## Backend Deployment (Render)

### Step 1: Prepare GitHub Repository

Ensure your backend code is in a dedicated folder or branch:

```bash
# Option 1: Separate repository for backend
git clone https://github.com/yourusername/buildstock-backend.git
cd buildstock-backend
# Copy backend/ contents here

# Option 2: Use same repository with subdirectory
# Deploy from /backend folder
```

### Step 2: Create Render Account

1. Go to [render.com](https://render.com)
2. Sign up with GitHub
3. Authorize Render to access your repository

### Step 3: Create New Web Service

1. Click **New → Web Service**
2. Select your repository
3. Configure service:

**Basic Settings:**
- **Name**: `buildstock-api`
- **Region**: Same as Supabase (recommended)
- **Branch**: `main`
- **Root Directory**: `backend` (if monorepo) or `.` (if separate repo)
- **Runtime**: `Bun`

**Build & Deploy:**
- **Build Command**: `bun install`
- **Start Command**: `bun run start`

**Environment Variables:**

Add these in the "Environment" section:

```bash
# Required
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
DATABASE_URL=postgresql://...
PORT=3001
NODE_ENV=production
CORS_ORIGIN=https://your-frontend.vercel.app
JWT_SECRET=your-super-secret-jwt-key-min-32-chars

# Optional - Sentry
SENTRY_DSN=https://...
SENTRY_ENVIRONMENT=production

# Optional - Merchant API Keys
SCREWFIX_API_KEY=
WICKES_API_KEY=
BANDQ_API_KEY=
JEWSON_API_KEY=
```

4. Click **Create Web Service**

### Step 4: Monitor Deployment

- Watch the deployment logs in Render dashboard
- Wait for "Deploy succeeded" status
- Copy the service URL (e.g., `https://buildstock-api.onrender.com`)

### Step 5: Verify Backend

Test your deployed backend:

```bash
# Health check
curl https://buildstock-api.onrender.com/health

# API info
curl https://buildstock-api.onrender.com/api/v1
```

Expected response:
```json
{
  "success": true,
  "status": "healthy",
  "timestamp": "2026-01-29T12:00:00.000Z"
}
```

### Step 6: Configure Auto-Deploys

In Render dashboard:
1. Go to **Settings → Deploy Context**
2. Enable **Auto-Deploy** for `main` branch
3. (Optional) Add deploy hooks for manual triggers

---

## Frontend Deployment (Vercel)

### Step 1: Install Vercel CLI (Optional)

```bash
npm install -g vercel
```

### Step 2: Connect Vercel to GitHub

1. Go to [vercel.com](https://vercel.com)
2. Sign up with GitHub
3. Click **Add New → Project**
4. Select your repository
5. Import the project

### Step 3: Configure Vercel Project

**Project Settings:**

- **Framework Preset**: Next.js
- **Root Directory**: `frontend`
- **Build Command**: `npm run build`
- **Output Directory**: `.next`

**Environment Variables:**

Add these in Vercel dashboard:

```bash
# Required
NEXT_PUBLIC_API_URL=https://buildstock-api.onrender.com
NODE_ENV=production

# Optional
NEXT_PUBLIC_GOOGLE_MAPS_KEY=AIzaSy...
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```

⚠️ **Important**: Vercel variables starting with `NEXT_PUBLIC_` are exposed in browser, only add safe values here.

### Step 4: Deploy

1. Click **Deploy**
2. Wait for build to complete (~2-3 minutes)
3. Copy the deployment URL (e.g., `https://buildstock.vercel.app`)

### Step 5: Configure Custom Domain (Optional)

1. In Vercel dashboard, go to **Settings → Domains**
2. Add your custom domain
3. Update DNS records as instructed
4. Wait for SSL certificate (automatic)

### Step 6: Verify Frontend

```bash
# Open in browser
open https://your-app.vercel.app

# Check API connection
# Look for network requests in browser DevTools
# Should see: https://your-backend.onrender.com/api/v1
```

---

## Post-Deployment Configuration

### Update CORS Configuration

After deploying both frontend and backend, verify CORS is configured correctly.

**In Render (Backend):**

1. Go to your backend service
2. Edit environment variables
3. Update `CORS_ORIGIN`:
   ```bash
   CORS_ORIGIN=https://your-frontend.vercel.app
   ```
4. If you have a custom domain, use that instead:
   ```bash
   CORS_ORIGIN=https://buildstock.pro
   ```

5. Save and redeploy

**Multiple Origins (if needed):**

For multiple frontend URLs (e.g., staging + production):

Update `/Users/macbook/Desktop/buildstock.pro/buildstock-pro/backend/src/index.ts`:

```typescript
// Change from:
origin: CORS_ORIGIN,

// To:
origin: (origin) => {
  const allowedOrigins = [
    'https://buildstock.vercel.app',
    'https://buildstock.pro',
    'http://localhost:3000', // For local development
  ];
  return allowedOrigins.includes(origin) || origin === undefined;
},
```

### Update Frontend API URL

If backend URL changes after deployment:

**In Vercel (Frontend):**

1. Go to your Vercel project
2. **Settings → Environment Variables**
3. Update `NEXT_PUBLIC_API_URL` to new backend URL
4. Redeploy

**Verification:**

```bash
# In frontend code, API calls should use:
fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/products`)

# Not hardcoded URLs like:
fetch('https://buildstock-api.onrender.com/api/v1/products')
```

---

## Post-Deployment Checklist

### Backend (Render)

- [ ] Service is running and accessible
- [ ] Health check endpoint returns 200
- [ ] All environment variables are set
- [ ] Database connection successful
- [ ] CORS origin configured to frontend URL
- [ ] Sentry configured (if using)
- [ ] Auto-deploys enabled
- [ ] Background jobs are running (check logs)
- [ ] API endpoints are responding

### Frontend (Vercel)

- [ ] Site loads successfully
- [ ] All pages are accessible
- [ ] API calls are working (check browser console)
- [ ] Environment variables are set
- [ ] Custom domain configured (if applicable)
- [ ] Analytics configured (if using)
- [ ] Images are loading correctly
- [ ] Responsive design works on mobile

### Database (Supabase)

- [ ] Migrations applied successfully
- [ ] Tables are created
- [ ] Connection string is correct
- [ ] API keys are configured
- [ ] RLS policies set up (if using auth)
- [ ] Database backups enabled

### Testing

Test these critical flows:

```bash
# 1. Backend Health
curl https://buildstock-api.onrender.com/health

# 2. API Endpoints
curl https://buildstock-api.onrender.com/api/v1
curl https://buildstock-api.onrender.com/api/products

# 3. Frontend Pages
open https://buildstock.vercel.app
open https://buildstock.vercel.app/products
open https://buildstock.vercel.app/search

# 4. Browser Console Checks
# - No 404 errors
# - No CORS errors
# - API calls returning data
# - No console errors
```

---

## Troubleshooting

### Common Issues

#### 1. CORS Errors

**Symptom:** Browser console shows CORS errors

```
Access to fetch at 'https://backend.onrender.com' from origin 'https://frontend.vercel.app'
has been blocked by CORS policy
```

**Solution:**

1. Check backend `CORS_ORIGIN` environment variable
2. Ensure it exactly matches frontend URL (including https:// and no trailing slash)
3. Redeploy backend after changes

```bash
# Correct
CORS_ORIGIN=https://buildstock.vercel.app

# Incorrect
CORS_ORIGIN=https://buildstock.vercel.app/
CORS_ORIGIN=buildstock.vercel.app
```

#### 2. API Calls Failing

**Symptom:** Frontend shows "Failed to fetch" or network errors

**Debug Steps:**

1. Check `NEXT_PUBLIC_API_URL` in Vercel:
   ```bash
   # In Vercel dashboard, verify:
   NEXT_PUBLIC_API_URL=https://your-backend.onrender.com
   ```

2. Test backend directly:
   ```bash
   curl https://your-backend.onrender.com/health
   ```

3. Check browser DevTools → Network tab:
   - Are requests going to correct URL?
   - What status codes are returned?
   - Check response payloads

4. Verify backend is running:
   - Check Render dashboard for service status
   - Review deployment logs

#### 3. Database Connection Errors

**Symptom:** Backend logs show database connection failures

**Solution:**

1. Verify `DATABASE_URL` is correct:
   ```bash
   # Format:
   postgresql://postgres.project-ref:password@aws-0-us-east-1.pooler.supabase.com:6543/postgres
   ```

2. Test connection locally:
   ```bash
   psql $DATABASE_URL
   ```

3. Check Supabase dashboard:
   - Is database paused?
   - Are connection limits reached?
   - Is IP whitelisted (if enabled)?

4. Verify migrations were applied:
   ```bash
   # In Supabase SQL Editor
   SELECT table_name FROM information_schema.tables
   WHERE table_schema = 'public';
   ```

#### 4. Build Failures

**Vercel Build Failed:**

1. Check build logs in Vercel dashboard
2. Common issues:
   - Missing dependencies
   - TypeScript errors
   - Environment variables not set during build

```bash
# Fix: Ensure all dependencies are in package.json
# Test build locally:
cd frontend
npm run build
```

**Render Build Failed:**

1. Check runtime is set to "Bun"
2. Verify `package.json` has correct scripts:
   ```json
   {
     "scripts": {
       "start": "bun src/index.ts"
     }
   }
   ```
3. Check port is correct (`PORT=3001`)

#### 5. Environment Variables Not Working

**Symptom:** Code using `process.env.VARIABLE` returns undefined

**Solution:**

1. **Frontend (Vercel):**
   - Only `NEXT_PUBLIC_` variables are exposed to browser
   - Must redeploy after changing variables
   - Check Vercel dashboard → Settings → Environment Variables

2. **Backend (Render):**
   - All variables available in backend code
   - Check Render dashboard → Environment
   - Service must redeploy after changes

3. **Verify deployment:**
   ```bash
   # Add test endpoint to backend
   app.get('/env-test', () => ({
     apiUrl: process.env.SUPABASE_URL,
     nodeEnv: process.env.NODE_ENV
   }));

   # Test:
   curl https://backend.onrender.com/env-test
   ```

#### 6. Sentry Not Working

**Symptom:** Errors not appearing in Sentry dashboard

**Solution:**

1. Verify `SENTRY_DSN` is set in Render:
   ```bash
   SENTRY_DSN=https://...@sentry.io/...
   ```

2. Check backend logs for Sentry initialization:
   ```bash
   # Should see:
   Sentry initialized successfully
   ```

3. Test Sentry integration:
   ```bash
   curl https://backend.onrender.com/api/sentry-test
   ```

4. Check Sentry dashboard:
   - Correct project selected
   - Correct environment filter
   - Check error filters

#### 7. Background Jobs Not Running

**Symptom:** Scheduled tasks not executing

**Solution:**

1. Check Render logs for job scheduler:
   ```bash
   # Should see:
   Starting background job scheduler...
   ```

2. Verify job scheduler configuration in backend:
   - Check `/backend/src/jobs/scheduler.ts`
   - Ensure cron expressions are correct

3. Note: Render free tier spins down services
   - Jobs only run when service is active
   - Consider upgrading to paid tier for always-on background jobs

#### 8. Images Not Loading

**Symptom:** Product images broken

**Solution:**

1. Check `next.config.ts` has correct image domains:
   ```typescript
   images: {
     remotePatterns: [
       {
         protocol: 'https',
         hostname: 'your-image-domain.com',
       },
     ],
   }
   ```

2. Add missing domains if needed

3. Redeploy frontend after config changes

---

## Quick Reference

### Important URLs

**After deployment, save these URLs:**

```
Frontend: https://your-app.vercel.app
Backend:  https://your-api.onrender.com
Database: https://your-project.supabase.co
```

### Essential Commands

**Local Development:**
```bash
# Frontend
cd frontend
npm run dev

# Backend
cd backend
bun run dev

# Database
psql $DATABASE_URL
```

**Deployment:**
```bash
# Deploy to Vercel
vercel --prod

# Deploy to Render (push to GitHub)
git push origin main
```

**Monitoring:**
```bash
# Check backend health
curl https://your-backend.onrender.com/health

# Check API endpoints
curl https://your-backend.onrender.com/api/v1

# View logs
# Render: Dashboard → Logs
# Vercel: Dashboard → Deployments → View Logs
# Sentry: Dashboard → Issues
```

### File Locations

**Configuration Files:**
```
Frontend:
/Users/macbook/Desktop/buildstock.pro/buildstock-pro/frontend/.env.example
/Users/macbook/Desktop/buildstock.pro/buildstock-pro/frontend/next.config.ts
/Users/macbook/Desktop/buildstock.pro/buildstock-pro/frontend/package.json

Backend:
/Users/macbook/Desktop/buildstock.pro/buildstock-pro/backend/.env
/Users/macbook/Desktop/buildstock.pro/buildstock-pro/backend/src/index.ts
/Users/macbook/Desktop/buildstock.pro/buildstock-pro/backend/package.json

Database:
/Users/macbook/Desktop/buildstock.pro/buildstock-pro/backend/migrations/001_initial_schema.sql
```

### Environment Variable Templates

**Frontend (.env.local):**
```bash
NEXT_PUBLIC_API_URL=http://localhost:3001
NODE_ENV=development
```

**Backend (.env):**
```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
DATABASE_URL=postgresql://...
PORT=3001
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
JWT_SECRET=dev-secret-key
SENTRY_DSN=
```

### Dashboard Links

- **Vercel**: https://vercel.com/dashboard
- **Render**: https://dashboard.render.com
- **Supabase**: https://supabase.com/dashboard
- **GitHub**: https://github.com/yourusername/buildstock-pro

### Support Resources

- **Vercel Docs**: https://vercel.com/docs
- **Render Docs**: https://render.com/docs
- **Supabase Docs**: https://supabase.com/docs
- **Next.js Docs**: https://nextjs.org/docs
- **Elysia Docs**: https://elysiajs.com

### Deployment Flow Summary

```
1. Supabase Setup
   ├─ Create project
   ├─ Get connection string & API keys
   └─ Run migrations

2. Backend Deployment (Render)
   ├─ Push code to GitHub
   ├─ Create web service
   ├─ Add environment variables
   └─ Deploy & test

3. Frontend Deployment (Vercel)
   ├─ Connect repository
   ├─ Configure Next.js
   ├─ Add environment variables (with backend URL)
   └─ Deploy & test

4. Post-Deployment
   ├─ Update CORS origin
   ├─ Test API connections
   ├─ Configure monitoring
   └─ Run through checklist
```

---

## Security Best Practices

1. **Never commit secrets to git**
   - Use `.gitignore` for `.env` files
   - Use environment variables in deployment platforms

2. **Rotate secrets regularly**
   - JWT secrets
   - Database passwords
   - API keys

3. **Enable monitoring**
   - Sentry for error tracking
   - Vercel/Render analytics
   - Supabase logs

4. **Set up backups**
   - Database backups (Supabase automatic)
   - Code repository (GitHub)

5. **Review access controls**
   - Who has deployment access?
   - Who has database access?
   - API key permissions

---

## Cost Estimates

**Free Tier (Development):**
- Vercel: Free (100GB bandwidth)
- Render: Free (750 hours/month)
- Supabase: Free (500MB database)

**Production (Recommended):**
- Vercel Pro: $20/month
- Render Standard: $7/month (always-on)
- Supabase Pro: $25/month
- **Total**: ~$52/month

---

## Next Steps

After successful deployment:

1. **Set up custom domain** (if applicable)
2. **Configure analytics** (Google Analytics, Plausible)
3. **Set up monitoring** (Sentry, LogRocket)
4. **Enable database backups** (Supabase)
5. **Configure CDN** (Vercel automatic)
6. **Set up staging environment** (optional)
7. **Create deployment scripts** for automation
8. **Document your specific URLs and credentials** securely

---

## Updates and Maintenance

**Updating the application:**

1. Make changes locally
2. Test thoroughly
3. Commit to GitHub
4. Automatic deployments trigger:
   - Render: Backend updates
   - Vercel: Frontend updates

**Rolling back:**

- **Vercel**: Dashboard → Deployments → Rollback
- **Render**: Push previous commit or revert in dashboard

**Database migrations:**

```bash
# Create new migration
# Test locally first
psql $DATABASE_URL < migrations/002_new_migration.sql

# Apply to production
# Use Supabase SQL Editor
```

---

**Deployment complete!** 🚀

For issues or questions, refer to the troubleshooting section or check platform-specific documentation.
