'use client';

/**
 * 90-Day Game Editable Detail View
 *
 * Inline editing for all game sections
 */

import { useState } from 'react';
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
  gameStatus: string;
  startDate: string;
  endDate: string;
};

export function EditableGameDetail({
  gameId,
  userId,
  currentUserId,
  participant,
  gameData,
  gameStatus,
  startDate,
  endDate,
}: Props) {
  const isOwnGame = userId === currentUserId;

  const [vision, setVision] = useState(gameData.vision);
  const [why, setWhy] = useState(gameData.why);
  const [objective, setObjective] = useState(gameData.objective);
  const [keyResults, setKeyResults] = useState(gameData.keyResults);
  const [projects, setProjects] = useState(gameData.projects);
  const [innerGameLimiting, setInnerGameLimiting] = useState(gameData.innerGameLimiting);
  const [innerGameEmpowering, setInnerGameEmpowering] = useState(gameData.innerGameEmpowering);
  const [obts, setObts] = useState(gameData.obts);

  const [saving, setSaving] = useState(false);

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
        setObts(obts.map((o) => (o.week_number === updated.week_number ? updated : o)));
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <Link href="/dashboard/90-day-game" className="text-sm text-foreground/60 hover:text-foreground mb-2 block">
          ← Back to Overview
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold">
              {participant.user.display_name || participant.user.full_name}
            </h1>
            {participant.game_name && (
              <p className="text-xl text-foreground/60 mt-1">"{participant.game_name}"</p>
            )}
            <p className="text-sm text-foreground/60 mt-2">
              {new Date(startDate).toLocaleDateString()} - {new Date(endDate).toLocaleDateString()} •{' '}
              {gameStatus.toUpperCase()}
            </p>
          </div>
          <div className="text-right">
            <div className="text-5xl font-bold">{overallScore}%</div>
            <p className="text-sm text-foreground/60 mt-1">Overall Completion</p>
            {saving && <p className="text-xs text-foreground/40 mt-1">Saving...</p>}
          </div>
        </div>
      </div>

      {!isOwnGame && (
        <div className="bg-foreground/5 border border-foreground/20 rounded-lg p-4 text-sm text-foreground/60">
          You are viewing {participant.user.display_name || participant.user.full_name}'s game. You cannot edit their
          data.
        </div>
      )}

      {/* Vision Statement */}
      <div className="border border-foreground/20 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Vision Statement</h2>
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
            className="w-16 text-lg font-bold text-right bg-transparent border border-foreground/20 rounded px-2 py-1 disabled:opacity-50"
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
      <div className="border border-foreground/20 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Why</h2>
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
            className="w-16 text-lg font-bold text-right bg-transparent border border-foreground/20 rounded px-2 py-1 disabled:opacity-50"
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
      <div className="border border-foreground/20 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Objective</h2>
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
            className="w-16 text-lg font-bold text-right bg-transparent border border-foreground/20 rounded px-2 py-1 disabled:opacity-50"
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
      <div className="border border-foreground/20 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Key Results</h2>
          <span className="text-lg font-bold">{keyResultsScore}%</span>
        </div>
        <div className="space-y-3">
          {keyResults?.map((kr) => (
            <div key={kr.id} className="border border-foreground/10 rounded p-3">
              <textarea
                value={kr.description}
                onChange={(e) => {
                  setKeyResults(keyResults.map((k) => (k.id === kr.id ? { ...k, description: e.target.value } : k)));
                }}
                onBlur={() => saveKeyResult(kr)}
                disabled={!isOwnGame}
                className="w-full text-sm bg-transparent mb-2 border border-foreground/10 rounded p-2 disabled:opacity-50 disabled:border-transparent"
                rows={2}
              />
              <div className="flex items-center gap-3 text-sm">
                <label className="flex items-center gap-2">
                  Weight:
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
                    className="w-14 text-right bg-transparent border border-foreground/20 rounded px-1 disabled:opacity-50"
                  />
                  %
                </label>
                <label className="flex items-center gap-2">
                  Completion:
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
                    className="w-14 text-right bg-transparent border border-foreground/20 rounded px-1 disabled:opacity-50"
                  />
                  %
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
                  className="flex-1 text-sm bg-transparent border border-foreground/20 rounded px-2 py-1 disabled:opacity-50 disabled:border-transparent"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Projects */}
      <div className="border border-foreground/20 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Projects</h2>
          <span className="text-lg font-bold">{projectsScore}%</span>
        </div>
        <div className="space-y-3">
          {projects?.map((project) => (
            <div key={project.id} className="border border-foreground/10 rounded p-3">
              <textarea
                value={project.description}
                onChange={(e) => {
                  setProjects(
                    projects.map((p) => (p.id === project.id ? { ...p, description: e.target.value } : p))
                  );
                }}
                onBlur={() => saveProject(project)}
                disabled={!isOwnGame}
                className="w-full text-sm bg-transparent mb-2 border border-foreground/10 rounded p-2 disabled:opacity-50 disabled:border-transparent"
                rows={3}
              />
              <div className="flex items-center gap-3 text-sm">
                <label className="flex items-center gap-2">
                  Weight:
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
                    className="w-14 text-right bg-transparent border border-foreground/20 rounded px-1 disabled:opacity-50"
                  />
                  %
                </label>
                <label className="flex items-center gap-2">
                  Completion:
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
                    className="w-14 text-right bg-transparent border border-foreground/20 rounded px-1 disabled:opacity-50"
                  />
                  %
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
                  className="flex-1 text-sm bg-transparent border border-foreground/20 rounded px-2 py-1 disabled:opacity-50 disabled:border-transparent"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Inner Game - simplified inline editing */}
      <div className="border border-foreground/20 rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Inner Game</h2>
          <span className="text-lg font-bold">{innerGameScore}%</span>
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-semibold text-red-500/80 mb-3">Performance Limiting Box</h3>
          <div className="space-y-2">
            {innerGameLimiting?.map((item) => (
              <div key={item.id} className="bg-red-500/5 border border-red-500/20 rounded p-2 flex items-center gap-3">
                <span className="text-xs font-semibold text-red-500/80 uppercase w-24 shrink-0">{item.category}</span>
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
                  className="flex-1 text-sm bg-transparent border border-foreground/10 rounded px-2 py-1 disabled:opacity-50 disabled:border-transparent"
                />
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
                  className="w-12 text-center font-bold bg-transparent border border-foreground/20 rounded px-1 disabled:opacity-50"
                />
                <span className="text-sm">/5</span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-green-500/80 mb-3">Performance Empowering Platform</h3>
          <div className="space-y-2">
            {innerGameEmpowering?.map((item) => (
              <div key={item.id} className="bg-green-500/5 border border-green-500/20 rounded p-2 flex items-center gap-3">
                <span className="text-xs font-semibold text-green-500/80 uppercase w-24 shrink-0">{item.category}</span>
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
                  className="flex-1 text-sm bg-transparent border border-foreground/10 rounded px-2 py-1 disabled:opacity-50 disabled:border-transparent"
                />
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
                  className="w-12 text-center font-bold bg-transparent border border-foreground/20 rounded px-1 disabled:opacity-50"
                />
                <span className="text-sm">/5</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* One Big Things */}
      <div className="border border-foreground/20 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Bi-Weekly One Big Things</h2>
          <span className="text-lg font-bold">{obtsScore}%</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {obts?.map((obt) => (
            <div
              key={obt.week_number}
              className={`border rounded-lg p-3 ${
                obt.completion_percentage === 100 ? 'border-green-500/40 bg-green-500/5' : 'border-foreground/20'
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-xs font-semibold text-foreground/60">WEEK {obt.week_number}</span>
                <select
                  value={obt.completion_percentage}
                  onChange={(e) => {
                    const updated = { ...obt, completion_percentage: parseInt(e.target.value) };
                    setObts(obts.map((o) => (o.week_number === obt.week_number ? updated : o)));
                    saveOBT(updated);
                  }}
                  disabled={!isOwnGame}
                  className="text-sm font-bold bg-transparent border border-foreground/20 rounded px-2 py-1 disabled:opacity-50"
                >
                  <option value="0">0%</option>
                  <option value="100">100%</option>
                </select>
              </div>
              <textarea
                value={obt.description}
                onChange={(e) => {
                  setObts(obts.map((o) => (o.week_number === obt.week_number ? { ...o, description: e.target.value } : o)));
                }}
                onBlur={() => saveOBT(obt)}
                disabled={!isOwnGame}
                placeholder="What's your One Big Thing for this bi-week?"
                className="w-full text-sm bg-transparent border border-foreground/10 rounded p-2 mb-2 disabled:opacity-50 disabled:border-transparent"
                rows={2}
              />
              <input
                type="text"
                value={obt.notes || ''}
                onChange={(e) => {
                  setObts(obts.map((o) => (o.week_number === obt.week_number ? { ...o, notes: e.target.value } : o)));
                }}
                onBlur={() => saveOBT(obt)}
                disabled={!isOwnGame}
                placeholder="Notes..."
                className="w-full text-xs text-foreground/60 bg-transparent border border-foreground/10 rounded px-2 py-1 disabled:opacity-50 disabled:border-transparent"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
