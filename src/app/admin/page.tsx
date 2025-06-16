'use client'

import { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Headline } from '@/types'
import { LogOut } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { Flame } from 'lucide-react'
import ManualYouTubeProcessor from '@/components/ManualYouTubeProcessor'
import { useRouter } from 'next/navigation'
import { User } from '@supabase/supabase-js'
import ManualArticleProcessor from '@/components/ManualArticleProcessor'
import SponsorCardEditor from '@/components/SponsorCardEditor'

export default function AdminPage() {
  const [articles, setArticles] = useState<Headline[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<Partial<Headline>>({})
  const [publishedCount, setPublishedCount] = useState<number>(0)
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const supabase = createClientComponentClient()

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      router.push('/login')
    } catch (err) {
      console.error('Logout error:', err)
      setError('Error logging out')
    }
  }

  const fetchPublishedCount = async () => {
    try {
      const { count, error } = await supabase
        .from('headlines')
        .select('*', { count: 'exact', head: true })
        .eq('is_published', true)

      if (error) throw error
      setPublishedCount(count || 0)
    } catch (err) {
      console.error('Error fetching published count:', err)
    }
  }

  const handleHybridFetch = async () => {
    try {
      const response = await fetch('/api/test-hybrid-fetch')
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch articles')
      }
      
      // Refresh the articles list after successful fetch
      await fetchArticles()
      alert('Successfully fetched new articles')
    } catch (err) {
      console.error('Error fetching articles:', err)
      alert(err instanceof Error ? err.message : 'Failed to fetch articles')
    }
  }

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
      fetchPublishedCount() // Update count after publishing
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
    const checkAuth = async () => {
      try {
        // Get the current session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        
        if (sessionError) {
          console.error('Session error:', sessionError)
          router.push('/login')
          return
        }

        if (!session) {
          console.log('No session found, redirecting to login')
          router.push('/login')
          return
        }

        setUser(session.user)

        // Check if user is an admin in either user_profiles or admin_users
        const [profileResult, adminResult] = await Promise.all([
          supabase
            .from('user_profiles')
            .select('role')
            .eq('id', session.user.id)
            .single(),
          supabase
            .from('admin_users')
            .select('id')
            .eq('id', session.user.id)
            .single()
        ]);

        const isAdminUser = profileResult.data?.role === 'admin' || adminResult.data !== null;
        
        if (!isAdminUser) {
          console.log('User is not an admin, redirecting to login');
          router.push('/login');
          return;
        }

        setIsAdmin(true);
        
        // If we get here, user is authenticated and is an admin
        fetchArticles()
      } catch (err) {
        console.error('Auth check error:', err)
        setError('Authentication error')
        router.push('/login')
      }
    }

    checkAuth()
  }, [router])

  useEffect(() => {
    fetchPublishedCount()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-black p-8">
        <div className="text-white">Loading...</div>
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
            onClick={() => router.push('/login')}
            className="mt-4 px-4 py-2 bg-red-800 text-white rounded hover:bg-red-700 transition-colors"
          >
            Return to Login
          </button>
        </div>
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-black p-8">
        <div className="bg-red-900/50 border border-red-800 rounded-lg p-4 text-red-200">
          <p className="font-medium">Access Denied</p>
          <p>You must be an admin to access this page.</p>
          <button 
            onClick={() => router.push('/login')}
            className="mt-4 px-4 py-2 bg-red-800 text-white rounded hover:bg-red-700 transition-colors"
          >
            Return to Login
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-950">
      <header className="bg-black border-b border-zinc-800 relative z-10">
        <div className="max-w-[2000px] mx-auto px-[25px] py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">
            <span className="text-white">RESTART</span>
            <span className="text-red-500">_</span>
            <span className="text-gray-500 ml-2">Admin</span>
          </h1>
          <div className="flex items-center space-x-4">
            <div className="text-gray-300 text-lg font-medium">
              Published: {publishedCount}
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="relative z-10">
        <div className="max-w-[2000px] mx-auto px-[25px] py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Tools */}
            <div className="space-y-8">
              <div>
                <ManualArticleProcessor onSuccess={fetchArticles} />
              </div>

              <div>
                <SponsorCardEditor 
                  onSave={async (data) => {
                    try {
                      const { error } = await supabase
                        .from('sponsor_cards')
                        .upsert({
                          title: data.title,
                          description: data.summary,
                          link: data.url,
                          partner: data.partner || 'Ad',
                          active: true,
                          image_url: null
                        })
                        .select()

                      if (error) {
                        console.error('Error saving sponsor card:', error)
                        throw new Error(error.message)
                      }

                      // Refresh the page to show updated cards
                      window.location.reload()
                    } catch (err) {
                      console.error('Error in onSave:', err)
                      throw err
                    }
                  }}
                  onCancel={() => {
                    // Reset form or close editor
                    window.location.reload()
                  }}
                />
              </div>

              <div className="mb-8">
                <h2 className="text-2xl font-bold mb-4">Process YouTube Video</h2>
                <ManualYouTubeProcessor onSuccess={fetchArticles} />
              </div>
            </div>

            {/* Right Column - Article List */}
            <div>
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-4">
                  <h1 className="text-2xl font-bold text-white">Article Drafts</h1>
                </div>
                <button
                  onClick={handleHybridFetch}
                  className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
                >
                  Fetch New Articles
                </button>
              </div>

              {error && (
                <div className="bg-red-900/50 text-red-200 p-4 rounded mb-6">
                  {error}
                </div>
              )}

              {loading ? (
                <div className="text-zinc-400">Loading articles...</div>
              ) : articles.length === 0 ? (
                <div className="text-zinc-400">No articles found</div>
              ) : (
                <div className="space-y-4">
                  {articles.map((article, index) => (
                    <div
                      key={article.id}
                      className="bg-zinc-900 rounded-lg p-4 border border-zinc-800"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <h3 className="text-lg font-medium text-white mb-1">
                            <a 
                              href={article.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="hover:text-red-400 transition-colors"
                            >
                              {article.title}
                            </a>
                          </h3>
                          <div className="flex items-center gap-4 text-sm text-zinc-400">
                            <span>{article.source}</span>
                            <span>•</span>
                            <span>
                              {article.created_at 
                                ? formatDistanceToNow(new Date(article.created_at), { addSuffix: true })
                                : 'Unknown date'}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1 text-zinc-400">
                            <Flame className="w-4 h-4" />
                            <span>{article.flame_score}</span>
                          </div>
                          <span className="text-zinc-600">•</span>
                          <span className="text-zinc-400">{article.category}</span>
                        </div>
                      </div>
                      <p className="text-zinc-400 text-sm mb-4">{article.summary}</p>
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleEdit(article.id)}
                          className="flex items-center gap-1 text-zinc-400 hover:text-white transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handlePublish(article.id)}
                          className="flex items-center gap-1 text-green-400 hover:text-green-300 transition-colors"
                        >
                          Publish
                        </button>
                        <button
                          onClick={() => handleDecline(article.id)}
                          className="flex items-center gap-1 text-red-400 hover:text-red-300 transition-colors"
                        >
                          Decline
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 