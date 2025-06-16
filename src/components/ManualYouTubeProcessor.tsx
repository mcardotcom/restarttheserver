'use client';

import { useState } from 'react';
import { ManualYouTubeProcessorProps } from '@/types';

export default function ManualYouTubeProcessor({ onSuccess }: ManualYouTubeProcessorProps) {
  const [videoUrl, setVideoUrl] = useState('');
  const [title, setTitle] = useState('');
  const [transcript, setTranscript] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      const response = await fetch('/api/manual-process/youtube', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ videoUrl, title, transcript }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to process video');
      }

      setMessage({
        type: 'success',
        text: 'Video processed successfully!',
      });

      setVideoUrl('');
      setTitle('');
      setTranscript('');
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
      <h2 className="text-xl font-semibold text-gray-100 mb-4">Process YouTube Video</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="videoUrl" className="block text-sm font-medium text-gray-300 mb-1">
            Video URL
          </label>
          <input
            type="url"
            id="videoUrl"
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            required
            className="w-full px-4 py-2 bg-zinc-900 border border-zinc-700 rounded-md text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
            placeholder="https://youtube.com/watch?v=..."
          />
        </div>

        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-1">
            Video Title
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="w-full px-4 py-2 bg-zinc-900 border border-zinc-700 rounded-md text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
            placeholder="Enter the video title..."
          />
        </div>

        <div>
          <label htmlFor="transcript" className="block text-sm font-medium text-gray-300 mb-1">
            Video Transcript
          </label>
          <textarea
            id="transcript"
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            required
            rows={6}
            className="w-full px-4 py-2 bg-zinc-900 border border-zinc-700 rounded-md text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
            placeholder="Paste the video transcript here..."
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-zinc-900"
        >
          {isLoading ? 'Processing...' : 'Process Video'}
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