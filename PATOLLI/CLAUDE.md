# PATOLLI

Court of Fortune: a premium digital edition of Patolli, the ancient Mesoamerican race-and-gamble
game. Throw five marked beans, race stones round a cross-shaped track, capture by landing on
enemies, and bet jade beads; suns give another throw, skulls cost a bead. Same studio style and
plumbing as `../GAME` (Loopstone): plain HTML/CSS/JS ES modules, offline PWA, one codebase for the
free demo and the paid build (`config.js`), itch.io zips from `build.mjs`.

Rules live in `core.js` (pure; randomness passed in), the opponent and coach advice in `ai.js`,
everything on screen in `ui.js`. Content is data in `content.js`.

- `index.html` — all screens: menu (palace court scene), The Court, Quick Play, How to Play cards,
  Achievements, Settings, game.
- `style.css` — screen and component styles; shares Loopstone's carved, stepped-corner look.
- `ui.js` — screens, canvas board (woven mat cached per size/mat), hop animation, bean throw, flying
  jade beads, match flow, coach line, saved data (`localStorage`). `?test` exposes `window.__fortune`.
- `core.js` — the 36-square cross track, square kinds (temple, sun, skull), `VARIANTS`, throws,
  legal moves, applying throws and moves (returns events), winner.
- `ai.js` — `chooseMove` scores each legal move (progress, capture, sun, skull, danger from the
  enemy's next throw); `LEVELS`; `advise` explains the best move for the coach.
- `content.js` — rivals (portrait `look`, spoken `lines`, optional `variant`), rules cards,
  achievements, mats and bean sets (each achievement unlocks exactly one), demo limits.
- `achievements.js` — `earned(data, event)` and `reward(id)`.
- `portraits.js` — copy of Loopstone's rival portraits (SVG).
- `audio.js` — copy of Loopstone's synthesised sound and music, plus throw, hop, sun, skull, bead.
- `config.js` — `FULL_VERSION`, `STORE_URL`.
- `build.mjs` — `npm ci && node build.mjs [store-url]`: `dist/web`, `dist/full`, `dist/itch` (browser
  demo zip; paid zip with a single `CourtOfFortune.html` that runs from `file://`).
- `sw.js`, `manifest.webmanifest`, `icon.svg`, `icon-512.png` — offline cache and install metadata;
  bump `VERSION` in `sw.js` when shipped files change.
- `fonts/` — Cinzel 700 (SIL OFL).
- `tests/` — `npm test`; `tests/sim.js` plays computer-vs-computer games for balance checks.
