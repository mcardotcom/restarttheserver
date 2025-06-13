import { Headline } from '@/lib/supabase'

interface HeadlineCardProps {
  headline: Headline
}

export default function HeadlineCard({ headline }: HeadlineCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric'
    })
  }

  return (
    <article 
      className="bg-zinc-800 rounded-lg p-6 mb-4 hover:bg-zinc-700 transition-colors focus-within:ring-2 focus-within:ring-red-500 focus-within:outline-none"
      role="article"
      aria-labelledby={`headline-${headline.id}`}
    >
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-xl font-semibold">
          <a 
            href={headline.url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-white hover:text-red-500 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 rounded"
            id={`headline-${headline.id}`}
            aria-label={`Read full article: ${headline.title}`}
          >
            {headline.title}
          </a>
        </h3>
        <time 
          dateTime={headline.published_at}
          className="text-sm text-gray-400"
          aria-label={`Published on ${formatDate(headline.published_at)}`}
        >
          {formatDate(headline.published_at)}
        </time>
      </div>
      
      <p className="text-gray-300 mb-4" aria-label="Article summary">
        {headline.summary}
      </p>
      
      <div className="flex justify-between items-center text-sm">
        <span className="text-gray-400" aria-label={`Source: ${headline.source}`}>
          {headline.source}
        </span>
        <div className="flex items-center space-x-2" role="group" aria-label="Article metrics">
          <span className="text-gray-400">Flame Score:</span>
          <span 
            className="text-red-500 font-semibold"
            aria-label={`Flame score: ${headline.flame_score} out of 5`}
          >
            {headline.flame_score}
          </span>
        </div>
      </div>
    </article>
  )
} 