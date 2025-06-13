import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types for our database tables
export type Headline = {
  id: string
  title: string
  url: string
  source: string
  summary: string | null
  flame_score: number
  published_at: string
  created_at: string
  updated_at: string
  is_published: boolean
  is_pinned: boolean
  is_breaking: boolean
  approved_by: string | null
  category: string | null
  metadata: Record<string, any> | null
  draft: boolean
  published: boolean
  moderation_status: 'pending' | 'approved' | 'rejected'
  moderation_notes: string | null
}

export type UserProfile = {
  id: string
  role: 'admin' | 'editor'
  created_at: string
  updated_at: string
}

export type Ad = {
  id: string
  position: string
  ad_code: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export type ErrorLog = {
  id: string
  timestamp: string
  error_type: string
  message: string
  context: Record<string, any> | null
  severity: 'info' | 'warning' | 'error' | 'critical'
}

export async function getPublishedHeadlines(): Promise<Headline[]> {
  const fortyEightHoursAgo = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString()

  const { data, error } = await supabase
    .from('headlines')
    .select('*')
    .eq('is_published', true)
    .gt('created_at', fortyEightHoursAgo)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching headlines:', error)
    return []
  }

  return data || []
} 