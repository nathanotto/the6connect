/**
 * Checkin Reads API
 *
 * Track which users have read each check-in
 */

import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

// GET - Fetch users who have read a check-in
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const checkinId = request.nextUrl.searchParams.get('checkinId');

    if (!checkinId) {
      return NextResponse.json({ error: 'Checkin ID required' }, { status: 400 });
    }

    // Fetch all user IDs who have read this check-in
    const { data: reads, error } = await supabase
      .from('checkin_reads')
      .select('user_id')
      .eq('checkin_id', checkinId);

    if (error) {
      console.error('Error fetching read status:', error);
      // If table doesn't exist yet, return empty array
      return NextResponse.json({ data: [] });
    }

    const userIds = reads?.map((r: any) => r.user_id) || [];
    return NextResponse.json({ data: userIds });
  } catch (error: any) {
    console.error('Error in GET /api/checkin-reads:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST - Mark a check-in as read by current user
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { checkin_id } = await request.json();

    if (!checkin_id) {
      return NextResponse.json({ error: 'Checkin ID required' }, { status: 400 });
    }

    // Insert or update read status
    const { data, error } = await supabase
      .from('checkin_reads')
      .upsert(
        {
          checkin_id,
          user_id: user.id,
          read_at: new Date().toISOString(),
        },
        {
          onConflict: 'checkin_id,user_id',
        }
      )
      .select()
      .single();

    if (error) {
      console.error('Error marking as read:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data }, { status: 200 });
  } catch (error: any) {
    console.error('Error in POST /api/checkin-reads:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
