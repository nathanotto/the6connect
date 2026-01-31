'use client';

/**
 * Checkin Card Component
 *
 * Displays a check-in with zones, aging, details, and comments
 */

import { useState, useEffect } from 'react';
import { getRelativeTimeString } from '@/lib/utils/date-utils';
import { useRouter } from 'next/navigation';

interface LifeArea {
  id: string;
  name: string;
}

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user: {
    id: string;
    full_name: string;
    display_name?: string;
  };
}

interface CheckinCardProps {
  checkin: any;
  member: {
    id: string;
    full_name: string;
    display_name?: string;
  };
  lifeAreas: LifeArea[];
  currentUserId: string;
  allUsers: Array<{
    id: string;
    full_name: string;
    display_name?: string;
  }>;
}

export function CheckinCard({ checkin, member, lifeAreas, currentUserId, allUsers }: CheckinCardProps) {
  const router = useRouter();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [editing, setEditing] = useState(false);
  const [readByUsers, setReadByUsers] = useState<string[]>([]);
  const [editFormData, setEditFormData] = useState({
    zone_ids: checkin?.zone_ids || [],
    zone_other: checkin?.zone_other || '',
    statuses: checkin?.status ? checkin.status.split(', ') : [],
    status_other: checkin?.status_other || '',
    support_type: checkin?.support_type || '',
    support_type_other: checkin?.support_type_other || '',
    notes: checkin?.notes || '',
  });
  const [editError, setEditError] = useState('');

  // Fetch comments for this check-in
  useEffect(() => {
    if (checkin && showComments) {
      fetchComments();
    }
  }, [checkin, showComments]);

  // Fetch read status for this check-in and mark as read
  useEffect(() => {
    if (checkin) {
      fetchReadStatus();
      markAsRead();
    }
  }, [checkin]);

  const fetchReadStatus = async () => {
    if (!checkin) return;

    try {
      const response = await fetch(`/api/checkin-reads?checkinId=${checkin.id}`);
      const result = await response.json();
      if (result.data) {
        setReadByUsers(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch read status:', error);
      // Default: mark the author as having read it
      setReadByUsers([checkin.user_id]);
    }
  };

  const markAsRead = async () => {
    if (!checkin) return;

    try {
      await fetch('/api/checkin-reads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          checkin_id: checkin.id,
        }),
      });

      // Update local state
      if (!readByUsers.includes(currentUserId)) {
        setReadByUsers([...readByUsers, currentUserId]);
      }
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const fetchComments = async () => {
    if (!checkin) return;

    try {
      const response = await fetch(`/api/checkin-comments?checkinId=${checkin.id}`);
      const result = await response.json();
      if (result.data) {
        setComments(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch comments:', error);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newComment.trim()) return;

    setLoading(true);

    try {
      const response = await fetch('/api/checkin-comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          checkin_id: checkin.id,
          content: newComment.trim(),
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setComments([...comments, result.data]);
        setNewComment('');
        router.refresh();
      }
    } catch (error) {
      console.error('Failed to add comment:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this check-in?')) {
      return;
    }

    setDeleting(true);

    try {
      const response = await fetch(`/api/life-status/${checkin.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        router.refresh();
      } else {
        alert('Failed to delete check-in');
      }
    } catch (error) {
      console.error('Failed to delete check-in:', error);
      alert('Failed to delete check-in');
    } finally {
      setDeleting(false);
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate at least one zone
    if (editFormData.zone_ids.length === 0) {
      setEditError('Please select at least one zone');
      return;
    }

    // Validate at least one feeling
    if (editFormData.statuses.length === 0) {
      setEditError('Please select at least one feeling');
      return;
    }

    setEditError('');
    setLoading(true);

    try {
      const response = await fetch(`/api/life-status/${checkin.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editFormData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update check-in');
      }

      setEditing(false);
      router.refresh();
    } catch (err: any) {
      setEditError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Check if check-in is less than 24 hours old
  const isEditable = () => {
    if (!checkin) return false;
    const createdAt = new Date(checkin.created_at);
    const now = new Date();
    const hoursDiff = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);
    return hoursDiff < 24;
  };

  if (!checkin) {
    return (
      <div className="border border-zinc-400 dark:border-zinc-600 p-0 bg-zinc-100/50 dark:bg-zinc-900/20">
        <div className="border border-zinc-400 dark:border-zinc-600 p-3 bg-zinc-200 dark:bg-zinc-800/40">
          <h3 className="font-semibold text-lg text-zinc-900 dark:text-zinc-200">{member.display_name || member.full_name}</h3>
        </div>
        <div className="border border-zinc-400 dark:border-zinc-600 border-t-0 p-3 bg-white dark:bg-zinc-900/30">
          <p className="text-sm text-zinc-600 dark:text-zinc-400">No check-ins yet</p>
        </div>
      </div>
    );
  }

  // Get zone names from zone_ids
  const zoneNames = checkin.zone_ids
    ?.map((zoneId: string) => {
      const area = lifeAreas.find((a) => a.id === zoneId);
      if (area?.name === 'Other' && checkin.zone_other) {
        return checkin.zone_other;
      }
      return area?.name;
    })
    .filter(Boolean)
    .join(', ') || 'Unknown';

  const aging = getRelativeTimeString(checkin.created_at);

  return (
    <div className="border border-zinc-400 dark:border-zinc-600 p-0 bg-zinc-100/50 dark:bg-zinc-900/20">
      {/* Header with member name, zones, and aging */}
      <div className="border border-zinc-400 dark:border-zinc-600 p-3 bg-zinc-200 dark:bg-zinc-800/40">
        <h3 className="font-semibold text-lg text-zinc-900 dark:text-zinc-200">{member.display_name || member.full_name}</h3>
        <div className="flex items-center gap-2 mt-1 text-sm text-zinc-700 dark:text-zinc-400">
          <span className="font-medium">{zoneNames}</span>
          <span>•</span>
          <span>{aging}</span>
        </div>
      </div>

      {/* Check-in details or Edit form */}
      {editing ? (
        <form onSubmit={handleEdit} className="space-y-3 mb-3">
          {editError && (
            <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 px-3 py-2 rounded text-xs">
              {editError}
            </div>
          )}

          {/* Zone Selection */}
          <div>
            <label className="block text-xs font-medium mb-1">Zone *</label>
            <div className="flex flex-wrap gap-2">
              {lifeAreas.map((area) => (
                <label key={area.id} className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    value={area.id}
                    checked={editFormData.zone_ids.includes(area.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setEditFormData({ ...editFormData, zone_ids: [...editFormData.zone_ids, area.id] });
                      } else {
                        setEditFormData({ ...editFormData, zone_ids: editFormData.zone_ids.filter(id => id !== area.id) });
                      }
                    }}
                    className="w-4 h-4"
                  />
                  <span className="text-xs">{area.name}</span>
                </label>
              ))}
            </div>
            {editFormData.zone_ids.includes(lifeAreas.find(a => a.name === 'Other')?.id || '') && (
              <input
                type="text"
                maxLength={20}
                value={editFormData.zone_other}
                onChange={(e) => setEditFormData({ ...editFormData, zone_other: e.target.value })}
                placeholder="What zone?"
                required
                className="w-full mt-2 px-2 py-1 border border-foreground/20 rounded focus:outline-none focus:ring-1 focus:ring-foreground/40 bg-background text-xs"
              />
            )}
          </div>

          {/* I'm feeling... */}
          <div>
            <label className="block text-xs font-medium mb-1">I'm feeling... *</label>
            <div className="flex flex-wrap gap-2">
              {['Anxious', 'Pissed Off', 'Meh', 'Optimistic', 'Solid', 'On Fire', 'Other'].map((feeling) => (
                <label key={feeling} className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    value={feeling}
                    checked={editFormData.statuses.includes(feeling)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setEditFormData({ ...editFormData, statuses: [...editFormData.statuses, feeling] });
                      } else {
                        setEditFormData({ ...editFormData, statuses: editFormData.statuses.filter(s => s !== feeling) });
                      }
                    }}
                    className="w-4 h-4"
                  />
                  <span className="text-xs">{feeling}</span>
                </label>
              ))}
            </div>
            {editFormData.statuses.includes('Other') && (
              <input
                type="text"
                value={editFormData.status_other}
                onChange={(e) => setEditFormData({ ...editFormData, status_other: e.target.value })}
                placeholder="Describe how you're feeling..."
                required
                className="w-full mt-2 px-2 py-1 border border-foreground/20 rounded focus:outline-none focus:ring-1 focus:ring-foreground/40 bg-background text-xs"
              />
            )}
          </div>

          {/* I want you to... */}
          <div>
            <label className="block text-xs font-medium mb-1">I want you to... *</label>
            <div className="flex flex-wrap gap-2">
              {['Listen', 'Support', 'Advise', 'Hug Me', 'Call me', 'Other'].map((option) => (
                <label key={option} className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="support_type"
                    value={option}
                    checked={editFormData.support_type === option}
                    onChange={(e) => setEditFormData({ ...editFormData, support_type: e.target.value })}
                    required
                    className="w-4 h-4"
                  />
                  <span className="text-xs">{option}</span>
                </label>
              ))}
            </div>
            {editFormData.support_type === 'Other' && (
              <input
                type="text"
                value={editFormData.support_type_other}
                onChange={(e) => setEditFormData({ ...editFormData, support_type_other: e.target.value })}
                placeholder="What do you need?"
                required
                className="w-full mt-2 px-2 py-1 border border-foreground/20 rounded focus:outline-none focus:ring-1 focus:ring-foreground/40 bg-background text-xs"
              />
            )}
          </div>

          {/* Notes */}
          <div>
            <label htmlFor="edit_notes" className="block text-xs font-medium mb-1">
              Checkin details:
            </label>
            <textarea
              id="edit_notes"
              rows={2}
              value={editFormData.notes}
              onChange={(e) => setEditFormData({ ...editFormData, notes: e.target.value })}
              placeholder="Add any additional thoughts or context..."
              className="w-full px-2 py-1 border border-foreground/20 rounded focus:outline-none focus:ring-1 focus:ring-foreground/40 bg-background text-xs"
            />
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={loading}
              className="px-3 py-1 bg-foreground text-background text-xs font-medium rounded hover:opacity-90 disabled:opacity-50 transition"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="px-3 py-1 border border-foreground/20 text-xs rounded hover:bg-foreground/5 transition"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <>
          <div className="space-y-0">
            <div className="border border-zinc-400 dark:border-zinc-600 border-t-0 p-3 text-sm bg-white dark:bg-zinc-900/30">
              <span className="text-zinc-700 dark:text-zinc-400 font-medium">Feeling: </span>
              <span className="font-medium text-foreground">
                {checkin.status}
                {checkin.status_other && ` (${checkin.status_other})`}
              </span>
            </div>
            <div className="border border-zinc-400 dark:border-zinc-600 border-t-0 p-3 text-sm bg-white dark:bg-zinc-900/30">
              <span className="text-zinc-700 dark:text-zinc-400 font-medium">Needs: </span>
              <span className="text-foreground">
                {checkin.support_type === 'Other' ? checkin.support_type_other : checkin.support_type}
              </span>
            </div>
            {checkin.notes && (
              <div className="border border-zinc-400 dark:border-zinc-600 border-t-0 p-3 text-sm bg-zinc-100 dark:bg-zinc-800/30">
                <p className="text-foreground/90">{checkin.notes}</p>
              </div>
            )}
          </div>

          {/* Read status indicator */}
          <div className="border border-zinc-400 dark:border-zinc-600 border-t-0 p-3 text-sm bg-white dark:bg-zinc-900/30">
            <span className="text-zinc-700 dark:text-zinc-400">Read: </span>
            {allUsers.map((user, index) => {
              const hasRead = readByUsers.includes(user.id);
              const displayName = user.display_name || user.full_name;
              return (
                <span key={user.id}>
                  <span className={hasRead ? 'text-green-600 dark:text-green-500' : 'text-red-600 dark:text-red-500'}>
                    {displayName}
                  </span>
                  {index < allUsers.length - 1 && ', '}
                </span>
              );
            })}
          </div>

          {/* Comments toggle, Edit, and Delete buttons */}
          <div className="border border-zinc-400 dark:border-zinc-600 border-t-0 p-3 flex items-center gap-3 bg-zinc-100/50 dark:bg-zinc-900/20">
            <button
              onClick={() => setShowComments(!showComments)}
              className="text-sm text-zinc-700 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 transition font-medium"
            >
              {showComments ? 'Hide' : 'Show'} responses ({comments.length})
            </button>

            {checkin.user_id === currentUserId && isEditable() && (
              <button
                onClick={() => setEditing(true)}
                className="text-sm text-blue-700 dark:text-blue-500 hover:text-blue-900 dark:hover:text-blue-300 transition font-medium"
              >
                Edit check-in
              </button>
            )}

            {checkin.user_id === currentUserId && (
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="text-sm text-red-700 dark:text-red-500 hover:text-red-900 dark:hover:text-red-300 disabled:opacity-50 transition font-medium"
              >
                {deleting ? 'Deleting...' : 'Delete check-in'}
              </button>
            )}
          </div>
        </>
      )}

      {/* Comments section */}
      {showComments && (
        <div className="border border-zinc-400 dark:border-zinc-600 border-t-0 p-3 space-y-0 bg-stone-100 dark:bg-stone-900/30">
          {/* Existing comments */}
          {comments.map((comment) => (
            <div key={comment.id} className="border border-stone-400 dark:border-stone-600 p-2 bg-white dark:bg-stone-900/50 mb-0 last:mb-3">
              <div className="flex items-center gap-2 text-xs text-stone-600 dark:text-stone-400 mb-1">
                <span className="font-medium">
                  {comment.user.display_name || comment.user.full_name}
                </span>
                <span>•</span>
                <span>{getRelativeTimeString(comment.created_at)}</span>
              </div>
              <p className="text-sm text-foreground/90">{comment.content}</p>
            </div>
          ))}

          {/* Add comment form */}
          <form onSubmit={handleAddComment} className="border border-stone-400 dark:border-stone-600 p-3 bg-white dark:bg-stone-900/50">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a response..."
              rows={2}
              className="w-full px-3 py-2 border border-stone-400 dark:border-stone-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-600 bg-background text-sm"
            />
            <button
              type="submit"
              disabled={loading || !newComment.trim()}
              className="mt-2 px-4 py-1.5 bg-stone-700 hover:bg-stone-800 text-white text-sm font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition shadow-sm"
            >
              {loading ? 'Adding...' : 'Add Response'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
