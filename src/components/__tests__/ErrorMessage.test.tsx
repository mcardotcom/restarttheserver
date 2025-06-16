import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import ErrorMessage from '../ErrorMessage'

describe('ErrorMessage', () => {
  it('renders error message correctly', () => {
    const errorMessage = 'Something went wrong'
    render(<ErrorMessage message={errorMessage} />)
    
    expect(screen.getByText('Error:')).toBeInTheDocument()
    expect(screen.getByText(errorMessage)).toBeInTheDocument()
  })

  it('has correct ARIA role', () => {
    render(<ErrorMessage message="Test error" />)
    expect(screen.getByRole('alert')).toBeInTheDocument()
  })

  it('applies custom className', () => {
    render(<ErrorMessage message="Test error" className="custom-class" />)
    const container = screen.getByRole('alert')
    expect(container).toHaveClass('custom-class')
  })

  it('has correct styling classes', () => {
    render(<ErrorMessage message="Test error" />)
    const container = screen.getByRole('alert')
    expect(container).toHaveClass(
      'bg-red-50',
      'border',
      'border-red-200',
      'text-red-700',
      'px-4',
      'py-3',
      'rounded',
      'relative'
    )
  })

  it('renders error message with HTML content safely', () => {
    const errorMessage = '<script>alert("xss")</script>'
    render(<ErrorMessage message={errorMessage} />)
    
    const messageElement = screen.getByText(errorMessage)
    expect(messageElement).toBeInTheDocument()
    expect(messageElement.innerHTML).toBe(errorMessage)
  })

  it('maintains responsive design classes', () => {
    render(<ErrorMessage message="Test error" />)
    const messageSpan = screen.getByText('Test error')
    expect(messageSpan).toHaveClass('block', 'sm:inline')
  })
}) 