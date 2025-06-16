'use client';

import { SponsorCardProps } from '@/types';

export default function SponsorCard({
  title,
  summary,
  url,
  category,
  partner,
}: SponsorCardProps) {
  // Truncate partner name if too long
  const truncatePartner = (src: string) => {
    if (!src) return '';
    return src.length > 18 ? src.slice(0, 15) + '…' : src;
  };

  // Truncate summary to 30 words
  const truncateSummary = (text: string) => {
    if (!text) return '';
    const words = text.split(' ');
    if (words.length > 30) {
      return words.slice(0, 30).join(' ') + '...';
    }
    return text;
  };

  return (
    <div className="relative h-[360px] flex flex-col justify-between rounded-lg border p-5 bg-zinc-800 border-zinc-700 hover:border-red-500/50 hover:shadow-[0_0_15px_rgba(239,68,68,0.3)] transition-all duration-300">
      {/* Sponsored Label & Partner */}
      <div className="flex items-center justify-between mb-2">
        <span className="bg-red-600 text-xs text-white font-bold px-2 py-0.5 rounded">Sponsored</span>
        <span className="text-gray-400 truncate max-w-[120px] text-sm" title={partner}>{truncatePartner(partner || 'Ad')}</span>
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
        <p className="text-gray-300 text-sm line-clamp-3">{truncateSummary(summary || '')}</p>
      </div>

      {/* Bottom Row: Category */}
      <div className="flex items-end justify-between mt-auto pt-2">
        <div className="flex flex-col gap-1">
          {category && (
            <span className="px-2 py-0.5 bg-zinc-700 text-gray-300 rounded-full text-xs w-fit mb-1">{category}</span>
          )}
        </div>
      </div>
    </div>
  );
} 