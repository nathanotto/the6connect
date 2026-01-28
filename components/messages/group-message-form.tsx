'use client';

/**
 * Group Message Form
 *
 * Form for posting to group chat
 */

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export function GroupMessageForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [content, setContent] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea as content changes
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }, [content]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!content.trim()) return;

    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/group-messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: content.trim() }),
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
    <form onSubmit={handleSubmit} className="space-y-1.5">
      {error && (
        <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 px-1.5 py-0.5 rounded text-xs">
          {error}
        </div>
      )}

      <div className="flex gap-2">
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Message The Six"
          rows={3}
          className="flex-1 px-2 py-1 border border-foreground/20 rounded focus:outline-none focus:ring-1 focus:ring-foreground/40 bg-background text-xs resize-none"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading || !content.trim()}
          className="py-1 px-3 bg-foreground text-background font-medium rounded hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-foreground disabled:opacity-50 disabled:cursor-not-allowed transition text-xs"
        >
          {loading ? '...' : 'Send'}
        </button>
      </div>
    </form>
  );
}
