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

  const { gameId, content, completion_percentage } = await request.json();

  const { data: existing } = await supabase
    .from('game_objectives')
    .select('completion_percentage')
    .eq('game_id', gameId)
    .eq('user_id', user.id)
    .single();

  const { data, error } = await supabase
    .from('game_objectives')
    .upsert(
      {
        game_id: gameId,
        user_id: user.id,
        content,
        completion_percentage,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: 'game_id,user_id',
      }
    )
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (existing?.completion_percentage !== completion_percentage) {
    await logGameActivity(supabase, user.id, 'game_objective_updated', gameId, {
      section: 'Objective',
      completion_percentage,
    });
  }

  return NextResponse.json(data);
}
