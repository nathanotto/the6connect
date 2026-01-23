/**
 * Schedule Event API Route
 *
 * GET /api/schedule/[id] - Get specific event
 * PATCH /api/schedule/[id] - Update event
 * DELETE /api/schedule/[id] - Delete event
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch event with creator info and all responses
    const { data: event, error } = await supabase
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

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ event });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { title, description, proposed_start, proposed_end, is_confirmed } = body;

    // Check if user created this event
    const { data: event } = await supabase
      .from('schedule_events')
      .select('created_by_user_id')
      .eq('id', id)
      .single();

    if (!event || event.created_by_user_id !== user.id) {
      return NextResponse.json(
        { error: 'You can only update your own events' },
        { status: 403 }
      );
    }

    // Update event
    const { data: updatedEvent, error } = await supabase
      .from('schedule_events')
      .update({
        title,
        description,
        proposed_start,
        proposed_end,
        is_confirmed,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ event: updatedEvent });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user created this event
    const { data: event } = await supabase
      .from('schedule_events')
      .select('created_by_user_id')
      .eq('id', id)
      .single();

    if (!event || event.created_by_user_id !== user.id) {
      return NextResponse.json(
        { error: 'You can only delete your own events' },
        { status: 403 }
      );
    }

    // Delete event (responses will cascade delete)
    const { error } = await supabase
      .from('schedule_events')
      .delete()
      .eq('id', id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
