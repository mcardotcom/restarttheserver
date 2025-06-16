import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import LoadingSpinner from '../LoadingSpinner'

describe('LoadingSpinner', () => {
  it('renders with default size (md)', () => {
    render(<LoadingSpinner />)
    const spinner = screen.getByRole('status')
    expect(spinner).toHaveClass('w-8 h-8')
  })

  it('renders with small size', () => {
    render(<LoadingSpinner size="sm" />)
    const spinner = screen.getByRole('status')
    expect(spinner).toHaveClass('w-4 h-4')
  })

  it('renders with large size', () => {
    render(<LoadingSpinner size="lg" />)
    const spinner = screen.getByRole('status')
    expect(spinner).toHaveClass('w-12 h-12')
  })

  it('applies custom className', () => {
    render(<LoadingSpinner className="custom-class" />)
    const container = screen.getByRole('status').parentElement
    expect(container).toHaveClass('custom-class')
  })

  it('has correct ARIA attributes', () => {
    render(<LoadingSpinner />)
    const spinner = screen.getByRole('status')
    expect(spinner).toHaveAttribute('aria-label', 'Loading')
  })

  it('has correct animation classes', () => {
    render(<LoadingSpinner />)
    const spinner = screen.getByRole('status')
    expect(spinner).toHaveClass('animate-spin')
  })

  it('has correct border classes', () => {
    render(<LoadingSpinner />)
    const spinner = screen.getByRole('status')
    expect(spinner).toHaveClass('border-4', 'border-gray-200', 'border-t-blue-600')
  })
}) 