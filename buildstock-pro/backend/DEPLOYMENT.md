# BuildStock Pro Backend - Render Deployment Guide

## Overview
This document provides instructions for deploying the BuildStock Pro backend to Render.

## Prerequisites
- Render account (https://render.com)
- Supabase project configured
- GitHub repository with backend code

## Configuration Files

### 1. render.yaml
The `render.yaml` file configures:
- **Service Type**: Web service
- **Runtime**: Node.js (Bun will be installed during build)
- **Build Command**: `bun install`
- **Start Command**: `bun run start`
- **Port**: 10000 (Render's default)
- **Health Check**: `/health` endpoint

### 2. Environment Variables

#### Required Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `NODE_ENV` | Environment mode | Yes | production |
| `PORT` | Port number | Yes | 10000 |
| `JWT_SECRET` | JWT signing secret | Yes | Auto-generated |
| `DATABASE_URL` | PostgreSQL connection | Yes | From Render DB |
| `SUPABASE_URL` | Supabase project URL | Yes | - |
| `SUPABASE_ANON_KEY` | Supabase anonymous key | Yes | - |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | Yes | - |
| `CORS_ORIGIN` | Frontend URL for CORS | Yes | https://buildstock.pro |
| `SENTRY_DSN` | Sentry error tracking | No | - |
| `SENTRY_ENVIRONMENT` | Sentry environment name | No | production |
| `SYNC_API_KEY` | API key for sync endpoints | Yes | Auto-generated |

#### Optional Merchant API Keys

| Variable | Description |
|----------|-------------|
| `SCREWFIX_API_KEY` | ScrewFix API credentials |
| `WICKES_API_KEY` | Wickes API credentials |
| `BANDQ_API_KEY` | B&Q API credentials |
| `JEWSON_API_KEY` | Jewson API credentials |

## Deployment Steps

### Step 1: Prepare GitHub Repository

1. Ensure backend code is in a GitHub repository
2. Verify `render.yaml` is in the backend root directory
3. Add `.env.example` for documentation (optional)
4. **Do not commit** `.env` file (it's in `.gitignore`)

### Step 2: Create Render Web Service

1. Go to https://dashboard.render.com
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Select the **backend** directory as root
5. Render will detect `render.yaml` and pre-fill configuration
6. Verify settings:
   - **Name**: buildstock-pro-backend
   - **Environment**: Node
   - **Build Command**: `bun install`
   - **Start Command**: `bun run start`
7. Click **"Advanced"** to configure environment variables

### Step 3: Configure Environment Variables

Add the following environment variables in Render dashboard:

#### Supabase Configuration
Get these from your Supabase project settings:

```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

#### Application Configuration
```
NODE_ENV=production
PORT=10000
CORS_ORIGIN=https://buildstock.pro
JWT_SECRET=<generate-strong-secret>
SYNC_API_KEY=<generate-strong-api-key>
```

#### Sentry (Optional)
```
SENTRY_DSN=your-sentry-dsn
SENTRY_ENVIRONMENT=production
```

### Step 4: Deploy

1. Click **"Create Web Service"**
2. Render will build and deploy your backend
3. Monitor logs in the Render dashboard
4. Once deployed, you'll get a URL like: `https://buildstock-pro-backend.onrender.com`

### Step 5: Verify Deployment

Test the following endpoints:

```bash
# Health check
curl https://your-backend.onrender.com/health

# API info
curl https://your-backend.onrender.com/api/v1

# Root endpoint
curl https://your-backend.onrender.com/
```

Expected responses:

**Health Check:**
```json
{
  "success": true,
  "status": "healthy",
  "timestamp": "2026-01-29T20:50:02.756Z"
}
```

**API Info:**
```json
{
  "success": true,
  "message": "BuildStock Pro API v1",
  "endpoints": { ... }
}
```

## Port Configuration

The backend uses `process.env.PORT` which Render automatically provides. Default fallback is `3001` for local development.

**From `/Users/macbook/Desktop/buildstock.pro/buildstock-pro/backend/src/index.ts`:**
```typescript
const PORT = process.env.PORT || 3001;
```

## Health Check

Render will use the `/health` endpoint for health checks. This endpoint:
- Returns 200 OK status
- Provides current timestamp
- Confirms service is running

**Health check endpoint:**
```typescript
.get('/health', () => ({
  success: true,
  status: 'healthy',
  timestamp: new Date().toISOString(),
}))
```

## Database Configuration

### Option 1: Use Render PostgreSQL (Recommended for Production)

The `render.yaml` includes a Render PostgreSQL database configuration. The `DATABASE_URL` will be automatically populated.

### Option 2: Use Supabase (Current Configuration)

The backend is currently configured to use Supabase. Both `DATABASE_URL` (for raw SQL) and Supabase client are supported.

**Current setup:**
- Primary: Supabase client for most queries
- Fallback: Direct PostgreSQL via `DATABASE_URL` for complex queries

## Monitoring and Logging

### Render Dashboard
- View real-time logs in Render dashboard
- Monitor deployment status
- Check resource usage

### Sentry Integration
The backend includes Sentry error tracking:
- Errors are automatically captured
- Performance monitoring enabled (10% sampling in production)
- Sensitive data is filtered out

**Configure Sentry:**
```bash
SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
SENTRY_ENVIRONMENT=production
```

## Automatic Deployments

Render automatically deploys when you push to the connected branch (default: `main`).

To disable automatic deployments:
1. Go to your web service in Render dashboard
2. Settings → Auto-Deploy
3. Turn off "Auto-Deploy for all commits"

## Background Jobs

The backend starts two background services:
1. **Merchant Sync Service**: Periodically syncs product data from merchants
2. **Job Scheduler**: Runs scheduled tasks (price checks, stock alerts, etc.)

These are automatically started when the application boots.

## Troubleshooting

### Common Issues

**1. Port binding errors**
- Ensure `process.env.PORT` is used (not hardcoded)
- Default port on Render is 10000

**2. Database connection failures**
- Verify `DATABASE_URL` is correctly set
- Check Supabase credentials are valid
- Ensure database allows connections from Render's IP

**3. CORS errors**
- Set `CORS_ORIGIN` to your frontend URL
- Include both http and https if needed

**4. Build failures**
- Check `bun.lock` is committed
- Verify all dependencies in `package.json`
- Review build logs in Render dashboard

**5. 502/503 errors**
- Check if service is starting correctly
- Verify health check endpoint responds
- Review logs for startup errors

### Log Locations

**Render Logs:**
- Real-time: Dashboard → Logs
- Past deployments: Dashboard → Events

**Sentry Errors:**
- https://sentry.io/dashboard/

## Security Checklist

- [ ] Change `JWT_SECRET` from default
- [ ] Set strong `SYNC_API_KEY`
- [ ] Never commit `.env` file
- [ ] Use `SUPABASE_SERVICE_ROLE_KEY` only on backend
- [ ] Enable Sentry for error tracking
- [ ] Set `CORS_ORIGIN` to production domain
- [ ] Review API key permissions in Supabase
- [ ] Enable Render's automatic SSL

## Post-Deployment Tasks

1. **Update frontend API URL** to point to new backend
2. **Configure custom domain** (optional)
3. **Set up monitoring** alerts in Render
4. **Test all API endpoints** with production data
5. **Verify background jobs** are running
6. **Check Sentry** for any errors

## Cost Estimates

**Render Free Tier:**
- Web Service: Free (with limitations)
- Database: Free (90 days, then $7/month)

**Render Starter ($7/month):**
- Better performance
- More RAM/CPU
- No cold starts

## Support

For issues or questions:
- Render docs: https://render.com/docs
- Supabase docs: https://supabase.com/docs
- Check logs in Render dashboard
- Review Sentry for errors
