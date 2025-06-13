import { PostgrestError } from '@supabase/supabase-js'

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