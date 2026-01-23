'use client';

/**
 * Photo Upload Form
 *
 * Supports both paste from clipboard and file upload
 */

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

interface PhotoUploadFormProps {
  currentUserId: string;
}

export function PhotoUploadForm({ currentUserId }: PhotoUploadFormProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [caption, setCaption] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  // Handle paste from clipboard
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const file = items[i].getAsFile();
          if (file) {
            handleImageFile(file);
            e.preventDefault();
          }
        }
      }
    };

    document.addEventListener('paste', handlePaste);
    return () => document.removeEventListener('paste', handlePaste);
  }, []);

  const handleImageFile = (file: File) => {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file');
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be less than 5MB');
      return;
    }

    setImageFile(file);
    setError('');

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageFile(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!imageFile) {
      setError('Please select or paste an image');
      return;
    }

    setUploading(true);
    setError('');

    try {
      // Create form data
      const formData = new FormData();
      formData.append('photo', imageFile);
      formData.append('caption', caption);

      const response = await fetch('/api/photos', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to upload photo');
      }

      // Reset form
      setCaption('');
      setImageFile(null);
      setImagePreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      // Refresh the page to show new photo
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const clearImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 px-4 py-3 rounded text-sm">
          {error}
        </div>
      )}

      {/* Image Preview or Upload Area */}
      <div>
        {imagePreview ? (
          <div className="relative border-2 border-foreground/20 rounded-lg overflow-hidden">
            <img
              src={imagePreview}
              alt="Preview"
              className="w-full h-auto max-h-96 object-contain"
            />
            <button
              type="button"
              onClick={clearImage}
              className="absolute top-2 right-2 bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600 transition text-sm"
            >
              Remove
            </button>
          </div>
        ) : (
          <div className="border-2 border-dashed border-foreground/20 rounded-lg p-8 text-center">
            <div className="space-y-3">
              <p className="text-foreground/60">
                <strong>Paste</strong> an image (Cmd/Ctrl + V) or click to upload
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
                id="photo-upload"
              />
              <label
                htmlFor="photo-upload"
                className="inline-block px-4 py-2 bg-foreground text-background rounded-lg cursor-pointer hover:opacity-90 transition"
              >
                Choose File
              </label>
              <p className="text-xs text-foreground/40">
                Max 5MB • JPG, PNG, GIF, WebP
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Caption */}
      <div>
        <label htmlFor="caption" className="block text-sm font-medium mb-2">
          Caption (optional)
        </label>
        <textarea
          id="caption"
          rows={3}
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          placeholder="Add a caption to your photo..."
          className="w-full px-3 py-2 border border-foreground/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-foreground/40 bg-background"
        />
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={uploading || !imageFile}
        className="w-full py-3 px-4 bg-foreground text-background font-medium rounded-lg hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-foreground disabled:opacity-50 disabled:cursor-not-allowed transition"
      >
        {uploading ? 'Uploading...' : 'Upload Photo'}
      </button>
    </form>
  );
}
