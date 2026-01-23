/**
 * Member Life Status Page
 *
 * View life status updates for a specific member
 */

import { createClient } from '@/lib/supabase/server';
import { format } from 'date-fns';
import { notFound } from 'next/navigation';
import Link from 'next/link';

export default async function MemberLifeStatusPage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  // Fetch the member's profile
  const { data: member } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();

  if (!member) {
    notFound();
  }

  // Fetch life areas
  const { data: lifeAreas } = await supabase
    .from('life_areas')
    .select('*')
    .order('sort_order', { ascending: true });

  // Fetch member's recent status updates
  const { data: recentUpdates } = await supabase
    .from('life_status_updates')
    .select(`
      *,
      life_area:life_areas(*)
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(20);

  // Get latest status for each life area
  const latestByArea: Record<string, any> = {};
  recentUpdates?.forEach((update: any) => {
    if (!latestByArea[update.life_area_id]) {
      latestByArea[update.life_area_id] = update;
    }
  });

  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/dashboard/life-status"
          className="text-sm text-foreground/60 hover:text-foreground mb-2 inline-block"
        >
          ← Back to Life Status
        </Link>
        <h1 className="text-3xl font-bold">
          {member.display_name || member.full_name}'s Life Status
        </h1>
        <p className="text-foreground/60 mt-2">
          View their life status across different areas
        </p>
      </div>

      {/* Current Status Overview */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Current Status</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {lifeAreas?.map((area: any) => {
            const latest = latestByArea[area.id];
            return (
              <div
                key={area.id}
                className="border border-foreground/20 rounded-lg p-6"
              >
                <h3 className="font-semibold text-lg mb-1">{area.name}</h3>
                <p className="text-sm text-foreground/60 mb-3">{area.description}</p>
                {latest ? (
                  <>
                    <div className="flex items-center gap-2 mb-2">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          latest.status === 'thriving'
                            ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                            : latest.status === 'maintaining'
                            ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
                            : 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200'
                        }`}
                      >
                        {latest.status.charAt(0).toUpperCase() + latest.status.slice(1)}
                      </span>
                      <span className="text-sm text-foreground/60">
                        Mood: {latest.mood_rating}/10
                      </span>
                    </div>
                    <p className="text-sm text-foreground/60">
                      Updated {format(new Date(latest.created_at), 'MMM d, yyyy')}
                    </p>
                    {latest.notes && (
                      <p className="text-sm mt-2 italic text-foreground/80">
                        "{latest.notes}"
                      </p>
                    )}
                  </>
                ) : (
                  <p className="text-sm text-foreground/60">No updates yet</p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Updates History */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Recent Updates</h2>
        {recentUpdates && recentUpdates.length > 0 ? (
          <div className="space-y-3">
            {recentUpdates.map((update: any) => (
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
                    {format(new Date(update.created_at), 'MMM d, h:mm a')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-foreground/60">No updates yet.</p>
        )}
      </div>
    </div>
  );
}
