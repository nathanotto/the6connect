/**
 * Individual Check-in API Routes
 *
 * PATCH /api/life-status/[id] - Update a check-in
 * DELETE /api/life-status/[id] - Delete a check-in
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

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

    // Verify the check-in belongs to the user and is less than 24 hours old
    const { data: checkin } = await supabase
      .from('life_status_updates')
      .select('user_id, created_at')
      .eq('id', id)
      .single();

    if (!checkin) {
      return NextResponse.json({ error: 'Check-in not found' }, { status: 404 });
    }

    if (checkin.user_id !== user.id) {
      return NextResponse.json({ error: 'Not authorized to edit this check-in' }, { status: 403 });
    }

    // Check if check-in is less than 24 hours old
    const createdAt = new Date(checkin.created_at);
    const now = new Date();
    const hoursDiff = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);

    if (hoursDiff >= 24) {
      return NextResponse.json({ error: 'Check-in is more than 24 hours old and cannot be edited' }, { status: 403 });
    }

    const body = await request.json();
    const { zone_other, statuses, status_other, support_type, support_type_other, notes } = body;

    // Validate required fields
    if (!statuses || !Array.isArray(statuses) || statuses.length === 0) {
      return NextResponse.json(
        { error: 'At least one feeling is required' },
        { status: 400 }
      );
    }

    if (!support_type) {
      return NextResponse.json(
        { error: 'support_type is required' },
        { status: 400 }
      );
    }

    // Update the check-in
    const { data, error } = await supabase
      .from('life_status_updates')
      .update({
        zone_other: zone_other || null,
        status: statuses.join(', '),
        status_other: statuses.includes('Other') ? status_other : null,
        notes,
        support_type,
        support_type_other: support_type === 'Other' ? support_type_other : null,
      })
      .eq('id', id)
      .select('*')
      .single();

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

    // Verify the check-in belongs to the user
    const { data: checkin } = await supabase
      .from('life_status_updates')
      .select('user_id')
      .eq('id', id)
      .single();

    if (!checkin) {
      return NextResponse.json({ error: 'Check-in not found' }, { status: 404 });
    }

    if (checkin.user_id !== user.id) {
      return NextResponse.json({ error: 'Not authorized to delete this check-in' }, { status: 403 });
    }

    // Delete the check-in (comments will be cascade deleted)
    const { error } = await supabase
      .from('life_status_updates')
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
