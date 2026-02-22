/**
 * Dashboard Overview Page
 *
 * Main landing page after login.
 * Shows summary of recent activity, commitments, and updates.
 */

import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { format } from 'date-fns';
import { getRandomMessage } from '@/lib/constants/inspirational-messages';
import { GroupMessageForm } from '@/components/messages/group-message-form';
import { ActivitySummary } from '@/components/dashboard/activity-summary';
import { MessageList } from '@/components/dashboard/message-list';

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


  // Fetch all users
  const { data: allUsers } = await supabase
    .from('users')
    .select('id, full_name, display_name')
    .order('full_name', { ascending: true });

  // For each user, get their most recent check-in
  const usersWithCheckins = await Promise.all(
    (allUsers || []).map(async (member) => {
      const { data: latestCheckin } = await supabase
        .from('life_status_updates')
        .select('*')
        .eq('user_id', member.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      return {
        ...member,
        latestCheckin,
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

  // Fetch recent group messages
  const { data: groupMessages } = await supabase
    .from('group_messages')
    .select(`
      *,
      sender:users!group_messages_sender_id_fkey(id, full_name, display_name)
    `)
    .order('created_at', { ascending: false })
    .limit(5);

  // Fetch recent direct messages (either sent or received by current user)
  const { data: directMessages } = await supabase
    .from('direct_messages')
    .select(`
      *,
      sender:users!direct_messages_sender_id_fkey(id, full_name, display_name)
    `)
    .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
    .order('created_at', { ascending: false })
    .limit(5);

  // Combine and sort all messages
  const allMessages = [
    ...(groupMessages || []).map((m: any) => ({
      ...m,
      type: 'group',
      username: m.sender.display_name || m.sender.full_name,
    })),
    ...(directMessages || []).map((m: any) => ({
      ...m,
      type: 'dm',
      username: m.sender.display_name || m.sender.full_name,
    })),
  ]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);

  const inspirationalMessage = getRandomMessage();

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        {profile?.profile_picture_url && (
          <img
            src={profile.profile_picture_url}
            alt="Profile"
            className="w-16 h-16 rounded-full object-cover border-2 border-foreground/20"
          />
        )}
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">
            {profile?.display_name || profile?.full_name || 'Friend'} of The Six
          </h1>
          <p className="text-sm italic text-foreground/60 mt-2">
            {inspirationalMessage}
          </p>
        </div>
      </div>

      <ActivitySummary />

      {/* Messages and Check-ins - Side by Side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
        {/* Messages */}
        <div className="border border-neutral-500 dark:border-neutral-600 p-6 bg-neutral-700/10 dark:bg-neutral-800/20">
          <Link href="/dashboard/messages">
            <h3 className="font-semibold mb-3 text-neutral-800 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-neutral-100 cursor-pointer transition">Messages</h3>
          </Link>
          <div className="mb-4">
            <GroupMessageForm />
          </div>
          {allMessages && allMessages.length > 0 ? (
            <MessageList messages={allMessages} />
          ) : (
            <>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-3">
                No recent messages.
              </p>
              <Link
                href="/dashboard/messages"
                className="text-sm text-neutral-700 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200 underline font-medium"
              >
                Send a message →
              </Link>
            </>
          )}
        </div>

        {/* Check-ins - All Members */}
        <div className="border border-zinc-400 dark:border-zinc-600 lg:border-l-0 bg-zinc-100/50 dark:bg-zinc-900/20">
          <Link href="/dashboard/checkins">
            <h3 className="font-semibold px-4 py-3 bg-zinc-200 dark:bg-zinc-800/40 border-b border-zinc-400 dark:border-zinc-600 text-zinc-900 dark:text-zinc-200 hover:text-zinc-950 dark:hover:text-zinc-50 cursor-pointer transition">Check-ins</h3>
          </Link>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
            {usersWithCheckins?.map((member: any, index: number) => {
              const checkin = member.latestCheckin;

              return (
                <div
                  key={member.id}
                  className="border border-zinc-400 dark:border-zinc-600 border-t-0 p-4 bg-zinc-100/50 dark:bg-zinc-900/20"
                >
                  <div className="space-y-0">
                    <div className="border border-zinc-400 dark:border-zinc-600 p-2 bg-white dark:bg-zinc-900/30 mb-0">
                      <h4 className="font-semibold text-sm text-zinc-900 dark:text-zinc-200">
                        <Link
                          href={`/dashboard/profile/${member.id}`}
                          className="hover:underline"
                        >
                          {member.display_name || member.full_name}
                        </Link>
                      </h4>
                    </div>
                    {checkin ? (
                      <>
                        <div className="border border-zinc-400 dark:border-zinc-600 border-t-0 p-2 bg-white dark:bg-zinc-900/30">
                          <p className="text-xs text-zinc-600 dark:text-zinc-400">
                            {format(new Date(checkin.created_at), 'MMM d, h:mm a')}
                          </p>
                        </div>
                        <div className="border border-zinc-400 dark:border-zinc-600 border-t-0 p-2 bg-white dark:bg-zinc-900/30">
                          <p className="text-xs text-foreground/80">
                            <span className="font-medium text-zinc-700 dark:text-zinc-400">Topic:</span> {checkin.zone_other || 'General check-in'}
                          </p>
                        </div>
                        <div className="border border-zinc-400 dark:border-zinc-600 border-t-0 p-2 bg-white dark:bg-zinc-900/30">
                          <p className="text-xs text-foreground/80">
                            <span className="font-medium text-zinc-700 dark:text-zinc-400">Feeling:</span> {checkin.status}
                            {checkin.status_other && ` (${checkin.status_other})`}
                          </p>
                        </div>
                        <div className="border border-zinc-400 dark:border-zinc-600 border-t-0 p-2 bg-white dark:bg-zinc-900/30">
                          <p className="text-xs text-foreground/80">
                            <span className="font-medium text-zinc-700 dark:text-zinc-400">Needs:</span> {checkin.support_type === 'Other' ? checkin.support_type_other : checkin.support_type}
                          </p>
                        </div>
                      </>
                    ) : (
                      <div className="border border-zinc-400 dark:border-zinc-600 border-t-0 p-2 bg-white dark:bg-zinc-900/30">
                        <p className="text-xs text-zinc-600 dark:text-zinc-400">No check-ins yet</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="border border-neutral-500 dark:border-neutral-600 p-6 bg-neutral-700/10 dark:bg-neutral-800/20">
        <h3 className="font-semibold mb-4 text-neutral-800 dark:text-neutral-300">Quick Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-0">
          <Link
            href="/dashboard/checkins"
            className="border border-neutral-500 dark:border-neutral-600 p-4 hover:bg-neutral-700/20 dark:hover:bg-neutral-700/40 transition text-center bg-white dark:bg-neutral-900/30"
          >
            <p className="font-medium text-sm text-neutral-800 dark:text-neutral-300">Post Check-in</p>
          </Link>
          <Link
            href="/dashboard/questions"
            className="border border-neutral-500 dark:border-neutral-600 border-l-0 p-4 hover:bg-neutral-700/20 dark:hover:bg-neutral-700/40 transition text-center bg-white dark:bg-neutral-900/30"
          >
            <p className="font-medium text-sm text-neutral-800 dark:text-neutral-300">Pose a Question to The Six</p>
          </Link>
          <Link
            href="/dashboard/photos"
            className="border border-neutral-500 dark:border-neutral-600 border-l-0 p-4 hover:bg-neutral-700/20 dark:hover:bg-neutral-700/40 transition text-center bg-white dark:bg-neutral-900/30"
          >
            <p className="font-medium text-sm text-neutral-800 dark:text-neutral-300">Share Photo</p>
          </Link>
        </div>
      </div>

      {/* Photos */}
      <div className="border border-stone-500 dark:border-stone-600 p-6 bg-stone-700/10 dark:bg-stone-800/20">
        <Link href="/dashboard/photos">
          <h3 className="font-semibold mb-3 text-stone-800 dark:text-stone-300 hover:text-stone-900 dark:hover:text-stone-100 cursor-pointer transition">Photos</h3>
        </Link>
        {recentPhotos && recentPhotos.length > 0 ? (
          <>
            <div className="space-y-0 mb-3">
              {recentPhotos.map((photo: any) => (
                <div key={photo.id} className="flex gap-3 border border-stone-500 dark:border-stone-600 p-2 bg-white dark:bg-stone-900/30">
                  <img
                    src={photo.photo_url}
                    alt={photo.caption || 'Photo'}
                    className="w-16 h-16 object-cover rounded flex-shrink-0 border-2 border-stone-500 dark:border-stone-600"
                  />
                  <div className="flex-1 min-w-0 text-sm">
                    <p className="font-medium text-xs text-stone-800 dark:text-stone-300">
                      {photo.user.display_name || photo.user.full_name}
                    </p>
                    <p className="text-xs text-foreground/60 truncate">
                      {photo.caption || 'No caption'}
                    </p>
                    <p className="text-xs text-stone-600 dark:text-stone-400">
                      {format(new Date(photo.created_at), 'MMM d, h:mm a')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <Link
              href="/dashboard/photos"
              className="text-sm text-stone-700 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200 underline font-medium"
            >
              View all photos →
            </Link>
          </>
        ) : (
          <>
            <p className="text-sm text-stone-600 dark:text-stone-400 mb-3">
              No photos yet.
            </p>
            <Link
              href="/dashboard/photos"
              className="text-sm text-stone-700 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200 underline font-medium"
            >
              Share a photo →
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
