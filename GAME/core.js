// Rules of Surakarta. Squares are 0..35, row-major; row 0 is the top (P2's home rows 0-1,
// P1's home rows 4-5). Pure functions, loadable by browser, worker and Node.

export const P1 = 1, P2 = 2;
export const QUIET_LIMIT = 50; // plies without a capture before the game is decided on stones
export const other = p => 3 - p;
export const row = sq => (sq / 6) | 0;
export const col = sq => sq % 6;
export const sqOf = (r, c) => r * 6 + c;

// A circuit is the closed 24-point track made of rows a and 5-a and columns a and 5-a, joined
// by the corner loops. A loop is crossed between index i and i+1 whenever i % 6 === 5.
function circuit(a) {
  const b = 5 - a, pts = [];
  for (let c = 0; c < 6; c++) pts.push(sqOf(a, c));
  for (let r = 0; r < 6; r++) pts.push(sqOf(r, b));
  for (let c = 5; c >= 0; c--) pts.push(sqOf(b, c));
  for (let r = 5; r >= 0; r--) pts.push(sqOf(r, a));
  return pts;
}
export const CIRCUITS = [circuit(1), circuit(2)]; // inner (small loops), outer (large loops)

const ON = Array.from({ length: 36 }, () => []);
CIRCUITS.forEach((ci, i) => ci.forEach((sq, k) => ON[sq].push(i, k)));

const NEIGHBOURS = Array.from({ length: 36 }, (_, sq) => {
  const out = [];
  for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) {
    const r = row(sq) + dr, c = col(sq) + dc;
    if ((dr || dc) && r >= 0 && r < 6 && c >= 0 && c < 6) out.push(sqOf(r, c));
  }
  return out;
});

export function newGame() {
  const board = new Int8Array(36);
  for (let sq = 0; sq < 12; sq++) board[sq] = P2;
  for (let sq = 24; sq < 36; sq++) board[sq] = P1;
  return { board, turn: P1, quiet: 0, counts: [0, 12, 12], ply: 0 };
}

// rows: six 6-char strings, 'x' = P1, 'o' = P2, anything else empty.
export function fromLayout(rows, turn = P1) {
  const board = new Int8Array(36), counts = [0, 0, 0];
  rows.forEach((line, r) => [...line].forEach((ch, c) => {
    const p = ch === 'x' ? P1 : ch === 'o' ? P2 : 0;
    board[sqOf(r, c)] = p;
    counts[p]++;
  }));
  counts[0] = 0;
  return { board, turn, quiet: 0, counts, ply: 0 };
}

// Captures by the piece on `from`. With `withPath`, each move carries
// path = { squares: [from, ..., to], loops: [bool per segment] } — the shortest one per target.
export function capturesFrom(board, from, player, withPath = false, out = []) {
  const on = ON[from];
  for (let o = 0; o < on.length; o += 2) {
    const cir = CIRCUITS[on[o]];
    for (let dir = 1; dir >= -1; dir -= 2) {
      let i = on[o + 1], looped = false;
      const squares = withPath ? [from] : null, loops = withPath ? [] : null;
      for (let n = 0; n < 24; n++) {
        const loop = dir === 1 ? i % 6 === 5 : i % 6 === 0;
        i = (i + dir + 24) % 24;
        const sq = cir[i];
        if (loop) looped = true;
        if (withPath) { squares.push(sq); loops.push(loop); }
        if (sq === from) continue; // the moving stone has left its point
        const v = board[sq];
        if (v === 0) continue;
        if (v !== player && looped) addCapture(out, from, sq, withPath ? { squares, loops } : null);
        break;
      }
    }
  }
  return out;
}

function addCapture(out, from, to, path) {
  const j = out.findIndex(m => m.capture && m.from === from && m.to === to);
  const move = { from, to, capture: true, path };
  if (j < 0) out.push(move);
  else if (path && path.squares.length < out[j].path.squares.length) out[j] = move;
}

export function stepsFrom(board, from, out = []) {
  for (const to of NEIGHBOURS[from]) if (board[to] === 0) out.push({ from, to, capture: false, path: null });
  return out;
}

export function movesFrom(board, from, player, withPath = false) {
  if (board[from] !== player) return [];
  return stepsFrom(board, from, capturesFrom(board, from, player, withPath));
}

// Captures first, so search ordering and "must I look at captures" both come for free.
export function legalMoves(board, player, withPath = false) {
  const caps = [], steps = [];
  for (let sq = 0; sq < 36; sq++) if (board[sq] === player) {
    capturesFrom(board, sq, player, withPath, caps);
    stepsFrom(board, sq, steps);
  }
  return caps.concat(steps);
}

// Enemy squares `player` can capture right now.
export function attackedBy(board, player) {
  const hit = new Set();
  for (let sq = 0; sq < 36; sq++) if (board[sq] === player)
    for (const m of capturesFrom(board, sq, player)) hit.add(m.to);
  return hit;
}

export function applyMove(state, move) {
  const board = state.board.slice();
  board[move.to] = board[move.from];
  board[move.from] = 0;
  const counts = state.counts.slice();
  if (move.capture) counts[other(state.turn)]--;
  return { board, turn: other(state.turn), quiet: move.capture ? 0 : state.quiet + 1, counts, ply: state.ply + 1 };
}

// null while the game goes on, else { winner: P1 | P2 | 0 (draw), reason: 'all' | 'quiet' | 'stuck' }.
export function outcome(state) {
  if (state.counts[P1] === 0) return { winner: P2, reason: 'all' };
  if (state.counts[P2] === 0) return { winner: P1, reason: 'all' };
  if (state.quiet >= QUIET_LIMIT) {
    const d = state.counts[P1] - state.counts[P2];
    return { winner: d > 0 ? P1 : d < 0 ? P2 : 0, reason: 'quiet' };
  }
  if (legalMoves(state.board, state.turn).length === 0) return { winner: other(state.turn), reason: 'stuck' };
  return null;
}

export const toJSON = s => ({ ...s, board: Array.from(s.board) });
export const fromJSON = s => ({ ...s, board: Int8Array.from(s.board) });
