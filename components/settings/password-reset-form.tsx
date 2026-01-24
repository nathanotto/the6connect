'use client';

/**
 * Password Reset Form
 *
 * Allows users to reset their password via email
 */

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

interface PasswordResetFormProps {
  userEmail: string;
}

export function PasswordResetForm({ userEmail }: PasswordResetFormProps) {
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const supabase = createClient();

  const handleResetPassword = async () => {
    setSending(true);
    setError('');
    setSuccess(false);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(userEmail, {
        redirectTo: `${window.location.origin}/dashboard/settings`,
      });

      if (error) {
        throw error;
      }

      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Failed to send reset email');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-foreground/80">
        Click the button below to receive a password reset link via email.
      </p>

      <button
        onClick={handleResetPassword}
        disabled={sending}
        className="px-4 py-2 bg-foreground text-background rounded-lg hover:opacity-90 transition disabled:opacity-50"
      >
        {sending ? 'Sending...' : 'Send Password Reset Email'}
      </button>

      {success && (
        <p className="text-sm text-green-600 dark:text-green-400">
          Password reset email sent! Check your inbox.
        </p>
      )}

      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
}
