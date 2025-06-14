interface RssFeed {
  sourceName: string;
  url: string;
  category?: string;
}

export const RSS_FEED_WHITELIST: RssFeed[] = [
  // AI & ML Companies
  { sourceName: 'OpenAI Blog', url: 'https://openai.com/blog/rss/', category: 'AI Companies' },
  { sourceName: 'Hugging Face Blog', url: 'https://huggingface.co/blog/feed.xml', category: 'AI Companies' },
  { sourceName: 'LangChain Blog', url: 'https://blog.langchain.dev/rss/', category: 'AI Companies' },
  { sourceName: 'GitHub Blog', url: 'https://github.blog/feed/', category: 'AI Companies' },
  
  // Cloud & Infrastructure
  { sourceName: 'AWS Blog', url: 'https://aws.amazon.com/blogs/aws/feed/', category: 'Cloud' },
  { sourceName: 'AWS Developer Blog', url: 'https://aws.amazon.com/blogs/developer/feed/', category: 'Cloud' },
  { sourceName: 'Microsoft Developer Blog', url: 'https://devblogs.microsoft.com/feed/', category: 'Cloud' },
  { sourceName: 'Supabase Blog', url: 'https://supabase.com/blog/feed.xml', category: 'Cloud' },
  { sourceName: 'Vercel Blog', url: 'https://vercel.com/blog/feed.xml', category: 'Cloud' },
  
  // Tech News & Analysis
  { sourceName: 'TechCrunch', url: 'https://techcrunch.com/feed/', category: 'Tech News' },
  { sourceName: 'The Verge', url: 'https://www.theverge.com/rss/index.xml', category: 'Tech News' },
  { sourceName: 'VentureBeat', url: 'https://venturebeat.com/feed/', category: 'Tech News' },
  { sourceName: 'Wired', url: 'https://www.wired.com/feed/rss', category: 'Tech News' },
  { sourceName: 'MIT Technology Review', url: 'https://www.technologyreview.com/feed/', category: 'Tech News' },
  
  // AI Research & Education
  { sourceName: 'BAIR Blog', url: 'https://bair.berkeley.edu/blog/feed.xml', category: 'AI Research' },
  { sourceName: 'KDnuggets', url: 'https://www.kdnuggets.com/feed', category: 'AI Research' },
  { sourceName: 'Towards Data Science', url: 'https://towardsdatascience.com/feed', category: 'AI Research' },
  { sourceName: 'MarkTechPost', url: 'https://www.marktechpost.com/feed/', category: 'AI Research' },
  { sourceName: 'Louis Bouchard AI', url: 'https://www.louisbouchard.ai/feed/', category: 'AI Research' },
  { sourceName: 'Machine Learning Mastery', url: 'https://machinelearningmastery.com/blog/feed/', category: 'AI Research' },
  
  // Startup & Community
  { sourceName: 'Y Combinator Blog', url: 'https://blog.ycombinator.com/feed/', category: 'Startups' },
  { sourceName: 'Sam Altman Blog', url: 'https://blog.samaltman.com/feed', category: 'Startups' },
  
  // AI Thought Leadership
  { sourceName: 'Gary Marcus Substack', url: 'https://garymarcus.substack.com/feed', category: 'AI Thought Leadership' },
  { sourceName: 'Import AI Substack', url: 'https://importai.substack.com/feed', category: 'AI Thought Leadership' },
  { sourceName: 'Greg Isenberg Letter', url: 'https://latecheckout.substack.com/feed', category: 'AI Thought Leadership' }
]; 