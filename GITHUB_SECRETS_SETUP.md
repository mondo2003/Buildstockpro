# GitHub Secrets Setup Guide for Merchant Sync Cron Job

This guide walks you through setting up all required GitHub Actions secrets for the merchant data sync workflow.

## Overview

The merchant sync workflow requires several secrets to connect to your database, authenticate requests, and configure the runtime environment. These secrets must be added to your GitHub repository before the workflow can run successfully.

## Required Secrets

Here are all the secrets needed for the merchant-sync.yml workflow:

### Required Secrets (Must Add)

1. **DATABASE_URL** - PostgreSQL database connection string
2. **JWT_SECRET** - Secret key for JWT token authentication
3. **SYNC_API_KEY** - API key for securing sync endpoints
4. **CORS_ORIGIN** - Allowed origin for CORS (your Vercel frontend URL)

### Optional Secrets (Recommended)

5. **REDIS_URL** - Redis connection string for caching
6. **SENTRY_DSN** - Sentry DSN for error tracking and monitoring

---

## Step-by-Step Setup Instructions

### 1. Navigate to GitHub Secrets Settings

1. Go to your GitHub repository
2. Click on **Settings** tab (top navigation)
3. In the left sidebar, click on **Secrets and variables** → **Actions**
4. You'll see the "Actions secrets and variables" page

**Screenshot Placeholder**: Show Settings → Secrets and variables → Actions

### 2. Gather Secret Values

Before adding secrets to GitHub, collect the following values:

#### DATABASE_URL
- **Source**: Railway PostgreSQL database
- **How to get**:
  1. Go to your Railway project
  2. Select your PostgreSQL database
  3. Click on "Connect" tab
  4. Copy the "Connection URL"
- **Format**: `postgresql://postgres:[password]@[host].railway.app:5432/railway`
- **Status**: ✅ Add after backend deployment

#### JWT_SECRET
- **Source**: Generate a secure random string
- **How to get**: Use one of these methods:
  - **Method 1** (Recommended): Run `openssl rand -base64 32` in terminal
  - **Method 2**: Use a password manager to generate a 32+ character random string
  - **Method 3**: Use an online generator like https://www.uuidgenerator.net/api/guid (use multiple)
- **Format**: 32+ character random string
- **Status**: ✅ Add now

#### SYNC_API_KEY
- **Source**: Generate a secure random string
- **How to get**: Use the same methods as JWT_SECRET
- **Purpose**: Authenticates cron job requests to sync endpoints
- **Format**: 32+ character random string (different from JWT_SECRET)
- **Status**: ✅ Add now

#### CORS_ORIGIN
- **Source**: Your Vercel deployment URL
- **How to get**:
  1. Deploy your frontend to Vercel
  2. Copy the deployed URL
- **Format**: `https://your-app.vercel.app` (no trailing slash)
- **Status**: ⏳ Add after frontend deployment

#### REDIS_URL (Optional)
- **Source**: Railway Redis instance (if you have one)
- **How to get**:
  1. Go to Railway project
  2. Select Redis database
  3. Copy the connection URL
- **Format**: `redis://default:[password]@[host].railway.app:6379`
- **Status**: ⏳ Add after Redis deployment

#### SENTRY_DSN (Optional)
- **Source**: Sentry.io project
- **How to get**:
  1. Go to https://sentry.io
  2. Create a new project (platform: Bun/Node.js)
  3. Go to Settings → Client Keys (DSN)
  4. Copy the DSN URL
- **Format**: `https://[key]@[host].ingest.sentry.io/[project-id]`
- **Status**: ⏳ Add after Sentry setup

### 3. Add Each Secret to GitHub

For each secret:

1. Click the **"New repository secret"** button
2. Enter the **Name** (exactly as shown below)
3. Paste the **Secret** value
4. Click **"Add secret"**

**Screenshot Placeholder**: Show "New repository secret" form with Name and Secret fields

#### Add in This Order:

1. **DATABASE_URL**
   - Name: `DATABASE_URL`
   - Value: `[Your Railway PostgreSQL connection URL]`

2. **JWT_SECRET**
   - Name: `JWT_SECRET`
   - Value: `[Your generated JWT secret]`

3. **SYNC_API_KEY**
   - Name: `SYNC_API_KEY`
   - Value: `[Your generated sync API key]`

4. **CORS_ORIGIN**
   - Name: `CORS_ORIGIN`
   - Value: `https://buildstock-pro.vercel.app` (or your Vercel URL)

5. **REDIS_URL** (Optional)
   - Name: `REDIS_URL`
   - Value: `[Your Railway Redis connection URL]`

6. **SENTRY_DSN** (Optional)
   - Name: `SENTRY_DSN`
   - Value: `[Your Sentry DSN URL]`

**Screenshot Placeholder**: Show list of all secrets after adding them

### 4. Verify Secrets Are Added

After adding all secrets:

1. Scroll through the secrets list
2. Verify all required secrets are present
3. Check for typos in secret names (must match exactly)
4. Note: Secret values are hidden (shown as ****)

**Screenshot Placeholder**: Show the secrets list with all 4-6 secrets

---

## Testing the Workflow

After setting up secrets, test the merchant sync workflow:

### Manual Trigger Test

1. Go to your GitHub repository
2. Click on **Actions** tab
3. Select **"Merchant Data Sync"** workflow from the left sidebar
4. Click **"Run workflow"** button
5. Select the branch (usually `main`)
6. Click **"Run workflow"** to start

**Screenshot Placeholder**: Show "Run workflow" button and dropdown

### Monitor the Run

1. Watch the workflow run in real-time
2. Click on the running workflow job to see logs
3. Check for any errors related to missing or incorrect secrets
4. Successful run will show green checkmark

**Screenshot Placeholder**: Show successful workflow run with green checkmark

### Troubleshooting Common Issues

#### Error: "DATABASE_URL not found"
- **Cause**: DATABASE_URL secret not added or misspelled
- **Fix**: Verify secret name is exactly `DATABASE_URL` (all caps)

#### Error: "JWT_SECRET not found"
- **Cause**: JWT_SECRET secret not added or misspelled
- **Fix**: Verify secret name is exactly `JWT_SECRET` (all caps)

#### Error: "Connection refused" or "Invalid connection string"
- **Cause**: DATABASE_URL format is incorrect
- **Fix**: Verify Railway connection URL format

#### Error: "CORS origin not allowed"
- **Cause**: CORS_ORIGIN mismatch or incorrect format
- **Fix**: Ensure URL format is `https://your-app.vercel.app` (no trailing slash)

#### Error: "Unauthorized" or "Invalid API key"
- **Cause**: SYNC_API_KEY missing or incorrect
- **Fix**: Verify SYNC_API_KEY secret is set correctly

---

## Security Best Practices

### Secret Management

1. **Never commit secrets to git** - Always use environment variables or secrets
2. **Use unique secrets** - Don't reuse JWT_SECRET as SYNC_API_KEY
3. **Rotate secrets regularly** - Update secrets every 90 days
4. **Use strong random values** - Minimum 32 characters for all secrets
5. **Limit secret access** - Only add secrets that are actually needed

### Secret Generation Commands

Generate secure secrets using these terminal commands:

```bash
# Generate JWT_SECRET
openssl rand -base64 32

# Generate SYNC_API_KEY
openssl rand -base64 32

# Alternative: Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Alternative: Using Python
python3 -c "import secrets; print(secrets.token_urlsafe(32))"
```

### Secret Storage Locations

| Secret | Source | Location to Find |
|--------|--------|------------------|
| DATABASE_URL | Railway | Railway Dashboard → Database → Connect |
| JWT_SECRET | Generated | Generate using openssl command above |
| SYNC_API_KEY | Generated | Generate using openssl command above |
| CORS_ORIGIN | Vercel | Your deployed Vercel app URL |
| REDIS_URL | Railway | Railway Dashboard → Redis → Connect |
| SENTRY_DSN | Sentry.io | Sentry Dashboard → Settings → Client Keys |

---

## Verification Checklist

Use this checklist to ensure all secrets are properly configured:

- [ ] DATABASE_URL added from Railway
- [ ] JWT_SECRET generated and added (32+ chars)
- [ ] SYNC_API_KEY generated and added (32+ chars, different from JWT_SECRET)
- [ ] CORS_ORIGIN set to Vercel frontend URL
- [ ] REDIS_URL added (if using Redis)
- [ ] SENTRY_DSN added (if using Sentry)
- [ ] All secret names verified (no typos)
- [ ] Manual workflow test completed successfully
- [ ] Workflow logs show no secret-related errors
- [ ] Schedule is set correctly (6 AM and 6 PM UTC)

---

## Post-Setup Steps

After successfully setting up secrets and testing the workflow:

1. **Monitor first scheduled run** - The workflow will run automatically at 6 AM and 6 PM UTC
2. **Set up notifications** - Consider adding Slack/Discord notifications for failures
3. **Review logs regularly** - Check GitHub Actions logs for any issues
4. **Update secrets as needed** - If database or endpoints change, update secrets

### Adding Failure Notifications (Optional)

Edit the workflow file to add notifications:

```yaml
- name: Notify on failure
  if: failure()
  run: |
    # Add your notification logic here
    # Example: curl to Slack webhook
    curl -X POST ${{ secrets.SLACK_WEBHOOK }} \
      -H 'Content-Type: application/json' \
      -d '{"text":"Merchant sync failed!"}'
```

---

## Quick Reference: Secret Names and Values

```
DATABASE_URL      = postgresql://postgres:password@host.railway.app:5432/railway
JWT_SECRET        = [32+ character random string]
SYNC_API_KEY      = [32+ character random string, different from JWT_SECRET]
CORS_ORIGIN       = https://buildstock-pro.vercel.app
REDIS_URL         = redis://default:password@host.railway.app:6379 (optional)
SENTRY_DSN        = https://key@host.ingest.sentry.io/project-id (optional)
```

---

## Need Help?

If you encounter issues:

1. **Check the workflow logs** - GitHub Actions → Merchant Data Sync → Click on run
2. **Verify secret names** - Must match exactly (case-sensitive)
3. **Test database connection** - Verify DATABASE_URL works locally
4. **Review this guide** - Ensure all steps were followed
5. **Check GitHub Actions docs** - https://docs.github.com/en/actions/security-guides/encrypted-secrets

---

## Summary

You've successfully set up GitHub Actions secrets for the merchant sync cron job! The workflow will now:

- Run automatically at 6 AM and 6 PM UTC daily
- Sync merchant product data from external APIs
- Store results in your Railway PostgreSQL database
- Send errors to Sentry (if configured)
- Log all activity for troubleshooting

Next steps: Monitor the first few scheduled runs to ensure everything works smoothly.
