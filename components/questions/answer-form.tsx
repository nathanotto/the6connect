'use client';

/**
 * Answer Form
 *
 * Form for submitting answers to questions
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface AnswerFormProps {
  questionId: string;
}

export function AnswerForm({ questionId }: AnswerFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [answerText, setAnswerText] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch(`/api/questions/${questionId}/answers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ answer_text: answerText }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to submit answer');
      }

      // Reset form
      setAnswerText('');

      // Refresh the page to show new answer
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-0 max-w-md border border-neutral-500 dark:border-neutral-600 bg-neutral-100 dark:bg-neutral-800/30">
      {error && (
        <div className="bg-red-50 dark:bg-red-950 border-b border-neutral-500 dark:border-neutral-600 text-red-800 dark:text-red-200 px-3 py-2 text-sm">
          {error}
        </div>
      )}

      <div className="flex gap-0">
        <textarea
          required
          rows={2}
          value={answerText}
          onChange={(e) => setAnswerText(e.target.value)}
          placeholder="Your answer..."
          className="flex-1 px-3 py-2 border-r border-neutral-500 dark:border-neutral-600 focus:outline-none focus:ring-2 focus:ring-neutral-600 bg-white dark:bg-neutral-900/30 text-sm resize-none"
        />
        <button
          type="submit"
          disabled={loading}
          className="py-2 px-4 bg-neutral-700 hover:bg-neutral-800 text-white font-medium focus:outline-none focus:ring-2 focus:ring-neutral-600 disabled:opacity-50 disabled:cursor-not-allowed transition text-sm"
        >
          {loading ? '...' : 'Submit'}
        </button>
      </div>
    </form>
  );
}
