// Rules of Patolli as played in Court of Fortune. Pure functions; randomness comes in as a
// function so games can be replayed and tested.
//
// The board is a cross on a 10x10 grid: a 2x2 centre and four arms two squares wide and four long.
// The track runs out along one lane of an arm, back along the other, through a centre square and on
// to the next arm: 36 squares in a loop. Each player enters at their own centre square and races a
// full lap; a stone that passes its entry square again is home.

export const P1 = 1, P2 = 2;
export const other = p => 3 - p;
export const LAP = 36;

function buildTrack() {
  const t = [];
  t.push([5, 4]);
  for (let r = 6; r <= 9; r++) t.push([r, 4]);
  for (let r = 9; r >= 6; r--) t.push([r, 5]);
  t.push([5, 5]);
  for (let c = 6; c <= 9; c++) t.push([5, c]);
  for (let c = 9; c >= 6; c--) t.push([4, c]);
  t.push([4, 5]);
  for (let r = 3; r >= 0; r--) t.push([r, 5]);
  for (let r = 0; r <= 3; r++) t.push([r, 4]);
  t.push([4, 4]);
  for (let c = 3; c >= 0; c--) t.push([4, c]);
  for (let c = 0; c <= 3; c++) t.push([5, c]);
  return t;
}
export const TRACK = buildTrack(); // [row, col] per track index
export const ENTRY = { [P1]: 0, [P2]: 18 };

// Square kinds by track index. Each arm segment starts at its centre square ci (0, 9, 18, 27):
// ci is a temple (safe), ci+4 the sun at the arm's far end (throw again), ci+7 a skull (pay a bead).
export const KIND = TRACK.map((_, i) => {
  const k = i % 9;
  return k === 0 ? 'temple' : k === 4 ? 'sun' : k === 7 ? 'skull' : 'plain';
});

// Rule sets. stones: per player; beads: starting jade; capture/skull/home: beads moved by each event.
export const VARIANTS = {
  classic: { stones: 3, beads: 6, capture: 1, skull: 1, home: 1 },
  stakes: { stones: 3, beads: 4, capture: 2, skull: 2, home: 2 },
  long: { stones: 4, beads: 8, capture: 1, skull: 1, home: 1 },
};

export function newGame(variant = 'classic', first = P1) {
  const v = VARIANTS[variant];
  return {
    variant, turn: first, phase: 'throw', steps: 0, beans: null, ply: 0,
    stones: { [P1]: Array(v.stones).fill(0), [P2]: Array(v.stones).fill(0) },
    beads: [0, v.beads, v.beads],
  };
}

// progress p: 0 in hand, 1..LAP on the board (1 = entry square), > LAP home.
export const square = (player, p) => (ENTRY[player] + p - 1) % LAP;
export const onBoard = p => p >= 1 && p <= LAP;

// Five beans, each marked on one side. Marks 1-4 move that many squares, all five move 10,
// none moves nothing.
export const STEPS = [0, 1, 2, 3, 4, 10];
export function throwBeans(random = Math.random) {
  const beans = Array.from({ length: 5 }, () => random() < 0.5);
  return { beans, steps: STEPS[beans.filter(Boolean).length] };
}
// Probability of each step count, for the computer's risk sums.
export const STEP_ODDS = { 0: 1 / 32, 1: 5 / 32, 2: 10 / 32, 3: 10 / 32, 4: 5 / 32, 10: 1 / 32 };

function occupant(state, sq) {
  for (const pl of [P1, P2]) {
    const i = state.stones[pl].findIndex(p => onBoard(p) && square(pl, p) === sq);
    if (i >= 0) return { player: pl, index: i };
  }
  return null;
}

// Legal moves for the side to move with `steps`. A stone may not land on its own side's stone, nor on
// an enemy in a temple; landing on any other enemy captures it. One move enters a stone from hand.
export function legalMoves(state, steps = state.steps) {
  if (!steps) return [];
  const me = state.turn, out = [];
  let entered = false;
  state.stones[me].forEach((p, index) => {
    if (p > LAP || (p === 0 && entered)) return;
    if (p === 0) entered = true;
    const to = p + steps;
    if (to > LAP) return out.push({ index, from: p, to, home: true, capture: null });
    const sq = square(me, to), occ = occupant(state, sq);
    if (occ && occ.player === me) return;
    if (occ && KIND[sq] === 'temple') return;
    out.push({ index, from: p, to, home: false, capture: occ });
  });
  return out;
}

const pay = (beads, from, to, n) => {
  const amount = Math.min(n, beads[from]);
  beads[from] -= amount;
  beads[to] += amount;
  return amount;
};

// Applies a throw result: sets steps and, with nothing to move, passes the turn.
export function applyThrow(state, { beans, steps }) {
  const s = { ...state, beans, steps, phase: 'move' };
  if (!steps || legalMoves(s, steps).length === 0) return { state: endTurn(s, false), events: [steps ? 'blocked' : 'silent'] };
  return { state: s, events: [] };
}

// Applies a move. events lists what happened, in order, for sound, speech and the coach.
export function applyMove(state, move) {
  const me = state.turn, op = other(me), v = VARIANTS[state.variant];
  const stones = { [P1]: state.stones[P1].slice(), [P2]: state.stones[P2].slice() };
  const beads = state.beads.slice(), events = [];
  stones[me][move.index] = move.to;
  if (move.from === 0) events.push('enter');
  if (move.capture) {
    stones[op][move.capture.index] = 0;
    events.push({ type: 'capture', beads: pay(beads, op, me, v.capture) });
  }
  let again = false;
  if (move.home) events.push({ type: 'home', beads: pay(beads, op, me, v.home) });
  else {
    const kind = KIND[square(me, move.to)];
    if (kind === 'sun') { again = true; events.push('sun'); }
    if (kind === 'skull') events.push({ type: 'skull', beads: pay(beads, me, op, v.skull) });
  }
  const s = { ...state, stones, beads, ply: state.ply + 1 };
  return { state: winner(s) ? { ...s, phase: 'over' } : endTurn(s, again), events };
}

function endTurn(s, again) {
  return { ...s, turn: again ? s.turn : other(s.turn), phase: 'throw', steps: 0 };
}

// null while the game goes on, else { winner, reason: 'home' | 'broke' }.
export function winner(s) {
  for (const pl of [P1, P2]) if (s.stones[pl].every(p => p > LAP)) return { winner: pl, reason: 'home' };
  for (const pl of [P1, P2]) if (s.beads[pl] <= 0) return { winner: other(pl), reason: 'broke' };
  return null;
}

export const home = (s, pl) => s.stones[pl].filter(p => p > LAP).length;
export const inHand = (s, pl) => s.stones[pl].filter(p => p === 0).length;
