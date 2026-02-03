/**
 * API Error Handling Utilities
 * Standardized error handling, error types, user-friendly messages, and retry logic
 */

// Error types
export enum ApiErrorType {
  NETWORK_ERROR = 'NETWORK_ERROR',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  AUTHENTICATION_ERROR = 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR = 'AUTHORIZATION_ERROR',
  NOT_FOUND_ERROR = 'NOT_FOUND_ERROR',
  CONFLICT_ERROR = 'CONFLICT_ERROR',
  SERVER_ERROR = 'SERVER_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

// API Error class
export class ApiError extends Error {
  constructor(
    public type: ApiErrorType,
    public message: string,
    public statusCode?: number,
    public details?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// User-friendly error messages
const ERROR_MESSAGES: Record<ApiErrorType, string> = {
  [ApiErrorType.NETWORK_ERROR]: 'Network connection error. Please check your internet connection.',
  [ApiErrorType.TIMEOUT_ERROR]: 'Request timed out. Please try again.',
  [ApiErrorType.VALIDATION_ERROR]: 'Please check your input and try again.',
  [ApiErrorType.AUTHENTICATION_ERROR]: 'You need to sign in to perform this action.',
  [ApiErrorType.AUTHORIZATION_ERROR]: 'You do not have permission to perform this action.',
  [ApiErrorType.NOT_FOUND_ERROR]: 'The requested resource was not found.',
  [ApiErrorType.CONFLICT_ERROR]: 'This action conflicts with existing data. Please refresh and try again.',
  [ApiErrorType.SERVER_ERROR]: 'Server error. Please try again later.',
  [ApiErrorType.UNKNOWN_ERROR]: 'An unexpected error occurred. Please try again.',
};

// Get error type from HTTP status code
function getErrorTypeFromStatus(statusCode: number): ApiErrorType {
  if (statusCode >= 400 && statusCode < 500) {
    switch (statusCode) {
      case 400:
        return ApiErrorType.VALIDATION_ERROR;
      case 401:
        return ApiErrorType.AUTHENTICATION_ERROR;
      case 403:
        return ApiErrorType.AUTHORIZATION_ERROR;
      case 404:
        return ApiErrorType.NOT_FOUND_ERROR;
      case 409:
        return ApiErrorType.CONFLICT_ERROR;
      default:
        return ApiErrorType.VALIDATION_ERROR;
    }
  }
  if (statusCode >= 500) {
    return ApiErrorType.SERVER_ERROR;
  }
  return ApiErrorType.UNKNOWN_ERROR;
}

// Get error type from error object
function getErrorTypeFromError(error: any): ApiErrorType {
  if (error.name === 'TypeError' && error.message.includes('fetch')) {
    return ApiErrorType.NETWORK_ERROR;
  }
  if (error.name === 'AbortError') {
    return ApiErrorType.TIMEOUT_ERROR;
  }
  return ApiErrorType.UNKNOWN_ERROR;
}

// Parse API error
export function parseApiError(error: any): ApiError {
  if (error instanceof ApiError) {
    return error;
  }

  // Handle fetch errors with status codes
  if (error.statusCode || error.status) {
    const statusCode = error.statusCode || error.status;
    const type = getErrorTypeFromStatus(statusCode);
    const message = error.message || ERROR_MESSAGES[type];
    return new ApiError(type, message, statusCode, error.details);
  }

  // Handle network/timeout errors
  if (error.name === 'TypeError' || error.name === 'AbortError') {
    const type = getErrorTypeFromError(error);
    return new ApiError(type, ERROR_MESSAGES[type]);
  }

  // Handle generic errors
  return new ApiError(ApiErrorType.UNKNOWN_ERROR, error.message || ERROR_MESSAGES[ApiErrorType.UNKNOWN_ERROR]);
}

// Get user-friendly error message
export function getUserFriendlyMessage(error: ApiError): string {
  return ERROR_MESSAGES[error.type] || error.message;
}

// Check if error is retryable
export function isRetryable(error: ApiError): boolean {
  return [
    ApiErrorType.NETWORK_ERROR,
    ApiErrorType.TIMEOUT_ERROR,
    ApiErrorType.SERVER_ERROR,
  ].includes(error.type);
}

// Retry configuration
export interface RetryConfig {
  maxRetries?: number;
  retryDelay?: number;
  backoffMultiplier?: number;
  maxDelay?: number;
}

const DEFAULT_RETRY_CONFIG: Required<RetryConfig> = {
  maxRetries: 3,
  retryDelay: 1000,
  backoffMultiplier: 2,
  maxDelay: 10000,
};

// Calculate retry delay with exponential backoff
function calculateRetryDelay(attempt: number, config: Required<RetryConfig>): number {
  const delay = config.retryDelay * Math.pow(config.backoffMultiplier, attempt);
  return Math.min(delay, config.maxDelay);
}

// Retry wrapper
export async function withRetry<T>(
  fn: () => Promise<T>,
  config: RetryConfig = {}
): Promise<T> {
  const finalConfig = { ...DEFAULT_RETRY_CONFIG, ...config };
  let lastError: Error | undefined;

  for (let attempt = 0; attempt < finalConfig.maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      const apiError = parseApiError(error);

      // Don't retry if error is not retryable
      if (!isRetryable(apiError)) {
        throw apiError;
      }

      // Don't delay after last attempt
      if (attempt < finalConfig.maxRetries - 1) {
        const delay = calculateRetryDelay(attempt, finalConfig);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError;
}

// Safe API wrapper with error handling
export async function safeApiCall<T>(
  fn: () => Promise<T>,
  options: {
    retry?: RetryConfig;
    onError?: (error: ApiError) => void;
  } = {}
): Promise<{ data?: T; error?: ApiError }> {
  try {
    const data = options.retry ? await withRetry(fn, options.retry) : await fn();
    return { data };
  } catch (error) {
    const apiError = parseApiError(error);
    if (options.onError) {
      options.onError(apiError);
    }
    return { error: apiError };
  }
}

// Toast notification helpers
export interface ToastOptions {
  title?: string;
  description?: string;
  duration?: number;
}

export function getToastForError(error: ApiError): ToastOptions {
  const message = getUserFriendlyMessage(error);

  switch (error.type) {
    case ApiErrorType.VALIDATION_ERROR:
      return {
        title: 'Validation Error',
        description: message,
        duration: 5000,
      };
    case ApiErrorType.AUTHENTICATION_ERROR:
      return {
        title: 'Authentication Required',
        description: message,
        duration: 5000,
      };
    case ApiErrorType.AUTHORIZATION_ERROR:
      return {
        title: 'Access Denied',
        description: message,
        duration: 5000,
      };
    case ApiErrorType.NOT_FOUND_ERROR:
      return {
        title: 'Not Found',
        description: message,
        duration: 3000,
      };
    case ApiErrorType.NETWORK_ERROR:
      return {
        title: 'Connection Error',
        description: message,
        duration: 5000,
      };
    case ApiErrorType.TIMEOUT_ERROR:
      return {
        title: 'Request Timeout',
        description: message,
        duration: 5000,
      };
    case ApiErrorType.SERVER_ERROR:
      return {
        title: 'Server Error',
        description: message,
        duration: 5000,
      };
    default:
      return {
        title: 'Error',
        description: message,
        duration: 5000,
      };
  }
}

// Error logging (for development/debugging)
export function logError(error: ApiError, context?: string) {
  if (process.env.NODE_ENV === 'development') {
    console.group(`API Error${context ? `: ${context}` : ''}`);
    console.error('Type:', error.type);
    console.error('Message:', error.message);
    console.error('Status Code:', error.statusCode);
    console.error('Details:', error.details);
    console.error('Stack:', error.stack);
    console.groupEnd();
  }
}

export default {
  ApiError,
  ApiErrorType,
  parseApiError,
  getUserFriendlyMessage,
  isRetryable,
  withRetry,
  safeApiCall,
  getToastForError,
  logError,
};
