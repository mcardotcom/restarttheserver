import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

// Initialize clients
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(request: NextRequest) {
  try {
    const { videoUrl, title, transcript } = await request.json();

    if (!videoUrl || !title || !transcript) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Truncate transcript to avoid token limits (roughly 4000 words)
    const truncatedTranscript = transcript.split(' ').slice(0, 4000).join(' ');

    try {
      // Generate summary using OpenAI
      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are a helpful assistant that creates ultra-concise YouTube video summaries. Create exactly 2 short sentences (max 200 characters total). First sentence: Start with a question or problem (max 100 chars). Second sentence: Start with 'From' or 'Through' to show the solution (max 100 chars). Keep it punchy and skip unnecessary details."
          },
          {
            role: "user",
            content: `Summarize this video in exactly 2 short sentences (max 200 chars total):\nFirst: Question/problem (max 100 chars)\nSecond: Solution starting with 'From' or 'Through' (max 100 chars)\n\n${truncatedTranscript}`
          }
        ],
        max_tokens: 150,
        temperature: 0.7,
      });

      const rawSummary = completion.choices[0].message.content;
      if (!rawSummary) {
        throw new Error('Failed to generate summary');
      }

      // Enforce character limit
      const summary = rawSummary.length > 200 
        ? rawSummary.slice(0, 197) + '...'
        : rawSummary;

      // Insert into headlines table
      const { data, error } = await supabase
        .from('headlines')
        .insert([
          {
            title,
            url: videoUrl,
            source: 'YouTube',
            summary,
            flame_score: 3,
            is_published: false,
            draft: true,
            published: false,
            moderation_status: 'pending',
            metadata: {
              type: 'youtube',
              processed_at: new Date().toISOString()
            }
          }
        ])
        .select();

      if (error) {
        console.error('Error inserting into database:', error);
        return NextResponse.json(
          { error: 'Failed to save video' },
          { status: 500 }
        );
      }

      return NextResponse.json({ success: true, data });
    } catch (error: any) {
      console.error('Error processing video:', error);
      
      // Handle rate limit errors specifically
      if (error.code === 'rate_limit_exceeded') {
        return NextResponse.json(
          { error: 'OpenAI rate limit exceeded. Please try again in a minute.' },
          { status: 429 }
        );
      }

      return NextResponse.json(
        { error: 'Failed to process video' },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('Error processing video:', error);
    return NextResponse.json(
      { error: 'Failed to process video' },
      { status: 500 }
    );
  }
} 