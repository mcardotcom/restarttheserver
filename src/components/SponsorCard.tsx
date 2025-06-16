'use client';

import { useState } from 'react';
import { SponsorCardProps } from '@/types';

export default function SponsorCard({
  title,
  summary,
  url,
  category,
  partner,
  onEdit,
  onDelete,
}: SponsorCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-zinc-800 rounded-lg p-6 border border-zinc-700 hover:border-zinc-600 transition-colors">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-xl font-semibold text-gray-100">{title}</h3>
        <div className="flex space-x-2">
          {onEdit && (
            <button
              onClick={onEdit}
              className="p-2 text-gray-400 hover:text-white transition-colors"
              aria-label="Edit sponsor card"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
              </svg>
            </button>
          )}
          {onDelete && (
            <button
              onClick={onDelete}
              className="p-2 text-gray-400 hover:text-red-500 transition-colors"
              aria-label="Delete sponsor card"
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
      </div>

      <div className="space-y-4">
        <div>
          <p className="text-gray-300 line-clamp-3">{summary}</p>
          {summary.length > 150 && (
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
          {partner && (
            <span className="px-3 py-1 bg-zinc-700 text-gray-300 rounded-full text-sm">
              {partner}
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
            Visit Website →
          </a>
        )}
      </div>
    </div>
  );
} 