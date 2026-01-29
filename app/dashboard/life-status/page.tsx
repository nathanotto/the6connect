/**
 * Check-ins Dashboard Page
 *
 * View and update check-ins across different zones
 */

import { createClient } from '@/lib/supabase/server';
import { StatusForm } from '@/components/life-status/status-form';
import { CheckinCard } from '@/components/life-status/checkin-card';

export default async function LifeStatusPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  // Fetch life areas
  const { data: lifeAreas } = await supabase
    .from('life_areas')
    .select('*')
    .order('sort_order', { ascending: true });

  // Fetch all users
  const { data: allUsers } = await supabase
    .from('users')
    .select('id, full_name, display_name')
    .order('full_name', { ascending: true });

  // Fetch latest check-in for each user
  const latestCheckins: Record<string, any> = {};
  if (allUsers) {
    for (const member of allUsers) {
      const { data } = await supabase
        .from('life_status_updates')
        .select('*')
        .eq('user_id', member.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (data) {
        latestCheckins[member.id] = data;
      }
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Check-ins</h1>
        <p className="text-foreground/60 mt-2">
          Share your real experience with the men.
        </p>
      </div>

      {/* Form and User History Buttons */}
      <div className="flex flex-col lg:flex-row gap-0 items-start border border-slate-500 dark:border-slate-600">
        {/* Add New Check-in Form */}
        <div className="p-4 bg-slate-700/10 dark:bg-slate-800/20 w-full lg:w-auto">
          <h2 className="text-lg font-semibold mb-3 text-slate-800 dark:text-slate-300">Checking in...</h2>
          <StatusForm lifeAreas={lifeAreas || []} />
        </div>

        {/* User History Buttons */}
        <div className="border-t lg:border-t-0 lg:border-l border-slate-500 dark:border-slate-600 p-4 h-fit bg-slate-700/10 dark:bg-slate-800/20 w-full lg:w-auto">
          <h2 className="text-lg font-semibold mb-3 text-slate-800 dark:text-slate-300">Check-ins for:</h2>
          <div className="space-y-0">
            {allUsers?.map((member: any) => (
              <a
                key={member.id}
                href={`/dashboard/life-status/user/${member.id}`}
                className="block px-4 py-2 border border-slate-500 dark:border-slate-600 hover:bg-slate-700/20 dark:hover:bg-slate-700/40 transition text-sm font-medium text-center bg-white dark:bg-slate-900/30 text-slate-800 dark:text-slate-300"
              >
                {member.display_name || member.full_name}
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Latest Check-ins for each member */}
      <div>
        <h2 className="text-xl font-semibold mb-0 px-4 py-3 bg-zinc-200 dark:bg-zinc-800/40 border border-zinc-400 dark:border-zinc-600 text-zinc-900 dark:text-zinc-200">Latest Check-ins</h2>
        <div className="space-y-0 max-w-4xl border border-zinc-400 dark:border-zinc-600 border-t-0">
          {allUsers?.map((member: any, index: number) => {
            const checkin = latestCheckins[member.id];
            return (
              <div key={member.id} className={index > 0 ? 'border-t-2 border-zinc-500 dark:border-zinc-600' : ''}>
                <CheckinCard
                  checkin={checkin}
                  member={member}
                  lifeAreas={lifeAreas || []}
                  currentUserId={user.id}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
