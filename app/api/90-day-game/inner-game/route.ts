import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { logGameActivity } from '@/lib/game-activity-log';

export async function PUT(request: Request) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id, description, rating, notes } = await request.json();

  const { data, error } = await supabase
    .from('game_inner_game_items')
    .update({
      description,
      rating,
      notes,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Inner game items have no completion_percentage — updates not logged per policy

  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { gameId, item_type, category, description, rating, notes, sort_order } = await request.json();

  const { data, error } = await supabase
    .from('game_inner_game_items')
    .insert({
      game_id: gameId,
      user_id: user.id,
      item_type,
      category,
      description,
      rating,
      notes,
      sort_order,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  await logGameActivity(supabase, user.id, 'game_inner_game_added', gameId, {
    section: 'Inner Game',
    item_type,
    category,
    description: description?.slice(0, 60),
  });

  return NextResponse.json(data);
}

export async function DELETE(request: Request) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'Missing ID' }, { status: 400 });
  }

  const { data: record } = await supabase
    .from('game_inner_game_items')
    .select('game_id, description, item_type, category')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  const { error } = await supabase.from('game_inner_game_items').delete().eq('id', id).eq('user_id', user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (record) {
    await logGameActivity(supabase, user.id, 'game_inner_game_deleted', record.game_id, {
      section: 'Inner Game',
      item_type: record.item_type,
      category: record.category,
      description: record.description?.slice(0, 60),
    });
  }

  return NextResponse.json({ success: true });
}
