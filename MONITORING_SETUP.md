# BuildStock Pro - Monitoring Setup Guide

This guide covers all aspects of monitoring and maintaining the health of your BuildStock Pro application.

## Table of Contents
1. [Health Check Endpoints](#health-check-endpoints)
2. [Uptime Monitoring](#uptime-monitoring)
3. [Error Tracking with Sentry](#error-tracking-with-sentry)
4. [Log Aggregation](#log-aggregation)
5. [Performance Monitoring](#performance-monitoring)
6. [Database Monitoring](#database-monitoring)
7. [Alerting Setup](#alerting-setup)

---

## Health Check Endpoints

### Backend Health Check

**Endpoint:** `GET /health`

**Response:**
```json
{
  "success": true,
  "status": "healthy",
  "timestamp": "2026-01-30T10:30:00.000Z"
}
```

**Usage:**
```bash
curl https://buildstock-api.onrender.com/health
```

### Root Endpoint

**Endpoint:** `GET /`

**Response:**
```json
{
  "success": true,
  "message": "BuildStock Pro API",
  "version": "0.1.0",
  "timestamp": "2026-01-30T10:30:00.000Z"
}
```

### API Version Info

**Endpoint:** `GET /api/v1`

**Response:** Lists all available endpoints in the API

---

## Uptime Monitoring

### Recommended Services

#### 1. UptimeRobot (Free Tier Available)

**Setup Steps:**
1. Go to [https://uptimerobot.com](https://uptimerobot.com)
2. Create a free account
3. Add a new monitor:
   - **Type:** HTTP
   - **URL:** `https://buildstock-api.onrender.com/health`
   - **Monitoring Interval:** 5 minutes
   - **Alert Contacts:** Add your email and/or Slack

**Configuration:**
- Monitor Type: HTTP(s)
- Check Interval: 5 minutes (free tier)
- Response Time Threshold: 2000ms
- Keyword(s) to check: "healthy" (checks response body)

#### 2. Pingdom (Paid)

**Setup Steps:**
1. Go to [https://www.pingdom.com](https://www.pingdom.com)
2. Create an account
3. Add Uptime Monitor:
   - **URL:** `https://buildstock-api.onrender.com/health`
   - **Check Interval:** 1 minute
   - **Regions:** Select multiple regions
   - **Alerts:** Configure email, SMS, or webhooks

#### 3. Status Cake (Free Tier Available)

**Setup Steps:**
1. Go to [https://www.statuscake.com](https://www.statuscake.com)
2. Create an account
3. Add a new uptime test:
   - **Test Type:** HTTP
   - **Check Rate:** 30 seconds to 1 day
   - **Contact Groups:** Configure notifications

### Custom Health Checks

Use the provided `health-check.sh` script for custom monitoring:

```bash
# Run health check manually
./health-check.sh

# Add to crontab for automated checks
crontab -e
# Add: */5 * * * * /path/to/health-check.sh
```

---

## Error Tracking with Sentry

### Sentry is Already Configured

The backend has Sentry integrated in `/buildstock-pro/backend/src/index.ts`:

**Configuration:**
```typescript
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.SENTRY_ENVIRONMENT || process.env.NODE_ENV || 'development',
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
});
```

### Setup Sentry for Production

#### 1. Create Sentry Account

1. Go to [https://sentry.io](https://sentry.io)
2. Sign up for a free account
3. Create a new project:
   - **Platform:** Bun
   - **Project Name:** buildstock-backend

#### 2. Configure Backend DSN

**For Render Deployment:**
1. In Sentry Dashboard, go to Project Settings > Client Keys (DSN)
2. Copy the DSN
3. In Render Dashboard:
   - Go to your backend service
   - Navigate to Environment section
   - Add variable: `SENTRY_DSN = your-sentry-dsn`
   - Add variable: `SENTRY_ENVIRONMENT = production`

#### 3. Configure Frontend DSN

**For Vercel Deployment:**
1. Create a new Sentry project for Next.js
2. Get the DSN
3. In Vercel Dashboard:
   - Go to Project Settings > Environment Variables
   - Add: `NEXT_PUBLIC_SENTRY_DSN = your-frontend-dsn`
   - Add: `NEXT_PUBLIC_SENTRY_ENVIRONMENT = production`

#### 4. Test Sentry Integration

There's a test endpoint available:
```bash
curl https://buildstock-api.onrender.com/api/v1/sentry-test
```

This will trigger a test error in Sentry to verify the integration.

### Sentry Dashboard Features

**Monitor:**
- Error rates
- Error trends
- Release tracking
- Performance traces
- User feedback

**Alerting:**
- Email notifications
- Slack integration
- PagerDuty integration
- Custom webhooks

---

## Log Aggregation

### Backend Logs (Render)

**Access Logs:**
1. Go to [Render Dashboard](https://dashboard.render.com)
2. Select your backend service
3. Click on "Logs" tab
4. Real-time logs appear automatically

**Download Logs:**
```bash
# Using Render CLI
render logs -f buildstock-backend

# Or download from dashboard
# Logs > Download > Select time range
```

### Frontend Logs (Vercel)

**Access Logs:**
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Click on "Logs" tab
4. Filter by: Function builds, Serverless Function, Edge Function

### Structured Logging

The backend uses structured logging. Log formats:

```typescript
console.log('Query on products completed in 45ms, 20 rows');
console.error('Error fetching products:', error);
```

### Centralized Logging Options

#### 1. LogDNA (now SolarWinds)

**Setup:**
1. Create account at [https://logdna.com](https://logdna.com)
2. Install log agent on Render (if available)
3. Configure log forwarding

#### 2. Datadog Logs

**Setup:**
1. Create account at [https://www.datadoghq.com](https://www.datadoghq.com)
2. Use Datadog agent or API
3. Configure log shipping from Render

#### 3. Better Stack (formerly Logtail)

**Setup:**
1. Create account at [https://betterstack.com](https://betterstack.com)
2. Get API token
3. Configure log shipping

---

## Performance Monitoring

### Backend Performance

#### Built-in Monitoring

The backend already tracks query performance:

```typescript
const start = Date.now();
// ... query execution ...
console.log(`Query completed in ${Date.now() - start}ms`);
```

#### Sentry Performance Monitoring

Already configured with `tracesSampleRate`:
- Development: 100% of transactions
- Production: 10% of transactions

View performance in Sentry Dashboard:
- Transaction timing
- Database queries
- HTTP endpoints
- Slow operations

### Frontend Performance

#### Vercel Analytics

**Setup:**
1. Go to Vercel Dashboard > Project > Analytics
2. Enable Vercel Analytics (free for Pro plans)
3. Install `@vercel/analytics`:

```bash
npm install @vercel/analytics
```

Add to app layout:
```typescript
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

#### Core Web Vitals

Monitor:
- **LCP** (Largest Contentful Paint): < 2.5s
- **FID** (First Input Delay): < 100ms
- **CLS** (Cumulative Layout Shift): < 0.1

---

## Database Monitoring

### Supabase Dashboard

1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Select your project
3. Monitor:
   - **Database Size:** Storage usage
   - **Active Connections:** Connection pool status
   - **Query Performance:** Slow query logs
   - **API Requests:** Request count and errors

### Key Metrics to Track

**Database Health:**
- Connection count
- Query execution time
- Database size
- Backup status

**Performance:**
- Slow queries (> 1s)
- Table scan counts
- Index usage
- Cache hit rates

### Database Backup

Supabase provides automatic backups:
- **Point-in-time recovery:** Available in Pro plan
- **Physical backups:** Daily automated backups
- **Logical backups:** On-demand

---

## Alerting Setup

### Recommended Alert Channels

#### 1. Email Alerts

Configure for:
- UptimeRobot: Service down
- Sentry: New error types
- Render: Deployment failures
- Vercel: Build failures

#### 2. Slack Integration

**Sentry to Slack:**
1. In Sentry, go to Settings > Integrations > Slack
2. Install Sentry app to your Slack workspace
3. Select alert channels
4. Configure routing rules

**UptimeRobot to Slack:**
1. Go to UptimeRobot > My Settings > Alert Contacts
2. Create new Slack contact
3. Configure webhook URL

#### 3. SMS Alerts

Configure for critical alerts:
- Service downtime
- Database connection failures
- Error rate spikes

### Alert Thresholds

**Recommended Settings:**

| Metric | Warning | Critical |
|--------|---------|----------|
| Response Time | > 500ms | > 2000ms |
| Error Rate | > 1% | > 5% |
| Downtime | Any | Any |
| Database Latency | > 200ms | > 1000ms |
| CPU Usage | > 70% | > 90% |
| Memory Usage | > 80% | > 95% |

### Runbook Integration

When an alert triggers, follow the [Incident Response Guide](./INCIDENT_RESPONSE.md).

---

## Quick Start Checklist

### Day 1: Basic Monitoring
- [ ] Test `/health` endpoint
- [ ] Set up UptimeRobot account
- [ ] Create uptime monitor for backend
- [ ] Test health check script: `./health-check.sh`
- [ ] Create Sentry account
- [ ] Configure Sentry for backend

### Week 1: Enhanced Monitoring
- [ ] Configure Sentry for frontend
- [ ] Set up Vercel Analytics
- [ ] Review Supabase dashboard
- [ ] Configure Slack notifications
- [ ] Document response procedures

### Ongoing: Maintenance
- [ ] Review Sentry errors weekly
- [ ] Check uptime metrics monthly
- [ ] Review performance reports
- [ ] Update runbooks as needed
- [ ] Test alert systems

---

## Useful Commands

```bash
# Check backend health
curl https://buildstock-api.onrender.com/health

# Check response time
time curl https://buildstock-api.onrender.com/health

# Run full health check
./health-check.sh

# Check Render logs
# Via dashboard or:
render logs --service buildstock-backend

# Check Vercel logs
# Via dashboard or:
vercel logs --build

# Test Sentry integration
curl https://buildstock-api.onrender.com/api/v1/sentry-test
```

---

## Additional Resources

- [Incident Response Guide](./INCIDENT_RESPONSE.md)
- [Health Check Script](./health-check.sh)
- [Sentry Documentation](https://docs.sentry.io)
- [Render Monitoring Guide](https://render.com/docs/monitoring)
- [Vercel Analytics Guide](https://vercel.com/docs/analytics)
- [Supabase Monitoring](https://supabase.com/docs/guides/platform/monitoring)

---

## Support

For issues or questions about monitoring:
1. Check the [Incident Response Guide](./INCIDENT_RESPONSE.md)
2. Review Sentry errors for details
3. Check logs in Render/Vercel dashboards
4. Consult Supabase dashboard for database issues
