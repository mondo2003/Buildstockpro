# Search Functionality - Quick Reference

## Testing the Search

### Live Testing
Open in browser: `http://localhost:3000/` or `http://localhost:3000/test-search.html`

### Quick Test Queries
Try these searches:
- ✅ `insulation` - Returns 1 result
- ✅ `paint` - Returns 2 results
- ✅ `lighting` - Returns 2 results
- ✅ `flooring` - Returns 1 result (out of stock)
- ✅ `eco` - Returns multiple eco-friendly products
- ✅ `INSULATION` - Case insensitive (same results)
- ✅ `xyz123` - Shows "No results found"

## Key Functions

### `searchMockProducts(query)`
**Purpose**: Filter products based on search query
**Returns**: Array of matching products
**Example**:
```javascript
const results = searchMockProducts('paint');
// Returns 2 paint products
```

### `displayMockResults(query)`
**Purpose**: Display search results in the UI
**Side Effects**: Updates DOM with product cards
**Example**:
```javascript
displayMockResults('insulation');
// Shows results section with 1 product
```

### `handleHeroSearch()`
**Purpose**: Main search handler (called by button/Enter)
**Flow**: API → Mock Data Fallback → Display Results
**Example**:
```javascript
handleHeroSearch(); // Uses value from #heroSearchInput
```

### `addMockProductToCart(id, name, price)`
**Purpose**: Add a mock product to the shopping cart
**Example**:
```javascript
addMockProductToCart('1', 'Insulation', 24.99);
```

## Mock Product Data Structure

```javascript
{
  id: '1',                    // Unique identifier
  name: 'Product Name',       // Display name
  description: 'Description', // Product details
  category: 'Category',       // Product category
  price: 24.99,              // Price in GBP
  stock: 42,                 // Quantity in stock
  eco: 'A',                  // Eco rating (A or B)
  merchant: 'Store Name'     // Supplier
}
```

## CSS Classes

### Container
- `.search-results-section` - Main results wrapper
- `.search-results-container` - Grid of cards
- `.search-loading` - Loading spinner
- `.search-error` - Error message

### Cards
- `.search-result-card` - Individual product card
- `.result-header` - Name + price row
- `.result-desc` - Product description
- `.result-meta` - Merchant, stock, category
- `.eco-badge` - Eco-friendly indicator
- `.no-results` - Empty state

### States
- `.in-stock` - Green background, available
- `.out-stock` - Red background, unavailable
- `.low-stock` - Yellow background, limited

## DOM Elements

### Input
```html
<input id="heroSearchInput" type="text"
       placeholder="Search for materials...">
```

### Results Section
```html
<div id="searchResultsSection">
  <div class="search-results-header">
    <h3 id="searchResultsTitle">Search Results</h3>
    <button onclick="closeSearchResults()">✕</button>
  </div>
  <div id="searchLoading">Loading...</div>
  <div id="searchErrorMessage"></div>
  <div id="searchResultsContainer">
    <!-- Cards go here -->
  </div>
</div>
```

## Event Handlers

### Search Input
```javascript
// Enter key listener
document.getElementById('heroSearchInput')
  .addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleHeroSearch();
  });
```

### Search Button
```html
<button onclick="handleHeroSearch()">Search</button>
```

### Add to Cart
```html
<button onclick="addMockProductToCart('1', 'Name', 24.99)">
  Add to Cart
</button>
```

### Close Results
```html
<button onclick="closeSearchResults()">✕</button>
```

## Cart Integration

### Add Product to Cart
```javascript
const cartProduct = {
  id: `mock-${productId}`,
  name: productName,
  variant: 'Standard',
  price: productPrice
};
addToCart(cartProduct);
```

### Cart State
- Stored in `localStorage` with key `'buildstopCart'`
- Persists across page refreshes
- Managed by cart functions in `script.js`

## Customization

### Add More Mock Products
```javascript
const mockProducts = [
  // ... existing products
  {
    id: '9',
    name: 'New Product',
    description: 'Product description',
    category: 'Category',
    price: 99.99,
    stock: 10,
    eco: 'A',
    merchant: 'Store Name'
  }
];
```

### Change Search Algorithm
Edit `searchMockProducts()` function:
```javascript
function searchMockProducts(query) {
  // Custom logic here
  return mockProducts.filter(product => {
    // Your filter criteria
  });
}
```

### Modify Result Card Layout
Edit the template in `displayMockResults()`:
```javascript
searchResultsContainer.innerHTML = results.map(product => `
  <div class="search-result-card">
    <!-- Your custom card HTML -->
  </div>
`).join('');
```

## Troubleshooting

### Search Not Working
1. Check browser console for errors
2. Verify `script.js` is loaded
3. Ensure `#heroSearchInput` exists
4. Check `mockProducts` array is defined

### Results Not Showing
1. Check `#searchResultsContainer` exists
2. Verify CSS is loaded
3. Look for JavaScript errors
4. Test with simple query like "paint"

### Cart Not Working
1. Check localStorage is enabled
2. Verify `addToCart()` function exists
3. Ensure cart modal is initialized
4. Check for ID conflicts

### Styles Not Applying
1. Verify `styles.css` is loaded
2. Check for CSS specificity issues
3. Clear browser cache
4. Inspect element for applied styles

## Performance Tips

1. **Debounce Search Input**: Add delay for rapid typing
2. **Limit Results**: Cap at 50 products
3. **Virtual Scrolling**: For large result sets
4. **Image Lazy Loading**: Defer image loading
5. **Cache Results**: Store recent searches

## Browser DevTools

### Console Commands
```javascript
// Test search directly
searchMockProducts('insulation');

// Display results manually
displayMockResults('paint');

// View mock products
console.log(mockProducts);

// Check cart state
console.log(JSON.parse(localStorage.getItem('buildstopCart')));

// Clear cart
localStorage.removeItem('buildstopCart');
```

### Breakpoints
Set debugger in:
- `handleHeroSearch()` - Main entry point
- `searchMockProducts()` - Search logic
- `displayMockResults()` - Rendering
- `addToCart()` - Cart operations

## File Locations

- `/BuildStop-Landing-Page/script.js` - Main logic
- `/BuildStop-Landing-Page/styles.css` - Styles
- `/BuildStop-Landing-Page/index.html` - Page structure
- `/BuildStop-Landing-Page/test-search.html` - Test page

## Next Steps

1. ✅ Search is working with mock data
2. ✅ Cart integration is functional
3. ✅ UI is responsive and styled
4. ⏳ API integration (when backend is ready)
5. ⏳ Add search suggestions
6. ⏳ Implement advanced filters

## Support

For issues or questions:
1. Check browser console for errors
2. Review `SEARCH_FIX_REPORT.md` for details
3. See `SEARCH_VISUAL_GUIDE.md` for UI reference
4. Test with `/test-search.html` for isolated testing
