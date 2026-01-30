# BuildStock Pro CI/CD Pipeline - Visual Guide

## Pipeline Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                     BUILDSTOCK PRO CI/CD PIPELINE                          │
└─────────────────────────────────────────────────────────────────────────────┘

┌──────────────────┐
│  PUSH / PR       │
│  to main/develop │
└────────┬─────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                              TESTING PHASE                                  │
├──────────────────────────────┬──────────────────────────────────────────────┤
│        FRONTEND              │              BACKEND                         │
├──────────────────────────────┼──────────────────────────────────────────────┤
│ 1. ESLint                   │ 1. ESLint                                    │
│ 2. TypeScript Check         │ 2. TypeScript Check                          │
│ 3. Build Next.js App        │ 3. Run Tests (if exist)                     │
│                              │ 4. Verify Build                              │
└──────────────────────────────┴──────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         MERGE TO MAIN ONLY                                 │
│                        DEPLOYMENT PHASE                                    │
├──────────────────────────────┬──────────────────────────────────────────────┤
│        FRONTEND              │              BACKEND                         │
├──────────────────────────────┼──────────────────────────────────────────────┤
│ Deploy to Vercel            │ Deploy to Railway                            │
│ - Pull environment          │ - Install dependencies                       │
│ - Build production bundle   │ - Start application                          │
│ - Deploy to edge            │ - Health check                               │
│ - Update DNS                │ - Update URL                                 │
└──────────────────────────────┴──────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         POST-DEPLOYMENT                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│ 1. Smoke Tests                                                              │
│    - Frontend accessibility check                                          │
│    - Backend health check                                                   │
│    - API endpoint verification                                              │
│                                                                              │
│ 2. Notifications (on failure only)                                         │
│    - Slack webhook notification                                             │
│    - Email alert                                                            │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Merchant Sync Job

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         MERCHANT SYNC JOB                                   │
└─────────────────────────────────────────────────────────────────────────────┘

┌──────────────────┐
│  Daily at 2 AM   │  OR  │ Manual Trigger via GitHub UI                 │
│     (UTC)        │      │ - Select merchant                             │
└────────┬─────────┘      │ - Force sync option                          │
         │                └───────────────────────────────────────────────┘
         ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         SYNC EXECUTION                                      │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  For Each Merchant:                                                         │
│  ┌──────────────────────────────────────────────────────────────────┐      │
│  │ 1. Check API Key Availability                                    │      │
│  │ 2. Fetch Product Data from Merchant API                          │      │
│  │ 3. Transform Data to Standard Format                             │      │
│  │ 4. Upsert to Database (Supabase)                                 │      │
│  │ 5. Update Sync Log                                               │      │
│  └──────────────────────────────────────────────────────────────────┘      │
│                                                                              │
│  Merchants: ScrewFix │ Wickes │ B&Q │ Jewson                              │
└─────────────────────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         VERIFICATION                                        │
├─────────────────────────────────────────────────────────────────────────────┤
│ 1. Generate Sync Report (30-day retention)                                  │
│ 2. Verify Database Updates                                                  │
│ 3. Check Sync Status Endpoint                                               │
│ 4. Send Success/Failure Notifications                                        │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Workflow Decision Tree

```
                         ┌─────────────┐
                         │  GIT EVENT  │
                         └──────┬──────┘
                                │
                ┌───────────────┼───────────────┐
                │               │               │
          ┌─────▼─────┐   ┌────▼────┐    ┌────▼────┐
          │ Push to   │   │  PR to  │    │Schedule │
          │ main      │   │ main/   │    │ 2AM UTC │
          │           │   │ develop │    │         │
          └─────┬─────┘   └────┬────┘    └────┬────┘
                │               │               │
                │               │           ┌───▼────────┐
                │               │           │Merchant    │
                │               │           │Sync Job    │
                │               │           └────────────┘
                │               │               
          ┌─────▼─────┐   ┌────▼────┐        
          │Run CI/CD  │   │Run CI/CD │       
          │Full Pipe  │   │Tests Only│       
          └─────┬─────┘   └────┬────┘        
                │               │               
                └───────┬───────┘               
                        │                       
                ┌───────▼────────┐              
                │  All Tests     │              
                │    Pass?       │              
                └───────┬────────┘              
                   ┌───┴───┐                     
                   │ YES   │ NO                   
                ┌──▼──┐  ┌─▼──────┐              
                │Proceed││Notify &│              
                │      ││Stop    │              
                └──┬───┘ └────────┘              
                   │                             
            ┌──────▼──────┐                     
            │ Deploy to   │                     
            │ Production  │                     
            │(main only)  │                     
            └──────┬──────┘                     
                   │                             
            ┌──────▼──────┐                     
            │Smoke Tests  │                     
            └──────┬──────┘                     
                   │                             
            ┌──────▼──────┐                     
            │    Success? │                     
            └──────┬──────┘                     
               ┌───┴───┐                        
               │ YES   │ NO                     
            ┌──▼──┐  ┌─▼──────┐               
            │Done ││Notify  &│               
            │     ││Rollback│               
            └─────┘ └────────┘               
```

## Secrets Configuration Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    SECRETS CONFIGURATION PROCESS                            │
└─────────────────────────────────────────────────────────────────────────────┘

1. GENERATE SECRETS
   ┌────────────────────────────────────────────────────────────────┐
   │ openssl rand -base64 32                                       │
   │ → JWT_SECRET                                                  │
   │ → SYNC_API_KEY                                                │
   └────────────────────────────────────────────────────────────────┘
                              │
                              ▼
2. GET PLATFORM CREDENTIALS
   ┌──────────────┬─────────────────┬──────────────────┐
   │   Supabase   │    Railway      │     Vercel       │
   ├──────────────┼─────────────────┼──────────────────┤
   │ • URL        │ • Token         │ • Token          │
   │ • Anon Key   │ • Service Name  │ • Org ID         │
   │ • Service    │                 │ • Project ID     │
   │   Role Key   │                 │                  │
   │ • Database   │                 │                  │
   │   URL        │                 │                  │
   └──────────────┴─────────────────┴──────────────────┘
                              │
                              ▼
3. ADD TO GITHUB
   Repository Settings → Secrets and variables → Actions
   │
   ├── New Repository Secret (19 secrets)
   │   ├── Database & API (6)
   │   ├── Deployment (5)
   │   ├── Merchant APIs (4 - optional)
   │   └── Notifications (4 - optional)
   │
   └── New Repository Variable (5 variables)
       ├── FRONTEND_URL
       ├── FRONTEND_API_URL
       ├── BACKEND_URL
       ├── SUPABASE_URL
       └── SUPABASE_ANON_KEY
                              │
                              ▼
4. VERIFY & TEST
   ┌────────────────────────────────────────────────────────────────┐
   │ ✓ Create feature branch                                        │
   │ ✓ Push changes                                                 │
   │ ✓ Create PR                                                    │
   │ ✓ Verify workflows run successfully                            │
   │ ✓ Merge to main for full deployment test                      │
   └────────────────────────────────────────────────────────────────┘
```

## Notification Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        NOTIFICATION SYSTEM                                   │
└─────────────────────────────────────────────────────────────────────────────┘

    WORKFLOW FAILS                    SYNC COMPLETES
           │                                  │
           ▼                                  ▼
┌──────────────────────┐        ┌──────────────────────┐
│ Check Notification   │        │ Check Notification   │
│ Settings             │        │ Settings             │
└──────────┬───────────┘        └──────────┬───────────┘
           │                                │
     ┌─────┴─────┐                    ┌─────┴─────┐
     │           │                    │           │
  ┌──▼──┐     ┌──▼──┐              ┌──▼──┐     ┌──▼──┐
  │Slack│     │Email│              │Slack│     │Email│
  │Webhook│   │Alert│              │Webhook│   │Alert│
  └──┬──┘     └──┬──┘              └──┬──┘     └──┬──┘
     │           │                    │           │
     ▼           ▼                    ▼           ▼
┌─────────┐ ┌─────────┐          ┌─────────┐ ┌─────────┐
│Send     │ │Send     │          │Send     │ │Send     │
│Failure  │ │Failure  │          │Success  │ │Success  │
│Message  │ │Email    │          │Message  │ │Email    │
│to Slack │ │to Admin │          │to Slack │ │to Admin │
└─────────┘ └─────────┘          └─────────┘ └─────────┘

Notification Content:
- Workflow name and status
- Repository and branch
- Commit SHA and author
- Error details (if applicable)
- Actionable links (logs, PRs)
```

## File Structure Map

```
buildstock.pro/
│
├── .github/workflows/
│   ├── ci-cd.yml                    # Main pipeline (366 lines)
│   │   ├── Frontend jobs
│   │   ├── Backend jobs
│   │   ├── Deployment jobs
│   │   └── Notification jobs
│   │
│   ├── merchant-sync.yml            # Scheduled sync (202 lines)
│   │   ├── Sync execution
│   │   └── Health verification
│   │
│   ├── README.md                    # Workflow docs (220 lines)
│   └── example-secrets.txt          # Config template (150 lines)
│
├── buildstock-pro/backend/src/scripts/
│   └── sync-merchants.ts            # Sync script (100 lines)
│
├── CI-CD-SETUP.md                   # Setup guide (434 lines)
├── CI-CD-QUICK-REF.md               # Quick ref (286 lines)
├── CI-CD-IMPLEMENTATION-SUMMARY.md  # Summary (396 lines)
└── CI-CD-VISUAL-GUIDE.md            # This file
```

## Quick Reference Tables

### Workflow Comparison

| Feature | CI/CD Pipeline | Merchant Sync |
|---------|---------------|---------------|
| **Triggers** | Push/PR to main/develop | Daily schedule + Manual |
| **Execution Time** | 15-20 minutes | 20-40 minutes |
| **Jobs** | 9 jobs | 2 jobs |
| **Artifacts** | Frontend build (7 days) | Sync report (30 days) |
| **Deployment** | Yes (on main merge) | No |
| **Notifications** | Failure only | Success + Failure |

### Secrets Summary

| Category | Required | Optional |
|----------|----------|----------|
| Database & API | 6 | 0 |
| Deployment | 5 | 0 |
| Merchant APIs | 0 | 4 |
| Notifications | 0 | 4 |
| **TOTAL** | **11** | **8** |

### Documentation Guide

| Document | Length | Best For |
|----------|--------|----------|
| CI-CD-SETUP.md | 434 lines | First-time setup |
| CI-CD-QUICK-REF.md | 286 lines | Daily reference |
| workflows/README.md | 220 lines | Workflow details |
| CI-CD-VISUAL-GUIDE.md | This file | Visual understanding |

---

**Ready to Configure?** Start with `CI-CD-SETUP.md`
**Need Help?** Check troubleshooting sections in each document
**Questions?** Review workflow logs in GitHub Actions
