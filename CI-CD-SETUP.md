# CI/CD Setup Guide for BuildStock Pro

This guide explains how to configure GitHub Actions workflows for BuildStock Pro, including CI/CD pipelines and scheduled merchant sync jobs.

## Overview

BuildStock Pro uses two GitHub Actions workflows:

1. **CI/CD Pipeline** (`.github/workflows/ci-cd.yml`)
   - Runs on every push and pull request
   - Lints and type-checks frontend and backend
   - Runs tests
   - Builds applications
   - Deploys to production (Railway & Vercel) on merge to main
   - Runs post-deployment smoke tests
   - Sends notifications on failure

2. **Merchant Sync Job** (`.github/workflows/merchant-sync.yml`)
   - Runs daily at 2 AM UTC
   - Syncs product data from merchant APIs
   - Can be triggered manually with options
   - Sends success/failure notifications

## Prerequisites

Before configuring the workflows, ensure you have:

- GitHub repository with BuildStock Pro code
- Railway account (for backend deployment)
- Vercel account (for frontend deployment)
- Supabase project configured
- (Optional) Slack workspace for notifications
- (Optional) Gmail account for email notifications

## Required GitHub Secrets

Navigate to your repository settings: `Settings` → `Secrets and variables` → `Actions`

Click **"New repository secret"** for each of the following:

### Database & API Secrets

| Secret Name | Description | How to Get |
|-------------|-------------|------------|
| `SUPABASE_URL` | Your Supabase project URL | Supabase Dashboard → Settings → API |
| `SUPABASE_ANON_KEY` | Supabase anonymous/public key | Supabase Dashboard → Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (admin) | Supabase Dashboard → Settings → API |
| `DATABASE_URL` | PostgreSQL connection string | Supabase Dashboard → Settings → Database → Connection String (URI) |
| `JWT_SECRET` | Secret for JWT token signing | Generate a strong random string (see below) |
| `SYNC_API_KEY` | API key for triggering sync | Generate a strong random string (see below) |

### Railway Deployment Secrets

| Secret Name | Description | How to Get |
|-------------|-------------|------------|
| `RAILWAY_TOKEN` | Railway authentication token | Railway Dashboard → Account → API Tokens |
| `RAILWAY_SERVICE_NAME` | Name of your Railway service | The name you gave your backend service in Railway |

### Vercel Deployment Secrets

| Secret Name | Description | How to Get |
|-------------|-------------|------------|
| `VERCEL_TOKEN` | Vercel authentication token | Vercel Dashboard → Settings → Tokens → Create |
| `VERCEL_ORG_ID` | Your Vercel organization ID | Found in `vercel.json` or Vercel project settings |
| `VERCEL_PROJECT_ID` | Your Vercel project ID | Found in `vercel.json` or Vercel project settings |

### Merchant API Keys (Optional)

| Secret Name | Description |
|-------------|-------------|
| `SCREWFIX_API_KEY` | ScrewFix merchant API key |
| `WICKES_API_KEY` | Wickes merchant API key |
| `BANDQ_API_KEY` | B&Q merchant API key |
| `JEWSON_API_KEY` | Jewson merchant API key |

### Notification Secrets (Optional)

| Secret Name | Description | How to Get |
|-------------|-------------|------------|
| `SLACK_WEBHOOK_URL` | Slack incoming webhook URL | Slack App settings → Incoming Webhooks |
| `NOTIFICATION_EMAIL` | Email address for failure notifications | Your email address |
| `EMAIL_USERNAME` | Gmail username for sending notifications | Your Gmail address |
| `EMAIL_PASSWORD` | Gmail app-specific password | Google Account → Security → App Passwords |

## Required GitHub Variables

Variables (unlike secrets) are not encrypted and can be used for non-sensitive configuration.

Navigate to: `Settings` → `Secrets and variables` → `Actions` → **"Variables"** tab

| Variable Name | Description | Example Value |
|---------------|-------------|---------------|
| `FRONTEND_URL` | Production frontend URL | `https://buildstock.pro` |
| `FRONTEND_API_URL` | Backend API URL for frontend | `https://buildstock-pro-backend.railway.app` |
| `BACKEND_URL` | Backend API URL | `https://buildstock-pro-backend.railway.app` |
| `SUPABASE_URL` | Supabase project URL | `https://xxxxx.supabase.co` |
| `SUPABASE_ANON_KEY` | Supabase anonymous key | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |

## How to Generate Secrets

### JWT_SECRET

Generate a secure random string:

```bash
# Using OpenSSL
openssl rand -base64 32

# Or using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Or generate online at: https://generate-random.org/api-key-generator
```

Example output: `xK8mN2pQ4rT7vY9wB3cD6eF1gH5jK8mN2pQ4rT7vY9w=`

### SYNC_API_KEY

Generate in the same way as JWT_SECRET:

```bash
openssl rand -base64 32
```

Example: `aB3dE6fG9hJ2mN5pQ8sT1vW4xY7zA0bC3dF6gH9jK2mN=`

## Step-by-Step Setup

### Step 1: Get Supabase Credentials

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Navigate to **Settings** → **API**
4. Copy the following:
   - Project URL → `SUPABASE_URL`
   - `anon/public` key → `SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY`
5. Navigate to **Settings** → **Database**
6. Copy **Connection String (URI)** → `DATABASE_URL`

### Step 2: Generate API Keys

Generate your JWT secret and sync API key using one of the methods above.

### Step 3: Configure Railway

1. Go to [Railway](https://railway.app/)
2. Create a new project or select existing
3. Create a new service from GitHub
4. Select your repository and `buildstock-pro/backend` directory
5. Note your service name
6. Get API token:
   - Click your avatar → **Account** → **API Tokens**
   - Click **New Token** → **Create**
   - Copy the token

### Step 4: Configure Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Import your GitHub repository
3. Select `buildstock-pro/frontend` as root directory
4. Configure framework presets (Next.js)
5. Get deployment token:
   - Go to **Settings** → **Tokens**
   - Click **Create** → Copy the token
6. Get project IDs:
   - Go to your project → **Settings** → **General**
   - Copy Project ID
   - Copy Team/Organization ID (if applicable)

### Step 5: Add Secrets to GitHub

1. Go to your GitHub repository
2. **Settings** → **Secrets and variables** → **Actions**
3. Click **"New repository secret"**
4. Add each secret from the tables above

### Step 6: Add Variables to GitHub

1. In the same section, go to **"Variables"** tab
2. Click **"New repository variable"**
3. Add each variable from the tables above

### Step 7: Configure Slack Notifications (Optional)

1. Go to [Slack API](https://api.slack.com/apps)
2. Create a new app → **"From scratch"**
3. Enable **"Incoming Webhooks"**
4. Click **"Add New Webhook to Workspace"**
5. Select a channel
6. Copy the webhook URL
7. Add as `SLACK_WEBHOOK_URL` secret in GitHub

### Step 8: Configure Email Notifications (Optional)

1. Enable 2FA on your Google Account
2. Go to [Google Account Settings](https://myaccount.google.com/)
3. **Security** → **2-Step Verification** → **App passwords**
4. Generate an app password for "Mail"
5. Add to GitHub:
   - `NOTIFICATION_EMAIL`: Your email address
   - `EMAIL_USERNAME`: Your Gmail address
   - `EMAIL_PASSWORD`: The app password (not your regular password)

## Workflow Features

### CI/CD Pipeline

**On every push/PR:**
- ✅ Frontend: ESLint + TypeScript type check
- ✅ Backend: ESLint + TypeScript type check
- ✅ Backend: Run tests (if they exist)
- ✅ Frontend: Build Next.js application
- ✅ Backend: Verify build setup

**On merge to main:**
- 🚀 Deploy backend to Railway
- 🚀 Deploy frontend to Vercel
- 🔍 Run post-deployment smoke tests
- 🔔 Send notifications on failure

### Merchant Sync Job

**Scheduled:**
- ⏰ Runs daily at 2 AM UTC
- 🔄 Syncs product data from all merchants
- 📊 Generates sync report
- 🔔 Sends success/failure notifications

**Manual Trigger:**
- Can be triggered from GitHub Actions tab
- Options:
  - `merchant`: Specific merchant to sync (or all)
  - `force`: Force full sync (skip incremental checks)

## Testing the Workflows

### Test CI/CD Pipeline

1. Create a new branch: `git checkout -b test-ci-cd`
2. Make a small change (e.g., update README)
3. Commit and push: `git push origin test-ci-cd`
4. Create a pull request on GitHub
5. Go to **Actions** tab to see workflow running
6. Verify all jobs pass

### Test Merchant Sync

1. Go to **Actions** tab in GitHub
2. Select "Merchant Sync Job" workflow
3. Click **"Run workflow"**
4. Choose options (leave empty for all merchants)
5. Click **"Run workflow"**
6. Monitor the execution

## Troubleshooting

### Workflow Fails Immediately

**Problem:** Workflow doesn't start or fails instantly

**Solutions:**
- Verify all required secrets are set
- Check secret names match exactly (case-sensitive)
- Ensure you have write permissions to the repository

### Build Failures

**Problem:** Frontend or backend build fails

**Solutions:**
- Check build logs in GitHub Actions
- Ensure `package-lock.json` is committed
- Verify Node.js version (should be 20)
- For backend, ensure Bun version is compatible

### Deployment Failures

**Problem:** Railway or Vercel deployment fails

**Solutions:**
- Verify deployment tokens are valid and not expired
- Check service/project names match
- Ensure environment variables are set in Railway/Vercel
- Review deployment logs in Railway/Vercel dashboards

### Smoke Test Failures

**Problem:** Post-deployment smoke tests fail

**Solutions:**
- Verify URLs in variables are correct
- Check services are actually running
- Ensure CORS is configured correctly
- Verify API endpoints are accessible

### Notification Failures

**Problem:** Slack or email notifications not sent

**Solutions:**
- Verify webhook URL or email credentials
- Check Slack app has permission to post
- For email, ensure app password is used (not regular password)
- Check spam folder for test emails

## Best Practices

### Security

1. **Never commit secrets** to the repository
2. **Rotate secrets regularly** (every 90 days)
3. **Use different secrets** for different environments
4. **Limit secret access** to necessary workflows only
5. **Enable branch protection** on main branch
6. **Require PR reviews** before merging

### Workflow Optimization

1. **Cache dependencies** to speed up builds
2. **Use matrix builds** if testing multiple Node.js versions
3. **Parallelize jobs** where possible
4. **Set appropriate timeouts** for long-running jobs
5. **Use artifacts** to share data between jobs

### Monitoring

1. **Enable Slack notifications** for production deployments
2. **Set up Sentry** for error tracking
3. **Monitor Railway logs** regularly
4. **Check Vercel deployments** for errors
5. **Review workflow runs** weekly

### Maintenance

1. **Update dependencies** regularly
2. **Review workflow logs** for warnings
3. **Test disaster recovery** procedures
4. **Document any custom changes** to workflows
5. **Keep this guide updated** with any changes

## Environment-Specific Configuration

### Development

For development environment, create separate secrets:

- `DEV_SUPABASE_URL`
- `DEV_DATABASE_URL`
- etc.

Then modify workflows to use dev secrets when on `develop` branch.

### Staging

Similarly, create staging secrets and add staging deployment jobs:

```yaml
deploy-backend-staging:
  if: github.ref == 'refs/heads/develop'
  environment:
    name: staging-backend
```

## Advanced Configuration

### Custom Deployment Triggers

You can customize when deployments run:

```yaml
# Only deploy when specific paths change
if: |
  github.ref == 'refs/heads/main' &&
  (contains(github.event.head_commit.message, '[deploy]') ||
   contains(github.event.head_commit.message, '[hotfix]'))
```

### Manual Approval

Add manual approval step before production deployment:

```yaml
environment:
  name: production
  url: ${{ steps.deploy.outputs.url }}
```

Then in GitHub repository settings:
1. **Settings** → **Environments**
2. Create **"production"** environment
3. Enable **"Required reviewers"**
4. Add team members who must approve

### Conditional Notifications

Send notifications only for specific branches:

```yaml
if: |
  failure() &&
  github.ref == 'refs/heads/main' &&
  github.event_name == 'push'
```

## Additional Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Railway Deployment Guide](https://docs.railway.app/)
- [Vercel Deployment Guide](https://vercel.com/docs)
- [Supabase CLI](https://supabase.com/docs/guides/cli)
- [Slack API](https://api.slack.com/)

## Support

For issues or questions:

1. Check workflow logs in GitHub Actions
2. Review this guide's troubleshooting section
3. Check platform-specific documentation
4. Create an issue in the repository

## Changelog

### Version 1.0.0 (2026-01-30)
- Initial CI/CD pipeline setup
- Frontend linting, type checking, and building
- Backend linting, type checking, and testing
- Railway deployment for backend
- Vercel deployment for frontend
- Post-deployment smoke tests
- Slack and email notifications
- Scheduled merchant sync job
- Manual sync trigger with options
