/**
 * Generate ICS Calendar File
 *
 * Creates a .ics calendar file for email invitations
 */

interface CalendarEvent {
  title: string;
  description?: string;
  startTime: Date;
  durationMinutes: number;
  location?: string;
  organizerEmail: string;
  organizerName: string;
}

export function generateICS(event: CalendarEvent): string {
  const startDate = new Date(event.startTime);
  const endDate = new Date(startDate.getTime() + event.durationMinutes * 60000);

  // Format dates to ICS format (YYYYMMDDTHHMMSSZ)
  const formatDate = (date: Date): string => {
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2, '0');
    const hours = String(date.getUTCHours()).padStart(2, '0');
    const minutes = String(date.getUTCMinutes()).padStart(2, '0');
    const seconds = String(date.getUTCSeconds()).padStart(2, '0');
    return `${year}${month}${day}T${hours}${minutes}${seconds}Z`;
  };

  const dtStart = formatDate(startDate);
  const dtEnd = formatDate(endDate);
  const dtStamp = formatDate(new Date());
  const uid = `${Date.now()}@the6connect.com`;

  // Build ICS content
  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//The6Connect//Calendar Event//EN',
    'METHOD:REQUEST',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${dtStamp}`,
    `DTSTART:${dtStart}`,
    `DTEND:${dtEnd}`,
    `SUMMARY:${event.title}`,
    event.description ? `DESCRIPTION:${event.description.replace(/\n/g, '\\n')}` : '',
    event.location ? `LOCATION:${event.location}` : '',
    `ORGANIZER;CN=${event.organizerName}:mailto:${event.organizerEmail}`,
    'STATUS:CONFIRMED',
    'SEQUENCE:0',
    'END:VEVENT',
    'END:VCALENDAR',
  ]
    .filter((line) => line !== '') // Remove empty lines
    .join('\r\n');

  return icsContent;
}
