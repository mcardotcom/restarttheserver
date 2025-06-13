import { NextResponse } from 'next/server'
import { fetchNewsFromNewsData } from '@/lib/news/newsdata'
import { createClient } from '@/lib/supabase/server'
import { NewsDataArticle } from '@/types/news'

export const runtime = 'edge'
export const revalidate = 3600 // Revalidate every hour

export async function GET() {
  try {
    // Fetch news from Newsdata.io
    const newsData = await fetchNewsFromNewsData()
    
    // Initialize Supabase client
    const supabase = createClient()
    
    // Process and store each article
    const processedArticles = newsData.results.map((article: NewsDataArticle) => ({
      title: article.title,
      url: article.link,
      source: article.source_id,
      summary: article.description,
      flame_score: 1, // Default score, will be updated by AI analysis
      published_at: article.pubDate,
      category: article.category[0] || 'Other',
      is_published: false,
      metadata: {
        original_description: article.description,
        original_content: article.content,
        original_categories: article.category
      }
    }))

    // Store articles in Supabase
    const { data, error } = await supabase
      .from('headlines')
      .insert(processedArticles)
      .select()

    if (error) {
      console.error('Error storing articles:', error)
      return NextResponse.json(
        { error: 'Failed to store articles' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'Articles fetched and stored successfully',
      count: data.length
    })
  } catch (error) {
    console.error('Error fetching news:', error)
    return NextResponse.json(
      { error: 'Failed to fetch news' },
      { status: 500 }
    )
  }
} 