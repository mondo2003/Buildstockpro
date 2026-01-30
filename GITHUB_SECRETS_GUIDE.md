# GitHub Secrets Configuration Guide - BuildStock Pro

**Generated:** 2026-01-30
**Repository:** https://github.com/mondo2003/Buildstockpro
**Status:** Ready for Configuration

---

## Overview

This guide provides complete configuration for all GitHub Secrets and Variables needed for BuildStock Pro CI/CD pipelines. The GitHub Actions workflows deploy frontend to Vercel, backend to Railway, and run automated merchant sync jobs.

### Workflow Files
- `.github/workflows/ci-cd.yml` - CI/CD pipeline (lint, test, build, deploy)
- `.github/workflows/merchant-sync.yml` - Daily merchant sync automation

---

## Part 1: GitHub Secrets (Encrypted)

Secrets are encrypted values that are never exposed in logs. Add them in:
**Settings → Secrets and variables → Actions → New repository secret**

### Core Application Secrets

#### 1. JWT_SECRET ✅ **VALUE READY**
```
lUhYmXXdt8U8JqgDjyeXrkt9IiRJu7gJQR6NRHoN/oU=
```
- **Purpose:** JWT token signing for authentication
- **Used in:** Backend authentication, CI/CD testing
- **Source:** Auto-generated (already secure)
- **Required:** YES - Application will not work without this

#### 2. SYNC_API_KEY ✅ **VALUE READY**
```
30kH8aXQECPjGZsBSqROode5oOS4CG7BEv/lLdaiiXQ=
```
- **Purpose:** Secures merchant sync endpoints (X-SYNC-API-KEY header)
- **Used in:** Merchant sync workflow, backend API middleware
- **Source:** Auto-generated (already secure)
- **Required:** YES - Sync endpoints will be unprotected without this

### Supabase Secrets ✅ **VALUES READY**

#### 3. SUPABASE_URL
```
https://xrhlumtimbmglzrfrnnk.supabase.co
```
- **Purpose:** Supabase project API endpoint
- **Used in:** All jobs that interact with database
- **Source:** Supabase Dashboard → Settings → API
- **Required:** YES - Database connection

#### 4. SUPABASE_ANON_KEY
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhyaGx1bXRpbWJtZ2x6cmZybm5rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk1MTc1MDgsImV4cCI6MjA4NTA5MzUwOH0.fvE4LYnPQ0HI7JiChZdDgLKcnyk3WdeS2iLLn4cYMRw
```
- **Purpose:** Supabase anonymous/public key
- **Used in:** Frontend and backend (client-side access)
- **Source:** Supabase Dashboard → Settings → API → anon public
- **Required:** YES - Public API access

#### 5. SUPABASE_SERVICE_ROLE_KEY
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhyaGx1bXRpbWJtZ2x6cmZybm5rIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTUxNzUwOCwiZXhwIjoyMDg1MDkzNTA4fQ.qZ1MJN8LY8xI_HFqJH3vC6OW2PHGB0uPkLPLcKV8qmE
```
- **Purpose:** Supabase service role key (bypasses RLS)
- **Used in:** Backend operations, merchant sync
- **Source:** Supabase Dashboard → Settings → API → service_role
- **Required:** YES - Admin database operations
- **WARNING:** Never use in frontend code!

### Database Secrets ⚠️ **NEEDS VALUE**

#### 6. DATABASE_URL
**YOU NEED TO GET THIS VALUE:**
```
postgresql://postgres.xrhlumtimbmglzrfrnnk:[YOUR-PASSWORD]@aws-0-eu-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true
```
- **Purpose:** Direct PostgreSQL connection string
- **Used in:** Backend tests, merchant sync job
- **Source:** Supabase Dashboard → Settings → Database → Connection String (Transaction pooler)
- **Required:** YES - Database migrations and queries
- **How to get:**
  1. Go to https://supabase.com/dashboard/project/xrhlumtimbmglzrfrnnk/settings/database
  2. Scroll to "Database Password" section
  3. Copy the password (it's not shown for security)
  4. Replace `[YOUR-PASSWORD]` in the URL above

**Format:** Transaction pooler (port 6543) for serverless functions

### Deployment Tokens ⚠️ **YOU NEED TO GET THESE**

#### 7. RAILWAY_TOKEN ⚠️ **NEEDS VALUE**
- **Purpose:** Railway deployment authentication
- **Used in:** CI/CD deploy-backend job
- **Source:** https://railway.app/account → API Tokens → New Token
- **Required:** YES - Backend deployment to Railway
- **How to create:**
  1. Go to https://railway.app/
  2. Login or create account
  3. Click your avatar → Settings → API Tokens
  4. Click "New Token"
  5. Name it "GitHub Actions" and copy the token
  6. Paste as GitHub Secret

#### 8. RAILWAY_SERVICE_NAME ⚠️ **NEEDS VALUE**
- **Purpose:** Railway service to deploy to
- **Used in:** CI/CD deploy-backend job
- **Source:** Your Railway project service name
- **Required:** YES - Target deployment service
- **Example:** `buildstock-pro-backend`
- **How to get:**
  1. Create a new project in Railway: https://railway.app/new
  2. Import from GitHub repo
  3. Note the service name (usually your repo name)

#### 9. VERCEL_TOKEN ⚠️ **NEEDS VALUE**
- **Purpose:** Vercel deployment authentication
- **Used in:** CI/CD deploy-frontend job
- **Source:** https://vercel.com/dashboard → Settings → Tokens
- **Required:** YES - Frontend deployment to Vercel
- **How to create:**
  1. Go to https://vercel.com/dashboard
  2. Login or create account
  3. Click your avatar → Settings → Tokens
  4. Click "Create Token"
  5. Name it "GitHub Actions" and copy the token
  6. Paste as GitHub Secret

### Merchant API Keys (Optional)

These are only needed if you have API access to these merchants:

#### 10. SCREWFIX_API_KEY (Optional)
- **Purpose:** Screwfix merchant product sync
- **Used in:** Merchant sync workflow
- **Required:** NO - Only if you have Screwfix API access

#### 11. WICKES_API_KEY (Optional)
- **Purpose:** Wickes merchant product sync
- **Used in:** Merchant sync workflow
- **Required:** NO - Only if you have Wickes API access

#### 12. BANDQ_API_KEY (Optional)
- **Purpose:** B&Q merchant product sync
- **Used in:** Merchant sync workflow
- **Required:** NO - Only if you have B&Q API access

#### 13. JEWSON_API_KEY (Optional)
- **Purpose:** Jewson merchant product sync
- **Used in:** Merchant sync workflow
- **Required:** NO - Only if you have Jewson API access

### Notification Secrets (Optional)

#### 14. SLACK_WEBHOOK_URL (Optional)
- **Purpose:** Slack notifications for deployment/sync status
- **Used in:** All workflows (success/failure notifications)
- **Source:** https://api.slack.com/apps → Create App → Incoming Webhooks
- **Required:** NO - Only if you want Slack notifications
- **How to create:**
  1. Go to https://api.slack.com/apps
  2. Create New App → From scratch
  3. Enable "Incoming Webhooks"
  4. Click "Add New Webhook to Workspace"
  5. Select channel and copy the webhook URL

#### 15. NOTIFICATION_EMAIL (Optional)
- **Purpose:** Email notifications for deployment failures
- **Used in:** CI/CD notify-failure job
- **Required:** NO - Only if you want email notifications
- **Example:** `your-email@gmail.com`

#### 16. EMAIL_USERNAME (Optional)
- **Purpose:** Gmail username for sending notifications
- **Used in:** CI/CD notify-failure job
- **Required:** NO - Only if using email notifications
- **Example:** `your-email@gmail.com`

#### 17. EMAIL_PASSWORD (Optional)
- **Purpose:** Gmail app password for sending notifications
- **Used in:** CI/CD notify-failure job
- **Source:** https://myaccount.google.com/apppasswords
- **Required:** NO - Only if using email notifications
- **How to create:**
  1. Enable 2FA on your Google account
  2. Go to https://myaccount.google.com/apppasswords
  3. Generate app password for "Mail"
  4. Copy the 16-character password (spaces included)

#### 18. BACKEND_URL (Optional for sync health check)
- **Purpose:** Backend URL for sync health checks
- **Used in:** Merchant sync health check job
- **Required:** NO - Only for sync verification
- **Example:** `https://buildstock-pro-backend.up.railway.app`

---

## Part 2: GitHub Variables (Non-Secret)

Variables are visible in logs. Add them in:
**Settings → Secrets and variables → Actions → New repository variable**

### Frontend Variables

#### 1. SUPABASE_URL ✅ **VALUE READY**
```
https://xrhlumtimbmglzrfrnnk.supabase.co
```
- **Used in:** Frontend build
- **Purpose:** Supabase API URL

#### 2. SUPABASE_ANON_KEY ✅ **VALUE READY**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhyaGx1bXRpbWJtZ2x6cmZybm5rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk1MTc1MDgsImV4cCI6MjA4NTA5MzUwOH0.fvE4LYnPQ0HI7JiChZdDgLKcnyk3WdeS2iLLn4cYMRw
```
- **Used in:** Frontend build
- **Purpose:** Supabase public key

#### 3. FRONTEND_API_URL ⚠️ **UPDATE AFTER DEPLOYMENT**
```
https://buildstock-pro-backend.up.railway.app
```
- **Used in:** Frontend build
- **Purpose:** Backend API URL for frontend to call
- **How to get:** Deploy backend first, then copy Railway URL

#### 4. FRONTEND_URL ⚠️ **UPDATE AFTER DEPLOYMENT**
```
https://buildstock-pro.vercel.app
```
- **Used in:** Smoke tests
- **Purpose:** Frontend URL for health checks
- **How to get:** Deploy frontend first, then copy Vercel URL

#### 5. BACKEND_URL ⚠️ **UPDATE AFTER DEPLOYMENT**
```
https://buildstock-pro-backend.up.railway.app
```
- **Used in:** Smoke tests, sync health check
- **Purpose:** Backend URL for health checks
- **How to get:** Deploy backend first, then copy Railway URL

---

## Part 3: Step-by-Step Setup

### Step 1: Add Core Secrets (15 minutes)

1. Go to: https://github.com/mondo2003/Buildstockpro/settings/secrets/actions
2. Click "New repository secret"
3. Add secrets in this order:

**✅ Ready Values (Copy-Paste):**
```
Name: JWT_SECRET
Secret: lUhYmXXdt8U8JqgDjyeXrkt9IiRJu7gJQR6NRHoN/oU=

Name: SYNC_API_KEY
Secret: 30kH8aXQECPjGZsBSqROode5oOS4CG7BEv/lLdaiiXQ=

Name: SUPABASE_URL
Secret: https://xrhlumtimbmglzrfrnnk.supabase.co

Name: SUPABASE_ANON_KEY
Secret: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhyaGx1bXRpbWJtZ2x6cmZybm5rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk1MTc1MDgsImV4cCI6MjA4NTA5MzUwOH0.fvE4LYnPQ0HI7JiChZdDgLKcnyk3WdeS2iLLn4cYMRw

Name: SUPABASE_SERVICE_ROLE_KEY
Secret: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhyaGx1bXRpbWJtZ2x6cmZybm5rIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTUxNzUwOCwiZXhwIjoyMDg1MDkzNTA4fQ.qZ1MJN8LY8xI_HFqJH3vC6OW2PHGB0uPkLPLcKV8qmE
```

### Step 2: Get Supabase Database Password (5 minutes)

1. Go to: https://supabase.com/dashboard/project/xrhlumtimbmglzrfrnnk/settings/database
2. Find "Database Password" section
3. Click "Show password" or generate new one
4. Copy the password
5. Create GitHub Secret:
```
Name: DATABASE_URL
Secret: postgresql://postgres.xrhlumtimbmglzrfrnnk:[PASTE-PASSWORD]@aws-0-eu-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true
```

### Step 3: Get Railway Token (5 minutes)

1. Go to: https://railway.app/
2. Login or create account (FREE)
3. Click your avatar → Settings → API Tokens
4. Click "New Token"
5. Name it "GitHub Actions"
6. Copy the token
7. Add to GitHub Secrets:
```
Name: RAILWAY_TOKEN
Secret: [paste token]

Name: RAILWAY_SERVICE_NAME
Secret: buildstock-pro-backend
```

### Step 4: Get Vercel Token (5 minutes)

1. Go to: https://vercel.com/dashboard
2. Login or create account (FREE)
3. Click your avatar → Settings → Tokens
4. Click "Create Token"
5. Name it "GitHub Actions"
6. Copy the token
7. Add to GitHub Secret:
```
Name: VERCEL_TOKEN
Secret: [paste token]
```

### Step 5: Add GitHub Variables (5 minutes)

1. Go to: https://github.com/mondo2003/Buildstockpro/settings/variables/actions
2. Click "New repository variable"
3. Add these variables:
```
Name: SUPABASE_URL
Value: https://xrhlumtimbmglzrfrnnk.supabase.co

Name: SUPABASE_ANON_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhyaGx1bXRpbWJtZ2x6cmZybm5rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk1MTc1MDgsImV4cCI6MjA4NTA5MzUwOH0.fvE4LYnPQ0HI7JiChZdDgLKcnyk3WdeS2iLLn4cYMRw

Name: FRONTEND_API_URL
Value: https://buildstock-pro-backend.up.railway.app
(Update this after deploying backend)

Name: FRONTEND_URL
Value: https://buildstock-pro.vercel.app
(Update this after deploying frontend)

Name: BACKEND_URL
Value: https://buildstock-pro-backend.up.railway.app
(Update this after deploying backend)
```

### Step 6: (Optional) Configure Notifications

**For Slack:**
1. Create Slack app at https://api.slack.com/apps
2. Enable Incoming Webhooks
3. Add to GitHub:
```
Name: SLACK_WEBHOOK_URL
Secret: [paste webhook URL]
```

**For Email:**
1. Enable 2FA on Google account
2. Generate app password at https://myaccount.google.com/apppasswords
3. Add to GitHub:
```
Name: NOTIFICATION_EMAIL
Secret: your-email@gmail.com

Name: EMAIL_USERNAME
Secret: your-email@gmail.com

Name: EMAIL_PASSWORD
Secret: [paste 16-char app password]
```

---

## Part 4: Verification Checklist

Before pushing to main branch, verify:

- [x] JWT_SECRET added ✅ (have value)
- [x] SYNC_API_KEY added ✅ (have value)
- [x] SUPABASE_URL added ✅ (have value)
- [x] SUPABASE_ANON_KEY added ✅ (have value)
- [x] SUPABASE_SERVICE_ROLE_KEY added ✅ (have value)
- [ ] DATABASE_URL added ⚠️ (need to get password)
- [ ] RAILWAY_TOKEN added ⚠️ (need to create)
- [ ] RAILWAY_SERVICE_NAME added ⚠️ (need to create project)
- [ ] VERCEL_TOKEN added ⚠️ (need to create)
- [ ] SLACK_WEBHOOK_URL added (optional)
- [ ] EMAIL_NOTIFICATION_* added (optional)

**Variables to add:**
- [x] SUPABASE_URL variable ✅ (have value)
- [x] SUPABASE_ANON_KEY variable ✅ (have value)
- [ ] FRONTEND_API_URL variable ⚠️ (update after backend deploy)
- [ ] FRONTEND_URL variable ⚠️ (update after frontend deploy)
- [ ] BACKEND_URL variable ⚠️ (update after backend deploy)

---

## Part 5: Testing Configuration

### Test CI/CD Without Deploying

1. Create a feature branch:
```bash
git checkout -b test/github-actions
```

2. Make a small change (e.g., update README)

3. Push and create PR:
```bash
git push origin test/github-actions
```

4. Go to Actions tab: https://github.com/mondo2003/Buildstockpro/actions

5. Verify workflow runs:
- ✓ Frontend lint passes
- ✓ Frontend build passes
- ✓ Backend lint passes
- ✓ Backend build passes
- ✓ Backend tests pass (may fail if DATABASE_URL not set)

### Test Deployment

Once all secrets are configured:

1. Merge PR to main
2. Watch Actions tab for deployment
3. Verify:
- ✓ Backend deploys to Railway
- ✓ Frontend deploys to Vercel
- ✓ Smoke tests pass
- ✓ URLs are accessible

---

## Part 6: Troubleshooting

### Workflow not starting?
- Check branch name matches (main/develop)
- Verify workflow file syntax is correct
- Ensure GitHub Actions is enabled

### Job failing immediately?
- Check all required secrets are set
- Verify secret names match exactly (case-sensitive)
- Check for typos in workflow YAML

### Build failing?
- Verify all secrets are correct
- Check DATABASE_URL has valid password
- Ensure Supabase keys are not expired

### Deployment failing?
- Verify deployment tokens are valid
- Check service/project names match
- Ensure Railway/Vercel projects exist
- Review deployment logs for specific errors

### Tests failing?
- DATABASE_URL may be incorrect
- Supabase keys may have insufficient permissions
- JWT_SECRET may not match what backend expects

---

## Part 7: Security Best Practices

1. **Never commit secrets to git** - Always use GitHub Secrets
2. **Rotate secrets regularly** - Every 90 days for production
3. **Use different secrets for environments** - Dev/staging/prod
4. **Monitor secret usage** - Check GitHub Actions logs for exposure
5. **Limit secret permissions** - Only grant what's necessary
6. **Enable 2FA** - On GitHub, Railway, Vercel, Supabase accounts
7. **Audit access regularly** - Review who has access to secrets

---

## Part 8: Quick Reference

### Where to Find Secrets

| Secret | Source | Link |
|--------|--------|------|
| JWT_SECRET | Auto-generated | ✅ Have it |
| SYNC_API_KEY | Auto-generated | ✅ Have it |
| SUPABASE_URL | Supabase Dashboard | [Link](https://supabase.com/dashboard/project/xrhlumtimbmglzrfrnnk/settings/api) |
| SUPABASE_ANON_KEY | Supabase Dashboard | [Link](https://supabase.com/dashboard/project/xrhlumtimbmglzrfrnnk/settings/api) |
| SUPABASE_SERVICE_ROLE_KEY | Supabase Dashboard | [Link](https://supabase.com/dashboard/project/xrhlumtimbmglzrfrnnk/settings/api) |
| DATABASE_URL | Supabase Dashboard | [Link](https://supabase.com/dashboard/project/xrhlumtimbmglzrfrnnk/settings/database) |
| RAILWAY_TOKEN | Railway Settings | [Link](https://railway.app/account) |
| VERCEL_TOKEN | Vercel Settings | [Link](https://vercel.com/dashboard/settings/tokens) |
| SLACK_WEBHOOK_URL | Slack App Settings | [Link](https://api.slack.com/apps) |

### Secret Status

✅ **Ready to use** (copy from this guide)
⚠️ **Need to obtain** (follow instructions)
❌ **Optional** (not required)

---

## Summary

**Total Secrets Required:** 9
- ✅ Ready: 5 (JWT_SECRET, SYNC_API_KEY, SUPABASE_*)
- ⚠️ Need to get: 3 (DATABASE_URL, RAILWAY_TOKEN, VERCEL_TOKEN)
- ❌ Optional: 1+ (SLACK_WEBHOOK_URL, merchant keys)

**Total Variables Required:** 5
- ✅ Ready: 2 (SUPABASE_*)
- ⚠️ Update after deploy: 3 (FRONTEND_API_URL, FRONTEND_URL, BACKEND_URL)

**Estimated Setup Time:** 30 minutes

**Next Steps:**
1. Copy all "ready" secrets to GitHub
2. Obtain Railway and Vercel tokens
3. Get Supabase database password
4. Create GitHub variables
5. Test with feature branch
6. Deploy to production

---

**Generated from:** `/Users/macbook/Desktop/buildstock.pro/PRODUCTION_SECREDS.txt`
**Related docs:**
- PRODUCTION_SECRETS.txt - Full secrets documentation
- CHECKPOINT-SUMMARY.md - Project status
- .github/workflows/ci-cd.yml - CI/CD pipeline
- .github/workflows/merchant-sync.yml - Merchant sync automation
