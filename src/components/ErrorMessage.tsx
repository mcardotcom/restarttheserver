'use client';

import { ErrorMessageProps } from '@/types';

export default function ErrorMessage({ message, className = '' }: ErrorMessageProps) {
  return (
    <div className={`p-4 bg-red-900/50 border border-red-800 rounded-md ${className}`}>
      <p className="text-red-200">{message}</p>
    </div>
  );
} 