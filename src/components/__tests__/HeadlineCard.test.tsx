import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import HeadlineCard from '../HeadlineCard'
import { Headline } from '@/types'

const mockHeadline: Headline = {
  id: '1',
  title: 'Test Headline',
  summary: 'This is a test summary',
  source: 'Test Source',
  url: 'https://example.com',
  category: 'breaking',
  created_at: '2024-03-13T12:00:00Z',
  updated_at: '2024-03-13T12:00:00Z',
  flame_score: 5,
  published_at: '2024-03-13T12:00:00Z',
  is_published: true,
  is_pinned: false,
  is_breaking: true,
  approved_by: null,
  metadata: {}
}

describe('HeadlineCard', () => {
  it('renders headline information correctly', () => {
    render(<HeadlineCard headline={mockHeadline} />)

    // Check if title is rendered
    expect(screen.getByText('Test Headline')).toBeInTheDocument()

    // Check if summary is rendered
    expect(screen.getByText('This is a test summary')).toBeInTheDocument()

    // Check if source is rendered
    expect(screen.getByText('Test Source')).toBeInTheDocument()

    // Check if link has correct href
    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', 'https://example.com')

    // Check if flame score is rendered
    expect(screen.getByText('5')).toBeInTheDocument()
  })

  it('renders with correct ARIA attributes', () => {
    render(<HeadlineCard headline={mockHeadline} />)

    const article = screen.getByRole('article')
    expect(article).toHaveAttribute('aria-labelledby', 'headline-1')

    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('aria-label', 'Read full article: Test Headline')

    const time = screen.getByLabelText(/Published on/)
    expect(time).toHaveAttribute('datetime', '2024-03-13T12:00:00Z')

    const summary = screen.getByLabelText('Article summary')
    expect(summary).toBeInTheDocument()

    const source = screen.getByLabelText('Source: Test Source')
    expect(source).toBeInTheDocument()

    const metrics = screen.getByRole('group', { name: 'Article metrics' })
    expect(metrics).toBeInTheDocument()

    const flameScore = screen.getByLabelText('Flame score: 5 out of 5')
    expect(flameScore).toBeInTheDocument()
  })

  it('formats date correctly', () => {
    render(<HeadlineCard headline={mockHeadline} />)

    const time = screen.getByLabelText(/Published on/)
    expect(time).toHaveAttribute('datetime', '2024-03-13T12:00:00Z')
    // The actual displayed text will depend on the user's timezone, so we just check the datetime attribute
  })
}) 