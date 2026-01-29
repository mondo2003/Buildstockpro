# Vercel Deployment Quick Start

## Quick Setup (5 Minutes)

### 1. Deploy Backend First
Deploy your backend to Render/Railway/Fly.io and get the production URL.

### 2. Push Code to GitHub
```bash
cd /Users/macbook/Desktop/buildstock.pro/buildstock-pro/frontend
git add vercel.json .vercelignore .env.production .env.example VERCEL_DEPLOYMENT_GUIDE.md .gitignore
git commit -m "Add Vercel deployment configuration"
git push origin main
```

### 3. Deploy to Vercel
1. Go to https://vercel.com/new
2. Import your GitHub repository
3. Configure these settings:
   - **Root Directory**: `frontend` (if frontend is in a subdirectory)
   - **Framework Preset**: Next.js
   - **Build Command**: `npm run build`
   - **Install Command**: `npm install`

### 4. Add Environment Variables
In Vercel Dashboard → Settings → Environment Variables, add:

```
NEXT_PUBLIC_API_URL=https://your-backend-url.com
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### 5. Deploy
Click "Deploy" and wait ~2 minutes.

### 6. Test Your Deployment
- Visit `https://your-project.vercel.app`
- Test authentication
- Test API calls
- Check browser console for errors

## Files Created

✓ `vercel.json` - Vercel configuration
✓ `.vercelignore` - Files to exclude from deployment
✓ `.env.production` - Production environment template
✓ `.env.example` - Updated with all required variables
✓ `.gitignore` - Updated to allow .env.production
✓ `VERCEL_DEPLOYMENT_GUIDE.md` - Full deployment guide

## Build Status

✓ Build tested successfully
✓ All pages compile without errors
✓ Static pages generated: 21
✓ API routes: 3

## Environment Variable Reference

Get your Supabase credentials from:
- Supabase Dashboard → Settings → API

Get your backend URL from:
- Your backend hosting service (Render/Railway/etc.)

## Important Notes

1. **Do not use localhost URLs** in production
2. **Keep .env.local for local development** only
3. **Set environment variables in Vercel Dashboard**, not in .env files
4. **.env.production is a template** - actual values should be in Vercel

## Next Steps

After deployment:
- Set up custom domain (optional)
- Configure analytics (optional)
- Set up error monitoring (Sentry already integrated)
- Test all functionality

## Troubleshooting

**Build fails?**
- Check environment variables are set
- Ensure dependencies are installed
- Check build logs in Vercel Dashboard

**API calls failing?**
- Verify NEXT_PUBLIC_API_URL is correct
- Check backend CORS settings
- Ensure backend is deployed and running

**Auth not working?**
- Verify Supabase credentials
- Check Supabase Dashboard for configuration
- Add Vercel domain to Supabase allowed URLs

## Support

- Full guide: `VERCEL_DEPLOYMENT_GUIDE.md`
- Vercel docs: https://vercel.com/docs
- Next.js docs: https://nextjs.org/docs
