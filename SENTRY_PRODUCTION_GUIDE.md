# Sentry Production Setup Guide

**Quick guide to enable Sentry error tracking in production for BuildStock Pro.**

---

## Quick Setup (5 Minutes)

### Step 1: Create Sentry Account
1. Go to https://sentry.io
2. Sign up for free (up to 5,000 events/month)
3. Verify your email

### Step 2: Create Projects

**Project 1: Frontend (Next.js)**
- Platform: Next.js
- Name: buildstock-pro-frontend
- Copy the **DSN**

**Project 2: Backend (Bun/Node)**
- Platform: Bun or Node.js
- Name: buildstock-pro-backend
- Copy the **DSN**

### Step 3: Add DSN to Environment Variables

**Frontend (Vercel):**
- Variable: `NEXT_PUBLIC_SENTRY_DSN`
- Value: [Your Frontend DSN]

**Backend (Render):**
- Variable: `SENTRY_DSN`
- Value: [Your Backend DSN]

### Step 4: Redeploy
- Redeploy both frontend and backend

---

## Files Already Configured
No code changes needed! Sentry is already integrated:
- `buildstock-pro/frontend/sentry.*.config.ts`
- `buildstock-pro/backend/src/routes/sentry-test.ts`

---

## Testing
**Backend:** `curl https://your-backend.up.railway.app/sentry-test`

**Frontend:** Open console and type: `throw new Error("Sentry test");`

---

## Environment Variables Reference
| Variable | Frontend | Backend | Purpose |
|----------|----------|---------|---------|
| `NEXT_PUBLIC_SENTRY_DSN` | ✅ | ❌ | Frontend error tracking |
| `SENTRY_DSN` | ❌ | ✅ | Backend error tracking |
| `NEXT_PUBLIC_SENTRY_ENVIRONMENT` | ✅ | ❌ | Environment name |
| `SENTRY_ENVIRONMENT` | ❌ | ✅ | Environment name |

---

## Cost
**Free Tier**: 5,000 events/month
**Paid Plans**: From $26/month (100,000+ events)
