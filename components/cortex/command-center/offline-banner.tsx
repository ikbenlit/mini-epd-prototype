'use client';

/**
 * Offline Banner
 * 
 * Toont een banner wanneer de gebruiker offline is.
 * E5.S2: Offline detection en melding.
 */

import { useState, useEffect } from 'react';
import { WifiOff } from 'lucide-react';
import { cn } from '@/lib/utils';

export function OfflineBanner() {
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    // Initial check
    setIsOffline(!navigator.onLine);

    // Listen for online/offline events
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!isOffline) return null;

  return (
    <div
      className={cn(
        'fixed top-0 left-0 right-0 z-[100] bg-amber-500 text-white px-4 py-2',
        'flex items-center justify-center gap-2 text-sm font-medium',
        'shadow-md'
      )}
      style={{ height: '40px' }}
    >
      <WifiOff className="h-4 w-4" />
      <span>Geen internetverbinding</span>
    </div>
  );
}

/**
 * Hook om te checken of de gebruiker offline is
 */
export function useOffline() {
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    setIsOffline(!navigator.onLine);
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOffline;
}

