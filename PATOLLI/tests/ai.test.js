import { test } from 'node:test';
import assert from 'node:assert/strict';
import { P1, P2, LAP, newGame, legalMoves, square } from '../core.js';
import { chooseMove, advise, danger } from '../ai.js';

test('Hard takes a capture when it is offered', () => {
  const s = { ...newGame(), phase: 'move', steps: 2 };
  s.stones[P1] = [3, 0, 0];
  s.stones[P2][0] = (square(P1, 5) - 18 + LAP) % LAP + 1;
  const m = chooseMove(s, 2);
  assert.ok(m.capture);
  assert.equal(advise(s).why, 'capture');
});

test('a stone just ahead of an enemy is in danger; a temple never is', () => {
  const s = newGame();
  s.stones[P2][0] = (square(P1, 6) - 18 + LAP) % LAP + 1; // enemy 2 behind P1's square 8
  assert.ok(danger(s, P1, square(P1, 8)) > 0.25);
  assert.equal(danger(s, P1, square(P1, 1)), 0);
});

test('Hard avoids a skull when another move is as good', () => {
  const s = { ...newGame(), phase: 'move', steps: 4 };
  s.stones[P1] = [4, 12, 0];
  const m = chooseMove(s, 2);
  assert.notEqual(m.to, 8);
});

test('games between computer levels finish', () => {
  // imported lazily to keep this file about the AI
  return import('./sim.js').then(({ play }) => {
    for (let i = 0; i < 20; i++) assert.ok(play(2, 0).winner);
  });
});
