import { test } from 'node:test';
import assert from 'node:assert/strict';
import { P1, fromLayout, legalMoves, newGame } from '../core.js';
import { meetsGoal, coachTip } from '../coach.js';
import { DRILLS } from '../content.js';

test('every Beginner\'s Path puzzle has a solution and a wrong answer', () => {
  for (const d of DRILLS) {
    const s = { ...fromLayout(d.layout), quiet: d.quiet || 0 };
    const results = legalMoves(s.board, P1).map(m => meetsGoal(d.goal, s, m));
    assert.ok(results.includes(true), `${d.title}: no solution`);
    assert.ok(results.includes(false), `${d.title}: no wrong answer`);
  }
});

test('the coach points out a free capture', () => {
  const s = fromLayout(['......', '...o..', '......', '......', '......', '.x....']);
  assert.equal(coachTip(s, P1).kind, 'good');
});

test('after losing a stone the coach explains why', () => {
  assert.equal(coachTip(newGame(), P1, true).kind, 'warn');
});

test('in a quiet opening the coach gives a general tip', () => {
  assert.equal(coachTip(newGame(), P1).kind, 'tip');
});
