# Product Image System - Quick Reference

## Adding New Product Images

### Step 1: Find Images on Unsplash
1. Go to https://unsplash.com
2. Search for your product (e.g., "insulation", "plywood", "paint")
3. Click on an image
4. Click "Download" → "Copy link"
5. Add parameters: `?w=800&q=80`

### Step 2: Update Mock Data
```typescript
// In /frontend/lib/mockData.ts
{
  id: '16',
  name: 'New Product',
  images: [
    'https://images.unsplash.com/photo-XXXXX?w=800&q=80',
    'https://images.unsplash.com/photo-YYYYY?w=800&q=80',
    'https://images.unsplash.com/photo-ZZZZZ?w=800&q=80'
  ],
  // ... rest of product data
}
```

### Step 3: Test
```bash
cd frontend
npm run dev
# Navigate to product and verify images load
```

## Image URL Format

### Unsplash (Production)
```
https://images.unsplash.com/photo-{id}?w=800&q=80
```
- `w=800`: Width in pixels
- `q=80`: Quality (1-100, 80 recommended)

### Placehold.co (Fallback)
```
https://placehold.co/800x600/e2e8f0/64748b?text=Product+Name
```
- `800x600`: Dimensions
- `e2e8f0`: Background color (hex)
- `64748b`: Text color (hex)
- `Product+Name`: URL-encoded text

## Component Usage

### Product Card
```tsx
import { ProductCard } from '@/components/ProductCard';

<ProductCard
  product={product}
  variant="default"  // or "compact"
  showSupplier={true}
  onReserve={handleReserve}
/>
```

### Image Gallery
```tsx
import { ProductImageGallery } from '@/components/ProductImageGallery';

<ProductImageGallery
  images={product.images}
  productName={product.name}
/>
```

## Utility Functions

```typescript
import {
  getProductPrimaryImage,
  generatePlaceholderImage,
  getProductImages,
  productHasImages,
  getImageCountBadge,
  isValidImageUrl
} from '@/lib/utils/image';

// Get first image or null
const mainImage = getProductPrimaryImage(product);

// Generate fallback placeholder
const placeholder = generatePlaceholderImage(product.name);

// Get all images or fallback array
const allImages = getProductImages(product);

// Check if product has images
const hasImages = productHasImages(product);

// Get badge text for multiple images
const badge = getImageCountBadge(product); // "3 photos" or null

// Validate URL format
const valid = isValidImageUrl(url); // true/false
```

## Troubleshooting

### Images Not Showing
1. Check Next.js config has domain whitelist
2. Verify URL is accessible in browser
3. Check browser console for CORS errors
4. Ensure image URLs use `https://`

### Build Errors
```bash
# Clear cache and rebuild
rm -rf .next node_modules
npm install
npm run build
```

### Slow Loading
1. Reduce image quality: `?q=60` instead of `?q=80`
2. Reduce image size: `?w=600` instead of `?w=800`
3. Enable `priority` prop for above-fold images

## Common Patterns

### Single Image Product
```typescript
images: ['https://images.unsplash.com/photo-XXX?w=800&q=80']
```

### Multiple Images
```typescript
images: [
  'https://images.unsplash.com/photo-XXX?w=800&q=80',
  'https://images.unsplash.com/photo-YYY?w=800&q=80',
  'https://images.unsplash.com/photo-ZZZ?w=800&q=80'
]
```

### No Images (Fallback)
```typescript
images: []  // Will show Package icon placeholder
```

## Performance Tips

1. **Use lazy loading** (default in ProductCard)
2. **Optimize image sizes** (800px recommended)
3. **Enable priority** for hero images
4. **Use WebP** (automatic with Next.js)
5. **Implement caching** (CDN for production)

## File Locations

```
frontend/
├── components/
│   ├── ProductCard.tsx          # Product card with images
│   └── ProductImageGallery.tsx  # Detail page gallery
├── lib/
│   ├── mockData.ts              # Product data with images
│   └── utils/
│       └── image.ts             # Image utility functions
├── app/
│   └── product/
│       └── [id]/
│           └── page.tsx         # Product detail page
└── next.config.ts               # Image domain config
```

## Next.js Image Component Props

```tsx
<Image
  src={imageUrl}
  alt={product.name}
  width={800}
  height={600}
  loading="lazy"          // or "eager"
  priority={false}        // or true for hero images
  quality={80}           // 1-100
  sizes="(max-width: 768px) 100vw, 50vw"
  placeholder="blur"     // or "empty"
/>
```

## Testing Checklist

- [ ] Images load in product cards (grid view)
- [ ] Images load in product cards (compact view)
- [ ] Image gallery works on detail page
- [ ] Navigation buttons work
- [ ] Thumbnails are clickable
- [ ] Error handling shows fallback
- [ ] Images load on mobile
- [ ] Build completes successfully
- [ ] No console errors
- [ ] Performance is acceptable

## Migration to Supabase Storage (Future)

1. Create bucket: `product-images`
2. Upload images to Supabase
3. Update URLs:
   ```typescript
   images: [
     'https://xxx.supabase.co/storage/v1/object/public/product-images/insulation-1.jpg'
   ]
   ```
4. Update Next.js config with Supabase domain
5. Test and deploy

## Support

For issues or questions:
1. Check `/PRODUCT_IMAGE_SYSTEM.md` for detailed docs
2. Review `/IMAGE_SYSTEM_SUMMARY.md` for implementation details
3. Check Next.js Image docs: https://nextjs.org/docs/api-reference/next/image
4. Review Unsplash API: https://unsplash.com/developers
