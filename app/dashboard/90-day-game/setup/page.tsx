/**
 * 90-Day Game Setup Page
 *
 * Full game setup using the same interface as the game detail view.
 * Auto-copies inner game items from the user's most recent completed game.
 */

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { EditableGameDetail } from '../[userId]/edit-page';

export default async function SetupPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Fetch current setup game
  const { data: setupGame } = await supabase
    .from('games')
    .select('*')
    .eq('status', 'setup')
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (!setupGame) {
    redirect('/dashboard/90-day-game');
  }

  // Fetch participant (must have opted in)
  const { data: participant } = await supabase
    .from('game_participants')
    .select(`*, user:users(id, full_name, display_name)`)
    .eq('game_id', setupGame.id)
    .eq('user_id', user.id)
    .single();

  if (!participant) {
    redirect('/dashboard/90-day-game');
  }

  // Fetch all game data
  const [vision, why, objective, keyResults, projects, innerGameLimiting, innerGameEmpowering, obts] =
    await Promise.all([
      supabase.from('game_vision_statements').select('*').eq('game_id', setupGame.id).eq('user_id', user.id).single(),
      supabase.from('game_why_statements').select('*').eq('game_id', setupGame.id).eq('user_id', user.id).single(),
      supabase.from('game_objectives').select('*').eq('game_id', setupGame.id).eq('user_id', user.id).single(),
      supabase
        .from('game_key_results')
        .select('*')
        .eq('game_id', setupGame.id)
        .eq('user_id', user.id)
        .order('sort_order'),
      supabase
        .from('game_projects')
        .select('*')
        .eq('game_id', setupGame.id)
        .eq('user_id', user.id)
        .order('sort_order'),
      supabase
        .from('game_inner_game_items')
        .select('*')
        .eq('game_id', setupGame.id)
        .eq('user_id', user.id)
        .eq('item_type', 'limiting')
        .order('sort_order'),
      supabase
        .from('game_inner_game_items')
        .select('*')
        .eq('game_id', setupGame.id)
        .eq('user_id', user.id)
        .eq('item_type', 'empowering')
        .order('sort_order'),
      supabase
        .from('game_one_big_things')
        .select('*')
        .eq('game_id', setupGame.id)
        .eq('user_id', user.id)
        .order('week_number'),
    ]);

  let limitingItems = innerGameLimiting.data || [];
  let empoweringItems = innerGameEmpowering.data || [];

  // Auto-copy inner game items from most recent completed game if none exist yet
  if (limitingItems.length === 0 && empoweringItems.length === 0) {
    const { data: completedGames } = await supabase
      .from('games')
      .select('id')
      .eq('status', 'completed')
      .order('start_date', { ascending: false });

    let lastCompletedGameId: string | null = null;
    for (const game of completedGames || []) {
      const { data: participation } = await supabase
        .from('game_participants')
        .select('id')
        .eq('game_id', game.id)
        .eq('user_id', user.id)
        .eq('opted_in', true)
        .single();
      if (participation) {
        lastCompletedGameId = game.id;
        break;
      }
    }

    if (lastCompletedGameId) {
      const { data: previousItems } = await supabase
        .from('game_inner_game_items')
        .select('*')
        .eq('game_id', lastCompletedGameId)
        .eq('user_id', user.id)
        .order('sort_order');

      if (previousItems && previousItems.length > 0) {
        const itemsToInsert = previousItems.map(
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          ({ id, created_at, updated_at, game_id, ...item }: any) => ({
            ...item,
            game_id: setupGame.id,
          })
        );

        await supabase.from('game_inner_game_items').insert(itemsToInsert);

        // Re-fetch after copy
        const [newLimiting, newEmpowering] = await Promise.all([
          supabase
            .from('game_inner_game_items')
            .select('*')
            .eq('game_id', setupGame.id)
            .eq('user_id', user.id)
            .eq('item_type', 'limiting')
            .order('sort_order'),
          supabase
            .from('game_inner_game_items')
            .select('*')
            .eq('game_id', setupGame.id)
            .eq('user_id', user.id)
            .eq('item_type', 'empowering')
            .order('sort_order'),
        ]);
        limitingItems = newLimiting.data || [];
        empoweringItems = newEmpowering.data || [];
      }
    }
  }

  return (
    <EditableGameDetail
      gameId={setupGame.id}
      userId={user.id}
      currentUserId={user.id}
      participant={participant}
      gameData={{
        vision: vision.data,
        why: why.data,
        objective: objective.data,
        keyResults: keyResults.data || [],
        projects: projects.data || [],
        innerGameLimiting: limitingItems,
        innerGameEmpowering: empoweringItems,
        obts: obts.data || [],
      }}
      gameTitle={setupGame.title || ''}
      gameDescription={setupGame.description || ''}
      gameStatus={setupGame.status}
      startDate={setupGame.start_date}
      endDate={setupGame.end_date}
    />
  );
}
