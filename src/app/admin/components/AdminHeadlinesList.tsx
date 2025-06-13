import { useState } from 'react'
import { Article } from '@/lib/supabase/articles'
import { createClient } from '@/lib/supabase/server'
import { formatDistanceToNow } from 'date-fns'
import { ExternalLink, Edit2, Trash2, Eye, EyeOff, XCircle, CheckCircle } from 'lucide-react'

interface AdminHeadlinesListProps {
  articles: Article[]
}

export default function AdminHeadlinesList({ articles }: AdminHeadlinesListProps) {
  const [isLoading, setIsLoading] = useState<string | null>(null)

  const markAsNotRelevant = async (id: string) => {
    if (!confirm('Mark this headline as not relevant? This will reject it from the feed.')) return
    
    setIsLoading(id)
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('headlines')
        .update({ 
          moderation_status: 'rejected',
          is_published: false,
          moderation_notes: 'Marked as not relevant by admin'
        })
        .eq('id', id)

      if (error) throw error
      window.location.reload()
    } catch (error: any) {
      console.error('Error marking as not relevant:', error.message)
      alert('Failed to update headline.')
    } finally {
      setIsLoading(null)
    }
  }

  const approveArticle = async (id: string) => {
    setIsLoading(id)
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('headlines')
        .update({ 
          moderation_status: 'approved',
          is_published: true,
          moderation_notes: 'Approved by admin'
        })
        .eq('id', id)

      if (error) throw error
      window.location.reload()
    } catch (error: any) {
      console.error('Error approving article:', error.message)
      alert('Failed to approve article.')
    } finally {
      setIsLoading(null)
    }
  }

  // Filter out rejected headlines
  const pendingHeadlines = articles.filter(h => h.moderation_status !== 'rejected')

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-6">Pending Headlines ({pendingHeadlines.length})</h2>

      <div className="space-y-4">
        {pendingHeadlines.map((article) => (
          <div
            key={article.id}
            className="border rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  {article.moderation_status === 'pending' && (
                    <span className="px-2 py-1 text-xs font-semibold bg-yellow-100 text-yellow-800 rounded">
                      Pending Review
                    </span>
                  )}
                  {article.is_published && (
                    <span className="px-2 py-1 text-xs font-semibold bg-green-100 text-green-800 rounded">
                      Published
                    </span>
                  )}
                </div>

                <h3 className="text-lg font-semibold mb-2">
                  <a 
                    href={article.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-blue-600 transition-colors"
                  >
                    {article.title}
                  </a>
                </h3>

                <p className="text-gray-600 mb-2">{article.summary}</p>

                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span>{article.source}</span>
                  <time dateTime={article.published_at}>
                    {formatDistanceToNow(new Date(article.published_at), { addSuffix: true })}
                  </time>
                  <span>Flame Score: {article.flame_score}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => approveArticle(article.id)}
                  disabled={isLoading === article.id}
                  className="p-2 bg-green-600 hover:bg-green-700 rounded text-white disabled:opacity-50"
                  title="Approve Article"
                >
                  <CheckCircle size={16} />
                </button>

                <button
                  onClick={() => markAsNotRelevant(article.id)}
                  disabled={isLoading === article.id}
                  className="p-2 bg-yellow-600 hover:bg-yellow-700 rounded text-white disabled:opacity-50"
                  title="Mark as Not Relevant"
                >
                  <XCircle size={16} />
                </button>

                <a
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 bg-blue-600 hover:bg-blue-700 rounded text-white"
                  title="Open Article"
                >
                  <ExternalLink size={16} />
                </a>
              </div>
            </div>
          </div>
        ))}

        {pendingHeadlines.length === 0 && (
          <p className="text-gray-500 text-center py-8">
            No pending headlines to review.
          </p>
        )}
      </div>
    </div>
  )
} 