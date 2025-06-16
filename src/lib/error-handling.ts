import { PostgrestError } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export class AppError extends Error {
  constructor(
    message: string,
    public code?: string,
    public status?: number
  ) {
    super(message)
    this.name = 'AppError'
  }
}

export function handleSupabaseError(error: PostgrestError): never {
  console.error('Supabase error:', error)
  
  switch (error.code) {
    case '42P01': // undefined_table
      throw new AppError('Database table not found', error.code, 500)
    case '23505': // unique_violation
      throw new AppError('Record already exists', error.code, 409)
    case '23503': // foreign_key_violation
      throw new AppError('Related record not found', error.code, 404)
    case '42P17': // infinite_recursion
      throw new AppError('Database policy recursion detected', error.code, 500)
    default:
      throw new AppError(
        error.message || 'An unexpected database error occurred',
        error.code,
        500
      )
  }
}

export function handleAuthError(error: Error): never {
  console.error('Auth error:', error)
  
  if (error.message.includes('Invalid login credentials')) {
    throw new AppError('Invalid email or password', 'AUTH_INVALID_CREDENTIALS', 401)
  }
  
  if (error.message.includes('Email not confirmed')) {
    throw new AppError('Please confirm your email address', 'AUTH_EMAIL_NOT_CONFIRMED', 403)
  }
  
  throw new AppError(
    error.message || 'An unexpected authentication error occurred',
    'AUTH_ERROR',
    500
  )
}

export function handleNetworkError(error: Error): never {
  console.error('Network error:', error)
  
  if (error.message.includes('Failed to fetch')) {
    throw new AppError('Network connection failed', 'NETWORK_ERROR', 503)
  }
  
  throw new AppError(
    error.message || 'An unexpected network error occurred',
    'NETWORK_ERROR',
    500
  )
}

export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError
}

// Define error types
export enum ErrorType {
  VALIDATION = 'VALIDATION_ERROR',
  AUTHENTICATION = 'AUTHENTICATION_ERROR',
  AUTHORIZATION = 'AUTHORIZATION_ERROR',
  NOT_FOUND = 'NOT_FOUND_ERROR',
  RATE_LIMIT = 'RATE_LIMIT_ERROR',
  INTERNAL = 'INTERNAL_ERROR',
}

// Define error messages
const ERROR_MESSAGES = {
  [ErrorType.VALIDATION]: 'Invalid request data',
  [ErrorType.AUTHENTICATION]: 'Authentication failed',
  [ErrorType.AUTHORIZATION]: 'Not authorized to perform this action',
  [ErrorType.NOT_FOUND]: 'Resource not found',
  [ErrorType.RATE_LIMIT]: 'Too many requests',
  [ErrorType.INTERNAL]: 'An unexpected error occurred',
};

// Define HTTP status codes
const HTTP_STATUS_CODES = {
  [ErrorType.VALIDATION]: 400,
  [ErrorType.AUTHENTICATION]: 401,
  [ErrorType.AUTHORIZATION]: 403,
  [ErrorType.NOT_FOUND]: 404,
  [ErrorType.RATE_LIMIT]: 429,
  [ErrorType.INTERNAL]: 500,
};

interface ErrorResponse {
  error: string;
  type: ErrorType;
  details?: string;
}

/**
 * Create a standardized error response
 */
export function createErrorResponse(
  type: ErrorType,
  details?: string,
  status?: number
): NextResponse {
  const response: ErrorResponse = {
    error: ERROR_MESSAGES[type],
    type,
  };

  // Only include details in development
  if (details && process.env.NODE_ENV === 'development') {
    response.details = details;
  }

  return NextResponse.json(response, {
    status: status || HTTP_STATUS_CODES[type],
  });
}

/**
 * Handle common errors and return appropriate responses
 */
export function handleError(error: unknown): NextResponse {
  console.error('Error:', error);

  if (error instanceof Error) {
    // Handle known error types
    if (error.name === 'ValidationError') {
      return createErrorResponse(ErrorType.VALIDATION, error.message);
    }
    if (error.name === 'AuthenticationError') {
      return createErrorResponse(ErrorType.AUTHENTICATION, error.message);
    }
    if (error.name === 'AuthorizationError') {
      return createErrorResponse(ErrorType.AUTHORIZATION, error.message);
    }
    if (error.name === 'NotFoundError') {
      return createErrorResponse(ErrorType.NOT_FOUND, error.message);
    }
    if (error.name === 'RateLimitError') {
      return createErrorResponse(ErrorType.RATE_LIMIT, error.message);
    }
  }

  // Default to internal error
  return createErrorResponse(
    ErrorType.INTERNAL,
    error instanceof Error ? error.message : 'Unknown error'
  );
}

/**
 * Custom error classes
 */
export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class AuthenticationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthorizationError';
  }
}

export class NotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NotFoundError';
  }
}

export class RateLimitError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'RateLimitError';
  }
} 