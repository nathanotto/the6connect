'use client';

import { useState, useEffect, useRef } from 'react';
import { format } from 'date-fns';
import Link from 'next/link';

type Message = {
  id: string;
  type: string;
  content: string;
  username: string;
  created_at: string;
};

export function MessageList({ messages }: { messages: Message[] }) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Dismiss on click outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setExpandedId(null);
      }
    };
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, []);

  return (
    <>
      <div ref={containerRef} className="space-y-0 mb-3">
        {messages.map((msg) => {
          const key = `${msg.type}-${msg.id}`;
          const isExpanded = expandedId === key;
          const isTruncated = msg.content.length > 50;
          const truncated = isTruncated ? msg.content.substring(0, 50) + '…' : msg.content;

          return (
            <div
              key={key}
              className="relative text-sm border border-neutral-500 dark:border-neutral-600 p-2 bg-white dark:bg-neutral-900/30"
              onMouseEnter={() => isTruncated && setExpandedId(key)}
              onMouseLeave={() => setExpandedId(null)}
              onClick={(e) => {
                e.stopPropagation();
                if (isTruncated) setExpandedId(isExpanded ? null : key);
              }}
            >
              <div className="text-xs text-neutral-600 dark:text-neutral-400">
                {format(new Date(msg.created_at), 'MMM d')} — {msg.username}
              </div>
              <p className="text-foreground/80 truncate">{truncated}</p>

              {isExpanded && (
                <div className="absolute left-0 right-0 top-full z-50 bg-white dark:bg-neutral-900 border border-neutral-400 dark:border-neutral-500 rounded-b-lg shadow-lg p-3 text-sm text-foreground/90 leading-relaxed">
                  <div className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">
                    {format(new Date(msg.created_at), 'MMM d, h:mm a')} — {msg.username}
                  </div>
                  {msg.content}
                </div>
              )}
            </div>
          );
        })}
      </div>
      <Link
        href="/dashboard/messages"
        className="text-sm text-neutral-700 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200 underline font-medium"
      >
        View all messages →
      </Link>
    </>
  );
}
