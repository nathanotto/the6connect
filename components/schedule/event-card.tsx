/**
 * Event Card
 *
 * Display event summary with response counts
 */

import { format } from 'date-fns';
import Link from 'next/link';

interface EventCardProps {
  event: {
    id: string;
    title: string;
    description?: string;
    proposed_start: string;
    proposed_end?: string;
    is_confirmed: boolean;
    created_by: {
      id: string;
      full_name: string;
      display_name?: string;
    };
    responses: Array<{
      response: string;
    }>;
  };
}

export function EventCard({ event }: EventCardProps) {
  const availableCount = event.responses.filter((r) => r.response === 'available').length;
  const unavailableCount = event.responses.filter((r) => r.response === 'unavailable').length;
  const maybeCount = event.responses.filter((r) => r.response === 'maybe').length;

  return (
    <Link
      href={`/dashboard/schedule/event/${event.id}`}
      className="block border border-foreground/20 rounded-lg p-4 hover:bg-foreground/5 transition"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-lg">{event.title}</h3>
            {event.is_confirmed && (
              <span className="text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-0.5 rounded font-medium">
                Confirmed
              </span>
            )}
          </div>

          {event.description && (
            <p className="text-sm text-foreground/80 mb-2">{event.description}</p>
          )}

          <div className="flex flex-wrap items-center gap-3 text-sm text-foreground/60">
            <span>
              {format(new Date(event.proposed_start), 'EEEE, MMM d')} at {format(new Date(event.proposed_start), 'h:mm a')}
            </span>
          </div>

          <p className="text-xs text-foreground/60 mt-2">
            Proposed by {event.created_by.display_name || event.created_by.full_name}
          </p>
        </div>

        {/* Response Summary */}
        <div className="text-right">
          <div className="text-xs text-foreground/60 mb-1">Responses:</div>
          <div className="space-y-1 text-sm">
            <div className="text-green-700 dark:text-green-300">
              ✓ {availableCount} available
            </div>
            <div className="text-red-700 dark:text-red-300">
              ✗ {unavailableCount} unavailable
            </div>
            <div className="text-yellow-700 dark:text-yellow-300">
              ? {maybeCount} maybe
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
