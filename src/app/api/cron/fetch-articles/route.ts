import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { WHITELISTED_DOMAINS, TITLE_RULES } from '@/config/curation'
import { NewsDataArticle } from '@/types/news'

// The main handler for the cron job request
export async function POST(request: NextRequest) {
  // 1. Authenticate the cron job request
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 })
  }

  try {
    // 2. Fetch recent articles from Newsdata.io
    const newsApiUrl = `https://newsdata.io/api/1/news?apikey=${process.env.NEWSDATA_API_KEY}&q=AI%20OR%20startup%20OR%20technology&language=en&domain=${WHITELISTED_DOMAINS.join(',')}`
    const newsResponse = await fetch(newsApiUrl)
    if (!newsResponse.ok) throw new Error('Failed to fetch from Newsdata.io')
    const newsData = await newsResponse.json()

    const articles = newsData.results || []
    let processedCount = 0

    // Initialize Supabase client
    const supabase = createClient()

    for (const article of articles) {
      // 3. Pre-analysis Filtering & Validation
      if (!isArticleValid(article)) continue

      const { data: existing } = await supabase
        .from('headlines')
        .select('id')
        .eq('url', article.link)
        .single()

      if (existing) continue // Skip if article already exists

      // 4. Insert valid article as a draft into the database
      const { error } = await supabase.from('headlines').insert({
        title: article.title,
        url: article.link,
        source: article.source_id,
        summary: article.description,
        flame_score: 1, // Default score, will be updated by AI analysis
        published_at: article.pubDate,
        category: article.category[0] || 'Other',
        is_published: false,
        moderation_status: 'pending',
        metadata: {
          original_description: article.description,
          original_content: article.content,
          original_categories: article.category
        }
      })

      if (error) {
        console.error('Error inserting headline:', error.message)
      } else {
        processedCount++
      }
    }

    return NextResponse.json({
      message: 'Article ingestion complete.',
      processedCount,
    })

  } catch (error: any) {
    console.error('Cron job failed:', error.message)
    return new Response(`Error: ${error.message}`, { status: 500 })
  }
}

// Helper function to validate articles
function isArticleValid(article: NewsDataArticle): boolean {
  if (!article.title || !article.link || !article.source_id) return false
  
  // Check if source is in whitelist
  const sourceDomain = new URL(article.link).hostname
  if (!WHITELISTED_DOMAINS.some(domain => sourceDomain.includes(domain))) return false

  // Title Rules
  const title = article.title.toLowerCase()
  if (title.length < TITLE_RULES.MIN_LENGTH || title.length > TITLE_RULES.MAX_LENGTH) return false
  if (TITLE_RULES.BLACKLISTED_PHRASES.some(phrase => title.includes(phrase))) return false
  if (TITLE_RULES.BLACKLISTED_PUNCTUATION.some(punc => title.includes(punc))) return false
  
  return true
} 