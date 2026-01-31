# Product Grid Quick Reference Guide

## Quick Start

### 1. Start the Development Server
```bash
cd BuildStop-Landing-Page
npm run dev
```
Open http://localhost:5173

### 2. View the Product Grid
Scroll to the "Browse Sustainable Materials" section on the landing page.

### 3. Test the Implementation
Visit http://localhost:5173/test-product-grid.html for automated testing.

---

## File Locations

| File | Purpose | Lines |
|------|---------|-------|
| `/mockData.js` | Product data | ~200 |
| `/products.js` | Grid functionality | ~200 |
| `/products.css` | Grid styles | ~500 |
| `/index.html` | Products section | ~30 |
| `/test-product-grid.html` | Test suite | ~150 |

---

## Product Data Structure

```javascript
{
    id: 1,                    // Unique identifier
    name: 'Product Name',      // Display name
    description: 'Description', // Product details
    price: 24.99,             // Price in GBP
    category: 'Category',      // Filter category
    ecoFriendly: true,        // Show eco badge?
    carbonFootprint: 12,      // CO2 in kg
    rating: 4.5,              // Star rating (1-5)
    reviewCount: 128,         // Number of reviews
    image: '📦',              // Emoji placeholder
    inStock: true,            // Availability
    stockCount: 42,           // Stock quantity
    store: 'Store Name',      // Merchant
    distance: 0.8            // Miles away
}
```

---

## Category List

- All Materials
- Insulation
- Lumber
- Concrete
- Roofing
- Metal
- Flooring
- Paint
- Decking
- Countertops

---

## Responsive Grid

| Screen Size | Columns |
|-------------|---------|
| Mobile (< 640px) | 1 |
| Tablet (640-1024px) | 2 |
| Desktop (1024-1280px) | 3 |
| Large (≥1280px) | 4 |

---

## Common Tasks

### Add a New Product
Edit `mockData.js`:
```javascript
const mockProducts = [
    // ... existing products
    {
        id: 13,
        name: 'New Product',
        description: 'Description here',
        price: 99.99,
        category: 'Insulation',
        ecoFriendly: true,
        carbonFootprint: 10,
        rating: 4.5,
        reviewCount: 50,
        image: '🏗️',
        inStock: true,
        stockCount: 100,
        store: 'BuildBase - Camden',
        distance: 1.0
    }
];
```

### Add a New Category
1. Ensure products have the category in `mockData.js`
2. Add button to `index.html`:
```html
<button class="category-btn" data-category="NewCategory">New Category</button>
```

### Change Grid Columns
Edit `products.css`:
```css
@media (min-width: 1024px) {
    .products-grid {
        grid-template-columns: repeat(3, 1fr);  /* Change 3 to desired number */
    }
}
```

### Customize Card Styling
Edit `.product-card-grid` in `products.css`:
```css
.product-card-grid {
    background: var(--color-surface);
    border-radius: var(--border-radius-lg);
    box-shadow: var(--shadow);
    /* Add your custom styles here */
}
```

---

## CSS Variables Used

| Variable | Value | Usage |
|----------|-------|-------|
| `--spacing-lg` | 2rem | Large spacing |
| `--border-radius-lg` | 16px | Card corners |
| `--shadow` | Card shadows | Depth effect |
| `--color-primary` | #0070cc | Primary actions |
| `--color-accent` | #10b981 | Success/eco |
| `--transition-slow` | 350ms | Animations |

---

## JavaScript Functions

### Render Products
```javascript
renderProducts(products, 'products-grid');
```

### Filter by Category
```javascript
const filtered = getProductsByCategory('Insulation');
renderProducts(filtered);
```

### Add to Cart
```javascript
addProductToCart(productId);
```

### Get All Categories
```javascript
const categories = getCategories();
```

---

## Browser DevTools

### Check Products Loaded
```javascript
console.log(window.mockProducts);
console.log(window.getCategories());
```

### Test Filter
```javascript
console.log(getProductsByCategory('Insulation'));
```

### Render Test
```javascript
renderProducts(window.mockProducts.slice(0, 3));
```

---

## Troubleshooting

### Products Not Showing
1. Check browser console for errors
2. Verify `mockData.js` is loaded (Network tab)
3. Ensure `products.js` loads after `mockData.js`
4. Check `#products-grid` exists in HTML

### Cart Not Working
1. Verify `script.js` has cart functions
2. Check localStorage is enabled
3. Look for JavaScript errors in console

### Styling Issues
1. Clear browser cache
2. Verify `products.css` is loaded
3. Check for CSS conflicts in DevTools

### Responsive Not Working
1. Test on actual devices (not just browser resize)
2. Check viewport meta tag in HTML
3. Verify CSS media queries are loading

---

## Performance Tips

1. **Limit Initial Products**: Show 6-12 products, use pagination for more
2. **Image Optimization**: Use WebP format with lazy loading
3. **Minify CSS/JS**: Before production deployment
4. **CDN Hosting**: Serve static files via CDN
5. **Cache Headers**: Set appropriate cache expiry

---

## Testing Checklist

- [ ] Products display on page load
- [ ] Category filters work
- [ ] Cart adds items correctly
- [ ] Responsive on mobile (320px+)
- [ ] Responsive on tablet (768px+)
- [ ] Responsive on desktop (1024px+)
- [ ] No console errors
- [ ] Animations are smooth
- [ ] Cart persists after refresh
- [ ] All 12 products visible

---

## Next Steps

1. ✅ Product grid complete
2. ⬜ Connect to real API data
3. ⬜ Add product images
4. ⬜ Implement search
5. ⬜ Add pagination
6. ⬜ Product quick view modal
7. ⬜ Reviews and ratings
8. ⬜ Wishlist functionality

---

## Quick Commands

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

---

## Useful Links

- **Main Page**: http://localhost:5173
- **Test Suite**: http://localhost:5173/test-product-grid.html
- **Vite Docs**: https://vitejs.dev/
- **Report**: See `PRODUCT_GRID_IMPLEMENTATION_REPORT.md`

---

**Last Updated:** 2026-01-30
**Status:** ✅ Production Ready
