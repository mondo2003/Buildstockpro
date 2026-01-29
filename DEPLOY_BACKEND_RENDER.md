# 🚀 Deploy Backend to Render - Quick Guide

## Step 1: Push to GitHub (if not already)

```bash
cd /Users/macbook/Desktop/buildstock.pro
git add .
git commit -m "Add Render deployment config"
git push origin main
```

## Step 2: Create Render Account

1. Go to https://render.com
2. Click "Sign Up" (use GitHub - it's easiest)
3. Authorize Render to access your GitHub

## Step 3: Create Web Service

1. Go to https://dashboard.render.com/
2. Click **"New +"** → **"Web Service"**
3. Select your GitHub repository
4. Configure:
   - **Name**: `buildstock-backend`
   - **Root Directory**: `Construction-RC/src/backend`
   - **Runtime**: **Docker**
   - **Plan**: **Free**
5. Click **"Create Web Service"**

## Step 4: Add Environment Variables

After creating the service, go to the service dashboard and add:

| Key | Value |
|-----|-------|
| `DATABASE_URL` | `postgresql://postgres.xrhlumtimbmglzrfrnnk:[PASSWORD]@aws-0-eu-west-1.pooler.supabase.com:6543/postgres` |
| `JWT_SECRET` | (generate: `openssl rand -base64 32`) |
| `CORS_ORIGIN` | `*` (for testing) |
| `PORT` | `3001` |
| `NODE_ENV` | `production` |

**To get DATABASE_URL password:**
1. Go to https://supabase.com/dashboard/project/xrhlumtimbmglzrfrnnk/settings/database
2. Copy the database password
3. Replace `[PASSWORD]` in the connection string

## Step 5: Deploy

Render will automatically deploy. Wait 3-5 minutes.

## Step 6: Get Your URL

Your backend will be at:
```
https://buildstock-backend.onrender.com
```

## Step 7: Test

```bash
curl https://buildstock-backend.onrender.com/health
```

---

**That's it! Your backend is live on Render!** 🎉

**Cost:** Free tier

**Next:** Deploy frontend to Vercel
