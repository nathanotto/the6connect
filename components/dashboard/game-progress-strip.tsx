import Link from 'next/link';
import { GameProgressBar } from '@/app/dashboard/90-day-game/game-progress-bar';
import { format } from 'date-fns';

interface Game {
  id: string;
  title: string | null;
  start_date: string;
  end_date: string;
}

interface Participant {
  user_id: string;
  game_name: string | null;
  user: {
    id: string;
    full_name: string;
    display_name: string | null;
  };
}

interface UserWithCheckin {
  id: string;
  latestCheckin: { created_at: string } | null;
}

interface Props {
  game: Game;
  participants: Participant[];
  usersWithCheckins: UserWithCheckin[];
}

export function GameProgressStrip({ game, participants, usersWithCheckins }: Props) {
  const startLabel = new Date(game.start_date).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', timeZone: 'UTC',
  });
  const endLabel = new Date(game.end_date).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC',
  });

  return (
    <div className="border border-foreground/20 p-4 space-y-3">
      {/* Header: game name + dates */}
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold">
          {game.title || '90-Day Game'}{' '}
          <span className="font-normal text-foreground/50 text-xs">{startLabel} – {endLabel}</span>
        </p>
        <Link href="/dashboard/90-day-game" className="text-xs text-foreground/40 hover:text-foreground">
          View all →
        </Link>
      </div>

      {/* Timeline bar */}
      <GameProgressBar startDate={game.start_date} endDate={game.end_date} />

      {/* Per-participant rows — each links to that man's game */}
      <div className="divide-y divide-foreground/10">
        {participants.map((p) => {
          const memberCheckin = usersWithCheckins.find((u) => u.id === p.user_id);
          const lastCheckin = memberCheckin?.latestCheckin;
          const displayName = p.user.display_name || p.user.full_name;

          return (
            <Link
              key={p.user_id}
              href={`/dashboard/90-day-game/${p.user_id}`}
              className="flex items-center justify-between py-1.5 px-1 hover:bg-foreground/5 transition"
            >
              <div className="flex items-baseline gap-1.5 min-w-0">
                <span className="text-sm font-medium">{displayName}</span>
                {p.game_name && (
                  <span className="text-xs text-foreground/50 truncate">"{p.game_name}"</span>
                )}
              </div>
              <span className="text-xs text-zinc-600 dark:text-zinc-400 shrink-0 ml-3">
                {lastCheckin
                  ? format(new Date(lastCheckin.created_at), 'MMM d, h:mm a')
                  : 'No check-in'}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
