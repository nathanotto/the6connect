'use client';

/**
 * Question Submission Form
 *
 * Form for submitting new questions to the group
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function QuestionForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    question_text: '',
    context: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/questions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to submit question');
      }

      // Reset form
      setFormData({
        question_text: '',
        context: '',
      });

      // Refresh the page to show new question
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3 max-w-2xl">
      {error && (
        <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 px-3 py-2 rounded text-sm">
          {error}
        </div>
      )}

      {/* Question */}
      <div>
        <label htmlFor="question_text" className="block text-sm font-medium mb-1">
          Question *
        </label>
        <textarea
          id="question_text"
          required
          rows={2}
          value={formData.question_text}
          onChange={(e) =>
            setFormData({ ...formData, question_text: e.target.value })
          }
          placeholder="What would you like to ask the group?"
          className="w-full px-3 py-1.5 border border-foreground/20 rounded focus:outline-none focus:ring-1 focus:ring-foreground/40 bg-background text-sm"
        />
      </div>

      {/* Context (optional) */}
      <div>
        <label htmlFor="context" className="block text-sm font-medium mb-1">
          Context (optional)
        </label>
        <textarea
          id="context"
          rows={2}
          value={formData.context}
          onChange={(e) =>
            setFormData({ ...formData, context: e.target.value })
          }
          placeholder="Any additional context or background..."
          className="w-full px-3 py-1.5 border border-foreground/20 rounded focus:outline-none focus:ring-1 focus:ring-foreground/40 bg-background text-sm"
        />
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className="w-full py-2 px-4 bg-foreground text-background font-medium rounded hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-foreground disabled:opacity-50 disabled:cursor-not-allowed transition text-sm"
      >
        {loading ? 'Submitting...' : 'Submit Question'}
      </button>
    </form>
  );
}
