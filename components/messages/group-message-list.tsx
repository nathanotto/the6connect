'use client';

/**
 * Group Message List
 *
 * Display group messages with expand/collapse
 */

import { useState } from 'react';
import { format } from 'date-fns';

interface GroupMessage {
  id: string;
  content: string;
  created_at: string;
  sender: {
    id: string;
    full_name: string;
    display_name?: string;
  };
}

interface GroupMessageListProps {
  initialMessages: GroupMessage[];
  currentUserId: string;
}

export function GroupMessageList({ initialMessages, currentUserId }: GroupMessageListProps) {
  const [expandedMessageId, setExpandedMessageId] = useState<string | null>(null);

  const toggleExpand = (messageId: string) => {
    setExpandedMessageId(expandedMessageId === messageId ? null : messageId);
  };

  return (
    <div className="space-y-2">
      {initialMessages.length > 0 ? (
        initialMessages.map((message) => {
          const isExpanded = expandedMessageId === message.id;
          const isOwnMessage = message.sender.id === currentUserId;
          const preview = message.content.length > 60
            ? message.content.substring(0, 60) + '...'
            : message.content;

          return (
            <div
              key={message.id}
              className="border border-foreground/20 rounded p-2 hover:bg-foreground/5 transition cursor-pointer"
              onClick={() => toggleExpand(message.id)}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-medium">
                      {isOwnMessage ? 'You' : (message.sender.display_name || message.sender.full_name)}
                    </span>
                    <span className="text-xs text-foreground/60">
                      {format(new Date(message.created_at), 'MMM d, h:mm a')}
                    </span>
                  </div>
                  <p className="text-sm text-foreground/80">
                    {isExpanded ? message.content : preview}
                  </p>
                </div>
                {message.content.length > 60 && (
                  <button className="text-xs text-foreground/60 hover:text-foreground">
                    {isExpanded ? '−' : '+'}
                  </button>
                )}
              </div>
            </div>
          );
        })
      ) : (
        <p className="text-sm text-foreground/60 text-center py-4">
          No group messages yet. Be the first to post!
        </p>
      )}
    </div>
  );
}
