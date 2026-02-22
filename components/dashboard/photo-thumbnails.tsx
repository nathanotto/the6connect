'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import Link from 'next/link';

type Photo = {
  id: string;
  photo_url: string;
  caption: string | null;
  created_at: string;
  user: {
    display_name: string | null;
    full_name: string;
  };
};

export function PhotoThumbnails({ photos }: { photos: Photo[] }) {
  const [selected, setSelected] = useState<Photo | null>(null);

  useEffect(() => {
    if (!selected) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelected(null);
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [selected]);

  return (
    <>
      <div className="space-y-0 mb-3">
        {photos.map((photo) => (
          <div
            key={photo.id}
            className="flex gap-3 border border-stone-500 dark:border-stone-600 p-2 bg-white dark:bg-stone-900/30"
          >
            <button
              onClick={() => setSelected(photo)}
              className="shrink-0 focus:outline-none focus:ring-2 focus:ring-stone-400 rounded"
              aria-label="View full photo"
            >
              <img
                src={photo.photo_url}
                alt={photo.caption || 'Photo'}
                className="w-16 h-16 object-cover rounded border-2 border-stone-500 dark:border-stone-600 hover:opacity-80 transition cursor-pointer"
              />
            </button>
            <div className="flex-1 min-w-0 text-sm">
              <p className="font-medium text-xs text-stone-800 dark:text-stone-300">
                {photo.user.display_name || photo.user.full_name}
              </p>
              <p className="text-xs text-foreground/60 truncate">{photo.caption || 'No caption'}</p>
              <p className="text-xs text-stone-600 dark:text-stone-400">
                {format(new Date(photo.created_at), 'MMM d, h:mm a')}
              </p>
            </div>
          </div>
        ))}
      </div>

      <Link
        href="/dashboard/photos"
        className="text-sm text-stone-700 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200 underline font-medium"
      >
        View all photos →
      </Link>

      {/* Lightbox */}
      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setSelected(null)}
        >
          <div
            className="relative max-w-3xl w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelected(null)}
              className="absolute -top-8 right-0 text-white/80 hover:text-white text-2xl leading-none"
              aria-label="Close"
            >
              ×
            </button>
            <img
              src={selected.photo_url}
              alt={selected.caption || 'Photo'}
              className="w-full max-h-[80vh] object-contain rounded"
            />
            {(selected.caption || selected.user) && (
              <div className="mt-2 text-sm text-white/80 text-center">
                <span className="font-medium">{selected.user.display_name || selected.user.full_name}</span>
                {selected.caption && <span> — {selected.caption}</span>}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
