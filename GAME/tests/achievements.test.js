import { test } from 'node:test';
import assert from 'node:assert/strict';
import { earned, reward } from '../achievements.js';
import { ACHIEVEMENTS } from '../content.js';

test('every achievement unlocks a board or stone set', () => {
  for (const a of ACHIEVEMENTS) assert.ok(reward(a.id), a.id);
});

test('a fresh player has earned nothing', () => {
  assert.deepEqual(earned({ stars: [], drills: [], stats: { won: 0 }, achievements: {} }), []);
});

test('progress already saved counts, and nothing is earned twice', () => {
  const d = { lessonsDone: true, stars: [3, 3, 3, 3, 3, 3], stats: { won: 6 }, drills: [], achievements: {} };
  assert.deepEqual(earned(d).sort(), ['ballcourt', 'halfway', 'stars18', 'tutorial', 'victory']);
  d.achievements = { tutorial: 1 };
  assert.ok(!earned(d).includes('tutorial'));
});

test('event achievements need their event', () => {
  const d = { stars: [], stats: { won: 1 }, drills: [], achievements: { victory: 1 } };
  assert.deepEqual(earned(d, { type: 'capture', loops: 3 }), ['longway']);
  assert.deepEqual(earned(d, { type: 'capture', loops: 2 }), []);
  assert.deepEqual(earned(d, { type: 'game', won: true, left: 10, opponent: null, level: 4 }).sort(), ['master', 'untouchable']);
  assert.deepEqual(earned(d, { type: 'game', won: true, left: 10, opponent: 7, level: 4 }), ['untouchable']);
});

test('Regicide needs a win by capturing the king', () => {
  const d = { stars: [], stats: { won: 1 }, drills: [], achievements: { victory: 1 } };
  assert.deepEqual(earned(d, { type: 'game', won: true, left: 3, opponent: null, level: 1, reason: 'king' }), ['regicide']);
  assert.deepEqual(earned(d, { type: 'game', won: true, left: 3, opponent: null, level: 1, reason: 'all' }), []);
});
