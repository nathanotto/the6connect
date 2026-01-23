'use client';

/**
 * Commitment Creation Form
 *
 * Form for creating new commitments
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function CommitmentForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    task: '',
    outcome: '',
    deadline: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/commitments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create commitment');
      }

      // Reset form
      setFormData({
        task: '',
        outcome: '',
        deadline: '',
      });

      // Refresh the page to show new commitment
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3 max-w-md">
      {error && (
        <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 px-3 py-2 rounded text-sm">
          {error}
        </div>
      )}

      {/* Task */}
      <div>
        <label htmlFor="task" className="block text-sm font-medium mb-1">
          Task *
        </label>
        <input
          type="text"
          id="task"
          required
          value={formData.task}
          onChange={(e) => setFormData({ ...formData, task: e.target.value })}
          placeholder="What are you committing to?"
          className="w-full px-3 py-1.5 border border-foreground/20 rounded focus:outline-none focus:ring-1 focus:ring-foreground/40 bg-background text-sm"
        />
      </div>

      {/* Outcome */}
      <div>
        <label htmlFor="outcome" className="block text-sm font-medium mb-1">
          Expected Outcome *
        </label>
        <textarea
          id="outcome"
          required
          rows={2}
          value={formData.outcome}
          onChange={(e) =>
            setFormData({ ...formData, outcome: e.target.value })
          }
          placeholder="What will success look like?"
          className="w-full px-3 py-1.5 border border-foreground/20 rounded focus:outline-none focus:ring-1 focus:ring-foreground/40 bg-background text-sm"
        />
      </div>

      {/* Deadline */}
      <div>
        <label htmlFor="deadline" className="block text-sm font-medium mb-1">
          Deadline *
        </label>
        <input
          type="date"
          id="deadline"
          required
          value={formData.deadline}
          onChange={(e) =>
            setFormData({ ...formData, deadline: e.target.value })
          }
          min={new Date().toISOString().split('T')[0]}
          className="w-full px-3 py-1.5 border border-foreground/20 rounded focus:outline-none focus:ring-1 focus:ring-foreground/40 bg-background text-sm"
        />
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className="w-full py-2 px-4 bg-foreground text-background font-medium rounded hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-foreground disabled:opacity-50 disabled:cursor-not-allowed transition text-sm"
      >
        {loading ? 'Creating...' : 'Create Commitment'}
      </button>
    </form>
  );
}
