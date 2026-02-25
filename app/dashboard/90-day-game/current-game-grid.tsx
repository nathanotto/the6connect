'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

type Participant = {
  id: string;
  user_id: string;
  opted_in: boolean;
  setup_complete: boolean;
  game_name: string | null;
  user: {
    id: string;
    full_name: string;
    display_name: string | null;
  };
};

type Props = {
  participants: Participant[];
  currentUserId: string;
  gameId: string;
};

export function CurrentGameGrid({ participants, currentUserId, gameId }: Props) {
  const [optingIn, setOptingIn] = useState(false);
  const router = useRouter();

  const handleOptIn = async () => {
    setOptingIn(true);
    try {
      await fetch('/api/90-day-game/participant', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gameId, opted_in: true }),
      });
      router.refresh();
    } finally {
      setOptingIn(false);
    }
  };

  return (
    <div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {participants.map((p) => {
          const isOwn = p.user_id === currentUserId;
          const name = p.user.display_name || p.user.full_name;

          if (!p.opted_in) {
            return (
              <div
                key={p.id}
                className="border border-foreground/20 rounded-lg p-4 text-center"
              >
                <p className="font-medium text-sm">{name}</p>
                <p className="text-xs text-foreground/40 mt-2">Not in this game</p>
                {isOwn && (
                  <button
                    onClick={handleOptIn}
                    disabled={optingIn}
                    className="mt-3 text-xs px-3 py-1.5 bg-foreground text-background rounded hover:opacity-90 disabled:opacity-50"
                  >
                    {optingIn ? 'Joining...' : 'Opt In →'}
                  </button>
                )}
              </div>
            );
          }

          const href =
            isOwn && !p.setup_complete
              ? '/dashboard/90-day-game/setup'
              : `/dashboard/90-day-game/${p.user_id}`;

          return (
            <Link
              key={p.id}
              href={href}
              className="border border-foreground/20 rounded-lg p-4 text-center hover:border-foreground/40 transition-colors"
            >
              <p className="font-medium text-sm">{name}</p>
              {p.game_name && (
                <p className="text-xs text-foreground/60 mt-1">"{p.game_name}"</p>
              )}
              <p
                className={`text-xs mt-2 font-medium ${
                  p.setup_complete ? 'text-green-500' : 'text-amber-400'
                }`}
              >
                {p.setup_complete ? '✓ Setup complete' : 'Setting up...'}
              </p>
              <span className="text-xs text-foreground/60 hover:text-foreground underline mt-2 block">
                {isOwn
                  ? p.setup_complete
                    ? 'My Game →'
                    : 'Set Up My Game →'
                  : 'View Game →'}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
