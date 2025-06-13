'use client'

import { formatDistanceToNow } from 'date-fns'
import { Headline } from '@/types'

interface HeadlineCardProps {
  article: Headline
}

export default function HeadlineCard({ article }: HeadlineCardProps) {
  if (!article) {
    return null
  }

  const {
    title,
    url,
    source,
    summary,
    flame_score,
    published_at,
    is_breaking,
    is_pinned,
    category
  } = article

  return (
    <article 
      className="bg-zinc-800 rounded-lg p-4 hover:bg-zinc-700 transition-colors"
      aria-labelledby={`headline-${title}`}
    >
      <div className="flex items-center gap-6">
        <div className="flex-1 min-w-0">
          <h2 
            id={`headline-${title}`}
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
          {is_pinned && (
            <span 
              className="px-2 py-1 text-xs font-semibold text-white bg-blue-500 rounded"
              aria-label="Pinned article"
            >
              Pinned
            </span>
          )}
          {category && (
            <span 
              className="px-2 py-1 text-xs font-semibold text-white bg-purple-500 rounded"
              aria-label={`Category: ${category}`}
            >
              {category}
            </span>
          )}
        </div>
      </div>
    </article>
  )
} 