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
const TEST_MODE = process.env.NODE_ENV === 'development';
const MAX_ARTICLES = process.env.NODE_ENV === 'development' ? 15 : 100; // Higher limit for production

// Keyword categories with weights for scoring
const KEYWORD_CATEGORIES = {
  // Primary AI Industry Keywords (weight: 3)
  primaryAI: [
    'artificial intelligence', 'AI', 'machine learning', 'deep learning',
    'neural networks', 'LLM', 'large language models', 'generative AI',
    'computer vision', 'reinforcement learning', 'NLP', 'natural language processing',
    'AGI', 'artificial general intelligence', 'foundation models', 'transformer models',
    'diffusion models', 'autoregressive models', 'attention mechanisms',
    'neural architecture search', 'federated learning', 'transfer learning',
    'few-shot learning', 'zero-shot learning', 'in-context learning',
    'multimodal AI', 'vision-language models', 'text-to-image', 'text-to-video',
    'speech recognition', 'speech synthesis', 'robotics AI', 'autonomous systems'
  ],
  
  // Tech Company & Model-Specific Keywords (weight: 4)
  companies: [
    'OpenAI', 'ChatGPT', 'GPT-4', 'GPT-5', 'GPT-4o', 'o1', 'o3', 'DALL-E',
    'Claude', 'Anthropic', 'Claude 3', 'Claude 4', 'Constitutional AI',
    'Gemini', 'Bard', 'PaLM', 'LaMDA', 'Flamingo', 'Sparrow',
    'DeepMind', 'Google AI', 'Google Brain', 'Vertex AI',
    'Meta AI', 'LLaMA', 'LLaMA 2', 'LLaMA 3', 'Make-A-Video', 'BlenderBot',
    'xAI', 'Grok', 'Elon Musk',
    'Microsoft', 'Copilot', 'Azure OpenAI', 'Bing Chat',
    'Amazon', 'Alexa', 'Bedrock', 'CodeWhisperer', 'Titan',
    'Inflection AI', 'Pi', 'Inflection-2.5',
    'Mistral AI', 'Mixtral', 'Codestral',
    'Stability AI', 'Stable Diffusion', 'SDXL',
    'Midjourney', 'RunwayML', 'Pika Labs',
    'Hugging Face', 'Transformers', 'Datasets',
    'Cohere', 'Command', 'Embed',
    'AI21 Labs', 'Jurassic', 'Wordtune',
    'Character.AI', 'Replika', 'Jasper',
    'Scale AI', 'Databricks', 'MLflow',
    'NVIDIA', 'Omniverse', 'NeMo', 'TensorRT-LLM',
    'Intel', 'Habana Labs', 'Gaudi',
    'AMD', 'ROCm', 'Instinct',
    'Cerebras', 'Wafer Scale Engine',
    'SambaNova', 'DataFlow',
    'Graphcore', 'IPU', 'Poplar'
  ],
  
  // Emerging Companies & Startups (weight: 3)
  startups: [
    'Perplexity', 'You.com', 'Phind',
    'Harvey', 'Casetext', 'DoNotPay',
    'Adept', 'ACT-1', 'Rabbit', 'R1',
    'Eleven Labs', 'Murf', 'Synthesia',
    'Runway', 'Pika', 'Luma AI',
    'Magic', 'Tabnine', 'GitHub Copilot',
    'Replit', 'Ghostwriter', 'Cursor',
    'Notion AI', 'Gamma', 'Tome',
    'Otter.ai', 'Fireflies', 'Grain',
    'Loom', 'Descript', 'Resemble',
    'Copy.ai', 'Writesonic', 'Grammarly'
  ],
  
  // Industry Movement & Commercial Trends (weight: 2)
  industry: [
    'AI regulation', 'AI policy', 'AI ethics', 'AI investment', 'AI funding',
    'AI startups', 'AI acquisition', 'AI merger', 'AI strategy', 'AI layoffs', 'AI hiring',
    'AI IPO', 'VC funding', 'AI in enterprise', 'AI transformation',
    'AI winter', 'AI summer', 'AI bubble', 'AI hype cycle',
    'AI-first company', 'AI native', 'AI adoption', 'AI integration',
    'AI ROI', 'AI productivity', 'AI automation', 'job displacement',
    'AI skills gap', 'AI talent', 'AI recruiting', 'AI consulting',
    'AI as a service', 'AIaaS', 'MLaaS', 'API economy',
    'edge computing', 'cloud AI', 'AI infrastructure',
    'model deployment', 'MLOps', 'AI governance'
  ],
  
  // Technology Stack Keywords (weight: 2)
  techStack: [
    'AI chips', 'GPUs', 'TPUs', 'NPUs', 'ASIC', 'FPGA',
    'CUDA', 'ROCm', 'OpenCL', 'TensorRT', 'ONNX',
    'PyTorch', 'TensorFlow', 'JAX', 'Flax', 'Keras',
    'Transformers', 'Diffusers', 'LangChain', 'LlamaIndex',
    'model compression', 'quantization', 'pruning', 'distillation',
    'fine-tuning', 'PEFT', 'LoRA', 'QLoRA', 'adapters',
    'open-source models', 'closed-source models', 'model weights',
    'inference', 'serving', 'batching', 'caching',
    'multimodal', 'cross-modal', 'vision-language',
    'edge AI', 'mobile AI', 'on-device inference',
    'RLHF', 'Constitutional AI', 'DPO', 'PPO',
    'vector database', 'Pinecone', 'Weaviate', 'Chroma',
    'retrieval augmented generation', 'RAG', 'knowledge graphs',
    'embeddings', 'sentence transformers', 'semantic search',
    'prompt engineering', 'prompt injection', 'jailbreaking',
    'agentic workflows', 'AI agents', 'tool use', 'function calling',
    'context length', 'context window', 'memory mechanisms',
    'hallucination detection', 'factual grounding', 'citations'
  ],
  
  // Policy, Ethics, and Public Impact (weight: 2)
  policy: [
    'AI bias', 'algorithmic bias', 'fairness', 'algorithmic fairness',
    'AI hallucination', 'AI transparency', 'explainable AI', 'XAI',
    'AI accountability', 'AI liability', 'AI responsibility',
    'surveillance', 'facial recognition', 'biometric identification',
    'misinformation', 'disinformation', 'deepfakes', 'synthetic media',
    'AI safety', 'AI alignment', 'AI risk', 'existential risk',
    'AI governance', 'AI oversight', 'AI auditing',
    'open-source', 'closed-source', 'model cards', 'AI documentation',
    'privacy', 'data protection', 'GDPR', 'AI Act',
    'algorithmic impact assessment', 'AI impact assessment',
    'human oversight', 'human-in-the-loop', 'human-AI collaboration',
    'AI rights', 'digital rights', 'algorithmic justice'
  ],
  
  // Geopolitics & National Security (weight: 3)
  geopolitics: [
    'AI arms race', 'AI warfare', 'autonomous weapons', 'lethal autonomous weapons',
    'military AI', 'defense AI', 'DARPA', 'DIU', 'CDAO',
    'China AI', 'US-China AI competition', 'tech decoupling',
    'AI sanctions', 'chip export restrictions', 'semiconductor controls',
    'AI cold war', 'technological sovereignty', 'AI supply chain',
    'national AI strategy', 'AI competitiveness', 'AI leadership',
    'dual-use technology', 'export controls', 'foreign investment screening',
    'AI espionage', 'intellectual property theft', 'technology transfer',
    'critical infrastructure', 'cybersecurity AI', 'AI vulnerabilities'
  ],

  // Academic & Research Keywords (weight: 2)
  research: [
    'NeurIPS', 'ICML', 'ICLR', 'AAAI', 'IJCAI', 'ACL', 'EMNLP',
    'arXiv', 'research paper', 'peer review', 'reproducibility',
    'benchmark', 'evaluation', 'leaderboard', 'GLUE', 'SuperGLUE',
    'HELM', 'BIG-bench', 'MMLU', 'HumanEval', 'GSM8K',
    'scaling laws', 'emergent abilities', 'phase transitions',
    'in-context learning', 'chain-of-thought', 'reasoning',
    'alignment research', 'interpretability', 'mechanistic interpretability',
    'AI safety research', 'robustness', 'adversarial examples',
    'uncertainty quantification', 'calibration', 'out-of-distribution'
  ],

  // Application Domains (weight: 2)
  applications: [
    'healthcare AI', 'medical AI', 'drug discovery', 'radiology AI',
    'fintech AI', 'algorithmic trading', 'fraud detection', 'robo-advisors',
    'legal AI', 'legal tech', 'contract analysis', 'e-discovery',
    'education AI', 'edtech', 'personalized learning', 'tutoring AI',
    'autonomous vehicles', 'self-driving cars', 'ADAS', 'robotics',
    'manufacturing AI', 'industrial AI', 'predictive maintenance',
    'retail AI', 'recommendation systems', 'personalization',
    'content creation', 'creative AI', 'AI art', 'AI music',
    'customer service AI', 'chatbots', 'virtual assistants',
    'search AI', 'information retrieval', 'knowledge management',
    'cybersecurity AI', 'threat detection', 'anomaly detection',
    'climate AI', 'sustainability AI', 'smart cities', 'IoT AI'
  ],

  // Market & Financial Keywords (weight: 2)
  finance: [
    'AI market size', 'AI revenue', 'AI valuation', 'AI unicorn',
    'AI venture capital', 'AI private equity', 'AI public markets',
    'AI stock performance', 'AI ETF', 'AI index',
    'compute costs', 'training costs', 'inference costs',
    'GPU shortage', 'chip shortage', 'semiconductor supply',
    'AI licensing', 'API pricing', 'subscription models',
    'freemium AI', 'enterprise AI pricing', 'usage-based pricing'
  ],

  // Talent & Workforce Keywords (weight: 2)
  talent: [
    'AI engineer', 'ML engineer', 'data scientist', 'AI researcher',
    'prompt engineer', 'AI trainer', 'AI safety engineer',
    'AI product manager', 'AI ethics officer', 'AI governance',
    'AI talent shortage', 'AI skills', 'AI education', 'AI bootcamp',
    'AI certification', 'upskilling', 'reskilling', 'AI literacy',
    'remote AI work', 'AI freelancing', 'AI consulting',
    'AI hiring trends', 'AI salary', 'AI compensation'
  ],

  // Vibe Coding & AI-Assisted Development (weight: 3)
  vibeCoding: [
    'vibe coding', 'vibes-based programming', 'intuitive coding',
    'AI-assisted coding', 'pair programming with AI', 'AI code generation',
    'conversational programming', 'natural language programming',
    'code completion', 'intelligent autocomplete', 'contextual suggestions',
    'AI code review', 'automated refactoring', 'code optimization',
    'GitHub Copilot', 'CodeT5', 'CodeGen', 'InCoder', 'SantaCoder',
    'Tabnine', 'Kite', 'DeepCode', 'Sourcery', 'Amazon CodeGuru',
    'Replit Ghostwriter', 'Cursor IDE', 'Continue', 'Codeium',
    'programming productivity', 'developer experience', 'DX',
    'low-code', 'no-code', 'visual programming', 'drag-and-drop development',
    'prompt-driven development', 'specification programming',
    'AI debugging', 'error explanation', 'stack overflow alternative',
    'code documentation generation', 'README generation',
    'test generation', 'automated testing', 'AI QA'
  ],

  // AI Business Models & Monetization (weight: 3)
  businessModels: [
    'AI-first business', 'AI-native company', 'AI transformation',
    'AI wrapper', 'thin wrapper', 'AI aggregator', 'AI middleware',
    'AI infrastructure play', 'picks and shovels', 'AI tooling',
    'freemium AI', 'usage-based pricing', 'token-based pricing',
    'compute arbitrage', 'API reselling', 'white-label AI',
    'AI consulting', 'AI implementation services', 'AI training services',
    'AI-powered SaaS', 'vertical AI', 'horizontal AI platform',
    'AI marketplace', 'model marketplace', 'AI app store',
    'subscription AI', 'enterprise AI licensing', 'seat-based pricing',
    'AI revenue model', 'AI unit economics', 'AI customer acquisition',
    'AI moat', 'defensible AI business', 'network effects',
    'data moat', 'proprietary data', 'data flywheel',
    'AI competitive advantage', 'AI differentiation',
    'build vs buy AI', 'make vs buy decision',
    'AI vendor selection', 'AI procurement', 'AI RFP'
  ],

  // Indie Hackers & Solo AI Builders (weight: 2)
  indieAI: [
    'indie hacker AI', 'solo AI builder', 'one-person AI startup',
    'AI side project', 'weekend AI project', 'micro AI startup',
    'AI MVP', 'AI prototype', 'AI proof of concept',
    'ProductHunt AI', 'Indie Hackers AI', 'Hacker News AI',
    'AI builder community', 'AI maker', 'solo founder AI',
    'bootstrapped AI', 'self-funded AI', 'ramen profitable AI',
    'AI lifestyle business', 'AI passion project',
    'Twitter AI builder', 'AI influencer', 'AI content creator',
    'AI newsletter', 'AI blog', 'AI course creator',
    'no-code AI tools', 'drag-and-drop AI', 'citizen developer',
    'AI automation', 'workflow automation', 'Zapier AI integration',
    'AI Chrome extension', 'browser AI', 'AI bookmarklet'
  ],

  // AI Development Culture & Community (weight: 2)
  culture: [
    'AI Twitter', 'AI influencer', 'AI thought leader',
    'AI memes', 'AI jokes', 'AI humor', 'AI culture',
    'ship fast AI', 'move fast and break things',
    'AI demo day', 'AI showcase', 'AI hackathon',
    'AI meetup', 'AI conference', 'AI workshop',
    'open source AI', 'AI collaboration', 'AI community',
    'AI Discord', 'AI Slack', 'AI Reddit', 'r/MachineLearning',
    'AI YouTube', 'AI TikTok', 'AI LinkedIn',
    'AI podcast', 'AI interview', 'AI debate',
    'AGI timeline', 'AI predictions', 'AI speculation',
    'AI doomer', 'AI optimist', 'AI accelerationist',
    'e/acc', 'effective accelerationism', 'AI safety vs progress',
    'AI art controversy', 'AI copyright debate',
    'AI replacing jobs', 'AI augmenting humans'
  ],

  // Coding Tools & Platforms (weight: 2)
  codingTools: [
    'VSCode AI', 'JetBrains AI', 'Vim AI', 'Emacs AI',
    'cloud IDE', 'browser-based coding', 'collaborative coding',
    'Replit', 'CodeSandbox', 'Gitpod', 'GitHub Codespaces',
    'AI terminal', 'command line AI', 'shell AI',
    'Warp terminal', 'Fig autocomplete', 'AI bash completion',
    'code search', 'semantic code search', 'natural language queries',
    'Sourcegraph', 'GitHub search', 'grep alternative',
    'AI code explanation', 'code understanding', 'legacy code analysis',
    'documentation AI', 'API documentation', 'code comments',
    'commit message generation', 'git AI', 'version control AI',
    'pull request AI', 'code review automation',
    'deployment AI', 'DevOps AI', 'infrastructure as code'
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
        category: analysis.category,
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

  // Default to 7 days ago for cutoff date
  const cutoffDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  console.log(`Fetching articles newer than: ${cutoffDate.toISOString()}`);

  for (const feed of RSS_FEED_WHITELIST) {
    try {
      console.log(`Fetching from RSS feed: ${feed.sourceName}`);
      const parsedFeed = await rssParser.parseURL(feed.url);
      const feedArticles = parsedFeed.items
        .filter(item => {
          if (!item.title || !item.link) return false;
          if (!item.pubDate) return true; // Include if no date (better to include than exclude)
          const pubDate = new Date(item.pubDate);
          const now = new Date();
          // Reject future dates and accept dates within the last 7 days
          return pubDate <= now && pubDate > cutoffDate;
        })
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
    // Default to 7 days ago for cutoff date
    const cutoffDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    // Build query using primary keywords and companies
    const primaryKeywords = [...KEYWORD_CATEGORIES.primaryAI, ...KEYWORD_CATEGORIES.companies];
    const query = primaryKeywords.map(k => encodeURIComponent(k)).join(' OR ');
    
    console.log('Fetching from NewsData.io with query:', query);
    const response = await fetch(
      `https://newsdata.io/api/1/news?apikey=${process.env.NEWSDATA_API_KEY}&q=${query}&language=en&category=technology,science&from_date=${cutoffDate.toISOString().split('T')[0]}`
    );
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to fetch from Newsdata.io: ${response.status} ${response.statusText} - ${errorText}`);
    }
    
    const data = await response.json();
    const articles = (data.results || [])
      .filter((article: any) => {
        if (!article.title || !article.link) return false;
        if (!article.pubDate) return true; // Include if no date
        const pubDate = new Date(article.pubDate);
        const now = new Date();
        // Reject future dates and accept dates within the last 7 days
        return pubDate <= now && pubDate > cutoffDate;
      })
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
  console.log(`Found ${existingUrls.size} existing articles in database`);
  console.log('Existing URLs:', Array.from(existingUrls));

  let duplicateInBatch = 0;
  let duplicateInDb = 0;

  // Log the first few articles we're processing
  console.log('\nFirst 5 articles to process:');
  articles.slice(0, 5).forEach(article => {
    console.log(`Title: ${article.title}`);
    console.log(`Original URL: ${article.url}`);
    console.log(`Normalized URL: ${normalizeUrl(article.url)}`);
    console.log('---');
  });

  for (const article of articles) {
    const normalized = normalizeUrl(article.url);
    if (uniqueUrls.has(normalized)) {
      duplicateInBatch++;
      continue;
    }
    if (existingUrls.has(normalized)) {
      duplicateInDb++;
      continue;
    }
    uniqueUrls.add(normalized);
    uniqueArticles.push(article);
  }

  console.log(`\nDeduplication results:
    - Total articles processed: ${articles.length}
    - Duplicates in current batch: ${duplicateInBatch}
    - Duplicates in database: ${duplicateInDb}
    - Unique articles found: ${uniqueArticles.length}
  `);

  // Log the unique articles we found
  if (uniqueArticles.length > 0) {
    console.log('\nUnique articles found:');
    uniqueArticles.forEach(article => {
      console.log(`Title: ${article.title}`);
      console.log(`URL: ${article.url}`);
      console.log('---');
    });
  }

  return uniqueArticles;
}

export async function analyzeArticle(title: string, contentSnippet?: string) {
  try {
    const baseScore = calculateArticleScore(`${title} ${contentSnippet || ''}`);
    
    const prompt = `Analyze this news headline and snippet for a tech news aggregator:
      Title: "${title}"
      Snippet: "${contentSnippet || 'N/A'}"
      Base score: ${baseScore}
      Please provide:
      1. A concise 1-2 sentence summary (max 120 characters)
      2. A hype score from 1-5 (1: minor, 3: notable, 5: major news)
      3. A category from this list: Model Releases, Funding, Regulation, Research, Drama, Other
      Consider the base score but adjust based on the content's significance.
      Respond in JSON format: {"summary": "...", "hype_score": number, "category": "..."}`;

    console.log(`Analyzing article: "${title}"`);
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
      temperature: 0.3,
    });
    
    const content = response.choices[0]?.message?.content;
    if (!content) {
      console.error('No content in AI response');
      return null;
    }

    const analysis = JSON.parse(content);
    console.log('AI Analysis:', {
      summary: analysis.summary,
      hype_score: analysis.hype_score,
      category: analysis.category
    });

    // Validate category
    const validCategories = ['Model Releases', 'Funding', 'Regulation', 'Research', 'Drama', 'Other'];
    if (!validCategories.includes(analysis.category)) {
      console.warn(`Invalid category "${analysis.category}" for article "${title}", defaulting to "Other"`);
      analysis.category = 'Other';
    }

    return analysis;
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
      .from('headlines')
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
      if (!analysis) {
        console.warn(`No analysis returned for "${article.title}", using defaults`);
        analysis = {
          summary: article.title,
          hype_score: 3,
          category: 'Other'
        };
      }
    } catch (error: any) {
      if (error.code === 'insufficient_quota') {
        console.log('OpenAI quota exceeded, storing article without analysis');
        analysis = {
          summary: article.title,
          hype_score: 3,
          category: 'Other'
        };
      } else {
        console.error(`Analysis failed for "${article.title}":`, error);
        return;
      }
    }

    // Log what we're about to insert
    console.log('Inserting article with data:', {
      title: article.title,
      category: analysis.category,
      flame_score: analysis.hype_score,
      summary: analysis.summary
    });

    // Insert into database
    const { error: insertError } = await supabase.from('headlines').insert({
      title: article.title,
      url: article.url,
      source: article.source,
      published_at: article.publishedAt,
      summary: analysis.summary,
      flame_score: analysis.hype_score,
      category: analysis.category,
      is_published: false,
      draft: true,
      published: false,
      ai_summary: true,
      metadata: {
        original_description: article.contentSnippet || '',
        original_categories: []
      }
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