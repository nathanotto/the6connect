'use client';

/**
 * Direct Message Preview List
 *
 * Display DM previews with expand/collapse for a specific user
 */

import { useState } from 'react';
import { format } from 'date-fns';
import { linkify } from '@/lib/utils/linkify';

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
    <div className="space-y-0">
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
              className="border border-stone-500 dark:border-stone-600 p-3 hover:bg-stone-700/10 dark:hover:bg-stone-700/20 transition cursor-pointer bg-white dark:bg-stone-900/30"
              onClick={() => toggleExpand(message.id)}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-medium text-stone-800 dark:text-stone-300">
                      {isOwnMessage ? 'You' : (otherUserName || 'Them')}
                    </span>
                    <span className="text-xs text-stone-600 dark:text-stone-400">
                      {format(new Date(message.created_at), 'MMM d, h:mm a')}
                    </span>
                  </div>
                  <p className="text-sm text-foreground/90">
                    {isExpanded ? linkify(message.content) : preview}
                  </p>
                </div>
                {message.content.length > 40 && (
                  <button className="text-xs text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200">
                    {isExpanded ? '−' : '+'}
                  </button>
                )}
              </div>
            </div>
          );
        })
      ) : (
        <div className="border border-stone-500 dark:border-stone-600 p-4 bg-white dark:bg-stone-900/30">
          <p className="text-xs text-stone-600 dark:text-stone-400 text-center">
            No messages yet
          </p>
        </div>
      )}
    </div>
  );
}
