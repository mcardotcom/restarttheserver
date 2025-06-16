import { render, screen, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import HeadlineList from '../HeadlineList'
import { createClient } from '@/lib/supabase/client'

// Mock the Supabase client
jest.mock('@/lib/supabase/client', () => ({
  createClient: jest.fn(() => ({
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        order: jest.fn(() => ({
          limit: jest.fn(() => ({
            eq: jest.fn(() => ({
              eq: jest.fn(() => ({
                eq: jest.fn().mockResolvedValue({
                  data: [],
                  error: null,
                }),
              })),
            })),
          })),
        })),
      })),
    })),
  })),
}))

// Mock the HeadlineCard and AdminHeadlineCard components
jest.mock('../HeadlineCard', () => {
  return function MockHeadlineCard({ article }: { article: any }) {
    return <div data-testid="headline-card">{article.title}</div>
  }
})

jest.mock('../AdminHeadlineCard', () => {
  return function MockAdminHeadlineCard({ headline }: { headline: any }) {
    return <div data-testid="admin-headline-card">{headline.title}</div>
  }
})

describe('HeadlineList', () => {
  const mockSupabase = createClient()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('shows loading state initially', () => {
    render(
      <HeadlineList
        supabase={mockSupabase}
        status="published"
        limit={3}
      />
    )

    // Should show 3 loading skeletons
    const skeletons = screen.getAllByRole('generic').filter(
      el => el.className.includes('animate-pulse')
    )
    expect(skeletons).toHaveLength(3)
  })

  it('shows error state when fetch fails', async () => {
    // Mock Supabase to return an error
    const mockError = new Error('Database error')
    ;(mockSupabase.from as jest.Mock).mockImplementationOnce(() => ({
      select: jest.fn().mockImplementationOnce(() => ({
        order: jest.fn().mockImplementationOnce(() => ({
          limit: jest.fn().mockImplementationOnce(() => ({
            eq: jest.fn().mockImplementationOnce(() => ({
              eq: jest.fn().mockImplementationOnce(() => ({
                eq: jest.fn().mockResolvedValueOnce({
                  data: null,
                  error: mockError,
                }),
              })),
            })),
          })),
        })),
      })),
    }))

    render(
      <HeadlineList
        supabase={mockSupabase}
        status="published"
      />
    )

    await waitFor(() => {
      expect(screen.getByText('Error loading headlines')).toBeInTheDocument()
      expect(screen.getByText('Database error')).toBeInTheDocument()
    })
  })

  it('shows empty state when no headlines are found', async () => {
    // Mock Supabase to return empty data
    ;(mockSupabase.from as jest.Mock).mockImplementationOnce(() => ({
      select: jest.fn().mockImplementationOnce(() => ({
        order: jest.fn().mockImplementationOnce(() => ({
          limit: jest.fn().mockImplementationOnce(() => ({
            eq: jest.fn().mockImplementationOnce(() => ({
              eq: jest.fn().mockImplementationOnce(() => ({
                eq: jest.fn().mockResolvedValueOnce({
                  data: [],
                  error: null,
                }),
              })),
            })),
          })),
        })),
      })),
    }))

    render(
      <HeadlineList
        supabase={mockSupabase}
        status="published"
      />
    )

    await waitFor(() => {
      expect(screen.getByText('No headlines found')).toBeInTheDocument()
    })
  })

  it('renders headlines correctly', async () => {
    const mockHeadlines = [
      { id: '1', title: 'Headline 1' },
      { id: '2', title: 'Headline 2' },
    ]

    // Mock Supabase to return mock data
    ;(mockSupabase.from as jest.Mock).mockImplementationOnce(() => ({
      select: jest.fn().mockImplementationOnce(() => ({
        order: jest.fn().mockImplementationOnce(() => ({
          limit: jest.fn().mockImplementationOnce(() => ({
            eq: jest.fn().mockImplementationOnce(() => ({
              eq: jest.fn().mockImplementationOnce(() => ({
                eq: jest.fn().mockResolvedValueOnce({
                  data: mockHeadlines,
                  error: null,
                }),
              })),
            })),
          })),
        })),
      })),
    }))

    render(
      <HeadlineList
        supabase={mockSupabase}
        status="published"
      />
    )

    await waitFor(() => {
      expect(screen.getByText('Headline 1')).toBeInTheDocument()
      expect(screen.getByText('Headline 2')).toBeInTheDocument()
    })
  })

  it('renders admin headlines when isAdmin is true', async () => {
    const mockHeadlines = [
      { id: '1', title: 'Admin Headline 1' },
      { id: '2', title: 'Admin Headline 2' },
    ]

    // Mock Supabase to return mock data
    ;(mockSupabase.from as jest.Mock).mockImplementationOnce(() => ({
      select: jest.fn().mockImplementationOnce(() => ({
        order: jest.fn().mockImplementationOnce(() => ({
          limit: jest.fn().mockImplementationOnce(() => ({
            eq: jest.fn().mockImplementationOnce(() => ({
              eq: jest.fn().mockImplementationOnce(() => ({
                eq: jest.fn().mockResolvedValueOnce({
                  data: mockHeadlines,
                  error: null,
                }),
              })),
            })),
          })),
        })),
      })),
    }))

    render(
      <HeadlineList
        supabase={mockSupabase}
        status="published"
        isAdmin={true}
      />
    )

    await waitFor(() => {
      const adminCards = screen.getAllByTestId('admin-headline-card')
      expect(adminCards).toHaveLength(2)
      expect(screen.getByText('Admin Headline 1')).toBeInTheDocument()
      expect(screen.getByText('Admin Headline 2')).toBeInTheDocument()
    })
  })

  it('renders section title when provided', async () => {
    const mockHeadlines = [{ id: '1', title: 'Headline 1' }]

    // Mock Supabase to return mock data
    ;(mockSupabase.from as jest.Mock).mockImplementationOnce(() => ({
      select: jest.fn().mockImplementationOnce(() => ({
        order: jest.fn().mockImplementationOnce(() => ({
          limit: jest.fn().mockImplementationOnce(() => ({
            eq: jest.fn().mockImplementationOnce(() => ({
              eq: jest.fn().mockImplementationOnce(() => ({
                eq: jest.fn().mockResolvedValueOnce({
                  data: mockHeadlines,
                  error: null,
                }),
              })),
            })),
          })),
        })),
      })),
    }))

    render(
      <HeadlineList
        supabase={mockSupabase}
        status="published"
        sectionTitle="Latest News"
      />
    )

    await waitFor(() => {
      expect(screen.getByText('Latest News')).toBeInTheDocument()
    })
  })
}) 