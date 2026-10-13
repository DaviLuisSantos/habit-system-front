'use client';

import { useEffect } from 'react';

export function PwaRegister() {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!('serviceWorker' in navigator)) return;

    const isLocalhost =
      window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1';

    if (process.env.NODE_ENV !== 'production' && isLocalhost) return;

    navigator.serviceWorker.register('/sw.js').catch(() => {
      // Sem service worker o app continua funcionando normalmente (apenas sem offline).
    });
  }, []);

  return null;
}