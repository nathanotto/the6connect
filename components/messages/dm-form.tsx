'use client';

/**
 * Direct Message Form
 *
 * Small form for sending DM to a specific user
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface DMFormProps {
  recipientId: string;
  recipientName: string;
}

export function DMForm({ recipientId, recipientName }: DMFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [content, setContent] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!content.trim()) return;

    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recipient_id: recipientId,
          content: content.trim(),
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to send message');
      }

      // Reset form
      setContent('');

      // Refresh to show new message
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-0 border border-stone-500 dark:border-stone-600 bg-stone-100 dark:bg-stone-800/30">
      {error && (
        <div className="bg-red-50 dark:bg-red-950 border-b border-stone-500 dark:border-stone-600 text-red-800 dark:text-red-200 px-2 py-1 text-xs">
          {error}
        </div>
      )}

      <div className="flex gap-0">
        <input
          type="text"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={`Message ${recipientName}...`}
          className="flex-1 px-3 py-2 border-r border-stone-500 dark:border-stone-600 focus:outline-none focus:ring-2 focus:ring-stone-600 bg-white dark:bg-stone-900/30 text-sm"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading || !content.trim()}
          className="py-2 px-4 bg-stone-700 hover:bg-stone-800 text-white font-medium focus:outline-none focus:ring-2 focus:ring-stone-600 disabled:opacity-50 disabled:cursor-not-allowed transition text-sm"
        >
          {loading ? '...' : 'Send'}
        </button>
      </div>
    </form>
  );
}
