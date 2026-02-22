'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function CreateGameButton() {
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleCreate = async () => {
    if (!title.trim()) {
      setError('Please provide a game title');
      return;
    }
    if (!startDate || !endDate) {
      setError('Please provide both start and end dates');
      return;
    }

    setCreating(true);
    setError('');

    try {
      const res = await fetch('/api/90-day-game/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: title.trim(), description: description.trim(), start_date: startDate, end_date: endDate }),
      });

      if (res.ok) {
        router.refresh();
        setShowModal(false);
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to create game');
      }
    } catch (err) {
      setError('Failed to create game');
    } finally {
      setCreating(false);
    }
  };

  // Calculate suggested dates (today + 90 days)
  const suggestDates = () => {
    const today = new Date();
    const start = today.toISOString().split('T')[0];
    const end = new Date(today.getTime() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    setStartDate(start);
    setEndDate(end);
  };

  return (
    <>
      <button
        onClick={() => {
          setShowModal(true);
          suggestDates();
        }}
        className="px-6 py-3 bg-foreground text-background font-medium rounded-lg hover:opacity-90"
      >
        Create New Game
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-background border border-foreground/20 rounded-lg p-6 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4">Create New 90-Day Game</h2>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium mb-2">Game Title *</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Q1 2026 — Health & Business"
                  maxLength={80}
                  className="w-full px-3 py-2 border border-foreground/20 rounded bg-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What is this game cycle about? What's the shared focus?"
                  rows={3}
                  className="w-full px-3 py-2 border border-foreground/20 rounded bg-transparent resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 border border-foreground/20 rounded bg-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">End Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 border border-foreground/20 rounded bg-transparent"
                />
              </div>

              {error && <p className="text-sm text-red-500">{error}</p>}

              <p className="text-sm text-foreground/60">
                All four members will be invited to opt-in to this game. The game will remain in setup mode until all
                opted-in members complete their setup.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleCreate}
                disabled={creating}
                className="flex-1 px-4 py-2 bg-foreground text-background font-medium rounded-lg hover:opacity-90 disabled:opacity-50"
              >
                {creating ? 'Creating...' : 'Create Game'}
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 border border-foreground/20 rounded-lg hover:bg-foreground/5"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
