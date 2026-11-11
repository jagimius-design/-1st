// Writes dist/web (free demo) and dist/full (paid build) from the game files.
// Usage: node build.mjs [store-url]
import { mkdirSync, rmSync, readdirSync, copyFileSync, readFileSync, writeFileSync } from 'node:fs';

const here = new URL('.', import.meta.url).pathname;
const SHIP = /\.(html|css|js|svg|png|webmanifest)$/;
const SKIP = new Set(['build.mjs']);
const storeUrl = process.argv[2] || '';

for (const [name, full] of [['web', false], ['full', true]]) {
  const out = `${here}dist/${name}/`;
  rmSync(out, { recursive: true, force: true });
  mkdirSync(out, { recursive: true });
  for (const f of readdirSync(here)) if (SHIP.test(f) && !SKIP.has(f)) copyFileSync(here + f, out + f);
  const cfg = readFileSync(out + 'config.js', 'utf8')
    .replace(/FULL_VERSION = \w+/, `FULL_VERSION = ${full}`)
    .replace(/STORE_URL = '[^']*'/, `STORE_URL = '${storeUrl}'`);
  writeFileSync(out + 'config.js', cfg);
  // Inline the font so the game is a flat folder of files (store wrappers, artifact hosting).
  const font = readFileSync(here + 'fonts/cinzel-700.woff2').toString('base64');
  const css = readFileSync(out + 'style.css', 'utf8').replace('fonts/cinzel-700.woff2', `data:font/woff2;base64,${font}`);
  writeFileSync(out + 'style.css', css);
  console.log(`dist/${name}: ${full ? 'full game' : 'demo'}`);
}
