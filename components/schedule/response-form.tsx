'use client';

/**
 * Response Form
 *
 * Form for submitting availability response to event
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface ResponseFormProps {
  eventId: string;
  currentResponse?: {
    response: string;
    notes?: string;
  };
}

export function ResponseForm({ eventId, currentResponse }: ResponseFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    response: currentResponse?.response || '',
    notes: currentResponse?.notes || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch(`/api/schedule/${eventId}/responses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to submit response');
      }

      // Refresh the page to show updated response
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

      {/* Response Selection */}
      <div>
        <label htmlFor="response" className="block text-sm font-medium mb-1">
          Your Availability *
        </label>
        <select
          id="response"
          required
          value={formData.response}
          onChange={(e) => setFormData({ ...formData, response: e.target.value })}
          className="w-full px-3 py-1.5 border border-foreground/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-foreground/40 bg-background text-sm"
        >
          <option value="">Select your availability...</option>
          <option value="available">Available - I can attend</option>
          <option value="maybe">Maybe - Tentative</option>
          <option value="unavailable">Unavailable - Cannot attend</option>
        </select>
      </div>

      {/* Optional Notes */}
      <div>
        <label htmlFor="notes" className="block text-sm font-medium mb-1">
          Notes (optional)
        </label>
        <textarea
          id="notes"
          rows={2}
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          placeholder="Any additional comments..."
          className="w-full px-3 py-1.5 border border-foreground/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-foreground/40 bg-background text-sm"
        />
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className="w-full py-2 px-4 bg-foreground text-background font-medium rounded-lg hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-foreground disabled:opacity-50 disabled:cursor-not-allowed transition text-sm"
      >
        {loading ? 'Saving...' : currentResponse ? 'Update Response' : 'Submit Response'}
      </button>
    </form>
  );
}
