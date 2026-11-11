// Sound effects synthesised with Web Audio: no audio files to ship or license.
let ctx = null, enabled = true;

export const setSound = on => { enabled = on; };

export function unlockAudio() {
  if (!ctx) try { ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch { return; }
  if (ctx.state === 'suspended') ctx.resume();
}

function tone(freq, dur, { type = 'sine', vol = 0.2, slide = 0, delay = 0 } = {}) {
  if (!enabled || !ctx) return;
  const t = ctx.currentTime + delay, o = ctx.createOscillator(), g = ctx.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, t);
  if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(30, freq + slide), t + dur);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(vol, t + 0.008);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(ctx.destination);
  o.start(t);
  o.stop(t + dur + 0.02);
}

function noise(dur, { vol = 0.15, freq = 1200, to = freq, q = 1, delay = 0 } = {}) {
  if (!enabled || !ctx) return;
  const t = ctx.currentTime + delay, len = Math.ceil(ctx.sampleRate * dur);
  const buf = ctx.createBuffer(1, len, ctx.sampleRate), d = buf.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
  const src = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain();
  src.buffer = buf;
  f.type = 'bandpass';
  f.Q.value = q;
  f.frequency.setValueAtTime(freq, t);
  f.frequency.exponentialRampToValueAtTime(to, t + dur);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(vol, t + Math.min(0.02, dur / 3));
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  src.connect(f).connect(g).connect(ctx.destination);
  src.start(t);
}

export const sfx = {
  select: () => tone(880, 0.06, { type: 'triangle', vol: 0.06 }),
  step: () => { tone(190, 0.1, { vol: 0.25, slide: -70 }); noise(0.04, { vol: 0.12, freq: 2200 }); },
  whoosh: dur => noise(dur, { vol: 0.1, freq: 300, to: 2600, q: 1.5 }),
  capture: () => {
    tone(120, 0.3, { vol: 0.35, slide: -60 });
    noise(0.15, { vol: 0.25, freq: 800, to: 300 });
    tone(990, 0.18, { type: 'triangle', vol: 0.08, delay: 0.03 });
  },
  win: () => [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.35, { type: 'triangle', vol: 0.14, delay: i * 0.11 })),
  lose: () => [392, 330, 262].forEach((f, i) => tone(f, 0.4, { type: 'sine', vol: 0.14, delay: i * 0.16 })),
  nope: () => tone(150, 0.12, { type: 'square', vol: 0.04 }),
};
