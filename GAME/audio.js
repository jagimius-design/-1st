// Sound effects and background music, synthesised with Web Audio in the spirit of ancient
// Mesoamerican instruments: clay ocarina, slit drum (teponaztli), seed rattle, rain stick and conch.
// No audio files to ship or license.
let ctx = null, sfxBus = null, musicBus = null, noiseBuf = null;
let sfxOn = true, musicOn = true, musicTimer = null;

export const setSound = on => { sfxOn = on; };
export function setMusic(on) {
  musicOn = on;
  if (on) startMusic(); else stopMusic();
}

export function unlockAudio() {
  if (!ctx) {
    try { ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch { return; }
    sfxBus = ctx.createGain(); sfxBus.connect(ctx.destination);
    musicBus = ctx.createGain(); musicBus.gain.value = 0; musicBus.connect(ctx.destination);
    noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  }
  if (ctx.state === 'suspended') ctx.resume();
  if (musicOn) startMusic();
}

// ---------------------------------------------------------------- instruments

function env(g, t, attack, peak, dur) {
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(peak, t + attack);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
}

function noise(bus, t, dur, { vol = 0.2, type = 'bandpass', freq = 2000, to = freq, q = 1, attack = 0.004 } = {}) {
  const src = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain();
  src.buffer = noiseBuf;
  f.type = type; f.Q.value = q;
  f.frequency.setValueAtTime(freq, t);
  if (to !== freq) f.frequency.exponentialRampToValueAtTime(to, t + dur);
  env(g, t, attack, vol, dur);
  src.connect(f).connect(g).connect(bus);
  src.start(t, Math.random() * 1.5);
  src.stop(t + dur + 0.05);
}

function osc(bus, t, freq, dur, { type = 'sine', vol = 0.2, attack = 0.005, drop = 0 } = {}) {
  const o = ctx.createOscillator(), g = ctx.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, t);
  if (drop) o.frequency.exponentialRampToValueAtTime(freq * (1 - drop), t + dur);
  env(g, t, attack, vol, dur);
  o.connect(g).connect(bus);
  o.start(t);
  o.stop(t + dur + 0.05);
}

// Clay ocarina: soft sine with breath noise and delayed vibrato.
function ocarina(bus, t, freq, dur, vol = 0.12) {
  const o = ctx.createOscillator(), g = ctx.createGain(), lfo = ctx.createOscillator(), depth = ctx.createGain();
  o.frequency.value = freq;
  lfo.frequency.value = 5.2;
  depth.gain.setValueAtTime(0, t);
  depth.gain.linearRampToValueAtTime(freq * 0.012, t + Math.min(dur, 0.35));
  lfo.connect(depth).connect(o.frequency);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(vol, t + 0.07);
  g.gain.setValueAtTime(vol, t + dur * 0.7);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(bus);
  o.start(t); lfo.start(t);
  o.stop(t + dur + 0.05); lfo.stop(t + dur + 0.05);
  noise(bus, t, Math.min(dur, 0.25), { vol: vol * 0.25, freq: freq * 2, q: 6, attack: 0.03 });
}

// Slit drum: a struck wooden tongue — a pitched body plus an inharmonic overtone and a click.
function slitDrum(bus, t, freq, vol = 0.3) {
  osc(bus, t, freq, 0.55, { vol, drop: 0.04 });
  osc(bus, t, freq * 2.76, 0.12, { vol: vol * 0.25 });
  noise(bus, t, 0.03, { vol: vol * 0.4, freq: 1800, q: 2 });
}

const rattle = (bus, t, vol = 0.06) => noise(bus, t, 0.07, { vol, type: 'highpass', freq: 5000, attack: 0.01 });

function rainStick(bus, t, dur, vol = 0.05) {
  const grains = Math.round(dur * 70);
  for (let i = 0; i < grains; i++) {
    const at = t + dur * (i / grains) + Math.random() * 0.012;
    noise(bus, at, 0.012, { vol: vol * (0.4 + Math.random()), freq: 2500 + Math.random() * 4500, q: 9, attack: 0.001 });
  }
}

// Conch trumpet: a buzzy, filtered horn that bends up into its note.
function conch(bus, t, freq, dur, vol = 0.12) {
  const o = ctx.createOscillator(), f = ctx.createBiquadFilter(), g = ctx.createGain();
  o.type = 'sawtooth';
  o.frequency.setValueAtTime(freq * 0.94, t);
  o.frequency.exponentialRampToValueAtTime(freq, t + 0.25);
  f.type = 'lowpass'; f.Q.value = 3;
  f.frequency.setValueAtTime(400, t);
  f.frequency.exponentialRampToValueAtTime(1100, t + 0.4);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(vol, t + 0.25);
  g.gain.setValueAtTime(vol, t + dur - 0.35);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(f).connect(g).connect(bus);
  o.start(t); o.stop(t + dur + 0.05);
}

function bird(bus, t) {
  const base = 2200 + Math.random() * 1800, n = 2 + (Math.random() * 3 | 0);
  for (let i = 0; i < n; i++) {
    const o = ctx.createOscillator(), g = ctx.createGain(), at = t + i * 0.13;
    o.frequency.setValueAtTime(base, at);
    o.frequency.exponentialRampToValueAtTime(base * (1.3 + Math.random() * 0.4), at + 0.07);
    env(g, at, 0.01, 0.025, 0.09);
    o.connect(g).connect(bus);
    o.start(at); o.stop(at + 0.12);
  }
}

// ---------------------------------------------------------------- sound effects

const now = () => ctx.currentTime;
const can = () => sfxOn && ctx;
const SCALE = [220, 261.63, 293.66, 329.63, 392, 440, 523.25, 587.33, 659.25, 783.99, 880]; // A minor pentatonic

export const sfx = {
  select: () => { if (can()) slitDrum(sfxBus, now(), 523.25, 0.12); },
  step: () => {
    if (!can()) return;
    const t = now();
    noise(sfxBus, t, 0.035, { vol: 0.35, freq: 2600, q: 5 });
    noise(sfxBus, t + 0.045, 0.025, { vol: 0.15, freq: 3200, q: 5 });
    osc(sfxBus, t, 160, 0.09, { vol: 0.25, drop: 0.3 });
  },
  whoosh: dur => { if (can()) rainStick(sfxBus, now(), dur); },
  capture: () => {
    if (!can()) return;
    const t = now();
    slitDrum(sfxBus, t, 146.83, 0.45);
    slitDrum(sfxBus, t + 0.12, 110, 0.4);
    for (let i = 0; i < 4; i++) rattle(sfxBus, t + 0.05 + i * 0.05, 0.08);
  },
  win: () => {
    if (!can()) return;
    const t = now();
    conch(sfxBus, t, 196, 1.3);
    [440, 523.25, 587.33, 659.25, 880].forEach((f, i) => ocarina(sfxBus, t + 0.9 + i * 0.16, f, i === 4 ? 0.9 : 0.2, 0.13));
    for (let i = 0; i < 8; i++) rattle(sfxBus, t + 0.9 + i * 0.1, 0.05);
  },
  lose: () => {
    if (!can()) return;
    const t = now();
    [440, 392, 329.63, 293.66].forEach((f, i) => ocarina(sfxBus, t + i * 0.28, f, i === 3 ? 0.9 : 0.3, 0.11));
    slitDrum(sfxBus, t + 1, 98, 0.4);
  },
  unlock: () => {
    if (!can()) return;
    const t = now();
    [659.25, 783.99, 880, 1046.5].forEach((f, i) => ocarina(sfxBus, t + i * 0.09, f, i === 3 ? 0.6 : 0.15, 0.1));
    for (let i = 0; i < 5; i++) rattle(sfxBus, t + i * 0.06, 0.05);
  },
  // A rival steps forward: two heavy drum strikes under a low conch.
  rival: () => {
    if (!can()) return;
    const t = now();
    slitDrum(sfxBus, t, 73.42, 0.6);
    slitDrum(sfxBus, t + 0.32, 55, 0.6);
    conch(sfxBus, t + 0.15, 98, 1.6, 0.1);
  },
  nope: () => { if (can()) noise(sfxBus, now(), 0.08, { vol: 0.2, freq: 500, q: 3 }); },
};

// ---------------------------------------------------------------- generative music

const BEAT = 60 / 100 / 2; // eighth notes at 100 bpm
// A 16-bar cycle: groove builds (0-3), full band (4-11), breakdown with a flute run (12-13),
// drum fill back to the top (14-15).
const ROOTS = [110, 110, 98, 98, 130.81, 130.81, 146.83, 123.47]; // slit-drum riff root per bar (pentatonic)
const BASS = [1, 0, 0, 1, 0, 0, 1, 0];                              // 3-3-2 on the deep drum
const CLAVE = new Set([0, 3, 6, 10, 12]);                           // over two bars of eighths
let nextAt = 0, step = 0, phrase = [];

// Deep skin drum: a low thump with a fast pitch drop.
const bassDrum = (bus, t, vol = 0.5) => { osc(bus, t, 92, 0.28, { vol, drop: 0.45 }); noise(bus, t, 0.02, { vol: vol * 0.3, freq: 300, q: 1 }); };
const woodblock = (bus, t, vol = 0.12) => { osc(bus, t, 1650, 0.05, { vol, type: 'triangle' }); noise(bus, t, 0.015, { vol: vol * 0.6, freq: 3200, q: 8 }); };

function startMusic() {
  if (!ctx || musicTimer) return;
  musicBus.gain.cancelScheduledValues(now());
  musicBus.gain.setTargetAtTime(0.5, now(), 1);
  nextAt = now() + 0.2; step = 0; phrase = [];
  musicTimer = setInterval(schedule, 100);
}

function stopMusic() {
  if (!ctx || !musicTimer) return;
  clearInterval(musicTimer); musicTimer = null;
  musicBus.gain.setTargetAtTime(0, now(), 0.4);
}

function schedule() {
  while (nextAt < now() + 0.4) {
    const beat = step % 8, bar = ((step / 8) | 0) % 16, t = nextAt;
    const full = bar >= 4 && bar < 12, breakdown = bar === 12 || bar === 13, fill = bar >= 14;
    const root = ROOTS[bar % 8];

    if (BASS[beat] && !breakdown) bassDrum(musicBus, t, beat === 0 ? 0.5 : 0.35);
    if (full && beat === 4 && Math.random() < 0.5) bassDrum(musicBus, t, 0.2);

    // slit-drum riff: root and fifth, busier in the full section
    if (!fill) {
      if (beat === 0 || beat === 3) slitDrum(musicBus, t, root, 0.2);
      if (beat === 6) slitDrum(musicBus, t, root * 1.5, 0.14);
      if (full && (beat === 2 || beat === 7)) slitDrum(musicBus, t, root * 2, 0.08);
    } else {
      // fill: a run of sixteenths down the scale
      const k = (bar - 14) * 8 + beat;
      if (bar === 15 || beat % 2 === 0) {
        slitDrum(musicBus, t, SCALE[Math.max(0, 8 - (k >> 1))] / 2, 0.16);
        if (bar === 15) slitDrum(musicBus, t + BEAT / 2, SCALE[Math.max(0, 7 - (k >> 1))] / 2, 0.12);
      }
    }

    if (bar >= 2 && !fill && CLAVE.has((bar % 2) * 8 + beat)) woodblock(musicBus, t);

    // shaker: eighths, doubled to sixteenths when the full band plays
    rattle(musicBus, t, beat % 2 ? 0.035 : 0.018);
    if (full) rattle(musicBus, t + BEAT / 2, 0.014);

    // melody with a second flute a third below on longer notes
    if ((full || breakdown) && !phrase.length && (beat === 0 || beat === 4)) phrase = makePhrase(breakdown);
    if (phrase.length && !fill) {
      const n = phrase.shift();
      if (n) {
        ocarina(musicBus, t, n[0], n[1] * BEAT, 0.075);
        if (full && n[1] >= 2 && Math.random() < 0.6) ocarina(musicBus, t, n[0] * 0.8409, n[1] * BEAT, 0.04);
      }
    } else if (fill) phrase = [];
    if (bar === 13 && beat === 4) for (let i = 0; i < 6; i++) ocarina(musicBus, t + i * BEAT / 2, SCALE[4 + i], BEAT * 0.6, 0.06);

    if (beat === 5 && Math.random() < 0.1) bird(musicBus, t);
    if (bar === 15 && beat === 0) rainStick(musicBus, t, 2.2, 0.025);
    nextAt += BEAT; step++;
  }
}

// A short wandering melody on the pentatonic scale, as a list of eighth-note slots.
function makePhrase(sparse) {
  const out = [];
  let i = 4 + (Math.random() * 4 | 0);
  const notes = sparse ? 3 : 5 + (Math.random() * 4 | 0);
  for (let k = 0; k < notes; k++) {
    i = Math.max(0, Math.min(SCALE.length - 1, i + [-2, -1, -1, 1, 1, 2, 0][Math.random() * 7 | 0]));
    const len = k === notes - 1 ? 4 : [1, 1, 2, 2, 3][Math.random() * 5 | 0];
    out.push([SCALE[i], len]);
    for (let r = 1; r < len; r++) out.push(0);
  }
  for (let r = 0; r < (sparse ? 6 : 2); r++) out.push(0);
  return out;
}
