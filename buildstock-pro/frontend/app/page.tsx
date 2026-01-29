'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to landing page
    router.replace('/landing');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-emerald-50">
      <div className="text-center">
        <div className="animate-pulse text-2xl font-semibold text-gray-700 mb-4">
          BuildStop Pro
        </div>
        <div className="text-gray-500">Loading...</div>
      </div>
    </div>
  );
}
