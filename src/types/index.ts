export interface Headline {
  id: string
  title: string
  url: string
  source: string
  summary?: string
  flame_score?: number
  published_at?: string
  created_at?: string
  updated_at?: string
  is_published: boolean
  is_pinned: boolean
  is_breaking: boolean
  approved_by?: string
  category?: string
  metadata?: Record<string, any>
  draft: boolean
  published: boolean
  moderation_status: 'pending' | 'approved' | 'rejected'
  moderation_notes?: string
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