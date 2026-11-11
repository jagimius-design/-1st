// Computer opponent and coach advice. Every turn is one throw and one choice of stone, so the AI
// scores each legal move: progress, captures, suns, skulls, and the chance that the enemy's next
// throw lands on each exposed stone.
import { LAP, KIND, STEP_ODDS, other, square, onBoard, legalMoves, applyMove } from './core.js';

// noise: random points added per move (a stone's full lap is worth ~36); risk: weight on danger.
export const LEVELS = [
  { name: 'Easy', noise: 14, risk: 0.3 },
  { name: 'Medium', noise: 5, risk: 0.8 },
  { name: 'Hard', noise: 0, risk: 1 },
];
export const resolveLevel = l => (typeof l === 'number' ? LEVELS[l] : l);

const BEAD = 9; // a jade bead is worth about this many squares of progress

// Chance that `pl`'s stone on track square `sq` is hit by the opponent's next throw.
export function danger(state, pl, sq) {
  if (KIND[sq] === 'temple') return 0;
  const op = other(pl);
  let miss = 1;
  const hits = new Set();
  state.stones[op].forEach(p => {
    if (p > LAP) return;
    for (const d of [1, 2, 3, 4, 10]) {
      const to = p + d;
      if (to <= LAP && square(op, to) === sq) hits.add(d);
    }
  });
  for (const d of hits) miss *= 1 - STEP_ODDS[d];
  return 1 - miss;
}

function exposure(state, pl) {
  let total = 0;
  state.stones[pl].forEach(p => { if (onBoard(p)) total += danger(state, pl, square(pl, p)) * (p + BEAD); });
  return total;
}

// How good `move` is for the side to move, in squares of progress.
export function score(state, move, L = LEVELS[2]) {
  const me = state.turn, { state: after, events } = applyMove(state, move);
  let v = Math.min(move.to, LAP + 1) - move.from;
  for (const e of events) {
    if (e === 'sun') v += 7;
    else if (e.type === 'capture') v += move.capture && state.stones[other(me)][move.capture.index] + e.beads * BEAD;
    else if (e.type === 'home') v += 6 + e.beads * BEAD;
    else if (e.type === 'skull') v -= e.beads * BEAD + 2;
  }
  if (after.phase === 'over') v += 1000;
  // after.turn may still be me (sun); exposure is judged against the enemy's next throw either way.
  v -= L.risk * (exposure({ ...after, turn: me }, me) - exposure({ ...state, turn: me }, me));
  return v;
}

export function chooseMove(state, level, random = Math.random) {
  const L = resolveLevel(level), moves = legalMoves(state);
  let best = null, bestV = -Infinity;
  for (const m of moves) {
    const v = score(state, m, L) + random() * L.noise;
    if (v > bestV) { bestV = v; best = m; }
  }
  return best;
}

// The best move by the Hard evaluation, and why, for the coach.
export function advise(state) {
  const moves = legalMoves(state);
  if (!moves.length) return null;
  const ranked = moves.map(m => ({ m, v: score(state, m) })).sort((a, b) => b.v - a.v);
  const { m } = ranked[0], me = state.turn;
  const { events } = applyMove(state, m);
  const has = t => events.some(e => e === t || e.type === t);
  let why;
  if (has('capture')) why = 'capture';
  else if (has('home')) why = 'home';
  else if (has('sun')) why = 'sun';
  else if (m.from && danger(state, me, square(me, m.from)) > 0.25) why = 'escape';
  else if (moves.some(o => applyMove(state, o).events.some(e => e.type === 'skull')) && !has('skull')) why = 'skull';
  else why = 'progress';
  return { move: m, why, choices: moves.length };
}
