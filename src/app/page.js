'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      router.replace('/dashboard');
    } else {
      router.replace('/login');
    }
  }, [router]);

  return (
    <div className="flex flex-1 items-center justify-center bg-gray-50 min-h-screen">
      <div className="text-center space-y-4">
        <div className="w-12 h-12 border-4 border-[#552479] border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-sm font-semibold text-gray-500">Loading Student CBT Portal...</p>
      </div>
    </div>
  );
}
