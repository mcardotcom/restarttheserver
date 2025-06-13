'use client'

import { useEffect, useState } from 'react'
import type { SupabaseClient } from '@supabase/supabase-js'
import HeadlineCard from './HeadlineCard'
import { Headline } from '@/types'
import { handleSupabaseError, handleNetworkError, AppError } from '@/lib/error-handling'

interface HeadlineListProps {
  supabase: SupabaseClient
  category: 'breaking' | 'high-priority' | 'worth-reading' | 'also-happening'
  limit?: number
  sectionTitle?: string
}

export default function HeadlineList({ 
  supabase, 
  category, 
  limit = 5, 
  sectionTitle 
}: HeadlineListProps) {
  const [headlines, setHeadlines] = useState<Headline[]>([])
  const [error, setError] = useState<AppError | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchHeadlines() {
      try {
        setIsLoading(true)
        setError(null)

        const { data, error: supabaseError } = await supabase
          .from('headlines')
          .select('*')
          .eq('category', category)
          .order('created_at', { ascending: false })
          .limit(limit)

        if (supabaseError) {
          handleSupabaseError(supabaseError)
        }

        setHeadlines(data || [])
      } catch (err) {
        if (err instanceof AppError) {
          setError(err)
        } else if (err instanceof Error) {
          handleNetworkError(err)
        }
      } finally {
        setIsLoading(false)
      }
    }

    fetchHeadlines()
  }, [category, limit, supabase])

  if (error) {
    return (
      <div 
        role="alert" 
        className="p-4 bg-red-900/50 border border-red-500 rounded-lg"
        aria-live="assertive"
      >
        <h3 className="text-lg font-semibold text-red-500 mb-2">
          Error loading headlines
        </h3>
        <p className="text-gray-300">{error.message}</p>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div 
        role="status" 
        className="space-y-4 animate-pulse"
        aria-label="Loading headlines"
      >
        {[...Array(limit)].map((_, i) => (
          <div key={i} className="h-32 bg-gray-800 rounded-lg" />
        ))}
      </div>
    )
  }

  if (headlines.length === 0) {
    return (
      <div 
        role="status" 
        className="text-center py-8 text-gray-400"
        aria-label="No headlines available"
      >
        No headlines available
      </div>
    )
  }

  return (
    <div 
      role="list" 
      aria-label={sectionTitle ? `${sectionTitle} headlines` : `${category} headlines`}
      className="space-y-4"
    >
      {headlines.map((headline) => (
        <HeadlineCard key={headline.id} headline={headline} />
      ))}
    </div>
  )
} 