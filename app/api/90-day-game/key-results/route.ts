import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { logGameActivity } from '@/lib/game-activity-log';

// Update existing key result
export async function PUT(request: Request) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id, description, weight_percentage, completion_percentage, notes, logContent, logNotes } = await request.json();

  const { data: existing } = await supabase
    .from('game_key_results')
    .select('completion_percentage')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  const { data, error } = await supabase
    .from('game_key_results')
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

  if (existing?.completion_percentage !== completion_percentage) {
    await logGameActivity(supabase, user.id, 'game_key_result_updated', data.game_id, {
      section: 'Key Results',
      description: description?.slice(0, 60),
      completion_percentage,
    });
  }

  if (logContent) {
    await logGameActivity(supabase, user.id, 'game_key_result_text_updated', data.game_id, {
      section: 'Key Results',
      description: description?.slice(0, 60),
    });
  }

  if (logNotes) {
    await logGameActivity(supabase, user.id, 'game_key_result_notes_updated', data.game_id, {
      section: 'Key Results',
      description: description?.slice(0, 60),
    });
  }

  return NextResponse.json(data);
}

// Create new key result
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
    .from('game_key_results')
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

  await logGameActivity(supabase, user.id, 'game_key_result_added', gameId, {
    section: 'Key Results',
    description: description?.slice(0, 60),
  });

  return NextResponse.json(data);
}

// Delete key result
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

  // Fetch before delete so we can log game_id and description
  const { data: record } = await supabase
    .from('game_key_results')
    .select('game_id, description')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  const { error } = await supabase
    .from('game_key_results')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (record) {
    await logGameActivity(supabase, user.id, 'game_key_result_deleted', record.game_id, {
      section: 'Key Results',
      description: record.description?.slice(0, 60),
    });
  }

  return NextResponse.json({ success: true });
}
