'use client';

import { useEffect, useState } from 'react';

export function ActivitySummary() {
  const [newCheckins, setNewCheckins] = useState<number | null>(null);
  const [newPhotos, setNewPhotos] = useState<number | null>(null);
  const [daysSinceGame, setDaysSinceGame] = useState<number | null>(null);
  const [gameName, setGameName] = useState<string | null>(null);

  useEffect(() => {
    const checkinsLastViewed = localStorage.getItem('checkins_last_viewed');
    const photosLastViewed = localStorage.getItem('photos_last_viewed');
    const gameLastVisited = localStorage.getItem('game_page_last_visited');
    const storedGameName = localStorage.getItem('game_current_name');

    if (storedGameName) setGameName(storedGameName);

    if (gameLastVisited) {
      const days = Math.floor((Date.now() - new Date(gameLastVisited).getTime()) / 86400000);
      setDaysSinceGame(days);
    }

    const params = new URLSearchParams();
    if (checkinsLastViewed) params.set('checkinsLastViewed', checkinsLastViewed);
    if (photosLastViewed) params.set('photosLastViewed', photosLastViewed);

    fetch(`/api/dashboard/activity-counts?${params}`)
      .then((r) => r.json())
      .then((data) => {
        setNewCheckins(data.newCheckins ?? 0);
        setNewPhotos(data.newPhotos ?? 0);
      })
      .catch(() => {});
  }, []);

  const parts: string[] = [];
  if (newCheckins !== null && newCheckins > 0)
    parts.push(`${newCheckins} new check-in${newCheckins !== 1 ? 's' : ''}`);
  if (newPhotos !== null && newPhotos > 0)
    parts.push(`${newPhotos} new photo${newPhotos !== 1 ? 's' : ''}`);

  const hasGameData = daysSinceGame !== null && gameName;
  if (parts.length === 0 && !hasGameData) return null;

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm px-3 py-2 border border-foreground/10 bg-foreground/5 rounded-lg">
      {parts.map((part, i) => (
        <span key={i} className="font-medium">
          {part}
        </span>
      ))}
      {hasGameData && (
        <span className={daysSinceGame! >= 5 ? 'text-red-500 font-medium' : 'text-foreground/60'}>
          {daysSinceGame} day{daysSinceGame !== 1 ? 's' : ''} since you visited &ldquo;{gameName}&rdquo;
        </span>
      )}
    </div>
  );
}
