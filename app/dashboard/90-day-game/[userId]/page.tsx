/**
 * 90-Day Game Individual Detail View
 *
 * Shows complete game data for a single participant
 */

import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { notFound } from 'next/navigation';

// Score calculation functions
function calculateWeightedScore(items: Array<{ weight_percentage: number; completion_percentage: number }>) {
  if (!items || items.length === 0) return 0;
  const totalWeight = items.reduce((sum, item) => sum + (item.weight_percentage || 0), 0);
  if (totalWeight === 0) return 0;
  const weightedSum = items.reduce(
    (sum, item) => sum + (item.weight_percentage || 0) * (item.completion_percentage || 0),
    0
  );
  return weightedSum / totalWeight;
}

function calculateInnerGameScore(items: Array<{ rating: number }>) {
  if (!items || items.length === 0) return 0;
  const totalRating = items.reduce((sum, item) => sum + (item.rating || 0), 0);
  const maxPossible = items.length * 5;
  return (totalRating / maxPossible) * 100;
}

function calculateOBTScore(items: Array<{ completion_percentage: number }>) {
  if (!items || items.length === 0) return 0;
  const total = items.reduce((sum, item) => sum + (item.completion_percentage || 0), 0);
  return total / items.length;
}

type PageProps = {
  params: Promise<{ userId: string }>;
};

export default async function GameDetailPage({ params }: PageProps) {
  const { userId } = await params;
  const supabase = await createClient();

  const {
    data: { user: currentUser },
  } = await supabase.auth.getUser();

  if (!currentUser) {
    return null;
  }

  // Fetch most recent game (active or completed)
  const { data: activeGame } = await supabase
    .from('games')
    .select('*')
    .in('status', ['active', 'completed'])
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (!activeGame) {
    notFound();
  }

  // Fetch participant info
  const { data: participant } = await supabase
    .from('game_participants')
    .select(`
      *,
      user:users(id, full_name, display_name)
    `)
    .eq('game_id', activeGame.id)
    .eq('user_id', userId)
    .single();

  if (!participant) {
    notFound();
  }

  // Fetch all game data
  const [vision, why, objective, keyResults, projects, innerGameLimiting, innerGameEmpowering, obts] =
    await Promise.all([
      supabase
        .from('game_vision_statements')
        .select('*')
        .eq('game_id', activeGame.id)
        .eq('user_id', userId)
        .single(),
      supabase.from('game_why_statements').select('*').eq('game_id', activeGame.id).eq('user_id', userId).single(),
      supabase.from('game_objectives').select('*').eq('game_id', activeGame.id).eq('user_id', userId).single(),
      supabase
        .from('game_key_results')
        .select('*')
        .eq('game_id', activeGame.id)
        .eq('user_id', userId)
        .order('sort_order'),
      supabase
        .from('game_projects')
        .select('*')
        .eq('game_id', activeGame.id)
        .eq('user_id', userId)
        .order('sort_order'),
      supabase
        .from('game_inner_game_items')
        .select('*')
        .eq('game_id', activeGame.id)
        .eq('user_id', userId)
        .eq('item_type', 'limiting')
        .order('sort_order'),
      supabase
        .from('game_inner_game_items')
        .select('*')
        .eq('game_id', activeGame.id)
        .eq('user_id', userId)
        .eq('item_type', 'empowering')
        .order('sort_order'),
      supabase
        .from('game_one_big_things')
        .select('*')
        .eq('game_id', activeGame.id)
        .eq('user_id', userId)
        .order('week_number'),
    ]);

  // Calculate section scores
  const visionScore = vision.data?.completion_percentage || 0;
  const whyScore = why.data?.completion_percentage || 0;
  const objectiveScore = objective.data?.completion_percentage || 0;
  const keyResultsScore = Math.round(calculateWeightedScore(keyResults.data || []));
  const projectsScore = Math.round(calculateWeightedScore(projects.data || []));
  const innerGameScore = Math.round(
    calculateInnerGameScore([...(innerGameLimiting.data || []), ...(innerGameEmpowering.data || [])])
  );
  const obtsScore = Math.round(calculateOBTScore(obts.data || []));

  const overallScore = Math.round(
    (visionScore + whyScore + objectiveScore + keyResultsScore + projectsScore + innerGameScore + obtsScore) / 7
  );

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
              {new Date(activeGame.start_date).toLocaleDateString()} -{' '}
              {new Date(activeGame.end_date).toLocaleDateString()} • {activeGame.status.toUpperCase()}
            </p>
          </div>
          <div className="text-right">
            <div className="text-5xl font-bold">{overallScore}%</div>
            <p className="text-sm text-foreground/60 mt-1">Overall Completion</p>
          </div>
        </div>
      </div>

      {/* Vision Statement */}
      <div className="border border-foreground/20 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Vision Statement</h2>
          <span className="text-lg font-bold">{visionScore}%</span>
        </div>
        <p className="text-foreground/80 leading-relaxed">{vision.data?.content || 'No vision statement yet.'}</p>
      </div>

      {/* Why Statement */}
      <div className="border border-foreground/20 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Why</h2>
          <span className="text-lg font-bold">{whyScore}%</span>
        </div>
        <p className="text-foreground/80 leading-relaxed">{why.data?.content || 'No why statement yet.'}</p>
      </div>

      {/* Objective */}
      <div className="border border-foreground/20 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Objective</h2>
          <span className="text-lg font-bold">{objectiveScore}%</span>
        </div>
        <p className="text-foreground/80 leading-relaxed">{objective.data?.content || 'No objective yet.'}</p>
      </div>

      {/* Key Results */}
      <div className="border border-foreground/20 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Key Results</h2>
          <span className="text-lg font-bold">{keyResultsScore}%</span>
        </div>
        <div className="space-y-4">
          {keyResults.data?.map((kr, idx) => (
            <div key={kr.id} className="border-l-2 border-foreground/20 pl-4">
              <div className="flex items-start justify-between gap-4">
                <p className="text-sm text-foreground/80 flex-1">{kr.description}</p>
                <div className="text-right shrink-0">
                  <div className="text-lg font-bold">{kr.completion_percentage}%</div>
                  <div className="text-xs text-foreground/60">Weight: {kr.weight_percentage}%</div>
                </div>
              </div>
              {kr.notes && <p className="text-sm text-foreground/60 mt-2 italic">Note: {kr.notes}</p>}
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
        <div className="space-y-4">
          {projects.data?.map((project, idx) => (
            <div key={project.id} className="border-l-2 border-foreground/20 pl-4">
              <div className="flex items-start justify-between gap-4">
                <p className="text-sm text-foreground/80 flex-1 whitespace-pre-line">{project.description}</p>
                <div className="text-right shrink-0">
                  <div className="text-lg font-bold">{project.completion_percentage}%</div>
                  <div className="text-xs text-foreground/60">Weight: {project.weight_percentage}%</div>
                </div>
              </div>
              {project.notes && <p className="text-sm text-foreground/60 mt-2 italic">Note: {project.notes}</p>}
            </div>
          ))}
        </div>
      </div>

      {/* Inner Game */}
      <div className="border border-foreground/20 rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Inner Game</h2>
          <span className="text-lg font-bold">{innerGameScore}%</span>
        </div>

        {/* Limiting Items */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-red-500/80 mb-3">Performance Limiting Box</h3>
          <div className="space-y-3">
            {innerGameLimiting.data?.map((item) => (
              <div key={item.id} className="bg-red-500/5 border border-red-500/20 rounded p-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="text-xs font-semibold text-red-500/80 uppercase mb-1">{item.category}</div>
                    <p className="text-sm text-foreground/80">{item.description}</p>
                    {item.notes && <p className="text-xs text-foreground/60 mt-1 italic">{item.notes}</p>}
                  </div>
                  <div className="shrink-0 text-lg font-bold">{item.rating}/5</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Empowering Items */}
        <div>
          <h3 className="text-lg font-semibold text-green-500/80 mb-3">Performance Empowering Platform</h3>
          <div className="space-y-3">
            {innerGameEmpowering.data?.map((item) => (
              <div key={item.id} className="bg-green-500/5 border border-green-500/20 rounded p-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="text-xs font-semibold text-green-500/80 uppercase mb-1">{item.category}</div>
                    <p className="text-sm text-foreground/80">{item.description}</p>
                    {item.notes && <p className="text-xs text-foreground/60 mt-1 italic">{item.notes}</p>}
                  </div>
                  <div className="shrink-0 text-lg font-bold">{item.rating}/5</div>
                </div>
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {obts.data?.map((obt) => (
            <div
              key={obt.id}
              className={`border rounded-lg p-4 ${
                obt.completion_percentage === 100
                  ? 'border-green-500/40 bg-green-500/5'
                  : 'border-foreground/20'
              }`}
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <span className="text-xs font-semibold text-foreground/60">WEEK {obt.week_number}</span>
                <span
                  className={`text-sm font-bold ${
                    obt.completion_percentage === 100 ? 'text-green-500' : 'text-foreground/60'
                  }`}
                >
                  {obt.completion_percentage}%
                </span>
              </div>
              <p className="text-sm text-foreground/80 mb-2">{obt.description || 'Not set'}</p>
              {obt.notes && <p className="text-xs text-foreground/60 italic">{obt.notes}</p>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
