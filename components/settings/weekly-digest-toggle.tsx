'use client';

/**
 * Weekly Digest Toggle
 *
 * Checkbox to enable/disable weekly email digests
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface WeeklyDigestToggleProps {
  enabled: boolean;
  userId: string;
}

export function WeeklyDigestToggle({ enabled, userId }: WeeklyDigestToggleProps) {
  const router = useRouter();
  const [isEnabled, setIsEnabled] = useState(enabled);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');

  const handleToggle = async () => {
    setUpdating(true);
    setError('');

    try {
      const response = await fetch('/api/user/weekly-digest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: !isEnabled }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update preference');
      }

      setIsEnabled(!isEnabled);
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="space-y-3">
      <label className="flex items-center gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={isEnabled}
          onChange={handleToggle}
          disabled={updating}
          className="w-5 h-5 rounded border-foreground/20 text-foreground focus:ring-2 focus:ring-foreground/40 disabled:opacity-50"
        />
        <span className="text-foreground">
          Send me The Six updates once a week
        </span>
      </label>

      <p className="text-sm text-foreground/60">
        Receive a weekly email digest with recent activity from the group.
      </p>

      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
}
