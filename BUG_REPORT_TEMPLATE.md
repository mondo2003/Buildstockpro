# BuildStock Pro - Bug Report Template

**Use this template for all bug reports to ensure consistent, actionable documentation.**

---

## Standard Bug Report Format

```markdown
### Bug Report: [Brief, Descriptive Title]

**Severity:** [Critical/Major/Minor/Trivial]
**Priority:** [P0/P1/P2/P3]
**Reporter:** [Your Name]
**Date Reported:** [YYYY-MM-DD]
**Environment:** [Production/Staging/Dev]
**Bug ID:** [Assigned after submission]

---

#### Description
[Brief 1-2 sentence description of the bug. What is the issue?]

Example: The search functionality does not return any results when searching for "cement" even though cement products exist in the database.

---

#### Steps to Reproduce
[Numbered steps to reproduce the bug. Be as specific as possible.]

1. Navigate to https://buildstock.pro
2. Click on the search bar in the header
3. Type "cement" in the search field
4. Press Enter or click the search button
5. Observe the results page

**Key Details:**
- Exact text entered: [verbatim text]
- Exact button/link clicked: [describe element]
- Browser window size: [dimensions]
- Any specific settings: [describe]

---

#### Expected Behavior
[What should happen? Describe the correct behavior clearly.]

Example: The search should return a list of cement-related products including various types like Portland cement, concrete mix, etc., with prices and merchant information.

---

#### Actual Behavior
[What actually happens? Describe the incorrect behavior in detail.]

Example: The search results page displays "No results found for 'cement'" even though there are cement products in the system. The search spinner continues indefinitely.

---

#### Screenshots/Videos
[Attach screenshots or screen recordings if applicable. Include before/after when relevant.]

**Screenshot 1:** Search bar with "cement" entered
**Screenshot 2:** Empty results page showing "No results found"
**Screenshot 3:** Console errors (F12 → Console tab)

---

#### Environment Details
- **Browser:** [e.g., Chrome 120.0.6099.109, Firefox 121.0, Safari 17.2]
- **Operating System:** [e.g., macOS 14.2, Windows 11, Ubuntu 22.04, iOS 17.2]
- **Device:** [e.g., Desktop, Laptop, iPhone 13 Pro, Samsung Galaxy S22, iPad Pro]
- **Screen Resolution:** [e.g., 1920x1080, 1366x768, 390x844]
- **Network:** [e.g., WiFi 5G, 4G Mobile, Ethernet, 3G]
- **User Role:** [e.g., Guest, Registered User, Premium User - if applicable]

---

#### Console Errors
[Paste any JavaScript errors from browser console. Open DevTools with F12, go to Console tab.]

```javascript
// Example:
Error: Failed to fetch
    at searchProducts (app.js:245:12)
    at HTMLInputElement.handleSearch (app.js:189:5)
```

**Additional Console Output:**
- [Paste any warnings or other relevant output]

---

#### Network Errors
[List any failed network requests. Check Network tab in DevTools.]

| URL | Method | Status Code | Error Message |
|-----|--------|-------------|---------------|
| /api/search?q=cement | GET | 500 | Internal Server Error |
| /api/products/123 | GET | 404 | Not Found |

---

#### Frequency
- [ ] Consistently reproducible (every time)
- [ ] Intermittent (happens sometimes - estimate % of time: ___%)
- [ ] One-time occurrence (only seen once)

**If intermittent:**
- Happens approximately: [e.g., 3 out of 10 times]
- Pattern noticed: [e.g., only on first search after page load]
- Time of occurrence: [e.g., around 2-3 PM EST]

---

#### Workaround
[Is there a way to work around this issue? If yes, describe it clearly.]

Example: Refreshing the page and searching again sometimes returns results. Alternatively, navigating to a category and filtering works.

---

#### Impact
[How does this bug affect users or the system?]

- User Impact: [e.g., Users cannot find products, core feature broken]
- Business Impact: [e.g., Potential loss of sales, negative user experience]
- Technical Impact: [e.g., Database performance degraded, error logs filling]

---

#### Additional Context
[Any other information that might be helpful.]

- Recent changes: [e.g., Started after latest deployment]
- Related issues: [e.g., Similar to Bug #123]
- Test data used: [e.g., Used test account "tester@example.com"]
- Browser extensions: [e.g., Ad blocker enabled/disabled]
- Special circumstances: [e.g., Only happens when VPN is on]

---

#### Possible Solution (Optional)
[If you have an idea of what might be causing the issue or how to fix it, share it here.]

Example: The search API might be timing out. Increasing the timeout or adding retry logic could help.
```

---

## Severity Guidelines

Use these criteria to determine bug severity:

| Severity | Description | Examples |
|----------|-------------|----------|
| **Critical** | Application is unusable, data loss, or security vulnerability | • Login/registration doesn't work<br>• Page crashes on load<br>• Data corruption or loss<br>• Security vulnerability (XSS, SQL injection)<br>• Payment processing fails |
| **Major** | Core feature broken, significant impact on UX | • Search returns no results<br>• Filters don't work<br>• Can't add to cart<br>• Navigation broken<br>• Images don't load<br>• Contact form doesn't submit |
| **Minor** | Non-critical feature broken, cosmetic issue | • Typos in text<br>• Slight visual misalignment<br>• Non-essential button doesn't work<br>• Tooltip missing<br>• Color contrast issue<br>• Small layout bug on one screen size |
| **Trivial** | Very minor issue, no functional impact | • Extra space in text<br>• Minor punctuation error<br>• Very obscure edge case<br>• Nice-to-have enhancement |

---

## Priority Guidelines

Use these criteria to determine bug priority:

| Priority | Description | Target Resolution |
|----------|-------------|-------------------|
| **P0** | Critical - blocks release or affects all users | Immediate (< 24 hours) |
| **P1** | Major - affects many users or core features | Urgent (< 3 days) |
| **P2** | Minor - affects some users or non-core features | Normal (< 1 week) |
| **P3** | Trivial - cosmetic or edge case | Backlog (< 1 month) |

---

## Bug Report Examples

### Example 1: Critical Bug

```markdown
### Bug Report: Application crashes on login attempt

**Severity:** Critical
**Priority:** P0
**Reporter:** Jane Smith
**Date Reported:** 2026-01-30
**Environment:** Production

#### Description
Users cannot log in to their accounts. The application shows a white screen after entering credentials.

#### Steps to Reproduce
1. Navigate to https://buildstock.pro/login
2. Enter valid email: test@example.com
3. Enter valid password: Password123!
4. Click "Login" button
5. Application crashes with white screen

#### Expected Behavior
User should be logged in and redirected to the dashboard.

#### Actual Behavior
Page shows white screen. Console shows unhandled exception.

#### Screenshots/Videos
[Screenshot of white screen]
[Screenshot of console error]

#### Environment Details
- Browser: Chrome 120.0.6099.109
- OS: Windows 11
- Device: Desktop
- Screen Resolution: 1920x1080
- Network: WiFi

#### Console Errors
```javascript
Uncaught TypeError: Cannot read property 'token' of undefined
    at authenticateUser (auth.js:45:12)
    at HTMLButtonElement.<anonymous> (login.js:78:10)
```

#### Network Errors
None (request doesn't complete)

#### Frequency
- [x] Consistently reproducible (every time)

#### Workaround
No workaround. Users cannot access their accounts.

#### Impact
- User Impact: Complete - no users can log in
- Business Impact: Critical - all users locked out
- Technical Impact: Authentication system down

#### Additional Context
Started after deployment at 2:30 PM EST. Affecting all users.
```

---

### Example 2: Major Bug

```markdown
### Bug Report: Search results not sorted by price correctly

**Severity:** Major
**Priority:** P1
**Reporter:** John Doe
**Date Reported:** 2026-01-30
**Environment:** Production

#### Description
When sorting products by price (low to high), results are not in correct order.

#### Steps to Reproduce
1. Navigate to https://buildstock.pro
2. Search for "wood"
3. Click sort dropdown
4. Select "Price: Low to High"
5. Observe results order

#### Expected Behavior
Products should be displayed from lowest price to highest price.

#### Actual Behavior
Products appear in random order. $50 items appear before $20 items.

#### Screenshots/Videos
[Screenshot showing incorrect order with prices highlighted]

#### Environment Details
- Browser: Safari 17.2
- OS: macOS 14.2
- Device: MacBook Pro
- Screen Resolution: 1680x1050
- Network: WiFi

#### Console Errors
No console errors.

#### Network Errors
None.

#### Frequency
- [x] Consistently reproducible (every time)

#### Workaround
Users can manually compare prices, but sorting feature is unreliable.

#### Impact
- User Impact: High - difficult to find best prices
- Business Impact: Medium - core value proposition affected
- Technical Impact: Low - no system instability

#### Additional Context
Affects all product categories. Sort by relevance works fine.
```

---

### Example 3: Minor Bug

```markdown
### Bug Report: Typo in product description header

**Severity:** Minor
**Priority:** P2
**Reporter:** Alex Johnson
**Date Reported:** 2026-01-30
**Environment:** Production

#### Description
The product detail page header says "Product Detials" instead of "Product Details".

#### Steps to Reproduce
1. Navigate to https://buildstock.pro
2. Search for any product
3. Click on any product result
4. Look at page header

#### Expected Behavior
Header should read "Product Details"

#### Actual Behavior
Header reads "Product Detials" (misspelled)

#### Screenshots/Videos
[Screenshot of misspelled header]

#### Environment Details
- Browser: Firefox 121.0
- OS: Ubuntu 22.04
- Device: Desktop
- Screen Resolution: 1920x1080
- Network: Ethernet

#### Console Errors
None.

#### Network Errors
None.

#### Frequency
- [x] Consistently reproducible (every time)

#### Workaround
N/A - typo doesn't prevent functionality

#### Impact
- User Impact: Low - cosmetic issue
- Business Impact: Low - minor unprofessional appearance
- Technical Impact: None

#### Additional Context
Appears on all product pages.
```

---

## Quick Reference: Common Console Commands

When reporting bugs, these DevTools commands help gather information:

### Open DevTools
- **Windows/Linux:** F12 or Ctrl+Shift+I
- **Mac:** Cmd+Option+I

### Take Screenshots
- **Chrome:** Ctrl+Shift+P (Windows) or Cmd+Shift+P (Mac) → Type "screenshot"
- **Full Page:** "Capture full size screenshot"

### Check Network Requests
1. Open DevTools
2. Go to "Network" tab
3. Reproduce the bug
4. Look for red (failed) requests
5. Click request → Copy as cURL (right-click)

### Check Console Errors
1. Open DevTools
2. Go to "Console" tab
3. Reproduce the bug
4. Copy any red errors

### Check Performance
1. Open DevTools
2. Go to "Lighthouse" tab (Chrome)
3. Run audit
4. Report performance scores

---

## Bug Report Checklist

Before submitting your bug report, ensure you've included:

- [ ] Clear, descriptive title
- [ ] Severity and priority assigned
- [ ] Your name and date
- [ ] Environment specified
- [ ] Steps to reproduce (numbered and detailed)
- [ ] Expected behavior described
- [ ] Actual behavior described
- [ ] Screenshots/videos attached (if applicable)
- [ ] Browser/device information
- [ ] Console errors (if any)
- [ ] Network errors (if any)
- [ ] Frequency noted
- [ ] Workaround (if found)
- [ ] Impact assessment

---

## Submit Your Bug Report

**Email:** [To be provided]
**Bug Tracker:** [Link to be provided]
**Slack/Discord:** [Channel to be provided]

Please include "BUG REPORT: [Title]" in the subject line when emailing.

---

**Version:** 1.0
**Last Updated:** January 30, 2026
