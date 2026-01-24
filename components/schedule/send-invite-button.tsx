'use client';

/**
 * Send Calendar Invite Links
 *
 * Allows event creator to send calendar invites individually or to all
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  full_name: string;
  display_name: string | null;
}

interface SendInviteButtonProps {
  eventId: string;
  eventTitle: string;
  users: User[];
  invitedUserIds: string[];
  isCreator: boolean;
}

export function SendInviteButton({
  eventId,
  eventTitle,
  users,
  invitedUserIds,
  isCreator,
}: SendInviteButtonProps) {
  const router = useRouter();
  const [sendingUserId, setSendingUserId] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [error, setError] = useState('');

  if (!isCreator) {
    return null;
  }

  const handleSend = async (userId?: string) => {
    setSendingUserId(userId || 'all');
    setError('');

    try {
      const response = await fetch(`/api/schedule/${eventId}/send-invite`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to send calendar invites');
      }

      // Show success popup
      const sentToNames = result.sentTo.join(', ');
      setSuccessMessage(`Email invite to ${eventTitle} sent to ${sentToNames}`);

      // Close popup after 2 seconds
      setTimeout(() => {
        setSuccessMessage(null);
        router.refresh(); // Refresh to update invite status
      }, 2000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSendingUserId(null);
    }
  };

  return (
    <div>
      <div className="space-y-2">
        <p className="text-sm font-medium text-foreground/80">Send Calendar Invite:</p>
        <div className="flex flex-wrap gap-2 items-center">
          {/* Invite All */}
          <button
            onClick={() => handleSend()}
            disabled={sendingUserId !== null}
            className="text-sm text-blue-600 dark:text-blue-400 hover:underline disabled:opacity-50"
          >
            {sendingUserId === 'all' ? 'Sending...' : 'Invite all'}
          </button>

          {/* Individual user links */}
          {users.map((user) => {
            const isInvited = invitedUserIds.includes(user.id);
            const userName = user.display_name || user.full_name;
            const isSending = sendingUserId === user.id;

            return (
              <button
                key={user.id}
                onClick={() => handleSend(user.id)}
                disabled={sendingUserId !== null}
                className="text-sm text-blue-600 dark:text-blue-400 hover:underline disabled:opacity-50"
              >
                {isSending
                  ? 'Sending...'
                  : isInvited
                  ? `Invite ${userName} again`
                  : `Invite ${userName}`}
              </button>
            );
          })}
        </div>
      </div>

      {error && (
        <p className="text-sm text-red-600 dark:text-red-400 mt-2">{error}</p>
      )}

      {/* Success Popup */}
      {successMessage && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background border border-foreground/20 rounded-lg p-6 max-w-md w-full">
            <p className="text-foreground">{successMessage}</p>
          </div>
        </div>
      )}
    </div>
  );
}
