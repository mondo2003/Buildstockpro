# Quick Start - Shopping Cart

## 30-Second Setup

The cart is already implemented! Just open the page and start using it.

## Try It Now

### Option 1: Test Page (Fastest)
```bash
open BuildStop-Landing-Page/test-cart.html
```
Or drag `test-cart.html` into your browser.

### Option 2: Main Page
```bash
open BuildStop-Landing-Page/index.html
```

## Basic Usage

### Add Items
- Click any "Add to Cart" button
- See toast notification
- Watch badge update

### View Cart
- Click cart icon (🛒) in top-right
- Cart slides from right
- See all items

### Manage Items
- Click **+** to increase quantity
- Click **-** to decrease quantity
- Click **🗑️** to remove item

### Close Cart
- Click **X** button
- Click outside cart
- Press **Escape**

## Test Checklist

- [ ] Add item → Badge shows number
- [ ] Add same item → Quantity increases
- [ ] Click cart → Modal opens
- [ ] Adjust quantity → Total updates
- [ ] Remove item → Item disappears
- [ ] Close cart → Modal closes
- [ ] Reload page → Items still there

## Developer Quick Reference

### Add Product Programmatically
```javascript
addToCart({
    id: 1,
    name: 'Product Name',
    variant: 'Standard',
    price: 24.99
});
```

### Access Cart Data
```javascript
console.log(cart);           // All items
console.log(getCartTotal()); // Total price
```

### Clear Cart
```javascript
cart = [];
saveCart();
renderCartItems();
```

## File Locations

```
BuildStop-Landing-Page/
├── script.js          ← Cart functions
├── styles.css         ← Cart styles
├── index.html         ← Main page (with cart)
├── test-cart.html     ← Test page
└── CART_*.md          ← Documentation
```

## Key Functions

| Function | Purpose |
|----------|---------|
| `addToCart(product)` | Add item |
| `removeFromCart(id)` | Remove item |
| `updateQuantity(id, n)` | Change qty |
| `openCartModal()` | Open cart |
| `closeCartModal()` | Close cart |
| `getCartTotal()` | Get total |

## What's Included

✅ Add to cart
✅ Remove from cart
✅ Quantity controls
✅ Cart total
✅ Item count badge
✅ Toast notifications
✅ Persistent storage
✅ Mobile responsive
✅ Smooth animations

## Support

Need help? Check:
1. `CART_QUICK_REF.md` - Quick reference
2. `CART_IMPLEMENTATION_GUIDE.md` - Full docs
3. `test-cart.html` - Interactive testing

## Common Issues

**Badge not showing?**
- Add items first (badge hides when empty)

**Modal not opening?**
- Check browser console for errors

**Items not saving?**
- Enable localStorage (not incognito mode)

**Having trouble?**
- Use test-cart.html to isolate issues

---

Ready to use! Just open the page and start adding items. 🛒
