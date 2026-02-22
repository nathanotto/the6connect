'use client';

import { useEffect } from 'react';

type Props = {
  storageKey: string;
  extraKeys?: Record<string, string>;
};

export function PageViewTracker({ storageKey, extraKeys }: Props) {
  useEffect(() => {
    localStorage.setItem(storageKey, new Date().toISOString());
    if (extraKeys) {
      Object.entries(extraKeys).forEach(([key, value]) => {
        localStorage.setItem(key, value);
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
