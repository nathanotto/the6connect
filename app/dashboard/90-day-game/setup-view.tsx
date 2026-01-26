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
  gameId: string;
  startDate: string;
  endDate: string;
  currentUserId: string;
  participants: Participant[];
};

export function SetupView({ gameId, startDate, endDate, currentUserId, participants }: Props) {
  const [optingIn, setOptingIn] = useState(false);
  const [activating, setActivating] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const currentParticipant = participants.find((p) => p.user_id === currentUserId);
  const optedInParticipants = participants.filter((p) => p.opted_in);
  const allOptedInComplete = optedInParticipants.every((p) => p.setup_complete);
  const canActivate = optedInParticipants.length > 0 && allOptedInComplete;

  const handleOptIn = async () => {
    setOptingIn(true);
    setError('');

    try {
      const res = await fetch('/api/90-day-game/participant', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gameId, opted_in: true }),
      });

      if (res.ok) {
        router.refresh();
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to opt in');
      }
    } catch (err) {
      setError('Failed to opt in');
    } finally {
      setOptingIn(false);
    }
  };

  const handleOptOut = async () => {
    if (!confirm('Are you sure you want to opt out of this game?')) return;

    setOptingIn(true);
    setError('');

    try {
      const res = await fetch('/api/90-day-game/participant', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gameId, opted_in: false, setup_complete: false }),
      });

      if (res.ok) {
        router.refresh();
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to opt out');
      }
    } catch (err) {
      setError('Failed to opt out');
    } finally {
      setOptingIn(false);
    }
  };

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
          {new Date(startDate).toLocaleDateString()} - {new Date(endDate).toLocaleDateString()} • SETUP MODE
        </p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-red-500 text-sm">{error}</div>
      )}

      {/* Current User Status */}
      <div className="border border-foreground/20 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Your Status</h2>

        {!currentParticipant?.opted_in ? (
          <div>
            <p className="text-foreground/60 mb-4">You have not opted in to this game yet.</p>
            <button
              onClick={handleOptIn}
              disabled={optingIn}
              className="px-6 py-3 bg-foreground text-background font-medium rounded-lg hover:opacity-90 disabled:opacity-50"
            >
              {optingIn ? 'Opting In...' : 'Opt In to This Game'}
            </button>
          </div>
        ) : !currentParticipant?.setup_complete ? (
          <div>
            <p className="text-green-500 mb-2">✓ You have opted in</p>
            <p className="text-foreground/60 mb-4">Complete your setup to start the game.</p>
            <div className="flex gap-3">
              <Link
                href={`/dashboard/90-day-game/setup?gameId=${gameId}`}
                className="px-6 py-3 bg-foreground text-background font-medium rounded-lg hover:opacity-90"
              >
                Complete Setup
              </Link>
              <button
                onClick={handleOptOut}
                disabled={optingIn}
                className="px-4 py-2 border border-foreground/20 rounded-lg hover:bg-foreground/5 disabled:opacity-50"
              >
                Opt Out
              </button>
            </div>
          </div>
        ) : (
          <div>
            <p className="text-green-500 mb-2">✓ You have completed setup</p>
            <p className="text-foreground/60 mb-2">Game name: "{currentParticipant.game_name}"</p>
            <p className="text-sm text-foreground/60">Waiting for other members to complete setup...</p>
          </div>
        )}
      </div>

      {/* All Participants Status */}
      <div className="border border-foreground/20 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">All Members</h2>
        <div className="space-y-3">
          {participants.map((p) => (
            <div key={p.id} className="flex items-center justify-between border-b border-foreground/10 pb-3 last:border-0">
              <div>
                <p className="font-medium">{p.user.display_name || p.user.full_name}</p>
                {p.game_name && <p className="text-sm text-foreground/60">"{p.game_name}"</p>}
              </div>
              <div className="text-right">
                {!p.opted_in ? (
                  <span className="text-sm text-foreground/40">Not opted in</span>
                ) : !p.setup_complete ? (
                  <span className="text-sm text-yellow-500">Opted in • Setup incomplete</span>
                ) : (
                  <span className="text-sm text-green-500">✓ Setup complete</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

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
