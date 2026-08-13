"use client";
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function AnalyticsTracker() {
  const pathname = usePathname();

  useEffect(() => {
    // Skip tracking for api, next internal, and admin panel
    if (!pathname || pathname.startsWith('/api') || pathname.startsWith('/_next') || pathname.startsWith('/hq-panel-7x9q-secret')) {
      return;
    }

    fetch('/api/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path: pathname })
    }).catch(console.error);
  }, [pathname]);

  return null;
}
