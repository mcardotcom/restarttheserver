'use client';

import { useState } from 'react';
import { ManualArticleProcessorProps } from '@/types';

export default function ManualArticleProcessor({ onSuccess }: ManualArticleProcessorProps) {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      const response = await fetch('/api/manual-process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to process article');
      }

      setMessage({
        type: 'success',
        text: 'Article processed successfully!',
      });

      setUrl('');
      onSuccess?.();
    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'An unexpected error occurred',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-zinc-800 rounded-lg p-6">
      <h2 className="text-xl font-semibold text-gray-100 mb-4">Process Article Manually</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="url" className="block text-sm font-medium text-gray-300 mb-1">
            Article URL
          </label>
          <input
            type="url"
            id="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            required
            className="w-full px-4 py-2 bg-zinc-900 border border-zinc-700 rounded-md text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
            placeholder="https://example.com/article"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-zinc-900"
        >
          {isLoading ? 'Processing...' : 'Process Article'}
        </button>

        {message && (
          <div
            className={`p-4 rounded-md ${
              message.type === 'success'
                ? 'bg-green-900/50 border border-green-800 text-green-200'
                : 'bg-red-900/50 border border-red-800 text-red-200'
            }`}
          >
            {message.text}
          </div>
        )}
      </form>
    </div>
  );
} 