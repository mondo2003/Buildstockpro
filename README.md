# BuildStock Pro

A modern e-commerce platform for construction materials, featuring a Next.js frontend, Node.js backend, and Supabase authentication.

## 🚀 Tech Stack

### Frontend
- **Next.js 16** - React framework with App Router
- **React 19** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first styling
- **Radix UI** - Accessible component library
- **Supabase Auth** - Authentication
- **React Query** - Data fetching and caching
- **Recharts** - Data visualization

### Backend
- **Node.js** - Runtime environment
- **Express** - Web framework
- **Supabase** - Database and authentication
- **PostgreSQL** - Primary database

### Infrastructure
- **Vercel** - Frontend deployment
- **Render** - Backend deployment
- **Supabase** - Managed database and auth
- **GitHub** - Version control and CI/CD

## 📦 Project Structure

```
buildstock.pro/
├── buildstock-pro/
│   ├── frontend/          # Next.js frontend application
│   │   ├── app/          # Next.js App Router pages
│   │   ├── components/   # React components
│   │   ├── lib/          # Utilities and configurations
│   │   └── public/       # Static assets
│   ├── backend/          # Express API server
│   │   ├── src/          # Source code
│   │   └── dist/         # Compiled output
│   ├── supabase-migrations/  # Database migrations
│   └── scripts/          # Utility scripts
├── BuildStop-Landing-Page/  # Marketing landing page
└── package.json          # Root workspace configuration
```

## 🛠️ Installation

### Prerequisites
- Node.js 18+ or Bun
- Git
- Supabase account (for auth and database)

### 1. Clone the Repository
```bash
git clone https://github.com/mondo2003/Buildstockpro.git
cd Buildstockpro
```

### 2. Install Dependencies

Using Bun (recommended):
```bash
bun install
```

Or using npm:
```bash
npm install
```

### 3. Environment Setup

Create environment files for each service:

#### Frontend (buildstock-pro/frontend/.env.local)
```bash
cp buildstock-pro/frontend/.env.example buildstock-pro/frontend/.env.local
```

Edit `.env.local` and add:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NODE_ENV=development
```

#### Backend (buildstock-pro/backend/.env)
```bash
cp buildstock-pro/backend/.env.example buildstock-pro/backend/.env
```

Edit `.env` and add:
```env
PORT=3001
DATABASE_URL=your_supabase_database_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### 4. Database Setup

Run database migrations:
```bash
cd buildstock-pro
bun run apply-migrations.ts
```

Or apply migrations manually in the Supabase dashboard:
- Go to SQL Editor
- Run each migration file from `supabase-migrations/` in order

## 🏃 Running Locally

### Development Mode (All Services)
```bash
bun run dev
```

This starts:
- Frontend: http://localhost:3000
- Backend: http://localhost:3001

### Individual Services

Frontend only:
```bash
cd buildstock-pro/frontend
bun run dev
```

Backend only:
```bash
cd buildstock-pro/backend
bun run dev
```

### Landing Page
```bash
cd BuildStop-Landing-Page
bun run dev
```
Access at: http://localhost:5173

## 🚀 Deployment

### Frontend (Vercel)
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

**Deployed Frontend:** [Coming Soon]

### Backend (Render)
1. Connect your GitHub repository to Render
2. Configure build settings and environment variables
3. Deploy automatically on push to main branch

**Deployed Backend:** [Coming Soon]

### Database (Supabase)
- Managed through Supabase dashboard
- Run migrations via SQL Editor or CLI

## 📚 Documentation

- [Deployment Guide](buildstock-pro/DEPLOYMENT_GUIDE.md)
- [Authentication Setup](buildstock-pro/AUTHENTICATION_SETUP.md)
- [Quick Start Guide](buildstock-pro/QUICKSTART_AUTH.md)
- [Testing Guide](buildstock-pro/TESTING_GUIDE.md)

## 🔐 Environment Variables Reference

### Frontend Variables
- `NEXT_PUBLIC_API_URL` - Backend API URL
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key
- `NEXT_PUBLIC_GOOGLE_MAPS_KEY` - (Optional) Google Maps API key
- `NEXT_PUBLIC_GA_ID` - (Optional) Google Analytics ID

### Backend Variables
- `PORT` - Server port (default: 3001)
- `DATABASE_URL` - PostgreSQL connection string
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key
- `JWT_SECRET` - JWT signing secret
- `ENCRYPTION_KEY` - Data encryption key

## 🧪 Testing

```bash
# Run all tests
bun test

# Run tests for specific package
cd buildstock-pro/frontend
bun test
```

## 🐛 Troubleshooting

### Common Issues

**Port already in use**
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Kill process on port 3001
lsof -ti:3001 | xargs kill -9
```

**Dependency issues**
```bash
bun run clean:all
bun install
```

**Database connection errors**
- Verify Supabase credentials in .env files
- Check Supabase project status
- Ensure IP whitelist allows your connection

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is private and proprietary.

## 👥 Team

- **Mondo2003** - Project Lead

## 📞 Support

For support, email support@buildstock.pro or open an issue in the repository.

---

**Last Updated:** January 2026
**Version:** 1.0.0
