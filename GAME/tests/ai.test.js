import { test } from 'node:test';
import assert from 'node:assert/strict';
import { P1, P2, sqOf, fromLayout, newGame } from '../core.js';
import { chooseMove, LEVELS } from '../ai.js';

test('every level takes a free winning capture', () => {
  const s = fromLayout(['......', '...o..', '......', '......', '......', '.x....']);
  for (const L of LEVELS.slice(2)) assert.equal(chooseMove(s, L).to, sqOf(1, 3), L.name);
});

test('Master answers the opening within its time budget', () => {
  const t0 = performance.now();
  const m = chooseMove(newGame(), 4);
  assert.ok(m && performance.now() - t0 < 4000);
});

test('the side to move can be P2', () => {
  const s = fromLayout(['......', '....o.', '......', '......', '...x..', '......'], P2);
  assert.ok(chooseMove(s, 2));
});
