/**
 * Send Calendar Invite API
 *
 * POST /api/schedule/[id]/send-invite - Send calendar invitation to all members
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { Resend } from 'resend';
import { generateICS } from '@/lib/calendar/generate-ics';
import { format } from 'date-fns';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { userId } = body; // Optional: if provided, send to single user

    // Fetch event details
    const { data: event, error: eventError } = await supabase
      .from('schedule_events')
      .select(
        `
        *,
        created_by:users!schedule_events_created_by_user_id_fkey(id, full_name, display_name, email)
      `
      )
      .eq('id', id)
      .single();

    if (eventError || !event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    // Verify current user is the event creator
    if (event.created_by.id !== user.id) {
      return NextResponse.json(
        { error: 'Only the event creator can send calendar invites' },
        { status: 403 }
      );
    }

    // Fetch all users
    const { data: allUsers, error: usersError } = await supabase
      .from('users')
      .select('id, full_name, display_name, email')
      .order('full_name', { ascending: true });

    if (usersError || !allUsers) {
      return NextResponse.json(
        { error: 'Failed to fetch users' },
        { status: 500 }
      );
    }

    // Filter users based on userId parameter
    const recipientsToSend = userId
      ? allUsers.filter((u) => u.id === userId)
      : allUsers;

    // Generate ICS calendar file
    const icsContent = generateICS({
      title: event.title,
      description: event.description || undefined,
      startTime: new Date(event.proposed_start),
      durationMinutes: 60, // 1 hour default
      location: 'To be determined',
      organizerEmail: event.created_by.email,
      organizerName: event.created_by.display_name || event.created_by.full_name,
    });

    // Convert ICS content to base64 for attachment
    const icsBase64 = Buffer.from(icsContent).toString('base64');

    // Send email to each recipient
    const emailPromises = recipientsToSend.map(async (recipient) => {
      const emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Calendar Invitation</h2>
          <p>You've been invited to:</p>

          <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">${event.title}</h3>
            <p style="margin: 10px 0;"><strong>Date:</strong> ${format(new Date(event.proposed_start), 'EEEE, MMMM d, yyyy')}</p>
            <p style="margin: 10px 0;"><strong>Time:</strong> ${format(new Date(event.proposed_start), 'h:mm a')}</p>
            <p style="margin: 10px 0;"><strong>Duration:</strong> 1 hour</p>
            ${event.description ? `<p style="margin: 10px 0;"><strong>Description:</strong> ${event.description}</p>` : ''}
          </div>

          <p>Organized by: ${event.created_by.display_name || event.created_by.full_name}</p>

          <p style="margin-top: 30px;">
            <a href="https://the6connect.vercel.app/dashboard/schedule/event/${event.id}"
               style="background: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              View Event & Respond
            </a>
          </p>

          <p style="color: #666; font-size: 12px; margin-top: 30px;">
            This calendar invitation was sent from The6Connect
          </p>
        </div>
      `;

      return resend.emails.send({
        from: 'The6Connect <noreply@the6connect.com>',
        to: recipient.email,
        subject: `Calendar Invite: ${event.title}`,
        html: emailHtml,
        attachments: [
          {
            filename: 'event.ics',
            content: icsBase64,
            content_type: 'text/calendar',
          },
        ],
      });
    });

    // Wait for all emails to send
    const results = await Promise.allSettled(emailPromises);

    // Check if any failed
    const failures = results.filter((r) => r.status === 'rejected');
    if (failures.length > 0) {
      console.error('Some emails failed to send:', failures);
      return NextResponse.json(
        { error: `Failed to send ${failures.length} emails` },
        { status: 500 }
      );
    }

    // Update invited_user_ids in the event
    const currentInvitedIds = (event.invited_user_ids as string[]) || [];
    const newInvitedIds = recipientsToSend.map((u) => u.id);
    const updatedInvitedIds = [
      ...new Set([...currentInvitedIds, ...newInvitedIds]),
    ];

    // @ts-ignore
    await supabase
      .from('schedule_events')
      .update({ invited_user_ids: updatedInvitedIds })
      .eq('id', id);

    return NextResponse.json({
      success: true,
      sent: results.length,
      sentTo: recipientsToSend.map((u) => u.display_name || u.full_name),
    });
  } catch (error) {
    console.error('Calendar invite error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
