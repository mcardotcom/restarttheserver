import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';
import Parser from 'rss-parser';
import { RSS_FEED_WHITELIST } from '@/config/rss-feeds';
import { normalizeUrl } from '@/lib/utils';

// --- INITIALIZE CLIENTS ---
// Validate required environment variables
const requiredEnvVars = {
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  CRON_SECRET: process.env.CRON_SECRET,
  NEWSDATA_API_KEY: process.env.NEWSDATA_API_KEY
};

// Log environment variable status
console.log('Environment Variables Status:');
Object.entries(requiredEnvVars).forEach(([key, value]) => {
  if (!value) {
    console.error(`Missing required environment variable: ${key}`);
  } else {
    // For API keys, only log the first 5 and last 4 characters
    if (key.includes('API_KEY') || key.includes('SECRET')) {
      const masked = `${value.substring(0, 5)}...${value.substring(value.length - 4)}`;
      console.log(`${key}: ${masked}`);
    } else {
      console.log(`${key}: [present]`);
    }
  }
});

// Initialize clients only if all required variables are present
if (Object.values(requiredEnvVars).some(v => !v)) {
  throw new Error('Missing required environment variables. Check logs for details.');
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const rssParser = new Parser();

// --- TYPE DEFINITIONS ---
interface NormalizedArticle {
  title: string;
  url: string;
  source: string;
  publishedAt: string | null;
  contentSnippet?: string;
}

interface RssItem {
  title?: string;
  link?: string;
  pubDate?: string;
  contentSnippet?: string;
}

// Add these constants at the top with other constants
const TEST_MODE = true; // Set to false in production
const MAX_ARTICLES = 15; // Limit for testing

// Keyword categories with weights for scoring
const KEYWORD_CATEGORIES = {
  // Primary AI Industry Keywords (weight: 3)
  primaryAI: [
    'artificial intelligence', 'AI', 'machine learning', 'deep learning',
    'neural networks', 'LLM', 'large language models', 'generative AI',
    'computer vision', 'reinforcement learning', 'NLP', 'natural language processing',
    'AGI', 'artificial general intelligence'
  ],
  
  // Tech Company & Model-Specific Keywords (weight: 4)
  companies: [
    'OpenAI', 'ChatGPT', 'GPT-4', 'GPT-5', 'Claude', 'Anthropic', 'Gemini',
    'DeepMind', 'Google AI', 'Meta AI', 'LLaMA', 'xAI', 'Elon Musk',
    'Inflection AI', 'Mistral', 'Stability AI', 'Hugging Face'
  ],
  
  // Industry Movement & Commercial Trends (weight: 2)
  industry: [
    'AI regulation', 'AI policy', 'AI ethics', 'AI investment', 'AI funding',
    'AI startups', 'AI acquisition', 'AI strategy', 'AI layoffs', 'AI hiring',
    'AI IPO', 'VC funding', 'AI in enterprise'
  ],
  
  // Technology Stack Keywords (weight: 2)
  techStack: [
    'AI chips', 'GPUs', 'CUDA', 'TensorRT', 'model compression', 'fine-tuning',
    'open-source models', 'inference', 'multimodal', 'edge AI', 'RLHF',
    'vector database', 'retrieval augmented generation', 'embeddings',
    'prompt engineering', 'agentic workflows'
  ],
  
  // Policy, Ethics, and Public Impact (weight: 2)
  policy: [
    'AI bias', 'algorithmic fairness', 'AI hallucination', 'AI transparency',
    'surveillance', 'misinformation', 'AI safety', 'open-source', 'closed-source'
  ],
  
  // Geopolitics & National Security (weight: 3)
  geopolitics: [
    'AI arms race', 'AI warfare', 'military AI', 'DARPA', 'DIU', 'CDAO',
    'China AI', 'AI sanctions', 'chip export restrictions', 'AI cold war'
  ],
  
  // Acronyms (weight: 2)
  acronyms: [
    'ML', 'DL', 'NLP', 'CV', 'RL', 'RLHF', 'AGI', 'ASI', 'MoE', 'RAG',
    'API', 'GPU', 'TPU', 'SDK', 'IDE', 'UI/UX', 'CLI', 'ORM', 'ETL',
    'CI/CD', 'NNS', 'LoRA', 'PEFT', 'DPO', 'SFT', 'HF', 'ONNX', 'GGUF',
    'SaaS', 'PaaS', 'MLOps', 'AIOps', 'VPC', 'K8s', 'E2E', 'CDN',
    'VC', 'IPO', 'M&A', 'ARR', 'CAC', 'LTV', 'AI Act', 'CCPA', 'GDPR',
    'NSF', 'SBIR'
  ]
};

// Helper function to calculate article score based on keyword matches
function calculateArticleScore(text: string): number {
  let score = 0;
  const lowerText = text.toLowerCase();
  
  // Check each category and add weighted scores
  for (const [category, keywords] of Object.entries(KEYWORD_CATEGORIES)) {
    const weight = category === 'primaryAI' ? 3 :
                  category === 'companies' ? 4 :
                  category === 'geopolitics' ? 3 : 2;
    
    const matches = keywords.filter(keyword => 
      lowerText.includes(keyword.toLowerCase())
    ).length;
    
    score += matches * weight;
  }
  
  // Normalize score to 1-5 range
  return Math.min(5, Math.max(1, Math.ceil(score / 3)));
}

// --- MAIN HANDLER ---
export async function POST(request: NextRequest) {
  // 1. Authenticate the cron job request
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    console.error('Unauthorized request attempt');
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    console.log('Starting hybrid article ingestion process...');
    console.log('Test mode:', TEST_MODE ? 'ON' : 'OFF');
    if (TEST_MODE) {
      console.log(`Article limit: ${MAX_ARTICLES}`);
    }

    const [rssArticles, newsDataArticles] = await Promise.all([
      fetchFromRssFeeds(),
      fetchFromNewsDataApi(),
    ]);

    const allArticles = [...rssArticles, ...newsDataArticles];
    console.log(`Total articles before deduplication: ${allArticles.length}`);

    // Apply test mode limit if enabled
    const limitedArticles = TEST_MODE 
      ? allArticles.slice(0, MAX_ARTICLES)
      : allArticles;

    if (TEST_MODE && allArticles.length > MAX_ARTICLES) {
      console.log(`Test mode: limiting to ${MAX_ARTICLES} articles`);
    }

    // 3. De-duplicate articles based on URL
    const uniqueArticles = await getUniqueArticles(limitedArticles);
    console.log(`Found ${uniqueArticles.length} unique articles to process`);

    let processedCount = 0;
    let errorCount = 0;
    
    for (const article of uniqueArticles) {
      console.log(`Processing article: ${article.title}`);
      
      // 4. AI Analysis for Summary & Score
      const analysis = await analyzeArticle(article.title, article.contentSnippet);
      if (!analysis) {
        console.log(`Skipping article due to failed analysis: ${article.title}`);
        continue;
      }

      // 5. Insert valid article as a draft into the database
      const { error } = await supabase.from('headlines').insert({
        title: article.title,
        url: article.url,
        source: article.source,
        summary: analysis.summary,
        flame_score: analysis.hype_score,
        published_at: article.publishedAt,
        moderation_status: 'pending',
        is_published: false,
        draft: true,
        published: false,
        ai_summary: true,
      });

      if (error) {
        console.error(`Error inserting article "${article.title}":`, error.message);
        errorCount++;
      } else {
        console.log(`Successfully processed article: ${article.title}`);
        processedCount++;
      }
    }

    return NextResponse.json({
      message: 'Hybrid article ingestion complete.',
      processedCount,
      errorCount,
      totalArticles: allArticles.length,
      uniqueArticles: uniqueArticles.length,
    });
  } catch (error: any) {
    console.error('Cron job failed:', error.message);
    return new Response(`Error: ${error.message}`, { status: 500 });
  }
}

// --- HELPER FUNCTIONS ---

async function fetchFromRssFeeds(): Promise<NormalizedArticle[]> {
  let articles: NormalizedArticle[] = [];
  for (const feed of RSS_FEED_WHITELIST) {
    try {
      console.log(`Fetching from RSS feed: ${feed.sourceName}`);
      const parsedFeed = await rssParser.parseURL(feed.url);
      const feedArticles = parsedFeed.items
        .filter(item => item.title && item.link)
        .map(item => ({
          title: item.title!,
          url: item.link!,
          source: feed.sourceName,
          publishedAt: item.pubDate ? new Date(item.pubDate).toISOString() : null,
          contentSnippet: item.contentSnippet,
        }));

      // Score and filter articles
      const scoredArticles = feedArticles
        .map(article => ({
          ...article,
          score: calculateArticleScore(`${article.title} ${article.contentSnippet || ''}`)
        }))
        .filter(article => article.score >= 2); // Only keep articles with score >= 2

      console.log(`${feed.sourceName}: ${feedArticles.length} articles, ${scoredArticles.length} matched our criteria`);
      articles = [...articles, ...scoredArticles];
    } catch (error: any) {
      console.error(`Failed to fetch RSS feed from ${feed.sourceName}:`, error.message);
    }
  }
  return articles;
}

async function fetchFromNewsDataApi(): Promise<NormalizedArticle[]> {
  try {
    // Build query using primary keywords and companies
    const primaryKeywords = [...KEYWORD_CATEGORIES.primaryAI, ...KEYWORD_CATEGORIES.companies];
    const query = primaryKeywords.map(k => encodeURIComponent(k)).join(' OR ');
    
    console.log('Fetching from NewsData.io with query:', query);
    const response = await fetch(`https://newsdata.io/api/1/news?apikey=${process.env.NEWSDATA_API_KEY}&q=${query}&language=en&category=technology,science`);
    
    if (!response.ok) throw new Error('Failed to fetch from Newsdata.io');
    
    const data = await response.json();
    const articles = (data.results || [])
      .filter((article: any) => article.title && article.link)
      .map((article: any) => ({
        title: article.title,
        url: article.link,
        source: article.source_id || 'NewsData.io',
        publishedAt: article.pubDate ? new Date(article.pubDate).toISOString() : null,
        contentSnippet: article.description,
      }));

    // Filter and score articles
    const scoredArticles = articles
      .map((article: NormalizedArticle) => ({
        ...article,
        score: calculateArticleScore(`${article.title} ${article.contentSnippet || ''}`)
      }))
      .filter((article: NormalizedArticle & { score: number }) => article.score >= 2);

    console.log(`NewsData.io returned ${articles.length} articles, ${scoredArticles.length} matched our criteria`);
    return scoredArticles;
  } catch (error: any) {
    console.error('Failed to fetch from NewsData API:', error.message);
    return [];
  }
}

async function getUniqueArticles(articles: NormalizedArticle[]): Promise<NormalizedArticle[]> {
  const uniqueUrls = new Set<string>();
  const uniqueArticles: NormalizedArticle[] = [];
  
  // Get all existing URLs from DB in one query for efficiency
  const { data: existingHeadlines, error } = await supabase
    .from('headlines')
    .select('url');
  if (error) {
    console.error("Could not fetch existing URLs for deduplication:", error);
    return []; // Fail safely
  }
  const existingUrls = new Set(existingHeadlines.map(h => normalizeUrl(h.url)));

  for (const article of articles) {
    const normalized = normalizeUrl(article.url);
    // Check against both the current batch and the database
    if (!uniqueUrls.has(normalized) && !existingUrls.has(normalized)) {
      uniqueUrls.add(normalized);
      uniqueArticles.push(article);
    }
  }
  return uniqueArticles;
}

async function analyzeArticle(title: string, contentSnippet?: string) {
  try {
    const baseScore = calculateArticleScore(`${title} ${contentSnippet || ''}`);
    
    const prompt = `Analyze this news headline and snippet for a tech news aggregator:
      Title: "${title}"
      Snippet: "${contentSnippet || 'N/A'}"
      Base score: ${baseScore}
      Please provide:
      1. A concise 1-2 sentence summary (max 120 characters)
      2. A hype score from 1-5 (1: minor, 3: notable, 5: major news)
      Consider the base score but adjust based on the content's significance.
      Respond in JSON format: {"summary": "...", "hype_score": number}`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
      temperature: 0.3,
    });
    
    const content = response.choices[0]?.message?.content;
    return content ? JSON.parse(content) : null;
  } catch (error: any) {
    console.error(`Analysis failed for "${title}":`, error.message);
    return null;
  }
}

async function processArticle(article: NormalizedArticle) {
  try {
    console.log(`Processing article: ${article.title}`);
    
    // Check if article already exists
    const { data: existing } = await supabase
      .from('articles')
      .select('id')
      .eq('url', article.url)
      .single();

    if (existing) {
      console.log(`Skipping duplicate article: ${article.title}`);
      return;
    }

    // Get article analysis
    let analysis = null;
    try {
      analysis = await analyzeArticle(article.title, article.contentSnippet);
    } catch (error: any) {
      if (error.code === 'insufficient_quota') {
        console.log('OpenAI quota exceeded, storing article without analysis');
      } else {
        console.error(`Analysis failed for "${article.title}":`, error);
        return;
      }
    }

    // Insert into database
    const { error: insertError } = await supabase.from('articles').insert({
      title: article.title,
      url: article.url,
      source: article.source,
      published_at: article.publishedAt,
      content: article.contentSnippet,
      summary: analysis?.summary || article.title,
      flame_score: analysis?.hype_score || 3,
      status: 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    if (insertError) {
      console.error(`Database error for "${article.title}":`, insertError);
      throw insertError;
    }

    console.log(`Successfully processed article: ${article.title}`);
  } catch (error) {
    console.error(`Error processing article "${article.title}":`, error);
    throw error;
  }
} 