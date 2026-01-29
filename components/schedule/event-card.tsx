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
      className="block border border-stone-500 dark:border-stone-600 p-0 hover:bg-stone-700/10 dark:hover:bg-stone-700/20 transition bg-stone-700/5 dark:bg-stone-800/20"
    >
      <div className="flex flex-col md:flex-row items-start gap-0">
        <div className="flex-1 w-full">
          {/* Title and Status */}
          <div className="border border-stone-500 dark:border-stone-600 p-3 bg-stone-200 dark:bg-stone-800/40">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-lg text-stone-900 dark:text-stone-200">{event.title}</h3>
              {event.is_confirmed && (
                <span className="text-xs bg-green-700 text-white px-2 py-0.5 rounded font-medium">
                  Confirmed
                </span>
              )}
            </div>
          </div>

          {/* Description */}
          {event.description && (
            <div className="border border-stone-500 dark:border-stone-600 border-t-0 p-3 bg-white dark:bg-stone-900/30">
              <p className="text-sm text-foreground/90">{event.description}</p>
            </div>
          )}

          {/* Date/Time */}
          <div className="border border-stone-500 dark:border-stone-600 border-t-0 p-3 bg-white dark:bg-stone-900/30">
            <div className="flex flex-wrap items-center gap-3 text-sm text-stone-700 dark:text-stone-400">
              <span className="font-medium">
                {format(new Date(event.proposed_start), 'EEEE, MMM d')} at {format(new Date(event.proposed_start), 'h:mm a')}
              </span>
            </div>
          </div>

          {/* Creator and Delete */}
          <div className="border border-stone-500 dark:border-stone-600 border-t-0 p-3 bg-stone-100 dark:bg-stone-900/20">
            <div className="flex items-center gap-3">
              <p className="text-xs text-stone-700 dark:text-stone-400">
                Proposed by {event.created_by.display_name || event.created_by.full_name}
              </p>
              {isOwner && (
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="text-xs text-red-700 dark:text-red-500 hover:text-red-900 dark:hover:text-red-300 disabled:opacity-50 transition font-medium"
                >
                  {deleting ? 'Deleting...' : 'Delete event'}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Invite Status */}
        <div className="border border-stone-500 dark:border-stone-600 md:border-l-0 border-t-0 md:border-t p-4 bg-stone-200 dark:bg-stone-800/40 w-full md:w-48">
          <div className="text-xs text-stone-700 dark:text-stone-400 mb-2 font-medium">Invited:</div>
          <div className="text-sm space-y-1">
            {invitedCount === 0 ? (
              <div className="text-red-700 dark:text-red-400 font-medium">None invited</div>
            ) : invitedCount === totalUsers ? (
              <div className="text-green-700 dark:text-green-400 font-medium">All invited</div>
            ) : (
              <>
                <div className="text-green-700 dark:text-green-400 font-medium">{invitedCount} invited</div>
                <div className="text-red-700 dark:text-red-400 font-medium">{notInvitedCount} not yet invited</div>
              </>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
