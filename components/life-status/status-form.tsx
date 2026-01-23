'use client';

/**
 * Life Status Update Form
 *
 * Form for creating/updating life status across different areas
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface LifeArea {
  id: string;
  name: string;
  description: string;
  icon: string;
}

interface StatusFormProps {
  lifeAreas: LifeArea[];
}

export function StatusForm({ lifeAreas }: StatusFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    life_area_id: '',
    status: '',
    mood_rating: 5,
    notes: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
        throw new Error(result.error || 'Failed to create update');
      }

      // Reset form
      setFormData({
        life_area_id: '',
        status: '',
        mood_rating: 5,
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

  return (
    <form onSubmit={handleSubmit} className="space-y-3 max-w-md">
      {error && (
        <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 px-3 py-2 rounded text-sm">
          {error}
        </div>
      )}

      {/* Life Area Selection */}
      <div>
        <label htmlFor="life_area" className="block text-sm font-medium mb-1">
          Life Area *
        </label>
        <select
          id="life_area"
          required
          value={formData.life_area_id}
          onChange={(e) =>
            setFormData({ ...formData, life_area_id: e.target.value })
          }
          className="w-full px-3 py-1.5 border border-foreground/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-foreground/40 bg-background text-sm"
        >
          <option value="">Select a life area...</option>
          {lifeAreas.map((area) => (
            <option key={area.id} value={area.id}>
              {area.name}
            </option>
          ))}
        </select>
      </div>

      {/* Status */}
      <div>
        <label htmlFor="status" className="block text-sm font-medium mb-1">
          Status *
        </label>
        <select
          id="status"
          required
          value={formData.status}
          onChange={(e) => setFormData({ ...formData, status: e.target.value })}
          className="w-full px-3 py-1.5 border border-foreground/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-foreground/40 bg-background text-sm"
        >
          <option value="">Select status...</option>
          <option value="thriving">Thriving - Making great progress</option>
          <option value="maintaining">Maintaining - Steady state</option>
          <option value="struggling">Struggling - Need support</option>
        </select>
      </div>

      {/* Mood Rating */}
      <div>
        <label htmlFor="mood_rating" className="block text-sm font-medium mb-1">
          Mood Rating: {formData.mood_rating}/10
        </label>
        <input
          type="range"
          id="mood_rating"
          min="1"
          max="10"
          value={formData.mood_rating}
          onChange={(e) =>
            setFormData({ ...formData, mood_rating: parseInt(e.target.value) })
          }
          className="w-full"
        />
        <div className="flex justify-between text-xs text-foreground/60">
          <span>Low</span>
          <span>High</span>
        </div>
      </div>

      {/* Notes */}
      <div>
        <label htmlFor="notes" className="block text-sm font-medium mb-1">
          Notes (optional)
        </label>
        <textarea
          id="notes"
          rows={2}
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          placeholder="Add any additional thoughts or context..."
          className="w-full px-3 py-1.5 border border-foreground/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-foreground/40 bg-background text-sm"
        />
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className="w-full py-2 px-4 bg-foreground text-background font-medium rounded-lg hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-foreground disabled:opacity-50 disabled:cursor-not-allowed transition text-sm"
      >
        {loading ? 'Saving...' : 'Save Status Update'}
      </button>
    </form>
  );
}
