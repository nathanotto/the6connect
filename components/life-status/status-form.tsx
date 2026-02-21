'use client';

/**
 * Check-in Form
 *
 * Form for creating check-ins across different zones
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function StatusForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    zone_other: 'General checkin',
    statuses: ['Typical'] as string[],
    status_other: '',
    support_type: 'Just read this',
    support_type_other: '',
    notes: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate topic is not empty
    if (!formData.zone_other.trim()) {
      setError('Please enter a topic');
      return;
    }

    // Validate at least one feeling is selected
    if (formData.statuses.length === 0) {
      setError('Please select at least one feeling');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/life-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create check-in');
      }

      // Reset form
      setFormData({
        zone_other: 'General checkin',
        statuses: ['Typical'],
        status_other: '',
        support_type: 'Just read this',
        support_type_other: '',
        notes: '',
      });

      // Refresh the page to show new update
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Color mapping for feelings - masculine/serious palette
  const feelingColors: Record<string, string> = {
    'Good': 'border-green-700 dark:border-green-600 hover:bg-green-900/20 dark:hover:bg-green-900/30',
    'Bad': 'border-red-800 dark:border-red-700 hover:bg-red-900/20 dark:hover:bg-red-900/30',
    'Typical': 'border-gray-600 dark:border-gray-500 hover:bg-gray-700/20 dark:hover:bg-gray-700/30',
    'Combo': 'border-blue-700 dark:border-blue-600 hover:bg-blue-900/20 dark:hover:bg-blue-900/30',
    'Other': 'border-slate-600 dark:border-slate-500 hover:bg-slate-700/20 dark:hover:bg-slate-700/30',
  };

  const feelingSelectedColors: Record<string, string> = {
    'Good': 'bg-green-800/20 dark:bg-green-800/30 border-green-600 dark:border-green-500',
    'Bad': 'bg-red-800/20 dark:bg-red-800/30 border-red-600 dark:border-red-500',
    'Typical': 'bg-gray-700/20 dark:bg-gray-600/30 border-gray-500 dark:border-gray-400',
    'Combo': 'bg-blue-800/20 dark:bg-blue-800/30 border-blue-600 dark:border-blue-500',
    'Other': 'bg-slate-700/20 dark:bg-slate-600/30 border-slate-500 dark:border-slate-400',
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-0 max-w-md">
      {error && (
        <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 px-3 py-2 rounded text-sm mb-0">
          {error}
        </div>
      )}

      {/* Topic */}
      <div className="border border-slate-500 dark:border-slate-600 p-3 bg-slate-700/10 dark:bg-slate-800/20">
        <label className="block text-sm font-medium mb-2 text-slate-800 dark:text-slate-300">
          Topic *
        </label>
        <input
          type="text"
          maxLength={50}
          value={formData.zone_other}
          onChange={(e) => setFormData({ ...formData, zone_other: e.target.value })}
          placeholder="General checkin"
          required
          className="w-full px-3 py-2 border border-slate-500 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-600 bg-background text-sm"
        />
      </div>

      {/* I'm feeling... */}
      <div className="border border-foreground/20 border-t-0 p-3 bg-gradient-to-br from-transparent to-foreground/5">
        <label className="block text-sm font-medium mb-2">
          I'm feeling... * (select at least one)
        </label>
        <div className="grid grid-cols-3 gap-0">
          {['Good', 'Bad', 'Typical', 'Combo', 'Other'].map((feeling) => (
            <label
              key={feeling}
              className={`flex items-center gap-1.5 cursor-pointer border p-2 transition ${
                formData.statuses.includes(feeling)
                  ? feelingSelectedColors[feeling]
                  : feelingColors[feeling]
              }`}
            >
              <input
                type="checkbox"
                value={feeling}
                checked={formData.statuses.includes(feeling)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setFormData({ ...formData, statuses: [...formData.statuses, feeling] });
                  } else {
                    setFormData({ ...formData, statuses: formData.statuses.filter(s => s !== feeling) });
                  }
                }}
                className="w-4 h-4"
              />
              <span className="text-sm">{feeling}</span>
            </label>
          ))}
        </div>
        {formData.statuses.includes('Other') && (
          <input
            type="text"
            value={formData.status_other}
            onChange={(e) => setFormData({ ...formData, status_other: e.target.value })}
            placeholder="Describe how you're feeling..."
            required
            className="w-full mt-2 px-3 py-2 border border-purple-300 dark:border-purple-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-background text-sm"
          />
        )}
      </div>

      {/* I want you to... */}
      <div className="border border-stone-500 dark:border-stone-600 border-t-0 p-3 bg-stone-700/10 dark:bg-stone-800/20">
        <label className="block text-sm font-medium mb-2 text-stone-800 dark:text-stone-300">
          I want you to... *
        </label>
        <div className="flex flex-wrap gap-2">
          {['Just read this', 'Listen', 'Respond', 'Be supportive', 'Advise', 'Other'].map((option) => (
            <label
              key={option}
              className={`flex items-center gap-1.5 cursor-pointer px-3 py-1.5 rounded-md border transition ${
                formData.support_type === option
                  ? 'bg-stone-700/20 dark:bg-stone-700/40 border-stone-600 dark:border-stone-500'
                  : 'border-stone-500 dark:border-stone-600 hover:bg-stone-700/10 dark:hover:bg-stone-700/20'
              }`}
            >
              <input
                type="radio"
                name="support_type"
                value={option}
                checked={formData.support_type === option}
                onChange={(e) => setFormData({ ...formData, support_type: e.target.value })}
                required
                className="w-4 h-4 accent-stone-700"
              />
              <span className="text-sm">{option}</span>
            </label>
          ))}
        </div>
        {formData.support_type === 'Other' && (
          <input
            type="text"
            value={formData.support_type_other}
            onChange={(e) => setFormData({ ...formData, support_type_other: e.target.value })}
            placeholder="What do you need?"
            required
            className="w-full mt-2 px-3 py-2 border border-stone-500 dark:border-stone-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-600 bg-background text-sm"
          />
        )}
      </div>

      {/* Notes */}
      <div className="border border-foreground/20 border-t-0 p-3 bg-foreground/5">
        <label htmlFor="notes" className="block text-sm font-medium mb-1">
          Checkin details:
        </label>
        <textarea
          id="notes"
          rows={3}
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          placeholder="Add any additional thoughts or context..."
          className="w-full px-3 py-2 border border-foreground/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-foreground/40 bg-background text-sm"
        />
      </div>

      {/* Submit Button */}
      <div className="border border-slate-500 dark:border-slate-600 border-t-0 p-3 bg-slate-700/10 dark:bg-slate-800/20">
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 px-4 bg-slate-700 hover:bg-slate-800 text-white font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition text-sm shadow-sm"
        >
          {loading ? 'Sharing...' : 'Share with the Six'}
        </button>
      </div>
    </form>
  );
}
