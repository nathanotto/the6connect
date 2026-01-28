'use client';

/**
 * Event Card
 *
 * Display event summary with response counts
 */

import { useState } from 'react';
import { format } from 'date-fns';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface EventCardProps {
  event: {
    id: string;
    title: string;
    description?: string;
    proposed_start: string;
    proposed_end?: string;
    is_confirmed: boolean;
    invited_user_ids?: string[];
    created_by: {
      id: string;
      full_name: string;
      display_name?: string;
    };
    responses: Array<{
      response: string;
    }>;
  };
  totalUsers: number;
  currentUserId: string;
}

export function EventCard({ event, totalUsers, currentUserId }: EventCardProps) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);
  const invitedUserIds = (event.invited_user_ids as string[]) || [];
  const invitedCount = invitedUserIds.length;
  const notInvitedCount = totalUsers - invitedCount;
  const isOwner = event.created_by.id === currentUserId;

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!confirm('Are you sure you want to delete this event?')) {
      return;
    }

    setDeleting(true);

    try {
      const response = await fetch(`/api/schedule/${event.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        router.refresh();
      } else {
        alert('Failed to delete event');
      }
    } catch (error) {
      console.error('Failed to delete event:', error);
      alert('Failed to delete event');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Link
      href={`/dashboard/schedule/event/${event.id}`}
      className="block border border-foreground/20 rounded-lg p-4 hover:bg-foreground/5 transition"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-lg">{event.title}</h3>
            {event.is_confirmed && (
              <span className="text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-0.5 rounded font-medium">
                Confirmed
              </span>
            )}
          </div>

          {event.description && (
            <p className="text-sm text-foreground/80 mb-2">{event.description}</p>
          )}

          <div className="flex flex-wrap items-center gap-3 text-sm text-foreground/60">
            <span>
              {format(new Date(event.proposed_start), 'EEEE, MMM d')} at {format(new Date(event.proposed_start), 'h:mm a')}
            </span>
          </div>

          <div className="flex items-center gap-3 mt-2">
            <p className="text-xs text-foreground/60">
              Proposed by {event.created_by.display_name || event.created_by.full_name}
            </p>
            {isOwner && (
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="text-xs text-red-600 hover:text-red-700 disabled:opacity-50 transition"
              >
                {deleting ? 'Deleting...' : 'Delete event'}
              </button>
            )}
          </div>
        </div>

        {/* Invite Status */}
        <div className="text-right">
          <div className="text-xs text-foreground/60 mb-1">Invited:</div>
          <div className="text-sm">
            {invitedCount === 0 ? (
              <div className="text-red-700 dark:text-red-300">None invited</div>
            ) : invitedCount === totalUsers ? (
              <div className="text-green-700 dark:text-green-300">All invited</div>
            ) : (
              <>
                <div className="text-green-700 dark:text-green-300">{invitedCount} invited</div>
                <div className="text-red-700 dark:text-red-300">{notInvitedCount} not yet invited</div>
              </>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
