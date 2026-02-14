export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 400, 'VALIDATION_ERROR');
    this.name = 'ValidationError';
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication required') {
    super(message, 401, 'AUTHENTICATION_ERROR');
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'Access denied') {
    super(message, 403, 'AUTHORIZATION_ERROR');
    this.name = 'AuthorizationError';
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found') {
    super(message, 404, 'NOT_FOUND_ERROR');
    this.name = 'NotFoundError';
  }
}

export class NetworkError extends AppError {
  constructor(message: string = 'Network error occurred') {
    super(message, 0, 'NETWORK_ERROR');
    this.name = 'NetworkError';
  }
}

export function handleApiError(error: any): AppError {
  if (error instanceof AppError) {
    return error;
  }

  if (error?.name === 'TypeError' && error?.message?.includes('fetch')) {
    return new NetworkError('Unable to connect to the server');
  }

  if (error?.status) {
    switch (error.status) {
      case 400:
        return new ValidationError(error.message || 'Invalid request');
      case 401:
        return new AuthenticationError(error.message || 'Please log in');
      case 403:
        return new AuthorizationError(error.message || 'Access denied');
      case 404:
        return new NotFoundError(error.message || 'Resource not found');
      case 500:
        return new AppError(error.message || 'Server error', 500);
      default:
        return new AppError(error.message || 'An error occurred', error.status);
    }
  }

  return new AppError(error?.message || 'An unexpected error occurred');
}

export function getErrorMessage(error: AppError): string {
  switch (error.code) {
    case 'VALIDATION_ERROR':
      return `⚠️ ${error.message}`;
    case 'AUTHENTICATION_ERROR':
      return `🔐 ${error.message}`;
    case 'AUTHORIZATION_ERROR':
      return `🚫 ${error.message}`;
    case 'NOT_FOUND_ERROR':
      return `🔍 ${error.message}`;
    case 'NETWORK_ERROR':
      return `🌐 ${error.message}`;
    default:
      return `❌ ${error.message}`;
  }
}
