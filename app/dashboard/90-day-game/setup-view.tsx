'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

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
  gameId: string;
  gameTitle: string;
  startDate: string;
  endDate: string;
  currentUserId: string;
  participants: Participant[];
};

export function SetupView({ gameId, gameTitle, startDate, endDate, currentUserId, participants }: Props) {
  const [activating, setActivating] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const optedInParticipants = participants.filter((p) => p.opted_in);
  const allOptedInComplete = optedInParticipants.every((p) => p.setup_complete);
  const canActivate = optedInParticipants.length > 0 && allOptedInComplete;

  const handleActivate = async () => {
    if (!confirm('Activate this game? All opted-in members have completed setup.')) return;

    setActivating(true);
    setError('');

    try {
      const res = await fetch('/api/90-day-game/activate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gameId }),
      });

      if (res.ok) {
        router.refresh();
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to activate game');
      }
    } catch (err) {
      setError('Failed to activate game');
    } finally {
      setActivating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">90-Day Game Setup</h1>
        <p className="text-foreground/60 mt-2">
          {gameTitle && `${gameTitle} • `}{new Date(startDate).toLocaleDateString()} – {new Date(endDate).toLocaleDateString()} • The Six
        </p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-red-500 text-sm">{error}</div>
      )}

      {/* Activate Game */}
      {canActivate && (
        <div className="border border-green-500/40 bg-green-500/5 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-2">Ready to Start!</h2>
          <p className="text-foreground/60 mb-4">
            All opted-in members have completed setup. You can now activate the game to begin.
          </p>
          <button
            onClick={handleActivate}
            disabled={activating}
            className="px-6 py-3 bg-green-500 text-white font-medium rounded-lg hover:opacity-90 disabled:opacity-50"
          >
            {activating ? 'Activating...' : 'Activate Game'}
          </button>
        </div>
      )}
    </div>
  );
}
