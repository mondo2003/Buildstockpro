# BuildStock Pro - Beta Launch Ready

**Status:** Ready for Beta Testing
**Launch Date:** January 30, 2026
**Version:** 1.0.0-beta
**Testing Period:** 4 Weeks

---

## Live URLs (Production Environment)

### Frontend Application
- **URL:** https://buildstock.pro
- **Platform:** Vercel
- **Status:** Live and accessible
- **Deployed:** January 30, 2026

### Backend API
- **URL:** https://buildstock-api.onrender.com
- **Platform:** Render
- **Health Endpoint:** https://buildstock-api.onrender.com/health
- **Status:** Live and operational

### Database
- **Platform:** Supabase
- **Project ID:** xrhlumtimbmglzrfrnnk
- **Region:** EU-West-1
- **Dashboard:** https://supabase.com/dashboard/project/xrhlumtimbmglzrfrnnk

---

## How to Access the App

### For Beta Testers

1. **Visit the Application**
   - Open your browser and go to: https://buildstock.pro
   - The landing page will load with BuildStop branding

2. **Get Started**
   - Click any "Get Started" button
   - You'll be redirected to the main application at https://buildstock.pro/app
   - No login required for basic search functionality

3. **Create Account (Optional)**
   - Click "Sign Up" in the navigation
   - Use email/password or social login (Google)
   - Verify your email address
   - Access premium features (saved searches, price alerts)

4. **Start Testing**
   - Try searching for building materials
   - Test filtering and sorting
   - Report any bugs you find

### For Developers

1. **Frontend Repository**
   - GitHub: https://github.com/mondo2003/Buildstockpro
   - Branch: `main`
   - Directory: `buildstock-pro/frontend/`

2. **Backend Repository**
   - GitHub: https://github.com/mondo2003/Buildstockpro
   - Branch: `main`
   - Directory: `buildstock-pro/backend/`

3. **Deployment Documentation**
   - Frontend: `buildstock-pro/frontend/VERCEL_DEPLOYMENT_GUIDE.md`
   - Backend: `buildstock-pro/backend/DEPLOYMENT.md`
   - Production: `PRODUCTION_GO_LIVE_GUIDE.md`

---

## First 5 Tests to Run Immediately

These are the smoke tests that MUST pass before any other testing:

### Test 1: Frontend Load Test
**URL:** https://buildstock.pro
**Steps:**
1. Open the URL in your browser
2. Verify the landing page loads within 3 seconds
3. Check for no JavaScript errors (open DevTools with F12 → Console tab)
4. Verify the page is responsive (try resizing browser window)

**Expected Result:** Landing page loads fully with no errors
**Time:** 1 minute

---

### Test 2: Backend Health Check
**URL:** https://buildstock-api.onrender.com/health
**Steps:**
1. Open the URL in your browser
2. Or run: `curl https://buildstock-api.onrender.com/health`
3. Check the response JSON

**Expected Result:**
```json
{
  "status": "ok",
  "timestamp": "2026-01-30T...",
  "database": "connected"
}
```

**Time:** 30 seconds

---

### Test 3: Get Started Navigation
**URL:** https://buildstock.pro
**Steps:**
1. Click any "Get Started" button on the landing page
2. Verify redirect to https://buildstock.pro/app
3. Check that the app interface loads

**Expected Result:** Redirects to app homepage within 1 second
**Time:** 1 minute

---

### Test 4: Search Functionality
**URL:** https://buildstock.pro/app
**Steps:**
1. Locate the search bar
2. Type "cement" and press Enter
3. Wait for results
4. Verify results appear and show building materials

**Expected Result:** Search returns relevant results within 2 seconds
**Time:** 2 minutes

---

### Test 5: API Integration Test
**URL:** https://buildstock.pro/app
**Steps:**
1. Open browser DevTools (F12)
2. Go to Network tab
3. Perform a search (e.g., "wood")
4. Check for API calls to backend

**Expected Result:** API calls return 200 status with product data
**Time:** 2 minutes

---

## Critical Tests (Must Pass)

These tests are blocking - if any fail, do not proceed with beta testing.

### Critical Test 1: Authentication Flow
- [ ] Sign up with email works
- [ ] Email verification is sent
- [ ] User can log in after verification
- [ ] Session persists after page refresh
- [ ] Logout works correctly

### Critical Test 2: Search & Results
- [ ] Search bar is visible and accessible
- [ ] Search returns relevant results
- [ ] Results display correctly (name, price, merchant)
- [ ] Clicking a result navigates to product detail
- [ ] No duplicate results appear
- [ ] "No results" message shows when appropriate

### Critical Test 3: Navigation
- [ ] All "Get Started" buttons work
- [ ] Navigation menu links work
- [ ] Logo click returns to homepage
- [ ] Browser back/forward buttons work
- [ ] No 404 errors on navigation

### Critical Test 4: Contact Form
- [ ] Contact form is accessible
- [ ] Form validation works (required fields)
- [ ] Submit opens email client with pre-filled data
- [ ] No JavaScript errors on submission

### Critical Test 5: Page Load Performance
- [ ] Homepage loads in < 3 seconds
- [ ] App pages load in < 2 seconds
- [ ] No infinite loading states
- [ ] No console errors on normal usage
- [ ] All images load successfully

### Critical Test 6: Database Connection
- [ ] Backend can connect to Supabase
- [ ] All 16 tables exist
- [ ] Merchants table has data (6 UK merchants)
- [ ] Products table has data
- [ ] Queries execute successfully

### Critical Test 7: API Endpoints
- [ ] GET /api/v1/products works
- [ ] GET /api/v1/products/search works
- [ ] POST /api/v1/auth/login works
- [ ] POST /api/v1/auth/register works
- [ ] CORS headers are correct
- [ ] API responses are < 500ms

---

## How to Report Bugs

### Quick Bug Reporting Process

1. **Document Immediately**
   - Don't rely on memory
   - Take screenshots or screen recordings
   - Note your browser and device
   - Copy error messages from console

2. **Use the Bug Report Template**
   - Located in: BETA_TESTING_CHECKLIST.md (section 7)
   - Copy and fill out the template
   - Be as specific as possible

3. **Submit Your Report**
   - **Email:** [to be provided]
   - **GitHub Issues:** https://github.com/mondo2003/Buildstockpro/issues
   - **Slack/Discord:** [link to be provided]

4. **Include This Information:**
   - Your name and contact
   - Date and time of bug
   - Steps to reproduce (detailed)
   - Expected vs actual behavior
   - Screenshots/screen recordings
   - Browser and version
   - Operating system
   - Console errors (copy from DevTools)

### Bug Severity Guidelines

| Severity | Description | Response Time |
|----------|-------------|---------------|
| **Critical (P0)** | App unusable, crashes, security issue | < 24 hours |
| **Major (P1)** | Core feature broken, significant impact | < 3 days |
| **Minor (P2)** | Non-essential feature broken | < 1 week |
| **Trivial (P3)** | Cosmetic issue, small typo | Backlog |

### What Makes a Good Bug Report?

**Good Example:**
```
Steps to Reproduce:
1. Go to https://buildstock.pro/app
2. Type "cement" in search bar
3. Press Enter
4. Click the first result

Expected: Product detail page loads with cement information
Actual: Page shows 404 error
Browser: Chrome 120.0.6099.109 on macOS 14.2
Console Error: GET https://buildstock.pro/api/v1/products/123 404
```

**Bad Example:**
```
Search is broken
```

---

## Expected Timeline

### Week 1: Onboarding & Smoke Testing (Jan 30 - Feb 6)
- **Day 1-2:** Tester registration and onboarding
- **Day 3-4:** Complete First 5 Tests
- **Day 5-7:** Critical Tests verification
- **Goal:** Verify all core functionality works

### Week 2: Core Features Testing (Feb 7 - Feb 13)
- Test filtering and sorting
- Test user dashboard
- Test saved searches and alerts
- Test image system
- **Goal:** 90%+ of features working

### Week 3: Edge Cases & Stress Testing (Feb 14 - Feb 20)
- Test search edge cases (special characters, long queries)
- Test mobile responsiveness (iOS, Android)
- Test different browsers (Chrome, Firefox, Safari, Edge)
- Test slow network conditions
- **Goal:** Find hidden bugs

### Week 4: Feedback & Polish (Feb 21 - Feb 27)
- Bug fixes and retesting
- Performance optimization
- UI/UX refinements
- Final validation
- **Goal:** Ready for public launch

### Public Launch Target: March 1, 2026

---

## Beta Testing Goals

### Success Metrics

**Engagement:**
- 70%+ tester retention rate
- 10+ searches per tester
- 50%+ create accounts

**Quality:**
- 4+ star average satisfaction
- <5% critical bug rate
- 90%+ uptime maintained
- <2 second average page load

**Feedback:**
- 50+ bug reports filed
- 100+ feature suggestions
- 20+ positive testimonials

### What We're Testing For

1. **Functionality:** Do features work as intended?
2. **Usability:** Is the app easy to use?
3. **Performance:** Is it fast enough?
4. **Stability:** Does it crash or error?
5. **Security:** Is user data safe?
6. **Compatibility:** Does it work on all devices?

---

## Known Issues (If Any)

**As of January 30, 2026:**
- No known critical issues
- No known major issues

**Non-Critical Known Issues:**
- [None documented yet]

**Workarounds:**
- [None needed yet]

*This section will be updated as issues are discovered and reported.*

---

## Beta Tester Support

### Questions & Help

**Email Support:**
- General questions: [to be provided]
- Bug reports: [to be provided]
- urgent issues: [to be provided]

**Community:**
- Slack/Discord: [link to be provided]
- GitHub Discussions: https://github.com/mondo2003/Buildstockpro/discussions

**Office Hours:**
- [Time to be provided]
- [Link to join to be provided]

### Response Time Commitments

| Issue Type | Response Time |
|------------|---------------|
| Critical (P0) | < 4 hours |
| Major (P1) | < 24 hours |
| Minor (P2) | < 3 days |
| Questions | < 24 hours |

### Documentation Available

1. **Beta Testing Checklist:** BETA_TESTING_CHECKLIST.md
2. **Beta Tester Guide:** BETA_TESTER_GUIDE.md
3. **Production Go-Live Guide:** PRODUCTION_GO_LIVE_GUIDE.md
4. **Quick Start:** QUICK_START.md
5. **Deployment Guide:** buildstock-pro/DEPLOYMENT_GUIDE.md

---

## Testing Tools Recommended

### Browser DevTools (Essential)

**How to Open:** Press F12 or right-click → Inspect

**Key Tabs:**
- **Console:** Check for JavaScript errors
- **Network:** Monitor API calls and response times
- **Application:** View localStorage and cookies
- **Lighthouse:** Run performance audits

### Automated Testing Script

We've provided a quick test script at: `/quick-beta-test.sh`

**To run:**
```bash
chmod +x quick-beta-test.sh
./quick-beta-test.sh
```

This script will:
- Test all health endpoints
- Verify database connectivity
- Test search functionality
- Report pass/fail for each test

### Performance Monitoring

**Online Tools:**
- PageSpeed Insights: https://pagespeed.web.dev
- GTmetrix: https://gtmetrix.com
- WebPageTest: https://www.webpagetest.org

**Browser Extensions:**
- Lighthouse (built into Chrome)
- React DevTools (if using React)
- Redux DevTools (if using Redux)

---

## Before You Start Testing

### Pre-Test Checklist

- [ ] You have access to the production URL
- [ ] You've read this document
- [ ] You've read the Beta Testing Checklist
- [ ] You have the bug report template
- [ ] You know how to contact support
- [ ] You've joined the community (Slack/Discord)
- [ ] You understand the timeline and expectations

### Test Environment Setup

1. **Browser:** Chrome, Firefox, Safari, or Edge (latest version)
2. **Device:** Desktop, laptop, tablet, or smartphone
3. **Network:** WiFi or mobile data (try both if possible)
4. **DevTools:** Know how to open F12 Console
5. **Screen Recording:** Optional but helpful (Loom, OBS, etc.)

### Test Data Ideas

**Common UK Building Materials to Search:**
- Cement
- Bricks
- Timber/Wood
- Steel
- Insulation
- Plasterboard
- Paint
- Nails/Screws
- Roofing materials
- Flooring

**Test Scenarios:**
- Price comparison across merchants
- Filter by price range
- Sort by price (low to high)
- Search for specific product codes
- Test with special characters
- Test with very long search terms
- Test mobile vs desktop
- Test slow network (throttle in DevTools)

---

## Recognition & Rewards

We appreciate your contribution to BuildStock Pro!

### Beta Tester Perks

- **Early Access:** Be the first to use new features
- **Free Premium Account:** 6 months free when we launch
- **Exclusive Badge:** "Beta Tester" badge on your profile
- **Input on Roadmap:** Help prioritize features
- **Credit in Release Notes:** With your permission

### Top Contributors

- **Extended Premium:** 12 months free premium account
- **BuildStock Pro Swag:** T-shirt, stickers, mug
- **Priority Support:** Fast response time forever
- **Special Recognition:** Featured on our website
- **Feature Request:** One feature priority implementation

### How to Qualify

- **Minimum:** Complete all Critical Tests
- **Standard:** 50+ bug reports or 100+ searches
- **Top Contributor:** 100+ bug reports or exceptional feedback

---

## Frequently Asked Questions

**Q: Do I need technical skills to be a beta tester?**
A: No! We need both technical and non-technical testers. Real-world usage is valuable.

**Q: What if I find a lot of bugs? Is that bad?**
A: Not at all! Finding bugs is exactly what you're here for. The more you find, the better.

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

**Q: Who do I contact for urgent issues?**
A: Email [urgent contact to be provided] for P0 issues only.

---

## Next Steps

### Immediate Actions (Right Now)

1. **Visit the App:** https://buildstock.pro
2. **Complete First 5 Tests:** (see section above)
3. **Join Community:** [Slack/Discord link to be provided]
4. **Read Full Checklist:** BETA_TESTING_CHECKLIST.md

### This Week

1. **Complete All Critical Tests**
2. **Report Any Bugs Found**
3. **Share Your First Impressions**
4. **Suggest Improvements**

### Ongoing

1. **Use the App for Real Projects** (if you're in construction)
2. **Test New Features** as they're released
3. **Report Bugs Promptly**
4. **Participate in Community Discussions**

---

## Contact Information

### Project Lead
**Name:** [To be provided]
**Email:** [To be provided]
**Role:** Overall coordination, technical decisions

### Developer
**Name:** [To be provided]
**Email:** [To be provided]
**Role:** Bug fixes, feature implementation

### QA Lead
**Name:** [To be provided]
**Email:** [To be provided]
**Role:** Test coordination, bug triage

### Emergency Contact (P0 Issues Only)
**Email:** [To be provided]
**Response Time:** < 4 hours
**When to Use:** Only for critical outages or security issues

---

## Conclusion

BuildStock Pro is ready for beta testing! We've worked hard to create a comprehensive platform for comparing building materials across UK merchants. Your feedback will be invaluable in making this the best it can be.

**Key Points:**
- App is live at https://buildstock.pro
- Backend is running at https://buildstock-api.onrender.com
- Start with the First 5 Tests
- Report all bugs using the template
- Join our community for support
- Testing period: 4 weeks (Jan 30 - Feb 27)
- Public launch: March 1, 2026

**Thank you for being part of BuildStock Pro's journey!**

Let's build something great together!

---

**Document Version:** 1.0
**Last Updated:** January 30, 2026
**Next Review:** After Week 1 of beta testing

**For the latest updates, check:**
- GitHub: https://github.com/mondo2003/Buildstockpro
- Website: https://buildstock.pro
- Email: [to be provided]
