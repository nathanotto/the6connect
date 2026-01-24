'use client';

/**
 * Profile Picture Upload Component
 *
 * Allows users to upload and update their profile picture
 */

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';

interface ProfilePictureUploadProps {
  currentPictureUrl: string | null;
  userId: string;
}

export function ProfilePictureUpload({
  currentPictureUrl,
  userId,
}: ProfilePictureUploadProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState<string | null>(currentPictureUrl);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file');
      return;
    }

    // Validate file size (5MB like photos)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be less than 5MB');
      return;
    }

    setUploading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('profile_picture', file);

      const response = await fetch('/api/user/profile-picture', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to upload profile picture');
      }

      setPreview(result.url);
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Current Picture */}
      {preview && (
        <div className="flex items-center gap-4">
          <img
            src={preview}
            alt="Profile"
            className="w-24 h-24 rounded-full object-cover border-2 border-foreground/20"
          />
        </div>
      )}

      {/* Upload Button */}
      <div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
          id="profile-picture-upload"
        />
        <label
          htmlFor="profile-picture-upload"
          className={`inline-block px-4 py-2 bg-foreground text-background rounded-lg cursor-pointer hover:opacity-90 transition ${
            uploading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {uploading ? 'Uploading...' : preview ? 'Change Picture' : 'Upload Picture'}
        </label>
        <p className="text-xs text-foreground/60 mt-2">
          Max 5MB • JPG, PNG, GIF, WebP
        </p>
      </div>

      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
}
