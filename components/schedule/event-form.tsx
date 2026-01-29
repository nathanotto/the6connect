'use client';

/**
 * Event Form
 *
 * Form for creating new schedule events
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

export function EventForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
  });
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!selectedDate) {
        setError('Please select a date and time');
        setLoading(false);
        return;
      }

      // Only send non-empty fields
      const payload: any = {
        title: formData.title,
        proposed_start: selectedDate.toISOString(),
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
      });
      setSelectedDate(null);

      // Refresh the page to show new event
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-0 max-w-md">
      {error && (
        <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 px-3 py-2 text-sm mb-0">
          {error}
        </div>
      )}

      {/* Title */}
      <div className="border border-neutral-500 dark:border-neutral-600 p-3 bg-neutral-700/10 dark:bg-neutral-800/20">
        <label htmlFor="title" className="block text-sm font-medium mb-2 text-neutral-800 dark:text-neutral-300">
          Event Title *
        </label>
        <input
          type="text"
          id="title"
          required
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="e.g., Monthly Check-in"
          className="w-full px-3 py-2 border border-neutral-500 dark:border-neutral-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-600 bg-background text-sm"
        />
      </div>

      {/* Description */}
      <div className="border border-neutral-500 dark:border-neutral-600 border-t-0 p-3 bg-neutral-700/10 dark:bg-neutral-800/20">
        <label htmlFor="description" className="block text-sm font-medium mb-2 text-neutral-800 dark:text-neutral-300">
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
          className="w-full px-3 py-2 border border-neutral-500 dark:border-neutral-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-600 bg-background text-sm"
        />
      </div>

      {/* Date/Time */}
      <div className="border border-neutral-500 dark:border-neutral-600 border-t-0 p-3 bg-neutral-700/10 dark:bg-neutral-800/20">
        <label htmlFor="proposed_start" className="block text-sm font-medium mb-2 text-neutral-800 dark:text-neutral-300">
          Date & Time *
        </label>
        <DatePicker
          selected={selectedDate}
          onChange={(date) => setSelectedDate(date)}
          showTimeSelect
          timeFormat="h:mm aa"
          timeIntervals={30}
          dateFormat="MMMM d, yyyy h:mm aa"
          minDate={new Date()}
          placeholderText="Select date and time"
          className="w-full px-3 py-2 border border-neutral-500 dark:border-neutral-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-600 bg-background text-sm"
          calendarClassName="bg-background border border-neutral-500 dark:border-neutral-600 rounded-lg shadow-lg"
          withPortal
          portalId="datepicker-portal"
          required
        />
      </div>

      {/* Submit Button */}
      <div className="border border-neutral-500 dark:border-neutral-600 border-t-0 p-3 bg-neutral-700/10 dark:bg-neutral-800/20">
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 px-4 bg-neutral-700 hover:bg-neutral-800 text-white font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-neutral-600 disabled:opacity-50 disabled:cursor-not-allowed transition text-sm shadow-sm"
        >
          {loading ? 'Creating...' : 'Create Event'}
        </button>
      </div>
    </form>
  );
}
