'use client'

import React from 'react'
import { createClient } from '@/lib/supabase/client'
import { getArticles } from '@/lib/supabase/articles'
import HeadlineCard from '@/components/HeadlineCard'
import ErrorBoundary from '@/components/ErrorBoundary'
import SponsorCard from '@/components/SponsorCard'

export default async function Home() {
  const supabase = createClient()
  const articles = await getArticles()

  // Prepare headline and sponsor (ad) cards
  const headlineArticles = articles.slice(0, 60 - 6); // 54 headlines if enough
  const sponsorPlaceholders = Array.from({ length: 6 }).map((_, i) => ({
    id: `ad-placeholder-${i}`,
    title: 'Ad Placeholder',
    url: '#',
    source: 'Ad',
    summary: 'Your ad could be here! Contact us to sponsor this spot.',
    flame_score: 0,
    published_at: '',
    created_at: '',
    updated_at: '',
    is_published: true,
    is_pinned: false,
    is_breaking: false,
    is_sponsored: false,
    approved_by: '',
    category: 'Ad',
    metadata: {},
    draft: false,
    published: true,
    moderation_status: 'approved',
    moderation_notes: ''
  }));

  // Build 6 groups of 10, each with 1 sponsor at a random position
  const articleGroups = [];
  let headlineIdx = 0;
  for (let groupIdx = 0; groupIdx < 6; groupIdx++) {
    // Pick a random position for the sponsor card in this group
    const sponsorPos = Math.floor(Math.random() * 10);
    const group = [];
    for (let i = 0; i < 10; i++) {
      if (i === sponsorPos) {
        group.push(sponsorPlaceholders[groupIdx]);
      } else {
        // If we run out of headlines, fill with more sponsor cards
        if (headlineIdx < headlineArticles.length) {
          group.push(headlineArticles[headlineIdx++]);
        } else {
          // Use extra sponsor placeholders if not enough headlines
          group.push({ ...sponsorPlaceholders[0], id: `ad-placeholder-extra-${groupIdx}-${i}` });
        }
      }
    }
    articleGroups.push(group);
  }

  // Flatten all groups into a single array of 60 cards
  const allCards = articleGroups.flat();

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="sticky top-0 z-10 bg-black/75 backdrop-blur h-32 flex items-center justify-center flex-col h-full w-full gap-y-1 text-center">
        <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight m-0">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-red-700 uppercase">RESTART_</span>
          <span className="text-zinc-100">The Server</span>
        </h1>
        <p className="text-lg text-zinc-400 m-0">Your daily digest of AI and tech news.</p>
      </header>

      <main className="min-h-screen bg-zinc-950">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 grid-rows-auto-fr">
              {allCards.map((article) => (
                <ErrorBoundary key={article.id}>
                  {article.source === 'Ad' || article.id?.toString().includes('ad-placeholder') ? (
                    <SponsorCard
                      title={article.title}
                      summary={article.summary}
                      url={article.url}
                      category={article.category}
                      partner="Partner"
                    />
                  ) : (
                    <HeadlineCard article={article} />
                  )}
                </ErrorBoundary>
              ))}
            </div>
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