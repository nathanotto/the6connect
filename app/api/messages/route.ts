/**
 * Messages API Routes
 *
 * GET /api/messages - Get messages for current user
 * POST /api/messages - Send a new message
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
    const otherUserId = searchParams.get('otherUserId');

    if (otherUserId) {
      // Fetch messages between current user and specified user
      const { data, error } = await supabase
        .from('direct_messages')
        .select(`
          *,
          sender:users!direct_messages_sender_id_fkey(id, full_name, display_name),
          recipient:users!direct_messages_recipient_id_fkey(id, full_name, display_name)
        `)
        .or(`and(sender_id.eq.${user.id},recipient_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},recipient_id.eq.${user.id})`)
        .order('created_at', { ascending: true });

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ data });
    } else {
      // Fetch all conversations (unique users the current user has messaged with)
      const { data, error } = await supabase
        .from('direct_messages')
        .select(`
          *,
          sender:users!direct_messages_sender_id_fkey(id, full_name, display_name),
          recipient:users!direct_messages_recipient_id_fkey(id, full_name, display_name)
        `)
        .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ data });
    }
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
    const { recipient_id, content } = body;

    // Validate required fields
    if (!recipient_id || !content) {
      return NextResponse.json(
        { error: 'recipient_id and content are required' },
        { status: 400 }
      );
    }

    // Send message
    const { data, error } = await supabase
      .from('direct_messages')
      .insert({
        sender_id: user.id,
        recipient_id,
        content,
        read: false,
      })
      .select(`
        *,
        sender:users!direct_messages_sender_id_fkey(id, full_name, display_name),
        recipient:users!direct_messages_recipient_id_fkey(id, full_name, display_name)
      `)
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Log activity
    await supabase.from('activity_log').insert({
      user_id: user.id,
      activity_type: 'message_sent',
      entity_type: 'direct_messages',
      entity_id: data.id,
      metadata: {
        recipient_id,
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
