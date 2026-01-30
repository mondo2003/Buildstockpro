# Quick Deployment Guide - BuildStop Landing Page

## ✓ What's Been Done

1. **API_URL Added** to config.js pointing to Supabase Functions
2. **Build Process Fixed** to include static files in production
3. **All Changes Committed** and ready for deployment

## Current Configuration

**API URL:** `https://xrhlumtimbmglzrfrnnk.supabase.co/functions/v1`
**App URL:** `https://buildstock.pro`
**Landing Page:** `https://buildstock-landing.vercel.app`

## How to Deploy

### Option 1: Via Vercel Dashboard (Easiest)
1. Go to https://vercel.com/mondo2003s-projects/buildstock-landing
2. Click "Deployments" tab
3. Click "Redeploy" button
4. Wait for deployment to complete

### Option 2: Via Vercel CLI
```bash
cd /Users/macbook/Desktop/buildstock.pro/BuildStop-Landing-Page
vercel login
vercel --prod
```

## After Deployment - Verify It Works

### 1. Check Config
Visit: https://buildstock-landing.vercel.app/config.js

You should see:
```javascript
const API_URL = 'https://xrhlumtimbmglzrfrnnk.supabase.co/functions/v1';
```

### 2. Check Browser Console
1. Open https://buildstock-landing.vercel.app
2. Press F12 (DevTools)
3. Check console shows:
```
BuildStop Pro Config: Running in PRODUCTION mode
App URL: https://buildstock.pro
API URL: https://xrhlumtimbmglzrfrnnk.supabase.co/functions/v1
```

### 3. Test Search
1. Type "lumber" in the search box
2. Press Enter or click Search
3. Should redirect to: `https://buildstock.pro/search?q=lumber`

### 4. Test API Connection
In browser console, run:
```javascript
fetch('https://xrhlumtimbmglzrfrnnk.supabase.co/functions/v1/health')
  .then(r => r.json())
  .then(console.log)
```
Should return: `{status: "ok", timestamp: "..."} `

## Troubleshooting

**Config.js returns 404?**
- The deployment didn't include the static files
- Redeploy and ensure "npm run build" runs successfully

**API_URL undefined in console?**
- Clear browser cache (Cmd+Shift+R)
- Check config.js is loaded before other scripts

**Search not working?**
- Check browser console for errors
- Verify buildstock.pro/search is accessible

## Files Modified

- `/config.js` - Added API_URL
- `/package.json` - Updated build script
- `/vercel.json` - Added build configuration
- `/dist/` - Production build (ready to deploy)

## Latest Commits

```
ebae489 Add deployment report and verification guide
7e86324 Update build configuration and add API URL
d4f0edb Add Supabase API URL configuration to landing page
```

## Support

If issues persist:
1. Check Vercel deployment logs
2. Verify Supabase functions are deployed
3. Test API endpoints directly
4. Review full report: `LANDING_PAGE_DEPLOYMENT_REPORT.md`
