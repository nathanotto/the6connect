/**
 * Single Commitment API Routes
 *
 * PATCH /api/commitments/[id] - Update commitment (e.g., mark as completed)
 * DELETE /api/commitments/[id] - Delete commitment
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function PATCH(
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
    const { status } = body;

    // Validate status
    if (status && !['pending', 'completed', 'missed'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be: pending, completed, or missed' },
        { status: 400 }
      );
    }

    // Build update object
    const updateData: {
      status?: string;
      completed_at?: string;
    } = {};

    if (status) {
      updateData.status = status;
    }

    // Set completed_at timestamp when marking as completed
    if (status === 'completed') {
      updateData.completed_at = new Date().toISOString();
    }

    // Update commitment
    const { data, error } = await supabase
      .from('commitments')
      // @ts-ignore - Type mismatch due to placeholder database types
      .update(updateData)
      .eq('id', id)
      .eq('user_id', user.id) // Ensure user owns this commitment
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ error: 'Commitment not found' }, { status: 404 });
    }

    // Log activity if status changed
    if (status) {
      // @ts-ignore - Type mismatch due to placeholder database types
      await supabase.from('activity_log').insert({
        user_id: user.id,
        activity_type: `commitment_${status}`,
        entity_type: 'commitments',
        entity_id: data.id,
        metadata: {
          task: data.task,
          status,
        },
      });
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
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Delete commitment
    const { error } = await supabase
      .from('commitments')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id); // Ensure user owns this commitment

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
