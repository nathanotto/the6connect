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
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* Add New Check-in Form */}
        <div className="border border-foreground/20 rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-3">Checking in...</h2>
          <StatusForm lifeAreas={lifeAreas || []} />
        </div>

        {/* User History Buttons */}
        <div className="border border-foreground/20 rounded-lg p-4 h-fit">
          <h2 className="text-lg font-semibold mb-3">Check-ins for:</h2>
          <div className="space-y-2">
            {allUsers?.map((member: any) => (
              <a
                key={member.id}
                href={`/dashboard/life-status/user/${member.id}`}
                className="block px-4 py-2 border border-foreground/20 rounded-lg hover:bg-foreground/5 transition text-sm font-medium text-center"
              >
                {member.display_name || member.full_name}
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Latest Check-ins for each member */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Latest Check-ins</h2>
        <div className="space-y-4 max-w-4xl">
          {allUsers?.map((member: any) => {
            const checkin = latestCheckins[member.id];
            return (
              <CheckinCard
                key={member.id}
                checkin={checkin}
                member={member}
                lifeAreas={lifeAreas || []}
                currentUserId={user.id}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
