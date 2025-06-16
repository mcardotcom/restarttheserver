import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { YoutubeTranscript } from 'youtube-transcript'
import OpenAI from 'openai'
import { withCronRateLimit } from '@/lib/rate-limit'
import { handleError, ErrorType } from '@/lib/error-handling'

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

interface YouTubeArticle {
  title: string
  url: string
  source: string
}

// The main handler for the cron job request
export const POST = withCronRateLimit(async (request: NextRequest) => {
  try {
    // 1. Authenticate the cron job request
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // TODO: Implement YouTube API fetch
    const newVideos: YouTubeArticle[] = []
    console.log(`Found ${newVideos.length} new videos to process.`)

    let processedCount = 0
    let errorCount = 0
    const supabase = createClient()

    for (const video of newVideos) {
      console.log(`\nProcessing video: ${video.title}`);
      console.log(`URL: ${video.url}`);
      console.log(`Source: ${video.source}`);
      
      // 3. Fetch the transcript for the video
      const transcript = await getTranscript(video.url)
      if (!transcript) {
        console.log(`Skipping video with no transcript: ${video.title}`)
        continue
      }

      // 4. Summarize with GPT-4o Mini
      const analysis = await analyzeTranscript(transcript, video.title)
      if (!analysis) {
        console.log(`Skipping video due to failed analysis: ${video.title}`)
        continue
      }

      // 5. Insert video as a draft into the database
      console.log('Inserting into database...');
      const { error } = await supabase.from('headlines').insert({
        title: analysis.headline,
        url: video.url,
        source: video.source,
        summary: analysis.summary,
        flame_score: analysis.hype_score,
        media_type: 'video',
        is_published: false,
        moderation_status: 'pending',
        category: 'video',
        metadata: {
          original_title: video.title,
          transcript: transcript.substring(0, 1000), // Store first 1000 chars of transcript
          media_type: 'video'
        }
      })

      if (error) {
        console.error(`Error inserting video "${video.title}":`, error.message)
        errorCount++
      } else {
        console.log(`Successfully processed video: ${video.title}`)
        processedCount++
      }
    }

    return NextResponse.json({
      message: 'YouTube video ingestion complete.',
      processedCount,
      errorCount,
      totalVideos: newVideos.length
    })

  } catch (error: any) {
    return handleError(error)
  }
})

async function getTranscript(videoUrl: string): Promise<string | null> {
  try {
    console.log(`Fetching transcript for video: ${videoUrl}`);
    const transcriptParts = await YoutubeTranscript.fetchTranscript(videoUrl)
    if (!transcriptParts || transcriptParts.length === 0) {
      console.log('No transcript parts found');
      return null;
    }
    const transcript = transcriptParts.map(part => part.text).join(' ');
    console.log(`Successfully fetched transcript (${transcript.length} chars)`);
    return transcript;
  } catch (error) {
    console.error('Transcript fetch error:', error);
    return null;
  }
}

async function analyzeTranscript(transcript: string, originalTitle: string) {
  try {
    console.log(`Analyzing transcript for: ${originalTitle}`);
    console.log(`Transcript length: ${transcript.length} chars`);
    
    const prompt = `You are a tech news editor. A raw transcript from a YouTube video is provided below. Your job is to create a concise, compelling news headline and a short, one-paragraph summary (around 200 words) suitable for a news feed. The summary should capture the key insights or conclusions of the video. The original title is provided for context.

Original Title: "${originalTitle}"
Transcript: "${transcript.substring(0, 12000)}" 

Respond in JSON format: {"headline": "...", "summary": "...", "hype_score": number}

The hype_score should be a number from 1-5 indicating how significant or impactful the content is:
1: Minor update or incremental change
2: Notable feature or improvement
3: Significant development or major feature
4: Industry-shifting announcement or breakthrough
5: Revolutionary change or paradigm shift`

    console.log('Sending request to GPT-4o-mini...');
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
      temperature: 0.5,
    })
    
    const content = response.choices[0]?.message?.content
    if (!content) {
      console.error('No content in GPT response');
      return null;
    }

    console.log('Received GPT response:', content);

    try {
      const analysis = JSON.parse(content);
      // Validate the response format
      if (!analysis.headline || !analysis.summary || typeof analysis.hype_score !== 'number') {
        console.error('Invalid analysis format:', analysis);
        return null;
      }
      console.log('Successfully analyzed transcript:', {
        headline: analysis.headline,
        summaryLength: analysis.summary.length,
        hypeScore: analysis.hype_score
      });
      return analysis;
    } catch (parseError) {
      console.error('Failed to parse GPT response:', parseError);
      return null;
    }
  } catch (error: any) {
    console.error(`Transcript analysis failed for "${originalTitle}":`, error.message)
    return null
  }
} 