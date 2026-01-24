'use client';

/**
 * Email Update Form
 *
 * Allows users to update their email address
 */

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

interface EmailUpdateFormProps {
  currentEmail: string;
}

export function EmailUpdateForm({ currentEmail }: EmailUpdateFormProps) {
  const [newEmail, setNewEmail] = useState('');
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const supabase = createClient();

  const handleUpdateEmail = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newEmail || newEmail === currentEmail) {
      setError('Please enter a different email address');
      return;
    }

    setUpdating(true);
    setError('');
    setSuccess(false);

    try {
      const { error } = await supabase.auth.updateUser({ email: newEmail });

      if (error) {
        throw error;
      }

      setSuccess(true);
      setNewEmail('');
    } catch (err: any) {
      setError(err.message || 'Failed to update email');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Current Email</label>
        <input
          type="email"
          value={currentEmail}
          disabled
          className="w-full px-3 py-2 border border-foreground/20 rounded-lg bg-foreground/5 text-foreground/60"
        />
      </div>

      <form onSubmit={handleUpdateEmail} className="space-y-3">
        <div>
          <label htmlFor="new-email" className="block text-sm font-medium mb-1">
            New Email
          </label>
          <input
            id="new-email"
            type="email"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            placeholder="new@email.com"
            className="w-full px-3 py-2 border border-foreground/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-foreground/40 bg-background"
          />
        </div>

        <button
          type="submit"
          disabled={updating}
          className="px-4 py-2 bg-foreground text-background rounded-lg hover:opacity-90 transition disabled:opacity-50"
        >
          {updating ? 'Updating...' : 'Update Email'}
        </button>
      </form>

      {success && (
        <p className="text-sm text-green-600 dark:text-green-400">
          Email update requested! Check both email addresses for confirmation.
        </p>
      )}

      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
}
