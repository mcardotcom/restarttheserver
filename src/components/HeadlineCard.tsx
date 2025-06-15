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

  // Create a unique ID for the title
  const titleId = `headline-${title?.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;

  // Truncate summary to 30 words
  const truncateSummary = (text: string) => {
    const words = text.split(' ');
    if (words.length > 30) {
      return words.slice(0, 30).join(' ') + '...';
    }
    return text;
  };

  return (
    <article
      className={
        'bg-zinc-900 rounded-lg p-4 shadow-lg flex flex-col border border-zinc-800 hover:shadow-red-500/30 hover:border-red-500/50 h-[360px] max-w-[370px] transition-shadow duration-300'
      }
      aria-labelledby={titleId}
    >
      <div className="flex-grow flex flex-col">
        <div className="flex justify-between items-center mb-3">
          <span className="text-sm font-bold text-red-500">{isSponsored ? '🚀 SPONSORED' : `🔥 ${flame_score}`}</span>
          <span className="text-xs text-zinc-400">{source}</span>
        </div>
        <a
          id={titleId}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-lg font-semibold text-zinc-100 hover:text-red-400 transition-colors line-clamp-3"
        >
          {title}
        </a>
        <p className="text-sm text-zinc-400 mt-2">{summary ? truncateSummary(summary) : ''}</p>
      </div>
      <div className="mt-auto">
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