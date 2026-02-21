'use client';

/**
 * Group Message List
 *
 * Display group messages
 */

import { format } from 'date-fns';
import { linkify } from '@/lib/utils/linkify';

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
  return (
    <div className="space-y-0">
      {initialMessages.length > 0 ? (
        initialMessages.map((message) => {
          return (
            <div
              key={message.id}
              className="border border-neutral-500 dark:border-neutral-600 p-2 bg-white dark:bg-neutral-900/30"
            >
              <div className="flex items-start gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-xs font-medium text-neutral-800 dark:text-neutral-300">
                      {message.sender.display_name || message.sender.full_name}
                    </span>
                    <span className="text-xs text-neutral-600 dark:text-neutral-400">
                      {format(new Date(message.created_at), 'MMM d, h:mm a')}
                    </span>
                  </div>
                  <p className="text-xs text-foreground/90 whitespace-pre-wrap">
                    {linkify(message.content)}
                  </p>
                </div>
              </div>
            </div>
          );
        })
      ) : (
        <div className="border border-neutral-500 dark:border-neutral-600 p-3 bg-white dark:bg-neutral-900/30">
          <p className="text-xs text-neutral-600 dark:text-neutral-400 text-center">
            No group messages yet. Be the first to post!
          </p>
        </div>
      )}
    </div>
  );
}
