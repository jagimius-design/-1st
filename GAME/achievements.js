// Achievement conditions. Pure: given saved data and the event that just happened, which are met.
import { ACHIEVEMENTS, DRILLS, OPPONENTS, THEMES, STONES } from './content.js';

const stars = d => (d.stars || []).reduce((a, b) => a + (b || 0), 0);
const beat = (d, i) => (d.stars?.[i] || 0) > 0;

// event: { type: 'capture', loops } for a capture by the player,
// { type: 'game', won, left, level, opponent } when a game against the computer ends; or none.
const CONDITIONS = {
  tutorial: d => !!d.lessonsDone,
  student: d => DRILLS.every((_, i) => d.drills?.[i]),
  victory: d => (d.stats?.won || 0) > 0,
  longway: (d, e) => e?.type === 'capture' && e.loops >= 3,
  untouchable: (d, e) => e?.type === 'game' && e.won && e.left >= 10,
  halfway: d => beat(d, 3),
  ballcourt: d => beat(d, 5),
  summit: d => beat(d, OPPONENTS.length - 1),
  stars18: d => stars(d) >= 18,
  perfect: d => OPPONENTS.every((_, i) => d.stars?.[i] === 3),
  master: (d, e) => e?.type === 'game' && e.won && e.opponent === null && e.level === 4,
};

// Ids of achievements newly earned (not already in d.achievements).
export function earned(d, event) {
  return ACHIEVEMENTS.filter(a => !d.achievements?.[a.id] && CONDITIONS[a.id](d, event)).map(a => a.id);
}

// The board or stone set an achievement unlocks: { kind: 'board' | 'stones', key, name }.
export function reward(id) {
  for (const [kind, table] of [['board', THEMES], ['stones', STONES]])
    for (const [key, item] of Object.entries(table)) if (item.unlock === id) return { kind, key, name: item.name };
  return null;
}
