'use client'

import { useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { Headline, HeadlineCardProps } from '@/types'

/**
 * HeadlineCard Component
 * 
 * A card component that displays a news headline with its associated metadata.
 * The card includes the headline title, source, summary, flame score, and publication date.
 * It also handles sponsored content differently, showing a sponsored label instead of the flame score.
 * 
 * @component
 * @param {HeadlineCardProps} props - The component props
 * @param {Headline} props.article - The headline article data to display
 * 
 * @example
 * ```tsx
 * const headline = {
 *   title: "Breaking News",
 *   summary: "This is a summary",
 *   source: "News Source",
 *   url: "https://example.com",
 *   flame_score: 5,
 *   published_at: "2024-03-13T12:00:00Z"
 * };
 * 
 * <HeadlineCard article={headline} />
 * ```
 * 
 * @returns {JSX.Element | null} The rendered headline card or null if no article is provided
 */
export default function HeadlineCard({
  headline,
  onApprove,
  onReject,
  onDelete,
  isAdmin = false,
}: HeadlineCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  if (!headline) {
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
  } = headline

  // Format the date only if it's valid
  const formattedDate = published_at && published_at !== '' 
    ? formatDistanceToNow(new Date(published_at), { addSuffix: true })
    : '';

  // Detect sponsored/ad
  const isSponsored = source === 'Ad' || category === 'Promotion' || title?.toLowerCase().includes('sponsored');

  // Truncate summary to 30 words
  const truncateSummary = (text: string) => {
    const words = text.split(' ');
    if (words.length > 30) {
      return words.slice(0, 30).join(' ') + '...';
    }
    return text;
  };

  // Truncate source if too long
  const truncateSource = (src: string) => {
    if (!src) return '';
    return src.length > 18 ? src.slice(0, 15) + '…' : src;
  };

  // Utility to extract site name from URL
  const getSiteName = (url: string) => {
    if (!url) return '';
    try {
      let hostname = new URL(url, 'https://example.com').hostname;
      // Remove www.
      hostname = hostname.replace(/^www\./, '');
      // Remove TLD (e.g., .com, .net, .org, etc.)
      const parts = hostname.split('.');
      if (parts.length > 2) {
        return parts[parts.length - 2];
      } else if (parts.length === 2) {
        return parts[0];
      }
      return hostname;
    } catch {
      return url;
    }
  };

  // Add red glow to CRT background on hover
  const handleMouseEnter = () => {
    document.body.classList.add('card-hovering');
  };
  const handleMouseLeave = () => {
    document.body.classList.remove('card-hovering');
  };

  return (
    <div
      className={`relative z-20 h-[360px] flex flex-col justify-between rounded-lg border p-5 bg-zinc-800 border-zinc-700 hover:border-red-500/50 hover:shadow-[0_0_15px_rgba(239,68,68,0.3)] transition-all duration-300 ${isSponsored ? 'bg-zinc-900 border-yellow-600' : ''}`}
      style={{ backgroundColor: isSponsored ? '#18181b' : '#27272a' }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Top Row: Flame Score & Source */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1">
          <span className="text-lg">🔥</span>
          <span className="text-orange-400 font-semibold">{flame_score}</span>
        </div>
        <span className="text-gray-400 truncate max-w-[120px] text-sm" title={source}>{getSiteName(url)}</span>
      </div>

      {/* Title as link */}
      <h3 className="text-lg font-bold text-gray-100 mb-1 line-clamp-2">
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-red-400 transition-colors"
        >
          {title}
        </a>
      </h3>

      {/* Summary */}
      <div className="flex-1 mb-2">
        <p className="text-gray-300 text-sm line-clamp-3">{summary ? truncateSummary(summary) : ''}</p>
      </div>

      {/* Bottom Row: Category, Date */}
      <div className="flex items-end justify-between mt-auto pt-2">
        <div className="flex flex-col gap-1">
          {category && (
            <span className="px-2 py-0.5 bg-zinc-700 text-gray-300 rounded-full text-xs w-fit mb-1">{category}</span>
          )}
          <span className="text-gray-500 text-xs">{formattedDate}</span>
        </div>
      </div>
      {/* Sponsored Label */}
      {isSponsored && (
        <span className="absolute top-2 left-2 bg-yellow-600 text-xs text-black font-bold px-2 py-0.5 rounded shadow">Sponsored</span>
      )}
    </div>
  )
} 