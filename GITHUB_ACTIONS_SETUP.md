# GitHub Actions Price Sync - Setup & Testing Guide

**Created:** 2026-01-31
**Purpose:** Enable and test automated price syncing every 6 hours

---

## 📋 Overview

The price sync workflow (`.github/workflows/price-sync.yml`) will automatically:
- Scrape prices from all retailers every 6 hours
- Update the database with latest prices
- Send notifications on success/failure
- Clean up old price data daily

---

## ✅ Prerequisites Checklist

Before enabling the workflow, verify:

- [ ] Backend deployed to Railway (https://buildstock-api.onrender.com)
- [ ] Frontend deployed to Vercel (https://buildstock.pro)
- [ ] Database migrations applied (Agent 1 tasks complete)
- [ ] Scraper tested locally (Agent 2 tasks complete)
- [ ] `sync-prices.ts` script works locally

---

## 🔧 Step 1: Configure GitHub Secrets

1. Go to your GitHub repository
2. Navigate to **Settings → Secrets and variables → Actions**
3. Click **New repository secret** and add:

### Required Secrets:

| Secret Name | Value | Source |
|-------------|-------|--------|
| `DATABASE_URL` | Your Supabase database connection string | Railway env vars or Supabase dashboard |
| `SUPABASE_URL` | `https://xrhlumtimbmglzrfrnnk.supabase.co` | Supabase dashboard |
| `SUPABASE_SERVICE_ROLE_KEY` | Your service role key | Supabase dashboard → Settings → API |

### Optional Secrets (for notifications):

| Secret Name | Value | Source |
|-------------|-------|--------|
| `SLACK_WEBHOOK_URL` | Slack webhook URL | Slack App settings |
| `NOTIFICATION_EMAIL` | Your email address | For failure alerts |
| `EMAIL_USERNAME` | Gmail address | For sending alerts |
| `EMAIL_PASSWORD` | Gmail app password | Google Account settings |

---

## 🧪 Step 2: Test Locally First

Before enabling the GitHub workflow, test the sync script locally:

```bash
cd /Users/macbook/Desktop/buildstock.pro/buildstock-pro/backend

# Set environment variables
export DATABASE_URL="postgresql://..."
export SUPABASE_URL="https://xrhlumtimbmglzrfrnnk.supabase.co"
export SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"

# Test with mock data first
export USE_MOCK_DATA=true
bun run sync-prices

# If successful, test with real scraping
export USE_MOCK_DATA=false
bun run sync-prices
```

**Expected Output:**
```
========================================
  BuildStock Pro - Price Sync
========================================

Started at: 2026-01-31T10:00:00.000Z

==================================================
  Retailer: SCREWFIX
==================================================

[screwfix] Scraping category: power-tools...
  ✅ Scraped 20 products
[screwfix] Scraping category: hand-tools...
  ✅ Scraped 20 products
...

========================================
  Price Sync Complete
========================================

Summary:
  - Total products scraped: 120
  - Total errors: 0
  - Duration: 245.32s
  - Completed at: 2026-01-31T10:04:05.000Z

Database Statistics:
  - Total products in DB: 450
  - Retailers: screwfix, bq, wickes, travis-perkins
  - Categories: power-tools, hand-tools, electrical, plumbing
  - Last updated: 2026-01-31T10:04:05.000Z

✅ All price sync operations completed successfully!
```

---

## 🚀 Step 3: Push Workflow to GitHub

The workflow file is already created at `.github/workflows/price-sync.yml`. To enable it:

```bash
cd /Users/macbook/Desktop/buildstock.pro

# Add the workflow file
git add .github/workflows/price-sync.yml
git add buildstock-pro/backend/src/scripts/sync-prices.ts
git add buildstock-pro/backend/package.json

# Commit the changes
git commit -m "Add automated price sync workflow

- Created sync-prices.ts script for scraping
- Added GitHub Actions workflow for 6-hour sync
- Configured notifications and cleanup job
- Added USE_MOCK_DATA environment variable"

# Push to main branch
git push origin main
```

---

## 🧪 Step 4: Manual Test Run (Recommended)

Before relying on the schedule, test manually:

1. Go to GitHub repository → **Actions** tab
2. Find **"Price Sync"** workflow in the left sidebar
3. Click **"Run workflow"** button
4. Select branch: `main`
5. **For first test:** Enable **"Use mock data for testing"** toggle
6. Click **"Run workflow"**

**Monitor the run:**
1. Click on the workflow run that started
2. Watch the logs in real-time
3. Verify each step completes successfully
4. Check for any errors

**If test with mock data succeeds:**
1. Run again **without** "Use mock data" toggle
2. Verify real scraping works

---

## ⏰ Step 5: Verify Scheduled Runs

Once manual tests pass, the workflow will run automatically:

**Schedule:** Every 6 hours at 0:00, 6:00, 12:00, 18:00 UTC

**To verify scheduled runs are working:**
1. Wait for next scheduled time (or check past runs)
2. Go to **Actions** tab
3. Click on **"Price Sync"** workflow
4. View recent runs - should see runs every 6 hours

**To check the exact schedule in UTC:**
```bash
# Current time in UTC
date -u

# Next run times (cron: 0 */6 * * *)
# 00:00 UTC (midnight)
# 06:00 UTC (6am)
# 12:00 UTC (noon)
# 18:00 UTC (6pm)
```

---

## 📊 Step 6: Monitor Database Updates

Verify the workflow is updating prices correctly:

```sql
-- Connect to Supabase SQL Editor
-- Check latest price updates
SELECT
  retailer,
  COUNT(*) as products,
  MAX(scraped_at) as last_update
FROM scraped_prices
GROUP BY retailer
ORDER BY last_update DESC;

-- View prices scraped in last 24 hours
SELECT
  retailer,
  product_name,
  price,
  in_stock,
  scraped_at
FROM scraped_prices
WHERE scraped_at > NOW() - INTERVAL '24 hours'
ORDER BY scraped_at DESC
LIMIT 20;

-- Check if prices are being updated (compare today vs yesterday)
SELECT
  retailer,
  COUNT(DISTINCT retailer_product_id) as unique_products,
  COUNT(*) as total_records,
  MIN(scraped_at) as first_scrape,
  MAX(scraped_at) as last_scrape
FROM scraped_prices
WHERE scraped_at > NOW() - INTERVAL '7 days'
GROUP BY retailer;
```

---

## 🔔 Step 7: Configure Notifications (Optional)

### Slack Notifications

1. Create a Slack App: https://api.slack.com/apps
2. Enable **Incoming Webhooks**
3. Copy the webhook URL
4. Add to GitHub Secrets: `SLACK_WEBHOOK_URL`

### Email Notifications

1. Generate a Gmail App Password:
   - Google Account → Security → 2-Step Verification → App passwords
2. Add to GitHub Secrets:
   - `NOTIFICATION_EMAIL`: Your email
   - `EMAIL_USERNAME`: Your Gmail address
   - `EMAIL_PASSWORD`: Generated app password

---

## 🐛 Troubleshooting

### Issue: Workflow doesn't appear in Actions tab

**Cause:** Workflow file hasn't been pushed to main branch yet

**Solution:**
```bash
git add .github/workflows/price-sync.yml
git commit -m "Add price sync workflow"
git push origin main
```

---

### Issue: Workflow fails with "DATABASE_URL not found"

**Cause:** GitHub secrets not configured

**Solution:**
1. Go to **Settings → Secrets and variables → Actions**
2. Add `DATABASE_URL` secret
3. Re-run the workflow

---

### Issue: Scraper fails with "rate limit exceeded"

**Cause:** Rate limiting too aggressive

**Solution:**
1. Check `SCRAPER_RATE_LIMIT_MS` in Railway environment variables
2. Increase to `3000` (3 seconds) or `5000` (5 seconds)
3. Reduce `SCRAPER_MAX_CONCURRENT` to `1` or `2`

---

### Issue: Workflow runs but no data appears in database

**Cause:** `USE_MOCK_DATA=true` or scraper not implemented

**Solution:**
1. Check logs for "Using mock data" message
2. Ensure `USE_MOCK_DATA=false` in Railway env vars (not GitHub)
3. Verify Agent 2's scraper implementation is complete

---

### Issue: "Module not found" errors in workflow

**Cause:** Dependencies not installed in workflow

**Solution:**
1. Check `buildstock-pro/backend/package.json` has all dependencies
2. Verify workflow runs `bun install` in correct directory
3. Check if dependencies are properly listed

---

## 📈 Monitoring & Maintenance

### Daily Checks

- [ ] Verify last workflow run succeeded
- [ ] Check database has recent price updates
- [ ] Monitor for error notifications

### Weekly Maintenance

- [ ] Review workflow logs for warnings
- [ ] Check database size (cleanup job should keep it manageable)
- [ ] Verify all retailers are being scraped

### Monthly Optimization

- [ ] Review scraping performance metrics
- [ ] Adjust rate limits if needed
- [ ] Add new retailers if required
- [ ] Update scraper selectors if websites change

---

## 🎯 Success Criteria

You'll know the workflow is working when:

1. ✅ **Actions tab shows runs every 6 hours** (green checkmarks)
2. ✅ **Database has new scraped_at timestamps** (verify with SQL above)
3. ✅ **Frontend shows "Live Price" badges** (https://buildstock.pro/search)
4. ✅ **No error notifications** (or expected error notifications only)
5. ✅ **Cleanup job runs daily** (check workflow runs)

---

## 📚 Related Files

- `.github/workflows/price-sync.yml` - Main workflow file
- `buildstock-pro/backend/src/scripts/sync-prices.ts` - Sync script
- `buildstock-pro/backend/src/services/priceScraper.ts` - Scraper service
- `buildstock-pro/frontend/lib/api.ts` - Frontend API client
- `PRODUCTION_ENV_VARS.md` - Environment variables guide

---

## 🔄 Next Steps After Workflow is Live

1. **Monitor first few scheduled runs** - Ensure they complete successfully
2. **Verify frontend displays live prices** - Check "Live Price" badges appear
3. **Set up dashboards** - Create monitoring for sync performance
4. **Document performance** - Track how long syncs take, error rates
5. **Optimize as needed** - Adjust rate limits, concurrent requests

---

**Last Updated:** 2026-01-31
**Status:** Ready to enable once Agents 1 & 2 complete their work
