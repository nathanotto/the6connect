/**
 * Schedule Page
 *
 * View and create group meeting events
 */

import { createClient } from '@/lib/supabase/server';
import { EventForm } from '@/components/schedule/event-form';
import { EventCard } from '@/components/schedule/event-card';
import { isPast, isFuture } from 'date-fns';

export default async function SchedulePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  // Fetch all events with creator info and responses
  const { data: events } = await supabase
    .from('schedule_events')
    .select(`
      *,
      created_by:users!schedule_events_created_by_user_id_fkey(id, full_name, display_name),
      responses:schedule_responses(id, response)
    `)
    .order('proposed_start', { ascending: true });

  // Get total user count
  const { count: totalUsers } = await supabase
    .from('users')
    .select('*', { count: 'exact', head: true });

  // Separate upcoming and past events
  const upcomingEvents = events?.filter((event) =>
    isFuture(new Date(event.proposed_start))
  );
  const pastEvents = events?.filter((event) =>
    isPast(new Date(event.proposed_start))
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">Schedule</h1>
        <p className="text-foreground/60 mt-2">
          Coordinate group meetings and track availability
        </p>
      </div>

      {/* Create New Event */}
      <div className="border border-neutral-500 dark:border-neutral-600 p-4 bg-neutral-700/10 dark:bg-neutral-800/20">
        <h2 className="text-lg font-semibold mb-3 text-neutral-800 dark:text-neutral-300">Propose New Event</h2>
        <EventForm />
      </div>

      {/* Upcoming Events */}
      <div>
        <h2 className="text-xl font-semibold mb-0 px-4 py-3 bg-stone-200 dark:bg-stone-800/40 border border-stone-500 dark:border-stone-600 text-stone-900 dark:text-stone-200">Upcoming Events</h2>
        {upcomingEvents && upcomingEvents.length > 0 ? (
          <div className="space-y-0 border border-stone-500 dark:border-stone-600 border-t-0">
            {upcomingEvents.map((event, index) => (
              <div key={event.id} className={index > 0 ? 'border-t border-stone-500 dark:border-stone-600' : ''}>
                <EventCard event={event} totalUsers={totalUsers || 4} currentUserId={user.id} />
              </div>
            ))}
          </div>
        ) : (
          <div className="border border-stone-500 dark:border-stone-600 border-t-0 p-8 text-center bg-stone-700/5 dark:bg-stone-800/20">
            <p className="text-stone-700 dark:text-stone-400">
              No upcoming events. Propose one above!
            </p>
          </div>
        )}
      </div>

      {/* Past Events */}
      {pastEvents && pastEvents.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-0 px-4 py-3 bg-neutral-300 dark:bg-neutral-800 border border-neutral-500 dark:border-neutral-600 text-neutral-900 dark:text-neutral-300">Past Events</h2>
          <div className="space-y-0 border border-neutral-500 dark:border-neutral-600 border-t-0 opacity-75">
            {pastEvents.map((event, index) => (
              <div key={event.id} className={index > 0 ? 'border-t border-neutral-500 dark:border-neutral-600' : ''}>
                <EventCard event={event} totalUsers={totalUsers || 4} currentUserId={user.id} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
