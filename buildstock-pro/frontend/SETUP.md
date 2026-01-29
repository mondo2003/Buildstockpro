# BuildStock Pro Frontend - Quick Start Guide

## 🚀 Quick Start

```bash
# Navigate to frontend directory
cd buildstock-pro/frontend

# Install dependencies
bun install

# Start development server
bun dev
```

Open [http://localhost:3000](http://localhost:3000)

## 📦 What's Included

### ✅ Completed Setup

- **Next.js 15** with App Router
- **TypeScript** configuration
- **Tailwind CSS v4** with brand colors
- **shadcn/ui** components (8 components installed)
- **Lucide React** icons
- **Folder structure** organized and ready
- **Responsive layout** with Header/Footer
- **Core pages**: Homepage and Product Detail
- **Core components**: SearchBar, FilterPanel, ProductCard, ProductGrid
- **Type definitions** for all data models
- **API client** structure (ready for backend integration)
- **Production build** tested and working

### 🎨 Brand Integration

Colors matching the BuildStop Pro landing page:
- **Primary Blue**: #0070cc (oklch format in CSS)
- **Accent Green**: #10b981 (for in-stock/eco indicators)
- **Warning Orange**: #f59e0b (for low-stock)

### 📁 Project Structure

```
frontend/
├── app/                    # Next.js pages
│   ├── layout.tsx         # Root layout (Header + Footer)
│   ├── page.tsx           # Homepage with search
│   └── product/[id]/      # Product detail page
├── components/            # React components
│   ├── Header.tsx        # Site navigation
│   ├── Footer.tsx        # Site footer
│   ├── SearchBar.tsx     # Search input
│   ├── FilterPanel.tsx   # Advanced filters
│   ├── ProductCard.tsx   # Product card
│   ├── ProductGrid.tsx   # Product grid
│   └── ui/               # shadcn/ui components
└── lib/                   # Utilities
    ├── types.ts          # TypeScript types
    ├── api.ts            # API client
    └── utils.ts          # Helper functions
```

## 🔧 Configuration

### Environment Variables

Create `.env.local`:

```bash
# API Backend URL
NEXT_PUBLIC_API_URL=http://localhost:4000/api
```

### Available Scripts

```bash
bun dev          # Start development server (port 3000)
bun run build    # Create production build
bun start        # Start production server
bun run lint     # Run ESLint
```

## 🎯 Key Features Implemented

### 1. Homepage (`/`)
- Hero section with gradient background
- Integrated search bar
- Two-column layout (filters + results)
- Mock data for 3 products

### 2. Product Detail (`/product/[id]`)
- Full product information
- Environmental impact section
- Nearby suppliers list
- Stock status and pricing
- Reserve for Pickup CTA

### 3. Responsive Design
- Mobile-first approach
- Breakpoints: md (768px), lg (1024px), xl (1280px)
- Touch-friendly on mobile

### 4. Filter Panel
- Category selection with counts
- Price range slider (£0-£1000)
- Distance slider (0-50 miles)
- In-stock toggle
- Eco rating filters
- Certification filters

## 🔌 Next Steps

### 1. Backend Integration

Update `lib/api.ts` to connect to your backend:

```typescript
// Replace mock functions with real API calls
async function getProduct(id: string): Promise<Product> {
  const response = await fetch(`${API_BASE_URL}/products/${id}`);
  return response.json();
}
```

### 2. Search Results Page

Create `/app/search/page.tsx`:

```typescript
export default function SearchPage({ searchParams }) {
  const products = await api.searchProducts(searchParams);
  return <ProductGrid products={products} />;
}
```

### 3. State Management

Consider adding:
- Zustand for global state
- React Query for server state
- URL params for filter state

### 4. Additional Pages to Build

- `/dashboard` - User dashboard
- `/profile` - User profile and settings
- `/reservations` - Pickup reservations
- `/favorites` - Saved products
- `/about` - About page

## 🐛 Troubleshooting

### Port Already in Use

```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use different port
PORT=3001 bun dev
```

### Build Errors

```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules bun.lockb
bun install
```

### TypeScript Errors

```bash
# Check types
bunx tsc --noEmit
```

## 📚 Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [shadcn/ui Components](https://ui.shadcn.com)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Lucide Icons](https://lucide.dev)

## 🎨 Customization

### Update Brand Colors

Edit `app/globals.css`:

```css
:root {
  --primary: oklch(0.55 0.15 250);  /* Your blue */
  --accent: oklch(0.65 0.15 145);   /* Your green */
}
```

### Add New shadcn/ui Component

```bash
bunx shadcn@latest add [component-name]
```

### Modify Layout

Edit `app/layout.tsx` to change Header/Footer or add providers.

## ✅ Production Checklist

Before deploying:

- [ ] Set `NEXT_PUBLIC_API_URL` to production API
- [ ] Test build: `bun run build`
- [ ] Test production server: `bun start`
- [ ] Add analytics (Google Analytics, etc.)
- [ ] Configure error tracking (Sentry, etc.)
- [ ] Set up CDN for static assets
- [ ] Configure environment variables in hosting platform
- [ ] Test all pages and components
- [ ] Verify responsive design on mobile devices
- [ ] Check accessibility (WCAG compliance)

## 🚀 Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
bun install -g vercel

# Deploy
vercel
```

### Other Platforms

The project works on any Next.js-compatible platform:
- Netlify
- AWS Amplify
- Cloudflare Pages
- Railway
- Render

## 📝 License

MIT - Feel free to use this project for learning or production.
