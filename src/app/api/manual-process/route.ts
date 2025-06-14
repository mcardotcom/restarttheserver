import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { analyzeArticle } from '@/app/api/cron/hybrid-fetch/route';
import { normalizeUrl } from '@/lib/utils';

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      );
    }

    // Validate URL format
    try {
      new URL(url);
    } catch (e) {
      return NextResponse.json(
        { error: 'Invalid URL format' },
        { status: 400 }
      );
    }

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
    if (!analysis) {
      return NextResponse.json(
        { error: 'Failed to analyze article' },
        { status: 500 }
      );
    }

    // Insert into database
    const { data, error } = await supabase.from('headlines').insert({
      title,
      url: normalizedUrl,
      source: new URL(url).hostname,
      summary: analysis.summary,
      flame_score: analysis.hype_score,
      category: analysis.category,
      published_at: new Date().toISOString(),
      moderation_status: 'pending',
      is_published: false,
      draft: true,
      published: false,
      ai_summary: true,
    }).select().single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to save article to database' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Article processed successfully',
      article: data
    });

  } catch (error: any) {
    console.error('Manual processing error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
} 