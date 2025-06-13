'use client'

import { createClient } from '@/lib/supabase/client'
import { getArticles } from '@/lib/supabase/articles'
import HeadlineCard from '@/components/HeadlineCard'
import ErrorBoundary from '@/components/ErrorBoundary'

export default async function Home() {
  const supabase = createClient()
  const articles = await getArticles()

  // Split articles into three columns
  const columnSize = Math.ceil(articles.length / 3)
  const columns = [
    articles.slice(0, columnSize),
    articles.slice(columnSize, columnSize * 2),
    articles.slice(columnSize * 2)
  ]

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="border-b border-gray-800 bg-black/90 backdrop-blur sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold tracking-tight">
            <span className="text-white">RESTART</span>
            <span className="text-red-500">_</span>
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            AI-curated tech news that matters
          </p>
        </div>
      </header>

      <main className="min-h-screen bg-black">
        <div className="container mx-auto px-4 py-6">
          <div className="max-w-6xl mx-auto space-y-2">
            {articles.map((article) => (
              <ErrorBoundary key={article.id}>
                <HeadlineCard article={article} />
              </ErrorBoundary>
            ))}
          </div>
        </div>
      </main>

      <footer className="border-t border-gray-800 mt-16">
        <div className="max-w-4xl mx-auto px-4 py-8 text-center text-gray-500 text-sm">
          <p>© 2024 RESTART. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
} 