import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const { title, url } = await request.json()

    if (!title || !url) {
      return NextResponse.json(
        { error: 'Title and URL are required' },
        { status: 400 }
      )
    }

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
    console.error('Error generating metadata:', error)
    return NextResponse.json(
      { error: 'Failed to generate metadata' },
      { status: 500 }
    )
  }
} 