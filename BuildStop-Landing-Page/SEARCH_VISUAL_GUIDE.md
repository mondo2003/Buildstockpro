# Search Visual Guide

## Search Examples

### Example 1: Search for "insulation"
```
Search Results for "insulation" (1 found)
┌─────────────────────────────────────────────────┐
│ 📦 Recycled Insulation Roll          £24.99     │
│ High-performance thermal insulation made from   │
│ 80% recycled glass. Significantly reduces...    │
│                                                  │
│ 📍 BuildBase - Camden   🌿 Eco-Friendly         │
│ ● In Stock (42 units)    Category: Insulation   │
│                                                  │
│ [Add to Cart]                                   │
└─────────────────────────────────────────────────┘
```

### Example 2: Search for "paint"
```
Search Results for "paint" (2 found)
┌─────────────────────────────────────────────────┐
│ 📦 Low-VOC Interior Paint           £32.50      │
│ Premium interior paint with minimal...          │
│                                                  │
│ 📍 HomeBase - Holloway                          │
│ ● In Stock (5 units)      Category: Paints      │
│                                                  │
│ [Add to Cart]                                   │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│ 📦 Water-Based Exterior Wood Stain  £28.75     │
│ Eco-friendly wood stain with UV protection...   │
│                                                  │
│ 📍 HomeBase - Holloway                          │
│ ● In Stock (35 units)     Category: Paints      │
│                                                  │
│ [Add to Cart]                                   │
└─────────────────────────────────────────────────┘
```

### Example 3: Search for "bamboo" (out of stock)
```
Search Results for "bamboo" (1 found)
┌─────────────────────────────────────────────────┐
│ 📦 Bamboo Flooring Panels          £67.50      │
│ Sustainable bamboo flooring with...             │
│                                                  │
│ 📍 Screwfix - Islington                         │
│ ● Out of Stock             Category: Flooring   │
│                                                  │
│ [Out of Stock]                                  │
└─────────────────────────────────────────────────┘
```

### Example 4: No results
```
Search Results for "xyz123"
┌─────────────────────────────────────────────────┐
│                                                 │
│           No results found for "xyz123"         │
│  Try searching for: insulation, timber, paint,  │
│           flooring, lighting, etc.              │
│                                                 │
└─────────────────────────────────────────────────┘
```

## Color Scheme

### Stock Status
- **In Stock**: Light green background (#d1fae5), dark green text (#065f46)
- **Low Stock**: Light yellow background, orange text
- **Out of Stock**: Light red background (#fee), dark red text (#c33)

### Eco Badge
- **A-Rated**: Green gradient background, white text, leaf emoji 🌿

### Price
- Primary blue color (#0070cc), bold, large font

## Layout

### Desktop (768px+)
```
┌────────┐ ┌────────┐ ┌────────┐
│ Card 1 │ │ Card 2 │ │ Card 3 │
└────────┘ └────────┘ └────────┘
┌────────┐ ┌────────┐ ┌────────┐
│ Card 4 │ │ Card 5 │ │ Card 6 │
└────────┘ └────────┘ └────────┘
```

### Tablet (480px - 767px)
```
┌────────┐ ┌────────┐
│ Card 1 │ │ Card 2 │
└────────┘ └────────┘
┌────────┐ ┌────────┐
│ Card 3 │ │ Card 4 │
└────────┘ └────────┘
```

### Mobile (< 480px)
```
┌────────┐
│ Card 1 │
└────────┘
┌────────┐
│ Card 2 │
└────────┘
┌────────┐
│ Card 3 │
└────────┘
```

## Search Bar States

### Default
```
┌────────────────────────────────────┐
│ Search for materials...        [🔍] │
└────────────────────────────────────┘
```

### Focused
```
┌────────────────────────────────────┐
│ insulation                    [🔍] │
└────────────────────────────────────┘
   ↑ Blue border (2px)
   ↑ Blue shadow
```

### Loading
```
Search Results for "insulation"
  ⭕ Loading spinner...
  Searching materials...
```

## Interactions

### Hover Effects
- Card: Subtle lift (2px up), shadow increases
- Button: Darker background
- Card border: Changes to light blue

### Click Animations
- Search button: Presses down slightly
- Add to Cart: Toast notification slides in from bottom
- Close button: Results section slides up and fades out

### Add to Cart Toast
```
┌────────────────────────────────────┐
│ ✓  Added to Cart                   │
│    Recycled Insulation Roll         │
└────────────────────────────────────┘
         ↑ Slides in from bottom
         ↑ Auto-dismisses after 3s
```

## Typography Hierarchy

1. **Product Name**: 1.125rem (18px), Bold, Dark text
2. **Price**: 1.25rem (20px), Bold, Blue
3. **Description**: 0.9375rem (15px), Regular, Gray
4. **Meta Info**: 0.875rem (14px), Medium, Gray
5. **Badges**: 0.75rem (12px), Bold, Colored backgrounds

## Spacing

- Card padding: 1.5rem (24px)
- Element gap: 1rem (16px)
- Grid gap: 1.5rem (24px)
- Section margin: 3rem (48px)

## Icons Used

- 📍 Location pin (merchant)
- 🌿 Leaf (eco-friendly)
- ● Bullet (stock status indicator)
- ✕ Close button
- ✓ Success checkmark
- 📦 Package placeholder
- 🛒 Shopping cart

## Responsive Breakpoints

```css
/* Mobile First Approach */
.search-results-container {
  grid-template-columns: 1fr;  /* Mobile default */
}

@media (min-width: 480px) {
  .search-results-container {
    grid-template-columns: repeat(2, 1fr);  /* Tablet */
  }
}

@media (min-width: 768px) {
  .search-results-container {
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));  /* Desktop */
  }
}
```

## Accessibility Features

- Keyboard: Tab to navigate, Enter to select
- Focus: 2px blue outline on focused elements
- ARIA: Labels on all buttons
- Contrast: WCAG AA compliant color ratios
- Screen Reader: Semantic HTML structure
