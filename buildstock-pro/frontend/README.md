# BuildStock Pro Frontend

> Sustainable building materials search platform - Next.js 15 frontend application

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui (New York style)
- **Icons**: Lucide React
- **Package Manager**: Bun

## Features

- 🏠 Homepage with hero section and search functionality
- 🔍 Product search with real-time filtering
- 🎛️ Advanced filter panel (category, price, distance, eco-rating, certifications)
- 📦 Product cards with stock status and eco ratings
- 📄 Detailed product pages
- 🎨 Responsive design (mobile-first)
- ♿ Accessibility-focused UI

## Getting Started

### Prerequisites

- Node.js 18+ or Bun
- API backend running (default: `http://localhost:4000`)

### Installation

```bash
# Install dependencies
bun install
```

### Development

```bash
# Start development server
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

### Build

```bash
# Create production build
bun run build

# Start production server
bun start
```

## Project Structure

```
frontend/
├── app/
│   ├── layout.tsx          # Root layout with header/footer
│   ├── page.tsx            # Homepage (search page)
│   ├── globals.css         # Global styles with theme variables
│   └── product/
│       └── [id]/
│           └── page.tsx    # Product detail page
├── components/
│   ├── Header.tsx          # Site header with navigation
│   ├── Footer.tsx          # Site footer
│   ├── SearchBar.tsx       # Main search input
│   ├── FilterPanel.tsx     # Advanced filters sidebar
│   ├── ProductCard.tsx     # Individual product card
│   ├── ProductGrid.tsx     # Grid of products
│   └── ui/                 # shadcn/ui components
├── lib/
│   ├── types.ts            # TypeScript type definitions
│   ├── api.ts              # API client
│   └── utils.ts            # Utility functions
└── public/                 # Static assets
```

## Configuration

### Environment Variables

Create a `.env.local` file:

```bash
NEXT_PUBLIC_API_URL=http://localhost:4000/api
```

### Theme Colors

The application uses BuildStock Pro brand colors:

- **Primary**: Blue (#0070cc)
- **Accent**: Green (#10b981) - for in-stock/eco-friendly
- **Warning**: Orange - for low-stock indicators

These are configured in `app/globals.css` using CSS variables.

## API Integration

The frontend is designed to work with a REST API. See `lib/api.ts` for the API client methods:

- `searchProducts(filters)` - Search with filters
- `getProduct(id)` - Get single product
- `getCategories()` - Get all categories
- `getCertifications()` - Get certifications

## Components

### SearchBar
Main search input located on the homepage. Redirects to search results page.

### FilterPanel
Sidebar with advanced filters:
- Category (with counts)
- Price range (slider)
- Distance (slider)
- Stock availability
- Eco rating
- Certifications

### ProductCard
Displays product information:
- Image/placeholder
- Name and description
- Rating and carbon footprint
- Nearest supplier
- Stock status
- Price

### ProductGrid
Grid layout for search results with loading and empty states.

## Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
bun install -g vercel

# Deploy
vercel
```

### Docker

```bash
# Build image
docker build -t buildstock-frontend .

# Run container
docker run -p 3000:3000 buildstock-frontend
```

## License

MIT

