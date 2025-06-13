'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Headline } from '@/types'
import HeadlineCard from './HeadlineCard'
import AdminHeadlineCard from './AdminHeadlineCard'

interface HeadlineListProps {
  supabase: ReturnType<typeof createClient>
  status: 'published' | 'pending' | 'draft'
  limit?: number
  sectionTitle?: string
  isAdmin?: boolean
}

export default function HeadlineList({ 
  supabase, 
  status, 
  limit = 5, 
  sectionTitle,
  isAdmin = false
}: HeadlineListProps) {
  const [headlines, setHeadlines] = useState<Headline[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchHeadlines = async () => {
    try {
      setLoading(true)
      setError(null)
      
      let query = supabase
        .from('headlines')
        .select('*')
        .order('published_at', { ascending: false })
        .limit(limit)

      // Apply filters based on status
      if (status === 'published') {
        query = query
          .eq('is_published', true)
          .eq('published', true)
          .eq('moderation_status', 'approved')
      } else if (status === 'pending') {
        query = query
          .eq('is_published', false)
          .eq('published', false)
          .eq('moderation_status', 'pending')
      } else if (status === 'draft') {
        query = query
          .eq('is_published', false)
          .eq('published', false)
          .eq('draft', true)
      }

      const { data, error } = await query

      if (error) {
        console.error('Supabase error:', error)
        throw new Error(error.message)
      }

      if (!data) {
        throw new Error('No data returned from database')
      }

      setHeadlines(data)
    } catch (err) {
      console.error('Error fetching headlines:', err)
      setError(err instanceof Error ? err.message : 'Failed to load headlines')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchHeadlines()
  }, [status, limit])

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(limit)].map((_, i) => (
          <div 
            key={i}
            className="bg-zinc-800 rounded-lg p-4 animate-pulse"
          >
            <div className="h-6 bg-zinc-700 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-zinc-700 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-red-500 p-4 bg-red-900/50 rounded-lg">
        <p className="font-semibold">Error loading headlines</p>
        <p className="text-sm mt-1">{error}</p>
      </div>
    )
  }

  if (!headlines || headlines.length === 0) {
    return (
      <div className="text-gray-400 text-center py-8">
        No headlines found
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {sectionTitle && (
        <h2 className="text-xl font-semibold text-gray-100 mb-4">
          {sectionTitle}
        </h2>
      )}
      <ul 
        className="space-y-4"
        aria-label={`List of ${status} headlines`}
      >
        {headlines.map((headline) => (
          <li key={headline.id}>
            {isAdmin ? (
              <AdminHeadlineCard 
                headline={headline}
                onStatusChange={fetchHeadlines}
              />
            ) : (
              <HeadlineCard article={headline} />
            )}
          </li>
        ))}
      </ul>
    </div>
  )
} 