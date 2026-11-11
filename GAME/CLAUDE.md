# GAME

Loopstone: a premium digital edition of Surakarta, a traditional (public-domain) Javanese board
game where stones capture by riding loops round the board's corners. Plain HTML/CSS/JS ES modules,
no dependencies, no build step to run it; works offline as a PWA. One codebase for every store:
the free web demo and the paid build differ only in `config.js`. The demo is deployed to GitHub
Pages at `/game/` beside SITE (`.github/workflows/pages.yml`).

Rules live in `core.js`, the opponent in `ai.js` (run in a worker), everything on screen in `ui.js`.
Content (opponents, lessons, themes and what the demo includes) is data in `content.js`.

- `index.html` — all screens: menu, Journey, Quick Play, Settings, game.
- `style.css` — screen and component styles.
- `ui.js` — screens, canvas board drawing and animation, input, game flow, saved data (`localStorage`).
- `core.js` — rules: circuits, moves, captures with paths, outcome. Pure, runs in Node.
- `ai.js` — `chooseMove` (negamax, quiescence, iterative deepening) and the five `LEVELS`.
- `ai-worker.js` — runs `chooseMove` off the main thread.
- `content.js` — Journey opponents, tutorial lessons, board themes, demo limits.
- `audio.js` — synthesised sound effects.
- `config.js` — `FULL_VERSION` and `STORE_URL`, the only build-time switches.
- `build.mjs` — `node build.mjs [store-url]` writes `dist/web` (demo) and `dist/full` (paid).
- `sw.js`, `manifest.webmanifest`, `icon.svg`, `icon-512.png` — offline cache and install metadata;
  bump `VERSION` in `sw.js` when shipped files change.
- `store/` — store screenshots (phone 860×1864, desktop 1280×800).
- `SELLING.md` — platforms, price, listing copy, launch steps.
- `tests/` — `npm test` (`node --test`).
