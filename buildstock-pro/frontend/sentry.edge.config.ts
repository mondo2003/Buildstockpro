import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Set environment based on NODE_ENV
  environment: process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT || process.env.NODE_ENV || "production",

  // Release tracking
  release: process.env.NEXT_PUBLIC_APP_VERSION || "buildstock-pro@production",

  // Adjust this value in production
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,

  // Filter out sensitive data before sending to Sentry
  beforeSend(event, hint) {
    // Remove sensitive data from request headers
    if (event.request?.headers) {
      delete event.request.headers["authorization"];
      delete event.request.headers["cookie"];
      delete event.request.headers["x-api-key"];
      delete event.request.headers["x-csrf-token"];
    }

    // Remove sensitive data from user
    if (event.user) {
      delete event.user.email;
      delete event.user.ip_address;
    }

    // Remove sensitive data from extra
    if (event.extra) {
      delete event.extra.password;
      delete event.extra.token;
      delete event.extra.apiKey;
      delete event.extra.credentials;
    }

    return event;
  },

  // Filter breadcrumbs that might contain sensitive data
  beforeBreadcrumb(breadcrumb, hint) {
    if (breadcrumb.category === "http" && breadcrumb.data?.url) {
      const url = breadcrumb.data.url;
      // Filter sensitive endpoints
      if (url.includes("/auth") || url.includes("/api/auth")) {
        return null; // Don't log auth breadcrumbs at all in edge
      }
    }
    return breadcrumb;
  },

  // Ignore specific error types
  ignoreErrors: [
    // Network errors that are not actionable
    /Network Error/i,
    /Failed to fetch/i,
    // Browser extension errors
    /ResizeObserver loop limit exceeded/i,
    // Non-actionable errors
    /Non-Error promise rejection captured/i,
  ],
});
