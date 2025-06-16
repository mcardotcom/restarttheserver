import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { withRateLimit } from '@/lib/rate-limit';
import { handleError, ErrorType } from '@/lib/error-handling';

export const GET = withRateLimit(async () => {
  try {
    // Get the host from headers to construct the URL
    const headersList = headers();
    const host = headersList.get('host') || 'localhost:3000';
    const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https';
    
    // Call the hybrid-fetch endpoint
    const response = await fetch(`${protocol}://${host}/api/cron/hybrid-fetch`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.CRON_SECRET}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch: ${response.statusText}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    return handleError(error);
  }
}); 