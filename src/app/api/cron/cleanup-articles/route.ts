import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { withCronRateLimit } from '@/lib/rate-limit';
import { handleError, ErrorType } from '@/lib/error-handling';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export const GET = withCronRateLimit(async (request: NextRequest) => {
  try {
    // Calculate the timestamp for 32 hours ago
    const thirtyTwoHoursAgo = new Date();
    thirtyTwoHoursAgo.setHours(thirtyTwoHoursAgo.getHours() - 32);

    // Delete articles older than 32 hours
    const { error } = await supabase
      .from('articles')
      .delete()
      .lt('created_at', thirtyTwoHoursAgo.toISOString());

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleError(error);
  }
}); 