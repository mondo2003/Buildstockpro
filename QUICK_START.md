# 🚀 BuildStock Pro - Quick Start Deployment

## 5-Minute Deployment Guide

This is the fastest way to get BuildStock Pro live in production.

---

## Step 1: Backend (2 minutes)

```bash
cd /Users/macbook/Desktop/buildstock.pro/Construction-RC/src/backend
./deploy-railway.sh
```

**What happens:**
- Railway CLI installs
- You authenticate in browser
- Backend deploys automatically
- You get a URL like: `https://buildstock-api.up.railway.app`

**Required:** Railway account (free) at https://railway.app

---

## Step 2: Frontend (2 minutes)

```bash
cd /Users/macbook/Desktop/buildstock.pro/Construction-RC/src/frontend
./deploy-vercel.sh
```

**What happens:**
- Vercel CLI installs
- You authenticate in browser
- Frontend deploys automatically
- You get a URL like: `https://buildstock.vercel.app`

**Required:** Vercel account (free) at https://vercel.com

---

## Step 3: Connect Frontend to Backend (1 minute)

### In Vercel Dashboard:

1. Go to https://vercel.com/dashboard
2. Open your project
3. Go to **Settings → Environment Variables**
4. Add: `NEXT_PUBLIC_API_URL` = your Railway URL from Step 1
5. Click **Save**
6. **Redeploy** (click "Deployments" → "Redeploy")

### Also Update Backend CORS:

```bash
railway variables set CORS_ORIGIN="https://your-frontend.vercel.app"
```

---

## Step 4: Test (30 seconds)

```bash
# Test backend
curl https://your-backend.up.railway.app/health

# Open frontend
open https://your-frontend.vercel.app
```

✅ **You're live!**

---

## Optional: Cron Jobs (5 minutes)

### Generate API Key:

```bash
openssl rand -base64 32
```

### Add GitHub Secrets:

1. Go to your GitHub repo
2. **Settings → Secrets and variables → Actions**
3. Click **New repository secret**
4. Add these:
   - `DATABASE_URL` - from Step 1
   - `JWT_SECRET` - from Step 1
   - `SYNC_API_KEY` - from above
   - `CORS_ORIGIN` - your frontend URL

### Test:

1. Go to **Actions** tab
2. Select "Merchant Data Sync"
3. Click **Run workflow**

---

## 🎯 Done! What You Have:

| Component | URL | Status |
|-----------|-----|--------|
| Frontend | `https://your-app.vercel.app` | ✅ Live |
| Backend | `https://your-api.up.railway.app` | ✅ Live |
| Database | Supabase (EU-West-1) | ✅ Ready |
| Cron Jobs | GitHub Actions | ✅ Configured |

---

## 📝 Next Steps (Optional)

1. **Custom Domain** - Add your own domain in Vercel/Railway dashboards
2. **Analytics** - Enable Vercel Analytics and Sentry
3. **Monitoring** - Set up error alerts in Sentry
4. **SSL** - Automatic with Vercel/Railway

---

## 💰 Cost

**All on free tiers:** $0/month

- Vercel: Free
- Railway: Free
- Supabase: Free
- GitHub Actions: Free

---

## 🆘 Troubleshooting

### Backend won't deploy
```bash
railway logs  # Check for errors
railway open  # Open dashboard
```

### Frontend won't deploy
```bash
vercel logs  # Check for errors
vercel open  # Open dashboard
```

### Can't connect to backend
- Check `NEXT_PUBLIC_API_URL` in Vercel
- Check `CORS_ORIGIN` in Railway
- Test: `curl https://your-backend/health`

---

## 📚 Full Documentation

- **Complete Guide:** `DEPLOYMENT_GUIDE.md`
- **Frontend:** `Construction-RC/src/frontend/VERCEL_DEPLOYMENT.md`
- **Backend:** `Construction-RC/src/backend/RAILWAY_DEPLOYMENT.md`
- **Database:** `PRODUCTION-DATABASE-SETUP.md`
- **Cron Jobs:** `Construction-RC/src/backend/CRON_SETUP.md`

---

**Status:** ✅ 100% Complete - Ready for Production

**Time to Deploy:** ~5 minutes

---

🎉 **Your BuildStock Pro app is ready to go live!**
