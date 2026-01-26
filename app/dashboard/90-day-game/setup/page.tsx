'use client';

/**
 * 90-Day Game Setup Page
 *
 * Complete initial setup: game name, image, vision, why, objective
 */

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';

export default function SetupPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const gameId = searchParams.get('gameId');
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [gameName, setGameName] = useState('');
  const [gameImageUrl, setGameImageUrl] = useState('');
  const [visionContent, setVisionContent] = useState('');
  const [visionCompletion, setVisionCompletion] = useState(0);
  const [whyContent, setWhyContent] = useState('');
  const [whyCompletion, setWhyCompletion] = useState(0);
  const [objectiveContent, setObjectiveContent] = useState('');
  const [objectiveCompletion, setObjectiveCompletion] = useState(0);

  useEffect(() => {
    if (!gameId) {
      router.push('/dashboard/90-day-game');
      return;
    }

    const loadData = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      // Load existing data if any
      const [participant, vision, why, objective] = await Promise.all([
        supabase.from('game_participants').select('*').eq('game_id', gameId).eq('user_id', user.id).single(),
        supabase.from('game_vision_statements').select('*').eq('game_id', gameId).eq('user_id', user.id).single(),
        supabase.from('game_why_statements').select('*').eq('game_id', gameId).eq('user_id', user.id).single(),
        supabase.from('game_objectives').select('*').eq('game_id', gameId).eq('user_id', user.id).single(),
      ]);

      if (participant.data) {
        setGameName(participant.data.game_name || '');
        setGameImageUrl(participant.data.game_image_url || '');
      }

      if (vision.data) {
        setVisionContent(vision.data.content || '');
        setVisionCompletion(vision.data.completion_percentage || 0);
      }

      if (why.data) {
        setWhyContent(why.data.content || '');
        setWhyCompletion(why.data.completion_percentage || 0);
      }

      if (objective.data) {
        setObjectiveContent(objective.data.content || '');
        setObjectiveCompletion(objective.data.completion_percentage || 0);
      }

      setLoading(false);
    };

    loadData();
  }, [gameId, router, supabase]);

  const handleSave = async () => {
    if (!gameName.trim()) {
      setError('Game name is required');
      return;
    }

    if (!visionContent.trim() || !whyContent.trim() || !objectiveContent.trim()) {
      setError('Vision, Why, and Objective are all required');
      return;
    }

    setSaving(true);
    setError('');

    try {
      // Save participant info
      await fetch('/api/90-day-game/participant', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gameId,
          game_name: gameName,
          game_image_url: gameImageUrl || null,
          setup_complete: true,
        }),
      });

      // Save vision
      await fetch('/api/90-day-game/vision', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gameId, content: visionContent, completion_percentage: visionCompletion }),
      });

      // Save why
      await fetch('/api/90-day-game/why', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gameId, content: whyContent, completion_percentage: whyCompletion }),
      });

      // Save objective
      await fetch('/api/90-day-game/objective', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gameId, content: objectiveContent, completion_percentage: objectiveCompletion }),
      });

      router.push('/dashboard/90-day-game');
    } catch (err) {
      setError('Failed to save setup');
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-foreground/60">Loading...</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <Link href="/dashboard/90-day-game" className="text-sm text-foreground/60 hover:text-foreground mb-2 block">
          ← Back to Setup
        </Link>
        <h1 className="text-3xl font-bold">Complete Your Game Setup</h1>
        <p className="text-foreground/60 mt-2">
          Provide your game name, image (optional), and initial vision, why, and objective statements.
        </p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-red-500 text-sm">{error}</div>
      )}

      {/* Game Name */}
      <div className="border border-foreground/20 rounded-lg p-6">
        <label className="block text-lg font-semibold mb-2">
          Game Name <span className="text-red-500">*</span>
        </label>
        <p className="text-sm text-foreground/60 mb-3">
          Give your game a fun, inspiring name (max 150 characters)
        </p>
        <input
          type="text"
          value={gameName}
          onChange={(e) => setGameName(e.target.value.slice(0, 150))}
          placeholder='e.g., "D.O. or Die", "Foundation Year"'
          className="w-full px-4 py-2 bg-transparent border border-foreground/20 rounded"
          maxLength={150}
        />
        <p className="text-xs text-foreground/40 mt-1">{gameName.length}/150 characters</p>
      </div>

      {/* Game Image */}
      <div className="border border-foreground/20 rounded-lg p-6">
        <label className="block text-lg font-semibold mb-2">Game Image (Optional)</label>
        <p className="text-sm text-foreground/60 mb-3">Provide a URL to a landscape image for your game</p>
        <input
          type="url"
          value={gameImageUrl}
          onChange={(e) => setGameImageUrl(e.target.value)}
          placeholder="https://example.com/image.jpg"
          className="w-full px-4 py-2 bg-transparent border border-foreground/20 rounded"
        />
        {gameImageUrl && (
          <div className="mt-3">
            <img src={gameImageUrl} alt="Preview" className="w-full max-w-md h-32 object-cover rounded" />
          </div>
        )}
      </div>

      {/* Vision Statement */}
      <div className="border border-foreground/20 rounded-lg p-6">
        <div className="flex items-center justify-between mb-2">
          <label className="text-lg font-semibold">
            Vision Statement <span className="text-red-500">*</span>
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min="0"
              max="100"
              value={visionCompletion}
              onChange={(e) => setVisionCompletion(parseInt(e.target.value) || 0)}
              className="w-16 text-right px-2 py-1 bg-transparent border border-foreground/20 rounded"
            />
            <span>%</span>
          </div>
        </div>
        <p className="text-sm text-foreground/60 mb-3">
          Describe your vision for what you want to achieve in 90 days
        </p>
        <textarea
          value={visionContent}
          onChange={(e) => setVisionContent(e.target.value)}
          placeholder="Enter your vision statement..."
          className="w-full min-h-[120px] px-4 py-3 bg-transparent border border-foreground/20 rounded"
        />
      </div>

      {/* Why Statement */}
      <div className="border border-foreground/20 rounded-lg p-6">
        <div className="flex items-center justify-between mb-2">
          <label className="text-lg font-semibold">
            Why Statement <span className="text-red-500">*</span>
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min="0"
              max="100"
              value={whyCompletion}
              onChange={(e) => setWhyCompletion(parseInt(e.target.value) || 0)}
              className="w-16 text-right px-2 py-1 bg-transparent border border-foreground/20 rounded"
            />
            <span>%</span>
          </div>
        </div>
        <p className="text-sm text-foreground/60 mb-3">Why is this game important to you?</p>
        <textarea
          value={whyContent}
          onChange={(e) => setWhyContent(e.target.value)}
          placeholder="Enter your why statement..."
          className="w-full min-h-[120px] px-4 py-3 bg-transparent border border-foreground/20 rounded"
        />
      </div>

      {/* Objective */}
      <div className="border border-foreground/20 rounded-lg p-6">
        <div className="flex items-center justify-between mb-2">
          <label className="text-lg font-semibold">
            Objective <span className="text-red-500">*</span>
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min="0"
              max="100"
              value={objectiveCompletion}
              onChange={(e) => setObjectiveCompletion(parseInt(e.target.value) || 0)}
              className="w-16 text-right px-2 py-1 bg-transparent border border-foreground/20 rounded"
            />
            <span>%</span>
          </div>
        </div>
        <p className="text-sm text-foreground/60 mb-3">What specific objective will you achieve?</p>
        <textarea
          value={objectiveContent}
          onChange={(e) => setObjectiveContent(e.target.value)}
          placeholder="Enter your objective..."
          className="w-full min-h-[120px] px-4 py-3 bg-transparent border border-foreground/20 rounded"
        />
      </div>

      {/* Save Button */}
      <div className="flex gap-3">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex-1 px-6 py-3 bg-foreground text-background font-medium rounded-lg hover:opacity-90 disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Complete Setup'}
        </button>
        <Link
          href="/dashboard/90-day-game"
          className="px-6 py-3 border border-foreground/20 rounded-lg hover:bg-foreground/5 flex items-center justify-center"
        >
          Cancel
        </Link>
      </div>

      <p className="text-sm text-foreground/60 text-center">
        After completing setup, you can add Key Results, Projects, Inner Game items, and One Big Things from your
        personal game page.
      </p>
    </div>
  );
}
