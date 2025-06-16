import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';
import { withRateLimit } from '@/lib/rate-limit';
import { getTranscript } from '@/lib/youtube/transcript';
import { analyzeTranscript } from '@/lib/youtube/analysis';
import { validateRequest } from '@/lib/validation';
import { z } from 'zod';
import { handleError, ErrorType } from '@/lib/error-handling';

// Initialize clients
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Validation schema for YouTube video processing
const youtubeVideoSchema = z.object({
  videoUrl: z.string().url('Please enter a valid YouTube URL'),
  title: z.string().min(1, 'Title is required'),
  transcript: z.string().min(1, 'Transcript is required')
});

// Wrap the handler with rate limiting
export const POST = withRateLimit(async (request: NextRequest) => {
  try {
    // Validate request body
    const { videoUrl, title, transcript } = await validateRequest(youtubeVideoSchema, request);

    // Truncate transcript to avoid token limits (roughly 4000 words)
    const truncatedTranscript = transcript.split(' ').slice(0, 4000).join(' ');

    // Analyze transcript
    const analysis = await analyzeTranscript(truncatedTranscript, title);
    if (!analysis) {
      throw new Error('Failed to analyze transcript');
    }

    // Insert into database
    const { data, error } = await supabase
      .from('headlines')
      .insert([{
        title,
        url: videoUrl,
        source: 'YouTube',
        summary: analysis.summary,
        flame_score: analysis.hype_score,
        category: analysis.category,
        published_at: new Date().toISOString(),
        moderation_status: 'pending',
        is_published: false,
        draft: true,
        published: false,
        ai_summary: true
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