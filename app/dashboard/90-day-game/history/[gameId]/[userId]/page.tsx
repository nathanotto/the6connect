/**
 * Historical 90-Day Game Detail View
 *
 * View a specific participant's game from history
 */

import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { EditableGameDetail } from '../../../[userId]/edit-page';

type PageProps = {
  params: Promise<{ gameId: string; userId: string }>;
};

export default async function HistoricalGameDetailPage({ params }: PageProps) {
  const { gameId, userId } = await params;
  const supabase = await createClient();

  const {
    data: { user: currentUser },
  } = await supabase.auth.getUser();

  if (!currentUser) {
    return null;
  }

  // Fetch the historical game
  const { data: game } = await supabase.from('games').select('*').eq('id', gameId).single();

  if (!game) {
    notFound();
  }

  // Fetch participant info
  const { data: participant } = await supabase
    .from('game_participants')
    .select(`
      *,
      user:users(id, full_name, display_name)
    `)
    .eq('game_id', gameId)
    .eq('user_id', userId)
    .single();

  if (!participant) {
    notFound();
  }

  // Fetch all game data
  const [vision, why, objective, keyResults, projects, innerGameLimiting, innerGameEmpowering, obts] =
    await Promise.all([
      supabase.from('game_vision_statements').select('*').eq('game_id', gameId).eq('user_id', userId).single(),
      supabase.from('game_why_statements').select('*').eq('game_id', gameId).eq('user_id', userId).single(),
      supabase.from('game_objectives').select('*').eq('game_id', gameId).eq('user_id', userId).single(),
      supabase
        .from('game_key_results')
        .select('*')
        .eq('game_id', gameId)
        .eq('user_id', userId)
        .order('sort_order'),
      supabase.from('game_projects').select('*').eq('game_id', gameId).eq('user_id', userId).order('sort_order'),
      supabase
        .from('game_inner_game_items')
        .select('*')
        .eq('game_id', gameId)
        .eq('user_id', userId)
        .eq('item_type', 'limiting')
        .order('sort_order'),
      supabase
        .from('game_inner_game_items')
        .select('*')
        .eq('game_id', gameId)
        .eq('user_id', userId)
        .eq('item_type', 'empowering')
        .order('sort_order'),
      supabase
        .from('game_one_big_things')
        .select('*')
        .eq('game_id', gameId)
        .eq('user_id', userId)
        .order('week_number'),
    ]);

  return (
    <EditableGameDetail
      gameId={gameId}
      userId={userId}
      currentUserId={currentUser.id}
      participant={participant}
      gameData={{
        vision: vision.data,
        why: why.data,
        objective: objective.data,
        keyResults: keyResults.data || [],
        projects: projects.data || [],
        innerGameLimiting: innerGameLimiting.data || [],
        innerGameEmpowering: innerGameEmpowering.data || [],
        obts: obts.data || [],
      }}
      gameTitle={game.title || ''}
      gameDescription={game.description || ''}
      gameStatus={game.status}
      startDate={game.start_date}
      endDate={game.end_date}
    />
  );
}
