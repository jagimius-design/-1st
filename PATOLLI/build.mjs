// Builds the shippable variants of the game.
// Usage: node build.mjs [store-url]
//   dist/web   free demo, as served on the web (GitHub Pages)
//   dist/full  paid game, same layout
//   dist/itch  itch.io uploads: court-of-fortune-browser-demo.zip (played on the page) and
//              court-of-fortune-full.zip (the paid download: one self-contained CourtOfFortune.html)
import { mkdirSync, rmSync, readdirSync, copyFileSync, readFileSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

const here = new URL('.', import.meta.url).pathname;
const SHIP = /\.(html|css|js|svg|png|webmanifest)$/;
const SKIP = new Set(['build.mjs']);
const storeUrl = process.argv[2] || ''; // overrides config.js STORE_URL when given

for (const [name, full] of [['web', false], ['full', true]]) {
  const out = `${here}dist/${name}/`;
  rmSync(out, { recursive: true, force: true });
  mkdirSync(out, { recursive: true });
  for (const f of readdirSync(here)) if (SHIP.test(f) && !SKIP.has(f)) copyFileSync(here + f, out + f);
  const cfg = readFileSync(out + 'config.js', 'utf8')
    .replace(/FULL_VERSION = \w+/, `FULL_VERSION = ${full}`)
    .replace(/STORE_URL = '[^']*'/, m => storeUrl ? `STORE_URL = '${storeUrl}'` : m);
  writeFileSync(out + 'config.js', cfg);
  // Inline the font so the game is a flat folder of files (store wrappers, artifact hosting).
  const font = readFileSync(here + 'fonts/cinzel-700.woff2').toString('base64');
  const css = readFileSync(out + 'style.css', 'utf8').replace('fonts/cinzel-700.woff2', `data:font/woff2;base64,${font}`);
  writeFileSync(out + 'style.css', css);
  console.log(`dist/${name}: ${full ? 'full game' : 'demo'}`);
}

// ---------------------------------------------------------------- itch.io

const itch = `${here}dist/itch/`;
rmSync(itch, { recursive: true, force: true });
mkdirSync(`${itch}demo`, { recursive: true });
mkdirSync(`${itch}full`, { recursive: true });

// Browser demo: the web build minus the offline cache (itch serves each upload from a fresh URL).
for (const f of readdirSync(`${here}dist/web`)) if (f !== 'sw.js') copyFileSync(`${here}dist/web/${f}`, `${itch}demo/${f}`);
execFileSync('zip', ['-qr', '../court-of-fortune-browser-demo.zip', '.'], { cwd: `${itch}demo` });

// Paid download: one HTML file with everything inlined. Opened from disk, browsers refuse ES
// modules, so the code is bundled into one classic script.
const { build } = await import('esbuild');
const bundle = async entry => (await build({ entryPoints: [`${here}dist/full/${entry}`], bundle: true, format: 'iife',
  minify: true, write: false, logLevel: 'error' })).outputFiles[0].text;
const safe = js => js.replace(/<\/script/gi, '<\\/script');
const app = await bundle('ui.js');
const icon = `data:image/svg+xml;base64,${readFileSync(`${here}icon.svg`).toString('base64')}`;
const html = readFileSync(`${here}dist/full/index.html`, 'utf8')
  .replace(/<link rel="manifest"[^>]*>\n?/, '')
  .replace(/<link rel="apple-touch-icon"[^>]*>\n?/, '')
  .replace('href="icon.svg"', `href="${icon}"`)
  .replace('<link rel="stylesheet" href="style.css">', () => `<style>${readFileSync(`${here}dist/full/style.css`, 'utf8')}</style>`)
  .replace('<script type="module" src="ui.js"></script>',
    () => `<script>${safe(app)}</script>`);
writeFileSync(`${itch}full/CourtOfFortune.html`, html);
writeFileSync(`${itch}full/README.txt`, `COURT OF FORTUNE
================

Thank you for buying Court of Fortune!

To play: double-click CourtOfFortune.html. It opens in your web browser and works offline.
No installation needed. Your progress is saved in that browser.

Tip: keep CourtOfFortune.html in the same place (for example a Games folder), because the
browser remembers your progress per file location.
`);
execFileSync('zip', ['-qr', '../court-of-fortune-full.zip', '.'], { cwd: `${itch}full` });
console.log('dist/itch: court-of-fortune-browser-demo.zip, court-of-fortune-full.zip');
