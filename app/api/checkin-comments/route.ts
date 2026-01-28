/**
 * Checkin Comments API Routes
 *
 * GET /api/checkin-comments?checkinId=xxx - Get comments for a checkin
 * POST /api/checkin-comments - Create new comment
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
    const checkinId = searchParams.get('checkinId');

    if (!checkinId) {
      return NextResponse.json({ error: 'checkinId is required' }, { status: 400 });
    }

    // Fetch comments with user details
    const { data, error } = await supabase
      .from('checkin_comments')
      .select(`
        *,
        user:users(id, full_name, display_name)
      `)
      .eq('checkin_id', checkinId)
      .order('created_at', { ascending: true });

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
    const { checkin_id, content } = body;

    // Validate required fields
    if (!checkin_id || !content?.trim()) {
      return NextResponse.json(
        { error: 'checkin_id and content are required' },
        { status: 400 }
      );
    }

    // Create new comment
    const { data, error } = await supabase
      .from('checkin_comments')
      .insert({
        checkin_id,
        user_id: user.id,
        content: content.trim(),
      })
      .select(`
        *,
        user:users(id, full_name, display_name)
      `)
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
