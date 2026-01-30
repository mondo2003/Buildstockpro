# 🚀 Quick Start: Deploy BuildStock Pro to Production

This guide gets you deployed in about 10 minutes.

---

## Prerequisites (5 minutes)

### 1. Get a Render Account
1. Go to https://dashboard.render.com
2. Click **Sign Up** (free)
3. Verify your email
4. **Create API Key:**
   - Click your profile (top-right)
   - Settings → API Keys
   - Click **Create API Key**
   - Name it "BuildStock Pro"
   - **COPY THE TOKEN** (starts with `rnd_`)

### 2. Get a Vercel Account
1. Go to https://vercel.com
2. Click **Sign Up** (free)
3. Sign up with GitHub/GitLab/Bitbucket
4. Verify your email

### 3. Get Supabase Credentials
Your Supabase project is already set up. You'll need:
- **Project URL:** `https://xrhlumtimbmglzrfrnnk.supabase.co`
- **Database Password:** From https://supabase.com/dashboard/project/xrhlumtimbmglzrfrnnk/settings/database

---

## Step 1: Deploy Backend (5 minutes)

Run this command in your terminal:

```bash
cd /Users/macbook/Desktop/buildstock.pro
bash deploy-backend-render.sh
```

**Follow the prompts:**
1. Paste your Render API token (`rnd_...`)
2. Accept default settings (or customize if you want)
3. Browser will open to Render dashboard

**In the browser (Render):**
1. Connect your GitHub repository
2. Set these values:
   - **Runtime:** Docker
   - **Dockerfile Path:** `./Dockerfile`
3. Add environment variables:
   ```
   PORT=3001
   NODE_ENV=production
   DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.xrhlumtimbmglzrfrnnk.supabase.co:5432/postgres
   JWT_SECRET=[run: openssl rand -base64 32]
   CORS_ORIGIN=[leave blank for now, will add after frontend deploys]
   ```
4. Click **Create Web Service**
5. Wait for deployment (~3-5 minutes)

**Save the URL** Render gives you, e.g., `https://buildstock-backend.onrender.com`

---

## Step 2: Deploy Frontend (3 minutes)

Run this command:

```bash
bash deploy-frontend-vercel.sh
```

**Follow the prompts:**
1. Paste your backend URL from Step 1
2. Vercel will open in your browser
3. Click **Deploy**

**Save the URL** Vercel gives you, e.g., `https://buildstock.vercel.app`

---

## Step 3: Connect Frontend to Backend (2 minutes)

### Update Backend CORS:

1. Go to https://dashboard.render.com
2. Open your `buildstock-backend` service
3. Go to **Environment** tab
4. Add or update `CORS_ORIGIN`:
   ```
   CORS_ORIGIN=https://your-frontend.vercel.app
   ```
5. Click **Save Changes**
6. Click **Manual Deploy** → **Clear build cache & deploy**

### Update Frontend (if needed):

1. Go to https://vercel.com/dashboard
2. Open your project
3. Go to **Settings** → **Environment Variables**
4. Confirm `NEXT_PUBLIC_API_URL` is set to your backend URL
5. **Redeploy** if needed

---

## Step 4: Test Everything (1 minute)

```bash
# Test backend health
curl https://your-backend.onrender.com/health

# Test products endpoint
curl https://your-backend.onrender.com/api/v1/products

# Test search
curl "https://your-backend.onrender.com/search?query=cement"

# Open frontend
open https://your-frontend.vercel.app
```

**Expected results:**
- Backend health returns: `{"status":"healthy"}`
- Products endpoint returns JSON with products
- Frontend loads and search works

---

## 🎉 You're Live!

Your BuildStock Pro app is now in production!

**URLs you now have:**
- Frontend: `https://your-app.vercel.app`
- Backend: `https://your-backend.onrender.com`
- Database: Supabase (already running)

---

## Beta Testing

Now that you're live, run through the beta testing checklist:

```bash
open /Users/macbook/Desktop/buildstock.pro/BETA_TESTING_CHECKLIST.md
```

**Critical flows to test:**
1. ✅ Search works
2. ✅ "Get Started" buttons redirect correctly
3. ✅ Contact form works
4. ✅ All pages load without errors
5. ✅ Mobile responsive

---

## Troubleshooting

### Backend won't start
- Check Render logs: Dashboard → your service → Logs
- Verify `DATABASE_URL` is correct
- Check `JWT_SECRET` is set

### Frontend can't connect to backend
- Verify `NEXT_PUBLIC_API_URL` in Vercel
- Check `CORS_ORIGIN` in Render matches frontend URL
- Test backend directly: `curl https://your-backend/health`

### Build fails
- Check terminal output for errors
- Ensure all dependencies are installed
- Try `npm run build` locally first

---

## Environment Variables Cheat Sheet

### Backend (Render)
```bash
PORT=3001
NODE_ENV=production
DATABASE_URL=postgresql://...
JWT_SECRET=[generate with: openssl rand -base64 32]
CORS_ORIGIN=https://your-frontend.vercel.app
```

### Frontend (Vercel)
```bash
NEXT_PUBLIC_API_URL=https://your-backend.onrender.com
NEXT_PUBLIC_SUPABASE_URL=https://xrhlumtimbmglzrfrnnk.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci... (from checkpoint)
```

---

## Cost Summary

**Everything is FREE:**
- Render Backend: $0/month
- Vercel Frontend: $0/month
- Supabase Database: $0/month
- **Total: $0/month**

Free tiers are perfect for beta testing!

---

## What's Next?

1. **Beta Testing** - Go through the checklist
2. **Monitor** - Set up error tracking (Sentry)
3. **Analytics** - Enable Vercel Analytics
4. **Custom Domain** - Add your own domain
5. **Launch** - When beta testing is complete!

---

## Need Help?

- **Full Deployment Guide:** `RENDER_API_DEPLOYMENT.md`
- **Beta Testing:** `BETA_TESTING_CHECKLIST.md`
- **Checkpoint Summary:** `CHECKPOINT-SUMMARY.md`

---

**Status:** ✅ Ready to Deploy
**Time:** ~10 minutes
**Cost:** $0/month

🚀 **Let's go live!**
