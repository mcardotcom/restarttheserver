import { NextResponse } from 'next/server';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Run every hour
export const cron = '0 * * * *';

export async function GET() {
  try {
    await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/cron/cleanup-articles`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    // Log error but don't expose it to the client
    console.error('Error in cleanup-articles cron job:', error);
  }
} 