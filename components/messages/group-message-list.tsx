'use client';

/**
 * Group Message List
 *
 * Display group messages
 */

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
  return (
    <div className="space-y-1.5">
      {initialMessages.length > 0 ? (
        initialMessages.map((message) => {
          return (
            <div
              key={message.id}
              className="border border-foreground/20 rounded p-1.5"
            >
              <div className="flex items-start gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-xs font-medium">
                      {message.sender.display_name || message.sender.full_name}
                    </span>
                    <span className="text-xs text-foreground/60">
                      {format(new Date(message.created_at), 'MMM d, h:mm a')}
                    </span>
                  </div>
                  <p className="text-xs text-foreground/80 whitespace-pre-wrap">
                    {message.content}
                  </p>
                </div>
              </div>
            </div>
          );
        })
      ) : (
        <p className="text-xs text-foreground/60 text-center py-3">
          No group messages yet. Be the first to post!
        </p>
      )}
    </div>
  );
}
