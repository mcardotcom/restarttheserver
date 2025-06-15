import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function GET() {
  try {
    // Calculate the timestamp for 32 hours ago
    const thirtyTwoHoursAgo = new Date();
    thirtyTwoHoursAgo.setHours(thirtyTwoHoursAgo.getHours() - 32);

    // Silently delete articles older than 32 hours
    await supabase
      .from('articles')
      .delete()
      .lt('published_at', thirtyTwoHoursAgo.toISOString())
      .eq('is_published', true);

  } catch (error) {
    // Log error but don't expose it to the client
    console.error('Error in cleanup-articles:', error);
  }
} 