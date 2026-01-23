/**
 * Schedule Events API Route
 *
 * GET /api/schedule - Get all events
 * POST /api/schedule - Create new event
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch all events with creator info and response counts
    const { data: events, error } = await supabase
      .from('schedule_events')
      .select(`
        *,
        created_by:users!schedule_events_created_by_user_id_fkey(id, full_name, display_name),
        responses:schedule_responses(id, response)
      `)
      .order('proposed_start', { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ events });
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
    const { title, description, proposed_start, proposed_end } = body;

    if (!title || !proposed_start) {
      return NextResponse.json(
        { error: 'Title and proposed start time are required' },
        { status: 400 }
      );
    }

    // Create event
    const { data: event, error } = await supabase
      .from('schedule_events')
      .insert({
        created_by_user_id: user.id,
        title,
        description,
        proposed_start,
        proposed_end,
        is_confirmed: false,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Log activity
    await supabase.from('activity_log').insert({
      user_id: user.id,
      activity_type: 'create',
      entity_type: 'schedule_event',
      entity_id: event.id,
      metadata: { title },
    });

    return NextResponse.json({ event }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
