# Shopping Cart - Quick Reference

## How to Use the Cart

### For Users

#### Adding Items
1. **Demo Product**: Click "Add to Cart" on the hero product card
2. **Search Results**: Click "Add to Cart" on any search result
3. Toast notification confirms item added

#### Viewing Cart
- Click cart icon (🛒) in top-right header
- Cart slides in from right side

#### Managing Items
- **Increase Quantity**: Click + button
- **Decrease Quantity**: Click - button
- **Remove Item**: Click trash icon (🗑️)
- Quantity auto-updates total

#### Checkout
- Click "Proceed to Checkout" button
- Shows order summary
- (Coming soon: Full checkout flow)

#### Close Cart
- Click X button in cart header
- Click outside cart (overlay)
- Press Escape key

### For Developers

#### Add Product to Cart
```javascript
addToCart({
    id: 1,
    name: 'Product Name',
    variant: 'Size/Color',
    price: 24.99
});
```

#### Open/Close Cart
```javascript
openCartModal();  // Open
closeCartModal(); // Close
```

#### Access Cart Data
```javascript
console.log(cart);              // Array of items
console.log(getCartTotal());    // Total price
```

#### Clear Cart
```javascript
cart = [];
saveCart();
renderCartItems();
```

#### Check if Empty
```javascript
if (cart.length === 0) {
    // Cart is empty
}
```

## Keyboard Shortcuts

- **Escape**: Close cart modal
- **Tab**: Navigate controls
- **Enter**: Activate focused button

## File Locations

- **Script**: `/BuildStop-Landing-Page/script.js`
- **Styles**: `/BuildStop-Landing-Page/styles.css`
- **Test**: `/BuildStop-Landing-Page/test-cart.html`
- **Guide**: `/BuildStop-Landing-Page/CART_IMPLEMENTATION_GUIDE.md`

## Cart State

Stored in localStorage as `buildstopCart`:
```json
[
    {
        "id": 1,
        "name": "Product",
        "variant": "Standard",
        "price": 24.99,
        "quantity": 1
    }
]
```

## Testing

Open `test-cart.html` for:
- Add test products
- View cart contents
- Test persistence
- Clear cart

## Quick Checklist

- ✅ Add items to cart
- ✅ View cart modal
- ✅ Adjust quantities
- ✅ Remove items
- ✅ See total price
- ✅ Toast notifications
- ✅ Cart persists on reload
- ✅ Badge shows count
- ✅ Empty cart message
- ✅ Mobile responsive

## Common Issues

**Badge not showing?**
- Cart must have items
- Check `#cartCount` exists

**Modal not opening?**
- Check console for errors
- Verify script.js loaded

**Items not saving?**
- Check localStorage enabled
- No private/incognito mode

**Need help?**
- See CART_IMPLEMENTATION_GUIDE.md
- Test with test-cart.html
