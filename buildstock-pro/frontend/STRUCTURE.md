# BuildStock Pro Frontend - Project Structure

## Overview

This document provides a detailed overview of the BuildStock Pro frontend architecture, component structure, and data flow.

## Directory Structure

```
frontend/
├── app/                          # Next.js App Router pages
│   ├── layout.tsx                # Root layout with Header/Footer
│   ├── page.tsx                  # Homepage (search)
│   ├── globals.css               # Global styles & theme variables
│   └── product/
│       └── [id]/
│           └── page.tsx          # Dynamic product detail page
│
├── components/                   # React components
│   ├── Header.tsx                # Site navigation header
│   ├── Footer.tsx                # Site footer
│   ├── SearchBar.tsx             # Main search input component
│   ├── FilterPanel.tsx           # Advanced filters sidebar
│   ├── ProductCard.tsx           # Product display card
│   ├── ProductGrid.tsx           # Product grid with loading states
│   └── ui/                       # shadcn/ui base components
│       ├── accordion.tsx
│       ├── badge.tsx
│       ├── button.tsx
│       ├── card.tsx
│       ├── checkbox.tsx
│       ├── input.tsx
│       ├── slider.tsx
│       └── switch.tsx
│
├── lib/                          # Utilities and core logic
│   ├── types.ts                  # TypeScript type definitions
│   ├── api.ts                    # API client wrapper
│   └── utils.ts                  # Helper functions (cn(), etc.)
│
├── public/                       # Static assets
│   └── favicon.ico
│
├── .env.example                  # Environment variables template
├── components.json               # shadcn/ui configuration
├── next.config.ts                # Next.js configuration
├── package.json                  # Dependencies and scripts
└── tsconfig.json                 # TypeScript configuration
```

## Core Components

### 1. Layout Components

#### Header (`components/Header.tsx`)
- Fixed position navigation bar
- Responsive mobile menu
- Logo and primary navigation links
- Scroll-based styling changes

#### Footer (`components/Footer.tsx`)
- Simple footer with copyright
- Links to legal pages
- Responsive layout

### 2. Search Components

#### SearchBar (`components/SearchBar.tsx`)
- Main search input with icon
- Full-text search functionality
- Routes to `/search?q=query`
- Styled with rounded input and gradient button

#### FilterPanel (`components/FilterPanel.tsx`)
- Accordion-style collapsible filters
- Filter categories:
  - **Category**: Multi-select with counts
  - **Price Range**: Dual-handle slider
  - **Distance**: Single slider (miles)
  - **Availability**: Toggle for in-stock only
  - **Eco Rating**: Checkbox filters (A, B, C)
  - **Certifications**: Multi-select

#### ProductGrid (`components/ProductGrid.tsx`)
- Grid layout (responsive: 1-2-3 columns)
- Loading skeleton with Suspense
- Empty state handling
- Mock data for development

### 3. Product Components

#### ProductCard (`components/ProductCard.tsx`)
- Product image/placeholder with eco badge
- Name, description, rating
- Carbon footprint indicator
- Nearest supplier with distance
- Stock status with animated indicator
- Price and CTA button
- Hover effects and animations

## Pages

### Homepage (`app/page.tsx`)
- Hero section with gradient background
- Search bar integration
- Two-column layout: filters + results
- Uses Suspense for loading states

### Product Detail (`app/product/[id]/page.tsx`)
- Breadcrumb navigation
- Product header with rating
- Two-column layout:
  - Left: Product image
  - Right: Details cards
    - Price & Availability
    - Environmental Impact
    - Nearby Suppliers
- CTA: Reserve for Pickup

## Type System (`lib/types.ts`)

### Core Types

```typescript
// Product
interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  images: string[];
  price: number;
  unit: string;
  stock: StockInfo;
  eco: EcoInfo;
  rating: Rating;
  suppliers: Supplier[];
  location: Location;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

// Search
interface SearchFilters {
  query?: string;
  category?: string[];
  priceRange?: [number, number];
  distance?: number;
  inStock?: boolean;
  ecoRating?: EcoRating[];
  carbonFootprint?: [number, number];
  certifications?: string[];
  minRating?: number;
  sortBy?: SortOption;
}
```

## API Client (`lib/api.ts`)

### Methods

- `searchProducts(filters)` - Search with filters
- `getProduct(id)` - Get single product
- `getCategories()` - Get all categories
- `getCertifications()` - Get certifications
- `getMockProducts()` - Mock data for development

### Configuration

```typescript
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
```

## Theme & Styling

### Brand Colors (`app/globals.css`)

```css
--primary: oklch(0.55 0.15 250);      /* BuildStock Blue (#0070cc) */
--accent: oklch(0.65 0.15 145);      /* Eco Green (#10b981) */
--destructive: oklch(0.577 0.245 27.325); /* Error/Out of stock */
```

### Tailwind Features

- Responsive design (mobile-first)
- Dark mode support (configured)
- Custom animations
- Gradient utilities
- Shadow scales

## State Management

### Client Components (marked with 'use client')

- `Header.tsx` - Mobile menu state, scroll detection
- `SearchBar.tsx` - Search query state
- `FilterPanel.tsx` - Filter selections (TODO: connect to URL params)
- `ProductGrid.tsx` - Loading states

### Server Components

- `page.tsx` (homepage) - Server-rendered with Suspense
- `product/[id]/page.tsx` - Dynamic server rendering

## Routing

### Pages

- `/` - Homepage with search
- `/search?q=query` - Search results (TODO: implement)
- `/product/[id]` - Product detail page
- `/dashboard` - User dashboard (linked, TODO: implement)
- `/get-started` - Onboarding (linked, TODO: implement)

## Development Workflow

### 1. Component Development

1. Create component in `components/`
2. Use shadcn/ui base components from `components/ui/`
3. Add TypeScript types in `lib/types.ts`
4. Import and use in pages

### 2. Adding New Pages

1. Create directory in `app/`
2. Add `page.tsx`
3. Use server components by default
4. Add 'use client' only when needed

### 3. API Integration

1. Update `lib/api.ts` with new methods
2. Add types in `lib/types.ts`
3. Use in components with `await` (server) or `async/await` (client)

## Performance Optimizations

- Static generation where possible
- Server components by default
- Suspense for loading states
- Image optimization (Next.js Image component)
- Code splitting (automatic with Next.js)

## Accessibility

- Semantic HTML
- ARIA labels
- Keyboard navigation
- Focus states
- Color contrast (WCAG AA)
- Screen reader support

## Next Steps

1. **API Integration**: Replace mock data with real API calls
2. **Search Results Page**: Implement `/search` route with URL params
3. **User Dashboard**: Create dashboard page
4. **State Management**: Add global state for filters/user
5. **Maps Integration**: Add supplier location maps
6. **Authentication**: Add login/signup flows
7. **Payment Integration**: Add checkout flow
8. **Testing**: Add unit and integration tests

## Deployment

### Vercel (Recommended)

```bash
vercel deploy
```

### Build Commands

```bash
# Development
bun dev

# Production build
bun run build
bun start
```

## Environment Setup

```bash
# Copy environment template
cp .env.example .env.local

# Install dependencies
bun install

# Start development server
bun dev
```

## Troubleshooting

### Common Issues

1. **Build errors**: Check TypeScript types
2. **Component not rendering**: Check server vs client component
3. **Styles not applying**: Check Tailwind class names
4. **API errors**: Verify `NEXT_PUBLIC_API_URL`

### Debug Mode

```bash
# Build with debug output
bun run build --debug

# Run with verbose logging
NODE_OPTIONS='--verbose' bun dev
```
