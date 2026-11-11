// Achievement conditions. Pure: given saved data and the event that just happened, which are met.
import { ACHIEVEMENTS, MATS, BEANS, RIVALS } from './content.js';

// event: { type: 'throw', steps } | { type: 'capture', count } | { type: 'sun', count } (counts so far
// this match, by the player) | { type: 'game', won, lost, variant } when a match against the computer ends.
const CONDITIONS = {
  apprentice: d => !!d.practiceDone,
  firstwin: d => (d.stats?.won || 0) > 0,
  ten: (d, e) => e?.type === 'throw' && e.steps === 10,
  hunter: (d, e) => e?.type === 'capture' && e.count >= 3,
  sunrunner: (d, e) => e?.type === 'sun' && e.count >= 3,
  untouched: (d, e) => e?.type === 'game' && e.won && e.lost === 0,
  highroller: (d, e) => e?.type === 'game' && e.won && e.variant === 'stakes',
  court: d => (d.stars?.[RIVALS.length - 1] || 0) > 0,
};

export function earned(d, event) {
  return ACHIEVEMENTS.filter(a => !d.achievements?.[a.id] && CONDITIONS[a.id](d, event)).map(a => a.id);
}

export function reward(id) {
  for (const [kind, table] of [['mat', MATS], ['beans', BEANS]])
    for (const [key, item] of Object.entries(table)) if (item.unlock === id) return { kind, key, name: item.name };
  return null;
}
