import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import SponsorCard from '../SponsorCard'

describe('SponsorCard', () => {
  const defaultProps = {
    title: 'Test Sponsor Title',
    summary: 'This is a test sponsor summary',
    url: 'https://example.com',
    category: 'Test Category',
    partner: 'Test Partner'
  }

  it('renders with default values when no props are provided', () => {
    render(<SponsorCard />)

    expect(screen.getByText('Try Claude 3.5 Today – Get 1 Month Free')).toBeInTheDocument()
    expect(screen.getByText('Experience the future of AI with our top-rated Claude model — claim your free trial.')).toBeInTheDocument()
    expect(screen.getByText('Promotion')).toBeInTheDocument()
    expect(screen.getByText('Ad')).toBeInTheDocument()
  })

  it('renders with provided props', () => {
    render(<SponsorCard {...defaultProps} />)

    expect(screen.getByText('Test Sponsor Title')).toBeInTheDocument()
    expect(screen.getByText('This is a test sponsor summary')).toBeInTheDocument()
    expect(screen.getByText('Test Category')).toBeInTheDocument()
    expect(screen.getByText('Test Partner')).toBeInTheDocument()
  })

  it('renders sponsored label', () => {
    render(<SponsorCard {...defaultProps} />)
    expect(screen.getByText('🚀 SPONSORED')).toBeInTheDocument()
  })

  it('renders sponsored link text', () => {
    render(<SponsorCard {...defaultProps} />)
    expect(screen.getByText('Sponsored Link')).toBeInTheDocument()
  })

  it('renders link with correct attributes', () => {
    render(<SponsorCard {...defaultProps} />)
    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', defaultProps.url)
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', 'noopener noreferrer')
  })

  it('renders with correct ARIA attributes', () => {
    render(<SponsorCard {...defaultProps} />)
    const article = screen.getByRole('article')
    expect(article).toHaveAttribute('aria-labelledby', `sponsor-${defaultProps.title}`)
  })

  it('applies hover styles', () => {
    render(<SponsorCard {...defaultProps} />)
    const article = screen.getByRole('article')
    expect(article).toHaveClass('hover:shadow-red-500/30')
    expect(article).toHaveClass('hover:border-red-500/50')
  })

  it('applies transition styles', () => {
    render(<SponsorCard {...defaultProps} />)
    const article = screen.getByRole('article')
    expect(article).toHaveClass('transition-shadow')
    expect(article).toHaveClass('duration-300')
  })

  it('renders with correct text colors', () => {
    render(<SponsorCard {...defaultProps} />)
    
    const sponsoredLabel = screen.getByText('🚀 SPONSORED')
    expect(sponsoredLabel).toHaveClass('text-red-500')

    const title = screen.getByText(defaultProps.title)
    expect(title).toHaveClass('text-zinc-100')

    const summary = screen.getByText(defaultProps.summary)
    expect(summary).toHaveClass('text-zinc-400')

    const category = screen.getByText(`Category: ${defaultProps.category}`)
    expect(category).toHaveClass('text-zinc-400')
  })

  it('renders with correct layout classes', () => {
    render(<SponsorCard {...defaultProps} />)
    const article = screen.getByRole('article')
    expect(article).toHaveClass('flex')
    expect(article).toHaveClass('flex-col')
    expect(article).toHaveClass('min-h-[340px]')
    expect(article).toHaveClass('max-w-[370px]')
  })
}) 