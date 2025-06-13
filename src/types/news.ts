export interface NewsDataArticle {
  title: string
  link: string
  source_id: string
  pubDate: string
  description: string
  content: string
  category: string[]
}

export interface NewsDataResponse {
  status: string
  totalResults: number
  results: NewsDataArticle[]
}

export interface ProcessedArticle {
  title: string
  url: string
  source: string
  summary: string
  flame_score: number
  published_at: string
  category: string
  metadata: {
    original_description: string
    original_content: string
    original_categories: string[]
  }
} 