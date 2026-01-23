'use client';

/**
 * Commitment List Component
 *
 * Display and manage commitments
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { format, isPast, parseISO } from 'date-fns';

interface Commitment {
  id: string;
  task: string;
  outcome: string;
  deadline: string;
  status: 'pending' | 'completed' | 'missed';
  completed_at: string | null;
  created_at: string;
  user?: {
    id: string;
    full_name: string;
    display_name?: string;
  };
}

interface CommitmentListProps {
  commitments: Commitment[];
  showActions?: boolean;
  currentUserId?: string;
}

export function CommitmentList({
  commitments,
  showActions = true,
  currentUserId,
}: CommitmentListProps) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  const handleStatusUpdate = async (
    commitmentId: string,
    newStatus: 'completed' | 'missed'
  ) => {
    setLoading(commitmentId);

    try {
      const response = await fetch(`/api/commitments/${commitmentId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error('Failed to update commitment');
      }

      router.refresh();
    } catch (error) {
      console.error('Error updating commitment:', error);
    } finally {
      setLoading(null);
    }
  };

  const handleDelete = async (commitmentId: string) => {
    if (!confirm('Are you sure you want to delete this commitment?')) {
      return;
    }

    setLoading(commitmentId);

    try {
      const response = await fetch(`/api/commitments/${commitmentId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete commitment');
      }

      router.refresh();
    } catch (error) {
      console.error('Error deleting commitment:', error);
    } finally {
      setLoading(null);
    }
  };

  if (commitments.length === 0) {
    return (
      <p className="text-foreground/60 text-center py-8">
        No commitments yet. Create your first commitment to get started!
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {commitments.map((commitment) => {
        const deadlineDate = parseISO(commitment.deadline);
        const isOverdue = isPast(deadlineDate) && commitment.status === 'pending';

        return (
          <div
            key={commitment.id}
            className={`border rounded-lg p-4 ${
              commitment.status === 'completed'
                ? 'bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800'
                : commitment.status === 'missed'
                ? 'bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800'
                : isOverdue
                ? 'bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-800'
                : 'border-foreground/20'
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-semibold text-lg">{commitment.task}</h3>
                  <span
                    className={`px-2 py-0.5 rounded text-xs font-medium ${
                      commitment.status === 'completed'
                        ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                        : commitment.status === 'missed'
                        ? 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                        : isOverdue
                        ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200'
                        : 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
                    }`}
                  >
                    {commitment.status === 'completed'
                      ? 'Completed'
                      : commitment.status === 'missed'
                      ? 'Missed'
                      : isOverdue
                      ? 'Overdue'
                      : 'Pending'}
                  </span>
                </div>

                <p className="text-sm text-foreground/80 mb-2">
                  <strong>Outcome:</strong> {commitment.outcome}
                </p>

                <div className="flex items-center gap-4 text-sm text-foreground/60">
                  {commitment.user && (
                    <span>
                      <strong>{commitment.user.display_name || commitment.user.full_name}</strong>
                    </span>
                  )}
                  <span>
                    <strong>Deadline:</strong> {format(deadlineDate, 'MMM d, yyyy')}
                  </span>
                  {commitment.completed_at && (
                    <span>
                      <strong>Completed:</strong>{' '}
                      {format(parseISO(commitment.completed_at), 'MMM d, yyyy')}
                    </span>
                  )}
                </div>
              </div>

              {showActions && commitment.status === 'pending' && (!currentUserId || !commitment.user || commitment.user.id === currentUserId) && (
                <div className="flex gap-2">
                  <button
                    onClick={() => handleStatusUpdate(commitment.id, 'completed')}
                    disabled={loading === commitment.id}
                    className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 disabled:opacity-50 transition"
                  >
                    Complete
                  </button>
                  <button
                    onClick={() => handleDelete(commitment.id)}
                    disabled={loading === commitment.id}
                    className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 disabled:opacity-50 transition"
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
