'use client';

/**
 * Photo List Component
 *
 * Displays photos in reverse chronological order
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import Image from 'next/image';

interface Photo {
  id: string;
  user_id: string;
  photo_url: string;
  caption: string | null;
  created_at: string;
  user: {
    id: string;
    full_name: string;
    display_name: string | null;
  };
}

interface PhotoListProps {
  photos: Photo[];
  currentUserId: string;
}

export function PhotoList({ photos, currentUserId }: PhotoListProps) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (photoId: string) => {
    if (!confirm('Are you sure you want to delete this photo?')) {
      return;
    }

    setDeletingId(photoId);

    try {
      const response = await fetch(`/api/photos/${photoId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete photo');
      }

      router.refresh();
    } catch (error) {
      alert('Error deleting photo');
      setDeletingId(null);
    }
  };

  if (photos.length === 0) {
    return (
      <p className="text-center text-foreground/60 py-12">
        No photos yet. Be the first to share!
      </p>
    );
  }

  return (
    <div className="space-y-6">
      {photos.map((photo) => {
        const isOwnPhoto = photo.user_id === currentUserId;
        const userName = photo.user.display_name || photo.user.full_name;

        return (
          <div
            key={photo.id}
            className="border border-foreground/20 rounded-lg overflow-hidden bg-background"
          >
            {/* Photo */}
            <div className="relative w-full bg-foreground/5">
              <img
                src={photo.photo_url}
                alt={photo.caption || 'Photo'}
                className="w-full h-auto max-h-[600px] object-contain"
              />
            </div>

            {/* Info Bar */}
            <div className="p-4 space-y-2">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-sm">{userName}</span>
                    <span className="text-xs text-foreground/60">
                      {format(new Date(photo.created_at), 'MMM d, yyyy h:mm a')}
                    </span>
                  </div>
                  {photo.caption && (
                    <p className="text-foreground/80">{photo.caption}</p>
                  )}
                </div>

                {/* Delete Button - Only for own photos */}
                {isOwnPhoto && (
                  <button
                    onClick={() => handleDelete(photo.id)}
                    disabled={deletingId === photo.id}
                    className="text-red-500 hover:text-red-600 text-sm px-3 py-1 rounded hover:bg-red-50 dark:hover:bg-red-950 transition disabled:opacity-50"
                  >
                    {deletingId === photo.id ? 'Deleting...' : 'Delete'}
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
