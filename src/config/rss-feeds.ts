interface RssFeed {
  sourceName: string;
  url: string;
  category?: string;
}

export const RSS_FEED_WHITELIST: RssFeed[] = [
  // Primary AI News & Research
  { sourceName: 'MIT Technology Review AI', url: 'https://www.technologyreview.com/feed/', category: 'AI News' },
  { sourceName: 'AI News', url: 'https://www.artificialintelligence-news.com/feed/', category: 'AI News' },
  { sourceName: 'TechCrunch AI', url: 'https://techcrunch.com/category/artificial-intelligence/feed/', category: 'AI News' },
  { sourceName: 'Towards Data Science', url: 'https://towardsdatascience.com/feed', category: 'AI News' },
  { sourceName: 'Berkeley AI Research', url: 'https://bair.berkeley.edu/blog/feed.xml', category: 'AI News' },
  { sourceName: 'OpenAI Blog', url: 'https://openai.com/blog/rss.xml', category: 'AI News' },
  { sourceName: 'DeepMind Blog', url: 'https://deepmind.com/blog/rss.xml', category: 'AI News' },

  // Company & Product News
  { sourceName: 'Microsoft AI Blog', url: 'https://blogs.microsoft.com/ai/feed/', category: 'Company News' },
  { sourceName: 'Hugging Face Blog', url: 'https://huggingface.co/blog/feed.xml', category: 'Company News' },
  { sourceName: 'GitHub Blog', url: 'https://github.blog/feed/', category: 'Company News' },
  { sourceName: 'Stack Overflow Blog', url: 'https://stackoverflow.blog/feed/', category: 'Company News' },
  { sourceName: 'Tabnine Blog', url: 'https://www.tabnine.com/blog/rss/', category: 'Company News' },

  // Academic & Research
  { sourceName: 'arXiv AI', url: 'http://export.arxiv.org/rss/cs.AI', category: 'Research' },
  { sourceName: 'arXiv Machine Learning', url: 'http://export.arxiv.org/rss/cs.LG', category: 'Research' },
  { sourceName: 'arXiv Computer Vision', url: 'http://export.arxiv.org/rss/cs.CV', category: 'Research' },
  { sourceName: 'arXiv NLP', url: 'http://export.arxiv.org/rss/cs.CL', category: 'Research' },
  { sourceName: 'Distill.pub', url: 'https://distill.pub/rss.xml', category: 'Research' },

  // Industry & Business
  { sourceName: 'AI Business', url: 'https://aibusiness.com/rss.xml', category: 'Business' },
  { sourceName: 'Bloomberg AI', url: 'https://feeds.bloomberg.com/technology/news.rss', category: 'Business' },
  { sourceName: 'Dev.to AI', url: 'https://dev.to/feed/tag/ai', category: 'Business' },

  // Technical Communities
  { sourceName: 'MLOps Community', url: 'https://mlops.community/feed/', category: 'Community' },
  { sourceName: 'KDnuggets', url: 'https://www.kdnuggets.com/feed', category: 'Community' },
  { sourceName: 'Machine Learning Mastery', url: 'https://machinelearningmastery.com/feed/', category: 'Community' },

  // AI Policy & Ethics
  { sourceName: 'Partnership on AI', url: 'https://www.partnershiponai.org/feed/', category: 'Policy' },
  { sourceName: 'AI Ethics', url: 'https://aiethics.princeton.edu/feed/', category: 'Policy' },

  // Video/Podcast RSS Feeds
  { sourceName: 'Lex Fridman Podcast', url: 'https://lexfridman.com/feed/podcast/', category: 'Media' },
  { sourceName: 'Practical AI', url: 'https://changelog.com/practicalai/feed', category: 'Media' }
]; 