# 🚀 Quick Start: 3 Agents for Live Data

**Created:** 2026-01-31
**Status:** Ready to launch
**Files:** `PARALLEL_AGENT_TASKS.md` (complete plan)

---

## 📋 What I've Done

### 1. Added Distance Filter Debugging
**Files Modified:**
- `buildstock-pro/frontend/components/FilterPanel.tsx` - Logs when slider moves
- `buildstock-pro/frontend/components/ProductGrid.tsx` - Logs when filter triggers
- `buildstock-pro/frontend/lib/mockData.ts` - Logs filtering results

**How to Test:**
1. Open http://localhost:3000/search
2. Open browser console (F12)
3. Move the distance slider
4. Look for logs:
   ```
   🎚️ Distance slider changed to: 5 miles
   🔍 ProductGrid: Distance filter detected: 5 miles
   🎯 Distance filter active: 5 miles
   ✅ Distance filter: 100 → 42 products
   ```

**Expected Result:** Product count should decrease when you lower the distance

---

### 2. Created Comprehensive Parallel Agent Plan
**File:** `PARALLEL_AGENT_TASKS.md` (894 lines)

**3 Agents, 1 Week, Live Data:**

#### Agent 1: Database & Infrastructure (4-6 hours)
- Apply database migration
- Seed 21 UK branch locations
- Test PostGIS distance calculations

#### Agent 2: Scraper & Price Integration (6-8 hours)
- Test Screwfix scraper locally
- Create price database table
- Implement price scraping end-to-end
- Build backend API for live prices

#### Agent 3: Deployment & Frontend (6-8 hours)
- Connect frontend to live price API
- Add "Live Price" badges
- Deploy backend to Railway
- Deploy frontend to Vercel
- Set up GitHub Actions for 6-hour sync

---

## 🎯 The Strategy: Hybrid Launch

### What We Keep (Mock Data)
- ✅ Product names
- ✅ Descriptions
- ✅ Images
- ✅ Categories
- ✅ All 100+ products

### What We Add (Live Data)
- 🆕 Real prices (scraped every 6 hours)
- 🆕 Real stock levels (scraped every 6 hours)
- 🆕 "Live Price" badge with timestamp
- 🆕 Automated updates via GitHub Actions

### Why This Approach?
- **Speed:** 3-5 days to launch (vs 2-4 weeks for full scraping)
- **Risk:** Low - core product data already validated
- **Quality:** High - real prices and stock from merchants
- **Upgrade Path:** Easy to add full product scraping later

---

## 🚦 Immediate Next Steps

### Step 1: Test Distance Slider (5 minutes)
```bash
# 1. Start frontend (if not running)
cd buildstock-pro/frontend
bun run dev

# 2. Open http://localhost:3000/search
# 3. Open browser console (F12)
# 4. Move distance slider
# 5. Check console logs
```

**What to look for:**
- Do you see the 🎚️, 🔍, 🎯 log messages?
- Does the product count decrease?
- Any error messages?

---

### Step 2: Choose Your Launch Strategy

**Option A: Parallel Agents (Recommended - 3-5 days)**
```
Terminal 1 → Agent 1 (Database)
Terminal 2 → Agent 2 (Scraper)
Terminal 3 → Agent 3 (Deployment)

All work simultaneously with handoffs
```

**Option B: Sequential Approach (1-2 weeks)**
```
Week 1: Complete Agent 1 tasks
Week 2: Complete Agent 2 + Agent 3 tasks
```

**Option C: Manual Testing First (variable time)**
```
1. Test everything locally first
2. Deploy only when confident
3. Use agents for specific blockers
```

---

## 💡 How to Use the 3 Agents

### Option 1: Open 3 Terminals (Fastest)

**Terminal 1 - Agent 1:**
```bash
cd /Users/macbook/Desktop/buildstock.pro
claude  # Ask me to act as Agent 1
```

**Prompt for Agent 1:**
```
"I need you to be Agent 1 from PARALLEL_AGENT_TASKS.md.
Complete Phase 1: Database Migration.
Follow the tasks exactly as documented.
Report back when complete or if you hit any errors."
```

**Terminal 2 - Agent 2:**
```bash
cd /Users/macbook/Desktop/buildstock.pro
claude  # Ask me to act as Agent 2
```

**Prompt for Agent 2:**
```
"I need you to be Agent 2 from PARALLEL_AGENT_TASKS.md.
Wait for Agent 1 to complete database setup.
Then start Phase 1: Scraper Setup.
Follow the tasks exactly.
Report progress every 30 minutes."
```

**Terminal 3 - Agent 3:**
```bash
cd /Users/macbook/Desktop/buildstock.pro
claude  # Ask me to act as Agent 3
```

**Prompt for Agent 3:**
```
"I need you to be Agent 3 from PARALLEL_AGENT_TASKS.md.
Wait for Agents 1 and 2 to complete their work.
Then start Phase 1: Frontend Integration.
Follow the tasks exactly.
Test thoroughly before deploying to production."
```

---

### Option 2: Use Me as Coordinator (Recommended)

**Single Terminal:**
```bash
cd /Users/macbook/Desktop/buildstock.pro
claude
```

**Prompt:**
```
"I want to launch with live data using the 3-agent parallel plan
from PARALLEL_AGENT_TASKS.md.

Please:
1. Start with Agent 1 tasks (database setup)
2. When Agent 1 completes, move to Agent 2 (scraper)
3. When Agent 2 completes, move to Agent 3 (deployment)

Work through each phase systematically. Ask me before
making any destructive changes (like dropping tables).

Timeline goal: 3-5 days
Quality goal: Production-ready

Let's start!"
```

---

## 📊 Progress Tracking

### Phase 1: Foundation (Hours 0-4)
- [ ] Database migration applied
- [ ] PostGIS verified
- [ ] Branches seeded
- [ ] Scraper tested locally

### Phase 2: Integration (Hours 4-12)
- [ ] Price table created
- [ ] Scraper saves to database
- [ ] Backend API serves prices
- [ ] Frontend fetches live prices

### Phase 3: Launch (Hours 12-24)
- [ ] Deployed to production
- [ ] GitHub Actions syncing
- [ ] End-to-end testing
- [ ] Monitoring active

---

## 🚨 Common Issues & Solutions

### Issue: "Database connection failed"
**Solution:** Check DATABASE_URL in `.env`
```bash
echo $DATABASE_URL  # Should start with postgresql://
```

### Issue: "PostGIS function not found"
**Solution:** Enable PostGIS extension
```bash
psql $DATABASE_URL -c "CREATE EXTENSION postgis;"
```

### Issue: "Scraper blocked by robots.txt"
**Solution:** Check `ScrewfixScraper` logs
- May need to use official API instead
- Or adjust rate limits

### Issue: "Distance slider still not working"
**Solution:** Check browser console logs
- Look for the 🎚️ emoji logs
- Verify filter value is passed
- Check if filtered array changes size

---

## 📞 If You Need Help

### For Database Issues (Agent 1)
```
"Agent 1 hit an error: [paste error]
Task: Phase 1, Task 1.1 - Database Migration
What should I do?"
```

### For Scraper Issues (Agent 2)
```
"Agent 2 hit an error: [paste error]
Task: Phase 1, Task 1.1 - Test Scraper
What should I do?"
```

### For Deployment Issues (Agent 3)
```
"Agent 3 hit an error: [paste error]
Task: Phase 3, Task 3.1 - Deploy Backend
What should I do?"
```

---

## 🎉 Success Metrics

### You'll Know It's Working When:
1. ✅ Frontend shows "Live Price" badge (green dot)
2. ✅ Badge says "Updated 2 hours ago" (timestamp)
3. ✅ Prices match Screwfix website
4. ✅ Stock levels accurate
5. ✅ GitHub Actions runs every 6 hours
6. ✅ Distance slider filters products
7. ✅ Same-day badges show correctly

### Performance Targets:
- Search: <2 seconds
- Page load: <3 seconds
- Price sync: Completes in <5 minutes
- Uptime: >99%

---

## 📚 Related Documentation

- `PARALLEL_AGENT_TASKS.md` - Complete 3-agent plan (894 lines)
- `GO_LIVE_ROADMAP.md` - Full transition roadmap
- `LOCAL_TESTING_GUIDE.md` - Testing checklist
- `LIVE_DATA_IMPLEMENTATION_SUMMARY.md` - Technical details

---

## 🚀 Ready to Launch?

**Quick Test (5 minutes):**
```bash
# Test distance slider
open http://localhost:3000/search
# Check console (F12)
# Move slider
# Look for 🎚️ logs
```

**If working:** Start Agent 1 tasks
**If not working:** Share console logs with me

---

**Generated:** 2026-01-31
**Status:** ✅ Debug code added, ✅ Task plan created
**Next:** Test distance slider, then start Agent 1
**Timeline:** 3-5 days to live data
