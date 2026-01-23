'use client';

/**
 * Event Form
 *
 * Form for creating new schedule events
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function EventForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    proposed_start: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Only send non-empty fields
      const payload: any = {
        title: formData.title,
        proposed_start: formData.proposed_start,
      };

      if (formData.description) {
        payload.description = formData.description;
      }

      const response = await fetch('/api/schedule', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create event');
      }

      // Reset form
      setFormData({
        title: '',
        description: '',
        proposed_start: '',
      });

      // Refresh the page to show new event
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

      {/* Title */}
      <div>
        <label htmlFor="title" className="block text-sm font-medium mb-1">
          Event Title *
        </label>
        <input
          type="text"
          id="title"
          required
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="e.g., Monthly Check-in"
          className="w-full px-3 py-1.5 border border-foreground/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-foreground/40 bg-background text-sm"
        />
      </div>

      {/* Description */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium mb-1">
          Description (optional)
        </label>
        <textarea
          id="description"
          rows={2}
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          placeholder="Additional details about the event..."
          className="w-full px-3 py-1.5 border border-foreground/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-foreground/40 bg-background text-sm"
        />
      </div>

      {/* Date/Time */}
      <div>
        <label htmlFor="proposed_start" className="block text-sm font-medium mb-1">
          Date & Time *
        </label>
        <input
          type="datetime-local"
          id="proposed_start"
          required
          value={formData.proposed_start}
          onChange={(e) =>
            setFormData({ ...formData, proposed_start: e.target.value })
          }
          className="w-full px-3 py-1.5 border border-foreground/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-foreground/40 bg-background text-sm"
        />
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className="w-full py-2 px-4 bg-foreground text-background font-medium rounded-lg hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-foreground disabled:opacity-50 disabled:cursor-not-allowed transition text-sm"
      >
        {loading ? 'Creating...' : 'Create Event'}
      </button>
    </form>
  );
}
