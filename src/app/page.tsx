'use client'

import { createClient } from '@/lib/supabase/client'
import HeadlineList from '@/components/HeadlineList'
import ErrorBoundary from '@/components/ErrorBoundary'

export default function HomePage() {
  const supabase = createClient()

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

      <main className="max-w-4xl mx-auto px-4 py-8">
        <ErrorBoundary>
          <section 
            className="mb-12"
            aria-labelledby="breaking-news-heading"
          >
            <h2 
              id="breaking-news-heading"
              className="text-2xl font-bold mb-6 flex items-center gap-2"
            >
              <span className="text-red-500" aria-hidden="true">●</span>
              Breaking News
            </h2>
            <HeadlineList 
              supabase={supabase}
              category="breaking"
              sectionTitle="Breaking News"
            />
          </section>

          <section 
            className="mb-12"
            aria-labelledby="high-priority-heading"
          >
            <h2 
              id="high-priority-heading"
              className="text-2xl font-bold mb-6 flex items-center gap-2"
            >
              <span className="text-yellow-500" aria-hidden="true">●</span>
              High Priority
            </h2>
            <HeadlineList 
              supabase={supabase}
              category="high-priority"
              sectionTitle="High Priority"
            />
          </section>

          <section 
            className="mb-12"
            aria-labelledby="worth-reading-heading"
          >
            <h2 
              id="worth-reading-heading"
              className="text-2xl font-bold mb-6 flex items-center gap-2"
            >
              <span className="text-blue-500" aria-hidden="true">●</span>
              Worth Reading
            </h2>
            <HeadlineList 
              supabase={supabase}
              category="worth-reading"
              sectionTitle="Worth Reading"
            />
          </section>

          <section 
            aria-labelledby="also-happening-heading"
          >
            <h2 
              id="also-happening-heading"
              className="text-2xl font-bold mb-6 flex items-center gap-2"
            >
              <span className="text-green-500" aria-hidden="true">●</span>
              Also Happening
            </h2>
            <HeadlineList 
              supabase={supabase}
              category="also-happening"
              sectionTitle="Also Happening"
            />
          </section>
        </ErrorBoundary>
      </main>

      <footer className="border-t border-gray-800 mt-16">
        <div className="max-w-4xl mx-auto px-4 py-8 text-center text-gray-500 text-sm">
          <p>© 2024 RESTART. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
} 