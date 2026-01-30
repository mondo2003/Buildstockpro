import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Set environment based on NODE_ENV or explicit SENTRY_ENVIRONMENT
  environment: process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT || process.env.NODE_ENV || "production",

  // Release tracking - use package.json version if available
  release: process.env.NEXT_PUBLIC_APP_VERSION || "buildstock-pro@production",

  // Adjust this value in production, or use tracesSampler for greater control
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,

  // Session replay
  replaysSessionSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
  replaysOnErrorSampleRate: 1.0,

  // Filter out sensitive data before sending to Sentry
  beforeSend(event, hint) {
    // Don't send events from localhost in production unless explicitly testing
    if (process.env.NODE_ENV === "production" && event.server_name === "localhost") {
      return null;
    }

    // Remove sensitive data from request headers
    if (event.request?.headers) {
      delete event.request.headers["authorization"];
      delete event.request.headers["cookie"];
      delete event.request.headers["x-api-key"];
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
  beforeBreadcrumb(breadcrumb) {
    if (breadcrumb.category === "xhr" || breadcrumb.category === "fetch") {
      // Filter out sensitive URLs
      const url = breadcrumb.data?.url || "";
      if (url.includes("/api/auth") || url.includes("/auth")) {
        // Don't log auth requests in detail
        return {
          ...breadcrumb,
          message: "Auth request (filtered)",
          data: { ...breadcrumb.data, url: "[FILTERED]" },
        };
      }
    }
    return breadcrumb;
  },

  // Integrations
  integrations: [
    Sentry.replayIntegration({
      // Additional Replay configuration goes in here
      maskAllText: true,
      blockAllMedia: true,
    }),
    Sentry.browserTracingIntegration(),
  ],

  // Ignore specific error types
  ignoreErrors: [
    // Network errors that are not actionable
    /Network Error/i,
    /Failed to fetch/i,
    // Browser extensions that cause errors
    /ResizeObserver loop limit exceeded/i,
    // Non-actionable errors
    /Non-Error promise rejection captured/i,
  ],

  // Deny URLs from loading source maps
  denyUrls: [
    // Chrome extensions
    /extensions\//i,
    /^chrome:\/\//i,
    /^chrome-extension:\/\//i,
    // Firefox extensions
    /^resource:\/\//i,
    /^moz-extension:\/\//i,
  ],
});
