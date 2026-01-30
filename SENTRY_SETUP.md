# Sentry Monitoring Setup for BuildStock Pro

This document describes the Sentry integration for monitoring errors and performance in BuildStock Pro.

## Overview

BuildStock Pro now includes comprehensive Sentry monitoring for both frontend (Next.js) and backend (Bun + Elysia) applications.

### Features

- **Error Tracking**: Automatically captures and reports errors
- **Performance Monitoring**: Tracks request performance and bottlenecks
- **Release Tracking**: Monitor errors by release version
- **User Context**: Track which users are experiencing errors
- **Breadcrumbs**: See what led up to an error

## Getting Started with Sentry

### 1. Create a Sentry Account

1. Go to [sentry.io](https://sentry.io/) and sign up for an account
2. Create a new project for BuildStock Pro
3. Choose "Next.js" as the platform for the frontend project
4. Create a separate project for "Bun" or "Node.js" for the backend

### 2. Get Your DSN (Data Source Name)

1. In your Sentry dashboard, go to Settings > Projects
2. Select your project
3. Go to "Client Keys (DSN)"
4. Copy the DSN URL (it looks like: `https://examplePublicKey@o0.ingest.sentry.io/0`)

### 3. Configure Environment Variables

#### Frontend Configuration

Edit `src/frontend/.env.local`:

```bash
# Sentry Configuration
NEXT_PUBLIC_SENTRY_DSN=https://your-dsn@sentry.io/project-id
NEXT_PUBLIC_SENTRY_ENVIRONMENT=development
```

#### Backend Configuration

Edit `src/backend/.env`:

```bash
# Sentry Configuration
SENTRY_DSN=https://your-dsn@sentry.io/project-id
SENTRY_ENVIRONMENT=development
```

### 4. Restart Your Applications

After configuring the environment variables, restart both applications:

```bash
# Frontend
cd src/frontend
npm run dev

# Backend
cd src/backend
bun run dev
```

## Testing Sentry Integration

### Frontend Testing

Visit the Sentry test page at: `http://localhost:3000/admin/sentry-test`

This page provides buttons to test various Sentry features:
- Test Frontend Error
- Test Frontend Message
- Test Frontend Exception
- Test Unhandled Promise

### Backend Testing

The backend provides several test endpoints at: `http://localhost:3001/api/v1/sentry-test`

Available endpoints:
- `GET /api/v1/sentry-test` - List available tests
- `GET /api/v1/sentry-test/error` - Trigger a test error
- `GET /api/v1/sentry-test/message` - Send a test message
- `GET /api/v1/sentry-test/exception` - Trigger an exception
- `GET /api/v1/sentry-test/async` - Trigger an async error
- `GET /api/v1/sentry-test/performance` - Test performance monitoring
- `POST /api/v1/sentry-test/custom` - Send custom error data

Example using curl:

```bash
# Test error
curl http://localhost:3001/api/v1/sentry-test/error

# Test message
curl http://localhost:3001/api/v1/sentry-test/message

# Test exception
curl http://localhost:3001/api/v1/sentry-test/exception

# Test performance
curl http://localhost:3001/api/v1/sentry-test/performance
```

## Configuration Details

### Frontend Configuration

The frontend Sentry configuration is split across three files:

1. **`src/app/sentry.client.config.ts`** - Client-side configuration
   - Browser error tracking
   - Session replay
   - Performance monitoring

2. **`src/app/sentry.server.config.ts`** - Server-side configuration
   - API route errors
   - Server-side performance
   - Request/response tracking

3. **`src/app/sentry.edge.config.ts`** - Edge runtime configuration
   - Middleware errors
   - Edge function monitoring

### Backend Configuration

The backend configuration is in `src/backend/src/index.ts`:

- Automatic error capture from all routes
- Request/response tracking
- Performance monitoring for all HTTP requests
- Transaction tracking for long-running operations

## Key Features

### Error Filtering

Sentry is configured to filter out sensitive information:
- Authorization headers
- Cookies
- API keys
- User emails
- IP addresses

### Performance Monitoring

- **Frontend**: Tracks page load times, API calls, and user interactions
- **Backend**: Monitors request duration, database queries, and external API calls

### Sampling Rates

In development:
- 100% of transactions are sampled (tracesSampleRate: 1.0)

In production:
- 10% of transactions are sampled (tracesSampleRate: 0.1)
- Adjust this based on your volume and needs

### Environment Tags

Sentry automatically tags events with:
- Environment (development, staging, production)
- Release (if configured)
- Node/Bun version
- Browser information

## Best Practices

### Development vs Production

**Development**:
- Errors are logged to console AND sent to Sentry
- Full tracing enabled
- Useful for debugging during development

**Production**:
- Reduced sampling to control costs
- Only errors and critical performance issues
- Consider setting up alerts for critical issues

### Release Tracking

To track errors by release, set the release version in your Sentry init:

```typescript
Sentry.init({
  release: `buildstock-pro@${process.env.npm_package_version}`,
  // ... other config
});
```

### User Context

The frontend integration automatically captures Clerk user context (when available):
- User ID
- Username
- No sensitive information (email, etc.)

### Custom Error Handling

For custom error handling:

```typescript
import * as Sentry from '@sentry/nextjs'; // or '@sentry/bun'

try {
  // Your code
} catch (error) {
  Sentry.captureException(error, {
    level: 'error',
    tags: {
      component: 'MyComponent',
      action: 'saveData',
    },
    extra: {
      customData: 'Additional context',
    },
  });
}
```

## Viewing Errors in Sentry

1. Go to your Sentry dashboard
2. Select your project
3. View "Issues" to see captured errors
4. View "Performance" to see transaction data
5. Use filters to find specific errors or time periods

## Troubleshooting

### Errors Not Appearing in Sentry

1. **Check DSN configuration**: Verify your SENTRY_DSN is correct
2. **Check network**: Ensure your application can reach Sentry servers
3. **Development mode**: In development, check console for Sentry logs
4. **Sampling rate**: Ensure tracesSampleRate is not 0

### Too Many Events

1. **Reduce sampling rate**: Lower `tracesSampleRate` in production
2. **Filter errors**: Use `beforeSend` to filter out noise
3. **Ignore specific errors**: Add ignored errors in Sentry.init()

### Performance Impact

Sentry is designed to be lightweight:
- Asynchronous error reporting
- Minimal performance overhead
- No blocking operations

## Environment Variables Reference

### Frontend (.env.local)

```bash
# Sentry DSN (public, safe to expose)
NEXT_PUBLIC_SENTRY_DSN=https://your-dsn@sentry.io/project-id

# Environment name (development, staging, production)
NEXT_PUBLIC_SENTRY_ENVIRONMENT=development
```

### Backend (.env)

```bash
# Sentry DSN (private)
SENTRY_DSN=https://your-dsn@sentry.io/project-id

# Environment name
SENTRY_ENVIRONMENT=development
```

## Security Considerations

- **DSN is public**: The frontend DSN is safe to expose, but set up rate limiting in Sentry
- **No sensitive data**: Sentry configuration filters out passwords, tokens, and PII
- **CORS**: Ensure Sentry origins are properly configured
- **Rate limits**: Monitor your Sentry usage to prevent overages

## Additional Resources

- [Sentry Documentation](https://docs.sentry.io/)
- [Sentry for Next.js](https://docs.sentry.io/platforms/javascript/guides/nextjs/)
- [Sentry for Bun](https://docs.sentry.io/platforms/javascript/guides/bun/)
- [Best Practices](https://docs.sentry.io/product/best-practices/)

## Support

If you encounter issues with Sentry integration:

1. Check the browser console for error messages
2. Check server logs for backend issues
3. Verify your DSN configuration
4. Test with the provided test endpoints
5. Check Sentry status page for service issues

## Changelog

### Initial Setup (January 2026)
- Installed `@sentry/nextjs` for frontend
- Installed `@sentry/bun` for backend
- Configured error tracking for both applications
- Added performance monitoring
- Created test endpoints and pages
- Updated environment variable examples
