'use client';

import { LoadingSpinnerProps } from '@/types';

export default function LoadingSpinner({ size = 'md', className = '' }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  };

  return (
    <div className={`flex justify-center items-center ${className}`}>
      <div
        className={`${sizeClasses[size]} animate-spin rounded-full border-4 border-zinc-700 border-t-red-500`}
        role="status"
        aria-label="Loading"
      />
    </div>
  );
} 