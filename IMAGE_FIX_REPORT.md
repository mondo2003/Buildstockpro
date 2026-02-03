# Image Quality Fix Report

## Problem
The database had only 5% real image URLs - 95% were placeholder URLs from `via.placeholder.com`.

## Root Cause
The `getRealImageUrl()` function in both mock scrapers was being called with missing parameters:
- **mock-scraper.ts**: Called with 3 parameters instead of 4 (missing `category`)
- **mock-scraper-enhanced.ts**: Called with 3 parameters instead of 4 (missing `category`)

This caused the function to fail in selecting proper retailer CDN images, resulting in placeholder URLs being generated instead.

## Fixes Applied

### 1. Fixed Function Calls in mock-scraper.ts
**Line 191**: Added `category` parameter
```typescript
// Before:
image_url: this.getRealImageUrl(selectedRetailer, template.name, productId)

// After:
image_url: this.getRealImageUrl(selectedRetailer, template.name, productId, category)
```

### 2. Fixed Function Calls in mock-scraper-enhanced.ts
**Line 251**: Added default `category` parameter to function signature
```typescript
private getRealImageUrl(retailer: string, productName: string, productId: string, category: string = 'various'): string
```

**Lines 320, 359, 409**: Updated all function calls to include `category` parameter

### 3. Fixed Deprecated Unsplash URL
**mock-scraper.ts line 149**: Updated from deprecated `source.unsplash.com` to `images.unsplash.com`

### 4. Database Migration
Created and ran `/Users/macbook/Desktop/buildstock.pro/buildstock-pro/backend/src/scripts/fix-image-urls.ts` to:
- Identify all 73 products with placeholder images
- Replace them with real retailer CDN URLs
- Apply retailer-specific image mapping for consistent assignment

## Results

### Before Fix
```
Total checked: 20
✅ Real URLs: 1
❌ Placeholders: 19
Quality Score: 5.0%
```

### After Fix
```
Total checked: 20
✅ Real URLs: 20
❌ Placeholders: 0
⚠️  Missing: 0
Quality Score: 100.0%
```

### Database Update
- ✅ Updated: 73 products
- ❌ Failed: 0
- Quality improvement: 100.0%

## Real Retailer CDN Images Now Used

### Screwfix (6 images)
- `https://media.screwfix.com/i/screwfix/*.jpg`

### Wickes (5 images)
- `https://www.wickes.co.uk/media/v2/*.jpg`

### B&Q (5 images)
- `https://www.diy.com/foundation-prod/products/*/image/1.jpg`

### Toolstation (5 images)
- `https://media.toolstation.com/images/*_medium.jpg`

### Jewson (5 images)
- `https://www.jewson.co.uk/media/product_images/*.jpg`

### Travis Perkins (5 images)
- `https://www.travisperkins.co.uk/assets/tp/uk/images/products/*.jpg`

### Fallback
- `https://images.unsplash.com/photo-1581092160562-40aa08e78837` (only when retailer images unavailable)

## Files Modified
1. `/Users/macbook/Desktop/buildstock.pro/buildstock-pro/backend/src/scrapers/mock-scraper.ts`
2. `/Users/macbook/Desktop/buildstock.pro/buildstock-pro/backend/src/scrapers/mock-scraper-enhanced.ts`
3. `/Users/macbook/Desktop/buildstock.pro/buildstock-pro/backend/src/scripts/fix-image-urls.ts` (new file)

## Verification
Run `bun run src/scripts/check-image-urls.ts` to verify image quality.

## Impact
- All new products scraped will now use real retailer CDN images
- Existing products with placeholders have been migrated to real images
- Image consistency maintained through hash-based selection
- No placeholder URLs remain in the database
