import React from 'react';

interface SponsorCardProps {
  title?: string;
  summary?: string;
  url?: string;
  category?: string;
  partner?: string;
}

export default function SponsorCard({
  title = 'Try Claude 3.5 Today – Get 1 Month Free',
  summary = 'Experience the future of AI with our top-rated Claude model — claim your free trial.',
  url = '#',
  category = 'Promotion',
  partner,
}: SponsorCardProps) {
  return (
    <article
      className="bg-zinc-900 rounded-lg p-4 shadow-lg flex flex-col border border-zinc-800 hover:shadow-red-500/30 hover:border-red-500/50 min-h-[340px] max-w-[370px] h-full transition-shadow duration-300"
      aria-labelledby={`sponsor-${title}`}
    >
      <div className="flex-grow flex flex-col">
        <div className="flex justify-between items-center mb-3">
          <span className="text-sm text-red-500 font-bold">🚀 SPONSORED</span>
          <span className="text-xs text-zinc-400">{partner || 'Ad'}</span>
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
        <div className="text-xs text-zinc-500 mt-4">Sponsored Link</div>
        <div className="mt-2 text-xs text-zinc-400 italic">Category: {category}</div>
      </div>
    </article>
  );
} 