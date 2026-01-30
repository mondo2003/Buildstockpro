# CI/CD Quick Reference Guide

Quick reference for BuildStock Pro CI/CD workflows.

## Workflow Files Location

```
/Users/macbook/Desktop/buildstock.pro/.github/workflows/
├── ci-cd.yml              # Main CI/CD pipeline
├── merchant-sync.yml      # Scheduled merchant sync
└── README.md             # Workflow documentation
```

## Quick Setup Commands

### 1. Generate Secrets

```bash
# Generate JWT secret
openssl rand -base64 32

# Generate sync API key
openssl rand -base64 32
```

### 2. Get Supabase Credentials

```
1. Go to https://supabase.com/dashboard
2. Select your project
3. Settings → API
4. Copy: Project URL, anon key, service_role key
5. Settings → Database
6. Copy: Connection String (URI)
```

### 3. Get Railway Token

```
1. Go to https://railway.app/
2. Click avatar → Account → API Tokens
3. Create new token
4. Copy token
```

### 4. Get Vercel Token

```
1. Go to https://vercel.com/dashboard
2. Settings → Tokens
3. Create new token
4. Copy token
```

## GitHub Secrets Checklist

Copy and paste this checklist to track your progress:

### Database & API Secrets
- [ ] `SUPABASE_URL` - Supabase project URL
- [ ] `SUPABASE_ANON_KEY` - Supabase anonymous key
- [ ] `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key
- [ ] `DATABASE_URL` - PostgreSQL connection string
- [ ] `JWT_SECRET` - Generated secret (32+ chars)
- [ ] `SYNC_API_KEY` - Generated secret (32+ chars)

### Deployment Secrets
- [ ] `RAILWAY_TOKEN` - Railway authentication token
- [ ] `RAILWAY_SERVICE_NAME` - Railway service name (e.g., "buildstock-pro-backend")
- [ ] `VERCEL_TOKEN` - Vercel authentication token
- [ ] `VERCEL_ORG_ID` - Vercel organization ID
- [ ] `VERCEL_PROJECT_ID` - Vercel project ID

### Merchant API Keys (Optional)
- [ ] `SCREWFIX_API_KEY` - ScrewFix API key
- [ ] `WICKES_API_KEY` - Wickes API key
- [ ] `BANDQ_API_KEY` - B&Q API key
- [ ] `JEWSON_API_KEY` - Jewson API key

### Notification Secrets (Optional)
- [ ] `SLACK_WEBHOOK_URL` - Slack incoming webhook URL
- [ ] `NOTIFICATION_EMAIL` - Email for notifications
- [ ] `EMAIL_USERNAME` - Gmail username
- [ ] `EMAIL_PASSWORD` - Gmail app password

## GitHub Variables Checklist

- [ ] `FRONTEND_URL` - e.g., `https://buildstock.pro`
- [ ] `FRONTEND_API_URL` - e.g., `https://buildstock-pro-backend.railway.app`
- [ ] `BACKEND_URL` - e.g., `https://buildstock-pro-backend.railway.app`
- [ ] `SUPABASE_URL` - Supabase project URL
- [ ] `SUPABASE_ANON_KEY` - Supabase anonymous key

## Common Commands

### Trigger Workflows

```bash
# CI/CD pipeline (automatic on push/PR)
git push origin main
git push origin develop
gh pr create

# Merchant sync (manual via GitHub UI)
# Go to Actions → Merchant Sync Job → Run workflow
```

### Check Workflow Status

```bash
# Via GitHub CLI
gh run list
gh run view
gh run watch

# Or visit: https://github.com/YOUR_REPO/actions
```

### Download Workflow Artifacts

```bash
# Via GitHub CLI
gh run download <run-id>

# Or download from Actions tab in GitHub
```

## Workflow Triggers

### CI/CD Pipeline (`ci-cd.yml`)

**Automatic:**
- Push to `main` or `develop`
- Pull request to `main` or `develop`

**Manual:**
- Not applicable (runs automatically)

### Merchant Sync (`merchant-sync.yml`)

**Automatic:**
- Daily at 2 AM UTC (cron: `0 2 * * *`)
- Push to `main` (if sync files change)

**Manual:**
- Actions → Merchant Sync Job → Run workflow
- Options:
  - `merchant`: screwfix, wickes, bandq, jewson, or empty (all)
  - `force`: true/false (skip incremental checks)

## What Happens When...

### You push to `main`:
```
1. Frontend: Lint → Type Check → Build
2. Backend: Lint → Type Check → Test → Build
3. Deploy Backend to Railway
4. Deploy Frontend to Vercel
5. Run Smoke Tests
6. Send notifications (if failure)
```

### You create a PR:
```
1. Frontend: Lint → Type Check → Build
2. Backend: Lint → Type Check → Test → Build
3. No deployment (only on merge to main)
```

### Merchant sync runs:
```
1. Install dependencies
2. Setup environment
3. Sync products from merchants
4. Generate sync report
5. Verify sync health
6. Send notifications
```

## Troubleshooting Quick Fixes

### Workflow won't start
```bash
# Fix: Check secrets are set
gh secret list

# Navigate to: Settings → Secrets and variables → Actions
# Verify all required secrets exist
```

### Build fails
```bash
# Fix: Check build logs
gh run view --log

# Common issues:
# - Missing dependencies
# - Type errors
# - Lint errors
```

### Deployment fails
```bash
# Fix: Verify deployment tokens
# Check Railway token hasn't expired
# Check Vercel token is valid
# Verify service/project names match
```

### Smoke tests fail
```bash
# Fix: Verify production URLs
curl https://buildstock.pro
curl https://your-backend.railway.app/health

# Check environment variables are correct
```

## Environment Variables Reference

### Frontend (.env.local)
```bash
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NODE_ENV=development
```

### Backend (.env)
```bash
SUPABASE_URL=your-supabase-url
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
DATABASE_URL=postgresql://...
JWT_SECRET=your-jwt-secret
SYNC_API_KEY=your-sync-api-key
PORT=3001
NODE_ENV=development
```

## Key File Locations

### Workflows
```
.github/workflows/ci-cd.yml
.github/workflows/merchant-sync.yml
```

### Scripts
```
buildstock-pro/backend/src/scripts/sync-merchants.ts
```

### Documentation
```
CI-CD-SETUP.md              # Detailed setup guide
CI-CD-QUICK-REF.md          # This file
.github/workflows/README.md # Workflow documentation
```

## URLs to Remember

### GitHub
- Repository Actions: `https://github.com/YOUR_USERNAME/buildstock.pro/actions`
- Secrets: `https://github.com/YOUR_USERNAME/buildstock.pro/settings/secrets/actions`
- Variables: `https://github.com/YOUR_USERNAME/buildstock.pro/settings/variables/actions`

### Deployment Platforms
- Railway: `https://railway.app/`
- Vercel: `https://vercel.com/dashboard`
- Supabase: `https://supabase.com/dashboard`

## Contact & Support

For issues:
1. Check workflow logs in GitHub Actions
2. Review `CI-CD-SETUP.md` for detailed troubleshooting
3. Check `.github/workflows/README.md` for workflow-specific info
4. Create an issue in the repository

## Related Documentation

- [CI-CD-SETUP.md](./CI-CD-SETUP.md) - Comprehensive setup guide
- [.github/workflows/README.md](.github/workflows/README.md) - Workflow documentation
- [buildstock-pro/backend/DEPLOYMENT.md](buildstock-pro/backend/DEPLOYMENT.md) - Backend deployment
- [buildstock-pro/frontend/VERCEL_DEPLOYMENT_GUIDE.md](buildstock-pro/frontend/VERCEL_DEPLOYMENT_GUIDE.md) - Frontend deployment
