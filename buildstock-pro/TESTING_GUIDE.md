# BuildStop Pro - Landing Page Testing Guide

## Quick Start

### Start the Development Server
```bash
cd /Users/macbook/Desktop/buildstock.pro/buildstock-pro/frontend
npm run dev
```

The application will be available at: `http://localhost:3000`

## Testing Checklist

### 1. Homepage Redirect
- [ ] Navigate to `http://localhost:3000`
- [ ] Verify automatic redirect to `/landing`
- [ ] Check loading animation displays briefly
- [ ] Confirm landing page loads completely

### 2. Landing Page - Header
- [ ] Logo displays correctly: "BuildStop Pro"
- [ ] Navigation links visible on desktop
- [ ] Mobile menu appears on small screens
- [ ] Mobile menu toggles open/close
- [ ] Header background blurs on scroll

### 3. Landing Page - Hero Section
- [ ] Headline displays with gradient animation
- [ ] Search input field is functional
- [ ] Search button works (redirects to `/search`)
- [ ] "Find Materials Nearby" button works
- [ ] "Browse All Materials" button works

### 4. Landing Page - Product Demo Card
- [ ] Product card displays with hover effects
- [ ] Eco-Friendly badge visible
- [ ] Product details display correctly
- [ ] "Reserve for Pickup" button works

### 5. Landing Page - Features Section
- [ ] Three feature cards visible and clickable
- [ ] Hover effects work
- [ ] Links navigate to correct pages

### 6. Landing Page - Contact Section
- [ ] Contact information displays
- [ ] Contact form works
- [ ] Form submission opens email client

### 7. Navigation Between Pages
- [ ] All links work correctly
- [ ] All existing pages accessible
- [ ] No broken routes

## Common Issues & Solutions

### Issue: Page doesn't load
**Solution:** Check dev server is running, verify port 3000

### Issue: Styles not loading
**Solution:** Clear browser cache, restart dev server

### Issue: Navigation not working
**Solution:** Check for console errors, verify router imports

## Success Criteria

- ✅ No console errors
- ✅ No broken links
- ✅ All interactive elements work
- ✅ Responsive design functions
- ✅ Page loads quickly
