'use client';

/**
 * Message Thread
 *
 * Displays messages between two users with real-time updates
 */

import { useEffect, useState, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { format } from 'date-fns';
import { MessageComposer } from './message-composer';

interface Message {
  id: string;
  sender_id: string;
  recipient_id: string;
  content: string;
  created_at: string;
  sender: {
    id: string;
    full_name: string;
    display_name?: string;
  };
}

interface MessageThreadProps {
  currentUserId: string;
  otherUserId: string;
  otherUserName: string;
  initialMessages: Message[];
}

export function MessageThread({
  currentUserId,
  otherUserId,
  otherUserName,
  initialMessages,
}: MessageThreadProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Set up real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel('messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'direct_messages',
          filter: `or(and(sender_id.eq.${currentUserId},recipient_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},recipient_id.eq.${currentUserId}))`,
        },
        async (payload) => {
          // Fetch the full message with sender info
          const { data } = await supabase
            .from('direct_messages')
            .select(`
              *,
              sender:users!direct_messages_sender_id_fkey(id, full_name, display_name)
            `)
            .eq('id', payload.new.id)
            .single();

          if (data) {
            setMessages((prev) => [...prev, data as Message]);
          }
        }
      )
      .subscribe();

    // Mark messages as read when viewing thread
    markAsRead();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUserId, otherUserId]);

  const markAsRead = async () => {
    await fetch('/api/messages/mark-read', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ otherUserId }),
    });
  };

  return (
    <div className="flex flex-col h-full">
      {/* Messages List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length > 0 ? (
          messages.map((message) => {
            const isOwnMessage = message.sender_id === currentUserId;
            return (
              <div
                key={message.id}
                className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[70%] rounded-lg px-4 py-2 ${
                    isOwnMessage
                      ? 'bg-foreground text-background'
                      : 'bg-foreground/10'
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                  <p
                    className={`text-xs mt-1 ${
                      isOwnMessage ? 'text-background/70' : 'text-foreground/60'
                    }`}
                  >
                    {format(new Date(message.created_at), 'h:mm a')}
                  </p>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center text-foreground/60 py-8">
            <p>No messages yet. Start the conversation!</p>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Composer */}
      <div className="border-t border-foreground/20 p-4">
        <MessageComposer
          recipientId={otherUserId}
          onMessageSent={() => {
            // Messages will be added via real-time subscription
          }}
        />
      </div>
    </div>
  );
}
