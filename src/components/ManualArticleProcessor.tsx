'use client';

import { useState } from 'react';

interface ManualArticleProcessorProps {
  onSuccess?: () => void;
}

export default function ManualArticleProcessor({ onSuccess }: ManualArticleProcessorProps) {
  const [url, setUrl] = useState('');
  const [status, setStatus] = useState<{
    type: 'success' | 'error' | null;
    message: string;
  }>({ type: null, message: '' });
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setStatus({ type: null, message: '' });

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

      setStatus({
        type: 'success',
        message: 'Article processed successfully! You can find it in the drafts section.',
      });
      setUrl('');
      
      // Call the onSuccess callback to trigger a refresh
      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      setStatus({
        type: 'error',
        message: error.message,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="bg-zinc-900 rounded-lg p-6 border border-zinc-800">
      <h2 className="text-xl font-semibold mb-4 text-white">Process Article Manually</h2>
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
            placeholder="https://example.com/article"
            required
            className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
          />
        </div>
        <button
          type="submit"
          disabled={isProcessing}
          className="w-full px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-zinc-900"
        >
          {isProcessing ? 'Processing...' : 'Process Article'}
        </button>
      </form>
      {status.type && (
        <div
          className={`mt-4 p-4 rounded-md ${
            status.type === 'success' 
              ? 'bg-green-900/50 border border-green-800 text-green-200' 
              : 'bg-red-900/50 border border-red-800 text-red-200'
          }`}
        >
          {status.message}
        </div>
      )}
    </div>
  );
} 