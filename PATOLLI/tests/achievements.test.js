import { test } from 'node:test';
import assert from 'node:assert/strict';
import { earned, reward } from '../achievements.js';
import { ACHIEVEMENTS } from '../content.js';

test('every achievement unlocks one mat or bean set', () => {
  for (const a of ACHIEVEMENTS) assert.ok(reward(a.id), a.id);
});

test('events earn their achievements once', () => {
  const d = { stats: { won: 0 }, stars: [], achievements: {} };
  assert.deepEqual(earned(d, { type: 'throw', steps: 10 }), ['ten']);
  assert.deepEqual(earned(d, { type: 'capture', count: 2 }), []);
  assert.deepEqual(earned(d, { type: 'game', won: true, lost: 0, variant: 'stakes' }).sort(), ['highroller', 'untouched']);
  d.achievements.ten = 1;
  assert.deepEqual(earned(d, { type: 'throw', steps: 10 }), []);
});
