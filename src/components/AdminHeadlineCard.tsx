'use client'

import { formatDistanceToNow } from 'date-fns'
import { Headline } from '@/types'
import { createClient } from '@/lib/supabase/client'
import { useState } from 'react'

interface AdminHeadlineCardProps {
  headline: Headline
  onStatusChange?: () => void
}

export default function AdminHeadlineCard({ headline, onStatusChange }: AdminHeadlineCardProps) {
  const [isUpdating, setIsUpdating] = useState(false)
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

  const handlePublish = async () => {
    try {
      setIsUpdating(true)
      const { error } = await supabase
        .from('headlines')
        .update({ 
          is_published: true,
          draft: false,
          published: true,
          moderation_status: 'approved',
          moderation_notes: 'Published by admin'
        })
        .eq('id', id)

      if (error) throw error
      onStatusChange?.()
    } catch (error) {
      console.error('Error publishing headline:', error)
    } finally {
      setIsUpdating(false)
    }
  }

  const handleUnpublish = async () => {
    try {
      setIsUpdating(true)
      const { error } = await supabase
        .from('headlines')
        .update({ 
          is_published: false,
          draft: true,
          published: false,
          moderation_status: 'pending',
          moderation_notes: 'Unpublished by admin'
        })
        .eq('id', id)

      if (error) throw error
      onStatusChange?.()
    } catch (error) {
      console.error('Error unpublishing headline:', error)
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <article 
      className="bg-zinc-800 rounded-lg p-4 hover:bg-zinc-700 transition-colors"
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
          <button
            onClick={published ? handleUnpublish : handlePublish}
            disabled={isUpdating}
            className={`px-3 py-1 text-xs font-semibold rounded transition-colors ${
              published 
                ? 'bg-red-500 hover:bg-red-600 text-white' 
                : 'bg-green-500 hover:bg-green-600 text-white'
            }`}
          >
            {isUpdating ? 'Updating...' : published ? 'Unpublish' : 'Publish'}
          </button>
        </div>
      </div>
    </article>
  )
} 