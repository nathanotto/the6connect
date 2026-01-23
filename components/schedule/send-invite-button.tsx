'use client';

/**
 * Send Calendar Invite Button
 *
 * Allows event creator to send calendar invites to all members
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface SendInviteButtonProps {
  eventId: string;
  eventTitle: string;
  recipientNames: string[];
  isCreator: boolean;
}

export function SendInviteButton({
  eventId,
  eventTitle,
  recipientNames,
  isCreator,
}: SendInviteButtonProps) {
  const router = useRouter();
  const [showConfirm, setShowConfirm] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  if (!isCreator) {
    return null;
  }

  const handleSend = async () => {
    setSending(true);
    setError('');

    try {
      const response = await fetch(`/api/schedule/${eventId}/send-invite`, {
        method: 'POST',
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to send calendar invites');
      }

      setSuccess(true);
      setShowConfirm(false);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <div>
      <button
        onClick={() => setShowConfirm(true)}
        className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
        disabled={sending || success}
      >
        {success ? '✓ Sent!' : 'Email calendar invite to The Six'}
      </button>

      {success && (
        <p className="text-sm text-green-600 dark:text-green-400 mt-2">
          Calendar invites sent successfully!
        </p>
      )}

      {error && (
        <p className="text-sm text-red-600 dark:text-red-400 mt-2">{error}</p>
      )}

      {/* Confirmation Dialog */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background border border-foreground/20 rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-3">Send calendar invite?</h3>
            <p className="text-foreground/80 mb-4">
              Send calendar invite to <strong>{recipientNames.join(', ')}</strong> for{' '}
              <strong>{eventTitle}</strong>?
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowConfirm(false)}
                disabled={sending}
                className="px-4 py-2 border border-foreground/20 rounded-lg hover:bg-foreground/5 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSend}
                disabled={sending}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
              >
                {sending ? 'Sending...' : 'Yes, send invite'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
