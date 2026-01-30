# Start Beta Testing - Quick Guide

**Version:** 1.0.0-beta
**Date:** January 30, 2026
**Time to Complete:** 10-15 minutes

---

## Welcome to BuildStock Pro Beta Testing!

Thank you for participating in our beta testing program. This quick guide will help you get started immediately. For comprehensive testing, please refer to the full documentation.

---

## Live Application URLs

### Frontend (Web App)
**URL:** https://buildstock.pro
- Landing page and main application
- No login required for basic search
- Deployed on Vercel

### Backend API
**URL:** https://buildstock-api.onrender.com
- Health check: https://buildstock-api.onrender.com/health
- API endpoints for products, search, etc.
- Deployed on Render

### Database
- **Platform:** Supabase
- **Project ID:** xrhlumtimbmglzrfrnnk
- **Region:** EU-West-1
- **Dashboard:** https://supabase.com/dashboard/project/xrhlumtimbmglzrfrnnk

---

## 3 Critical Tests to Run Immediately

These are the **smoke tests** that verify the basic functionality is working. Each test takes 1-2 minutes.

### Test 1: Frontend Load Test (1 minute)

**Objective:** Verify the website loads without errors

**Steps:**
1. Open your browser and go to: https://buildstock.pro
2. Wait for the page to fully load
3. Press F12 to open browser DevTools
4. Click on the "Console" tab
5. Look for any red error messages

**Expected Result:**
- Page loads within 3 seconds
- Landing page displays with BuildStop branding
- NO red errors in the console
- All images load successfully

**If Test Fails:**
- Take a screenshot of the error
- Note your browser and version
- Check your internet connection
- Report immediately (see "How to Report Bugs" below)

---

### Test 2: Backend Health Check (30 seconds)

**Objective:** Verify the backend API is running and connected to the database

**Steps:**
1. Open a new browser tab
2. Go to: https://buildstock-api.onrender.com/health
3. You should see a JSON response

**Expected Result:**
```json
{
  "status": "ok",
  "timestamp": "2026-01-30T...",
  "database": "connected"
}
```

**Alternative (Command Line):**
```bash
curl https://buildstock-api.onrender.com/health
```

**If Test Fails:**
- If you see "503 Service Unavailable": Backend is starting up (wait 2 minutes and retry)
- If you see "500 Internal Server Error": Database connection issue
- Take a screenshot and report immediately

---

### Test 3: Get Started Navigation Test (1 minute)

**Objective:** Verify navigation from landing page to the app works

**Steps:**
1. Go to: https://buildstock.pro
2. Find any "Get Started" button (there are several on the page)
3. Click the button
4. Observe the redirect

**Expected Result:**
- Redirects to https://buildstock.pro/app within 1 second
- App interface loads successfully
- URL changes correctly
- No 404 errors

**If Test Fails:**
- Note which button you clicked (top nav, hero section, etc.)
- Check if the URL changed
- Take a screenshot
- Report the issue

---

## Bonus Quick Test: Search Functionality (2 minutes)

After completing the 3 critical tests, try the search feature:

**Steps:**
1. Go to https://buildstock.pro/app
2. Find the search bar
3. Type "cement" and press Enter
4. Wait for results

**Expected Result:**
- Results appear within 2 seconds
- Results show building materials related to cement
- Results display prices and merchant names
- No errors in console (F12 → Console tab)

---

## How to Report Bugs

### Quick Bug Report Process

1. **Document Immediately**
   - Don't rely on memory
   - Take screenshots or screen recordings
   - Note your browser and device
   - Copy error messages from console (F12)

2. **Use Bug Report Template**

```markdown
### Bug Report: [Brief Title]

**Severity:** [Critical/Major/Minor]
**Priority:** [P0/P1/P2]
**Reporter:** [Your Name]
**Date:** [YYYY-MM-DD]

#### Steps to Reproduce
1. [First step]
2. [Second step]
3. [What happened]

#### Expected Behavior
[What should have happened]

#### Actual Behavior
[What actually happened]

#### Environment
- Browser: [e.g., Chrome 120]
- OS: [e.g., macOS 14.2]
- Device: [e.g., Desktop, iPhone]

#### Console Errors
[Paste any errors from F12 Console]
```

3. **Submit Your Report**
   - **Email:** [to be provided]
   - **GitHub Issues:** https://github.com/mondo2003/Buildstockpro/issues
   - **Slack/Discord:** [link to be provided]

### Bug Severity Guidelines

| Severity | Description | Response Time |
|----------|-------------|---------------|
| **Critical (P0)** | App unusable, crashes, security issue | < 24 hours |
| **Major (P1)** | Core feature broken, significant impact | < 3 days |
| **Minor (P2)** | Non-essential feature broken | < 1 week |
| **Trivial (P3)** | Cosmetic issue, small typo | Backlog |

---

## Expected Timeline

### Week 1: Onboarding & Smoke Testing (Jan 30 - Feb 6)
- **Today:** Complete 3 Critical Tests
- **This Week:** Explore the app, test basic features
- **Goal:** Verify core functionality works

### Week 2: Core Features Testing (Feb 7 - Feb 13)
- Test filtering, sorting, user accounts
- Test saved searches and alerts
- Test image system
- **Goal:** 90%+ of features working

### Week 3: Edge Cases & Stress Testing (Feb 14 - Feb 20)
- Test edge cases (special characters, long queries)
- Test mobile responsiveness
- Test different browsers
- **Goal:** Find hidden bugs

### Week 4: Feedback & Polish (Feb 21 - Feb 27)
- Bug fixes and retesting
- Performance optimization
- Final validation
- **Goal:** Ready for public launch

### Public Launch Target: March 1, 2026

---

## Getting Help

### If Something Breaks

**1. Check the Documentation:**
- Beta Testing Checklist: `/Users/macbook/Desktop/buildstock.pro/BETA_TESTING_CHECKLIST.md`
- Full Launch Guide: `/Users/macbook/Desktop/buildstock.pro/BETA_LAUNCH_READY.md`
- Production Guide: `/Users/macbook/Desktop/buildstock.pro/PRODUCTION_GO_LIVE_GUIDE.md`

**2. Run the Automated Test Script:**
```bash
cd /Users/macbook/Desktop/buildstock.pro
./quick-beta-test.sh
```

This script will test:
- Frontend load
- Backend health
- API endpoints
- Search functionality
- Database connectivity
- SSL certificates
- Response times

**3. Contact Support:**
- **Email:** [to be provided]
- **GitHub Issues:** https://github.com/mondo2003/Buildstockpro/issues
- **Slack/Discord:** [link to be provided]

**4. Check System Status:**
- Backend Health: https://buildstock-api.onrender.com/health
- Vercel Status: https://www.vercel-status.com/
- Render Status: https://status.render.com/

### Response Times

| Issue Type | Response Time |
|------------|---------------|
| Critical (P0) | < 4 hours |
| Major (P1) | < 24 hours |
| Minor (P2) | < 3 days |
| Questions | < 24 hours |

---

## What to Test Next

After completing the 3 critical tests, explore these features:

### Core Features
- [ ] Search for different building materials (cement, wood, steel, bricks)
- [ ] Filter by price range
- [ ] Sort by price (low to high, high to low)
- [ ] Filter by merchant (Travis Perkins, Screwfix, Jewson, etc.)
- [ ] View product details
- [ ] Check product images

### User Account (Optional)
- [ ] Sign up for an account
- [ ] Log in
- [ ] Save a search
- [ ] Create a price alert
- [ ] View your dashboard

### Edge Cases
- [ ] Search with special characters (@, #, $, %)
- [ ] Search with very long terms
- [ ] Test on mobile device
- [ ] Test in different browsers (Chrome, Firefox, Safari)
- [ ] Test slow network (DevTools → Network → Throttling)

---

## Common Issues and Solutions

### Issue: Page doesn't load
**Solution:**
- Check your internet connection
- Clear browser cache (Ctrl+Shift+Delete / Cmd+Shift+Delete)
- Try a different browser
- Check if other websites work

### Issue: Backend health check fails
**Solution:**
- Wait 2 minutes and retry (Render may be waking up)
- Check Render status page
- Report if issue persists

### Issue: Search returns no results
**Solution:**
- Try simpler search terms (e.g., "cement" instead of "cement bags 50kg")
- Check spelling
- Report if common terms return no results

### Issue: Console errors
**Solution:**
- Take a screenshot of the error
- Copy the error message
- Note what you were doing when it occurred
- Report with full details

---

## Recommended Testing Tools

### Browser DevTools (Essential)

**How to Open:** Press F12 or right-click → Inspect

**Key Tabs:**
- **Console:** Check for JavaScript errors
- **Network:** Monitor API calls and response times
- **Application:** View localStorage and cookies
- **Lighthouse:** Run performance audits

### Performance Testing

**Online Tools:**
- PageSpeed Insights: https://pagespeed.web.dev
- GTmetrix: https://gtmetrix.com
- WebPageTest: https://www.webpagetest.org

**Browser Extensions:**
- Lighthouse (built into Chrome)
- React DevTools
- Redux DevTools

---

## Beta Tester Perks

We appreciate your contribution!

### All Beta Testers Get
- Free premium account for 6 months after launch
- "Beta Tester" badge on profile
- Early access to new features
- Input on feature roadmap

### Top Contributors Get
- Extended premium (12 months free)
- BuildStock Pro swag (t-shirt, stickers)
- Priority support forever
- Special recognition on our website

### How to Qualify
- **Minimum:** Complete all Critical Tests
- **Standard:** 50+ bug reports or 100+ searches
- **Top Contributor:** 100+ bug reports or exceptional feedback

---

## Next Steps

### Right Now
1. Complete the 3 Critical Tests (10 minutes)
2. Report any issues immediately
3. Join the community (Slack/Discord)

### Today
1. Try searching for different materials
2. Test navigation and filters
3. Create an account (optional)
4. Report any bugs you find

### This Week
1. Read the full testing checklist: `BETA_TESTING_CHECKLIST.md`
2. Complete the "First 5 Tests" in `BETA_LAUNCH_READY.md`
3. Test on different devices/browsers
4. Share your first impressions

---

## Quick Reference

### URLs
- **Frontend:** https://buildstock.pro
- **Backend:** https://buildstock-api.onrender.com
- **Health Check:** https://buildstock-api.onrender.com/health
- **Database:** https://supabase.com/dashboard/project/xrhlumtimbmglzrfrnnk

### Documentation
- **This Guide:** `/Users/macbook/Desktop/buildstock.pro/START_BETA_TESTING.md`
- **Full Checklist:** `/Users/macbook/Desktop/buildstock.pro/BETA_TESTING_CHECKLIST.md`
- **Launch Guide:** `/Users/macbook/Desktop/buildstock.pro/BETA_LAUNCH_READY.md`
- **Production Guide:** `/Users/macbook/Desktop/buildstock.pro/PRODUCTION_GO_LIVE_GUIDE.md`

### Scripts
- **Quick Test:** `/Users/macbook/Desktop/buildstock.pro/quick-beta-test.sh`

### Repositories
- **GitHub:** https://github.com/mondo2003/Buildstockpro

---

## FAQ

**Q: Do I need technical skills?**
A: No! We need both technical and non-technical testers. Real-world usage is valuable.

**Q: What if I find a lot of bugs?**
A: That's great! Finding bugs is exactly what you're here for.

**Q: Can I share the app with others?**
A: Please don't share publicly yet. We're in closed beta. Contact us if you want to invite someone.

**Q: Will my data be safe?**
A: Yes. We follow security best practices. Your data is encrypted and never shared.

**Q: How much time do I need to commit?**
A: Minimum 2-3 hours total. More is great, but we value focused testing over long sessions.

**Q: What happens after beta testing ends?**
A: We'll fix the bugs you found, implement your feedback, and launch publicly in March.

**Q: Can I continue using the app after beta?**
A: Yes! All beta testers get free premium access.

---

## Thank You!

BuildStock Pro is ready for beta testing! We've worked hard to create a comprehensive platform for comparing building materials across UK merchants. Your feedback will be invaluable in making this the best it can be.

**Key Points:**
- App is live at https://buildstock.pro
- Backend is running at https://buildstock-api.onrender.com
- Start with the 3 Critical Tests
- Report all bugs using the template
- Join our community for support
- Testing period: 4 weeks (Jan 30 - Feb 27)
- Public launch: March 1, 2026

**Let's build something great together!**

---

**Document Version:** 1.0
**Last Updated:** January 30, 2026
**Next Review:** After Week 1 of beta testing

**For the latest updates, check:**
- GitHub: https://github.com/mondo2003/Buildstockpro
- Website: https://buildstock.pro
- Email: [to be provided]
