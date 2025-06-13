# Technical Implementation Details

## 1. Database Schema

### Headlines Table
```sql
CREATE TABLE headlines (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  source TEXT NOT NULL,
  summary TEXT,
  flame_score INTEGER CHECK (flame_score BETWEEN 1 AND 5),
  published_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_published BOOLEAN DEFAULT FALSE,
  is_pinned BOOLEAN DEFAULT FALSE,
  is_breaking BOOLEAN DEFAULT FALSE,
  approved_by UUID REFERENCES auth.users(id),
  category TEXT,
  metadata JSONB
);

-- Indexes
CREATE INDEX idx_headlines_published_at ON headlines(published_at);
CREATE INDEX idx_headlines_is_published ON headlines(is_published);
CREATE INDEX idx_headlines_flame_score ON headlines(flame_score);
```

### Users Table (Supabase Auth)
```sql
-- Extended user profile
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  role TEXT NOT NULL CHECK (role IN ('admin', 'editor')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Ads Table
```sql
CREATE TABLE ads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  position TEXT NOT NULL,
  ad_code TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 2. API Specifications

### Newsdata.io Integration
- Rate Limit: 100 requests/hour (free tier)
- Endpoint: `https://newsdata.io/api/1/news`
- Response Shape:
```typescript
interface NewsDataResponse {
  status: string;
  totalResults: number;
  results: Array<{
    title: string;
    link: string;
    source_id: string;
    pubDate: string;
    description: string;
    content: string;
    category: string[];
  }>;
}
```

### OpenAI Integration
- Model: GPT-4o-mini
- Rate Limit: 200 requests/minute
- Prompt Template:
```
Analyze this tech news article and provide:
1. A one-sentence summary (neutral tone)
2. A flame score (1-5)
3. A category (Model Releases|Funding|Regulation|Research|Drama|Other)

Article Title: {title}
Source: {source}
Content: {content}
```

## 3. Performance SLAs

### Page Load Performance
- First Contentful Paint (FCP): < 2.5s
- Largest Contentful Paint (LCP): < 3s
- Time to Interactive (TTI): < 3.5s
- First Input Delay (FID): < 100ms

### API Response Times
- Admin Panel Actions: < 500ms
- Article Fetching: < 2s
- OpenAI Analysis: < 5s per article

### Caching Strategy
```typescript
// Next.js Page Configuration
export const revalidate = 60; // Revalidate every minute

// API Route Caching
export const config = {
  runtime: 'edge',
  regions: ['iad1'],
  maxDuration: 30,
};
```

## 4. Error Handling

### API Failure Handling
```typescript
async function fetchWithRetry(url: string, options: any, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(url, options);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return response;
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
    }
  }
}
```

### Error Logging
```typescript
interface ErrorLog {
  id: UUID;
  timestamp: TIMESTAMP;
  error_type: TEXT;
  message: TEXT;
  context: JSONB;
  severity: TEXT;
}
```

## 5. Security Implementation

### Authentication
```typescript
// Middleware for protected routes
export function withAuth(handler) {
  return async (req, res) => {
    const session = await getSession(req);
    if (!session) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    return handler(req, res);
  };
}
```

### Rate Limiting
```typescript
// API Route Rate Limiting
import { rateLimit } from '@/lib/rate-limit';

export default rateLimit({
  interval: 60 * 1000, // 1 minute
  uniqueTokenPerInterval: 500,
})(async function handler(req, res) {
  // Route handler
});
```

## 6. Monitoring Setup

### Vercel Logging
```typescript
// Logging utility
export const logger = {
  error: (message: string, context?: any) => {
    console.error(JSON.stringify({ level: 'error', message, context }));
  },
  info: (message: string, context?: any) => {
    console.log(JSON.stringify({ level: 'info', message, context }));
  }
};
```

### Cron Job Monitoring
```typescript
// Cron job with monitoring
export async function scheduledFetch() {
  try {
    await fetchNews();
    await notifySuccess();
  } catch (error) {
    await notifyFailure(error);
    throw error;
  }
}
```

## 7. Content Guidelines

### Flame Score Criteria
1. Minor Update: Routine product updates, small funding rounds
2. Notable: Significant feature releases, medium funding
3. Important: Major platform updates, large funding rounds
4. Critical: Industry-shifting announcements, major acquisitions
5. Landmark: Revolutionary breakthroughs, market-defining events

### Editorial Standards
- Summaries must be neutral and factual
- No promotional language
- Must include source attribution
- Maximum summary length: 200 characters

### Source Requirements
- Must be from verified tech/AI news sources
- No paywalled content
- No duplicate content
- Must be in English

## 8. Deployment Configuration

### Vercel Configuration
```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/next"
    }
  ],
  "env": {
    "SUPABASE_URL": "@supabase_url",
    "SUPABASE_ANON_KEY": "@supabase_anon_key",
    "OPENAI_API_KEY": "@openai_api_key",
    "NEWSDATA_API_KEY": "@newsdata_api_key"
  }
}
```

### Environment Variables
```env
# Required
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
OPENAI_API_KEY=
NEWSDATA_API_KEY=

# Optional
NEXT_PUBLIC_SITE_URL=
SLACK_WEBHOOK_URL=
UPTIME_ROBOT_API_KEY=
```

## 9. Testing Requirements

### Unit Tests
- API route handlers
- Database operations
- Utility functions
- Authentication flows

### Integration Tests
- News fetching pipeline
- OpenAI integration
- Admin panel workflows
- Authentication flows

### E2E Tests
- User registration/login
- Article publishing workflow
- Admin panel operations
- Public feed display

## 10. Maintenance Procedures

### Daily Tasks
- Monitor error logs
- Check API rate limits
- Verify cron job execution
- Review published content

### Weekly Tasks
- Update dependencies
- Review performance metrics
- Check security alerts
- Backup verification

### Monthly Tasks
- Full security audit
- Performance optimization
- Content quality review
- User feedback analysis 