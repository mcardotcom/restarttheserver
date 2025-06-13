/**
 * A whitelist of approved source domains. The ingestion script will only
 * process articles from these sources.
 */
export const WHITELISTED_DOMAINS: string[] = [
  // AI & Tech News
  'techcrunch.com', 'venturebeat.com', 'wired.com', 'theverge.com',
  'arstechnica.com', 'technologyreview.com', 'spectrum.ieee.org',

  // Company & Research Blogs
  'openai.com', 'anthropic.com', 'ai.meta.com', 'deepmind.google',
  'blogs.microsoft.com', 'blogs.nvidia.com', 'huggingface.co',
  'arxiv.org', 'nature.com', 'neurips.cc',

  // VC & Startup
  'a16z.com', 'sequoiacap.com', 'ycombinator.com',

  // Mainstream Tech
  'nytimes.com', 'bloomberg.com', 'cnbc.com',
]

/**
 * Heuristic rules to filter out low-quality or clickbait titles before
 * they are sent to the AI for analysis.
 */
export const TITLE_RULES = {
  MIN_LENGTH: 20,
  MAX_LENGTH: 120,
  BLACKLISTED_PHRASES: [
    "you won't believe", "here's why", 'this one weird trick',
    'shocking', 'must-see',
  ],
  BLACKLISTED_PUNCTUATION: ['!!!', '???'],
} 