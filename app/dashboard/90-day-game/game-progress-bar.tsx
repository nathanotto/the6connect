/**
 * GameProgressBar
 *
 * Full-width timeline bar for an active 90-day game.
 * Shows today's position and biweekly OBT period markers.
 * Server component — positions computed from dates, no JS needed.
 */

interface GameProgressBarProps {
  startDate: string; // ISO date string
  endDate: string;
}

export function GameProgressBar({ startDate, endDate }: GameProgressBarProps) {
  const start = new Date(startDate).getTime();
  const end = new Date(endDate).getTime();
  const today = Date.now();

  const totalDuration = end - start;
  const elapsed = Math.max(0, Math.min(today - start, totalDuration));
  const todayPct = (elapsed / totalDuration) * 100;

  // Biweekly period boundaries (after period 1, 2, 3, 4, 5 — 5 markers for 6 periods)
  const markers: { pct: number; label: string }[] = [];
  for (let i = 1; i <= 5; i++) {
    const markerDate = new Date(startDate);
    markerDate.setDate(markerDate.getDate() + i * 14);
    const markerPct = ((markerDate.getTime() - start) / totalDuration) * 100;
    const label = markerDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      timeZone: 'UTC',
    });
    markers.push({ pct: markerPct, label });
  }

  const startLabel = new Date(startDate).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  });
  const endLabel = new Date(endDate).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  });

  const isPast = today > end;

  return (
    <div className="w-full">
      {/* Track */}
      <div className="relative h-3 bg-foreground/10 rounded-full overflow-visible">
        {/* Fill */}
        <div
          className="absolute inset-y-0 left-0 bg-foreground/40 rounded-full"
          style={{ width: `${Math.min(todayPct, 100)}%` }}
        />

        {/* Period boundary markers */}
        {markers.map((m) => (
          <div
            key={m.pct}
            className="absolute inset-y-0 w-px bg-foreground/20"
            style={{ left: `${m.pct}%` }}
          />
        ))}

        {/* Today marker */}
        {!isPast && (
          <div
            className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white border-2 border-foreground z-10"
            style={{ left: `${todayPct}%`, transform: 'translate(-50%, -50%)' }}
          />
        )}
      </div>

      {/* Labels row */}
      <div className="relative mt-1.5 text-xs text-foreground/50" style={{ height: '1.2rem' }}>
        {/* Start */}
        <span className="absolute left-0">{startLabel}</span>

        {/* Period boundary labels */}
        {markers.map((m) => (
          <span
            key={m.pct}
            className="absolute -translate-x-1/2"
            style={{ left: `${m.pct}%` }}
          >
            {m.label}
          </span>
        ))}

        {/* End */}
        <span className="absolute right-0">{endLabel}</span>

        {/* Today label */}
        {!isPast && todayPct > 5 && todayPct < 95 && (
          <span
            className="absolute -translate-x-1/2 text-foreground/80 font-medium"
            style={{ left: `${todayPct}%` }}
          >
            Today
          </span>
        )}
      </div>
    </div>
  );
}
