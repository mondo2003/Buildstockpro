# BuildStop Landing Page - Quick Testing Guide

## 🚀 Quick Start

```bash
cd /Users/macbook/Desktop/buildstock.pro/BuildStop-Landing-Page
npm run dev
```

Visit: http://localhost:5173/

---

## ✅ What to Test

### 1. Search Feature
**Try these searches:**
- `insulation` → Should show Recycled Insulation Roll
- `paint` → Should show paint products
- `flooring` → Should show Bamboo Flooring Panels
- `led` or `light` → Should show LED Downlight Fixtures
- `bamboo` → Should show flooring (OUT OF STOCK example)

**What should happen:**
1. Loading spinner appears
2. Results display in a grid
3. Each card shows: name, price, description, merchant, stock status
4. "Add to Cart" button works (disabled if out of stock)
5. Close button (✕) hides results

### 2. Cart Feature

**Add items:**
1. Click "Add to Cart" on demo product card
2. OR search and add items from results
3. Cart badge should show count

**View cart:**
1. Click cart icon (top right)
2. Modal slides in from right
3. See all items with quantities
4. Use +/- buttons to adjust quantities
5. Click trash icon to remove items
6. See total updating

**Test persistence:**
1. Add items to cart
2. Refresh page (Cmd+R / F5)
3. Cart should still have items

**Checkout:**
1. Click "Proceed to Checkout"
2. Should see notification
3. Should scroll to contact section
4. Cart closes

### 3. Empty States

**Empty cart:**
1. Remove all items from cart
2. Should see empty cart message
3. "Continue Shopping" button should work
4. Checkout button should be disabled

**No search results:**
1. Search for something that doesn't exist (e.g., "xyz123")
2. Should see "No results found" message
3. Should suggest search terms

### 4. Beta Modal

1. Click any feature card in "Features" section
2. Beta modal should appear
3. Read the updated message
4. Click "Join Beta Program" → should scroll to contact
5. Click "Continue Exploring" → should close modal

### 5. Contact Form

1. Fill in all fields
2. Click "Send Message"
3. Email client should open with pre-filled message
4. Should see confirmation alert

---

## 🎨 Visual Checks

### Responsive Design
- **Desktop (> 768px):** Cart slides from right, full width
- **Mobile (< 600px):** Cart full width, stacked items
- **Tablet (600-768px):** Adjusted layouts

### Animations
- Cart badge bounces when adding items
- Toast notification slides in from right
- Cart modal slides in from right
- Search results fade in
- Buttons have hover effects

### Colors
- Green eco-badges for eco-friendly products
- Red for out of stock
- Green for in stock
- Blue for primary actions

---

## 🔧 Developer Notes

### API Integration
The search tries the Supabase API first:
```
https://xrhlumtimbmglzrfrnnk.supabase.co/functions/v1/search?q=insulation
```

If it fails or returns no results, it falls back to mock data automatically.

### Mock Data
8 products are defined in `script.js`:
- Recycled Insulation Roll (£24.99)
- FSC-Certified Plywood (£45.00)
- Low-VOC Interior Paint (£32.50)
- Solar Reflective Roof Tiles (£89.99)
- Bamboo Flooring Panels (£67.50) - OUT OF STOCK
- LED Downlight Fixtures (£18.50)
- Water-Based Wood Stain (£28.75)
- Smart Thermostat (£249.99)

### localStorage Keys
- `buildstopCart` - Cart items array

### Product Object Structure
```javascript
{
    id: "string",
    name: "string",
    variant: "string",
    price: number,
    quantity: number
}
```

---

## 🐛 Known Issues

**None!** All "coming soon" features have been implemented.

---

## 📊 Feature Status

| Feature | Status | Notes |
|---------|--------|-------|
| Search (API) | ✅ Working | Tries real API, falls back to mock |
| Search (Mock) | ✅ Working | 8 products available |
| Add to Cart | ✅ Working | From demo card or search results |
| Cart Modal | ✅ Working | Full CRUD operations |
| Cart Persistence | ✅ Working | Survives page reload |
| Cart Badge | ✅ Working | Shows count with animation |
| Checkout Button | ✅ Working | Scrolls to contact (demo flow) |
| Notifications | ✅ Working | Toast messages for feedback |
| Beta Modal | ✅ Working | Updated messaging |
| Contact Form | ✅ Working | Opens email client |

---

## 🎯 Success Criteria

✅ No "coming soon" alerts when clicking buttons
✅ Search returns results
✅ Cart adds/removes items
✅ Cart persists across refresh
✅ All buttons provide feedback
✅ Mobile responsive
✅ Smooth animations
✅ Professional appearance

---

*Last updated: 2026-01-30*
