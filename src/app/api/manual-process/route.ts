import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { analyzeArticle } from '@/app/api/cron/hybrid-fetch/route';
import { normalizeUrl } from '@/lib/utils';
import { createClient } from '@/lib/supabase/server';
import { withRateLimit } from '@/lib/rate-limit';
import { validateRequest } from '@/lib/validation';
import { urlSchema } from '@/lib/validation';
import { handleError, ErrorType } from '@/lib/error-handling';
import { z } from 'zod';

// Wrap the handler with rate limiting
export const POST = withRateLimit(async (request: NextRequest) => {
  try {
    // Validate request body
    const { url } = await validateRequest(z.object({ url: urlSchema }), request);

    // Check if article already exists
    const normalizedUrl = normalizeUrl(url);
    const { data: existingArticle } = await supabase
      .from('headlines')
      .select('id')
      .eq('url', normalizedUrl)
      .single();

    if (existingArticle) {
      return NextResponse.json(
        { error: 'Article already exists in database' },
        { status: 409 }
      );
    }

    // Fetch article content
    const response = await fetch(url);
    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to fetch article: ${response.statusText}` },
        { status: response.status }
      );
    }

    const html = await response.text();
    
    // Extract title and content
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const title = titleMatch ? titleMatch[1].trim() : 'Untitled Article';
    
    // Extract meta description or first paragraph as content snippet
    const metaMatch = html.match(/<meta[^>]*name="description"[^>]*content="([^"]*)"[^>]*>/i);
    const contentSnippet = metaMatch ? metaMatch[1].trim() : '';

    // Analyze article
    const analysis = await analyzeArticle(title, contentSnippet);

    // Insert into database
    const { data, error } = await supabase
      .from('headlines')
      .insert([{
        title,
        url: normalizedUrl,
        source: new URL(url).hostname,
        summary: contentSnippet,
        ...analysis
      }])
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    return handleError(error);
  }
}); 