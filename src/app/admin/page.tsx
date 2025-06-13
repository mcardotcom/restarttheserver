'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase, getPublishedHeadlines } from '@/lib/supabase'
import type { Headline } from '@/lib/supabase'
import HeadlineList from '@/components/HeadlineList'
import LoadingSpinner from '@/components/LoadingSpinner'
import ErrorMessage from '@/components/ErrorMessage'

export default async function AdminPage() {
  const headlines = await getPublishedHeadlines()

  return (
    <main className="min-h-screen bg-zinc-950">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8 text-center text-white">Admin Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <section className="bg-zinc-900 rounded-lg p-6 shadow-lg">
            <h2 className="text-2xl font-bold mb-4 text-red-500 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Published Headlines
            </h2>
            <div className="space-y-4">
              <HeadlineList headlines={headlines.filter(h => h.is_published)} />
            </div>
          </section>

          <section className="bg-zinc-900 rounded-lg p-6 shadow-lg">
            <h2 className="text-2xl font-bold mb-4 text-red-500 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Pending Headlines
            </h2>
            <div className="space-y-4">
              <HeadlineList headlines={headlines.filter(h => !h.is_published)} />
            </div>
          </section>
        </div>
      </div>
    </main>
  )
} 