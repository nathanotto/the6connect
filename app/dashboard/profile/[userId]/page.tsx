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

  // Fetch recent life status updates
  const { data: recentStatuses } = await supabase
    .from('life_status_updates')
    .select(`
      *,
      life_area:life_areas(*)
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(5);

  const isOwnProfile = currentUser.id === userId;

  return (
    <div className="space-y-8">
      {/* Profile Header */}
      <div className="border border-foreground/20 rounded-lg p-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold">{profile.full_name}</h1>
            {profile.display_name && profile.display_name !== profile.full_name && (
              <p className="text-foreground/60 mt-1">({profile.display_name})</p>
            )}
            <p className="text-sm text-foreground/60 mt-2">{profile.email}</p>
            <p className="text-xs text-foreground/40 mt-1">
              Member since {format(new Date(profile.created_at), 'MMM yyyy')}
            </p>
          </div>
          {isOwnProfile && (
            <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-sm font-medium rounded">
              Your Profile
            </span>
          )}
        </div>
      </div>

      {/* Recent Life Status Updates */}
      {recentStatuses && recentStatuses.length > 0 ? (
        <div>
          <h2 className="text-xl font-semibold mb-4">Recent Life Updates</h2>
          <div className="space-y-3">
            {recentStatuses.map((update: any) => (
              <div
                key={update.id}
                className="border border-foreground/20 rounded-lg p-4"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-medium">{update.life_area.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span
                        className={`px-2 py-0.5 rounded text-xs font-medium ${
                          update.status === 'thriving'
                            ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                            : update.status === 'maintaining'
                            ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
                            : 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200'
                        }`}
                      >
                        {update.status}
                      </span>
                      <span className="text-xs text-foreground/60">
                        Mood: {update.mood_rating}/10
                      </span>
                    </div>
                    {update.notes && (
                      <p className="text-sm mt-2 text-foreground/80">{update.notes}</p>
                    )}
                  </div>
                  <span className="text-xs text-foreground/60">
                    {format(new Date(update.created_at), 'MMM d')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="border border-foreground/20 rounded-lg p-8 text-center">
          <p className="text-foreground/60">
            {isOwnProfile
              ? 'You have no recent life updates.'
              : `${profile.display_name || profile.full_name} has no recent life updates.`}
          </p>
        </div>
      )}
    </div>
  );
}
