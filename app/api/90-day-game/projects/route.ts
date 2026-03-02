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

  const { id, description, weight_percentage, completion_percentage, notes } = await request.json();

  const { data, error } = await supabase
    .from('game_projects')
    .update({
      description,
      weight_percentage,
      completion_percentage,
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

  await logGameActivity(supabase, user.id, 'game_project_updated', data.game_id, {
    section: 'Projects',
    description: description?.slice(0, 60),
    completion_percentage,
  });

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

  const { gameId, description, weight_percentage, completion_percentage, notes, sort_order } = await request.json();

  const { data, error } = await supabase
    .from('game_projects')
    .insert({
      game_id: gameId,
      user_id: user.id,
      description,
      weight_percentage,
      completion_percentage,
      notes,
      sort_order,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  await logGameActivity(supabase, user.id, 'game_project_added', gameId, {
    section: 'Projects',
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
    .from('game_projects')
    .select('game_id, description')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  const { error } = await supabase.from('game_projects').delete().eq('id', id).eq('user_id', user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (record) {
    await logGameActivity(supabase, user.id, 'game_project_deleted', record.game_id, {
      section: 'Projects',
      description: record.description?.slice(0, 60),
    });
  }

  return NextResponse.json({ success: true });
}
