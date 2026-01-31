/**
 * Messages Page
 *
 * Group chat at top, DM columns for each member below
 */

import { createClient } from '@/lib/supabase/server';
import { GroupMessageList } from '@/components/messages/group-message-list';
import { GroupMessageForm } from '@/components/messages/group-message-form';
import { DMPreviewList } from '@/components/messages/dm-preview-list';
import { DMForm } from '@/components/messages/dm-form';
import Link from 'next/link';

export default async function MessagesPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  // Fetch 5 most recent group messages
  const { data: groupMessages } = await supabase
    .from('group_messages')
    .select(`
      *,
      sender:users!group_messages_sender_id_fkey(id, full_name, display_name)
    `)
    .order('created_at', { ascending: false })
    .limit(5);

  // Fetch all users except current user
  const { data: otherUsers } = await supabase
    .from('users')
    .select('id, full_name, display_name')
    .neq('id', user.id)
    .order('full_name', { ascending: true });

  // For each user, get the last 5 DMs
  const usersWithMessages = await Promise.all(
    (otherUsers || []).map(async (otherUser) => {
      const { data: messages } = await supabase
        .from('direct_messages')
        .select('*')
        .or(`and(sender_id.eq.${user.id},recipient_id.eq.${otherUser.id}),and(sender_id.eq.${otherUser.id},recipient_id.eq.${user.id})`)
        .order('created_at', { ascending: false })
        .limit(5);

      return {
        ...otherUser,
        messages: messages || [],
      };
    })
  );

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold">Messages</h1>
        <p className="text-foreground/60 mt-2">
          Group chat and direct messages
        </p>
      </div>

      {/* Group Messages */}
      <div className="border border-neutral-500 dark:border-neutral-600 p-0 bg-neutral-700/10 dark:bg-neutral-800/20">
        <div className="flex items-center justify-between border-b border-neutral-500 dark:border-neutral-600 p-4 bg-neutral-200 dark:bg-neutral-800/40">
          <Link href="/dashboard/messages/group">
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-200 hover:text-neutral-950 dark:hover:text-neutral-50 cursor-pointer transition">Group Chat</h2>
          </Link>
          <Link
            href="/dashboard/messages/group"
            className="text-sm text-neutral-700 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200"
          >
            View all →
          </Link>
        </div>
        <div className="p-4 border-b border-neutral-500 dark:border-neutral-600">
          <GroupMessageForm />
        </div>
        <div className="p-4">
          <GroupMessageList
            initialMessages={groupMessages || []}
            currentUserId={user.id}
          />
        </div>
      </div>

      {/* Direct Messages */}
      <div>
        <h2 className="text-xl font-semibold mb-0 px-4 py-3 bg-stone-200 dark:bg-stone-800/40 border border-stone-500 dark:border-stone-600 text-stone-900 dark:text-stone-200">Direct Messages</h2>
        <div className="space-y-0 border border-stone-500 dark:border-stone-600 border-t-0">
          {usersWithMessages.map((member, index) => (
            <div
              key={member.id}
              className={`p-0 bg-stone-700/5 dark:bg-stone-800/20 ${index > 0 ? 'border-t-2 border-stone-600 dark:border-stone-500' : ''}`}
            >
              <div className="flex items-center justify-between border-b border-stone-500 dark:border-stone-600 p-4 bg-stone-200 dark:bg-stone-800/40">
                <Link href={`/dashboard/messages/${member.id}`}>
                  <h3 className="font-semibold text-sm text-stone-900 dark:text-stone-200 hover:text-stone-950 dark:hover:text-stone-50 cursor-pointer transition">
                    {member.display_name || member.full_name}
                  </h3>
                </Link>
                <Link
                  href={`/dashboard/messages/${member.id}`}
                  className="text-xs text-stone-700 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200"
                >
                  View all →
                </Link>
              </div>

              <div className="p-4 border-b border-stone-500 dark:border-stone-600">
                <DMForm
                  recipientId={member.id}
                  recipientName={member.display_name || member.full_name}
                />
              </div>

              <div className="p-4">
                <DMPreviewList
                  messages={member.messages}
                  currentUserId={user.id}
                  otherUserId={member.id}
                  otherUserName={member.display_name || member.full_name}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
