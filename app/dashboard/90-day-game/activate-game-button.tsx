'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type Props = {
  gameId: string;
  canActivate: boolean;
  notReadyNames: string[];
};

export function ActivateGameButton({ gameId, canActivate, notReadyNames }: Props) {
  const [activating, setActivating] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

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
    } catch {
      setError('Failed to activate game');
    } finally {
      setActivating(false);
    }
  };

  return (
    <div>
      {error && (
        <p className="text-red-500 text-sm mb-2">{error}</p>
      )}
      <button
        onClick={handleActivate}
        disabled={!canActivate || activating}
        className="px-6 py-3 bg-green-500 text-white font-medium rounded-lg hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {activating ? 'Activating...' : 'Activate Game'}
      </button>
      {!canActivate && notReadyNames.length > 0 && (
        <p className="text-sm text-foreground/50 mt-2">
          Waiting for {notReadyNames.join(' and ')} to complete setup first.
        </p>
      )}
    </div>
  );
}
