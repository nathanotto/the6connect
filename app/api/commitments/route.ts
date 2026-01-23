/**
 * Commitments API Routes
 *
 * GET /api/commitments - Get user's commitments
 * POST /api/commitments - Create new commitment
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

    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId') || user.id;
    const status = searchParams.get('status'); // 'pending', 'completed', 'missed'

    let query = supabase
      .from('commitments')
      .select('*')
      .eq('user_id', userId)
      .order('deadline', { ascending: true });

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;

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
    const { task, outcome, deadline } = body;

    // Validate required fields
    if (!task || !outcome || !deadline) {
      return NextResponse.json(
        { error: 'task, outcome, and deadline are required' },
        { status: 400 }
      );
    }

    // Create new commitment
    const { data, error } = await supabase
      .from('commitments')
      .insert({
        user_id: user.id,
        task,
        outcome,
        deadline,
        status: 'pending',
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Log activity
    await supabase.from('activity_log').insert({
      user_id: user.id,
      activity_type: 'commitment_created',
      entity_type: 'commitments',
      entity_id: data.id,
      metadata: {
        task,
        deadline,
      },
    });

    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
