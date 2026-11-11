// Computer opponent: negamax with alpha-beta, capture-only quiescence and iterative deepening.
import { QUIET_LIMIT, other, legalMoves, capturesFrom, applyMove, attackedBy } from './core.js';

// noise: random points added to each root move's score (100 = one stone), so weak levels blunder.
export const LEVELS = [
  { name: 'Beginner', depth: 1, noise: 140, quiesce: false },
  { name: 'Easy', depth: 2, noise: 60, quiesce: false },
  { name: 'Medium', depth: 2, noise: 15, quiesce: true },
  { name: 'Hard', depth: 4, noise: 4, quiesce: true, time: 1500 },
  { name: 'Master', depth: 12, noise: 0, quiesce: true, time: 2500 },
];

const WIN = 100000;
const TIMEOUT = Symbol('timeout');

export function resolveLevel(level) {
  return typeof level === 'number' ? LEVELS[level] : level;
}

function evaluate(s) {
  const me = s.turn, op = other(me);
  const mine = attackedBy(s.board, me).size, theirs = attackedBy(s.board, op).size;
  return 100 * (s.counts[me] - s.counts[op]) + 10 * mine - 14 * theirs;
}

function terminal(s, ply) {
  if (s.counts[s.turn] === 0) return -WIN + ply;
  if (s.counts[other(s.turn)] === 0) return WIN - ply;
  if (s.quiet >= QUIET_LIMIT) {
    const d = s.counts[s.turn] - s.counts[other(s.turn)];
    return d === 0 ? 0 : Math.sign(d) * (WIN / 2 - ply);
  }
  return null;
}

export function chooseMove(state, level, random = Math.random) {
  const L = resolveLevel(level);
  const deadline = performance.now() + (L.time ?? 4000);
  let nodes = 0;

  function tick() {
    if ((++nodes & 1023) === 0 && performance.now() > deadline) throw TIMEOUT;
  }

  function quiesce(s, alpha, beta, ply, qd) {
    tick();
    const t = terminal(s, ply);
    if (t !== null) return t;
    const stand = evaluate(s);
    if (stand >= beta || qd === 0) return stand;
    if (stand > alpha) alpha = stand;
    const caps = [];
    for (let sq = 0; sq < 36; sq++) if (s.board[sq] === s.turn) capturesFrom(s.board, sq, s.turn, false, caps);
    for (const m of caps) {
      const v = -quiesce(applyMove(s, m), -beta, -alpha, ply + 1, qd - 1);
      if (v >= beta) return v;
      if (v > alpha) alpha = v;
    }
    return alpha;
  }

  function search(s, depth, alpha, beta, ply) {
    tick();
    const t = terminal(s, ply);
    if (t !== null) return t;
    if (depth === 0) return L.quiesce ? quiesce(s, alpha, beta, ply, 6) : evaluate(s);
    const moves = legalMoves(s.board, s.turn);
    if (moves.length === 0) return -WIN + ply;
    let best = -Infinity;
    for (const m of moves) {
      const v = -search(applyMove(s, m), depth - 1, -beta, -alpha, ply + 1);
      if (v > best) best = v;
      if (v > alpha) alpha = v;
      if (alpha >= beta) break;
    }
    return best;
  }

  let moves = legalMoves(state.board, state.turn);
  if (moves.length <= 1) return strip(moves[0]);
  let scored = moves.map(m => ({ m, v: 0 }));

  for (let depth = 1; depth <= L.depth; depth++) {
    try {
      const next = [];
      let alpha = -Infinity;
      for (const { m } of scored) {
        // Noisy levels need a true score for every root move; exact play only needs the best.
        const a = L.noise > 0 ? -Infinity : alpha;
        const v = -search(applyMove(state, m), depth - 1, -Infinity, -a, 1);
        next.push({ m, v });
        if (v > alpha) alpha = v;
      }
      scored = next.sort((x, y) => y.v - x.v); // best first for the next iteration
      if (scored[0].v > WIN / 2) break; // forced win found
    } catch (e) {
      if (e !== TIMEOUT) throw e;
      break;
    }
  }

  let pick = scored[0], bestNoisy = -Infinity;
  if (L.noise > 0) for (const c of scored) {
    const v = c.v + random() * L.noise;
    if (v > bestNoisy) { bestNoisy = v; pick = c; }
  }
  return strip(pick.m);
}

const strip = m => m && { from: m.from, to: m.to, capture: m.capture };
