'use client';

import { useState } from 'react';
import { formatActivityMessage } from '@/lib/game-activity-log';

type ActivityEntry = {
  id: string;
  activity_type: string;
  metadata: any;
  created_at: string;
};

export type PersonGroup = {
  userId: string;
  name: string;
  lastActivity: string | null;
  entries: ActivityEntry[];
  currentObt?: { description: string; completion_percentage: number; periodLabel: string } | null;
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor(diff / 3600000);
  const minutes = Math.floor(diff / 60000);
  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return 'just now';
}

function stalenessColor(lastActivity: string | null): string {
  if (!lastActivity) return 'text-red-500';
  const days = (Date.now() - new Date(lastActivity).getTime()) / 86400000;
  if (days >= 7) return 'text-red-500';
  if (days >= 4) return 'text-amber-400';
  return 'text-green-500';
}

const PREVIEW_COUNT = 3;

export function UpdatesFeed({ groups }: { groups: PersonGroup[] }) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  return (
    <div className="border border-foreground/20 rounded-lg p-6">
      <h2 className="text-lg font-semibold mb-4">Updates</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {groups.map((group) => {
          const isExpanded = expanded[group.userId] ?? false;
          const visible = isExpanded ? group.entries : group.entries.slice(0, PREVIEW_COUNT);
          const remaining = group.entries.length - PREVIEW_COUNT;
          const color = stalenessColor(group.lastActivity);

          return (
            <div key={group.userId}>
              <div className="flex items-baseline gap-2 mb-1.5">
                <span className="font-semibold text-sm">{group.name}</span>
                <span className={`text-xs ${color}`}>
                  {group.lastActivity
                    ? `last updated ${timeAgo(group.lastActivity)}`
                    : 'no updates recorded'}
                </span>
              </div>

              {group.currentObt && (
                <div className="pl-3 border-l border-foreground/30 mb-2">
                  <p className="text-xs text-foreground/60 uppercase tracking-wide font-semibold">One Big Thing</p>
                  <p className="text-sm italic pl-2 text-foreground bg-[#e8957a]/20 rounded px-2">{group.currentObt.description || <span className="text-foreground/60">no OBT set</span>}</p>
                  <p className="text-xs text-foreground/70">{group.currentObt.completion_percentage}% complete</p>
                </div>
              )}

              {visible.length > 0 ? (
                <ul className="space-y-1 pl-3 border-l border-foreground/10">
                  {visible.map((entry) => (
                    <li key={entry.id} className="flex items-baseline gap-2 text-sm">
                      <span className="text-foreground/70 flex-1">
                        {formatActivityMessage(entry.activity_type, entry.metadata)}
                      </span>
                      <span className="text-foreground/40 text-xs shrink-0">
                        {timeAgo(entry.created_at)}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="pl-3 text-sm text-foreground/40 border-l border-foreground/10">
                  no updates recorded
                </p>
              )}

              {remaining > 0 && (
                <button
                  onClick={() =>
                    setExpanded((prev) => ({ ...prev, [group.userId]: !isExpanded }))
                  }
                  className="mt-1.5 pl-3 text-xs text-foreground/50 hover:text-foreground transition-colors"
                >
                  {isExpanded ? '↑ show less' : `↓ show ${remaining} more`}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
