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

  // Check that all opted-in participants have completed setup
  const { data: participants, error: participantsError } = await supabase
    .from('game_participants')
    .select('*')
    .eq('game_id', gameId)
    .eq('opted_in', true);

  if (participantsError) {
    return NextResponse.json({ error: participantsError.message }, { status: 500 });
  }

  const allComplete = participants.every((p) => p.setup_complete);

  if (!allComplete) {
    return NextResponse.json(
      { error: 'All opted-in participants must complete setup before activating the game' },
      { status: 400 }
    );
  }

  // Activate the game
  const { data: game, error: gameError } = await supabase
    .from('games')
    .update({ status: 'active' })
    .eq('id', gameId)
    .select()
    .single();

  if (gameError) {
    return NextResponse.json({ error: gameError.message }, { status: 500 });
  }

  return NextResponse.json({ game, message: 'Game activated successfully' });
}
