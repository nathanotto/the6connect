/**
 * Message Thread Page
 *
 * 1-on-1 message thread with real-time updates
 */

import { createClient } from '@/lib/supabase/server';
import { MessageThread } from '@/components/messages/message-thread';
import { notFound } from 'next/navigation';
import Link from 'next/link';

export default async function MessageThreadPage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId: otherUserId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  // Fetch the other user's profile
  const { data: otherUser } = await supabase
    .from('users')
    .select('*')
    .eq('id', otherUserId)
    .single();

  if (!otherUser) {
    notFound();
  }

  // Fetch all messages between these two users
  const { data: messages } = await supabase
    .from('direct_messages')
    .select(`
      *,
      sender:users!direct_messages_sender_id_fkey(id, full_name, display_name)
    `)
    .or(`and(sender_id.eq.${user.id},recipient_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},recipient_id.eq.${user.id})`)
    .order('created_at', { ascending: true });

  return (
    <div className="flex justify-center">
      <div className="flex flex-col h-[calc(100vh-4rem)] md:h-[calc(100vh-8rem)] w-full max-w-3xl">
        {/* Header */}
        <div className="border-b border-foreground/20 pb-4 mb-4">
          <Link
            href="/dashboard/messages"
            className="text-sm text-foreground/60 hover:text-foreground mb-2 inline-block"
          >
            ← Back to messages
          </Link>
          <h1 className="text-2xl font-bold">
            {otherUser.display_name || otherUser.full_name}
          </h1>
        </div>

        {/* Message Thread */}
        <div className="flex-1 border border-foreground/20 rounded-lg overflow-hidden">
          <MessageThread
            currentUserId={user.id}
            otherUserId={otherUserId}
            otherUserName={otherUser.display_name || otherUser.full_name}
            initialMessages={messages || []}
          />
        </div>
      </div>
    </div>
  );
}
