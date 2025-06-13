'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AuthRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Check if we're on the client side
    if (typeof window === 'undefined') return;

    // Get the hash from the URL
    const hash = window.location.hash;
    if (!hash) return;

    // Parse the hash parameters
    const params = new URLSearchParams(hash.substring(1));
    const type = params.get('type');

    // If this is a password reset link, redirect to the reset password page
    if (type === 'recovery') {
      // Preserve the hash for the reset password page
      router.push(`/reset-password${hash}`);
    }
  }, [router]);

  return null; // This component doesn't render anything
} 