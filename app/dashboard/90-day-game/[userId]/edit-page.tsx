'use client';

/**
 * 90-Day Game Editable Detail View
 *
 * Inline editing for all game sections
 */

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

type Props = {
  gameId: string;
  userId: string;
  currentUserId: string;
  participant: any;
  gameData: {
    vision: any;
    why: any;
    objective: any;
    keyResults: any[];
    projects: any[];
    innerGameLimiting: any[];
    innerGameEmpowering: any[];
    obts: any[];
  };
  gameTitle: string;
  gameDescription: string;
  gameStatus: string;
  startDate: string;
  endDate: string;
};

const INNER_GAME_CATEGORIES = ['belief', 'value', 'habit', 'motivator', 'strength', 'accountability'];

export function EditableGameDetail({
  gameId,
  userId,
  currentUserId,
  participant,
  gameData,
  gameTitle,
  gameDescription,
  gameStatus,
  startDate,
  endDate,
}: Props) {
  const isOwnGame = userId === currentUserId;

  const [gameName, setGameName] = useState(participant.game_name || '');
  const [vision, setVision] = useState(gameData.vision);
  const [why, setWhy] = useState(gameData.why);
  const [objective, setObjective] = useState(gameData.objective);
  const [keyResults, setKeyResults] = useState(gameData.keyResults);
  const [projects, setProjects] = useState(gameData.projects);
  const [innerGameLimiting, setInnerGameLimiting] = useState(gameData.innerGameLimiting);
  const [innerGameEmpowering, setInnerGameEmpowering] = useState(gameData.innerGameEmpowering);
  const [obts, setObts] = useState(gameData.obts);

  const [saving, setSaving] = useState(false);
  const [setupErrors, setSetupErrors] = useState<string[]>([]);
  const [completingSetup, setCompletingSetup] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [isSavingAll, setIsSavingAll] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const router = useRouter();

  // Refs to always have latest state in the auto-save interval
  const stateRef = useRef({
    gameName, vision, why, objective, keyResults, projects,
    innerGameLimiting, innerGameEmpowering, obts, isDirty,
  });

  // New inner game item form state
  const [newLimitingCategory, setNewLimitingCategory] = useState('belief');
  const [newLimitingDesc, setNewLimitingDesc] = useState('');
  const [newEmpoweringCategory, setNewEmpoweringCategory] = useState('belief');
  const [newEmpoweringDesc, setNewEmpoweringDesc] = useState('');
  const [showAddLimiting, setShowAddLimiting] = useState(false);
  const [showAddEmpowering, setShowAddEmpowering] = useState(false);

  // Score calculations
  const calculateWeightedScore = (items: Array<{ weight_percentage: number; completion_percentage: number }>) => {
    if (!items || items.length === 0) return 0;
    const totalWeight = items.reduce((sum, item) => sum + (item.weight_percentage || 0), 0);
    if (totalWeight === 0) return 0;
    const weightedSum = items.reduce(
      (sum, item) => sum + (item.weight_percentage || 0) * (item.completion_percentage || 0),
      0
    );
    return weightedSum / totalWeight;
  };

  const calculateInnerGameScore = (items: Array<{ rating: number }>) => {
    if (!items || items.length === 0) return 0;
    const totalRating = items.reduce((sum, item) => sum + (item.rating || 0), 0);
    const maxPossible = items.length * 5;
    return (totalRating / maxPossible) * 100;
  };

  const calculateOBTScore = (items: Array<{ completion_percentage: number }>) => {
    if (!items || items.length === 0) return 0;
    const total = items.reduce((sum, item) => sum + (item.completion_percentage || 0), 0);
    return total / items.length;
  };

  const visionScore = vision?.completion_percentage || 0;
  const whyScore = why?.completion_percentage || 0;
  const objectiveScore = objective?.completion_percentage || 0;
  const keyResultsScore = Math.round(calculateWeightedScore(keyResults || []));
  const projectsScore = Math.round(calculateWeightedScore(projects || []));
  const innerGameScore = Math.round(
    calculateInnerGameScore([...(innerGameLimiting || []), ...(innerGameEmpowering || [])])
  );
  const obtsScore = Math.round(calculateOBTScore(obts || []));

  const overallScore = Math.round(
    (visionScore + whyScore + objectiveScore + keyResultsScore + projectsScore + innerGameScore + obtsScore) / 7
  );

  // Mark dirty whenever any game data state changes (skip initial mount)
  const hasMounted = useRef(false);
  useEffect(() => {
    if (!hasMounted.current) { hasMounted.current = true; return; }
    setIsDirty(true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameName, vision, why, objective, keyResults, projects, innerGameLimiting, innerGameEmpowering, obts]);

  // Keep ref in sync with latest state
  useEffect(() => {
    stateRef.current = { gameName, vision, why, objective, keyResults, projects, innerGameLimiting, innerGameEmpowering, obts, isDirty };
  });

  // Auto-save every 30 seconds if dirty
  useEffect(() => {
    if (!isOwnGame || gameStatus !== 'setup') return;
    const interval = setInterval(() => {
      if (stateRef.current.isDirty) {
        triggerSaveAll();
      }
    }, 30000);
    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOwnGame, gameStatus]);

  // Save functions
  const saveVision = async (content: string, completion_percentage: number) => {
    if (!isOwnGame) return;
    setSaving(true);
    try {
      const res = await fetch('/api/90-day-game/vision', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gameId, content, completion_percentage }),
      });
      if (res.ok) {
        const updated = await res.json();
        setVision(updated);
      }
    } finally {
      setSaving(false);
    }
  };

  const saveWhy = async (content: string, completion_percentage: number) => {
    if (!isOwnGame) return;
    setSaving(true);
    try {
      const res = await fetch('/api/90-day-game/why', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gameId, content, completion_percentage }),
      });
      if (res.ok) {
        const updated = await res.json();
        setWhy(updated);
      }
    } finally {
      setSaving(false);
    }
  };

  const saveObjective = async (content: string, completion_percentage: number) => {
    if (!isOwnGame) return;
    setSaving(true);
    try {
      const res = await fetch('/api/90-day-game/objective', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gameId, content, completion_percentage }),
      });
      if (res.ok) {
        const updated = await res.json();
        setObjective(updated);
      }
    } finally {
      setSaving(false);
    }
  };

  const saveKeyResult = async (kr: any) => {
    if (!isOwnGame) return;
    setSaving(true);
    try {
      const res = await fetch('/api/90-day-game/key-results', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(kr),
      });
      if (res.ok) {
        const updated = await res.json();
        setKeyResults(keyResults.map((k) => (k.id === updated.id ? updated : k)));
      }
    } finally {
      setSaving(false);
    }
  };

  const addKeyResult = async () => {
    if (!isOwnGame) return;
    setSaving(true);
    try {
      const res = await fetch('/api/90-day-game/key-results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gameId,
          description: 'New key result',
          weight_percentage: 0,
          completion_percentage: 0,
          notes: '',
          sort_order: keyResults.length,
        }),
      });
      if (res.ok) {
        const newKr = await res.json();
        setKeyResults([...keyResults, newKr]);
      }
    } finally {
      setSaving(false);
    }
  };

  const deleteKeyResult = async (id: string) => {
    if (!isOwnGame) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/90-day-game/key-results?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setKeyResults(keyResults.filter((k) => k.id !== id));
      }
    } finally {
      setSaving(false);
    }
  };

  const saveProject = async (project: any) => {
    if (!isOwnGame) return;
    setSaving(true);
    try {
      const res = await fetch('/api/90-day-game/projects', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(project),
      });
      if (res.ok) {
        const updated = await res.json();
        setProjects(projects.map((p) => (p.id === updated.id ? updated : p)));
      }
    } finally {
      setSaving(false);
    }
  };

  const addProject = async () => {
    if (!isOwnGame) return;
    setSaving(true);
    try {
      const res = await fetch('/api/90-day-game/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gameId,
          description: 'New project',
          weight_percentage: 0,
          completion_percentage: 0,
          notes: '',
          sort_order: projects.length,
        }),
      });
      if (res.ok) {
        const newProject = await res.json();
        setProjects([...projects, newProject]);
      }
    } finally {
      setSaving(false);
    }
  };

  const deleteProject = async (id: string) => {
    if (!isOwnGame) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/90-day-game/projects?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setProjects(projects.filter((p) => p.id !== id));
      }
    } finally {
      setSaving(false);
    }
  };

  const saveInnerGame = async (item: any) => {
    if (!isOwnGame) return;
    setSaving(true);
    try {
      const res = await fetch('/api/90-day-game/inner-game', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item),
      });
      if (res.ok) {
        const updated = await res.json();
        if (updated.item_type === 'limiting') {
          setInnerGameLimiting(innerGameLimiting.map((i) => (i.id === updated.id ? updated : i)));
        } else {
          setInnerGameEmpowering(innerGameEmpowering.map((i) => (i.id === updated.id ? updated : i)));
        }
      }
    } finally {
      setSaving(false);
    }
  };

  const addInnerGameItem = async (item_type: 'limiting' | 'empowering', category: string, description: string) => {
    if (!isOwnGame || !description.trim()) return;
    setSaving(true);
    try {
      const res = await fetch('/api/90-day-game/inner-game', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gameId,
          item_type,
          category,
          description,
          rating: 3,
          notes: '',
          sort_order: item_type === 'limiting' ? innerGameLimiting.length : innerGameEmpowering.length,
        }),
      });
      if (res.ok) {
        const newItem = await res.json();
        if (item_type === 'limiting') {
          setInnerGameLimiting([...innerGameLimiting, newItem]);
          setNewLimitingDesc('');
          setShowAddLimiting(false);
        } else {
          setInnerGameEmpowering([...innerGameEmpowering, newItem]);
          setNewEmpoweringDesc('');
          setShowAddEmpowering(false);
        }
      }
    } finally {
      setSaving(false);
    }
  };

  const deleteInnerGameItem = async (id: string, item_type: 'limiting' | 'empowering') => {
    if (!isOwnGame) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/90-day-game/inner-game?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        if (item_type === 'limiting') {
          setInnerGameLimiting(innerGameLimiting.filter((i) => i.id !== id));
        } else {
          setInnerGameEmpowering(innerGameEmpowering.filter((i) => i.id !== id));
        }
      }
    } finally {
      setSaving(false);
    }
  };

  const saveOBT = async (obt: any) => {
    if (!isOwnGame) return;
    setSaving(true);
    try {
      const res = await fetch('/api/90-day-game/one-big-things', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...obt, gameId }),
      });
      if (res.ok) {
        const updated = await res.json();
        setObts((prev) => {
          const exists = prev.find((o) => o.week_number === updated.week_number);
          return exists
            ? prev.map((o) => (o.week_number === updated.week_number ? updated : o))
            : [...prev, updated];
        });
      }
    } finally {
      setSaving(false);
    }
  };

  const saveGameName = async (name: string) => {
    if (!isOwnGame) return;
    await fetch('/api/90-day-game/participant', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ gameId, game_name: name.trim() || null }),
    });
  };

  const triggerSaveAll = async () => {
    if (!isOwnGame) return;
    const s = stateRef.current;
    setIsSavingAll(true);
    try {
      await Promise.all([
        saveGameName(s.gameName),
        s.vision && fetch('/api/90-day-game/vision', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ gameId, content: s.vision.content || '', completion_percentage: s.vision.completion_percentage || 0 }) }),
        s.why && fetch('/api/90-day-game/why', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ gameId, content: s.why.content || '', completion_percentage: s.why.completion_percentage || 0 }) }),
        s.objective && fetch('/api/90-day-game/objective', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ gameId, content: s.objective.content || '', completion_percentage: s.objective.completion_percentage || 0 }) }),
        ...s.keyResults.map((kr) => fetch('/api/90-day-game/key-results', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(kr) })),
        ...s.projects.map((p) => fetch('/api/90-day-game/projects', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(p) })),
        ...[...s.innerGameLimiting, ...s.innerGameEmpowering].map((item) => fetch('/api/90-day-game/inner-game', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(item) })),
        ...s.obts.filter((o) => o.description).map((obt) => fetch('/api/90-day-game/one-big-things', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...obt, gameId }) })),
      ]);
      setLastSaved(new Date());
      setIsDirty(false);
    } finally {
      setIsSavingAll(false);
    }
  };

  const handleMarkSetupComplete = async () => {
    const errors: string[] = [];

    if (!gameName.trim()) errors.push('Game name is required');
    if (!vision?.content?.trim()) errors.push('Vision statement is required');
    if (!why?.content?.trim()) errors.push('Why statement is required');
    if (!objective?.content?.trim()) errors.push('Objective is required');

    if (keyResults.length < 3) {
      errors.push('At least 3 Key Results are required');
    } else {
      if (keyResults.some((kr) => !(kr.weight_percentage > 0))) {
        errors.push('All Key Results must have a weight greater than 0');
      }
      const totalKRWeight = keyResults.reduce((sum, kr) => sum + (kr.weight_percentage || 0), 0);
      if (totalKRWeight !== 100) {
        errors.push(`Key Results weights must sum to 100% (currently ${totalKRWeight}%)`);
      }
    }

    if (projects.length < 3) {
      errors.push('At least 3 Projects are required');
    } else {
      if (projects.some((p) => !(p.weight_percentage > 0))) {
        errors.push('All Projects must have a weight greater than 0');
      }
      const totalProjectWeight = projects.reduce((sum, p) => sum + (p.weight_percentage || 0), 0);
      if (totalProjectWeight !== 100) {
        errors.push(`Projects weights must sum to 100% (currently ${totalProjectWeight}%)`);
      }
    }

    if (innerGameLimiting.length < 1) errors.push('At least 1 Limiting inner game item is required');
    if (innerGameEmpowering.length < 1) errors.push('At least 1 Empowering inner game item is required');

    const obt1 = obts.find((o) => o.week_number === 1);
    if (!obt1?.description?.trim()) errors.push('Week 1 One Big Thing must be filled in');

    setSetupErrors(errors);
    if (errors.length > 0) return;

    setCompletingSetup(true);
    try {
      await fetch('/api/90-day-game/participant', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gameId, setup_complete: true }),
      });
      router.push('/dashboard/90-day-game');
    } catch {
      setSetupErrors(['Failed to complete setup. Please try again.']);
      setCompletingSetup(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <Link href="/dashboard/90-day-game" className="text-sm text-foreground/60 hover:text-foreground mb-2 block">
          {gameStatus === 'setup' ? '← Back to Setup' : '← Back to Overview'}
        </Link>
        {gameTitle && (
          <div className="mb-3 pb-3 border-b border-foreground/10">
            <p className="text-base font-semibold text-foreground/80">{gameTitle}</p>
            {gameDescription && (
              <p className="text-sm text-foreground/50 mt-0.5">{gameDescription}</p>
            )}
          </div>
        )}
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div className="flex-1">
            <h1 className="text-2xl md:text-3xl font-bold">
              {participant.user.display_name || participant.user.full_name}
            </h1>
            {participant.game_name && (
              <p className="text-lg md:text-xl text-foreground/60 mt-1">"{participant.game_name}"</p>
            )}
            <p className="text-xs md:text-sm text-foreground/60 mt-2">
              {new Date(startDate).toLocaleDateString()} – {new Date(endDate).toLocaleDateString()} •{' '}
              {gameStatus.toUpperCase()}
            </p>
          </div>
          <div className="text-left md:text-right">
            <div className="text-4xl md:text-5xl font-bold">{overallScore}%</div>
            <p className="text-sm text-foreground/60 mt-1">Overall Completion</p>
            <p className="text-xs text-foreground/40 mt-1 min-h-[1rem]">
              {isSavingAll || saving
                ? 'Saving...'
                : isDirty
                ? 'Unsaved changes'
                : lastSaved
                ? `Last saved at ${lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                : null}
            </p>
          </div>
        </div>
      </div>

      {!isOwnGame && (
        <div className="bg-foreground/5 border border-foreground/20 rounded-lg p-4 text-sm text-foreground/60">
          You are viewing {participant.user.display_name || participant.user.full_name}'s game. You cannot edit their
          data.
        </div>
      )}

      {/* Game Name */}
      <div className="border border-foreground/20 rounded-lg p-4 md:p-6">
        <h2 className="text-lg md:text-xl font-semibold mb-1">Game Name</h2>
        <p className="text-sm text-foreground/50 mb-3">Your personal name for this game</p>
        <input
          type="text"
          value={gameName}
          onChange={(e) => setGameName(e.target.value.slice(0, 150))}
          onBlur={(e) => saveGameName(e.target.value)}
          disabled={!isOwnGame}
          placeholder='e.g., "D.O. or Die", "Foundation Year"'
          className="w-full px-3 py-2 bg-transparent border border-foreground/20 rounded disabled:opacity-50 disabled:border-transparent"
          maxLength={150}
        />
      </div>

      {/* Vision Statement */}
      <div className="border border-foreground/20 rounded-lg p-4 md:p-6">
        <div className="flex items-center justify-between gap-3 mb-4">
          <h2 className="text-lg md:text-xl font-semibold">Vision Statement</h2>
          <input
            type="number"
            min="0"
            max="100"
            value={vision?.completion_percentage || 0}
            onChange={(e) => {
              const newVal = parseInt(e.target.value) || 0;
              setVision({ ...vision, completion_percentage: newVal });
            }}
            onBlur={(e) => saveVision(vision?.content || '', parseInt(e.target.value) || 0)}
            disabled={!isOwnGame}
            className="w-14 md:w-16 text-base md:text-lg font-bold text-right bg-transparent border border-foreground/20 rounded px-2 py-1 disabled:opacity-50 min-h-[44px]"
          />
        </div>
        <textarea
          value={vision?.content || ''}
          onChange={(e) => setVision({ ...vision, content: e.target.value })}
          onBlur={(e) => saveVision(e.target.value, vision?.completion_percentage || 0)}
          disabled={!isOwnGame}
          className="w-full min-h-[100px] text-foreground/80 leading-relaxed bg-transparent border border-foreground/20 rounded p-3 disabled:opacity-50 disabled:border-transparent"
          placeholder="Enter your vision statement..."
        />
      </div>

      {/* Why Statement */}
      <div className="border border-foreground/20 rounded-lg p-4 md:p-6">
        <div className="flex items-center justify-between gap-3 mb-4">
          <h2 className="text-lg md:text-xl font-semibold">Why</h2>
          <input
            type="number"
            min="0"
            max="100"
            value={why?.completion_percentage || 0}
            onChange={(e) => {
              const newVal = parseInt(e.target.value) || 0;
              setWhy({ ...why, completion_percentage: newVal });
            }}
            onBlur={(e) => saveWhy(why?.content || '', parseInt(e.target.value) || 0)}
            disabled={!isOwnGame}
            className="w-14 md:w-16 text-base md:text-lg font-bold text-right bg-transparent border border-foreground/20 rounded px-2 py-1 disabled:opacity-50 min-h-[44px]"
          />
        </div>
        <textarea
          value={why?.content || ''}
          onChange={(e) => setWhy({ ...why, content: e.target.value })}
          onBlur={(e) => saveWhy(e.target.value, why?.completion_percentage || 0)}
          disabled={!isOwnGame}
          className="w-full min-h-[100px] text-foreground/80 leading-relaxed bg-transparent border border-foreground/20 rounded p-3 disabled:opacity-50 disabled:border-transparent"
          placeholder="Enter your why statement..."
        />
      </div>

      {/* Objective */}
      <div className="border border-foreground/20 rounded-lg p-4 md:p-6">
        <div className="flex items-center justify-between gap-3 mb-4">
          <h2 className="text-lg md:text-xl font-semibold">Objective</h2>
          <input
            type="number"
            min="0"
            max="100"
            value={objective?.completion_percentage || 0}
            onChange={(e) => {
              const newVal = parseInt(e.target.value) || 0;
              setObjective({ ...objective, completion_percentage: newVal });
            }}
            onBlur={(e) => saveObjective(objective?.content || '', parseInt(e.target.value) || 0)}
            disabled={!isOwnGame}
            className="w-14 md:w-16 text-base md:text-lg font-bold text-right bg-transparent border border-foreground/20 rounded px-2 py-1 disabled:opacity-50 min-h-[44px]"
          />
        </div>
        <textarea
          value={objective?.content || ''}
          onChange={(e) => setObjective({ ...objective, content: e.target.value })}
          onBlur={(e) => saveObjective(e.target.value, objective?.completion_percentage || 0)}
          disabled={!isOwnGame}
          className="w-full min-h-[100px] text-foreground/80 leading-relaxed bg-transparent border border-foreground/20 rounded p-3 disabled:opacity-50 disabled:border-transparent"
          placeholder="Enter your objective..."
        />
      </div>

      {/* Key Results */}
      <div className="border border-foreground/20 rounded-lg p-4 md:p-6">
        <div className="flex items-center justify-between gap-3 mb-4">
          <h2 className="text-lg md:text-xl font-semibold">Key Results</h2>
          <span className="text-base md:text-lg font-bold">{keyResultsScore}%</span>
        </div>
        <div className="space-y-3">
          {keyResults?.map((kr) => (
            <div key={kr.id} className="border border-foreground/10 rounded p-3">
              <div className="flex items-start gap-2 mb-2">
                <textarea
                  value={kr.description}
                  onChange={(e) => {
                    setKeyResults(keyResults.map((k) => (k.id === kr.id ? { ...k, description: e.target.value } : k)));
                  }}
                  onBlur={() => saveKeyResult(kr)}
                  disabled={!isOwnGame}
                  className="flex-1 text-sm bg-transparent border border-foreground/10 rounded p-2 disabled:opacity-50 disabled:border-transparent min-h-[44px]"
                  rows={2}
                />
                {isOwnGame && (
                  <button
                    onClick={() => deleteKeyResult(kr.id)}
                    className="text-foreground/30 hover:text-red-500 text-lg leading-none pt-2 shrink-0"
                    title="Delete"
                  >
                    ×
                  </button>
                )}
              </div>
              <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-3 text-sm">
                <label className="flex items-center gap-2 min-h-[44px]">
                  <span className="text-xs md:text-sm">Weight:</span>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={kr.weight_percentage}
                    onChange={(e) => {
                      const updated = { ...kr, weight_percentage: parseInt(e.target.value) || 0 };
                      setKeyResults(keyResults.map((k) => (k.id === kr.id ? updated : k)));
                    }}
                    onBlur={() => saveKeyResult(kr)}
                    disabled={!isOwnGame}
                    className="w-16 text-right bg-transparent border border-foreground/20 rounded px-2 py-2 disabled:opacity-50"
                  />
                  <span>%</span>
                </label>
                <label className="flex items-center gap-2 min-h-[44px]">
                  <span className="text-xs md:text-sm">Completion:</span>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={kr.completion_percentage}
                    onChange={(e) => {
                      const updated = { ...kr, completion_percentage: parseInt(e.target.value) || 0 };
                      setKeyResults(keyResults.map((k) => (k.id === kr.id ? updated : k)));
                    }}
                    onBlur={() => saveKeyResult(kr)}
                    disabled={!isOwnGame}
                    className="w-16 text-right bg-transparent border border-foreground/20 rounded px-2 py-2 disabled:opacity-50"
                  />
                  <span>%</span>
                </label>
                <input
                  type="text"
                  value={kr.notes || ''}
                  onChange={(e) => {
                    setKeyResults(keyResults.map((k) => (k.id === kr.id ? { ...k, notes: e.target.value } : k)));
                  }}
                  onBlur={() => saveKeyResult(kr)}
                  disabled={!isOwnGame}
                  placeholder="Notes..."
                  className="flex-1 text-sm bg-transparent border border-foreground/20 rounded px-2 py-2 disabled:opacity-50 disabled:border-transparent min-h-[44px]"
                />
              </div>
            </div>
          ))}
        </div>
        {isOwnGame && (
          <button
            onClick={addKeyResult}
            disabled={saving}
            className="mt-3 text-sm text-foreground/50 hover:text-foreground border border-dashed border-foreground/20 hover:border-foreground/40 rounded px-4 py-2 w-full disabled:opacity-50"
          >
            + Add Key Result
          </button>
        )}
      </div>

      {/* Projects */}
      <div className="border border-foreground/20 rounded-lg p-4 md:p-6">
        <div className="flex items-center justify-between gap-3 mb-4">
          <h2 className="text-lg md:text-xl font-semibold">Projects</h2>
          <span className="text-base md:text-lg font-bold">{projectsScore}%</span>
        </div>
        <div className="space-y-3">
          {projects?.map((project) => (
            <div key={project.id} className="border border-foreground/10 rounded p-3">
              <div className="flex items-start gap-2 mb-2">
                <textarea
                  value={project.description}
                  onChange={(e) => {
                    setProjects(
                      projects.map((p) => (p.id === project.id ? { ...p, description: e.target.value } : p))
                    );
                  }}
                  onBlur={() => saveProject(project)}
                  disabled={!isOwnGame}
                  className="flex-1 text-sm bg-transparent border border-foreground/10 rounded p-2 disabled:opacity-50 disabled:border-transparent min-h-[44px]"
                  rows={3}
                />
                {isOwnGame && (
                  <button
                    onClick={() => deleteProject(project.id)}
                    className="text-foreground/30 hover:text-red-500 text-lg leading-none pt-2 shrink-0"
                    title="Delete"
                  >
                    ×
                  </button>
                )}
              </div>
              <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-3 text-sm">
                <label className="flex items-center gap-2 min-h-[44px]">
                  <span className="text-xs md:text-sm">Weight:</span>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={project.weight_percentage}
                    onChange={(e) => {
                      const updated = { ...project, weight_percentage: parseInt(e.target.value) || 0 };
                      setProjects(projects.map((p) => (p.id === project.id ? updated : p)));
                    }}
                    onBlur={() => saveProject(project)}
                    disabled={!isOwnGame}
                    className="w-16 text-right bg-transparent border border-foreground/20 rounded px-2 py-2 disabled:opacity-50"
                  />
                  <span>%</span>
                </label>
                <label className="flex items-center gap-2 min-h-[44px]">
                  <span className="text-xs md:text-sm">Completion:</span>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={project.completion_percentage}
                    onChange={(e) => {
                      const updated = { ...project, completion_percentage: parseInt(e.target.value) || 0 };
                      setProjects(projects.map((p) => (p.id === project.id ? updated : p)));
                    }}
                    onBlur={() => saveProject(project)}
                    disabled={!isOwnGame}
                    className="w-16 text-right bg-transparent border border-foreground/20 rounded px-2 py-2 disabled:opacity-50"
                  />
                  <span>%</span>
                </label>
                <input
                  type="text"
                  value={project.notes || ''}
                  onChange={(e) => {
                    setProjects(projects.map((p) => (p.id === project.id ? { ...p, notes: e.target.value } : p)));
                  }}
                  onBlur={() => saveProject(project)}
                  disabled={!isOwnGame}
                  placeholder="Notes..."
                  className="flex-1 text-sm bg-transparent border border-foreground/20 rounded px-2 py-2 disabled:opacity-50 disabled:border-transparent min-h-[44px]"
                />
              </div>
            </div>
          ))}
        </div>
        {isOwnGame && (
          <button
            onClick={addProject}
            disabled={saving}
            className="mt-3 text-sm text-foreground/50 hover:text-foreground border border-dashed border-foreground/20 hover:border-foreground/40 rounded px-4 py-2 w-full disabled:opacity-50"
          >
            + Add Project
          </button>
        )}
      </div>

      {/* Inner Game */}
      <div className="border border-foreground/20 rounded-lg p-4 md:p-6">
        <div className="flex items-center justify-between gap-3 mb-6">
          <h2 className="text-lg md:text-xl font-semibold">Inner Game</h2>
          <span className="text-base md:text-lg font-bold">{innerGameScore}%</span>
        </div>

        {/* Limiting */}
        <div className="mb-6">
          <h3 className="text-base md:text-lg font-semibold text-red-500/80 mb-3">Performance Limiting Box</h3>
          <div className="space-y-2">
            {innerGameLimiting?.map((item) => (
              <div key={item.id} className="bg-red-500/5 border border-red-500/20 rounded p-3">
                <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-3">
                  <span className="text-xs font-semibold text-red-500/80 uppercase md:w-24 md:shrink-0">{item.category}</span>
                  <input
                    type="text"
                    value={item.description}
                    onChange={(e) => {
                      setInnerGameLimiting(
                        innerGameLimiting.map((i) => (i.id === item.id ? { ...i, description: e.target.value } : i))
                      );
                    }}
                    onBlur={() => saveInnerGame(item)}
                    disabled={!isOwnGame}
                    className="flex-1 text-sm bg-transparent border border-foreground/10 rounded px-2 py-2 disabled:opacity-50 disabled:border-transparent min-h-[44px]"
                  />
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="1"
                      max="5"
                      value={item.rating}
                      onChange={(e) => {
                        const updated = { ...item, rating: parseInt(e.target.value) || 1 };
                        setInnerGameLimiting(innerGameLimiting.map((i) => (i.id === item.id ? updated : i)));
                      }}
                      onBlur={() => saveInnerGame(item)}
                      disabled={!isOwnGame}
                      className="w-14 text-center font-bold bg-transparent border border-foreground/20 rounded px-2 py-2 disabled:opacity-50"
                    />
                    <span className="text-sm">/5</span>
                    {isOwnGame && (
                      <button
                        onClick={() => deleteInnerGameItem(item.id, 'limiting')}
                        className="text-foreground/30 hover:text-red-500 text-lg leading-none"
                        title="Delete"
                      >
                        ×
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
          {isOwnGame && (
            <div className="mt-2">
              {!showAddLimiting ? (
                <button
                  onClick={() => setShowAddLimiting(true)}
                  className="text-sm text-foreground/50 hover:text-foreground border border-dashed border-red-500/20 hover:border-red-500/40 rounded px-4 py-2 w-full"
                >
                  + Add Limiting Item
                </button>
              ) : (
                <div className="border border-red-500/20 rounded p-3 space-y-2">
                  <div className="flex gap-2">
                    <select
                      value={newLimitingCategory}
                      onChange={(e) => setNewLimitingCategory(e.target.value)}
                      className="text-sm bg-transparent border border-foreground/20 rounded px-2 py-2 capitalize"
                    >
                      {INNER_GAME_CATEGORIES.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                    <input
                      type="text"
                      value={newLimitingDesc}
                      onChange={(e) => setNewLimitingDesc(e.target.value)}
                      placeholder="Description..."
                      className="flex-1 text-sm bg-transparent border border-foreground/20 rounded px-2 py-2"
                      onKeyDown={(e) => e.key === 'Enter' && addInnerGameItem('limiting', newLimitingCategory, newLimitingDesc)}
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => addInnerGameItem('limiting', newLimitingCategory, newLimitingDesc)}
                      disabled={saving || !newLimitingDesc.trim()}
                      className="text-sm px-4 py-2 bg-foreground text-background rounded disabled:opacity-50"
                    >
                      Add
                    </button>
                    <button
                      onClick={() => { setShowAddLimiting(false); setNewLimitingDesc(''); }}
                      className="text-sm px-4 py-2 border border-foreground/20 rounded hover:bg-foreground/5"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Empowering */}
        <div>
          <h3 className="text-base md:text-lg font-semibold text-green-500/80 mb-3">Performance Empowering Platform</h3>
          <div className="space-y-2">
            {innerGameEmpowering?.map((item) => (
              <div key={item.id} className="bg-green-500/5 border border-green-500/20 rounded p-3">
                <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-3">
                  <span className="text-xs font-semibold text-green-500/80 uppercase md:w-24 md:shrink-0">{item.category}</span>
                  <input
                    type="text"
                    value={item.description}
                    onChange={(e) => {
                      setInnerGameEmpowering(
                        innerGameEmpowering.map((i) => (i.id === item.id ? { ...i, description: e.target.value } : i))
                      );
                    }}
                    onBlur={() => saveInnerGame(item)}
                    disabled={!isOwnGame}
                    className="flex-1 text-sm bg-transparent border border-foreground/10 rounded px-2 py-2 disabled:opacity-50 disabled:border-transparent min-h-[44px]"
                  />
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="1"
                      max="5"
                      value={item.rating}
                      onChange={(e) => {
                        const updated = { ...item, rating: parseInt(e.target.value) || 1 };
                        setInnerGameEmpowering(innerGameEmpowering.map((i) => (i.id === item.id ? updated : i)));
                      }}
                      onBlur={() => saveInnerGame(item)}
                      disabled={!isOwnGame}
                      className="w-14 text-center font-bold bg-transparent border border-foreground/20 rounded px-2 py-2 disabled:opacity-50"
                    />
                    <span className="text-sm">/5</span>
                    {isOwnGame && (
                      <button
                        onClick={() => deleteInnerGameItem(item.id, 'empowering')}
                        className="text-foreground/30 hover:text-red-500 text-lg leading-none"
                        title="Delete"
                      >
                        ×
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
          {isOwnGame && (
            <div className="mt-2">
              {!showAddEmpowering ? (
                <button
                  onClick={() => setShowAddEmpowering(true)}
                  className="text-sm text-foreground/50 hover:text-foreground border border-dashed border-green-500/20 hover:border-green-500/40 rounded px-4 py-2 w-full"
                >
                  + Add Empowering Item
                </button>
              ) : (
                <div className="border border-green-500/20 rounded p-3 space-y-2">
                  <div className="flex gap-2">
                    <select
                      value={newEmpoweringCategory}
                      onChange={(e) => setNewEmpoweringCategory(e.target.value)}
                      className="text-sm bg-transparent border border-foreground/20 rounded px-2 py-2 capitalize"
                    >
                      {INNER_GAME_CATEGORIES.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                    <input
                      type="text"
                      value={newEmpoweringDesc}
                      onChange={(e) => setNewEmpoweringDesc(e.target.value)}
                      placeholder="Description..."
                      className="flex-1 text-sm bg-transparent border border-foreground/20 rounded px-2 py-2"
                      onKeyDown={(e) => e.key === 'Enter' && addInnerGameItem('empowering', newEmpoweringCategory, newEmpoweringDesc)}
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => addInnerGameItem('empowering', newEmpoweringCategory, newEmpoweringDesc)}
                      disabled={saving || !newEmpoweringDesc.trim()}
                      className="text-sm px-4 py-2 bg-foreground text-background rounded disabled:opacity-50"
                    >
                      Add
                    </button>
                    <button
                      onClick={() => { setShowAddEmpowering(false); setNewEmpoweringDesc(''); }}
                      className="text-sm px-4 py-2 border border-foreground/20 rounded hover:bg-foreground/5"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* One Big Things — always show all 6 weeks */}
      <div className="border border-foreground/20 rounded-lg p-4 md:p-6">
        <div className="flex items-center justify-between gap-3 mb-4">
          <h2 className="text-lg md:text-xl font-semibold">Bi-Weekly One Big Things</h2>
          <span className="text-base md:text-lg font-bold">{obtsScore}%</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[1, 2, 3, 4, 5, 6].map((weekNum) => {
            const obt = obts?.find((o) => o.week_number === weekNum) || {
              week_number: weekNum,
              description: '',
              completion_percentage: 0,
              notes: '',
            };
            return (
              <div
                key={weekNum}
                className={`border rounded-lg p-3 ${
                  obt.completion_percentage === 100 ? 'border-green-500/40 bg-green-500/5' : 'border-foreground/20'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-xs font-semibold text-foreground/60">WEEK {weekNum}</span>
                  <select
                    value={obt.completion_percentage}
                    onChange={(e) => {
                      const updated = { ...obt, completion_percentage: parseInt(e.target.value) };
                      setObts((prev) => {
                        const exists = prev.find((o) => o.week_number === weekNum);
                        return exists
                          ? prev.map((o) => (o.week_number === weekNum ? updated : o))
                          : [...prev, updated];
                      });
                      saveOBT(updated);
                    }}
                    disabled={!isOwnGame}
                    className="text-sm font-bold bg-transparent border border-foreground/20 rounded px-2 py-2 disabled:opacity-50 min-h-[44px]"
                  >
                    <option value="0">0%</option>
                    <option value="100">100%</option>
                  </select>
                </div>
                <textarea
                  value={obt.description}
                  onChange={(e) => {
                    const updated = { ...obt, description: e.target.value };
                    setObts((prev) => {
                      const exists = prev.find((o) => o.week_number === weekNum);
                      return exists
                        ? prev.map((o) => (o.week_number === weekNum ? updated : o))
                        : [...prev, updated];
                    });
                  }}
                  onBlur={() => { if (obt.description) saveOBT(obt); }}
                  disabled={!isOwnGame}
                  placeholder="What's your One Big Thing for this bi-week?"
                  className="w-full text-sm bg-transparent border border-foreground/10 rounded p-2 mb-2 disabled:opacity-50 disabled:border-transparent min-h-[44px]"
                  rows={2}
                />
                <input
                  type="text"
                  value={obt.notes || ''}
                  onChange={(e) => {
                    const updated = { ...obt, notes: e.target.value };
                    setObts((prev) => {
                      const exists = prev.find((o) => o.week_number === weekNum);
                      return exists
                        ? prev.map((o) => (o.week_number === weekNum ? updated : o))
                        : [...prev, updated];
                    });
                  }}
                  onBlur={() => { if (obt.description) saveOBT(obt); }}
                  disabled={!isOwnGame}
                  placeholder="Notes..."
                  className="w-full text-xs text-foreground/60 bg-transparent border border-foreground/10 rounded px-2 py-2 disabled:opacity-50 disabled:border-transparent min-h-[44px]"
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Mark Setup Complete */}
      {gameStatus === 'setup' && isOwnGame && (
        <div className="border border-foreground/20 rounded-lg p-4 md:p-6">
          <h2 className="text-lg md:text-xl font-semibold mb-2">Complete Setup</h2>
          <p className="text-sm text-foreground/60 mb-4">
            Once all sections are filled in, mark your setup as complete. Required: vision, why, objective, ≥3 key
            results (weights = 100%), ≥3 projects (weights = 100%), at least 1 limiting and 1 empowering inner game
            item, and Week 1 One Big Thing.
          </p>
          {setupErrors.length > 0 && (
            <div className="mb-4 bg-red-500/10 border border-red-500/20 rounded p-3 space-y-1">
              {setupErrors.map((err, i) => (
                <p key={i} className="text-sm text-red-500">
                  • {err}
                </p>
              ))}
            </div>
          )}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={triggerSaveAll}
              disabled={isSavingAll || !isDirty}
              className="px-5 py-3 border border-foreground/20 rounded-lg hover:bg-foreground/5 disabled:opacity-40 text-sm font-medium"
            >
              {isSavingAll ? 'Saving...' : 'Save My Progress'}
            </button>
            <button
              onClick={handleMarkSetupComplete}
              disabled={completingSetup}
              className="px-6 py-3 bg-foreground text-background font-semibold rounded-lg hover:opacity-90 disabled:opacity-50"
            >
              {completingSetup ? 'Completing Setup...' : 'Mark Setup Complete'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
