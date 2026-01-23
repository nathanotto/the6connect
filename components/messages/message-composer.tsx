'use client';

/**
 * Message Composer
 *
 * Form for sending messages
 */

import { useState } from 'react';

interface MessageComposerProps {
  recipientId: string;
  onMessageSent?: () => void;
}

export function MessageComposer({ recipientId, onMessageSent }: MessageComposerProps) {
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

      // Notify parent
      if (onMessageSent) {
        onMessageSent();
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      {error && (
        <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 px-3 py-2 rounded text-sm">
          {error}
        </div>
      )}

      <div className="flex gap-2">
        <input
          type="text"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Type your message..."
          className="flex-1 px-3 py-2 border border-foreground/20 rounded focus:outline-none focus:ring-1 focus:ring-foreground/40 bg-background text-sm"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading || !content.trim()}
          className="py-2 px-4 bg-foreground text-background font-medium rounded hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-foreground disabled:opacity-50 disabled:cursor-not-allowed transition text-sm"
        >
          {loading ? 'Sending...' : 'Send'}
        </button>
      </div>
    </form>
  );
}
