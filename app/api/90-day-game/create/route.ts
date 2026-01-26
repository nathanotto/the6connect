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

  const { start_date, end_date } = await request.json();

  // Validate dates
  if (!start_date || !end_date) {
    return NextResponse.json({ error: 'Start and end dates are required' }, { status: 400 });
  }

  // Create game
  const { data: game, error: gameError } = await supabase
    .from('games')
    .insert({
      start_date,
      end_date,
      status: 'setup',
      created_by_user_id: user.id,
    })
    .select()
    .single();

  if (gameError) {
    return NextResponse.json({ error: gameError.message }, { status: 500 });
  }

  // Get all users to create participant records
  const { data: users, error: usersError } = await supabase.from('users').select('id');

  if (usersError) {
    return NextResponse.json({ error: usersError.message }, { status: 500 });
  }

  // Create participant records for all users (default opted_in = false)
  const participants = users.map((u) => ({
    game_id: game.id,
    user_id: u.id,
    opted_in: false,
    setup_complete: false,
  }));

  const { error: participantsError } = await supabase.from('game_participants').insert(participants);

  if (participantsError) {
    return NextResponse.json({ error: participantsError.message }, { status: 500 });
  }

  return NextResponse.json({ game, message: 'Game created successfully' });
}
