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
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Messages</h1>
        <p className="text-foreground/60 mt-2">
          Group chat and direct messages
        </p>
      </div>

      {/* Group Messages */}
      <div className="border border-foreground/20 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">Group Chat</h2>
          <Link
            href="/dashboard/messages/group"
            className="text-sm text-foreground/60 hover:text-foreground"
          >
            View all →
          </Link>
        </div>
        <GroupMessageList
          initialMessages={groupMessages || []}
          currentUserId={user.id}
        />
        <div className="mt-4 pt-4 border-t border-foreground/10">
          <GroupMessageForm />
        </div>
      </div>

      {/* Direct Messages - 3 Columns */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Direct Messages</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {usersWithMessages.map((member) => (
            <div
              key={member.id}
              className="border border-foreground/20 rounded-lg p-4"
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-sm">
                  {member.display_name || member.full_name}
                </h3>
                <Link
                  href={`/dashboard/messages/${member.id}`}
                  className="text-xs text-foreground/60 hover:text-foreground"
                >
                  View all →
                </Link>
              </div>

              <DMPreviewList
                messages={member.messages}
                currentUserId={user.id}
                otherUserId={member.id}
                otherUserName={member.display_name || member.full_name}
              />

              <div className="mt-4 pt-4 border-t border-foreground/10">
                <DMForm
                  recipientId={member.id}
                  recipientName={member.display_name || member.full_name}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
