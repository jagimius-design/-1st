// Screens, board drawing and animation, input and match flow.
import { P1, P2, LAP, TRACK, KIND, ENTRY, VARIANTS, other, newGame, throwBeans, applyThrow, applyMove,
  legalMoves, winner, square, onBoard } from './core.js';
import { chooseMove, advise, LEVELS } from './ai.js';
import { RIVALS, RULES, ACHIEVEMENTS, MATS, BEANS, VARIANT_INFO, DEMO_RIVALS, DEMO_LEVELS } from './content.js';
import { earned, reward } from './achievements.js';
import { portrait } from './portraits.js';
import { sfx, setSound, setMusic, unlockAudio } from './audio.js';
import { FULL_VERSION, STORE_URL } from './config.js';

const $ = s => document.querySelector(s);
const pick = list => list[Math.random() * list.length | 0];
const wait = ms => new Promise(r => setTimeout(r, ms));
const SIDE = { [P1]: 'Jade', [P2]: 'Obsidian' };

// ---------------------------------------------------------------- saved data

const KEY = 'courtoffortune.v1';
const DEFAULTS = { settings: { sound: true, music: true, coach: true, auto: true, mat: 'petate', beans: 'maize' },
  stars: [], stats: { played: 0, won: 0, lost: 0, captures: 0 }, achievements: {}, practiceDone: false, saved: null };
const data = (() => {
  try {
    const s = JSON.parse(localStorage.getItem(KEY)) || {};
    return { ...DEFAULTS, ...s, settings: { ...DEFAULTS.settings, ...s.settings }, stats: { ...DEFAULTS.stats, ...s.stats } };
  } catch { return structuredClone(DEFAULTS); }
})();
const persist = () => { try { localStorage.setItem(KEY, JSON.stringify(data)); } catch {} };

const open = item => !!item && (item.unlock === null || !!data.achievements[item.unlock]);
const mat = () => MATS[open(MATS[data.settings.mat]) ? data.settings.mat : 'petate'];
const beanSet = () => BEANS[open(BEANS[data.settings.beans]) ? data.settings.beans : 'maize'];
const rivalOpen = i => (FULL_VERSION || i < DEMO_RIVALS) && (i === 0 || (data.stars[i - 1] || 0) > 0);
const levelOpen = i => FULL_VERSION || i < DEMO_LEVELS;
const achievementTitle = id => ACHIEVEMENTS.find(a => a.id === id).title;
const storeUrl = () => STORE_URL || (/^https:\/\/[^/]+\.itch\.io\//.test(document.referrer) ? document.referrer : '');

// ---------------------------------------------------------------- screens

function show(id) {
  document.querySelectorAll('.screen').forEach(el => el.classList.toggle('active', el.id === id));
  ({ menu: renderMenu, court: renderCourt, quick: renderQuick, rules: renderRules, achievements: renderAchievements, settings: renderSettings })[id]?.();
  if (id === 'game') requestAnimationFrame(resize);
}

function renderMenu() {
  $('#btn-resume').hidden = !data.saved;
  document.querySelectorAll('[data-demo]').forEach(el => { el.hidden = FULL_VERSION; });
}

const starsHTML = n => [0, 1, 2].map(i => `<span class="${i < n ? '' : 'off'}">★</span>`).join('');
const avatar = o => o.look ? `<span class="avatar">${portrait(o.look, o.color)}</span>`
  : `<span class="avatar" style="--glyph:${o.color || 'var(--stucco)'}">${o.glyph || o.name[0]}</span>`;

function renderCourt() {
  const total = data.stars.reduce((a, b) => a + (b || 0), 0);
  $('#court-stars').textContent = `★ ${total}/${RIVALS.length * 3}`;
  $('#rivals').innerHTML = RIVALS.map((r, i) => {
    const locked = !rivalOpen(i), paywall = !FULL_VERSION && i >= DEMO_RIVALS;
    const v = r.variant ? ` · ${VARIANT_INFO[r.variant].name}` : '';
    return `<li><button class="item" data-rival="${i}" ${locked && !paywall ? 'disabled' : ''}>${avatar(r)}
      <span class="item-body"><span class="item-name">${r.name}</span><span class="item-sub">${r.title}${v}</span>
        <div class="item-text">${paywall ? '<span class="paywall">Unlock in the full game</span>' : locked ? 'Beat the previous table to unlock' : r.blurb}</div></span>
      <span class="item-side">${locked ? '🔒' : `<span class="stars">${starsHTML(data.stars[i] || 0)}</span>`}</span></button></li>`;
  }).join('');
}

let quickLevel = 0, quickVariant = 'classic';
function renderQuick() {
  if (quickLevel >= 0 && !levelOpen(quickLevel)) quickLevel = 0;
  $('#variants').innerHTML = Object.keys(VARIANTS).map(v => `<button class="choice ${v === quickVariant ? 'selected' : ''}" data-variant="${v}">
    <span><span class="v-name">${VARIANT_INFO[v].name}</span><small>${VARIANT_INFO[v].text}</small></span></button>`).join('');
  $('#levels').innerHTML = `<button class="choice ${quickLevel < 0 ? 'selected' : ''}" data-level="-1"><span>A friend<small>Pass and play on this device</small></span></button>`
    + LEVELS.map((L, i) => `<button class="choice ${i === quickLevel ? 'selected' : ''}" data-level="${i}" ${levelOpen(i) ? '' : 'disabled'}>
      <span>${L.name} rival<small>${levelOpen(i) ? ['Takes risks and forgets danger', 'Plays sensibly', 'Weighs every risk'][i] : 'Full game 🔒'}</small></span></button>`).join('');
}

// How to Play: one card at a time, previous/next, the last card leads into the practice game.
let ruleAt = 0;
const GLYPHS = {
  beans: `<svg viewBox="0 0 150 110">${[0, 1, 2, 3, 4].map(i => `<g transform="translate(${18 + i * 28} ${42 + (i % 2) * 14}) rotate(${-20 + i * 12})"><ellipse rx="10" ry="16" fill="#f3e6c4" stroke="#b89b62" stroke-width="2"/>${i < 3 ? '<circle r="4.5" fill="#1b120c"/>' : ''}</g>`).join('')}<text x="75" y="104" text-anchor="middle" fill="#e2b35a" font-family="Cinzel,serif" font-weight="700" font-size="16">3 marks = 3 steps</text></svg>`,
  cross: `<svg viewBox="0 0 150 110"><g fill="#f1e3c0" stroke="#2a1a0c" stroke-width="1.5">${[[60, 5], [75, 5], [60, 20], [75, 20], [60, 35], [75, 35], [60, 65], [75, 65], [60, 80], [75, 80], [60, 95], [75, 95], [15, 50], [30, 50], [45, 50], [90, 50], [105, 50], [120, 50], [15, 35], [30, 35], [45, 35], [90, 35], [105, 35], [120, 35]].map(([x, y]) => `<rect x="${x}" y="${y - 5}" width="14" height="14" rx="2"/>`).join('')}</g><rect x="60" y="45" width="29" height="14" fill="#b5432e"/><path d="M68 52h36" stroke="#3f9a72" stroke-width="3" marker-end="url(#a)"/><defs><marker id="a" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto"><path d="M0 0L6 3L0 6z" fill="#3f9a72"/></marker></defs></svg>`,
  capture: `<svg viewBox="0 0 150 110"><circle cx="40" cy="55" r="16" fill="#3f9a72"/><circle cx="110" cy="55" r="16" fill="#17161c" stroke="#e2b35a" stroke-width="2"/><path d="M58 40q22-26 44 0" stroke="#e2b35a" stroke-width="3" fill="none" stroke-dasharray="5 4"/><circle cx="110" cy="55" r="22" fill="none" stroke="#c0453a" stroke-width="3"/></svg>`,
  sunskull: `<svg viewBox="0 0 150 110"><g transform="translate(42 55)"><circle r="16" fill="#e2b35a" stroke="#3a1c06" stroke-width="2"/>${[0, 1, 2, 3, 4, 5, 6, 7].map(i => `<path d="M0 -20v-8" stroke="#e2b35a" stroke-width="3" transform="rotate(${i * 45})"/>`).join('')}</g><g transform="translate(108 52)"><circle r="17" fill="#f1e3c0" stroke="#2a1a0c" stroke-width="2"/><rect x="-9" y="12" width="18" height="10" fill="#f1e3c0" stroke="#2a1a0c" stroke-width="2"/><circle cx="-6" cy="-1" r="4.5" fill="#2a1a0c"/><circle cx="6" cy="-1" r="4.5" fill="#2a1a0c"/></g></svg>`,
  beads: `<svg viewBox="0 0 150 110">${[0, 1, 2, 3, 4, 5].map(i => `<circle cx="${25 + i * 20}" cy="${55 + Math.sin(i) * 8}" r="9" fill="#3f9a72" stroke="#0f3d2a" stroke-width="2"/>`).join('')}</svg>`,
};
function renderRules() {
  const r = RULES[ruleAt], last = ruleAt === RULES.length - 1;
  $('#rule-count').textContent = `${ruleAt + 1} / ${RULES.length}`;
  $('#rule-card').innerHTML = `${GLYPHS[r.glyph]}<h3>${r.title}</h3><p>${r.text}</p>`;
  $('#rule-prev').disabled = ruleAt === 0;
  $('#rule-next').textContent = last ? 'Play a practice game' : 'Next ›';
}

const matSwatch = m => `<div class="swatch" style="background:repeating-linear-gradient(45deg, ${m.weave[0]} 0 6px, ${m.weave[1]} 6px 12px)">
  <span style="width:18px;height:18px;background:${m.square};border:2px solid ${m.ink}"></span><span style="width:18px;height:18px;background:${m.temple};border:2px solid ${m.ink}"></span></div>`;
const beanSwatch = b => `<div class="swatch" style="background:rgba(0,0,0,.3)">${[1, 0, 1].map(mk => `<span class="bean ${mk ? 'marked' : ''}" style="--bean:${b.bean};--bean-edge:${b.edge};--bean-mark:${b.mark}"></span>`).join('')}</div>`;

function renderAchievements() {
  $('#ach-count').textContent = `${ACHIEVEMENTS.filter(a => data.achievements[a.id]).length}/${ACHIEVEMENTS.length}`;
  $('#ach-list').innerHTML = ACHIEVEMENTS.map(a => {
    const r = reward(a.id), done = !!data.achievements[a.id], item = r.kind === 'mat' ? MATS[r.key] : BEANS[r.key];
    return `<li class="item ${done ? 'done' : ''}"><div style="width:64px;flex:none">${r.kind === 'mat' ? matSwatch(item) : beanSwatch(item)}</div>
      <div class="item-body"><span class="item-name">${a.title}</span><div class="item-text">${a.text}</div>
        <div class="item-prize">${done ? 'Unlocked' : 'Reward'}: ${r.kind === 'mat' ? 'mat' : 'beans'} · ${r.name}${!done && a.full && !FULL_VERSION ? ' <span class="paywall">Full game</span>' : ''}</div></div>
      <span class="tick ${done ? 'ok' : ''}">${done ? '✓' : ''}</span></li>`;
  }).join('');
}

function renderSettings() {
  document.querySelectorAll('[data-setting]').forEach(el => { el.checked = data.settings[el.dataset.setting]; });
  const lock = item => `<small>🔒 ${achievementTitle(item.unlock)}</small>`;
  $('#mats').innerHTML = Object.entries(MATS).map(([k, m]) => `<button class="swatch-btn ${k === data.settings.mat ? 'selected' : ''}" data-mat="${k}" ${open(m) ? '' : 'disabled'}>${matSwatch(m)}${m.name}${open(m) ? '' : lock(m)}</button>`).join('');
  $('#beansets').innerHTML = Object.entries(BEANS).map(([k, b]) => `<button class="swatch-btn ${k === data.settings.beans ? 'selected' : ''}" data-beans="${k}" ${open(b) ? '' : 'disabled'}>${beanSwatch(b)}${b.name}${open(b) ? '' : lock(b)}</button>`).join('');
  const s = data.stats;
  $('#stats').innerHTML = [['Played', s.played], ['Won', s.won], ['Lost', s.lost], ['Captures', s.captures]].map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join('');
}

function applyBeans() {
  const b = beanSet(), tray = $('#tray');
  tray.style.setProperty('--bean', b.bean); tray.style.setProperty('--bean-edge', b.edge); tray.style.setProperty('--bean-mark', b.mark);
}

// ---------------------------------------------------------------- achievements

function checkAchievements(event) {
  const ids = earned(data, event);
  if (!ids.length) return;
  ids.forEach(id => { data.achievements[id] = Date.now(); });
  persist();
  ids.forEach(id => toast(id));
}
const toasts = [];
function toast(id) { toasts.push(id); if (toasts.length === 1) nextToast(); }
function nextToast() {
  if (!toasts.length) return;
  const id = toasts[0], r = reward(id), item = r.kind === 'mat' ? MATS[r.key] : BEANS[r.key], el = $('#toast');
  el.innerHTML = `${r.kind === 'mat' ? matSwatch(item) : beanSwatch(item)}<div><b>Achievement: ${achievementTitle(id)}</b>New ${r.kind === 'mat' ? 'mat' : 'beans'} unlocked: ${r.name}</div>`;
  el.hidden = false; el.classList.remove('show'); void el.offsetWidth; el.classList.add('show');
  sfx.unlock();
  setTimeout(() => { el.hidden = true; toasts.shift(); nextToast(); }, 3600);
}

// ---------------------------------------------------------------- board drawing

const canvas = $('#board'), ctx = canvas.getContext('2d');
let V = { size: 0, c: 0, o: 0, dpr: 1 }, layer = { key: '', cv: null };

function resize() {
  const play = $('#play'), wrap = canvas.parentElement;
  const others = [...play.children].filter(el => el !== wrap && !el.classList.contains('say')).reduce((h, el) => h + (el.hidden ? 0 : el.offsetHeight + 6), 0);
  const size = Math.max(220, Math.floor(Math.min(play.clientWidth, play.clientHeight - others)));
  const dpr = Math.min(3, window.devicePixelRatio || 1);
  if (size === V.size && dpr === V.dpr) return;
  canvas.style.width = canvas.style.height = size + 'px';
  canvas.width = canvas.height = Math.round(size * dpr);
  const c = size / 10.5;
  V = { size, c, o: (size - 10 * c) / 2, dpr };
}

const cellXY = ([r, cc]) => [V.o + (cc + 0.5) * V.c, V.o + (r + 0.5) * V.c];
const sqXY = sq => cellXY(TRACK[sq]);

function rng(seed) { return () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; }; }

function sunGlyph(c, x, y, r, m) {
  c.fillStyle = m.accent; c.strokeStyle = m.ink; c.lineWidth = r * 0.12;
  for (let i = 0; i < 8; i++) {
    const a = i * Math.PI / 4;
    c.beginPath(); c.moveTo(x + Math.cos(a - 0.18) * r * 0.6, y + Math.sin(a - 0.18) * r * 0.6);
    c.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r); c.lineTo(x + Math.cos(a + 0.18) * r * 0.6, y + Math.sin(a + 0.18) * r * 0.6); c.fill();
  }
  c.beginPath(); c.arc(x, y, r * 0.55, 0, 7); c.fill(); c.stroke();
}
function skullGlyph(c, x, y, r, m) {
  c.fillStyle = '#f6efe0'; c.strokeStyle = m.ink; c.lineWidth = r * 0.12;
  c.beginPath(); c.arc(x, y - r * 0.12, r * 0.62, Math.PI * 0.85, Math.PI * 2.15); c.lineTo(x + r * 0.36, y + r * 0.6); c.lineTo(x - r * 0.36, y + r * 0.6); c.closePath(); c.fill(); c.stroke();
  c.fillStyle = m.ink;
  c.beginPath(); c.arc(x - r * 0.24, y - r * 0.1, r * 0.17, 0, 7); c.arc(x + r * 0.24, y - r * 0.1, r * 0.17, 0, 7); c.fill();
  c.fillRect(x - r * 0.04, y + r * 0.3, r * 0.08, r * 0.3);
}
function templeGlyph(c, x, y, r, m) {
  c.fillStyle = 'rgba(255,240,210,.85)';
  for (let i = 0; i < 3; i++) c.fillRect(x - r * (0.6 - i * 0.18), y + r * (0.35 - i * 0.28), r * (1.2 - i * 0.36), r * 0.24);
}

function boardLayer() {
  const m = mat(), key = `${m.name}|${V.size}|${V.dpr}`;
  if (layer.key === key) return layer.cv;
  const { size, c, o, dpr } = V, cv = document.createElement('canvas');
  cv.width = cv.height = Math.round(size * dpr);
  const g = cv.getContext('2d'), rand = rng(11);
  g.scale(dpr, dpr);
  // woven mat
  g.save();
  g.beginPath(); g.roundRect(2, 2, size - 4, size - 4, c * 0.5); g.clip();
  g.fillStyle = m.weave[0]; g.fillRect(0, 0, size, size);
  const band = c * 0.42;
  g.save(); g.translate(size / 2, size / 2); g.rotate(Math.PI / 4);
  for (let i = -size; i < size; i += band * 2) { g.fillStyle = m.weave[1]; g.fillRect(i, -size, band, size * 2); }
  for (let j = -size; j < size; j += band * 2) for (let i = -size; i < size; i += band * 2) {
    g.fillStyle = m.weave[0]; g.globalAlpha = 0.9; g.fillRect(i, j, band, band);
  }
  g.restore();
  g.globalAlpha = 0.1;
  for (let i = 0; i < 900; i++) { g.fillStyle = rand() < 0.5 ? '#000' : '#fff'; g.fillRect(rand() * size, rand() * size, 1.5, 1.5); }
  g.globalAlpha = 1;
  g.restore();
  g.strokeStyle = 'rgba(0,0,0,.35)'; g.lineWidth = 3; g.beginPath(); g.roundRect(2, 2, size - 4, size - 4, c * 0.5); g.stroke();
  // track
  const pad = c * 0.06;
  TRACK.forEach(([r, cc], i) => {
    const x = o + cc * c + pad, y = o + r * c + pad, w = c - 2 * pad;
    g.fillStyle = 'rgba(0,0,0,.3)'; g.beginPath(); g.roundRect(x + 1.5, y + 2.5, w, w, c * 0.12); g.fill();
    g.fillStyle = KIND[i] === 'temple' ? m.temple : m.square;
    g.beginPath(); g.roundRect(x, y, w, w, c * 0.12); g.fill();
    g.strokeStyle = m.ink; g.lineWidth = Math.max(1.2, c * 0.04); g.stroke();
    const [cx, cy] = cellXY([r, cc]);
    if (KIND[i] === 'sun') sunGlyph(g, cx, cy, c * 0.34, m);
    else if (KIND[i] === 'skull') skullGlyph(g, cx, cy, c * 0.3, m);
    else if (KIND[i] === 'temple') templeGlyph(g, cx, cy, c * 0.3, m);
    else { // a faint chevron pointing the way round
      const [nx, ny] = sqXY((i + 1) % LAP), a = Math.atan2(ny - cy, nx - cx);
      g.save(); g.translate(cx, cy); g.rotate(a); g.strokeStyle = m.ink; g.globalAlpha = 0.18; g.lineWidth = c * 0.06;
      g.beginPath(); g.moveTo(-c * 0.1, -c * 0.14); g.lineTo(c * 0.06, 0); g.lineTo(-c * 0.1, c * 0.14); g.stroke(); g.restore();
    }
  });
  // where each side enters
  for (const pl of [P1, P2]) {
    const [x, y] = sqXY(ENTRY[pl]);
    g.strokeStyle = pl === P1 ? '#7fe0b1' : '#e2b35a'; g.lineWidth = c * 0.06; g.setLineDash([c * 0.1, c * 0.08]);
    g.beginPath(); g.arc(x, y, c * 0.44, 0, 7); g.stroke(); g.setLineDash([]);
  }
  layer = { key, cv };
  return cv;
}

function drawStone(x, y, pl, scale = 1, alpha = 1) {
  const r = V.c * 0.36 * scale;
  ctx.save(); ctx.globalAlpha = alpha;
  ctx.shadowColor = 'rgba(0,0,0,.5)'; ctx.shadowBlur = r * 0.5; ctx.shadowOffsetY = r * 0.25;
  const g = ctx.createRadialGradient(x - r * 0.3, y - r * 0.35, r * 0.05, x, y, r);
  if (pl === P1) { g.addColorStop(0, '#d4ffe6'); g.addColorStop(0.5, '#3f9a6c'); g.addColorStop(1, '#123e2b'); }
  else { g.addColorStop(0, '#8a8a98'); g.addColorStop(0.5, '#1d1c24'); g.addColorStop(1, '#000'); }
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill();
  ctx.shadowColor = 'transparent';
  ctx.strokeStyle = pl === P1 ? 'rgba(220,255,235,.55)' : '#e2b35a'; ctx.lineWidth = r * 0.12;
  ctx.beginPath(); ctx.arc(x, y, r * 0.92, 0, 7); ctx.stroke();
  ctx.globalAlpha = alpha * 0.6; ctx.fillStyle = '#fff';
  ctx.beginPath(); ctx.ellipse(x - r * 0.32, y - r * 0.4, r * 0.3, r * 0.13, -0.6, 0, 7); ctx.fill();
  ctx.restore();
}

let anim = null, particles = [];

function draw(now) {
  const { size, c, dpr } = V;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(boardLayer(), 0, 0);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  if (!G) return;
  const s = G.state, pulse = 0.5 + 0.5 * Math.sin(now / 240);

  if (G.last && !anim) for (const sq of G.last) {
    const [x, y] = sqXY(sq);
    ctx.fillStyle = 'rgba(255,255,255,.25)'; ctx.beginPath(); ctx.arc(x, y, c * 0.42, 0, 7); ctx.fill();
  }

  // the player's choices: destination ghosts, and a ring on each stone that can move
  const choosing = G.moves.length && !anim && !G.busy;
  if (choosing) G.moves.forEach(m => {
    const tip = G.tip && G.tip.index === m.index;
    if (!m.home) {
      const [x, y] = sqXY(square(s.turn, m.to));
      ctx.globalAlpha = 0.35 + 0.25 * pulse; drawStone(x, y, s.turn, 0.85, 0.5); ctx.globalAlpha = 1;
      ctx.strokeStyle = m.capture ? '#ff5a3c' : '#fff6dc'; ctx.lineWidth = c * 0.07; ctx.setLineDash([c * 0.12, c * 0.08]);
      ctx.beginPath(); ctx.arc(x, y, c * 0.45, 0, 7); ctx.stroke(); ctx.setLineDash([]);
    }
    if (m.from > 0) {
      const [x, y] = sqXY(square(s.turn, m.from));
      ctx.strokeStyle = tip ? '#7fe0b1' : '#f2c14e'; ctx.lineWidth = c * 0.08;
      ctx.globalAlpha = 0.55 + 0.45 * pulse; ctx.beginPath(); ctx.arc(x, y, c * 0.47, 0, 7); ctx.stroke();
      const k = (now / 900) % 1; ctx.globalAlpha = 0.8 * (1 - k); ctx.beginPath(); ctx.arc(x, y, c * (0.47 + 0.3 * k), 0, 7); ctx.stroke();
      ctx.globalAlpha = 1;
      if (m.home) { ctx.fillStyle = '#f2c14e'; ctx.font = `700 ${c * 0.28}px Cinzel, serif`; ctx.textAlign = 'center'; ctx.fillText('HOME', x, y - c * 0.55); }
    }
  });

  for (const pl of [P1, P2]) s.stones[pl].forEach((p, i) => {
    if (!onBoard(p) || (anim && anim.player === pl && anim.index === i)) return;
    const [x, y] = sqXY(square(pl, p));
    if (anim && anim.victim && anim.victim.player === pl && anim.victim.index === i && anim.p > 0.9) {
      const k = (anim.p - 0.9) / 0.1; drawStone(x, y, pl, 1 - 0.5 * k, 1 - k);
    } else drawStone(x, y, pl);
  });

  if (anim) {
    const p = anim.p = Math.min(1, (now - anim.t0) / anim.dur);
    const n = anim.pts.length - 1, f = p * n, i = Math.min(n - 1, Math.floor(f)), k = f - i;
    const [ax, ay] = anim.pts[Math.max(0, i)], [bx, by] = anim.pts[Math.min(n, i + 1)];
    const hop = Math.sin(Math.PI * k) * c * 0.35;
    if (anim.hops !== i) { anim.hops = i; if (i > 0 || n === 0) sfx.hop(); }
    drawStone(ax + (bx - ax) * k, ay + (by - ay) * k - hop, anim.player, 1 + 0.1 * Math.sin(Math.PI * k), anim.fade ? 1 - Math.max(0, p - 0.8) * 5 : 1);
    if (p >= 1) { const done = anim.done; anim = null; done(); }
  }

  particles = particles.filter(q => (q.life -= 0.016) > 0);
  particles.forEach(q => {
    q.x += q.vx; q.y += q.vy; q.vy += 0.15;
    ctx.globalAlpha = Math.max(0, q.life); ctx.fillStyle = q.color; ctx.beginPath(); ctx.arc(q.x, q.y, q.r, 0, 7); ctx.fill();
  });
  ctx.globalAlpha = 1;
}

function burst(x, y, colors) {
  for (let i = 0; i < 26; i++) {
    const a = Math.random() * 7, v = (1 + Math.random() * 3.5) * V.c / 40;
    particles.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 1, r: V.c * (0.03 + Math.random() * 0.05), life: 0.6 + Math.random() * 0.5, color: colors[i % colors.length] });
  }
}

function loop(now) {
  if ($('#game').classList.contains('active') && V.size) draw(now);
  requestAnimationFrame(loop);
}

// ---------------------------------------------------------------- match flow

let G = null, token = 0;
const human = pl => G.mode === 'pass' || pl === P1;

function startMatch(cfg) {
  const variant = cfg.variant || 'classic';
  G = { mode: 'ai', level: 0, rival: null, practice: false, ...cfg, variant, state: cfg.state || newGame(variant),
    moves: [], busy: false, last: null, tip: null, learned: new Set(), counts: { caps: 0, suns: 0, lost: 0 } };
  G.token = ++token;
  G.startBeads = VARIANTS[variant].beads;
  $('#overlay').hidden = true; $('#say').hidden = true;
  setTray(null, '');
  show('game');
  refresh();
  if (G.rival !== null && !cfg.state) introduce(G.rival);
  else if (variant !== 'classic' && !cfg.state) explainVariant(variant);
  else next();
}

const rivalInfo = () => G.rival !== null ? RIVALS[G.rival]
  : { name: G.practice ? 'Temple Guide' : `${LEVELS[G.level]?.name || ''} rival`, color: '#c9b27c', glyph: G.practice ? 'G' : (LEVELS[G.level]?.name || 'R')[0] };

function chip(el, pl, label, av) {
  const s = G.state, active = s.phase !== 'over' && s.turn === pl;
  el.classList.toggle('active', active);
  const thinking = active && !human(pl) && G.busy ? '<span class="thinking"><i></i><i></i><i></i></span>' : '';
  const pieces = s.stones[pl].map(p => `<span class="piece p${pl} ${p > LAP ? 'homed' : onBoard(p) ? 'ghost' : ''}"></span>`).join('');
  el.innerHTML = `${av}<div><div class="name">${label}${thinking}</div><div class="sub"><span class="pieces" title="In hand / on board / home">${pieces}</span>
    <span>${s.stones[pl].filter(p => p > LAP).length}/${s.stones[pl].length} home</span></div></div>
    <div class="jade" id="jade-${pl}"><span class="jade-bead"></span>${s.beads[pl]}</div>`;
}

function refresh() {
  const s = G.state;
  if (G.mode === 'pass') {
    chip($('#chip-top'), P2, SIDE[P2], `<span class="avatar" style="--glyph:#3a3a44;color:#e2b35a">O</span>`);
    chip($('#chip-bottom'), P1, SIDE[P1], `<span class="avatar you">J</span>`);
  } else {
    chip($('#chip-top'), P2, rivalInfo().name, avatar(rivalInfo()));
    chip($('#chip-bottom'), P1, 'You', `<span class="avatar you">★</span>`);
  }
  const v = G.variant !== 'classic' ? ` · ${VARIANT_INFO[G.variant].name}` : '';
  $('#game-title').textContent = (G.practice ? 'Practice' : G.mode === 'pass' ? 'Pass & Play' : G.rival !== null ? 'The Court' : 'Quick Play') + v;
  const myThrow = s.phase === 'throw' && human(s.turn) && !G.busy;
  const btn = $('#btn-throw');
  btn.disabled = !myThrow;
  btn.classList.toggle('ready', myThrow);
  btn.textContent = G.mode === 'pass' && myThrow ? `${SIDE[s.turn]}: throw` : 'Throw the beans';
  coach();
  resize();
}

function status(text, go = false) {
  const el = $('#status');
  el.textContent = text;
  el.classList.toggle('go', go);
}

function setTray(beans, label) {
  [...document.querySelectorAll('#tray .bean')].forEach((b, i) => {
    b.classList.toggle('marked', !!beans?.[i]);
    b.classList.remove('tumble');
  });
  $('#result').innerHTML = label;
}

// What to do next, from the state: wait for the player, or let the computer act.
function next() {
  const s = G.state, tk = G.token;
  G.moves = []; G.tip = null;
  if (s.phase === 'over') return finish();
  if (s.phase === 'throw') {
    if (human(s.turn)) {
      const again = G.again ? 'Sun! Throw again: ' : '';
      G.again = false;
      status(G.mode === 'pass' ? `${again}${SIDE[s.turn]} to throw` : `${again || 'Your turn: '}tap Throw the beans`, true);
      refresh();
    } else {
      G.busy = true; refresh(); status(`${rivalInfo().name} throws…`);
      wait(450).then(() => tk === G.token && doThrow());
    }
    return;
  }
  const moves = legalMoves(s);
  if (human(s.turn)) {
    G.moves = moves;
    G.tip = G.practice ? advise(s)?.move : null;
    const n = s.steps;
    status(moves.some(m => m.from === 0) && moves.length === 1 ? `Move ${n}: tap the glowing square to bring a stone in`
      : `Move ${n}: tap a glowing stone`, true);
    refresh();
    if (moves.length === 1 && data.settings.auto && !G.practice) {
      G.busy = true;
      wait(700).then(() => tk === G.token && doMove(moves[0]));
    }
  } else {
    G.busy = true; refresh();
    wait(380).then(() => tk === G.token && doMove(chooseMove(s, G.level)));
  }
}

async function doThrow() {
  const tk = G.token, mover = G.state.turn;
  G.busy = true; refresh();
  document.querySelectorAll('#tray .bean').forEach(b => b.classList.add('tumble'));
  $('#result').innerHTML = '';
  sfx.throw();
  await wait(560);
  if (tk !== G.token) return;
  const t = throwBeans();
  setTray(t.beans, t.steps ? `${t.steps}<small>${t.steps === 1 ? 'step' : 'steps'}</small>` : `0<small>silent</small>`);
  if (human(mover) && G.mode === 'ai') checkAchievements({ type: 'throw', steps: t.steps });
  if (t.steps === 10) sfx.sun();
  const { state, events } = applyThrow(G.state, t);
  if (events.length) {
    sfx.silent();
    const who = human(mover) ? (G.mode === 'pass' ? SIDE[mover] : 'You') : rivalInfo().name;
    status(events[0] === 'silent' ? `No marks: the gods are silent. ${who === 'You' ? 'Your' : who + '’s'} turn passes.`
      : `${who} can’t move ${t.steps}. The turn passes.`);
    await wait(1400);
    if (tk !== G.token) return;
  }
  G.state = state; G.busy = false;
  next();
}

// Animates a move hop by hop, then applies it and plays out its consequences.
async function doMove(m) {
  const tk = G.token, s = G.state, pl = s.turn;
  G.busy = true; G.moves = []; G.tip = null; refresh();
  const pts = [];
  for (let p = Math.max(1, m.from); p <= Math.min(m.to, LAP); p++) pts.push(sqXY(square(pl, p)));
  const homeChip = $(pl === P1 ? '#chip-bottom' : '#chip-top');
  if (m.home) { const r = homeChip.getBoundingClientRect(), b = canvas.getBoundingClientRect(); pts.push([r.left + 30 - b.left, r.top + r.height / 2 - b.top]); }
  await new Promise(done => { anim = { player: pl, index: m.index, pts, t0: performance.now(), dur: Math.max(220, (pts.length - 1) * 115), victim: m.capture, fade: m.home, done }; });
  if (tk !== G.token) return;
  const { state, events } = applyMove(s, m);
  G.last = m.home ? [square(pl, m.from)] : [m.from ? square(pl, m.from) : square(pl, 1), square(pl, m.to)].filter(x => x !== undefined);
  G.state = state;
  for (const e of events) await consequence(e, pl, m);
  if (tk !== G.token) return;
  G.busy = false;
  saveMatch();
  next();
}

async function consequence(e, pl, m) {
  const tk = G.token, me = human(pl) && G.mode === 'ai', them = !human(pl) && G.mode === 'ai';
  const type = typeof e === 'string' ? e : e.type;
  refresh();
  if (type === 'capture') {
    const [x, y] = sqXY(square(pl, m.to));
    burst(x, y, ['#ff5a3c', '#e2b35a', '#fff']);
    sfx.capture(); navigator.vibrate?.(30);
    if (me) { G.counts.caps++; data.stats.captures++; checkAchievements({ type: 'capture', count: G.counts.caps }); }
    if (them) G.counts.lost++;
    if (G.rival !== null) say(pick(RIVALS[G.rival].lines[them ? 'capture' : 'captured']));
    status(`${who(pl)} captured! A stone goes back to hand.`);
    learn('capture', 'A capture sends the enemy stone back to their hand, and a jade bead moves to the captor.');
    await flyBeads(other(pl), pl, e.beads);
  } else if (type === 'sun') {
    sfx.sun();
    const [x, y] = sqXY(square(pl, m.to)); burst(x, y, ['#fff3b0', '#e2b35a']);
    if (me) { G.counts.suns++; checkAchievements({ type: 'sun', count: G.counts.suns }); }
    if (them && G.rival !== null) say(pick(RIVALS[G.rival].lines.sun));
    status(`Sun! ${who(pl)} ${human(pl) && G.mode !== 'pass' ? 'throw' : 'throws'} again.`, human(pl));
    G.again = human(pl);
    learn('sun', 'A sun at the end of an arm gives another throw.');
    await wait(500);
  } else if (type === 'skull') {
    sfx.skull();
    if (me && G.rival !== null) say(pick(RIVALS[G.rival].lines.skull));
    status(`Skull! ${who(pl)} ${human(pl) && G.mode !== 'pass' ? 'pay' : 'pays'} the rival.`);
    learn('skull', 'A skull square costs a jade bead, paid to your rival.');
    await flyBeads(pl, other(pl), e.beads);
  } else if (type === 'home') {
    sfx.unlock();
    status(`${who(pl)} brought a stone home!`);
    learn('home', 'A stone that runs the full lap comes home and wins a bead. Bring them all home to win.');
    await flyBeads(other(pl), pl, e.beads);
  }
  if (tk !== G.token) return;
}

const who = pl => G.mode === 'pass' ? SIDE[pl] : human(pl) ? 'You' : rivalInfo().name;

// Jade beads fly from one player's purse to the other's.
async function flyBeads(from, to, n) {
  if (!n) return;
  const a = $(`#jade-${from}`).getBoundingClientRect(), b = $(`#jade-${to}`).getBoundingClientRect();
  for (let i = 0; i < n; i++) {
    const el = document.createElement('div');
    el.className = 'flying-bead';
    el.style.left = `${a.left}px`; el.style.top = `${a.top}px`;
    document.body.appendChild(el);
    requestAnimationFrame(() => { el.style.transform = `translate(${b.left - a.left}px, ${b.top - a.top}px) scale(1.3)`; });
    setTimeout(() => { el.remove(); sfx.bead(); }, 700);
    await wait(180);
  }
  await wait(600);
  refresh();
}

let sayTimer = 0;
function say(text) {
  const el = $('#say');
  el.textContent = `“${text}”`;
  el.style.top = ($('#chip-top').offsetTop + $('#chip-top').offsetHeight - 4) + 'px';
  el.hidden = false; el.classList.remove('pop'); void el.offsetWidth; el.classList.add('pop');
  clearTimeout(sayTimer);
  sayTimer = setTimeout(() => { el.hidden = true; }, 2600);
}

// ---------------------------------------------------------------- coach

const COACH_TIPS = [
  'Stones on the red temple squares in the middle can never be captured.',
  'An enemy one to four squares behind your stone can hit it. Ten behind, too, if all five beans land marked.',
  'Spreading out gives you more choices each throw. A stone stuck behind your own stone cannot move.',
  'The suns sit at the far end of each arm. Aim for them: an extra throw is worth a lot.',
  'Every bead counts. Run your rival out of jade and you win, however far behind your stones are.',
];

// Practice game only: the first time something happens, say what it means.
function learn(key, text) {
  if (!G.practice || G.learned.has(key)) return;
  G.learned.add(key);
  G.lesson = text;
}

function coach() {
  const el = $('#coach'), s = G.state;
  const on = (data.settings.coach || G.practice) && G.mode === 'ai';
  el.hidden = !on;
  if (!on) return;
  let kind = 'tip', text;
  if (G.lesson) { kind = 'learn'; text = G.lesson; }
  if (!text && s.phase === 'throw' && human(s.turn)) {
    kind = G.practice ? 'learn' : 'tip';
    text = G.practice && !G.learned.has('throw') ? 'Tap Throw the beans. Each marked bean is one step; all five marked is ten.'
      : COACH_TIPS[(s.ply >> 1) % COACH_TIPS.length];
  }
  if (!text && s.phase === 'move' && human(s.turn) && G.moves.length) {
    const a = advise(s);
    if (G.practice && !G.learned.has('enter') && G.moves.some(m => m.from === 0)) { kind = 'learn'; text = 'Your stones start in your hand. Tap the glowing square to bring one onto your temple and on along the cross.'; }
    else if (a.why === 'capture') { kind = 'good'; text = 'You can capture! Land exactly on the enemy stone to send it back and take their jade.'; }
    else if (a.why === 'home') { kind = 'good'; text = 'This throw can bring a stone home.'; }
    else if (a.why === 'sun') { kind = 'good'; text = 'You can land on a sun: that means another throw.'; }
    else if (a.why === 'escape') { kind = 'warn'; text = 'One of your stones is within reach of an enemy. Move it on, or into a temple.'; }
    else if (a.why === 'skull') { kind = 'warn'; text = 'Careful: one of your moves lands on a skull and costs a bead.'; }
    else text = G.practice ? 'The green ring shows the coach’s pick. Any glowing stone is allowed.' : COACH_TIPS[(s.ply >> 1) % COACH_TIPS.length];
  }
  if (!text) text = `${rivalInfo().name} is playing…`;
  el.className = `coach ${kind}`;
  el.innerHTML = `<b>${kind === 'learn' ? 'Rule' : 'Coach'}</b>${text}`;
  if (G.lesson && s.phase === 'throw' && human(s.turn)) setTimeout(() => { G.lesson = null; }, 0);
}

// ---------------------------------------------------------------- input

canvas.addEventListener('pointerdown', e => {
  unlockAudio();
  if (!G || G.busy || !G.moves.length) return;
  const r = canvas.getBoundingClientRect();
  const col = Math.floor((e.clientX - r.left - V.o) / V.c), row = Math.floor((e.clientY - r.top - V.o) / V.c);
  const sq = TRACK.findIndex(([a, b]) => a === row && b === col);
  if (sq < 0) return;
  const pl = G.state.turn;
  const m = G.moves.find(x => (!x.home && square(pl, x.to) === sq) || (x.from > 0 && square(pl, x.from) === sq));
  if (m) { G.learned.add('enter'); doMove(m); } else sfx.nope();
});
$('#chip-bottom').addEventListener('click', () => {
  const m = G?.moves.find(x => x.from === 0);
  if (m && !G.busy && human(G.state.turn) && G.state.turn === P1) { G.learned.add('enter'); doMove(m); }
});
$('#btn-throw').addEventListener('click', () => {
  unlockAudio();
  if (!G || G.busy || G.state.phase !== 'throw' || !human(G.state.turn)) return;
  G.learned.add('throw');
  doThrow();
});

// ---------------------------------------------------------------- start, save, finish

function saveMatch() {
  data.saved = !G.practice && G.state.phase !== 'over'
    ? { mode: G.mode, level: G.level, rival: G.rival, variant: G.variant, state: G.state } : null;
  persist();
}

function introduce(i) {
  const r = RIVALS[i];
  sfx.rival();
  $('#card').className = 'card rival';
  $('#card').innerHTML = `<div class="card-portrait">${portrait(r.look, r.color)}</div>
    <p class="label">${r.title}</p><h2>${r.name}</h2><p class="quote">“${pick(r.lines.intro)}”</p>
    ${r.variant ? `<p class="rules"><b>${VARIANT_INFO[r.variant].name}.</b> ${VARIANT_INFO[r.variant].text}</p>` : ''}
    <div class="stack"><button class="btn primary" data-begin>Take your seat</button></div>`;
  $('#overlay').hidden = false;
}

function explainVariant(v) {
  $('#card').className = 'card';
  $('#card').innerHTML = `<p class="label">Rules</p><h2>${VARIANT_INFO[v].name}</h2><p>${VARIANT_INFO[v].text}</p>
    <div class="stack"><button class="btn primary" data-begin>Begin</button></div>`;
  $('#overlay').hidden = false;
}

function overlay(html) {
  setTimeout(() => { $('#card').className = 'card'; $('#card').innerHTML = html; wireBuy(); $('#overlay').hidden = false; }, 700);
}

function finish() {
  const res = winner(G.state), s = G.state;
  G.moves = []; refresh(); saveMatch();
  const why = res.reason === 'home' ? 'All stones home.' : 'The other purse is empty.';
  if (G.mode === 'pass') {
    sfx.win();
    return overlay(`<h2>${SIDE[res.winner]} wins</h2><p>${why}</p><div class="stack"><button class="btn primary" data-again>Play again</button><button class="btn ghost" data-go="menu">Menu</button></div>`);
  }
  const won = res.winner === P1;
  (won ? sfx.win : sfx.lose)();
  if (G.practice) {
    if (won) { data.practiceDone = true; persist(); checkAchievements(); }
    return overlay(`<h2>${won ? 'You know the game' : 'Close one'}</h2><p>${won ? 'Now take your seat in the Court. The gamblers are waiting.' : 'Luck turns. Try again, or go straight to the Court.'}</p>
      <div class="stack"><button class="btn primary" data-go="court">Enter the Court</button>${won ? '' : '<button class="btn" data-practice>Practise again</button>'}<button class="btn ghost" data-go="menu">Menu</button></div>`);
  }
  data.stats.played++; data.stats[won ? 'won' : 'lost']++;
  persist();
  checkAchievements({ type: 'game', won, lost: G.counts.lost, variant: G.variant });
  const beads = s.beads[P1];
  if (G.rival !== null) {
    const i = G.rival, r = RIVALS[i];
    const stars = won ? (beads >= G.startBeads + 3 ? 3 : beads >= G.startBeads ? 2 : 1) : 0;
    data.stars[i] = Math.max(data.stars[i] || 0, stars);
    persist(); checkAchievements();
    const nextBtn = !won ? `<button class="btn primary" data-rival="${i}">Try again</button>`
      : i + 1 >= RIVALS.length ? `<button class="btn primary" data-go="court">The Court is yours</button>`
      : !FULL_VERSION && i + 1 >= DEMO_RIVALS ? `<a class="btn primary" href="#" data-buy>Unlock all 6 rivals</a>`
      : `<button class="btn primary" data-rival="${i + 1}">Next table: ${RIVALS[i + 1].name}</button>`;
    return overlay(`<div class="card-portrait">${portrait(r.look, r.color)}</div>
      <p class="quote">“${pick(won ? r.lines.lose : r.lines.win)}”<span>${r.name}</span></p>
      <h2>${won ? 'Fortune favours you' : 'Your purse is lighter'}</h2>
      ${won ? `<div class="stars">${starsHTML(stars)}</div>` : ''}
      <p>${why} You end with ${beads} jade bead${beads === 1 ? '' : 's'}.${won && stars < 3 ? ` Finish with ${G.startBeads + 3} or more for three stars.` : ''}</p>
      <div class="stack">${nextBtn}${won ? `<button class="btn" data-rival="${i}">Replay</button>` : ''}<button class="btn ghost" data-go="court">The Court</button></div>`);
  }
  overlay(`<h2>${won ? 'You win!' : 'You lose'}</h2><p>${why} You end with ${beads} jade bead${beads === 1 ? '' : 's'}.</p>
    <div class="stack"><button class="btn primary" data-again>Play again</button><button class="btn ghost" data-go="menu">Menu</button></div>`);
}

function leave(to = 'menu') {
  if (G) { G.token = ++token; anim = null; }
  $('#overlay').hidden = true;
  show(to);
}

function wireBuy() {
  const url = storeUrl();
  document.querySelectorAll('[data-buy]').forEach(a => { a.href = url || '#'; if (url) { a.target = '_blank'; a.rel = 'noopener'; } });
}

document.addEventListener('click', e => {
  const el = e.target.closest('button, a');
  if (!el) return;
  unlockAudio();
  const d = el.dataset;
  if ('buy' in d && !storeUrl()) { e.preventDefault(); return; }
  if (d.go) return leave(d.go);
  if ('goRules' in d) { ruleAt = 0; return leave('rules'); }
  if (d.rival !== undefined) {
    const i = +d.rival;
    if (!FULL_VERSION && i >= DEMO_RIVALS) { if (storeUrl()) window.open(storeUrl(), '_blank', 'noopener'); return; }
    return startMatch({ mode: 'ai', rival: i, level: RIVALS[i].level, variant: RIVALS[i].variant });
  }
  if ('begin' in d) { $('#overlay').hidden = true; return next(); }
  if ('again' in d) return startMatch({ mode: G.mode, level: G.level, variant: G.variant });
  if ('practice' in d) return startPractice();
  if (d.variant) { quickVariant = d.variant; return renderQuick(); }
  if (d.level !== undefined) { quickLevel = +d.level; return renderQuick(); }
  if (d.mat) { data.settings.mat = d.mat; persist(); return renderSettings(); }
  if (d.beans) { data.settings.beans = d.beans; persist(); applyBeans(); return renderSettings(); }
});

function startPractice() { startMatch({ mode: 'ai', level: 0, practice: true }); }

$('#rule-prev').onclick = () => { ruleAt = Math.max(0, ruleAt - 1); renderRules(); };
$('#rule-next').onclick = () => { if (ruleAt < RULES.length - 1) { ruleAt++; renderRules(); } else startPractice(); };
$('#btn-quick-start').onclick = () => startMatch(quickLevel < 0 ? { mode: 'pass', variant: quickVariant } : { mode: 'ai', level: quickLevel, variant: quickVariant });
$('#btn-resume').onclick = () => { const s = data.saved; startMatch({ ...s, state: s.state }); };
$('#btn-leave').onclick = () => leave(G && G.rival !== null && G.state.phase !== 'over' ? 'court' : 'menu');
$('#btn-reset').onclick = () => { $('#confirm-reset').hidden = false; };
$('#reset-no').onclick = () => { $('#confirm-reset').hidden = true; };
$('#reset-yes').onclick = () => {
  Object.assign(data, structuredClone(DEFAULTS)); persist();
  $('#confirm-reset').hidden = true; setSound(true); setMusic(true); applyBeans(); renderSettings();
};
document.querySelectorAll('[data-setting]').forEach(el => el.addEventListener('change', () => {
  data.settings[el.dataset.setting] = el.checked;
  if (el.dataset.setting === 'sound') setSound(el.checked);
  if (el.dataset.setting === 'music') { setMusic(el.checked); if (el.checked) unlockAudio(); }
  persist();
}));
new ResizeObserver(() => { if ($('#game').classList.contains('active')) resize(); }).observe($('#play'));

applyBeans();
checkAchievements();
setSound(data.settings.sound);
setMusic(data.settings.music);
wireBuy();
renderMenu();
if (!data.practiceDone && !data.saved && data.stats.played === 0) document.querySelector('[data-go="rules"]').classList.add('primary');
requestAnimationFrame(loop);
if ('serviceWorker' in navigator && location.protocol === 'https:') navigator.serviceWorker.register('sw.js').catch(() => {});

// Browser tests (?test) read the match and board geometry.
if (location.search.includes('test')) window.__fortune = () => ({ G, V, TRACK, square, doMove, next, legalMoves });
