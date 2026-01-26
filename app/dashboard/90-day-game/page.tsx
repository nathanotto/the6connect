/**
 * 90-Day Game Aggregate View
 *
 * Shows all participants' progress, recent updates, and staleness alerts
 */

import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { CreateGameButton } from './create-game';
import { SetupView } from './setup-view';

// Score calculation functions
function calculateWeightedScore(items: Array<{ weight_percentage: number; completion_percentage: number }>) {
  if (!items || items.length === 0) return 0;
  const totalWeight = items.reduce((sum, item) => sum + (item.weight_percentage || 0), 0);
  if (totalWeight === 0) return 0;
  const weightedSum = items.reduce(
    (sum, item) => sum + (item.weight_percentage || 0) * (item.completion_percentage || 0),
    0
  );
  return weightedSum / totalWeight;
}

function calculateInnerGameScore(items: Array<{ rating: number }>) {
  if (!items || items.length === 0) return 0;
  const totalRating = items.reduce((sum, item) => sum + (item.rating || 0), 0);
  const maxPossible = items.length * 5;
  return (totalRating / maxPossible) * 100;
}

function calculateOBTScore(items: Array<{ completion_percentage: number }>) {
  if (!items || items.length === 0) return 0;
  const total = items.reduce((sum, item) => sum + (item.completion_percentage || 0), 0);
  return total / items.length;
}

export default async function NinetyDayGamePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  // Fetch most recent game (including setup)
  const { data: currentGame } = await supabase
    .from('games')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  // If no game at all, show create prompt
  if (!currentGame) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">90-Day Game</h1>
          <p className="text-foreground/60 mt-2">Track your 90-day accountability games with The Six</p>
        </div>

        <div className="border border-foreground/20 rounded-lg p-12 text-center">
          <h2 className="text-2xl font-bold mb-4">No Game Found</h2>
          <p className="text-foreground/60 mb-6">Create a new 90-day game to get started</p>
          <CreateGameButton />
        </div>
      </div>
    );
  }

  // If game is in setup mode, show setup view
  if (currentGame.status === 'setup') {
    const { data: participants } = await supabase
      .from('game_participants')
      .select(`
        *,
        user:users(id, full_name, display_name)
      `)
      .eq('game_id', currentGame.id)
      .order('user_id');

    return (
      <SetupView
        gameId={currentGame.id}
        startDate={currentGame.start_date}
        endDate={currentGame.end_date}
        currentUserId={user.id}
        participants={participants || []}
      />
    );
  }

  // Fetch participants with their data
  const { data: participants } = await supabase
    .from('game_participants')
    .select(`
      *,
      user:users(id, full_name, display_name)
    `)
    .eq('game_id', currentGame.id)
    .eq('opted_in', true);

  // Fetch all game data for score calculations
  const gameData = await Promise.all(
    (participants || []).map(async (participant) => {
      const userId = participant.user_id;

      const [vision, why, objective, keyResults, projects, innerGame, obts] = await Promise.all([
        supabase
          .from('game_vision_statements')
          .select('completion_percentage')
          .eq('game_id', currentGame.id)
          .eq('user_id', userId)
          .single(),
        supabase
          .from('game_why_statements')
          .select('completion_percentage')
          .eq('game_id', currentGame.id)
          .eq('user_id', userId)
          .single(),
        supabase
          .from('game_objectives')
          .select('completion_percentage')
          .eq('game_id', currentGame.id)
          .eq('user_id', userId)
          .single(),
        supabase
          .from('game_key_results')
          .select('weight_percentage, completion_percentage')
          .eq('game_id', currentGame.id)
          .eq('user_id', userId),
        supabase
          .from('game_projects')
          .select('weight_percentage, completion_percentage')
          .eq('game_id', currentGame.id)
          .eq('user_id', userId),
        supabase
          .from('game_inner_game_items')
          .select('rating')
          .eq('game_id', currentGame.id)
          .eq('user_id', userId),
        supabase
          .from('game_one_big_things')
          .select('completion_percentage')
          .eq('game_id', currentGame.id)
          .eq('user_id', userId),
      ]);

      // Calculate section scores
      const visionScore = vision.data?.completion_percentage || 0;
      const whyScore = why.data?.completion_percentage || 0;
      const objectiveScore = objective.data?.completion_percentage || 0;
      const keyResultsScore = calculateWeightedScore(keyResults.data || []);
      const projectsScore = calculateWeightedScore(projects.data || []);
      const innerGameScore = calculateInnerGameScore(innerGame.data || []);
      const obtsScore = calculateOBTScore(obts.data || []);

      // Overall score is average of all 7 sections
      const overallScore = Math.round(
        (visionScore + whyScore + objectiveScore + keyResultsScore + projectsScore + innerGameScore + obtsScore) / 7
      );

      return {
        ...participant,
        overallScore,
      };
    })
  );

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold">The Six 90-Day Game</h1>
          <p className="text-foreground/60 mt-2">
            {new Date(currentGame.start_date).toLocaleDateString()} - {new Date(currentGame.end_date).toLocaleDateString()} • {currentGame.status.toUpperCase()}
          </p>
        </div>
        <Link
          href="/dashboard/90-day-game/history"
          className="text-sm text-foreground/60 hover:text-foreground"
        >
          View History →
        </Link>
      </div>

      {/* Participant Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {gameData?.map((participant: any) => (
          <div
            key={participant.id}
            className="border border-foreground/20 rounded-lg p-6 text-center hover:border-foreground/40 transition-colors"
          >
            <h3 className="font-bold text-lg mb-2">
              {participant.user.display_name || participant.user.full_name}
            </h3>
            {participant.game_name && (
              <p className="text-sm text-foreground/60 mb-4">
                "{participant.game_name}"
              </p>
            )}
            {participant.game_image_url && (
              <img
                src={participant.game_image_url}
                alt={participant.game_name}
                className="w-full h-32 object-cover rounded mb-4"
              />
            )}
            <div className="text-3xl font-bold mb-4">{participant.overallScore}%</div>
            <Link
              href={`/dashboard/90-day-game/${participant.user_id}`}
              className="text-sm text-foreground/80 hover:text-foreground underline"
            >
              View Full Game →
            </Link>
          </div>
        ))}
      </div>

      <div className="border border-foreground/20 rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">Recent Updates</h2>
        <p className="text-sm text-foreground/60">
          Activity tracking coming soon...
        </p>
      </div>

      <div className="border border-foreground/20 rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">Staleness Alerts</h2>
        <p className="text-sm text-foreground/60">
          Staleness tracking coming soon...
        </p>
      </div>
    </div>
  );
}
