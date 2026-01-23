/**
 * Life Status API Routes
 *
 * GET /api/life-status - Get user's life status updates
 * POST /api/life-status - Create new life status update
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
    const limit = parseInt(searchParams.get('limit') || '50');

    // Fetch life status updates with life area details
    const { data, error } = await supabase
      .from('life_status_updates')
      .select(`
        *,
        life_area:life_areas(*)
      `)
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
    const { life_area_id, status, notes, mood_rating } = body;

    // Validate required fields
    if (!life_area_id || !status) {
      return NextResponse.json(
        { error: 'life_area_id and status are required' },
        { status: 400 }
      );
    }

    // Create new life status update
    const { data, error } = await supabase
      .from('life_status_updates')
      .insert({
        user_id: user.id,
        life_area_id,
        status,
        notes,
        mood_rating,
      })
      .select(`
        *,
        life_area:life_areas(*)
      `)
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Log activity
    await supabase.from('activity_log').insert({
      user_id: user.id,
      activity_type: 'life_status_update',
      entity_type: 'life_status_updates',
      entity_id: data.id,
      metadata: {
        life_area: life_area_id,
        status,
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
