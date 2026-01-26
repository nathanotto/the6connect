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

  const { gameId, content, completion_percentage } = await request.json();

  const { data, error } = await supabase
    .from('game_why_statements')
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

  return NextResponse.json(data);
}
