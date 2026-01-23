'use client';

/**
 * Direct Message Preview List
 *
 * Display DM previews with expand/collapse for a specific user
 */

import { useState } from 'react';
import { format } from 'date-fns';

interface DirectMessage {
  id: string;
  sender_id: string;
  content: string;
  created_at: string;
}

interface DMPreviewListProps {
  messages: DirectMessage[];
  currentUserId: string;
  otherUserId: string;
  otherUserName?: string;
}

export function DMPreviewList({ messages, currentUserId, otherUserId, otherUserName }: DMPreviewListProps) {
  const [expandedMessageId, setExpandedMessageId] = useState<string | null>(null);

  const toggleExpand = (messageId: string) => {
    setExpandedMessageId(expandedMessageId === messageId ? null : messageId);
  };

  return (
    <div className="space-y-2">
      {messages.length > 0 ? (
        messages.map((message) => {
          const isExpanded = expandedMessageId === message.id;
          const isOwnMessage = message.sender_id === currentUserId;
          const preview = message.content.length > 40
            ? message.content.substring(0, 40) + '...'
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
                      {isOwnMessage ? 'You' : (otherUserName || 'Them')}
                    </span>
                    <span className="text-xs text-foreground/60">
                      {format(new Date(message.created_at), 'MMM d, h:mm a')}
                    </span>
                  </div>
                  <p className="text-sm text-foreground/80">
                    {isExpanded ? message.content : preview}
                  </p>
                </div>
                {message.content.length > 40 && (
                  <button className="text-xs text-foreground/60 hover:text-foreground">
                    {isExpanded ? '−' : '+'}
                  </button>
                )}
              </div>
            </div>
          );
        })
      ) : (
        <p className="text-xs text-foreground/60 text-center py-4">
          No messages yet
        </p>
      )}
    </div>
  );
}
