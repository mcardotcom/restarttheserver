import { render, act } from '@testing-library/react'
import '@testing-library/jest-dom'
import AuthRedirect from '../AuthRedirect'
import { useRouter } from 'next/navigation'

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}))

describe('AuthRedirect', () => {
  let mockPush: jest.Mock
  let originalLocation: Location

  beforeEach(() => {
    mockPush = jest.fn()
    ;(useRouter as jest.Mock).mockReturnValue({ push: mockPush })
    originalLocation = window.location
  })

  afterEach(() => {
    jest.clearAllMocks()
    window.location = originalLocation
  })

  it('does not redirect when there is no hash', () => {
    Object.defineProperty(window, 'location', {
      value: { hash: '' },
      writable: true
    })

    render(<AuthRedirect />)
    expect(mockPush).not.toHaveBeenCalled()
  })

  it('does not redirect when hash does not contain type parameter', () => {
    Object.defineProperty(window, 'location', {
      value: { hash: '#some=value' },
      writable: true
    })

    render(<AuthRedirect />)
    expect(mockPush).not.toHaveBeenCalled()
  })

  it('redirects to reset password page when type is recovery', () => {
    Object.defineProperty(window, 'location', {
      value: { hash: '#type=recovery&token=123' },
      writable: true
    })

    render(<AuthRedirect />)
    expect(mockPush).toHaveBeenCalledWith('/reset-password#type=recovery&token=123')
  })

  it('handles server-side rendering gracefully', () => {
    const originalWindow = global.window
    Object.defineProperty(global, 'window', {
      value: undefined,
      writable: true
    })

    render(<AuthRedirect />)
    expect(mockPush).not.toHaveBeenCalled()

    Object.defineProperty(global, 'window', {
      value: originalWindow,
      writable: true
    })
  })

  it('preserves all hash parameters when redirecting', () => {
    Object.defineProperty(window, 'location', {
      value: { hash: '#type=recovery&token=123&email=test@example.com' },
      writable: true
    })

    render(<AuthRedirect />)
    expect(mockPush).toHaveBeenCalledWith(
      '/reset-password#type=recovery&token=123&email=test@example.com'
    )
  })

  it('does not redirect for non-recovery types', () => {
    Object.defineProperty(window, 'location', {
      value: { hash: '#type=signup' },
      writable: true
    })

    render(<AuthRedirect />)
    expect(mockPush).not.toHaveBeenCalled()
  })
}) 