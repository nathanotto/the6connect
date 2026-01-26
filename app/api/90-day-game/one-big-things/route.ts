import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function PUT(request: Request) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { gameId, week_number, description, completion_percentage, notes } = await request.json();

  // Upsert based on game_id, user_id, week_number
  const { data, error } = await supabase
    .from('game_one_big_things')
    .upsert(
      {
        game_id: gameId,
        user_id: user.id,
        week_number,
        description,
        completion_percentage,
        notes,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: 'game_id,user_id,week_number',
      }
    )
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
