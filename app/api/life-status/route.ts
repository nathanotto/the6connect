/**
 * Life Status API Routes
 *
 * GET /api/life-status - Get user's life status updates
 * POST /api/life-status - Create new life status update
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { Resend } from 'resend';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId') || user.id;
    const limit = parseInt(searchParams.get('limit') || '50');

    // Fetch life status updates
    const { data, error } = await supabase
      .from('life_status_updates')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { zone_other, statuses, status_other, notes, support_type, support_type_other, sendEmail } = body;

    // Validate required fields
    if (!statuses || !Array.isArray(statuses) || statuses.length === 0) {
      return NextResponse.json(
        { error: 'At least one feeling is required' },
        { status: 400 }
      );
    }

    // Validate support_type is required
    if (!support_type) {
      return NextResponse.json(
        { error: 'support_type is required' },
        { status: 400 }
      );
    }

    // Create new check-in
    const { data, error } = await supabase
      .from('life_status_updates')
      .insert({
        user_id: user.id,
        zone_other: zone_other || null,
        status: statuses.join(', '), // Store as comma-separated string for now
        status_other: statuses.includes('Other') ? status_other : null,
        notes,
        support_type,
        support_type_other: support_type === 'Other' ? support_type_other : null,
      })
      .select('*')
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Log activity
    await supabase.from('activity_log').insert({
      user_id: user.id,
      activity_type: 'checkin',
      entity_type: 'life_status_updates',
      entity_id: data.id,
      metadata: {
        statuses,
      },
    });

    // Send email notification if requested
    if (sendEmail) {
      const { data: senderProfile } = await supabase
        .from('users')
        .select('email, full_name, display_name')
        .eq('id', user.id)
        .single();

      const { data: otherUsers } = await supabase
        .from('users')
        .select('email, full_name, display_name')
        .neq('id', user.id);

      const recipientEmails = (otherUsers || []).map((u: any) => u.email).filter(Boolean);

      if (recipientEmails.length > 0) {
        const resend = new Resend(process.env.RESEND_API_KEY);
        const senderName = senderProfile?.display_name || senderProfile?.full_name || 'A member';
        const topic = zone_other || 'General check-in';
        const feeling = statuses.join(', ') + (statuses.includes('Other') && status_other ? ` (${status_other})` : '');
        const needs = support_type === 'Other' ? support_type_other : support_type;
        const baseUrl = new URL(request.url).origin;

        await resend.emails.send({
          from: process.env.RESEND_FROM_EMAIL || 'The Six <checkins@the6connect.com>',
          to: recipientEmails,
          cc: senderProfile?.email ? [senderProfile.email] : undefined,
          subject: `[${senderName}] ${topic}`,
          html: `
            <p><a href="${baseUrl}/dashboard/checkins">View check-ins →</a></p>
            <hr />
            <p><strong>From:</strong> ${senderName}</p>
            <p><strong>Topic:</strong> ${topic}</p>
            <p><strong>Feeling:</strong> ${feeling}</p>
            <p><strong>Needs:</strong> ${needs}</p>
            ${notes ? `<p><strong>Details:</strong> ${notes}</p>` : ''}
          `,
        });
      }
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
