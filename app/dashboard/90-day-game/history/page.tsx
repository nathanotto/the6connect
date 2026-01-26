/**
 * 90-Day Game History
 *
 * Browse all past completed games
 */

import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';

export default async function GameHistoryPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  // Fetch all completed games
  const { data: completedGames } = await supabase
    .from('games')
    .select('*')
    .eq('status', 'completed')
    .order('start_date', { ascending: false });

  // For each game, get participant info
  const gamesWithParticipants = await Promise.all(
    (completedGames || []).map(async (game) => {
      const { data: participants } = await supabase
        .from('game_participants')
        .select(`
          *,
          user:users(id, full_name, display_name)
        `)
        .eq('game_id', game.id)
        .eq('opted_in', true);

      return {
        ...game,
        participants: participants || [],
      };
    })
  );

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Game History</h1>
          <p className="text-foreground/60 mt-2">Browse past completed 90-day games</p>
        </div>
        <Link
          href="/dashboard/90-day-game"
          className="text-sm text-foreground/60 hover:text-foreground"
        >
          ← Back to Current Game
        </Link>
      </div>

      {gamesWithParticipants.length === 0 ? (
        <div className="border border-foreground/20 rounded-lg p-12 text-center">
          <p className="text-foreground/60">No completed games yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {gamesWithParticipants.map((game) => (
            <div key={game.id} className="border border-foreground/20 rounded-lg p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-xl font-bold">
                    {new Date(game.start_date).toLocaleDateString()} -{' '}
                    {new Date(game.end_date).toLocaleDateString()}
                  </h2>
                  <p className="text-sm text-foreground/60 mt-1">
                    {game.participants.length} participant{game.participants.length !== 1 ? 's' : ''}
                  </p>
                </div>
                <span className="px-3 py-1 bg-green-500/10 text-green-500 text-sm font-medium rounded">
                  COMPLETED
                </span>
              </div>

              {/* Participants Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                {game.participants.map((p: any) => (
                  <div
                    key={p.id}
                    className="border border-foreground/10 rounded p-3 text-center hover:border-foreground/30 transition"
                  >
                    <p className="font-medium text-sm">
                      {p.user.display_name || p.user.full_name}
                    </p>
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
      )}
    </div>
  );
}
