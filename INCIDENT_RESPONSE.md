# BuildStock Pro - Incident Response Guide

This guide provides step-by-step procedures for responding to incidents and outages in the BuildStock Pro application.

## Table of Contents
1. [Severity Levels](#severity-levels)
2. [Immediate Response](#immediate-response)
3. [Common Incidents & Solutions](#common-incidents--solutions)
4. [Communication Templates](#communication-templates)
5. [Post-Incident Procedures](#post-incident-procedures)
6. [Escalation Contacts](#escalation-contacts)

---

## Severity Levels

### SEV-1 - Critical (Business Impact)
**Definition:** Complete service outage or critical functionality broken for all users.

**Examples:**
- Backend completely down
- Database connection failed
- All users unable to access the application
- Data loss or corruption

**Response Time:** Immediate (within 5 minutes)

### SEV-2 - High (Significant Impact)
**Definition:** Major functionality broken, affecting many users.

**Examples:**
- Search not working
- Product pages not loading
- Checkout process broken
- Severe performance degradation

**Response Time:** Within 15 minutes

### SEV-3 - Medium (Limited Impact)
**Definition:** Partial functionality broken, affecting some users or features.

**Examples:**
- Some product images not loading
- Specific category not working
- Minor performance issues
- Non-critical features broken

**Response Time:** Within 1 hour

### SEV-4 - Low (Minimal Impact)
**Definition:** Minor issues with workaround available.

**Examples:**
- Typos in UI
- Non-critical bugs
- Minor performance improvements needed

**Response Time:** Within 24 hours

---

## Immediate Response

### Step 1: Verify the Incident

1. **Confirm the issue is real:**
   ```bash
   # Run health check script
   ./health-check.sh

   # Check backend manually
   curl https://buildstock-api.onrender.com/health

   # Check frontend
   curl https://buildstock-pro.vercel.app

   # Check Sentry for errors
   # Go to: https://sentry.io/organizations/[org]/issues/
   ```

2. **Determine severity level:**
   - How many users are affected?
   - What functionality is broken?
   - Is there a workaround?

3. **Create incident ticket** (if not exists):
   - Use issue tracker (GitHub Issues, Jira, etc.)
   - Label with severity level (SEV-1, SEV-2, etc.)
   - Assign to appropriate team member

### Step 2: Communicate

1. **Notify team:**
   - Send message to communication channel (Slack, Discord, etc.)
   - Include severity level and brief description

2. **Notify stakeholders (for SEV-1 and SEV-2):**
   - Send email notification
   - Include estimated impact and timeline

3. **Update status page (if available):**
   - Post incident details
   - Update as progress is made

### Step 3: Investigate

1. **Check monitoring dashboards:**
   - Sentry: [View Errors](https://sentry.io)
   - Render: [Backend Logs](https://dashboard.render.com)
   - Vercel: [Frontend Logs](https://vercel.com/dashboard)
   - UptimeRobot: [Uptime Status](https://uptimerobot.com)

2. **Review recent changes:**
   ```bash
   # Check recent git commits
   git log --oneline -10

   # Check recent deployments
   # Render: Dashboard > Deployments
   # Vercel: Dashboard > Deployments
   ```

3. **Check error rates:**
   - Sentry error trends
   - API response times
   - Database query performance

---

## Common Incidents & Solutions

### Incident: Backend Completely Down

**Symptoms:**
- `/health` endpoint returns 500 or times out
- All API calls failing
- UptimeRobot shows service down

**Investigation Steps:**

1. **Check Render status:**
   ```bash
   # View logs
   render logs -f buildstock-backend

   # Or via dashboard:
   # Dashboard > Services > buildstock-backend > Events
   ```

2. **Check for deployment issues:**
   - Recent failed deployments?
   - Build errors?
   - Configuration changes?

3. **Check environment variables:**
   ```bash
   # In Render Dashboard, verify:
   - SUPABASE_URL is set
   - SUPABASE_SERVICE_ROLE_KEY is set
   - DATABASE_URL is set
   - SENTRY_DSN is set
   - JWT_SECRET is set
   ```

**Solutions:**

**Solution A: Restart the service**
1. Go to Render Dashboard
2. Select buildstock-backend service
3. Click "Manual Deploy" > "Deploy latest commit"
4. Monitor logs for startup errors

**Solution B: Rollback to previous version**
1. Go to Render Dashboard
2. Select buildstock-backend service
3. Click "Deployments"
4. Find last successful deployment
5. Click "Rollback" > Confirm

**Solution C: Check database connectivity**
```bash
# Test database connection
curl https://buildstock-api.onrender.com/api/products?limit=1

# If failing, check Supabase:
# Dashboard > Project > Settings > Database
# Verify connection string is correct
```

---

### Incident: Database Connection Issues

**Symptoms:**
- API returns 500 errors with database messages
- Queries timing out
- Sentry shows database errors

**Investigation Steps:**

1. **Check Supabase status:**
   - Go to [Supabase Status Page](https://status.supabase.com)
   - Check for ongoing incidents

2. **Check database logs:**
   ```bash
   # In Supabase Dashboard:
   # Project > Database > Logs
   # Look for connection errors, slow queries
   ```

3. **Test database connection:**
   ```bash
   # Via API
   curl https://buildstock-api.onrender.com/api/products?limit=1

   # Or run health check
   ./health-check.sh
   ```

**Solutions:**

**Solution A: Check connection pool**
1. Go to Supabase Dashboard
2. Settings > Database
3. Check "Connection Pooling" settings
4. Increase pool size if needed (min: 2, max: 20)

**Solution B: Check database limits**
1. Go to Supabase Dashboard
2. Settings > Billing & Usage
3. Check if you've hit any limits:
   - Database size
   - API request count
   - Bandwidth usage

**Solution C: Restart database connection**
1. In Render Dashboard, restart backend service
2. This will force a new database connection
3. Monitor for connection errors

---

### Incident: High Error Rate

**Symptoms:**
- Sentry showing spike in errors
- API returning 500 errors
- User reports of broken features

**Investigation Steps:**

1. **Check Sentry:**
   - Go to [Sentry Dashboard](https://sentry.io)
   - Sort by "Latest" or "Frequency"
   - Identify error patterns

2. **Correlate with deployments:**
   - Did error start after recent deployment?
   - Check recent git commits

3. **Check error frequency:**
   - Is it a single user or all users?
   - Specific endpoint or all endpoints?

**Solutions:**

**Solution A: Quick fix for bug**
1. Identify root cause from Sentry stack trace
2. Create hotfix branch
3. Implement fix
4. Deploy to Render
5. Monitor Sentry for resolution

**Solution B: Rollback if recent deployment**
```bash
# Use Render Dashboard to rollback
# Or via git:
git revert <commit-hash>
git push origin main
```

**Solution C: Add error handling**
1. If error is from external service (e.g., merchant API)
2. Add try-catch and graceful degradation
3. Deploy with improved error handling

---

### Incident: Slow Performance

**Symptoms:**
- API response times > 2 seconds
- Frontend loading slowly
- Database queries taking long time

**Investigation Steps:**

1. **Check Sentry Performance:**
   - Go to Sentry > Performance
   - Look for slow transactions
   - Identify slow database queries

2. **Check Render metrics:**
   - Dashboard > Services > Metrics
   - CPU usage
   - Memory usage
   - Response times

3. **Check Supabase performance:**
   - Dashboard > Database > Performance
   - Look for slow queries
   - Check index usage

**Solutions:**

**Solution A: Optimize database queries**
1. Identify slow queries in Supabase
2. Add indexes to frequently queried columns
3. Use query optimization

**Solution B: Scale up Render service**
1. Go to Render Dashboard
2. Services > buildstock-backend > Settings
3. Upgrade to higher tier (Starter -> Standard -> Pro)
4. More CPU and memory

**Solution C: Add caching**
1. Cache frequently accessed data
2. Use Redis or in-memory cache
3. Implement CDN for static assets

---

### Incident: Frontend Deployment Issues

**Symptoms:**
- Vercel build failing
- Frontend showing errors
- Static assets not loading

**Investigation Steps:**

1. **Check Vercel deployments:**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Select buildstock-pro project
   - Check Deployments tab for failures

2. **Check build logs:**
   - Click on failed deployment
   - Review build logs for errors

3. **Check environment variables:**
   - Project Settings > Environment Variables
   - Verify all required variables are set

**Solutions:**

**Solution A: Fix build errors**
1. Identify error in build logs
2. Fix code locally
3. Test build locally: `npm run build`
4. Push to GitHub to trigger new deployment

**Solution B: Redeploy**
1. In Vercel Dashboard
2. Deployments > Select successful deployment
3. Click "Redeploy"
4. Or click "Promote to Production"

**Solution C: Rollback to previous deployment**
1. In Vercel Dashboard
2. Deployments > Select previous successful deployment
3. Click "Promote to Production"

---

### Incident: Search Not Working

**Symptoms:**
- Search API returning errors
- Search results empty
- Search very slow

**Investigation Steps:**

1. **Test search endpoint:**
   ```bash
   curl "https://buildstock-api.onrender.com/api/v1/search?q=cement"
   ```

2. **Check search service logs:**
   ```bash
   render logs -f buildstock-backend | grep search
   ```

3. **Check database:**
   - Products table exists?
   - Search indexes present?

**Solutions:**

**Solution A: Restart search sync**
```bash
# Trigger merchant sync
curl -X POST https://buildstock-api.onrender.com/api/v1/sync/trigger
```

**Solution B: Check search configuration**
- Verify search service is configured correctly
- Check search parameters and limits

**Solution C: Rebuild search index**
1. Access database directly
2. Rebuild search indexes
3. Test search functionality

---

## Communication Templates

### Template 1: Initial Incident Announcement

```
🚨 INCIDENT REPORT - [SEVERITY]

Title: [Brief description]
Severity: SEV-1 / SEV-2 / SEV-3 / SEV-4
Status: Investigating
Started: [Timestamp]

Description:
[What is broken and who is affected]

Impact:
- [ ] All users
- [ ] Some users
- [ ] Specific feature(s): [Name features]

Current Status:
We are currently investigating the issue.

Next Update: [Time]

Assigned to: [Name]
```

### Template 2: Update - Investigating

```
🔄 INCIDENT UPDATE - [INCIDENT ID]

Status: Investigating
Latest Update: [Timestamp]

Progress:
- [ ] Identified root cause
- [ ] Working on fix
- [ ] Testing fix

Details:
[What we've found so far]

ETA for Fix: [Time estimate]

Next Update: [Time]
```

### Template 3: Update - Fix Deployed

```
✅ INCIDENT UPDATE - [INCIDENT ID]

Status: Fix Deployed
Latest Update: [Timestamp]

Fix Applied:
[Description of fix]

Monitoring:
We are currently monitoring the system to ensure the fix is working.

Verification:
- [ ] Backend health check passing
- [ ] Error rates normalized
- [ ] User reports resolved

Next Update: [Time] (or "Resolved if no further issues")
```

### Template 4: Incident Resolved

```
✅ INCIDENT RESOLVED - [INCIDENT ID]

Title: [Brief description]
Severity: SEV-1 / SEV-2 / SEV-3 / SEV-4
Started: [Timestamp]
Resolved: [Timestamp]
Duration: [Total time]

Root Cause:
[What caused the issue]

Resolution:
[How we fixed it]

Prevention:
[What we'll do to prevent this in the future]

Affected Users: [Number or estimate]
Downtime: [Duration]

Post-Incident Review scheduled: [Date/Time]

Report: [Link to incident report]
```

### Template 5: User-Facing Email (SEV-1 or SEV-2)

```
Subject: Service Incident - [Brief Description]

Hi [Name/User],

We experienced a [brief description] incident earlier today that affected [service/features].

Timeline:
- Issue started: [Time]
- Issue resolved: [Time]
- Duration: [Duration]

What happened:
[User-friendly explanation]

What we did to fix it:
[High-level explanation]

We apologize for any inconvenience this may have caused. We take incidents seriously and are working to prevent similar issues in the future.

If you continue to experience issues, please contact us at [support email].

Thank you for your patience,
BuildStock Pro Team
```

---

## Post-Incident Procedures

### Step 1: Incident Review Meeting

**Schedule:** Within 1-2 business days for SEV-1 and SEV-2 incidents

**Attendees:**
- Team members involved in response
- Technical lead
- Product manager (if applicable)

**Agenda:**
1. Timeline of incident
2. Root cause analysis
3. What went well in response
4. What could be improved
5. Action items to prevent recurrence

### Step 2: Create Incident Report

**Template:**

```markdown
# Incident Report: [Title]

**Incident ID:** [XXX]
**Date:** [YYYY-MM-DD]
**Severity:** SEV-1 / SEV-2 / SEV-3 / SEV-4
**Duration:** [Start time] to [End time] ([Total duration])

## Executive Summary
[2-3 sentence summary for non-technical stakeholders]

## Timeline
- [HH:MM] Incident detected
- [HH:MM] Investigation started
- [HH:MM] Root cause identified
- [HH:MM] Fix implemented
- [HH:MM] Service restored
- [HH:MM] Incident resolved

## Impact
- **Affected Users:** [Number or estimate]
- **Affected Services:** [List services]
- **Downtime:** [Duration]
- **Data Loss:** [Yes/No - details if yes]

## Root Cause
[Technical explanation of what went wrong]

## Resolution
[Steps taken to fix the issue]

## Prevention
[Action items to prevent recurrence]
- [ ] [Action item 1] - Assigned to: [Name] - Due: [Date]
- [ ] [Action item 2] - Assigned to: [Name] - Due: [Date]

## Lessons Learned
### What went well
- [Thing 1]
- [Thing 2]

### What could be improved
- [Thing 1]
- [Thing 2]

## Appendix
- [Logs/screenshots/evidence]
```

### Step 3: Action Items

**Create tasks for:**
- Code improvements
- Documentation updates
- Monitoring enhancements
- Process changes
- Team training

**Track in project management tool:**
- GitHub Issues
- Jira
- Linear
- etc.

---

## Escalation Contacts

### Team Structure

**Technical Lead:**
- [Name]
- [Email]
- [Phone]
- [Timezone]

**DevOps Engineer:**
- [Name]
- [Email]
- [Phone]
- [Timezone]

**Product Manager:**
- [Name]
- [Email]
- [Phone]
- [Timezone]

### External Contacts

**Render Support:**
- Documentation: https://render.com/docs
- Support: support@render.com
- Status Page: https://status.render.com

**Vercel Support:**
- Documentation: https://vercel.com/docs
- Support: support@vercel.com
- Status Page: https://www.vercel-status.com

**Supabase Support:**
- Documentation: https://supabase.com/docs
- Support: support@supabase.com
- Status Page: https://status.supabase.com

**Sentry Support:**
- Documentation: https://docs.sentry.io
- Support: https://sentry.io/support/

### Escalation Matrix

| Severity | First Response | Escalate If Unresolved After |
|----------|---------------|------------------------------|
| SEV-1 | Immediately | 15 minutes |
| SEV-2 | Within 15 minutes | 1 hour |
| SEV-3 | Within 1 hour | 4 hours |
| SEV-4 | Within 24 hours | 3 days |

---

## Quick Reference Commands

```bash
# Health check
./health-check.sh

# Check backend
curl https://buildstock-api.onrender.com/health

# Check Render logs
render logs -f buildstock-backend

# Trigger sync
curl -X POST https://buildstock-api.onrender.com/api/v1/sync/trigger

# Test Sentry
curl https://buildstock-api.onrender.com/api/v1/sentry-test

# View recent errors
# In Sentry Dashboard > Issues > Sort by Latest

# Check deployment status
# Render: Dashboard > Services > buildstock-backend > Events
# Vercel: Dashboard > buildstock-pro > Deployments
```

---

## Additional Resources

- [Monitoring Setup Guide](./MONITORING_SETUP.md)
- [Health Check Script](./health-check.sh)
- [Sentry Dashboard](https://sentry.io)
- [Render Dashboard](https://dashboard.render.com)
- [Vercel Dashboard](https://vercel.com/dashboard)
- [Supabase Dashboard](https://supabase.com/dashboard)

---

## Emergency Checklist

When an incident occurs, follow this checklist:

- [ ] Verify the incident (run health check)
- [ ] Determine severity level
- [ ] Create incident ticket
- [ ] Notify team
- [ ] Communicate to stakeholders (if SEV-1 or SEV-2)
- [ ] Start investigation
- [ ] Check monitoring dashboards (Sentry, Render, Vercel)
- [ ] Review recent changes
- [ ] Identify root cause
- [ ] Implement fix
- [ ] Deploy fix
- [ ] Verify fix is working
- [ ] Monitor for regression
- [ ] Update incident status
- [ ] Schedule post-incident review (if SEV-1 or SEV-2)
- [ ] Create incident report (if SEV-1 or SEV-2)
