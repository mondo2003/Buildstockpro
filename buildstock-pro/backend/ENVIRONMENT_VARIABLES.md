# Production Environment Variables for Render

## Critical Variables (Must Set)

### Database & Supabase
```
SUPABASE_URL=https://xrhlumtimbmglzrfrnnk.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... (from .env)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... (from .env)
DATABASE_URL=postgresql://user:pass@host:port/db (from Supabase or Render)
```

### Application Configuration
```
NODE_ENV=production
PORT=10000
CORS_ORIGIN=https://buildstock.pro
JWT_SECRET=<GENERATE_NEW_STRONG_SECRET>
SYNC_API_KEY=<GENERATE_NEW_STRONG_SECRET>
```

## Optional Variables

### Monitoring
```
SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
SENTRY_ENVIRONMENT=production
```

### Merchant API Keys (Optional)
```
SCREWFIX_API_KEY=
WICKES_API_KEY=
BANDQ_API_KEY=
JEWSON_API_KEY=
```

## How to Generate Secrets

### Generate JWT_SECRET
```bash
openssl rand -base64 32
# or
bun -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### Generate SYNC_API_KEY
```bash
openssl rand -hex 32
# or
bun -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Render Setup Instructions

1. Go to: https://dashboard.render.com
2. Create new Web Service
3. Connect GitHub repo
4. Add environment variables (above)
5. Deploy

## Getting Supabase Credentials

1. Go to: https://supabase.com/dashboard
2. Select your project
3. Settings → API
4. Copy:
   - Project URL → SUPABASE_URL
   - anon/public key → SUPABASE_ANON_KEY
   - service_role key → SUPABASE_SERVICE_ROLE_KEY
5. Settings → Database → Connection String → URI → DATABASE_URL

## Getting DATABASE_URL from Supabase

Format:
```
postgresql://postgres.xxxxx:password@aws-0-us-east-1.pooler.supabase.com:6543/postgres
```

Or from Supabase Dashboard:
- Settings → Database
- Connection String → Transaction mode
- Copy URI format

## Security Notes

- Never commit secrets to Git
- Use Render's environment variable feature
- Rotate secrets periodically
- Use different secrets for production vs development
- Keep `SERVICE_ROLE_KEY` secret - it bypasses RLS!
