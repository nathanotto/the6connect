/**
 * Member Check-ins Page
 *
 * View check-ins for a specific member
 */

import { createClient } from '@/lib/supabase/server';
import { CheckinCard } from '@/components/life-status/checkin-card';
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

  // Fetch member's recent check-ins
  const { data: recentCheckins } = await supabase
    .from('life_status_updates')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(50);

  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/dashboard/life-status"
          className="text-sm text-foreground/60 hover:text-foreground mb-2 inline-block"
        >
          ← Back to Check-ins
        </Link>
        <h1 className="text-3xl font-bold">
          {member.display_name || member.full_name}'s Check-ins
        </h1>
        <p className="text-foreground/60 mt-2">
          View their check-in history
        </p>
      </div>

      {/* Check-ins History */}
      <div className="max-w-4xl">
        <h2 className="text-xl font-semibold mb-4">Check-in History</h2>
        {recentCheckins && recentCheckins.length > 0 ? (
          <div className="space-y-4">
            {recentCheckins.map((checkin: any) => (
              <CheckinCard
                key={checkin.id}
                checkin={checkin}
                member={member}
                lifeAreas={lifeAreas || []}
                currentUserId={user.id}
              />
            ))}
          </div>
        ) : (
          <p className="text-foreground/60">No check-ins yet.</p>
        )}
      </div>
    </div>
  );
}
