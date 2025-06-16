import { NextRequest } from 'next/server';

// Create a mock NextRequest
export function createMockRequest({
  method = 'GET',
  url = 'http://localhost:3000',
  headers = {},
  body = null,
}: {
  method?: string;
  url?: string;
  headers?: Record<string, string>;
  body?: any;
} = {}): NextRequest {
  const request = new NextRequest(url, {
    method,
    headers: new Headers(headers),
    body: body ? JSON.stringify(body) : null,
  });
  return request;
}

// Mock rate limit store for testing
export const mockRateLimitStore = {
  isRateLimited: jest.fn(),
  getRemainingTime: jest.fn(),
};

// Helper to simulate rate limiting
export function simulateRateLimit(remainingTime = 5000) {
  mockRateLimitStore.isRateLimited.mockReturnValue(true);
  mockRateLimitStore.getRemainingTime.mockReturnValue(remainingTime);
}

// Helper to simulate no rate limiting
export function simulateNoRateLimit() {
  mockRateLimitStore.isRateLimited.mockReturnValue(false);
  mockRateLimitStore.getRemainingTime.mockReturnValue(0);
} 