'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Headline, HeadlineListProps } from '@/types'
import HeadlineCard from './HeadlineCard'
import AdminHeadlineCard from './AdminHeadlineCard'
import LoadingSpinner from './LoadingSpinner'
import ErrorMessage from './ErrorMessage'

export default function HeadlineList({
  supabase,
  status = 'published',
  limit = 10,
  sectionTitle = 'Latest Headlines',
  isAdmin = false,
}: HeadlineListProps) {
  const [headlines, setHeadlines] = useState<Headline[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchHeadlines()
  }, [status, limit])

  const fetchHeadlines = async () => {
    try {
      setLoading(true)
      setError(null)

      let query = supabase
        .from('headlines')
        .select('*')
        .order('created_at', { ascending: false })

      if (status) {
        query = query.eq('status', status)
      }

      if (limit) {
        query = query.limit(limit)
      }

      const { data, error } = await query

      if (error) {
        throw error
      }

      setHeadlines(data || [])
    } catch (err) {
      console.error('Error fetching headlines:', err)
      setError('Failed to load headlines. Please try again later.')
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (headline: Headline) => {
    try {
      const { error } = await supabase
        .from('headlines')
        .update({ status: 'published' })
        .eq('id', headline.id)

      if (error) {
        throw error
      }

      await fetchHeadlines()
    } catch (err) {
      console.error('Error approving headline:', err)
      setError('Failed to approve headline. Please try again.')
    }
  }

  const handleReject = async (headline: Headline) => {
    try {
      const { error } = await supabase
        .from('headlines')
        .update({ status: 'rejected' })
        .eq('id', headline.id)

      if (error) {
        throw error
      }

      await fetchHeadlines()
    } catch (err) {
      console.error('Error rejecting headline:', err)
      setError('Failed to reject headline. Please try again.')
    }
  }

  const handleDelete = async (headline: Headline) => {
    try {
      const { error } = await supabase
        .from('headlines')
        .delete()
        .eq('id', headline.id)

      if (error) {
        throw error
      }

      await fetchHeadlines()
    } catch (err) {
      console.error('Error deleting headline:', err)
      setError('Failed to delete headline. Please try again.')
    }
  }

  if (loading) {
    return <LoadingSpinner />
  }

  if (error) {
    return <ErrorMessage message={error} />
  }

  if (headlines.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-400">No headlines found.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-100">{sectionTitle}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {headlines.map((headline) => (
          <HeadlineCard
            key={headline.id}
            headline={headline}
            onApprove={isAdmin ? handleApprove : undefined}
            onReject={isAdmin ? handleReject : undefined}
            onDelete={isAdmin ? handleDelete : undefined}
            isAdmin={isAdmin}
          />
        ))}
      </div>
    </div>
  )
} 