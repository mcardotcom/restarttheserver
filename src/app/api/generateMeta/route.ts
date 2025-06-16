import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { withRateLimit } from '@/lib/rate-limit'
import { handleError, ErrorType } from '@/lib/error-handling'
import { validateRequest } from '@/lib/validation'
import { z } from 'zod'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// Validation schema for meta generation
const metaGenerationSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  url: z.string().url('Please enter a valid URL')
});

export const POST = withRateLimit(async (request: NextRequest) => {
  try {
    // Validate request body
    const { title, url } = await validateRequest(metaGenerationSchema, request);

    const prompt = `Analyze this news headline and URL for a tech news aggregator:

Title: "${title}"
URL: ${url}

Please provide:

A concise 1-2 sentence summary (max 120 characters)

A category (AI, Startups, Tech, Crypto, etc.)

A hype score from 1-5 where:

1: Minor news, niche interest

2: Somewhat interesting, limited impact

3: Notable news, moderate interest

4: Important news, high interest

5: Major breaking news, urgent

Respond in JSON format:
{
"summary": "...",
"category": "...",
"hype_score": number
}`

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are an expert tech news curator. Analyze headlines and provide metadata for a Drudge Report-style news aggregator focused on AI, startups, and technology."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 200
    })

    const response = completion.choices[0]?.message?.content
    if (!response) {
      throw new Error('No response from OpenAI')
    }

    // Parse JSON response
    const metadata = JSON.parse(response)

    return NextResponse.json(metadata)

  } catch (error) {
    return handleError(error)
  }
}) 