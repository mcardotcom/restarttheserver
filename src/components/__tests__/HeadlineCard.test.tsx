import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import HeadlineCard from '../HeadlineCard'
import type { Headline } from '@/types'

describe('HeadlineCard', () => {
  const mockArticle: Headline = {
    id: '1',
    title: 'Test Headline',
    summary: 'This is a test summary that should be truncated if it exceeds thirty words. This is a test summary that should be truncated if it exceeds thirty words. This is a test summary that should be truncated if it exceeds thirty words.',
    source: 'Test Source',
    url: 'https://example.com',
    category: 'breaking',
    created_at: '2024-03-13T12:00:00Z',
    updated_at: '2024-03-13T12:00:00Z',
    flame_score: 5,
    published_at: '2024-03-13T12:00:00Z',
    is_published: true,
    is_pinned: false,
    is_breaking: false,
    approved_by: null,
    metadata: {}
  }

  it('returns null when no article is provided', () => {
    const { container } = render(<HeadlineCard article={null as unknown as Headline} />)
    expect(container).toBeEmptyDOMElement()
  })

  it('renders article title correctly', () => {
    render(<HeadlineCard article={mockArticle} />)
    expect(screen.getByText('Test Headline')).toBeInTheDocument()
  })

  it('renders article source correctly', () => {
    render(<HeadlineCard article={mockArticle} />)
    expect(screen.getByText('Test Source')).toBeInTheDocument()
  })

  it('renders flame score correctly', () => {
    render(<HeadlineCard article={mockArticle} />)
    expect(screen.getByText('🔥 5')).toBeInTheDocument()
  })

  it('renders category correctly', () => {
    render(<HeadlineCard article={mockArticle} />)
    expect(screen.getByText('Category: breaking')).toBeInTheDocument()
  })

  it('truncates summary if it exceeds 30 words', () => {
    render(<HeadlineCard article={mockArticle} />)
    const summary = screen.getByText(/This is a test summary/)
    expect(summary.textContent).toContain('...')
  })

  it('renders sponsored content differently', () => {
    const sponsoredArticle = {
      ...mockArticle,
      source: 'Ad',
      category: 'Promotion',
    }
    render(<HeadlineCard article={sponsoredArticle} />)
    expect(screen.getByText('🚀 SPONSORED')).toBeInTheDocument()
    expect(screen.getByText('Sponsored Link')).toBeInTheDocument()
  })

  it('detects sponsored content from title', () => {
    const sponsoredArticle = {
      ...mockArticle,
      title: 'This is a SPONSORED post',
    }
    render(<HeadlineCard article={sponsoredArticle} />)
    expect(screen.getByText('🚀 SPONSORED')).toBeInTheDocument()
  })

  it('renders article with correct ARIA attributes', () => {
    render(<HeadlineCard article={mockArticle} />)
    const article = screen.getByRole('article')
    const titleId = `headline-${mockArticle.title.toLowerCase().replace(/[^a-z0-9]/g, '-')}`
    expect(article).toHaveAttribute('aria-labelledby', titleId)
  })

  it('renders article with correct link attributes', () => {
    render(<HeadlineCard article={mockArticle} />)
    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', mockArticle.url)
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', 'noopener noreferrer')
  })

  it('handles missing published_at date gracefully', () => {
    const articleWithoutDate = {
      ...mockArticle,
      published_at: '',
    }
    render(<HeadlineCard article={articleWithoutDate} />)
    expect(screen.queryByText(/2024-03-13/)).not.toBeInTheDocument()
  })

  it('renders breaking news indicator when is_breaking is true', () => {
    const breakingArticle = {
      ...mockArticle,
      is_breaking: true,
    }
    render(<HeadlineCard article={breakingArticle} />)
    const article = screen.getByRole('article')
    expect(article).toHaveClass('border-red-500')
  })

  it('renders pinned news indicator when is_pinned is true', () => {
    const pinnedArticle = {
      ...mockArticle,
      is_pinned: true,
    }
    render(<HeadlineCard article={pinnedArticle} />)
    const article = screen.getByRole('article')
    expect(article).toHaveClass('border-yellow-500')
  })
}) 