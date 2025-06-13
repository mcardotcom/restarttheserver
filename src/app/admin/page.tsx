'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Headline } from '@/types'
import type { SupabaseClient } from '@supabase/supabase-js'

export default function AdminPage() {
  const [articles, setArticles] = useState<Headline[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<Partial<Headline>>({})
  const [supabase] = useState<SupabaseClient>(() => createClient())

  const fetchArticles = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('headlines')
        .select('*')
        .eq('is_published', false)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching articles:', error)
        throw error
      }
      
      setArticles(data || [])
    } catch (err) {
      console.error('Error:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch articles')
    } finally {
      setLoading(false)
    }
  }

  const handlePublish = async (id: string) => {
    try {
      const { error } = await supabase
        .from('headlines')
        .update({ 
          is_published: true,
          published: true,
          draft: false,
          moderation_status: 'approved',
          moderation_notes: 'Published by admin'
        })
        .eq('id', id)

      if (error) throw error
      setArticles(articles.filter(article => article.id !== id))
    } catch (err) {
      console.error('Error publishing article:', err)
      alert('Failed to publish article')
    }
  }

  const handleDecline = async (id: string) => {
    try {
      const { error } = await supabase
        .from('headlines')
        .delete()
        .eq('id', id)
        .select()

      if (error) throw error
      setArticles(articles.filter(article => article.id !== id))
    } catch (err) {
      console.error('Error declining article:', err)
      alert('Failed to decline article')
    }
  }

  const handleEdit = (id: string) => {
    const article = articles.find(a => a.id === id)
    if (article) {
      setEditingId(id)
      setEditForm({
        title: article.title || '',
        source: article.source || '',
        flame_score: article.flame_score || 1,
        category: article.category || ''
      })
    }
  }

  const handleSave = async (id: string) => {
    try {
      const { error } = await supabase
        .from('headlines')
        .update({
          title: editForm.title || '',
          source: editForm.source || '',
          flame_score: editForm.flame_score || 1,
          category: editForm.category || ''
        })
        .eq('id', id)

      if (error) throw error
      setArticles(articles.map(article => 
        article.id === id ? { ...article, ...editForm } : article
      ))
      setEditingId(null)
      setEditForm({})
    } catch (err) {
      console.error('Error saving article:', err)
      alert('Failed to save changes')
    }
  }

  const handleCancel = () => {
    setEditingId(null)
    setEditForm({})
  }

  useEffect(() => {
    fetchArticles()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-black p-8">
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-zinc-800 rounded"></div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black p-8">
        <div className="bg-red-900/50 border border-red-800 rounded-lg p-4 text-red-200">
          <p className="font-medium">Error</p>
          <p>{error}</p>
          <button 
            onClick={fetchArticles}
            className="mt-4 px-4 py-2 bg-red-800 text-white rounded hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black">
      <header className="bg-black border-b border-gray-800">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold">
            <span className="text-white">RESTART</span>
            <span className="text-red-500">_</span>
            <span className="text-gray-500 ml-2">Admin</span>
          </h1>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {articles.length === 0 ? (
          <div className="bg-zinc-900 rounded-lg p-8 text-center">
            <p className="text-gray-400">No draft articles found</p>
            <p className="text-gray-500 mt-2 text-sm">
              Articles will appear here after they are fetched from RSS feeds
            </p>
          </div>
        ) : (
          <div className="bg-zinc-900 rounded-lg overflow-hidden shadow-lg">
            <table className="w-full">
              <thead>
                <tr className="bg-zinc-800 text-left">
                  <th className="p-4 text-gray-400">Title</th>
                  <th className="p-4 text-gray-400">Source</th>
                  <th className="p-4 text-gray-400">Flame Score</th>
                  <th className="p-4 text-gray-400">Category</th>
                  <th className="p-4 text-gray-400">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {articles.map((article) => (
                  <tr key={article.id} className="hover:bg-zinc-800/50">
                    <td className="p-4">
                      {editingId === article.id ? (
                        <input
                          type="text"
                          value={editForm.title}
                          onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                          className="w-full bg-zinc-700 text-white rounded px-2 py-1"
                        />
                      ) : (
                        <a 
                          href={article.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-white hover:text-blue-400"
                        >
                          {article.title}
                        </a>
                      )}
                    </td>
                    <td className="p-4">
                      {editingId === article.id ? (
                        <input
                          type="text"
                          value={editForm.source}
                          onChange={(e) => setEditForm({ ...editForm, source: e.target.value })}
                          className="w-full bg-zinc-700 text-white rounded px-2 py-1"
                        />
                      ) : (
                        <span className="text-gray-400">{article.source}</span>
                      )}
                    </td>
                    <td className="p-4">
                      {editingId === article.id ? (
                        <input
                          type="number"
                          min="1"
                          max="5"
                          value={editForm.flame_score}
                          onChange={(e) => setEditForm({ ...editForm, flame_score: parseInt(e.target.value) })}
                          className="w-20 bg-zinc-700 text-white rounded px-2 py-1"
                        />
                      ) : (
                        <span className="text-orange-400">🔥 {article.flame_score}</span>
                      )}
                    </td>
                    <td className="p-4">
                      {editingId === article.id ? (
                        <input
                          type="text"
                          value={editForm.category}
                          onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                          className="w-full bg-zinc-700 text-white rounded px-2 py-1"
                        />
                      ) : (
                        <span className="text-gray-400">{article.category}</span>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        {editingId === article.id ? (
                          <>
                            <button
                              onClick={() => handleSave(article.id)}
                              className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                            >
                              Save
                            </button>
                            <button
                              onClick={handleCancel}
                              className="px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700"
                            >
                              Cancel
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => handleEdit(article.id)}
                              className="p-1 text-gray-400 hover:text-white"
                              title="Edit"
                            >
                              ✏️
                            </button>
                            <button
                              onClick={() => handlePublish(article.id)}
                              className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                            >
                              Publish
                            </button>
                            <button
                              onClick={() => handleDecline(article.id)}
                              className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                            >
                              Decline
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  )
} 