import { test } from 'node:test';
import assert from 'node:assert/strict';
import { P1, P2, CIRCUITS, QUIET_LIMIT, sqOf, newGame, fromLayout, capturesFrom, movesFrom,
  legalMoves, applyMove, outcome, stateMovesFrom } from '../core.js';

test('each circuit has 24 stops over 20 points, its 4 crossings visited twice', () => {
  for (const c of CIRCUITS) {
    assert.equal(c.length, 24);
    assert.equal(new Set(c).size, 20);
  }
});

test('opening position has twelve stones each and only step moves', () => {
  const s = newGame();
  assert.deepEqual(s.counts, [0, 12, 12]);
  const moves = legalMoves(s.board, P1);
  assert.ok(moves.length > 0 && moves.every(m => !m.capture));
});

test('a capture rides a loop', () => {
  const s = fromLayout(['......', '...o..', '......', '......', '......', '.x....']);
  const caps = capturesFrom(s.board, sqOf(5, 1), P1, true);
  assert.equal(caps.length, 1);
  assert.equal(caps[0].to, sqOf(1, 3));
  assert.ok(caps[0].path.loops.includes(true));
  assert.equal(caps[0].path.squares.at(-1), sqOf(1, 3));
});

test('a straight shot is not a capture, the long way round is', () => {
  const s = fromLayout(['......', '......', 'x...o.', '......', '......', '......']);
  const caps = capturesFrom(s.board, sqOf(2, 0), P1, true);
  assert.equal(caps.length, 1);
  assert.equal(caps[0].path.loops.filter(Boolean).length, 4);
});

test('a path may pass back over the starting point', () => {
  // From (1,1) up column 1, round the top-left loop and along row 1 through (1,1) again.
  const s = fromLayout(['......', '.x..o.', '......', '......', '......', '......']);
  const to = movesFrom(s.board, sqOf(1, 1), P1, true).filter(m => m.capture).map(m => m.to);
  assert.deepEqual(to, [sqOf(1, 4)]);
});

test('own stones block both ways round', () => {
  const s = fromLayout(['......', '...o..', '......', '.x....', '...x..', '.x....']);
  assert.equal(capturesFrom(s.board, sqOf(5, 1), P1).length, 0);
});

test('corners are on no circuit, so cannot capture or be captured', () => {
  const s = fromLayout(['o.....', '......', '......', '......', '......', '.....x']);
  assert.equal(capturesFrom(s.board, sqOf(5, 5), P1).length, 0);
});

test('applying a capture removes a stone and resets the quiet count', () => {
  let s = fromLayout(['......', '...o..', '......', '......', '......', '.x....']);
  s = { ...s, quiet: 7 };
  const [cap] = capturesFrom(s.board, sqOf(5, 1), P1);
  const t = applyMove(s, cap);
  assert.deepEqual([t.counts[P2], t.quiet, t.turn, t.board[sqOf(1, 3)]], [0, 0, P2, P1]);
  assert.deepEqual(outcome(t), { winner: P1, reason: 'all' });
});

test('after the quiet limit the side with more stones wins', () => {
  const s = { ...fromLayout(['o.....', '......', '......', '......', '......', 'x....x']), quiet: QUIET_LIMIT };
  assert.deepEqual(outcome(s), { winner: P1, reason: 'quiet' });
});

test('Jaguar King: capturing the king wins at once', () => {
  let s = { ...fromLayout(['......', '...o..', '......', '......', '......', '.x....']), variant: 'king', kings: [0, sqOf(5, 1), sqOf(1, 3)] };
  s = { ...s, board: s.board, counts: [0, 1, 1] };
  const [cap] = capturesFrom(s.board, sqOf(5, 1), P1);
  const t = applyMove(s, cap);
  assert.deepEqual(outcome(t), { winner: P1, reason: 'king' });
  assert.equal(t.kings[P1], sqOf(1, 3));
});

test('Jaguar King: a king may not step into a corner', () => {
  const s = { ...fromLayout(['......', '......', '......', '......', '...o..', 'x.x...']), variant: 'king', kings: [0, sqOf(5, 2), sqOf(4, 3)] };
  const moved = { ...s, board: (() => { const b = s.board.slice(); b[sqOf(5, 2)] = 0; b[sqOf(5, 1)] = P1; return b; })(), kings: [0, sqOf(5, 1), sqOf(4, 3)] };
  assert.ok(!stateMovesFrom(moved, sqOf(5, 1)).some(m => m.to === sqOf(5, 0)));
  assert.ok(stateMovesFrom(moved, sqOf(5, 1)).length > 0);
});

test('variants start with the right stones', () => {
  assert.deepEqual(newGame('skirmish').counts, [0, 6, 6]);
  const k = newGame('king');
  assert.equal(k.board[k.kings[P1]], P1);
  assert.equal(k.board[k.kings[P2]], P2);
});
