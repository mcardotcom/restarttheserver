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

    // Generate summary using OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant that summarizes YouTube video transcripts. Create a concise, engaging summary of about 200 words that captures the key points and main message of the video."
        },
        {
          role: "user",
          content: `Please summarize this video transcript:\n\n${transcript}`
        }
      ],
      max_tokens: 300,
      temperature: 0.7,
    });

    const summary = completion.choices[0].message.content;

    // Insert into headlines table
    const { error } = await supabase.from('headlines').insert({
      title: title,
      url: videoUrl,
      source: 'YouTube',
      summary: summary,
      flame_score: 3, // Default score for videos
      category: 'Video',
      is_published: false,
      draft: true,
      published: false,
      ai_summary: true,
      metadata: {
        type: 'video',
        original_transcript: transcript,
        platform: 'youtube'
      }
    });

    if (error) {
      console.error('Error inserting video:', error);
      return NextResponse.json(
        { error: 'Failed to store video' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Video processed successfully',
      summary
    });

  } catch (error: any) {
    console.error('Error processing video:', error);
    return NextResponse.json(
      { error: 'Failed to process video' },
      { status: 500 }
    );
  }
} 