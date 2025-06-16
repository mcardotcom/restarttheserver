import { createClient } from '@/lib/supabase/server'
import { Database } from '@/types/supabase'

export type Article = Database['public']['Tables']['headlines']['Row'] & {
  moderation_status: 'pending' | 'approved' | 'rejected'
  moderation_notes?: string
}

export async function getArticles() {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('headlines')
    .select('*')
    .eq('is_published', true)
    .order('published_at', { ascending: false })
    .limit(60)

  if (error) {
    console.error('Error fetching articles:', error)
    throw error
  }

  return data
} 