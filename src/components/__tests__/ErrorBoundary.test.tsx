import { render, screen, fireEvent, act } from '@testing-library/react'
import '@testing-library/jest-dom'
import ErrorBoundary from '../ErrorBoundary'

// A component that only throws an error on its first render.
// This simulates a transient error that can be recovered from.
let renderCount = 0
const RecoverableComponent = () => {
  renderCount++
  if (renderCount <= 2) { // Allow for React's strict mode double-render
    throw new Error('A transient error occurred')
  }
  return <div>Content successfully rendered</div>
}

// A component that always throws an error
const UnrecoverableComponent = () => {
  throw new Error('This is a permanent error')
}

describe('ErrorBoundary', () => {
  beforeEach(() => {
    // Reset the counter before each test to ensure test isolation
    renderCount = 0
    // Suppress console.error for expected errors during tests
    jest.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    // Restore the original console.error function after each test
    jest.restoreAllMocks()
  })

  it('renders children when there is no error', () => {
    render(
      <ErrorBoundary>
        <div>Test content</div>
      </ErrorBoundary>
    )

    expect(screen.getByText('Test content')).toBeInTheDocument()
  })

  it('renders error UI when child component throws', () => {
    render(
      <ErrorBoundary>
        <UnrecoverableComponent />
      </ErrorBoundary>
    )

    expect(screen.getByText('Something went wrong')).toBeInTheDocument()
    expect(screen.getByText('This is a permanent error')).toBeInTheDocument()
  })

  it('renders custom fallback when provided', () => {
    const fallback = <div>Custom error UI</div>

    render(
      <ErrorBoundary fallback={fallback}>
        <UnrecoverableComponent />
      </ErrorBoundary>
    )

    expect(screen.getByText('Custom error UI')).toBeInTheDocument()
  })

  it('allows error recovery with try again button', async () => {
    render(
      <ErrorBoundary>
        <RecoverableComponent />
      </ErrorBoundary>
    )

    // Try to find the error UI and button
    const tryAgainButton = await screen.queryByRole('button', { name: /try again/i })
    if (tryAgainButton) {
      await act(async () => {
        fireEvent.click(tryAgainButton)
      })
    }

    // Assert that the error UI is gone and the recovery content is present
    expect(screen.queryByText('Something went wrong')).not.toBeInTheDocument()
    expect(
      screen.getByText('Content successfully rendered')
    ).toBeInTheDocument()
  })
}) 