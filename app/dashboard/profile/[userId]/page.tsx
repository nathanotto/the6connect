/**
 * User Profile Page
 *
 * View member profiles and their recent activity
 */

import { createClient } from '@/lib/supabase/server';
import { format } from 'date-fns';

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = await params;
  const supabase = await createClient();

  const {
    data: { user: currentUser },
  } = await supabase.auth.getUser();

  if (!currentUser) {
    return null;
  }

  // Fetch the profile user
  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();

  if (!profile) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold">User not found</h1>
      </div>
    );
  }

  // Fetch recent check-ins
  const { data: recentCheckins } = await supabase
    .from('life_status_updates')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(5);

  const isOwnProfile = currentUser.id === userId;

  return (
    <div className="space-y-4">
      {/* Profile Header */}
      <div className="border border-foreground/20 rounded-lg p-3">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-bold">{profile.full_name}</h1>
            {profile.display_name && profile.display_name !== profile.full_name && (
              <p className="text-foreground/60 mt-0.5 text-sm">({profile.display_name})</p>
            )}
            <p className="text-xs text-foreground/60 mt-1">{profile.email}</p>
            <p className="text-xs text-foreground/40 mt-0.5">
              Member since 2017
            </p>
          </div>
          {isOwnProfile && (
            <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs font-medium rounded">
              Your Profile
            </span>
          )}
        </div>
      </div>

      {/* Recent Check-ins */}
      {recentCheckins && recentCheckins.length > 0 ? (
        <div>
          <h2 className="text-lg font-semibold mb-2">Check-ins</h2>
          <div className="space-y-2">
            {recentCheckins.map((checkin: any) => {
              return (
                <div
                  key={checkin.id}
                  className="border border-foreground/20 rounded-lg p-2"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-xs text-foreground/60 mb-1">
                        <span className="font-medium">Topic:</span> {checkin.zone_other || 'General check-in'}
                      </p>
                      <div className="space-y-0.5">
                        <p className="text-xs">
                          <span className="text-foreground/60">Feeling: </span>
                          <span className="font-medium">
                            {checkin.status}
                            {checkin.status_other && ` (${checkin.status_other})`}
                          </span>
                        </p>
                        <p className="text-xs">
                          <span className="text-foreground/60">Needs: </span>
                          <span>
                            {checkin.support_type === 'Other' ? checkin.support_type_other : checkin.support_type}
                          </span>
                        </p>
                      </div>
                      {checkin.notes && (
                        <p className="text-xs mt-1 text-foreground/80">{checkin.notes}</p>
                      )}
                    </div>
                    <span className="text-xs text-foreground/60 ml-2">
                      {format(new Date(checkin.created_at), 'MMM d, h:mm a')}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="border border-foreground/20 rounded-lg p-4 text-center">
          <p className="text-sm text-foreground/60">
            {isOwnProfile
              ? 'You have no check-ins yet.'
              : `${profile.display_name || profile.full_name} has no check-ins yet.`}
          </p>
        </div>
      )}
    </div>
  );
}
