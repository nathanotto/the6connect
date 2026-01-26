import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

// Update existing key result
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
    .from('game_key_results')
    .update({
      description,
      weight_percentage,
      completion_percentage,
      notes,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .eq('user_id', user.id) // Ensure user can only update their own
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
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

  const { error } = await supabase
    .from('game_key_results')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id); // Ensure user can only delete their own

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
