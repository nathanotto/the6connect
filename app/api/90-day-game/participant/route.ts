import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

// Update participant info (opt-in, game name, image, setup_complete)
export async function PUT(request: Request) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { gameId, opted_in, game_name, game_image_url, setup_complete } = await request.json();

  const updateData: any = {};
  if (typeof opted_in === 'boolean') updateData.opted_in = opted_in;
  if (game_name !== undefined) updateData.game_name = game_name;
  if (game_image_url !== undefined) updateData.game_image_url = game_image_url;
  if (typeof setup_complete === 'boolean') updateData.setup_complete = setup_complete;

  const { data, error } = await supabase
    .from('game_participants')
    .update(updateData)
    .eq('game_id', gameId)
    .eq('user_id', user.id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
