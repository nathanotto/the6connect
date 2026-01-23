/**
 * Group Messages Page
 *
 * Full group chat view
 */

import { createClient } from '@/lib/supabase/server';
import { GroupMessageList } from '@/components/messages/group-message-list';
import { GroupMessageForm } from '@/components/messages/group-message-form';
import Link from 'next/link';

export default async function GroupMessagesPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  // Fetch all group messages
  const { data: groupMessages } = await supabase
    .from('group_messages')
    .select(`
      *,
      sender:users!group_messages_sender_id_fkey(id, full_name, display_name)
    `)
    .order('created_at', { ascending: false })
    .limit(50);

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/dashboard/messages"
          className="text-sm text-foreground/60 hover:text-foreground mb-2 inline-block"
        >
          ← Back to Messages
        </Link>
        <h1 className="text-3xl font-bold">Group Chat</h1>
        <p className="text-foreground/60 mt-2">
          Messages visible to all group members
        </p>
      </div>

      {/* Message Form */}
      <div className="border border-foreground/20 rounded-lg p-4">
        <h2 className="text-sm font-semibold mb-3">Write a Message</h2>
        <GroupMessageForm />
      </div>

      {/* All Messages */}
      <div className="border border-foreground/20 rounded-lg p-4">
        <h2 className="text-lg font-semibold mb-4">All Messages</h2>
        <GroupMessageList
          initialMessages={groupMessages || []}
          currentUserId={user.id}
        />
      </div>
    </div>
  );
}
