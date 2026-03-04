/**
 * HistoryGameDetail
 *
 * Compact read-only view of a completed game. Used only on the /history page.
 * No forms, no dropdowns, no editing — just data.
 */

import Link from 'next/link';

interface Props {
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
  startDate: string;
  endDate: string;
}

function pct(val: number | null | undefined) {
  return `${val ?? 0}%`;
}

function weightedScore(items: { weight_percentage: number; completion_percentage: number }[]) {
  if (!items.length) return 0;
  const total = items.reduce((s, i) => s + (i.weight_percentage || 0), 0);
  if (!total) return 0;
  return Math.round(items.reduce((s, i) => s + (i.weight_percentage || 0) * (i.completion_percentage || 0), 0) / total);
}

function innerGameScore(items: { rating: number }[]) {
  if (!items.length) return 0;
  return Math.round((items.reduce((s, i) => s + (i.rating || 0), 0) / (items.length * 5)) * 100);
}

function obtScore(items: { completion_percentage: number }[]) {
  if (!items.length) return 0;
  return Math.round(items.reduce((s, i) => s + (i.completion_percentage || 0), 0) / items.length);
}

function obtLabel(weekNum: number, startDate: string) {
  const s = new Date(startDate);
  s.setDate(s.getDate() + (weekNum - 1) * 14);
  const e = new Date(startDate);
  e.setDate(e.getDate() + weekNum * 14 - 1);
  const fmt = (d: Date) => d.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', timeZone: 'UTC' });
  return `Wks ${2 * weekNum - 1}–${2 * weekNum}: ${fmt(s)}–${fmt(e)}`;
}

export function HistoryGameDetail({ participant, gameData, gameTitle, gameDescription, startDate, endDate }: Props) {
  const { vision, why, objective, keyResults, projects, innerGameLimiting, innerGameEmpowering, obts } = gameData;

  const scores = {
    vision: vision?.completion_percentage ?? 0,
    why: why?.completion_percentage ?? 0,
    objective: objective?.completion_percentage ?? 0,
    keyResults: weightedScore(keyResults),
    projects: weightedScore(projects),
    innerGame: innerGameScore([...innerGameLimiting, ...innerGameEmpowering]),
    obts: obtScore(obts),
  };
  const overall = Math.round(Object.values(scores).reduce((s, v) => s + v, 0) / 7);

  const name = participant.user?.display_name || participant.user?.full_name;
  const startFmt = new Date(startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });
  const endFmt = new Date(endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' });

  return (
    <div className="space-y-2 max-w-5xl">
      <Link href="/dashboard/90-day-game" className="text-xs text-foreground hover:text-foreground">
        ← Back
      </Link>

      {/* Header */}
      <div>
        <h1 className="text-lg font-bold leading-tight">{name}{participant.game_name ? <span className="font-normal text-foreground ml-2">"{participant.game_name}"</span> : null}</h1>
        <p className="text-xs text-foreground">{gameTitle} · {startFmt} – {endFmt}{gameDescription ? ` · ${gameDescription}` : ''}</p>
      </div>

      {/* Score summary */}
      <div className="border border-foreground/20 rounded p-2">
        <div className="grid grid-cols-8 gap-x-2 text-xs">
          {[
            ['Vision', scores.vision],
            ['Why', scores.why],
            ['Obj.', scores.objective],
            ['KRs', scores.keyResults],
            ['Proj.', scores.projects],
            ['IG', scores.innerGame],
            ['OBTs', scores.obts],
            ['Overall', overall],
          ].map(([label, val]) => (
            <div key={label as string} className="text-center">
              <div className="text-foreground text-[9px] uppercase truncate">{label}</div>
              <div className={`text-sm font-bold ${label === 'Overall' ? 'text-foreground' : 'text-foreground'}`}>{val}%</div>
            </div>
          ))}
        </div>
      </div>

      {vision?.content && <Section title="Vision" score={scores.vision}><p className="text-xs text-foreground">{vision.content}</p></Section>}
      {why?.content && <Section title="Why" score={scores.why}><p className="text-xs text-foreground">{why.content}</p></Section>}
      {objective?.content && <Section title="Objective" score={scores.objective}><p className="text-xs text-foreground">{objective.content}</p></Section>}

      {keyResults.length > 0 && (
        <Section title="Key Results" score={scores.keyResults}>
          <CompactTable rows={keyResults.map((kr) => [kr.description, `${kr.weight_percentage}%`, pct(kr.completion_percentage)])} headers={['Description', 'Wt', 'Done']} />
        </Section>
      )}

      {projects.length > 0 && (
        <Section title="Projects" score={scores.projects}>
          <CompactTable rows={projects.map((p) => [p.description, `${p.weight_percentage}%`, pct(p.completion_percentage)])} headers={['Description', 'Wt', 'Done']} />
        </Section>
      )}

      {(innerGameLimiting.length > 0 || innerGameEmpowering.length > 0) && (
        <Section title="Inner Game" score={scores.innerGame}>
          {innerGameLimiting.length > 0 && <><p className="text-[9px] uppercase text-foreground font-semibold tracking-wide mb-0.5">Limiting</p><CompactTable rows={innerGameLimiting.map((i) => [i.category, i.description, `${i.rating}/5`])} headers={['Cat.', 'Description', 'Rating']} /></>}
          {innerGameEmpowering.length > 0 && <><p className="text-[9px] uppercase text-foreground font-semibold tracking-wide mt-1 mb-0.5">Empowering</p><CompactTable rows={innerGameEmpowering.map((i) => [i.category, i.description, `${i.rating}/5`])} headers={['Cat.', 'Description', 'Rating']} /></>}
        </Section>
      )}

      {obts.length > 0 && (
        <Section title="OBTs" score={scores.obts}>
          <CompactTable rows={obts.map((o) => [obtLabel(o.week_number, startDate), o.description || '—', pct(o.completion_percentage)])} headers={['Period', 'Big Thing', 'Done']} />
        </Section>
      )}
    </div>
  );
}

function Section({ title, score, children }: { title: string; score: number; children: React.ReactNode }) {
  return (
    <div className="border border-foreground/20 rounded p-2">
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-[10px] font-semibold uppercase tracking-wide text-foreground">{title}</h2>
        <span className="text-xs font-bold tabular-nums">{score}%</span>
      </div>
      {children}
    </div>
  );
}

function CompactTable({ headers, rows }: { headers: string[]; rows: (string | null | undefined)[][] }) {
  return (
    <table className="w-full text-xs">
      <thead>
        <tr className="border-b border-foreground/10">
          {headers.map((h) => (
            <th key={h} className="text-left pb-0.5 pr-3 text-foreground font-medium text-[9px] last:text-right last:pr-0">{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, i) => (
          <tr key={i} className="border-b border-foreground/5 last:border-0">
            {row.map((cell, j) => (
              <td key={j} className={`py-0.5 pr-3 last:pr-0 last:text-right ${j === 0 ? 'text-foreground' : 'text-foreground'}`}>{cell}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
