import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { gameId } = await request.json();
  if (!gameId) {
    return NextResponse.json({ error: 'Missing gameId' }, { status: 400 });
  }

  // Mark this participant's game branch as complete
  const { error: updateError } = await supabase
    .from('game_participants')
    .update({ game_complete: true })
    .eq('game_id', gameId)
    .eq('user_id', user.id);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  // Check if all opted-in participants are now complete
  const { data: participants } = await supabase
    .from('game_participants')
    .select('game_complete')
    .eq('game_id', gameId)
    .eq('opted_in', true);

  const allComplete = (participants || []).every((p) => p.game_complete === true);

  if (allComplete) {
    await supabase.from('games').update({ status: 'completed' }).eq('id', gameId);
  }

  return NextResponse.json({ allComplete });
}
