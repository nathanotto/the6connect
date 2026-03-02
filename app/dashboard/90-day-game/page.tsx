/**
 * 90-Day Game Aggregate View
 *
 * Shows all participants' progress, recent updates, and staleness alerts
 */

import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { CreateGameButton } from './create-game';
import { CurrentGameGrid } from './current-game-grid';
import { ActivateGameButton } from './activate-game-button';
import { formatActivityMessage } from '@/lib/game-activity-log';

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

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor(diff / 3600000);
  const minutes = Math.floor(diff / 60000);
  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return 'just now';
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

  // If game is in setup mode, show setup view + past games below
  if (currentGame.status === 'setup') {
    const { data: participants } = await supabase
      .from('game_participants')
      .select(`
        *,
        user:users(id, full_name, display_name)
      `)
      .eq('game_id', currentGame.id)
      .order('user_id');

    // Fetch completed games for the past games section
    const { data: completedGames } = await supabase
      .from('games')
      .select('*')
      .eq('status', 'completed')
      .order('start_date', { ascending: false });

    const pastGames = await Promise.all(
      (completedGames || []).map(async (game) => {
        const { data: gameParticipants } = await supabase
          .from('game_participants')
          .select(`*, user:users(id, full_name, display_name)`)
          .eq('game_id', game.id)
          .eq('opted_in', true);
        return { ...game, participants: gameParticipants || [] };
      })
    );

    const optedInParticipants = (participants || []).filter((p: any) => p.opted_in);
    const canActivate = optedInParticipants.length > 0 && optedInParticipants.every((p: any) => p.setup_complete);
    const notReadyNames = optedInParticipants
      .filter((p: any) => !p.setup_complete)
      .map((p: any) => p.user.display_name || p.user.full_name);

    const startFormatted = new Date(currentGame.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const endFormatted = new Date(currentGame.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold">
            {currentGame.title || '90-Day Game'} -- {startFormatted} – {endFormatted}
          </h1>
          {currentGame.description && (
            <p className="text-foreground/80 mt-1">{currentGame.description}</p>
          )}
        </div>

        <CurrentGameGrid
          participants={participants || []}
          currentUserId={user.id}
          gameId={currentGame.id}
        />

        <ActivateGameButton
          gameId={currentGame.id}
          canActivate={canActivate}
          notReadyNames={notReadyNames}
        />

        {pastGames.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Past Games</h2>
            <div className="space-y-4">
              {pastGames.map((game) => (
                <div key={game.id} className="border border-foreground/20 rounded-lg p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-bold">{game.title || 'Untitled Game'}</h3>
                      {game.description && (
                        <p className="text-sm text-foreground/70 mt-0.5">{game.description}</p>
                      )}
                      <p className="text-sm text-foreground/60 mt-1">
                        {new Date(game.start_date).toLocaleDateString()} – {new Date(game.end_date).toLocaleDateString()}
                      </p>
                    </div>
                    <span className="px-3 py-1 bg-green-500/10 text-green-500 text-xs font-medium rounded">
                      COMPLETED
                    </span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {game.participants.map((p: any) => (
                      <div key={p.id} className="border border-foreground/10 rounded p-3 text-center hover:border-foreground/30 transition">
                        <p className="font-medium text-sm">{p.user.display_name || p.user.full_name}</p>
                        {p.game_name && (
                          <p className="text-xs text-foreground/60 mt-1">"{p.game_name}"</p>
                        )}
                        <Link
                          href={`/dashboard/90-day-game/history/${game.id}/${p.user_id}`}
                          className="text-xs text-foreground/60 hover:text-foreground underline mt-2 block"
                        >
                          View Game →
                        </Link>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
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
        scores: {
          vision: Math.round(visionScore),
          why: Math.round(whyScore),
          objective: Math.round(objectiveScore),
          keyResults: Math.round(keyResultsScore),
          projects: Math.round(projectsScore),
          innerGame: Math.round(innerGameScore),
          obts: Math.round(obtsScore),
        },
      };
    })
  );

  // Fetch recent activity log for this game
  const { data: activityLog } = await supabase
    .from('activity_log')
    .select('*, user:users(id, display_name, full_name)')
    .eq('entity_type', 'games')
    .eq('entity_id', currentGame.id)
    .order('created_at', { ascending: false })
    .limit(15);

  // Compute staleness: last activity per opted-in participant
  const STALE_DAYS = 3;
  const staleThreshold = STALE_DAYS * 24 * 60 * 60 * 1000;
  const now = Date.now();
  const stalenessMap: Record<string, { lastActivity: string | null; isStale: boolean }> = {};
  for (const p of gameData) {
    const lastEntry = (activityLog || []).find((a: any) => a.user_id === p.user_id);
    const lastActivity = lastEntry?.created_at ?? null;
    const isStale = !lastActivity || now - new Date(lastActivity).getTime() > staleThreshold;
    stalenessMap[p.user_id] = { lastActivity, isStale };
  }
  const staleParticipants = gameData.filter((p) => stalenessMap[p.user_id]?.isStale);

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold">{currentGame.title || 'The Six 90-Day Game'}</h1>
          {currentGame.description && (
            <p className="text-foreground/80 mt-1">{currentGame.description}</p>
          )}
          <p className="text-foreground/60 mt-1 text-sm">
            {new Date(currentGame.start_date).toLocaleDateString()} – {new Date(currentGame.end_date).toLocaleDateString()} • {currentGame.status.toUpperCase()}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {currentGame.status === 'completed' && <CreateGameButton />}
          <Link
            href="/dashboard/90-day-game/history"
            className="text-sm text-foreground/60 hover:text-foreground"
          >
            View History →
          </Link>
        </div>
      </div>

      {/* Participant Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {gameData?.map((participant: any) => (
          <div
            key={participant.id}
            className="border border-foreground/20 rounded-lg p-4 hover:border-foreground/40 transition-colors"
          >
            <h3 className="font-bold text-sm mb-0.5">
              {participant.user.display_name || participant.user.full_name}
            </h3>
            {participant.game_name && (
              <p className="text-xs text-foreground/50 mb-3">"{participant.game_name}"</p>
            )}
            {participant.game_image_url && (
              <img
                src={participant.game_image_url}
                alt={participant.game_name}
                className="w-full h-24 object-cover rounded mb-3"
              />
            )}

            <table className="w-full text-xs mb-3">
              <tbody>
                {[
                  ['Vision',      participant.scores.vision],
                  ['Why',         participant.scores.why],
                  ['Objective',   participant.scores.objective],
                  ['Key Results', participant.scores.keyResults],
                  ['Projects',    participant.scores.projects],
                  ['Inner Game',  participant.scores.innerGame],
                  ['OBTs',        participant.scores.obts],
                ].map(([label, score]) => (
                  <tr key={label} className="border-b border-foreground/5 last:border-0">
                    <td className="py-0.5 text-foreground/60">{label}</td>
                    <td className="py-0.5 text-right font-medium tabular-nums">{score}%</td>
                  </tr>
                ))}
                <tr className="border-t border-foreground/20">
                  <td className="pt-1.5 font-semibold">Overall</td>
                  <td className="pt-1.5 text-right font-bold tabular-nums">{participant.overallScore}%</td>
                </tr>
              </tbody>
            </table>

            <Link
              href={`/dashboard/90-day-game/${participant.user_id}`}
              className="text-xs text-foreground/60 hover:text-foreground underline"
            >
              View Full Game →
            </Link>
          </div>
        ))}
      </div>

      <div className="border border-foreground/20 rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">Recent Updates</h2>
        {activityLog && activityLog.length > 0 ? (
          <ul className="space-y-2">
            {activityLog.map((entry: any) => {
              const name = entry.user?.display_name || entry.user?.full_name || 'Someone';
              const message = formatActivityMessage(entry.activity_type, entry.metadata);
              return (
                <li key={entry.id} className="flex items-baseline gap-2 text-sm">
                  <span className="font-medium shrink-0">{name}</span>
                  <span className="text-foreground/70">{message}</span>
                  <span className="text-foreground/40 text-xs shrink-0 ml-auto">{timeAgo(entry.created_at)}</span>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="text-sm text-foreground/60">No updates yet.</p>
        )}
      </div>

      <div className="border border-foreground/20 rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">Staleness Alerts</h2>
        {staleParticipants.length > 0 ? (
          <ul className="space-y-2">
            {staleParticipants.map((p: any) => {
              const name = p.user?.display_name || p.user?.full_name || 'Someone';
              const info = stalenessMap[p.user_id];
              return (
                <li key={p.id} className="flex items-baseline gap-2 text-sm">
                  <span className="font-medium text-amber-400 shrink-0">{name}</span>
                  <span className="text-foreground/70">
                    {info.lastActivity
                      ? `last updated ${timeAgo(info.lastActivity)}`
                      : 'no updates recorded'}
                  </span>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="text-sm text-green-500">All participants active within the last {STALE_DAYS} days.</p>
        )}
      </div>
    </div>
  );
}
