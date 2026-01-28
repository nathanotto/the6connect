'use client';

/**
 * Check-in Form
 *
 * Form for creating check-ins across different zones
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
    zone_ids: [] as string[],
    zone_other: '',
    statuses: [] as string[],
    status_other: '',
    support_type: '',
    support_type_other: '',
    notes: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate at least one zone is selected
    if (formData.zone_ids.length === 0) {
      setError('Please select at least one zone');
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
        zone_ids: [],
        zone_other: '',
        statuses: [],
        status_other: '',
        support_type: '',
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

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
      {error && (
        <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 px-3 py-2 rounded text-sm">
          {error}
        </div>
      )}

      {/* Zone Selection */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Zone * (select at least one)
        </label>
        <div className="flex flex-wrap gap-2">
          {lifeAreas.map((area) => (
            <label key={area.id} className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                value={area.id}
                checked={formData.zone_ids.includes(area.id)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setFormData({ ...formData, zone_ids: [...formData.zone_ids, area.id] });
                  } else {
                    setFormData({ ...formData, zone_ids: formData.zone_ids.filter(id => id !== area.id) });
                  }
                }}
                className="w-4 h-4"
              />
              <span className="text-sm">{area.name}</span>
            </label>
          ))}
        </div>
        {formData.zone_ids.includes(lifeAreas.find(a => a.name === 'Other')?.id || '') && (
          <input
            type="text"
            maxLength={20}
            value={formData.zone_other}
            onChange={(e) => setFormData({ ...formData, zone_other: e.target.value })}
            placeholder="What zone?"
            required
            className="w-full mt-2 px-3 py-2 border border-foreground/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-foreground/40 bg-background text-sm"
          />
        )}
      </div>

      {/* I'm feeling... */}
      <div>
        <label className="block text-sm font-medium mb-2">
          I'm feeling... * (select at least one)
        </label>
        <div className="flex flex-wrap gap-2">
          {['Anxious', 'Pissed Off', 'Meh', 'Optimistic', 'Solid', 'On Fire', 'Other'].map((feeling) => (
            <label key={feeling} className="flex items-center gap-1.5 cursor-pointer">
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
            className="w-full mt-2 px-3 py-2 border border-foreground/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-foreground/40 bg-background text-sm"
          />
        )}
      </div>

      {/* I want you to... */}
      <div>
        <label className="block text-sm font-medium mb-2">
          I want you to... *
        </label>
        <div className="flex flex-wrap gap-2">
          {['Listen', 'Support', 'Advise', 'Hug Me', 'Call me', 'Other'].map((option) => (
            <label key={option} className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="radio"
                name="support_type"
                value={option}
                checked={formData.support_type === option}
                onChange={(e) => setFormData({ ...formData, support_type: e.target.value })}
                required
                className="w-4 h-4"
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
            className="w-full mt-2 px-3 py-2 border border-foreground/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-foreground/40 bg-background text-sm"
          />
        )}
      </div>

      {/* Notes */}
      <div>
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
      <button
        type="submit"
        disabled={loading}
        className="w-full py-2 px-4 bg-foreground text-background font-medium rounded-lg hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-foreground disabled:opacity-50 disabled:cursor-not-allowed transition text-sm"
      >
        {loading ? 'Sharing...' : 'Share with the Six'}
      </button>
    </form>
  );
}
