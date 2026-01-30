# BuildStock Pro - Render API Deployment Guide

This guide walks you through deploying BuildStock Pro to Render using their API token for automated deployment.

---

## Step 1: Get Your Render API Token

1. **Log in to Render:**
   - Go to https://dashboard.render.com
   - Sign up or log in (free account)

2. **Generate API Token:**
   - Click your profile icon (top-right)
   - Select **Settings**
   - Scroll down to **API Keys**
   - Click **Create API Key**
   - Give it a name (e.g., "BuildStock Pro Deploy")
   - Click **Create**
   - **COPY THE TOKEN** - you won't see it again!

3. **Store the token securely:**
   - The token looks like: `rnd_...`
   - Keep it safe - it gives full access to your Render account

---

## Step 2: Set Up Environment

Before running the deployment script, make sure you have:
- Render API token (from Step 1)
- Supabase database credentials (from CHECKPOINT-SUMMARY.md)
- Git repository access

---

## Step 3: Deploy Backend

The deployment script will:
1. Create a new Web Service on Render
2. Connect it to your GitHub repository
3. Configure environment variables
4. Deploy the backend

**Run this command:**
```bash
cd /Users/macbook/Desktop/buildstock.pro
bash deploy-backend-render.sh
```

**When prompted:**
- Paste your Render API token
- Confirm the deployment settings

**What gets created:**
- Web Service: `buildstock-backend`
- URL: `https://buildstock-backend.onrender.com`
- Health Check: `/health`

---

## Step 4: Deploy Frontend (Vercel or Render)

After backend is deployed, you have two options:

### Option A: Vercel (Recommended for Next.js)
1. Go to https://vercel.com
2. Sign up/login
3. Import your GitHub repository
4. Configure build settings:
   - Framework Preset: Next.js
   - Root Directory: `Construction-RC/src/frontend`
   - Build Command: `npm run build`
5. Add environment variables:
   - `NEXT_PUBLIC_API_URL`: Your Render backend URL
6. Deploy!

### Option B: Render (Frontend)
1. Create a new Web Service in Render
2. Connect to same GitHub repo
3. Use root directory: `Construction-RC/src/frontend`
4. Configure as Static Site or Next.js

---

## Step 5: Connect Frontend to Backend

After both are deployed:

1. **Get Backend URL:**
   - From Render dashboard or deployment output
   - Example: `https://buildstock-backend.onrender.com`

2. **Update Frontend Environment:**
   - In Vercel/Render dashboard
   - Add `NEXT_PUBLIC_API_URL` = backend URL
   - Redeploy frontend

3. **Update Backend CORS:**
   - In Render dashboard for backend service
   - Add `CORS_ORIGIN` = frontend URL
   - Redeploy backend

---

## Step 6: Test Deployment

```bash
# Test backend health
curl https://your-backend.onrender.com/health

# Test API endpoint
curl https://your-backend.onrender.com/api/v1/products

# Open frontend
open https://your-frontend.vercel.app
```

---

## Environment Variables Reference

### Backend (Render)
```bash
DATABASE_URL=postgresql://... (from Supabase)
JWT_SECRET=your-secure-secret
CORS_ORIGIN=https://your-frontend.vercel.app
PORT=3001
NODE_ENV=production
SENTRY_DSN=optional-from-sentry
```

### Frontend (Vercel/Render)
```bash
NEXT_PUBLIC_API_URL=https://your-backend.onrender.com
NEXT_PUBLIC_SUPABASE_URL=https://xrhlumtimbmglzrfrnnk.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci... (from checkpoint)
```

---

## Troubleshooting

### Deployment fails
- Check Render dashboard logs
- Verify environment variables
- Ensure GitHub repo is public or token has access

### Can't connect to backend
- Verify `NEXT_PUBLIC_API_URL` is correct
- Check `CORS_ORIGIN` matches frontend URL
- Test `/health` endpoint directly

### Database connection errors
- Verify Supabase credentials
- Check Supabase project is active
- Ensure connection string is correct

---

## Cost

**Free Tier (Recommended for beta):**
- Backend: $0/month (Render Free)
- Frontend: $0/month (Vercel Free)
- Database: $0/month (Supabase Free)
- **Total: $0/month**

**Paid Tiers (Post-beta):**
- Backend: ~$7-20/month
- Frontend: ~$20/month (for production)
- Database: ~$25/month (Supabase Pro)

---

## Next Steps

After deployment:
1. Run through beta testing checklist
2. Set up monitoring (Sentry)
3. Configure custom domain
4. Enable analytics

---

## Need Help?

- Render Docs: https://render.com/docs
- Vercel Docs: https://vercel.com/docs
- Supabase Docs: https://supabase.com/docs

---

**Status:** Ready for deployment via Render API
