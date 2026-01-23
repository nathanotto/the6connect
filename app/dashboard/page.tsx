/**
 * Dashboard Overview Page
 *
 * Main landing page after login.
 * Shows summary of recent activity, commitments, and updates.
 */

import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { format } from 'date-fns';

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  // Fetch user profile
  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single();

  // Fetch 5 most recent active commitments from all users
  const { data: commitments } = await supabase
    .from('commitments')
    .select(`
      *,
      user:users(id, full_name, display_name)
    `)
    .eq('status', 'pending')
    .order('deadline', { ascending: true })
    .limit(5);

  // Fetch recent life status updates
  const { data: recentStatuses } = await supabase
    .from('life_status_updates')
    .select(`
      *,
      life_area:life_areas(*)
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(3);

  // Fetch all life areas
  const { data: lifeAreas } = await supabase
    .from('life_areas')
    .select('*')
    .order('sort_order', { ascending: true });

  // Fetch all users
  const { data: allUsers } = await supabase
    .from('users')
    .select('id, full_name, display_name')
    .order('full_name', { ascending: true });

  // For each user, get their most recent status for each life area
  const usersWithStatus = await Promise.all(
    (allUsers || []).map(async (member) => {
      const { data: allStatuses } = await supabase
        .from('life_status_updates')
        .select(`
          *,
          life_area:life_areas(*)
        `)
        .eq('user_id', member.id)
        .order('created_at', { ascending: false });

      // Get latest status for each life area
      const statusByArea: Record<string, any> = {};
      allStatuses?.forEach((status: any) => {
        if (!statusByArea[status.life_area_id]) {
          statusByArea[status.life_area_id] = status;
        }
      });

      // Get most recent update date across all areas
      const mostRecentUpdate = allStatuses && allStatuses.length > 0
        ? allStatuses[0].created_at
        : null;

      return {
        ...member,
        statusByArea,
        mostRecentUpdate,
      };
    })
  );

  // Fetch recent photos (last 5)
  const { data: recentPhotos } = await supabase
    .from('photos')
    .select(`
      *,
      user:users!photos_user_id_fkey(id, full_name, display_name)
    `)
    .order('created_at', { ascending: false })
    .limit(5);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">
          Welcome back, {profile?.display_name || profile?.full_name || 'Friend'}!
        </h1>
        <p className="text-foreground/60 mt-2">
          Here's your overview for the6connect
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Active Commitments */}
        <div className="border border-foreground/20 rounded-lg p-6">
          <h3 className="font-semibold mb-3">Active Commitments</h3>
          {commitments && commitments.length > 0 ? (
            <>
              <div className="space-y-2 mb-3">
                {commitments.slice(0, 3).map((c: any) => (
                  <div key={c.id} className="text-sm">
                    <p className="font-medium truncate">{c.task}</p>
                    <p className="text-xs text-foreground/60">
                      {c.user.display_name || c.user.full_name} • Due: {format(new Date(c.deadline), 'MMM d')}
                    </p>
                  </div>
                ))}
              </div>
              <Link
                href="/dashboard/commitments"
                className="text-sm text-foreground/80 hover:text-foreground underline"
              >
                View all commitments →
              </Link>
            </>
          ) : (
            <>
              <p className="text-sm text-foreground/60 mb-3">
                No active commitments.
              </p>
              <Link
                href="/dashboard/commitments"
                className="text-sm text-foreground/80 hover:text-foreground underline"
              >
                Create a commitment →
              </Link>
            </>
          )}
        </div>

        {/* Messages - Coming Soon */}
        <div className="border border-foreground/20 rounded-lg p-6">
          <h3 className="font-semibold mb-3">Messages</h3>
          <p className="text-sm text-foreground/60 mb-3">
            Messaging coming in Phase 3
          </p>
          <Link
            href="/dashboard/messages"
            className="text-sm text-foreground/80 hover:text-foreground underline"
          >
            View messages →
          </Link>
        </div>

        {/* Recent Photos */}
        <div className="border border-foreground/20 rounded-lg p-6">
          <h3 className="font-semibold mb-3">Recent Photos</h3>
          {recentPhotos && recentPhotos.length > 0 ? (
            <>
              <div className="space-y-2 mb-3">
                {recentPhotos.map((photo: any) => (
                  <div key={photo.id} className="text-sm border-b border-foreground/10 pb-2 last:border-0">
                    <p className="font-medium text-xs text-foreground/80">
                      {photo.user.display_name || photo.user.full_name}
                    </p>
                    <p className="text-xs text-foreground/60 truncate">
                      {photo.caption || 'No caption'}
                    </p>
                    <p className="text-xs text-foreground/40">
                      {format(new Date(photo.created_at), 'MMM d, h:mm a')}
                    </p>
                  </div>
                ))}
              </div>
              <Link
                href="/dashboard/photos"
                className="text-sm text-foreground/80 hover:text-foreground underline"
              >
                View all photos →
              </Link>
            </>
          ) : (
            <>
              <p className="text-sm text-foreground/60 mb-3">
                No photos yet.
              </p>
              <Link
                href="/dashboard/photos"
                className="text-sm text-foreground/80 hover:text-foreground underline"
              >
                Share a photo →
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Recent Life Updates - All Members */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Recent Life Updates</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {usersWithStatus?.map((member: any) => (
            <div
              key={member.id}
              className="border border-foreground/20 rounded-lg p-4"
            >
              <div className="mb-3">
                <h3 className="font-semibold text-sm">
                  <Link
                    href={`/dashboard/profile/${member.id}`}
                    className="hover:underline"
                  >
                    {member.display_name || member.full_name}
                  </Link>
                </h3>
                {member.mostRecentUpdate && (
                  <p className="text-xs text-foreground/60">
                    Last update: {format(new Date(member.mostRecentUpdate), 'MMM d, h:mm a')}
                  </p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3">
                {lifeAreas?.map((area: any) => {
                  const status = member.statusByArea[area.id];
                  return (
                    <div key={area.id} className="text-xs">
                      <p className="font-medium text-foreground/80 mb-1">
                        {area.name}
                      </p>
                      {status ? (
                        <div className="space-y-1">
                          <span
                            className={`text-xs px-1.5 py-0.5 rounded inline-block ${
                              status.status === 'thriving'
                                ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                                : status.status === 'maintaining'
                                ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
                                : 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200'
                            }`}
                          >
                            {status.status}
                          </span>
                          <p className="text-foreground/60">
                            Mood: {status.mood_rating}/10
                          </p>
                        </div>
                      ) : (
                        <p className="text-foreground/60">No update</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="border border-foreground/20 rounded-lg p-6">
        <h3 className="font-semibold mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Link
            href="/dashboard/life-status"
            className="border border-foreground/20 rounded-lg p-4 hover:bg-foreground/5 transition text-center"
          >
            <p className="font-medium text-sm">Update Status</p>
          </Link>
          <Link
            href="/dashboard/commitments"
            className="border border-foreground/20 rounded-lg p-4 hover:bg-foreground/5 transition text-center"
          >
            <p className="font-medium text-sm">New Commitment</p>
          </Link>
          <Link
            href="/dashboard/questions"
            className="border border-foreground/20 rounded-lg p-4 hover:bg-foreground/5 transition text-center"
          >
            <p className="font-medium text-sm">Ask Question</p>
          </Link>
          <Link
            href="/dashboard/photos"
            className="border border-foreground/20 rounded-lg p-4 hover:bg-foreground/5 transition text-center"
          >
            <p className="font-medium text-sm">Share Photo</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
