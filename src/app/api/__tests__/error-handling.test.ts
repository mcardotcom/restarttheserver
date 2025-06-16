import { NextRequest, NextResponse } from 'next/server';
import { createErrorResponse, handleError, ErrorType } from '@/lib/error-handling';
import { createMockRequest } from '@/lib/test-utils';

describe('Error Handling', () => {
  const mockRequest = createMockRequest();

  beforeEach(() => {
    jest.resetModules();
  });

  it('should create standardized error responses', () => {
    const error = new Error('Test error');
    const response = createErrorResponse(ErrorType.INTERNAL, error.message);
    
    expect(response.status).toBe(500);
    expect(response.headers.get('Content-Type')).toBe('application/json');
  });

  it('should handle different error types with correct status codes', async () => {
    const errorTypes = [
      { type: ErrorType.VALIDATION, status: 400 },
      { type: ErrorType.AUTHENTICATION, status: 401 },
      { type: ErrorType.AUTHORIZATION, status: 403 },
      { type: ErrorType.NOT_FOUND, status: 404 },
      { type: ErrorType.RATE_LIMIT, status: 429 },
      { type: ErrorType.INTERNAL, status: 500 },
    ];

    for (const { type, status } of errorTypes) {
      const response = createErrorResponse(type, 'Test error');
      expect(response.status).toBe(status);
      const data = await response.json();
      expect(data.error).toBe(type);
    }
  });

  it('should handle unknown errors gracefully', async () => {
    const error = new Error('Unknown error');
    const response = handleError(error);
    
    expect(response.status).toBe(500);
    const data = await response.json();
    expect(data.error).toBe(ErrorType.INTERNAL);
    expect(data.message).toBe('An unexpected error occurred');
  });

  it('should preserve custom error messages', async () => {
    const customMessage = 'Custom error message';
    const response = createErrorResponse(ErrorType.VALIDATION, customMessage);
    
    const data = await response.json();
    expect(data.message).toBe(customMessage);
  });

  it('should handle non-Error objects', async () => {
    const response = handleError('String error');
    
    expect(response.status).toBe(500);
    const data = await response.json();
    expect(data.error).toBe(ErrorType.INTERNAL);
  });
}); 