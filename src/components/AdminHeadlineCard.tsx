'use client'

import { formatDistanceToNow } from 'date-fns'
import { Headline } from '@/types'
import { createClient } from '@/lib/supabase/client'
import { useState } from 'react'
import { AdminHeadlineCardProps } from '@/types'

export default function AdminHeadlineCard({
  headline,
  onStatusChange,
}: AdminHeadlineCardProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  const {
    id,
    title,
    url,
    source,
    summary,
    flame_score,
    published_at,
    is_breaking,
    draft,
    published,
    metadata
  } = headline

  const handleStatusChange = async (newStatus: 'published' | 'rejected') => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch(`/api/headlines/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) {
        throw new Error('Failed to update headline status')
      }

      onStatusChange()
    } catch (err) {
      console.error('Error updating headline status:', err)
      setError(err instanceof Error ? err.message : 'Failed to update headline status')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this headline?')) {
      return
    }

    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch(`/api/headlines/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete headline')
      }

      onStatusChange()
    } catch (err) {
      console.error('Error deleting headline:', err)
      setError(err instanceof Error ? err.message : 'Failed to delete headline')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <article 
      className="bg-zinc-800 rounded-lg p-4 hover:bg-zinc-700 transition-colors relative z-10"
      aria-labelledby={`headline-${id}`}
    >
      <div className="flex items-center gap-6">
        <div className="flex-1 min-w-0">
          <h2 
            id={`headline-${id}`}
            className="text-lg font-semibold text-gray-100 truncate"
          >
            <a 
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-blue-400 transition-colors"
            >
              {title}
            </a>
          </h2>
          <p className="text-gray-400 text-sm mt-2 line-clamp-2">{summary}</p>
        </div>

        <div className="flex items-center gap-6 text-sm text-gray-400 whitespace-nowrap">
          <span className="truncate max-w-[120px]">{source}</span>
          <time dateTime={published_at}>
            {formatDistanceToNow(new Date(published_at), { addSuffix: true })}
          </time>
          <div className="flex items-center gap-1">
            <span className="font-medium">🔥</span>
            <span className="text-orange-400">{flame_score}</span>
          </div>
          {is_breaking && (
            <span 
              className="px-2 py-1 text-xs font-semibold text-white bg-red-500 rounded"
              aria-label="Breaking news"
            >
              Breaking
            </span>
          )}
          {draft && (
            <span 
              className="px-2 py-1 text-xs font-semibold text-white bg-yellow-500 rounded"
              aria-label="Draft"
            >
              Draft
            </span>
          )}
          {published && (
            <span 
              className="px-2 py-1 text-xs font-semibold text-white bg-green-500 rounded"
              aria-label="Published"
            >
              Published
            </span>
          )}
          <div className="flex space-x-2">
            <button
              onClick={() => handleStatusChange('published')}
              disabled={isLoading}
              className="p-2 text-gray-400 hover:text-green-500 transition-colors disabled:opacity-50"
              aria-label="Approve headline"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
            <button
              onClick={() => handleStatusChange('rejected')}
              disabled={isLoading}
              className="p-2 text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50"
              aria-label="Reject headline"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
            <button
              onClick={handleDelete}
              disabled={isLoading}
              className="p-2 text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50"
              aria-label="Delete headline"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="text-red-500 text-sm mt-2">
          <p>{error}</p>
        </div>
      )}
    </article>
  )
} 