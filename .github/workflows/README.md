# GitHub Actions Workflows for BuildStock Pro

This directory contains automated workflows for BuildStock Pro's continuous integration, deployment, and maintenance.

## Workflows

### 1. CI/CD Pipeline (`ci-cd.yml`)

**Triggers:**
- Push to `main` or `develop` branches
- Pull requests to `main` or `develop` branches

**What it does:**

#### On Every Push/PR:
1. **Frontend Validation**
   - Runs ESLint
   - Performs TypeScript type checking
   - Builds Next.js application

2. **Backend Validation**
   - Runs ESLint
   - Performs TypeScript type checking
   - Runs tests (if available)
   - Verifies build configuration

#### On Merge to Main:
3. **Deployment**
   - Deploys backend to Railway
   - Deploys frontend to Vercel
   - Runs database migrations (if configured)

4. **Post-Deployment**
   - Executes smoke tests against production URLs
   - Sends Slack/email notifications on failure
   - Comments deployment URL on pull requests

**Jobs:**
- `frontend-lint` - Validates frontend code quality
- `frontend-build` - Builds Next.js application
- `backend-lint` - Validates backend code quality
- `backend-test` - Runs backend test suite
- `backend-build` - Verifies backend build setup
- `deploy-backend` - Deploys to Railway (main only)
- `deploy-frontend` - Deploys to Vercel (main only)
- `smoke-tests` - Tests production endpoints (main only)
- `notify-failure` - Sends notifications on failures

### 2. Merchant Sync Job (`merchant-sync.yml`)

**Triggers:**
- **Scheduled**: Daily at 2 AM UTC
- **Manual**: Via GitHub Actions UI with custom options
- **Push**: When sync-related files change

**What it does:**
- Syncs product data from merchant APIs
- Supports syncing all merchants or specific ones
- Generates sync reports
- Sends success/failure notifications
- Verifies sync health via API

**Options (when manually triggered):**
- `merchant`: Specific merchant to sync (screwfix, wickes, bandq, jewson)
- `force`: Force full sync, bypassing incremental checks

**Jobs:**
- `merchant-sync` - Main sync process
- `sync-health-check` - Verifies sync success

## Setup Instructions

See [CI-CD-SETUP.md](../../CI-CD-SETUP.md) for detailed setup instructions.

### Quick Checklist

- [ ] Add all required secrets to GitHub
- [ ] Add all required variables to GitHub
- [ ] Configure Railway deployment
- [ ] Configure Vercel deployment
- [ ] Set up Slack notifications (optional)
- [ ] Test workflows on a feature branch
- [ ] Merge to main to test full deployment

## Required Secrets

### Database & API
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `DATABASE_URL`
- `JWT_SECRET`
- `SYNC_API_KEY`

### Deployment
- `RAILWAY_TOKEN`
- `RAILWAY_SERVICE_NAME`
- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`

### Merchant APIs (Optional)
- `SCREWFIX_API_KEY`
- `WICKES_API_KEY`
- `BANDQ_API_KEY`
- `JEWSON_API_KEY`

### Notifications (Optional)
- `SLACK_WEBHOOK_URL`
- `NOTIFICATION_EMAIL`
- `EMAIL_USERNAME`
- `EMAIL_PASSWORD`

## Required Variables

- `FRONTEND_URL`
- `FRONTEND_API_URL`
- `BACKEND_URL`
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`

## Usage

### Running Workflows

#### Automatic Triggers
Most workflows run automatically based on Git events:

```bash
# Trigger CI/CD on push
git push origin main

# Trigger CI/CD on PR
git push origin feature-branch
# Then create PR on GitHub
```

#### Manual Triggers
For merchant sync:

1. Go to **Actions** tab in GitHub
2. Select **"Merchant Sync Job"**
3. Click **"Run workflow"**
4. Select branch (usually `main`)
5. Choose options:
   - Leave empty for all merchants
   - Or specify merchant: `screwfix`
   - Enable force sync if needed
6. Click **"Run workflow"**

### Monitoring Workflows

#### View Status
1. Go to **Actions** tab in GitHub
2. Select a workflow run
3. View job logs and status

#### View Logs
1. Click on a job (e.g., "frontend-build")
2. Click on a step (e.g., "Build Next.js application")
3. Expand the logs to see output

#### Download Artifacts
1. Go to a workflow run
2. Scroll to **"Artifacts"** section
3. Download any available artifacts (e.g., frontend-build, sync-report)

## Troubleshooting

### Common Issues

#### 1. Workflow Fails Immediately
- **Cause**: Missing or incorrect secrets
- **Fix**: Verify all required secrets are set in repository settings

#### 2. Build Failures
- **Cause**: Code linting errors, type errors, or dependency issues
- **Fix**: Check job logs, fix errors locally, push fixes

#### 3. Deployment Failures
- **Cause**: Invalid deployment tokens or misconfigured services
- **Fix**: Verify Railway/Vercel tokens, check service names

#### 4. Smoke Test Failures
- **Cause**: Services not responding or incorrect URLs
- **Fix**: Verify production URLs, check service status

#### 5. Notification Failures
- **Cause**: Invalid webhook URL or email credentials
- **Fix**: Verify Slack webhook or email app password

### Debug Mode

Enable debug logging by adding these secrets:

```
ACTIONS_STEP_DEBUG = true
ACTIONS_RUNNER_DEBUG = true
```

## Workflow Artifacts

### CI/CD Pipeline
- `frontend-build` - Built Next.js application (7-day retention)

### Merchant Sync
- `sync-report-{run_number}` - Sync execution report (30-day retention)

## Performance

### Typical Duration

**CI/CD Pipeline:**
- Lint & Type Check: 1-2 minutes per app
- Build: 2-3 minutes per app
- Deploy: 3-5 minutes per service
- Smoke Tests: 30 seconds
- **Total**: ~15-20 minutes

**Merchant Sync:**
- Sync per merchant: 5-10 minutes
- Health check: 30 seconds
- **Total**: 20-40 minutes (varies by merchant)

### Optimization Tips

1. **Cache Dependencies**: Already enabled via `actions/setup-node` cache
2. **Parallel Jobs**: Frontend and backend run in parallel
3. **Conditional Deployment**: Only deploys on main branch
4. **Artifact Retention**: Limited to save storage

## Security

### Best Practices

✅ **Do:**
- Use GitHub Secrets for sensitive data
- Rotate secrets regularly (90 days)
- Use different secrets per environment
- Enable branch protection on main
- Require PR reviews
- Monitor workflow logs for leaked secrets

❌ **Don't:**
- Commit secrets to repository
- Share secrets in plain text
- Use production secrets in dev workflows
- Disable workflow logging
- Ignore failed workflow runs

### Secret Leaks

If a secret is accidentally leaked in workflow logs:

1. **Immediate Action:**
   ```bash
   # Rotate the compromised secret immediately
   ```

2. **Update GitHub:**
   - Go to repository Settings → Secrets
   - Delete the compromised secret
   - Add the new secret

3. **Verify:**
   - Check logs for other occurrences
   - Re-run workflows with new secret

## Maintenance

### Regular Tasks

**Weekly:**
- Review workflow runs for failures
- Check artifact storage usage
- Monitor deployment frequency

**Monthly:**
- Update Node.js version if needed
- Update action versions in workflows
- Review and update documentation
- Clean up old workflow runs

**Quarterly:**
- Rotate all secrets
- Audit workflow permissions
- Review and optimize workflows
- Update dependencies

### Updating Workflows

1. Create a feature branch
2. Modify workflow YAML files
3. Test on feature branch via PR
4. Merge after review

### Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-01-30 | Initial workflow setup |

## Support

For issues or questions:

1. Check this README
2. Review [CI-CD-SETUP.md](../../CI-CD-SETUP.md)
3. Check workflow logs in GitHub Actions
4. Create an issue in the repository

## Additional Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Railway Documentation](https://docs.railway.app/)
- [Vercel Documentation](https://vercel.com/docs)
- [Supabase Documentation](https://supabase.com/docs)
