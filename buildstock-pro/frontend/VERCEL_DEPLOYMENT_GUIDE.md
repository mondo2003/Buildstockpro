# Vercel Deployment Guide for BuildStock Pro Frontend

## Overview
This guide covers deploying the BuildStock Pro Next.js frontend to Vercel.

## Prerequisites
- Vercel account (https://vercel.com)
- Git repository (GitHub, GitLab, or Bitbucket)
- Production backend URL deployed and accessible
- Supabase project credentials

## Files Created for Deployment

### 1. `vercel.json`
Configuration file for Vercel deployment. Includes:
- Build command: `npm run build`
- Output directory: `.next`
- Environment variable references
- Rewrite rules for API routes

### 2. `.vercelignore`
Excludes unnecessary files from Vercel deployment:
- node_modules
- .next (build output)
- .env.local (local development)
- IDE files
- Logs

### 3. `.env.production`
Template for production environment variables. This file should be committed to git as a reference.

## Environment Variables

You need to set these environment variables in your Vercel project settings:

### Required Variables:

1. **NEXT_PUBLIC_API_URL**
   - Your production backend API URL
   - Example: `https://buildstock-backend.onrender.com` or `https://api.buildstock.pro`
   - Get this from your backend deployment (Render, Railway, etc.)

2. **NEXT_PUBLIC_SUPABASE_URL**
   - Your Supabase project URL
   - Format: `https://your-project-id.supabase.co`
   - Found in Supabase Dashboard → Settings → API

3. **NEXT_PUBLIC_SUPABASE_ANON_KEY**
   - Your Supabase anonymous/public key
   - Found in Supabase Dashboard → Settings → API
   - This is safe to expose in the frontend

### Optional Variables:

- **NEXT_PUBLIC_GA_ID**: Google Analytics ID
- **NEXT_PUBLIC_GOOGLE_MAPS_KEY**: Google Maps API key

## Deployment Steps

### Option 1: Deploy via Vercel Dashboard (Recommended for First Deployment)

1. **Push to Git Repository**
   ```bash
   git add .
   git commit -m "Prepare for Vercel deployment"
   git push origin main
   ```

2. **Import Project in Vercel**
   - Go to https://vercel.com/dashboard
   - Click "Add New" → "Project"
   - Import your Git repository
   - Select the `frontend` directory as root directory (or keep as is if frontend is the root)

3. **Configure Project**
   - **Framework Preset**: Next.js (should be auto-detected)
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
   - **Install Command**: `npm install`

4. **Add Environment Variables**
   - Go to Settings → Environment Variables
   - Add each required variable:
     - `NEXT_PUBLIC_API_URL` = your production backend URL
     - `NEXT_PUBLIC_SUPABASE_URL` = your Supabase URL
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = your Supabase anon key

5. **Deploy**
   - Click "Deploy"
   - Wait for build to complete (~2-3 minutes)
   - Your app will be live at `https://your-project-name.vercel.app`

### Option 2: Deploy via Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   cd /Users/macbook/Desktop/buildstock.pro/buildstock-pro/frontend
   vercel
   ```

4. **Set Environment Variables**
   ```bash
   vercel env add NEXT_PUBLIC_API_URL production
   vercel env add NEXT_PUBLIC_SUPABASE_URL production
   vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
   ```

5. **Deploy to Production**
   ```bash
   vercel --prod
   ```

## Post-Deployment Checklist

- [ ] App loads without errors
- [ ] Navigation between pages works
- [ ] Authentication (Sign in/Sign up) connects to Supabase
- [ ] API calls work (check browser console for errors)
- [ ] Images load correctly
- [ ] Cart functionality works
- [ ] Checkout process works
- [ ] Responsive design works on mobile

## Custom Domain (Optional)

1. Go to your Vercel project Settings → Domains
2. Add your custom domain (e.g., `app.buildstock.pro`)
3. Update DNS records as instructed by Vercel
4. Wait for SSL certificate to be issued (automatic)

## Troubleshooting

### Build Errors

**Error: "Module not found"**
- Clear cache: `rm -rf .next node_modules`
- Reinstall: `npm install`
- Rebuild: `npm run build`

**Error: Environment variables not working**
- Ensure variables start with `NEXT_PUBLIC_` to be exposed to browser
- Check that variables are set in Vercel dashboard (not just in .env files)
- Redeploy after adding environment variables

### Runtime Errors

**API calls failing with CORS errors**
- Ensure backend allows requests from your Vercel domain
- Check that NEXT_PUBLIC_API_URL is correct (no trailing slashes)

**Supabase authentication not working**
- Verify NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are correct
- Check Supabase Dashboard → Authentication → URL Configuration
- Add your Vercel domain to Site URL and Redirect URLs

### Images Not Loading

- Ensure image domains are in `next.config.ts`
- Check that image URLs are accessible
- Verify Supabase storage permissions if using Supabase images

## Continuous Deployment

Once set up, Vercel will automatically deploy when you:
1. Push to your main branch
2. Create a pull request (preview deployment)

## Monitoring

- View build logs in Vercel Dashboard
- Check Functions logs for API route errors
- Use Vercel Analytics for performance monitoring
- Consider integrating Sentry for error tracking (already set up in project)

## Update .env.local for Local Development

Keep your `.env.local` file pointing to local development:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## Production Backend URL

Before deploying, you need to deploy your backend first and get its production URL. Common hosting options:
- **Render**: https://render.com
- **Railway**: https://railway.app
- **Fly.io**: https://fly.io
- **Heroku**: https://heroku.com

Update `NEXT_PUBLIC_API_URL` in Vercel with your deployed backend URL.

## Support

For issues specific to:
- **Vercel**: https://vercel.com/docs
- **Next.js**: https://nextjs.org/docs
- **Supabase**: https://supabase.com/docs
