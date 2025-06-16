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

  // Format the date to YYYY-MM-DD only
  const dateOnly = published_at ? published_at.slice(0, 10) : '';

  // Detect sponsored/ad
  const isSponsored = source === 'Ad' || category === 'Promotion' || title?.toLowerCase().includes('sponsored');

  // Create a unique ID for the title
  const titleId = `headline-${title?.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;

  /**
   * Truncates a text string to a maximum of 30 words
   * @param {string} text - The text to truncate
   * @returns {string} The truncated text with ellipsis if needed
   */
  const truncateSummary = (text: string) => {
    const words = text.split(' ');
    if (words.length > 30) {
      return words.slice(0, 30).join(' ') + '...';
    }
    return text;
  };

  return (
    <div className="bg-zinc-800 rounded-lg p-6 border border-zinc-700 hover:border-zinc-600 transition-colors">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-xl font-semibold text-gray-100">{title}</h3>
        {isAdmin && (
          <div className="flex space-x-2">
            {onApprove && (
              <button
                onClick={() => onApprove(headline)}
                className="p-2 text-gray-400 hover:text-green-500 transition-colors"
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
            )}
            {onReject && (
              <button
                onClick={() => onReject(headline)}
                className="p-2 text-gray-400 hover:text-red-500 transition-colors"
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
            )}
            {onDelete && (
              <button
                onClick={() => onDelete(headline)}
                className="p-2 text-gray-400 hover:text-red-500 transition-colors"
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
            )}
          </div>
        )}
      </div>

      <div className="space-y-4">
        <div>
          <p className="text-gray-300 line-clamp-3">{summary ? truncateSummary(summary) : ''}</p>
          {summary && summary.length > 150 && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-red-500 hover:text-red-400 text-sm mt-2"
            >
              {isExpanded ? 'Show less' : 'Read more'}
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          {category && (
            <span className="px-3 py-1 bg-zinc-700 text-gray-300 rounded-full text-sm">
              {category}
            </span>
          )}
          {flame_score && (
            <span className="px-3 py-1 bg-zinc-700 text-gray-300 rounded-full text-sm">
              Flame Score: {flame_score}
            </span>
          )}
        </div>

        {url && (
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block text-red-500 hover:text-red-400 transition-colors"
          >
            Read More →
          </a>
        )}
      </div>
    </div>
  )
} 