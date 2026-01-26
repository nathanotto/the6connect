/**
 * 90-Day Game Individual Detail View
 *
 * Shows complete game data for a single participant with inline editing
 */

import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { EditableGameDetail } from './edit-page';

type PageProps = {
  params: Promise<{ userId: string }>;
};

export default async function GameDetailPage({ params }: PageProps) {
  const { userId } = await params;
  const supabase = await createClient();

  const {
    data: { user: currentUser },
  } = await supabase.auth.getUser();

  if (!currentUser) {
    return null;
  }

  // Fetch most recent game (active or completed)
  const { data: activeGame } = await supabase
    .from('games')
    .select('*')
    .in('status', ['active', 'completed'])
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (!activeGame) {
    notFound();
  }

  // Fetch participant info
  const { data: participant } = await supabase
    .from('game_participants')
    .select(`
      *,
      user:users(id, full_name, display_name)
    `)
    .eq('game_id', activeGame.id)
    .eq('user_id', userId)
    .single();

  if (!participant) {
    notFound();
  }

  // Fetch all game data
  const [vision, why, objective, keyResults, projects, innerGameLimiting, innerGameEmpowering, obts] =
    await Promise.all([
      supabase
        .from('game_vision_statements')
        .select('*')
        .eq('game_id', activeGame.id)
        .eq('user_id', userId)
        .single(),
      supabase.from('game_why_statements').select('*').eq('game_id', activeGame.id).eq('user_id', userId).single(),
      supabase.from('game_objectives').select('*').eq('game_id', activeGame.id).eq('user_id', userId).single(),
      supabase
        .from('game_key_results')
        .select('*')
        .eq('game_id', activeGame.id)
        .eq('user_id', userId)
        .order('sort_order'),
      supabase
        .from('game_projects')
        .select('*')
        .eq('game_id', activeGame.id)
        .eq('user_id', userId)
        .order('sort_order'),
      supabase
        .from('game_inner_game_items')
        .select('*')
        .eq('game_id', activeGame.id)
        .eq('user_id', userId)
        .eq('item_type', 'limiting')
        .order('sort_order'),
      supabase
        .from('game_inner_game_items')
        .select('*')
        .eq('game_id', activeGame.id)
        .eq('user_id', userId)
        .eq('item_type', 'empowering')
        .order('sort_order'),
      supabase
        .from('game_one_big_things')
        .select('*')
        .eq('game_id', activeGame.id)
        .eq('user_id', userId)
        .order('week_number'),
    ]);

  return (
    <EditableGameDetail
      gameId={activeGame.id}
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
      gameStatus={activeGame.status}
      startDate={activeGame.start_date}
      endDate={activeGame.end_date}
    />
  );
}
