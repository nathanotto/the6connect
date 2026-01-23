/**
 * Event Detail Page
 *
 * View event details and submit availability response
 */

import { createClient } from '@/lib/supabase/server';
import { format } from 'date-fns';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ResponseForm } from '@/components/schedule/response-form';

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  // Fetch event with all details
  const { data: event } = await supabase
    .from('schedule_events')
    .select(`
      *,
      created_by:users!schedule_events_created_by_user_id_fkey(id, full_name, display_name),
      responses:schedule_responses(
        id,
        response,
        notes,
        created_at,
        user:users(id, full_name, display_name)
      )
    `)
    .eq('id', id)
    .single();

  if (!event) {
    notFound();
  }

  // Check if current user has responded
  const userResponse = event.responses.find((r: any) => r.user.id === user.id);

  // Group responses by type
  const availableResponses = event.responses.filter((r: any) => r.response === 'available');
  const unavailableResponses = event.responses.filter((r: any) => r.response === 'unavailable');
  const maybeResponses = event.responses.filter((r: any) => r.response === 'maybe');

  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/dashboard/schedule"
          className="text-sm text-foreground/60 hover:text-foreground mb-2 inline-block"
        >
          ← Back to Schedule
        </Link>
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-3xl font-bold">{event.title}</h1>
          {event.is_confirmed && (
            <span className="text-sm bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-3 py-1 rounded-full font-medium">
              Confirmed
            </span>
          )}
        </div>
        <p className="text-foreground/60">
          Proposed by {event.created_by.display_name || event.created_by.full_name}
        </p>
      </div>

      {/* Event Details */}
      <div className="border border-foreground/20 rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">Event Details</h2>
        <div className="space-y-3">
          <div>
            <span className="text-sm font-medium text-foreground/60">Date:</span>
            <p className="text-lg">
              {format(new Date(event.proposed_start), 'EEEE, MMMM d, yyyy')}
            </p>
          </div>
          <div>
            <span className="text-sm font-medium text-foreground/60">Time:</span>
            <p className="text-lg">
              {format(new Date(event.proposed_start), 'h:mm a')}
            </p>
          </div>
          {event.description && (
            <div>
              <span className="text-sm font-medium text-foreground/60">Description:</span>
              <p className="text-base mt-1">{event.description}</p>
            </div>
          )}
        </div>
      </div>

      {/* Your Response */}
      <div className="border border-foreground/20 rounded-lg p-4">
        <h2 className="text-lg font-semibold mb-3">Your Response</h2>
        <ResponseForm eventId={id} currentResponse={userResponse} />
      </div>

      {/* All Responses */}
      <div>
        <h2 className="text-xl font-semibold mb-4">
          Responses ({event.responses.length}/4)
        </h2>

        {/* Available */}
        {availableResponses.length > 0 && (
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-green-700 dark:text-green-300 mb-2">
              ✓ Available ({availableResponses.length})
            </h3>
            <div className="space-y-2">
              {availableResponses.map((response: any) => (
                <div
                  key={response.id}
                  className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg p-3"
                >
                  <div className="font-medium text-sm">
                    {response.user.display_name || response.user.full_name}
                  </div>
                  {response.notes && (
                    <p className="text-sm text-foreground/80 mt-1">{response.notes}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Maybe */}
        {maybeResponses.length > 0 && (
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-yellow-700 dark:text-yellow-300 mb-2">
              ? Maybe ({maybeResponses.length})
            </h3>
            <div className="space-y-2">
              {maybeResponses.map((response: any) => (
                <div
                  key={response.id}
                  className="bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3"
                >
                  <div className="font-medium text-sm">
                    {response.user.display_name || response.user.full_name}
                  </div>
                  {response.notes && (
                    <p className="text-sm text-foreground/80 mt-1">{response.notes}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Unavailable */}
        {unavailableResponses.length > 0 && (
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-red-700 dark:text-red-300 mb-2">
              ✗ Unavailable ({unavailableResponses.length})
            </h3>
            <div className="space-y-2">
              {unavailableResponses.map((response: any) => (
                <div
                  key={response.id}
                  className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg p-3"
                >
                  <div className="font-medium text-sm">
                    {response.user.display_name || response.user.full_name}
                  </div>
                  {response.notes && (
                    <p className="text-sm text-foreground/80 mt-1">{response.notes}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {event.responses.length === 0 && (
          <p className="text-foreground/60 text-center py-8 border border-foreground/20 rounded-lg">
            No responses yet. Be the first to respond!
          </p>
        )}
      </div>
    </div>
  );
}
