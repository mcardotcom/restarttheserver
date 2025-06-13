'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { isAppError } from '@/lib/error-handling'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const router = useRouter()

  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Global error:', error)
  }, [error])

  const handleRetry = () => {
    reset()
  }

  const handleGoHome = () => {
    router.push('/')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 p-4">
      <div className="max-w-md w-full bg-gray-800 rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold text-red-500 mb-4">
          {isAppError(error) ? error.message : 'Something went wrong'}
        </h1>
        
        {error.digest && (
          <p className="text-sm text-gray-400 mb-4">
            Error ID: {error.digest}
          </p>
        )}

        <div className="space-y-4">
          <button
            onClick={handleRetry}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Try again
          </button>
          
          <button
            onClick={handleGoHome}
            className="w-full px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 transition-colors"
          >
            Go to home page
          </button>
        </div>
      </div>
    </div>
  )
} 