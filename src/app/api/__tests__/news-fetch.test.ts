import { NextRequest, NextResponse } from 'next/server';
import { createMockRequest, simulateRateLimit, simulateNoRateLimit } from '@/lib/test-utils';
import { GET } from '@/app/api/news/fetch/route';
import { ErrorType } from '@/lib/error-handling';

// Mock the Supabase client
jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(() => ({
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      limit: jest.fn().mockResolvedValue({
        data: [
          {
            id: '1',
            title: 'Test Article',
            url: 'https://example.com',
            source: 'Test Source',
            summary: 'Test Summary',
            published_at: new Date().toISOString(),
          },
        ],
        error: null,
      }),
    })),
  })),
}));

describe('News Fetch API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return news articles when not rate limited', async () => {
    simulateNoRateLimit();
    const request = createMockRequest();
    const response = await GET(request);
    
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(Array.isArray(data)).toBe(true);
    expect(data[0]).toHaveProperty('title', 'Test Article');
  });

  it('should return rate limit error when rate limited', async () => {
    simulateRateLimit(5000);
    const request = createMockRequest();
    const response = await GET(request);
    
    expect(response.status).toBe(429);
    const data = await response.json();
    expect(data.error).toBe(ErrorType.RATE_LIMIT);
    expect(data.message).toContain('Rate limit exceeded');
  });

  it('should handle database errors gracefully', async () => {
    simulateNoRateLimit();
    // Mock database error
    jest.spyOn(console, 'error').mockImplementation(() => {});
    const mockError = new Error('Database error');
    jest.requireMock('@/lib/supabase/server').createClient.mockImplementationOnce(() => ({
      from: jest.fn(() => ({
        select: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        limit: jest.fn().mockRejectedValue(mockError),
      })),
    }));

    const request = createMockRequest();
    const response = await GET(request);
    
    expect(response.status).toBe(500);
    const data = await response.json();
    expect(data.error).toBe(ErrorType.INTERNAL);
    expect(data.message).toBe('An unexpected error occurred');
  });

  it('should return empty array when no articles found', async () => {
    simulateNoRateLimit();
    // Mock empty result
    jest.requireMock('@/lib/supabase/server').createClient.mockImplementationOnce(() => ({
      from: jest.fn(() => ({
        select: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue({
          data: [],
          error: null,
        }),
      })),
    }));

    const request = createMockRequest();
    const response = await GET(request);
    
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(Array.isArray(data)).toBe(true);
    expect(data).toHaveLength(0);
  });
}); 