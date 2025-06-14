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

  // Fetch active sponsor cards
  const { data: sponsorCards, error: sponsorError } = await supabase
    .from('sponsor_cards')
    .select('*')
    .eq('active', true)
    .order('created_at', { ascending: false })

  console.log('Fetched sponsor cards:', sponsorCards)
  console.log('Sponsor cards error:', sponsorError)

  if (sponsorError) {
    console.error('Error fetching sponsor cards:', sponsorError)
  }

  // Calculate how many sponsor cards we need
  const totalCards = 60
  const numSponsorCards = 6
  const numHeadlineCards = totalCards - numSponsorCards

  // Prepare headline and sponsor cards
  const headlineArticles = articles.slice(0, numHeadlineCards)
  const activeSponsorCards = sponsorCards || []

  console.log('Active sponsor cards:', activeSponsorCards)
  console.log('Number of active sponsor cards:', activeSponsorCards.length)

  // Build groups of 10 cards, each with 1 sponsor at a random position
  const articleGroups = [];
  let headlineIdx = 0;
  let sponsorIdx = 0;

  // Calculate how many complete groups of 10 we can make
  const numCompleteGroups = Math.floor(totalCards / 10);
  
  for (let groupIdx = 0; groupIdx < numCompleteGroups; groupIdx++) {
    // Pick a random position for the sponsor card in this group
    const sponsorPos = Math.floor(Math.random() * 10);
    const group = [];
    
    for (let i = 0; i < 10; i++) {
      if (i === sponsorPos && sponsorIdx < activeSponsorCards.length) {
        const sponsor = activeSponsorCards[sponsorIdx++];
        console.log('Adding sponsor card:', sponsor)
        group.push({
          id: sponsor.id,
          title: sponsor.title,
          url: sponsor.link,
          source: 'Ad',
          summary: sponsor.description,
          flame_score: 0,
          published_at: sponsor.created_at,
          created_at: sponsor.created_at,
          updated_at: sponsor.updated_at,
          is_published: true,
          is_pinned: false,
          is_breaking: false,
          is_sponsored: true,
          approved_by: '',
          category: 'Promotion',
          metadata: {},
          draft: false,
          published: true,
          moderation_status: 'approved',
          moderation_notes: ''
        });
      } else if (headlineIdx < headlineArticles.length) {
        group.push(headlineArticles[headlineIdx++]);
      } else {
        // If we run out of headlines, use a sponsor card
        if (sponsorIdx < activeSponsorCards.length) {
          const sponsor = activeSponsorCards[sponsorIdx++];
          console.log('Adding extra sponsor card:', sponsor)
          group.push({
            id: sponsor.id,
            title: sponsor.title,
            url: sponsor.link,
            source: 'Ad',
            summary: sponsor.description,
            flame_score: 0,
            published_at: sponsor.created_at,
            created_at: sponsor.created_at,
            updated_at: sponsor.updated_at,
            is_published: true,
            is_pinned: false,
            is_breaking: false,
            is_sponsored: true,
            approved_by: '',
            category: 'Promotion',
            metadata: {},
            draft: false,
            published: true,
            moderation_status: 'approved',
            moderation_notes: ''
          });
        } else {
          // If we run out of both headlines and sponsors, use a placeholder
          group.push({
            id: `ad-placeholder-extra-${groupIdx}-${i}`,
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
            is_sponsored: true,
            approved_by: '',
            category: 'Promotion',
            metadata: {},
            draft: false,
            published: true,
            moderation_status: 'approved',
            moderation_notes: ''
          });
        }
      }
    }
    articleGroups.push(group);
  }

  // Handle any remaining cards (less than 10)
  const remainingCards = totalCards % 10;
  if (remainingCards > 0) {
    const lastGroup = [];
    for (let i = 0; i < remainingCards; i++) {
      if (headlineIdx < headlineArticles.length) {
        lastGroup.push(headlineArticles[headlineIdx++]);
      } else if (sponsorIdx < activeSponsorCards.length) {
        const sponsor = activeSponsorCards[sponsorIdx++];
        console.log('Adding remaining sponsor card:', sponsor)
        lastGroup.push({
          id: sponsor.id,
          title: sponsor.title,
          url: sponsor.link,
          source: 'Ad',
          summary: sponsor.description,
          flame_score: 0,
          published_at: sponsor.created_at,
          created_at: sponsor.created_at,
          updated_at: sponsor.updated_at,
          is_published: true,
          is_pinned: false,
          is_breaking: false,
          is_sponsored: true,
          approved_by: '',
          category: 'Promotion',
          metadata: {},
          draft: false,
          published: true,
          moderation_status: 'approved',
          moderation_notes: ''
        });
      } else {
        lastGroup.push({
          id: `ad-placeholder-extra-last-${i}`,
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
          is_sponsored: true,
          approved_by: '',
          category: 'Promotion',
          metadata: {},
          draft: false,
          published: true,
          moderation_status: 'approved',
          moderation_notes: ''
        });
      }
    }
    articleGroups.push(lastGroup);
  }

  // Flatten all groups into a single array
  const allCards = articleGroups.flat();
  console.log('Final cards array:', allCards.filter(card => card.source === 'Ad'))

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