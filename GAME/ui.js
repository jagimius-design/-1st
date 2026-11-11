// Screens, board rendering, input and game flow.
import { P1, P2, QUIET_LIMIT, CIRCUITS, row, col, newGame, fromLayout, movesFrom, legalMoves, applyMove, outcome,
  attackedBy, toJSON, fromJSON } from './core.js';
import { chooseMove, LEVELS } from './ai.js';
import { OPPONENTS, LESSONS, DRILLS, THEMES, DEMO_OPPONENTS, DEMO_LEVELS } from './content.js';
import { meetsGoal, coachTip } from './coach.js';
import { sfx, setSound, setMusic, unlockAudio } from './audio.js';
import { FULL_VERSION, STORE_URL } from './config.js';

const $ = s => document.querySelector(s);
const SIDE_NAME = { [P1]: 'Jade', [P2]: 'Obsidian' };

// ---------------------------------------------------------------- saved data

const KEY = 'loopstone.v1';
const DEFAULTS = { settings: { sound: true, music: true, coach: true, hints: true, threats: false, theme: 'temple' }, stars: [],
  stats: { played: 0, won: 0, lost: 0, drawn: 0 }, lessonsDone: false, drills: [], saved: null };
const data = (() => {
  try {
    const s = JSON.parse(localStorage.getItem(KEY)) || {};
    return { ...DEFAULTS, ...s, settings: { ...DEFAULTS.settings, ...s.settings }, stats: { ...DEFAULTS.stats, ...s.stats } };
  } catch { return structuredClone(DEFAULTS); }
})();
const persist = () => { try { localStorage.setItem(KEY, JSON.stringify(data)); } catch {} };

const opponentOpen = i => (FULL_VERSION || i < DEMO_OPPONENTS) && (i === 0 || (data.stars[i - 1] || 0) > 0);
const levelOpen = i => FULL_VERSION || i < DEMO_LEVELS;
const themeOpen = t => !!THEMES[t] && (FULL_VERSION || THEMES[t].demo) && (THEMES[t].unlock === null || (data.stars[THEMES[t].unlock] || 0) > 0);
const theme = () => THEMES[themeOpen(data.settings.theme) ? data.settings.theme : 'temple'];

// ---------------------------------------------------------------- screens

function show(id) {
  document.querySelectorAll('.screen').forEach(el => el.classList.toggle('active', el.id === id));
  ({ menu: renderMenu, campaign: renderCampaign, quick: renderQuick, settings: renderSettings, path: renderPath })[id]?.();
  if (id === 'game') requestAnimationFrame(resize);
}

function renderMenu() {
  $('#btn-resume').hidden = !data.saved;
  document.querySelectorAll('[data-demo]').forEach(el => { el.hidden = FULL_VERSION; });
}

const starsHTML = n => [0, 1, 2].map(i => `<span class="${i < n ? '' : 'off'}">★</span>`).join('');
// Opponents are shown as carved glyph blocks: a rounded cartouche with their initial.
const avatar = o => `<span class="avatar" style="--glyph:${o.color}">${o.glyph || o.name[0]}</span>`;

// Temple Ascent progress as a stepped pyramid: one tier per opponent, lit once beaten.
function pyramidSVG() {
  const n = OPPONENTS.length, h = 13, W = 260;
  const tiers = OPPONENTS.map((o, i) => {
    const w = W - i * 26, y = (n - 1 - i) * h + 22, beaten = (data.stars[i] || 0) > 0;
    return `<rect x="${(W - w) / 2 + 10}" y="${y}" width="${w}" height="${h - 2}" rx="1" class="${beaten ? 'tier lit' : opponentOpen(i) ? 'tier next' : 'tier'}"/>`;
  }).join('');
  const top = data.stars[n - 1] > 0;
  return `<svg viewBox="0 0 280 ${n * h + 26}" class="pyramid" role="img" aria-label="Pyramid progress">
    <rect x="${140 - 24}" y="4" width="48" height="18" rx="2" class="tier temple ${top ? 'lit' : ''}"/>
    <rect x="${140 - 6}" y="10" width="12" height="12" class="door"/>${tiers}</svg>`;
}

function renderCampaign() {
  const total = data.stars.reduce((a, b) => a + (b || 0), 0);
  $('#stars-total').textContent = `★ ${total}/${OPPONENTS.length * 3}`;
  $('#pyramid').innerHTML = pyramidSVG();
  $('#opponents').innerHTML = OPPONENTS.map((o, i) => {
    const locked = !opponentOpen(i), paywall = !FULL_VERSION && i >= DEMO_OPPONENTS;
    const strength = Math.min(5, Math.round(1 + i * 4 / (OPPONENTS.length - 1)));
    return `<li><button class="opp" data-opp="${i}" ${locked && !paywall ? 'disabled' : ''}>
      ${avatar(o)}
      <span class="opp-body"><span class="opp-name">${o.name}</span> <span class="opp-title">${o.title}</span>
        <div class="opp-blurb">${paywall ? '<span class="paywall">Unlock in the full game</span>' : locked ? 'Beat the step below to unlock' : o.blurb}</div>
        <span class="pips">${[1, 2, 3, 4, 5].map(k => `<i class="${k <= strength ? 'on' : ''}"></i>`).join('')}</span></span>
      <span class="opp-side">${paywall ? '🔒' : locked ? '🔒' : `<span class="stars">${starsHTML(data.stars[i] || 0)}</span>`}</span>
    </button></li>`;
  }).join('');
  const next = OPPONENTS.findIndex((_, i) => opponentOpen(i) && !(data.stars[i] > 0));
  if (next > 0) document.querySelector(`#opponents [data-opp="${next}"]`)?.scrollIntoView({ block: 'center' });
}

function renderPath() {
  const done = data.drills.filter(Boolean).length;
  $('#path-count').textContent = `${done}/${DRILLS.length}`;
  const item = (attrs, title, sub, ok) => `<li><button class="opp" ${attrs}>
    <span class="tick ${ok ? 'ok' : ''}">${ok ? '✓' : ''}</span>
    <span class="opp-body"><span class="opp-name">${title}</span><div class="opp-blurb">${sub}</div></span></button></li>`;
  $('#drills').innerHTML = item('data-lesson="0"', 'The rules', 'Moving, capturing and winning, in four short lessons.', data.lessonsDone)
    + DRILLS.map((d, i) => item(`data-drill="${i}"`, `${i + 1}. ${d.title}`, d.text.split('. ')[0] + '.', data.drills[i])).join('');
}

let quickLevel = 1, quickSide = P1;
function renderQuick() {
  if (!levelOpen(quickLevel)) quickLevel = 0;
  $('#levels').innerHTML = LEVELS.map((L, i) => `<button class="choice ${i === quickLevel ? 'selected' : ''}" data-level="${i}" ${levelOpen(i) ? '' : 'disabled'}>
    <span class="pips">${[0, 1, 2, 3, 4].map(k => `<i class="${k <= i ? 'on' : ''}"></i>`).join('')}</span>${L.name}<small>${levelOpen(i) ? '' : 'Full game 🔒'}</small></button>`).join('');
  document.querySelectorAll('[data-side]').forEach(b => b.classList.toggle('selected', +b.dataset.side === quickSide));
}

function renderSettings() {
  document.querySelectorAll('[data-setting]').forEach(el => { el.checked = data.settings[el.dataset.setting]; });
  $('#themes').innerHTML = Object.entries(THEMES).map(([key, t]) => {
    const open = themeOpen(key);
    const why = !FULL_VERSION && !t.demo ? 'Full game' : t.unlock !== null ? `Beat ${OPPONENTS[t.unlock].name}` : '';
    return `<button class="theme ${key === data.settings.theme ? 'selected' : ''}" data-theme="${key}" ${open ? '' : 'disabled'} title="${open ? t.name : why}">
      <div class="swatch" style="background:linear-gradient(135deg, ${t.board[0]}, ${t.board[1]});--c1:${t.inner};--c2:${t.outer}"></div>${open ? t.name : '🔒 ' + t.name}</button>`;
  }).join('');
  const s = data.stats;
  $('#stats').innerHTML = [['Played', s.played], ['Won', s.won], ['Lost', s.lost], ['Drawn', s.drawn]]
    .map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join('');
}

// ---------------------------------------------------------------- board geometry

const canvas = $('#board'), ctx = canvas.getContext('2d');
let V = { size: 0, s: 0, o: 0, dpr: 1 };

function resize() {
  const play = $('#play'), wrap = canvas.parentElement;
  const others = [...play.children].filter(el => el !== wrap).reduce((h, el) => h + el.offsetHeight + 6, 0);
  const size = Math.max(200, Math.floor(Math.min(play.clientWidth, play.clientHeight - others)));
  const dpr = Math.min(3, window.devicePixelRatio || 1);
  if (size === V.size && dpr === V.dpr) return;
  canvas.style.width = canvas.style.height = size + 'px';
  canvas.width = canvas.height = Math.round(size * dpr);
  const s = size / 10.8;
  V = { size, s, o: (size - 5 * s) / 2, dpr };
}

const flipped = () => G && G.mode !== 'pass' && G.human === P2;
function xy(sq) {
  let r = row(sq), c = col(sq);
  if (flipped()) { r = 5 - r; c = 5 - c; }
  return [V.o + c * V.s, V.o + r * V.s];
}
function squareAt(x, y) {
  let c = Math.round((x - V.o) / V.s), r = Math.round((y - V.o) / V.s);
  if (r < 0 || r > 5 || c < 0 || c > 5) return -1;
  const [px, py] = [V.o + c * V.s, V.o + r * V.s];
  if (Math.hypot(x - px, y - py) > V.s * 0.5) return -1;
  if (flipped()) { r = 5 - r; c = 5 - c; }
  return r * 6 + c;
}

// Points (after the start) of the arc joining two loop ends round their board corner, the long way.
function arcPoints(a, b, n = 28) {
  const R = [row(a), row(b)].find(v => v === 0 || v === 5), C = [col(a), col(b)].find(v => v === 0 || v === 5);
  const [cx, cy] = xy(R * 6 + C), [ax, ay] = xy(a), [bx, by] = xy(b);
  const r = Math.hypot(ax - cx, ay - cy), a0 = Math.atan2(ay - cy, ax - cx);
  let d = Math.atan2(by - cy, bx - cx) - a0;
  while (d <= -Math.PI) d += 2 * Math.PI;
  while (d > Math.PI) d -= 2 * Math.PI;
  const sweep = d > 0 ? d - 2 * Math.PI : d + 2 * Math.PI;
  return Array.from({ length: n }, (_, i) => {
    const t = a0 + sweep * (i + 1) / n;
    return [cx + r * Math.cos(t), cy + r * Math.sin(t)];
  });
}

function pathPoints(path) {
  const pts = [xy(path.squares[0])];
  for (let i = 0; i < path.loops.length; i++) {
    if (path.loops[i]) pts.push(...arcPoints(path.squares[i], path.squares[i + 1]));
    else pts.push(xy(path.squares[i + 1]));
  }
  return pts;
}

const circuitPaths = () => CIRCUITS.map(c => ({ squares: [...c, c[0]], loops: c.map((_, i) => i % 6 === 5) }));

// ---------------------------------------------------------------- drawing

let anim = null, particles = [];
let layer = { key: '', canvas: null }, sprites = { key: '', [P1]: null, [P2]: null };

function rng(seed) {
  return () => { seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}

const offscreen = px => { const c = document.createElement('canvas'); c.width = c.height = px; return c; };

// Slab outline: a square whose corners are cut in three steps, like a temple platform.
function slabPath(c, x0, size, k) {
  const x1 = x0 + size, m = x0 + size / 2;
  const corner = [[x1 - 3 * k, x0], [x1 - 3 * k, x0 + k], [x1 - 2 * k, x0 + k], [x1 - 2 * k, x0 + 2 * k],
    [x1 - k, x0 + 2 * k], [x1 - k, x0 + 3 * k], [x1, x0 + 3 * k]];
  c.beginPath();
  for (let q = 0; q < 4; q++) {
    const a = q * Math.PI / 2, cos = Math.cos(a), sin = Math.sin(a);
    for (const [x, y] of corner) {
      const dx = x - m, dy = y - m;
      c.lineTo(m + dx * cos - dy * sin, m + dx * sin + dy * cos);
    }
  }
  c.closePath();
}

// Interlocking stepped frets along a band from (0,0) to (len,h), drawn in local coordinates.
function fretBand(c, len, h, light, dark) {
  const w = h * 1.6, units = Math.max(4, Math.round(len / w)), u = len / units, st = h / 3;
  c.fillStyle = dark; c.fillRect(0, 0, len, h);
  c.fillStyle = light;
  for (let i = 0; i < units; i++) {
    const x = i * u;
    c.beginPath();
    c.moveTo(x, h);
    c.lineTo(x, h - st); c.lineTo(x + u * 0.18, h - st); c.lineTo(x + u * 0.18, h - 2 * st);
    c.lineTo(x + u * 0.36, h - 2 * st); c.lineTo(x + u * 0.36, h - 2.6 * st);
    c.lineTo(x + u * 0.64, h - 2.6 * st); c.lineTo(x + u * 0.64, h - 2 * st);
    c.lineTo(x + u * 0.82, h - 2 * st); c.lineTo(x + u * 0.82, h - st); c.lineTo(x + u, h - st);
    c.lineTo(x + u, h); c.closePath(); c.fill();
    c.fillRect(x + u * 0.45, h * 0.12, u * 0.1, h * 0.12); // carved seed dot above each step
  }
}

function carve(c, pts, width, groove, ridge) {
  c.lineCap = 'round'; c.lineJoin = 'round';
  c.save(); c.translate(0.9, 1.1); c.strokeStyle = ridge; c.lineWidth = width; strokeOn(c, pts); c.restore();
  c.strokeStyle = groove; c.lineWidth = width; strokeOn(c, pts);
}

function strokeOn(c, pts) {
  c.beginPath();
  pts.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y)));
  c.stroke();
}

function sunGlyph(c, x, y, r, groove, ridge) {
  for (const [col, dx] of [[ridge, 0.8], [groove, 0]]) {
    c.strokeStyle = col; c.lineWidth = r * 0.22;
    c.beginPath(); c.arc(x + dx, y + dx, r, 0, 7); c.stroke();
    for (let i = 0; i < 4; i++) {
      const a = i * Math.PI / 2 + Math.PI / 4;
      c.beginPath(); c.arc(x + dx + Math.cos(a) * r * 1.65, y + dx + Math.sin(a) * r * 1.65, r * 0.32, 0, 7); c.stroke();
    }
  }
}

// The static carved board, redrawn only when the size or theme changes.
function boardLayer(t) {
  const key = `${t.name}|${V.size}|${V.dpr}`;
  if (layer.key === key) return layer.canvas;
  const { size, s, o, dpr } = V, cv = offscreen(Math.round(size * dpr)), c = cv.getContext('2d'), rand = rng(7);
  c.scale(dpr, dpr);
  const pad = s * 0.1, k = s * 0.16, slab = size - 2 * pad;

  c.save();
  c.shadowColor = 'rgba(0,0,0,.5)'; c.shadowBlur = s * 0.3; c.shadowOffsetY = s * 0.12;
  slabPath(c, pad, slab, k);
  const g = c.createLinearGradient(0, 0, size, size);
  g.addColorStop(0, t.board[0]); g.addColorStop(1, t.board[1]);
  c.fillStyle = g; c.fill();
  c.restore();

  c.save();
  slabPath(c, pad, slab, k); c.clip();
  for (let i = 0; i < 2600; i++) { // pitted stone
    c.globalAlpha = 0.08 + rand() * 0.18;
    c.fillStyle = t.speck[rand() < 0.6 ? 0 : 1];
    c.beginPath(); c.arc(rand() * size, rand() * size, s * (0.006 + rand() * 0.022), 0, 7); c.fill();
  }
  c.globalAlpha = 0.25; c.strokeStyle = t.speck[0]; c.lineWidth = 0.8;
  for (let i = 0; i < 5; i++) { // hairline cracks
    let x = rand() * size, y = rand() * size, a = rand() * 7;
    c.beginPath(); c.moveTo(x, y);
    for (let j = 0; j < 14; j++) { a += (rand() - 0.5) * 0.9; x += Math.cos(a) * s * 0.12; y += Math.sin(a) * s * 0.12; c.lineTo(x, y); }
    c.stroke();
  }
  c.globalAlpha = 1;

  // fret frame on all four sides
  const bh = s * 0.36, b0 = pad + k * 3, blen = slab - 6 * k;
  for (let side = 0; side < 4; side++) {
    c.save();
    c.translate(size / 2, size / 2); c.rotate(side * Math.PI / 2); c.translate(-size / 2, -size / 2);
    c.translate(b0, pad + s * 0.08);
    c.globalAlpha = 0.85;
    fretBand(c, blen, bh, t.board[0], t.frame);
    c.globalAlpha = 1;
    c.restore();
  }
  c.restore();
  c.strokeStyle = 'rgba(0,0,0,.35)'; c.lineWidth = 1.5; slabPath(c, pad, slab, k); c.stroke();

  // carved grid, then the two circuits inlaid as coloured stone
  for (let i = 0; i < 6; i++) {
    carve(c, [[o, o + i * s], [o + 5 * s, o + i * s]], s * 0.05, t.groove, t.ridge);
    carve(c, [[o + i * s, o], [o + i * s, o + 5 * s]], s * 0.05, t.groove, t.ridge);
  }
  circuitPaths().forEach((p, i) => {
    const pts = pathPoints(p);
    carve(c, pts, s * 0.12, t.groove, t.ridge);
    c.strokeStyle = i === 0 ? t.inner : t.outer; c.lineWidth = s * 0.075; strokeOn(c, pts);
    c.strokeStyle = 'rgba(255,255,255,.28)'; c.lineWidth = s * 0.018;
    c.save(); c.translate(-s * 0.012, -s * 0.012); strokeOn(c, pts); c.restore();
  });
  // the four corner points sit on no circuit: stones there are safe, marked with a sun glyph
  for (const [r, cc] of [[0, 0], [0, 5], [5, 0], [5, 5]]) sunGlyph(c, o + cc * s, o + r * s, s * 0.1, t.groove, t.ridge);

  layer = { key, canvas: cv };
  return cv;
}

// Jade and obsidian stones, rendered once per size and theme.
function stoneSprite(p, t) {
  const key = `${t.name}|${V.size}|${V.dpr}`;
  if (sprites.key !== key) sprites = { key, [P1]: null, [P2]: null };
  if (sprites[p]) return sprites[p];
  const r = V.s * 0.36, m = r * 0.6, px = Math.ceil((2 * r + 2 * m) * V.dpr), cv = offscreen(px), c = cv.getContext('2d');
  const rand = rng(p * 31), [hi, mid, lo] = p === P1 ? t.p1 : t.p2;
  c.scale(V.dpr, V.dpr);
  const x = r + m, y = r + m;
  c.shadowColor = 'rgba(0,0,0,.5)'; c.shadowBlur = r * 0.5; c.shadowOffsetY = r * 0.28;
  const g = c.createRadialGradient(x - r * 0.3, y - r * 0.35, r * 0.05, x, y, r);
  g.addColorStop(0, hi); g.addColorStop(0.5, mid); g.addColorStop(1, lo);
  c.fillStyle = g; c.beginPath(); c.arc(x, y, r, 0, 7); c.fill();
  c.shadowColor = 'transparent';
  c.save(); c.beginPath(); c.arc(x, y, r, 0, 7); c.clip();
  if (p === P1) { // jade mottling and veins
    for (let i = 0; i < 26; i++) {
      c.globalAlpha = 0.08 + rand() * 0.12; c.fillStyle = rand() < 0.5 ? hi : lo;
      c.beginPath(); c.ellipse(x + (rand() - 0.5) * 2 * r, y + (rand() - 0.5) * 2 * r, r * (0.1 + rand() * 0.3), r * (0.05 + rand() * 0.15), rand() * 3, 0, 7); c.fill();
    }
    c.globalAlpha = 0.25; c.strokeStyle = hi; c.lineWidth = r * 0.04;
    c.beginPath(); c.moveTo(x - r, y + r * 0.2); c.bezierCurveTo(x - r * 0.3, y - r * 0.4, x + r * 0.2, y + r * 0.5, x + r, y - r * 0.1); c.stroke();
  } else { // obsidian conchoidal ripples
    c.globalAlpha = 0.18; c.strokeStyle = hi; c.lineWidth = r * 0.035;
    for (let i = 1; i <= 4; i++) { c.beginPath(); c.arc(x + r * 0.5, y + r * 0.6, r * 0.3 * i, Math.PI * 1.05, Math.PI * 1.55); c.stroke(); }
  }
  c.restore();
  c.globalAlpha = p === P1 ? 0.55 : 0.75; c.fillStyle = '#ffffff'; // polished highlight
  c.beginPath(); c.ellipse(x - r * 0.32, y - r * 0.42, r * 0.32, r * 0.14, -0.6, 0, 7); c.fill();
  c.globalAlpha = 0.35; c.strokeStyle = 'rgba(0,0,0,.6)'; c.lineWidth = r * 0.06;
  c.beginPath(); c.arc(x, y, r * 0.97, 0.1, Math.PI - 0.1); c.stroke();
  sprites[p] = cv;
  return cv;
}

function drawStone(x, y, p, scale = 1, alpha = 1) {
  const sp = stoneSprite(p, theme()), w = sp.width / V.dpr * scale;
  ctx.globalAlpha = alpha;
  ctx.drawImage(sp, x - w / 2, y - w / 2, w, w);
  ctx.globalAlpha = 1;
}

function strokePts(pts) { strokeOn(ctx, pts); }

function draw(now) {
  const t = theme(), { size, s, dpr } = V;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(boardLayer(t), 0, 0);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';

  if (!G) return;
  const pulse = 0.5 + 0.5 * Math.sin(now / 260);
  const board = G.state.board;

  // last move
  if (G.last && !anim) for (const sq of [G.last.from, G.last.to]) {
    const [x, y] = xy(sq);
    ctx.fillStyle = t.mark; ctx.globalAlpha = 0.22;
    ctx.beginPath(); ctx.arc(x, y, s * 0.44, 0, 7); ctx.fill();
    ctx.globalAlpha = 1;
  }

  // capture paths and move targets for the selection
  if (G.selected !== null && !anim) {
    const caps = G.moves.filter(m => m.capture), steps = G.moves.filter(m => !m.capture);
    if (data.settings.hints || G.mode === 'lesson') {
      ctx.save();
      ctx.strokeStyle = t.danger; ctx.lineWidth = s * 0.2; ctx.globalAlpha = 0.22;
      caps.forEach(m => strokePts(pathPoints(m.path)));
      ctx.setLineDash([s * 0.14, s * 0.12]);
      ctx.lineDashOffset = -now / 25;
      ctx.lineWidth = s * 0.07; ctx.globalAlpha = 0.95;
      caps.forEach(m => strokePts(pathPoints(m.path)));
      ctx.restore();
      ctx.fillStyle = t.mark;
      steps.forEach(m => {
        const [x, y] = xy(m.to);
        ctx.globalAlpha = 0.55 + 0.3 * pulse;
        ctx.beginPath(); ctx.arc(x, y, s * 0.13, 0, 7); ctx.fill();
      });
      ctx.globalAlpha = 1;
    }
    const [x, y] = xy(G.selected);
    ctx.strokeStyle = t.mark; ctx.lineWidth = s * 0.06;
    ctx.beginPath(); ctx.arc(x, y, s * 0.44, 0, 7); ctx.stroke();
  }

  // threatened own stones
  if (data.settings.threats && G.threats && !anim) {
    ctx.strokeStyle = t.danger; ctx.lineWidth = s * 0.05;
    ctx.globalAlpha = 0.5 + 0.5 * pulse;
    G.threats.forEach(sq => { const [x, y] = xy(sq); ctx.beginPath(); ctx.arc(x, y, s * 0.45, 0, 7); ctx.stroke(); });
    ctx.globalAlpha = 1;
  }

  // hint
  if (G.hint && !anim) for (const sq of [G.hint.from, G.hint.to]) {
    const [x, y] = xy(sq);
    ctx.strokeStyle = '#7dffb0'; ctx.lineWidth = s * 0.07; ctx.globalAlpha = 0.5 + 0.5 * pulse;
    ctx.beginPath(); ctx.arc(x, y, s * (0.42 + 0.05 * pulse), 0, 7); ctx.stroke();
    ctx.globalAlpha = 1;
  }

  // stones
  for (let sq = 0; sq < 36; sq++) {
    if (!board[sq] || (anim && sq === anim.move.from)) continue;
    const [x, y] = xy(sq);
    if (anim && anim.move.capture && sq === anim.move.to) {
      const k = Math.max(0, (anim.p - 0.85) / 0.15);
      drawStone(x, y, board[sq], 1 - 0.4 * k, 1 - k);
    } else drawStone(x, y, board[sq]);
  }

  // capture targets drawn above stones
  if (G.selected !== null && !anim) G.moves.filter(m => m.capture).forEach(m => {
    const [x, y] = xy(m.to);
    ctx.strokeStyle = t.danger; ctx.lineWidth = s * 0.07;
    ctx.beginPath(); ctx.arc(x, y, s * (0.42 + 0.04 * pulse), 0, 7); ctx.stroke();
  });

  // moving stone, with a trail on captures
  if (anim) {
    const p = anim.p = Math.min(1, (now - anim.t0) / anim.dur);
    const e = p < 0.5 ? 2 * p * p : 1 - (-2 * p + 2) ** 2 / 2;
    if (anim.move.capture) for (let k = 8; k >= 1; k--) {
      const [tx, ty] = pointAt(Math.max(0, e - k * 0.018));
      drawStone(tx, ty, anim.player, 1 - k * 0.06, 0.08);
    }
    const [x, y] = pointAt(e);
    drawStone(x, y, anim.player, 1 + 0.12 * Math.sin(Math.PI * p));
    if (p >= 1) { const done = anim.done; anim = null; done(); }
  }

  // particles
  particles = particles.filter(q => (q.life -= 0.016) > 0);
  particles.forEach(q => {
    q.x += q.vx; q.y += q.vy; q.vy += 0.15; q.vx *= 0.97;
    ctx.globalAlpha = Math.max(0, q.life);
    ctx.fillStyle = q.color;
    ctx.beginPath(); ctx.arc(q.x, q.y, q.r, 0, 7); ctx.fill();
  });
  ctx.globalAlpha = 1;
}

function pointAt(f) {
  const d = f * anim.total;
  let i = 1;
  while (i < anim.cum.length - 1 && anim.cum[i] < d) i++;
  const [ax, ay] = anim.pts[i - 1], [bx, by] = anim.pts[i];
  const seg = anim.cum[i] - anim.cum[i - 1] || 1, k = Math.min(1, Math.max(0, (d - anim.cum[i - 1]) / seg));
  return [ax + (bx - ax) * k, ay + (by - ay) * k];
}

function burst(sq, colors) {
  const [x, y] = xy(sq);
  for (let i = 0; i < 26; i++) {
    const a = Math.random() * Math.PI * 2, v = (1 + Math.random() * 3.5) * V.s / 40;
    particles.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 1, r: V.s * (0.03 + Math.random() * 0.05),
      life: 0.6 + Math.random() * 0.5, color: colors[i % colors.length] });
  }
}

function animateMove(move) {
  return new Promise(done => {
    const path = move.path || { squares: [move.from, move.to], loops: [false] };
    const pts = pathPoints(path), cum = [0];
    for (let i = 1; i < pts.length; i++) cum.push(cum[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
    const total = cum.at(-1), cells = total / V.s;
    const dur = move.capture ? Math.min(1500, 260 + cells * 70) : 200;
    if (move.capture) sfx.whoosh(dur / 1000);
    anim = { move, pts, cum, total, dur, t0: performance.now(), p: 0, player: G.state.board[move.from], done };
  });
}

function loop(now) {
  if ($('#game').classList.contains('active') && V.size) draw(now);
  requestAnimationFrame(loop);
}

// ---------------------------------------------------------------- AI bridge

let worker = null, reqId = 0;
const pending = new Map();
function getWorker() {
  if (worker !== null) return worker;
  try {
    worker = new Worker(new URL('./ai-worker.js', import.meta.url), { type: 'module' });
    worker.onmessage = e => { pending.get(e.data.id)?.resolve(e.data.move); pending.delete(e.data.id); };
    worker.onerror = () => {
      worker = false;
      for (const [id, p] of pending) { pending.delete(id); p.resolve(chooseMove(p.state, p.level)); }
    };
  } catch { worker = false; }
  return worker;
}
function requestMove(state, level) {
  return new Promise(resolve => {
    const w = getWorker();
    if (!w) return setTimeout(() => resolve(chooseMove(state, level)), 30);
    const id = ++reqId;
    pending.set(id, { resolve, state, level });
    w.postMessage({ id, state, level });
  });
}

// ---------------------------------------------------------------- game flow

let G = null, token = 0;

function startGame(cfg) {
  G = { mode: 'ai', human: P1, level: 1, opponent: null, lesson: null, drill: null, lostLast: false, state: newGame(), history: [],
    last: null, selected: null, moves: [], hint: null, threats: null, busy: false, thinking: false, over: null, ...cfg };
  G.token = ++token;
  $('#overlay').hidden = true;
  show('game');
  refresh();
  maybeAI();
}

const humanTurn = () => G.mode === 'pass' || G.state.turn === G.human;
const opponentInfo = () => G.opponent !== null ? OPPONENTS[G.opponent]
  : { name: G.lesson !== null || G.drill !== null ? 'Temple Guide' : `${LEVELS[G.level].name} rival`, title: '', color: '#c9b27c', glyph: G.lesson !== null || G.drill !== null ? 'G' : LEVELS[G.level].name[0] };

function chip(el, side, label, sub, av) {
  const active = !G.over && G.state.turn === side;
  el.classList.toggle('active', active);
  el.innerHTML = `${av}<div><div class="name">${label}${active && G.thinking && !humanTurn() ? '<span class="thinking"><i></i><i></i><i></i></span>' : ''}</div><div class="sub">${sub}</div></div>
    <div class="count"><span class="stone s${side}"></span>${G.state.counts[side]}</div>`;
}

function refresh() {
  const lesson = G.lesson !== null ? LESSONS[G.lesson] : null;
  const top = G.mode === 'pass' || G.human === P1 ? P2 : P1, bottom = 3 - top;
  const you = `<span class="avatar you">★</span>`;
  const sideAvatar = p => `<span class="stone s${p}" style="width:34px;height:34px"></span>`;
  if (G.mode === 'pass') {
    chip($('#chip-top'), top, SIDE_NAME[top], '', sideAvatar(top));
    chip($('#chip-bottom'), bottom, SIDE_NAME[bottom], '', sideAvatar(bottom));
  } else {
    const o = opponentInfo();
    chip($('#chip-top'), top, o.name, o.title || SIDE_NAME[top], avatar(o));
    chip($('#chip-bottom'), bottom, 'You', SIDE_NAME[bottom], you);
  }
  const drill = G.drill !== null ? DRILLS[G.drill] : null;
  $('#chip-top').hidden = (!!lesson && lesson.goal !== 'win') || !!drill;
  $('#lesson').hidden = !lesson && !drill;
  if (lesson) $('#lesson').innerHTML = `<b>Lesson ${G.lesson + 1} of ${LESSONS.length} · ${lesson.title}</b>${lesson.text}`;
  if (drill) $('#lesson').innerHTML = `<b>Tip ${G.drill + 1} of ${DRILLS.length} · ${drill.title}</b>${drill.text}`;
  const coachOn = data.settings.coach && G.mode === 'ai' && !lesson && !drill;
  const tip = coachOn && humanTurn() && !G.over && !G.busy ? coachTip(G.state, G.human, G.lostLast) : null;
  $('#coach').hidden = !coachOn;
  $('#coach').className = `coach ${tip ? tip.kind : 'idle'}`;
  $('#coach').innerHTML = tip ? `<b>Coach</b>${tip.text}` : `<b>Coach</b>Watching ${opponentInfo().name}…`;
  resize();
  $('#game-title').textContent = lesson ? 'How to Play' : drill ? 'Beginner\u2019s Path' : G.mode === 'pass' ? 'Pass & Play' : G.opponent !== null ? 'Temple Ascent' : 'Quick Play';
  $('#btn-undo').hidden = G.opponent !== null || !!lesson || !!drill;
  $('#btn-hint').hidden = G.opponent !== null || G.mode === 'pass';
  $('#btn-undo').disabled = G.busy || G.thinking || !G.history.length || !!G.over;
  $('#btn-hint').disabled = G.busy || G.thinking || !humanTurn() || !!G.over;

  G.threats = humanTurn() && !G.over ? [...attackedBy(G.state.board, 3 - G.state.turn)] : null;
  const status = $('#status');
  status.classList.toggle('warn', G.state.quiet >= QUIET_LIMIT - 14);
  if (G.over) status.textContent = '';
  else if (G.state.quiet >= QUIET_LIMIT - 14) status.textContent = `${QUIET_LIMIT - G.state.quiet} moves left to capture — then more stones wins`;
  else if (G.mode === 'pass') status.textContent = `${SIDE_NAME[G.state.turn]} to move`;
  else status.textContent = humanTurn() ? (G.state.ply < 2 && !lesson && !drill ? 'Your move — tap a stone' : 'Your move') : `${opponentInfo().name} is thinking…`;
}

function onTap(sq) {
  unlockAudio();
  if (!G || G.busy || G.over || G.thinking || !humanTurn() || sq < 0) return;
  const b = G.state.board;
  if (b[sq] === G.state.turn) {
    if (G.selected === sq) { G.selected = null; G.moves = []; return; }
    G.selected = sq;
    G.moves = movesFrom(b, sq, G.state.turn, true);
    sfx.select();
    return;
  }
  const mv = G.moves.find(m => m.to === sq);
  if (mv) return play(mv);
  if (G.selected !== null && b[sq]) sfx.nope();
  G.selected = null; G.moves = [];
}

// Animates a move and applies it. Returns false if the game was left meanwhile.
async function animateAndApply(mv) {
  const tk = G.token;
  await animateMove(mv);
  if (tk !== G.token) return false;
  if (mv.capture) {
    const victim = G.state.board[mv.to] === P1 ? theme().p1 : theme().p2;
    burst(mv.to, [...victim, theme().danger]);
    sfx.capture();
    navigator.vibrate?.(30);
  } else sfx.step();
  G.lostLast = G.state.turn !== G.human && mv.capture;
  G.history.push(G.state);
  G.state = applyMove(G.state, mv);
  G.last = mv;
  return true;
}

async function play(mv) {
  G.busy = true; G.selected = null; G.moves = []; G.hint = null;
  refresh();
  if (!await animateAndApply(mv)) return;
  G.busy = false;
  if (G.drill !== null) return drillStep(mv);

  const lesson = G.lesson !== null ? LESSONS[G.lesson] : null;
  if (lesson && lesson.goal !== 'win') return lessonStep(lesson, mv);
  const res = outcome(G.state);
  if (res) return finish(res);
  saveGame();
  refresh();
  maybeAI();
}

function maybeAI() {
  if (G.over || humanTurn()) return;
  G.thinking = true;
  refresh();
  const tk = G.token, t0 = performance.now(), state = G.state;
  requestMove(state, G.level).then(mv => {
    if (tk !== G.token) return;
    setTimeout(() => {
      if (tk !== G.token) return;
      G.thinking = false;
      play(movesFrom(state.board, mv.from, state.turn, true).find(m => m.to === mv.to));
    }, Math.max(0, 550 - (performance.now() - t0)));
  });
}

function undo() {
  if (!G.history.length || G.busy || G.thinking) return;
  do G.state = G.history.pop(); while (G.mode !== 'pass' && G.history.length && G.state.turn !== G.human);
  G.last = null; G.selected = null; G.moves = []; G.hint = null;
  saveGame();
  refresh();
  maybeAI();
}

function hint() {
  if (!humanTurn() || G.busy) return;
  if (G.drill !== null) {
    const d = DRILLS[G.drill];
    G.hint = legalMoves(G.state.board, G.human).find(m => meetsGoal(d.goal, G.state, m));
    G.selected = G.hint.from;
    G.moves = movesFrom(G.state.board, G.hint.from, G.state.turn, true);
    return refresh();
  }
  G.thinking = true;
  refresh();
  const tk = G.token;
  requestMove(G.state, 3).then(mv => {
    if (tk !== G.token) return;
    G.thinking = false;
    G.hint = mv;
    G.selected = mv.from;
    G.moves = movesFrom(G.state.board, mv.from, G.state.turn, true);
    refresh();
  });
}

function saveGame() {
  data.saved = G.lesson === null && G.drill === null && !G.over
    ? { mode: G.mode, human: G.human, level: G.level, opponent: G.opponent, state: toJSON(G.state) } : null;
  persist();
}

function lessonStep(lesson, mv) {
  const ok = lesson.goal === 'step' ? !mv.capture : mv.capture;
  if (!ok) {
    $('#status').textContent = lesson.goal === 'capture' ? 'Not quite — look for a path through a loop.' : 'Try a single step.';
    sfx.nope();
    G.busy = true;
    const tk = G.token;
    setTimeout(() => { if (tk === G.token) { G.state = G.history.pop(); G.last = null; G.busy = false; refresh(); } }, 900);
    return;
  }
  G.over = { winner: G.human, reason: 'lesson' };
  sfx.win();
  overlay(`<h2>Nice!</h2><p>${['That’s all there is to moving.', 'That’s a capture. Every capture rides at least one loop.', 'Long loops are where games are won and lost.'][G.lesson]}</p>
    <div class="stack"><button class="btn primary" data-next-lesson>Next lesson</button><button class="btn ghost" data-go="menu">Menu</button></div>`);
}

// A Beginner's Path puzzle: right moves complete it; a wrong one shows the punishment, then resets.
async function drillStep(mv) {
  const d = DRILLS[G.drill], start = G.history[0];
  if (meetsGoal(d.goal, G.history.at(-1), mv)) {
    G.over = { winner: G.human, reason: 'drill' };
    data.drills[G.drill] = true;
    persist();
    sfx.win();
    const last = G.drill + 1 >= DRILLS.length;
    return overlay(`<h2>Well played</h2><p>${d.title}: ${['you kept every stone out of reach.', 'you struck before they could.',
      'a free stone, with nothing lost.', 'you saw the trap and stepped around it.', 'two stones attacked: they can only save one.',
      'the corner keeps your stone safe.', 'with the lead, safe moves win the game.'][G.drill]}</p>
      <div class="stack">${last ? '<button class="btn primary" data-opp="0">Climb the temple</button>' : '<button class="btn primary" data-next-drill>Next tip</button>'}
      <button class="btn ghost" data-go="path">Beginner\u2019s Path</button></div>`);
  }
  const tk = G.token;
  G.busy = true;
  sfx.nope();
  $('#status').textContent = d.miss;
  $('#status').classList.add('warn');
  const reply = legalMoves(G.state.board, G.state.turn, true).find(m => m.capture);
  await new Promise(r => setTimeout(r, 700));
  if (tk !== G.token) return;
  if (reply) { if (!await animateAndApply(reply)) return; }
  await new Promise(r => setTimeout(r, reply ? 1600 : 900));
  if (tk !== G.token) return;
  G.state = start; G.history = []; G.last = null; G.busy = false;
  refresh();
  $('#status').textContent = d.miss + ' Try again.';
}

function startDrill(i) {
  const d = DRILLS[i];
  startGame({ mode: 'ai', drill: i, level: 0, human: P1, state: { ...fromLayout(d.layout), quiet: d.quiet || 0 } });
}

function startLesson(i) {
  const L = LESSONS[i];
  startGame({ mode: 'ai', lesson: i, level: 0, human: P1, state: fromLayout(L.layout) });
}

function finish(res) {
  G.over = res;
  saveGame();
  refresh();
  const why = { all: 'Every stone captured.', quiet: `${QUIET_LIMIT} moves without a capture — more stones wins.`, stuck: 'No legal moves left.' }[res.reason];
  const humanWon = res.winner === G.human, draw = res.winner === 0;
  let html;

  if (G.lesson !== null) {
    if (humanWon) { data.lessonsDone = true; persist(); sfx.win(); }
    else sfx.lose();
    html = humanWon
      ? `<h2>You know the rules</h2><p>Now learn how to get the upper hand: seven short strategy puzzles on the Beginner\u2019s Path.</p>
        <div class="stack"><button class="btn primary" data-drill="0">Beginner\u2019s Path: strategy tips</button><button class="btn" data-opp="0">Climb the temple</button><button class="btn ghost" data-go="menu">Menu</button></div>`
      : `<h2>So close</h2><p>${why} Give it another go.</p>
        <div class="stack"><button class="btn primary" data-lesson="${G.lesson}">Try again</button><button class="btn ghost" data-go="menu">Menu</button></div>`;
    return overlay(html);
  }

  if (G.mode === 'pass') {
    sfx.win();
    html = `<h2>${draw ? 'Draw' : SIDE_NAME[res.winner] + ' wins'}</h2><p>${why}</p>
      <div class="stack"><button class="btn primary" data-action="pass">Play again</button><button class="btn ghost" data-go="menu">Menu</button></div>`;
    return overlay(html);
  }

  data.stats.played++;
  data.stats[draw ? 'drawn' : humanWon ? 'won' : 'lost']++;
  (humanWon ? sfx.win : sfx.lose)();

  if (G.opponent !== null) {
    const i = G.opponent, left = G.state.counts[G.human];
    const stars = humanWon ? (left >= 8 ? 3 : left >= 4 ? 2 : 1) : 0;
    const before = data.stars[i] || 0;
    data.stars[i] = Math.max(before, stars);
    const unlocked = humanWon && !before ? Object.values(THEMES).find(t => t.unlock === i && (FULL_VERSION || t.demo)) : null;
    const hasNext = i + 1 < OPPONENTS.length;
    const nextBtn = !humanWon ? `<button class="btn primary" data-opp="${i}">Try again</button>`
      : !hasNext ? `<button class="btn primary" data-go="campaign">Summit reached!</button>`
      : !FULL_VERSION && i + 1 >= DEMO_OPPONENTS ? `<a class="btn primary" href="#" data-buy>Unlock all 8 steps</a>`
      : `<button class="btn primary" data-opp="${i + 1}">Climb on: ${OPPONENTS[i + 1].name}</button>`;
    html = `<h2>${humanWon ? 'Victory!' : draw ? 'Draw' : 'Defeat'}</h2>
      ${humanWon ? `<div class="stars">${starsHTML(stars)}</div>` : ''}
      <p>${humanWon ? `You beat ${OPPONENTS[i].name} with ${left} stone${left === 1 ? '' : 's'} left.` : why}</p>
      ${unlocked ? `<p class="unlock">New board unlocked: ${unlocked.name}</p>` : ''}
      ${humanWon && stars < 3 ? `<p>Keep 8 stones for three stars.</p>` : ''}
      <div class="stack">${nextBtn}${humanWon ? `<button class="btn" data-opp="${i}">Replay</button>` : ''}<button class="btn ghost" data-go="campaign">The pyramid</button></div>`;
  } else {
    html = `<h2>${humanWon ? 'You win!' : draw ? 'Draw' : 'You lost'}</h2><p>${why}</p>
      <div class="stack"><button class="btn primary" data-replay>Play again</button>
      ${humanWon && G.level + 1 < LEVELS.length && levelOpen(G.level + 1) ? `<button class="btn" data-level-up>Try ${LEVELS[G.level + 1].name}</button>` : ''}
      <button class="btn ghost" data-go="menu">Menu</button></div>`;
  }
  persist();
  overlay(html);
}

function overlay(html) {
  setTimeout(() => { $('#card').innerHTML = html; wireBuy(); $('#overlay').hidden = false; }, 650);
}

function leaveGame(to = 'menu') {
  if (G) { G.token = ++token; anim = null; }
  $('#overlay').hidden = true;
  show(to);
}

// ---------------------------------------------------------------- wiring

function wireBuy() {
  document.querySelectorAll('[data-buy]').forEach(a => {
    a.href = STORE_URL || '#';
    if (STORE_URL) { a.target = '_blank'; a.rel = 'noopener'; }
  });
}

document.addEventListener('click', e => {
  const el = e.target.closest('button, a');
  if (!el) return;
  unlockAudio();
  const d = el.dataset;
  if ('buy' in d && !STORE_URL) { e.preventDefault(); return; }
  if (d.go) { leaveGame(d.go); return; }
  if (d.opp !== undefined && el.closest('#opponents, #card')) {
    const i = +d.opp;
    if (!FULL_VERSION && i >= DEMO_OPPONENTS) { if (STORE_URL) window.open(STORE_URL, '_blank', 'noopener'); return; }
    startGame({ mode: 'ai', opponent: i, level: OPPONENTS[i].level, human: P1 });
    return;
  }
  if (d.lesson !== undefined) return startLesson(+d.lesson);
  if ('nextLesson' in d) return startLesson(G.lesson + 1);
  if (d.drill !== undefined) return startDrill(+d.drill);
  if ('nextDrill' in d) return startDrill(G.drill + 1);
  if ('replay' in d) return startGame({ mode: 'ai', level: G.level, human: G.human });
  if ('levelUp' in d) return startGame({ mode: 'ai', level: G.level + 1, human: G.human });
  if (d.action === 'pass') return startGame({ mode: 'pass' });
  if (d.action === 'tutorial') return startLesson(0);
  if (d.level !== undefined) { quickLevel = +d.level; renderQuick(); return; }
  if (d.side !== undefined) { quickSide = +d.side; renderQuick(); return; }
  if (d.theme) { data.settings.theme = d.theme; persist(); renderSettings(); return; }
});

$('#btn-quick-start').onclick = () => startGame({ mode: 'ai', level: quickLevel, human: quickSide });
$('#btn-resume').onclick = () => {
  const s = data.saved;
  startGame({ mode: s.mode, human: s.human, level: s.level, opponent: s.opponent, state: fromJSON(s.state) });
};
$('#btn-leave').onclick = () => leaveGame(G && G.opponent !== null && !G.over ? 'campaign' : 'menu');
$('#btn-undo').onclick = undo;
$('#btn-hint').onclick = hint;
$('#btn-reset').onclick = () => {
  if (!confirm('Reset all stars, stats and settings?')) return;
  Object.assign(data, structuredClone(DEFAULTS));
  persist(); setSound(true); setMusic(true); renderSettings();
};
document.querySelectorAll('[data-setting]').forEach(el => el.addEventListener('change', () => {
  data.settings[el.dataset.setting] = el.checked;
  if (el.dataset.setting === 'sound') setSound(el.checked);
  if (el.dataset.setting === 'music') { setMusic(el.checked); if (el.checked) unlockAudio(); }
  persist();
}));

canvas.addEventListener('pointerdown', e => {
  const r = canvas.getBoundingClientRect();
  onTap(squareAt(e.clientX - r.left, e.clientY - r.top));
});
new ResizeObserver(() => { if ($('#game').classList.contains('active')) resize(); }).observe($('#play'));

setSound(data.settings.sound);
setMusic(data.settings.music);
wireBuy();
renderMenu();
if (!data.lessonsDone && !data.saved && data.stats.played === 0) $('[data-action="tutorial"]').classList.add('primary');
requestAnimationFrame(loop);
if ('serviceWorker' in navigator && location.protocol === 'https:') navigator.serviceWorker.register('sw.js').catch(() => {});
