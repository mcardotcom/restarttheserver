import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import SponsorCardEditor from '../SponsorCardEditor'
import { createClient } from '@/lib/supabase/client'

// Mock the Supabase client
const mockClientInstance = {
  from: jest.fn(() => ({
    select: jest.fn(() => ({
      order: jest.fn().mockResolvedValue({ data: [], error: null })
    })),
    upsert: jest.fn().mockResolvedValue({ error: null }),
    delete: jest.fn(() => ({
      eq: jest.fn().mockResolvedValue({ error: null })
    })),
    update: jest.fn(() => ({
      eq: jest.fn(() => ({
        select: jest.fn().mockResolvedValue({ error: null })
      }))
    }))
  }))
}

jest.mock('@/lib/supabase/client', () => ({
  createClient: jest.fn(() => mockClientInstance)
}))

// Mock window.confirm
const mockConfirm = jest.fn()
window.confirm = mockConfirm

describe('SponsorCardEditor', () => {
  const mockSponsorCard = {
    id: '1',
    title: 'Test Sponsor',
    description: 'Test Description',
    link: 'https://example.com',
    partner: 'Test Partner',
    active: true
  }

  beforeEach(() => {
    jest.clearAllMocks()
    // Mock successful fetch
    mockClientInstance.from.mockImplementation(() => ({
      select: jest.fn().mockImplementation(() => ({
        order: jest.fn().mockResolvedValue({ data: [mockSponsorCard], error: null })
      })),
      upsert: jest.fn().mockResolvedValue({ error: null }),
      delete: jest.fn(() => ({ eq: jest.fn().mockResolvedValue({ error: null }) })),
      update: jest.fn(() => ({ eq: jest.fn(() => ({ select: jest.fn().mockResolvedValue({ error: null }) })) }))
    }))
  })

  it('renders the editor form', () => {
    render(<SponsorCardEditor />)
    
    expect(screen.getByText('Sponsor Card Editor')).toBeInTheDocument()
    expect(screen.getByLabelText('Title')).toBeInTheDocument()
    expect(screen.getByLabelText('Business Name')).toBeInTheDocument()
    expect(screen.getByLabelText('Description')).toBeInTheDocument()
    expect(screen.getByLabelText('Link URL')).toBeInTheDocument()
  })

  it('renders existing sponsor cards', async () => {
    render(<SponsorCardEditor />)

    await waitFor(() => {
      expect(screen.getByText('Test Sponsor')).toBeInTheDocument()
      expect(screen.getByText('Test Description')).toBeInTheDocument()
      expect(screen.getByText('https://example.com')).toBeInTheDocument()
    })
  })

  it('handles form submission for new sponsor card', async () => {
    render(<SponsorCardEditor />)

    // Fill out the form
    fireEvent.change(screen.getByLabelText('Title'), { target: { value: 'New Sponsor' } })
    fireEvent.change(screen.getByLabelText('Business Name'), { target: { value: 'New Partner' } })
    fireEvent.change(screen.getByLabelText('Description'), { target: { value: 'New Description' } })
    fireEvent.change(screen.getByLabelText('Link URL'), { target: { value: 'example.com' } })

    // Submit the form
    fireEvent.click(screen.getByText('Create Sponsor Card'))

    await waitFor(() => {
      expect(screen.getByText('Sponsor card updated successfully')).toBeInTheDocument()
    })
  })

  it('handles form submission for updating existing sponsor card', async () => {
    render(<SponsorCardEditor />)

    // Wait for the card to be loaded
    await waitFor(() => {
      expect(screen.getByText('Test Sponsor')).toBeInTheDocument()
    })

    // Click edit button
    fireEvent.click(screen.getByText('Edit'))

    // Update the form
    fireEvent.change(screen.getByLabelText('Title'), { target: { value: 'Updated Sponsor' } })

    // Submit the form
    fireEvent.click(screen.getByText('Update Sponsor Card'))

    await waitFor(() => {
      expect(screen.getByText('Sponsor card updated successfully')).toBeInTheDocument()
    })
  })

  it('handles sponsor card deletion', async () => {
    mockConfirm.mockReturnValue(true)

    render(<SponsorCardEditor />)

    // Wait for the card to be loaded
    await waitFor(() => {
      expect(screen.getByText('Test Sponsor')).toBeInTheDocument()
    })

    // Click delete button
    fireEvent.click(screen.getByText('Delete'))

    await waitFor(() => {
      expect(screen.getByText('Sponsor card deleted successfully')).toBeInTheDocument()
    })
  })

  it('handles sponsor card activation/deactivation', async () => {
    render(<SponsorCardEditor />)

    // Wait for the card to be loaded
    await waitFor(() => {
      expect(screen.getByText('Test Sponsor')).toBeInTheDocument()
    })

    // Click toggle button
    fireEvent.click(screen.getByText('Active'))

    await waitFor(() => {
      expect(screen.getByText('Sponsor card deactivated successfully')).toBeInTheDocument()
    })
  })

  it('handles fetch error gracefully', async () => {
    // Mock fetch error
    mockClientInstance.from.mockImplementation(() => ({
      select: jest.fn().mockImplementation(() => ({
        order: jest.fn().mockResolvedValue({ data: null, error: new Error('Fetch error') })
      })),
      upsert: jest.fn(),
      delete: jest.fn(),
      update: jest.fn()
    }))

    render(<SponsorCardEditor />)

    await waitFor(() => {
      expect(screen.getByText('Failed to fetch sponsor cards')).toBeInTheDocument()
    })
  })

  it('handles submission error gracefully', async () => {
    // Mock submission error
    mockClientInstance.from.mockImplementation(() => ({
      select: jest.fn(),
      upsert: jest.fn().mockResolvedValue({ error: new Error('Submission error') }),
      delete: jest.fn(),
      update: jest.fn()
    }))

    render(<SponsorCardEditor />)

    // Fill out and submit the form
    fireEvent.change(screen.getByLabelText('Title'), { target: { value: 'New Sponsor' } })
    fireEvent.change(screen.getByLabelText('Business Name'), { target: { value: 'New Partner' } })
    fireEvent.change(screen.getByLabelText('Description'), { target: { value: 'New Description' } })
    fireEvent.change(screen.getByLabelText('Link URL'), { target: { value: 'example.com' } })
    fireEvent.click(screen.getByText('Create Sponsor Card'))

    await waitFor(() => {
      expect(screen.getByText('Failed to update sponsor card')).toBeInTheDocument()
    })
  })

  it('formats link URL correctly', async () => {
    render(<SponsorCardEditor />)

    // Fill out the form with a URL without protocol
    fireEvent.change(screen.getByLabelText('Title'), { target: { value: 'New Sponsor' } })
    fireEvent.change(screen.getByLabelText('Business Name'), { target: { value: 'New Partner' } })
    fireEvent.change(screen.getByLabelText('Description'), { target: { value: 'New Description' } })
    fireEvent.change(screen.getByLabelText('Link URL'), { target: { value: 'example.com' } })

    // Submit the form
    fireEvent.click(screen.getByText('Create Sponsor Card'))

    await waitFor(() => {
      // Check that the URL was formatted with https://
      expect(mockClientInstance.from().upsert).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            link: 'https://example.com'
          })
        ]),
        expect.any(Object)
      )
    })
  })

  it('shows loading state during submission', async () => {
    render(<SponsorCardEditor />)

    // Fill out the form
    fireEvent.change(screen.getByLabelText('Title'), { target: { value: 'New Sponsor' } })
    fireEvent.change(screen.getByLabelText('Business Name'), { target: { value: 'New Partner' } })
    fireEvent.change(screen.getByLabelText('Description'), { target: { value: 'New Description' } })
    fireEvent.change(screen.getByLabelText('Link URL'), { target: { value: 'example.com' } })

    // Submit the form
    fireEvent.click(screen.getByText('Create Sponsor Card'))

    // Check loading state
    expect(screen.getByText('Updating...')).toBeInTheDocument()
  })
}) 