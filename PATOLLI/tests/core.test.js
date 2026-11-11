import { test } from 'node:test';
import assert from 'node:assert/strict';
import { P1, P2, LAP, TRACK, KIND, ENTRY, newGame, throwBeans, applyThrow, applyMove, legalMoves, winner, square } from '../core.js';

const at = (s, turn, steps) => ({ ...s, turn, phase: 'move', steps });

test('the track is one loop of neighbouring squares', () => {
  for (let i = 0; i < LAP; i++) {
    const [a, b] = [TRACK[i], TRACK[(i + 1) % LAP]];
    assert.equal(Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]), 1, `squares ${i} and ${i + 1}`);
  }
});

test('players enter at opposite temples', () => {
  assert.equal(KIND[ENTRY[P1]], 'temple');
  assert.equal(KIND[ENTRY[P2]], 'temple');
  assert.equal((ENTRY[P2] - ENTRY[P1] + LAP) % LAP, LAP / 2);
});

test('beans: five marks move ten, none moves nothing', () => {
  assert.equal(throwBeans(() => 0).steps, 10);
  assert.equal(throwBeans(() => 0.9).steps, 0);
});

test('a silent throw passes the turn', () => {
  const { state } = applyThrow(newGame(), { beans: Array(5).fill(false), steps: 0 });
  assert.equal(state.turn, P2);
});

test('only one stone enters per throw, and a stone may not land on its own side', () => {
  let s = at(newGame(), P1, 2);
  assert.equal(legalMoves(s).length, 1);
  s = applyMove(s, legalMoves(s)[0]).state;
  assert.equal(s.stones[P1][0], 2);
  s = at(s, P1, 2);
  assert.deepEqual(legalMoves(s).map(m => [m.from, m.to]), [[2, 4]]);
});

test('landing on an enemy captures it and takes a bead', () => {
  const s = newGame();
  s.stones[P1][0] = 3;
  const target = square(P1, 5);
  s.stones[P2][0] = (target - 18 + LAP) % LAP + 1;
  assert.equal(square(P2, s.stones[P2][0]), target);
  const m = legalMoves(at(s, P1, 2)).find(x => x.from === 3);
  assert.ok(m.capture);
  const { state, events } = applyMove(at(s, P1, 2), m);
  assert.equal(state.stones[P2][0], 0);
  assert.deepEqual([state.beads[P1], state.beads[P2]], [7, 5]);
  assert.equal(events[0].type, 'capture');
});

test('a sun gives another throw, a skull costs a bead', () => {
  let { state, events } = applyMove(at(newGame(), P1, 4), { index: 0, from: 0, to: 5, home: false, capture: null });
  assert.equal(KIND[square(P1, 5)], 'sun');
  assert.deepEqual([events.includes('sun'), state.turn], [true, P1]);
  ({ state, events } = applyMove(at(newGame(), P1, 4), { index: 0, from: 4, to: 8, home: false, capture: null }));
  assert.equal(events[0].type, 'skull');
  assert.deepEqual([state.beads[P1], state.beads[P2], state.turn], [5, 7, P2]);
});

test('passing the entry again brings a stone home; all home wins', () => {
  const s = newGame();
  s.stones[P1] = [LAP + 1, LAP + 1, 34];
  const { state, events } = applyMove(at(s, P1, 3), legalMoves(at(s, P1, 3))[0]);
  assert.equal(events[0].type, 'home');
  assert.deepEqual(winner(state), { winner: P1, reason: 'home' });
  assert.equal(state.phase, 'over');
});

test('running out of beads loses', () => {
  const s = newGame();
  s.beads[P2] = 0;
  assert.deepEqual(winner(s), { winner: P1, reason: 'broke' });
});
