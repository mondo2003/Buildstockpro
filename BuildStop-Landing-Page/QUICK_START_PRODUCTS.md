# Product Grid - Quick Start Guide

## 🚀 How to View the Product Grid

### Option 1: Main Page
```bash
# Open in browser
open index.html
# Or navigate to: BuildStop-Landing-Page/index.html
# Scroll to "Browse Sustainable Materials" section
```

### Option 2: Test Page
```bash
# Open isolated test
open test-products.html
# Shows just the grid without other page elements
```

## 📦 What You'll See

### 12 Products Displayed:
1. Clay Roof Tiles - £2.50
2. Low-Carbon Concrete Mix - £12.50
3. Recycled Insulation Roll - £24.99
4. Water-Based Paint - £28.99
5. Natural Cork Flooring - £32.50
6. Low VOC Interior Paint - £32.50
7. Sheep Wool Insulation - £35.00
8. Recycled Steel Framing - £38.75
9. Bamboo Plywood Sheet - £45.00
10. Composite Decking Boards - £55.00
11. Reclaimed Timber Beams - £120.00
12. Recycled Glass Countertops - £185.00

## 🎯 How to Use

### Filter by Category
- Click any category button at top
- Options: All, Insulation, Lumber, Concrete, Roofing, Metal, Flooring, Paint, Decking, Countertops
- Active category is highlighted in blue

### Add to Cart
- Click "Add to Cart" button on any product
- Cart icon badge updates with count
- Toast notification appears
- Cart persists in browser

### View Cart
- Click cart icon (top right)
- Modal slides in from right
- Adjust quantities with +/- buttons
- Remove items with trash icon
- See total price

## 🛠️ Troubleshooting

### No Products Showing?
1. Open browser DevTools (F12)
2. Check Console tab for errors
3. Run: `verifyProductGrid()` in console
4. Ensure scripts load in correct order

### Cart Not Working?
1. Check localStorage is enabled
2. Look for errors in console
3. Try refreshing the page

### Styles Wrong?
1. Clear browser cache
2. Hard refresh (Ctrl+Shift+R / Cmd+Shift+R)
3. Check products.css is loaded

## 📱 Responsive Testing

### Mobile (375px+)
- 1 column grid
- Full-width cards
- Stacked filters

### Tablet (640px+)
- 2 column grid
- Optimized spacing

### Desktop (1024px+)
- 3 column grid
- Hover effects active

### Large (1280px+)
- 4 column grid
- Maximum visibility

## 🔧 Developer Tools

### Console Commands:
```javascript
// Check if products loaded
console.log(window.mockProducts.length);

// Get all products
window.mockProducts

// Filter by category
window.getProductsByCategory('Insulation')

// Search products
window.searchProducts('bamboo')

// Verify setup
verifyProductGrid()
```

## 📊 File Quick Reference

| File | Purpose | Lines |
|------|---------|-------|
| `mockData.js` | Product data & helpers | ~227 |
| `products.js` | Grid functionality | ~188 |
| `products.css` | Grid styles | ~630 |
| `index.html` | Main page (has products section) | ~310 |
| `script.js` | Cart & general functions | ~806 |

## ✨ Key Features

- ✅ 12 products, 9 categories
- ✅ Sorted by price (low→high)
- ✅ Responsive (1-4 columns)
- ✅ Category filters
- ✅ Smooth animations
- ✅ Add to cart
- ✅ Cart modal
- ✅ LocalStorage
- ✅ Eco badges
- ✅ Stock status

## 🎨 CSS Classes

For custom styling, these are the main classes:
- `.products-grid` - Grid container
- `.product-card-grid` - Product card
- `.category-filter` - Filter buttons
- `.category-btn.active` - Selected filter
- `.badge-eco` - Eco badge
- `.badge-category` - Category label

## 🚀 Next Steps

Want to enhance it?
1. Add real product images
2. Connect to real API
3. Add search functionality
4. Implement product details page
5. Add user reviews
6. Price comparison tool

See `PRODUCT_GRID_README.md` for full documentation.
