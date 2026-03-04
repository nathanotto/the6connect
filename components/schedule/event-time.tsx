'use client';

import { format } from 'date-fns';

export function EventDate({ iso }: { iso: string }) {
  return <>{format(new Date(iso), 'EEEE, MMMM d, yyyy')}</>;
}

export function EventTime({ iso }: { iso: string }) {
  return <>{format(new Date(iso), 'h:mm a')}</>;
}
