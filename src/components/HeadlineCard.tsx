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

  // Format the date only if it's valid
  const formattedDate = published_at && published_at !== '' 
    ? formatDistanceToNow(new Date(published_at), { addSuffix: true })
    : '';

  // Format the date to YYYY-MM-DD only
  const dateOnly = published_at ? published_at.slice(0, 10) : '';

  // Detect sponsored/ad
  const isSponsored = source === 'Ad' || category === 'Promotion' || title?.toLowerCase().includes('sponsored');

  return (
    <article
      className={
        'bg-zinc-900 rounded-lg p-4 shadow-lg flex flex-col border border-zinc-800 hover:shadow-red-500/30 hover:border-red-500/50 min-h-[340px] max-w-[370px] h-full transition-shadow duration-300'
      }
      aria-labelledby={`headline-${title}`}
    >
      <div className="flex-grow flex flex-col">
        <div className="flex justify-between items-center mb-3">
          <span className="text-sm font-bold text-red-500">{isSponsored ? '🚀 SPONSORED' : `🔥 ${flame_score}`}</span>
          <span className="text-xs text-zinc-400">{source}</span>
        </div>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-lg font-semibold text-zinc-100 hover:text-red-400 transition-colors"
        >
          {title}
        </a>
        <p className="text-sm text-zinc-400 mt-2">{summary}</p>
      </div>
      <div>
        {isSponsored ? (
          <div className="text-xs text-zinc-500 mt-2">Sponsored Link</div>
        ) : (
          dateOnly && <div className="text-xs text-zinc-500 mt-2">{dateOnly}</div>
        )}
        <div className="mt-1 text-xs text-zinc-400 italic">
          Category: {category || (isSponsored ? 'Promotion' : 'Other')}
        </div>
      </div>
    </article>
  )
} 