import { render, screen, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import HeadlineList from '../HeadlineList'
import type { SupabaseClient } from '@supabase/supabase-js'

// Mock the HeadlineCard component to isolate the list's logic
jest.mock('../HeadlineCard', () => {
  return function DummyHeadlineCard({ headline }: { headline: any }) {
    return <div data-testid="headline-card">{headline.title}</div>
  }
})

// Create a reusable mock Supabase client
const createMockSupabase = (data: any, error: any = null) => {
  const mockFrom = jest.fn().mockReturnValue({
    select: jest.fn().mockReturnValue({
      eq: jest.fn().mockReturnValue({
        order: jest.fn().mockReturnValue({
          limit: jest.fn().mockResolvedValue({ data, error }),
        }),
      }),
    }),
  })

  return {
    from: mockFrom,
  } as unknown as SupabaseClient
}

describe('HeadlineList', () => {
  const mockHeadlines = [
    {
      id: '1',
      title: 'Test Headline 1',
      summary: 'Test Summary 1',
      source: 'Test Source 1',
      url: 'https://example.com/1',
      category: 'breaking',
      created_at: '2024-03-13T12:00:00Z',
      updated_at: '2024-03-13T12:00:00Z',
      flame_score: 5,
      published_at: '2024-03-13T12:00:00Z',
      is_published: true,
      is_pinned: false,
    },
    {
      id: '2',
      title: 'Test Headline 2',
      summary: 'Test Summary 2',
      source: 'Test Source 2',
      url: 'https://example.com/2',
      category: 'breaking',
      created_at: '2024-03-13T12:00:00Z',
      updated_at: '2024-03-13T12:00:00Z',
      flame_score: 4,
      published_at: '2024-03-13T12:00:00Z',
      is_published: true,
      is_pinned: false,
    },
  ]

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders loading state initially', () => {
    const mockSupabase = createMockSupabase(mockHeadlines)
    render(<HeadlineList supabase={mockSupabase} category="breaking" />)
    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  it('renders headlines after loading', async () => {
    const mockSupabase = createMockSupabase(mockHeadlines)
    render(<HeadlineList supabase={mockSupabase} category="breaking" />)

    // Wait for loading state to disappear
    await waitFor(() => {
      expect(screen.queryByRole('status')).not.toBeInTheDocument()
    })

    // Then check for headlines
    expect(screen.getByText('Test Headline 1')).toBeInTheDocument()
    expect(screen.getByText('Test Headline 2')).toBeInTheDocument()
  })

  it('renders error state when fetch fails', async () => {
    const mockError = new Error('Failed to fetch headlines')
    const mockSupabase = createMockSupabase(null, mockError)
    render(<HeadlineList supabase={mockSupabase} category="breaking" />)

    // Wait for loading state to disappear
    await waitFor(() => {
      expect(screen.queryByRole('status')).not.toBeInTheDocument()
    })

    // Then check for error state
    expect(screen.getByRole('alert')).toBeInTheDocument()
    expect(screen.getByText('Error loading headlines')).toBeInTheDocument()
  })

  it('renders empty state when no headlines', async () => {
    const mockSupabase = createMockSupabase([])
    render(<HeadlineList supabase={mockSupabase} category="breaking" />)

    // Wait for loading state to disappear
    await waitFor(() => {
      expect(screen.queryByRole('status')).not.toBeInTheDocument()
    })

    // Then check for empty state
    expect(screen.getByText('No headlines available')).toBeInTheDocument()
  })

  it('renders with correct ARIA attributes', async () => {
    const mockSupabase = createMockSupabase(mockHeadlines)
    render(
      <HeadlineList 
        supabase={mockSupabase} 
        category="breaking" 
        sectionTitle="Breaking News" 
      />
    )

    // Wait for loading state to disappear
    await waitFor(() => {
      expect(screen.queryByRole('status')).not.toBeInTheDocument()
    })

    // Then check for list and its attributes
    const list = screen.getByRole('list')
    expect(list).toHaveAttribute('aria-label', 'Breaking News headlines')
  })
}) 