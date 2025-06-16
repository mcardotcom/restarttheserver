import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import AdminHeadlineCard from '../AdminHeadlineCard'
import type { Headline } from '@/types'
import { createClient } from '@/lib/supabase/client'

// Mock the Supabase client
jest.mock('@/lib/supabase/client', () => ({
  createClient: jest.fn(() => ({
    from: jest.fn(() => ({
      update: jest.fn(() => ({
        eq: jest.fn().mockResolvedValue({ error: null })
      }))
    }))
  }))
}))

describe('AdminHeadlineCard', () => {
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
    is_published: false,
    is_pinned: false,
    is_breaking: true,
    approved_by: null,
    metadata: {}
  }

  const mockOnStatusChange = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders headline information correctly', () => {
    render(
      <AdminHeadlineCard 
        headline={mockHeadline}
        onStatusChange={mockOnStatusChange}
      />
    )

    expect(screen.getByText('Test Headline')).toBeInTheDocument()
    expect(screen.getByText('This is a test summary')).toBeInTheDocument()
    expect(screen.getByText('Test Source')).toBeInTheDocument()
    expect(screen.getByText('🔥')).toBeInTheDocument()
    expect(screen.getByText('5')).toBeInTheDocument()
  })

  it('renders breaking news indicator when is_breaking is true', () => {
    render(
      <AdminHeadlineCard 
        headline={mockHeadline}
        onStatusChange={mockOnStatusChange}
      />
    )

    const breakingBadge = screen.getByText('Breaking')
    expect(breakingBadge).toBeInTheDocument()
    expect(breakingBadge).toHaveClass('bg-red-500')
  })

  it('renders draft indicator when draft is true', () => {
    render(
      <AdminHeadlineCard 
        headline={mockHeadline}
        onStatusChange={mockOnStatusChange}
      />
    )

    const draftBadge = screen.getByText('Draft')
    expect(draftBadge).toBeInTheDocument()
    expect(draftBadge).toHaveClass('bg-yellow-500')
  })

  it('renders published indicator when published is true', () => {
    const publishedHeadline = {
      ...mockHeadline,
      is_published: true
    }

    render(
      <AdminHeadlineCard 
        headline={publishedHeadline}
        onStatusChange={mockOnStatusChange}
      />
    )

    const publishedBadge = screen.getByText('Published')
    expect(publishedBadge).toBeInTheDocument()
    expect(publishedBadge).toHaveClass('bg-green-500')
  })

  it('shows publish button for unpublished headlines', () => {
    render(
      <AdminHeadlineCard 
        headline={mockHeadline}
        onStatusChange={mockOnStatusChange}
      />
    )

    const publishButton = screen.getByText('Publish')
    expect(publishButton).toBeInTheDocument()
    expect(publishButton).toHaveClass('bg-green-500')
  })

  it('shows unpublish button for published headlines', () => {
    const publishedHeadline = {
      ...mockHeadline,
      is_published: true
    }

    render(
      <AdminHeadlineCard 
        headline={publishedHeadline}
        onStatusChange={mockOnStatusChange}
      />
    )

    const unpublishButton = screen.getByText('Unpublish')
    expect(unpublishButton).toBeInTheDocument()
    expect(unpublishButton).toHaveClass('bg-red-500')
  })

  it('handles publish action correctly', async () => {
    render(
      <AdminHeadlineCard 
        headline={mockHeadline}
        onStatusChange={mockOnStatusChange}
      />
    )

    const publishButton = screen.getByText('Publish')
    fireEvent.click(publishButton)

    await waitFor(() => {
      expect(screen.getByText('Updating...')).toBeInTheDocument()
    })

    await waitFor(() => {
      expect(mockOnStatusChange).toHaveBeenCalled()
    })
  })

  it('handles unpublish action correctly', async () => {
    const publishedHeadline = {
      ...mockHeadline,
      is_published: true
    }

    render(
      <AdminHeadlineCard 
        headline={publishedHeadline}
        onStatusChange={mockOnStatusChange}
      />
    )

    const unpublishButton = screen.getByText('Unpublish')
    fireEvent.click(unpublishButton)

    await waitFor(() => {
      expect(screen.getByText('Updating...')).toBeInTheDocument()
    })

    await waitFor(() => {
      expect(mockOnStatusChange).toHaveBeenCalled()
    })
  })

  it('handles publish error gracefully', async () => {
    // Mock Supabase to return an error
    const mockError = new Error('Database error')
    ;(createClient().from as jest.Mock).mockImplementationOnce(() => ({
      update: jest.fn().mockImplementationOnce(() => ({
        eq: jest.fn().mockResolvedValueOnce({ error: mockError })
      }))
    }))

    const consoleSpy = jest.spyOn(console, 'error').mockImplementation()

    render(
      <AdminHeadlineCard 
        headline={mockHeadline}
        onStatusChange={mockOnStatusChange}
      />
    )

    const publishButton = screen.getByText('Publish')
    fireEvent.click(publishButton)

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Error publishing headline:', mockError)
    })

    consoleSpy.mockRestore()
  })

  it('renders with correct ARIA attributes', () => {
    render(
      <AdminHeadlineCard 
        headline={mockHeadline}
        onStatusChange={mockOnStatusChange}
      />
    )

    const article = screen.getByRole('article')
    expect(article).toHaveAttribute('aria-labelledby', `headline-${mockHeadline.id}`)

    const breakingBadge = screen.getByText('Breaking')
    expect(breakingBadge).toHaveAttribute('aria-label', 'Breaking news')

    const draftBadge = screen.getByText('Draft')
    expect(draftBadge).toHaveAttribute('aria-label', 'Draft')
  })

  it('renders link with correct attributes', () => {
    render(
      <AdminHeadlineCard 
        headline={mockHeadline}
        onStatusChange={mockOnStatusChange}
      />
    )

    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', mockHeadline.url)
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', 'noopener noreferrer')
  })
}) 