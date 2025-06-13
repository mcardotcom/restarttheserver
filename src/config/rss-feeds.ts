interface RssFeed {
  sourceName: string;
  url: string;
}

export const RSS_FEED_WHITELIST: RssFeed[] = [
  { sourceName: 'TechCrunch', url: 'https://techcrunch.com/feed/' },
  { sourceName: 'The Verge', url: 'https://www.theverge.com/rss/index.xml' },
  { sourceName: 'VentureBeat', url: 'https://venturebeat.com/feed/' },
  { sourceName: 'Wired', url: 'https://www.wired.com/feed/rss' },
  { sourceName: 'MIT Technology Review', url: 'https://www.technologyreview.com/feed/' },
  { sourceName: 'OpenAI Blog', url: 'https://openai.com/blog/rss.xml' },
  { sourceName: 'NVIDIA Blog', url: 'https://blogs.nvidia.com/feed/' },
  { sourceName: 'Y Combinator Blog', url: 'https://blog.ycombinator.com/feed/' },
]; 