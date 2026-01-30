# BuildStock Pro - Local Testing Guide
**Date:** 2026-01-30
**Status:** Ready for Testing

---

## Quick Access URLs

| Page | URL | Status |
|------|-----|--------|
| **Search** | http://localhost:3000/search | ✅ Working |
| **Landing** | http://localhost:3000/landing | ✅ Working |
| **Backend API** | http://localhost:3001 | ✅ Running |
| **Health Check** | http://localhost:3001/health | ⏳ Check |

---

## Testing Checklist

### 1. Basic Search (Core Functionality)

**Steps:**
1. Open: http://localhost:3000/search
2. Type "wood" in the search bar
3. Click "Search" button
4. **Expected:** See products related to wood/timber

**What to Check:**
- [ ] Search bar accepts input
- [ ] Products appear when searching
- [ ] Product cards display correctly
- [ ] Prices are shown
- [ ] Stock status is visible (In Stock/Low Stock/Out of Stock)

---

### 2. Location Features (NEW!)

**Steps:**
1. Open: http://localhost:3000/search
2. Look for "Enable location for distance sorting" button
3. Click the button
4. Allow location permissions when prompted
5. **Expected:** Green badge appears saying "Location enabled"

**What to Check:**
- [ ] Location enable button is visible
- [ ] Browser asks for location permission
- [ ] Green "Location enabled" badge appears
- [ ] No "permission denied" badge

---

### 3. Distance Sorting (NEW!)

**Steps:**
1. Enable location (see above)
2. Look for "Sort by" dropdown/filter
3. Select "Distance"
4. **Expected:** Products sorted by nearest first

**What to Check:**
- [ ] Distance sort option appears
- [ ] Products reorder when selected
- [ ] Distances shown on product cards (e.g., "2.5km away")

---

### 4. Same-Day Collection Badges (NEW!)

**Steps:**
1. Search for any product
2. Look for green "🚗 Same-day" badges on product cards
3. **Expected:** Some products show same-day collection badge

**What to Check:**
- [ ] Green badges appear on some products
- [ ] Badge has car icon + "Same-day" text
- [ ] Badge is visually distinct

---

### 5. Price Sorting (UPDATED!)

**Steps:**
1. Search for "insulation"
2. Sort by "Price: Low to High"
3. **Expected:** Cheapest products shown first

**What to Check:**
- [ ] Price sort option works
- [ ] Products reorder correctly
- [ ] Prices are accurate

---

### 6. Category Filtering

**Steps:**
1. Open: http://localhost:3000/search
2. Click on "Insulation" category
3. **Expected:** Only insulation products shown

**What to Check:**
- [ ] Category filters work
- [ ] Multiple categories can be selected
- [ ] Clearing filters works

---

### 7. Add to Cart

**Steps:**
1. Search for "insulation"
2. Click "Add to Cart" on a product
3. **Expected:** Cart drawer opens, product added

**What to Check:**
- [ ] Cart drawer opens automatically
- [ ] Toast notification appears
- [ ] Product is in cart
- [ ] Quantity can be adjusted

---

### 8. Reserve Button Features

**Steps:**
1. Click "Add to Cart" on any product
2. Look for "View on Supplier Website" button in toast
3. Click it
4. **Expected:** Opens supplier website in new tab

**What to Check:**
- [ ] Toast appears with action button
- [ ] External link button works
- [ ] Opens in new tab
- [ ] Supplier website loads

---

## Known Issues & Workarounds

### Issue: "Tenant or user not found" in Console
**Status:** Expected - Database auth not configured locally
**Workaround:** App automatically uses mock data - features still work

### Issue: Distance shows "miles" instead of "km"
**Status:** Conversion needed - displays correctly but units are mixed
**Fix:** Already handled by `formatDistance()` function

### Issue: Some images don't load
**Status:** Unsplash API rate limiting
**Workaround:** Placeholder images appear automatically

---

## Browser Console Commands

### Check if location is detected:
```javascript
navigator.geolocation.getCurrentPosition(pos => {
  console.log('Lat:', pos.coords.latitude, 'Lng:', pos.coords.longitude);
});
```

### Test API directly:
```bash
curl "http://localhost:3001/api/v1/search?search=wood&limit=5"
```

### Check mock data:
```javascript
fetch('/api/v1/search?search=wood')
  .then(r => r.json())
  .then(d => console.log(d));
```

---

## Features to Test Priority

| Priority | Feature | Status |
|----------|---------|--------|
| **P0** | Basic search works | ✅ Test |
| **P0** | Products display | ✅ Test |
| **P0** | Add to cart works | ✅ Test |
| **P1** | Location detection | ✅ Test |
| **P1** | Distance sorting | ✅ Test |
| **P1** | Same-day badges | ✅ Test |
| **P2** | Price sorting | ✅ Test |
| **P2** | Category filters | ✅ Test |

---

## Quick Test Commands

```bash
# Test search page loads
curl -s http://localhost:3000/search | grep "Search Building"

# Test backend API
curl "http://localhost:3001/api/v1/search?search=wood&limit=5"

# Test backend health
curl http://localhost:3001/health

# Check what's running
lsof -ti:3000 -ti:3001
```

---

## Next Steps After Testing

### If Everything Works:
1. ✅ All core features working
2. Deploy to production
3. Test on live URL

### If Issues Found:
1. Note the issue below
2. Screenshot if possible
3. Share error messages from browser console (F12)

---

## Report Issues Here

**What to include:**
1. What you were trying to do
2. What you expected to happen
3. What actually happened
4. Browser console errors (F12 → Console tab)

---

**Servers Running:**
- ✅ Frontend: http://localhost:3000 (Next.js)
- ✅ Backend: http://localhost:3001 (Bun + Elysia)

**Happy Testing!** 🚀
