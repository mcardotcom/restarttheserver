export interface Headline {
  id: string
  title: string
  summary: string
  source: string
  url: string
  category: 'breaking' | 'high-priority' | 'worth-reading' | 'also-happening'
  created_at: string
  updated_at: string
  flame_score: number
  published_at: string
  is_published: boolean
  is_pinned: boolean
  is_breaking: boolean
  approved_by: string | null
  metadata: Record<string, any>
}

export interface UserProfile {
  id: string
  email: string
  role: 'admin' | 'user'
  created_at: string
  updated_at: string
}

export interface Ad {
  id: string
  title: string
  content: string
  url: string
  created_at: string
  updated_at: string
}

export interface ErrorLog {
  id: string
  message: string
  stack?: string
  created_at: string
} 