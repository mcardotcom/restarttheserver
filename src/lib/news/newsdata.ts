import { NewsDataResponse } from '@/types/news'

const NEWSDATA_API_KEY = process.env.NEWSDATA_API_KEY
const NEWSDATA_API_URL = 'https://newsdata.io/api/1/news'

if (!NEWSDATA_API_KEY) {
  throw new Error('NEWSDATA_API_KEY is not defined')
}

export async function fetchNewsFromNewsData(): Promise<NewsDataResponse> {
  const params = new URLSearchParams({
    apikey: NEWSDATA_API_KEY,
    q: 'AI OR "machine learning" OR "tech startup" OR "venture capital"',
    language: 'en',
    category: 'technology,science',
    size: '10'
  })

  const response = await fetchWithRetry(`${NEWSDATA_API_URL}?${params}`)
  
  if (!response.ok) {
    throw new Error(`Newsdata.io API error: ${response.statusText}`)
  }

  return response.json()
}

async function fetchWithRetry(url: string, maxRetries = 3): Promise<Response> {
  let lastError: Error | null = null
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(url)
      if (response.ok) {
        return response
      }
      lastError = new Error(`HTTP error! status: ${response.status}`)
    } catch (error) {
      lastError = error as Error
    }
    
    // Wait before retrying (exponential backoff)
    await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000))
  }
  
  throw lastError || new Error('Failed to fetch news after multiple retries')
} 